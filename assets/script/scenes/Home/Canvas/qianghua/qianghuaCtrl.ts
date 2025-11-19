import { _decorator, Component, sp, Node, Prefab, Sprite, Vec3, AudioSource, SpriteFrame, find, Label, ToggleComponent } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { SelectCardCtrl } from './SelectCardCtrl';
import { SelectCardCtrl2 } from './SelectCardCtrl2';
import { CharacterStateCreate } from 'db://assets/script/game/fight/character/CharacterState';
import { CharacterEnum } from 'db://assets/script/game/fight/character/CharacterEnum';
import { questionCrtl } from '../questionCrtl/questionCrtl';
import { LCoin } from 'db://assets/script/common/common/Language';
const { ccclass, property } = _decorator;

@ccclass('qianghuaCtrl')
export class qianghuaCtrl extends Component {
    @property(Node)
    zhuCard: Node
    @property(Node)
    congCard
    @property(Node)
    gold
    @property(Node)
    result
    initialized = false;
    public _ids = new Set();
    public _zhuId: string = null;
    public cahracterQueue: CharacterStateCreate[] = []
    public cahracterQueue2: CharacterStateCreate[] = []
    LevelUpResult = {
        finalLevel: 0,       // 最终等级
        remainingExp: 0,     // 当前等级的剩余经验
        totalSilverSpent: 0, // 升级消耗的总银两
        id: null, // 升级消耗的总银两
        str: null, // 升级消耗的总银两
        userId: null
    }
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
    refresh() {
        const config = getConfig()
        this.gold.getComponent(Label).string =LCoin(config.userData.gold)
    }


    update(deltaTime: number) {

    }

    public async zhuSelectCard() {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        this.cahracterQueue = []
        this.cahracterQueue = config.userData.characters
        if (this._ids.size > 0) {
            this.cahracterQueue = this.cahracterQueue.filter(x => !this._ids.has(x.id))
        }
        await this.render(this.cahracterQueue)
    }

