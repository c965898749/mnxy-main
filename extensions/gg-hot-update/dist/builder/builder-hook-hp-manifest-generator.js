"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuilderHookerHotUpdateManifestGenerator = void 0;
const path_1 = __importDefault(require("path"));
const manifest_generator_1 = require("../core/hotupdate/manifest-generator");
const builder_1 = require("./builder");
/**
 * 生成 Manifest 的任务
 */
class BuilderHookerHotUpdateManifestGenerator {
    onBeforeBuild(options, result) {
        const pluginConfig = (0, builder_1.getBuilderPluginConfig)(options);
        if (!pluginConfig.enable) {
            return;
        }
        if (!result) {
            return;
        }
        // 获取远程热更新文件输出目录 e.g. /Users/zhitao/game/build/android/data-gg-hot-update
        const outputDirPath = path_1.default.join(result.dest, "data-gg-hot-update");
        manifest_generator_1.manifestGenerator.clear(outputDirPath);
    }
    onAfterBuild(options, result) {
        const pluginConfig = (0, builder_1.getBuilderPluginConfig)(options);
        if (!pluginConfig.enable) {
            return;
        }
        // 获取构建资源目录 e.g. /Users/zhitao/game/build/android/data
        const assetsRootDir = path_1.default.join(result.dest, "data");
        // 获取远程热更新文件输出目录 e.g. /Users/zhitao/game/build/android/data-gg-hot-update
        const outputDirPath = path_1.default.join(result.dest, "data-gg-hot-update");
        // 获取配置文件绝对路径 e.g. /Users/zhitao/game/settings/gg-hot-update-config.json
        const configPath = path_1.default.join(Editor.Project.path, pluginConfig.configPath);
        manifest_generator_1.manifestGenerator.generate(assetsRootDir, outputDirPath, configPath);
    }
}
exports.BuilderHookerHotUpdateManifestGenerator = BuilderHookerHotUpdateManifestGenerator;
