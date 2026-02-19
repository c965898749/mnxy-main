/* eslint-disable complexity */
/* eslint-disable no-restricted-properties */
import { native, path } from "cc";
import { DEBUG } from "cc/env";
import { ggZip } from "../native/zip/GGZip";
import { GGZipExtractZipStatus, GGZipExtractZipTask, GGZipExtractZipTaskEvent } from "../native/zip/GGZipTypes";
import { ggLogger } from "../utils/GGLogger";
import { GGObserverSystem } from "../utils/GGObserverSystem";
import { GGHotUpdateInstanceEnum, GGHotUpdateInstanceOption, GGHotUpdateInstanceState, GGHotUpdateType, ProjectManifest, ProjectManifestAssetUpdateState, VersionManifest } from "./GGHotUpdateType";

/**
 * 热更新实例观察者方法
 *
 * @author caizhitao
 * @created 2024-08-30 10:40:53
 */
export interface GGHotUpdateInstanceObserver {
    /**
     * 热更新实例状态更新回调
     *
     * @param instance 热更新实例
     */
    onGGHotUpdateInstanceCallBack?(instance: GGHotUpdateInstance): void;
}

/**
 * 热更新实例
 *
 * @author caizhitao
 * @created 2024-08-30 10:40:53
 */
export class GGHotUpdateInstance extends GGObserverSystem<GGHotUpdateInstanceObserver> {
    /**
     * 热更新的包名字
     */
    name: GGHotUpdateInstanceEnum | string;
    /**
     * 热更新实例配置
     */
    private _option: GGHotUpdateInstanceOption;
    /**
     * 热更新文件的远程根地址
     *
     * e.g.
     *
     * ``http://192.168.0.1:8080/1.0.0``
     */
    private _remoteRootUrl: string;
    /**
     * 热更包的本地搜索根目录
     *
     * e.g.
     *
     * * Android: ``/data/user/0/com.cocos.game/files/gg-hot-update``
     */
    private _searchRootDirPath: string;
    /**
     * 热更包的本地下载根目录
     *
     * * 主包：如果热更新成功，那么会在下次游戏启动时，将下载目录的内容移动到搜索目录
     * * 子包：如果热更新成功，那么会在此时， 将下载目录的内容移动到搜索目录
     *
     * e.g.
     *
     * * Android: ``/data/user/0/${packageName}/files/gg-hot-update-temp/${bundleName}``
     */
    private _downloadRootDirPath: string;

    /**
     * 热更包的 zip 远程地址
     *
     * e.g.
     *
     * ``http://192.168.0.1:8080/1.0.0/${bundleName}.zip``
     */
    private _zipRemoteUrl: string;
    /**
     * 热更包的 zip 的本地下载路径
     *
     * e.g.
     *
     * * Android: ``/data/user/0/${packageName}/files/gg-hot-update-temp/${bundleName}.zip``
     */
    private _zipDownloadPath: string;
    /**
     * version.manifest 的远程地址
     *
     * e.g.
     *
     * ``http://192.168.0.1:8080/1.0.0/${bundleName}.version.manifest``
     */
    private _versionManifestRemoteUrl: string;
    /**
     * version.manifeset 的本地下载路径
     *
     * e.g.
     *
     * * Android: ``/data/user/0/${packageName}/files/gg-hot-update-temp/${bundleName}/${bundleName}.version.manifest``
     */
    private _versionManifestDownloadPath: string;
    /**
     * project.manifest 的远程地址
     *
     * e.g.
     *
     * ``http://192.168.0.1:8080/1.0.0/${bundleName}.project.manifest``
     */
    private _projectManifestRemoteUrl: string;
    /**
     * project.manifeset 的搜索路径顺序
     *
     * e.g.
     *
     * * Android:
     *      * ``/data/user/0/${packageName}/files/gg-hot-update/${bundleName}.project.manifest``
     *      * ``@assets/${bundleName}.project.manifest``
     *      * ``data/${bundleName}/project.manifest"``
     */
    private _projectManifestSearchPaths: string[];
    /**
     * project.manifeset 的本地下载路径
     *
     * e.g.
     *
     * * Android: ``/data/user/0/${packageName}/files/gg-hot-update-temp/${bundleName}/${bundleName}.project.manifest.gg``
     */
    private _projectManifestDownloadPath: string;
    /**
     * 本地 project.manifest 配置（搜索目录下）
     */
    private _localProjectManifest: ProjectManifest | null;
    /**
     * 远端 project.manifeset 配置
     */
    private _remoteProjectManifest: ProjectManifest | null;
    /**
     * 远端 version.manifeset 配置
     */
    private _remoteVersionManifest: VersionManifest | null;
    /**
     * 实例是否已经销毁
     */
    private _destroyed: boolean = false;
    /**
     * 当前热更新实例状态
     */
    get state(): GGHotUpdateInstanceState {
        return this._state;
    }
    private _state: GGHotUpdateInstanceState = GGHotUpdateInstanceState.Idle;
    /**
     * 热更新方式
     */
    private _hotUpdateType: GGHotUpdateType | null | undefined;

    // //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 下载信息
    /**
     * 下载任务管理器
     */
    private _downloader: native.Downloader;
    /**
     * 下载任务队列
     */
    private _downloadTasks: native.DownloadTask[];
    /**
     * 当前并行下载任务数量
     */
    private _curConcurrentTaskCount: number;
    /**
     * 待下载的总字节
     */
    get totalBytes(): number {
        return this._totalBytes;
    }
    private _totalBytes: number = 0;
    /**
     * 已下载的字节
     */
    get downloadedBytes(): number {
        return this._downloadedBytes;
    }
    private _downloadedBytes: number = 0;
    /**
     * 待下载的文件列表
     */
    get totalFiles(): number {
        return this._totalFiles;
    }
    private _totalFiles: number = 0;
    /**
     * 下载成功的文件列表
     */
    readonly downloadSucFiles: native.DownloadTask[] = [];
    /**
     * 下载失败的文件列表
     */
    readonly downloadFailedFiles: native.DownloadTask[] = [];
    /**
     * 热更新下载速度 Bytes/s
     */
    get downloadSpeedInSecond() {
        return this._downloadSpeed;
    }
    private _downloadSpeed: number = 0;
    /**
     * 下载剩余时间(s)
     *
     * * >=0: 已知剩余秒数
     * * <0: 未知剩余时间
     */
    get downloadRemainTimeInSecond() {
        return this._downloadRemainTimeInSecond;
    }
    private _downloadRemainTimeInSecond: number = -1;
    /**
     * 上次计算下载速度时的累计下载字节数(Bytes)
     */
    private _lastDownloadedBytes: number = 0;
    /**
     * 上次计算下载速度时的时间戳(ms)
     */
    private _lastSpeedUpdateTimeInMs: number = 0;
    /**
     * 上次回调下载进度的时间戳(ms)
     */
    private _lastCallBackUpdateTimeInMs: number = 0;

