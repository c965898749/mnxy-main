"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuilderHookerHotUpdateMainJsCodeInjection = void 0;
const path_1 = __importDefault(require("path"));
const mainjs_code_injection_1 = require("../core/hotupdate/mainjs-code-injection");
const builder_1 = require("./builder");
/**
 * 注入代码到 main.js
 */
class BuilderHookerHotUpdateMainJsCodeInjection {
    onAfterBuild(options, result) {
        const pluginConfig = (0, builder_1.getBuilderPluginConfig)(options);
        if (!pluginConfig.enable) {
            return;
        }
        // 获取构建资源目录 e.g. /Users/zhitao/game/build/android/data
        const assetsRootDir = path_1.default.join(result.dest, "data");
        mainjs_code_injection_1.mainJsCodeInjection.injectCodeToMainJs(assetsRootDir);
    }
}
exports.BuilderHookerHotUpdateMainJsCodeInjection = BuilderHookerHotUpdateMainJsCodeInjection;
