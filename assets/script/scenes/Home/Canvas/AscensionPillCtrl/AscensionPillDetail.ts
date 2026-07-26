import { _decorator, Color, Component, Label, Node, Sprite, SpriteFrame, sp, UITransform, Vec2, Material } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { CharacterStateCreate } from 'db://assets/script/game/fight/character/CharacterState';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { SelectCardCtrl } from '../qianghua/SelectCardCtrl';
import { util } from 'db://assets/script/util/util';
import { questionCrtl } from '../questionCrtl/questionCrtl';
import { LCoin } from 'db://assets/script/common/common/Language';
const { ccclass, property } = _decorator;
enum Style { 纯色描边, 透明衰减, 明暗衰减 }
@ccclass('AscensionPillDetail')
export class AscensionPillDetail extends Component {
    @property(Node)
    zhuCard: Node
    @property(Node)
    gold
    @property(Node)
    result
    @property(Node)
    danyaoImg
    @property(Node)
    danyaoNum
    @property(Node)
    heade
    @property(Node)
    hearoNum
    material: Material = null;
    initialized = false;
    public _zhuId: string = null;
    public cahracterQueue: CharacterStateCreate[] = []
    start() {

    }

    update(deltaTime: number) {

    }
    async questry() {
let message = `<size=24><color=#FFD700><b>QQ神仙·飞升系统</b></color></size>

<size=22><color=#FFFFFF><b>基础规则</b></color></size>
<size=18><color=#E0E0E0>
- 飞升需主卡达到满级
- 每次飞升：<color=#00FF99>+5 级</color>
- 总共飞升：<color=#00FF99>20 次</color>
- 第 1 次消耗：<color=#00FF99>1 个飞升丹</color>
- 递增规则：第 2 次开始，每次消耗 = 上一次 ×3
</color></size>

<size=22><color=#FFFFFF><b>飞升消耗明细</b></size>
<size=16><color=#E0E0E0>
飞升境界　　等级提升　　本次飞升丹　　　累计飞升丹　　　消耗卡牌
炼气　　　　+5级　　　　1　　　　　　 　1　　　　　　　　1张
筑基　　　　+10级　　 　3　　　　　　 　4　　　　　　　　2张
结丹　　　　+15级　　 　9　　　　    　13　　　　  　　　3张
元婴　　　　+20级　　 　27　　　　 　　40　　　　  　　　4张
化神　　　　+25级　　 　81　　　　 　　121　　　　　　　 5张
炼虚　　　　+30级　　 　243　　　　  　364　　　　 　　　6张
合体　　　　+35级　　 　729　　　  　　1093　　　　  　　7张
大乘　　　　+40级　　 　2187　　　 　　3280　　　 　　 　8张
渡劫　　　　+45级　　 　6561　　　 　　9841　　　  　　　9张
地仙　　　　+50级　　 　19683　　　 　 29524　　  　　　10张
天仙　　　　+55级　　 　59049　　  　　88573　　  　　　11张
金仙　　　　+60级　　 　177147　　 　　265720　　　 　　12张
太乙　　　　+65级　　 　531441　　   　797161　　 　  　13张
大罗　　　　+70级　　 　1594323　　  　2391484　　  　　14张
仙王　　　　+75级　　 　4782969　 　 　7174453　　  　　15张
仙尊　　　　+80级　　 　14348907　   　21523360　   　　16张
仙帝　　　　+85级　　 　43046721　   　64570081　　   　17张
道君　　　　+90级　　 　129140163　  　193710244　 　 　18张
道圣　　　　+95级　　 　387420489　  　581130733　  　　19张
道祖　　　　+100级　 　 1162261467　 　1743392200　 　　20张
</color></size>

<size=22><color=#FFFFFF><b>总览</b></size>
<size=18><color=#E0E0E0>
- 20轮飞升满级一共提升：<color=#FFD700>+100 级</color>
- 飞升丹全部20次总消耗：<color=#FFD700>1743392200 个</color>
- 全套飞升累计消耗卡牌：<color=#FFD700>210 张</color>
</size>

<size=22><color=#FFFFFF><b>飞升额外加成规则</b></size>
<size=18><color=#E0E0E0>
- 每完成一轮飞升，卡牌全属性永久提升<color=#00FF99>3%</color>
- 境界达到地仙后解锁专属金色飞升边框
- 境界达到大罗后解锁专属动态流光特效
- 境界达到道祖解锁全服专属飞升播报
</color></size>`
        this.node.parent.getChildByName("questionCrtl")
            .getComponent(questionCrtl)
            .read(message)
    }

