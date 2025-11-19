import { _decorator, Component, find, instantiate, Node, Prefab, RichText, Sprite, SpriteFrame } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { FightMap } from '../../../Fight/Canvas/FightMap';
import { HomeCanvas } from '../../HomeCanvas';
const { ccclass, property } = _decorator;

@ccclass('MessageCrtl')
export class MessageCrtl extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    @property(Node)
    zhan: Node
    @property(Node)
    find: Node
    @property(Node)
    rew: Node
    initialized: boolean = false
    type = 1;
    start() {
        this.refresh()
    }
    onEnable() {
        if (!this.initialized) {
            // 初始化代码
            this.initialized = true;
        } else {
            console.log(222222)
            this.refresh()
        }

    }
    refresh() {
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId,
            str: this.type
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/messageList", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                let messageDetails = data.data
                this.node.active = true
                const nodePool = util.resource.getNodePool(
                    await util.bundle.load("prefab/messageDetail", Prefab)
                )
                const childrens = [...this.ContentNode.children]
                for (let i = 0; i < childrens.length; i++) {
                    const node = childrens[i];
                    node.getChildByName("regitPlaye").off("click")
                    node.getChildByName("getRewards").off("click")
                    nodePool.put(node)
                }
                for (let i = 0; i < messageDetails.length; i++) {
                    let messageDetail = messageDetails[i]
                    let item = nodePool.get()
                    if (this.type == 1) {
                        item.getChildByName("regitPlaye").active = true
                        item.getChildByName("getRewards").active = false
                        item.getChildByName("regitPlaye").on("click", () => { this.clickFun(messageDetail.id) })
                        item.getChildByName("yxjm_df_txk").children[0].getComponent(Sprite).spriteFrame =
                            await util.bundle.load(messageDetail.img, SpriteFrame)

                        let content = null;
                        if (messageDetail.type == "0") {
                            //副本pk
                            content = `<color=#E36F1A>${messageDetail.timeStr} <color=#EEE365>我 </color>探索了关卡<color=#EEE365>${messageDetail.toUserName}</color>，激烈战斗后最终<color=#00BCD4>${messageDetail.isWin == 0 ? '获胜' : '落败'}</color>。</color>`
                        } else if (messageDetail.type == "1") {
                            if (config.userData.userId != messageDetail.userId) {
                                content = `<color=#E36F1A>${messageDetail.timeStr}  <color=#EEE365>我 </color>在<color=#EEE365>竞技场</color>遭到<color=#EEE365>${messageDetail.toUserName}</color>偷袭，毫无防备最终<color=#00BCD4>${messageDetail.isWin == 0 ? '获胜' : '落败'}</color>。</color>`

                            } else {
                                content = `<color=#E36F1A>${messageDetail.timeStr}  <color=#EEE365>我 </color>在<color=#EEE365>竞技场</color>攻击了<color=#EEE365>${messageDetail.toUserName}</color>，激烈战斗后最终<color=#00BCD4>${messageDetail.isWin == 0 ? '获胜' : '落败'}</color>。</color>`
                            }
                        }
                        item.getChildByName("RichText").getComponent(RichText).string = content
                    } else if (this.type == 2) {

                    } else if (this.type == 3) {
                        item.getChildByName("regitPlaye").active = false
                        item.getChildByName("getRewards").active = true
                        item.getChildByName("getRewards").on("click", () => { this.clickRewards(messageDetail.giftCode) })
                        item.getChildByName("yxjm_df_txk").children[0].getComponent(Sprite).spriteFrame =
                            await util.bundle.load('image/MessageCrtl/rewads/meg/spriteFrame', SpriteFrame)

                        let content = null;
                        content = `<color=#E36F1A>主人，我们收到<color=#EEE365>${messageDetail.giftName}</color>:${messageDetail.description}</color>`
                        item.getChildByName("RichText").getComponent(RichText).string = content
                    }
                    // // 绑定事件

                    this.ContentNode.addChild(item)
                    continue
                }
            })
            .catch(error => {
                //console.error('There was a problem with the fetch operation:', error);
            }
            );
    }

    async clickFun(id) {
        AudioMgr.inst.playOneShot("sound/other/click");
        const holAnimationPrefab = await util.bundle.load("prefab/FightMap", Prefab)
        const holAnimationNode = instantiate(holAnimationPrefab)
        this.node.parent.addChild(holAnimationNode)
        await holAnimationNode
            .getComponent(FightMap)
            .render(id, null, null)
        find('Canvas').getComponent(HomeCanvas).audioSource.pause()
        this.node.parent.getChildByName("FightMap").active = true
    }

    clickRewards(giftCode) {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            str: giftCode
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/receive", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    let userInfo = data.data;
                    config.userData.gold = userInfo.gold
                    config.userData.diamond = userInfo.diamond
                    config.userData.soul = userInfo.soul
                    config.userData.characters = userInfo.characterList
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
                this.refresh()
            })
            .catch(error => {
                //console.error('There was a problem with the fetch operation:', error);
            }
            );

    }
    update(deltaTime: number) {


    }
    async goBack2() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("MessageCrtl").active = false
    }
    async zhanbao() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.zhan.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian/spriteFrame', SpriteFrame)
        this.find.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian2/spriteFrame', SpriteFrame)
        this.rew.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian2/spriteFrame', SpriteFrame)
        this.type = 1;
        this.refresh()
    }
    async frineds() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.zhan.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian2/spriteFrame', SpriteFrame)
        this.find.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian/spriteFrame', SpriteFrame)
        this.rew.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian2/spriteFrame', SpriteFrame)
        this.type = 2;
        this.refresh()
    }
    async rewads() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.zhan.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian2/spriteFrame', SpriteFrame)
        this.find.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian2/spriteFrame', SpriteFrame)
        this.rew.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian/spriteFrame', SpriteFrame)
        this.type = 3;
        this.refresh()
    }
}


