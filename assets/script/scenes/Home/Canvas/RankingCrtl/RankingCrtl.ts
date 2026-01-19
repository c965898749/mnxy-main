import { _decorator, Component, find, instantiate, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { FightMap } from '../../../Fight/Canvas/FightMap';
import { HomeCanvas } from '../../HomeCanvas';
const { ccclass, property } = _decorator;

@ccclass('RankingCrtl')
export class RankingCrtl extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    @property(Node)
    myRangking: Node
    start() {

    }

    update(deltaTime: number) {

    }

    backPk() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("RankingCrtl").active = false
    }

    render(myRangking) {
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
                    var userlist = data.data;
                    const nodePool = util.resource.getNodePool(
                        await util.bundle.load("prefab/ff", Prefab)
                    )
                    const childrens = [...this.ContentNode.children]
                    for (let i = 0; i < childrens.length; i++) {
                        const node = childrens[i];
                        node.getChildByName("tiaozhan").off("click")
                        nodePool.put(node)
                    }
                    this.myRangking.getComponent(Label).string = myRangking
                    for (let i = 0; i < userlist.length; i++) {
                        let item = nodePool.get()
                        if (myRangking > 100) {
                            item.getChildByName("tiaozhan").active = false

                        } else {
                            item.getChildByName("tiaozhan").active = true
                            item.getChildByName("tiaozhan").on("click", () => {
                                this.clickTiaozhanFun(userlist[i].userId)
                            })
                        }
                        item.getChildByName("textbox_bg").children[0].getComponent(Label).string = "lv " + userlist[i].lv
                        // 绑定事件
                        item.getChildByName("name").getComponent(Label).string = userlist[i].nickname
                        item.getChildByName("Count").getComponent(Label).string = "胜 " + userlist[i].winCount
                        item.getChildByName("ranking").getChildByName("num").getComponent(Label).string = userlist[i].gameRanking
                        item.getChildByName("yxjm_df_txk").getChildByName("header").getComponent(Sprite).spriteFrame =
                            await util.bundle.load(userlist[i].gameImg, SpriteFrame)
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
                    this.myRangking.getComponent(Label).string = data.gameRanking
                    this.render(data.gameRanking)
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




}


