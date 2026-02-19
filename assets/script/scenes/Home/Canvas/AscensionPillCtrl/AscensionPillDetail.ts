import { _decorator, Component, Node } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('AscensionPillDetail')
export class AscensionPillDetail extends Component {
    start() {

    }

    update(deltaTime: number) {

    }


    async goBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }

}


