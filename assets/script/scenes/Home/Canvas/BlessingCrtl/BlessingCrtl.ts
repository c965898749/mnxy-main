import { _decorator, Component, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

@ccclass('blessingCrtl')
export class blessingCrtl extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    @property(Node)
    countNode: Node = null;
    @property(Node)
    sendCountNode: Node = null;
    @property(Node)
    totalNode: Node = null;
    initialized = false;
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
        fetch(config.ServerUrl.url + "reviceblessing", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                //console.log(data); // 处理响应数据
                if (data.success == '1') {
                    let userlist = data.data["friends"]
                    this.countNode.getComponent(Label).string = data.data["count"]
                    this.totalNode.getComponent(Label).string = data.data["total"] + "/50"
                    this.sendCountNode.getComponent(Label).string = data.data["sendCount"] + "/15"
                    const nodePool = util.resource.getNodePool(
                        await util.bundle.load("prefab/ff", Prefab)
                    )
                    const childrens = [...this.ContentNode.children]
                    console.log(childrens, 444)
                    for (let i = 0; i < childrens.length; i++) {
                        const node = childrens[i];
                        node.getChildByName("huizhu").off("click")
                        nodePool.put(node)
                    }
                    // 26分钟前 收到了020215411送来的祝福
                    for (let i = 0; i < userlist.length; i++) {
                        let item = nodePool.get()
                        item.getChildByName("textbox_bg").children[0].getComponent(Label).string = "lv " + userlist[i].lv
                        // 绑定事件
                        item.getChildByName("name").getComponent(Label).string = "今日收到  " + userlist[i].nickname
                        item.getChildByName("Count").getComponent(Label).string = "送来的祝福"
                        item.getChildByName("ranking").getChildByName("num").getComponent(Label).string = i + 1 + ""
                        item.getChildByName("yxjm_df_txk").getChildByName("header").getComponent(Sprite).spriteFrame =
                            await util.bundle.load(userlist[i].gameImg, SpriteFrame)
                        item.getChildByName("tiaozhan").active = false
                        if (!userlist[i].fbId) {
                            item.getChildByName("huizhu").active = true
                            item.getChildByName("huizhu").on("click", () => {
                                this.BlessingCrtl(userlist[i].userId, config.userData.userId, item)
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
    BlessingCrtl(friendId, userId, item) {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            id: friendId,
            userId: userId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "blessing", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                //console.log(data); // 处理响应数据
                if (data.success == '1') {
                    // this.refresh()
                    item.getChildByName("huizhu").active = false
                    const close = util.message.confirm({ message: data.errorMsg || "祝福成功" })
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }

            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );
    }
    //体力
    GetLeaveEnergy() {
        var key = 'Leave_EnergyNumber2';
        var str = localStorage.getItem(key);
        if (str) {
            return parseInt(str);
        }
        return 0;
    }
    GetLeaveHuoliEnergy() {
        var key = 'Leave_EnergyHuoliNumber2';
        var str = localStorage.getItem(key);
        if (str) {
            return parseInt(str);
        }
        return 0;
    }
    SetLeaveEnergy(i) {
        var key = 'Leave_EnergyNumber2';
        var value = i + "";
        localStorage.setItem(key, value);
    }
    SetLeaveHuoliEnergy(i) {
        var key = 'Leave_EnergyHuoliNumber2';
        var value = i + "";
        localStorage.setItem(key, value);
    }
    nj() {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            tiLi: this.GetLeaveEnergy(),
            huoLi: this.GetLeaveHuoliEnergy(),
            userId: config.userData.userId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "njblessing", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                //console.log(data); // 处理响应数据
                if (data.success == '1') {
                    this.countNode.getComponent(Label).string = 0 + ""
                    this.SetLeaveEnergy(data.data["tiLi"])
                    this.SetLeaveHuoliEnergy(data.data["huoLi"])
                    const close = util.message.confirm({ message: data.errorMsg || "祝福成功" })
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }

            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );
    }

    update(deltaTime: number) {

    }
    goBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
        // this.node.parent.getChildByName("JinjiCtrl").active = true
    }
    sendbiessing() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
        this.node.parent.getChildByName("otherCtrl").active = false
        this.node.parent.getChildByName("JinjiCtrl").active = true
    }
}


