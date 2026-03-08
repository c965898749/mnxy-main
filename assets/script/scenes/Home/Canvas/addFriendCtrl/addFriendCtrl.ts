import { _decorator, Color, Component, Graphics, Label, Node, Sprite, SpriteFrame, tween, UITransform, Vec3 } from 'cc';
import { getConfig } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { QRCode, QRCodeStyle } from './QRCode';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;
@ccclass('addFriendCtrl')
export class addFriendCtrl extends Component {
    @property(Node)
    myCode: Node
    @property(Node)
    qrcode: Node;
    @property(Node)
    rewards: Node

    onLoad() {
        const config = getConfig()
        this.myCode.getComponent(Label).string = config.userData.myCode
        this.qrcode.getComponent(QRCode).string = config.userData.myCode;
        this.qrcode.getComponent(QRCode).background = Color.WHITE;
        this.qrcode.getComponent(QRCode).foreground = Color.BLACK;
        this.qrcode.getComponent(QRCode).style = QRCodeStyle.Default;
        this.qrcode.getComponent(QRCode).borderWidth = 10;
    }
    update(deltaTime: number) {

    }
    async goBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }
    async zhanbao() {
        const config = getConfig()
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.getChildByName("lian1").getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian/spriteFrame', SpriteFrame)
        this.node.getChildByName("lian2").getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian2/spriteFrame', SpriteFrame)
        this.qrcode.getComponent(QRCode).string = config.userData.myCode
    }
    async frineds() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.getChildByName("lian1").getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian2/spriteFrame', SpriteFrame)
        this.node.getChildByName("lian2").getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian/spriteFrame', SpriteFrame)
        this.qrcode.getComponent(QRCode).string = "http://sx.yimem.com/ymsx.html"
    }

    openrewards() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.rewards.active = true;

        this.rewards.scale = new Vec3(0, 0, 0)
        tween(this.rewards)
            .to(1, { scale: new Vec3(1, 1, 1) }, { easing: 'elasticOut' })
            .start();
    }

    closerewards() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.rewards.active = false;
    }
}


