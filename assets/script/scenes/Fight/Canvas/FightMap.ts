import { _decorator, Component, director, Font, instantiate, Label, math, Node, NodeEventType, Event, sp, Prefab, Sprite, SpriteFrame, tween, Vec3, AudioClip, AudioSource } from 'cc';
import { util } from '../../../util/util';
import { HolCharacter } from '../../../prefab/HolCharacter';
import { CharacterStateCreate } from '../../../game/fight/character/CharacterState';
import { HolNumber } from '../../../prefab/HolNumber';
import { RoundState } from '../../../game/fight/RoundState';
import { common } from '../../../common/common/common';
import { HolPreLoad } from '../../../prefab/HolPreLoad';
import { getConfig, getToken } from '../../../common/config/config';
import { CharacterEnum } from '../../../game/fight/character/CharacterEnum';
import { AudioMgr } from '../../../util/resource/AudioMgr';
import { FightSuccess } from './FightSuccess';
const { ccclass, property } = _decorator;

@ccclass('FightMap')
export class FightMap extends Component {


    @property(Node)
    tiem
    @property(Node)
    Character
    @property(Node)
    Hp
    @property(Node)
    name0
    @property(Node)
    name1
    // 当前回合数
    currentRound: number = 1

    // // 是否播放动画
    isPlayAnimation: boolean = true

    // // 所有回合任务
    allRoundQueue: Map<number, Function[]> = new Map

    // // // 所有存活的角色
    allLiveCharacter: HolCharacter[] = []
    // leftCharacter = []
    // rightCharacter = []
    // // // 所有死亡的角色
    allDeadCharacter: HolCharacter[] = []

    // // 行动等待队列，若队列有未完成任务则等待完成后进入下一个角色行动
    actionAwaitQueue: Promise<any>[] = []

    fightProcess = []
    //是否结束
    isOverFight: boolean = false
    //
    result: boolean

    rewards = []

    levelUp = 0
    // 当前倍速
    private timeScale: number = 1
    initialized = false;
    async start() {
        // 初始化音乐
        const config = getConfig()
        // 音乐们
        const musics = await util.bundle.loadDir<AudioClip>("sound/fight/back", AudioClip)
        const music = musics[Math.floor(musics.length * Math.random())]
        const audioSource = this.node.getComponent(AudioSource)
        audioSource.clip = music
        audioSource.volume = config.volume * config.volumeDetail.home
        audioSource.play()
    }
    onEnable() {


    }


