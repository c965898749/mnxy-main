import { _decorator, Component, find, instantiate, Label, log, Node, Prefab, resources } from 'cc';
import { Main } from '../StartGame/Main';
// import { clientEvent } from '../uitls/clientEvent';
import { AudioMgr } from '../manager/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('HomePanel')
export class HomePanel extends Component {
    

    onBtnTanxianClick() {
        AudioMgr.inst.playOneShot("click");
        Main.instance.hidePanel(["prefab/ui/TianxianPel", "prefab/ui/Floor"])
        Main.instance.showPanel("prefab/ui/TianxianPel", 1)
    }

    onBtnOpenTiemClick() {
        AudioMgr.inst.playOneShot("Sound/click");
        Main.instance.hidePanel(["prefab/ui/tiempel", "prefab/ui/Floor"])
        Main.instance.showPanel("prefab/ui/tiempel", 1)
    }


    onBtnCardQianhuaClick() {
        AudioMgr.inst.playOneShot("Sound/click");
        Main.instance.hidePanel(["prefab/ui/card_qianghuapel", "prefab/ui/Floor"])
        Main.instance.showPanel("prefab/ui/card_qianghuapel", 1)
    }

    onBtnTiaozhanClick() {
        AudioMgr.inst.playOneShot("Sound/click");
        Main.instance.hidePanel(["prefab/ui/tiaozhanpel", "prefab/ui/Floor"])
        Main.instance.showPanel("prefab/ui/tiaozhanpel", 1)
    }
    onBtnAd1DetailClick() {
        AudioMgr.inst.playOneShot("Sound/click");
        Main.instance.hidePanel(["prefab/ui/activitypel"])
        Main.instance.showPanel("prefab/ui/activitypel", 1)
    }
    onBtnRewardClick() {
        AudioMgr.inst.playOneShot("Sound/click");
        Main.instance.hidePanel(["prefab/ui/popup", "prefab/ui/HomePanel", "prefab/ui/Floor"])
        Main.instance.showPanel("prefab/ui/popup", 999)
    }

}


