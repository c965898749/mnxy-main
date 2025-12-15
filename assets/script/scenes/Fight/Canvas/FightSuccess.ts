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
        if (rewards&&rewards.length>0) {
            for (var i = 0; i < rewards.length; i++) {
                let content = rewards[i]
                this.rewards.children[i].active = true
                this.rewards.children[i].getChildByName("Label").getComponent(Label).string = content.rewardAmount
                if ("1" == content.rewardType) {
                    //钻石
                    this.rewards.children[i].getChildByName("hero").getComponent(Sprite).spriteFrame =
                        await util.bundle.load('image/ui/icon_08/spriteFrame', SpriteFrame)
                } else if ("2" == content.rewardType) {
                    //金边
                    this.rewards.children[i].getChildByName("hero").getComponent(Sprite).spriteFrame =
                        await util.bundle.load('image/ui/icon_22/spriteFrame', SpriteFrame)
                } else if ("3" == content.rewardType) {
                    //魂魄
                    this.rewards.children[i].getChildByName("hero").getComponent(Sprite).spriteFrame =
                        await util.bundle.load('image/ui/qiu/spriteFrame', SpriteFrame)
                } else if ("4" == content.rewardType) {
                    //护法、装备
                    const meta = CharacterEnum[content.itemId]
                      this.rewards.children[i].getChildByName("hero").getComponent(Sprite).spriteFrame =
                    await util.bundle.load('game/texture/frames/hero/Header/' + content.itemId + '/spriteFrame', SpriteFrame)
                    this.rewards.children[i].getChildByName("Label").getComponent(Label).string = meta.name
                }
            }
        }else{
            this.node.getChildByName("reward").active=false
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

