import { _decorator, Component, find, instantiate, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { battleCache, BattleLogItem, getConfig, getToken, updateTiAndHuoli } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { FightMap } from '../../../Fight/Canvas/FightMap';
import { HomeCanvas } from '../../HomeCanvas';
import { DzDetailCtrl } from 'db://assets/script/prefab/DzDetailCtrl';
const { ccclass, property } = _decorator;

@ccclass('RankingCrtl')
export class RankingCrtl extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    @property(Node)
    myRangking: Node
    // 榜单模式：false=世界排名（默认），true=好友排名；点 frindranking 按钮在两者间来回切换
    private isFriendRanking = false
    // 记住世界榜的“我的名次”，从好友榜切回时直接复显，不用二次请求 ranking
    private worldMyRanking: any = "--"
    start() {

    }

    update(deltaTime: number) {

    }

    backPk() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("RankingCrtl").active = false
    }

    render(myRangking) {
        // render 负责渲染世界榜，外部入口（JinjichangCtrl）打开面板时据此复位为默认页
        this.isFriendRanking = false
        this.worldMyRanking = myRangking
        const config = getConfig()
        // const token = getToken()
        const postData = {
            // token: token,
            userId: config.userData.userId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "ranking100", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                //console.log(data); // 处理响应数据
                if (data.success == '1') {
                    this.myRangking.getComponent(Label).string = myRangking
                    await this.fillList(data.data)
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );

        // console.log(userlist)
        this.node.active = true

    }
    refresh() {
        const config = getConfig()
        const postData = {
            // token: token,
            userId: config.userData.userId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "ranking", options)
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
                    //console.log(user); //
                    config.userData.winCount = data.winCount
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                    if (this.isFriendRanking) {
                        // 从好友榜发起战斗后仍回到好友榜，且自己胜场已变需要重算名次
                        await this.loadFriendRanking()
                    } else {
                        this.myRangking.getComponent(Label).string = data.gameRanking
                        this.render(data.gameRanking)
                    }
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );
    }
    //体力获取时间
    GetLeaveHuoliEnergyTime() {
        var key = 'Leave_EnergyHuoliTimes1';
        var str = localStorage.getItem(key);
        if (str) {
            return parseInt(str);
        }
        return 600;
    }
    GetLeaveHuoliEnergy() {
        var key = 'Leave_EnergyHuoliNumber2';
        var str = localStorage.getItem(key);
        if (str) {
            return parseInt(str);
        }
        return 0;
    }
    CheckLoginHuoliDate(time) {
        var lastTime = new Date(time);
        var now = new Date();
        if (now.getFullYear() !== lastTime.getFullYear() ||
            now.getMonth() !== lastTime.getMonth() ||
            now.getDate() !== lastTime.getDate()) {
            // this.needReset = true;
            return true;
        }
        // cc.log("不需要重置", lastTime.toDateString(), now.toDateString())
        return false;
    }
    SetLeaveHuoliEnergy(i) {
        var key = 'Leave_EnergyHuoliNumber2';
        var value = i + "";
        localStorage.setItem(key, value);
    }
    SetLeaveEnergyHuoliTime(i) {
        var key = 'Leave_EnergyHuoliTimes1';
        var value = i + "";
        localStorage.setItem(key, value);
    }
    public async clickTiaozhanFun(userId) {
        AudioMgr.inst.playOneShot("sound/other/click");
        // director.addPersistRootNode(this.node);
        const config = getConfig()
        const token = getToken()
        var LeaveHuoliEnergy = this.GetLeaveHuoliEnergy();
        if (LeaveHuoliEnergy - 10 < 0) {
            return await util.message.prompt({ message: "活力不足" })
        }
        this.SetLeaveHuoliEnergy(LeaveHuoliEnergy - 10)
        const postData = {
            token: token,
            userId: userId,
            id: config.userData.userId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "battle", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                //console.log(data); // 处理响应数据
                if (data.success == '1') {
                   var map = data.data;
                    var user = map['user'];
                    const battle = map['battle'];
                    // 3. 存入本地缓存
                    const saveItem: BattleLogItem = {
                        battleId: battle.id,
                        saveTime: Date.now(),
                        battleData: battle.json
                    };
                    battleCache.saveBattleItem(saveItem);
                    updateTiAndHuoli(user);
                    this.refresh()
                    const holAnimationPrefab = await util.bundle.load("prefab/FightMap", Prefab)
                    const holAnimationNode = instantiate(holAnimationPrefab)
                    this.node.parent.addChild(holAnimationNode)
                    await holAnimationNode
                        .getComponent(FightMap)
                        .render(battle.id, null, null)
                    find('Canvas').getComponent(HomeCanvas).audioSource.pause()
                    this.node.parent.getChildByName("FightMap").active = true
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }

            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );

    }


    /**
     * 榜单条目统一渲染：世界榜与好友榜共用同一套 prefab/ff 节点池
     * 每条需含 userId、nickname、lv、winCount、gameImg
     */
    private async fillList(userlist) {
        const config = getConfig()
        const nodePool = util.resource.getNodePool(
            await util.bundle.load("prefab/ff", Prefab)
        )
        const childrens = [...this.ContentNode.children]
        for (let i = 0; i < childrens.length; i++) {
            const node = childrens[i];
            node.getChildByName("tiaozhan").off("click")
            node.getChildByName("yxjm_df_txk").off(Node.EventType.TOUCH_END)
            nodePool.put(node)
        }
        if (!userlist || userlist.length === 0) return
        for (let i = 0; i < userlist.length; i++) {
            let item = nodePool.get()
            if (config.userData.userId == userlist[i].userId) {
                item.getChildByName("tiaozhan").active = false

            } else {
                item.getChildByName("tiaozhan").active = true
                item.getChildByName("tiaozhan").on("click", () => {
                    this.clickTiaozhanFun(userlist[i].userId)
                })
            }
            // 祝福按钮只属于好友面板，节点池是跨面板复用的，这里显式关掉避免残留上个面板的状态和回调
            const zhufu = item.getChildByName("zhufu")
            if (zhufu) {
                zhufu.off("click")
                zhufu.active = false
            }
            item.getChildByName("textbox_bg").children[0].getComponent(Label).string = "lv " + userlist[i].lv
            // 绑定事件
            item.getChildByName("name").getComponent(Label).string = userlist[i].nickname
            item.getChildByName("Count").getComponent(Label).string = "胜 " + userlist[i].winCount
            item.getChildByName("ranking").getChildByName("num").getComponent(Label).string = i + 1 + ""
            item.getChildByName("yxjm_df_txk").getChildByName("header").getComponent(Sprite).spriteFrame =
                await util.bundle.load(userlist[i].gameImg, SpriteFrame)
            // 点头像看对方战队；ff 节点池跨面板复用，先 off 再 on 避免残留另一个面板的回调
            const headerNode = item.getChildByName("yxjm_df_txk")
            headerNode.off(Node.EventType.TOUCH_END)
            headerNode.on(Node.EventType.TOUCH_END, () => {
                DzDetailCtrl.open(userlist[i].userId)
            })
            this.ContentNode.addChild(item)
        }
    }

    /**
     * 点 frindranking 按钮：世界排名 <-> 好友排名 切换（同一个按钮再点一次即切回）
     */
    public async friendRanking() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.isFriendRanking = !this.isFriendRanking
        if (!this.isFriendRanking) {
            // 切回世界榜
            this.render(this.worldMyRanking)
        } else {
            await this.loadFriendRanking()
        }
    }

    /** 好友榜：把自己也纳入榜单，按胜场降序，名次徽标为榜内位置 */
    private async loadFriendRanking() {
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
        this.node.active = true
        try {
            const response = await fetch(config.ServerUrl.url + "friendAllList", options)
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json()
            if (data.success != '1') {
                // 拉取失败不能停在空白列表上，退回世界榜
                this.isFriendRanking = false
                await util.message.prompt({ message: data.errorMsg || "服务器异常" })
                this.render(this.worldMyRanking)
                return
            }
            const friends = (data.data && data.data["friends"]) ? data.data["friends"] : []
            const self = {
                userId: config.userData.userId,
                nickname: config.userData.nickname,
                lv: config.userData.lv,
                winCount: config.userData.winCount,
                gameImg: config.userData.gameImg,
            }
            const list: any[] = [self]
            for (let i = 0; i < friends.length; i++) {
                const f = friends[i]
                if (!f || f.userId == null) continue
                // 防后端把自己也列进好友导致重复
                if (String(f.userId) === String(self.userId)) continue
                list.push(f)
            }
            list.sort((a, b) => (b.winCount || 0) - (a.winCount || 0))
            const myIndex = list.findIndex(u => String(u.userId) === String(self.userId))
            await this.fillList(list)
            // 好友榜下“我的排名”显示榜内位置
            this.myRangking.getComponent(Label).string = (myIndex + 1) + ""
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            this.isFriendRanking = false
            this.render(this.worldMyRanking)
        }
    }

}


