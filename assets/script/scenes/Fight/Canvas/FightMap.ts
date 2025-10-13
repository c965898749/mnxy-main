import { _decorator, Component, director, instantiate, math, Node, NodeEventType, Prefab, Sprite, SpriteFrame } from 'cc';
import { util } from '../../../util/util';
import { HolCharacter } from '../../../prefab/HolCharacter';
import { CharacterStateCreate } from '../../../game/fight/character/CharacterState';
import { HolNumber } from '../../../prefab/HolNumber';
import { RoundState } from '../../../game/fight/RoundState';
import { common } from '../../../common/common/common';
import { HolPreLoad } from '../../../prefab/HolPreLoad';
import { getConfig, getToken } from '../../../common/config/config';
const { ccclass, property } = _decorator;

@ccclass('FightMap')
export class FightMap extends Component {

    @property(Node)
    L1: Node
    @property(Node)
    L2: Node
    @property(Node)
    L3: Node
    @property(Node)
    L4: Node
    @property(Node)
    L5: Node
    @property(Node)
    R1: Node
    @property(Node)
    R2: Node
    @property(Node)
    R3: Node
    @property(Node)
    R4: Node
    @property(Node)
    R5: Node
    // 当前回合数
    currentRound: number = 1

    // 是否播放动画
    isPlayAnimation: boolean = true

    // 所有回合任务
    allRoundQueue: Map<number, Function[]> = new Map

    // // 所有存活的角色
    allLiveCharacter: HolCharacter[] = []
    leftCharacter: CharacterStateCreate[] = []
    rightCharacter: CharacterStateCreate[] = []
    // // 所有死亡的角色
    allDeadCharacter: HolCharacter[] = []

    // 行动等待队列，若队列有未完成任务则等待完成后进入下一个角色行动
    actionAwaitQueue: Promise<any>[] = []

    //是否结束
    isOverFight: boolean = true

