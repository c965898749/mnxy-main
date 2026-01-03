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
    @property(Node)
    storeImg
    shopUpdate: number
    timer = 0
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    initialized = false;
    start() {
        this.init("0")
    }

    onEnable() {
        if (!this.initialized) {
            // 初始化代码
            this.initialized = true;
        } else {
            this.init("0")
        }

    }
    async update(deltaTime: number) {
        if (this.timer >= 50) {
            // 调用函数，传入目标时间戳1767383923000
            const result = this.checkTimeDifference(this.shopUpdate);
            // 打印结果（可根据需求自行处理结果）
            if (typeof result === 'number') {
                this.btnUpdate.interactable = false
                this.timeLabel.active = true
                let time = result
                let lable = this.timeLabel.getComponent(Label)
                let self = this
                self.storeImg.getComponent(Sprite).spriteFrame = null
                lable.string = this.formatTime(time) + "秒后可以刷新"
            } else {
                this.btnUpdate.interactable = true
                this.timeLabel.active = false
                this.storeImg.getComponent(Sprite).spriteFrame =
                    await util.bundle.load(`image/store/store_06/spriteFrame`, SpriteFrame)
            }
            // console.log("GetLeaveEnergyTime:", this.GetLeaveEnergyTime());
            this.timer = 0;
        }
        else {
            this.timer++;
        }

    }
    updateStoreData() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.init("1");
        // this.btnUpdate.interactable = false
        // this.timeLabel.active = true
        // let time = 10
        // let lable = this.timeLabel.getComponent(Label)
        // let self = this
        // lable.string = time + "秒后可以刷新"
        // this.schedule(function () {
        //     time--
        //     lable.string = time + "秒后可以刷新"
        //     if (time <= 0) {
        //         lable.string = ""
        //     }
        // }, 1, 10)
        // this.scheduleOnce(function () {
        //     self.btnUpdate.interactable = true
        //     self.timeLabel.active = false
        // }, 10)
    }
    formatTime(remainingSeconds) {
        var minutes = Math.floor(remainingSeconds / 60); // 向下取整，获取准确分钟数
        var seconds = Math.floor(remainingSeconds % 60); // 向下取整，获取准确秒数
        // 秒数补零：不足两位时，前面加0
        var formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
        return minutes + ":" + formattedSeconds;
    }
    checkTimeDifference(targetTimestamp: number): boolean | number {
        // 1. 定义30分钟对应的毫秒数：30分钟 = 30 * 60秒 * 1000毫秒/秒
        const thirtyMinutesMs = 30 * 60 * 1000;

        // 2. 获取当前时间的时间戳（毫秒级）
        const currentTimestamp = Date.now();

        // 3. 计算时间差值（绝对值，避免目标时间早于/晚于当前时间的异常）
        const timeDiffMs = Math.abs(targetTimestamp - currentTimestamp);

        // 4. 判断差值是否大于30分钟
        if (timeDiffMs > thirtyMinutesMs) {
            return true;
        } else {
            // 5. 未超过30分钟时，计算剩余毫秒数并转换为秒（向下取整，也可使用Math.round四舍五入）
            const remainingMs = thirtyMinutesMs - timeDiffMs;
            const remainingSeconds = Math.floor(remainingMs / 1000);
            return remainingSeconds;
        }
    }

    init(str) {
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId,
            str: str
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
                            x.getChildByName("sell").getChildByName("Background").getComponent(Button).interactable = true
                        })
                        nodePool.put(node)
                    }
                    let map = data.data
                    let shopUpdate = map["shopUpdate"]
                    this.shopUpdate = shopUpdate
                    let picked = map["picked"]
                    let objArray = picked
                    let buyId = []
                    if (objArray) {
                        localStorage.setItem("picked", JSON.stringify(objArray))
                        localStorage.setItem("buyId", "")
                    } else {
                        picked = localStorage.getItem("picked")
                        objArray = JSON.parse(picked)
                        let buyIdJson = localStorage.getItem("buyId")
                        if (buyIdJson) {
                            buyId = JSON.parse(buyIdJson)
                        }
                    }
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

                            if (buyId && buyId.length > 0) {
                                let cc = buyId.filter(x => x == itemC.id)
                                if (cc && cc.length > 0) {
                                    console.log(999)
                                    aa.getChildByName("sell").getChildByName("Background").getComponent(Button).interactable = false
                                    aa.getChildByName("sell").getChildByName("Background")
                                        .getChildByName("Label").getComponent(Label).string = "已购买"
                                    aa.getChildByName("sell").getChildByName("Background").getComponent(Sprite).spriteFrame =
                                        await util.bundle.load(`image/store/store_12/spriteFrame`, SpriteFrame)
                                }

                            }
                            aa.getChildByName("sell").getChildByName("Background").on("click", () => { this.clickFun(itemC.id, itemC.itemId, aa) })
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
    clickFun(id, itemId: any, aa: Node) {
        let buyId = []
        let buyIdJson = localStorage.getItem("buyId")
        if (buyIdJson) {
            buyId = JSON.parse(buyIdJson)
            console.log(buyId, 777)
        }
        buyId.push(id)
        localStorage.setItem("buyId", JSON.stringify(buyId))
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

    openBag() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("bagCrtl").active = true
    }
}





