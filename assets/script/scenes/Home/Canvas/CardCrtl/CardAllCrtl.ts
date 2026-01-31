import { _decorator, Button, Component, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { CharacterEnum } from 'db://assets/script/game/fight/character/CharacterEnum';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { HeroCharacterDetail } from '../../../Hero/Canvas/HeroCharacterDetail';
const { ccclass, property } = _decorator;

@ccclass('CardAllCrtl')
export class CardAllCrtl extends Component {
    // 内容节点
    @property(Node)
    ContentNode: Node
    initialized: boolean = false
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
    async goBack2() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }
    // 渲染函数
    async refresh() {
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/allCardList", options)
            .then(response => {

                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    //  data.data
                    let characters = data.data
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
                        node.getChildByName("Camp").getComponent(Sprite).spriteFrame =
                            await util.bundle.load(`image/camp_icon/${character.camp}/spriteFrame`, SpriteFrame)
                        node.getChildByName("Camp").active = true
                        node.getChildByName("Avatar").getComponent(Sprite).spriteFrame = await util.bundle.load(`game/texture/frames/hero/Header/${character.id}/spriteFrame`, SpriteFrame)
                        node.getComponent(Button).transition = 3
                        node.getComponent(Button).zoomScale = 0.9
                        this.ContentNode.addChild(node)
                        // 绑定事件
                        node.on("click", () => this.clickFun(character))
                        continue
                    }
                    return
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );

    }

    public async clickFun(c) {
        AudioMgr.inst.playOneShot("sound/other/click");
        const characterDetail = this.node.getChildByName("CharacterDetail")
        characterDetail.active = true
        await characterDetail.getComponent(HeroCharacterDetail).setCharacter(c)
    }
}


