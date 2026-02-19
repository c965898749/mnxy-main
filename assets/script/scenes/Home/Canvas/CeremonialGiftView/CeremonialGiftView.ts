import { _decorator, Component, Node } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

@ccclass('CeremonialGiftView')
export class CeremonialGiftView extends Component {
    start() {

    }

    update(deltaTime: number) {

    }

    async goBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }

    public async bodyReceive() {
        AudioMgr.inst.playOneShot("sound/other/click");
        return await util.message.prompt({ message: "暂未开放" })
    }

}


