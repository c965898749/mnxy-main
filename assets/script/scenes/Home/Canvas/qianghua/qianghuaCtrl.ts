import { _decorator, Component, Node } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('qianghuaCtrl')
export class qianghuaCtrl extends Component {
    start() {

    }

    update(deltaTime: number) {

    }

    public zhuSelectCard() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("qianghuaCtrl").active = false
        this.node.parent.getChildByName("Floor").active = false
        this.node.parent.getChildByName("selectCardCtrl").active = true
    }
}


