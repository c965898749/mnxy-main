import { _decorator, Component, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

@ccclass('HechenCtrl')
export class HechenCtrl extends Component {
    @property(Node)
    img: Node = null;
    @property(Node)
    itemCount: Node = null;

    async goBack2() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }

    async render(create, clickFun: () => any) {
        this.node.active = true
        this.img.getComponent(Sprite).spriteFrame =
            await util.bundle.load(create.icon, SpriteFrame)
        this.itemCount.getComponent(Label).string = create.itemCount
        this.node.getChildByName("Dhechen").on("click", () => {
            this.hechen(create.itemId, clickFun)
        })
        this.node.getChildByName("Yhechen").on("click", () => {
            this.Yhechen(create.itemId, clickFun)
        })
    }
    hechen(itemId, clickFun) {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            id: itemId,
            userId: config.userData.userId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "hechenCailiao", options)
            .then(response => {

                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    var itemCount = data.data;
                    this.itemCount.getComponent(Label).string = itemCount
                    clickFun()
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );
    }
    Yhechen(itemId, clickFun) {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            id: itemId,
            userId: config.userData.userId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "yhechenCailiao", options)
            .then(response => {

                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    var itemCount = data.data;
                    this.itemCount.getComponent(Label).string = itemCount
                    clickFun()
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


