import { _decorator, Component, director, Node } from 'cc';
import { util } from '../../util/util';
import { AudioMgr } from '../../util/resource/AudioMgr';
import { getConfig } from '../../common/config/config';
import { menuView } from '../../common/common/menuView';
import { EqHeroAllHeros } from './Canvas/EqHeroAllHeros';
import { EquipmentStateCreate } from '../../game/fight/equipment/EquipmentState';
const { ccclass, property } = _decorator;

@ccclass('EqHeroCanvas')
export class EqHeroCanvas extends Component {

    // 四个下拉的选项列表（首项“全部”用于复位），节点名 → 维度：
    // menuView1 星级 / menuView2 类型 / menuView3 职业 / menuView4 属性
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

    // 记录已绑定的节点与回调，供 onDestroy 精确解绑
    private $bound: { node: Node, handler: (text: string) => void }[] = []

    protected start() {
        this.bindMenu("menuView1", EqHeroCanvas.STAR_OPTIONS, (t) => this.onStar(t));
        this.bindMenu("menuView2", EqHeroCanvas.TYPE_OPTIONS, (t) => this.onType(t));
        this.bindMenu("menuView3", EqHeroCanvas.PROFESSION_OPTIONS, (t) => this.onProfession(t));
        this.bindMenu("menuView4", EqHeroCanvas.ATTR_OPTIONS, (t) => this.onAttr(t));
    }

    // 按节点名取下拉实例：注入本页选项列表并绑定选中回调（每个下拉独立闭包，互不覆盖）
    private bindMenu(name: string, items: string[], handler: (text: string) => void) {
        const node = this.node.getChildByName(name)
        if (!node) { console.warn("[EqHeroCanvas] 未找到下拉节点:", name, "（请确认场景已保存且节点名正确）"); return }
        const comp = node.getComponent(menuView)
        if (comp) comp.setItems(items)
        node.on('menu-selected', handler, this)
        this.$bound.push({ node, handler })
    }

    protected onDestroy() {
        this.$bound.forEach(b => {
            if (b.node && b.node.isValid) b.node.off('menu-selected', b.handler, this)
        })
        this.$bound = []
    }

    private onStar(text: string) {
        this.$star = (!text || text === '全部') ? null : parseFloat(text.replace('星', ''))
        this.renderFiltered()
    }
    private onType(text: string) {
        this.$type = (!text || text === '全部') ? null : EqHeroCanvas.TYPE_OPTIONS.indexOf(text) - 1
        this.renderFiltered()
    }
    private onProfession(text: string) {
        this.$profession = (!text || text === '全部') ? null : text
        this.renderFiltered()
    }
    private onAttr(text: string) {
        this.$attr = (!text || text === '全部') ? null : text
        this.renderFiltered()
    }

    // 四个维度叠加过滤：未设置(null/空)的维度跳过
    private applyFilter(queue: EquipmentStateCreate[]) {
        if (this.$star != null) queue = queue.filter(e => e.star === this.$star)
        if (this.$type != null) queue = queue.filter(e => e.eqType === this.$type)
        if (this.$profession) queue = queue.filter(e => e.profession === this.$profession)
        if (this.$attr) {
            const field = EqHeroCanvas.ATTR_FIELD[this.$attr]
            queue = queue.filter(e => Number(e[field]) > 0)
        }
        return queue
    }

    // 重新渲染过滤后的装备列表
    async renderFiltered() {
        const allHeros = this.node.getChildByName("AllHeros").getComponent(EqHeroAllHeros)
        const config = getConfig()
        const close = await util.message.load()
        await allHeros.render(this.applyFilter(config.userData.equipments.slice()))
        close()
    }

    // 回到主页
    async GoBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        director.loadScene("Home")
    }

}
