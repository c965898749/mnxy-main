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

    private _clickFun: (() => any) | null = null;
    private _abortController: AbortController | null = null;

    goBack2() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false;
        // ✅关闭弹窗，执行回调，通知父bagCrtl执行refresh2刷新材料列表
        if (this._clickFun) {
            this._clickFun();
        }
        // 关闭时清理事件、取消网络请求
        this._clearEvent();
        this._cancelLastFetch();
    }

    async render(create, clickFun: () => any) {
        this.node.active = true;
        this._clickFun = clickFun;
        this._clearEvent(); // 先清旧事件，防止重复绑定

        if (!this.img) return;
        const sprite = this.img.getComponent(Sprite);
        if (sprite) {
            sprite.spriteFrame = await util.bundle.load(create.icon, SpriteFrame);
        }
        if (this.itemCount) {
            const lab = this.itemCount.getComponent(Label);
            if (lab) lab.string = create.itemCount;
        }

        const dhechen = this.node.getChildByName("Dhechen");
        const yhechen = this.node.getChildByName("Yhechen");
        if (dhechen) {
            dhechen.on("click", () => {
                this.hechen(create.itemId, clickFun);
            });
        }
        if (yhechen) {
            yhechen.on("click", () => {
                this.Yhechen(create.itemId, clickFun);
            });
        }
    }

    private _clearEvent() {
        const dhechen = this.node.getChildByName("Dhechen");
        const yhechen = this.node.getChildByName("Yhechen");
        if (dhechen) dhechen.off("click");
        if (yhechen) yhechen.off("click");
    }

    private _cancelLastFetch() {
        if (this._abortController) {
            this._abortController.abort();
            this._abortController = null;
        }
    }

    hechen(itemId, clickFun) {
        AudioMgr.inst.playOneShot("sound/other/click");
        this._cancelLastFetch();
        const config = getConfig();
        const token = getToken();
        const postData = {
            token: token,
            id: itemId,
            userId: config.userData.userId
        };
        this._abortController = new AbortController();
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
            signal: this._abortController.signal
        };

        fetch(config.ServerUrl.url + "hechenCailiao", options)
            .then(response => response.json())
            .then(data => {
                if (data.success == '1') {
                    const map = data.data;
                    const itemCount = map['itemCount'] || 0;
                    const userInfo = map['userInfo'];
                    if (this.itemCount) {
                        const lab = this.itemCount.getComponent(Label);
                        if (lab) lab.string = itemCount;
                    }
                    config.userData.characters = userInfo.characterList;
                    localStorage.setItem("UserConfigData", JSON.stringify(config));
                    clickFun();
                } else {
                    util.message.confirm({ message: data.errorMsg || "服务器异常" });
                }
            })
            .catch(error => {
                if (error.name !== "AbortError") {
                    console.error('合成请求异常', error);
                    util.message.confirm({ message: "网络异常" });
                }
            });
    }

    Yhechen(itemId, clickFun) {
        AudioMgr.inst.playOneShot("sound/other/click");
        this._cancelLastFetch();
        const config = getConfig();
        const token = getToken();
        const postData = {
            token: token,
            id: itemId,
            userId: config.userData.userId
        };
        this._abortController = new AbortController();
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
            signal: this._abortController.signal
        };

        fetch(config.ServerUrl.url + "yhechenCailiao", options)
            .then(response => response.json())
            .then(data => {
                if (data.success == '1') {
                    const map = data.data;
                    const itemCount = map['itemCount'] || 0;
                    const userInfo = map['userInfo'];
                    if (this.itemCount) {
                        const lab = this.itemCount.getComponent(Label);
                        if (lab) lab.string = itemCount;
                    }
                    config.userData.characters = userInfo.characterList;
                    localStorage.setItem("UserConfigData", JSON.stringify(config));
                    clickFun();
                } else {
                    util.message.confirm({ message: data.errorMsg || "服务器异常" });
                }
            })
            .catch(error => {
                if (error.name !== "AbortError") {
                    console.error('一键合成请求异常', error);
                    util.message.confirm({ message: "网络异常" });
                }
            });
    }

    onDestroy() {
        this._cancelLastFetch();
        this._clearEvent();
    }
}
