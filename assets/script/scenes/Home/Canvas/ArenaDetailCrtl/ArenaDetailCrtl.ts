import { _decorator, Component, find, instantiate, Label, Node, Prefab, RichText, Sprite, SpriteFrame, tween, v3 } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { ArenaItemCtrl } from './ArenaItemCtrl';
import { FightMap } from '../../../Fight/Canvas/FightMap';
import { HomeCanvas } from '../../HomeCanvas';
import { ArenaRankingCrtl } from '../ArenaRankingCrtl/ArenaRankingCrtl';
import { ArenaMessageCrtl } from '../ArenaMessageCrtl/ArenaMessageCrtl';
const { ccclass, property } = _decorator;

@ccclass('ArenaDetailCrtl')
export class ArenaDetailCrtl extends Component {
    @property(Node)
    chouKa: Node
    @property(Node)
    xianzhi: Node
    @property(Node)
    Item: Node
    @property(Node)
    Huoli: Node
    @property(Node)
    Tili: Node
    @property(Node)
    TiliCount
    @property(Node)
    arenaScore
    @property(Node)
    winCount
    @property(Node)
    RichText
    @property(Node)
    header
    @property(Node)
    ranking
    ArenaId: number
    tempId = 0
    touchId = null
    lastTouchId = null
    arr = []
    //移动速度
    moveSpeed = 0.15
    spacingY = 10
    start() {

    }

