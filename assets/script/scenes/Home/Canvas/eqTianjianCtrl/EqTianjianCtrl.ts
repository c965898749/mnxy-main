import { _decorator, Color, Component, instantiate, Label, Node, Prefab, sp, Sprite, SpriteFrame } from 'cc';
import { questionCrtl } from '../questionCrtl/questionCrtl';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { LCoin } from 'db://assets/script/common/common/Language';
import { EquipmentStateCreate } from 'db://assets/script/game/fight/equipment/EquipmentState';
import { util } from 'db://assets/script/util/util';
import { SelectEqCardCtrl } from '../qianghua/SelectEqCardCtrl';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('EqTianjianCtrl')
export class EqTianjianCtrl extends Component {
    @property(Node)
    hechen: Node
    @property(Node)
    bronze: Node = null;
    @property(Node)
    darkSteel: Node = null;
    @property(Node)
    purpleGold: Node = null;
    @property(Node)
    crystal: Node = null;
    initialized = false;
    @property(Node)
    selecEquipment: Node
    private $state: EquipmentStateCreate
    rankDict: Record<number, string> = {
        0: "",
        1: "法",
        2: "灵",
        3: "宝",
        4: "古",
        5: "造",
        6: "珍",
        7: "通",
        8: "玄",
        9: "仙"
    };
    // 品级对应色值，品级越高越鲜艳
    rankColorDict: Record<number, string> = {
        0: "#888888", // 凡器 灰
        1: "#7399FF", // 法器 浅蓝
        2: "#33CCFF", // 灵器 天蓝
        3: "#66FFCC", // 法宝 青碧
        4: "#33FF88", // 古宝 翠绿
        5: "#FFFF33", // 造物 亮金
        6: "#FFCC00", // 灵宝 橙金
        7: "#FF6633", // 通天 橙红
        8: "#FF3366", // 玄天 玫红
        9: "#FF00FF"  // 仙器 亮紫最高阶
    };
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
        this.bronze.getComponent(Label).string = LCoin(config.userData.bronze)
        this.darkSteel.getComponent(Label).string = LCoin(config.userData.darkSteel)
        this.purpleGold.getComponent(Label).string = LCoin(config.userData.purpleGold)
        this.crystal.getComponent(Label).string = LCoin(config.userData.crystal)
    }

    update(deltaTime: number) {

    }

    async questry() {
let message = `<size=24><color=#FFD700><b>天匠锻造材料消耗一览</b></color></size>

<size=22><color=#FFFFFF><b>基础规则</b></size>
<size=18><color=#E0E0E0>
- 凡器无法开启天匠，法器及以上装备可锻造
- 十阶完整品级：凡器、法器、灵器、法宝、古宝、造物、灵宝、通天、玄天、仙器
- 品级越高，锻造所需材料种类越多、消耗量逐级递增，高阶单类材料消耗均超十万
- 锻造圆满后，消耗突破材料晋升下一阶装备品级
</color></size>

<size=22><color=#FFFFFF><b>单件锻造总消耗明细</b></size>
<size=16><color=#E0E0E0>
品级　　青铜矿　　玄铁矿　　紫金矿　月华晶石
凡器　　0　　　　0　　　　0　　　0
法器　　100000　 —　　　　—　　　—
灵器　　120000　 —　　　　—　　　—
法宝　　150000　 100000　 —　　　—
古宝　　180000　 120000　 —　　　—
造物　　220000　 150000　 100000　—
灵宝　　260000　 180000　 130000　—
通天　　310000　 220000　 160000　100000
玄天　　360000　 260000　 190000　130000
仙器　　420000　 300000　 230000　160000
</color></size>

<size=22><color=#FFFFFF><b>锻造加成规则</b></size>
<size=18><color=#E0E0E0>
- 完成天匠锻造，装备基础全属性永久提升<color=#00FF99>3%</color>
- 凡器解锁基础单条洗炼词条
- 仙器锻造完成解锁全套隐藏套装效果与法则抗性
</color></size>`


        this.node.parent.getChildByName("questionCrtl")
            .getComponent(questionCrtl)
            .read(message)
    }


    async empOnclick() {
        // AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        var cahracterQueue = []
        cahracterQueue = config.userData.equipments
        await this.render(cahracterQueue)
    }
    async render(characterQueue: EquipmentStateCreate[]) {
        const holAnimationPrefab = await util.bundle.load("prefab/SelectEqCardCtrl", Prefab)
        const holAnimationNode = instantiate(holAnimationPrefab)
        this.node.parent.addChild(holAnimationNode)
        await holAnimationNode
            .getComponent(SelectEqCardCtrl)
            .render(characterQueue, async (c, n) => {
                n.removeFromParent();
                n.destroy()
                this.selecEquipment.getComponent(Sprite).spriteFrame =
                    await util.bundle.load(`game/texture/frames/emp/${c.id.split('_')[0]}/spriteFrame`, SpriteFrame)
                this.selecEquipment.getChildByName("flyup").getComponent(Label).color = new Color(this.rankColorDict[c.flyup]);
                this.selecEquipment.getChildByName("flyup").getComponent(Label).string = this.rankDict[c.flyup] || ""
                this.$state = c
                return
            })
    }

    async hechenBtn2() {
        AudioMgr.inst.playOneShot("sound/other/click");
        if (!this.$state) {
            return await util.message.prompt({ message: "请选择装备！" })
        }
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId,
            id: this.$state.uuid
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "tianJianInfo", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    let hut = this.hechen.getComponent(sp.Skeleton)
                    hut.node.active = true
                    AudioMgr.inst.playOneShot("sound/other/getcard");
                    hut.setAnimation(0, "animation", false)
                    hut.setCompleteListener(() => {
                        hut.node.active = false;
                        var info = data.data;
                        config.userData.bronze = info.bronze
                        config.userData.darkSteel = info.darkSteel
                        config.userData.purpleGold = info.purpleGold
                        config.userData.crystal = info.crystal
                        config.userData.equipments = info.eqCharactersList
                        const create = config.userData.equipments.find(equip => equip.uuid === this.$state.uuid);
                        this.selecEquipment.getChildByName("flyup").getComponent(Label).string = this.rankDict[create.flyup] || ""
                        this.selecEquipment.getChildByName("flyup").getComponent(Label).color = new Color(this.rankColorDict[create.flyup]);    
                        localStorage.setItem("UserConfigData", JSON.stringify(config))
                        this.refresh()
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
    goback() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false;
    }

}