    // //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 解压信息
    /**
     * 热更包的 zip 解压缩任务id
     */
    private _zipTaskId: string | null = null;
    /**
     * Zip 总解压字节数，注意值可能为0的情况
     */
    get zipExtractTotalBytes(): number {
        return this._zipExtractTotalBytes;
    }
    private _zipExtractTotalBytes: number = 0;
    /**
     * Zip 已解压字节数，注意值可能为0的情况
     */
    get zipExtractedBytes(): number {
        return this._zipExtractedBytes;
    }
    private _zipExtractedBytes: number = 0;

    /**
     * @param name 热更新的包名字
     * @param remoteRootUrl 热更包的远程根地址 e.g. ``http://192.168.0.1:8080/1.0.0``
     * @param searchRootDirPath 热更包的本地搜索根目录 e.g. ``/data/user/0/${pacakgeName}/files/gg-hot-update``
     * @param option 热更新实例配置
     */
    constructor(name: GGHotUpdateInstanceEnum | string, remoteRootUrl: string, searchRootDirPath: string, option: GGHotUpdateInstanceOption) {
        super();
        this.name = name;
        this._option = option;
        this._remoteRootUrl = remoteRootUrl;
        this._searchRootDirPath = searchRootDirPath;
        this._downloadRootDirPath = path.join(this._searchRootDirPath + "-temp", this.name);
        this._zipRemoteUrl = `${this._remoteRootUrl}/${this.name}.zip`;
        this._zipDownloadPath = path.join(this._searchRootDirPath + "-temp", `${this.name}.zip`);
        this._versionManifestRemoteUrl = `${this._remoteRootUrl}/${this.name}.version.manifest`;
        this._versionManifestDownloadPath = path.join(this._downloadRootDirPath, `${this.name}.version.manifest`);
        this._projectManifestRemoteUrl = `${this._remoteRootUrl}/${this.name}.project.manifest`;
        this._projectManifestDownloadPath = path.join(this._downloadRootDirPath, `${this.name}.project.manifest.gg`);
        this._projectManifestSearchPaths = [
            path.join(this._searchRootDirPath, `${this.name}.project.manifest`),
            `@assets/${this.name}.project.manifest`,
            path.join("data", `${this.name}.project.manifest`),
        ];
        this._localProjectManifest = null;
        this._remoteProjectManifest = null;
        this._remoteVersionManifest = null;
        this._destroyed = false;
        this._state = GGHotUpdateInstanceState.Idle;
        this._hotUpdateType = null;

        this._downloader = new native.Downloader();
        this._downloader.onProgress = this._onDownloadProgress.bind(this);
        this._downloader.onError = this._onDownloadError.bind(this);
        this._downloader.onSuccess = this._onDownloadSuccess.bind(this);
        this._downloadTasks = [];
        this._curConcurrentTaskCount = 0;
        this._resetDownloadInfo();

        this._zipTaskId = null;
        this._resetExtractInfo();
        if (ggZip.isAvailable) {
            ggZip.on(GGZipExtractZipTaskEvent.onExtractUpdated, this._onExtractUpdated, this);
        }
    }

    /**
     * 递归创建所有父目录
     *
     * @param filePath 目标文件路径
     */
    private _createParentDirs(filePath: string): void {
        // 获取目标路径的目录部分
        const dirPath = path.dirname(filePath);
        if (!native.fileUtils.isDirectoryExist(dirPath)) {
            // 如果父目录不存在，递归创建所有父目录
            this._createParentDirs(dirPath);
            // 创建当前目录
            native.fileUtils.createDirectory(dirPath);
        }
    }

    /**
     * 重置下载信息
     */
    private _resetDownloadInfo() {
        // 移除还没有开始的下载任务
        if (this._downloadTasks.length > 0) {
            this._downloadTasks.length = 0;
        }

        // 重置并行下载任务数
        this._curConcurrentTaskCount = 0;

        // 重置下载信息
        this._totalBytes = 0;
        this._downloadedBytes = 0;
        this._totalFiles = 0;
        this.downloadSucFiles.length = 0;
        this.downloadFailedFiles.length = 0;
        this._downloadSpeed = 0;
        this._downloadRemainTimeInSecond = -1;
    }

    /**
     * 重置解压进度信息
     */
    private _resetExtractInfo() {
        this._zipExtractTotalBytes = 0;
        this._zipExtractedBytes = 0;
    }

    /**
     * 如果存在 Zip 解压任务，则自动取消解压后，再释放资源
     */
    private _releaseZipTask() {
        if (ggZip.isAvailable) {
            if (this._zipTaskId) {
                ggZip.release(this._zipTaskId);
                this._zipTaskId = null;
            }
        }
    }

    /**
     * 更新状态
     */
    private _updateState(state: GGHotUpdateInstanceState) {
        this._state = state;
        this.observers.forEach((observer) => {
            observer.onGGHotUpdateInstanceCallBack?.(this);
        });
    }

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 下载监听

