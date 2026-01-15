import { _decorator, Component, director, Node } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

@ccclass('CardCrtl')
export class CardCrtl extends Component {
    start() {

    }

    update(deltaTime: number) {

    }

    // 打开背包
    async OpenHero() {
        AudioMgr.inst.playOneShot("sound/other/click");
        // const close = await util.message.load()
        // director.preloadScene("Hero", () => {
        //     close()
        // })
        director.loadScene("Hero")
    }

    //强化
    public async Qianhua() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("CardCrtl").active = false
        this.node.parent.getChildByName("qianghuaCtrl").active = true
    }

    //合成
    public hechen() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("CardCrtl").active = false
        this.node.parent.getChildByName("synthesisCtrl").active = true
    }

}


