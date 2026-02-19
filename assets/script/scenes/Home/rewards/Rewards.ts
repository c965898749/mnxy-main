import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { AudioMgr } from '../../../util/resource/AudioMgr';
import { util } from '../../../util/util';
import { CharacterEnum } from '../../../game/fight/character/CharacterEnum';
const { ccclass, property } = _decorator;

@ccclass('Rewards')
export class Rewards extends Component {
    @property(Node)
    rewards: Node
    start() {
        AudioMgr.inst.playOneShot("sound/other/uplvlorpvelvl");
    }
    async read(rewards) {
        if (rewards) {
            let content = rewards
            this.rewards.active = true
            this.rewards.getChildByName("Label").getComponent(Label).string = content.rewardAmount
            if ("1" == content.rewardType) {
                //钻石
                this.rewards.getChildByName("hero").getComponent(Sprite).spriteFrame =
                    await util.bundle.load('image/ui/icon_08/spriteFrame', SpriteFrame)
            } else if ("2" == content.rewardType) {
                //金边
                this.rewards.getChildByName("hero").getComponent(Sprite).spriteFrame =
                    await util.bundle.load('image/ui/icon_22/spriteFrame', SpriteFrame)
            } else if ("3" == content.rewardType) {
                //魂魄
                this.rewards.getChildByName("hero").getComponent(Sprite).spriteFrame =
                    await util.bundle.load('image/ui/qiu/spriteFrame', SpriteFrame)
            } else if ("4" == content.rewardType) {
                //护法、装备
                const meta = CharacterEnum[content.itemId]
                this.rewards.getChildByName("hero").getComponent(Sprite).spriteFrame =
                    await util.bundle.load('game/texture/frames/hero/Header/' + content.itemId + '/spriteFrame', SpriteFrame)
                this.rewards.getChildByName("Label").getComponent(Label).string = meta.name
            } else if ("6" == content.rewardType||"5" == content.rewardType) {
                //材料
                this.rewards.getChildByName("hero").getComponent(Sprite).spriteFrame =
                    await util.bundle.load(content.img, SpriteFrame)
                this.rewards.getChildByName("Label").getComponent(Label).string = content.itemName
            }
        } else {
            this.node.getChildByName("reward").active = false
        }
    }
    update(deltaTime: number) {

    }
    close() {
         this.node.destroy();
    }
}


