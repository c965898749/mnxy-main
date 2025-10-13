import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { CharacterStateCreate } from '../game/fight/character/CharacterState';
import { util } from '../util/util';
import { CharacterEnum } from '../game/fight/character/CharacterEnum';
const { ccclass, property } = _decorator;

@ccclass('HolCharacterAvatar')
export class HolCharacterAvatar extends Component {

    @property(Node)
    AvatarNode: Node

    @property(Node)
    LegendBorderNode: Node

    @property(Node)
    BorderNode: Node

    @property(Node)
    CampNode: Node

    @property(Node)
    LvNode: Node

    @property(Node)
    Name: Node

    @property(Node)
    Quality: Node

    @property(Node)
    Pingzhi: Node

    @property(Node)
    isBattle: Node
    @property(Node)
    Star: Node
    @property(Node)
    StackCount: Node

    @property(Node)
    Bottom: Node

    async setCharacter(create: CharacterStateCreate) {
        const meta = CharacterEnum[create.id]
        this.AvatarNode.getComponent(Sprite).spriteFrame =
            await util.bundle.load(meta.AvatarPath, SpriteFrame)
        if (create.star < 4.5) {
            this.LegendBorderNode.active = false
        } else {
            this.LegendBorderNode.active = true
        }
        if (create.star >=3) {
            this.Pingzhi.getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/ui/pingzhi_0${create.star}/spriteFrame`, SpriteFrame)
        } else {
            this.Pingzhi.getComponent(Sprite).spriteFrame =null
        }
        if (create.goIntoNum != 0) {
            this.isBattle.active = true
        } else {
            this.isBattle.active = false
        }
        if (create.stackCount != 0) {
            if (create.stackCount > 99) {
                this.StackCount.getComponent(Label).string = "+99"
            } else {
                this.StackCount.getComponent(Label).string = "+" + create.stackCount
            }

        }
        if (create.star < 4) {
            this.Quality.getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/ui/card1/spriteFrame`, SpriteFrame)
            this.Bottom.getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/ui/quality_01/spriteFrame`, SpriteFrame)
        } else {
            this.Quality.getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/ui/card2/spriteFrame`, SpriteFrame)
            this.Bottom.getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/ui/quality_05/spriteFrame`, SpriteFrame)

        }
        this.CampNode.getComponent(Sprite).spriteFrame =
            await util.bundle.load(`image/camp_icon/${meta.CharacterCamp}/spriteFrame`, SpriteFrame)
        this.LvNode.getComponent(Label).string = 'Lv: ' + create.lv
        this.Name.getComponent(Label).string = meta.name
        // 渲染星级
        this.Star.children.forEach(n => n.active = false)

        for (let i = 0; i < create.star; i++) {
            this.Star.children[i].active = true
            if (i + 0.5 < create.star) {
                this.Star.children[i].children[0].active = true
            }
        }


    }

}