    private _onDownloadProgress(task: native.DownloadTask, bytesReceived: number, totalBytesReceived: number, totalBytesExpected: number): void {
        // 实例已经销毁，结束
        if (this._destroyed) {
            return;
        }

        // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 处理检查更新的 version.manifest 的下载进度

        if (task.requestURL == this._versionManifestRemoteUrl) {
            return;
        }

        // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 处理检查更新的 project.manifest 的下载进度

        if (task.requestURL == this._projectManifestRemoteUrl) {
            return;
        }

        // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 处理热更新的差异文件的下载进度

        // 更新下载进度
        this._downloadedBytes += bytesReceived;

        let curTime = Date.now();

        // 计算下载速度（间隔一段时间在计算，避免短时间内多次计算，值波动范围过大，导致数据失真，失去参考意义）
        if (curTime - this._lastSpeedUpdateTimeInMs >= this._option.downloadSpeedCalculationIntervalInMs) {
            if (this._lastSpeedUpdateTimeInMs == 0) {
                // 首次下载进度回调，是没有上次下载进度记录的，所以此时下载速度和剩余时间重置
                this._downloadSpeed = 0;
                this._downloadRemainTimeInSecond = -1;
            } else {
                // 二次或后续下载进度回调时，存在上次下载进度记录，所以可以比较计算此时下载速度和剩余时间
                this._downloadSpeed = (this._downloadedBytes - this._lastDownloadedBytes) / ((curTime - this._lastSpeedUpdateTimeInMs) / 1000);
                this._downloadRemainTimeInSecond = Math.round((this._totalBytes - this._downloadedBytes) / this._downloadSpeed);
            }
            this._lastDownloadedBytes = this._downloadedBytes;
            this._lastSpeedUpdateTimeInMs = curTime;
        }

        // 外部下载进度回调（间隔一段时间之后在回调）
        if (curTime - this._lastCallBackUpdateTimeInMs >= this._option.downloadProgressCallBackIntervalInMs) {
            this._lastCallBackUpdateTimeInMs = curTime;

            if (DEBUG) {
                let info = "热更新：下载中";
                info += ` 总字节数：${this._totalBytes}`;
                info += ` 已下载字节数: ${this._downloadedBytes}`;
                info += ` 总下载文件数：${this._totalFiles}`;
                info += ` 下载成功文件数：${this.downloadSucFiles.length}`;
                info += ` 下载失败文件数：${this.downloadFailedFiles.length}`;
                info += ` 当前并行下载任务数：${this._curConcurrentTaskCount}`;
                info += ` 当前下载速度：${(this._downloadSpeed / 1024 / 1024).toFixed(2)} MB/s`;
                info += ` 当前剩余时间：${this._downloadRemainTimeInSecond}s`;
                this._debug(info);
            }

            this._updateState(GGHotUpdateInstanceState.HotUpdateDownloading);
        }
    }

    private _onDownloadError(task: native.DownloadTask, errorCode: number, errorCodeInternal: number, errorStr: string): void {
        // 实例已经销毁，结束
        if (this._destroyed) {
            return;
        }

        // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 处理检查更新的 version.manifest 的下载失败

        if (task.requestURL == this._versionManifestRemoteUrl) {
            if (DEBUG) {
                this._error(`检查更新：下载远程 version.manifest 失败。错误代码：${errorCode} 内部错误代码：${errorCodeInternal} 错误信息：${errorStr}`);
                this._error(`检查更新：失败`);
            }
            this._updateState(GGHotUpdateInstanceState.CheckUpdateFailedParseRemoteVersionManifestError);
            return;
        }

        // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 处理检查更新的 project.manifest 的下载失败

        if (task.requestURL == this._projectManifestRemoteUrl) {
            if (DEBUG) {
                this._error(`检查更新：下载远程 project.manifest 失败。错误代码：${errorCode} 内部错误代码：${errorCodeInternal} 错误信息：${errorStr}`);
                this._error(`检查更新：失败`);
            }

            this._updateState(GGHotUpdateInstanceState.CheckUpdateFailedDownloadRemoteProjectManifestError);
            return;
        }

        // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 处理热更新的差异文件的下载失败

        // 收集下载失败任务
        this.downloadFailedFiles.push(task);

        // 更新下载进度
        if (DEBUG) {
            this._debug(
                `热更新：文件下载失败：${task.requestURL} 下载失败。错误代码：${errorCode} 内部错误代码：${errorCodeInternal} 错误信息：${errorStr} 当前累计下载失败文件数量：${this.downloadFailedFiles.length}`
            );
        }
        this._updateState(GGHotUpdateInstanceState.HotUpdateDownloading);

        // 处理结果
        this._handleHotUpdateSingleDownloadTaskDone();
    }

