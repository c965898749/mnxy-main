import { _decorator, Component, director, Node } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

@ccclass('EquipmentCtrl')
export class EquipmentCtrl extends Component {
    start() {

    }

    update(deltaTime: number) {

    }

    AddEquipment() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("AddEquipmentCtrl").active = true
    }

    // 打开背包
    async OpenHero() {
        AudioMgr.inst.playOneShot("sound/other/click");
        // this.node.active=false
        // this.node.parent.getChildByName("Equipment").active=true
        // const close = await util.message.load()
        // director.preloadScene("Equipment", () => {
        //     close()
        // })
        director.loadScene("Equipment")
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


