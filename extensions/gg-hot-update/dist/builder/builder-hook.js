"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.builderHookTasks = exports.onAfterMake = exports.onBeforeMake = exports.onAfterBuild = exports.onAfterCompressSettings = exports.onBeforeCompressSettings = exports.onBeforeBuild = exports.onError = exports.unload = exports.load = exports.throwError = void 0;
const config_1 = require("../config");
const logger_1 = require("../logger");
const builder_1 = require("./builder");
const builder_hook_hp_build_option_check_1 = require("./builder-hook-hp-build-option-check");
const builder_hook_hp_mainjs_code_injection_1 = require("./builder-hook-hp-mainjs-code-injection");
const builder_hook_hp_manifest_generator_1 = require("./builder-hook-hp-manifest-generator");
const builder_hook_hp_package_generator_1 = require("./builder-hook-hp-package-generator");
const builder_hook_hp_android_lib_setup_1 = require("./builder-hook-hp-android-lib-setup");
/**
 * 输入构建阶段的状态日志信息
 *
 * @param tag 构建阶段标签
 * @param options 插件任务配置
 * @param result 构建阶段结果
 */
const logStage = (tag, options, result) => {
    logger_1.logger.log(tag);
    logger_1.logger.log(tag, "options", options);
    logger_1.logger.log(tag, "options.packages." + config_1.PACKAGE_NAME, (0, builder_1.getBuilderPluginConfig)(options));
    if (result) {
        logger_1.logger.log(tag, "result.dest", result.dest);
        logger_1.logger.log(tag, "result.paths", result.paths);
        logger_1.logger.log(tag, "result.settings", result.settings);
    }
};
// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 插件生命周期钩子管理
/**
 * 插件注入的钩子函数，在执行失败时是否直接退出构建流程
 */
exports.throwError = true;
const load = function () {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.log("load");
        for (const task of exports.builderHookTasks) {
            yield ((_a = task.load) === null || _a === void 0 ? void 0 : _a.call(task));
        }
    });
};
exports.load = load;
const unload = function () {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.log("unload");
        for (const task of exports.builderHookTasks) {
            yield ((_a = task.unload) === null || _a === void 0 ? void 0 : _a.call(task));
        }
    });
};
exports.unload = unload;
const onError = function (options, result) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        logStage("onError", options, result);
        for (const task of exports.builderHookTasks) {
            yield ((_a = task.onError) === null || _a === void 0 ? void 0 : _a.call(task, options, result));
        }
    });
};
exports.onError = onError;
const onBeforeBuild = function (options, result) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        logStage("onBeforeBuild", options, result);
        for (const task of exports.builderHookTasks) {
            yield ((_a = task.onBeforeBuild) === null || _a === void 0 ? void 0 : _a.call(task, options, result));
        }
    });
};
exports.onBeforeBuild = onBeforeBuild;
const onBeforeCompressSettings = function (options, result) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        logStage("onBeforeCompressSettings", options, result);
        for (const task of exports.builderHookTasks) {
            yield ((_a = task.onBeforeCompressSettings) === null || _a === void 0 ? void 0 : _a.call(task, options, result));
        }
    });
};
exports.onBeforeCompressSettings = onBeforeCompressSettings;
const onAfterCompressSettings = function (options, result) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        logStage("onAfterCompressSettings", options, result);
        for (const task of exports.builderHookTasks) {
            yield ((_a = task.onAfterCompressSettings) === null || _a === void 0 ? void 0 : _a.call(task, options, result));
        }
    });
};
exports.onAfterCompressSettings = onAfterCompressSettings;
const onAfterBuild = function (options, result) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        logStage("onAfterBuild", options, result);
        for (const task of exports.builderHookTasks) {
            yield ((_a = task.onAfterBuild) === null || _a === void 0 ? void 0 : _a.call(task, options, result));
        }
    });
};
exports.onAfterBuild = onAfterBuild;
const onBeforeMake = function (root, options) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        logStage("onBeforeMake", options);
        for (const task of exports.builderHookTasks) {
            yield ((_a = task.onBeforeMake) === null || _a === void 0 ? void 0 : _a.call(task, root, options));
        }
    });
};
exports.onBeforeMake = onBeforeMake;
const onAfterMake = function (root, options) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        logStage("onAfterMake", options);
        for (const task of exports.builderHookTasks) {
            yield ((_a = task.onAfterMake) === null || _a === void 0 ? void 0 : _a.call(task, root, options));
        }
    });
};
exports.onAfterMake = onAfterMake;
// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 插件任务管理
exports.builderHookTasks = [];
// 构建配置检查
exports.builderHookTasks.push(new builder_hook_hp_build_option_check_1.BuilderHookerHotUpdateBuildConfigCheck());
// 生成 project.manifest 和 version.manifest
exports.builderHookTasks.push(new builder_hook_hp_manifest_generator_1.BuilderHookerHotUpdateManifestGenerator());
// 注入热更新相关代码到 main.js
exports.builderHookTasks.push(new builder_hook_hp_mainjs_code_injection_1.BuilderHookerHotUpdateMainJsCodeInjection());
// 打包最终热更包到输出目录
exports.builderHookTasks.push(new builder_hook_hp_package_generator_1.BuilderHookerHotUpdatePackageGenerator());
// 在构建后的 Android 工程中，集成插件的依赖库（提供文件读写和zip等相关原生能力）
exports.builderHookTasks.push(new builder_hook_hp_android_lib_setup_1.BuilderHookerHotUpdateAndroidLibSetup());
