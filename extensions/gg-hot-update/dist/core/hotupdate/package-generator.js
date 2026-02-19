"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageGenerator = void 0;
const adm_zip_1 = __importDefault(require("adm-zip"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const logger_1 = require("../../logger");
/**
 * 生成热更包到输出目录
 */
class PackageGenerator {
    /**
     * 清空热更包输出Zip文件
     *
     * @param outputZipPath 热更包输出目录的zip路径 e.g. /Users/zhitao/game/build/android/hotupdate.zip
     */
    clear(outputZipPath) {
        if (fs_extra_1.default.existsSync(outputZipPath)) {
            fs_extra_1.default.removeSync(outputZipPath);
        }
    }
    /**
     * 将热更新目录打包为 zip
     *
     * e.g. /Users/zhitao/game/build/android/hotupdate => /Users/zhitao/game/build/android/hotupdate.zip
     *
     * @param outputZipPath 热更包Zip文件输出目录 e.g. /Users/zhitao/game/build/android/hotupdate.zip
     * @param outputDirPath 热更包输出目录路径 e.g. /Users/zhitao/game/build/android/hotupdate
     */
    generate(outputZipPath, outputDirPath) {
        this.clear(outputZipPath);
        const admzip = new adm_zip_1.default();
        admzip.addLocalFolder(outputDirPath);
        admzip.writeZip(outputZipPath);
        logger_1.logger.log(`${outputZipPath} successfully generated.`);
    }
}
exports.packageGenerator = new PackageGenerator();
