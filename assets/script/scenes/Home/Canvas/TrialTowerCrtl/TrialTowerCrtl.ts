import { _decorator, Component, find, instantiate, Label, Node, Prefab, tween, v3 } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { FightMap } from '../../../Fight/Canvas/FightMap';
import { HomeCanvas } from '../../HomeCanvas';
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
        this.ceng = config.userData.bronze1
        this.myceng = config.userData.bronze1
        this.PvE_default.children[0].getChildByName("ceng").children.forEach((item) => {
            item.getChildByName("num").getComponent(Label).string = "第" + this.ceng + "层"
            this.ceng++
        })
        this.PvE_default.children[1].getChildByName("ceng").children.forEach((item) => {
            item.getChildByName("num").getComponent(Label).string = "第" + this.ceng + "层"
            this.ceng++
        })
    }


    goback() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }

    update(deltaTime: number) {

    }
    async tanSuo() {
        this.index2++
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            str: this.myceng.toString(),
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
                    // if (battle.isWin == 0) {
                    //     this.BossList.children.forEach((bossNode) => {
                    //         bossNode.getChildByName("Node").getComponent(Sprite).spriteFrame = null;
                    //     })
                    //     for (let i = 0; i < pveDetail["pveBossDetails"].length; i++) {
                    //         let pveBossDetails = pveDetail["pveBossDetails"][i];
                    //         let bossNode = this.BossList.children[i];
                    //         bossNode.getChildByName("Node").getComponent(Sprite).spriteFrame =
                    //             await util.bundle.load('game/texture/frames/hero/Header/' + pveBossDetails.bossId + '/spriteFrame', SpriteFrame)
                    //     }
                    //     const [chapter, tribulation, level] = pveDetail.id.split('-');
                    //     var chapters = ["一", "二", "三", "四", "五", "六"]
                    //     this.mapTitle.getComponent(Label).string = "第" + chapters[tribulation - 1] + "章·" + pveDetail.jieName
                    //     this.SpriteSplash.getComponent(Label).string = level + "/10" + "  " + pveDetail.guanName
                    //     this.introduce.getComponent(Label).string = pveDetail.introduce
                    //     this.progress.getChildByName("ExpCount").getComponent(Label).string = level + "0%"
                    //     this.progressBar.setScale(
                    //         level / 10,
                    //         1,
                    //         1
                    //     )
                    //     config.userData.characters = user.characterList
                    // }
                    // config.userData.exp = user.exp
                    // config.userData.diamond = user.diamond
                    // config.userData.lv = user.lv
                    // config.userData.chapter = user.chapter
                    // this.Exp.getChildByName("ExpCount").getComponent(Label).string = "还需" + (1000 - config.userData.exp)
                    // this.ExpBar.setScale(
                    //     config.userData.exp / 1000,
                    //     1,
                    //     1
                    // )
                    // this.chapter = battle.chapter
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
}


