import { _decorator, Component, EventHandler, Label, Node, ToggleComponent } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { SelectCardCtrl2 } from './SelectCardCtrl2';
const { ccclass, property } = _decorator;

@ccclass('AttrLevelCtrl')
export class AttrLevelCtrl extends Component {
    /**
   * 玩家资源数量   金币
   */
    @property(Node)
    stackCountNode: Node = null;
    @property(Node)
    playerItemCount: Node = null;
    SelectCardCtrl2: SelectCardCtrl2 = null
    @property(ToggleComponent)
    toggle: ToggleComponent | null = null;
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
        let buttonNode = this.node.getChildByName("levelUp");
        buttonNode.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
        buttonNode.on(cc.Node.EventType.TOUCH_CANCEL, this.touchEnd, this);
        buttonNode.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
        this.toggle.node.on("click", this.callback, this);
    }


    callback(toggle: ToggleComponent) {
        console.log(111);
        var id = this.node.getChildByName("id").getComponent(Label).string

        if (!toggle.getComponent(ToggleComponent).isChecked) {
            console.log("选中");
            var playerItemCount = Number(this.playerItemCount.getComponent(Label).string)
            console.log("选中", playerItemCount)
            this.SelectCardCtrl2.myMap.set(id, playerItemCount);
            this.node.getChildByName("cong").active = true
        } else {
            console.log("取消选中");
            this.SelectCardCtrl2.myMap.delete(id);
            this.node.getChildByName("cong").active = false
        }
    }

    start() {

    }

    initData(SelectCardCtrl2) {
        this.SelectCardCtrl2 = SelectCardCtrl2
    }


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

        var stackCount = Number(this.stackCountNode.getComponent(Label).string)
        var playerItemCount = Number(this.playerItemCount.getComponent(Label).string)

        // 是否已满级
        if (stackCount <= 0) {
            return;
        }
        AudioMgr.inst.playOneShot("sound/other/commonLevelUp");
        stackCount -= 1
        this.stackCountNode.getComponent(Label).string = stackCount.toString()
        playerItemCount += 1
        this.playerItemCount.getComponent(Label).string = playerItemCount.toString()
        var playerItemCount = Number(this.playerItemCount.getComponent(Label).string)
        var id = this.node.getChildByName("id").getComponent(Label).string
        if (this.SelectCardCtrl2.myMap.has(id)) {
            this.SelectCardCtrl2.myMap.set(id, playerItemCount);
        }
    }
}


