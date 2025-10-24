import { _decorator, Component, director, find, instantiate, Node, Prefab, resources } from 'cc';
const { ccclass, property } = _decorator;
import { Main } from '../StartGame/Main';
import { AudioMgr } from '../manager/AudioMgr';
@ccclass('bigDashiTiaozhan')
export class bigDashiTiaozhan extends Component {
    start() {

    }

    update(deltaTime: number) {

    }
    onBtnBigLeitai() {
        AudioMgr.inst.playOneShot("Sound/click");
        Main.instance.hidePanel(["prefab/ui/big_leitai"])
        Main.instance.showPanel("prefab/ui/big_leitai", 1)
    }
    onBtnBigRank() {
        AudioMgr.inst.playOneShot("Sound/click");
        Main.instance.hidePanel(["prefab/ui/big_ranking"])
        Main.instance.showPanel("prefab/ui/big_ranking", 1)
    }

    onBtnBackBigLeitai() {
        AudioMgr.inst.playOneShot("Sound/click");
        Main.instance.hidePanel(["prefab/ui/big_leitai"])
        Main.instance.showPanel("prefab/ui/big_leitai", 1)
    }
    onBtnBackTiaozhan() {
        AudioMgr.inst.playOneShot("Sound/click");
        Main.instance.hidePanel(["prefab/ui/tiaozhanpel", "prefab/ui/Floor"])
        Main.instance.showPanel("prefab/ui/tiaozhanpel", 1)
        Main.instance.showPanel("prefab/ui/Floor", 100)
    }
    // 开启战斗
    onBtnStartBigLeitai() {
        // const close = await util.message.load()
        // director.preloadScene("Fight", () => {
        //     close()
        // })
        director.loadScene("Fight")
    }

}


