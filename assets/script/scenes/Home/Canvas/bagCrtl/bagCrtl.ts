import { _decorator, Component, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

@ccclass('bagCrtl')
export class bagCrtl extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    initialized: boolean = false
    @property(Node)
    zhan: Node
    @property(Node)
    find: Node
    @property(Node)
    rew: Node
    type = 1;
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
            userId: config.userData.userId,
            str: this.type
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/bagItemList", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                let items = data.data
                this.node.active = true
                const nodePool = util.resource.getNodePool(
                    await util.bundle.load("prefab/ff4", Prefab)
                )
                const childrens = [...this.ContentNode.children]
                for (let i = 0; i < childrens.length; i++) {
                    const node = childrens[i];
                    node.getChildByName("use").off("click")
                    node.getChildByName("diu").off("click")
                    nodePool.put(node)
                }

                for (let i = 0; i < items.length; i++) {
                    let itemDetail = items[i]
                    let item = nodePool.get()

                    if (this.type == 1) {
                        item.getChildByName("use").on("click", () => { this.clickUseFun(itemDetail.itemId) })
                        item.getChildByName("diu").on("click", () => { this.clickDiuFun(itemDetail.itemId) })
                        item.getChildByName("name").getComponent(Label).string = itemDetail.itemName
                        item.getChildByName("Count").getComponent(Label).string = itemDetail.description
                        item.getChildByName("textbox_bg").getChildByName("num").getComponent(Label).string = itemDetail.itemCount
                        item.getChildByName("yxjm_df_txk").children[0].getComponent(Sprite).spriteFrame =
                            await util.bundle.load(itemDetail.icon, SpriteFrame)

                        // let content = null;
                        // if (messageDetail.type == "0") {
                        //     //副本pk
                        //     content = `<color=#E36F1A>${messageDetail.timeStr} <color=#EEE365>我 </color>探索了关卡<color=#EEE365>${messageDetail.toUserName}</color>，激烈战斗后最终<color=#00BCD4>${messageDetail.isWin == 0 ? '获胜' : '落败'}</color>。</color>`
                        // } else if (messageDetail.type == "1") {
                        //     if (config.userData.userId != messageDetail.userId) {
                        //         content = `<color=#E36F1A>${messageDetail.timeStr}  <color=#EEE365>我 </color>在<color=#EEE365>竞技场</color>遭到<color=#EEE365>${messageDetail.userName}</color>偷袭，毫无防备最终<color=#00BCD4>${messageDetail.isWin == 1 ? '获胜' : '落败'}</color>。</color>`

                        //     } else {
                        //         content = `<color=#E36F1A>${messageDetail.timeStr}  <color=#EEE365>我 </color>在<color=#EEE365>竞技场</color>攻击了<color=#EEE365>${messageDetail.toUserName}</color>，激烈战斗后最终<color=#00BCD4>${messageDetail.isWin == 0 ? '获胜' : '落败'}</color>。</color>`
                        //     }
                        // } else if (messageDetail.type == "3") {
                        //     if (config.userData.userId != messageDetail.userId) {
                        //         content = `<color=#E36F1A>${messageDetail.timeStr}  <color=#EEE365>我 </color>在<color=#EEE365>好友挑战</color>遭到<color=#EEE365>${messageDetail.userName}</color>偷袭，毫无防备最终<color=#00BCD4>${messageDetail.isWin == 1 ? '获胜' : '落败'}</color>。</color>`

                        //     } else {
                        //         content = `<color=#E36F1A>${messageDetail.timeStr}  <color=#EEE365>我 </color>在<color=#EEE365>好友挑战</color>攻击了<color=#EEE365>${messageDetail.toUserName}</color>，激烈战斗后最终<color=#00BCD4>${messageDetail.isWin == 0 ? '获胜' : '落败'}</color>。</color>`
                        //     }
                        // } else if (messageDetail.type == "4") {
                        //     content = `<color=#E36F1A>${messageDetail.timeStr}  <color=#EEE365>${messageDetail.userName}</color>在<color=#EEE365>擂台赛</color>攻击了<color=#EEE365>${messageDetail.toUserName}</color>，激烈战斗后最终<color=#00BCD4>${messageDetail.isWin == 0 ? '获胜' : '落败'}</color>。</color>`

                        // }
                        // item.getChildByName("RichText").getComponent(RichText).string = content
                    } else if (this.type == 2) {
                        // item.getChildByName("regitPlaye").active = false
                        // item.getChildByName("getRewards").active = false
                        // item.getChildByName("fEsmZCGbB").active = true
                        // item.getChildByName("fEsnbpxoT").active = true
                        // item.getChildByName("fEsmZCGbB").on("click", () => { this.fEsmZCGbB(messageDetail.id) })
                        // item.getChildByName("fEsnbpxoT").on("click", () => { this.fEsnbpxoT(messageDetail.id) })
                        // item.getChildByName("yxjm_df_txk").children[0].getComponent(Sprite).spriteFrame =
                        //     await util.bundle.load(messageDetail.gameImg, SpriteFrame)

                        // let content = null;
                        // content = `<color=#E36F1A>主人，我们收到<color=#EEE365>${messageDetail.nickname}</color>好友申请！</color>`
                        // item.getChildByName("RichText").getComponent(RichText).string = content
                    } else if (this.type == 3) {
                        // item.getChildByName("regitPlaye").active = false
                        // item.getChildByName("fEsmZCGbB").active = false
                        // item.getChildByName("fEsnbpxoT").active = false
                        // item.getChildByName("getRewards").active = true
                        // item.getChildByName("getRewards").on("click", () => { this.clickRewards(messageDetail.giftCode) })
                        // item.getChildByName("yxjm_df_txk").children[0].getComponent(Sprite).spriteFrame =
                        //     await util.bundle.load('image/MessageCrtl/rewads/meg/spriteFrame', SpriteFrame)

                        // let content = null;
                        // content = `<color=#E36F1A>主人，我们收到<color=#EEE365>${messageDetail.giftName}</color>:${messageDetail.description}</color>`
                        // item.getChildByName("RichText").getComponent(RichText).string = content
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
    clickUseFun(itemId) {
        // useBagItem
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            id: itemId,
            userId: config.userData.userId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/useBagItem", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
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
    clickDiuFun(itemId) {

    }
    update(deltaTime: number) {

    }
    goBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
        this.node.parent.getChildByName("ShopCtrl").active = true
    }

    async zhanbao() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.zhan.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian/spriteFrame', SpriteFrame)
        this.find.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian2/spriteFrame', SpriteFrame)
        // this.rew.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian2/spriteFrame', SpriteFrame)
        this.type = 1;
        this.refresh()
    }
    async frineds() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.zhan.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian2/spriteFrame', SpriteFrame)
        this.find.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian/spriteFrame', SpriteFrame)
        // this.rew.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian2/spriteFrame', SpriteFrame)
        this.type = 2;
        this.refresh()
    }
    // async rewads() {
    //     AudioMgr.inst.playOneShot("sound/other/click");
    //     this.zhan.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian2/spriteFrame', SpriteFrame)
    //     this.find.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian2/spriteFrame', SpriteFrame)
    //     this.rew.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian/spriteFrame', SpriteFrame)
    //     this.type = 3;
    //     this.refresh()
    // }
}


