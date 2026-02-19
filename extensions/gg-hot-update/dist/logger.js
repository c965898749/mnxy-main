"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const config_1 = require("./config");
class DefaultLogger {
    log(...args) {
        console.log(this._formatArgs(...args));
    }
    debug(...args) {
        console.debug(this._formatArgs(...args));
    }
    info(...args) {
        console.info(this._formatArgs(...args));
    }
    error(...args) {
        console.error(this._formatArgs(...args));
    }
    warn(...args) {
        console.warn(this._formatArgs(...args));
    }
    time(label) {
        console.time(label);
    }
    timeEnd(label) {
        console.timeEnd(label);
    }
    _formatArgs(...args) {
        let result = `${config_1.PACKAGE_NAME} ${config_1.PACKAGE_VERSION}:`;
        try {
            for (const arg of args) {
                result += " ";
                if (arg == null) {
                    result += "null";
                }
                else if (arg == undefined) {
                    result += "undefined";
                }
                else if (Array.isArray(arg) || typeof arg == "object") {
                    result += JSON.stringify(arg);
                }
                else {
                    result += arg;
                }
            }
        }
        catch (err) {
            console.error("打印日志异常，可以忽略，也可以排查");
            console.error(err);
        }
        return result;
    }
}
exports.logger = new DefaultLogger();
