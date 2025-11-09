import { _decorator, Component, find, Label, Node, Sprite, SpriteFrame, UIOpacity, UIOpacityComponent, UITransform, v3, Vec3 } from 'cc';
import { TiemCtrl } from "./TiemCtrl";
const { ccclass, property } = _decorator;
import { HeroCharacterDetail } from '../../../Hero/Canvas/HeroCharacterDetail';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { util } from 'db://assets/script/util/util';
import { CharacterStateCreate } from 'db://assets/script/game/fight/character/CharacterState';
import { SelectCardCtrl } from '../qianghua/SelectCardCtrl';
import { CharacterEnum } from 'db://assets/script/game/fight/character/CharacterEnum';
@ccclass('ItemCtrl')
export class ItemCtrl extends Component {

    data: any = {};
    TiemCtrl: TiemCtrl = null
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
    initData(data, TiemCtrl) {
        this.data = data;
        // this.desc.string = data.id + "";
        this.TiemCtrl = TiemCtrl
    }


    touchStartEvent(event) {
        this.startClickTime = new Date().getTime();
        this.isTouch = true
        console.log('touch start--------')
        this._originPos = this.node.getPosition();
        this._startPos = event.getLocation();
        this.getComponent(UIOpacity).opacity = 100;
        // this.node.setSiblingIndex(999);
        this.TiemCtrl.getComponent(TiemCtrl).touchId = this.data.id
        this.TiemCtrl.getComponent(TiemCtrl).lastTouchId = this.data.id
    }

    touchMoveEvent(event) {
        let pos = event.getLocation();
        if (!this._startPos) {
            return;
        }
        //控制横轴移动
        // let offset_x = pos.y - this._startPos.y;
        // let toPosX = this._originPos.x + offset_x;
        //控制纵轴移动
        let offset_y = pos.y - this._startPos.y;
        let toPosY = this._originPos.y + offset_y;
        this.node.y = toPosY
        let isRight = this.node.y > this.data.originPos.y
        let y = isRight ? (this.node.y + this.node.getComponent(UITransform).height / 2) : (this.node.y - this.node.getComponent(UITransform).height / 2)
        console.log(this.data.originPos.y, 4444)
        console.log(this.node.y, 4444)
        console.log(y, 4444)
        //检测重叠超过1/2,判断为移动
        this.data.checkPos = v3(this.data.originPos.x, y)
        this.TiemCtrl.getComponent(TiemCtrl).upDateIndexByX()
    }


    async touchCancel() {
        this.isTouch = false
        this.TiemCtrl.getComponent(TiemCtrl).upDateIndexByX(true)
        this.getComponent(UIOpacity).opacity = 255;
        // this.node.setSiblingIndex(0);
        this.TiemCtrl.getComponent(TiemCtrl).touchId = null
        console.log(this.endClickTime, 444444)
        this.endClickTime = new Date().getTime();

        console.log(this.endClickTime - this.startClickTime);
        if (this.endClickTime - this.startClickTime > this.longSubTime) {
            this.TiemCtrl.getComponent(TiemCtrl).itemUpdate()
            //长按事件
            console.log("长按事件");

        } else if (this.endClickTime - this.startClickTime < this.doubleSubTime) {
            if (this.data.create) {
                this.clickFun(this.data.create)
            } else {
                const config = getConfig()
                var cahracterQueue = []
                cahracterQueue = config.userData.characters
                cahracterQueue = cahracterQueue.filter(x => x.goIntoNum == 0)
                await this.render(cahracterQueue)
            }
            console.log("单击事件");
        } else {
            this.TiemCtrl.getComponent(TiemCtrl).itemUpdate()
        }
    }
    async render(characterQueue: CharacterStateCreate[]) {
        await find('Canvas').getChildByName("SelectCardCtrl")
            .getComponent(SelectCardCtrl)
            .render(characterQueue, async (c, n) => {
                n.active = false
                this.clickFun2(c)
                return
            })
    }
    public async clickFun(c) {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.TiemCtrl.node.parent.getChildByName("TiemCtrl").active = false
        this.TiemCtrl.node.parent.getChildByName("Floor").active = false
        const characterDetail = this.TiemCtrl.node.parent.getChildByName("CharacterDetail")
        characterDetail.active = true
        await characterDetail.getComponent(HeroCharacterDetail).setCharacter(c)
    }

    public async clickFun2(create) {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            id: create.id
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/changeState", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    var userInfo = data.data;
                    config.userData.characters = userInfo.characterList
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                    const meta = CharacterEnum[create.id]
                    var goIntoNum = create.goIntoNum
                    this.node.getChildByName("tiemHeader").children[0].getComponent(Sprite).spriteFrame =
                        await util.bundle.load(`game/texture/frames/hero/Header/${create.id}/spriteFrame`, SpriteFrame)
                    // 渲染星级
                    console.log(meta.name + "---" + goIntoNum)
                    this.node.children[4].active = true
                    this.node.children[3].active = true
                    this.node.children[2].active = true
                    this.node.children[4].children.forEach(n => n.active = false)
                    for (let j = 0; j < create.star; j++) {
                        this.node.children[4].children[j].active = true
                        if (j + 0.5 < create.star) {
                            this.node.children[4].children[j].children[0].active = true
                        }
                    }
                    this.node.children[2].getComponent(Label).string = meta.name + "  Lv" + create.lv + "/" + create.maxLv
                    // 仙、佛、圣、魔、妖、兽
                    const cmp = new Map([
                        ['sacred', '仙界'],
                        ['nature', '佛界'],
                        ['machine', '圣界'],
                        ['abyss', '魔界'],
                        ['dark', '妖界'],
                        ['ordinary', '兽界'],
                    ]);
                    // this.power = this.power + parseInt(this.getZhanli(create[i]).toString())
                    const position = ["仙灵", "神将", "武圣"]
                    this.node.children[3].getComponent(Label).string = cmp.get(meta.CharacterCamp) + "." + position[meta.position]
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );


    }
}


