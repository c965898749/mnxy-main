import { _decorator, Component, find, instantiate, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { util } from 'db://assets/script/util/util';
import { FightMap } from '../../../Fight/Canvas/FightMap';
import { HomeCanvas } from '../../HomeCanvas';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('SevenLuminariesCtrl')
export class SevenLuminariesCtrl extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    @property(Node)
    title: Node
    @property(Node)
    mapTitle: Node
    luminaryMap = [
        '太阴星君',  // 1: 星期一（太阴/月亮）
        '荧惑星君',          // 2: 星期二
        '水星真君',          // 3: 星期三
        '木星真君',          // 4: 星期四
        '土星真君',           // 6: 星期六
        '金星真君',          // 5: 星期五
        '太阳星君',  // 0: 星期日（太阳）
    ];
    level = ["下仙", "中仙", "大仙"]
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
    async refresh() {
        const today = new Date();
        let dayNumber = today.getDay();
        if (dayNumber == 0) {
            dayNumber = 7
        }
        this.title.children.forEach(x => x.active = false)
        this.title.children[dayNumber - 1].active = true
        this.mapTitle.getComponent(Label).string = this.luminaryMap[dayNumber - 1]
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId,
            str: "SevenLuminariesCtrl"
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
                        nodePool.put(node)
                    }
                    for (let i = 0; i < data.details.length; i++) {
                        let detail = data.details[i]
                        let item = nodePool.get()
                        item.getChildByName("SpriteSplash").getChildByName("Label").getComponent(Label).string = this.luminaryMap[dayNumber - 1] + "(" + this.level[i] + ")"
                        let rewardList = detail.rewardList
                        for (let j = 0; j < rewardList.length; j++) {
                            item.getChildByName("boss").children[j].getChildByName("Node").active = true
                            item.getChildByName("boss").children[j].getChildByName("Node").getComponent(Sprite).spriteFrame =
                                await util.bundle.load("game/texture/frames/hero/Header/" + rewardList[j].itemId + "/spriteFrame", SpriteFrame)
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
        fetch(config.ServerUrl.url + "participate", options)
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
    update(deltaTime: number) {

    }
    gouback() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }

}


