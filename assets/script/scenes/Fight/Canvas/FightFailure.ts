import { _decorator, Component, director, find, Node } from 'cc';
import { HomeCanvas } from '../../Home/HomeCanvas';
const { ccclass, property } = _decorator;

@ccclass('FightFailure')
export class FightFailure extends Component {

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
        find('Canvas').getComponent(HomeCanvas).audioSource.play()
        this.FightMap.removeFromParent();
        this.FightMap.destroy();
        // this.FightMap.destroy

        //   director.loadScene("Home")

    }
}

