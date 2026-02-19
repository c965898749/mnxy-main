export const GGHotUpdateName = "gg-hot-update";
export const GGHotUpdateVersion = "6.0.0";

export interface GGHotUpdateManagerConfig {
    /**
     * 热更新文件的远程地址根目录 e.g. http://192.168.0.1:8080/1.0.0
     */
    packageUrl: string;
    /**
     * 是否打印调试日志，默认关闭，（建议测试环境开启，生产环境关闭）
     */
    enableLog?: boolean;
    /**
     * 热更新文件的本地存储根目录，不指定时，采用默认路径
     *
     * e.g.
     *
     * * Android: /data/user/0/${packageName}/files/gg-hot-update
     */
    storageDirPath?: string;
}

/**
 * 热更新实例类型
 */
export enum GGHotUpdateInstanceEnum {
    /**
     * 内置主包
     */
    BuildIn = "build-in",
}

/**
 * 热更新实例配置
 */
export interface GGHotUpdateInstanceOption {
    /**
     * 热更新下载过程中，同时最大下载任务数。默认值：24
     */
    downloadMaxConcurrentTask: number;
    /**
     * 热更新下载过程中，文件下载进度回调的最小间隔时长(ms)。默认值：16ms
     */
    downloadProgressCallBackIntervalInMs: number;
    /**
     * 热更新下载过程中，文件下载速度计算时间间隔(ms)。默认值：1000ms
     *
     * 如果此值过小，可能会导致短时间内进行多次计算，值波动范围过大，导致数据失真，失去参考意义
     */
    downloadSpeedCalculationIntervalInMs: number;
}

/**
 * 热更新方式
 */
export enum GGHotUpdateType {
    /**
     * 全量更新（下载远端热更包zip到本地解压）
     */
    Full = "Full",
    /**
     * 增量更新（本地版本和远端版本对比，仅下载差异文件）
     */
    Incremental = "Incremental",
}

/**
 * 热更新实例状态
 */
export enum GGHotUpdateInstanceState {
    /**
     * 静置
     */
    Idle = "Idle",
    /**
     * 检查更新中
     */
    CheckUpdateInProgress = "CheckUpdateInProgress",
    /**
     * 检查更新失败：解析本地 project.manifest 失败
     */
    CheckUpdateFailedParseLocalProjectManifestError = "CheckUpdateFailedParseLocalProjectManifestError",
    /**
     * 检查更新失败：解析远程 version.manifest 失败
     */
    CheckUpdateFailedParseRemoteVersionManifestError = "CheckUpdateFailedParseRemoteVersionManifestError",
    /**
     * 检查更新失败：下载远程 project.manifest 失败
     */
    CheckUpdateFailedDownloadRemoteProjectManifestError = "CheckUpdateFailedDownloadRemoteProjectManifestError",
    /**
     * 检查更新失败：解析远程 project.manifest 失败
     */
    CheckUpdateFailedParseRemoteProjectManifestError = "CheckUpdateFailedParseRemoteProjectManifestError",
    /**
     * 检查更新成功：发现新版本
     */
    CheckUpdateSucNewVersionFound = "CheckUpdateSucNewVersionFound",
    /**
     * 检查更新成功：当前已经是最新版本
     */
    CheckUpdateSucAlreadyUpToDate = "CheckUpdateSucAlreadyUpToDate",
    /**
     * 热更新：文件下载中
     */
    HotUpdateDownloading = "HotUpdateDownloading",
    /**
     * 热更新：文件解压中
     */
    HotUpdateExtracting = "HotUpdateExtracting",
    /**
     * 热更新：成功
     */
    HotUpdateSuc = "HotUpdateSuc",
    /**
     * 热更新：失败
     */
    HotUpdateFailed = "HotUpdateFailed",
}

export interface VersionManifest {
    /**
     * 版本
     */
    version: string;
    /**
     * 热更包zip文件的字节数（由插件构建时，自动计算并写入）
     */
    zip_file_bytes?: number;
    /**
     * 热更包zip文件解压后的文件总字节数（由插件构建时，自动计算并写入）
     */
    zip_uncompressed_bytes?: number;
}
export interface ProjectManifest {
    /**
     * 版本
     */
    version: string;
    /**
     * 资源列表
     */
    assets: {
        /**
         * 文件相对路径
         */
        [key: string]: ProjectManifestAssetInfo;
    };
}

export interface ProjectManifestAssetInfo {
    /**
     * 字节大小
     */
    size: number;
    /**
     * 文件md5
     */
    md5: string;
    /**
     * 更新状态
     */
    state: ProjectManifestAssetUpdateState;
}

export enum ProjectManifestAssetUpdateState {
    /**
     * 未更新成功
     */
    Idle = 0,
    /**
     * 更新成功
     */
    Suc = 1,
}
