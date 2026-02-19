"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = exports.getBuilderPluginConfig = void 0;
const config_1 = require("../config");
/**
 * 获取插件配置
 *
 * @param options 构建任务配置
 */
function getBuilderPluginConfig(options) {
    var _a;
    return (_a = options.packages) === null || _a === void 0 ? void 0 : _a[config_1.PACKAGE_NAME];
}
exports.getBuilderPluginConfig = getBuilderPluginConfig;
/**
 * 通用原生平台插件属性
 */
const nativeBuildPlugin = {
    doc: "https://www.yuque.com/dhunterstudio/gg/hot-update",
    hooks: "./builder-hook",
    // @ts-ignore
    options: {
        enable: {
            label: Editor.I18n.t(`${config_1.PACKAGE_NAME}.build_item_enable_label`),
            description: Editor.I18n.t(`${config_1.PACKAGE_NAME}.build_item_enable_desc`),
            default: false,
            render: {
                ui: "ui-checkbox",
            },
            verifyRules: ["configPathRequired"],
        },
        configPath: {
            label: Editor.I18n.t(`${config_1.PACKAGE_NAME}.build_item_config_path_label`),
            description: Editor.I18n.t(`${config_1.PACKAGE_NAME}.build_item_config_path_desc`),
            default: "",
            render: {
                ui: "ui-input",
                attributes: {
                    placeholder: "e.g. settings/gg-hot-update-config.json",
                },
            },
        },
    },
    verifyRuleMap: {
        configPathRequired: {
            message: Editor.I18n.t(`${config_1.PACKAGE_NAME}.build_item_enable_rule_1_msg`),
            func: (val, option) => {
                var _a;
                const pluginOption = (_a = option.packages) === null || _a === void 0 ? void 0 : _a[config_1.PACKAGE_NAME];
                return pluginOption != null && pluginOption.configPath != null && pluginOption.configPath.trim().length > 0;
            },
        },
    },
};
/**
 * Android 平台插件属性
 */
const androidBuildPlugin = Object.assign(Object.assign({}, nativeBuildPlugin), { 
    // 覆盖 options 对象
    options: Object.assign(Object.assign({}, nativeBuildPlugin.options), { 
        // 在 options 对象中新增属性
        enableAutoSetupAndroidDeps: {
            label: Editor.I18n.t(`${config_1.PACKAGE_NAME}.build_item_enable_auto_setup_android_deps_label`),
            description: Editor.I18n.t(`${config_1.PACKAGE_NAME}.build_item_enable_auto_setup_android_deps_desc`),
            default: true,
            render: {
                ui: "ui-checkbox",
            },
        } }) });
exports.configs = {
    ios: nativeBuildPlugin,
    android: androidBuildPlugin,
    "google-play": androidBuildPlugin,
    "harmonyos-next": nativeBuildPlugin,
    ohos: nativeBuildPlugin,
    mac: nativeBuildPlugin,
    windows: nativeBuildPlugin,
};
