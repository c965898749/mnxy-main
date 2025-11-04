import { _decorator, Component, director, find, Node } from 'cc';
import { HomeCanvas } from '../../Home/HomeCanvas';
const { ccclass, property } = _decorator;

@ccclass('FightSuccess')
export class FightSuccess extends Component {
    @property(Node)
    FightMap: Node
    start() {

    }

    update(deltaTime: number) {

    }

    // 跳过战斗
    async skipFight() {
        // this.node.active = false
        // this.FightMap.active = false
        // this.FightMap.destroy
        find('Canvas').getComponent(HomeCanvas).audioSource.play()
        this.FightMap.removeFromParent();
        this.FightMap.destroy();
        // director.loadScene("Home")

    }
}

