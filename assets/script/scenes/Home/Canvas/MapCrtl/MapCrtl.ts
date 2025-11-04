import { _decorator, Component, Label, Node, tween, v3, Vec3 } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { PveCtrl } from '../PveCtrl/PveCtrl';
const { ccclass, property } = _decorator;

@ccclass('MapCrtl')
export class MapCrtl extends Component {
    @property(Node)
    Title: Node


    @property(Node)
    Map: Node
    index: number = 0

    tiles = ["踏上旅途", "冲向妖界", "龙宫探宝", "地府改命", "大闹天宫"]
    start() {
        this.Title.getComponent(Label).string = "踏上旅途 1/5"
    }

    update(deltaTime: number) {

    }
    right() {
        AudioMgr.inst.playOneShot("sound/other/click");
        tween(this.Map.children[this.index])
            .to(0.5, { position: v3(-640, 0) })
            .start();
        this.index++
        if (this.index >= 5) {
            this.index = 0
        }
        this.Title.getComponent(Label).string = this.tiles[this.index] + (this.index + 1) + "/5"
        this.Map.children[this.index].setPosition(640, 0, 0)
        tween(this.Map.children[this.index])
            .to(0.5, { position: v3(0, 0) })
            .start();
    }
    left() {
        AudioMgr.inst.playOneShot("sound/other/click");
        tween(this.Map.children[this.index])
            .to(0.5, { position: v3(640, 0) })
            .start();
        this.index--
        if (this.index < 0) {
            this.index = 4
        }
        this.Title.getComponent(Label).string = this.tiles[this.index] + (this.index + 1) + "/5"
        this.Map.children[this.index].setPosition(-640, 0, 0)
        tween(this.Map.children[this.index])
            .to(0.5, { position: v3(0, 0) })
            .start();
    }

    async openMap(event: Event, customEventData: string) {
        AudioMgr.inst.playOneShot("sound/other/click");
        // this.node.parent.getChildByName("PveCtrl").active = true
        console.log(customEventData)
        await this.render(customEventData)
    }
    async render(mapId) {
        await this.node.parent.getChildByName("PveCtrl")
            .getComponent(PveCtrl)
            .render(mapId)
    }
}