    private _onDownloadSuccess(task: native.DownloadTask): void {
        // 实例已经销毁，结束
        if (this._destroyed) {
            return;
        }

        // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 处理检查更新的 version.manifest 的下载成功

        if (task.requestURL == this._versionManifestRemoteUrl) {
            DEBUG && this._debug(`检查更新：下载远程 version.manifest 成功`);

            // 解析下载好的远程 version.manifest
            this._remoteVersionManifest = null;
            try {
                if (native.fileUtils.isFileExist(this._versionManifestDownloadPath)) {
                    this._remoteVersionManifest = JSON.parse(native.fileUtils.getStringFromFile(this._versionManifestDownloadPath));

                    // 如果下载好的远程 version.manifest 已经解析完毕了，那这个文件就没用了，删除它
                    native.fileUtils.removeFile(this._versionManifestDownloadPath);
                }
            } catch (error) {
                if (DEBUG) {
                    this._error(error);
                }
            }
            if (this._remoteVersionManifest == null) {
                if (DEBUG) {
                    this._error(`检查更新：解析远程 version.manifest 失败`);
                    this._error(`检查更新：失败`);
                }
                this._updateState(GGHotUpdateInstanceState.CheckUpdateFailedParseRemoteVersionManifestError);
                return;
            }

            // 从搜索目录下的 project.manifest 中获取版本
            const localVersion = this._localProjectManifest?.version ?? "";
            const remoteVersion = this._remoteVersionManifest?.version ?? "";
            if (DEBUG) {
                this._debug(`检查更新：解析远程 version.manifest 成功。版本信息: ${JSON.stringify(this._remoteVersionManifest)}`);
                this._debug(`检查更新：当前本地版本: ${localVersion}`);
                this._debug(`检查更新：当前远端版本: ${remoteVersion}`);
            }

            // 本地版本和远程版本比较
            const isNewVersionFound = remoteVersion != localVersion;

            // 未发现新版本
            if (!isNewVersionFound) {
                DEBUG && this._debug(`检查更新：成功，当前已经是最新版本`);
                // 释放文件json内存
                this._localProjectManifest = null;
                this._updateState(GGHotUpdateInstanceState.CheckUpdateSucAlreadyUpToDate);
                return;
            }

            // 发现新版本
            switch (this._hotUpdateType) {
                case GGHotUpdateType.Full: {
                    // TODO 完善逻辑

                    // 计算下载信息
                    this._reCalculateDownloadInfo();

                    DEBUG && this._debug(`检查更新：成功，发现新版本`);

                    // 返回新版本
                    this._updateState(GGHotUpdateInstanceState.CheckUpdateSucNewVersionFound);

                    return;
                }
                case GGHotUpdateType.Incremental: {
                    try {
                        if (native.fileUtils.isFileExist(this._projectManifestDownloadPath)) {
                            this._reCalculateDownloadInfo();
                            // 如果还有文件未下载，那么返回新版本
                            if (this._totalFiles != this.downloadSucFiles.length) {
                                this._updateState(GGHotUpdateInstanceState.CheckUpdateSucNewVersionFound);
                                return;
                            }
                        }
                    } catch (error) {
                        if (DEBUG) {
                            this._error(error);
                            this._error(`检查更新：解析本地已存在的远程 project.manifest 失败。地址： ${this._projectManifestDownloadPath}`);
                        }
                    }

                    // 到这里表示本地没有 project.manifest 文件，或者解析出错，总之不对劲了，此时删除这个文件，重新走一躺下载处理
                    if (native.fileUtils.isFileExist(this._projectManifestDownloadPath)) {
                        native.fileUtils.removeFile(this._projectManifestDownloadPath);
                    }

                    DEBUG && this._debug(`检查更新：下载远程 project.manifest 开始，下载地址：${this._projectManifestRemoteUrl} 本地存储地址：${this._projectManifestDownloadPath}`);
                    this._createParentDirs(this._projectManifestDownloadPath);
                    this._downloader.createDownloadTask(this._projectManifestRemoteUrl, this._projectManifestDownloadPath);
                    return;
                }
                default:
                    throw new Error(`不支持的热更新方式: ${this._hotUpdateType}`);
            }
        }

        // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 处理检查更新的 project.manifest 的下载成功

        if (task.requestURL == this._projectManifestRemoteUrl) {
            DEBUG && this._debug(`检查更新：下载远程 project.manifest 成功`);

            // 解析已经下载下来的 project.manifest
            try {
                if (native.fileUtils.isFileExist(task.storagePath)) {
                    this._remoteProjectManifest = JSON.parse(native.fileUtils.getStringFromFile(task.storagePath));
                }
            } catch (error) {
                DEBUG && this._error(error);
            }
            if (this._remoteProjectManifest == null) {
                DEBUG && this._error(`检查更新：解析远程 project.manifest 失败。下载地址： ${task.requestURL} 本地存储地址：${task.storagePath}`);
                DEBUG && this._error(`检查更新：失败`);
                this._updateState(GGHotUpdateInstanceState.CheckUpdateFailedParseRemoteProjectManifestError);
                return;
            }

            // 对比本地最新 project.manifest 和远程 project.manifest，将需要下载的文件标记一下，并保存到本地（以方便后面断点续传）
            let hasDiff = false;
            Object.keys(this._remoteProjectManifest.assets).forEach((assetPath) => {
                const remoteAssetInfo = this._remoteProjectManifest!.assets[assetPath];
                const localAssetInfo = this._localProjectManifest!.assets[assetPath] ?? null;
                const assetNeed2Update = localAssetInfo == null || remoteAssetInfo.size != localAssetInfo.size || remoteAssetInfo.md5 != localAssetInfo.md5;
                if (assetNeed2Update) {
                    // 标记此文件需要下载
                    remoteAssetInfo.state = ProjectManifestAssetUpdateState.Idle;
                    hasDiff = true;
                }
            });

            if (hasDiff) {
                // 如果比较后，存在差异文件需要下载，那么
                DEBUG && this._debug(`检查更新：成功，发现新版本`);

                // 1. 将有待下载文件的信息写回到本地，方便后面恢复下载
                native.fileUtils.writeStringToFile(JSON.stringify(this._remoteProjectManifest), task.storagePath);

                // 2. 重新计算下载信息
                this._reCalculateDownloadInfo();

                // 3. 返回新版本
                this._updateState(GGHotUpdateInstanceState.CheckUpdateSucNewVersionFound);
            } else {
                // 如果比较后，没有差异文件需要下载，那么返回已经更新到最新
                DEBUG && this._debug(`检查更新：成功，发现不同远端版本，但和当前本地版本没有文件差异，因此当前已经是最新版本`);

                // 释放文件json内存
                this._localProjectManifest = null;
                this._updateState(GGHotUpdateInstanceState.CheckUpdateSucAlreadyUpToDate);
            }
            return;
        }

        // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 处理热更新的差异文件的下载成功

        // 收集下载成功任务
        this.downloadSucFiles.push(task);

        // 更新下载进度
        this._updateState(GGHotUpdateInstanceState.HotUpdateDownloading);

        // 如果热更新方式是增量更新，那么需要标记下载成功的文件，并持久化到本地，方便下次断点续传（如果有），跳过已经下载成功的文件
        if (this._hotUpdateType == GGHotUpdateType.Incremental) {
            const assetInfo = this._remoteProjectManifest?.assets?.[task.identifier] ?? null;
            if (assetInfo) {
                assetInfo.state = ProjectManifestAssetUpdateState.Suc;
                native.fileUtils.writeStringToFile(JSON.stringify(this._remoteProjectManifest), this._projectManifestDownloadPath);
            } else {
                this._warn(`id: ${task.identifier}, url: ${task.requestURL}, path:${task.storagePath}, 任务下载成功，但视乎没法找到其原始瞄点，跳过记录下载成功到本地文件的处理`);
            }
        }

        // 处理结果
        this._handleHotUpdateSingleDownloadTaskDone();
    }

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 解压任务状态监听

