import { _decorator, Component, Node } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('EquipmentCtrl')
export class EquipmentCtrl extends Component {
    start() {

    }

    update(deltaTime: number) {

    }

    AddEquipment() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("AddEquipmentCtrl").active = true
    }
}


