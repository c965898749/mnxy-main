import { _decorator, Component, Node } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('bagCrtl')
export class bagCrtl extends Component {
    start() {

    }

    update(deltaTime: number) {

    }
    goBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
        // this.node.parent.getChildByName("JinjiCtrl").active = true
    }
}


