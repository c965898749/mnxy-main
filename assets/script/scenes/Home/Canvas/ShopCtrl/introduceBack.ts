import { _decorator, Button, Component, Label, Node } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('introduceBack')
export class introduceBack extends Component {
    @property(Node)
    playerItemCount: Node = null;
    ShopCtrl=null
    /**
     * 触摸条件
     */
    private _touchFlag = false;

    /**
     * 触摸时间
     */
    private _touchStartTime = null;

    /**
     * 长按执行属性升级时间
     */
    private _execAttrLevelUpTime = null;

    /**
     * 已满级
     */
    private _isMaxLevel = false;
    onLoad() {
        // 绑定长按事件
        let buttonNode = this.node;
        buttonNode.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
        buttonNode.on(cc.Node.EventType.TOUCH_CANCEL, this.touchEnd, this);
        buttonNode.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
    }


    start() {

    }

    // initData(ShopCtrl) {
    //     this.ShopCtrl = ShopCtrl
    // }


    update(deltaTime: number) {
        if (this._touchFlag) {
            this.touchHold();
        }

    }

    //触摸开始
    touchStart() {
        //触摸开始 
        this._touchFlag = true;
        //记录下触摸开始时间
        this._touchStartTime = new Date().getTime()
    }

    //长按检测函数
    touchHold() {
        // console.log("长按检测中1111...");
        if (this._touchFlag && this._touchStartTime != null) {
            // console.log("长按检测中...");
            //判断按钮的按压时长
            let nowTime = new Date().getTime();
            if (nowTime - this._touchStartTime > 300) { // 长按时间是否足够
                if (nowTime - this._execAttrLevelUpTime > 100) { // 每次升级的间隔
                    this._attrLevelUp();
                    this._execAttrLevelUpTime = new Date().getTime();
                }
            }
        }
    }

    //触摸结束
    touchEnd() {
        this._touchFlag = false;
        this._touchStartTime = null;
        //出发单击事务逻辑
        //todo...
        this._attrLevelUp();
    }


    /**
     * 属性升级
     */
    public _attrLevelUp() {

        var playerItemCount = Number(this.playerItemCount.getComponent(Label).string)
        AudioMgr.inst.playOneShot("sound/other/commonLevelUp");
        playerItemCount += 1
        this.playerItemCount.getComponent(Label).string = playerItemCount.toString()
        var playerItemCount = Number(this.playerItemCount.getComponent(Label).string)
        // this.ShopCtrl.byNum=playerItemCount
    }
}


