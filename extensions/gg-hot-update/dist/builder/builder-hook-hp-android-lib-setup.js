"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuilderHookerHotUpdateAndroidLibSetup = void 0;
const path_1 = __importDefault(require("path"));
const android_lib_dependency_1 = require("../core/hotupdate/android-lib-dependency");
const builder_1 = require("./builder");
/**
 * 在构建后的 Android 工程中，自动集成插件的依赖库（提供文件读写和zip等相关原生能力）
 */
class BuilderHookerHotUpdateAndroidLibSetup {
    onAfterBuild(options, result) {
        const pluginConfig = (0, builder_1.getBuilderPluginConfig)(options);
        if (!pluginConfig.enable) {
            return;
        }
        // 只有 Android 平台，才需要添加依赖
        if (!pluginConfig.enableAutoSetupAndroidDeps) {
            return;
        }
        // if (!options.platform.includes("android") && !options.platform.includes("google")) {
        //     return;
        // }
        // 获取构建后的 Android 工程 settings.gradle 路径 e.g. /Users/zhitao/game/build/android/proj/settings.gradle
        const projSettingGradleAbsPath = path_1.default.join(result.dest, "proj", "settings.gradle");
        // 获取构建后的 Android 工程 app/build.gradle 路径 e.g. /Users/zhitao/game/native/engine/android/app/build.gradle
        const appBuildGradleAbsPath = path_1.default.join(Editor.Project.path, "native", "engine", "android", "app", "build.gradle");
        // 集成依赖库
        android_lib_dependency_1.androidLibDependency.setup(projSettingGradleAbsPath, appBuildGradleAbsPath);
    }
}
exports.BuilderHookerHotUpdateAndroidLibSetup = BuilderHookerHotUpdateAndroidLibSetup;
