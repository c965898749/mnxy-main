import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RecruitCtrl')
export class RecruitCtrl extends Component {
    start() {

    }

    update(deltaTime: number) {
        
    }

        /**单次招募 */
    public onceRecruit() {
        // let onceCard = GameMgr.systemConfig.value<number>(JXDef.SYS_CONFIG_KEY.onceCard);
        // let coin = new RJXItem([CURRENCY.GOLD, ITEM_TYPE.CURRENCY, onceCard])
        // let result = GameMgr.itemMgr.testCost(coin, 1, true)
        // if (result.enough) {
        //     GCtrl.ES.emit(CMsg.client.bag.onBagItemChange, [[CURRENCY.GOLD, ITEM_TYPE.CURRENCY, -onceCard]])
        //     this.luckDraw(1);
        //     GameMgr.sdkMgr.umaSetPoint(JXDef.umaPoint.recruit, { msg: PointInfo.recruit_click })
        // } else {
        //     GameMgr.uiMgr.showToast(result.tip);
        // }
         this.luckDraw(1);
    }

    /**10次招募 */
    // public tenRecruit() {
    //     //  tyqSDK.eventSendCustomEvent("观看视频奖励--抽卡按钮点击")

    //     GameMgr.sdkMgr.watchAd(() => {
    //         GameMgr.sdkMgr.umaSetPoint(JXDef.umaPoint.recruit, { msg: PointInfo.recruit_ad })
    //         this.luckDraw(10);
    //     }, () => { }, "十连抽")
    // }

        //抽奖奖池
    protected luckDraw(boxType: number = 1) {
        // UserMgr.ins().addDailyTaskState(5, boxType)
        // GameMgr.lUserData.recruitCtrl = boxType;
        // let drawData = null;
        // drawData = GameMgr.callData.data.values();
        //抽奖奖池
        // let drawList = [];
        // let array = [];
        // drawData.forEach((value: SCallDataRaw) => {
        //     let config: recruitDrawConfig = {
        //         id: value.id,
        //         weight: value.weight,
        //         award: value.award,
        //     }
        //     if(value.award[0] == 1029){
        //         if(this.checkDiaocanGet()){
        //             drawList.push(config);
        //         }
        //     }else{
        //         drawList.push(config);
        //     }
        // })

        // for (let i = 0; i < drawList.length; i++) {
        //     let weight = drawList[i].weight;
        //     for (let j = 0; j < weight; j++) {
        //         array.push(i);
        //     }
        // }
        // array = MathEx.fisherYatesShuffle(array);
        // if (boxType == 1) {
        //     let index = Math.floor(Math.random() * array.length);
        //     let mainArray: Array<Array<number>> = [];
        //     mainArray.push(drawList[array[index]].award);
        //     let recruitCardCtrl: recruitCardCtrl = {
        //         recruitNum: boxType,
        //         award: mainArray,
        //         cb: () => {
        //             GameMgr.jumpToMgr.jumpGoTo(VIEW_ID.rewardCtrl, mainArray, null, true);
        //         }
        //     }
        //     GameMgr.jumpToMgr.jumpGoTo(VIEW_ID.recuitCardCtrl, recruitCardCtrl);
        //     drawList = [];
        // } else if (boxType == 10) {
        //     let mainArray: Array<Array<number>> = [];
        //     let isHero: boolean = false;
        //     let allHero = GameMgr.rHeroData.getHaveHeros(SQUAD_BUTTON.ALL);
        //     let num = allHero.have.length + allHero.notHave.length;
        //     let isGuanyu = this.checkGuanyuGet()
        //     for (let i = 0; i < boxType; i++) {
        //         let index = Math.floor(Math.random() * array.length);
        //         if (drawList[array[index]].award[1] == 0) {
        //             isHero = true;
        //             if (!isGuanyu) {
        //                 drawList[array[index]].award[0] = GameMgr.systemConfig.value(JXDef.SYS_CONFIG_KEY.guideHero)
        //                 isGuanyu = true
        //             }
        //         }
        //         mainArray.push(drawList[array[index]].award);
        //     }
        //     if (!isHero) {
        //         mainArray.splice(Math.floor(Math.random() * mainArray.length), 1);
        //         let id = parseInt(GameMgr.systemConfig.value(JXDef.SYS_CONFIG_KEY.guideHero))
        //         let arr = isGuanyu ? [(1001 + (Math.floor(Math.random() * num))), 0, 1] : [id, 0, 1];
        //         mainArray.push(arr);
        //         // console.log("十连抽没得到英雄补进", arr);
        //     }
        //     // console.log(drawList, 'drawList[array[index]', drawList[array[index]]);
        //     let recruitCardCtrl: recruitCardCtrl = {
        //         recruitNum: boxType,
        //         award: mainArray,
        //         cb: () => {
        //             GameMgr.jumpToMgr.jumpGoTo(VIEW_ID.rewardCtrl, mainArray, REWARD.HERO);
        //             mainArray = [];
        //         }
        //     }
        //     GameMgr.jumpToMgr.jumpGoTo(VIEW_ID.recuitCardCtrl, recruitCardCtrl);
        //     // GameMgr.jumpToMgr.jumpGoTo(VIEW_ID.rewardCtrl, mainArray);
        //     drawList = [];
        // }
        // this.initDialData()
        // GameMgr.lUserData.addDial ++ 
        // if (GameMgr.lUserData.recruitCtrl >= GameMgr.addDialData.getRaw<SAddDialDataRaw>(GameMgr.lUserData.addDial).needNext) {
        //     GameMgr.lUserData.addDial = 1;
        // }
        // this.recruitProgress.fillRange = -(GameMgr.lUserData.recruitCtrl / GameMgr.addDialData.getRaw<SAddDialDataRaw>(GameMgr.lUserData.addDial).needNext);
        // this.recruit.string = GameMgr.lUserData.recruitCtrl + '/' + GameMgr.addDialData.getRaw<SAddDialDataRaw>(GameMgr.lUserData.addDial).needNext;
        // let num = GameMgr.lUserData.receiveId;
        // if (GameMgr.lUserData.addDial > num) {
        //     this.recruiLight.active = true;
        // } else {
        //     this.recruiLight.active = false;
        // }
    }

}


