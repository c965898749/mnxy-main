import { _decorator, Component, director, Label, Node, WebView } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

@ccclass('otherCtrl')
export class otherCtrl extends Component {



    start() {

    }

    update(deltaTime: number) {

    }

    //退出
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
        this.node.parent.getChildByName("SetCtrl").active = true
    }

    public openfrom() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("forumCtrl").active = true
    }
    public openMessage() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("MessageCrtl").active = true
    }
    public async WebViewManager() {
        AudioMgr.inst.playOneShot("sound/other/click");
        return await util.message.prompt({ message: "暂未开放" })
        // this.node.parent.getChildByName("WebViewManager").active = true
    }
    openBlessing() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("BlessingCrtl").active = true
    }
    openBag() {
        AudioMgr.inst.playOneShot("sound/other/click");
        director.loadScene("BagCrtl")
    }
}


