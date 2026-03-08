import { _decorator, Color, Component, Label, Node, Sprite, SpriteFrame, sp, UITransform, Vec2, Material } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { CharacterStateCreate } from 'db://assets/script/game/fight/character/CharacterState';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { SelectCardCtrl } from '../qianghua/SelectCardCtrl';
import { util } from 'db://assets/script/util/util';
import { questionCrtl } from '../questionCrtl/questionCrtl';
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
<size=20><color=#E0E0E0>
- 飞升需主卡达到满级
- 每次飞升：<color=#00FF99>+5 级</color>
- 总共飞升：<color=#00FF99>10 次</color>
- 第 1 次消耗：<color=#00FF99>1 个飞升丹</color>
- 递增规则：第 2 次开始，每次消耗 = 上一次 ×4
</color></size>

<size=22><color=#FFFFFF><b>飞升消耗明细</b></color></size>
<size=20><color=#E0E0E0>
飞升次数  等级提升  本次消耗飞升丹  累计消耗飞升丹
1    +5 级    1      1
2    +10 级    4      5
3    +15 级    16      21
4    +20 级    64      85
5    +25 级    256      341
6    +30 级    1024      1365
7    +35 级    4096      5461
8    +40 级    16384      21845
9    +45 级    65536      87381
10    +50 级    262144      349525
</color></size>

<size=22><color=#FFFFFF><b>总览</b></color></size>
<size=20><color=#E0E0E0>
- 满级一共提升：<color=#FFD700>+50 级</color>
- 飞升丹总消耗：<color=#FFD700>349525 个</color>
</size>`
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
  new Color(255, 255, 255, 200)
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
        fetch(config.ServerUrl.url + "/cardFlyUp", options)
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
                        this.gold.getComponent(Label).string = data.gold
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
  new Color(255, 255, 255, 200)

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
        fetch(config.ServerUrl.url + "/cardFlyUp2", options)
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


