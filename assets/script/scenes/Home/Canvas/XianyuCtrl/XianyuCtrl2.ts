import { _decorator, Component, Node, WebView } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('XianyuCtrl2')
export class XianyuCtrl2 extends Component {
    initialized = false;
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
        this.node.parent.getChildByName("XianyuCtrl2").active = false
    }
    initData() {
    }
}


