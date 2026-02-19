"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.androidLibDependency = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const logger_1 = require("../../logger");
/**
 * Android 原生库依赖
 */
class AndroidLibDependency {
    /**
     * 集成插件的原生依赖库到开发者的Android项目中
     *
     * @param projectSettingGradleAbsPath Android 工程 settings.gradle 路径 e.g. /Users/zhitao/game/build/android/proj/settings.gradle
     * @param appBuildGradleAbsPath Android 工程 app/build.gradle 路径 e.g. /Users/zhitao/game/native/engine/android/app/build.gradle
     */
    setup(projectSettingGradleAbsPath, appBuildGradleAbsPath) {
        // 1. 在 proj/setting.gradle 中声明我们的原生库
        // e.g. build/android/proj/settings.gradle
        const ggLibDeclarationScript = `include ":lib-gg"`;
        const ggLibIncludeScript = `
include ":lib-gg"
project(':lib-gg').projectDir = new File(NATIVE_DIR, '../../../extensions/gg-hot-update/native/android/lib-gg')
`;
        const settingGradleText = fs_extra_1.default.readFileSync(projectSettingGradleAbsPath, "utf-8");
        if (!settingGradleText.includes(ggLibDeclarationScript)) {
            fs_extra_1.default.writeFileSync(projectSettingGradleAbsPath, settingGradleText + ggLibIncludeScript, { encoding: "utf-8" });
        }
        logger_1.logger.log(`Successfully declared lib-gg module in ${projectSettingGradleAbsPath}.`);
        // 2. 在 app/build.gradle 中依赖我们的原生库
        // e.g. native/android/app/build.gradle
        const cocosLibLocationText = `implementation project(':libcocos')`;
        const ggLibDependencyScript = `implementation project(':lib-gg')`;
        const ggLibImplementationScript = `${cocosLibLocationText}\n    ${ggLibDependencyScript}`;
        const appBuildGradleText = fs_extra_1.default.readFileSync(appBuildGradleAbsPath, "utf-8");
        if (!appBuildGradleText.includes(ggLibDependencyScript)) {
            fs_extra_1.default.writeFileSync(appBuildGradleAbsPath, appBuildGradleText.replace(cocosLibLocationText, ggLibImplementationScript), { encoding: "utf-8" });
        }
        logger_1.logger.log(`Successfully added lib-gg module as a dependency to ${appBuildGradleAbsPath}.`);
    }
}
exports.androidLibDependency = new AndroidLibDependency();
