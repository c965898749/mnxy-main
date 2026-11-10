import { _decorator, Component, director, EventMouse, Node } from 'cc';
import { util } from '../../../util/util';
import { getConfig } from '../../../common/config/config';
import { HeroAllHeros } from './HeroAllHeros';
import { CharacterStateCreate } from '../../../game/fight/character/CharacterState';
import { CharacterEnum } from '../../../game/fight/character/CharacterEnum';
import { AudioMgr } from '../../../util/resource/AudioMgr';
import { menuView } from '../../../common/common/menuView';
const { ccclass, property } = _decorator;

@ccclass('HeroUi')
export class HeroUi extends Component {

    // 星级下拉组件节点（用于 start 绑定/onDestroy 解绑事件）
    private $menuNode: Node = null

    // 本页的下拉选项：星级筛选（含“全部”复位），由外部传给 menuView，不再依赖其内置列表
    private static readonly STAR_OPTIONS = ['全部', '5星', '4.5星', '4星', '3.5星', '3星', '2.5星', '2星', '1.5星', '1星'];

    protected start() {
        // 代码内接线星级筛选：按节点名直接取 Ui 下的 menuView 预制体实例（不依赖编辑器 ClickEvent 接线）
        const menuNode = this.node.getChildByName("menuView")
        if (menuNode) {
            this.$menuNode = menuNode
            const comp = menuNode.getComponent(menuView)
            if (comp) comp.setItems(HeroUi.STAR_OPTIONS)
            this.$menuNode.on('menu-selected', this.filterByStar, this)
        }
    }

    protected onDestroy() {
        if (this.$menuNode && this.$menuNode.isValid) {
            this.$menuNode.off('menu-selected', this.filterByStar, this)
        }
        this.$menuNode = null
    }

    // 回到主页
    async GoBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        const close = await util.message.load()
        director.preloadScene("Home", () => close())
        director.loadScene("Home")
    }

    // 当前过滤阵容
    private $currentCamp: string = ""
    // 当前过滤星级（menuView 下拉选择，null 表示全部）
    private $currentStar: number = null
    // 阵容/星级共用的实际过滤：两个条件同时生效，未设置的跳过
    private applyFilter(queue: CharacterStateCreate[]) {
        if (this.$currentCamp) queue = queue.filter(c => CharacterEnum[c.id].CharacterCamp === this.$currentCamp)
        if (this.$currentStar != null) queue = queue.filter(c => c.star === this.$currentStar)
        return queue
    }
    // 星级过滤（由 menuView 选项文字驱动，如 "5星"/"4.5星"/"全部"）
    async filterByStar(text: string) {
        const allHeros = this.node.parent.getChildByName("AllHeros").getComponent(HeroAllHeros)
        this.$currentStar = (text && text !== "全部") ? parseFloat(text.replace("星", "")) : null
        const config = getConfig()
        const close = await util.message.load()
        await allHeros.render(this.applyFilter(config.userData.characters.slice()))
        close()
    }
    // 阵容过滤
    async filterByCamp(e: EventMouse, camp: string) {
        const allHeros = this.node.parent.getChildByName("AllHeros").getComponent(HeroAllHeros)
        let cahracterQueue: CharacterStateCreate[] = []
        this.node.children.forEach(node => {
            const lightNode = node.getChildByName("Light")
            if (lightNode) lightNode.active = false
        })
        if (this.$currentCamp === camp) {
            const config = getConfig()
            const close = await util.message.load()
            cahracterQueue = cahracterQueue.concat(config.userData.characters)
            cahracterQueue = this.applyFilter(cahracterQueue)   // 仍受星级过滤约束
            await allHeros.render(cahracterQueue)
            close()
            this.$currentCamp = ""
        } else {
            //   const meta = CharacterEnum[create.id]
            this.$currentCamp = camp
            const config = getConfig()
            const close = await util.message.load()
            cahracterQueue = cahracterQueue.concat(config.userData.characters)
            cahracterQueue = this.applyFilter(cahracterQueue)
            await allHeros.render(cahracterQueue)
            close()
            e.target.getChildByName("Light").active = true
        }
    }
}

