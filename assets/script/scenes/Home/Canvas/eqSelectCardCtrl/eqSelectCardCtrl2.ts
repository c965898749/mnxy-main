import { _decorator, Color, Component, Label, Node, Prefab, Sprite, SpriteFrame, Toggle } from 'cc';
import { eqQianghuaCtrl } from '../eqQianghuaCtrl/eqQianghuaCtrl';
import { EquipmentStateCreate } from 'db://assets/script/game/fight/equipment/EquipmentState';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { AttrLevelCtrl } from '../qianghua/AttrLevelCtrl';
const { ccclass, property } = _decorator;

@ccclass('eqSelectCardCtrl2')
export class eqSelectCardCtrl2 extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    initialized = false;
    eqQianghuaCtrl: eqQianghuaCtrl = null
    public myMap = new Map<string, number>(); // 键为字符串，值为数字
    create: EquipmentStateCreate[]
    start() {

    }

    update(deltaTime: number) {

    }
    skillDict: Record<number, string> = {
        1: "诛仙", 2: "食人", 3: "驱魔", 4: "斗兽",
        5: "仙师", 6: "人杰", 7: "魔王", 8: "兽灵",
        9: "返火", 10: "辟土", 11: "逆雷", 12: "分水",
        13: "驭兵", 14: "破妄",
        15: "踏浪", 16: "破岩", 17: "驱雷", 18: "蹈火",
        19: "不侵", 20: "灭法",
        21: "突袭", 22: "闪避"
    };
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
    public backQianhua() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }
    public async queDingQianhua() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
        this.eqQianghuaCtrl.getComponent(eqQianghuaCtrl).initData(this.myMap)
    }
    public async canleQianhua() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("qianghuaCtrl").getChildByName("congCard").getChildByName("main_bg").getComponent(Sprite).spriteFrame =
            await util.bundle.load(`image/qianghua/congCard2/spriteFrame`, SpriteFrame)
        this.node.parent.getChildByName("eqQianghuaCtrl").getChildByName("congCard").getChildByName("num").getComponent(Label).string = null
        this.node.parent.getChildByName("eqQianghuaCtrl").getComponent(eqQianghuaCtrl).myMap.clear();
        const childrens = [...this.ContentNode.children]
        for (let i = 0; i < childrens.length; i++) {
            const node = childrens[i];
            node.getChildByName("Toggle").getComponent(Toggle).isChecked = false
            node.getChildByName("stackCount").getComponent(Label).string = this.create[i].stackCount + ""
            node.getChildByName("Toggle").getComponent(Toggle).isChecked = false
            node.getChildByName("itemCount").getComponent(Label).string = "1"
            node.getChildByName("cong").active = false
        }
    }


    async render(create: EquipmentStateCreate[], qianghuaCtrlInstance: eqQianghuaCtrl, map: Map<string, number>) {
        this.create = create
        this.myMap = map
        this.eqQianghuaCtrl = qianghuaCtrlInstance
        this.node.active = true
        const nodePool = util.resource.getNodePool(
            await util.bundle.load("prefab/fankuai", Prefab)
        )
        const childrens = [...this.ContentNode.children]
        for (let i = 0; i < childrens.length; i++) {
            const node = childrens[i];
            node.getChildByName("Toggle").off('toggle')
            node.getChildByName("levelUp").off('click')
            nodePool.put(node)
        }

        for (let i = 0; i < create.length; i++) {
            let item = nodePool.get()
            item.getChildByName("Toggle").active = true
            item.getChildByName("levelUp").active = false
            item.getChildByName("itemCount").active = false
            item.getChildByName("Label-001").active = false;
            item.getChildByName("stackCount").active = false;
            item.getChildByName("levelUp").active = false;
            if (create[i].stackCount > 0) {
                item.getChildByName("itemCount").active = true
                item.getChildByName("stackCount").active = true;
                item.getChildByName("levelUp").active = true;
                item.getChildByName("stackCount").getComponent(Label).string = create[i].stackCount + ""
            }
            item.getChildByName("Toggle").getComponent(Toggle).isChecked = false
            item.getChildByName("itemCount").getComponent(Label).string = "1"
            item.getChildByName("cong").active = false

            for (const [key, value] of this.myMap) {
                if (create[i].id == key + "") {
                    item.getChildByName("Toggle").getComponent(Toggle).isChecked = true
                    item.getChildByName("cong").active = true
                    if (create[i].stackCount > 0) {
                        item.getChildByName("stackCount").getComponent(Label).string = (Number(create[i].stackCount) + 1 - Number(value)) + ""
                    }
                    item.getChildByName("itemCount").getComponent(Label).string = value + ""
                }
            }
            item.getChildByName("yxjm_df_txk").children[0].getComponent(Sprite).spriteFrame =
                await util.bundle.load(`game/texture/frames/emp/${create[i].id.split('_')[0]}/spriteFrame`, SpriteFrame)
            // 渲染星级
            item.getChildByName("star-001").children.forEach(n => n.active = false)
            for (let j = 0; j < create[i].star; j++) {
                item.getChildByName("star-001").children[j].active = true
                if (j + 0.5 < create[i].star) {
                    item.getChildByName("star-001").children[j].children[0].active = true
                }
            }
            item.getChildByName("name").getComponent(Label).string = create[i].name + "  Lv" + create[i].lv + "/" + create[i].maxLv
            // 仙、佛、圣、魔、妖、兽
            const xilianStr = create[i].xilian != null ? this.skillDict[create[i].xilian] : "";
            item.getChildByName("Camp").getComponent(Label).string = create[i].profession + " " + xilianStr
            item.getChildByName("yxjm_df_txk").getChildByName("flyup").active = true
            item.getChildByName("yxjm_df_txk").getChildByName("flyup").getComponent(Label).color = new Color(this.rankColorDict[create[i].flyup]);
            item.getChildByName("yxjm_df_txk").getChildByName("flyup").getComponent(Label).string = this.rankDict[create[i].flyup] || ""
            // // 绑定事件
            // this.Item.children[goIntoNum - 1].on("click", () => { this.clickFun(create[i]) })
            item.getChildByName("id").getComponent(Label).string = create[i].uuid + "";
            // item.getChildByName("Toggle").on('toggle', callback, this);
            this.ContentNode.addChild(item)
            item.getComponent(AttrLevelCtrl).initData(this)
            continue
        }
    }

}


