import { _decorator, Component, EditBox, find, instantiate, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { FightMap } from '../../../Fight/Canvas/FightMap';
import { HomeCanvas } from '../../HomeCanvas';
const { ccclass, property } = _decorator;

@ccclass('MyFriendsCrtl')
export class MyFriendsCrtl extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    initialized = false;
    @property(Node)
    AddFrind: Node
    @property(EditBox)
    Username: EditBox;
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

    update(deltaTime: number) {

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
        fetch(config.ServerUrl.url + "friendAllList", options)
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
                    const nodePool = util.resource.getNodePool(
                        await util.bundle.load("prefab/ff", Prefab)
                    )
                    const childrens = [...this.ContentNode.children]
                    for (let i = 0; i < childrens.length; i++) {
                        const node = childrens[i];
                        node.getChildByName("tiaozhan").off("click")
                        node.getChildByName("zhufu").off("click")
                        nodePool.put(node)
                    }
                    for (let i = 0; i < userlist.length; i++) {
                        let item = nodePool.get()
                        item.getChildByName("textbox_bg").children[0].getComponent(Label).string = "lv " + userlist[i].lv
                        // 绑定事件
                        item.getChildByName("name").getComponent(Label).string = userlist[i].nickname
                        item.getChildByName("Count").getComponent(Label).string = "胜 " + userlist[i].winCount
                        item.getChildByName("ranking").getChildByName("num").getComponent(Label).string = i + 1 + ""
                        item.getChildByName("yxjm_df_txk").getChildByName("header").getComponent(Sprite).spriteFrame =
                            await util.bundle.load(userlist[i].gameImg, SpriteFrame)
                        item.getChildByName("tiaozhan").on("click", () => { this.clickTiaozhanFun(userlist[i].userId) })
                        if (userlist[i].fbId==null||userlist[i].fbId=="") {
                            item.getChildByName("zhufu").active = true
                            item.getChildByName("zhufu").on("click", () => {
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
    goBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("MyFriendsCrtl").active = false
        this.node.parent.getChildByName("JinjiCtrl").active = true
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
                    item.getChildByName("zhufu").active = false
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
    public async clickTiaozhanFun(userId) {
        AudioMgr.inst.playOneShot("sound/other/click");
        // director.addPersistRootNode(this.node);
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            id: userId,
            userId: config.userData.userId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "battle3", options)
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
    isNumberStr(str) {
        // 先过滤空字符串/纯空格
        if (typeof str !== 'string' || str.trim() === '') return false;
        // 转为数字后判断是否为有限数字
        const num = Number(str);
        return Number.isFinite(num);
    }
    addFriend() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.AddFrind.active = true
    }
    closeFriend() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.AddFrind.active = false
    }
    clickJiebanFun() {
        AudioMgr.inst.playOneShot("sound/other/click");
        const userId = this.Username.string;
        if (!userId) {
            const close = util.message.confirm({ message: "请输入好有ID" })
            return;
        }
        if (!this.isNumberStr(userId)) {
            const close = util.message.confirm({ message: "请输入正确格式ID" })
            return;
        }
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: userId
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
                    // this.refresh()
                    // const holAnimationPrefab = await util.bundle.load("prefab/FightMap", Prefab)
                    // const holAnimationNode = instantiate(holAnimationPrefab)
                    // this.node.parent.addChild(holAnimationNode)
                    // await holAnimationNode
                    //     .getComponent(FightMap)
                    //     .render(data.data.id, null, null)
                    // find('Canvas').getComponent(HomeCanvas).audioSource.pause()
                    // this.node.parent.getChildByName("FightMap").active = true
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
    openBlessing() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("BlessingCrtl").active = true
    }
}


