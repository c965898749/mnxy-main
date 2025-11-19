import { _decorator, Button, Component, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

@ccclass('ShopCtrl')
export class ShopCtrl extends Component {
    @property(Node)
    timeLabel: Node
    @property(Button)
    btnUpdate: Button
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    start() {
        this.init()
    }

    update(deltaTime: number) {

    }
    updateStoreData() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.init();
        this.btnUpdate.interactable = false
        this.timeLabel.active = true
        let time = 10
        let lable = this.timeLabel.getComponent(Label)
        let self = this
        lable.string = time + "秒后可以刷新"
        this.schedule(function () {
            time--
            lable.string = time + "秒后可以刷新"
            if (time <= 0) {
                lable.string = ""
            }
        }, 1, 10)
        this.scheduleOnce(function () {
            self.btnUpdate.interactable = true
            self.timeLabel.active = false
        }, 10)
    }

    init() {
        const config = getConfig()
        const postData = {
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/getStore", options)
            .then(response => {

                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    const nodePool = util.resource.getNodePool(
                        await util.bundle.load("prefab/StoreEquipItem", Prefab)
                    )
                    const childrens = [...this.ContentNode.children]
                    for (let i = 0; i < childrens.length; i++) {
                        const node = childrens[i];
                        node.getChildByName("arms").children.forEach(x => {
                            x.getChildByName("sell").getChildByName("Background").off("click")
                        })
                        nodePool.put(node)
                    }
                    var objArray = data.data
                    for (let i = 0; i < objArray.length; i += 4) {
                        let item = nodePool.get()
                        const group = objArray.slice(i, i + 4);
                        const groupIndex = Math.floor(i / 4) + 1;
                        // 内层循环：遍历组内的每个元素
                        for (let j = 0; j < group.length; j++) {
                            const itemC = group[j];
                            let aa = item.getChildByName("arms").children[j];
                            aa.getChildByName("sell").getChildByName("Background").getComponent(Sprite).spriteFrame =
                                await util.bundle.load(`image/store/store_10/spriteFrame`, SpriteFrame)
                            if (itemC.goldEdgePrice != 0) {
                                aa.getChildByName("sell").getChildByName("Background")
                                    .getChildByName("Label").getComponent(Label).string = itemC.goldEdgePrice
                                aa.getChildByName("sell").getChildByName("Background").getChildByName("icon_61").getComponent(Sprite).spriteFrame =
                                    await util.bundle.load(`image/ui/icon_61/spriteFrame`, SpriteFrame)
                            } else {
                                aa.getChildByName("sell").getChildByName("Background")
                                    .getChildByName("Label").getComponent(Label).string = itemC.gemPrice
                                aa.getChildByName("sell").getChildByName("Background").getChildByName("icon_61").getComponent(Sprite).spriteFrame =
                                    await util.bundle.load(`image/ui/icon_69/spriteFrame`, SpriteFrame)
                            }
                            // icon_61
                            aa.getComponent(Sprite).spriteFrame =
                                await util.bundle.load(`image/store/common_0${itemC.quality}/spriteFrame`, SpriteFrame)
                            if (itemC.type == 1) {
                                aa.getChildByName("th").getComponent(Sprite).spriteFrame =
                                    await util.bundle.load(`game/texture/frames/hero/Header/${itemC.itemId}/spriteFrame`, SpriteFrame)
                            }
                            aa.getChildByName("sell").getChildByName("Background").on("click", () => { this.clickFun(itemC.itemId, aa) })
                        }
                        this.ContentNode.addChild(item)
                        continue
                    }
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );
    }
    clickFun(itemId: any, aa: Node) {
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            id: itemId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/buyStore", options)
            .then(response => {

                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    let userInfo = data.data;
                    config.userData.gold = userInfo.gold
                    config.userData.diamond = userInfo.diamond
                    config.userData.soul = userInfo.soul
                    config.userData.characters = userInfo.characterList
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                    aa.getChildByName("sell").getChildByName("Background").getComponent(Button).interactable = false
                    aa.getChildByName("sell").getChildByName("Background")
                        .getChildByName("Label").getComponent(Label).string = "已购买"
                    aa.getChildByName("sell").getChildByName("Background").getComponent(Sprite).spriteFrame =
                        await util.bundle.load(`image/store/store_12/spriteFrame`, SpriteFrame)
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





