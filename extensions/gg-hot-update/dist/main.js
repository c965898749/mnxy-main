"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
const config_1 = require("./config");
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {};
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
function load() {
    console.log(`${config_1.PACKAGE_NAME} ${config_1.PACKAGE_VERSION}: load`);
}
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
function unload() {
    console.log(`${config_1.PACKAGE_NAME} ${config_1.PACKAGE_VERSION}: unload`);
}
exports.unload = unload;
