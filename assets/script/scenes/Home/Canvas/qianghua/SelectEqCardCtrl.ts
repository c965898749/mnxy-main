import { _decorator, Button, Color, Component, instantiate, Label, Node, Prefab, RichText, Sprite, SpriteFrame } from 'cc';
import { getConfig } from 'db://assets/script/common/config/config';
import { EquipmentState, EquipmentStateCreate, xilianInfo } from 'db://assets/script/game/fight/equipment/EquipmentState';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

@ccclass('SelectEqCardCtrl')
export class SelectEqCardCtrl extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    initialized = false;
    $qianghuaCtrl: Node
    $state: EquipmentState;
    start() {
        // this.initData()
    }

    onEnable() {
        // if (!this.initialized) {
        //     // 初始化代码
        //     this.initialized = true;
        // } else {
        //     // this.refresh()
        //     this.initData()
        // }

    }
    update(deltaTime: number) {

    }
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

    formatRefineList(xilianList?: xilianInfo[]): string {



        const lines: string[] = [];
        // lines.push(`<size=18>`);

        for (const item of xilianList) {
            const attrName = this.skillDict[item.xilian];
            const qColor = this.qualityColor[item.quality];
            let valStr: string;
            //4‑7暴击、暴抗、闪避、命中保留1位小数；其余直接数字
            if (item.xilian >= 4 && item.xilian <= 7) {
                valStr = (Number(item.value)).toFixed(1) + '%';
            } else {
                valStr = String(item.value);
            }
            const line = `<color=${qColor}><size=20>${attrName}+${valStr}</size></color>`;
            // const line = `【${attrName}】${qName}：${valStr}`;
            lines.push(line);
        }

        // lines.push(`</size>`);
        return lines.join("   ");
    }
    public backQianhua() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }

    async render(create: EquipmentStateCreate[], clickFun?: (characters: EquipmentStateCreate, node: Node) => any) {
        this.node.active = true
        const nodePool = util.resource.getNodePool(
            await util.bundle.load("prefab/fankuai2", Prefab)
        )
        const childrens = [...this.ContentNode.children]
        for (let i = 0; i < childrens.length; i++) {
            const node = childrens[i];
            // console.log(i)
            node.getChildByName("Button").off("click")
            nodePool.put(node)
        }
        for (let i = 0; i < create.length; i++) {
            let item = nodePool.get()
            item.getChildByName("Button").active = true
            item.getChildByName("yxjm_df_txk").children[0].getComponent(Sprite).spriteFrame =
                await util.bundle.load(`game/texture/frames/emp/${create[i].id.split('_')[0]}/spriteFrame`, SpriteFrame)
            const flyupNode = item.getChildByName("yxjm_df_txk")?.getChildByName("flyup");
            const labelComp = flyupNode?.getComponent(Label);
            // 单独只对这一行做安全判空，不处理节点获取逻辑
            const colorVal = this.rankColorDict[create[i].flyup];
            if (labelComp && colorVal) {
                labelComp.color = new Color(colorVal);
            }


            item.getChildByName("yxjm_df_txk").getChildByName("flyup").getComponent(Label).string = this.rankDict[create[i].flyup] || ""
            item.getChildByName("yxjm_df_txk").getChildByName("flyup").active = true
            // 渲染星级
            item.getChildByName("star-001").children.forEach(n => n.active = false)
            for (let j = 0; j < create[i].star; j++) {
                item.getChildByName("star-001").children[j].active = true
                if (j + 0.5 < create[i].star) {
                    item.getChildByName("star-001").children[j].children[0].active = true
                }
            }
            item.getChildByName("stackCount").active = false
            item.getChildByName("Label-001").active = false
            item.getChildByName("name").getComponent(Label).string = create[i].name + "  Lv" + create[i].lv + "/" + create[i].maxLv
            // 仙、佛、圣、魔、妖、兽
            const cmp = new Map([
                ['sacred', '仙界'],
                ['nature', '兽界'],
                ['machine', '人界'],
                ['dark', '妖界'],
            ]);

            // const position = ["仙灵", "神将", "武圣"]
            // const richText = child.getComponent(RichText);
            // if (richText) {
            //     richText.string = this.formatRefineList(create.xilianList[i]);
            // }
            item.getChildByName("Camp").getComponent(RichText).string = `<color=#C9821A><size=30>${create[i].profession}</size></color>` + " " + this.formatRefineList(create[i].xilianList)
            // // 绑定事件
            item.getChildByName("Button").getComponent(Button).transition = 3
            item.getChildByName("Button").getComponent(Button).zoomScale = 0.9
            item.getChildByName("Button").on("click", () => { if (clickFun) clickFun(create[i], this.node) })
            this.ContentNode.addChild(item)
            continue
        }
    }

}


