import { _decorator, Component, Label, Node, Sprite } from 'cc';
import { EquipmentStateCreate } from '../game/fight/equipment/EquipmentState';
import { EquipmentEnum } from '../game/fight/equipment/EquipmentEnum';
import { loadSpriteFramesParallel } from '../util/ListLoader';
const { ccclass, property } = _decorator;

@ccclass('HolEqCharacterAvatar')
export class HolEqCharacterAvatar extends Component {

    @property(Node)
    AvatarNode: Node

    @property(Node)
    LegendBorderNode: Node

    @property(Node)
    BorderNode: Node



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
    @property(Node)
    eqType: Node
    iconMap: Record<number, string> = {
        0: '兵',
        1: '防',
        2: '宝',
        3: '法'
    };
    async setCharacter(create: EquipmentStateCreate) {
        console.log(create, '--- IGNORE ---')
        const meta = EquipmentEnum[create.id]
        // 并行预取本装备全部贴图（一次 IO 取代多处串行 await），后续填充顺序与原逻辑一致
        const avatarPath = `game/texture/frames/emp/${create.id.split('_')[0]}/spriteFrame`
        const pingzhiPath = create.star >= 3 ? `image/ui/pingzhi_0${create.star}/spriteFrame` : null
        const qualityPath = create.star < 4 ? `image/ui/card1/spriteFrame` : `image/ui/card2/spriteFrame`
        const bottomPath = create.star < 4 ? `image/ui/quality_01/spriteFrame` : `image/ui/quality_05/spriteFrame`
        const frames = await loadSpriteFramesParallel([avatarPath, pingzhiPath, qualityPath, bottomPath])
        this.AvatarNode.getComponent(Sprite).spriteFrame = frames.get(avatarPath) || null
        if (create.star < 4.5) {
            this.LegendBorderNode.active = false
        } else {
            this.LegendBorderNode.active = true
        }
        this.eqType.getComponent(Label).string = this.iconMap[create.eqType]
        this.Pingzhi.getComponent(Sprite).spriteFrame = pingzhiPath ? frames.get(pingzhiPath) || null : null
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
        } else {
            this.StackCount.getComponent(Label).string = null
        }
        this.Quality.getComponent(Sprite).spriteFrame = frames.get(qualityPath) || null
        this.Bottom.getComponent(Sprite).spriteFrame = frames.get(bottomPath) || null
        this.LvNode.getComponent(Label).string = 'Lv: ' + create.lv
        this.Name.getComponent(Label).string = create.name
        // 渲染星级
        this.Star.children.forEach(n => { n.active = false; if (n.children.length > 0) n.children[0].active = false; })

        for (let i = 0; i < create.star; i++) {
            this.Star.children[i].active = true
            if (i + 0.5 < create.star) {
                this.Star.children[i].children[0].active = true
            }
        }


    }

}

