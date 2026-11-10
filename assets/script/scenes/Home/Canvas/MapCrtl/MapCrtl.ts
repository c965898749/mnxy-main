import { _decorator, Component, find, instantiate, Label, Node, Prefab, sp, tween, v3, Vec3 } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { PveCtrl } from '../PveCtrl/PveCtrl';
import { battleCache, BattleLogItem, getConfig, getToken } from 'db://assets/script/common/config/config';
import { util } from 'db://assets/script/util/util';
import { MapRankingCrtl } from '../MapRankingCrtl/MapRankingCrtl';
import { TrialTowerCrtl } from '../TrialTowerCrtl/TrialTowerCrtl';
import { FightMap } from '../../../Fight/Canvas/FightMap';
import { HomeCanvas } from '../../HomeCanvas';
const { ccclass, property } = _decorator;

@ccclass('MapCrtl')
export class MapCrtl extends Component {
    @property(Node)
    Title: Node
    @property(Node)
    Map: Node
    index: number = 0
    initialized = false;
    tiles = ["踏上旅途", "冲向妖界", "龙宫探宝", "地府改命", "大闹天宫", "西天取经", "修成正果", "血色禁地", "极西之地", "不周山下","大荒神文"]
    // 世界BOSS挑战CD（与服务端 1 分钟 Redis CD 对齐）：记录冷却结束的时间戳，跨场景切换也能保持
    bossCdEndTs: number = 0
    // 世界BOSS当日排班状态（worldBossInfo 返回）：hasSchedule/startTime/endTime/hpRate/serverTime
    private bossSchedule: any = null
    // 服务器时间-本地时间(毫秒)，用 worldBossInfo 返回的 serverTime 校准，防设备时钟偏差
    private bossClockOffset: number = 0
    // 最近一次渲染到 boss/num 的文案，变化时才重绘
    private _lastBossLabel: string = ""
    start() {
        this.Title.getComponent(Label).string = "踏上旅途 1/11"
        this.bossCdEndTs = parseInt(localStorage.getItem("WorldBossCdEnd") || "0") || 0
        this.refresh()
        this.fetchWorldBossInfo()
    }
    onEnable() {
        if (!this.initialized) {
            // 初始化代码
            this.initialized = true;
        } else {
            this.refresh()
            this.fetchWorldBossInfo()
        }

    }
    refresh() {
        // let selectSkeleton = this.node.getChildByName("boss").getComponent(sp.Skeleton)
        // selectSkeleton.setAnimation(0, "stand01", true)
        const config = getConfig()
        // 解析当前关卡的章、劫、关
        const [currentChapter, currentCalamity, currentStage] = config.userData.chapter.split('-').map(Number);
        const previousLevels = [];

        // 验证关卡格式是否正确
        if (
            isNaN(currentChapter) || isNaN(currentCalamity) || isNaN(currentStage) ||
            currentChapter < 1 || currentChapter > 11 ||
            currentCalamity < 1 || currentCalamity > 6 ||
            currentStage < 1 || currentStage > 10
        ) {
            throw new Error('关卡格式不正确，请使用"章-劫-关"格式，如"1-1-1"，且范围为11章6劫10关');
        }

        // 遍历所有前面的章
        for (let chapter = 1; chapter <= currentChapter; chapter++) {
            // 确定当前章需要遍历到的劫数
            const maxCalamity = chapter < currentChapter ? 6 : currentCalamity;

            // 遍历当前章的劫
            for (let calamity = 1; calamity <= maxCalamity; calamity++) {
                // 确定当前劫需要遍历到的关卡数
                const maxStage = (chapter === currentChapter && calamity === currentCalamity)
                    ? currentStage - 1
                    : 10;
                //激活当前关卡
                this.Map.children[chapter - 1].children[calamity - 1].active = true;
                // 如果当前劫有需要添加的关卡，则添加
                if (maxStage >= 1) {
                    //展示当前进度
                    this.Map.children[chapter - 1].children[calamity - 1].getChildByName("ProgressBar").getChildByName("Bar").setScale(
                        maxStage / 10,
                        1,
                        1
                    )

                } else {
                    this.Map.children[chapter - 1].children[calamity - 1].getChildByName("ProgressBar").getChildByName("Bar").setScale(
                        0 / 10,
                        1,
                        1
                    )
                }
            }
        }
    }
    update(deltaTime: number) {
        // 每秒评估排班状态与剩余CD，渲染 boss/num 文案（未到点倒计时/已结束/已被击败/冷却秒数）
        this.renderBossState()
    }
    right() {
        AudioMgr.inst.playOneShot("sound/other/click");
        tween(this.Map.children[this.index])
            .to(0.5, { position: v3(-640, 0) })
            .start();
        this.index++
        if (this.index >= 11) {
            this.index = 0
        }
        this.Title.getComponent(Label).string = this.tiles[this.index] + (this.index + 1) + "/11"
        this.Map.children[this.index].setPosition(640, 0, 0)
        tween(this.Map.children[this.index])
            .to(0.5, { position: v3(0, 0) })
            .start();
    }
    left() {
        AudioMgr.inst.playOneShot("sound/other/click");
        tween(this.Map.children[this.index])
            .to(0.5, { position: v3(640, 0) })
            .start();
        this.index--
        if (this.index < 0) {
            this.index = 10
        }
        this.Title.getComponent(Label).string = this.tiles[this.index] + (this.index + 1) + "/11"
        this.Map.children[this.index].setPosition(-640, 0, 0)
        tween(this.Map.children[this.index])
            .to(0.5, { position: v3(0, 0) })
            .start();
    }

