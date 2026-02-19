import { _decorator, Component, Node } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('addFriendCtrl')
export class addFriendCtrl extends Component {
    start() {

    }

    update(deltaTime: number) {

    }
    async goBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }
}