    private _onExtractUpdated(task: GGZipExtractZipTask): void {
        // 实例已经销毁，结束
        if (this._destroyed) {
            return;
        }
        // 不是自己的任务，结束
        if (task.id != this._zipTaskId) {
            return;
        }

        // 处理解压任务状态
        switch (task.status) {
            case GGZipExtractZipStatus.Idle:
            case GGZipExtractZipStatus.Start:
            case GGZipExtractZipStatus.Extracting: {
                this._zipExtractTotalBytes = task.total_bytes ?? 0;
                this._zipExtractedBytes = task.extracted_Bytes ?? 0;
                DEBUG && this._debug(`热更新：解压中 Zip总解压字节数: ${this._zipExtractTotalBytes} Zip已解压字节数: ${this._zipExtractedBytes}`);
                this._updateState(GGHotUpdateInstanceState.HotUpdateExtracting);
                break;
            }
            case GGZipExtractZipStatus.Suc: {
                this._zipExtractTotalBytes = task.total_bytes ?? 0;
                this._zipExtractedBytes = task.extracted_Bytes ?? 0;
                DEBUG && this._debug(`热更新：解压成功 Zip总解压字节数: ${this._zipExtractTotalBytes} Zip已解压字节数: ${this._zipExtractedBytes}`);
                this._releaseZipTask();
                this._updateSearchPath();
                DEBUG && this._debug(`热更新：成功`);
                this._updateState(GGHotUpdateInstanceState.HotUpdateSuc);
                break;
            }
            case GGZipExtractZipStatus.Cancelled: {
                DEBUG && this._debug(`热更新：解压取消`);
                this._releaseZipTask();
                this._updateState(GGHotUpdateInstanceState.HotUpdateFailed);
                break;
            }
            case GGZipExtractZipStatus.Error: {
                DEBUG && this._debug(`热更新：解压失败 错误信息: ${task.err_msg}`);
                this._releaseZipTask();
                this._updateState(GGHotUpdateInstanceState.HotUpdateFailed);
                break;
            }
        }
    }

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 销毁实例
     *
     * 1. 实例销毁之后，没法再次使用
     * 2. 实例销毁的一般应用场合为，主包已经完成了热更新，在重启游戏之前，进行销毁
     */
    destroy() {
        // 标记实例已经被销毁
        this._destroyed = true;

        // 移除所有外部观察者
        this.unregisterAll();

        // 重置属性
        this._localProjectManifest = null;
        this._remoteProjectManifest = null;
        this._remoteVersionManifest = null;

        // 重置状态信息
        this._state = GGHotUpdateInstanceState.Idle;
        this._hotUpdateType = null;

        // 放弃进行中的下载任务
        if (this._downloadTasks.length > 0) {
            this._downloadTasks.forEach((task) => {
                this._downloader.abort(task);
            });
        }

        // 重置下载信息
        this._resetDownloadInfo();

        if (ggZip.isAvailable) {
            // 重置解压进度信息
            this._resetExtractInfo();
            // 移除解压缩状态监听
            ggZip.offTarget(this);
            // 取消可能正在解压缩的任务并释放资源
            this._releaseZipTask();
        }
    }

    /**
     * 清除下载缓存
     *
     * 1. 清除下载缓存后，后续的检查更新、热更新都会重新下载所有文件
     * 2. 在多次检查更新失败或者多次热更新失败后，可以考虑调用此方法，清除所有下载缓存文件
     */
    clearDownloadCache() {
        DEBUG && this._debug(`清除热更包(${this.name})的本地缓存: 开始`);

        // 部分状态下不可以删除下载缓存
        if ([GGHotUpdateInstanceState.CheckUpdateInProgress, GGHotUpdateInstanceState.HotUpdateDownloading, GGHotUpdateInstanceState.HotUpdateExtracting].includes(this._state)) {
            DEBUG && this._debug(`清除热更包(${this.name})的本地缓存: 失败. 当前状态不可以进行此操作: ${this._state}`);
            return;
        }

        // 收集需要清除的缓存文件/目录
        const cacheFiles: { path: string; isFile: boolean }[] = [
            { path: this._downloadRootDirPath, isFile: false },
            { path: this._zipDownloadPath, isFile: true },
            { path: this._zipDownloadPath + ".tmp", isFile: true },
        ];

        // 清除所有缓存
        cacheFiles.forEach((cacheFile) => {
            if (cacheFile.isFile) {
                if (native.fileUtils.isFileExist(cacheFile.path)) {
                    const suc = native.fileUtils.removeFile(cacheFile.path);
                    DEBUG && this._debug(`本地缓存文件(${cacheFile.path})：存在，${suc ? "删除成功" : "删除失败"}`);
                } else {
                    DEBUG && this._debug(`本地缓存文件(${cacheFile.path})：不存在，不用删除`);
                }
            } else {
                if (native.fileUtils.isDirectoryExist(cacheFile.path)) {
                    const suc = native.fileUtils.removeDirectory(cacheFile.path);
                    DEBUG && this._debug(`本地缓存目录(${cacheFile.path})：存在，${suc ? "删除成功" : "删除失败"}`);
                } else {
                    DEBUG && this._debug(`本地缓存目录(${cacheFile.path})：不存在，不用删除`);
                }
            }
        });

        DEBUG && this._debug(`清除热更包(${this.name})的本地缓存: 结束`);
    }
    /**
     * 检查更新
     *
     * @param hotUpdateType 热更新方式
     *
     * | 决策条件 | 决策结果 |
     * | :--- | ---: |
     * | 原生平台支持zip解压 + 未传入参数 + 本地有历史版本 | 增量更新 |
     * | 原生平台支持zip解压 + 未传入参数 + 本地无历史版本 | 全量更新 |
     * | 原生平台支持zip解压 + 传入参数 | 使用传入的热更新方式 |
     * | 原生平台不支持zip解压 | 增量更新 |
     */
    checkUpdate(hotUpdateType?: GGHotUpdateType) {
        if (this._state == GGHotUpdateInstanceState.CheckUpdateInProgress) {
            DEBUG && this._warn("检查更新：当前已经在检查新版本中。请不要重复调用 `checkUpdate`.");
            return;
        }
        if (this._state == GGHotUpdateInstanceState.HotUpdateDownloading) {
            DEBUG && this._warn("检查更新：当前已经在热更新中。请不要在此时调用 `checkUpdate`.");
            return;
        }
        if (this._state == GGHotUpdateInstanceState.HotUpdateExtracting) {
            DEBUG && this._warn("检查更新：当前正在解压 zip 中。请不要在此时调用 `checkUpdate`.");
            return;
        }

        // 更新状态
        DEBUG && this._debug(`检查更新：开始`);
        this._resetDownloadInfo();
        this._updateState(GGHotUpdateInstanceState.CheckUpdateInProgress);

        // 按照搜索路径顺序，读取「此包」「本地最新版本」的 project.manifest 文件内容到内存中
        if (DEBUG) {
            this._debug(`检查更新：解析本地 project.manifest 开始`);
            this._debug(`检查更新：本地 project.manifest 文件搜索路径如下：${JSON.stringify(this._projectManifestSearchPaths)}`);
        }
        this._localProjectManifest = null;
        for (const localProjectManifestPath of this._projectManifestSearchPaths) {
            DEBUG && this._debug(`检查更新：尝试从路径 ${localProjectManifestPath} 获取 project.manifest 信息：开始`);
            if (!native.fileUtils.isFileExist(localProjectManifestPath)) {
                DEBUG && this._debug(`检查更新：尝试从路径 ${localProjectManifestPath} 获取 project.manifest 信息：失败，文件不存在`);
                continue;
            }
            const localProjectManifestText = native.fileUtils.getStringFromFile(localProjectManifestPath);
            if (localProjectManifestText) {
                try {
                    this._localProjectManifest = JSON.parse(localProjectManifestText);
                    DEBUG && this._debug(`检查更新：尝试从路径 ${localProjectManifestPath} 获取 project.manifest 信息：成功`);
                } catch (error) {
                    if (DEBUG) {
                        this._error(`检查更新：尝试从路径 ${localProjectManifestPath} 获取 project.manifest 信息：失败，文件内容解析失败`);
                        this._error(error);
                        this._error(`检查更新：失败，解析本地 project.manifest 失败`);
                    }
                    this._updateState(GGHotUpdateInstanceState.CheckUpdateFailedParseLocalProjectManifestError);
                    return;
                }
            }
            if (this._localProjectManifest) {
                break;
            }
        }
        // 如果没有读取本地到 project.manifest 配置，那么可能是包的首次更新，此时生成一个默认空白配置，那么就会全量将包下载下来
        if (!this._localProjectManifest) {
            DEBUG && this._debug(`检查更新：没法解析到本地 project.manifest 配置，将初始化一个空的 project.manifeset 配置`);
            this._localProjectManifest = { version: "", assets: {} };
        }
        DEBUG && this._debug(`检查更新：解析本地 project.manifest 成功`);

        // 检查更新前，先删除本地可能存在的 version.manifest
        if (native.fileUtils.isFileExist(this._versionManifestDownloadPath)) {
            native.fileUtils.removeFile(this._versionManifestDownloadPath);
        }

        // 决定热更新方式
        if (!ggZip.isAvailable) {
            this._hotUpdateType = GGHotUpdateType.Incremental;
        } else {
            if (hotUpdateType) {
                this._hotUpdateType = hotUpdateType;
            } else {
                this._hotUpdateType = this._localProjectManifest.version == "" ? GGHotUpdateType.Full : GGHotUpdateType.Incremental;
            }
        }
        DEBUG && this._debug(`检查更新：本次更新方式： ${this._hotUpdateType}`);

        // 通过 fetch 请求远程 version.manifest 的内容，在部分引擎版本下可能存在异常（fetch 这个 api 在原生平台上的实现上存在差异）
        // 因此，改用 downloader 去下载 version.manifest 并解析，完全替代 fetch
        DEBUG && this._debug(`检查更新：下载远程 version.manifest 开始。地址: ${this._versionManifestRemoteUrl}`);
        this._createParentDirs(this._versionManifestDownloadPath);
        this._downloader.createDownloadTask(this._versionManifestRemoteUrl, this._versionManifestDownloadPath);
    }

