import { _decorator, Button, Component, director, find, game, ImageAsset, instantiate, Node, Prefab, resources, sp } from 'cc';
import { AudioMgr } from '../manager/AudioMgr';
import { Res } from "../common/common/UIResources";
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {

    // static instance: Main = null;
    // @property(Prefab)
    // Loginpel: Prefab = null;
    // @property(Prefab)
    // Longding: Prefab = null;

    // @property(Node)
    // Canvas: Node = null;


    // public dicPanel = {};

    onLoad() {
        // Button. = Res.audio.btnClick;
        // GameMgr.uiMgr.invalidAudio = Res.audio.invalidClick;
        // GameMgr.uiMgr.initWinInfos(JXWinInfo, JXViewPreLoad, (node) => {
        //     return new Toast(node);
        // });
        this.onGameStart();
    }

    public onGameStart() {
        // let node = director.getScene().getChildByName(APP_CTRL);
        // if (!node) {
        //     //添加一个控制节点
        //     node = new Node();
        //     if (node) {
        //         node.name = 'AppCtrl';
        //         let appCtrl = node.addComponent(AppCtrl);
        //         appCtrl.initEvent();
        //         game.addPersistRootNode(node);
        //     }
        // }

        // GameMgr.uiMgr.showWin(VIEW_ID.load, LoadingType.AppStart);
    }
    // onLoad() {
    // cc.Button.comAudio = Res.audio.btnClick;
    // GameMgr.uiMgr.invalidAudio = Res.audio.invalidClick;
    // GameMgr.uiMgr.initWinInfos(JXWinInfo, JXViewPreLoad, (node) => {
    //     return new Toast(node);
    // });

    // }
    //     if (Main.instance == null) {
    //         Main.instance = this;
    //     } else {
    //         this.destroy();

    //         return;
    //     }

    // }

    // start() {
    //     // this.init()
    // }

    // update(deltaTime: number) {

    // }

    // init() {
    //     var login = instantiate(this.Loginpel)
    //     this.Canvas.addChild(login)
    //     AudioMgr.inst.play("Sound/background", 1)
    // }

    // public hidePanel(name) {
    //     for (let key in this.dicPanel) {
    //         if (!name.includes(key)) {
    //             this.dicPanel[key].active = false;
    //         }
    //     }
    // }

    // public showPanel(name, num) {
    //     let panel = this.dicPanel[name];
    //     if (panel) {
    //         if (panel.activeInHierarchy) {
    //             panel.active = true;
    //         } else {
    //             let parent = find("Canvas")
    //             if (parent) {
    //                 parent.addChild(panel);
    //                 panel.setSiblingIndex(num)
    //             }
    //             panel.active = true;
    //         }
    //     }
    // }

}




