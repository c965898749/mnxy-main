import { _decorator, BlockInputEvents, Button, Component, EventHandler, find, instantiate, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { CharacterStateCreate } from '../game/fight/character/CharacterState';
import { getConfig, getToken } from '../common/config/config';
import { util } from '../util/util';
import { AudioMgr } from '../util/resource/AudioMgr';
import { HeroCharacterDetail } from '../scenes/Hero/Canvas/HeroCharacterDetail';
const { ccclass } = _decorator;

// otherTeamInfo 接口返回体
export type OtherTeamInfo = {
    userId: number
    nickname: string
    lv: number
    gameImg: string
    winCount: number
    // 对方上阵卡牌（goIntoNum 1~5）；擂台模式下是报名快照卡
    characters: CharacterStateCreate[]
    // 上述卡牌身上穿戴的装备，查看卡牌详情时作为只读装备源
    equipments: any[]
    // 仅擂台模式下发：我自己同级别同周的擂台阵容，用于战力对比
    myCharacters?: CharacterStateCreate[]
}

export type DzDetailOption = {
    // 传了擂台级别（1/2/3）就看对方擂台报名阵容而不是常规战队，擂台的几个入口用
    arenaLevel?: number | string
    // 目标玩家所在服务器名（世界BOSS合并榜单下发的 server 快照）：不是本服时后端会转发到对端实例取数据，
    // 本服玩家不用传（各服 userId 会重号，只有靠服务器名才能分清“这个 id 在哪个服”）
    server?: string
}

/**
 * 对方战队信息面板（prefab/dzDetail）
 * team/card/header_qitiandashen 放对方上阵卡头像，点头像看卡牌详情；
 * zhanli 显示双方战力比较；sure 关闭面板
 */
@ccclass('DzDetailCtrl')
export class DzDetailCtrl extends Component {

    private $target: OtherTeamInfo = null
    // 打开时的选项，擂台入口会带 arenaLevel
    private $option: DzDetailOption = null
    // 被接管的卡牌详情返回按钮（原绑定 goBack2，会顺带打开 TiemCtrl/Floor）
    private $goBackNode: Node = null
    private $goBackEvents: EventHandler[] = null
    // 卡牌详情面板原本在 Canvas 里的层级，看完对方卡后还原
    private $detailSibling = -1
    private $detailNode: Node = null

    /**
     * 打开面板，同一屏只保留一个
     * @param targetUserId 要查看的玩家 userId
     * @param parent 挂载父节点，默认 Canvas
     * @param option 数据口径，擂台入口传 arenaLevel 看报名阵容，跨服入口传 server
     */
    static async open(targetUserId, parent: Node = find('Canvas'), option: DzDetailOption = null) {
        if (targetUserId == null || targetUserId === '') return
        const config = getConfig()
        // 自己不需要看自己；只有没指定服务器（同服）时才按 id 判，跨服时同一个 id 是另一个人
        if (!option?.server && config.userData.userId == targetUserId) return
        if (!parent) return
        const last = parent.getChildByName('dzDetail')
        if (last) last.destroy()
        const close = await util.message.load()
        try {
            const prefab = await util.bundle.load('prefab/dzDetail', Prefab)
            const node = instantiate(prefab)
            parent.addChild(node)
            // 预制体上没挂脚本也能用，挂了则复用
            const ctrl = node.getComponent(DzDetailCtrl) ?? node.addComponent(DzDetailCtrl)
            await ctrl.render(targetUserId, option)
        } finally {
            close()
        }
    }

    async render(targetUserId, option?: DzDetailOption) {
        this.$option = option ?? null
        const info = await this.requestOtherTeamInfo(targetUserId)
        if (!info) {
            // 取不到数据就直接把面板收掉：bindSure 还没执行，留着玩家连关闭都点不动
            this.node.destroy()
            return
        }
        this.$target = info
        // 面板底图挡一下，避免点穿到身后的列表按钮
        const splash = this.node.getChildByName('SpriteSplash')
        if (splash && !splash.getComponent(BlockInputEvents)) splash.addComponent(BlockInputEvents)
        this.renderTeam()
        this.renderZhanli()
        this.bindSure()
        if (!info.characters || info.characters.length === 0) {
            // 对方本周没报名这一级擂台时会是一张白板，给句准话比让玩家对着空板猜强
            util.message.prompt({ message: this.arenaLevel() > 0 ? "对方本周未报名该擂台" : "对方暂无上阵战队" })
        }
    }

    private requestOtherTeamInfo(targetUserId): Promise<OtherTeamInfo> {
        const config = getConfig()
        const postData = {
            token: getToken(),
            userId: config.userData.userId,
            id: targetUserId + '',
            // 后端以 finalLevel>0 作为“看擂台报名阵容”的开关
            finalLevel: this.arenaLevel(),
            // 目标玩家所在服务器名，非本服时后端转发到对端实例取（空 = 本服）
            server: this.$option?.server || ''
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        return fetch(config.ServerUrl.url + "otherTeamInfo", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success == '1') return data.data as OtherTeamInfo
                util.message.confirm({ message: data.errorMsg || "服务器异常" })
                return null
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                util.message.prompt({ message: "网络异常，查看对方战队失败" })
                return null
            });
    }

    /**
     * 渲染 5 个卡位：按 goIntoNum-1 定位，没有卡的位清空并隐藏
     */
    private async renderTeam() {
        const team = this.node.getChildByName('team')
        if (!team) return
        const cards = team.children
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i]
            const header = card.getChildByName('header_qitiandashen')
            if (!header) continue
            header.off('click')
            const create = this.$target.characters.filter(x => x.goIntoNum - 1 == i)[0]
            if (!create) {
                card.active = false
                header.getComponent(Sprite).spriteFrame = null
                continue
            }
            card.active = true
            header.getComponent(Sprite).spriteFrame =
                await util.bundle.load(`game/texture/frames/hero/Header/${create.id}/spriteFrame`, SpriteFrame)
            header.on('click', () => this.showCardDetail(create))
        }
    }

    private renderZhanli() {
        const zhanli = this.node.getChildByName('zhanli')
        if (!zhanli) return
        const config = getConfig()
        const arena = this.arenaLevel() > 0
        // 擂台口径下两边都得用擂台阵容，拿我的常规战队去比对方擂台队数字不可比
        const mine = arena ? this.$target.myCharacters : config.userData.characters.filter(x => x.goIntoNum != 0)
        const mineTxt = arena && (!mine || mine.length === 0) ? "未报名" : this.teamPower(mine)
        zhanli.getComponent(Label).string = `${arena ? '擂台 ' : ''}对方${this.teamPower(this.$target.characters)} vs 我方 ${mineTxt}`
    }

    // 取擂台级别，非擂台入口（排行榜/聊天等）返回 0
    private arenaLevel(): number {
        return Number(this.$option?.arenaLevel) || 0
    }

    private bindSure() {
        const sure = this.node.getChildByName('sure')
        if (!sure) return
        sure.off(Node.EventType.TOUCH_END)
        sure.on(Node.EventType.TOUCH_END, this.close, this)
    }

    private close() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.destroy()
    }

    /**
     * 战力口径与主界面 user_fight_count 完全一致，表达式不要单独“修正”，否则和主界面数值对不上
     * 改动需同步 HomeBuildings / TiemCtrl
     */
    private getZhanli(create: CharacterStateCreate) {
        let zhanli = create.attack * 25 + create.defence ? create.defence * 25 : 0 + create.maxHp + 300 * create.speed
        return zhanli;
    }

    private teamPower(list: CharacterStateCreate[]): number {
        if (!list) return 0
        let power = 0
        for (let i = 0; i < list.length; i++) {
            power += parseInt(this.getZhanli(list[i]).toString())
        }
        return power
    }

    /**
     * 点头像看对方卡牌详情：只读 + 用对方装备做装备槽数据源
     */
    private async showCardDetail(create: CharacterStateCreate) {
        AudioMgr.inst.playOneShot("sound/other/click");
        const characterDetail = find('Canvas/CharacterDetail')
        if (!characterDetail) {
            return util.message.prompt({ message: "当前界面无法查看卡牌详情" })
        }
        this.node.active = false
        // CharacterDetail 在 Canvas 里层级很靠前，不提到最后会被各个业务面板盖住
        this.$detailNode = characterDetail
        this.$detailSibling = characterDetail.getSiblingIndex()
        characterDetail.setSiblingIndex(characterDetail.parent.children.length - 1)
        characterDetail.active = true
        await characterDetail.getComponent(HeroCharacterDetail).setCharacter(create, {
            readOnly: true,
            equipments: this.$target.equipments
        })
        this.hijackGoBack(characterDetail)
    }

    // 清掉 GoBack 上原有的 clickEvents，返回时先恢复再关闭，避免 goBack2 把 TiemCtrl/Floor 一起打开
    private hijackGoBack(characterDetail: Node) {
        this.restoreGoBack()
        const goBack = characterDetail.getChildByName('GoBack')
        if (!goBack) return
        const button = goBack.getComponent(Button)
        if (!button) return
        this.$goBackNode = goBack
        this.$goBackEvents = button.clickEvents
        button.clickEvents = []
        goBack.on(Node.EventType.TOUCH_END, this.onCardDetailBack, this)
    }

    private onCardDetailBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        if (this.$detailNode) {
            this.$detailNode.active = false
            if (this.$detailSibling >= 0) this.$detailNode.setSiblingIndex(this.$detailSibling)
        }
        this.$detailNode = null
        this.$detailSibling = -1
        this.restoreGoBack()
        this.node.active = true
        // 回到面板时保证仍然在最上层
        if (this.node.parent) this.node.setSiblingIndex(this.node.parent.children.length - 1)
    }

    private restoreGoBack() {
        if (!this.$goBackNode) return
        this.$goBackNode.off(Node.EventType.TOUCH_END, this.onCardDetailBack, this)
        const button = this.$goBackNode.getComponent(Button)
        if (button && this.$goBackEvents) button.clickEvents = this.$goBackEvents
        this.$goBackNode = null
        this.$goBackEvents = null
    }

    onDestroy() {
        this.restoreGoBack()
    }
}