    async goBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }

    public async zhuSelectCard() {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        this.cahracterQueue = []
        this.cahracterQueue = config.userData.characters
        await this.render(this.cahracterQueue)
    }

    async render(characterQueue: CharacterStateCreate[]) {
        await this.node.parent.getChildByName("SelectCardCtrl")
            .getComponent(SelectCardCtrl)
            .render(characterQueue, async (c, n) => {
                n.active = false
                this.clickFun(c)
                return
            })
    }

    async clickFun(create) {
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
        this._zhuId = create.id
        AudioMgr.inst.playOneShot("sound/other/click");
        let $node = this.zhuCard.getChildByName("HeroCardItem");
        this.heade.getComponent(Sprite).spriteFrame =
            await util.bundle.load('game/texture/frames/hero/Header/' + create.id + '/spriteFrame', SpriteFrame)
        $node.getChildByName("heroMask").getChildByName("hero").getComponent(Sprite).spriteFrame =
            await util.bundle.load('game/texture/frames/hero/' + create.id + '/spriteFrame', SpriteFrame)
        this.material = $node.getChildByName("heroMask").getChildByName("hero").getComponent(Sprite).getMaterialInstance(0);
        if (create.flyup == 0) {
            this.material.setProperty('enable', 0);
        } else {
            this.material.setProperty('enable', 1);
            this.material.setProperty('outerActive', 1);
            this.material.setProperty('outerStyle', Style.透明衰减);
            this.material.setProperty('outerColor', cc[create.flyup - 1]);
            this.material?.setProperty('outerWidth', 0.5);
            this.material.setProperty('innerActive', 0);
            this.material.setProperty('brightness', 1);
            let ut = $node.getChildByName("heroMask").getChildByName("hero").getComponent(UITransform);
            this.material.setProperty('texSize', new Vec2(ut.width, ut.height));
            this.material.setProperty('centerScale', 1);
        }

        if (create.star < 4.5) {
            $node.getChildByName("LegendBorder").active = false
        } else {
            $node.getChildByName("LegendBorder").active = true
        }
        if (create.profession == '武圣') {
            this.danyaoImg.getComponent(Sprite).spriteFrame =
                await util.bundle.load('image/bagCrtl/10400028/spriteFrame', SpriteFrame)
        } else if (create.profession == '神将') {
            this.danyaoImg.getComponent(Sprite).spriteFrame =
                await util.bundle.load('image/bagCrtl/10400029/spriteFrame', SpriteFrame)
        } else if (create.profession == '仙灵') {
            this.danyaoImg.getComponent(Sprite).spriteFrame =
                await util.bundle.load('image/bagCrtl/10400027/spriteFrame', SpriteFrame)
        }
        // db://assets/resources/image/bagCrtl/10400027.png/spriteFrame
        if (create.star >= 3) {
            $node.getChildByName("ui_pinzhi").getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/ui/pingzhi_0${create.star}/spriteFrame`, SpriteFrame)
        } else {
            $node.getChildByName("ui_pinzhi").getComponent(Sprite).spriteFrame = null
        }
        if (create.star < 4) {
            $node.getChildByName("quality").getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/ui/card1/spriteFrame`, SpriteFrame)
            $node.getChildByName("bottom").getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/ui/quality_01/spriteFrame`, SpriteFrame)
        } else {
            $node.getChildByName("quality").getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/ui/card2/spriteFrame`, SpriteFrame)
            $node.getChildByName("bottom").getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/ui/quality_05/spriteFrame`, SpriteFrame)

        }
        $node.getChildByName("Camp").getComponent(Sprite).spriteFrame =
            await util.bundle.load(`image/camp_icon/${create.camp}/spriteFrame`, SpriteFrame)
        $node.getChildByName("LV").getComponent(Label).string = 'Lv: ' + create.lv
        $node.getChildByName("namebg").getChildByName("name_1001").getComponent(Label).string = create.name
        // 渲染星级
        $node.getChildByName("star").children.forEach(n => n.active = false)

        for (let i = 0; i < create.star; i++) {
            $node.getChildByName("star").children[i].active = true
            if (i + 0.5 < create.star) {
                $node.getChildByName("star").children[i].children[0].active = true
            }
        }
        this.initData()
        $node.active = true
    }

    async initData() {
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId,
            id: this._zhuId,
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "cardFlyUp", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    var data = data.data
                    if (data) {
                        this.danyaoNum.getComponent(Label).string = "X" + data.dangyaoTotal2 + "(" + data.dangyaoTotal + ")"
                        this.gold.getComponent(Label).string =  LCoin(data.gold)
                        this.hearoNum.getComponent(Label).string = "X" + data.cardTotal2 + "(" + data.cardTotal + ")"
                    } else {
                        this.danyaoNum.getComponent(Label).string = ""
                        this.gold.getComponent(Label).string = "0"
                        this.hearoNum.getComponent(Label).string = ""
                    }

                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                //console.error('There was a problem with the fetch operation:', error);
            }
            );
    }

    async flyUp() {
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
        if (!this._zhuId) {
            return await util.message.prompt({ message: "请请选择飞升主卡" })
        }
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId,
            id: this._zhuId,
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "cardFlyUp2", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    var data = data.data
                    AudioMgr.inst.playOneShot("sound/other/getcard");
                    let hut = this.zhuCard.getChildByName("HeroCardItem").getChildByName("flyup").getComponent(sp.Skeleton)
                    hut.node.active = true
                    hut.setAnimation(0, "animation", false)
                    hut.setCompleteListener(() => {
                        hut.node.active = false
                        let $node = this.zhuCard.getChildByName("HeroCardItem");
                        this.material.setProperty('enable', 1);
                        this.material.setProperty('outerActive', 1);
                        this.material.setProperty('outerStyle', Style.透明衰减);
                        this.material.setProperty('outerColor', cc[data.flyup - 1]);
                        this.material?.setProperty('outerWidth', 0.5);
                        this.material.setProperty('innerActive', 0);
                        this.material.setProperty('brightness', 1);
                        let ut = $node.getChildByName("heroMask").getChildByName("hero").getComponent(UITransform);
                        this.material.setProperty('texSize', new Vec2(ut.width, ut.height));
                        this.material.setProperty('centerScale', 1);
                    })
                    this.danyaoNum.getComponent(Label).string = "X" + data.dangyaoTotal2 + "(" + data.dangyaoTotal + ")"
                    this.gold.getComponent(Label).string = data.gold
                    this.hearoNum.getComponent(Label).string = "X" + data.cardTotal2 + "(" + data.cardTotal + ")"
                    var userInfo = data.userInfo;
                    config.userData.gold = userInfo.gold
                    config.userData.characters = userInfo.characterList
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                //console.error('There was a problem with the fetch operation:', error);
            }
            );

    }

}


