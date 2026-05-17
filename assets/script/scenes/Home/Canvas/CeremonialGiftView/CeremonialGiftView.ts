import { _decorator, color, Component, instantiate, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { Rewards } from '../../rewards/Rewards';
const { ccclass, property } = _decorator;

@ccclass('CeremonialGiftView')
export class CeremonialGiftView extends Component {
    @property(Node)
    items: Node[] = [];
    @property(Node)
    item: Node = null;
    reward = null
    initialized = false;

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

    refresh() {
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
        fetch(config.ServerUrl.url + "geremonialGiftList", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {

                    data.data.forEach((element, index) => {
                        let drawItem = instantiate(this.item)
                        drawItem.parent = this.items[index]
                        drawItem.setPosition(0, 0);
                        drawItem.name = "drawItem"
                        this.initTextureWithData(drawItem, element)
                    });
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );
    }
    _index = 0
    _dtTime = 0
    _isStartRun = false
    _endIndex = 0
    startDraw() {
        if (this._isStartRun) {
            return
        }
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
        fetch(config.ServerUrl.url + "geremonialGiftListChou", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    this._isStartRun = true
                    this._endIndex = Math.floor(Math.random() * 10) + 20
                    this._index = 0
                    var map = data.data;
                    var user = map['user'];
                    this.reward = map["rewards"];
                    config.userData.bronze1 = user.bronze1
                    config.userData.gold = user.gold
                    config.userData.diamond = user.diamond
                    config.userData.bronze = user.bronze
                    config.userData.darkSteel = user.darkSteel
                    config.userData.purpleGold = user.purpleGold
                    config.userData.crystal = user.crystal
                    config.userData.characters = user.characterList
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );
    }

    async initTextureWithData(drawItem, array) {
        let icon = drawItem.getChildByName("mask").getChildByName("icon").getComponent(Sprite)
        drawItem.getChildByName("lab").getComponent(Label).string = array.txt + ' x' + array.award;
        icon.spriteFrame = await util.bundle.load(array.icon, SpriteFrame)
        drawItem.getChildByName("lab").color = color(255, 255, 255, 255)
        if (array.isSign == "1") {
            drawItem.getChildByName("signBtn").active = true
            drawItem.getChildByName("light").active = false
        }

    }



    protected async update(dt: number): Promise<void> {
        if (!this._isStartRun) {
            return
        }
        this._dtTime += dt
        if (this._dtTime > 0.1) {
            this._dtTime = 0
            this._index++
            for (let index = 0; index < 10; index++) {
                this.items[index].getChildByName("drawItem").getChildByName("light").active = false
            }
            let itemsIndex = this.getDrawIndex(this._index, this._index >= this._endIndex, this.reward[0].index)
            AudioMgr.inst.playOneShot("sound/other/commonLevelUp");
            this.items[itemsIndex].getChildByName("drawItem").getChildByName("light").active = true
            if (this._index >= this._endIndex) {
                this._isStartRun = false
                const rewardsFab = await util.bundle.load("prefab/rewards", Prefab)
                const rewards = instantiate(rewardsFab)
                this.node.parent.addChild(rewards)
                await rewards
                    .getComponent(Rewards)
                    .read(this.reward)
            }
        }
    }
    getDrawIndex(index, isHero, rewardIndex) {
        if (isHero) {
            return rewardIndex;
        }
        // 没跑完 → 0→1→2→…→9→0→1 循环滚动
        return index % 10;
    }
    goBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }

    public async bodyReceive() {
        AudioMgr.inst.playOneShot("sound/other/click");
        return await util.message.prompt({ message: "暂未开放" })
    }

}