    protected async start() {
        // HolPreLoad 预加载进度条
        const holPreLoad = this.node.parent.getChildByName("HolPreLoad").getComponent(HolPreLoad)
        holPreLoad.setTips([
            "提示\n不同阵营之间相互克制，巧用阵营可以出奇制胜",
        ])
        holPreLoad.setProcess(20)
        // 随机地图
        const images = await util.bundle.loadDir("image/fightMap", SpriteFrame)
        this.node.getComponent(Sprite).spriteFrame = images[Math.floor(math.randomRange(0, images.length))]
        holPreLoad.setProcess(50)
        // 当前进度
        let process = 50
        const config = getConfig()
        const token = getToken()
        const id = localStorage.getItem("fightId")
        const postData = {
            token: token,
            id: id
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "playBattle", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                //console.log(data); // 处理响应数据
                if (data.success == '1') {
                    var map = data.data;
                    const leftCharacter = map['leftCharacter'];
                    this.leftCharacter = leftCharacter
                    const rightCharacter = map['rightCharacter'];
                    this.rightCharacter = rightCharacter
                    var L1 = leftCharacter.filter(x => x.goIntoNum == 1)
                    for (var i = 0; i < leftCharacter.length; i++) {
                        if (1 == leftCharacter[i].goIntoNum) {
                            this.L1.getChildByName("header").getComponent(Sprite).spriteFrame =
                                await util.bundle.load(`game/texture/frames/hero/Header/${leftCharacter[i].id}/spriteFrame`, SpriteFrame)
                        }
                        if (2 == leftCharacter[i].goIntoNum) {
                            this.L2.getChildByName("header").getComponent(Sprite).spriteFrame =
                                await util.bundle.load(`game/texture/frames/hero/Header/${leftCharacter[i].id}/spriteFrame`, SpriteFrame)
                        }
                        if (3 == leftCharacter[i].goIntoNum) {
                            this.L3.getChildByName("header").getComponent(Sprite).spriteFrame =
                                await util.bundle.load(`game/texture/frames/hero/Header/${leftCharacter[i].id}/spriteFrame`, SpriteFrame)
                        }
                        if (4 == leftCharacter[i].goIntoNum) {
                            this.L4.getChildByName("header").getComponent(Sprite).spriteFrame =
                                await util.bundle.load(`game/texture/frames/hero/Header/${leftCharacter[i].id}/spriteFrame`, SpriteFrame)
                        }
                        if (5 == leftCharacter[i].goIntoNum) {
                            this.L5.getChildByName("header").getComponent(Sprite).spriteFrame =
                                await util.bundle.load(`game/texture/frames/hero/Header/${leftCharacter[i].id}/spriteFrame`, SpriteFrame)
                        }
                    }
                    for (var i = 0; i < rightCharacter.length; i++) {
                        if (1 == rightCharacter[i].goIntoNum) {
                            this.R1.getChildByName("header").getComponent(Sprite).spriteFrame =
                                await util.bundle.load(`game/texture/frames/hero/Header/${rightCharacter[i].id}/spriteFrame`, SpriteFrame)
                        }
                        if (2 == rightCharacter[i].goIntoNum) {
                            this.R2.getChildByName("header").getComponent(Sprite).spriteFrame =
                                await util.bundle.load(`game/texture/frames/hero/Header/${rightCharacter[i].id}/spriteFrame`, SpriteFrame)
                        }
                        if (3 == rightCharacter[i].goIntoNum) {
                            this.R3.getChildByName("header").getComponent(Sprite).spriteFrame =
                                await util.bundle.load(`game/texture/frames/hero/Header/${rightCharacter[i].id}/spriteFrame`, SpriteFrame)
                        }
                        if (4 == rightCharacter[i].goIntoNum) {
                            this.R4.getChildByName("header").getComponent(Sprite).spriteFrame =
                                await util.bundle.load(`game/texture/frames/hero/Header/${rightCharacter[i].id}/spriteFrame`, SpriteFrame)
                        }
                        if (5 == rightCharacter[i].goIntoNum) {
                            this.R5.getChildByName("header").getComponent(Sprite).spriteFrame =
                                await util.bundle.load(`game/texture/frames/hero/Header/${rightCharacter[i].id}/spriteFrame`, SpriteFrame)
                        }
                    }
                } else {
                    const close = util.message.confirm({ message: data.errorMsg||"服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );
        // this.leftCharacter.push({
        //     id: "1015",
        //     lv: 50,
        //     star: 5,
        //     onStage: 0,
        //     equipment: [],
        //     goIntoNum: 1
        // })
        // this.leftCharacter.push({
        //     id: "1011",
        //     lv: 100,
        //     star: 5,
        //     onStage: 0,
        //     equipment: [],
        //     goIntoNum: 1
        // })
        // this.leftCharacter.push({
        //     id: "1012",
        //     lv: 100,
        //     star: 5,
        //     onStage: 0,
        //     equipment: [],
        //     goIntoNum: 1
        // })
        // this.leftCharacter.push({
        //     id: "1013",
        //     lv: 100,
        //     star: 5,
        //     onStage: 0,
        //     equipment: [],
        //     goIntoNum: 1
        // })
        // this.leftCharacter.push({
        //     id: "1014",
        //     lv: 100,
        //     star: 5,
        //     onStage: 0,
        //     equipment: [],
        //     goIntoNum: 1
        // })
        // this.rightCharacter.push({
        //     id: "1015",
        //     lv: 50,
        //     star: 5,
        //     onStage: 0,
        //     equipment: [],
        //     goIntoNum: 1
        // })
        // this.rightCharacter.push({
        //     id: "1011",
        //     lv: 100,
        //     star: 5,
        //     onStage: 0,
        //     equipment: [],
        //     goIntoNum: 1
        // })
        // this.rightCharacter.push({
        //     id: "1012",
        //     lv: 100,
        //     star: 5,
        //     onStage: 0,
        //     equipment: [],
        //     goIntoNum: 1
        // })
        // this.rightCharacter.push({
        //     id: "1013",
        //     lv: 100,
        //     star: 5,
        //     onStage: 0,
        //     equipment: [],
        //     goIntoNum: 1
        // })
        // this.rightCharacter.push({
        //     id: "1014",
        //     lv: 100,
        //     star: 5,
        //     onStage: 0,
        //     equipment: [],
        //     goIntoNum: 1
        // })
        // this.L1.getChildByName("header").getComponent(Sprite).spriteFrame =
        //     await util.bundle.load(`game/texture/frames/hero/Header/1015/spriteFrame`, SpriteFrame)
        // this.L2.getChildByName("header").getComponent(Sprite).spriteFrame =
        //     await util.bundle.load(`game/texture/frames/hero/Header/1011/spriteFrame`, SpriteFrame)
        // this.L3.getChildByName("header").getComponent(Sprite).spriteFrame =
        //     await util.bundle.load(`game/texture/frames/hero/Header/1012/spriteFrame`, SpriteFrame)
        // this.L4.getChildByName("header").getComponent(Sprite).spriteFrame =
        //     await util.bundle.load(`game/texture/frames/hero/Header/1013/spriteFrame`, SpriteFrame)
        // this.L5.getChildByName("header").getComponent(Sprite).spriteFrame =
        //     await util.bundle.load(`game/texture/frames/hero/Header/1014/spriteFrame`, SpriteFrame)
        // this.R1.getChildByName("header").getComponent(Sprite).spriteFrame =
        //     await util.bundle.load(`game/texture/frames/hero/Header/1015/spriteFrame`, SpriteFrame)
        // this.R2.getChildByName("header").getComponent(Sprite).spriteFrame =
        //     await util.bundle.load(`game/texture/frames/hero/Header/1011/spriteFrame`, SpriteFrame)
        // this.R3.getChildByName("header").getComponent(Sprite).spriteFrame =
        //     await util.bundle.load(`game/texture/frames/hero/Header/1012/spriteFrame`, SpriteFrame)
        // this.R4.getChildByName("header").getComponent(Sprite).spriteFrame =
        //     await util.bundle.load(`game/texture/frames/hero/Header/1013/spriteFrame`, SpriteFrame)
        // this.R5.getChildByName("header").getComponent(Sprite).spriteFrame =
        //     await util.bundle.load(`game/texture/frames/hero/Header/1014/spriteFrame`, SpriteFrame)
        // 设置角色
        // for (const character of common.leftCharacter) {
        //     await this.setCharacter(character[1] , "left" , character[0])
        //     holPreLoad.setProcess(process = process + 20 / common.leftCharacter.size)
        // }
        // for (const character of common.rightCharacter) {
        //     await this.setCharacter(character[1] , "right" , character[0])
        //     holPreLoad.setProcess(process = process + 20 / common.rightCharacter.size)
        // }
        // 监听进度条完成函数
        holPreLoad.listenComplete(async () => {
            await new Promise(res => setTimeout(res, 500))
            // 战斗开始
            const result = await this.fightStart()
            // 战斗胜利结算
            if (result) this.fightSuccess()
            // 战斗失败结算
            else this.fightEnd()
        })
        // 设置 100%
        holPreLoad.setProcess(100)
    }

    // 监听回合函数
    public listenRoundEvent(round: number, call: Function) {
        // let roundEvents = this.allRoundQueue.get(this.currentRound + round + 1)
        // if (!roundEvents)
        //     return this.allRoundQueue.set(this.currentRound + round + 1, roundEvents = [call])
        // roundEvents.push(call)
    }
    // 跳过战斗
    async skipFight() {

        const result = await util.message.confirm({ message: "确定要跳过战斗吗?" })

        if (result) {
            // this.FightMapNode.getComponent(FightMap).unscheduleAllCallbacks(); // 停止所有调度函数
            // this.FightMapNode.getComponent(FightMap).isPlayAnimation = false
            this.isOverFight = false
            await new Promise(res => setTimeout(res, 500))
            // const close = await util.message.load()
            // director.preloadScene("Home", () => close())
            // director.loadScene("Home")
        }

    }
    // 战斗开始
    private async fightStart(): Promise<boolean> {

        while (this.currentRound <= 150 && this.isOverFight) {
            console.log(this.isOverFight, "this.isOverFight")
            if (this.currentRound == 1) {
                await this.setCharacter(this.leftCharacter[0], "left")
                await this.setCharacter(this.rightCharacter[0], "right")
            }
            const allLiveCharacter = [].concat(this.allLiveCharacter).sort((a, b) =>
                b.state.speed - a.state.speed
            )
            // await new Promise(res => setTimeout(res, 1000))
            for (const character of allLiveCharacter) {
                if (this.allLiveCharacter.indexOf(character) === -1) continue
                await character.action()
                // 等待行动队列清空
                await Promise.all(this.actionAwaitQueue)
                this.actionAwaitQueue = []
            }
            this.currentRound++;
            if (this.currentRound == 150) {
                return false
            }
            console.log(1111111)
            // 判断是否结束
            if (this.allLiveCharacter.filter(c => c.direction === "left").length <= 0) {
                console.log(this.allDeadCharacter, 1111)
                let result = this.leftCharacter.filter(itemA => !this.allDeadCharacter.some(itemB => itemA.id === itemB.state.id && itemB.direction === "left"));
                if (result.length <= 0) return false
                else await this.setCharacter(result[0], "left")

            } else if (this.allLiveCharacter.filter(c => c.direction === "right").length <= 0) {
                console.log(this.allDeadCharacter, 2222)
                let result = this.rightCharacter.filter(itemA => !this.allDeadCharacter.some(itemB => itemA.id === itemB.state.id && itemB.direction === "right"));
                if (result.length <= 0) return false
                else await this.setCharacter(result[0], "right")

            }
        }
        return true;
        // // 调用战斗开始回调
        // for (const character of this.allLiveCharacter) {
        //     for (const buff of character.state.buff) 
        //         await buff.OnFightBegan(buff , this)
        //     for (const equipment of character.state.equipment) 
        //         await equipment.OnFightBegan(equipment , this)
        //     await character.state.OnFightBegan(character.state , this)
        // }
        // // 回合开始
        // while(this.currentRound <= 150) {
        //     const roundState = new RoundState
        //     const allLiveCharacter = [].concat(this.allLiveCharacter).sort((a , b) => 
        //         b.state.speed - a.state.speed
        //     )
        //     // 调用回合任务
        //     for (const task of this.allRoundQueue.get(this.currentRound) || []) await task()
        //     // 调用回合开始回调
        //     for (const character of allLiveCharacter) {
        //         if (this.allLiveCharacter.indexOf(character) === -1) break
        //         for (const buff of character.state.buff) 
        //             await buff.OnRoundBegan(buff , roundState , this)
        //         for (const equipment of character.state.equipment) 
        //             await equipment.OnRoundBegan(equipment , roundState , this)
        //         await character.state.OnRoundBegan(character.state , roundState , this)
        //     }
        //     // 角色行动
        //     for (const character of allLiveCharacter) {
        //         if (this.allLiveCharacter.indexOf(character) === -1) continue
        //         await character.action()
        //         // 等待行动队列清空
        //         await Promise.all(this.actionAwaitQueue)
        //         this.actionAwaitQueue = []
        //         // 判断是否结束
        //         if (this.allLiveCharacter.filter(c => c.direction === "left").length <= 0) return false
        //         else if (this.allLiveCharacter.filter(c => c.direction === "right").length <= 0) return true
        //     }
        //     // 调用回合结束回调
        //     for (const character of allLiveCharacter) {
        //         if (this.allLiveCharacter.indexOf(character) === -1) break
        //         for (const buff of character.state.buff) 
        //             await buff.OnRoundEnd(buff , roundState , this)
        //         for (const equipment of character.state.equipment) 
        //             await equipment.OnRoundEnd(equipment , roundState , this)
        //         await character.state.OnRoundEnd(character.state , roundState , this)
        //     }
        //     this.currentRound++
        //     // 等待
        //     if (this.isPlayAnimation) await new Promise(res => setTimeout(res, 300))
        //     // 判断是否结束
        //     if (this.allLiveCharacter.filter(c => c.direction === "left").length <= 0) return false
        //     else if (this.allLiveCharacter.filter(c => c.direction === "right").length <= 0) return true
        // }


    }

    // 设置角色
    private async setCharacter(create: CharacterStateCreate, direct: "left" | "right") {
        const holCharacterPrefab = await util.bundle.load("prefab/HolCharacter", Prefab)
        const character = instantiate(holCharacterPrefab)
        this.node.addChild(character)
        const holCharacter = character.getComponent(HolCharacter)
        console.log(create, 4444)
        await holCharacter.initCharacter(
            create, direct, this
        )
        this.node.on(NodeEventType.NODE_DESTROYED, () => {
            character.parent.removeChild(character)
        })
        this.allLiveCharacter.push(holCharacter)
    }

    // 战斗胜利
    private fightSuccess() {
        this.node.parent.getChildByName("FightFailure").active = false
        this.node.parent.getChildByName("FightSuccess").active = true
    }

    // 战斗失败
    private fightEnd() {
        this.node.parent.getChildByName("FightFailure").active = true
        this.node.parent.getChildByName("FightSuccess").active = false
    }
}