    async render(fightId, rewards, levelUp) {
        this.rewards = rewards
        this.levelUp = levelUp
        // HolPreLoad 预加载进度条
        // const holPreLoad = this.node.parent.getChildByName("HolPreLoad").getComponent(HolPreLoad)
        const holPreLoad = this.node.getChildByName("HolPreLoad").getComponent(HolPreLoad)
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
        const postData = {
            token: token,
            id: fightId
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
                    this.fightProcess = map['fightProcess'];
                    const leftCharacter = map['leftCharacter'];
                    const rightCharacter = map['rightCharacter'];
                    const name0 = map['name0'];
                    this.name0.getComponent(Label).string = name0
                    const name1 = map['name1'];
                    this.name1.getComponent(Label).string = name1
                    this.result = map['result'];
                    var L1 = leftCharacter.filter(x => x.goIntoNum == 1)
                    for (var i = 0; i < leftCharacter.length; i++) {
                        this.tiem.children[0].children[leftCharacter[i].goIntoNum - 1].getChildByName("header").getComponent(Sprite).spriteFrame =
                            await util.bundle.load(`game/texture/frames/hero/Header/${leftCharacter[i].id}/spriteFrame`, SpriteFrame)
                        this.tiem.children[0].children[leftCharacter[i].goIntoNum - 1].getChildByName("my_hp").active = true
                        this.tiem.children[0].children[leftCharacter[i].goIntoNum - 1].getChildByName("my_hp").getChildByName("Bar").setScale(
                            leftCharacter[i].hp / leftCharacter[i].maxHp,
                            1,
                            1
                        )
                        this.tiem.children[0].children[leftCharacter[i].goIntoNum - 1].getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = leftCharacter[i].hp + "/" + leftCharacter[i].maxHp
                    }
                    for (var i = 0; i < rightCharacter.length; i++) {
                        this.tiem.children[1].children[rightCharacter[i].goIntoNum - 1].getChildByName("header").getComponent(Sprite).spriteFrame =
                            await util.bundle.load(`game/texture/frames/hero/Header/${rightCharacter[i].id}/spriteFrame`, SpriteFrame)
                        this.tiem.children[1].children[rightCharacter[i].goIntoNum - 1].getChildByName("my_hp").active = true
                        this.tiem.children[1].children[rightCharacter[i].goIntoNum - 1].getChildByName("my_hp").getChildByName("Bar").setScale(
                            rightCharacter[i].hp / rightCharacter[i].maxHp,
                            1,
                            1
                        )
                        this.tiem.children[1].children[rightCharacter[i].goIntoNum - 1].getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = rightCharacter[i].hp + "/" + rightCharacter[i].maxHp
                    }
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );

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
    // 倍速
    setTimeScale(e: Event) {
        this.timeScale++
        if (this.timeScale > 3) this.timeScale = 1
        // for (const node of this.FightMapNode.children)
        //     node.getComponent(HolCharacter).holAnimation.timeScale = this.timeScale
        e.target.getChildByName("Value").getComponent(Label).string = "x" + this.timeScale
        return
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
            this.isOverFight = true
            await new Promise(res => setTimeout(res, 500))
            // const close = await util.message.load()
            // director.preloadScene("Home", () => close())
            // director.loadScene("Home")
        }

    }