    /**
     * 重新计算热更新需要下载的信息
     */
    private _reCalculateDownloadInfo() {
        // 重置所有下载信息
        this._resetDownloadInfo();

        switch (this._hotUpdateType) {
            case GGHotUpdateType.Full: {
                // 恢复下载任务
                const downloadTask: native.DownloadTask = {
                    identifier: this._zipDownloadPath,
                    requestURL: this._zipRemoteUrl,
                    storagePath: this._zipDownloadPath,
                };

                // zip 文件只会下载一个
                this._totalFiles = 1;

                if (native.fileUtils.isFileExist(this._zipDownloadPath)) {
                    // 如果 zip 已经下载完毕
                    this._totalBytes = native.fileUtils.getFileSize(this._zipDownloadPath);
                    this._downloadedBytes = this._totalBytes;

                    // 下载成功的任务加入到成功列表
                    this.downloadSucFiles.push(downloadTask);
                } else {
                    // 如果 zip 还没有下载完毕

                    // 从远端 version.manifest 中获取 zip 文件的总大小
                    this._totalBytes = this._remoteVersionManifest?.zip_file_bytes ?? 0;

                    // 重置 zip 累计下载字节数为0
                    this._downloadedBytes = 0;

                    // 如果 zip 之前已经有下载过，但未完成，此时获取缓存文件的大小，作为更新累计下载字节数
                    const downloadTempFilePath = this._zipDownloadPath + ".tmp";
                    if (native.fileUtils.isFileExist(downloadTempFilePath)) {
                        let downloadFileSize = native.fileUtils.getFileSize(downloadTempFilePath);
                        if (downloadFileSize > 0) {
                            this._downloadedBytes += downloadFileSize;
                        }
                    }

                    // 未下载或下载失败的任务加入到失败列表
                    this.downloadFailedFiles.push(downloadTask);
                }
                break;
            }
            case GGHotUpdateType.Incremental: {
                // 读取本地已经下载好的远程 project.manifest
                try {
                    if (native.fileUtils.isFileExist(this._projectManifestDownloadPath)) {
                        this._remoteProjectManifest = JSON.parse(native.fileUtils.getStringFromFile(this._projectManifestDownloadPath));
                    }
                } catch (error) {
                    if (DEBUG) {
                        this._error(error);
                    }
                }
                if (!this._remoteProjectManifest) {
                    if (DEBUG) {
                        this._error(`解析本地已存在的远程 project.manifest 失败。地址： ${this._projectManifestDownloadPath}`);
                    }
                    break;
                }

                // 计算下载信息
                Object.keys(this._remoteProjectManifest.assets).forEach((assetPath) => {
                    const remoteAssetInfo = this._remoteProjectManifest!.assets[assetPath];
                    const localAssetInfo = this._localProjectManifest!.assets[assetPath] ?? null;
                    const need2Update = localAssetInfo == null || remoteAssetInfo.size != localAssetInfo.size || remoteAssetInfo.md5 != localAssetInfo.md5;
                    if (need2Update && remoteAssetInfo.state != null) {
                        // 更新需要下载的文件信息
                        this._totalFiles++;
                        this._totalBytes += remoteAssetInfo.size;

                        // 恢复下载任务
                        const downloadTask: native.DownloadTask = {
                            identifier: assetPath,
                            requestURL: `${this._remoteRootUrl}/${assetPath}`,
                            storagePath: path.join(this._downloadRootDirPath, assetPath),
                        };
                        if (remoteAssetInfo.state == ProjectManifestAssetUpdateState.Suc) {
                            // 更新累计下载字节数
                            this._downloadedBytes += remoteAssetInfo.size;
                            // 下载成功的任务加入到成功列表
                            this.downloadSucFiles.push(downloadTask);
                        } else {
                            // 更新累计下载字节数
                            // 如果之前已经有相当一部分文件未下载完成，那么这里的读取可能会比较耗时
                            const downloadTempFilePath = downloadTask.storagePath + ".tmp";
                            if (native.fileUtils.isFileExist(downloadTempFilePath)) {
                                let downloadFileSize = native.fileUtils.getFileSize(downloadTempFilePath);
                                if (downloadFileSize > 0) {
                                    this._downloadedBytes += downloadFileSize;
                                }
                            }
                            // 未下载或下载失败的任务加入到失败列表
                            this.downloadFailedFiles.push(downloadTask);
                        }
                    }
                });
                break;
            }
            default: {
                throw new Error(`不支持的热更新方式: ${this._hotUpdateType}`);
            }
        }

        if (DEBUG) {
            let info = `待下载信息：`;
            info += `总字节数：${this._totalBytes} `;
            info += `已下载字节数：${this._downloadedBytes} `;
            info += `总下载文件数：${this._totalFiles} `;
            info += `下载成功文件数：${this.downloadSucFiles.length} `;
            info += `未下载或下载失败文件数：${this.downloadFailedFiles.length}`;
            this._debug(info);
        }
    }