    public async zhuSelectCard2() {
        AudioMgr.inst.playOneShot("sound/other/click");
        if (!this._zhuId) {
            return await util.message.prompt({ message: "请选择主卡！" })
        }

        const config = getConfig()
        this.cahracterQueue2 = []
        this.cahracterQueue2 = config.userData.characters
        this.cahracterQueue2 = this.cahracterQueue2.map(cahracter => {
            if (this._ids.has(cahracter.id)) {
                ////console.log(this._ids)
                // 复制原对象并修改status，避免直接修改原对象
                cahracter.isChecked = 1
            } else {
                cahracter.isChecked = 0
            }
            return cahracter
        });
        if (this._zhuId) {
            this.cahracterQueue2 = this.cahracterQueue2.filter(x => this._zhuId != x.id)
        }
        ////console.log(this.cahracterQueue2)
        await this.render2(this.cahracterQueue2)
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
    async render2(characterQueue: CharacterStateCreate[]) {
        await this.node.parent.getChildByName("SelectCardCtrl2")
            .getComponent(SelectCardCtrl2)
            .render(characterQueue, (c) => { this.congka(c) })
    }

    async congka(toggle: ToggleComponent) {

        var id = toggle.node.parent.getChildByName("id").getComponent(Label).string
        ////console.log(id, 33)
        var cong = toggle.node.parent.getChildByName("cong")
        if (toggle.isChecked) {
            this._ids.add(id)
            cong.active = true
        } else {
            this._ids = new Set([...this._ids].filter(num => num != id));
            cong.active = false
        }
        if (this._ids.size > 0) {
            this.congCard.getChildByName("main_bg").getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/qianghua/congCard/spriteFrame`, SpriteFrame)
            this.congCard.getChildByName("num").getComponent(Label).string = this._ids.size + ""

        } else {
            this.congCard.getChildByName("main_bg").getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/qianghua/congCard2/spriteFrame`, SpriteFrame)
            this.congCard.getChildByName("num").getComponent(Label).string = null

        }
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId,
            id: this._zhuId,
            str: Array.from(this._ids).join(',')
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/cardLevelUp", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    var data= data.data
                    if (data) {
                        this.LevelUpResult =data;
                        this.result.getComponent(Label).string = "升级后等级: " + data.finalLevel + "级, 当前等级剩余经验: " + data.remainingExp + ", 升级消耗总银两: " + data.totalSilverSpent
                    } else {
                        this.LevelUpResult = {
                            finalLevel: 0,       // 最终等级
                            remainingExp: 0,     // 当前等级的剩余经验
                            totalSilverSpent: 0, // 升级消耗的总银两
                            id:  this.LevelUpResult.id, // 升级消耗的总银两
                            str: null, // 升级消耗的总银两
                            userId: null
                        }
                        this.result.getComponent(Label).string = null
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

    async clickFun(create) {
        this._zhuId = create.id
        AudioMgr.inst.playOneShot("sound/other/click");
        let $node = this.zhuCard.getChildByName("HeroCardItem");
        $node.getChildByName("heroMask").getChildByName("hero").getComponent(Sprite).spriteFrame =
            await util.bundle.load('game/texture/frames/hero/' + create.id + '/spriteFrame', SpriteFrame)
        const meta = CharacterEnum[create.id]
        if (create.star < 4.5) {
            $node.getChildByName("LegendBorder").active = false
        } else {
            $node.getChildByName("LegendBorder").active = true
        }
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
            await util.bundle.load(`image/camp_icon/${meta.CharacterCamp}/spriteFrame`, SpriteFrame)
        $node.getChildByName("LV").getComponent(Label).string = 'Lv: ' + create.lv
        $node.getChildByName("namebg").getChildByName("name_1001").getComponent(Label).string = meta.name
        // 渲染星级
        $node.getChildByName("star").children.forEach(n => n.active = false)

        for (let i = 0; i < create.star; i++) {
            $node.getChildByName("star").children[i].active = true
            if (i + 0.5 < create.star) {
                $node.getChildByName("star").children[i].children[0].active = true
            }
        }
        $node.active = true
    }

    async questry() {
        var message = `<size=28><color=#FFD700>QQ卡牌升星经验与属性数据总表</color></size><br/>
<!-- 1星升星数据 -->
<size=24><color=#FFFFFF>一、升星类型：1星</color><br/>
<color=#E0E0E0>LV.1：</color><color=#00FFFF>升星经验5</color> | <color=#FF6B6B>银两消耗10</color> | <color=#4ECDC4>技能值15</color><br/>
<color=#E0E0E0>LV.2：</color><color=#00FFFF>升星经验5</color> | <color=#FF6B6B>银两消耗15</color> | <color=#4ECDC4>技能值25</color><br/>
<color=#E0E0E0>LV.3：</color><color=#00FFFF>升星经验7</color> | <color=#FF6B6B>银两消耗20</color> | <color=#4ECDC4>技能值31</color><br/>
<color=#E0E0E0>LV.4：</color><color=#00FFFF>升星经验8</color> | <color=#FF6B6B>银两消耗27</color> | <color=#4ECDC4>技能值39</color><br/>
<color=#E0E0E0>LV.5：</color><color=#00FFFF>升星经验10</color> | <color=#FF6B6B>银两消耗35</color> | <color=#4ECDC4>技能值51</color><br/><br/>

<!-- 1.5星升星数据 -->
<color=#FFFFFF>二、升星类型：1.5星</color><br/>
<color=#E0E0E0>LV.1：</color><color=#00FFFF>升星经验5</color> | <color=#FF6B6B>银两消耗20</color> | <color=#4ECDC4>技能值65</color><br/>
<color=#E0E0E0>LV.2：</color><color=#00FFFF>升星经验6</color> | <color=#FF6B6B>银两消耗25</color> | <color=#4ECDC4>技能值98</color><br/>
<color=#E0E0E0>LV.3：</color><color=#00FFFF>升星经验8</color> | <color=#FF6B6B>银两消耗31</color> | <color=#4ECDC4>技能值140</color><br/>
<color=#E0E0E0>LV.4：</color><color=#00FFFF>升星经验12</color> | <color=#FF6B6B>银两消耗39</color> | <color=#4ECDC4>技能值208</color><br/>
<color=#E0E0E0>LV.5：</color><color=#00FFFF>升星经验18</color> | <color=#FF6B6B>银两消耗51</color> | <color=#4ECDC4>技能值311</color><br/>
<color=#E0E0E0>LV.6：</color><color=#00FFFF>升星经验26</color> | <color=#FF6B6B>银两消耗69</color> | <color=#4ECDC4>技能值454</color><br/>
<color=#E0E0E0>LV.7：</color><color=#00FFFF>升星经验38</color> | <color=#FF6B6B>银两消耗95</color> | <color=#4ECDC4>技能值649</color><br/>
<color=#E0E0E0>LV.8：</color><color=#00FFFF>升星经验56</color> | <color=#FF6B6B>银两消耗133</color> | <color=#4ECDC4>技能值1022</color><br/>
<color=#E0E0E0>LV.9：</color><color=#00FFFF>升星经验76</color> | <color=#FF6B6B>银两消耗189</color> | <color=#4ECDC4>技能值1430</color><br/>
<color=#E0E0E0>LV.10：</color><color=#00FFFF>升星经验202</color> | <color=#FF6B6B>银两消耗265</color> | <color=#4ECDC4>技能值1950</color><br/>
<color=#E0E0E0>LV.11：</color><color=#00FFFF>升星经验253</color> | <color=#FF6B6B>银两消耗322</color> | <color=#4ECDC4>技能值400</color><br/>
<color=#E0E0E0>LV.12：</color><color=#00FFFF>升星经验322</color> | <color=#FF6B6B>银两消耗400</color> | <color=#4ECDC4>技能值444</color><br/>
<color=#E0E0E0>LV.13：</color><color=#00FFFF>升星经验400</color> | <color=#FF6B6B>银两消耗444</color> | <color=#4ECDC4>技能值677</color><br/>
<color=#E0E0E0>LV.14：</color><color=#00FFFF>升星经验444</color> | <color=#FF6B6B>银两消耗677</color> | <color=#4ECDC4>技能值757</color><br/>
<color=#E0E0E0>LV.15：</color><color=#00FFFF>升星经验685</color> | <color=#FF6B6B>银两消耗840</color> | <color=#4ECDC4>技能值927</color><br/>
<color=#E0E0E0>LV.16：</color><color=#00FFFF>升星经验927</color> | <color=#FF6B6B>银两消耗1014</color> | <color=#4ECDC4>技能值1104</color><br/>
<color=#E0E0E0>LV.17：</color><color=#00FFFF>升星经验1014</color> | <color=#FF6B6B>银两消耗1104</color> | <color=#4ECDC4>技能值1197</color><br/>
<color=#E0E0E0>LV.18：</color><color=#00FFFF>升星经验1104</color> | <color=#FF6B6B>银两消耗1197</color> | <color=#4ECDC4>技能值1318</color><br/>
<color=#E0E0E0>LV.19：</color><color=#00FFFF>升星经验1197</color> | <color=#FF6B6B>银两消耗1318</color> | <color=#4ECDC4>技能值1390</color><br/>
<color=#E0E0E0>LV.20：</color><color=#00FFFF>升星经验1397</color> | <color=#FF6B6B>银两消耗8486</color> | <color=#4ECDC4>技能值2210</color><br/><br/>

<!-- 2星升星数据 -->
<color=#FFFFFF>三、升星类型：2星</color><br/>
<color=#E0E0E0>LV.1：</color><color=#00FFFF>升星经验5</color> | <color=#FF6B6B>银两消耗30</color> | <color=#4ECDC4>技能值41</color><br/>
<color=#E0E0E0>LV.2：</color><color=#00FFFF>升星经验6</color> | <color=#FF6B6B>银两消耗35</color> | <color=#4ECDC4>技能值52</color><br/>
<color=#E0E0E0>LV.3：</color><color=#00FFFF>升星经验11</color> | <color=#FF6B6B>银两消耗41</color> | <color=#4ECDC4>技能值69</color><br/>
<color=#E0E0E0>LV.4：</color><color=#00FFFF>升星经验17</color> | <color=#FF6B6B>银两消耗52</color> | <color=#4ECDC4>技能值98</color><br/>
<color=#E0E0E0>LV.5：</color><color=#00FFFF>升星经验29</color> | <color=#FF6B6B>银两消耗69</color> | <color=#4ECDC4>技能值140</color><br/>
<color=#E0E0E0>LV.6：</color><color=#00FFFF>升星经验42</color> | <color=#FF6B6B>银两消耗98</color> | <color=#4ECDC4>技能值208</color><br/>
<color=#E0E0E0>LV.7：</color><color=#00FFFF>升星经验68</color> | <color=#FF6B6B>银两消耗140</color> | <color=#4ECDC4>技能值311</color><br/>
<color=#E0E0E0>LV.8：</color><color=#00FFFF>升星经验103</color> | <color=#FF6B6B>银两消耗208</color> | <color=#4ECDC4>技能值454</color><br/>
<color=#E0E0E0>LV.9：</color><color=#00FFFF>升星经验143</color> | <color=#FF6B6B>银两消耗311</color> | <color=#4ECDC4>技能值677</color><br/>
<color=#E0E0E0>LV.10：</color><color=#00FFFF>升星经验318</color> | <color=#FF6B6B>银两消耗454</color> | <color=#4ECDC4>技能值840</color><br/>
<color=#E0E0E0>LV.11：</color><color=#00FFFF>升星经验420</color> | <color=#FF6B6B>银两消耗677</color> | <color=#4ECDC4>技能值757</color><br/>
<color=#E0E0E0>LV.12：</color><color=#00FFFF>升星经验420</color> | <color=#FF6B6B>银两消耗757</color> | <color=#4ECDC4>技能值1010</color><br/>
<color=#E0E0E0>LV.13：</color><color=#00FFFF>升星经验677</color> | <color=#FF6B6B>银两消耗1010</color> | <color=#4ECDC4>技能值1318</color><br/>
<color=#E0E0E0>LV.14：</color><color=#00FFFF>升星经验757</color> | <color=#FF6B6B>银两消耗1318</color> | <color=#4ECDC4>技能值1624</color><br/>
<color=#E0E0E0>LV.15：</color><color=#00FFFF>升星经验842</color> | <color=#FF6B6B>银两消耗1624</color> | <color=#4ECDC4>技能值1970</color><br/>
<color=#E0E0E0>LV.16：</color><color=#00FFFF>升星经验927</color> | <color=#FF6B6B>银两消耗1970</color> | <color=#4ECDC4>技能值2244</color><br/>
<color=#E0E0E0>LV.17：</color><color=#00FFFF>升星经验1014</color> | <color=#FF6B6B>银两消耗2244</color> | <color=#4ECDC4>技能值2647</color><br/>
<color=#E0E0E0>LV.18：</color><color=#00FFFF>升星经验1104</color> | <color=#FF6B6B>银两消耗2647</color> | <color=#4ECDC4>技能值3040</color><br/>
<color=#E0E0E0>LV.19：</color><color=#00FFFF>升星经验1197</color> | <color=#FF6B6B>银两消耗3040</color> | <color=#4ECDC4>技能值3404</color><br/>
<color=#E0E0E0>LV.20：</color><color=#00FFFF>升星经验1397</color> | <color=#FF6B6B>银两消耗8486</color> | <color=#4ECDC4>技能值4210</color><br/><br/>

<!-- 2.5星升星数据 -->
<color=#FFFFFF>四、升星类型：2.5星</color><br/>
<color=#E0E0E0>LV.1：</color><color=#00FFFF>升星经验5</color> | <color=#FF6B6B>银两消耗40</color> | <color=#4ECDC4>技能值63</color><br/>
<color=#E0E0E0>LV.2：</color><color=#00FFFF>升星经验7</color> | <color=#FF6B6B>银两消耗45</color> | <color=#4ECDC4>技能值129</color><br/>
<color=#E0E0E0>LV.3：</color><color=#00FFFF>升星经验12</color> | <color=#FF6B6B>银两消耗52</color> | <color=#4ECDC4>技能值192</color><br/>
<color=#E0E0E0>LV.4：</color><color=#00FFFF>升星经验24</color> | <color=#FF6B6B>银两消耗64</color> | <color=#4ECDC4>技能值288</color><br/>
<color=#E0E0E0>LV.5：</color><color=#00FFFF>升星经验41</color> | <color=#FF6B6B>银两消耗88</color> | <color=#4ECDC4>技能值460</color><br/>
<color=#E0E0E0>LV.6：</color><color=#00FFFF>升星经验63</color> | <color=#FF6B6B>银两消耗129</color> | <color=#4ECDC4>技能值692</color><br/>
<color=#E0E0E0>LV.7：</color><color=#00FFFF>升星经验106</color> | <color=#FF6B6B>银两消耗192</color> | <color=#4ECDC4>技能值978</color><br/>
<color=#E0E0E0>LV.8：</color><color=#00FFFF>升星经验162</color> | <color=#FF6B6B>银两消耗288</color> | <color=#4ECDC4>技能值1450</color><br/>
<color=#E0E0E0>LV.9：</color><color=#00FFFF>升星经验232</color> | <color=#FF6B6B>银两消耗460</color> | <color=#4ECDC4>技能值2081</color><br/>
<color=#E0E0E0>LV.10：</color><color=#00FFFF>升星经验318</color> | <color=#FF6B6B>银两消耗692</color> | <color=#4ECDC4>技能值2988</color><br/>
<color=#E0E0E0>LV.11：</color><color=#00FFFF>升星经验420</color> | <color=#FF6B6B>银两消耗978</color> | <color=#4ECDC4>技能值3930</color><br/>
<color=#E0E0E0>LV.12：</color><color=#00FFFF>升星经验631</color> | <color=#FF6B6B>银两消耗1450</color> | <color=#4ECDC4>技能值5093</color><br/>
<color=#E0E0E0>LV.13：</color><color=#00FFFF>升星经验851</color> | <color=#FF6B6B>银两消耗2081</color> | <color=#4ECDC4>技能值6392</color><br/>
<color=#E0E0E0>LV.14：</color><color=#00FFFF>升星经验1165</color> | <color=#FF6B6B>银两消耗2988</color> | <color=#4ECDC4>技能值7831</color><br/>
<color=#E0E0E0>LV.15：</color><color=#00FFFF>升星经验1282</color> | <color=#FF6B6B>银两消耗3930</color> | <color=#4ECDC4>技能值9415</color><br/>
<color=#E0E0E0>LV.16：</color><color=#00FFFF>升星经验1399</color> | <color=#FF6B6B>银两消耗5093</color> | <color=#4ECDC4>技能值11150</color><br/>
<color=#E0E0E0>LV.17：</color><color=#00FFFF>升星经验1584</color> | <color=#FF6B6B>银两消耗6392</color> | <color=#4ECDC4>技能值13038</color><br/>
<color=#E0E0E0>LV.18：</color><color=#00FFFF>升星经验1735</color> | <color=#FF6B6B>银两消耗7831</color> | <color=#4ECDC4>技能值15086</color><br/>
<color=#E0E0E0>LV.19：</color><color=#00FFFF>升星经验1886</color> | <color=#FF6B6B>银两消耗9415</color> | <color=#4ECDC4>技能值17296</color><br/>
<color=#E0E0E0>LV.20：</color><color=#00FFFF>升星经验2048</color> | <color=#FF6B6B>银两消耗13038</color> | <color=#4ECDC4>技能值19673</color><br/>
<color=#E0E0E0>LV.21：</color><color=#00FFFF>升星经验2210</color> | <color=#FF6B6B>银两消耗15086</color> | <color=#4ECDC4>技能值22221</color><br/>
<color=#E0E0E0>LV.22：</color><color=#00FFFF>升星经验2377</color> | <color=#FF6B6B>银两消耗17296</color> | <color=#4ECDC4>技能值24943</color><br/>
<color=#E0E0E0>LV.23：</color><color=#00FFFF>升星经验2548</color> | <color=#FF6B6B>银两消耗19673</color> | <color=#4ECDC4>技能值27222</color><br/>
<color=#E0E0E0>LV.24：</color><color=#00FFFF>升星经验2722</color> | <color=#FF6B6B>银两消耗22221</color> | <color=#4ECDC4>技能值29943</color><br/>
<color=#E0E0E0>LV.25：</color><color=#00FFFF>升星经验2822</color> | <color=#FF6B6B>银两消耗24943</color> | <color=#4ECDC4>技能值32629</color><br/>
<color=#E0E0E0>LV.26：</color><color=#00FFFF>升星经验2922</color> | <color=#FF6B6B>银两消耗27222</color> | <color=#4ECDC4>技能值35265</color><br/>
<color=#E0E0E0>LV.27：</color><color=#00FFFF>升星经验3221</color> | <color=#FF6B6B>银两消耗29943</color> | <color=#4ECDC4>技能值38076</color><br/>
<color=#E0E0E0>LV.28：</color><color=#00FFFF>升星经验3526</color> | <color=#FF6B6B>银两消耗32629</color> | <color=#4ECDC4>技能值40716</color><br/>
<color=#E0E0E0>LV.29：</color><color=#00FFFF>升星经验3790</color> | <color=#FF6B6B>银两消耗35265</color> | <color=#4ECDC4>技能值43435</color><br/>
<color=#E0E0E0>LV.30：</color><color=#00FFFF>升星经验3926</color> | <color=#FF6B6B>银两消耗38076</color> | <color=#4ECDC4>技能值45267</color><br/>
<color=#E0E0E0>LV.31：</color><color=#00FFFF>升星经验4063</color> | <color=#FF6B6B>银两消耗40716</color> | <color=#4ECDC4>技能值48468</color><br/>
<color=#E0E0E0>LV.32：</color><color=#00FFFF>升星经验4343</color> | <color=#FF6B6B>银两消耗43435</color> | <color=#4ECDC4>技能值50435</color><br/>
<color=#E0E0E0>LV.33：</color><color=#00FFFF>升星经验4629</color> | <color=#FF6B6B>银两消耗45267</color> | <color=#4ECDC4>技能值53637</color><br/>
<color=#E0E0E0>LV.34：</color><color=#00FFFF>升星经验4922</color> | <color=#FF6B6B>银两消耗48468</color> | <color=#4ECDC4>技能值56593</color><br/>
<color=#E0E0E0>LV.35：</color><color=#00FFFF>升星经验5122</color> | <color=#FF6B6B>银两消耗50435</color> | <color=#4ECDC4>技能值61014</color><br/><br/>

<!-- 3星升星数据 -->
<color=#FFFFFF>五、升星类型：3星</color><br/>
<color=#E0E0E0>LV.1：</color><color=#00FFFF>升星经验5</color> | <color=#FF6B6B>银两消耗50</color> | <color=#4ECDC4>技能值1</color><br/>
<color=#E0E0E0>LV.2：</color><color=#00FFFF>升星经验7</color> | <color=#FF6B6B>银两消耗55</color> | <color=#4ECDC4>技能值1</color><br/>
<color=#E0E0E0>LV.3：</color><color=#00FFFF>升星经验16</color> | <color=#FF6B6B>银两消耗62</color> | <color=#4ECDC4>技能值2</color><br/>
<color=#E0E0E0>LV.4：</color><color=#00FFFF>升星经验30</color> | <color=#FF6B6B>银两消耗78</color> | <color=#4ECDC4>技能值2</color><br/>
<color=#E0E0E0>LV.5：</color><color=#00FFFF>升星经验55</color> | <color=#FF6B6B>银两消耗108</color> | <color=#4ECDC4>技能值2</color><br/>
<color=#E0E0E0>LV.6：</color><color=#00FFFF>升星经验88</color> | <color=#FF6B6B>银两消耗163</color> | <color=#4ECDC4>技能值2</color><br/>
<color=#E0E0E0>LV.7：</color><color=#00FFFF>升星经验151</color> | <color=#FF6B6B>银两消耗251</color> | <color=#4ECDC4>技能值2</color><br/>
<color=#E0E0E0>LV.8：</color><color=#00FFFF>升星经验234</color> | <color=#FF6B6B>银两消耗402</color> | <color=#4ECDC4>技能值3</color><br/>
<color=#E0E0E0>LV.9：</color><color=#00FFFF>升星经验342</color> | <color=#FF6B6B>银两消耗636</color> | <color=#4ECDC4>技能值3</color><br/>
<color=#E0E0E0>LV.10：</color><color=#00FFFF>升星经验472</color> | <color=#FF6B6B>银两消耗978</color> | <color=#4ECDC4>技能值3</color><br/>
<color=#E0E0E0>LV.11：</color><color=#00FFFF>升星经验631</color> | <color=#FF6B6B>银两消耗1450</color> | <color=#4ECDC4>技能值3</color><br/>
<color=#E0E0E0>LV.12：</color><color=#00FFFF>升星经验817</color> | <color=#FF6B6B>银两消耗2081</color> | <color=#4ECDC4>技能值3</color><br/>
<color=#E0E0E0>LV.13：</color><color=#00FFFF>升星经验1032</color> | <color=#FF6B6B>银两消耗2898</color> | <color=#4ECDC4>技能值4</color><br/>
<color=#E0E0E0>LV.14：</color><color=#00FFFF>升星经验1165</color> | <color=#FF6B6B>银两消耗3930</color> | <color=#4ECDC4>技能值4</color><br/>
<color=#E0E0E0>LV.15：</color><color=#00FFFF>升星经验1299</color> | <color=#FF6B6B>银两消耗5093</color> | <color=#4ECDC4>技能值4</color><br/>
<color=#E0E0E0>LV.16：</color><color=#00FFFF>升星经验1439</color> | <color=#FF6B6B>银两消耗6392</color> | <color=#4ECDC4>技能值4</color><br/>
<color=#E0E0E0>LV.17：</color><color=#00FFFF>升星经验1584</color> | <color=#FF6B6B>银两消耗7831</color> | <color=#4ECDC4>技能值5</color><br/>
<color=#E0E0E0>LV.18：</color><color=#00FFFF>升星经验1735</color> | <color=#FF6B6B>银两消耗9415</color> | <color=#4ECDC4>技能值5</color><br/>
<color=#E0E0E0>LV.19：</color><color=#00FFFF>升星经验1886</color> | <color=#FF6B6B>银两消耗11150</color> | <color=#4ECDC4>技能值5</color><br/>
<color=#E0E0E0>LV.20：</color><color=#00FFFF>升星经验2048</color> | <color=#FF6B6B>银两消耗13038</color> | <color=#4ECDC4>技能值5</color><br/>
<color=#E0E0E0>LV.21：</color><color=#00FFFF>升星经验2210</color> | <color=#FF6B6B>银两消耗15086</color> | <color=#4ECDC4>技能值5</color><br/>
<color=#E0E0E0>LV.22：</color><color=#00FFFF>升星经验2377</color> | <color=#FF6B6B>银两消耗17296</color> | <color=#4ECDC4>技能值5</color><br/>
<color=#E0E0E0>LV.23：</color><color=#00FFFF>升星经验2548</color> | <color=#FF6B6B>银两消耗19673</color> | <color=#4ECDC4>技能值6</color><br/>
<color=#E0E0E0>LV.24：</color><color=#00FFFF>升星经验2722</color> | <color=#FF6B6B>银两消耗22221</color> | <color=#4ECDC4>技能值6</color><br/>
<color=#E0E0E0>LV.25：</color><color=#00FFFF>升星经验2943</color> | <color=#FF6B6B>银两消耗24943</color> | <color=#4ECDC4>技能值6</color><br/>
<color=#E0E0E0>LV.26：</color><color=#00FFFF>升星经验2975</color> | <color=#FF6B6B>银两消耗27837</color> | <color=#4ECDC4>技能值6</color><br/>
<color=#E0E0E0>LV.27：</color><color=#00FFFF>升星经验3265</color> | <color=#FF6B6B>银两消耗30920</color> | <color=#4ECDC4>技能值6</color><br/>
<color=#E0E0E0>LV.28：</color><color=#00FFFF>升星经验3568</color> | <color=#FF6B6B>银两消耗34212</color> | <color=#4ECDC4>技能值7</color><br/>
<color=#E0E0E0>LV.29：</color><color=#00FFFF>升星经验3885</color> | <color=#FF6B6B>银两消耗37724</color> | <color=#4ECDC4>技能值7</color><br/>
<color=#E0E0E0>LV.30：</color><color=#00FFFF>升星经验4215</color> | <color=#FF6B6B>银两消耗41466</color> | <color=#4ECDC4>技能值7</color><br/>
<color=#E0E0E0>LV.31：</color><color=#00FFFF>升星经验4560</color> | <color=#FF6B6B>银两消耗45448</color> | <color=#4ECDC4>技能值7</color><br/>
<color=#E0E0E0>LV.32：</color><color=#00FFFF>升星经验4920</color> | <color=#FF6B6B>银两消耗49681</color> | <color=#4ECDC4>技能值8</color><br/>
<color=#E0E0E0>LV.33：</color><color=#00FFFF>升星经验5295</color> | <color=#FF6B6B>银两消耗54176</color> | <color=#4ECDC4>技能值8</color><br/>
<color=#E0E0E0>LV.34：</color><color=#00FFFF>升星经验5685</color> | <color=#FF6B6B>银两消耗58943</color> | <color=#4ECDC4>技能值8</color><br/>
<color=#E0E0E0>LV.35：</color><color=#00FFFF>升星经验6090</color> | <color=#FF6B6B>银两消耗63992</color> | <color=#4ECDC4>技能值8</color><br/>
<color=#E0E0E0>LV.36：</color><color=#00FFFF>升星经验6510</color> | <color=#FF6B6B>银两消耗69334</color> | <color=#4ECDC4>技能值9</color><br/>
<color=#E0E0E0>LV.37：</color><color=#00FFFF>升星经验6945</color> | <color=#FF6B6B>银两消耗74979</color> | <color=#4ECDC4>技能值9</color><br/>
<color=#E0E0E0>LV.38：</color><color=#00FFFF>升星经验7395</color> | <color=#FF6B6B>银两消耗80938</color> | <color=#4ECDC4>技能值9</color><br/>
<color=#E0E0E0>LV.39：</color><color=#00FFFF>升星经验7860</color> | <color=#FF6B6B>银两消耗87221</color> | <color=#4ECDC4>技能值9</color><br/>
<color=#E0E0E0>LV.40：</color><color=#00FFFF>升星经验8340</color> | <color=#FF6B6B>银两消耗93839</color> | <color=#4ECDC4>技能值10</color><br/>
<color=#E0E0E0>LV.41：</color><color=#00FFFF>升星经验8835</color> | <color=#FF6B6B>银两消耗100792</color> | <color=#4ECDC4>技能值10</color><br/>
<color=#E0E0E0>LV.42：</color><color=#00FFFF>升星经验9345</color> | <color=#FF6B6B>银两消耗108091</color> | <color=#4ECDC4>技能值10</color><br/>
<color=#E0E0E0>LV.43：</color><color=#00FFFF>升星经验9870</color> | <color=#FF6B6B>银两消耗115746</color> | <color=#4ECDC4>技能值10</color><br/>
<color=#E0E0E0>LV.44：</color><color=#00FFFF>升星经验10410</color> | <color=#FF6B6B>银两消耗123768</color> | <color=#4ECDC4>技能值11</color><br/>
<color=#E0E0E0>LV.45：</color><color=#00FFFF>升星经验10965</color> | <color=#FF6B6B>银两消耗132167</color> | <color=#4ECDC4>技能值11</color><br/>
<color=#E0E0E0>LV.46：</color><color=#00FFFF>升星经验11535</color> | <color=#FF6B6B>银两消耗140953</color> | <color=#4ECDC4>技能值11</color><br/>
<color=#E0E0E0>LV.47：</color><color=#00FFFF>升星经验12120</color> | <color=#FF6B6B>银两消耗150137</color> | <color=#4ECDC4>技能值11</color><br/>
<color=#E0E0E0>LV.48：</color><color=#00FFFF>升星经验12720</color> | <color=#FF6B6B>银两消耗159728</color> | <color=#4ECDC4>技能值12</color><br/>
<color=#E0E0E0>LV.49：</color><color=#00FFFF>升星经验13335</color> | <color=#FF6B6B>银两消耗169737</color> | <color=#4ECDC4>技能值12</color><br/>
<color=#E0E0E0>LV.50：</color><color=#00FFFF>升星经验13965</color> | <color=#FF6B6B>银两消耗180174</color> | <color=#4ECDC4>技能值12</color><br/><br/>

<!-- 3.5星升星数据 -->
<color=#FFFFFF>六、升星类型：3.5星</color><br/>
<color=#E0E0E0>LV.1：</color><color=#00FFFF>升星经验5</color> | <color=#FF6B6B>银两消耗60</color> | <color=#4ECDC4>技能值1</color><br/>
<color=#E0E0E0>LV.2：</color><color=#00FFFF>升星经验8</color> | <color=#FF6B6B>银两消耗65</color> | <color=#4ECDC4>技能值1</color><br/>
<color=#E0E0E0>LV.3：</color><color=#00FFFF>升星经验18</color> | <color=#FF6B6B>银两消耗73</color> | <color=#4ECDC4>技能值2</color><br/>
<color=#E0E0E0>LV.4：</color><color=#00FFFF>升星经验38</color> | <color=#FF6B6B>银两消耗91</color> | <color=#4ECDC4>技能值2</color><br/>
<color=#E0E0E0>LV.5：</color><color=#00FFFF>升星经验71</color> | <color=#FF6B6B>银两消耗129</color> | <color=#4ECDC4>技能值2</color><br/>
<color=#E0E0E0>LV.6：</color><color=#00FFFF>升星经验117</color> | <color=#FF6B6B>银两消耗200</color> | <color=#4ECDC4>技能值2</color><br/>
<color=#E0E0E0>LV.7：</color><color=#00FFFF>升星经验203</color> | <color=#FF6B6B>银两消耗317</color> | <color=#4ECDC4>技能值2</color><br/>
<color=#E0E0E0>LV.8：</color><color=#00FFFF>升星经验320</color> | <color=#FF6B6B>银两消耗520</color> | <color=#4ECDC4>技能值2</color><br/>
<color=#E0E0E0>LV.9：</color><color=#00FFFF>升星经验472</color> | <color=#FF6B6B>银两消耗840</color> | <color=#4ECDC4>技能值3</color><br/>
<color=#E0E0E0>LV.10：</color><color=#00FFFF>升星经验659</color> | <color=#FF6B6B>银两消耗1312</color> | <color=#4ECDC4>技能值3</color><br/>
<color=#E0E0E0>LV.11：</color><color=#00FFFF>升星经验886</color> | <color=#FF6B6B>银两消耗1971</color> | <color=#4ECDC4>技能值3</color><br/>
<color=#E0E0E0>LV.12：</color><color=#00FFFF>升星经验1157</color> | <color=#FF6B6B>银两消耗2857</color> | <color=#4ECDC4>技能值3</color><br/>
<color=#E0E0E0>LV.13：</color><color=#00FFFF>升星经验1471</color> | <color=#FF6B6B>银两消耗4014</color> | <color=#4ECDC4>技能值3</color><br/>
<color=#E0E0E0>LV.14：</color><color=#00FFFF>升星经验1666</color> | <color=#FF6B6B>银两消耗5485</color> | <color=#4ECDC4>技能值3</color><br/>
<color=#E0E0E0>LV.15：</color><color=#00FFFF>升星经验1871</color> | <color=#FF6B6B>银两消耗7151</color> | <color=#4ECDC4>技能值4</color><br/>
<color=#E0E0E0>LV.16：</color><color=#00FFFF>升星经验2084</color> | <color=#FF6B6B>银两消耗9022</color> | <color=#4ECDC4>技能值4</color><br/>
<color=#E0E0E0>LV.17：</color><color=#00FFFF>升星经验2303</color> | <color=#FF6B6B>银两消耗11106</color> | <color=#4ECDC4>技能值4</color><br/>
<color=#E0E0E0>LV.18：</color><color=#00FFFF>升星经验2553</color> | <color=#FF6B6B>银两消耗13411</color> | <color=#4ECDC4>技能值4</color><br/>
<color=#E0E0E0>LV.19：</color><color=#00FFFF>升星经验2771</color> | <color=#FF6B6B>银两消耗15944</color> | <color=#4ECDC4>技能值4</color><br/>
<color=#E0E0E0>LV.20：</color><color=#00FFFF>升星经验3014</color> | <color=#FF6B6B>银两消耗18715</color> | <color=#4ECDC4>技能值4</color><br/>
<color=#E0E0E0>LV.21：</color><color=#00FFFF>升星经验3266</color> | <color=#FF6B6B>银两消耗21729</color> | <color=#4ECDC4>技能值5</color><br/>
<color=#E0E0E0>LV.22：</color><color=#00FFFF>升星经验3525</color> | <color=#FF6B6B>银两消耗24995</color> | <color=#4ECDC4>技能值5</color><br/>
<color=#E0E0E0>LV.23：</color><color=#00FFFF>升星经验3790</color> | <color=#FF6B6B>银两消耗28520</color> | <color=#4ECDC4>技能值5</color><br/>
<color=#E0E0E0>LV.24：</color><color=#00FFFF>升星经验4063</color> | <color=#FF6B6B>银两消耗32310</color> | <color=#4ECDC4>技能值5</color><br/>
<color=#E0E0E0>LV.25：</color><color=#00FFFF>升星经验4343</color> | <color=#FF6B6B>银两消耗36373</color> | <color=#4ECDC4>技能值5</color><br/>
<color=#E0E0E0>LV.26：</color><color=#00FFFF>升星经验4629</color> | <color=#FF6B6B>银两消耗40716</color> | <color=#4ECDC4>技能值5</color><br/>
<color=#E0E0E0>LV.27：</color><color=#00FFFF>升星经验4922</color> | <color=#FF6B6B>银两消耗45345</color> | <color=#4ECDC4>技能值6</color><br/>
<color=#E0E0E0>LV.28：</color><color=#00FFFF>升星经验5221</color> | <color=#FF6B6B>银两消耗50267</color> | <color=#4ECDC4>技能值6</color><br/>
<color=#E0E0E0>LV.29：</color><color=#00FFFF>升星经验5526</color> | <color=#FF6B6B>银两消耗55488</color> | <color=#4ECDC4>技能值6</color><br/>
<color=#E0E0E0>LV.30：</color><color=#00FFFF>升星经验6114</color> | <color=#FF6B6B>银两消耗61014</color> | <color=#4ECDC4>技能值6</color><br/>
<color=#E0E0E0>LV.31：</color><color=#00FFFF>升星经验6407</color> | <color=#FF6B6B>银两消耗67015</color> | <color=#4ECDC4>技能值6</color><br/>
<color=#E0E0E0>LV.32：</color><color=#00FFFF>升星经验6793</color> | <color=#FF6B6B>银两消耗73417</color> | <color=#4ECDC4>技能值6</color><br/>
<color=#E0E0E0>LV.33：</color><color=#00FFFF>升星经验7190</color> | <color=#FF6B6B>银两消耗80239</color> | <color=#4ECDC4>技能值7</color><br/>
<color=#E0E0E0>LV.34：</color><color=#00FFFF>升星经验7598</color> | <color=#FF6B6B>银两消耗87492</color> | <color=#4ECDC4>技能值7</color><br/>
<color=#E0E0E0>LV.35：</color><color=#00FFFF>升星经验8017</color> | <color=#FF6B6B>银两消耗95187</color> | <color=#4ECDC4>技能值7</color><br/>
<color=#E0E0E0>LV.36：</color><color=#00FFFF>升星经验8447</color> | <color=#FF6B6B>银两消耗103335</color> | <color=#4ECDC4>技能值7</color><br/>
<color=#E0E0E0>LV.37：</color><color=#00FFFF>升星经验8888</color> | <color=#FF6B6B>银两消耗111947</color> | <color=#4ECDC4>技能值8</color><br/>
<color=#E0E0E0>LV.38：</color><color=#00FFFF>升星经验9340</color> | <color=#FF6B6B>银两消耗121034</color> | <color=#4ECDC4>技能值8</color><br/>
<color=#E0E0E0>LV.39：</color><color=#00FFFF>升星经验9803</color> | <color=#FF6B6B>银两消耗130607</color> | <color=#4ECDC4>技能值8</color><br/>
<color=#E0E0E0>LV.40：</color><color=#00FFFF>升星经验10277</color> | <color=#FF6B6B>银两消耗140676</color> | <color=#4ECDC4>技能值8</color><br/>
<color=#E0E0E0>LV.41：</color><color=#00FFFF>升星经验10762</color> | <color=#FF6B6B>银两消耗151252</color> | <color=#4ECDC4>技能值9</color><br/>
<color=#E0E0E0>LV.42：</color><color=#00FFFF>升星经验11258</color> | <color=#FF6B6B>银两消耗162346</color> | <color=#4ECDC4>技能值9</color><br/>
<color=#E0E0E0>LV.43：</color><color=#00FFFF>升星经验11765</color> | <color=#FF6B6B>银两消耗173968</color> | <color=#4ECDC4>技能值9</color><br/>
<color=#E0E0E0>LV.44：</color><color=#00FFFF>升星经验12283</color> | <color=#FF6B6B>银两消耗186129</color> | <color=#4ECDC4>技能值9</color><br/>
<color=#E0E0E0>LV.45：</color><color=#00FFFF>升星经验12812</color> | <color=#FF6B6B>银两消耗198840</color> | <color=#4ECDC4>技能值10</color><br/>
<color=#E0E0E0>LV.46：</color><color=#00FFFF>升星经验13352</color> | <color=#FF6B6B>银两消耗212111</color> | <color=#4ECDC4>技能值10</color><br/>
<color=#E0E0E0>LV.47：</color><color=#00FFFF>升星经验13903</color> | <color=#FF6B6B>银两消耗225953</color> | <color=#4ECDC4>技能值10</color><br/>
<color=#E0E0E0>LV.48：</color><color=#00FFFF>升星经验14465</color> | <color=#FF6B6B>银两消耗240377</color> | <color=#4ECDC4>技能值10</color><br/>
<color=#E0E0E0>LV.49：</color><color=#00FFFF>升星经验15038</color> | <color=#FF6B6B>银两消耗255393</color> | <color=#4ECDC4>技能值11</color><br/>
<color=#E0E0E0>LV.50：</color><color=#00FFFF>升星经验15622</color> | <color=#FF6B6B>银两消耗271012</color> | <color=#4ECDC4>技能值11</color><br/><br/>

<!-- 4星升星数据 -->
<color=#FFFFFF>七、升星类型：4星</color><br/>
<color=#E0E0E0>LV.1：</color><color=#00FFFF>升星经验5</color> | <color=#FF6B6B>银两消耗70</color> | <color=#4ECDC4>技能值100</color><br/>
<color=#E0E0E0>LV.2：</color><color=#00FFFF>升星经验8</color> | <color=#FF6B6B>银两消耗75</color> | <color=#4ECDC4>技能值100</color><br/>
<color=#E0E0E0>LV.3：</color><color=#00FFFF>升星经验21</color> | <color=#FF6B6B>银两消耗83</color> | <color=#4ECDC4>技能值200</color><br/>
<color=#E0E0E0>LV.4：</color><color=#00FFFF>升星经验47</color> | <color=#FF6B6B>银两消耗104</color> | <color=#4ECDC4>技能值200</color><br/>
<color=#E0E0E0>LV.5：</color><color=#00FFFF>升星经验88</color> | <color=#FF6B6B>银两消耗151</color> | <color=#4ECDC4>技能值210</color><br/>
<color=#E0E0E0>LV.6：</color><color=#00FFFF>升星经验149</color> | <color=#FF6B6B>银两消耗239</color> | <color=#4ECDC4>技能值210</color><br/>
<color=#E0E0E0>LV.7：</color><color=#00FFFF>升星经验263</color> | <color=#FF6B6B>银两消耗388</color> | <color=#4ECDC4>技能值211</color><br/>
<color=#E0E0E0>LV.8：</color><color=#00FFFF>升星经验420</color> | <color=#FF6B6B>银两消耗651</color> | <color=#4ECDC4>技能值211</color><br/>
<color=#E0E0E0>LV.9：</color><color=#00FFFF>升星经验623</color> | <color=#FF6B6B>银两消耗1071</color> | <color=#4ECDC4>技能值211</color><br/>
<color=#E0E0E0>LV.10：</color><color=#00FFFF>升星经验879</color> | <color=#FF6B6B>银两消耗1694</color> | <color=#4ECDC4>技能值311</color><br/>
<color=#E0E0E0>LV.11：</color><color=#00FFFF>升星经验1190</color> | <color=#FF6B6B>银两消耗2573</color> | <color=#4ECDC4>技能值311</color><br/>
<color=#E0E0E0>LV.12：</color><color=#00FFFF>升星经验1562</color> | <color=#FF6B6B>银两消耗3763</color> | <color=#4ECDC4>技能值321</color><br/>
<color=#E0E0E0>LV.13：</color><color=#00FFFF>升星经验1997</color> | <color=#FF6B6B>银两消耗5325</color> | <color=#4ECDC4>技能值321</color><br/>
<color=#E0E0E0>LV.14：</color><color=#00FFFF>升星经验2275</color> | <color=#FF6B6B>银两消耗7322</color> | <color=#4ECDC4>技能值322</color><br/>
<color=#E0E0E0>LV.15：</color><color=#00FFFF>升星经验2566</color> | <color=#FF6B6B>银两消耗9597</color> | <color=#4ECDC4>技能值322</color><br/>
<color=#E0E0E0>LV.16：</color><color=#00FFFF>升星经验2869</color> | <color=#FF6B6B>银两消耗12163</color> | <color=#4ECDC4>技能值322</color><br/>
<color=#E0E0E0>LV.17：</color><color=#00FFFF>升星经验3187</color> | <color=#FF6B6B>银两消耗15032</color> | <color=#4ECDC4>技能值422</color><br/>
<color=#E0E0E0>LV.18：</color><color=#00FFFF>升星经验3517</color> | <color=#FF6B6B>银两消耗18219</color> | <color=#4ECDC4>技能值422</color><br/>
<color=#E0E0E0>LV.19：</color><color=#00FFFF>升星经验3858</color> | <color=#FF6B6B>银两消耗21736</color> | <color=#4ECDC4>技能值432</color><br/>
<color=#E0E0E0>LV.20：</color><color=#00FFFF>升星经验4213</color> | <color=#FF6B6B>银两消耗25594</color> | <color=#4ECDC4>技能值432</color><br/>
<color=#E0E0E0>LV.21：</color><color=#00FFFF>升星经验4579</color> | <color=#FF6B6B>银两消耗29807</color> | <color=#4ECDC4>技能值433</color><br/>
<color=#E0E0E0>LV.22：</color><color=#00FFFF>升星经验4957</color> | <color=#FF6B6B>银两消耗34386</color> | <color=#4ECDC4>技能值433</color><br/>
<color=#E0E0E0>LV.23：</color><color=#00FFFF>升星经验5346</color> | <color=#FF6B6B>银两消耗39343</color> | <color=#4ECDC4>技能值433</color><br/>
<color=#E0E0E0>LV.24：</color><color=#00FFFF>升星经验5746</color> | <color=#FF6B6B>银两消耗44689</color> | <color=#4ECDC4>技能值533</color><br/>
<color=#E0E0E0>LV.25：</color><color=#00FFFF>升星经验6158</color> | <color=#FF6B6B>银两消耗50435</color> | <color=#4ECDC4>技能值533</color><br/>
<color=#E0E0E0>LV.26：</color><color=#00FFFF>升星经验6581</color> | <color=#FF6B6B>银两消耗56593</color> | <color=#4ECDC4>技能值543</color><br/>
<color=#E0E0E0>LV.27：</color><color=#00FFFF>升星经验7013</color> | <color=#FF6B6B>银两消耗63174</color> | <color=#4ECDC4>技能值543</color><br/>
<color=#E0E0E0>LV.28：</color><color=#00FFFF>升星经验7458</color> | <color=#FF6B6B>银两消耗70187</color> | <color=#4ECDC4>技能值544</color><br/>
<color=#E0E0E0>LV.29：</color><color=#00FFFF>升星经验7911</color> | <color=#FF6B6B>银两消耗77645</color> | <color=#4ECDC4>技能值544</color><br/>
<color=#E0E0E0>LV.30：</color><color=#00FFFF>升星经验8376</color> | <color=#FF6B6B>银两消耗85556</color> | <color=#4ECDC4>技能值544</color><br/>
<color=#E0E0E0>LV.31：</color><color=#00FFFF>升星经验8850</color> | <color=#FF6B6B>银两消耗93932</color> | <color=#4ECDC4>技能值644</color><br/>
<color=#E0E0E0>LV.32：</color><color=#00FFFF>升星经验9335</color> | <color=#FF6B6B>银两消耗102782</color> | <color=#4ECDC4>技能值644</color><br/>
<color=#E0E0E0>LV.33：</color><color=#00FFFF>升星经验9830</color> | <color=#FF6B6B>银两消耗112117</color> | <color=#4ECDC4>技能值654</color><br/>
<color=#E0E0E0>LV.34：</color><color=#00FFFF>升星经验10333</color> | <color=#FF6B6B>银两消耗121947</color> | <color=#4ECDC4>技能值654</color><br/>
<color=#E0E0E0>LV.35：</color><color=#00FFFF>升星经验10480</color> | <color=#FF6B6B>银两消耗132280</color> | <color=#4ECDC4>技能值655</color><br/>
<color=#E0E0E0>LV.36：</color><color=#00FFFF>升星经验10846</color> | <color=#FF6B6B>银两消耗142704</color> | <color=#4ECDC4>技能值655</color><br/>
<color=#E0E0E0>LV.37：</color><color=#00FFFF>升星经验11368</color> | <color=#FF6B6B>银两消耗153764</color> | <color=#4ECDC4>技能值655</color><br/>
<color=#E0E0E0>LV.38：</color><color=#00FFFF>升星经验11901</color> | <color=#FF6B6B>银两消耗165340</color> | <color=#4ECDC4>技能值665</color><br/>
<color=#E0E0E0>LV.39：</color><color=#00FFFF>升星经验12445</color> | <color=#FF6B6B>银两消耗177443</color> | <color=#4ECDC4>技能值665</color><br/>
<color=#E0E0E0>LV.40：</color><color=#00FFFF>升星经验13000</color> | <color=#FF6B6B>银两消耗190084</color> | <color=#4ECDC4>技能值665</color><br/>
<color=#E0E0E0>LV.41：</color><color=#00FFFF>升星经验13566</color> | <color=#FF6B6B>银两消耗203273</color> | <color=#4ECDC4>技能值675</color><br/>
<color=#E0E0E0>LV.42：</color><color=#00FFFF>升星经验14143</color> | <color=#FF6B6B>银两消耗217021</color> | <color=#4ECDC4>技能值675</color><br/>
<color=#E0E0E0>LV.43：</color><color=#00FFFF>升星经验14731</color> | <color=#FF6B6B>银两消耗231339</color> | <color=#4ECDC4>技能值675</color><br/>
<color=#E0E0E0>LV.44：</color><color=#00FFFF>升星经验15330</color> | <color=#FF6B6B>银两消耗246236</color> | <color=#4ECDC4>技能值685</color><br/>
<color=#E0E0E0>LV.45：</color><color=#00FFFF>升星经验15940</color> | <color=#FF6B6B>银两消耗261723</color> | <color=#4ECDC4>技能值685</color><br/>
<color=#E0E0E0>LV.46：</color><color=#00FFFF>升星经验16561</color> | <color=#FF6B6B>银两消耗277811</color> | <color=#4ECDC4>技能值685</color><br/>
<color=#E0E0E0>LV.47：</color><color=#00FFFF>升星经验17193</color> | <color=#FF6B6B>银两消耗294510</color> | <color=#4ECDC4>技能值695</color><br/>
<color=#E0E0E0>LV.48：</color><color=#00FFFF>升星经验17836</color> | <color=#FF6B6B>银两消耗311831</color> | <color=#4ECDC4>技能值695</color><br/>
<color=#E0E0E0>LV.49：</color><color=#00FFFF>升星经验18490</color> | <color=#FF6B6B>银两消耗329784</color> | <color=#4ECDC4>技能值695</color><br/>
<color=#E0E0E0>LV.50：</color><color=#00FFFF>升星经验19155</color> | <color=#FF6B6B>银两消耗348380</color> | <color=#4ECDC4>技能值705</color><br/>
<!-- 4.5星升星数据 -->
<color=#FFFFFF>八、升星类型：4.5星</color><br/>
<color=#E0E0E0>LV.1：</color><color=#00FFFF>升星经验5</color> | <color=#FF6B6B>银两消耗105</color> | <color=#4ECDC4>技能值150</color><br/>
<color=#E0E0E0>LV.2：</color><color=#00FFFF>升星经验12</color> | <color=#FF6B6B>银两消耗113</color> | <color=#4ECDC4>技能值150</color><br/>
<color=#E0E0E0>LV.3：</color><color=#00FFFF>升星经验32</color> | <color=#FF6B6B>银两消耗125</color> | <color=#4ECDC4>技能值300</color><br/>
<color=#E0E0E0>LV.4：</color><color=#00FFFF>升星经验71</color> | <color=#FF6B6B>银两消耗156</color> | <color=#4ECDC4>技能值300</color><br/>
<color=#E0E0E0>LV.5：</color><color=#00FFFF>升星经验132</color> | <color=#FF6B6B>银两消耗227</color> | <color=#4ECDC4>技能值315</color><br/>
<color=#E0E0E0>LV.6：</color><color=#00FFFF>升星经验224</color> | <color=#FF6B6B>银两消耗359</color> | <color=#4ECDC4>技能值315</color><br/>
<color=#E0E0E0>LV.7：</color><color=#00FFFF>升星经验395</color> | <color=#FF6B6B>银两消耗582</color> | <color=#4ECDC4>技能值317</color><br/>
<color=#E0E0E0>LV.8：</color><color=#00FFFF>升星经验630</color> | <color=#FF6B6B>银两消耗977</color> | <color=#4ECDC4>技能值317</color><br/>
<color=#E0E0E0>LV.9：</color><color=#00FFFF>升星经验935</color> | <color=#FF6B6B>银两消耗1607</color> | <color=#4ECDC4>技能值317</color><br/>
<color=#E0E0E0>LV.10：</color><color=#00FFFF>升星经验1319</color> | <color=#FF6B6B>银两消耗2541</color> | <color=#4ECDC4>技能值467</color><br/>
<color=#E0E0E0>LV.11：</color><color=#00FFFF>升星经验1785</color> | <color=#FF6B6B>银两消耗3860</color> | <color=#4ECDC4>技能值467</color><br/>
<color=#E0E0E0>LV.12：</color><color=#00FFFF>升星经验2343</color> | <color=#FF6B6B>银两消耗5645</color> | <color=#4ECDC4>技能值482</color><br/>
<color=#E0E0E0>LV.13：</color><color=#00FFFF>升星经验2996</color> | <color=#FF6B6B>银两消耗7988</color> | <color=#4ECDC4>技能值482</color><br/>
<color=#E0E0E0>LV.14：</color><color=#00FFFF>升星经验3413</color> | <color=#FF6B6B>银两消耗10983</color> | <color=#4ECDC4>技能值483</color><br/>
<color=#E0E0E0>LV.15：</color><color=#00FFFF>升星经验3849</color> | <color=#FF6B6B>银两消耗14396</color> | <color=#4ECDC4>技能值483</color><br/>
<color=#E0E0E0>LV.16：</color><color=#00FFFF>升星经验4304</color> | <color=#FF6B6B>银两消耗18245</color> | <color=#4ECDC4>技能值483</color><br/>
<color=#E0E0E0>LV.17：</color><color=#00FFFF>升星经验4781</color> | <color=#FF6B6B>银两消耗22548</color> | <color=#4ECDC4>技能值633</color><br/>
<color=#E0E0E0>LV.18：</color><color=#00FFFF>升星经验5276</color> | <color=#FF6B6B>银两消耗27329</color> | <color=#4ECDC4>技能值633</color><br/>
<color=#E0E0E0>LV.19：</color><color=#00FFFF>升星经验5787</color> | <color=#FF6B6B>银两消耗32604</color> | <color=#4ECDC4>技能值648</color><br/>
<color=#E0E0E0>LV.20：</color><color=#00FFFF>升星经验6320</color> | <color=#FF6B6B>银两消耗38391</color> | <color=#4ECDC4>技能值648</color><br/>
<color=#E0E0E0>LV.21：</color><color=#00FFFF>升星经验6869</color> | <color=#FF6B6B>银两消耗44711</color> | <color=#4ECDC4>技能值649</color><br/>
<color=#E0E0E0>LV.22：</color><color=#00FFFF>升星经验7436</color> | <color=#FF6B6B>银两消耗51579</color> | <color=#4ECDC4>技能值649</color><br/>
<color=#E0E0E0>LV.23：</color><color=#00FFFF>升星经验8019</color> | <color=#FF6B6B>银两消耗59015</color> | <color=#4ECDC4>技能值649</color><br/>
<color=#E0E0E0>LV.24：</color><color=#00FFFF>升星经验8619</color> | <color=#FF6B6B>银两消耗67034</color> | <color=#4ECDC4>技能值799</color><br/>
<color=#E0E0E0>LV.25：</color><color=#00FFFF>升星经验9237</color> | <color=#FF6B6B>银两消耗75653</color> | <color=#4ECDC4>技能值799</color><br/>
<color=#E0E0E0>LV.26：</color><color=#00FFFF>升星经验9872</color> | <color=#FF6B6B>银两消耗84890</color> | <color=#4ECDC4>技能值815</color><br/>
<color=#E0E0E0>LV.27：</color><color=#00FFFF>升星经验10520</color> | <color=#FF6B6B>银两消耗94761</color> | <color=#4ECDC4>技能值815</color><br/>
<color=#E0E0E0>LV.28：</color><color=#00FFFF>升星经验11187</color> | <color=#FF6B6B>银两消耗105281</color> | <color=#4ECDC4>技能值816</color><br/>
<color=#E0E0E0>LV.29：</color><color=#00FFFF>升星经验11867</color> | <color=#FF6B6B>银两消耗116468</color> | <color=#4ECDC4>技能值816</color><br/>
<color=#E0E0E0>LV.30：</color><color=#00FFFF>升星经验12564</color> | <color=#FF6B6B>银两消耗128334</color> | <color=#4ECDC4>技能值816</color><br/>
<color=#E0E0E0>LV.31：</color><color=#00FFFF>升星经验13275</color> | <color=#FF6B6B>银两消耗140898</color> | <color=#4ECDC4>技能值966</color><br/>
<color=#E0E0E0>LV.32：</color><color=#00FFFF>升星经验14003</color> | <color=#FF6B6B>银两消耗154173</color> | <color=#4ECDC4>技能值966</color><br/>
<color=#E0E0E0>LV.33：</color><color=#00FFFF>升星经验14745</color> | <color=#FF6B6B>银两消耗168176</color> | <color=#4ECDC4>技能值981</color><br/>
<color=#E0E0E0>LV.34：</color><color=#00FFFF>升星经验15499</color> | <color=#FF6B6B>银两消耗182921</color> | <color=#4ECDC4>技能值981</color><br/>
<color=#E0E0E0>LV.35：</color><color=#00FFFF>升星经验16269</color> | <color=#FF6B6B>银两消耗198420</color> | <color=#4ECDC4>技能值983</color><br/>
<color=#E0E0E0>LV.36：</color><color=#00FFFF>升星经验17055</color> | <color=#FF6B6B>银两消耗214705</color> | <color=#4ECDC4>技能值983</color><br/>
<color=#E0E0E0>LV.37：</color><color=#00FFFF>升星经验17858</color> | <color=#FF6B6B>银两消耗231801</color> | <color=#4ECDC4>技能值998</color><br/>
<color=#E0E0E0>LV.38：</color><color=#00FFFF>升星经验18678</color> | <color=#FF6B6B>银两消耗249745</color> | <color=#4ECDC4>技能值998</color><br/>
<color=#E0E0E0>LV.39：</color><color=#00FFFF>升星经验19515</color> | <color=#FF6B6B>银两消耗268584</color> | <color=#4ECDC4>技能值998</color><br/>
<color=#E0E0E0>LV.40：</color><color=#00FFFF>升星经验20371</color> | <color=#FF6B6B>银两消耗288361</color> | <color=#4ECDC4>技能值1008</color><br/>
<color=#E0E0E0>LV.41：</color><color=#00FFFF>升星经验21246</color> | <color=#FF6B6B>银两消耗309056</color> | <color=#4ECDC4>技能值1008</color><br/>
<color=#E0E0E0>LV.42：</color><color=#00FFFF>升星经验22140</color> | <color=#FF6B6B>银两消耗330730</color> | <color=#4ECDC4>技能值1008</color><br/>
<color=#E0E0E0>LV.43：</color><color=#00FFFF>升星经验23053</color> | <color=#FF6B6B>银两消耗353431</color> | <color=#4ECDC4>技能值1018</color><br/>
<color=#E0E0E0>LV.44：</color><color=#00FFFF>升星经验23985</color> | <color=#FF6B6B>银两消耗377192</color> | <color=#4ECDC4>技能值1018</color><br/>
<color=#E0E0E0>LV.45：</color><color=#00FFFF>升星经验24936</color> | <color=#FF6B6B>银两消耗402056</color> | <color=#4ECDC4>技能值1018</color><br/>
<color=#E0E0E0>LV.46：</color><color=#00FFFF>升星经验25897</color> | <color=#FF6B6B>银两消耗428061</color> | <color=#4ECDC4>技能值1028</color><br/>
<color=#E0E0E0>LV.47：</color><color=#00FFFF>升星经验26880</color> | <color=#FF6B6B>银两消耗455255</color> | <color=#4ECDC4>技能值1028</color><br/>
<color=#E0E0E0>LV.48：</color><color=#00FFFF>升星经验27884</color> | <color=#FF6B6B>银两消耗483679</color> | <color=#4ECDC4>技能值1028</color><br/>
<color=#E0E0E0>LV.49：</color><color=#00FFFF>升星经验28909</color> | <color=#FF6B6B>银两消耗513432</color> | <color=#4ECDC4>技能值1038</color><br/>
<color=#E0E0E0>LV.50：</color><color=#00FFFF>升星经验29956</color> | <color=#FF6B6B>银两消耗544578</color> | <color=#4ECDC4>技能值1038</color><br/><br/>

<!-- 5星升星数据 -->
<color=#FFFFFF>九、升星类型：5星</color><br/>
<color=#E0E0E0>LV.1：</color><color=#00FFFF>升星经验5</color> | <color=#FF6B6B>银两消耗142</color> | <color=#4ECDC4>技能值203</color><br/>
<color=#E0E0E0>LV.2：</color><color=#00FFFF>升星经验16</color> | <color=#FF6B6B>银两消耗152</color> | <color=#4ECDC4>技能值203</color><br/>
<color=#E0E0E0>LV.3：</color><color=#00FFFF>升星经验43</color> | <color=#FF6B6B>银两消耗169</color> | <color=#4ECDC4>技能值405</color><br/>
<color=#E0E0E0>LV.4：</color><color=#00FFFF>升星经验96</color> | <color=#FF6B6B>银两消耗211</color> | <color=#4ECDC4>技能值405</color><br/>
<color=#E0E0E0>LV.5：</color><color=#00FFFF>升星经验178</color> | <color=#FF6B6B>银两消耗306</color> | <color=#4ECDC4>技能值425</color><br/>
<color=#E0E0E0>LV.6：</color><color=#00FFFF>升星经验302</color> | <color=#FF6B6B>银两消耗485</color> | <color=#4ECDC4>技能值425</color><br/>
<color=#E0E0E0>LV.7：</color><color=#00FFFF>升星经验533</color> | <color=#FF6B6B>银两消耗786</color> | <color=#4ECDC4>技能值428</color><br/>
<color=#E0E0E0>LV.8：</color><color=#00FFFF>升星经验851</color> | <color=#FF6B6B>银两消耗1319</color> | <color=#4ECDC4>技能值428</color><br/>
<color=#E0E0E0>LV.9：</color><color=#00FFFF>升星经验1262</color> | <color=#FF6B6B>银两消耗2170</color> | <color=#4ECDC4>技能值428</color><br/>
<color=#E0E0E0>LV.10：</color><color=#00FFFF>升星经验1781</color> | <color=#FF6B6B>银两消耗3431</color> | <color=#4ECDC4>技能值630</color><br/>
<color=#E0E0E0>LV.11：</color><color=#00FFFF>升星经验2410</color> | <color=#FF6B6B>银两消耗5211</color> | <color=#4ECDC4>技能值630</color><br/>
<color=#E0E0E0>LV.12：</color><color=#00FFFF>升星经验3163</color> | <color=#FF6B6B>银两消耗7621</color> | <color=#4ECDC4>技能值651</color><br/>
<color=#E0E0E0>LV.13：</color><color=#00FFFF>升星经验4045</color> | <color=#FF6B6B>银两消耗10784</color> | <color=#4ECDC4>技能值651</color><br/>
<color=#E0E0E0>LV.14：</color><color=#00FFFF>升星经验4608</color> | <color=#FF6B6B>银两消耗14827</color> | <color=#4ECDC4>技能值652</color><br/>
<color=#E0E0E0>LV.15：</color><color=#00FFFF>升星经验5196</color> | <color=#FF6B6B>银两消耗19435</color> | <color=#4ECDC4>技能值652</color><br/>
<color=#E0E0E0>LV.16：</color><color=#00FFFF>升星经验5810</color> | <color=#FF6B6B>银两消耗24631</color> | <color=#4ECDC4>技能值652</color><br/>
<color=#E0E0E0>LV.17：</color><color=#00FFFF>升星经验6454</color> | <color=#FF6B6B>银两消耗30440</color> | <color=#4ECDC4>技能值854</color><br/>
<color=#E0E0E0>LV.18：</color><color=#00FFFF>升星经验7123</color> | <color=#FF6B6B>银两消耗36894</color> | <color=#4ECDC4>技能值854</color><br/>
<color=#E0E0E0>LV.19：</color><color=#00FFFF>升星经验7823</color> | <color=#FF6B6B>银两消耗44015</color> | <color=#4ECDC4>技能值870</color><br/>
<color=#E0E0E0>LV.20：</color><color=#00FFFF>升星经验8552</color> | <color=#FF6B6B>银两消耗51828</color> | <color=#4ECDC4>技能值870</color><br/>
<color=#E0E0E0>LV.21：</color><color=#00FFFF>升星经验9312</color> | <color=#FF6B6B>银两消耗60360</color> | <color=#4ECDC4>技能值871</color><br/>
<color=#E0E0E0>LV.22：</color><color=#00FFFF>升星经验10100</color> | <color=#FF6B6B>银两消耗69632</color> | <color=#4ECDC4>技能值871</color><br/>
<color=#E0E0E0>LV.23：</color><color=#00FFFF>升星经验10916</color> | <color=#FF6B6B>银两消耗79660</color> | <color=#4ECDC4>技能值871</color><br/>
<color=#E0E0E0>LV.24：</color><color=#00FFFF>升星经验11762</color> | <color=#FF6B6B>银两消耗90596</color> | <color=#4ECDC4>技能值1071</color><br/>
<color=#E0E0E0>LV.25：</color><color=#00FFFF>升星经验12640</color> | <color=#FF6B6B>银两消耗101632</color> | <color=#4ECDC4>技能值1071</color><br/>
<color=#E0E0E0>LV.26：</color><color=#00FFFF>升星经验13552</color> | <color=#FF6B6B>银两消耗114602</color> | <color=#4ECDC4>技能值1088</color><br/>
<color=#E0E0E0>LV.27：</color><color=#00FFFF>升星经验14502</color> | <color=#FF6B6B>银两消耗128827</color> | <color=#4ECDC4>技能值1088</color><br/>
<color=#E0E0E0>LV.28：</color><color=#00FFFF>升星经验15489</color> | <color=#FF6B6B>银两消耗143920</color> | <color=#4ECDC4>技能值1089</color><br/>
<color=#E0E0E0>LV.29：</color><color=#00FFFF>升星经验16511</color> | <color=#FF6B6B>银两消耗158998</color> | <color=#4ECDC4>技能值1089</color><br/>
<color=#E0E0E0>LV.30：</color><color=#00FFFF>升星经验17561</color> | <color=#FF6B6B>银两消耗173251</color> | <color=#4ECDC4>技能值1089</color><br/>
<color=#E0E0E0>LV.31：</color><color=#00FFFF>升星经验18611</color> | <color=#FF6B6B>银两消耗189212</color> | <color=#4ECDC4>技能值1289</color><br/>
<color=#E0E0E0>LV.32：</color><color=#00FFFF>升星经验19684</color> | <color=#FF6B6B>银两消耗205237</color> | <color=#4ECDC4>技能值1289</color><br/>
<color=#E0E0E0>LV.33：</color><color=#00FFFF>升星经验20786</color> | <color=#FF6B6B>银两消耗223039</color> | <color=#4ECDC4>技能值1306</color><br/>
<color=#E0E0E0>LV.34：</color><color=#00FFFF>升星经验21914</color> | <color=#FF6B6B>银两消耗242951</color> | <color=#4ECDC4>技能值1306</color><br/>
<color=#E0E0E0>LV.35：</color><color=#00FFFF>升星经验23063</color> | <color=#FF6B6B>银两消耗262867</color> | <color=#4ECDC4>技能值1308</color><br/>
<color=#E0E0E0>LV.36：</color><color=#00FFFF>升星经验24237</color> | <color=#FF6B6B>银两消耗283943</color> | <color=#4ECDC4>技能值1308</color><br/>
<color=#E0E0E0>LV.37：</color><color=#00FFFF>升星经验25437</color> | <color=#FF6B6B>银两消耗306371</color> | <color=#4ECDC4>技能值1325</color><br/>
<color=#E0E0E0>LV.38：</color><color=#00FFFF>升星经验26665</color> | <color=#FF6B6B>银两消耗329988</color> | <color=#4ECDC4>技能值1325</color><br/>
<color=#E0E0E0>LV.39：</color><color=#00FFFF>升星经验27920</color> | <color=#FF6B6B>银两消耗355569</color> | <color=#4ECDC4>技能值1325</color><br/>
<color=#E0E0E0>LV.40：</color><color=#00FFFF>升星经验29206</color> | <color=#FF6B6B>银两消耗382955</color> | <color=#4ECDC4>技能值1335</color><br/>
<color=#E0E0E0>LV.41：</color><color=#00FFFF>升星经验30522</color> | <color=#FF6B6B>银两消耗411405</color> | <color=#4ECDC4>技能值1335</color><br/>
<color=#E0E0E0>LV.42：</color><color=#00FFFF>升星经验31869</color> | <color=#FF6B6B>银两消耗441070</color> | <color=#4ECDC4>技能值1335</color><br/>
<color=#E0E0E0>LV.43：</color><color=#00FFFF>升星经验33248</color> | <color=#FF6B6B>银两消耗472102</color> | <color=#4ECDC4>技能值1345</color><br/>
<color=#E0E0E0>LV.44：</color><color=#00FFFF>升星经验34659</color> | <color=#FF6B6B>银两消耗504654</color> | <color=#4ECDC4>技能值1345</color><br/>
<color=#E0E0E0>LV.45：</color><color=#00FFFF>升星经验36102</color> | <color=#FF6B6B>银两消耗538876</color> | <color=#4ECDC4>技能值1345</color><br/>
<color=#E0E0E0>LV.46：</color><color=#00FFFF>升星经验37577</color> | <color=#FF6B6B>银两消耗574883</color> | <color=#4ECDC4>技能值1355</color><br/>
<color=#E0E0E0>LV.47：</color><color=#00FFFF>升星经验39086</color> | <color=#FF6B6B>银两消耗612774</color> | <color=#4ECDC4>技能值1355</color><br/>
<color=#E0E0E0>LV.48：</color><color=#00FFFF>升星经验40630</color> | <color=#FF6B6B>银两消耗652632</color> | <color=#4ECDC4>技能值1355</color><br/>
<color=#E0E0E0>LV.49：</color><color=#00FFFF>升星经验42209</color> | <color=#FF6B6B>银两消耗694563</color> | <color=#4ECDC4>技能值1365</color><br/>
<color=#E0E0E0>LV.50：</color><color=#00FFFF>升星经验43825</color> | <color=#FF6B6B>银两消耗737675</color> | <color=#4ECDC4>技能值1365</color><br/></size>`
        await this.node.parent.getChildByName("questionCrtl")
            .getComponent(questionCrtl)
            .read(message)
    }

    async qianghua() {
        if (!this.LevelUpResult) {
            return await util.message.prompt({ message: "请重置后重新选择" })
        }
        if (!this.LevelUpResult.id) {
            return await util.message.prompt({ message: "请选择强化主卡" })
        }
        if (!this.LevelUpResult.str) {
            return await util.message.prompt({ message: "请选择强化从卡" })
        }
        const config = getConfig()
        if (this.LevelUpResult.finalLevel > config.userData.lv * 2) {
            return await util.message.prompt({ message: "卡牌强化不得高于人物等级2倍" })
        }
        var cahracters = config.userData.characters
        var gold = config.userData.gold;
        if (this.LevelUpResult.totalSilverSpent > gold) {
            return await util.message.prompt({ message: "银两不足！" })
        }
        var cahracter4 = cahracters.filter(x => this._ids.has(x.id) && x.star >= 4);
        // 是否询问
        if (cahracter4.length > 0) {
            const result = await util.message.confirm({
                message: "确定使用4星以上当强化素材吗?"
            })
            // 是否确定
            if (result === false) return
        }
        this.LevelUpResult.userId = config.userData.userId
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.LevelUpResult),
        };
        fetch(config.ServerUrl.url + "/cardLevelUp2", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    var userInfo = data.data;
                    config.userData.gold = userInfo.gold
                    config.userData.characters = userInfo.characterList
                    localStorage.setItem("UserConfigData", JSON.stringify(config))

                    for (var i = 0; i < userInfo.characterList.length; i++) {
                        if (this._zhuId == userInfo.characterList[i].id) {
                            this.congCard.getChildByName("main_bg").getComponent(Sprite).spriteFrame =
                                await util.bundle.load(`image/qianghua/congCard2/spriteFrame`, SpriteFrame)
                            this.congCard.getChildByName("num").getComponent(Label).string = null
                            this.gold.getComponent(Label).string = userInfo.gold
                            this.zhuCard.getChildByName("HeroCardItem").getChildByName("LV").getComponent(Label).string = 'Lv: ' + userInfo.characterList[i].lv
                            this._ids.clear();
                            AudioMgr.inst.playOneShot("sound/other/click");
                            const levelUpEffectSkeleton = this.node.getChildByName("LevelUpEffect").getComponent(sp.Skeleton)
                            //播放声音
                            const audioSource = levelUpEffectSkeleton.node.getComponent(AudioSource)
                            audioSource.volume = config.volume * config.volumeDetail.character
                            audioSource.play()
                            // 播放动画
                            levelUpEffectSkeleton.node.active = true
                            levelUpEffectSkeleton.node.children[0]?.getComponent(sp.Skeleton).setAnimation(0, "animation", false)
                            levelUpEffectSkeleton.setAnimation(0, "animation", false)
                            levelUpEffectSkeleton.setCompleteListener(() => levelUpEffectSkeleton.node.active = false)
                            this.LevelUpResult.finalLevel = 0
                            this.LevelUpResult.remainingExp = 0
                            this.LevelUpResult.totalSilverSpent = 0
                            this.LevelUpResult.str = null
                            this.result.getComponent(Label).string = null
                            break;
                        }
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

    async calce() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.zhuCard.getChildByName("HeroCardItem").active = false
        this.congCard.getChildByName("main_bg").getComponent(Sprite).spriteFrame =
            await util.bundle.load(`image/qianghua/congCard2/spriteFrame`, SpriteFrame)
        this.congCard.getChildByName("num").getComponent(Label).string = null
        this._ids = new Set()
        this._zhuId = null
    }
}


