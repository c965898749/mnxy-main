import { _decorator, Color, Component, Label, Node, Prefab, RichText, Sprite, SpriteFrame, Toggle } from 'cc';
import { EqFengjieCtrl } from '../EqFengjieCtrl/EqFengjieCtrl';
import { EquipmentStateCreate, xilianInfo } from 'db://assets/script/game/fight/equipment/EquipmentState';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { AttrLevelCtrl } from '../qianghua/AttrLevelCtrl';
import { menuView } from 'db://assets/script/common/common/menuView';
const { ccclass, property } = _decorator;

@ccclass('eqSelectCardCtrl3')
export class eqSelectCardCtrl3 extends Component {
  @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    initialized = false;
    eqFengjieCtrl: EqFengjieCtrl = null
    public myMap = new Map<string, number>(); // 键为字符串，值为数字
    create: EquipmentStateCreate[]

    // 四个下拉选项（首项“全部”复位）：menuView1 星级 / menuView2 类型 / menuView3 职业 / menuView4 属性
    private static readonly STAR_OPTIONS = ['全部', '5星', '4.5星', '4星', '3.5星', '3星', '2.5星', '2星', '1.5星', '1星'];
    private static readonly TYPE_OPTIONS = ['全部', '兵刃', '防具', '宝具', '法器'];
    private static readonly PROFESSION_OPTIONS = ['全部', '仙灵', '神将', '武圣'];
    private static readonly ATTR_OPTIONS = ['全部', '锋利', '坚韧', '火焰', '火抗', '毒素', '毒抗', '飞弹', '弹抗', '治愈'];
    // 属性名 → 装备字段（该字段值 > 0 即视为拥有此属性）
    private static readonly ATTR_FIELD: Record<string, keyof EquipmentStateCreate> = {
        '锋利': 'wlAtk', '坚韧': 'wlDef', '火焰': 'hyAtk', '火抗': 'hyDef',
        '毒素': 'dsAtk', '毒抗': 'dsDef', '飞弹': 'fdAtk', '弹抗': 'fdDef', '治愈': 'zlDef',
    };

    // 各维度当前筛选值（null 表示“全部”）
    private $star: number = null
    private $type: number = null
    private $profession: string = null
    private $attr: string = null
    // 顶部按钮（全部/普通/稀有/传说）的星级区间过滤
    private $starRange: ((star: number) => boolean) = null

    // 下拉接线状态
    private $bound: boolean = false
    private $boundList: { node: Node, handler: (text: string) => void }[] = []

    start() {
        this.ensureBound()
    }

    // 幂等接线：start 与首次 render 都会调用
    private ensureBound() {
        if (this.$bound) return
        this.$bound = true
        this.bindMenu("menuView1", eqSelectCardCtrl3.STAR_OPTIONS, (t) => this.onStar(t))
        this.bindMenu("menuView2", eqSelectCardCtrl3.TYPE_OPTIONS, (t) => this.onType(t))
        this.bindMenu("menuView3", eqSelectCardCtrl3.PROFESSION_OPTIONS, (t) => this.onProfession(t))
        this.bindMenu("menuView4", eqSelectCardCtrl3.ATTR_OPTIONS, (t) => this.onAttr(t))
    }

    private bindMenu(name: string, items: string[], handler: (text: string) => void) {
        const node = this.node.getChildByName(name)
        if (!node) { console.warn("[eqSelectCardCtrl3] 未找到下拉节点:", name, "（请确认场景已保存且节点名正确）"); return }
        const comp = node.getComponent(menuView)
        if (comp) comp.setItems(items)
        node.on('menu-selected', handler, this)
        this.$boundList.push({ node, handler })
    }

    protected onDestroy() {
        this.$boundList.forEach(b => {
            if (b.node && b.node.isValid) b.node.off('menu-selected', b.handler, this)
        })
        this.$boundList = []
        this.$bound = false
    }

    private onStar(text: string) { this.$star = (!text || text === '全部') ? null : parseFloat(text.replace('星', '')); this.applyVisibility() }
    private onType(text: string) { this.$type = (!text || text === '全部') ? null : eqSelectCardCtrl3.TYPE_OPTIONS.indexOf(text) - 1; this.applyVisibility() }
    private onProfession(text: string) { this.$profession = (!text || text === '全部') ? null : text; this.applyVisibility() }
    private onAttr(text: string) { this.$attr = (!text || text === '全部') ? null : text; this.applyVisibility() }

    // 综合顶部区间 + 四个下拉维度判断单件是否显示（不重建列表，保持与 this.create 的索引对齐）
    private passFilter(c: EquipmentStateCreate): boolean {
        if (this.$starRange && !this.$starRange(c.star)) return false
        if (this.$star != null && c.star !== this.$star) return false
        if (this.$type != null && c.eqType !== this.$type) return false
        if (this.$profession && c.profession !== this.$profession) return false
        if (this.$attr) {
            const field = eqSelectCardCtrl3.ATTR_FIELD[this.$attr]
            if (!(Number(c[field]) > 0)) return false
        }
        return true
    }

    // 依据当前所有过滤条件切换每个 item 的显隐
    private applyVisibility() {
        for (let i = 0; i < this.create.length; i++) {
            const node = this.ContentNode.children[i]
            if (!node) continue
            node.active = this.passFilter(this.create[i])
        }
    }

