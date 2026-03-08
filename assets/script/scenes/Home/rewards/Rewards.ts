import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { AudioMgr } from '../../../util/resource/AudioMgr';
import { util } from '../../../util/util';
import { CharacterEnum } from '../../../game/fight/character/CharacterEnum';
const { ccclass, property } = _decorator;

@ccclass('Rewards')
export class Rewards extends Component {
    @property(Node)
    itemNode: Node
    start() {
        AudioMgr.inst.playOneShot("sound/other/uplvlorpvelvl");
    }
    async read(rewards) {
        if (rewards) {
            this.itemNode.active = true
            for (var i = 0; i < rewards.length; i++) {
                this.itemNode.children[i].getChildByName("Label").getComponent(Label).string = rewards[i].rewardAmount
                if ("1" == rewards[i].rewardType) {
                    //钻石
                    this.itemNode.children[i].getChildByName("hero").getComponent(Sprite).spriteFrame =
                        await util.bundle.load('image/ui/icon_08/spriteFrame', SpriteFrame)
                } else if ("2" == rewards[i].rewardType) {
                    //金边
                    this.itemNode.children[i].getChildByName("hero").getComponent(Sprite).spriteFrame =
                        await util.bundle.load('image/ui/icon_22/spriteFrame', SpriteFrame)
                } else if ("3" == rewards[i].rewardType) {
                    //魂魄
                    this.itemNode.children[i].getChildByName("hero").getComponent(Sprite).spriteFrame =
                        await util.bundle.load('image/ui/qiu/spriteFrame', SpriteFrame)
                } else if ("4" == rewards[i].rewardType) {
                    //护法、装备
                    const meta = CharacterEnum[rewards[i].itemId]
                    this.itemNode.children[i].getChildByName("hero").getComponent(Sprite).spriteFrame =
                        await util.bundle.load('game/texture/frames/hero/Header/' + rewards[i].itemId + '/spriteFrame', SpriteFrame)
                    this.itemNode.children[i].getChildByName("Label").getComponent(Label).string = meta.name
                } else if ("6" == rewards[i].rewardType || "5" == rewards[i].rewardType) {
                    //材料
                    this.itemNode.children[i].getChildByName("hero").getComponent(Sprite).spriteFrame =
                        await util.bundle.load(rewards[i].img, SpriteFrame)
                    this.itemNode.children[i].getChildByName("Label").getComponent(Label).string = rewards[i].itemName
                }
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


