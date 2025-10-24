import { _decorator, Component, find, instantiate, Label, log, Node, Prefab, resources } from 'cc';
import { Main } from '../StartGame/Main';
// import { clientEvent } from '../uitls/clientEvent';
import { AudioMgr } from '../manager/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('FloorPanel')
export class FloorPanel extends Component {

    onBtnBackHome() {
        AudioMgr.inst.playOneShot("Sound/click");
        Main.instance.hidePanel(["prefab/ui/HomePanel", "prefab/ui/Floor"])
        Main.instance.showPanel("prefab/ui/HomePanel", 1)
        Main.instance.showPanel("prefab/ui/Floor", 100)
    }

    onBtnZhuanBeiClick() {
        AudioMgr.inst.playOneShot("Sound/click");
        Main.instance.hidePanel(["prefab/ui/zhuanbeipel", "prefab/ui/Floor"])
        Main.instance.showPanel("prefab/ui/zhuanbeipel", 1)
        Main.instance.showPanel("prefab/ui/Floor", 100)
    }
    onBtnTanxianClick() {
        AudioMgr.inst.playOneShot("Sound/click");
        Main.instance.hidePanel(["prefab/ui/TianxianPel", "prefab/ui/Floor"])
        Main.instance.showPanel("prefab/ui/TianxianPel", 1)
        Main.instance.showPanel("prefab/ui/Floor", 100)
    }

    onBtnTiaozhanClick() {
        AudioMgr.inst.playOneShot("Sound/click");
        Main.instance.hidePanel(["prefab/ui/tiaozhanpel", "prefab/ui/Floor"])
        Main.instance.showPanel("prefab/ui/tiaozhanpel", 1)
        Main.instance.showPanel("prefab/ui/Floor", 100)
    }

    onBtnMyCardClick() {
        AudioMgr.inst.playOneShot("Sound/click");
        Main.instance.hidePanel(["prefab/ui/myCardpel", "prefab/ui/Floor"])
        Main.instance.showPanel("prefab/ui/myCardpel", 1)
        Main.instance.showPanel("prefab/ui/Floor", 100)
    }

    onBtnOthersClick() {
        AudioMgr.inst.playOneShot("Sound/click");
        Main.instance.hidePanel(["prefab/ui/otherspel", "prefab/ui/Floor"])
        Main.instance.showPanel("prefab/ui/otherspel", 1)
        Main.instance.showPanel("prefab/ui/Floor", 100)
    }
    onBtnShopClick() {
        AudioMgr.inst.playOneShot("Sound/click");
        Main.instance.hidePanel(["prefab/ui/shoppel", "prefab/ui/Floor"])
        Main.instance.showPanel("prefab/ui/shoppel", 1)
        Main.instance.showPanel("prefab/ui/Floor", 100)
    }

}


