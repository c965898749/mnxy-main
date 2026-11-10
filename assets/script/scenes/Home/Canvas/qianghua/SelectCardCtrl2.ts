import { _decorator, Component, EventHandler, instantiate, Label, Node, Prefab, Sprite, SpriteFrame, Toggle, ToggleComponent } from 'cc';
import { getConfig } from 'db://assets/script/common/config/config';
import { CharacterEnum } from 'db://assets/script/game/fight/character/CharacterEnum';
import { CharacterStateCreate } from 'db://assets/script/game/fight/character/CharacterState';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { qianghuaCtrl } from './qianghuaCtrl';
import { AttrLevelCtrl } from './AttrLevelCtrl';
import { menuView } from 'db://assets/script/common/common/menuView';
const { ccclass, property } = _decorator;

@ccclass('SelectCardCtrl2')
export class SelectCardCtrl2 extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    initialized = false;
    qianghuaCtrl: qianghuaCtrl = null
    public myMap = new Map<string, number>(); // 键为字符串，值为数字
    create: CharacterStateCreate[]

    // 四个下拉选项（首项“全部”复位）：menuView1 星级 / menuView2 阵营 / menuView3 职业 / menuView4 等级
    private static readonly STAR_OPTIONS = ['全部', '5星', '4.5星', '4星', '3.5星', '3星', '2.5星', '2星', '1.5星', '1星'];
    private static readonly CAMP_OPTIONS = ['全部', '仙', '妖', '人', '兽'];
    private static readonly PROFESSION_OPTIONS = ['全部', '仙灵', '神将', '武圣'];
    private static readonly LEVEL_OPTIONS = ['全部', '1-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61-70', '71-80', '81-90', '91-100'];
    private static readonly CAMP_VALUE: Record<string, string> = { '仙': 'sacred', '妖': 'dark', '人': 'machine', '兽': 'nature' };

    // 各维度当前筛选值（null 表示“全部”）
    private $star: number = null
    private $camp: string = null
    private $profession: string = null
    private $lvRange: [number, number] = null

    // 当前实际渲染的列表（过滤后的子集）：canleQianhua 按索引复位时用它，避免与全量 create 错位
    private $renderList: CharacterStateCreate[] = []

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
        this.bindMenu("menuView1", SelectCardCtrl2.STAR_OPTIONS, (t) => this.onStar(t))
        this.bindMenu("menuView2", SelectCardCtrl2.CAMP_OPTIONS, (t) => this.onCamp(t))
        this.bindMenu("menuView3", SelectCardCtrl2.PROFESSION_OPTIONS, (t) => this.onProfession(t))
        this.bindMenu("menuView4", SelectCardCtrl2.LEVEL_OPTIONS, (t) => this.onLevel(t))
    }

    private bindMenu(name: string, items: string[], handler: (text: string) => void) {
        const node = this.node.getChildByName(name)
        if (!node) { console.warn("[SelectCardCtrl2] 未找到下拉节点:", name, "（请确认场景已保存且节点名正确）"); return }
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
    private onCamp(text: string) { this.$camp = (!text || text === '全部') ? null : SelectCardCtrl2.CAMP_VALUE[text]; this.refresh() }
    private onProfession(text: string) { this.$profession = (!text || text === '全部') ? null : text; this.refresh() }
    private onLevel(text: string) {
        if (!text || text === '全部') this.$lvRange = null
        else { const p = text.split('-'); this.$lvRange = [parseInt(p[0]), parseInt(p[1])] }
        this.refresh()
    }

    // 依据四个维度过滤全量 create 并重绘（选中态 myMap 保持不变）
    private refresh() {
        this.paint(this.applyFilter(this.create))
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
    public async queDingQianhua() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
        this.qianghuaCtrl.getComponent(qianghuaCtrl).initData(this.myMap)
    }
    public async canleQianhua() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("qianghuaCtrl").getChildByName("congCard").getChildByName("main_bg").getComponent(Sprite).spriteFrame =
            await util.bundle.load(`image/qianghua/congCard2/spriteFrame`, SpriteFrame)
        this.node.parent.getChildByName("qianghuaCtrl").getChildByName("congCard").getChildByName("num").getComponent(Label).string = null
        this.node.parent.getChildByName("qianghuaCtrl").getComponent(qianghuaCtrl).myMap.clear();
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
    async render(create: CharacterStateCreate[], qianghuaCtrlInstance: qianghuaCtrl, map: Map<string, number>) {
        this.create = create
        this.myMap = map
        this.qianghuaCtrl = qianghuaCtrlInstance
        this.node.active = true
        this.ensureBound()
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
        this.$renderList = create
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
            item.getChildByName("levelUp").active = true
            item.getChildByName("itemCount").active = true
            item.getChildByName("stackCount").getComponent(Label).string = create[i].stackCount + ""
            item.getChildByName("Toggle").getComponent(Toggle).isChecked = false
            item.getChildByName("itemCount").getComponent(Label).string = "1"
            item.getChildByName("cong").active = false
            for (const [key, value] of this.myMap) {
                if (create[i].id == key + "") {
                    item.getChildByName("Toggle").getComponent(Toggle).isChecked = true
                    item.getChildByName("cong").active = true
                    item.getChildByName("stackCount").getComponent(Label).string = (Number(create[i].stackCount) + 1 - Number(value)) + ""
                    item.getChildByName("itemCount").getComponent(Label).string = value + ""
                }
            }
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
            // this.Item.children[goIntoNum - 1].on("click", () => { this.clickFun(create[i]) })
            item.getChildByName("id").getComponent(Label).string = create[i].id;
            // item.getChildByName("Toggle").on('toggle', callback, this);
            this.ContentNode.addChild(item)
            item.getComponent(AttrLevelCtrl).initData(this)
            continue
        }
    }

}
