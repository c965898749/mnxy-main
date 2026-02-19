"use strict";
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 解析参数
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const android_lib_dependency_1 = require("./core/hotupdate/android-lib-dependency");
const mainjs_code_injection_1 = require("./core/hotupdate/mainjs-code-injection");
const manifest_generator_1 = require("./core/hotupdate/manifest-generator");
const package_generator_1 = require("./core/hotupdate/package-generator");
const logger_1 = require("./logger");
// 构建目录绝对路径 e.g. /Users/zhitao/game/build/android/data
let assetsRootDirPath = "";
// 热更包配置文件路径 e.g. /Users/zhitao/game/gg-hot-update-config.json
let configFilePath = "";
// 热更包输出目录路径 e.g. /Users/zhitao/game/build/android/hotupdate
let outputDirPath = "";
// 热更包输出目录路径 e.g. /Users/zhitao/game/build/android/hotupdate.zip
let outputZipPath = "";
// Android 工程 settings.gradle 路径 e.g. /Users/zhitao/game/build/android/proj/settings.gradle
let projectSettingGradleAbsPath = "";
// Android 工程 app/build.gradle 路径 e.g. /Users/zhitao/game/native/engine/android/app/build.gradle
let appBuildGradleAbsPath = "";
let i = 2;
while (i < process.argv.length) {
    const arg = process.argv[i];
    switch (arg) {
        case "-assetsRootDirPath":
            assetsRootDirPath = process.argv[i + 1];
            i += 2;
            break;
        case "-configPath":
            configFilePath = process.argv[i + 1];
            i += 2;
            break;
        case "-outputDirPath":
            outputDirPath = process.argv[i + 1];
            outputZipPath = outputDirPath + ".zip";
            i += 2;
            break;
        case "-projectSettingGradleAbsPath":
            projectSettingGradleAbsPath = process.argv[i + 1];
            i += 2;
            break;
        case "-appBuildGradleAbsPath":
            appBuildGradleAbsPath = process.argv[i + 1];
            i += 2;
            break;
        default:
            i++;
            break;
    }
}
logger_1.logger.log("");
logger_1.logger.log("当前执行node命令的目录路径", process.cwd());
logger_1.logger.log("可执行文件路径", process.argv[0]);
logger_1.logger.log("将执行的脚本路径", process.argv[1]);
logger_1.logger.log("传入参数数组\n", process.argv);
logger_1.logger.log("");
logger_1.logger.log("当前插件版本", config_1.PACKAGE_VERSION);
logger_1.logger.log("构建目录绝对路径", assetsRootDirPath);
logger_1.logger.log("热更包配置文件路径", configFilePath);
logger_1.logger.log("热更包输出目录路径", outputDirPath);
logger_1.logger.log("热更包输出Zip路径", outputZipPath);
logger_1.logger.log("Android 工程 settings.gradle 路径", projectSettingGradleAbsPath);
logger_1.logger.log("Android 工程 app/build.gradle 路径", appBuildGradleAbsPath);
logger_1.logger.log("");
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 执行构建任务
// 生成 project.manifest 和 version.manifest
manifest_generator_1.manifestGenerator.generate(assetsRootDirPath, outputDirPath, configFilePath);
// 注入代码到 main.js
mainjs_code_injection_1.mainJsCodeInjection.injectCodeToMainJs(assetsRootDirPath);
// 打包最终热更包到输出目录
package_generator_1.packageGenerator.generate(outputZipPath, outputDirPath);
// 集成插件的 Android 依赖库
if (projectSettingGradleAbsPath != "" && appBuildGradleAbsPath != "") {
    android_lib_dependency_1.androidLibDependency.setup(projectSettingGradleAbsPath, appBuildGradleAbsPath);
}
