/* eslint-disable no-restricted-properties */
import { game, native, path } from "cc";
import { DEBUG } from "cc/env";
import { GGHotUpdateInstance } from "./GGHotUpdateInstance";
import { GGHotUpdateInstanceEnum, GGHotUpdateInstanceOption, GGHotUpdateManagerConfig } from "./GGHotUpdateType";
import { ggLogger } from "../utils/GGLogger";

/**
 * 热更新实例管理器
 *
 * @author caizhitao
 * @created 2024-08-30 10:40:53
 */
class GGHotUpdateManager {
    /**
     * 热更新实例
     */
    private _instanceMap: Map<string, GGHotUpdateInstance> | null = null;

    /**
     * 是否打印调试日志
     */
    get enableLog(): boolean {
        return this._enableLog;
    }
    private _enableLog: boolean = false;

    /**
     * 热更新文件的远程地址根目录
     *
     * e.g. http://192.168.0.1:8080/1.0.0
     */
    get remoteRootUrl(): string {
        return this._remoteRootUrl;
    }
    private _remoteRootUrl: string = "";

    /**
     * 热更新文件的本地存储根目录
     *
     * e.g. Android: ``/data/user/0/com.cocos.game/files/gg-hot-update``
     */
    get localRootDirPath(): string {
        return this._localRootDirPath;
    }
    private _localRootDirPath: string = "";

    /**
     * 销毁并释放所有热更新实例
     */
    private _destroyAllInstances() {
        DEBUG && ggLogger.debug(`销毁所有热更新实例`);
        if (this._instanceMap != null) {
            this._instanceMap.forEach((instance) => {
                instance.destroy();
            });
            this._instanceMap.clear();
            this._instanceMap = null;
        }
    }

    /**
     * 初始化热更新管理器配置
     *
     * @param config 配置
     */
    init(config: GGHotUpdateManagerConfig): void {
        this._enableLog = config.enableLog ?? false;
        this._remoteRootUrl = config.packageUrl;
        this._localRootDirPath = config.storageDirPath ?? path.join(native.fileUtils.getWritablePath(), "gg-hot-update");

        // 初始化日志输出
        ggLogger.enable = this._enableLog;

        DEBUG && ggLogger.debug(`初始化完毕`);
    }

    /**
     * 获取热更新实例
     *
     * @param bundleName 内置的热更新实例类型 或 子包Bundle名字
     * @param option 热更新实例配置
     */
    getInstance(bundleName: GGHotUpdateInstanceEnum | string, option?: GGHotUpdateInstanceOption): GGHotUpdateInstance {
        if (!this._instanceMap) {
            this._instanceMap = new Map();
        }
        let instance = this._instanceMap.get(bundleName);
        if (!instance) {
            instance = new GGHotUpdateInstance(
                bundleName,
                this._remoteRootUrl,
                this._localRootDirPath,
                option
                    ? option
                    : {
                          downloadMaxConcurrentTask: 24,
                          downloadProgressCallBackIntervalInMs: 16,
                          downloadSpeedCalculationIntervalInMs: 1000,
                      }
            );
            this._instanceMap.set(bundleName, instance);
        }
        return instance;
    }

    /**
     * 重启游戏
     */
    restartGame() {
        // 销毁所有热更新实例
        this._destroyAllInstances();

        // 重启游戏
        DEBUG && ggLogger.debug(`即将重启游戏`);
        game.restart();
    }

    /**
     * 清空所有热更包的数据，包括：
     *
     * * 更新搜索路径：移除所有热更包的搜索路径
     * * 删除插件用到的 LocalStorage 的值
     * * 删除所有热更包的本地下载目录
     * * 删除所有热更包的搜索路径目录
     *
     * 此API一般发生不兼容的升级后调用，然后重启游戏。比如
     *
     * * 在引擎升级后（比如从 3.8.4 升级到 3.8.5)，出现了不兼容的API，此时可能需要调用这个方法移除所有热更新信息，然后重启游戏
     * * 在客户端移除了一些原生方法，导致 ts 不能调用对应的方法，出现了不兼容的API，此时可能需要调用这个方法移除所有热更新信息，然后重启游戏
     * * ...
     *
     * @since 4.0.0
     */
    clear() {
        DEBUG && ggLogger.debug(`清空所有热更包的数据：开始`);

        // 销毁所有热更新实例
        this._destroyAllInstances();

        // 更新搜索路径：移除所有热更包的搜索路径
        // e.g. ["/data/user/0/com.cocos.game/files/gg-hot-update", "@assets/data/","@assets/Resources/","@assets/"] -> ["@assets/data/","@assets/Resources/","@assets/"]
        const searchPaths: string[] = native.fileUtils.getSearchPaths();
        const searchRootDirPath = this._localRootDirPath + "/";
        if (DEBUG) {
            ggLogger.debug(`移除前的搜索路径：${JSON.stringify(searchPaths)}`);
            ggLogger.debug(`待移除的搜索路径：${searchRootDirPath}`);
        }
        for (let i = searchPaths.length - 1; i >= 0; --i) {
            if (searchPaths[i] == searchRootDirPath) {
                searchPaths.splice(i, 1);
            }
        }
        DEBUG && ggLogger.debug(`移除后的搜索路径：${JSON.stringify(searchPaths)}`);

        // 删除插件用到的 LocalStorage 的值
        localStorage.removeItem("GGHotUpdateSearchPaths");

        // 删除所有热更包的本地下载目录
        const doanloadRootDirPath = path.join(this._localRootDirPath + "-temp");
        if (native.fileUtils.isDirectoryExist(doanloadRootDirPath)) {
            const suc = native.fileUtils.removeDirectory(doanloadRootDirPath);
            DEBUG && ggLogger.debug(`删除所有热更包的本地下载目录(${doanloadRootDirPath})：存在，${suc ? "已删除成功" : "删除失败"}`);
        } else {
            DEBUG && ggLogger.debug(`删除所有热更包的本地下载目录(${doanloadRootDirPath})：不存在，不用删除`);
        }

        // 删除所有热更包的搜索路径目录
        if (native.fileUtils.isDirectoryExist(searchRootDirPath)) {
            const suc = native.fileUtils.removeDirectory(searchRootDirPath);
            DEBUG && ggLogger.debug(`删除所有热更包的搜索路径目录(${searchRootDirPath})：存在，${suc ? "已删除成功" : "删除失败"}`);
        } else {
            DEBUG && ggLogger.debug(`删除所有热更包的搜索路径目录(${searchRootDirPath})：不存在，不用删除`);
        }

        DEBUG && ggLogger.debug(`清空所有热更包的数据：结束`);
    }
}

/**
 * 热更新实例管理器
 */
export const ggHotUpdateManager = new GGHotUpdateManager();
