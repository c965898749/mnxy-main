import { _decorator, Component, instantiate, Label, Node, Prefab, RichText, Sprite, SpriteFrame } from 'cc';
import { util } from '../../../../util/util';
import { CharacterEnum } from '../../../../game/fight/character/CharacterEnum';
import { EquipmentStateCreate, xilianInfo } from 'db://assets/script/game/fight/equipment/EquipmentState';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { EqLianHuaCtrl } from 'db://assets/script/scenes/Home/Canvas/EqLianHuaCtrl/EqLianHuaCtrl';
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

    // 属性名分段 -> 显示名与取值字段 的统一映射（面板与弹窗共用，避免重复分叉）
    static readonly ATTR_MAP: Record<string, { showName: string; field: keyof EquipmentStateCreate }> = {
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

    // 根据属性名分段取对应数值（找不到映射时返回空串）
    getAttrValue(namePart: string, create: EquipmentStateCreate): string {
        const attr = EqHeroCharacterDetailPorperty.ATTR_MAP[namePart];
        return attr ? String(create[attr.field]) : "";
    }

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

        const attrNode = this.node.getChildByName("Attribute");
        const nameParts = create.name.split('.');
        const attrCount = create.star >= 4.5 ? 3 : create.star >= 3.5 ? 2 : 1;
        for (let idx = 0; idx < attrCount; idx++) {
            const child = attrNode.children[idx];
            child.active = true;
            const namePart = nameParts[idx];
            child.getChildByName("Icon").getComponent(Label).string = namePart ?? "";
            child.getChildByName("Value").getComponent(Label).string = this.getAttrValue(namePart, create);
        }
        // 仙、佛、圣、魔、妖、兽
        const cmp = new Map([
            ['sacred', '仙界'],
            ['nature', '兽界'],
            ['machine', '人界'],
            ['dark', '妖界'],
        ]);

        this.node.getChildByName("Zhongzu").getComponent(Label).string = create.profession + ""
        // 技能：显示“使用中技能名称 Lv等级”（等级由后端按宝石换算，换宝石后需刷新）
        await this.refreshSkillValue(create)
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
        // 先判空数组，同时避免children越界
        if (create?.xilianList && create.xilianList.length > 0) {
            const xilianNode = this.node.getChildByName("Xilian");
            if (xilianNode) {
                for (let i = 0; i < create.xilianList.length; i++) {
                    const child = xilianNode.children[i];
                    if (!child) continue;
                    child.active = true;
                    const richText = child.getComponent(RichText);
                    if (richText) {
                        richText.string = this.formatRefineList(create.xilianList[i]);
                    }
                }
            }
        }


        this.node.getChildByName("sell").off("click")
        if (create.goIntoNum != 0) {
            this.node.getChildByName("sell").active = true
            this.node.getChildByName("sell").on("click", () => { if (clickFun) clickFun(create, this.node) })
        } else {
            this.node.getChildByName("sell").active = false
        }
        this.node.getChildByName("suo").off("click")
        if (create.isSuo == 1) {
            this.node.getChildByName("suo").getComponent(Sprite).spriteFrame = await util.bundle.load("image/ui/suo_g/spriteFrame", SpriteFrame);
        } else {
            this.node.getChildByName("suo").getComponent(Sprite).spriteFrame = await util.bundle.load("image/ui/suo_k/spriteFrame", SpriteFrame);
        }
        this.node.getChildByName("suo").on("click", async () => {
            AudioMgr.inst.playOneShot("sound/other/click");
            const config = getConfig();
            const token = getToken();
            const postData = { token: token, id: create.uuid + "", userId: config.userData.userId };
            const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(postData) };
            fetch(config.ServerUrl.url + "toggleEquipSuo", options)
                .then(r => r.json())
                .then(async data => {
                    if (data.success == 1) {
                        create.isSuo = data.data;
                        // 同步更新缓存中的装备锁状态
                        const equip = config.userData.equipments.find(e => e.uuid === create.uuid);
                        if (equip) equip.isSuo = data.data;
                        if (create.isSuo == 1) {
                            this.node.getChildByName("suo").getComponent(Sprite).spriteFrame = await util.bundle.load("image/ui/suo_g/spriteFrame", SpriteFrame);
                        } else {
                            this.node.getChildByName("suo").getComponent(Sprite).spriteFrame = await util.bundle.load("image/ui/suo_k/spriteFrame", SpriteFrame);
                        }
                        localStorage.setItem("UserConfigData", JSON.stringify(config));
                    }
                });
        });
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
     * 拉取该装备“使用中”技能并显示为“名称 Lv等级”；无技能则显示“无”。
     * 技能等级由后端根据宝石换算，因此换宝石后需再次调用以动态刷新。
     */
    async refreshSkillValue(create: EquipmentStateCreate) {
        const skillNode = this.node.getChildByName("skill")
        if (!skillNode) return
        const valueNode = skillNode.getChildByName("Value")
        const lab = valueNode ? valueNode.getComponent(Label) : null
        if (!lab) return
        if (!create || !create.uuid) { lab.string = "无"; return }
        const config = getConfig()
        const token = getToken()
        try {
            const resp = await fetch(config.ServerUrl.url + "eqSkillList", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token, userId: config.userData.userId, id: create.uuid + "" })
            })
            if (!resp.ok) { lab.string = "无"; return }
            const data = await resp.json()
            if (data && data.success == '1' && data.data) {
                const list = data.data.skillList || []
                const active = list.find(s => s.isActive == 1)
                if (active) {
                    const lv = active.skillLevel != null ? active.skillLevel : data.data.skillLevel
                    lab.string = (active.name || "") + " Lv" + lv
                } else {
                    lab.string = "无"
                }
            } else {
                lab.string = "无"
            }
        } catch (e) {
            lab.string = "无"
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
                    // 换宝石后技能等级随之变化，刷新技能显示
                    await this.refreshSkillValue(create);
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
        const qualityColor: Record<number, string> = {
            0: "#88ff88", //普通绿色
            1: "#bb77ff", //优秀紫色
            2: "#ffdd77"  //极品金色
        };

        let richTextStr = `\n<size=25><color=#C29655>基础属性：</color></size>\n`;
        const nameParts = this.$state.name.split('.');
        const attrCount = this.$state.star >= 4.5 ? 3 : this.$state.star >= 3.5 ? 2 : 1;

        for (let idx = 0; idx < attrCount; idx++) {
            const namePart = nameParts[idx];
            // 同步面板属性显示，保持与 renderProperty 一致
            const child = this.node.getChildByName("Attribute").children[idx];
            child.active = true;
            child.getChildByName("Icon").getComponent(Label).string = namePart ?? "";

            const attr = EqHeroCharacterDetailPorperty.ATTR_MAP[namePart];
            if (attr) {
                const val = this.$state[attr.field];
                richTextStr += `<size=25><color=#C29655>${attr.showName}:${val}</color></size>\n`;
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

    async openSkillBox() {
        AudioMgr.inst.playOneShot("sound/other/click");
        if (!this.$state) {
            util.message.confirm({ message: "未选中装备" })
            return
        }
        // EqLianHuaCtrl 是预制体（prefab/EqLianHuaCtrl），需实例化后挂到父节点；
        // 先按名字复用已创建的实例，避免多次点击叠加。
        let panel = this.node.parent.getChildByName("EqLianHuaCtrl")
        if (!panel) {
            const fab = await util.bundle.load("prefab/EqLianHuaCtrl", Prefab)
            panel = instantiate(fab)
            this.node.parent.addChild(panel)
        }
        panel.active = true
        // 传入回调：面板内“保存新技能/切换使用中”后，外层详情的 skill 行同步刷新
        await panel.getComponent(EqLianHuaCtrl).open(this.$state, () => this.refreshSkillValue(this.$state))
    }
}