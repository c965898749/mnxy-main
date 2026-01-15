import { _decorator, Component, director, find, instantiate, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { getConfig, getToken, updateHuoliTime } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { FightMap } from '../../../Fight/Canvas/FightMap';
import { HomeCanvas } from '../../HomeCanvas';
import { RankingCrtl } from '../RankingCrtl/RankingCrtl';
const { ccclass, property } = _decorator;

@ccclass('JinjichangCtrl')
export class JinjichangCtrl extends Component {
    @property(Node)
    WinCount: Node
    @property(Node)
    GameRanking: Node
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    @property(Node)
    energyHuoliLabel: Node//活力力显示
    @property(Node)
    Huoli: Node
    gameRanking = 0
    initialized = false;
    huoliEnergy = 0
    MaxEnergy: 720//最大体力值
    // EnergyReturnTime: 600//体力回复时间
    timer = 0
    @property({ type: cc.Integer, tooltip: "固定尺寸" })
    energy = 0
    start() {
        this.refushData()
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

    SetLeaveEnergyHuoliTime(i) {
        var key = 'Leave_EnergyHuoliTimes1';
        var value = i + "";
        localStorage.setItem(key, value);
    }
    //体力系统
    setTili() {
        var EnergyReturnTime = 300
        this.huoliEnergy = this.GetLeaveHuoliEnergy();
        //cc.log(this.energy);
        var LeaveHuoliEnergy = this.GetLeaveHuoliEnergy();
        var lastTime2 = parseInt(localStorage.getItem('LastGetHuoliTime1'));
        if (!lastTime2) {
            lastTime2 = 0;
        }
        let nowTime = new Date().getTime();
        var hiliCount = Math.floor((nowTime - lastTime2) / 1000 / EnergyReturnTime)
        // 活力下次恢复剩余秒数（同理，保持一致性）
        var passedHuoliSeconds = (nowTime - lastTime2) / 1000;
        var HuoliTime = EnergyReturnTime - (passedHuoliSeconds % EnergyReturnTime);
        this.SetLeaveEnergyHuoliTime(HuoliTime);
        if (hiliCount < 0) {
            hiliCount = 0;
        }


        if (this.huoliEnergy > this.MaxEnergy) {
            let lastDate = this.GetLeaveHuoliEnergyTime();
            if (this.CheckLoginHuoliDate(lastDate)) {
                this.huoliEnergy = this.MaxEnergy;
                this.SetLeaveHuoliEnergy(this.MaxEnergy);
                updateHuoliTime();
            }
        } else if ((hiliCount + LeaveHuoliEnergy) >= this.MaxEnergy) {
            this.huoliEnergy = this.MaxEnergy;
            localStorage.setItem('LastGetHuoliTime1', nowTime + "");
            this.SetLeaveHuoliEnergy(this.huoliEnergy);
            if (hiliCount > 0) {
                updateHuoliTime();
            }
        } else if (hiliCount > 0) {
            this.huoliEnergy = hiliCount + LeaveHuoliEnergy;
            localStorage.setItem('LastGetHuoliTime1', nowTime + "");
            this.SetLeaveHuoliEnergy(this.huoliEnergy);
            updateHuoliTime();
        }


        if (this.energyHuoliLabel) {
            this.energyHuoliLabel.getComponent(Label).string = this.huoliEnergy + "/" + this.MaxEnergy;
            this.Huoli.setScale(
                this.huoliEnergy / this.MaxEnergy,
                1,
                1
            )
        }
    }

    refresh() {
        this.huoliEnergy = this.GetLeaveHuoliEnergy();
        this.energyHuoliLabel.getComponent(Label).string = this.huoliEnergy + "/720";
        this.Huoli.setScale(
            this.huoliEnergy / 720,
            1,
            1
        )
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
                    this.WinCount.getComponent(Label).string = data.winCount
                    this.GameRanking.getComponent(Label).string = data.gameRanking
                    this.gameRanking = data.gameRanking
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );
    }



    public refushData() {
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
        fetch(config.ServerUrl.url + "jingji", options)
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
                    let userlist = map['parking'];
                    const nodePool = util.resource.getNodePool(
                        await util.bundle.load("prefab/ff2", Prefab)
                    )
                    const childrens = [...this.ContentNode.children]
                    for (let i = 0; i < childrens.length; i++) {
                        const node = childrens[i];
                        node.getChildByName("tiaozhan").off("click")
                        node.getChildByName("jieban").off("click")
                        nodePool.put(node)
                    }
                    for (let i = 0; i < userlist.length; i++) {
                        let item = nodePool.get()
                        item.getChildByName("textbox_bg").children[0].getComponent(Label).string = "lv " + userlist[i].lv
                        // 绑定事件
                        item.getChildByName("name").getComponent(Label).string = userlist[i].nickname
                        item.getChildByName("Count").getComponent(Label).string = "胜 " + userlist[i].winCount
                        item.getChildByName("yxjm_df_txk").getChildByName("header").getComponent(Sprite).spriteFrame =
                            await util.bundle.load(userlist[i].gameImg, SpriteFrame)
                        item.getChildByName("tiaozhan").on("click", () => { this.clickTiaozhanFun(userlist[i].userId) })
                        if (!userlist[i].friendStatus) {
                            item.getChildByName("jieban").active = true
                            item.getChildByName("jieban").on("click", () => {
                                this.clickJiebanFun(userlist[i].userId, item)
                            })
                        }
                        this.ContentNode.addChild(item)
                        continue
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
    public clickJiebanFun(userId, item) {
        AudioMgr.inst.playOneShot("sound/other/click");
        // director.addPersistRootNode(this.node);
        const config = getConfig()
        const token = getToken()
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
        fetch(config.ServerUrl.url + "invitationSend", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                //console.log(data); // 处理响应数据
                if (data.success == '1') {
                    item.getChildByName("jieban").active = false
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }

            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );
    }
    SetLeaveHuoliEnergy(i) {
        var key = 'Leave_EnergyHuoliNumber2';
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
                    this.refresh()
                    const holAnimationPrefab = await util.bundle.load("prefab/FightMap", Prefab)
                    const holAnimationNode = instantiate(holAnimationPrefab)
                    this.node.parent.addChild(holAnimationNode)
                    await holAnimationNode
                        .getComponent(FightMap)
                        .render(data.data.id, null, null)
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

    openRanking() {
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
                    var data = data.data;
                    await this.node.parent.getChildByName("RankingCrtl")
                        .getComponent(RankingCrtl)
                        .render(data, this.gameRanking)

                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );

    }
    goBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
        this.node.parent.getChildByName("JinjiCtrl").active = true
    }
}


