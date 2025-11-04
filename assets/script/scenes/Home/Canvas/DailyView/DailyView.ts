import { _decorator, Component, Label, Node, ProgressBar, Sprite, SpriteFrame, tween, Tween, Animation, Prefab, Button, instantiate, Vec3 } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

@ccclass('DailyView')
export class DailyView extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    // @property({ type: Node, tooltip: "任务模板" }) dailyItem: Node = null;
    // @property({ type: Node, tooltip: "奖励节点" }) rewardItem: Node = null;
    @property({ type: cc.ScrollView, tooltip: "装备视图" }) scrollView: cc.ScrollView = null;

    @property({ type: Node, tooltip: "宝箱layout" }) boxLayout: Node = null;

    @property({ type: Node, tooltip: "可视区域" }) view: Node = null;
    @property({ type: Node }) progressbar: Node = null;
    @property({ type: Label }) huoyueLabel: Label = null;

    @property(Node)
    BlockInputEvents: Node

    initialized = false;
    start() {
        this.BlockInputEvents.active = true
        this.initItem()
        this.initBoxState()
    }
    onEnable() {
        if (!this.initialized) {
            // 初始化代码
            this.initialized = true;
        } else {
            // this.refresh()
            this.BlockInputEvents.active = true
        }

    }

    update(deltaTime: number) {

    }
    colseBtn() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.BlockInputEvents.active = false
        this.node.active = false
    }
    async initBoxState() {
        let num = 70
        let isOpen = 0
        this.progressbar.getComponent(ProgressBar).progress = num / 100
        this.huoyueLabel.string = num + ""

        for (let index = 1; index <= 4; index++) {
            let box = this.boxLayout.getChildByName("box" + index)
            let boxIcon = box.getChildByName("boxIcon")
            Tween.stopAllByTarget(boxIcon)
            if (num >= 25 * index) {
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
        let curState = 0
        let needNum = 1
        let receive = 0
        for (var i = 0; i < 10; i++) {
            let nodePrefab = await util.bundle.load("prefab/dailyitembg", Prefab)
            let item = instantiate(nodePrefab)
            if (i == 0) {
                item.getChildByName("infolabel").getComponent(Label).string = "每天签到一次"
            } else {
                item.getChildByName("infolabel").getComponent(Label).string = "每天抽卡" + (i + 1) + "次"
            }
            item.getChildByName("barLabel").getComponent(Label).string = curState + "/" + needNum
            let progressNode = item.getChildByName("ProgressBar")
            progressNode.getComponent(ProgressBar).progress = curState / needNum
            for (let index = 0; index < 2; index++) {
                let layout = item.getChildByName("Layout")
                let rewardItem = await util.bundle.load("prefab/rewardItem", Prefab)
                let reward = instantiate(rewardItem)
                reward.getChildByName("Label").getComponent(Label).string = 1000 * (i + 1) + ""
                layout.addChild(reward)
            }
            let btn = item.getChildByName("anjian2")
            let btnLabel = btn.getChildByName("Label")
            if (receive == 1) {
                btn.getComponent(Sprite).spriteFrame =
                    await util.bundle.load("image/ui/anjian3/spriteFrame", SpriteFrame)
                btnLabel.getComponent(Label).string = ""
                btn.removeComponent(Button)
                // } else if (curState.ftime >= data.needNum) {
                //     this.assetImpl.spriteFrame(btn.getComponent(cc.Sprite), "frames/common/anjian1")
                //     btnLabel.getComponent(cc.Label).string = ""
                //     ViewUtil.addButtonHander(btn, this.node, "DailyView", "receiveDailyClick", data)
            } else {
                btn.getComponent(Sprite).spriteFrame =
                    await util.bundle.load("image/ui/anjian5/spriteFrame", SpriteFrame)
                btnLabel.getComponent(Label).string = "前往"
                if(i==0){
                    btn.on("click", () => {  this.clickFun() })
                }else{
                     btn.on("click", () => {  this.clickFun2() })
                }
            
            }
            this.ContentNode.addChild(item)
        }

        return
    }
    clickFun() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
        this.BlockInputEvents.active = false
        this.node.parent.getChildByName("SignInCtrl").active = true
        this.node.parent.getChildByName("SignInCtrl").scale = new Vec3(0, 0, 0)
        tween(this.node.parent.getChildByName("SignInCtrl"))
            .to(1, { scale: new Vec3(1, 1, 1) }, { easing: 'elasticOut' })
            .start();
    }
    clickFun2() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
        this.BlockInputEvents.active = false
        this.node.parent.getChildByName("Buildings").active = false
        this.node.parent.getChildByName("RecruitCtrl").active = true
    }

    openBox(event, data) {
        AudioMgr.inst.playOneShot("sound/other/click");
        let index = parseInt(data)
        let num = 70
        let isOpen = 1
        if (isOpen != 1 && (num >= 25 * index)) {
            this.initBoxState()
        }
    }
}


