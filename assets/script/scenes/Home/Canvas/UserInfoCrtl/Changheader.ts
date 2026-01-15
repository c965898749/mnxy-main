import { _decorator, Button, Component, find, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

@ccclass('changheader')
export class changheader extends Component {
    // 内容节点
    @property(Node)
    ContentNode: Node
    initialized: boolean = false
    id: String
    start() {
        this.refresh()
    }
    onEnable() {
        if (!this.initialized) {
            // 初始化代码
            this.initialized = true;
        } else {
            this.refresh()
        }

    }
    update(deltaTime: number) {

    }
    // 渲染函数
    async refresh() {
        const config = getConfig()
        // const close = await util.message.load()
        const cahracterQueue = []
        // await this.render(config.userData.characters)
        let characters = config.userData.characters
        const nodePool = util.resource.getNodePool(
            await util.bundle.load("prefab/HolCharacterAvatar", Prefab)
        )
        const childrens = [...this.ContentNode.children]
        for (let i = 0; i < childrens.length; i++) {
            const node = childrens[i];
            node.off("click")
            node.getComponent(Button).transition = 0
            nodePool.put(node)
        }
        for (const character of characters) {
            const node = nodePool.get()
            node.getChildByName("Avatar").getComponent(Sprite).spriteFrame = await util.bundle.load(`game/texture/frames/hero/Header/${character.id}/spriteFrame`, SpriteFrame)
            node.getComponent(Button).transition = 3
            node.getComponent(Button).zoomScale = 0.9
            this.ContentNode.addChild(node)
            // 绑定事件
            node.on("click", () => {  AudioMgr.inst.playOneShot("sound/other/click");this.id = character.id })
            continue
        }
        return
    }
    async goBack2() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("changheader").active = false
    }
    quedingchange() {
        const config = getConfig()
        const token = getToken()
        AudioMgr.inst.playOneShot("sound/other/click");
        console.log(config.userData.userId, 555)
        const postData = {
            token: token,
            str: "game/texture/frames/hero/Header/" + this.id + "/spriteFrame",
            userId: config.userData.userId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/changerHeader", options)
            .then(response => {

                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    var userInfo = data.data;
                    config.userData.gameImg = userInfo.gameImg
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                    find("Canvas").getChildByName("Buildings").getChildByName("Top").getChildByName("head_img").getChildByName("header_qitiandashen").getComponent(Sprite).spriteFrame =
                        await util.bundle.load(config.userData.gameImg, SpriteFrame)
                    find("Canvas").getChildByName("UserInfoCrtl").getChildByName("head_img").getChildByName("header_qitiandashen").getComponent(Sprite).spriteFrame =
                        await util.bundle.load(config.userData.gameImg, SpriteFrame)
                    this.node.parent.getChildByName("changheader").active = false
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


