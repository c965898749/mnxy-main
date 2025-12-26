import { _decorator, Component, find, instantiate, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { FightMap } from '../../../Fight/Canvas/FightMap';
import { HomeCanvas } from '../../HomeCanvas';
const { ccclass, property } = _decorator;

@ccclass('DiamondDungeonCtrl')
export class DiamondDungeonCtrl extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
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

    update(deltaTime: number) {

    }

    async refresh() {
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId,
            str: "DiamondDungeonCtrl"
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "getUserActivityDetail", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                //console.log(data); // 处理响应数据
                if (data.success == '1') {
                    var data = data.data;
                    const nodePool = util.resource.getNodePool(
                        await util.bundle.load("prefab/SpriteSplash", Prefab)
                    )
                    const childrens = [...this.ContentNode.children]
                    for (let i = 0; i < childrens.length; i++) {
                        const node = childrens[i];
                        node.getChildByName("join").off("click")
                        node.getChildByName("boss").children.forEach(child => child.getChildByName("Node").active = false)
                        nodePool.put(node)
                    }
                    const difficultyLevel = new Map([
                        ['LOW', '初级'],
                        ['MIDDLE', '精英'],
                        ['HIGH', '神话'],
                    ]);
                    for (let i = 0; i < data.details.length; i++) {
                        let detail = data.details[i]
                        let item = nodePool.get()
                        item.getChildByName("SpriteSplash").getChildByName("Label").getComponent(Label).string = detail.bossName + "(" + difficultyLevel.get(detail.difficultyLevel) + ")"
                        let rewardList = detail.rewardList
                        for (let j = 0; j < rewardList.length; j++) {
                            item.getChildByName("boss").children[j].getChildByName("Node").active = true
                            if ("1" == rewardList[j].rewardType) {
                                //钻石
                                item.getChildByName("boss").children[j].getChildByName("Node").getComponent(Sprite).spriteFrame =
                                    await util.bundle.load('image/ui/icon_08/spriteFrame', SpriteFrame)
                            } else if ("2" == rewardList[j].rewardType) {
                                //金边
                                item.getChildByName("boss").children[j].getChildByName("Node").getComponent(Sprite).spriteFrame =
                                    await util.bundle.load('image/ui/icon_22/spriteFrame', SpriteFrame)
                            } else if ("3" == rewardList[j].rewardType) {
                                //魂魄
                                item.getChildByName("boss").children[j].getChildByName("Node").getComponent(Sprite).spriteFrame =
                                    await util.bundle.load('image/ui/qiu/spriteFrame', SpriteFrame)
                            } else if ("4" == rewardList[j].rewardType) {
                                //护法、装备
                                item.getChildByName("boss").children[j].getChildByName("Node").getComponent(Sprite).spriteFrame =
                                    await util.bundle.load('game/texture/frames/hero/Header/' + rewardList[j].itemId + '/spriteFrame', SpriteFrame)
                            }

                        }
                        let records = detail.records
                        if (records && records.length > 0) {
                            item.getChildByName("complete").active = true
                            item.getChildByName("join").active = false
                        } else {
                            item.getChildByName("join").active = true
                            item.getChildByName("complete").active = false
                            item.getChildByName("join").on("click", () => {
                                this.pk(detail, item)
                            })
                        }
                        this.ContentNode.addChild(item)
                        continue
                    }
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );

    }

    //体力
    GetLeaveEnergy() {
        var key = 'Leave_EnergyNumber2';
        var str = localStorage.getItem(key);
        if (str) {
            return parseInt(str);
        }
        return 10;
    }
    SetLeaveEnergy(i) {
        var key = 'Leave_EnergyNumber2';
        var value = i + "";
        localStorage.setItem(key, value);
    }
    async pk(detail, item) {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        const token = getToken()
        var LeaveEnergy = this.GetLeaveEnergy();
        if (LeaveEnergy - 2 < 0) {
            return await util.message.prompt({ message: "体力不足" })
        }
        this.SetLeaveEnergy(LeaveEnergy - 2)
        const postData = {
            token: token,
            userId: config.userData.userId,
            str: detail.detailCode
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "participate2", options)
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
                    const battle = map['battle'];
                    // const pveDetail = map['pveDetail'];
                    const rewards = map["rewards"];
                    const levelUp = map["levelUp"]
                    config.userData.exp = user.exp
                    config.userData.lv = user.lv
                    if (battle.isWin == 0) {
                        config.userData.gold = user.gold
                        config.userData.characters = user.characterList
                        config.userData.diamond = user.diamond
                    }
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                    const holAnimationPrefab = await util.bundle.load("prefab/FightMap", Prefab)
                    const holAnimationNode = instantiate(holAnimationPrefab)
                    this.node.parent.addChild(holAnimationNode)
                    await holAnimationNode
                        .getComponent(FightMap)
                        .render(battle.id, rewards, levelUp)
                    find('Canvas').getComponent(HomeCanvas).audioSource.pause()
                    this.node.parent.getChildByName("FightMap").active = true
                    if (battle.isWin == 0) {
                        item.getChildByName("complete").active = true
                        item.getChildByName("join").active = false
                    }
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );

    }
    gouback() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }
}


