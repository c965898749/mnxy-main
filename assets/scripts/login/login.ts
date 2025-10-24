import { _decorator, Component, find, instantiate, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;
import { AudioMgr } from '../manager/AudioMgr';
import { Main } from '../StartGame/Main';
import { londing } from './londing';
@ccclass('login')
export class login extends Component {

    start() {
        // let Canvas1 = Main.instance.Canvas
        // var Longding1 = Main.instance.Longding
        //  console.log(Canvas1,4444)
        // console.log(Longding1,3333)
    }

    update(deltaTime: number) {

    }
    BtnLoginIn() {
        this.node.active = false
        AudioMgr.inst.playOneShot("Sound/click");
        let Canvas = Main.instance.Canvas
        var Longding = instantiate(Main.instance.Longding)
        Canvas.addChild(Longding);
        Longding.setSiblingIndex(1)
    }
}


