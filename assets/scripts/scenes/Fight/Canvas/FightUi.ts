import { _decorator, Component, director, Event, Label, Node } from 'cc';
import { HolCharacter } from '../../../prefab/HolCharacter';
import { util } from '../../../util/util';
import { FightMap } from './FightMap';
import { Main } from '../../../StartGame/Main';
// import { clientEvent } from '../uitls/clientEvent';
import { AudioMgr } from '../../../manager/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('FightUi')
export class FightUi extends Component {

    @property(Node)
    FightMapNode: Node

    // 当前倍速
    private timeScale: number = 1

    // 倍速
    setTimeScale(e: Event) {
        this.timeScale++
        if (this.timeScale > 3) this.timeScale = 1
        for (const node of this.FightMapNode.children)
            node.getComponent(HolCharacter).holAnimation.timeScale = this.timeScale
        e.target.getChildByName("Value").getComponent(Label).string = "x" + this.timeScale
        return
    }

    // 跳过战斗
    async skipFight() {
        director.preloadScene('game', function () {
            director.loadScene('game');
        });
        // console.log(1111)
        //         const result = await util.message.confirm({message: "确定要跳过战斗吗?"})
        //   console.log(result,3333)
        //         if (result) {
        //             console.log(222)
        //             // this.FightMapNode.getComponent(FightMap).isPlayAnimation = false
        //             director.loadScene("game")
        //         }
        // director.loadScene("game")
        // console.log(Main.instance.dicPanel)
        // AudioMgr.inst.playOneShot("Sound/click");
        // Main.instance.hidePanel(["prefab/ui/HomePanel", "prefab/ui/Floor"])
        // Main.instance.showPanel("prefab/ui/HomePanel", 1)
        // Main.instance.showPanel("prefab/ui/Floor", 100)
    }
}

