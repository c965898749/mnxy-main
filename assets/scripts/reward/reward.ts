import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
import { Main } from '../StartGame/Main';
// import { clientEvent } from '../uitls/clientEvent';
import { AudioMgr } from '../manager/AudioMgr';
@ccclass('reward')
export class reward extends Component {
    start() {

    }

    update(deltaTime: number) {

    }
    onBtnBackHome() {
        AudioMgr.inst.playOneShot("Sound/click");
        Main.instance.hidePanel(["prefab/ui/HomePanel", "prefab/ui/Floor"])
        Main.instance.showPanel("prefab/ui/HomePanel", 1)
        Main.instance.showPanel("prefab/ui/Floor", 100)
    }
}


