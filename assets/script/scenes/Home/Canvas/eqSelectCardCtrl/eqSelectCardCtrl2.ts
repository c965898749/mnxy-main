import { _decorator, Color, Component, Label, Node, Prefab, RichText, Sprite, SpriteFrame, Toggle } from 'cc';
import { eqQianghuaCtrl } from '../eqQianghuaCtrl/eqQianghuaCtrl';
import { EquipmentStateCreate, xilianInfo } from 'db://assets/script/game/fight/equipment/EquipmentState';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { AttrLevelCtrl } from '../qianghua/AttrLevelCtrl';
import { menuView } from 'db://assets/script/common/common/menuView';
const { ccclass, property } = _decorator;

@ccclass('eqSelectCardCtrl2')
export class eqSelectCardCtrl2 extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    initialized = false;
    eqQianghuaCtrl: eqQianghuaCtrl = null
    public myMap = new Map<string, number>(); // 键为字符串，值为数字
    create: EquipmentStateCreate[]

    // 四个下拉选项（首项“全部”复位）：menuView1 星级 / menuView2 类型 / menuView3 职业 / menuView4 属性
    private static readonly STAR_OPTIONS = ['全部', '5星', '4.5星', '4星', '3.5星', '3星', '2.5星', '2星', '1.5星', '1星'];
    private static readonly TYPE_OPTIONS = ['全部', '兵刃', '防具', '宝具', '法器'];
    private static readonly PROFESSION_OPTIONS = ['全部', '仙灵', '神将', '武圣'];
    private static readonly ATTR_OPTIONS = ['全部', '锋利', '坚韧', '火焰', '火抗', '毒素', '毒抗', '飞弹', '弹抗', '治愈'];
    private static readonly ATTR_FIELD: Record<string, keyof EquipmentStateCreate> = {
        '锋利': 'wlAtk', '坚韧': 'wlDef', '火焰': 'hyAtk', '火抗': 'hyDef',
        '毒素': 'dsAtk', '毒抗': 'dsDef', '飞弹': 'fdAtk', '弹抗': 'fdDef', '治愈': 'zlDef',
    };

    // 各维度当前筛选值（null 表示“全部”）
    private $star: number = null
    private $type: number = null
    private $profession: string = null
    private $attr: string = null

    // 当前实际渲染的列表（过滤后的子集）：canleQianhua 按索引复位时用它，避免与全量 create 错位
    private $renderList: EquipmentStateCreate[] = []

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
        this.bindMenu("menuView1", eqSelectCardCtrl2.STAR_OPTIONS, (t) => this.onStar(t))
        this.bindMenu("menuView2", eqSelectCardCtrl2.TYPE_OPTIONS, (t) => this.onType(t))
        this.bindMenu("menuView3", eqSelectCardCtrl2.PROFESSION_OPTIONS, (t) => this.onProfession(t))
        this.bindMenu("menuView4", eqSelectCardCtrl2.ATTR_OPTIONS, (t) => this.onAttr(t))
    }

    private bindMenu(name: string, items: string[], handler: (text: string) => void) {
        const node = this.node.getChildByName(name)
        if (!node) { console.warn("[eqSelectCardCtrl2] 未找到下拉节点:", name, "（请确认场景已保存且节点名正确）"); return }
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

    private onStar(text: string) { this.$star = (!text || text === '全部') ? null : parseFloat(text.replace('星', '')); this.refresh() }
    private onType(text: string) { this.$type = (!text || text === '全部') ? null : eqSelectCardCtrl2.TYPE_OPTIONS.indexOf(text) - 1; this.refresh() }
    private onProfession(text: string) { this.$profession = (!text || text === '全部') ? null : text; this.refresh() }
    private onAttr(text: string) { this.$attr = (!text || text === '全部') ? null : text; this.refresh() }

    // 依据四个维度过滤全量 create 并重绘（选中态 myMap 保持不变）
    private refresh() {
        this.paint(this.applyFilter(this.create))
    }

    private applyFilter(list: EquipmentStateCreate[]) {
        if (this.$star != null) list = list.filter(e => e.star === this.$star)
        if (this.$type != null) list = list.filter(e => e.eqType === this.$type)
        if (this.$profession) list = list.filter(e => e.profession === this.$profession)
        if (this.$attr) {
            const field = eqSelectCardCtrl2.ATTR_FIELD[this.$attr]
            list = list.filter(e => Number(e[field]) > 0)
        }
        return list
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
            // 用当前渲染列表取原始 stackCount，避免过滤后与全量 create 索引错位
            node.getChildByName("stackCount").getComponent(Label).string = this.$renderList[i].stackCount + ""
            node.getChildByName("Toggle").getComponent(Toggle).isChecked = false
            node.getChildByName("itemCount").getComponent(Label).string = "1"
            node.getChildByName("cong").active = false
        }
    }

    // 外部入口：保存全量列表/回调/map，复位过滤并接线，再渲染（默认全部）
    async render(create: EquipmentStateCreate[], qianghuaCtrlInstance: eqQianghuaCtrl, map: Map<string, number>) {
        this.create = create
        this.myMap = map
        this.eqQianghuaCtrl = qianghuaCtrlInstance
        this.node.active = true
        this.ensureBound()
        // 重新打开视为全新选择：复位四个筛选条件与下拉显示文字
        this.$star = null; this.$type = null; this.$profession = null; this.$attr = null
        this.$boundList.forEach(b => {
            const comp = b.node && b.node.getComponent(menuView)
            if (comp) comp.showText('全部')
        })
        await this.paint(this.applyFilter(create))
    }

    // 实际渲染列表（原 render 主体）
    async paint(create: EquipmentStateCreate[]) {
        this.$renderList = create
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
        for (const label of eqSelectCardCtrl2.ATTR_OPTIONS) {
            if (label === '全部') continue
            const field = eqSelectCardCtrl2.ATTR_FIELD[label]
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
