import { _decorator, Component, find, instantiate, Label, Node, Prefab, Sprite, SpriteFrame, tween, v3 } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { FightMap } from '../../../Fight/Canvas/FightMap';
import { HomeCanvas } from '../../HomeCanvas';
import { FightSuccess } from '../../../Fight/Canvas/FightSuccess';
import { FightSuccessRewds } from '../../../Fight/Canvas/FightSuccessRewds';
const { ccclass, property } = _decorator;

@ccclass('TrialTowerCrtl')
export class TrialTowerCrtl extends Component {
    @property(Node)
    nameNode: Node
    @property(Node)
    PvE_default: Node
    index: number = 0
    index2: number = 1
    index3: number = 2
    ceng: number = 2
    @property(Node)
    myNode: Node
    @property(Node)
    bossNode: Node
    initialized = false;
    customEventData: string = ''
    positionInImage = 0
    nextImageNumbers = []
    @property(Node)
    cailiao: Node
    // 二维坐标数组 (x, y)，最常用、最简洁，强烈推荐
    points: [number, number][] = [
        [-290, -380],    // 原点
        [230, -200],
        [-90, -50],
        [-200, 100],
        [250, 240],
        [-30, 350],
        [-290, 480],
    ];
    start() {
        // this.refresh()
    }
    onEnable() {
        // if (!this.initialized) {
        //     // 初始化代码
        //     this.initialized = true;
        // } else {
        //     this.refresh()
        // }

    }
    refresh() {


    }