    update(deltaTime: number) {

    }
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

    // --- 按星级区间筛选显示（顶部按钮：全部/普通/稀有/传说）---
    private filterByStar(match: (star: number) => boolean) {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.$starRange = match;
        this.applyVisibility();
    }
    public filterBelow3Star() { this.filterByStar(s => s < 3.5); }
    public filter3HalfStar()   { this.filterByStar(s => s >= 3.5 && s < 4); }
    public filter4Star()       { this.filterByStar(s => s >= 4 && s < 4.5); }
    public filter4HalfStar()   { this.filterByStar(s => s >= 4.5); }
    public filterAll()         { this.filterByStar(() => true); }
    public showAll()           { this.filterByStar(() => true); }

    // 一键选择：把所有显示的装备全部勾选进分解列表（默认每个选1个）
    public selectAll() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.myMap.clear();
        for (let i = 0; i < this.create.length; i++) {
            const node = this.ContentNode.children[i];
            if (!node.active) continue;
            const c = this.create[i];
            this.myMap.set(c.uuid + "", 1);
            node.getChildByName("Toggle").getComponent(Toggle).isChecked = true;
            node.getChildByName("cong").active = true;
            node.getChildByName("itemCount").getComponent(Label).string = "1";
            if (c.stackCount > 0) {
                node.getChildByName("stackCount").getComponent(Label).string = (c.stackCount - 1) + "";
            }
        }
    }

    public backQianhua() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }
    public async queDingQianhua() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
        this.eqFengjieCtrl.getComponent(EqFengjieCtrl).initData(this.myMap)
    }
    public async canleQianhua() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("qianghuaCtrl").getChildByName("congCard").getChildByName("main_bg").getComponent(Sprite).spriteFrame =
            await util.bundle.load(`image/qianghua/congCard2/spriteFrame`, SpriteFrame)
        this.node.parent.getChildByName("eqQianghuaCtrl").getChildByName("congCard").getChildByName("num").getComponent(Label).string = null
        this.node.parent.getChildByName("eqQianghuaCtrl").getComponent(EqFengjieCtrl).myMap.clear();
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


    async render(create: EquipmentStateCreate[], qianghuaCtrlInstance: EqFengjieCtrl, map: Map<string, number>) {
        this.create = create
        this.myMap = map
        this.eqFengjieCtrl = qianghuaCtrlInstance
        this.node.active = true
        this.ensureBound()
        // 重新打开视为全新选择：复位四个下拉与顶部区间过滤，下拉文字回“全部”
        this.$star = null; this.$type = null; this.$profession = null; this.$attr = null; this.$starRange = null
        this.$boundList.forEach(b => {
            const comp = b.node && b.node.getComponent(menuView)
            if (comp) comp.showText('全部')
        })
        const nodePool = util.resource.getNodePool(
            await util.bundle.load("prefab/fankuai2", Prefab)
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
            item.getChildByName("star-001").children.forEach(n => { n.active = false; if (n.children.length > 0) n.children[0].active = false; })
            for (let j = 0; j < create[i].star; j++) {
                item.getChildByName("star-001").children[j].active = true
                if (j + 0.5 < create[i].star) {
                    item.getChildByName("star-001").children[j].children[0].active = true
                }
            }
            item.getChildByName("name").getComponent(Label).string = create[i].name + "  Lv" + create[i].lv + "/" + create[i].maxLv
            // 仙、佛、圣、魔、妖、兽
            item.getChildByName("Camp").getComponent(RichText).string = `<color=#C9821A><size=22>${create[i].profession}</size></color> <color=#FFFFFF><size=16>${this.formatEqAttrNames(create[i])}</size></color><br/>` + this.formatRefineList(create[i].xilianList)
            // 已穿戴（goIntoNum != 0）时显示 isUse，否则隐藏（与装备头像 isBattle 同一口径）
            const isUseNode = item.getChildByName("isUse")
            if (isUseNode) isUseNode.active = create[i].goIntoNum != 0
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
        // 列表建好后统一按当前过滤条件设置显隐
        this.applyVisibility()
    }
    qualityColor: Record<number, string> = {
        0: "#88ff88", //普通绿色
        1: "#bb77ff", //优秀紫色
        2: "#ffdd77"  //极品金色
    };

    // 装备属性名：按四维字段值 >0 反查（顺序同 ATTR_OPTIONS），如「锋利 火焰 治愈」；种族后展示
    private formatEqAttrNames(create: EquipmentStateCreate): string {
        if (!create) return ''
        const names: string[] = []
        for (const label of eqSelectCardCtrl3.ATTR_OPTIONS) {
            if (label === '全部') continue
            const field = eqSelectCardCtrl3.ATTR_FIELD[label]
            if (field && Number(create[field]) > 0) names.push(`${label}+${create[field]}`)
        }
        return names.join(' ')
    }

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
            const line = `<color=${qColor}><size=14>${attrName}+${valStr}</size></color>`;
            // const line = `【${attrName}】${qName}：${valStr}`;
            lines.push(line);
        }

        // lines.push(`</size>`);
        return lines.join("   ");
    }
}