    update(deltaTime: number) {

    }
    goback() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
        this.node.parent.getChildByName("ArenaCrtl").active = true
    }

    async render(arenaId) {
        const config = getConfig()
        this.ArenaId = arenaId;
        this.chouKa.getComponent(Sprite).spriteFrame = await util.bundle.load("image/arenaCtrl/arena" + arenaId + "/spriteFrame", SpriteFrame)
        if (arenaId == '1') {
            this.xianzhi.getComponent(Label).string = "战队能力限制:最高3星卡x5"
        } else if (arenaId == '2') {
            this.xianzhi.getComponent(Label).string = "战队能力限制:最高4星卡x5"
        } else {
            this.xianzhi.getComponent(Label).string = "战队能力限制:最高5星卡x5"
        }
        // 渲染队伍gameImg
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId,
            finalLevel: arenaId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "arenaTem", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                //console.log(data); // 处理响应数据
                if (data.success == '1') {
                    this.arr = []
                    this.tempId = 0
                    let map = data.data
                    const create = map['gameArenaBattlecharacters'];
                    const userInfo = map['userInfo'];
                    const gameArenaSignup = map['gameArenaSignup'];
                    const gameArenaBattle = map['gameArenaBattle'];
                    const ranking = map['ranking'];
                    var LeaveEnergy = this.GetLeaveHuoliEnergy();
                    this.Huoli.getChildByName("HuoliCount").getComponent(Label).string = LeaveEnergy + "/720";
                    this.TiliCount.getComponent(Label).string = "本界还能战斗 " + userInfo.arenaCount + " 次"
                    this.winCount.getComponent(Label).string = gameArenaSignup.winNum + " 场"
                    this.ranking.getComponent(Label).string = ranking
                    this.Huoli.getChildByName("user_tl").getChildByName("Bar").setScale(
                        LeaveEnergy / 720,
                        1,
                        1
                    )
                    this.Tili.getChildByName("TiliCount").getComponent(Label).string = userInfo.arenaCount + "/800";
                    this.Tili.getChildByName("user_tl").getChildByName("Bar").setScale(
                        userInfo.arenaCount / 800,
                        1,
                        1
                    )
                    this.arenaScore.getComponent(Label).string = gameArenaSignup.arenaScore
                    if (gameArenaBattle) {
                        let content = `<color=#E36F1A>${gameArenaBattle.timeStr}  <color=#EEE365>${gameArenaBattle.userName}</color>在<color=#EEE365>擂台赛</color>攻击了<color=#EEE365>${gameArenaBattle.toUserName}</color>，激烈战斗后最终<color=#00BCD4>${gameArenaBattle.isWin == 0 ? '获胜' : '落败'}</color>。</color>获得5460金币,${gameArenaBattle.isWin == 0 ? '1' : '0'}积分，`
                        this.RichText.getComponent(RichText).string = content
                        this.header.getComponent(Sprite).spriteFrame =
                            await util.bundle.load(gameArenaBattle.img, SpriteFrame)
                    }
                    this.Item.children.forEach(element => {
                        element.children[0].getComponent(Sprite).spriteFrame = null;
                        let node: Node = element
                        // node.opacity = 0;
                        // node.scale = 1

                        let pos = v3(0, 0)
                        if (this.tempId == 0) {
                            pos = v3(-240, 0)
                        } else if (this.tempId == 1) {
                            pos = v3(-120, 0)
                        } else if (this.tempId == 2) {
                            pos = v3(0, 0)
                        } else if (this.tempId == 3) {
                            pos = v3(120, 0)
                        } else if (this.tempId == 4) {
                            pos = v3(240, 0)
                        } else if (this.tempId == 5) {
                            pos = v3(240, -160)
                        } else if (this.tempId == 6) {
                            pos = v3(-240, -160)
                        }
                        node.position = pos
                        let id = this.tempId
                        var aa = create.filter(x => x.goIntoNum - 1 == id)
                        let data = {
                            name: aa && aa.length > 0 ? aa[0].id : null,
                            id: id,
                            index: id,
                            node: node,
                            originPos: pos,
                            checkPos: pos,
                        }
                        this.arr.push(data);
                        node.getComponent(ArenaItemCtrl).initData(data, this)
                        this.tempId++

                    })
                    for (let i = 0; i < create.length; i++) {
                        var goIntoNum = create[i].goIntoNum
                        this.Item.children[goIntoNum - 1].children[0].getComponent(Sprite).spriteFrame =
                            await util.bundle.load(`game/texture/frames/hero/Header/${create[i].id}/spriteFrame`, SpriteFrame)
                    }
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

    upDateIndexByX() {
        let count = this.arr.length;
        let source = this.arr.filter(x => x.id == this.touchId)[0]
        let flag = true;
        for (let i = 0; i < count; i++) {
            let target = this.arr[i]
            if (target.id == this.touchId) {
                continue
            }
            if (this.distanceTo(source.checkPos, target.checkPos) < 40) {
                flag = false
                let name = source.name
                source.name = target.name
                target.name = name
                target.originPos = source.originPos
                source.originPos = target.checkPos
                target.checkPos = target.originPos
                source.checkPos = source.originPos
                tween(source.node)
                    .to(this.moveSpeed, { position: source.originPos })
                    .start()
                tween(target.node)
                    .to(this.moveSpeed, { position: target.originPos })
                    .start()
            }
        }
        if (flag) {
            tween(source.node)
                .to(this.moveSpeed, { position: source.originPos })
                .start()
        }
        // 更新战队
        var str = [];
        for (var i = 0; i < this.arr.length; i++) {
            if (this.arr[i].name) {
                str.push(this.arr[i].name)
            } else {
                str.push("@")
            }
        }
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            str: str.join(','),
            finalLevel: this.ArenaId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/arenaItemUpdate", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                console.log(data); // 处理响应数据
                if (data.success == '1') {
                    var userInfo = data.data;
                    config.userData.characters = userInfo.characterList
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


    async openMessage() {
        AudioMgr.inst.playOneShot("sound/other/click");
        await this.node.parent.getChildByName("ArenaMessageCrtl")
            .getComponent(ArenaMessageCrtl)
            .initData(this.ArenaId)
    }
    /**
  * 计算当前坐标与目标坐标的欧几里得直线距离
  * @param target 目标坐标
  * @returns 两点间实时距离
  */
    public distanceTo(source, target): number {
        const dx = source.x - target.x;
        const dy = source.y - target.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    async tiaozhan() {
        const config = getConfig()
        const token = getToken()
        var LeaveHuoliEnergy = this.GetLeaveHuoliEnergy();
        if (LeaveHuoliEnergy - 30 < 0) {
            return await util.message.prompt({ message: "活力不足" })
        }
        const postData = {
            token: token,
            userId: config.userData.userId,
            finalLevel: this.ArenaId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "battle4", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                //console.log(data); // 处理响应数据
                if (data.success == '1') {
                    let map = data.data
                    this.SetLeaveHuoliEnergy(LeaveHuoliEnergy - 30)
                    const userInfo = map['userInfo'];
                    const gameArenaSignup = map['gameArenaSignup'];
                    const battle = map['battle'];
                    const gameArenaBattle = map['gameArenaBattle'];
                    const ranking = map['ranking'];
                    const holAnimationPrefab = await util.bundle.load("prefab/FightMap", Prefab)
                    const holAnimationNode = instantiate(holAnimationPrefab)
                    config.userData.gold = userInfo.gold
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                    this.node.parent.addChild(holAnimationNode)
                    var LeaveEnergy = this.GetLeaveHuoliEnergy();
                    this.Huoli.getChildByName("HuoliCount").getComponent(Label).string = LeaveEnergy + "/720";
                    this.TiliCount.getComponent(Label).string = "本界还能战斗 " + userInfo.arenaCount + " 次"
                    this.winCount.getComponent(Label).string = gameArenaSignup.winNum + " 场"
                    this.ranking.getComponent(Label).string = ranking
                    this.Huoli.getChildByName("user_tl").getChildByName("Bar").setScale(
                        LeaveEnergy / 720,
                        1,
                        1
                    )
                    this.Tili.getChildByName("TiliCount").getComponent(Label).string = userInfo.arenaCount + "/800";
                    this.Tili.getChildByName("user_tl").getChildByName("Bar").setScale(
                        userInfo.arenaCount / 800,
                        1,
                        1
                    )
                    this.arenaScore.getComponent(Label).string = gameArenaSignup.arenaScore
                    // this.RichText.getComponent(RichText).string = null
                    if (gameArenaBattle) {
                        let content = `<color=#E36F1A>${gameArenaBattle.timeStr}  <color=#EEE365>${gameArenaBattle.userName}</color>在<color=#EEE365>擂台赛</color>攻击了<color=#EEE365>${gameArenaBattle.toUserName}</color>，激烈战斗后最终<color=#00BCD4>${gameArenaBattle.isWin == 0 ? '获胜' : '落败'}</color>。</color>获得5460金币,${gameArenaBattle.isWin == 0 ? '1' : '0'}积分，`
                        this.RichText.getComponent(RichText).string = content
                        this.header.getComponent(Sprite).spriteFrame =
                            await util.bundle.load(gameArenaBattle.img, SpriteFrame)
                    }
                    await holAnimationNode
                        .getComponent(FightMap)
                        .render(battle.id, null, null)
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
    }
    GetLeaveHuoliEnergy() {
        var key = 'Leave_EnergyHuoliNumber2';
        var str = localStorage.getItem(key);
        if (str) {
            return parseInt(str);
        }
        return 0;
    }
    SetLeaveHuoliEnergy(i) {
        var key = 'Leave_EnergyHuoliNumber2';
        var value = i + "";
        localStorage.setItem(key, value);
    }

    openRanking() {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId,
            finalLevel: this.ArenaId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "arenaRanking100", options)
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
                    await this.node.parent.getChildByName("ArenaRankingCrtl")
                        .getComponent(ArenaRankingCrtl)
                        .render(data, this.arenaScore.getComponent(Label).string)

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


