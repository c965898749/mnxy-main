import { _decorator, Component, director, find, Node } from 'cc';
import { HomeCanvas } from '../../Home/HomeCanvas';
import { AudioMgr } from '../../../util/resource/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('FightFailure')
export class FightFailure extends Component {

    @property(Node)
    FightMap: Node
    initialized = false
    start() {
        this.refresh()
    }

    onEnable() {
        if (!this.initialized) {
            // 初始化代码
            this.initialized = true;
        } else {
            this.refresh()
        }

    }
    refresh() {
        AudioMgr.inst.playOneShot("sound/fight/end/pkLose");
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

