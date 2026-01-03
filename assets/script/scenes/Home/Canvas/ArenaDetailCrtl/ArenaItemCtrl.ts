import { _decorator, Component, find, Label, Node, Sprite, SpriteFrame, UIOpacity, UIOpacityComponent, UITransform, v3, Vec3 } from 'cc';
import { ArenaDetailCrtl } from "./ArenaDetailCrtl";
const { ccclass, property } = _decorator;
import { HeroCharacterDetail } from '../../../Hero/Canvas/HeroCharacterDetail';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
@ccclass('ArenaItemCtrl')
export class ArenaItemCtrl extends Component {

    data: any = {};
    ArenaDetailCrtl: ArenaDetailCrtl = null
    private _originPos: Vec3;
    private _startPos: any;
    private oginPos: any;
    isTouch = false;


    doubleSubTime = 200;//ms
    longSubTime = 600;


    clickTime = 0;
    startClickTime = 0;
    endClickTime = 0;

    start() {
        // this.node.setSiblingIndex(0);
        this.oginPos = this.node.position;
        this.regiestNodeEvent(this.node);
    }

    update(deltaTime: number) {

    }

    regiestNodeEvent(node: Node) {
        if (!node) return;
        this.node.on(Node.EventType.TOUCH_START, this.touchStartEvent, this)
        this.node.on(Node.EventType.TOUCH_END, this.touchCancel, this)
        this.node.on(Node.EventType.TOUCH_CANCEL, this.touchCancel, this)
        this.node.on(Node.EventType.TOUCH_MOVE, this.touchMoveEvent, this)
    }

    onClick() {
        console.log(1111)
    }
    /**
    * 传入数据
    * @param data 数据
    * @param index 顺序
    * @param extData 额外数据
    */
    initData(data, ArenaDetailCrtl) {
        this.data = data;
        // this.desc.string = data.id + "";
        this.ArenaDetailCrtl = ArenaDetailCrtl
    }


    touchStartEvent(event) {
        this.startClickTime = new Date().getTime();
        this.isTouch = true
        console.log('touch start--------',this.data.id)
        this._originPos = this.node.getPosition();
        this._startPos = event.getLocation();
        this.getComponent(UIOpacity).opacity = 100;
        this.node.setSiblingIndex(999);
        this.ArenaDetailCrtl.getComponent(ArenaDetailCrtl).touchId = this.data.id
        // this.ArenaDetailCrtl.getComponent(ArenaDetailCrtl).lastTouchId = this.data.id
    }

    touchMoveEvent(event) {
        let pos = event.getLocation();
        if (!this._startPos) {
            return;
        }
        //控制横轴移动
        let offset_x = pos.x - this._startPos.x;
        let toPosX = this._originPos.x + offset_x;
        //控制纵轴移动
        let offset_y = pos.y - this._startPos.y;
        let toPosY = this._originPos.y + offset_y;
        this.node.x = toPosX
        this.node.y = toPosY
        // let isRight = this.node.y > this.data.originPos.y
        // let y = isRight ? (this.node.y + this.node.getComponent(UITransform).height / 2) : (this.node.y - this.node.getComponent(UITransform).height / 2)
        // console.log(this.data.originPos.y, 4444)
        // console.log(this.node.y, 4444)
        // console.log(y, 4444)
        // //检测重叠超过1/2,判断为移动
        this.data.checkPos = v3(toPosX, toPosY)
        // this.ArenaDetailCrtl.getComponent(ArenaDetailCrtl).upDateIndexByX()
    }


    async touchCancel() {
        // this.isTouch = false
        this.ArenaDetailCrtl.getComponent(ArenaDetailCrtl).upDateIndexByX()
        this.getComponent(UIOpacity).opacity = 255;
        // this.node.setSiblingIndex(0);
        // this.ArenaDetailCrtl.getComponent(ArenaDetailCrtl).touchId = null
        // console.log(this.endClickTime, 444444)
        // this.endClickTime = new Date().getTime();

        // console.log(this.endClickTime - this.startClickTime);
        // this.ArenaDetailCrtl.getComponent(ArenaDetailCrtl).itemUpdate()
        //长按事件
        console.log("长按事件");
    }

    public async clickFun(c) {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.ArenaDetailCrtl.node.parent.getChildByName("ArenaDetailCrtl").active = false
        this.ArenaDetailCrtl.node.parent.getChildByName("Floor").active = false
        const characterDetail = this.ArenaDetailCrtl.node.parent.getChildByName("CharacterDetail")
        characterDetail.active = true
        await characterDetail.getComponent(HeroCharacterDetail).setCharacter(c)
    }


}
