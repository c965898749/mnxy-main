import { _decorator, Component, Label, Node, ProgressBar, Sprite, SpriteFrame, tween, Tween, Animation, Prefab, Button, instantiate, Vec3, ScrollView } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { Rewards } from '../../rewards/Rewards';
const { ccclass, property } = _decorator;

@ccclass('DailyView')
export class DailyView extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    // @property({ type: Node, tooltip: "任务模板" }) dailyItem: Node = null;
    // @property({ type: Node, tooltip: "奖励节点" }) rewardItem: Node = null;
    @property({ type: ScrollView, tooltip: "装备视图" }) scrollView: ScrollView = null;

    @property({ type: Node, tooltip: "宝箱layout" }) boxLayout: Node = null;

    @property({ type: Node, tooltip: "可视区域" }) view: Node = null;
    @property({ type: Node }) progressbar: Node = null;
    @property({ type: Label }) huoyueLabel: Label = null;


    initialized = false;
    start() {
        // this.initItem()
        this.initBoxState()
    }
    onEnable() {
        if (!this.initialized) {
            // 初始化代码
            this.initialized = true;
        } else {
            this.initBoxState()
        }

    }

    update(deltaTime: number) {

    }
    colseBtn() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }
    async initBoxState() {

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
        fetch(config.ServerUrl.url + "dailyViewList", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    var map = data.data;
                    var rate = map['rate'];
                    var dailyViewList = map['dailyViewList'];
                    let isOpen = 0
                    this.progressbar.getComponent(ProgressBar).progress = rate / 100
                    this.huoyueLabel.string = rate + ""

                    for (let index = 1; index <= 4; index++) {
                        let box = this.boxLayout.getChildByName("box" + index)
                        let boxIcon = box.getChildByName("boxIcon")
                        Tween.stopAllByTarget(boxIcon)
                        if (rate >= 25 * index) {
                            if (isOpen == 1) {
                                boxIcon.getComponent(Sprite).spriteFrame =
                                    await util.bundle.load("image/ui/boxopen/spriteFrame", SpriteFrame)
                                box.getChildByName("boxlight").active = false
                                boxIcon.y = 7
                            } else {
                                box.getChildByName("boxlight").active = true
                                tween(boxIcon).call(function () {
                                    boxIcon.getComponent(Animation).play('boxShake');
                                }).delay(1).union().repeatForever().start()
                                boxIcon.getComponent(Sprite).spriteFrame =
                                    await util.bundle.load("image/ui/boxclose/spriteFrame", SpriteFrame)

                            }
                        } else {
                            box.getChildByName("boxlight").active = false
                            boxIcon.getComponent(Sprite).spriteFrame =
                                await util.bundle.load("image/ui/boxgrey/spriteFrame", SpriteFrame)
                        }
                    }
                    // let curState = 0
                    // let needNum = 1
                    // let receive = 0
                    const nodePool = util.resource.getNodePool(
                        await await util.bundle.load("prefab/dailyitembg", Prefab)
                    )
                    const childrens = [...this.ContentNode.children]
                    for (let i = 0; i < childrens.length; i++) {
                        const node = childrens[i];
                        // console.log(i)
                        node.getChildByName("anjian2").off("click")
                        nodePool.put(node)
                    }
                    for (var i = 0; i < dailyViewList.length; i++) {
                        let item = nodePool.get()
                        item.getChildByName("infolabel").getComponent(Label).string = dailyViewList[i].description
                        if (dailyViewList[i].remainingQuantity < dailyViewList[i].totalQuantity) {
                            item.getChildByName("barLabel").getComponent(Label).string = dailyViewList[i].remainingQuantity + "/" + dailyViewList[i].totalQuantity
                            let progressNode = item.getChildByName("ProgressBar")
                            progressNode.getComponent(ProgressBar).progress = dailyViewList[i].remainingQuantity / dailyViewList[i].totalQuantity
                        } else {
                            item.getChildByName("barLabel").getComponent(Label).string = "已完成"
                            let progressNode = item.getChildByName("ProgressBar")
                            progressNode.getComponent(ProgressBar).progress = 1
                        }

                        let layout = item.getChildByName("Layout")
                        if (layout.children.length > 0) {
                            layout.removeAllChildren()
                        }
                        for (let index = 0; index < dailyViewList[i].contents.length; index++) {
                            let content = dailyViewList[i].contents[index]
                            let rewardItem = await util.bundle.load("prefab/rewardItem", Prefab)
                            let reward = instantiate(rewardItem)
                            reward.getChildByName("icon_22").getComponent(Sprite).spriteFrame =
                                await util.bundle.load(content.icon, SpriteFrame)
                            if (index == 0) {
                                reward.getChildByName("title").active = true
                            } else {
                                reward.getChildByName("title").active = false
                            }
                            reward.getChildByName("Label").getComponent(Label).string = content.itemQuantity + ""
                            layout.addChild(reward)
                        }
                        let btn = item.getChildByName("anjian2")
                        if (dailyViewList[i].isFinsh == "1") {
                            btn.getComponent(Sprite).spriteFrame =
                                await util.bundle.load("image/ui/anjian3/spriteFrame", SpriteFrame)
                            btn.active = true
                            btn.getComponent(Button).enabled = false
                        } else if (dailyViewList[i].remainingQuantity >= dailyViewList[i].totalQuantity) {
                            btn.getComponent(Sprite).spriteFrame =
                                await util.bundle.load("image/ui/anjian1/spriteFrame", SpriteFrame)
                            btn.active = true
                            let giftCode = dailyViewList[i].giftCode
                            btn.on("click", () => { this.clickFun(giftCode) })
                            btn.getComponent(Button).enabled = true
                        } else {
                            btn.active = false
                        }

                        // } else if (curState.ftime >= data.needNum) {
                        //     this.assetImpl.spriteFrame(btn.getComponent(cc.Sprite), "frames/common/anjian1")
                        //     btnLabel.getComponent(cc.Label).string = ""
                        //     ViewUtil.addButtonHander(btn, this.node, "DailyView", "receiveDailyClick", data)
                        // if (receive == 1) {

                        // } else {
                        //     btn.getComponent(Sprite).spriteFrame =
                        //         await util.bundle.load("image/ui/anjian5/spriteFrame", SpriteFrame)
                        //     btnLabel.getComponent(Label).string = "前往"
                        //     if (i == 0) {
                        //         btn.on("click", () => { this.clickFun() })
                        //     } else {
                        //         btn.on("click", () => { this.clickFun2() })
                        //     }

                        // }
                        this.ContentNode.addChild(item)
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


    // initItem(item1, data, node) {
    // let item = item1.node
    // item.getChildByName("infolabel").getComponent(cc.Label).string = data.txt
    // let curState = UserMgr.ins().getDailyTaskState(data.id)
    // item.getChildByName("barLabel").getComponent(cc.Label).string = Math.min(curState.ftime, data.needNum) + "/" + data.needNum

    // let progressNode = item.getChildByName("ProgressBar")
    // progressNode.getComponent(cc.ProgressBar).progress = Math.min(curState.ftime, data.needNum) / data.needNum

    // let layout = item.getChildByName("Layout")
    // let rewardArr = data.award
    // layout.removeAllChildren()
    // for (let index = 0; index < rewardArr.length; index++) {
    //     let item = cc.instantiate(this.rewardItem)
    //     layout.addChild(item)
    //     item.position = cc.v2(0, 0)
    //     let jxitem = item.getChildByName("JXItem")
    //     let equip = new RJXItem(rewardArr[index]);
    //     this.assetImpl.spriteAtlasFrame(item.getComponent(cc.Sprite), Res.texture.views.common, "equip_" + equip.raw.quality);
    //     jxitem.getComponent(JXItem).setView(equip, ITEM_DETAIL_FLAG.SHOWNUM | ITEM_DETAIL_FLAG.BAG | ITEM_DETAIL_FLAG.NO_BG | ITEM_DETAIL_FLAG.SCALEICON | ITEM_DETAIL_FLAG.STOREHERO);
    // }

    // let btn = item.getChildByName("anjian2")
    // let btnLabel = btn.getChildByName("Label")
    // if (curState.receive == 1) {
    //     this.assetImpl.spriteFrame(btn.getComponent(cc.Sprite), "frames/common/anjian3")
    //     btnLabel.getComponent(cc.Label).string = ""
    //     btn.removeComponent(cc.Button)
    // } else if (curState.ftime >= data.needNum) {
    //     this.assetImpl.spriteFrame(btn.getComponent(cc.Sprite), "frames/common/anjian1")
    //     btnLabel.getComponent(cc.Label).string = ""
    //     ViewUtil.addButtonHander(btn, this.node, "DailyView", "receiveDailyClick", data)
    // } else {
    //     this.assetImpl.spriteFrame(btn.getComponent(cc.Sprite), "frames/common/anjian5")
    //     btnLabel.getComponent(cc.Label).string = data.btnText
    //     ViewUtil.addButtonHander(btn, this.node, "DailyView", "doDailyClick", data)
    // }
    // }
    async initItem() {

        return
    }
    clickFun(giftCode) {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            str: giftCode,
            userId: config.userData.userId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/dailyReceive", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    var map = data.data;
                    var userInfo = map['user'];
                    var reward = map["rewards"];
                    config.userData.gold = userInfo.gold
                    config.userData.diamond = userInfo.diamond
                    config.userData.soul = userInfo.soul
                    config.userData.characters = userInfo.characterList
                    config.userData.bronze = userInfo.bronze
                    config.userData.darkSteel = userInfo.darkSteel
                    config.userData.purpleGold = userInfo.purpleGold
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                    const rewardsFab = await util.bundle.load("prefab/rewards", Prefab)
                    const rewards = instantiate(rewardsFab)
                    this.node.parent.addChild(rewards)
                    await rewards
                        .getComponent(Rewards)
                        .read(reward)
                    // const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
                this.initBoxState()
            })
            .catch(error => {
                //console.error('There was a problem with the fetch operation:', error);
            }
            );

    }
    // clickFun() {
    //     AudioMgr.inst.playOneShot("sound/other/click");
    //     this.node.active = false
    //     this.node.parent.getChildByName("SignInCtrl").active = true
    //     this.node.parent.getChildByName("SignInCtrl").scale = new Vec3(0, 0, 0)
    //     tween(this.node.parent.getChildByName("SignInCtrl"))
    //         .to(1, { scale: new Vec3(1, 1, 1) }, { easing: 'elasticOut' })
    //         .start();
    // }


    openBox(event, data) {
        AudioMgr.inst.playOneShot("sound/other/click");
        // let index = parseInt(data)
        // let num = 70
        // let isOpen = 1
        // if (isOpen != 1 && (num >= 25 * index)) {
        //     this.initBoxState()
        // }
    }
}