    /**
     * 开始热更新
     */
    hotUpdate() {
        if (this._state == GGHotUpdateInstanceState.CheckUpdateInProgress) {
            DEBUG && this._warn("热更新：当前正在检查新版本中。请在发现新版本之后再调用 `hotUpdate`.");
            return;
        }
        if (this._state == GGHotUpdateInstanceState.HotUpdateDownloading) {
            DEBUG && this._warn("热更新：当前已经在热更新中。请不要重复调用 `hotUpdate`.");
            return;
        }
        if (this._state == GGHotUpdateInstanceState.HotUpdateExtracting) {
            DEBUG && this._warn("热更新：当前正在解压zip中。请不要重复调用 `hotUpdate`.");
            return;
        }

        DEBUG && this._debug(`热更新：开始`);
        this._updateState(GGHotUpdateInstanceState.HotUpdateDownloading);

        // 开始下载之前，重新计算下载信息
        this._reCalculateDownloadInfo();

        // 如果之前已经下载过，但存在下载未完成或者下载失败的文件，那么我们将失败的任务再次加入下载任务队列
        if (this.downloadFailedFiles.length > 0) {
            DEBUG && this._debug(`热更新：发现 ${this.downloadFailedFiles.length} 个未下载或下载失败任务，将重新加入队列进行下载`);
            this._downloadTasks.push(...this.downloadFailedFiles);
            this.downloadFailedFiles.length = 0;
        }

        // 如果已经没有后续下载任务并且进行中的任务都已经结束了，那么检查热更新下载结果
        if (this._downloadTasks.length == 0 && this._curConcurrentTaskCount == 0) {
            this._handleHotUpdateAllDownloadTasksDone();
            return;
        }

        DEBUG && this._debug(`热更新：当前共计 ${this._downloadTasks.length} 个下载任务`);

        // 启动下载
        this._lastDownloadedBytes = 0;
        this._lastSpeedUpdateTimeInMs = 0;
        this._lastCallBackUpdateTimeInMs = Date.now();
        this._nextDownload();
    }

    /**
     * 启动下一个下载任务
     */
    private _nextDownload() {
        while (this._downloadTasks.length > 0 && this._curConcurrentTaskCount < this._option.downloadMaxConcurrentTask) {
            this._curConcurrentTaskCount++;
            const task = this._downloadTasks.shift()!;
            this._createParentDirs(task.storagePath);
            this._downloader.createDownloadTask(task.requestURL, task.storagePath, task.identifier);
        }
    }

    /**
     * 处理热更新过程中，每个下载任务执行结束（不管下载成功还是失败）后的逻辑
     */
    private _handleHotUpdateSingleDownloadTaskDone() {
        //  不管下载成功还是失败，并行任务数 -1;
        this._curConcurrentTaskCount--;

        // 如果还有后续其他下载任务，那么开启下个下载
        if (this._downloadTasks.length > 0) {
            this._nextDownload();
            return;
        }

        // 如果已经没有后续下载任务并且进行中的任务都已经结束了，那么检查热更新下载结果
        if (this._downloadTasks.length == 0 && this._curConcurrentTaskCount == 0) {
            this._handleHotUpdateAllDownloadTasksDone();
        }
    }

