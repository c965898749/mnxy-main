/* eslint-disable no-restricted-properties */
import { error } from "cc";
import { DEBUG, JSB } from "cc/env";
import { GGHotUpdateName, GGHotUpdateVersion } from "../hotupdate/GGHotUpdateType";

/**
 * 默认日志
 *
 * @author caizhitao
 * @created 2024-08-09 18:19:14
 */
class GGLogger {
    enable: boolean = false;

    log(...args: any[]) {
        this.enable && console.log(...this._formatArgs(...args));
    }

    debug(...args: any[]): void {
        this.enable && console.debug(...this._formatArgs(...args));
    }

    info(...args: any[]): void {
        this.enable && console.info(...this._formatArgs(...args));
    }

    error(...args: any[]) {
        this.enable && console.error(...this._formatArgs(...args));
    }

    warn(...args: any[]) {
        this.enable && console.warn(...this._formatArgs(...args));
    }

    time(label: string) {
        this.enable && console.time(label);
    }

    timeEnd(label: string) {
        this.enable && console.timeEnd(label);
    }

    /**
     * 原生平台上不能直接打印object和array，因此这里将object和array转换为字符串进行输出，方便在 对应平台的开发工具中（如: Android Studio Logcat） 中直接看 log 结果
     */
    private _formatArgs(...args: any[]) {
        if (JSB) {
            try {
                for (let i = 0; i < args.length; i++) {
                    const arg = args[i];
                    if (Array.isArray(arg) || typeof arg == "object") {
                        args[i] = JSON.stringify(arg);
                    }
                }
            } catch (err) {
                DEBUG && error("打印日志异常，可以忽略，也可以排查");
            }
        }
        args.unshift(GGHotUpdateVersion);
        args.unshift(GGHotUpdateName);
        return args;
    }
}

export const ggLogger = new GGLogger();
