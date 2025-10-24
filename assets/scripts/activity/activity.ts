import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
import { Main } from '../StartGame/Main';
// import { clientEvent } from '../uitls/clientEvent';
@ccclass('activity')
export class activity extends Component {
    start() {

    }

    update(deltaTime: number) {

    }

    onBtnBackHome() {
        Main.instance.hidePanel(["HomePanel", "Floor"])
        Main.instance.showPanel("HomePanel", 1)
        Main.instance.showPanel("Floor", 100)
    }

}


