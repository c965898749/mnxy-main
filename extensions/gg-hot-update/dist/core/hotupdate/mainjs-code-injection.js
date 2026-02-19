"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainJsCodeInjection = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../../config");
const logger_1 = require("../../logger");
/**
 * 插入到 main.js 头部的代码
 */
const inject_script = `
// inject code for hot update by ${config_1.PACKAGE_NAME} plugin: start
(function () {
    function createParentDirs(filePath) {
        var dirPath = jsb.fileUtils.getFileDir(filePath);
        if (!jsb.fileUtils.isDirectoryExist(dirPath)) {
            createParentDirs(dirPath);
            jsb.fileUtils.createDirectory(dirPath);
        }
    }
    if (typeof window.jsb === "object") {
        // Check if the search path cache exists
        var searchPathText = localStorage.getItem("GGHotUpdateSearchPaths");
        if (!searchPathText || searchPathText.length == 0) {
            return;
        }

        // Update the search path to the cached value
        var searchPaths = JSON.parse(searchPathText);
        jsb.fileUtils.setSearchPaths(searchPaths);

        // Get the first search path and check its validity.
        // e.g. /data/user/0/packageName/files/gg-hot-update/
        var searchPath = searchPaths[0] || "";
        if (!searchPath || searchPath.length == 0) {
            return;
        }

        // Check whether the download directory corresponding to the first search path exists
        // e.g. /data/user/0/packageName/files/gg-hot-update-temp/build-in/
        var downloadPath = searchPath.substring(0, searchPath.length - 1) + "-temp/build-in/";
        if (!jsb.fileUtils.isDirectoryExist(downloadPath)) {
            return;
        }

        // Check whether the build-in package has been updated. 
        // Conditions: 
        // 1. the project.manifest download cache file does not exist. e.g. /data/user/0/packageName/files/gg-hot-update-temp/build-in/build-in.project.manifest.gg
        // 2. the project.manifest new version file has been generated. e.g. /data/user/0/packageName/files/gg-hot-update-temp/build-in/build-in.project.manifest
        if (jsb.fileUtils.isFileExist(downloadPath + "build-in.project.manifest.gg") || !jsb.fileUtils.isFileExist(downloadPath + "build-in.project.manifest")) {
            return;
        }

        // Move the build-in package from download directory to the search path directory
        var downloadPathLength = downloadPath.length;
        var fileList = [];
        jsb.fileUtils.listFilesRecursively(downloadPath, fileList);
        fileList.forEach((srcPath) => {
            var relativePath = srcPath.substring(downloadPathLength);
            var dstPath = searchPath + relativePath;
            if (dstPath[dstPath.length - 1] == "/") {
                jsb.fileUtils.createDirectory(dstPath);
            } else {
                createParentDirs(dstPath);
                if (jsb.fileUtils.isFileExist(dstPath)) {
                    jsb.fileUtils.removeFile(dstPath);
                }
                jsb.fileUtils.renameFile(srcPath, dstPath);
            }
        });
        if (jsb.fileUtils.isDirectoryExist(downloadPath)) {
            jsb.fileUtils.removeDirectory(downloadPath);
        }
    }
})();
// inject code for hot update by ${config_1.PACKAGE_NAME} plugin: end
`;
/**
 * 注入代码到 main.js
 */
class MainJsCodeInjection {
    /**
     * 注入代码到 main.js
     *
     * @param assetsRootDir 构建目录绝对路径 e.g. /Users/zhitao/game/build/android/data
     */
    injectCodeToMainJs(assetsRootDir) {
        const mainjsPath = path_1.default.join(assetsRootDir, "main.js");
        if (!fs_extra_1.default.existsSync(mainjsPath)) {
            throw new Error(`cannot found main.js in ${mainjsPath}`);
        }
        const mainjsSrcText = fs_extra_1.default.readFileSync(mainjsPath, "utf-8");
        const mainjsEndText = inject_script + mainjsSrcText;
        fs_extra_1.default.writeFileSync(mainjsPath, mainjsEndText);
        logger_1.logger.log("hot update code is successfully injected into main.js");
    }
}
exports.mainJsCodeInjection = new MainJsCodeInjection();
