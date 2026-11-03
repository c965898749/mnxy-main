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
    private _lastShownCd: number = -1
    start() {
        this.Title.getComponent(Label).string = "踏上旅途 1/11"
        this.bossCdEndTs = parseInt(localStorage.getItem("WorldBossCdEnd") || "0") || 0
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
        // 每秒刷新 boss/num 上显示的世界BOSS剩余CD（取整秒变化时才重绘）
        const remain = this.getBossCdRemaining()
        if (remain !== this._lastShownCd) {
            this._lastShownCd = remain
            this.renderBossCd(remain)
        }
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
        AudioMgr.inst.playOneShot("sound/other/haojiao");
        const boss = this.node.getChildByName("boss")
        if (!boss) return
        const selectSkeleton = boss.getComponent(sp.Skeleton)
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
        this._lastShownCd = this.getBossCdRemaining()
        this.renderBossCd(this._lastShownCd)
    }

    // 将剩余CD渲染到 boss 节点下的 num 节点（有CD时显示秒数，无CD时隐藏）
    private renderBossCd(remain: number) {
        const boss = this.node.getChildByName("boss")
        if (!boss) return
        const num = boss.getChildByName("num")
        if (!num) return
        const label = num.getComponent(Label)
        if (!label) return
        if (remain > 0) {
            num.active = true
            label.string = remain + "s"
        } else {
            num.active = false
            label.string = ""
        }
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


