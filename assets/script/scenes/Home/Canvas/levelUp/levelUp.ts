import { _decorator, AudioClip, AudioSource, Component, Label, Node } from 'cc';
import { getConfig } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

@ccclass('levelUp')
export class levelUp extends Component {
    @property(Node)
    level: Node
    start() {

    }



    async refresh(level) {
        this.node.active = true
        const config = getConfig()
        localStorage.setItem("levelUp", null)
        this.level.getComponent(Label).string = '恭喜达到 ' + level + ' 级!'
        AudioMgr.inst.playOneShot("sound/other/uplvlorpvelvl");
    }

    update(deltaTime: number) {

    }
    colseBtn() {
        this.node.active = false
    }
}


