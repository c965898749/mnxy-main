"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.manifestGenerator = void 0;
const adm_zip_1 = __importDefault(require("adm-zip"));
const crypto_1 = __importDefault(require("crypto"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("../../logger");
/**
 * 生成 Manifest
 */
class ManifestGenerator {
    /**
     * 清空热更包输出目录
     *
     * @param dstDirPath 热更包输出目录路径 e.g. /Users/zhitao/game/build/android/data-gg-hot-update
     */
    clear(dstDirPath) {
        if (fs_extra_1.default.existsSync(dstDirPath)) {
            fs_extra_1.default.removeSync(dstDirPath);
        }
    }
    /**
     * 生成热更包的 manifest 资源
     *
     * @param srcDirPath 构建目录绝对路径 e.g. /Users/zhitao/game/build/android/data
     * @param dstDirPath 热更包输出目录路径 e.g. /Users/zhitao/game/build/android/data-gg-hot-update
     * @param hpBundleConfigFilePath 热更包配置文件路径 e.g. /Users/zhitao/game/settings/gg-hot-update-config.json
     */
    generate(srcDirPath, dstDirPath, hpBundleConfigFilePath) {
        // 清空输出目录
        this.clear(dstDirPath);
        // 复制原始构建包的内容到远程热更包输出目录（部分文件不用参与生成热更新条目）
        const excludeFileNames = ["application.js", "main.js"];
        fs_extra_1.default.copySync(srcDirPath, dstDirPath, {
            overwrite: true,
            preserveTimestamps: true,
            filter: (src, dst) => {
                return !excludeFileNames.includes(path_1.default.basename(src));
            },
        });
        // 遍历各个热更包配置，生成其 manifests 文件
        const hotUpdateFileConfig = JSON.parse(fs_extra_1.default.readFileSync(hpBundleConfigFilePath, "utf-8"));
        // 1. 根据远程热更包配置，生成远程热更包的配置
        this._generateManifest({ rootDirAbsPath: dstDirPath, bundles: hotUpdateFileConfig.remote_bundles, generateZip: true });
        // 2. 根据本地构建包配置，生成远程热更包的配置
        this._generateManifest({ rootDirAbsPath: srcDirPath, bundles: hotUpdateFileConfig.local_bundles, generateZip: false });
        // 3. 根据本地构建包配置，剔除本地构建包目录下不需要用到文件
        // 3.1 收集需要保留的文件的正则表达式
        const doNotDelFileRegs = [];
        doNotDelFileRegs.push(/main\.js|application\.js/);
        Object.keys(hotUpdateFileConfig.local_bundles).forEach((bundleName) => {
            const bundleConfig = hotUpdateFileConfig.local_bundles[bundleName];
            bundleConfig.files.forEach((fileRegText) => {
                doNotDelFileRegs.push(new RegExp(fileRegText));
            });
            // 这里添加 local_bundles 包含的热更包的配置文件，因为是定义在 local_bundles 的，所以这部分热更包配置文件不用剔除
            doNotDelFileRegs.push(new RegExp(`${bundleName}\.project\.manifest|${bundleName}\.version\.manifest`));
        });
        // 3.2 删除不需要保留的文件
        this._deleteUnExpectedFiles(srcDirPath, srcDirPath, doNotDelFileRegs);
    }
    /**
     * 根据配置，对指定目录生成热更新配置
     *
     * @param rootDirAbsPath
     * @param
     */
    _generateManifest(option) {
        Object.keys(option.bundles).forEach((bundleName) => {
            var _a;
            const bundleConfig = option.bundles[bundleName];
            // 收集文件匹配规则
            const fileRegs = [];
            bundleConfig.files.forEach((fileRegText) => {
                fileRegs.push(new RegExp(fileRegText));
            });
            // 如果没有文件匹配规则，则不用生成
            if (fileRegs.length == 0) {
                return;
            }
            // 定义 project.manifest 的文件 json 结构
            const projectManifest = {
                version: "",
                assets: {},
            };
            // 初始化热更包的 project.manifest 和 version.manifest 的输出路径
            // e.g. /Users/zhitao/game/build/andorid/data/${bundleName}.project.manifest
            // e.g. /Users/zhitao/game/build/andorid/data/${bundleName}.version.manifest
            // e.g. /Users/zhitao/game/build/andorid/data/${bundleName}.zip
            const projectManifestPath = path_1.default.join(option.rootDirAbsPath, `${bundleName}.project.manifest`);
            const versionManifestPath = path_1.default.join(option.rootDirAbsPath, `${bundleName}.version.manifest`);
            // 根据文件匹配规则，遍历输出目录，，找到匹配的文件并生成热更条目
            this._generateDirAssetEntry(option.rootDirAbsPath, option.rootDirAbsPath, fileRegs, projectManifest.assets);
            // 生成原始版本标识
            // 1. 遍历 project.manifest.assets 的 key
            // 2. 按字母大小，从小到大排序key
            // 3. 按照 key1value1key2value2... 的方式得到原始 vid 的字符串
            let srcVid = Object.keys(projectManifest.assets)
                .sort()
                .reduce((previousValue, key) => {
                return previousValue + key + projectManifest.assets[key].md5;
            });
            // 计算哈希版本标识
            projectManifest.version = crypto_1.default.createHash("md5").update(srcVid).digest("hex");
            // 生成 project.manifest
            fs_extra_1.default.writeFileSync(projectManifestPath, JSON.stringify(projectManifest));
            logger_1.logger.log(`${projectManifestPath} successfully generated.`);
            // 生成热更包 zip 文件
            // 热更包 zip 文件的字节数
            let zipFileBytes = 0;
            // 热更包 zip 文件解压后的总字节数
            let zipUncompressedBytes = 0;
            const generateZip = option.generateZip && ((_a = bundleConfig.zip) !== null && _a !== void 0 ? _a : true);
            if (generateZip) {
                const zipDestPath = path_1.default.join(option.rootDirAbsPath, `${bundleName}.zip`);
                const admzip = new adm_zip_1.default();
                // 将热更包包含的文件打包进 zip
                Object.keys(projectManifest.assets).forEach((assetFileRelativePath) => {
                    admzip.addLocalFile(path_1.default.join(option.rootDirAbsPath, assetFileRelativePath), "", assetFileRelativePath);
                    zipUncompressedBytes += projectManifest.assets[assetFileRelativePath].size;
                });
                // 将热更包的描述文件打包进 zip
                admzip.addLocalFile(projectManifestPath, "", `${bundleName}.project.manifest.gg`);
                zipUncompressedBytes += fs_extra_1.default.statSync(projectManifestPath).size;
                // 生成热更包 zip 文件
                admzip.writeZip(zipDestPath);
                logger_1.logger.log(`${zipDestPath} successfully generated.`);
                // 记录热更包 zip 文件的大小
                zipFileBytes = fs_extra_1.default.statSync(zipDestPath).size;
            }
            // 生成 version.manifest
            delete projectManifest.assets;
            if (generateZip) {
                // 如果需要生成热更包 zip 文件，那么写入 zip 文件的字节数和解压后的总字节数到 version.manifest 中，方便检查更新
                projectManifest.zip_file_bytes = zipFileBytes;
                projectManifest.zip_uncompressed_bytes = zipUncompressedBytes;
            }
            fs_extra_1.default.writeFileSync(versionManifestPath, JSON.stringify(projectManifest));
            logger_1.logger.log(`${versionManifestPath} successfully generated.`);
        });
    }
    /**
     * 深度遍历指定目录，为目录下所有文件生成热更条目，并写入到对象中
     *
     * @param rootDir 扫描的根目录 e.g. /Users/zhitao/game/build/android/data
     * @param scanDir 当前扫描的目录 e.g. /Users/zhitao/game/build/android/data/assets/main
     * @param expectRegs 文件匹配规则（正则表达式）数组
     * @param assetsObj 热更包的热更新条目
     */
    _generateDirAssetEntry(rootDir, scanDir, expectRegs, assetsObj) {
        let stat = fs_extra_1.default.statSync(scanDir);
        let absolutePath = "";
        let relativePath = "";
        if (!stat.isDirectory()) {
            return;
        }
        let dirFileNames = fs_extra_1.default.readdirSync(scanDir);
        for (const fileName of dirFileNames) {
            if (fileName.startsWith(".")) {
                continue;
            }
            absolutePath = path_1.default.join(scanDir, fileName);
            stat = fs_extra_1.default.statSync(absolutePath);
            if (stat.isDirectory()) {
                this._generateDirAssetEntry(rootDir, absolutePath, expectRegs, assetsObj);
                continue;
            }
            if (stat.isFile()) {
                // 计算相对路径
                relativePath = path_1.default.relative(rootDir, absolutePath);
                relativePath = relativePath.replace(/\\/g, "/");
                relativePath = encodeURI(relativePath);
                // 如果是热更新文件，那么就加入到热更新条目中
                if (expectRegs.findIndex((reg) => {
                    return reg.test(relativePath);
                }) != -1) {
                    assetsObj[relativePath] = {
                        size: stat.size,
                        md5: crypto_1.default.createHash("md5").update(fs_extra_1.default.readFileSync(absolutePath, "binary")).digest("hex"),
                    };
                }
                continue;
            }
        }
    }
    /**
     * 深度遍历指定目录，删除文件
     *
     * @param rootDir 扫描的根目录 e.g. /Users/zhitao/game/build/android/data
     * @param scanDir 当前扫描的目录 e.g. /Users/zhitao/game/build/android/data/assets/main
     * @param doNotDelFileRegs 需要保留下来的的文件的正则表达式数组
     */
    _deleteUnExpectedFiles(rootDir, scanDir, doNotDelFileRegs) {
        let stat = fs_extra_1.default.statSync(scanDir);
        let absolutePath = "";
        let relativePath = "";
        if (!stat.isDirectory()) {
            return;
        }
        const dirFileNames = fs_extra_1.default.readdirSync(scanDir);
        for (const fileName of dirFileNames) {
            if (fileName.startsWith(".")) {
                continue;
            }
            absolutePath = path_1.default.join(scanDir, fileName);
            stat = fs_extra_1.default.statSync(absolutePath);
            if (stat.isDirectory()) {
                this._deleteUnExpectedFiles(rootDir, absolutePath, doNotDelFileRegs);
                continue;
            }
            if (stat.isFile()) {
                // 计算相对路径
                relativePath = path_1.default.relative(rootDir, absolutePath);
                relativePath = relativePath.replace(/\\/g, "/");
                relativePath = encodeURI(relativePath);
                // 如果不是需要保留下来的文件，删除
                if (doNotDelFileRegs.findIndex((reg) => {
                    return reg.test(relativePath);
                }) == -1) {
                    fs_extra_1.default.removeSync(absolutePath);
                    continue;
                }
            }
        }
        // 判断当前目录是否为空目录，空目录则删除
        if (fs_extra_1.default.readdirSync(scanDir).length == 0) {
            fs_extra_1.default.removeSync(scanDir);
        }
    }
}
exports.manifestGenerator = new ManifestGenerator();
