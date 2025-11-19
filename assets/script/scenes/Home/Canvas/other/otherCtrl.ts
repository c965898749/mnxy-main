import { _decorator, Component, director, Node } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('otherCtrl')
export class otherCtrl extends Component {
    @property(Node)
    SetCtrl: Node


    start() {

    }

    update(deltaTime: number) {

    }

    public backLogin() {
        AudioMgr.inst.playOneShot("sound/other/click");
        localStorage.setItem("token", null)
        localStorage.setItem("UserConfigData", null)
        director.preloadScene("login", () => {
            close()
        })
        director.loadScene("login")
    }
    public openSet() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.SetCtrl.active = true
    }

    public openfrom() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("forumCtrl").active = true
    }
    public openMessage() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("MessageCrtl").active = true
    }
    openHotEvents() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("HotEventsCtrl").active=true
    }
}


