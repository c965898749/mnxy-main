import { _decorator, Component, Label, Node, Prefab, Sprite, SpriteFrame, UIOpacity } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { questionCrtl } from '../questionCrtl/questionCrtl';
import { DzDetailCtrl } from 'db://assets/script/prefab/DzDetailCtrl';
const { ccclass, property } = _decorator;

@ccclass('MapRankingCrtl')
export class MapRankingCrtl extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    @property(Node)
    ff3: Node
    initialized: boolean = false
    worldBossRanking = [];
    qingtongRanking = [];
    baiyingRanking = [];
    huangjinRanking = [];
    tanglangRanking = [];
    // 本服服务器名（后端按 worldboss.server-name 下发，世界BOSS榜已是全服合并榜，靠它区分哪行是本服人）
    worldBossServer: string = "";
    @property(Node)
    buttonNode: Node
    start() {
        this.refresh()
    }
    onEnable() {
        if (!this.initialized) {
            // 初始化代码
            this.initialized = true;
        } else {
            this.refresh()
        }

    }
    refresh() {

    }
    update(deltaTime: number) {

    }

    backPk() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }

    async render(map) {
        this.worldBossRanking = [];
        this.tanglangRanking = [];
        this.qingtongRanking = [];
        this.baiyingRanking = [];
        this.huangjinRanking = [];
        this.worldBossRanking = map["worldBossRanking"];
        this.tanglangRanking = map["tanglangRanking"];
        this.qingtongRanking = map["qingtongRanking"];
        this.baiyingRanking = map["baiyingRanking"];
        this.huangjinRanking = map["huangjinRanking"];
        this.worldBossServer = map["worldBossServer"] || "";
        // 默认展示第一个按钮：世界BOSS
        this.selectType(null, "1")
    }

    async selectType(event: Event, customEventData: string) {

        AudioMgr.inst.playOneShot("sound/other/click");
        this.buttonNode.children.forEach((btn) => {
            btn.getComponent(UIOpacity).opacity = 100
        })
        this.buttonNode.children[Number(customEventData) - 1].getComponent(UIOpacity).opacity = 255
        const config = getConfig()
        this.node.active = true
        const nodePool = util.resource.getNodePool(
            await util.bundle.load("prefab/ff3", Prefab)
        )
        const childrens = [...this.ContentNode.children]
        for (let i = 0; i < childrens.length; i++) {
            const node = childrens[i];
            // ff3 节点池在 5 个榜之间复用，回收前一律解绑，避免切到世界BOSS榜后还残留其它榜的头像回调
            node.getChildByName("yxjm_df_txk")?.off(Node.EventType.TOUCH_END)
            nodePool.put(node)
        }
        if (customEventData == "1") {
            // ===== 世界BOSS伤害排行（全服合并）=====
            const userlist = this.worldBossRanking || [];
            // 找“我那一行”必须同时对上服务器：合并榜里会有别服玩家，各服 userId 会重号，
            // 只比 id 会把另一个服的同名次玩家当成我，把她的伤害与名次整行递到我头上
            const myIndex = userlist.findIndex((item) => item.userId === config.userData.userId
                && (!item.server || item.server === this.worldBossServer))
            const myRecord = myIndex === -1 ? null : userlist[myIndex]
            this.ff3.getChildByName("Label").getComponent(Label).string = "lv " + config.userData.lv
            // 头像读伤害记录的 img 快照（世界BOSS库多服共用，跨服时主库头像不可信）
            await this.setHeader(this.ff3, myRecord, config.userData.gameImg)
            this.ff3.getChildByName("name").getComponent(Label).string = config.userData.nickname
            // 服务器名：后端不下发榜单之外的个人信息，不在榜上时只能取本服名字
            const serverTxt = this.worldBossServer || (myRecord && myRecord.server ? myRecord.server : "")
            this.ff3.getChildByName("jingdu").getComponent(Label).string = "我的伤害：" + this.formatDamage(myRecord ? myRecord.totalDamage : 0)
                + (serverTxt ? "（" + serverTxt + "）" : "")
            if (myIndex === -1) {
                this.ff3.getChildByName("ranking").getChildByName("num").getComponent(Label).string = "暂未上榜"
            } else {
                this.ff3.getChildByName("ranking").getChildByName("num").getComponent(Label).string =
                    (myRecord.bossRank ? myRecord.bossRank : (myIndex + 1)).toString()
            }
            for (let i = 0; i < userlist.length; i++) {
                let item = nodePool.get()
                // 标题位显示所属服务器名（合并榜单后靠它区分两个服，取伤害记录里的 server 快照，旧记录无值时回落本服名）
                item.getChildByName("titleName").getComponent(Label).string =
                    userlist[i].server || this.worldBossServer || "世界BOSS讨伐"
                item.getChildByName("jieName").getComponent(Label).string = "伤害 " + this.formatDamage(userlist[i].totalDamage)
                item.getChildByName("guanName").getComponent(Label).string = "攻击 " + (userlist[i].hitCount || 0) + "次"
                item.getChildByName("name").getComponent(Label).string = userlist[i].nickname
                item.getChildByName("Lv").getComponent(Label).string = "lv " + userlist[i].lv
                item.getChildByName("ranking").getChildByName("num").getComponent(Label).string = (userlist[i].bossRank ? userlist[i].bossRank : (i + 1)).toString()
                await this.setHeader(item, userlist[i])
                // 合并榜里会有别服玩家（各服 userId 会重号）：把这一行的 server 快照一起带过去，
                // 不是本服时后端负责转发到对端实例取阵容；本服那行不传 server，自己的头像仍按老逻辑直接跳过。
                // 没 server 快照的老记录分不清人在哪个服，宁可不给点，不要把串了号别人的战队递过去
                if (userlist[i].server) {
                    const rowServer = userlist[i].server !== this.worldBossServer ? userlist[i].server : ''
                    this.bindHeader(item, userlist[i].userId, rowServer)
                }
                this.ContentNode.addChild(item)
                continue
            }
        } else if (customEventData == "2") {

            const userlist = this.tanglangRanking;
            this.ff3.getChildByName("Label").getComponent(Label).string = "lv " + config.userData.lv
            this.ff3.getChildByName("yxjm_df_txk").getChildByName("header").getComponent(Sprite).spriteFrame =
                await util.bundle.load(config.userData.gameImg, SpriteFrame)
            this.ff3.getChildByName("name").getComponent(Label).string = config.userData.nickname
            const index = userlist.findIndex((item) => item.userId === config.userData.userId)
            this.ff3.getChildByName("jingdu").getComponent(Label).string = "我当前进度：" + config.userData.chapter
            if (index === -1) {
                this.ff3.getChildByName("ranking").getChildByName("num").getComponent(Label).string = "暂未上榜"
            } else {
                this.ff3.getChildByName("ranking").getChildByName("num").getComponent(Label).string =
                    (index + 1).toString()
            }
            for (let i = 0; i < userlist.length; i++) {
                let item = nodePool.get()
                const [currentChapter, currentCalamity, currentStage] = userlist[i].chapter.split('-').map(Number);
                item.getChildByName("titleName").getComponent(Label).string = "第" + currentChapter + "章 " + userlist[i].titleName
                item.getChildByName("jieName").getComponent(Label).string = "第" + currentCalamity + "劫 " + userlist[i].jieName
                item.getChildByName("guanName").getComponent(Label).string = "第" + currentStage + "关 " + userlist[i].guanName
                item.getChildByName("name").getComponent(Label).string = userlist[i].nickname
                item.getChildByName("Lv").getComponent(Label).string = "lv " + userlist[i].lv
                item.getChildByName("ranking").getChildByName("num").getComponent(Label).string = userlist[i].gameRanking
                item.getChildByName("yxjm_df_txk").getChildByName("header").getComponent(Sprite).spriteFrame =
                    await util.bundle.load(userlist[i].gameImg, SpriteFrame)
                // 探险榜都是本服玩家，点头像看对方战队
                this.bindHeader(item, userlist[i].userId)
                this.ContentNode.addChild(item)
                continue
            }
        } else {
            let userlist = []
            let towerName = "青铜塔"
            let myFloor = config.userData.bronze1
            if (customEventData == "3") {
                userlist = this.qingtongRanking;
                towerName = "青铜塔"
                myFloor = config.userData.bronze1
            } else if (customEventData == "4") {
                userlist = this.baiyingRanking;
                towerName = "白银塔"
                myFloor = config.userData.silvertower
            } else if (customEventData == "5") {
                userlist = this.huangjinRanking;
                towerName = "黄金塔"
                myFloor = config.userData.goldentower
            }
            console.log(userlist, 333);
            this.ff3.getChildByName("Label").getComponent(Label).string = "lv " + config.userData.lv
            this.ff3.getChildByName("yxjm_df_txk").getChildByName("header").getComponent(Sprite).spriteFrame =
                await util.bundle.load(config.userData.gameImg, SpriteFrame)
            this.ff3.getChildByName("name").getComponent(Label).string = config.userData.nickname
            const index = userlist.findIndex((item) => item.userId === config.userData.userId)
            this.ff3.getChildByName("jingdu").getComponent(Label).string = "我当前进度：第 " + (myFloor == 1 ? 1 : myFloor - 1) + " 层"
            if (index === -1) {
                this.ff3.getChildByName("ranking").getChildByName("num").getComponent(Label).string = "暂未上榜"
            } else {
                this.ff3.getChildByName("ranking").getChildByName("num").getComponent(Label).string =
                    (index + 1).toString()
            }
            for (let i = 0; i < userlist.length; i++) {
                let item = nodePool.get()
                item.getChildByName("titleName").getComponent(Label).string = towerName
                item.getChildByName("jieName").getComponent(Label).string = "第" + userlist[i].floorNum + "层"
                item.getChildByName("guanName").getComponent(Label).string = this.formatToAncientDate(userlist[i].passTime)
                item.getChildByName("name").getComponent(Label).string = userlist[i].nickname
                item.getChildByName("Lv").getComponent(Label).string = "lv " + userlist[i].lv
                item.getChildByName("ranking").getChildByName("num").getComponent(Label).string = userlist[i].gameRanking
                item.getChildByName("yxjm_df_txk").getChildByName("header").getComponent(Sprite).spriteFrame =
                    await util.bundle.load(userlist[i].gameImg, SpriteFrame)
                // 塔榜都是本服玩家，点头像看对方战队
                this.bindHeader(item, userlist[i].userId)
                this.ContentNode.addChild(item)
                continue
            }

        }

    }

    async questry() {
        var message = `<size=28><color=#FFD700>排行榜奖励说明</color></size><br/>`
        message += `<color=#FFA500><size=20>▶ 世界BOSS讨伐榜</size></color><br/>`
        message += `<color=#FFFFFF><size=17>按全服当日累计伤害合并排名（两个服务器同一张榜，名次为全服名次），每天23:05（BOSS结束后）自动结算，以兑换码礼包发放（有效期1个月，点击头像→兑换）：</size></color><br/>`
        message += `<color=#FFFF00><size=17>全服第1名：魂*4 + 功勋2000 + 钻石1000 + 金币500万</size></color><br/>`
        message += `<color=#FFFF00><size=17>全服第2-10名：魂*2 + 功勋1000 + 钻石500 + 金币250万</size></color><br/>`
        message += `<color=#FFFF00><size=17>全服第11-100名：魂*1 + 功勋500 + 钻石250 + 金币125万</size></color><br/>`
        message += `<color=#FFFFFF><size=17>伤害达标奖励（在排名奖励之外<b>额外叠加</b>，达成哪档发哪档，可多档同拿）：</size></color><br/>`
        message += `<color=#FFFFFF><size=17>榜上任何一位玩家（含另一个服务器的）头像都可直接点击查看他的上阵战队：</size></color><br/>`
        message += `<color=#00E5FF><size=17>伤害达200万：额外 +功勋5000</size></color><br/>`
        message += `<color=#00E5FF><size=17>伤害达1000万：额外 +魂*1 + 功勋10000</size></color><br/>`
        message += `<color=#00E5FF><size=17>全服前10名且伤害达8888万：额外 +魂*10 + 功勋20000 + 钻石2000 + 金币2000万</size></color><br/>`
        message += `<color=#FFA500><size=20>▶ 探险榜（章节进度）</size></color><br/>`
        message += `<color=#FFFFFF><size=17>每周日晚22:00结算发放（兑换码礼包）：</size></color><br/>`
        message += `<color=#FFFF00><size=17>第1名：灵石5000 + 刷新符*15</size></color><br/>`
        message += `<color=#FFFF00><size=17>第2-10名：灵石2000 + 刷新符*10</size></color><br/>`
        message += `<color=#FFFF00><size=17>第11-100名：灵石500 + 刷新符*5</size></color><br/>`
        message += `<color=#FFA500><size=20>▶ 青铜塔榜</size></color><br/>`
        message += `<color=#FFFFFF><size=17>每周日晚22:00结算发放（兑换码礼包）：</size></color><br/>`
        message += `<color=#FFFF00><size=17>第1名：青铜矿*2000　第2-10名：青铜矿*1000　第11-100名：青铜矿*500</size></color><br/>`
        message += `<color=#FFA500><size=20>▶ 白银塔榜</size></color><br/>`
        message += `<color=#FFFFFF><size=17>每周日晚22:00结算发放（兑换码礼包）：</size></color><br/>`
        message += `<color=#FFFF00><size=17>第1名：玄铁矿*2000　第2-10名：玄铁矿*1000　第11-100名：玄铁矿*500</size></color><br/>`
        message += `<color=#FFA500><size=20>▶ 黄金塔榜</size></color><br/>`
        message += `<color=#FFFFFF><size=17>每周日晚22:00结算发放（兑换码礼包）：</size></color><br/>`
        message += `<color=#FFFF00><size=17>第1名：紫金矿*2000　第2-10名：紫金矿*1000　第11-100名：紫金矿*500</size></color><br/>`
        await this.node.parent.getChildByName("questionCrtl")
            .getComponent(questionCrtl)
            .read(message)
    }

    /**
     * 榜单条目绑头像点击：头像节点上没有 Button，用 TOUCH_END；先 off 再 on 避免节点池残留上一个榜的回调
     * @param server 目标玩家所在服务器名（世界BOSS合并榜才传），非本服时后端跨服取数据
     */
    private bindHeader(entry: Node, userId, server: string = '') {
        const header = entry.getChildByName("yxjm_df_txk")
        if (!header || userId == null) return
        header.off(Node.EventType.TOUCH_END)
        header.on(Node.EventType.TOUCH_END, () => {
            DzDetailCtrl.open(userId, undefined, server ? { server } : null)
        })
    }

    /**
     * 榜单条目头像：优先读后端下发的 img（伤害记录里的头像快照），次选 gameImg，再次用 fallback。
     * 三者都取不到时必须置空，ff3 节点池跳面板复用，不清会残留上一位玩家的头像。
     */
    private async setHeader(entry: Node, data: any, fallbackImg?: string) {
        const header = entry.getChildByName("yxjm_df_txk")
            ? entry.getChildByName("yxjm_df_txk").getChildByName("header") : null
        if (!header) return
        const sprite = header.getComponent(Sprite)
        let path = ""
        if (data) path = data.img || data.gameImg || ""
        if (!path) path = fallbackImg || ""
        sprite.spriteFrame = path ? await util.bundle.load(path, SpriteFrame) : null
    }

    /**
     * 伤害数值格式化：>=1亿 转「x.x亿」，>=1万 转「x.x万」，否则原值
     */
    formatDamage(value: number): string {
        const num = Number(value) || 0
        if (num >= 100000000) {
            return (num / 100000000).toFixed(1) + "亿"
        } else if (num >= 10000) {
            return (num / 10000).toFixed(1) + "万"
        }
        return num.toString()
    }

    /**
     * 时间戳/Date对象 转 「公元xxx年xx月xx日xxx时辰」格式
     * @param source 入参支持：秒级时间戳/毫秒级时间戳/Date对象
     * @returns 格式化后的古代时间字符串 例：公元2026年01月17日子时
     */
    formatToAncientDate(source: number | Date): string {
        // 步骤1：统一处理入参，转为标准Date对象
        let date: Date;
        if (source instanceof Date) {
            date = source;
        } else {
            let timestamp = source;
            // 自动识别10位秒级时间戳，转为毫秒级
            if (timestamp.toString().length === 10) {
                timestamp = timestamp * 1000;
            }
            date = new Date(timestamp);
        }

        // 步骤2：获取公历年月日，补0格式化
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString();
        const day = date.getDate().toString();

        // 步骤3：十二时辰对照规则（核心：23点为子时起点）
        const SHI_CHEN_MAP = [
            { start: 23, end: 1, name: '子时' },
            { start: 1, end: 3, name: '丑时' },
            { start: 3, end: 5, name: '寅时' },
            { start: 5, end: 7, name: '卯时' },
            { start: 7, end: 9, name: '辰时' },
            { start: 9, end: 11, name: '巳时' },
            { start: 11, end: 13, name: '午时' },
            { start: 13, end: 15, name: '未时' },
            { start: 15, end: 17, name: '申时' },
            { start: 17, end: 19, name: '酉时' },
            { start: 19, end: 21, name: '戌时' },
            { start: 21, end: 23, name: '亥时' }
        ];

        // 步骤4：根据当前小时匹配时辰
        const hours = date.getHours();
        let currentShiChen = '子时'; // 默认值
        for (const item of SHI_CHEN_MAP) {
            if (item.start === 23) {
                // 特殊处理子时：23点-凌晨1点
                if (hours >= 23 || hours < 1) {
                    currentShiChen = item.name;
                    break;
                }
            } else {
                if (hours >= item.start && hours < item.end) {
                    currentShiChen = item.name;
                    break;
                }
            }
        }

        // 步骤5：拼接最终格式：公元XXX年XX月XX日XX时辰
        return `${year}-${month}-${day} ${currentShiChen}`;
    }


}
