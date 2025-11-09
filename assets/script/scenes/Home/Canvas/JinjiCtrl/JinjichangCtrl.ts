import { _decorator, Component, director, find, instantiate, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
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
    @property(Node)
    Kk: Node
    @property(Node)
    energyHuoliLabel: Node//活力力显示
    @property(Node)
    Huoli: Node
    gameRanking = 0
    initialized = false;
    huoliEnergy = 0
    timer = 0
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

    GetLeaveHuoliEnergy() {
        var key = 'Leave_EnergyHuoliNumber2';
        var str = localStorage.getItem(key);
        if (str) {
            return parseInt(str);
        }
        return 10;
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
                    let parking = map['parking'];
                    for (let i = 0; i < this.Kk.children.length; i++) {
                        this.Kk.children[i].children[1].children[0].getComponent(Label).string = "lv " + parking[i].lv
                        // 绑定事件
                        this.Kk.children[i].children[2].on("click", () => { this.clickJiebanFun(parking[i].userId) })
                        this.Kk.children[i].children[3].on("click", () => { this.clickTiaozhanFun(parking[i].userId) })
                        this.Kk.children[i].children[4].getComponent(Label).string = parking[i].nickname
                        this.Kk.children[i].children[5].getComponent(Label).string = "胜 " + parking[i].winCount
                        this.Kk.children[i].getChildByName("yxjm_df_txk").getChildByName("header").getComponent(Sprite).spriteFrame =
                            await util.bundle.load(parking[i].gameImg, SpriteFrame)
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
    public clickJiebanFun(userId) {
        AudioMgr.inst.playOneShot("sound/other/click");
        console.log(userId)
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
            userId: userId
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
}


