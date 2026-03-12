import { _decorator, Component, Node } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

@ccclass('ExtendExp')
export class ExtendExp extends Component {
    start() {

    }

    update(deltaTime: number) {

    }
    public async ok() {
        AudioMgr.inst.playOneShot("sound/other/click");
        return await util.message.prompt({ message: "暂未开放" })
    }
    async goBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }
}


