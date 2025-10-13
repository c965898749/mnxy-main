import { _decorator, Component, director, Event, Label, Node } from 'cc';
import { HolCharacter } from '../../../prefab/HolCharacter';
import { util } from '../../../util/util';
import { FightMap } from './FightMap';
const { ccclass, property } = _decorator;

@ccclass('FightUi')
export class FightUi extends Component {

    @property(Node)
    FightMapNode: Node

    @property(Label)
    CurrentRound: Label

    // 当前倍速
    private timeScale: number = 1

    update(deltaTime: number) {
        this.CurrentRound.string = this.FightMapNode.getComponent(FightMap).currentRound + ""
    }
    // 倍速
    setTimeScale(e: Event) {
        this.timeScale++
        if (this.timeScale > 3) this.timeScale = 1
        for (const node of this.FightMapNode.children)
            node.getComponent(HolCharacter).holAnimation.timeScale = this.timeScale
        e.target.getChildByName("Value").getComponent(Label).string = "x" + this.timeScale
        return
    }

   
}

