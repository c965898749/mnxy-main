import { _decorator, Component, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { util } from '../../../../util/util';
import { CharacterEnum } from '../../../../game/fight/character/CharacterEnum';
import { EquipmentStateCreate } from 'db://assets/script/game/fight/equipment/EquipmentState';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
const { ccclass, property } = _decorator;

// 升级所需金币
function levelUpNeedGold(create: EquipmentStateCreate): number {
    return Math.ceil(
        CharacterEnum[create.id].CharacterQuality * create.lv * (create.lv / (create.lv + 80) + 1) * 100
    )
}

// 升级所需灵石
function levelUpNeedSoule(create: EquipmentStateCreate): number {
    return Math.ceil(
        CharacterEnum[create.id].CharacterQuality * create.lv * (create.lv / (create.lv + 80) + 1) * 100 * 0.5
    )
}

@ccclass('EqHeroCharacterDetailPorperty')
export class EqHeroCharacterDetailPorperty extends Component {
    skillDict: Record<number, string> = {
        1: "诛仙", 2: "食人", 3: "驱魔", 4: "斗兽",
        5: "仙师", 6: "人杰", 7: "魔王", 8: "兽灵",
        9: "返火", 10: "辟土", 11: "逆雷", 12: "分水",
        13: "驭兵", 14: "破妄",
        15: "踏浪", 16: "破岩", 17: "驱雷", 18: "蹈火",
        19: "不侵", 20: "灭法",
        21: "突袭", 22: "闪避"
    };
    gemMinLv=0
    // 角色状态
    private $state: EquipmentStateCreate

    // 是否询问升级
    private $answerLevelUp: boolean = true
    // 是否询问升级
    private $answerSell: boolean = true

    // 缓存宝石预制体，避免重复加载
    private _gemPrefab: Prefab | null = null;
    // 请求锁，防止连续重复点击发起多次网络请求
    private _requestLock: boolean = false;

    // 渲染属性
    async renderProperty(create: EquipmentStateCreate, clickFun?: (characters: EquipmentStateCreate, node: Node) => any) {
        console.log('renderProperty', create.gemList)
        this.$state = create
        this.node.getChildByName("Name").getComponent(Label).string = "名称: " + create.name+(create.flyup > 0 ? "+" + create.flyup : "");
        this.node.getChildByName("Lv").getComponent(Label).string = "Lv: " + create.lv
        this.node.getChildByName("introduce").getComponent(Label).string = create.introduce + ''
        this.node.getChildByName("CharacterAnimation").getComponent(Sprite).spriteFrame =
            await util.bundle.load(`game/texture/frames/emp/${create.id.split('_')[0]}/spriteFrame`, SpriteFrame)
        this.node.getChildByName("Attribute").children.forEach(n => n.active = false)

        this.node.getChildByName("Attribute").children[0].active = true
        this.node.getChildByName("Attribute").children[0].getChildByName("Icon").getComponent(Label).string = create.name.split('.')[0]
        if (create.name.split('.')[0] == "锋利") {
            this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.wlAtk + ''
        } else if (create.name.split('.')[0] == "坚韧") {
            this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.wlDef + ''
        } else if (create.name.split('.')[0] == "火焰") {
            this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.hyAtk + ''
        } else if (create.name.split('.')[0] == "火抗") {
            this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.hyDef + ''
        } else if (create.name.split('.')[0] == "毒素") {
            this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.dsDef + ''
        } else if (create.name.split('.')[0] == "毒抗") {
            this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.dsDef + ''
        } else if (create.name.split('.')[0] == "飞弹") {
            this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.fdAtk + ''
        } else if (create.name.split('.')[0] == "弹抗") {
            this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.fdDef + ''
        } else if (create.name.split('.')[0] == "治愈") {
            this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.zlDef + ''
        }

        if (create.star >= 3.5) {
            this.node.getChildByName("Attribute").children[1].active = true
            this.node.getChildByName("Attribute").children[1].getChildByName("Icon").getComponent(Label).string = create.name.split('.')[1]
            if (create.name.split('.')[0] == "锋利") {
                this.node.getChildByName("Attribute").children[1].getChildByName("Value").getComponent(Label).string = create.wlAtk + ''
            } else if (create.name.split('.')[0] == "坚韧") {
                this.node.getChildByName("Attribute").children[1].getChildByName("Value").getComponent(Label).string = create.wlDef + ''
            } else if (create.name.split('.')[0] == "火焰") {
                this.node.getChildByName("Attribute").children[1].getChildByName("Value").getComponent(Label).string = create.hyAtk + ''
            } else if (create.name.split('.')[0] == "火抗") {
                this.node.getChildByName("Attribute").children[1].getChildByName("Value").getComponent(Label).string = create.hyDef + ''
            } else if (create.name.split('.')[0] == "毒素") {
                this.node.getChildByName("Attribute").children[1].getChildByName("Value").getComponent(Label).string = create.dsAtk + ''
            } else if (create.name.split('.')[0] == "毒抗") {
                this.node.getChildByName("Attribute").children[1].getChildByName("Value").getComponent(Label).string = create.dsDef + ''
            } else if (create.name.split('.')[0] == "飞弹") {
                this.node.getChildByName("Attribute").children[1].getChildByName("Value").getComponent(Label).string = create.fdAtk + ''
            } else if (create.name.split('.')[0] == "弹抗") {
                this.node.getChildByName("Attribute").children[1].getChildByName("Value").getComponent(Label).string = create.fdDef + ''
            } else if (create.name.split('.')[0] == "治愈") {
                this.node.getChildByName("Attribute").children[1].getChildByName("Value").getComponent(Label).string = create.zlDef + ''
            }
        }

        if (create.star >= 4.5) {
            this.node.getChildByName("Attribute").children[2].active = true
            this.node.getChildByName("Attribute").children[2].getChildByName("Icon").getComponent(Label).string = create.name.split('.')[2]
            if (create.name.split('.')[0] == "锋利") {
                this.node.getChildByName("Attribute").children[2].getChildByName("Value").getComponent(Label).string = create.wlAtk + ''
            } else if (create.name.split('.')[0] == "坚韧") {
                this.node.getChildByName("Attribute").children[2].getChildByName("Value").getComponent(Label).string = create.wlDef + ''
            } else if (create.name.split('.')[0] == "火焰") {
                this.node.getChildByName("Attribute").children[2].getChildByName("Value").getComponent(Label).string = create.hyAtk + ''
            } else if (create.name.split('.')[0] == "火抗") {
                this.node.getChildByName("Attribute").children[2].getChildByName("Value").getComponent(Label).string = create.hyDef + ''
            } else if (create.name.split('.')[0] == "毒素") {
                this.node.getChildByName("Attribute").children[2].getChildByName("Value").getComponent(Label).string = create.dsAtk + ''
            } else if (create.name.split('.')[0] == "毒抗") {
                this.node.getChildByName("Attribute").children[2].getChildByName("Value").getComponent(Label).string = create.dsDef + ''
            } else if (create.name.split('.')[0] == "飞弹") {
                this.node.getChildByName("Attribute").children[2].getChildByName("Value").getComponent(Label).string = create.fdAtk + ''
            } else if (create.name.split('.')[0] == "弹抗") {
                this.node.getChildByName("Attribute").children[2].getChildByName("Value").getComponent(Label).string = create.fdDef + ''
            } else if (create.name.split('.')[0] == "治愈") {
                this.node.getChildByName("Attribute").children[2].getChildByName("Value").getComponent(Label).string = create.zlDef + ''
            }
        }
        // 仙、佛、圣、魔、妖、兽
        const cmp = new Map([
            ['sacred', '仙界'],
            ['nature', '佛界'],
            ['machine', '圣界'],
            ['abyss', '魔界'],
            ['dark', '妖界'],
            ['ordinary', '兽界'],
        ]);

        this.node.getChildByName("Zhongzu").getComponent(Label).string = create.profession + ""
        this.node.getChildByName("skill").getChildByName("Value").getComponent(Label).string = this.skillDict[create.xilian] || "无"
        // 渲染星级
        const starNode = this.node.getChildByName("Star")
        starNode.children.forEach(n => n.active = false)
        starNode.children.forEach(n => n.children[0].active = false)
        starNode.children.forEach(n => n.children[1].active = false)
        for (let i = 0; i < 5; i++)
            starNode.children[i].active = true
        for (let i = 0; i < create.star; i++) {
            starNode.children[i].children[0].active = true
            if (i + 0.5 == create.star) {
                starNode.children[i].children[1].active = true
            }
        }

        const baos = this.node.getChildByName("team")
        baos.children.forEach(n => {
            n.active = false
            n.off("click")
            const spr = n.getChildByName("header_qitiandashen").getComponent(Sprite);
            spr.spriteFrame = null;
        })
        for (let i = 0; i < create.star; i++) {
            baos.children[i].active = true
            const slotNode = baos.children[i];
            slotNode.on("click", () => this.touchCancel(create, i))
            const targetGem = create.gemList?.find(item => item.slotIndex === i);
            const spr = slotNode.getChildByName("header_qitiandashen").getComponent(Sprite);
            if (!targetGem) {
                spr.spriteFrame = null;
                continue;
            }
            util.bundle.load(targetGem.icon, SpriteFrame).then(sf => {
                if (!slotNode.isValid) return;
                spr.spriteFrame = sf;
            });
        }
        this.node.getChildByName("sell").off("click")
        if (create.goIntoNum != 0) {
            this.node.getChildByName("sell").active = true
            this.node.getChildByName("sell").on("click", () => { if (clickFun) clickFun(create, this.node) })
        } else {
            this.node.getChildByName("sell").active = false
        }
    }

    /**
     * 统一关闭宝石滚动面板，并回收所有Item节点
     */
    private async closeGemScrollView() {
        if (!this._gemPrefab) {
            this._gemPrefab = await util.bundle.load("prefab/baos", Prefab);
        }
        const scrollNode = this.node.getChildByName("ScrollView");
        const contentNode = scrollNode.getChildByName("view").getChildByName("content");
        const nodePool = util.resource.getNodePool(this._gemPrefab);

        const childList = [...contentNode.children];
        for (const child of childList) {
            child.off("click");
            nodePool.put(child);
        }
        scrollNode.active = false;
    }

    async touchCancel(create: EquipmentStateCreate, slotIndex: number) {
        if (this._requestLock) return;
        AudioMgr.inst.playOneShot("sound/other/click");
        const scrollNode = this.node.getChildByName("ScrollView");

        // 如果面板已经打开，直接关闭清空，防止重复并发请求
        if (scrollNode.active) {
            await this.closeGemScrollView();
            return;
        }

        this._requestLock = true;

        if (!this._gemPrefab) {
            this._gemPrefab = await util.bundle.load("prefab/baos", Prefab);
        }
        const nodePool = util.resource.getNodePool(this._gemPrefab);
        const contentNode = scrollNode.getChildByName("view").getChildByName("content");

        // 打开前先清理残留
        const oldChildren = [...contentNode.children];
        for (const n of oldChildren) {
            n.off("click");
            nodePool.put(n);
        }

        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            id: create.uuid,
            str: create.eqType,
            userId: config.userData.userId,
            finalLevel: slotIndex
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "bosList", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(async data => {
                if (data.success == '1') {
                    let items = data.data
                    scrollNode.active = true;

                    for (let i = 0; i < items.length; i++) {
                        let itemDetail = items[i]
                        let item = nodePool.get()
                        item.getChildByName("icon").getComponent(Sprite).spriteFrame =
                            await util.bundle.load(itemDetail.icon, SpriteFrame)
                        item.getChildByName("isBattle").active = itemDetail.isBind;
                        if (itemDetail.itemCount > 0) {
                            item.getChildByName("itemCount").getComponent(Label).string = itemDetail.itemCount + ''
                        } else {
                            item.getChildByName("itemCount").getComponent(Label).string = ''
                        }
                        item.on("click", () => {
                            this.clickDiuFun(itemDetail, slotIndex)
                        }, this)
                        contentNode.addChild(item)
                    }
                } else {
                    util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
                this._requestLock = false;
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                this._requestLock = false;
            });
    }

    async clickDiuFun(itemDetail, slotIndex: number) {
        if (this._requestLock) return;
        AudioMgr.inst.playOneShot("sound/other/click");
        this._requestLock = true;

        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            id: itemDetail.itemId,
            str: itemDetail.equipUniqueId,
            userId: config.userData.userId,
            finalLevel: slotIndex
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "toggleGem", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(async data => {
                if (data.success == '1') {
                    // 使用统一方法关闭并回收节点
                    await this.closeGemScrollView();

                    config.userData.equipments = data.data
                    const create = config.userData.equipments.find(equip => equip.uuid === itemDetail.equipUniqueId);
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                    const baos = this.node.getChildByName("team")

                    // 全部清空解绑+清空贴图
                    baos.children.forEach(n => {
                        n.active = false
                        n.off("click")
                        const spr = n.getChildByName("header_qitiandashen").getComponent(Sprite);
                        spr.spriteFrame = null;
                    })

                    // 重新渲染宝石槽
                    for (let i = 0; i < create.star; i++) {
                        const slotNode = baos.children[i];
                        slotNode.active = true;
                        slotNode.on("click", () => this.touchCancel(create, i));

                        const spr = slotNode.getChildByName("header_qitiandashen").getComponent(Sprite);
                        const targetGem = create.gemList?.find(item => item.slotIndex === i);
                        if (!targetGem) {
                            spr.spriteFrame = null;
                            continue;
                        }
                        util.bundle.load(targetGem.icon, SpriteFrame).then(sf => {
                            if (!slotNode.isValid) return;
                            spr.spriteFrame = sf;
                        });
                    }
                } else {
                    util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
                this._requestLock = false;
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                this._requestLock = false;
            });
    }

    // 显示所有的属性
    async showAllProperty() {
        // 纯文本展示，无富文本标签，\n 换行，自动计算当前宝石最低等级的实际概率
        // let gemMinLv = this.$state.gemMinLv ?? 0;
        // let gemMinLv = this.$state.gemMinLv ?? 0;
        let xilianCode = this.$state.xilian;
        let message = `技能\n`;
        const suitCfg = {
            1: { name: "诛仙", rateRatio: 0.5, maxRate: 25, desc: "物理攻击时有（宝石最低等级 * 0.5%）几率攻击仙族护法时额外提升75%攻击力，回合结束移除该加成" },
            2: { name: "食人", rateRatio: 0.5, maxRate: 25, desc: "物理攻击时有（宝石最低等级 * 0.5%）几率攻击人族护法时额外提升75%攻击力，回合结束移除该加成" },
            3: { name: "驱魔", rateRatio: 0.5, maxRate: 25, desc: "物理攻击时有（宝石最低等级 * 0.5%）几率攻击魔族护法时额外提升75%攻击力，回合结束移除该加成" },
            4: { name: "斗兽", rateRatio: 0.5, maxRate: 25, desc: "物理攻击时有（宝石最低等级 * 0.5%）几率攻击兽族护法时额外提升75%攻击力，回合结束移除该加成" },
            5: { name: "仙师", rateRatio: 0, maxRate: 0, desc: "提升除自身外的所有仙族护法生命上限，提升值为生命值 * 1% * 宝石最低等级，多个仙师套装可以叠加效果" },
            6: { name: "人杰", rateRatio: 0, maxRate: 0, desc: "提升除自身外的所有人族护法生命上限，提升值为生命值 * 1% * 宝石最低等级，多个人杰套装可以叠加效果" },
            7: { name: "魔王", rateRatio: 0, maxRate: 0, desc: "提升除自身外的所有魔族护法生命上限，提升值为生命值 * 1% * 宝石最低等级，多个魔王套装可以叠加效果" },
            8: { name: "兽灵", rateRatio: 0, maxRate: 0, desc: "提升除自身外的所有兽族护法生命上限，提升值为生命值 * 1% * 宝石最低等级，多个兽灵套装可以叠加效果" },
            9: { name: "返火", rateRatio: 0.5, maxRate: 25, desc: "受到火属性伤害时，有（宝石最低等级 * 0.5%）几率对伤害来源造成等值的物理伤害，且有同样几率免疫燃烧、锢魂，伤害反弹和抵抗负面分别独立触发" },
            10: { name: "辟土", rateRatio: 0.5, maxRate: 25, desc: "受到土属性伤害时，有（宝石最低等级 * 0.5%）几率对伤害来源造成等值的物理伤害，且有同样几率免疫毒砂、凝滞" },
            11: { name: "逆雷", rateRatio: 0.5, maxRate: 25, desc: "受到雷属性伤害时，有（宝石最低等级 * 0.5%）几率对伤害来源造成等值的物理伤害，且有同样几率免疫麻痹、盲目" },
            12: { name: "分水", rateRatio: 0.5, maxRate: 25, desc: "受到水属性伤害时，有（宝石最低等级 * 0.5%）几率对伤害来源造成等值的物理伤害，且有同样几率免疫僵化、禁疗" },
            13: { name: "驭兵", rateRatio: 0.5, maxRate: 25, desc: "攻击时有（宝石最低等级 * 0.5%）几率增加50%攻击，攻击后身上每有一把剑则保留增加攻击力的20%，回合结束移除该加成" },
            14: { name: "破妄", rateRatio: 0.5, maxRate: 25, desc: "攻击前有（宝石最低等级 * 0.5%）几率将对面三位护法生命上限恢复到初始值，不侵、法术护盾都无法抵挡破妄，反击、连击、乱舞都能触发破妄" },
            15: { name: "踏浪", rateRatio: 0.5, maxRate: 25, desc: "攻击时有（宝石最低等级 * 0.5%）几率提升50%攻击力，并且使目标失去神通（僵化），行动一次后清除，回合结束移除攻击加成，如果护法带有踏浪神通，效果可叠加" },
            16: { name: "破岩", rateRatio: 0.5, maxRate: 25, desc: "攻击时有（宝石最低等级 * 0.5%）几率提升50%攻击力，并且使目标持续降低攻击力（毒砂5），回合结束移除攻击加成，如果护法带有破岩神通，效果可叠加" },
            17: { name: "驱雷", rateRatio: 0.5, maxRate: 25, desc: "攻击时有（宝石最低等级 * 0.5%）几率提升50%攻击力，并且使目标无法释放法术书（麻痹），行动一次后清除，回合结束移除攻击加成，如果护法带有驱雷神通，效果可叠加" },
            18: { name: "蹈火", rateRatio: 0.5, maxRate: 25, desc: "攻击时有（宝石最低等级 * 0.5%）几率提升50%攻击力，并且使目标持续失去生命值（燃烧），回合结束移除攻击加成，如果护法带有蹈火神通，效果可叠加" },
            19: { name: "不侵", rateRatio: 0.5, maxRate: 25, desc: "被攻击时有（宝石最低等级 * 0.5%）几率抵抗对方给予的持续效果，如燃烧、毒砂、禁疗、绝杀、驱逐、摧毁、乱阵、僵化、早夭等，不可抵抗弱化、破妄" },
            20: { name: "灭法", rateRatio: 0.5, maxRate: 25, desc: "攻击时对具备仙衣、不侵效果的目标造成的伤害提高（宝石最低等级 * 0.5%），并且有相同几率清除对方的无敌效果（本次攻击不产生伤害），灭法造成的伤害为物理伤害" },
            21: { name: "突袭", rateRatio: 0.5, maxRate: 25, desc: "攻击时有（宝石最低等级 * 0.5%）几率触发，本次攻击不会受到反击、护体等神通，并额外增加50%攻击力，回合结束移除该加成" },
            22: { name: "闪避", rateRatio: 0.24, maxRate: 12, desc: "有（宝石最低等级 * 0.24%）几率躲过物理攻击，如果护法带有闪避神通，效果可叠加" }
        };
        const cfg = suitCfg[xilianCode];
        // if (!cfg) {
        //     message += `无\n`;
        // } else {
        //     const realLv = Math.min(this.gemMinLv, 50);
        //     let realRate = 0;
        //     if (cfg.rateRatio > 0) realRate = Math.min(realLv * cfg.rateRatio, cfg.maxRate);
            message += `【${cfg.name}】\n${cfg.desc}\n`;
        //     if (cfg.rateRatio > 0) message += `当前宝石最低等级${this.gemMinLv}，实际触发概率${realRate.toFixed(2)}%\n`;
        // }
        message += `\n装备宝石槽未装满洗练属性不激活，属性计算取装备镶嵌宝石最低等级`;
        await util.message.introduce({ message })

    }
}