import { _decorator, BlockInputEvents, Color, Component, Graphics, instantiate, Label, Node, Prefab, RichText, sp, Sprite, SpriteFrame, tween, UITransform, Vec3, view } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { EquipmentStateCreate } from 'db://assets/script/game/fight/equipment/EquipmentState';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { eqJiNengShuSelectCardCtrl } from '../eqSelectCardCtrl/eqJiNengShuSelectCardCtrl';
import { questionCrtl } from '../questionCrtl/questionCrtl';
const { ccclass, property } = _decorator;

/**
 * 装备技能（炼魂/领悟）面板。
 *
 * UI 结构（场景已搭好）：
 *  - Content(ContentNode)      已学技能容器，放预制体 EqLianHuaItem(skilleName + baocun 替换按钮)
 *  - congCard                  选技能书入口，点击打开 eqJiNengShuSelectCardCtrl
 *  - skilleName                显示“使用中”技能；领悟后显示随机出来的预览技能
 *  - queRenBtn(确认)           消耗 1 本已选技能书，随机领悟一个技能（预览到 skilleName）
 *  - baocunBtn(保存)           消耗凝神石，把预览技能保存到 Content
 *
 * 后端接口：eqSkillList / eqSkillBookList / eqDrawSkill / eqSaveSkill / eqSetActiveSkill
 * 约定：id = 装备 uuid，str = bookItemId / skillId / skillUuid
 * 规则：相同技能无法重复保存；相同技能无法替换（后端已校验，前端做前置提示）。
 */
@ccclass('EqLianHuaCtrl')
export class EqLianHuaCtrl extends Component {
    @property({ type: Node, tooltip: "已学技能容器" }) ContentNode: Node = null;
    @property(Label) skilleName: Label = null;
    @property({ type: Label, tooltip: "技能描述（skilleName 只显示名称+等级，描述走这里；未拖拽则按名字自动查找）" }) skilleDesc: Label = null;
    private skilleDescCache: Label = null;
    @property(Node) congCard: Node = null;
    @property({ type: Node, tooltip: "确认（领悟）按钮" }) queRenBtn: Node = null;
    @property({ type: Node, tooltip: "保存技能按钮" }) baocunBtn: Node = null;
    @property({ type: Node, tooltip: "重置按钮（清空 congCard 选择与预览）" }) resetBtn: Node = null;

    // 当前操作的装备
    create: EquipmentStateCreate = null;
    // 已选中的技能书 itemId（用于“确认”领悟）
    private selectedBookItemId: number = null;
    // 已选中技能书的图标与剩余数量（用于 congCard 展示）
    private selectedBookIcon: string = null;
    private selectedBookCount: number = 0;
    // 未选技能书时 congCard 底图还原路径
    private static readonly EMPTY_BOOK_BG = "image/qianghua/fankuai3/spriteFrame";
    // 领悟出来的预览技能 { skillId, name, tier, description, icon, level }
    private drawnSkill: any = null;
    // 已学技能列表
    private skillList: any[] = [];
    private ningshenCount: any = 0;
    private skillLevel: number = 1;
    private maxSlot: number = 5;
    // tier -> 富文本颜色（0普通绿 / 1优秀紫 / 2极品金，与洗练配色一致）
    private static readonly TIER_COLOR: Record<number, string> = { 0: "#88ff88", 1: "#bb77ff", 2: "#ffdd77" };
    // 当前“洗出技能”弹框节点（动态创建，打开前先销毁旧的）
    private drawPopup: Node = null;
    // 技能发生变化（保存新技能 / 切换使用中）时的回调，用于通知外层详情面板刷新技能显示
    private onSkillChanged: (() => void) = null;

    start() {
        // 代码内绑定按钮点击（无需在编辑器逐个挂事件，只要把节点拖到对应 @property 上）
        if (this.congCard) {
            this.congCard.off('click')
            this.congCard.on('click', this.openCongCard, this)
        }
        if (this.queRenBtn) {
            this.queRenBtn.off('click')
            this.queRenBtn.on('click', this.queRen, this)
        }
        if (this.baocunBtn) {
            this.baocunBtn.off('click')
            this.baocunBtn.on('click', this.baocun, this)
        }
        if (this.resetBtn) {
            this.resetBtn.off('click')
            this.resetBtn.on('click', this.reset, this)
        }
    }

