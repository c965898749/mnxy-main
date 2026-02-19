"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuilderHookerHotUpdatePackageGenerator = void 0;
const path_1 = __importDefault(require("path"));
const package_generator_1 = require("../core/hotupdate/package-generator");
const builder_1 = require("./builder");
/**
 * 生成热更包到输出目录
 */
class BuilderHookerHotUpdatePackageGenerator {
    onBeforeBuild(options, result) {
        const pluginConfig = (0, builder_1.getBuilderPluginConfig)(options);
        if (!pluginConfig.enable) {
            return;
        }
        if (!result) {
            return;
        }
        // 获取远程热更新文件输出目录的压缩包 e.g. /Users/zhitao/game/build/android/data-gg-hot-update.zip
        const outputZipPath = path_1.default.join(result.dest, "data-gg-hot-update.zip");
        package_generator_1.packageGenerator.clear(outputZipPath);
    }
    onAfterBuild(options, result) {
        const pluginConfig = (0, builder_1.getBuilderPluginConfig)(options);
        if (!pluginConfig.enable) {
            return;
        }
        // 获取远程热更新文件输出目录的压缩包 e.g. /Users/zhitao/game/build/android/data-gg-hot-update.zip
        const outputDirPath = path_1.default.join(result.dest, "data-gg-hot-update");
        const outputZipPath = path_1.default.join(result.dest, "data-gg-hot-update.zip");
        package_generator_1.packageGenerator.generate(outputZipPath, outputDirPath);
    }
}
exports.BuilderHookerHotUpdatePackageGenerator = BuilderHookerHotUpdatePackageGenerator;
