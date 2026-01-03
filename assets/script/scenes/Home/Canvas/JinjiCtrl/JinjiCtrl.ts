import { _decorator, Component, Node } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('JinjiCtrl')
export class JinjiCtrl extends Component {
    start() {

    }

    update(deltaTime: number) {

    }

    //挑战
    public async JinjichangCtrl() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("Buildings").active = false
        this.node.parent.getChildByName("JinjiCtrl").active = false
        this.node.parent.getChildByName("JinjichangCtrl").active = true
    }
    //挑战
    public async MyFriendsCrtl() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("Buildings").active = false
        this.node.parent.getChildByName("JinjiCtrl").active = false
        this.node.parent.getChildByName("MyFriendsCrtl").active = true
    }

    public async ArenaCrtl() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("Buildings").active = false
        this.node.parent.getChildByName("JinjiCtrl").active = false
        this.node.parent.getChildByName("ArenaCrtl").active = true
    }
}


