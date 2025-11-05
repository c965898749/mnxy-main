import { _decorator, Button, Component, find, instantiate, Label, Node, Prefab, resources, Tween } from 'cc';
import { RecuitCardItem } from './RecuitCardItem'
import { util } from 'db://assets/script/util/util';
import { AudioMgr } from "../../../../util/resource/AudioMgr";
import { getConfig, getToken, updateConfig } from '../../../../common/config/config';
const { ccclass, property } = _decorator;

@ccclass('RecruitCardCtrl')
export class RecruitCardCtrl extends Component {
    @property({ type: Node, tooltip: "招募单张抽卡" }) onceCard: Node = null;
    @property({ type: Node, tooltip: "招募10张抽卡" }) tenCard: Node = null;
    @property({ type: Node, tooltip: "招募10张抽卡位移位置" }) tenCardPos: Node = null;
    @property({ type: Button }) buttonOk: Button = null;
    @property(Node)
    diamond1: Node
    @property(Node)
    diamond2: Node
    @property(Node)
    diamond3: Node
    @property(Node)
    BlockInputEvents: Node
    start() {

    }

    update(deltaTime: number) {
        const config = getConfig()
        // console.log(config)
        this.diamond1.getComponent(Label).string = "(已有" + config.userData.soul + ")"
        this.diamond2.getComponent(Label).string = "(已有" + config.userData.diamond + ")"
        this.diamond3.getComponent(Label).string = "(已有" + config.userData.diamond + ")"
    }

    onGStart3(recruitCardCtrl: recruitCardCtrl) {
        this.BlockInputEvents.active = true
        const config = getConfig()
        const token = getToken()
        console.log(config.userData.userId, 555)
        const postData = {
            token: token,
            userId: config.userData.userId,
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/soulChou", options)
            .then(response => {
                if (!response.ok) {
                    this.BlockInputEvents.active = false
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                console.log(data); // 处理响应数据
                if (data.success == '1') {
                    var map = data.data;
                    let dto = map['dto'];
                    let user = map['user'];
                    this.onceCard.active = true;
                    AudioMgr.inst.playOneShot("sound/other/click");
                    if (this.onceCard.children.length > 0) {
                        let comp = this.onceCard.getChildByName("RecuitCardItem").getComponent(RecuitCardItem);
                        comp.init(dto.hero, recruitCardCtrl.cb);
                        config.userData.characters = dto.characters
                        config.userData.soul = user.soul
                        localStorage.setItem("UserConfigData", JSON.stringify(config))
                    } else {
                        const nodePool = util.resource.getNodePool(
                            await util.bundle.load("/prefab/RecuitCardItem", Prefab)
                        )
                        const node = nodePool.get()
                        const characterAvatar = node.getComponent(RecuitCardItem)
                        this.onceCard.addChild(node)
                        AudioMgr.inst.playOneShot("sound/other/getcard");
                        characterAvatar.init(dto.hero, () => {
                            this.buttonOk.node.active = true;
                        });
                        config.userData.characters = dto.characters
                        config.userData.soul = user.soul
                        localStorage.setItem("UserConfigData", JSON.stringify(config))
                    }
                } else {
                    this.BlockInputEvents.active = false
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                this.BlockInputEvents.active = false
                const close = util.message.confirm({ message: error })
            }
            );



    }

    onGStart(recruitCardCtrl: recruitCardCtrl) {
        this.BlockInputEvents.active = true
        const config = getConfig()
        const token = getToken()
        console.log(config.userData.userId, 555)
        const postData = {
            token: token,
            userId: config.userData.userId,
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/danChou", options)
            .then(response => {
                if (!response.ok) {
                    this.BlockInputEvents.active = false
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                console.log(data); // 处理响应数据
                if (data.success == '1') {
                    var map = data.data;
                    let dto = map['dto'];
                    let user = map['user'];
                    this.onceCard.active = true;
                    AudioMgr.inst.playOneShot("sound/other/click");
                    if (this.onceCard.children.length > 0) {
                        let comp = this.onceCard.getChildByName("RecuitCardItem").getComponent(RecuitCardItem);
                        comp.init(dto.hero, recruitCardCtrl.cb);
                        config.userData.characters = dto.characters
                        config.userData.diamond = user.diamond
                        localStorage.setItem("UserConfigData", JSON.stringify(config))
                    } else {
                        const nodePool = util.resource.getNodePool(
                            await util.bundle.load("/prefab/RecuitCardItem", Prefab)
                        )
                        const node = nodePool.get()
                        const characterAvatar = node.getComponent(RecuitCardItem)
                        this.onceCard.addChild(node)
                        AudioMgr.inst.playOneShot("sound/other/getcard");
                        characterAvatar.init(dto.hero, () => {
                            this.buttonOk.node.active = true;
                        });
                        config.userData.characters = dto.characters
                        config.userData.diamond = user.diamond
                        localStorage.setItem("UserConfigData", JSON.stringify(config))
                    }
                } else {
                    this.BlockInputEvents.active = false
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                this.BlockInputEvents.active = false
                const close = util.message.confirm({ message: error })
            }
            );



    }

    async onGStart2(recruitCardCtr) {
        this.BlockInputEvents.active = true
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId,
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/shiChou", options)
            .then(response => {
                if (!response.ok) {
                    this.BlockInputEvents.active = false
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                console.log(data); // 处理响应数据
                if (data.success == '1') {
                    var map = data.data;
                    let dto = map['dto'];
                    let user = map['user'];
                    this.tenCard.active = true;
                    this.tenCardPos.active = true;
                    AudioMgr.inst.playOneShot("sound/other/click");
                    if (this.tenCard.children.length > 0) {
                        //  console.log('recruitCardCtrl存在卡牌');
                    } else {
                        //    console.log('recruitCardCtrl不存在卡牌10');
                        const nodePool = util.resource.getNodePool(
                            await util.bundle.load("/prefab/RecuitCardItem", Prefab)
                        )
                        AudioMgr.inst.playOneShot("sound/other/getcard");
                        for (let i = 0; i < dto.heros.length; i++) {
                            const node = nodePool.get()
                            const characterAvatar = node.getComponent(RecuitCardItem)
                            characterAvatar.node.parent = this.tenCardPos.children[i];
                            characterAvatar.node.position.x = 0;
                            characterAvatar.node.position.y = 0;
                            characterAvatar.init(dto.heros[i], () => {
                                this.buttonOk.node.active = true;
                            });
                        }
                        config.userData.characters = dto.characters
                        config.userData.diamond = user.diamond
                        localStorage.setItem("UserConfigData", JSON.stringify(config))
                    }

                } else {
                    this.BlockInputEvents.active = false
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                this.BlockInputEvents.active = false
                console.error('There was a problem with the fetch operation:', error);
            }
            );

    }

    isOk() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.onceCard.removeAllChildren();
        if (this.tenCardPos.children.length > 0) {
            var list = this.tenCardPos.children;
            for (var i = 0; i < list.length; i++) {
                list[i].removeAllChildren()
            }
        }
        this.buttonOk.node.active = false;
        this.onceCard.active = false;
        this.tenCard.active = false;
        this.tenCardPos.active = false;
        this.BlockInputEvents.active = false
    }


}