    // 战斗开始
    private async fightStart(): Promise<boolean> {
        for (var i = 0; i < this.fightProcess.length; i++) {

            //初始化登场角色
            let fightterList = this.fightProcess[i]["fightterList"];
            let character_0 = this.fightProcess[i]["leftCharter"];
            let character_1 = this.fightProcess[i]["rightCharter"];
            //0左

            this.tiem.children[0].children.forEach(element => {
                element.getChildByName("buff").getChildByName("goOn").getComponent(sp.Skeleton).node.active = false
            });

            let goOnSkeleton = this.tiem.children[0].children[character_0.goIntoNum - 1].getChildByName("buff").getChildByName("goOn").getComponent(sp.Skeleton)
            goOnSkeleton.node.active = true
            goOnSkeleton.setAnimation(0, "animation", true)
            this.Character.children[0].setPosition(-180, 0, 0)
            const meta2 = CharacterEnum[character_0.id]
            this.Character.children[0].getComponent(Sprite).spriteFrame = await util.bundle.load(meta2.AvatarPath, SpriteFrame)
            this.Character.children[0].setScale(
                Math.abs(this.Character.children[0].scale.x) * -1,
                this.Character.children[0].scale.y,
                this.Character.children[0].scale.z,
            )
            // 更新生命值
            this.Hp.children[0].getChildByName("Bar").setScale(
                character_0.hp / character_0.maxHp,
                1,
                1
            )
            this.Hp.children[0].getChildByName("user_li_count").getComponent(Label).string = character_0.hp + "/" + character_0.maxHp


            //1右
            this.tiem.children[1].children.forEach(element => {
                element.getChildByName("buff").getChildByName("goOn").getComponent(sp.Skeleton).node.active = false
            });

            goOnSkeleton = this.tiem.children[1].children[character_1.goIntoNum - 1].getChildByName("buff").getChildByName("goOn").getComponent(sp.Skeleton)
            goOnSkeleton.node.active = true
            goOnSkeleton.setAnimation(0, "animation", true)
            this.Character.children[1].setPosition(180, 0, 0)

            const meta = CharacterEnum[character_1.id]
            this.Character.children[1].getComponent(Sprite).spriteFrame = await util.bundle.load(meta.AvatarPath, SpriteFrame)
            // 更新生命值
            this.Hp.children[1].getChildByName("Bar").setScale(
                character_1.hp / character_1.maxHp,
                1,
                1
            )
            this.Hp.children[1].getChildByName("user_li_count").getComponent(Label).string = character_1.hp + "/" + character_1.maxHp



            //开始过程
            for (var n = 0; n < fightterList.length; n++) {

                if (this.isOverFight) {
                    break;
                }

                var fight = fightterList[n]
                if (fight.goON == 1) {
                    var falg = fight.direction
                    if (falg == 0) {
                        falg = -1
                    }
                    //不是技能就是普通攻击
                    if (fight.isSkill == 0) {
                        //攻击动作
                        await util.sundry.moveNodeToPosition(
                            this.Character.children[fight.direction],
                            {
                                targetPosition: { x: -80 * falg, y: 0 },
                                moveCurve: true,
                                moveTimeScale: 1
                            }
                        )
                        AudioMgr.inst.playOneShot("sound/fight/attack/attack");
                        let hut = this.Character.children[fight.directionFace].getChildByName("hut").getComponent(sp.Skeleton)
                        hut.node.active = true
                        hut.setAnimation(0, "animation", false)
                        //伤害结算
                        this.showNumber(-falg, this.Character.children[fight.directionFace], -fight.attack, new math.Color(255, 176, 126, 255), 40)

                        // 更新场上生命值
                        this.Hp.children[fight.directionFace].getChildByName("Bar").setScale(
                            fight.hpFace / fight.maxHpFace,
                            1,
                            1
                        )
                        this.Hp.children[fight.directionFace].getChildByName("user_li_count").getComponent(Label).string = fight.hpFace + "/" + fight.maxHpFace

                        // 更新场下生命值
                        this.tiem.children[fight.directionFace].children[fight.goIntoNumFace - 1].getChildByName("my_hp").getChildByName("Bar").setScale(
                            fight.hpFace / fight.maxHpFace,
                            1,
                            1
                        )
                        this.tiem.children[fight.directionFace].children[fight.goIntoNumFace - 1].getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = fight.hpFace + "/" + fight.maxHpFace
                        hut.setCompleteListener(() => hut.node.active = false)

                        //死亡结算
                        if (fight.hp <= 0) {
                            this.Character.children[fight.direction].getComponent(Sprite).spriteFrame = null
                            this.tiem.children[fight.direction].children[fight.goIntoNum - 1].getChildByName("dead").active = true
                        }
                        if (fight.hpFace <= 0) {
                            this.Character.children[fight.directionFace].getComponent(Sprite).spriteFrame = null
                            this.tiem.children[fight.directionFace].children[fight.goIntoNumFace - 1].getChildByName("dead").active = true
                        }


                        //回到初始位置
                        await util.sundry.moveNodeToPosition(
                            this.Character.children[fight.direction],
                            {
                                targetPosition: { x: 180 * falg, y: 0 },
                                moveCurve: true,
                                moveTimeScale: 1
                            }
                        )

                    } else {

                        if ("仙塔庇护" == fight.buff) {
                            let selectSkeleton = this.tiem.children[fight.direction].children[fight.goIntoNum - 1].getChildByName("select").getComponent(sp.Skeleton)
                            selectSkeleton.node.active = true
                            selectSkeleton.setAnimation(0, "animation", false)
                            tween(this.tiem.children[fight.direction].children[fight.goIntoNum - 1])
                                .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
                                .call(async () => {
                                    AudioMgr.inst.playOneShot("sound/fight/skill/lotteryCard");
                                    let selectSkeleton2 = this.Character.children[fight.direction].getChildByName("xuming").getComponent(sp.Skeleton)
                                    selectSkeleton2.node.active = true
                                    selectSkeleton2.setAnimation(0, "animation", false)
                                    //给自己减血
                                    await this.showString(1, this.tiem.children[fight.direction].children[fight.goIntoNum - 1], "续命")
                                    await new Promise(res => setTimeout(res, 300 / this.timeScale))
                                    await this.showString(1, this.tiem.children[fight.direction].children[fight.goIntoNum - 1], "-" + Math.ceil(fight.str))
                                    this.tiem.children[fight.direction].children[fight.goIntoNum - 1].getChildByName("my_hp").getChildByName("Bar").setScale(
                                        fight.hp / fight.maxHp,
                                        1,
                                        1
                                    )
                                    this.tiem.children[fight.direction].children[fight.goIntoNum - 1].getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = fight.hp + "/" + fight.maxHp,
                                        await new Promise(res => setTimeout(res, 500 / this.timeScale))

                                    //给场上人加血   
                                    this.showNumber(falg, this.Character.children[fight.direction], +fight.str, new math.Color(82, 201, 25, 255), 40)
                                    this.Hp.children[0].getChildByName("Bar").setScale(
                                        fight.hpFace / fight.maxHpFace,
                                        1,
                                        1
                                    )
                                    this.Hp.children[fight.direction].getChildByName("user_li_count").getComponent(Label).string = fight.hpFace + "/" + fight.maxHpFace

                                    //死亡结算
                                    if (fight.hp <= 0) {
                                        this.tiem.children[fight.direction].children[fight.goIntoNum - 1].getChildByName("dead").active = true
                                    }
                                    selectSkeleton2.setCompleteListener(() => selectSkeleton2.node.active = false)
                                })
                                .by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
                                .start();
                            selectSkeleton.setCompleteListener(() => selectSkeleton.node.active = false)
                            await new Promise(res => setTimeout(res, 1000 / this.timeScale))
                        }

                    }


                } else {

                    //场下英雄释放技能
                    if ("续命" == fight.buff) {
                        // //加血
                        var falg = fight.direction
                        if (falg == 0) {
                            falg = -1
                        }
                        let selectSkeleton = this.tiem.children[fight.direction].children[fight.goIntoNum - 1].getChildByName("select").getComponent(sp.Skeleton)
                        selectSkeleton.node.active = true
                        selectSkeleton.setAnimation(0, "animation", false)
                        tween(this.tiem.children[fight.direction].children[fight.goIntoNum - 1])
                            .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
                            .call(async () => {
                                AudioMgr.inst.playOneShot("sound/fight/skill/lotteryCard");
                                let selectSkeleton2 = this.Character.children[fight.direction].getChildByName("xuming").getComponent(sp.Skeleton)
                                selectSkeleton2.node.active = true
                                selectSkeleton2.setAnimation(0, "animation", false)
                                //给自己减血
                                await this.showString(1, this.tiem.children[fight.direction].children[fight.goIntoNum - 1], "续命")
                                await new Promise(res => setTimeout(res, 300 / this.timeScale))
                                await this.showString(1, this.tiem.children[fight.direction].children[fight.goIntoNum - 1], "-" + Math.ceil(fight.str))
                                this.tiem.children[fight.direction].children[fight.goIntoNum - 1].getChildByName("my_hp").getChildByName("Bar").setScale(
                                    fight.hp / fight.maxHp,
                                    1,
                                    1
                                )
                                this.tiem.children[fight.direction].children[fight.goIntoNum - 1].getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = fight.hp + "/" + fight.maxHp,
                                    await new Promise(res => setTimeout(res, 500 / this.timeScale))

                                //给场上人加血   
                                this.showNumber(falg, this.Character.children[fight.direction], +fight.str, new math.Color(82, 201, 25, 255), 40)
                                this.Hp.children[0].getChildByName("Bar").setScale(
                                    fight.hpFace / fight.maxHpFace,
                                    1,
                                    1
                                )
                                this.Hp.children[fight.direction].getChildByName("user_li_count").getComponent(Label).string = fight.hpFace + "/" + fight.maxHpFace

                                //死亡结算
                                if (fight.hp <= 0) {
                                    this.tiem.children[fight.direction].children[fight.goIntoNum - 1].getChildByName("dead").active = true
                                }
                                selectSkeleton2.setCompleteListener(() => selectSkeleton2.node.active = false)
                            })
                            .by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
                            .start();
                        selectSkeleton.setCompleteListener(() => selectSkeleton.node.active = false)
                        await new Promise(res => setTimeout(res, 1000 / this.timeScale))
                    }
                }

                // //熔岩爆发
                // AudioMgr.inst.playOneShot("sound/fight/skill/fire");
                // await this.showString(-1, this.Character.children[0], "熔岩爆发")
                // let selectSkeleton2 = this.Character.children[1].getChildByName("fire").getComponent(sp.Skeleton)
                // selectSkeleton2.node.active = true
                // selectSkeleton2.setAnimation(0, "animation", false)
                // selectSkeleton2.setCompleteListener(() => selectSkeleton2.node.active = false)
                // //对面全部 收到伤害
                // for (var k = 0; k < this.right_tiem.children.length; k++) {
                //     let fireSkeleton = this.right_tiem.children[k].getChildByName("buff").getChildByName("fire").getComponent(sp.Skeleton)
                //     fireSkeleton.node.active = true
                //     fireSkeleton.setAnimation(0, "animation", true)
                //     await this.showString(1, this.right_tiem.children[k], "-" + Math.ceil(500))
                //     this.right_tiem.children[k].getChildByName("my_hp").getChildByName("Bar").setScale(
                //         4000 / 5000,
                //         1,
                //         1
                //     )
                //     this.right_tiem.children[k].getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = " 4000 / 5000"
                //     fireSkeleton.setCompleteListener(() => fireSkeleton.node.active = false)
                // }
                // await new Promise(res => setTimeout(res, 1000))

                // if (fight.rightAction == 1) {

                //     await util.sundry.moveNodeToPosition(
                //         this.Character.children[1],
                //         {
                //             targetPosition: { x: -80, y: 0 },
                //             moveCurve: true,
                //             moveTimeScale: 1
                //         }
                //     )
                //     AudioMgr.inst.playOneShot("sound/fight/attack/attack");
                //     this.showNumber(-1, this.Character.children[0], -1000, new math.Color(255, 176, 126, 255), 40)
                //     // 更新生命值
                //     this.Hp.children[0].getChildByName("Bar").setScale(
                //         4000 / 5000,
                //         1,
                //         1
                //     )
                //     this.Hp.children[0].getChildByName("user_li_count").getComponent(Label).string = "4000/ 5000"
                //     // this.Left_character.getComponent(Sprite).spriteFrame = null
                //     await util.sundry.moveNodeToPosition(
                //         this.Character.children[1],
                //         {
                //             targetPosition: { x: 180, y: 0 },
                //             moveCurve: true,
                //             moveTimeScale: 1
                //         }
                //     )
                // }

                // //加血
                // let selectSkeleton = this.left_tiem.children[0].getChildByName("select").getComponent(sp.Skeleton)
                // selectSkeleton.node.active = true
                // selectSkeleton.setAnimation(0, "animation", false)
                // tween(this.left_tiem.children[0])
                //     .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
                //     .call(async () => {
                //         AudioMgr.inst.playOneShot("sound/fight/skill/skill");
                //         let selectSkeleton2 = this.Character.children[0].getChildByName("xuming").getComponent(sp.Skeleton)
                //         selectSkeleton2.node.active = true
                //         selectSkeleton2.setAnimation(0, "animation", false)
                //         await this.showString(1, this.left_tiem.children[0], "续命")
                //         this.left_tiem.children[0].getChildByName("my_hp").getChildByName("Bar").setScale(
                //             4500 / 5000,
                //             1,
                //             1
                //         )
                //         this.left_tiem.children[0].getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = " 4500 / 5000"
                //         await new Promise(res => setTimeout(res, 500))
                //         await this.showString(1, this.left_tiem.children[0], "-" + Math.ceil(500))
                //         this.showNumber(-1, this.Character.children[0], +500, new math.Color(82, 201, 25, 255), 40)
                //         this.Hp.children[0].getChildByName("Bar").setScale(
                //             4500 / 5000,
                //             1,
                //             1
                //         )
                //         this.Hp.children[0].getChildByName("user_li_count").getComponent(Label).string = "4500/ 5000"
                //         selectSkeleton2.setCompleteListener(() => selectSkeleton2.node.active = false)
                //     })
                //     .by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
                //     .start();
                // selectSkeleton.setCompleteListener(() => selectSkeleton.node.active = false)
                // await new Promise(res => setTimeout(res, 1000))

                // //眩晕
                // selectSkeleton = this.left_tiem.children[1].getChildByName("select").getComponent(sp.Skeleton)
                // selectSkeleton.node.active = true
                // selectSkeleton.setAnimation(0, "animation", false)
                // tween(this.left_tiem.children[1])
                //     .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
                //     .call(async () => {
                //         AudioMgr.inst.playOneShot("sound/fight/skill/daze");
                //         let selectSkeleton2 = this.Character.children[1].getChildByName("xuanyun").getComponent(sp.Skeleton)
                //         selectSkeleton2.node.active = true
                //         selectSkeleton2.setAnimation(0, "animation", true)
                //         await this.showString(1, this.left_tiem.children[1], "狐天蔽日")
                //     })
                //     .by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
                //     .start();
                // selectSkeleton.setCompleteListener(() => selectSkeleton.node.active = false)
                // await new Promise(res => setTimeout(res, 1000))

                // //飞弹
                // selectSkeleton = this.left_tiem.children[2].getChildByName("select").getComponent(sp.Skeleton)
                // selectSkeleton.node.active = true
                // selectSkeleton.setAnimation(0, "animation", false)
                // tween(this.left_tiem.children[2])
                //     .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
                //     .call(async () => {
                //         AudioMgr.inst.playOneShot("sound/fight/skill/missile");
                //         let selectSkeleton2 = this.Character.children[1].getChildByName("missile").getComponent(sp.Skeleton)
                //         selectSkeleton2.node.active = true
                //         selectSkeleton2.setAnimation(0, "animation", false)
                //         await this.showString(1, this.left_tiem.children[2], "飞弹")
                //         this.showNumber(1, this.Character.children[1], -500, new math.Color(255, 176, 126, 255), 40)
                //         this.Hp.children[1].getChildByName("Bar").setScale(
                //             3500 / 5000,
                //             1,
                //             1
                //         )
                //         this.Hp.children[1].getChildByName("user_li_count").getComponent(Label).string = "3500/ 5000"
                //         selectSkeleton2.setCompleteListener(() => selectSkeleton2.node.active = false)
                //     })
                //     .by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
                //     .start();
                // selectSkeleton.setCompleteListener(() => selectSkeleton.node.active = false)
                // await new Promise(res => setTimeout(res, 1000))


                // //中毒
                // selectSkeleton = this.left_tiem.children[3].getChildByName("select").getComponent(sp.Skeleton)
                // selectSkeleton.node.active = true
                // selectSkeleton.setAnimation(0, "animation", false)
                // tween(this.left_tiem.children[3])
                //     .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
                //     .call(async () => {
                //         AudioMgr.inst.playOneShot("sound/fight/skill/posion");
                //         let selectSkeleton2 = this.Character.children[1].getChildByName("posion").getComponent(sp.Skeleton)
                //         selectSkeleton2.node.active = true
                //         selectSkeleton2.setAnimation(0, "animation", true)
                //         await this.showString(1, this.left_tiem.children[3], "中毒")
                //         this.showNumber(1, this.Character.children[1], -500, new math.Color(255, 176, 126, 255), 40)
                //         this.Hp.children[1].getChildByName("Bar").setScale(
                //             3500 / 5000,
                //             1,
                //             1
                //         )
                //         this.Hp.children[1].getChildByName("user_li_count").getComponent(Label).string = "3500/ 5000"

                //     })
                //     .by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
                //     .start();
                // selectSkeleton.setCompleteListener(() => selectSkeleton.node.active = false)
                // await new Promise(res => setTimeout(res, 1000))

                // //加血
                // selectSkeleton = this.right_tiem.children[0].getChildByName("select").getComponent(sp.Skeleton)
                // selectSkeleton.node.active = true
                // selectSkeleton.setAnimation(0, "animation", false)
                // tween(this.right_tiem.children[0])
                //     .by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
                //     .call(async () => {
                //         AudioMgr.inst.playOneShot("sound/fight/skill/skill");
                //         let selectSkeleton2 = this.Character.children[1].getChildByName("xuming").getComponent(sp.Skeleton)
                //         selectSkeleton2.node.active = true
                //         selectSkeleton2.setAnimation(0, "animation", false)
                //         await this.showString(1, this.right_tiem.children[0], "续命")
                //         this.right_tiem.children[0].getChildByName("my_hp").getChildByName("Bar").setScale(
                //             4500 / 5000,
                //             1,
                //             1
                //         )
                //         this.right_tiem.children[0].getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = " 4500 / 5000"
                //         await new Promise(res => setTimeout(res, 500))
                //         await this.showString(1, this.right_tiem.children[0], "-" + Math.ceil(500))
                //         this.showNumber(1, this.Character.children[1], +500, new math.Color(82, 201, 25, 255), 40)
                //         this.Hp.children[1].getChildByName("Bar").setScale(
                //             4500 / 5000,
                //             1,
                //             1
                //         )
                //         this.Hp.children[1].getChildByName("user_li_count").getComponent(Label).string = "4500/ 5000"
                //         selectSkeleton2.setCompleteListener(() => selectSkeleton2.node.active = false)
                //     })
                //     .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
                //     .start();
                // selectSkeleton.setCompleteListener(() => selectSkeleton.node.active = false)
                await new Promise(res => setTimeout(res, 1000 / this.timeScale))

            }
            this.currentRound++
        }

        return this.result
    }
    /** 
     * 显示数值
     * num 为数值
     * color 是颜色
     */
    async showNumber(i, character: Node, num: number, color: math.Color, size: number = 28) {

        const holNumberNodePool = util.resource.getNodePool(
            await util.bundle.load("prefab/HolNumber", Prefab)
        )
        const numberNode = holNumberNodePool.get()
        numberNode.setScale(
            Math.abs(numberNode.scale.x) * i,
            numberNode.scale.y,
            numberNode.scale.z,
        )
        const holNumber = numberNode.getComponent(HolNumber)
        holNumber.color = color
        holNumber.frontSize = size
        holNumber.number = num
        character.addChild(numberNode)

        const ordinarySibling = numberNode.getSiblingIndex()
        numberNode.setSiblingIndex(9999)

        return new Promise<void>(res => {
            let i = 0
            const inter = setInterval(() => {
                if (++i > 45) {
                    res()
                    holNumberNodePool.put(numberNode)
                    numberNode.setSiblingIndex(ordinarySibling)
                    numberNode.setPosition(0, 0, numberNode.position.z)
                    return clearInterval(inter)
                }
                numberNode.setPosition(
                    numberNode.position.x,
                    numberNode.position.y + 3,
                    numberNode.position.z,
                )
            }, 20 / 1.3)
            // }, 20 / this.$holAnimation.timeScale)
        })

    }

    /** 
 * 显示文字
 * str 是显示文件
 */
    async showString(i, character: Node, str: string) {
        const node = new Node
        node.setScale(
            Math.abs(node.scale.x) * i,
            node.scale.y,
            node.scale.z,
        )
        const label = node.addComponent(Label)
        label.font = await util.bundle.load("font/font_title", Font)
        label.string = str
        label.fontSize = 30
        // label.color= new math.Color(236, 163, 61, 255)
        character.addChild(node)
        let index = 0
        const inter = setInterval(() => {
            if (index++ > 45) {
                clearInterval(inter)
                character.removeChild(node)
                return
            }
            node.setPosition(node.position.x, node.position.y + 2, node.position.z)
        }, 20 / 1.3)
    }


    // 战斗胜利
    private async fightSuccess() {
        await this.node.getChildByName("FightSuccess")
            .getComponent(FightSuccess)
            .read(this.rewards, this.levelUp)
        this.node.getChildByName("FightFailure").active = false
        this.node.getChildByName("FightSuccess").active = true
    }

    // 战斗失败
    private fightEnd() {
        this.node.getChildByName("FightFailure").active = true
        this.node.getChildByName("FightSuccess").active = false
    }
}

