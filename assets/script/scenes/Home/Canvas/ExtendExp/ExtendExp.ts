import { _decorator, Component, Label, Node, Sprite, SpriteFrame, sp } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { CharacterStateCreate } from 'db://assets/script/game/fight/character/CharacterState';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { SelectCardCtrl } from '../qianghua/SelectCardCtrl';
const { ccclass, property } = _decorator;

@ccclass('ExtendExp')
export class ExtendExp extends Component {
    @property(Node)
    zhuCard: Node
    @property(Node)
    zhuCard2: Node
    public _zhuId: string = null;
    public _zhuId2: string = null;
    public cahracterQueue: CharacterStateCreate[] = []
    start() {

    }

    update(deltaTime: number) {

    }
    public async ok() {
        AudioMgr.inst.playOneShot("sound/other/click");
        return await util.message.prompt({ message: "暂未开放" })
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
        this.cahracterQueue = this.cahracterQueue.filter(x => this._zhuId2 != x.id)
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

    public async zhuSelectCard2() {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        this.cahracterQueue = []
        this.cahracterQueue = config.userData.characters
        this.cahracterQueue = this.cahracterQueue.filter(x => this._zhuId != x.id)
        await this.render2(this.cahracterQueue)
    }
    async render2(characterQueue: CharacterStateCreate[]) {
        await this.node.parent.getChildByName("SelectCardCtrl")
            .getComponent(SelectCardCtrl)
            .render(characterQueue, async (c, n) => {
                n.active = false
                this.clickFun2(c)
                return
            })
    }
    async clickFun2(create) {
        this._zhuId2 = create.id
        AudioMgr.inst.playOneShot("sound/other/click");
        let $node = this.zhuCard2.getComponent(Sprite).spriteFrame =
            await util.bundle.load('game/texture/frames/hero/Header/' + create.id + '/spriteFrame', SpriteFrame)
    }
    async clickFun(create) {
        this._zhuId = create.id
        AudioMgr.inst.playOneShot("sound/other/click");
        let $node = this.zhuCard.getChildByName("HeroCardItem");
        $node.getChildByName("heroMask").getChildByName("hero").getComponent(Sprite).spriteFrame =
            await util.bundle.load('game/texture/frames/hero/' + create.id + '/spriteFrame', SpriteFrame)
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
        $node.active = true
    }

    async qianghua() {

        if (!this._zhuId) {
            return await util.message.prompt({ message: "请选择目标卡" })
        }
        if (!this._zhuId2) {
            return await util.message.prompt({ message: "请选择吸纳卡" })
        }
        const config = getConfig()
        const token = getToken()

        var cahracters = config.userData.characters
        let cahracter1 = cahracters.filter(x => this._zhuId == x.id)[0];
        let cahracter2 = cahracters.filter(x => this._zhuId2 == x.id)[0];
        // 
        if (cahracter1.lv >= cahracter1.maxLv) {
            return await util.message.prompt({ message: "目标卡已满级无法吸纳" })
        }
        if (cahracter1.lv > cahracter2.lv) {
            return await util.message.prompt({ message: "吸纳卡的等级必须大于目标卡" })
        }
        if (cahracter2.lv > cahracter1.maxLv) {
            const result = await util.message.confirm({
                message: "吸纳等级高于目标卡最大等级确定吸纳吗？"
            })
            // 是否确定
            if (result === false) return
        }
        const postData = {
            token: token,
            userId: config.userData.userId,
            id: this._zhuId,
            str: this._zhuId2
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/xina", options)
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
                    AudioMgr.inst.playOneShot("sound/other/getcard");
                    let hut = this.zhuCard.getChildByName("HeroCardItem").getChildByName("flyup").getComponent(sp.Skeleton)
                    hut.node.active = true
                    hut.setAnimation(0, "animation", false)
                    let create = userInfo.characterList.filter(x => this._zhuId == x.id)[0];
                    hut.setCompleteListener(async () => {
                        hut.node.active = false
                        let $node = this.zhuCard.getChildByName("HeroCardItem");
                        $node.getChildByName("heroMask").getChildByName("hero").getComponent(Sprite).spriteFrame =
                            await util.bundle.load('game/texture/frames/hero/' + create.id + '/spriteFrame', SpriteFrame)
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
                    })
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


