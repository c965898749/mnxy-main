import { _decorator, Component, Node, RichText } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('questionCrtl')
export class questionCrtl extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;

    start() {

    }

    update(deltaTime: number) {

    }

    read(content) {
        this.node.active = true
        this.ContentNode.getComponent(RichText).string = content
    }
    goback() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false;
    }
}


