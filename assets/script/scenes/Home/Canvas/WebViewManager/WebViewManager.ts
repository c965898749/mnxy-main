import { _decorator, Component, Label, Node, WebView } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('WebViewManager')
export class WebViewManager extends Component {
    initialized = false;
    @property(WebView)
    Web: WebView
    start() {
        this.initData()
    }

    onEnable() {
        if (!this.initialized) {
            // 初始化代码
            this.initialized = true;
        } else {
            // this.refresh()
            this.initData()
        }

    }
    update(deltaTime: number) {

    }
    async goBack2() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.Web.node.active = false
        this.node.parent.getChildByName("WebViewManager").active = false
    }
    initData() {
        this.Web.node.active = true
    }
}
