"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuilderHookerHotUpdateBuildConfigCheck = void 0;
const config_1 = require("../config");
/**
 * 生成 Manifest 的任务
 */
class BuilderHookerHotUpdateBuildConfigCheck {
    onBeforeBuild(options, result) {
        // 插件不支持开启 md5 缓存
        if (options.md5Cache) {
            throw new Error(Editor.I18n.t(`${config_1.PACKAGE_NAME}.build_err_do_not_enable_md5_cache`));
        }
    }
}
exports.BuilderHookerHotUpdateBuildConfigCheck = BuilderHookerHotUpdateBuildConfigCheck;
