import { _decorator, Component, director, find, Label, Node } from 'cc';
import { HomeCanvas } from '../../Home/HomeCanvas';
import { levelUp } from '../../Home/Canvas/levelUp/levelUp';
import { ItemCtrl } from '../../Home/Canvas/Tiem/ItemCtrl';
const { ccclass, property } = _decorator;

@ccclass('FightSuccess')
export class FightSuccess extends Component {
    @property(Node)
    FightMap: Node
    @property(Node)
    rewards: Node
    start() {

    }

    update(deltaTime: number) {

    }

    levelUp = 0

    read(rewards, levelUp) {
        this.levelUp = levelUp
        for (var i = 0; i < rewards.length; i++) {
            if (rewards[i] == "10000") {
                this.rewards.children[i].active = true
                this.rewards.children[i].children[5].getComponent(Label).string = "10000"
                this.rewards.children[i].children[3].active = true
            } else if (rewards[i] == "3000") {
                this.rewards.children[i].active = true
                this.rewards.children[i].children[5].getComponent(Label).string = "3000"
                this.rewards.children[i].children[0].active = true
            }else if (rewards[i] == "天兵") {
                this.rewards.children[i].active = true
                this.rewards.children[i].children[5].getComponent(Label).string = "天兵"
                this.rewards.children[i].children[1].active = true
            }else if (rewards[i] == "20") {
                this.rewards.children[i].active = true
                this.rewards.children[i].children[5].getComponent(Label).string = "20"
                this.rewards.children[i].children[2].active = true
            }
        }
    }
    // 跳过战斗
    async skipFight() {
        if (this.levelUp > 0) {
            this.FightMap.parent.getChildByName("levelUp")
                .getComponent(levelUp)
                .refresh(this.levelUp)
        }

        find('Canvas').getComponent(HomeCanvas).audioSource.play()
        this.FightMap.removeFromParent();
        this.FightMap.destroy();

    }
}

