import { _decorator, Component, Label, Node, Sprite, SpriteFrame,sp, AudioSource } from 'cc';
import { LCoin } from 'db://assets/script/common/common/Language';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { EquipmentStateCreate } from 'db://assets/script/game/fight/equipment/EquipmentState';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { eqSelectCardCtrl } from '../eqSelectCardCtrl/eqSelectCardCtrl';
import { util } from 'db://assets/script/util/util';
import { eqSelectCardCtrl2 } from '../eqSelectCardCtrl/eqSelectCardCtrl2';
const { ccclass, property } = _decorator;

@ccclass('eqQianghuaCtrl')
export class eqQianghuaCtrl extends Component {
    @property(Node)
    zhuCard: Node
    @property(Node)
    congCard
    @property(Node)
    gold
    @property(Node)
    result
    initialized = false;
    public myMap = new Map<string, number>(); // 键为字符串，值为数字
    public _zhuId: string = null;
    public cahracterQueue: EquipmentStateCreate[] = []
    public cahracterQueue2: EquipmentStateCreate[] = []
    LevelUpResult = {
        finalLevel: 0,       // 最终等级
        remainingExp: 0,     // 当前等级的剩余经验
        totalSilverSpent: 0, // 升级消耗的总银两
        id: null, // 升级消耗的总银两
        str: null, // 升级消耗的总银两
        userId: null,
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
        this.gold.getComponent(Label).string = LCoin(config.userData.gold)
    }
    update(deltaTime: number) {

    }

    public async zhuSelectCard() {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        this.cahracterQueue = []
        this.cahracterQueue = config.userData.equipments
        this.myMap.forEach((value, key) => {
            this.cahracterQueue = this.cahracterQueue.filter(x => key != x.id)
        })
        await this.render(this.cahracterQueue)
    }

    async render(characterQueue: EquipmentStateCreate[]) {
        await this.node.parent.getChildByName("eqSelectCardCtrl")
            .getComponent(eqSelectCardCtrl)
            .render(characterQueue, async (c, n) => {
                n.active = false
                this.clickFun(c)
                return
            })
    }

    async clickFun(create) {
        this._zhuId = create.id
        AudioMgr.inst.playOneShot("sound/other/click");
        let $node = this.zhuCard.getChildByName("HeroCardItem");
        $node.getChildByName("heroMask").getChildByName("hero").getComponent(Sprite).spriteFrame =
            await util.bundle.load(`game/texture/frames/emp/${create.id.split('_')[0]}/spriteFrame`, SpriteFrame)
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

    async initData(map: Map<string, number>) {
        console.log(map, 55555)
        this.myMap = map
        if (this.myMap.size > 0) {
            let total = 0;
            this.myMap.forEach((value) => {
                total += value;
            });
            this.congCard.getChildByName("main_bg").getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/qianghua/congCard/spriteFrame`, SpriteFrame)
            this.congCard.getChildByName("num").getComponent(Label).string = total + ""

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
            myMap: Array.from(this.myMap), // 转二维数组：[["a",1], ["b",2]]
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/eqCardLevelUp", options)
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
                        this.LevelUpResult = data;
                        this.result.getComponent(Label).string = "升级后等级: " + data.finalLevel + "级, 当前等级剩余经验: " + data.remainingExp + ", 升级消耗总银两: " + data.totalSilverSpent
                    } else {
                        this.LevelUpResult = {
                            finalLevel: 0,       // 最终等级
                            remainingExp: 0,     // 当前等级的剩余经验
                            totalSilverSpent: 0, // 升级消耗的总银两
                            id: this.LevelUpResult.id, // 升级消耗的总银两
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


    public async zhuSelectCard2() {
        AudioMgr.inst.playOneShot("sound/other/click");
        if (!this._zhuId) {
            return await util.message.prompt({ message: "请选择主卡！" })
        }

        const config = getConfig()
        this.cahracterQueue2 = []
        this.cahracterQueue2 = config.userData.equipments
        if (this._zhuId) {
            this.cahracterQueue2 = this.cahracterQueue2.filter(x => this._zhuId != x.id)
        }
        ////console.log(this.cahracterQueue2)
        await this.render2(this.cahracterQueue2)
    }

    async render2(characterQueue: EquipmentStateCreate[]) {
        await this.node.parent.getChildByName("eqSelectCardCtrl2")
            .getComponent(eqSelectCardCtrl2)
            .render(characterQueue, this, this.myMap)
    }

    async calce() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.zhuCard.getChildByName("HeroCardItem").active = false
        this.congCard.getChildByName("main_bg").getComponent(Sprite).spriteFrame =
            await util.bundle.load(`image/qianghua/congCard2/spriteFrame`, SpriteFrame)
        this.congCard.getChildByName("num").getComponent(Label).string = null
        this.myMap.clear();
        this._zhuId = null
    }

    async qianghua() {
        if (!this.LevelUpResult) {
            return await util.message.prompt({ message: "请重置后重新选择" })
        }
        if (!this.LevelUpResult.id) {
            return await util.message.prompt({ message: "请选择强化主卡或从卡" })
        }
        if (!this.myMap || this.myMap.size == 0) {
            return await util.message.prompt({ message: "请选择强化从卡" })
        }
        const config = getConfig()
        const token = getToken()
        if (this.LevelUpResult.finalLevel > config.userData.lv * 2) {
            return await util.message.prompt({ message: "卡牌强化不得高于人物等级2倍" })
        }
        var cahracters = config.userData.characters
        var gold = config.userData.gold;
        if (this.LevelUpResult.totalSilverSpent > gold) {
            return await util.message.prompt({ message: "银两不足！" })
        }
        let cahracter4 = [];
        this.myMap.forEach((value, key) => {
            cahracter4 = cahracters.filter(x => key == x.id && x.star >= 4);
        })
        // 
        // 是否询问
        if (cahracter4.length > 0) {
            const result = await util.message.confirm({
                message: "确定使用4星以上当强化素材吗?"
            })
            // 是否确定
            if (result === false) return
        }
        const postData = {
            token: token,
            userId: config.userData.userId,
            id: this._zhuId,
            finalLevel: this.LevelUpResult.finalLevel,       // 最终等级
            remainingExp: this.LevelUpResult.remainingExp,     // 当前等级的剩余经验
            totalSilverSpent: this.LevelUpResult.totalSilverSpent, // 升级消耗的总银两
            myMap: Array.from(this.myMap), // 转二维数组：[["a",1], ["b",2]]
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/eqCardLevelUp2", options)
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
                    config.userData.equipments = userInfo.eqCharactersList
                    localStorage.setItem("UserConfigData", JSON.stringify(config))

                    for (var i = 0; i < userInfo.eqCharactersList.length; i++) {
                        if (this._zhuId == userInfo.eqCharactersList[i].id) {
                            this.congCard.getChildByName("main_bg").getComponent(Sprite).spriteFrame =
                                await util.bundle.load(`image/qianghua/congCard2/spriteFrame`, SpriteFrame)
                            this.congCard.getChildByName("num").getComponent(Label).string = null
                            this.gold.getComponent(Label).string = userInfo.gold
                            this.zhuCard.getChildByName("HeroCardItem").getChildByName("LV").getComponent(Label).string = 'Lv: ' + userInfo.eqCharactersList[i].lv
                            this.myMap.clear();
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

}


