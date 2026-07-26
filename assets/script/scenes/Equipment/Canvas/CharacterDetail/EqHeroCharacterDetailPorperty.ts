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
        this.node.getChildByName("Name").getComponent(Label).string = "名称: " + create.name
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

        this.node.getChildByName("Zhongzu").getComponent(Label).string = cmp.get(create.camp) + "     " + create.profession

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
        let message = `基本属性\n`
        message += `攻击: ${Math.ceil(this.$state.attack)}\n\n`
        message += `洗练属性\n`
        message += `暂无开放\n\n`
        message += `技能\n`
        message += `无\n`
        await util.message.introduce({ message })
    }
}