    /**
     * 处理热更新过程中，所有下载任务都执行结束（不管下载成功还是失败）后的逻辑
     */
    private _handleHotUpdateAllDownloadTasksDone() {
        this._downloadSpeed = 0;
        this._downloadRemainTimeInSecond = -1;
        const suc = this._totalFiles == this.downloadSucFiles.length;
        if (DEBUG) {
            let info = suc ? "热更新：下载成功" : "热更新：下载失败";
            info += ` 总字节数：${this._totalBytes}`;
            info += ` 已下载字节数: ${this._downloadedBytes}`;
            info += ` 总下载文件数：${this._totalFiles}`;
            info += ` 下载成功文件数：${this.downloadSucFiles.length}`;
            info += ` 下载失败文件数：${this.downloadFailedFiles.length}`;
            info += ` 当前并行下载任务数：${this._curConcurrentTaskCount}`;
            info += ` 当前下载速度：${(this._downloadSpeed / 1024 / 1024).toFixed(2)} MB/s`;
            info += ` 当前剩余时间：${this._downloadRemainTimeInSecond}s`;
            suc ? this._debug(info) : this._error(info);
        }

        // 热更新下载失败，则回调失败状态
        if (!suc) {
            this._updateState(GGHotUpdateInstanceState.HotUpdateFailed);
            return;
        }

        // 热更新下载成功，则需要根据类型进行处理
        // * 如果是全量更新，那么需要对 zip 包进行解压
        // * 如果是增量更新，那么直接更新搜索路径即可
        switch (this._hotUpdateType) {
            case GGHotUpdateType.Full: {
                // 更新状态
                this._resetExtractInfo();
                DEBUG && this._debug(`热更新：解压中 Zip总解压字节数: ${this._zipExtractTotalBytes} Zip已解压字节数: ${this._zipExtractedBytes}`);
                this._updateState(GGHotUpdateInstanceState.HotUpdateExtracting);

                // 如果当前存在解压任务，那么释放它
                this._releaseZipTask();

                // 创建一个新的解压缩任务
                this._zipTaskId = ggZip.createExtractTask({
                    zip_file_abs_path: this._zipDownloadPath,
                    zip_dest_dir_abs_path: this._downloadRootDirPath,
                    zip_uncompressed_bytes: this._remoteVersionManifest?.zip_uncompressed_bytes ?? 0,
                    remove_zip_dest_dir_before_extract: true,
                    delete_zip_after_extract: true,
                });
                break;
            }
            case GGHotUpdateType.Incremental: {
                this._updateSearchPath();
                DEBUG && this._debug(`热更新：成功`);
                this._updateState(GGHotUpdateInstanceState.HotUpdateSuc);
                break;
            }
            default: {
                throw new Error(`不支持的热更新方式: ${this._hotUpdateType}`);
            }
        }
    }

    /**
     * 更新搜索地址
     *
     * * 主包：更新搜索路径之后，还需要重启游戏才可以生效
     * * 子包：更新搜索路径之后，不用重启游戏就生效（但是要注意此前还没有加载过子包）
     */
    private _updateSearchPath() {
        // e.g. ["@assets/data/","@assets/Resources/","@assets/"]
        const searchPaths: string[] = native.fileUtils.getSearchPaths();

        // 待插入的搜索路径（注意结尾要加 /)
        const newSearchPath = this._searchRootDirPath + "/";

        if (DEBUG) {
            this._debug(`当前搜索路径顺序：${JSON.stringify(searchPaths)}`);
            this._debug(`待插入的搜索路径：${newSearchPath}`);
        }

        // 插入新的搜索路径到当前搜索路径的最前面（如果当前搜索路径数组已经包含新的待插入搜索路径，那么只需要将其提到数组最前面即可）
        let isNewPathExist = false;
        for (let j = searchPaths.length - 1; j >= 0; --j) {
            if (searchPaths[j] == newSearchPath) {
                searchPaths.unshift(searchPaths.splice(j, 1)[0]);
                isNewPathExist = true;
                break;
            }
        }
        // 如果当前搜索路径数组不包含新的待插入搜索路径，那么将新的路径插入哦到最前面
        if (!isNewPathExist) {
            searchPaths.unshift(newSearchPath);
        }
        if (DEBUG) {
            this._debug(`最终搜索路径顺序：${JSON.stringify(searchPaths)}`);
        }

        // 重命名下载目录的 project.manifest.gg 为 project.manifest，以标记更新完毕，同时方便后续移动到搜索目录时，读取 project.manifest
        // e.g.
        // /data/user/0/package/files/gg-hot-update-temp/${bundleName}/${bundleName}.project.manifest.gg ->
        // /data/user/0/package/files/gg-hot-update-temp/${bundleName}/${bundleName}.project.manifest
        const srcFilePath = this._projectManifestDownloadPath;
        const dstFilePath = srcFilePath.substring(0, srcFilePath.lastIndexOf(".gg"));
        if (native.fileUtils.isFileExist(dstFilePath)) {
            native.fileUtils.removeFile(dstFilePath);
        }
        this._createParentDirs(dstFilePath);
        const renameSuc = native.fileUtils.renameFile(srcFilePath, dstFilePath);
        if (DEBUG) {
            this._debug(`重命名下载目录的 project.manifest.gg 为 project.manifest：${renameSuc ? "成功" : "失败"}。 ${srcFilePath} -> ${dstFilePath}`);
        }

        const downloadDirPath = this._downloadRootDirPath + "/";
        if (this.name == GGHotUpdateInstanceEnum.BuildIn) {
            // 如果是主包，不用更新搜索路径，在下次重启时，main.js 会自动更新搜索路径
        } else {
            // 如果是子包
            if (DEBUG) {
                this._debug(`将移动下载目录 ${this._downloadRootDirPath} 的资源到搜索目录 ${this._searchRootDirPath}`);
            }

            // 更新搜索路径
            native.fileUtils.setSearchPaths(searchPaths);

            // 移动下载目录的内容到搜索路径下
            const downloadDirPathLength = downloadDirPath.length;
            if (native.fileUtils.isDirectoryExist(downloadDirPath)) {
                const fileList: string[] = [];
                native.fileUtils.listFilesRecursively(downloadDirPath, fileList);
                fileList.forEach((srcPath) => {
                    let relativePath = srcPath.substring(downloadDirPathLength);
                    let dstPath = newSearchPath + relativePath;
                    if (dstPath[dstPath.length - 1] == "/") {
                        native.fileUtils.createDirectory(dstPath);
                    } else {
                        this._createParentDirs(dstPath);
                        if (native.fileUtils.isFileExist(dstPath)) {
                            native.fileUtils.removeFile(dstPath);
                        }
                        native.fileUtils.renameFile(srcPath, dstPath);
                    }
                });
            }
            if (native.fileUtils.isDirectoryExist(downloadDirPath)) {
                native.fileUtils.removeDirectory(downloadDirPath);
            }
        }

        // 缓存新的搜索路径数组，以便下次重启的时候，更新新的搜索路径
        localStorage.setItem("GGHotUpdateSearchPaths", JSON.stringify(searchPaths));
        DEBUG && this._debug(`保存最新搜索路径到 LocalStorage 中，方便下次重启游戏时更新搜索路径`);
    }

    private _debug(...args: any[]) {
        ggLogger.debug(this.name, ...args);
    }

    private _warn(...args: any[]) {
        ggLogger.warn(this.name, ...args);
    }

    private _error(...args: any[]) {
        ggLogger.error(this.name, ...args);
    }
}
