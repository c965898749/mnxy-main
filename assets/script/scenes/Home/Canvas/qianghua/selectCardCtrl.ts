import { _decorator, Component, Node } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('selectCardCtrl')
export class selectCardCtrl extends Component {
    start() {

    }

    update(deltaTime: number) {

    }

    public backQianhua() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("qianghuaCtrl").active = true
        this.node.parent.getChildByName("Floor").active = true
        this.node.parent.getChildByName("selectCardCtrl").active = false
    }
}


