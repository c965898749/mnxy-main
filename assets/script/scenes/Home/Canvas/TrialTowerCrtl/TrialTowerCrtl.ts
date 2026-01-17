import { _decorator, Component, find, instantiate, Label, Node, Prefab, tween, v3 } from 'cc';
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
    PvE_default: Node
    index: number = 0
    index2: number = 0
    ceng: number = 2
    myceng: number = 1
    @property(Node)
    myNode: Node
    @property(Node)
    bossNode: Node
    initialized = false;
    customEventData: string = ''
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

    render(data) {
        const config = getConfig()
        this.customEventData = data.customEventData
        this.ceng = data.bronze1
        this.myceng = data.bronze1
        this.cailiao.getChildByName("num").getComponent(Label).string = config.userData.bronze.toString()
        const coordinates = [
            [-290, -380], [230, -200], [-90, -50], [-200, 100], [250, 240], [-30, 350], [-290, 480]
        ];
        const totalCount = coordinates.length;
        if (!Number.isInteger(this.ceng) || this.ceng < 1) {
            throw new Error('传入的层数必须是大于等于1的正整数！');
        }
        const index = (this.ceng - 1) % totalCount;

        this.PvE_default.children[0].getChildByName("ceng").children.forEach((item) => {
            item.getChildByName("num").getComponent(Label).string = "第" + this.ceng + "层"
            this.ceng++
        })
        this.PvE_default.children[1].getChildByName("ceng").children.forEach((item) => {
            item.getChildByName("num").getComponent(Label).string = "第" + this.ceng + "层"
            this.ceng++
        })
        this.node.active = true
        this.myNode.setPosition(this.points[index][0], this.points[index][1], 0)
        // for (let i = 0; i < index; i++) {

        // }

    }
    async tanSuo() {
        this.index2++
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            str: this.customEventData,
            finalLevel: this.myceng,
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
                    this.myceng = user.bronze1
                    const battle = map['battle'];
                    const rewards = map["rewards"];
                    if (this.myceng >= 99) {
                        AudioMgr.inst.playOneShot("sound/other/haojiao");
                        tween(this.myNode)
                            .to(1, { position: v3(0, 100) })
                            .call(async () => {
                                const holAnimationPrefab = await util.bundle.load("prefab/FightMap", Prefab)
                                const holAnimationNode = instantiate(holAnimationPrefab)
                                this.node.parent.addChild(holAnimationNode)
                                await holAnimationNode
                                    .getComponent(FightMap)
                                    .render(battle.id, rewards, null)
                                find('Canvas').getComponent(HomeCanvas).audioSource.pause()
                                this.node.parent.getChildByName("FightMap").active = true
                                if (battle.isWin == 0) {
                                    this.bossNode.getChildByName("boss").children[1].active = false
                                }
                            })
                            .start();
                    } else if (this.myceng >= 98 && this.myceng < 99) {
                        tween(this.myNode)
                            .to(2, { position: v3(-290, -380) })
                            .start();
                        tween(this.PvE_default.children[this.index])
                            .to(2, { position: v3(0, -900) })
                            .start();
                        tween(this.bossNode)
                            .to(2, { position: v3(0, 0) })
                            .call(async () => {
                                tween(this.myNode)
                                    .to(1, { position: v3(-90, -290) })
                                    .call(async () => {
                                        const holAnimationPrefab = await util.bundle.load("prefab/FightMap", Prefab)
                                        const holAnimationNode = instantiate(holAnimationPrefab)
                                        this.node.parent.addChild(holAnimationNode)
                                        await holAnimationNode
                                            .getComponent(FightMap)
                                            .render(battle.id, rewards, null)
                                        find('Canvas').getComponent(HomeCanvas).audioSource.pause()
                                        this.node.parent.getChildByName("FightMap").active = true
                                        if (battle.isWin == 0) {
                                            this.bossNode.getChildByName("boss").children[0].active = false
                                        }
                                    })
                                    .start();
                            })
                            .start();
                    } else if (this.index2 <= 6) {
                        if (battle.isWin == 0) {
                            tween(this.myNode)
                                .to(1, { position: v3(this.points[this.index2][0], this.points[this.index2][1]) })
                                .call(async () => {
                                    const holAnimationPrefab = await util.bundle.load("prefab/FightMap", Prefab)
                                    const holAnimationNode = instantiate(holAnimationPrefab)
                                    this.node.parent.addChild(holAnimationNode)
                                    AudioMgr.inst.playOneShot("sound/other/daojian");
                                    await holAnimationNode
                                        .getComponent(FightMap)
                                        .render(battle.id, rewards, null)
                                    find('Canvas').getComponent(HomeCanvas).audioSource.pause()
                                    this.node.parent.getChildByName("FightMap").active = true
                                    if (battle.isWin == 0) {
                                        this.PvE_default.children[this.index].getChildByName("boss").children[this.index2 - 1].active = false;
                                    }
                                })
                                .start();
                        } else {
                            const holAnimationPrefab = await util.bundle.load("prefab/FightMap", Prefab)
                            const holAnimationNode = instantiate(holAnimationPrefab)
                            this.node.parent.addChild(holAnimationNode)
                            await holAnimationNode
                                .getComponent(FightMap)
                                .render(battle.id, rewards, null)
                            find('Canvas').getComponent(HomeCanvas).audioSource.pause()
                            this.node.parent.getChildByName("FightMap").active = true
                        }

                    } else {
                        this.index2 = 0
                        tween(this.myNode)
                            .to(2, { position: v3(this.points[this.index2][0], this.points[this.index2][1]) })
                            .start();
                        tween(this.PvE_default.children[this.index])
                            .to(2, { position: v3(0, -900) })
                            .start();
                        this.index++
                        if (this.index >= 2) {
                            this.index = 0
                        }
                        this.PvE_default.children[this.index].getChildByName("ceng").children.forEach((item) => {
                            item.getChildByName("num").getComponent(Label).string = "第" + this.ceng + "层"
                            this.ceng++
                        })
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
                    config.userData.bronze1 = user.bronze1
                    this.myceng = battle.chapter
                    if (battle.isWin != 0) {
                        this.index2--;
                    }
                    config.userData.gold = user.gold
                    config.userData.bronze = user.bronze
                    config.userData.darkSteel = user.darkSteel
                    config.userData.purpleGold = user.purpleGold
                    config.userData.crystal = user.crystal
                    this.cailiao.getChildByName("num").getComponent(Label).string = user.bronze.toString()
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
                    this.myceng = user.bronze1
                    const rewards = map["rewards"];
                    config.userData.bronze1 = user.bronze1
                    config.userData.gold = user.gold
                    config.userData.bronze = user.bronze
                    config.userData.darkSteel = user.darkSteel
                    config.userData.purpleGold = user.purpleGold
                    config.userData.crystal = user.crystal
                    this.cailiao.getChildByName("num").getComponent(Label).string = user.bronze.toString()
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                    // await this.node.parent.getChildByName("FightSuccess")
                    //     .getComponent(FightSuccess)
                    //     .read(rewards, null)
                    // this.node.getChildByName("FightSuccess").active = true
                    const FightSuccessfab = await util.bundle.load("prefab/FightSuccess", Prefab)
                    const FightSuccess= instantiate(FightSuccessfab)
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


