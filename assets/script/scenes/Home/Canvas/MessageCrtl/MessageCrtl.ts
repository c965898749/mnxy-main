import { _decorator, Component, Node } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('MessageCrtl')
export class MessageCrtl extends Component {
    start() {

    }

    update(deltaTime: number) {


    }
    async goBack2() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("MessageCrtl").active = false
    }
}


