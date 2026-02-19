module.exports = {
    title: "gg-hot-update",
    description: "GG 热更新插件",
    build_item_enable_label: "生成热更包",
    build_item_enable_desc: "根据热更包配置文件，生成构建包(data)和远程包(data-gg-hot-update)",
    build_item_enable_rule_1_msg: "热更包配置文件的相对路径不能为空",
    build_item_config_path_label: "热更包配置文件的相对路径",
    build_item_config_path_desc: "热更包配置文件的相对路径（相对于项目根目录的路径） e.g. settings/gg-hot-update-config.json",
    build_err_do_not_enable_md5_cache: "请不要在构建面板中启用MD5缓存配置",
    build_item_enable_auto_setup_android_deps_label: "自动集成Android依赖",
    build_item_enable_auto_setup_android_deps_desc: "勾选后，插件会在构建后，自动将插件的Android依赖库集成到你的项目中",
};
