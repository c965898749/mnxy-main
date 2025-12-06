import { _decorator, Component, director, find, Label, Node, Sprite, SpriteFrame } from 'cc';
import { HomeCanvas } from '../../Home/HomeCanvas';
import { levelUp } from '../../Home/Canvas/levelUp/levelUp';
import { ItemCtrl } from '../../Home/Canvas/Tiem/ItemCtrl';
import { AudioMgr } from '../../../util/resource/AudioMgr';
import { CharacterEnum } from '../../../game/fight/character/CharacterEnum';
import { util } from '../../../util/util';
const { ccclass, property } = _decorator;

@ccclass('FightSuccess')
export class FightSuccess extends Component {
    @property(Node)
    FightMap: Node
    @property(Node)
    rewards: Node
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
    update(deltaTime: number) {

    }
    refresh() {
        AudioMgr.inst.playOneShot("sound/fight/end/pkWin");
    }

    levelUp = 0

    async read(rewards, levelUp) {
        this.levelUp = levelUp
        if (rewards) {
            for (var i = 0; i < rewards.length; i++) {
                if (rewards[i] == "10000") {
                    this.rewards.children[i].active = true
                    this.rewards.children[i].getChildByName("Label").getComponent(Label).string = "10000"
                    this.rewards.children[i].getChildByName("19999").active = true
                } else if (rewards[i] == "3000") {
                    this.rewards.children[i].active = true
                    this.rewards.children[i].getChildByName("Label").getComponent(Label).string = "3000"
                    this.rewards.children[i].getChildByName("3000").active = true
                } else if (rewards[i] == "天兵") {
                    this.rewards.children[i].active = true
                    this.rewards.children[i].getChildByName("Label").getComponent(Label).string = "天兵"
                    this.rewards.children[i].getChildByName("tian").active = true
                } else if (rewards[i] == "20") {
                    this.rewards.children[i].active = true
                    this.rewards.children[i].getChildByName("Label").getComponent(Label).string = "20"
                    this.rewards.children[i].getChildByName("20").active = true
                } else {
                    this.rewards.children[i].active = true
                    const meta = CharacterEnum[rewards[i]]
                    this.rewards.children[i].getChildByName("hero").getComponent(Sprite).spriteFrame =
                        await util.bundle.load('game/texture/frames/hero/' + rewards[i] + '/spriteFrame', SpriteFrame)
                    this.rewards.children[i].getChildByName("Label").getComponent(Label).string = meta.name
                }
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

