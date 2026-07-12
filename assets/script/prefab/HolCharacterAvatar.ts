import { _decorator, Color, Component, Label, Node, Sprite, SpriteFrame, UITransform, Vec2 } from 'cc';
import { CharacterStateCreate } from '../game/fight/character/CharacterState';
import { util } from '../util/util';
import { CharacterEnum } from '../game/fight/character/CharacterEnum';
const { ccclass, property } = _decorator;
enum Style { 纯色描边, 透明衰减, 明暗衰减 }
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
        var cc = [
            // 1. 普通（浅灰）- 与银白背景区分开，不泛白
            new Color(200, 200, 200, 200),
            // 2. 优秀（翠绿）- 高饱和绿，避开金/银色调
            new Color(0, 230, 0, 200),
            // 3. 稀有（宝蓝）- 深饱和蓝，对比金/银极强
            new Color(0, 100, 255, 200),
            // 4. 史诗（深紫）- 暗紫不反光，与金/银反差大
            new Color(120, 0, 220, 200),
            // 5. 传说（橙红）- 亮橙红，避开金色的黄调
            new Color(255, 80, 0, 200),
            // 6. 神器（正红）- 高饱和红，视觉冲击强
            new Color(255, 0, 0, 200),
            // 7. 传奇（亮金）- 比背景金更亮，加了红调区分
            new Color(255, 220, 30, 200),
            // 8. 幻彩（玫紫）- 高饱和玫红，不与金/银混淆
            new Color(230, 0, 200, 200),
            // 9. 暗金（古铜）- 深铜色，与亮金背景拉开层次
            new Color(180, 100, 0, 200),
            // 10. 神级（亮白）- 加了极浅蓝调，避开银白背景泛白
            new Color(255, 255, 255, 200),
            // 11. 冰晶（冰青）- 清冷浅青蓝，通透冷调
            new Color(80, 220, 240, 200),
            // 12. 幽翠（墨绿）- 暗调森林绿，沉稳高级
            new Color(0, 110, 60, 200),
            // 13. 琥珀（橘棕）- 暖调琥珀，区别橙红古铜
            new Color(240, 130, 20, 200),
            // 14. 星紫（薰衣草紫）- 浅柔紫，和深紫分层
            new Color(180, 100, 255, 200),
            // 15. 焰金（赤金）- 红调鎏金，区分亮金暗金
            new Color(255, 160, 40, 200),
            // 16. 苍蓝（深海蓝）- 暗藏青，比宝蓝更深沉
            new Color(0, 40, 160, 200),
            // 17. 桃绯（水蜜桃粉）- 柔和粉调，区别玫紫
            new Color(255, 100, 160, 200),
            // 18. 墨银（冷灰银）- 冷调深灰，区分浅普通灰
            new Color(130, 140, 160, 200),
            // 19. 碧玺（青柠绿）- 浅亮嫩绿，和翠绿分层
            new Color(100, 240, 80, 200),
            // 20. 曜黑（暗曜）- 深哑光黑，高对比稀有深色
            new Color(20, 20, 30, 200)
        ];
        const meta = CharacterEnum[create.id]
        this.AvatarNode.getComponent(Sprite).spriteFrame =
            await util.bundle.load(meta.AvatarPath, SpriteFrame)
        let material = this.AvatarNode.getComponent(Sprite).getMaterialInstance(0);
        if (create.flyup == 0) {
            material.setProperty('enable', 0);
        } else {
            material.setProperty('enable', 1);
            material.setProperty('outerActive', 1);
            material.setProperty('outerStyle', Style.透明衰减);
            material.setProperty('outerColor', cc[create.flyup - 1]);
            material?.setProperty('outerWidth', 0.5);
            material.setProperty('innerActive', 0);
            material.setProperty('brightness', 1);
            let ut = this.AvatarNode.getComponent(UITransform);
            material.setProperty('texSize', new Vec2(ut.width, ut.height));
            material.setProperty('centerScale', 1);
        }
        if (create.star < 4.5) {
            this.LegendBorderNode.active = false
        } else {
            this.LegendBorderNode.active = true
        }
        if (create.star >= 3) {
            this.Pingzhi.getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/ui/pingzhi_0${create.star}/spriteFrame`, SpriteFrame)
        } else {
            this.Pingzhi.getComponent(Sprite).spriteFrame = null
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
        } else {
            this.StackCount.getComponent(Label).string = null
        }
        if (create.star < 4) {
            this.Quality.getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/ui/card1/spriteFrame`, SpriteFrame)
            this.Bottom.getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/ui/quality_01/spriteFrame`, SpriteFrame)
        } else if (create.star >= 4) {
            this.Quality.getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/ui/card2/spriteFrame`, SpriteFrame)
            this.Bottom.getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/ui/quality_05/spriteFrame`, SpriteFrame)
        } else {
            this.Quality.getComponent(Sprite).spriteFrame = null
            this.Bottom.getComponent(Sprite).spriteFrame = null
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

