import { _decorator, Button, Component, instantiate, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { getConfig } from 'db://assets/script/common/config/config';
import { CharacterEnum } from 'db://assets/script/game/fight/character/CharacterEnum';
import { CharacterState, CharacterStateCreate } from 'db://assets/script/game/fight/character/CharacterState';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { menuView } from 'db://assets/script/common/common/menuView';
const { ccclass, property } = _decorator;

@ccclass('SelectCardCtrl')
export class SelectCardCtrl extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    initialized = false;
    $qianghuaCtrl: Node
    $state: CharacterState;

    // 四个下拉选项（首项“全部”复位）：menuView1 星级 / menuView2 阵营 / menuView3 职业 / menuView4 等级
    private static readonly STAR_OPTIONS = ['全部', '5星', '4.5星', '4星', '3.5星', '3星', '2.5星', '2星', '1.5星', '1星'];
    private static readonly CAMP_OPTIONS = ['全部', '仙', '妖', '人', '兽'];
    private static readonly PROFESSION_OPTIONS = ['全部', '仙灵', '神将', '武圣'];
    private static readonly LEVEL_OPTIONS = ['全部', '1-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61-70', '71-80', '81-90', '91-100'];
    // 阵营显示名 → camp 值
    private static readonly CAMP_VALUE: Record<string, string> = { '仙': 'sacred', '妖': 'dark', '人': 'machine', '兽': 'nature' };

    // 各维度当前筛选值（null 表示“全部”）
    private $star: number = null
    private $camp: string = null
    private $profession: string = null
    private $lvRange: [number, number] = null

    // 外部传入的原始列表与点击回调（过滤基于原始列表，点击仍用原回调）
    private $sourceList: CharacterStateCreate[] = []
    private $clickFun: (characters: CharacterStateCreate, node: Node) => any = null

    // 下拉是否已接线，以及已绑定的节点/回调（供解绑）
    private $bound: boolean = false
    private $boundList: { node: Node, handler: (text: string) => void }[] = []

    start() {
        this.ensureBound()
    }

    // 幂等接线：start 与首次 render 都会调用，避免节点未激活时 start 未执行导致漏接
    private ensureBound() {
        if (this.$bound) return
        this.$bound = true
        this.bindMenu("menuView1", SelectCardCtrl.STAR_OPTIONS, (t) => this.onStar(t))
        this.bindMenu("menuView2", SelectCardCtrl.CAMP_OPTIONS, (t) => this.onCamp(t))
        this.bindMenu("menuView3", SelectCardCtrl.PROFESSION_OPTIONS, (t) => this.onProfession(t))
        this.bindMenu("menuView4", SelectCardCtrl.LEVEL_OPTIONS, (t) => this.onLevel(t))
    }

    private bindMenu(name: string, items: string[], handler: (text: string) => void) {
        const node = this.node.getChildByName(name)
        if (!node) { console.warn("[SelectCardCtrl] 未找到下拉节点:", name, "（请确认场景已保存且节点名正确）"); return }
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

    private onStar(text: string) {
        this.$star = (!text || text === '全部') ? null : parseFloat(text.replace('星', ''))
        this.refresh()
    }
    private onCamp(text: string) {
        this.$camp = (!text || text === '全部') ? null : SelectCardCtrl.CAMP_VALUE[text]
        this.refresh()
    }
    private onProfession(text: string) {
        this.$profession = (!text || text === '全部') ? null : text
        this.refresh()
    }
    private onLevel(text: string) {
        if (!text || text === '全部') this.$lvRange = null
        else { const p = text.split('-'); this.$lvRange = [parseInt(p[0]), parseInt(p[1])] }
        this.refresh()
    }

    // 依据当前四个维度过滤原始列表并重绘
    private refresh() {
        this.paint(this.applyFilter(this.$sourceList))
    }

    private applyFilter(list: CharacterStateCreate[]) {
        if (this.$star != null) list = list.filter(c => c.star === this.$star)
        if (this.$camp) list = list.filter(c => c.camp === this.$camp)
        if (this.$profession) list = list.filter(c => c.profession === this.$profession)
        if (this.$lvRange) list = list.filter(c => c.lv >= this.$lvRange[0] && c.lv <= this.$lvRange[1])
        return list
    }

    public backQianhua() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }

    // 外部入口：传入全量列表与点击回调；每次打开复位过滤并接线
    async render(create: CharacterStateCreate[], clickFun?: (characters: CharacterStateCreate, node: Node) => any) {
        this.node.active = true
        this.ensureBound()
        this.$sourceList = create
        this.$clickFun = clickFun
        // 重新打开视为全新选择：复位四个筛选条件与下拉显示文字
        this.$star = null; this.$camp = null; this.$profession = null; this.$lvRange = null
        this.$boundList.forEach(b => {
            const comp = b.node && b.node.getComponent(menuView)
            if (comp) comp.showText('全部')
        })
        await this.paint(this.applyFilter(create))
    }

    // 实际渲染列表（原 render 主体）
    async paint(create: CharacterStateCreate[]) {
        const nodePool = util.resource.getNodePool(
            await util.bundle.load("prefab/fankuai", Prefab)
        )
        const childrens = [...this.ContentNode.children]
        for (let i = 0; i < childrens.length; i++) {
            const node = childrens[i];
            node.getChildByName("Button").off("click")
            nodePool.put(node)
        }
        for (let i = 0; i < create.length; i++) {
            let item = nodePool.get()
            item.getChildByName("Button").active = true
            item.getChildByName("yxjm_df_txk").children[0].getComponent(Sprite).spriteFrame =
                await util.bundle.load(`game/texture/frames/hero/Header/${create[i].id}/spriteFrame`, SpriteFrame)
            // 渲染星级
            item.getChildByName("star-001").children.forEach(n => { n.active = false; if (n.children.length > 0) n.children[0].active = false; })
            for (let j = 0; j < create[i].star; j++) {
                item.getChildByName("star-001").children[j].active = true
                if (j + 0.5 < create[i].star) {
                    item.getChildByName("star-001").children[j].children[0].active = true
                }
            }
            item.getChildByName("stackCount").getComponent(Label).string = create[i].stackCount + ""
            item.getChildByName("name").getComponent(Label).string = create[i].name + "  Lv" + create[i].lv + "/" + create[i].maxLv
            // 仙、佛、圣、魔、妖、兽
            const cmp = new Map([
                ['sacred', '仙界'],
                ['nature', '兽界'],
                ['machine', '人界'],
                ['dark', '妖界'],
            ]);

            const position = ["仙灵", "神将", "武圣"]
            item.getChildByName("Camp").getComponent(Label).string = cmp.get(create[i].camp) + "." + create[i].profession
            // // 绑定事件
            item.getChildByName("Button").getComponent(Button).transition = 3
            item.getChildByName("Button").getComponent(Button).zoomScale = 0.9
            item.getChildByName("Button").on("click", () => { if (this.$clickFun) this.$clickFun(create[i], this.node) })
            this.ContentNode.addChild(item)
            continue
        }
    }

}
