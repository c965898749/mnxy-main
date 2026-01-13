import { _decorator, Component, Node } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { ArenaApplyCrtl } from '../ArenaApplyCrtl/ArenaApplyCrtl';
const { ccclass, property } = _decorator;

@ccclass('ArenaCrtl')
export class ArenaCrtl extends Component {

    start() {

    }

    update(deltaTime: number) {

    }
    goback() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
        this.node.parent.getChildByName("JinjiCtrl").active = true
    }

    async openArena(event: Event, customEventData: string) {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
        await this.node.parent.getChildByName("ArenaApplyCrtl")
            .getComponent(ArenaApplyCrtl)
            .renderApply(customEventData)
    }
}


