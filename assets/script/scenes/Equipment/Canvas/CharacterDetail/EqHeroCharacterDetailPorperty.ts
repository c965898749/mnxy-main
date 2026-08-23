import { _decorator, Component, Label, Node, Prefab, RichText, Sprite, SpriteFrame } from 'cc';
import { util } from '../../../../util/util';
import { CharacterEnum } from '../../../../game/fight/character/CharacterEnum';
import { EquipmentStateCreate, xilianInfo } from 'db://assets/script/game/fight/equipment/EquipmentState';
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
        0: "突击",
        1: "灵能",
        2: "防护",
        3: "御灵",
        4: "暴击",
        5: "暴抗",
        6: "闪避",
        7: "命中",
        8: "速度",
        9: "生命"
    };
    qualityColor: Record<number, string> = {
        0: "#88ff88", //普通绿色
        1: "#bb77ff", //优秀紫色
        2: "#ffdd77"  //极品金色
    };

    gemMinLv = 0
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
        this.node.getChildByName("Name").getComponent(Label).string = "名称: " + create.name + (create.flyup > 0 ? "+" + create.flyup : "");
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
        this.node.getChildByName("skill").getChildByName("Value").getComponent(Label).string = "无"
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
        this.node.getChildByName("Xilian").children.forEach(n => n.active = false)
        for (let i = 0; i<create.xilianList.length; i++) {
            this.node.getChildByName("Xilian").children[i].active = true
            this.node.getChildByName("Xilian").children[i].getComponent(RichText).string = this.formatRefineList(create.xilianList[i])
        }


        this.node.getChildByName("sell").off("click")
        if (create.goIntoNum != 0) {
            this.node.getChildByName("sell").active = true
            this.node.getChildByName("sell").on("click", () => { if (clickFun) clickFun(create, this.node) })
        } else {
            this.node.getChildByName("sell").active = false
        }
    }
    formatRefineList(xilian: xilianInfo): string {
        if (!xilian) return '';
        // lines.push(`<size=18>`);
        const attrName = this.skillDict[xilian.xilian];
        const qColor = this.qualityColor[xilian.quality];
        let valStr: string;
        //4‑7暴击、暴抗、闪避、命中保留1位小数；其余直接数字
        if (xilian.xilian >= 4 && xilian.xilian <= 7) {
            valStr = (Number(xilian.value)).toFixed(1) + '%';
        } else {
            valStr = String(xilian.value);
        }
        return `<color=${qColor}><size=20>${attrName}+${valStr}</size></color>`;
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
        const attrMap: Record<string, { showName: string; field: keyof typeof this.$state }> = {
            "锋利": { showName: "锋利", field: "wlAtk" },
            "坚韧": { showName: "坚韧", field: "wlDef" },
            "火焰": { showName: "火焰", field: "hyAtk" },
            "火抗": { showName: "火抗", field: "hyDef" },
            "毒素": { showName: "毒素", field: "dsAtk" },
            "毒抗": { showName: "毒抗", field: "dsDef" },
            "飞弹": { showName: "飞弹", field: "fdAtk" },
            "弹抗": { showName: "弹抗", field: "fdDef" },
            "治愈": { showName: "治愈", field: "zlDef" },
        };




        const qualityColor: Record<number, string> = {
            0: "#88ff88", //普通绿色
            1: "#bb77ff", //优秀紫色
            2: "#ffdd77"  //极品金色
        };

        let richTextStr = `\n<size=25><color=#C29655>基础属性：</color></size>\n`;
        const nameParts = this.$state.name.split('.');

        const mainAttr = attrMap[nameParts[0]];
        if (mainAttr) {
            const val = this.$state[mainAttr.field];
            richTextStr += `<size=25><color=#C29655>${mainAttr.showName}:${val}</color></size>\n`;
        }

        if (this.$state.star >= 3.5) {
            this.node.getChildByName("Attribute").children[1].active = true;
            this.node.getChildByName("Attribute").children[1].getChildByName("Icon").getComponent(Label).string = nameParts[1] ?? "";
            const secondAttr = attrMap[nameParts[1]];
            if (secondAttr) {
                const val = this.$state[secondAttr.field];
                richTextStr += `<size=25><color=#C29655>${secondAttr.showName}:${val}</color></size>\n`;
            }
        }

        if (this.$state.star >= 4.5) {
            this.node.getChildByName("Attribute").children[2].active = true;
            this.node.getChildByName("Attribute").children[2].getChildByName("Icon").getComponent(Label).string = nameParts[2] ?? "";
            const thirdAttr = attrMap[nameParts[2]];
            if (thirdAttr) {
                const val = this.$state[thirdAttr.field];
                richTextStr += `<size=25><color=#C29655>${thirdAttr.showName}:${val}</color></size>\n`;
            }
        }

        // ========== 洗炼属性：xilian(技能id)、quality(品质)、value(数值) ==========
        richTextStr += `\n<size=25><color=#C29655>洗炼属性：</color></size>\n`;
        this.$state.xilianList.forEach(item => {
            const skillName = this.skillDict[item.xilian] ?? "无";
            const colorHex = qualityColor[item.quality] ?? "#C29655";
            let showVal: string;
            if ([4, 5, 6, 7].indexOf(item.xilian) !== -1) {
                showVal = `${item.value}%`;
            } else {
                showVal = `${item.value}`;
            }
            richTextStr += `<size=25><color=${colorHex}>${skillName}+${showVal}</color></size>\n`;
        });






        await util.message.eqIntroduce({ message: richTextStr })

    }
}