    async openMap(event: Event, customEventData: string) {
        AudioMgr.inst.playOneShot("sound/other/click");
        // this.node.parent.getChildByName("PveCtrl").active = true
        console.log(customEventData)
        await this.render(customEventData)
    }
    async render(mapId) {
        await this.node.parent.getChildByName("PveCtrl")
            .getComponent(PveCtrl)
            .render(mapId)
    }
    openXiLianMap() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("ElemRefineDgnCtrl").active = true
    }
    async openta(event: Event, customEventData: string) {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId,
            str: customEventData,
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "getTower", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                //console.log(data); // 处理响应数据
                if (data.success == '1') {
                    let info = data.data;
                    info.customEventData = customEventData
                    await this.node.parent.getChildByName("TrialTowerCrtl")
                        .getComponent(TrialTowerCrtl)
                        .render(info)
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );

    }

    bossbattle() {
        const boss = this.node.getChildByName("boss")
        if (!boss) return
        const selectSkeleton = boss.getComponent(sp.Skeleton)
        // 排班状态门控：无排班/已被击败/未到点/已结束均禁用挑战，不发起请求（unknown=排班未拉到，放行交由服务端兜底）
        const status = this.getBossStatus()
        if (status !== 'open' && status !== 'unknown') {
            util.message.prompt({ message: this.blockMessage(status) })
            return
        }
        AudioMgr.inst.playOneShot("sound/other/haojiao");
        // 冷却中：仅播动作并提示，不发起挑战请求
        const remain = this.getBossCdRemaining()
        if (remain > 0) {
            this.playBossRoar(selectSkeleton)
            util.message.prompt({ message: "世界BOSS冷却中，请等待 " + remain + " 秒" })
            return
        }
        // 咆哮一次后回到循环待机
        this.playBossRoar(selectSkeleton)
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId,
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "worldBossChallenge", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(async data => {
                if (data.success == '1') {
                    const info = data.data;
                    // 挑战成功：同步最新功勋（+5）并进入 60 秒冷却
                    if (info && info.userInfo) {
                        config.userData.gongxun = info.userInfo.gongxun
                        localStorage.setItem("UserConfigData", JSON.stringify(config))
                    }
                    this.startBossCd(60)
                    // 重新拉取排班：本次若击杀BOSS(hp_rate=0)，按钮立即切换为“已被击败”状态
                    this.fetchWorldBossInfo()
                    const battle = info && info.battle
                    if (battle && battle.json) {
                        // 服务端已返回战斗数据：与试炼塔/PVE 一致进入战斗画面（先缓存战报→加载 FightMap 预制体播放）
                        const saveItem: BattleLogItem = {
                            battleId: battle.id,
                            saveTime: Date.now(),
                            battleData: battle.json
                        };
                        battleCache.saveBattleItem(saveItem);
                        const holAnimationPrefab = await util.bundle.load("prefab/FightMap", Prefab)
                        const holAnimationNode = instantiate(holAnimationPrefab)
                        this.node.parent.addChild(holAnimationNode)
                        const fightMapComp = holAnimationNode.getComponent(FightMap)
                        await fightMapComp.render(battle.id, null, null)
                        find('Canvas').getComponent(HomeCanvas).audioSource.pause()
                        this.node.parent.getChildByName("FightMap").active = true
                    } else {
                        util.message.prompt({ message: "挑战世界BOSS成功，功勋 +5" })
                    }
                } else {
                    util.message.confirm({ message: data.errorMsg || "服务器异常" })
                    // 服务端判定仍在冷却（如前端本地CD丢失）：同步本地CD
                    if (data.errorMsg && data.errorMsg.indexOf("冷却") >= 0) {
                        this.startBossCd(60)
                    }
                    // 服务端判定状态变化（击败/结束/未到点/无排班）：同步排班状态
                    if (data.errorMsg && (data.errorMsg.indexOf("击败") >= 0 || data.errorMsg.indexOf("结束") >= 0
                        || data.errorMsg.indexOf("开启") >= 0 || data.errorMsg.indexOf("排班") >= 0)) {
                        this.fetchWorldBossInfo()
                    }
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );
    }

    // 世界BOSS咆哮动作：standtostand01 播一次后切回 skill04 循环
    private playBossRoar(selectSkeleton: sp.Skeleton) {
        if (!selectSkeleton) return
        selectSkeleton.setAnimation(0, "standtostand01", false)
        selectSkeleton.setCompleteListener(() => {
            selectSkeleton.setAnimation(0, "skill04", true)
            selectSkeleton.setCompleteListener(null)
        })
    }

    // 剩余CD秒数（向上取整，不小于0）
    private getBossCdRemaining(): number {
        return Math.max(0, Math.ceil((this.bossCdEndTs - Date.now()) / 1000))
    }

    // 开始一段世界BOSS冷却并落盘
    private startBossCd(seconds: number) {
        this.bossCdEndTs = Date.now() + seconds * 1000
        localStorage.setItem("WorldBossCdEnd", this.bossCdEndTs.toString())
        this.renderBossState()
    }

    // 拉取当天世界BOSS排班（startTime/endTime/hpRate/serverTime），并校准服务器时钟
    fetchWorldBossInfo() {
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId,
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "worldBossInfo", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success == '1' && data.data) {
                    this.bossSchedule = data.data;
                    // serverTime 为当天 HH:mm(:ss)，换算成今天的时间戳与本地时钟求差
                    this.bossClockOffset = this.todayTsFrom(data.data.serverTime) - Date.now();
                }
            })
            .catch(error => {
                console.error('获取世界BOSS排班失败:', error);
            });
    }

    // 把 "HH:mm"/"HH:mm:ss" 换算为按服务器时钟校准后的当天时间戳（ms）；无效返回 NaN
    private todayTsFrom(hhmmss: string): number {
        if (!hhmmss) return NaN
        const parts = String(hhmmss).split(":")
        const d = new Date(Date.now() + this.bossClockOffset)
        d.setHours(parseInt(parts[0]) || 0, parseInt(parts[1]) || 0, parseInt(parts[2]) || 0, 0)
        return d.getTime()
    }

    // 排班状态：unknown=未拉到(放行交服务端) / none=无排班 / dead=已被击败 / pre=未到点 / over=已结束 / open=时间窗内
    // 优先级与服务端 worldBossChallenge 拦截顺序一致：先击败，再时间窗
    private getBossStatus(): string {
        const s = this.bossSchedule
        if (!s) return 'unknown'
        if (!s.hasSchedule) return 'none'
        if (parseFloat(s.hpRate == null ? "1" : String(s.hpRate)) <= 0) return 'dead'
        const now = Date.now() + this.bossClockOffset
        if (s.startTime && now < this.todayTsFrom(s.startTime)) return 'pre'
        if (s.endTime && now > this.todayTsFrom(s.endTime)) return 'over'
        return 'open'
    }

    // 禁用挑战时的提示文案
    private blockMessage(status: string): string {
        switch (status) {
            case 'none': return "今日无世界BOSS"
            case 'dead': return "今日BOSS已被击败，明日重置后再来挑战"
            case 'pre': return "世界BOSS将于 " + this.trimHHMM(this.bossSchedule && this.bossSchedule.startTime) + " 开启，敬请等待"
            case 'over': return "今日世界BOSS挑战已结束"
            default: return "服务器异常"
        }
    }

    // "09:00:00" -> "09:00"
    private trimHHMM(hhmmss: string): string {
        if (!hhmmss) return ""
        const p = String(hhmmss).split(":")
        return p.length >= 2 ? p[0] + ":" + p[1] : String(hhmmss)
    }

    // 剩余时长文本：超过1小时为 h:mm:ss，否则 mm:ss
    private fmtDuration(ms: number): string {
        const total = Math.max(0, Math.ceil(ms / 1000))
        const h = Math.floor(total / 3600)
        const m = Math.floor((total % 3600) / 60)
        const sec = total % 60
        const mm = (m < 10 ? "0" : "") + m
        const ss = (sec < 10 ? "0" : "") + sec
        return h > 0 ? h + ":" + mm + ":" + ss : mm + ":" + ss
    }

    // 渲染 boss/num 文案：未到点“09:00 开启(倒计时)”/过点“今日已结束”/击败“今日BOSS已被击败”/时间窗内显示剩余CD
    private renderBossState() {
        const boss = this.node.getChildByName("boss")
        if (!boss) return
        const num = boss.getChildByName("num")
        if (!num) return
        const label = num.getComponent(Label)
        if (!label) return
        const status = this.getBossStatus()
        let text = ""
        if (status === 'pre') {
            const remainMs = this.todayTsFrom(this.bossSchedule.startTime) - (Date.now() + this.bossClockOffset)
            text = this.trimHHMM(this.bossSchedule.startTime) + " 开启(" + this.fmtDuration(remainMs) + ")"
        } else if (status === 'over') {
            text = "今日已结束"
        } else if (status === 'dead') {
            text = "今日BOSS已被击败"
        } else if (status === 'none') {
            text = "今日无世界BOSS"
        } else {
            const remain = this.getBossCdRemaining()
            text = remain > 0 ? remain + "s" : ""
        }
        if (text === this._lastBossLabel) return
        this._lastBossLabel = text
        num.active = text != ""
        label.string = text
    }

    openHotEvents() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("HotEventsCtrl").active = true
    }
    openRanking() {
        // AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "mapRanking100", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                //console.log(data); // 处理响应数据
                if (data.success == '1') {
                    var data = data.data;
                    await this.node.parent.getChildByName("MapRankingCrtl")
                        .getComponent(MapRankingCrtl)
                        .render(data)

                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );

    }
    openKuan() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("KuanCrtl").active = true
    }
}