    goback() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }

    update(deltaTime: number) {

    }

    async render(map) {
        console.log(4444);
        this.index = 0
        this.index2 = 1
        this.bossNode.setPosition(0, 900, 0)
        this.PvE_default.children[0].setPosition(0, 900, 0)
        this.PvE_default.children[1].setPosition(0, 900, 0)
        let userInfo = map["userInfo"]
        console.log(userInfo, 444)
        this.positionInImage = map["positionInImage"]
        let currentImageNumbers = map["currentImageNumbers"]
        let nextImageNumbers = map["nextImageNumbers"]
        const config = getConfig()
        this.customEventData = map["customEventData"]
        if (this.customEventData == 'bronzetower') {
            this.nameNode.getComponent(Label).string = "青铜试炼塔"
            this.ceng = userInfo.bronze1
            this.cailiao.getChildByName("num").getComponent(Label).string = config.userData.bronze.toString()
            this.cailiao.getComponent(Sprite).spriteFrame =
                await util.bundle.load('image/bagCrtl/17000009/spriteFrame', SpriteFrame)
        } else if (this.customEventData == 'silvertower') {
            this.nameNode.getComponent(Label).string = "白银试炼塔"
            this.ceng = userInfo.silvertower
            this.cailiao.getChildByName("num").getComponent(Label).string = config.userData.darkSteel.toString()
            this.cailiao.getComponent(Sprite).spriteFrame =
                await util.bundle.load('image/bagCrtl/17000010/spriteFrame', SpriteFrame)
        } else if (this.customEventData == 'goldentower') {
            this.nameNode.getComponent(Label).string = "黄金试炼塔"
            this.ceng = userInfo.goldentower
            this.cailiao.getChildByName("num").getComponent(Label).string = config.userData.purpleGold.toString()
            this.cailiao.getComponent(Sprite).spriteFrame =
                await util.bundle.load('image/bagCrtl/17000011/spriteFrame', SpriteFrame)
        }

        const coordinates = [
            [-290, -380], [230, -200], [-90, -50], [-200, 100], [250, 240], [-30, 350], [-290, 480]
        ];
        if (nextImageNumbers.length <= 0) {
            this.bossNode.setPosition(0, 0, 0)
        } else {
            this.PvE_default.children[0].getChildByName("ceng").children.forEach((item, index) => {
                item.getChildByName("num").getComponent(Label).string = "第" + currentImageNumbers[index] + "层"
            })
            this.PvE_default.children[0].setPosition(0, 0, 0)
            this.PvE_default.children[1].getChildByName("ceng").children.forEach((item, index) => {
                item.getChildByName("num").getComponent(Label).string = "第" + nextImageNumbers[index] + "层"
            })
        }

        this.nextImageNumbers = nextImageNumbers
        this.node.active = true
        this.myNode.setPosition(coordinates[this.positionInImage][0], coordinates[this.positionInImage][1], 0)

    }
    async tanSuo() {
        const coordinates = [
            [-290, -380], [230, -200], [-90, -50], [-200, 100], [250, 240], [-30, 350], [-290, 480]
        ];
        if (this.index == 0) {
            this.index2 = 1
        }
        if (this.index == 1) {
            this.index2 = 0
        }
        if (this.positionInImage > 5) {
            this.positionInImage = 0
            tween(this.myNode)
                .to(2, { position: v3(coordinates[0][0], coordinates[0][1]) })
                .start();
            tween(this.PvE_default.children[this.index])
                .to(2, { position: v3(0, -900) })
                .start();
            this.index++
            if (this.index >= 2) {
                this.index = 0
            }
            if (this.nextImageNumbers.length <= 5) {
                tween(this.bossNode)
                    .to(2, { position: v3(0, 0) })
                    .call(async () => {
                        this.bossNode.getChildByName("boss").children.forEach((item) => {
                            item.active = true
                        })
                    })
                    .start();
            } else {
                this.PvE_default.children[this.index].setPosition(0, 900, 0)
                tween(this.PvE_default.children[this.index])
                    .to(2, { position: v3(0, 0) })
                    .call(async () => {
                        this.PvE_default.children[this.index].getChildByName("boss").children.forEach((item) => {
                            item.active = true
                        })
                    })
                    .start();
            }

        } else {
            const config = getConfig()
            const token = getToken()
            const postData = {
                token: token,
                str: this.customEventData,
                userId: config.userData.userId,
            };
            const options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData),
            };
            fetch(config.ServerUrl.url + "battle5", options)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json(); // 解析 JSON 响应
                })
                .then(async data => {
                    if (data.success == '1') {
                        var map = data.data;
                        var user = map['user'];
                        let gonum = map["positionInImage"]
                        let currentImageNumbers = map["currentImageNumbers"]
                        let nextImageNumbers = map["nextImageNumbers"]
                        this.nextImageNumbers = nextImageNumbers
                        this.PvE_default.children[this.index].getChildByName("ceng").children.forEach((item, index) => {
                            item.getChildByName("num").getComponent(Label).string = "第" + currentImageNumbers[index] + "层"
                        })
                        if (nextImageNumbers.length > 0) {
                            this.PvE_default.children[this.index2].getChildByName("ceng").children.forEach((item, index) => {
                                item.getChildByName("num").getComponent(Label).string = "第" + nextImageNumbers[index] + "层"
                            })
                        }
                        const battle = map['battle'];
                        const rewards = map["rewards"];
                        const holAnimationPrefab = await util.bundle.load("prefab/FightMap", Prefab)
                        const holAnimationNode = instantiate(holAnimationPrefab)
                        this.node.parent.addChild(holAnimationNode)
                        await holAnimationNode
                            .getComponent(FightMap)
                            .render(battle.id, rewards, null)
                        find('Canvas').getComponent(HomeCanvas).audioSource.pause()
                        this.node.parent.getChildByName("FightMap").active = true


                        config.userData.gold = user.gold
                        config.userData.bronze = user.bronze
                        config.userData.darkSteel = user.darkSteel
                        config.userData.purpleGold = user.purpleGold
                        config.userData.crystal = user.crystal
                        if (this.customEventData == 'bronzetower') {
                            config.userData.bronze1 = user.bronze1
                            this.cailiao.getChildByName("num").getComponent(Label).string = user.bronze.toString()
                        } else if (this.customEventData == 'silvertower') {
                            config.userData.silvertower = user.silvertower
                            this.cailiao.getChildByName("num").getComponent(Label).string = user.darkSteel.toString()
                        } else if (this.customEventData == 'goldentower') {
                            config.userData.silvertower = user.silvertower
                            this.cailiao.getChildByName("num").getComponent(Label).string = user.purpleGold.toString()
                        }

                        localStorage.setItem("UserConfigData", JSON.stringify(config))

                        // 定义监听回调函数（抽离出来方便移除）
                        const onFightMapActiveChanged = () => {
                            holAnimationNode.off(Node.EventType.ACTIVE_IN_HIERARCHY_CHANGED, onFightMapActiveChanged);

                            // 执行原本在 if (battle.isWin == 0) 里的逻辑
                            if (battle.isWin == 0) {
                                this.positionInImage = gonum
                                if (nextImageNumbers.length > 0) {
                                    this.PvE_default.children[this.index].getChildByName("boss").children[gonum > 0 ? gonum - 1 : gonum].active = false;
                                } else {
                                    this.bossNode.children[gonum > 0 ? gonum - 1 : gonum].active = false;
                                }
                                tween(this.myNode)
                                    .to(1, { position: v3(coordinates[gonum][0], coordinates[gonum][1]) })
                                    .start();
                            }
                        };

                        // 给 FightMap 节点添加激活状态变化监听
                        holAnimationNode.on(Node.EventType.ACTIVE_IN_HIERARCHY_CHANGED, onFightMapActiveChanged, this);

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

    yijiantansuo() {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            str: this.customEventData,
            userId: config.userData.userId,
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "yijiantansuo", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {

                    var map = data.data;
                    var user = map['user'];
                    const rewards = map["rewards"];
                    config.userData.bronze1 = user.bronze1
                    config.userData.gold = user.gold
                    config.userData.bronze = user.bronze
                    config.userData.darkSteel = user.darkSteel
                    config.userData.purpleGold = user.purpleGold
                    config.userData.crystal = user.crystal
                    this.cailiao.getChildByName("num").getComponent(Label).string = user.bronze.toString()
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                    const FightSuccessfab = await util.bundle.load("prefab/FightSuccess", Prefab)
                    const FightSuccess = instantiate(FightSuccessfab)
                    this.node.parent.addChild(FightSuccess)
                    await FightSuccess
                        .getComponent(FightSuccessRewds)
                        .read(rewards, null)
                    this.node.active = false
                    // find('Canvas').getComponent(HomeCanvas).audioSource.pause()
                    this.node.parent.getChildByName("FightSuccess").active = true
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


