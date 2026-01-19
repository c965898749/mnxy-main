import { _decorator, Component, director, Node } from 'cc';
import { util } from '../../util/util';
import { AudioMgr } from '../../util/resource/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('EqHeroCanvas')
export class EqHeroCanvas extends Component {
    start() {
    }
    // 回到主页
    async GoBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        // this.node.active = false
        // this.node.parent.getChildByName("EquipmentCtrl").active = true
        // const close = await util.message.load()
        // director.preloadScene("Home", () => close())
        director.loadScene("Home")
    }

}