    update(deltaTime: number) {

    }

    /** 面板入口：由“+”按钮处调用，传入目标装备 */
    public async open(create: EquipmentStateCreate, onSkillChanged?: () => void) {
        this.closeDrawnSkillPopup()
        this.onSkillChanged = onSkillChanged || null
        this.create = create
        this.selectedBookItemId = null
        this.selectedBookIcon = null
        this.selectedBookCount = 0
        this.drawnSkill = null
        this.node.active = true
        this.setBaocunBtnVisible(false)
        await this.resetCongCardVisual()
        await this.loadSkillList()
    }

    public goBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.closeDrawnSkillPopup()
        this.node.active = false
        // 关闭面板时主动通知外层刷新技能显示，确保“替换/切换使用中”后内外一致
        this.notifySkillChanged()
    }

    /** 重置：清空已选技能书与领悟预览，skilleName 回到使用中技能，congCard 还原成未选状态 */
    private async reset() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.closeDrawnSkillPopup()
        this.selectedBookItemId = null
        this.selectedBookIcon = null
        this.selectedBookCount = 0
        this.drawnSkill = null
        this.setBaocunBtnVisible(false)
        this.showActiveSkill()
        await this.resetCongCardVisual()
    }

    /** 把 congCard 底图设为选中技能书图标，num 显示数量 */
    private async setCongCardBook(icon: string, count: number) {
        if (!this.congCard) return
        const mainBg = this.congCard.getChildByName("main_bg")
        const num = this.congCard.getChildByName("num")
        if (mainBg) {
            mainBg.getComponent(Sprite).spriteFrame = icon
                ? await util.bundle.load(icon, SpriteFrame)
                : await util.bundle.load(EqLianHuaCtrl.EMPTY_BOOK_BG, SpriteFrame)
        }
        if (num) num.getComponent(Label).string = icon ? count + "" : null
    }

    /** congCard 还原成未选技能书状态：底图回退 fankuai + 清空数量 */
    private async resetCongCardVisual() {
        if (!this.congCard) return
        const mainBg = this.congCard.getChildByName("main_bg")
        const num = this.congCard.getChildByName("num")
        if (mainBg) mainBg.getComponent(Sprite).spriteFrame = await util.bundle.load(EqLianHuaCtrl.EMPTY_BOOK_BG, SpriteFrame)
        if (num) num.getComponent(Label).string = null
    }

    /** 统一 POST 封装 */
    private async post(name: string, extra: any): Promise<any> {
        const config = getConfig()
        const token = getToken()
        const postData = Object.assign({
            token: token,
            userId: config.userData.userId,
            id: this.create.uuid + "",
        }, extra)
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        }
        try {
            const response = await fetch(config.ServerUrl.url + name, options)
            if (!response.ok) throw new Error('Network response was not ok')
            return await response.json()
        } catch (error) {
            await util.message.confirm({ message: "服务器异常" })
            return null
        }
    }

    /** 加载该装备已学技能 */
    private async loadSkillList() {
        const data = await this.post("eqSkillList", {})
        if (!data) return
        if (data.success == '1') {
            const d = data.data
            this.skillList = d.skillList || []
            this.ningshenCount = d.ningshenCount
            this.skillLevel = d.skillLevel
            this.maxSlot = d.maxSlot
            this.renderContent()
            this.showActiveSkill()
        } else {
            util.message.confirm({ message: data.errorMsg || "服务器异常" })
        }
    }

    /** skilleName 只显示 名称 Lv等级；skilleDesc 显示技能描述；无使用中则提示 */
    private showActiveSkill() {
        if (!this.skilleName) return
        const desc = this.getDescLabel()
        const active = this.skillList.find(s => s.isActive == 1)
        if (active) {
            const lv = active.skillLevel != null ? active.skillLevel : this.skillLevel
            this.skilleName.string = this.nameLv(active.name, lv)
            if (desc) desc.string = active.description || ""
        } else {
            this.skilleName.string = "尚未领悟技能"
            if (desc) desc.string = ""
        }
    }

    /** 技能名+等级文本（描述单独走 skilleDesc） */
    private nameLv(name: any, lv: any): string {
        return (name || "") + " Lv" + (lv != null ? lv : this.skillLevel)
    }

    /** 取描述 Label：优先 @property，其次按名字在子树里查找并缓存（避免必须手动拖拽） */
    private getDescLabel(): Label {
        if (this.skilleDesc) return this.skilleDesc
        if (this.skilleDescCache && this.skilleDescCache.isValid) return this.skilleDescCache
        const n = this.findDeep(this.node, "skilleDesc")
        this.skilleDescCache = n ? n.getComponent(Label) : null
        return this.skilleDescCache
    }

    /** 递归按名字查找子节点 */
    private findDeep(node: Node, name: string): Node {
        if (!node) return null
        for (const c of node.children) {
            if (c.name === name) return c
            const r = this.findDeep(c, name)
            if (r) return r
        }
        return null
    }

    /** 控制“保存”按钮显隐 */
    private setBaocunBtnVisible(v: boolean) {
        if (this.baocunBtn) this.baocunBtn.active = v
    }

    /** 通知外层：使用中技能已变化（保存新技能/切换替换） */
    private notifySkillChanged() {
        if (this.onSkillChanged) this.onSkillChanged()
    }

    /** 效果数值格式化：整数不带小数，否则保留1位 */
    private fmtVal(v: any): string {
        if (v == null) return ""
        const n = Number(v)
        if (isNaN(n)) return ""
        return Number.isInteger(n) ? (n + "") : n.toFixed(1)
    }

    /** 渲染已学技能列表（Content 下 EqLianHuaItem） */
    private async renderContent() {
        if (!this.ContentNode) return
        const nodePool = util.resource.getNodePool(
            await util.bundle.load("prefab/EqLianHuaItem", Prefab)
        )
        // 回收旧节点
        const childrens = [...this.ContentNode.children]
        for (let i = 0; i < childrens.length; i++) {
            const node = childrens[i]
            const btn = node.getChildByName("baocun")
            if (btn) btn.off('click')
            nodePool.put(node)
        }
        // 生成新节点
        for (let i = 0; i < this.skillList.length; i++) {
            const skill = this.skillList[i]
            const item = nodePool.get()
            const nameLab = item.getChildByName("skilleName")
            if (nameLab) {
                const lv = skill.skillLevel != null ? skill.skillLevel : this.skillLevel
                nameLab.getComponent(Label).string = this.nameLv(skill.name, lv) + (skill.isActive == 1 ? "（使用中）" : "")
            }
            const descLab = item.getChildByName("skilleDesc")
            if (descLab) descLab.getComponent(Label).string = skill.description || ""
            const btn = item.getChildByName("baocun")
            if (btn) {
                btn.off('click')
                // 使用中的技能不能替换，隐藏其替换按钮（节点池复用需两态都显式置位）
                if (skill.isActive == 1) {
                    btn.active = false
                } else {
                    btn.active = true
                    btn.on('click', () => { this.replaceSkill(skill) }, this)
                }
            }
            this.ContentNode.addChild(item)
        }
    }

    /** 点击 congCard → 打开技能书选择面板 */
    private async openCongCard() {
        if (!this.create) return
        AudioMgr.inst.playOneShot("sound/other/click");
        const data = await this.post("eqSkillBookList", {})
        if (!data) return
        if (data.success == '1') {
            // eqJiNengShuSelectCardCtrl 是预制体（prefab/eqJiNengShuSelectCardCtrl），需实例化；
            // 按名字复用已创建的实例，避免重复叠加。
            let panelNode = this.node.parent.getChildByName("eqJiNengShuSelectCardCtrl")
            if (!panelNode) {
                const fab = await util.bundle.load("prefab/eqJiNengShuSelectCardCtrl", Prefab)
                panelNode = instantiate(fab)
                this.node.parent.addChild(panelNode)
            }
            const ctrl = panelNode.getComponent(eqJiNengShuSelectCardCtrl)
            await ctrl.render(data.data, async (book: any) => {
                this.selectedBookItemId = book.bookItemId
                this.selectedBookIcon = book.icon || null
                this.selectedBookCount = Number(book.stackCount) || 0
                await this.setCongCardBook(this.selectedBookIcon, this.selectedBookCount)
            })
        } else {
            util.message.confirm({ message: data.errorMsg || "服务器异常" })
        }
    }

    /** 确认：消耗已选技能书随机领悟一个技能（预览） */
    private async queRen() {
        if (!this.create) return
        if (!this.selectedBookItemId) {
            await util.message.prompt({ message: "请先选择技能书" })
            return
        }
        AudioMgr.inst.playOneShot("sound/other/click");
        const data = await this.post("eqDrawSkill", { str: this.selectedBookItemId + "" })
        if (!data) return
        if (data.success == '1') {
            this.drawnSkill = data.data
            if (this.skilleName) {
                this.skilleName.string = "领悟：" + this.nameLv(this.drawnSkill.name, this.drawnSkill.level)
            }
            const dl = this.getDescLabel()
            if (dl) dl.string = this.drawnSkill.description || ""
            // 每次确认消耗 1 本：刷新 congCard 上的剩余数量；减到 0 还原底图并清空选中
            const remain = Number(data.data.bookRemain)
            this.selectedBookCount = isNaN(remain) ? 0 : remain
            if (this.selectedBookCount <= 0) {
                this.selectedBookItemId = null
                this.selectedBookIcon = null
                this.selectedBookCount = 0
                await this.resetCongCardVisual()
            } else {
                const num = this.congCard ? this.congCard.getChildByName("num") : null
                if (num) num.getComponent(Label).string = this.selectedBookCount + ""
            }
            // 播放 donghua 动画（spine），播完再弹出“洗出技能”弹框
            await this.playDonghua()
            await this.showDrawnSkillPopup(this.drawnSkill)

            // 保存策略：
            // 1) 装备当前无任何技能 -> 第一次领悟直接保存，保持隐藏保存按钮；
            // 2) 已有技能且领悟到的与现有技能不同 -> 出现保存按钮，由玩家决定是否消耗凝神石保存；
            // 3) 与现有技能相同 -> 无法重复领悟，保持隐藏保存按钮。
            const hadSkills = this.skillList.length > 0
            if (!hadSkills) {
                await this.doSaveSkill(false)
            } else {
                const dup = this.skillList.some(s => s.skillId != null && s.skillId == this.drawnSkill.skillId)
                if (dup) {
                    this.setBaocunBtnVisible(false)
                    await util.message.prompt({ message: "已领悟过相同技能，无法重复保存" })
                } else {
                    this.setBaocunBtnVisible(true)
                }
            }
        } else {
            this.drawnSkill = null
            util.message.confirm({ message: data.errorMsg || "服务器异常" })
        }
    }

    /** 保存按钮：消耗凝神石把预览技能写入 Content */
    private async baocun() {
        if (!this.create) return
        if (!this.drawnSkill) {
            await util.message.prompt({ message: "请先点击确认领悟技能" })
            return
        }
        AudioMgr.inst.playOneShot("sound/other/click");
        await this.doSaveSkill(true)
    }

    /** 实际保存逻辑（自动保存与手动保存共用）；成功后隐藏保存按钮 */
    private async doSaveSkill(showMsg: boolean) {
        if (!this.drawnSkill) return
        const data = await this.post("eqSaveSkill", { str: this.drawnSkill.skillId + "" })
        if (!data) return
        if (data.success == '1') {
            this.drawnSkill = null
            // 注意：保存不消耗技能书（书在“确认”抽技时已扣），不能清 selectedBookItemId/selectedBookCount，
            // 否则 congCard 明明还剩很多本，再点“确认”会误提示“请先选择技能书”。
            this.ningshenCount = data.data.ningshenCount
            this.skillList = data.data.skillList || []
            this.renderContent()
            this.showActiveSkill()
            this.setBaocunBtnVisible(false)
            this.notifySkillChanged()
            if (showMsg) await util.message.prompt({ message: "保存成功" })
        } else {
            util.message.confirm({ message: data.errorMsg || "服务器异常" })
        }
    }

    /** 替换：把某个已学(待使用)技能设为使用中 */
    private async replaceSkill(skill: any) {
        if (!this.create) return
        if (skill.isActive == 1) {
            await util.message.prompt({ message: "该技能已在使用中" })
            return
        }
        AudioMgr.inst.playOneShot("sound/other/click");
        const data = await this.post("eqSetActiveSkill", { str: skill.uuid + "" })
        if (!data) return
        if (data.success == '1') {
            this.skillList = data.data.skillList || []
            this.renderContent()
            this.showActiveSkill()
            this.notifySkillChanged()
        } else {
            util.message.confirm({ message: data.errorMsg || "服务器异常" })
        }
    }

    /** 取技能档位（tier）对应的富文本颜色 */
    private tierColor(tier: number): string {
        return EqLianHuaCtrl.TIER_COLOR[tier] || "#ffffff"
    }

    /** 播放 donghua（spine）一次，播完自动隐藏；无该节点/组件时直接 resolve */
    private playDonghua(): Promise<void> {
        return new Promise<void>(resolve => {
            const dNode = this.node.getChildByName("donghua")
            if (!dNode) { resolve(); return }
            const skel = dNode.getComponent(sp.Skeleton)
            if (!skel) { resolve(); return }
            skel.node.active = true
            AudioMgr.inst.playOneShot("sound/other/getcard")
            skel.setAnimation(0, "animation", false)
            skel.setCompleteListener(() => {
                skel.node.active = false
                resolve()
            })
        })
    }

    /** 关闭并销毁“洗出技能”弹框 */
    private closeDrawnSkillPopup() {
        if (this.drawPopup && this.drawPopup.isValid) {
            this.drawPopup.off(Node.EventType.TOUCH_END)
            this.drawPopup.destroy()
        }
        this.drawPopup = null
    }

    /** 动态生成全屏遮罩弹框，用 xilian 预制体渲染刚领悟的技能 */
    private async showDrawnSkillPopup(skill: any) {
        if (!skill) return
        this.closeDrawnSkillPopup()
        const vs = view.getVisibleSize()

        // 全屏半透明遮罩（Graphics 画黑底，无需图片资源）
        const mask = new Node("skillDrawPopup")
        mask.parent = this.node
        mask.layer = this.node.layer
        const mUT = mask.addComponent(UITransform)
        mUT.setContentSize(vs.width, vs.height)
        const g = mask.addComponent(Graphics)
        g.fillColor = new Color(0, 0, 0, 180)
        g.rect(-vs.width / 2, -vs.height / 2, vs.width, vs.height)
        g.fill()
        mask.addComponent(BlockInputEvents)
        this.drawPopup = mask

        // 标题
        const title = new Node("title")
        title.parent = mask
        title.layer = mask.layer
        title.setPosition(0, vs.height * 0.18, 0)
        title.addComponent(UITransform)
        const tl = title.addComponent(Label)
        tl.fontSize = 40
        tl.lineHeight = 46
        tl.color = new Color(255, 215, 120, 255)
        tl.horizontalAlign = Label.HorizontalAlign.CENTER
        tl.string = "领悟技能"

        // 技能行：复用 xilian 预制体（RichText 显示 名称 Lv 数值，隐藏 Toggle/id）
        let rowY = vs.height * 0.04
        const xilianFab = await util.bundle.load("prefab/xilian", Prefab)
        if (xilianFab) {
            const row = instantiate(xilianFab)
            row.parent = mask
            row.layer = mask.layer
            row.setPosition(0, rowY, 0)
            const toggleNode = row.getChildByName("Toggle")
            if (toggleNode) toggleNode.active = false
            const idNode = row.getChildByName("id")
            if (idNode) idNode.active = false
            const rtNode = row.getChildByName("RichText")
            if (rtNode) {
                const rt = rtNode.getComponent(RichText)
                if (rt) {
                    const v = this.fmtVal(skill.effectValue)
                    rt.string = `<color=${this.tierColor(skill.tier)}><size=30>${skill.name || ""} Lv${skill.level}${v ? "  +" + v : ""}</size></color>`
                }
            }
        }

        // 技能描述
        rowY -= 70
        const desc = new Node("desc")
        desc.parent = mask
        desc.layer = mask.layer
        desc.setPosition(0, rowY, 0)
        const dUT = desc.addComponent(UITransform)
        dUT.setContentSize(vs.width * 0.72, 120)
        const dl = desc.addComponent(Label)
        dl.fontSize = 24
        dl.lineHeight = 32
        dl.color = new Color(220, 220, 220, 255)
        dl.overflow = Label.Overflow.RESIZE_HEIGHT
        dl.horizontalAlign = Label.HorizontalAlign.CENTER
        dl.string = skill.description || ""

        // 关闭提示 + 点击任意处关闭
        const hint = new Node("hint")
        hint.parent = mask
        hint.layer = mask.layer
        hint.setPosition(0, -vs.height * 0.28, 0)
        hint.addComponent(UITransform)
        const hl = hint.addComponent(Label)
        hl.fontSize = 22
        hl.lineHeight = 28
        hl.color = new Color(180, 180, 180, 255)
        hl.string = "点击任意处关闭"
        mask.on(Node.EventType.TOUCH_END, () => {
            AudioMgr.inst.playOneShot("sound/other/click")
            this.closeDrawnSkillPopup()
        }, this)

        // 缩放弹入（与“领悟成功”奖励音同步）
        AudioMgr.inst.playOneShot("sound/other/commonLevelUp");
        mask.setScale(new Vec3(0, 0, 0))
        tween(mask)
            .to(0.35, { scale: new Vec3(1, 1, 1) }, { easing: "backOut" })
            .start()
    }

    /** 取最顶层祖先节点 */
    private topAncestor(node: Node): Node {
        let n = node
        while (n.parent) n = n.parent
        return n
    }

    /** 打开帮助说明面板：优先取同级 questionCrtl，找不到则沿祖先树递归查找；仍无则用通用弹框兑底 */
    private async showHelp(message: string) {
        let q = this.node.parent ? this.node.parent.getChildByName("questionCrtl") : null
        if (!q) q = this.findDeep(this.topAncestor(this.node), "questionCrtl")
        const ctrl = q ? q.getComponent(questionCrtl) : null
        if (ctrl) {
            await ctrl.read(message)
        } else {
            await util.message.eqIntroduce({ message })
        }
    }

    /** 玩法介绍：装备炼化（技能领悟） */
    async questry() {
        const slotTip = this.maxSlot && this.maxSlot > 0 ? this.maxSlot : 5
        const message = `<size=28><color=#FFD700>装备炼化（技能领悟）说明</color></size><br/>
<size=24><color=#FFFFFF>一、基本流程</color><br/>
<color=#E0E0E0>1. 点击技能书入口选择一个技能书，再点“确认”随机领悟一个技能（先预览）。</color><br/>
<color=#E0E0E0>2. 每次“确认”消耗 1 本所选技能书。</color><br/>
<color=#E0E0E0>3. 预览到技能后，点“保存”消耗凝神石，将技能写入装备。</color><br/><br/>

<color=#FFFFFF>二、技能书与品质</color><br/>
<color=#88ff88>初级技能书 → 普通（绿）</color><br/>
<color=#bb77ff>中级技能书 → 优秀（紫）</color><br/>
<color=#ffdd77>高级技能书 → 极品（金）</color><br/><br/>

<color=#FFFFFF>三、保存与槽位规则</color><br/>
<color=#E0E0E0>· 装备首次领悟（尚无技能）时自动保存，无需手动点保存。</color><br/>
<color=#E0E0E0>· 已有技能时，领悟到不同技能才会出现“保存”按钮。</color><br/>
<color=#E0E0E0>· 相同技能无法重复领悟或替换。</color><br/>
<color=#E0E0E0>· 技能槽最多 ${slotTip} 个。</color><br/><br/>

<color=#FFFFFF>四、使用中技能</color><br/>
<color=#E0E0E0>· 同一时间只有一个技能生效（标记“使用中”）。</color><br/>
<color=#E0E0E0>· 列表中非使用中技能旁有“替换”按钮，点击可切换使用中（使用中技能不显示该按钮）。</color><br/><br/>

<color=#FFFFFF>五、技能等级与数值</color><br/>
<color=#E0E0E0>· 技能等级 = 镶嵌宝石等级合计 ÷ 宝石槽数（最高 50 级），换宝石后等级实时变化。</color><br/>
<color=#E0E0E0>· 宝石槽数随星级增加；升星后新槽是空的，会拉低平均等级，镶满即恢复。</color><br/>
<color=#E0E0E0>· 未镶宝石时按 1 级计算。</color><br/>
<color=#E0E0E0>· 效果数值 = 每级数值 × 技能等级，描述里显示的就是换算后的最终值。</color><br/><br/>

<color=#FFFFFF>六、重置</color><br/>
<color=#E0E0E0>· 点“重置”清空当前选择与预览（不影响已保存技能）。</color><br/><br/>

<color=#E0E0E0>消耗道具：技能书（领悟）、凝神石（保存）。</color></size>`
        await this.showHelp(message)
    }
}
