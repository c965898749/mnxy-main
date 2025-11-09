import { _decorator, Component, Label, Node, tween, v3, sp, director, Prefab, instantiate, find } from 'cc';
import { L } from 'db://assets/script/common/common/Language';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { FightMap } from '../../../Fight/Canvas/FightMap';
import { HomeCanvas } from '../../HomeCanvas';
const { ccclass, property } = _decorator;

@ccclass('PveCtrl')
export class PveCtrl extends Component {

    @property(Node)
    Tili: Node
    @property(Node)
    Exp: Node
    @property(Node)
    ExpBar: Node
    @property(Node)
    progress: Node
    @property(Node)
    PvE_default: Node
    index: number = 0
    initialized: boolean = false
    timer = 0
    @property(Node)
    bossComing: Node
    @property(Node)
    SpriteSplash: Node
    @property(Node)
    mapTitle: Node
    @property(Node)
    introduce: Node
    @property(Node)
    progressBar: Node
    chapter: string
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
    render(mapId) {
        this.chapter = mapId;
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            id: mapId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "pveDetail", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                //console.log(data); // 处理响应数据
                if (data.success == '1') {
                    var data = data.data
                    const [chapter, tribulation, level] = data.id.split('-');
                    var chapters = ["一", "二", "三", "四", "五", "六"]
                    this.mapTitle.getComponent(Label).string = "第" + chapters[tribulation - 1] + "章·" + data.jieName
                    this.SpriteSplash.getComponent(Label).string = level + "/10" + "  " + data.guanName
                    this.introduce.getComponent(Label).string = data.introduce
                    this.progress.getChildByName("ExpCount").getComponent(Label).string = level + "0%"
                    this.progressBar.setScale(
                        level / 10,
                        1,
                        1
                    )
                    this.Exp.getChildByName("ExpCount").getComponent(Label).string = "还需" + (1000 - config.userData.exp)
                    this.ExpBar.setScale(
                        config.userData.exp / 1000,
                        1,
                        1
                    )
                    this.node.active = true
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );

    }

    refresh() {
        const config = getConfig()
        var LeaveEnergy = this.GetLeaveEnergy();
        this.Tili.getChildByName("TiliCount").getComponent(Label).string = LeaveEnergy + "/720";
        this.Tili.getChildByName("user_tl").getChildByName("Bar").setScale(
            LeaveEnergy / 720,
            1,
            1
        )
        this.Exp.getChildByName("ExpCount").getComponent(Label).string = "还需" + (1000 - config.userData.exp);
        this.Exp.getChildByName("user_tl").getChildByName("Bar").setScale(
            config.userData.exp / 1000,
            1,
            1
        )
    }
    update(deltaTime: number) {
        if (this.timer >= 50) {
            this.refresh();
            this.timer = 0;
        }
        else {
            this.timer++;
        }
    }
    async goBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("PveCtrl").active = false
    }

    async tanSuo() {
        let [chapter, tribulation, level] = this.chapter.split('-');
        if (Number(level) > 10) {
            return await util.message.prompt({ message: "关卡已探索完" })
        }

        const config = getConfig()
        const token = getToken()
        var LeaveEnergy = this.GetLeaveEnergy();
        if (LeaveEnergy - 2 < 0) {
            return await util.message.prompt({ message: "体力不足" })
        }
        this.SetLeaveEnergy(LeaveEnergy - 2)

        tween(this.PvE_default.children[this.index])
            .to(2, { position: v3(-640, 0) })
            .start();
        this.index++
        if (this.index >= 2) {
            this.index = 0
        }
        this.PvE_default.children[this.index].setPosition(640, 0, 0)
        tween(this.PvE_default.children[this.index])
            .to(2, { position: v3(0, 0) })
            .call(async () => {
                AudioMgr.inst.playOneShot("sound/other/daojian");
                let bossComing = this.bossComing.getComponent(sp.Skeleton)
                bossComing.node.active = true
                bossComing.setAnimation(0, "animation", false)
                bossComing.setCompleteListener(() => {
                    bossComing.node.active = false
                    const postData = {
                        token: token,
                        str: chapter + "-" + tribulation + "-" + level
                    };
                    const options = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(postData),
                    };
                    fetch(config.ServerUrl.url + "battle2", options)
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
                                const pveDetail = map['pveDetail'];
                                const rewards = map["rewards"];
                                const levelUp = map["levelUp"]
                                if (battle.isWin == 0) {
                                    const [chapter, tribulation, level] = pveDetail.id.split('-');
                                    var chapters = ["一", "二", "三", "四", "五", "六"]
                                    this.mapTitle.getComponent(Label).string = "第" + chapters[tribulation - 1] + "章·" + pveDetail.jieName
                                    this.SpriteSplash.getComponent(Label).string = level + "/10" + "  " + pveDetail.guanName
                                    this.introduce.getComponent(Label).string = pveDetail.introduce
                                    this.progress.getChildByName("ExpCount").getComponent(Label).string = level + "0%"
                                    this.progressBar.setScale(
                                        level / 10,
                                        1,
                                        1
                                    )
                                }
                                config.userData.exp = user.exp
                                config.userData.lv = user.lv
                                config.userData.chapter = user.chapter
                                this.Exp.getChildByName("ExpCount").getComponent(Label).string = "还需" + (1000 - config.userData.exp)
                                this.ExpBar.setScale(
                                    config.userData.exp / 1000,
                                    1,
                                    1
                                )
                                this.chapter = battle.chapter
                                localStorage.setItem("UserConfigData", JSON.stringify(config))
                                const holAnimationPrefab = await util.bundle.load("prefab/FightMap", Prefab)
                                const holAnimationNode = instantiate(holAnimationPrefab)
                                this.node.parent.addChild(holAnimationNode)
                                await holAnimationNode
                                    .getComponent(FightMap)
                                    .render(battle.id, rewards, levelUp)
                                find('Canvas').getComponent(HomeCanvas).audioSource.pause()
                                this.node.parent.getChildByName("FightMap").active = true

                            } else {
                                const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                            }
                        })
                        .catch(error => {
                            console.error('There was a problem with the fetch operation:', error);
                        }
                        );

                })
            })
            .start();

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
}


