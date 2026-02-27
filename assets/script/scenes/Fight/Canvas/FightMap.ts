import { _decorator, Component, director, Font, instantiate, Label, math, Node, NodeEventType, Event, sp, Prefab, Sprite, SpriteFrame, tween, Vec3, AudioClip, AudioSource, ProgressBar, UITransform, Vec2, Color } from 'cc';
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
import { ItemCtrl } from '../../Home/Canvas/Tiem/ItemCtrl';
const { ccclass, property } = _decorator;
enum Style { 纯色描边, 透明衰减, 明暗衰减 }
@ccclass('FightMap')
export class FightMap extends Component {

    @property(Node)
    SkipFight: Node
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
    @property(Node)
    skillName
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

    L1 = null;
    R1 = null;
    timer = 0


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
    async update(deltaTime: number) {
        if (this.timer >= 500) {
            this.SkipFight.active = true
        }
        this.timer++
    }

    async render(fightId, rewards, levelUp) {
        this.actionAwaitQueue = []; // 新增：初始化清空队列
        this.isOverFight = false;   // 重置战斗状态
        // 原有逻辑...
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
                //////console.log(data); // 处理响应数据
                if (data.success == '1') {
                    var map = data.data;
                    this.fightProcess = map['battleLogs'];
                    const campA = map['campA'];
                    const campB = map['campB'];
                    this.name0.getComponent(Label).string = map['name0'];
                    this.name1.getComponent(Label).string = map['name1'];
                    var isWin = map['isWin'];
                    if (isWin == 1) {
                        this.result = false
                    } else {
                        this.result = true
                    }
                    this.L1 = campA
                    this.R1 = campB
                    for (var i = 0; i < campA.length; i++) {
                        this.tiem.children[0].children[campA[i].goIntoNum - 1].getChildByName("header").getComponent(Sprite).spriteFrame =
                            await util.bundle.load(`game/texture/frames/hero/Header/${campA[i].id}/spriteFrame`, SpriteFrame)
                        this.tiem.children[0].children[campA[i].goIntoNum - 1].getChildByName("id").getComponent(Label).string = campA[i].uuid
                        this.tiem.children[0].children[campA[i].goIntoNum - 1].getChildByName("my_hp").active = true
                        let progress = campA[i].maxHp / campA[i].maxHp
                        this.tiem.children[0].children[campA[i].goIntoNum - 1].getChildByName("my_hp").getComponent(ProgressBar).progress = progress
                        this.tiem.children[0].children[campA[i].goIntoNum - 1].getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = campA[i].maxHp + "/" + campA[i].maxHp
                    }
                    for (var i = 0; i < campB.length; i++) {
                        this.tiem.children[1].children[campB[i].goIntoNum - 1].getChildByName("header").getComponent(Sprite).spriteFrame =
                            await util.bundle.load(`game/texture/frames/hero/Header/${campB[i].id}/spriteFrame`, SpriteFrame)
                        this.tiem.children[1].children[campB[i].goIntoNum - 1].getChildByName("id").getComponent(Label).string = campB[i].uuid
                        this.tiem.children[1].children[campB[i].goIntoNum - 1].getChildByName("my_hp").active = true
                        let progress = campB[i].maxHp / campB[i].maxHp
                        this.tiem.children[1].children[campB[i].goIntoNum - 1].getChildByName("my_hp").getComponent(ProgressBar).progress = progress
                        this.tiem.children[1].children[campB[i].goIntoNum - 1].getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = campB[i].maxHp + "/" + campB[i].maxHp
                    }
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                //console.error('There was a problem with the fetch operation:', error);
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


    // 跳过战斗
    async skipFight() {

        const result = await util.message.confirm({ message: "确定要跳过战斗吗?" })

        if (result) {
            this.isOverFight = true
            await new Promise(res => setTimeout(res, 500))
        }

    }

    getChracterChangXiaById(id) {
        for (var i = 0; i < this.tiem.children[0].children.length; i++) {
            if (this.tiem.children[0].children[i].getChildByName("id").getComponent(Label).string == id) {
                return this.tiem.children[0].children[i]
            }
        }
        for (var i = 0; i < this.tiem.children[1].children.length; i++) {
            if (this.tiem.children[1].children[i].getChildByName("id").getComponent(Label).string == id) {
                return this.tiem.children[1].children[i]
            }
        }
    }

    getCharacterById(id) {
        for (var i = 0; i < this.Character.children.length; i++) {
            if (this.Character.children[i].getChildByName("id").getComponent(Label).string == id) {
                return this.Character.children[i]
            }
        }
    }

    hasLetterA(str: string): boolean {
        // 边界值处理：非字符串直接返回false
        if (typeof str !== 'string') {
            return false;
        }

        // 核心逻辑：用正则匹配字母A，g表示全局匹配（不影响判断，仅为统一写法）
        // /A/ 匹配单个大写字母A，区分大小写；若要忽略大小写可改为 /A/i
        const aMatchResult = str.match(/A/g);

        // 有匹配结果（数组）则返回true，无匹配（null）则返回false
        return !!aMatchResult;
    }

    // 战斗开始
    private async fightStart(): Promise<boolean> {
        // await new Promise(res => setTimeout(res, 500 / this.timeScale))
        let cc = [
            // 1. 普通（浅灰）- 与银白背景区分开，不泛白
            new Color(200, 200, 200, 200),
            // 2. 优秀（翠绿）- 高饱和绿，避开金/银色调
            new Color(0, 230, 0, 200),
            // 3. 稀有（宝蓝）- 深饱和蓝，对比金/银极强
            new Color(0, 100, 255, 200),
            // 4. 史诗（深紫）- 暗紫不反光，与金/银反差大
            new Color(120, 0, 220, 200),
            // 5. 传说（橙红）- 亮橙红，避开金色的黄调
            new Color(255, 80, 0, 200),
            // 6. 神器（正红）- 高饱和红，视觉冲击强
            new Color(255, 0, 0, 200),
            // 7. 传奇（亮金）- 比背景金更亮，加了红调区分
            new Color(255, 220, 30, 200),
            // 8. 幻彩（玫紫）- 高饱和玫红，不与金/银混淆
            new Color(230, 0, 200, 200),
            // 9. 暗金（古铜）- 深铜色，与亮金背景拉开层次
            new Color(180, 100, 0, 200),
            // 10. 神级（亮白）- 加了极浅蓝调，避开银白背景泛白
            new Color(255, 255, 255, 200)
        ];
        // try {
        for (var i = 0; i < this.fightProcess.length; i++) {
            if (this.isOverFight) {
                break;
            }
            let fightProcess = this.fightProcess[i]
            let eventType = fightProcess.eventType
            this.currentRound = fightProcess.round
            if (eventType == "ROUND_START") {


            } else if (eventType == "UNIT_ENTER") {
                // 等待行动队列清空
                await Promise.all(this.actionAwaitQueue)
                this.actionAwaitQueue = []
                let characterNode = this.Character.children[this.hasLetterA(fightProcess.sourceUnitId) ? 0 : 1]
                // let characterNode = this.getCharacterById(fightProcess.sourceUnitId)
                characterNode.setPosition(this.hasLetterA(fightProcess.sourceUnitId) ? -180 : 180, 0, 0)
                let scaleNew = new Vec3(this.hasLetterA(fightProcess.sourceUnitId) ? Math.abs(characterNode.scale.x) * -1 : Math.abs(characterNode.scale.x), characterNode.scale.y, characterNode.scale.z)
                characterNode.scale = new Vec3(0, 0, 0)
                characterNode.getComponent(Sprite).spriteFrame =
                    await util.bundle.load(`game/texture/frames/hero/${fightProcess.sourceUnitId.replace(/[a-zA-Z]/g, '')}/spriteFrame`, SpriteFrame)

                let material = characterNode.getComponent(Sprite).getMaterialInstance(0);
                if (fightProcess.flyup == 0) {
                    material.setProperty('enable', 0);
                } else {
                    material.setProperty('enable', 1);
                    material.setProperty('outerActive', 1);
                    material.setProperty('outerStyle', Style.透明衰减);
                    material.setProperty('outerColor', cc[fightProcess.flyup - 1]);
                    material?.setProperty('outerWidth', 0.5);
                    material.setProperty('innerActive', 0);
                    material.setProperty('brightness', 1);
                    let ut = characterNode.getComponent(UITransform);
                    material.setProperty('texSize', new Vec2(ut.width, ut.height));
                    material.setProperty('centerScale', 1);
                }
                let multiTargetDataMap = fightProcess.multiTargetDataMap
                for (const key in multiTargetDataMap) {
                    //先判断是否场上
                    const targetBattleData = multiTargetDataMap[key]; // 拿到对应的值
                    if (targetBattleData.stunned) {
                        let selectSkeletonON = characterNode.getChildByName('STUN').getComponent(sp.Skeleton)
                        selectSkeletonON.node.active = true
                        selectSkeletonON.setAnimation(0, "animation", true)
                    }
                    if (targetBattleData.silence) {
                        let selectSkeletonON = characterNode.getChildByName('SILENCE').getComponent(sp.Skeleton)
                        selectSkeletonON.node.active = true
                        selectSkeletonON.setAnimation(0, "animation", true)
                    }
                    if (targetBattleData.poison) {
                        let selectSkeletonON = characterNode.getChildByName('POISON').getComponent(sp.Skeleton)
                        selectSkeletonON.node.active = true
                        selectSkeletonON.setAnimation(0, "animation", true)
                    }
                    if (targetBattleData.healDown) {
                        let selectSkeletonON = characterNode.getChildByName('HEAL_DOWN').getComponent(sp.Skeleton)
                        selectSkeletonON.node.active = true
                        selectSkeletonON.setAnimation(0, "animation", true)
                    }
                }
                // 更新生命值
                let hpNode = this.Hp.children[this.hasLetterA(fightProcess.sourceUnitId) ? 0 : 1]
                hpNode.getComponent(ProgressBar).progress = fightProcess.sourceHpAfter / fightProcess.sourceHpBefore
                hpNode.getChildByName("user_li_count").getComponent(Label).string = fightProcess.sourceHpAfter + "/" + fightProcess.sourceHpBefore
                const hurtPromise = this.tweenToPromise(characterNode, 1, { scale: scaleNew }, { easing: 'elasticOut' });
                this.actionAwaitQueue.push(hurtPromise)
                characterNode.getChildByName("id").active = true
                characterNode.getChildByName("id").getComponent(Label).string = fightProcess.sourceUnitId
                await new Promise(res => setTimeout(res, 1000 / this.timeScale))

            } else if (eventType == "POISON") {
                // 等待行动队列清空
                await Promise.all(this.actionAwaitQueue)
                this.actionAwaitQueue = []
                let multiTargetDataMap = fightProcess.multiTargetDataMap
                for (const key in multiTargetDataMap) {
                    //先判断是否场上
                    let characterNode = this.getCharacterById(key)
                    const targetBattleData = multiTargetDataMap[key]; // 拿到对应的值
                    if (characterNode) {
                        let selectSkeleton = characterNode.getChildByName("POISON2").getComponent(sp.Skeleton)
                        selectSkeleton.node.active = true
                        selectSkeleton.setAnimation(0, "animation", false)
                        this.showNumber(this.hasLetterA(key), characterNode, -targetBattleData.value, new math.Color(255, 176, 126, 255), 40)
                        let Hp = this.Hp.children[this.hasLetterA(key) ? 0 : 1]
                        Hp.getComponent(ProgressBar).progress = targetBattleData.hpAfter / targetBattleData.hpBefore
                        Hp.getChildByName("user_li_count").getComponent(Label).string = targetBattleData.hpAfter + "/" + targetBattleData.hpBefore
                        const hurtPromise = this.playAnimation(selectSkeleton)
                        this.actionAwaitQueue.push(hurtPromise)
                    }
                    let itemNode = this.getChracterChangXiaById(key)
                    if (itemNode) {
                        let selectSkeleton = itemNode.getChildByName("buff").getChildByName("POISON2").getComponent(sp.Skeleton)
                        selectSkeleton.node.active = true
                        selectSkeleton.setAnimation(0, "animation", false)
                        await this.showString(1, itemNode, new math.Color(255, 0, 0), "-" + targetBattleData.value)
                        itemNode.getChildByName("my_hp").getComponent(ProgressBar).progress = targetBattleData.hpAfter / targetBattleData.hpBefore
                        itemNode.getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = targetBattleData.hpAfter + "/" + targetBattleData.hpBefore
                        const hurtPromise = this.playAnimation(selectSkeleton)
                        this.actionAwaitQueue.push(hurtPromise)
                    }
                }

                await new Promise(res => setTimeout(res, 1000 / this.timeScale))
            } else if (eventType == "NORMAL_ATTACK") {
                // 等待行动队列清空
                await Promise.all(this.actionAwaitQueue)
                this.actionAwaitQueue = []
                let characterNode = this.getCharacterById(fightProcess.sourceUnitId)
                await util.sundry.moveNodeToPosition(
                    characterNode,
                    {
                        targetPosition: { x: this.hasLetterA(fightProcess.sourceUnitId) ? 90 : -90, y: 0 },
                        moveCurve: true,
                        moveTimeScale: this.timeScale
                    }
                )
                AudioMgr.inst.playOneShot("sound/fight/attack/attack");
                let targetCharacterNode = this.getCharacterById(fightProcess.targetUnitId)
                let hut = targetCharacterNode.getChildByName("hut").getComponent(sp.Skeleton)
                hut.node.active = true
                hut.setAnimation(0, "animation", false)
                //伤害结算
                this.showNumber(this.hasLetterA(fightProcess.targetUnitId), targetCharacterNode, -fightProcess.singleTargetValue, new math.Color(255, 176, 126, 255), 40)
                let Hp = this.Hp.children[this.hasLetterA(fightProcess.targetUnitId) ? 0 : 1]
                Hp.getComponent(ProgressBar).progress = fightProcess.targetHpAfter / fightProcess.targetHpBefore
                Hp.getChildByName("user_li_count").getComponent(Label).string = fightProcess.targetHpAfter + "/" + fightProcess.targetHpBefore
                let item = this.getChracterChangXiaById(fightProcess.targetUnitId)
                // 更新场下生命值
                item.getChildByName("my_hp").getComponent(ProgressBar).progress = fightProcess.targetHpAfter / fightProcess.targetHpBefore
                item.getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = fightProcess.targetHpAfter + "/" + fightProcess.targetHpBefore
                const hurtPromise = this.playAnimation(hut)
                this.actionAwaitQueue.push(hurtPromise)
                //回到初始位置
                await util.sundry.moveNodeToPosition(
                    characterNode,
                    {
                        targetPosition: { x: this.hasLetterA(fightProcess.sourceUnitId) ? -180 : 180, y: 0 },
                        moveCurve: true,
                        moveTimeScale: this.timeScale
                    }
                )
                await new Promise(res => setTimeout(res, 200 / this.timeScale))
            } else if (eventType == "UNIT_DEATH") {
                // 等待行动队列清空
                await Promise.all(this.actionAwaitQueue)
                this.actionAwaitQueue = []
                let multiTargetDataMap = fightProcess.multiTargetDataMap
                if (multiTargetDataMap) {
                    for (const key in multiTargetDataMap) {
                        const targetBattleData = multiTargetDataMap[key]; // 拿到对应的值
                        if (targetBattleData.fieldStatus) {
                            let characterNode = this.getCharacterById(key)
                            characterNode.getComponent(Sprite).spriteFrame = null
                            //死亡移除所有动画
                            characterNode.children.forEach(buffNode => { buffNode.active = false; });
                        }
                        let itemNode = this.getChracterChangXiaById(key)
                        itemNode.getChildByName("dead").active = true
                        itemNode.getChildByName("buff").children.forEach(buffNode => { buffNode.active = false; });
                    }
                } else {
                    let characterNode = this.getCharacterById(fightProcess.targetUnitId)
                    characterNode.getComponent(Sprite).spriteFrame = null
                    let itemNode = this.getChracterChangXiaById(fightProcess.targetUnitId)
                    itemNode.getChildByName("dead").active = true
                    //死亡移除所有动画
                    characterNode.children.forEach(buffNode => { buffNode.active = false; });
                    itemNode.getChildByName("buff").children.forEach(buffNode => { buffNode.active = false; });
                }

                await new Promise(res => setTimeout(res, 200 / this.timeScale))
            } else if (eventType == "BATTLE_END") {
                break;
            } else if (eventType == "BUFF_END") {
                // 等待行动队列清空
                await Promise.all(this.actionAwaitQueue)
                this.actionAwaitQueue = []
                let multiTargetDataMap = fightProcess.multiTargetDataMap
                for (const key in multiTargetDataMap) {
                    let itemNode = this.getChracterChangXiaById(key)
                    let characterNode = this.getCharacterById(key)
                    const targetBattleData = multiTargetDataMap[key]; // 拿到对应的值
                    //console.log(targetBattleData,66);

                    if (!targetBattleData.stunned) {
                        let eventSelectSkeleton = itemNode.getChildByName("buff").getChildByName('STUN')
                        eventSelectSkeleton.active = false
                        if (characterNode) {
                            let selectSkeletonON = characterNode.getChildByName('STUN')
                            selectSkeletonON.active = false
                        }
                    }
                    if (!targetBattleData.silence) {
                        let eventSelectSkeleton = itemNode.getChildByName("buff").getChildByName('SILENCE')
                        eventSelectSkeleton.active = false
                        if (characterNode) {
                            let selectSkeletonON = characterNode.getChildByName('SILENCE')
                            selectSkeletonON.active = false
                        }
                    }
                    if (!targetBattleData.poison) {
                        //console.log(key,444);

                        let eventSelectSkeleton = itemNode.getChildByName("buff").getChildByName('POISON')
                        eventSelectSkeleton.active = false
                        if (characterNode) {
                            let selectSkeletonON = characterNode.getChildByName('POISON')
                            selectSkeletonON.active = false
                        }
                    }
                    if (!targetBattleData.healDown) {
                        let eventSelectSkeleton = itemNode.getChildByName("buff").getChildByName('HEAL_DOWN')
                        eventSelectSkeleton.active = false
                        if (characterNode) {
                            let selectSkeletonON = characterNode.getChildByName('HEAL_DOWN')
                            selectSkeletonON.active = false
                        }
                    }
                }
                await new Promise(res => setTimeout(res, 1000 / this.timeScale))
            } else {
                // 等待行动队列清空
                await Promise.all(this.actionAwaitQueue)
                this.actionAwaitQueue = []
                let effectType = fightProcess.effectType
                let multiTargetDataMap = fightProcess.multiTargetDataMap
                //是否群体
                if (fightProcess.sourceFieldStatus) {
                    if (fightProcess.aoe == 1) {
                        //判断技能是否场上释放还是场下释放
                        this.skillName.children[this.hasLetterA(fightProcess.sourceUnitId) ? 0 : 1].active = true
                        this.skillName.children[this.hasLetterA(fightProcess.sourceUnitId) ? 0 : 1].getChildByName("Label").getComponent(Label).string = eventType
                        await new Promise(res => setTimeout(res, 800 / this.timeScale))
                        let skeletons: sp.Skeleton[] = []
                        AudioMgr.inst.playOneShot("sound/fight/skill/" + effectType);

                        for (const key in multiTargetDataMap) {
                            let itemNode = this.getChracterChangXiaById(key)
                            let characterNode = this.getCharacterById(key)
                            if (characterNode) {
                                let selectSkeleton = characterNode.getChildByName(effectType).getComponent(sp.Skeleton)
                                skeletons.push(selectSkeleton)
                            }
                            let eventSelectSkeleton = itemNode.getChildByName("buff").getChildByName(effectType).getComponent(sp.Skeleton)
                            skeletons.push(eventSelectSkeleton)
                        }
                        skeletons.forEach(skeleton => {
                            skeleton.node.active = true
                            if (effectType == "POISON" || effectType == "SILENCE" || effectType == "HEAL_DOWN" || effectType == "STUN") {
                                skeleton.setAnimation(0, "animation", true);
                            } else {
                                skeleton.setAnimation(0, "animation", false);
                                const hurtPromise = this.playAnimation(skeleton)
                                this.actionAwaitQueue.push(hurtPromise)
                            }
                        })
                        for (const key in multiTargetDataMap) {
                            let itemNode = this.getChracterChangXiaById(key)
                            let characterNode = this.getCharacterById(key)
                            const targetBattleData = multiTargetDataMap[key]; // 拿到对应的值
                            if (characterNode) {
                                //伤害掉血动画
                                if (effectType == 'POISON') {
                                    //中毒无动画
                                } else if (effectType == 'HEAL' || effectType == 'HP_UP' || effectType == 'SPEED_UP') {
                                    this.showNumber(this.hasLetterA(key), characterNode, +targetBattleData.value, new math.Color(82, 201, 25, 255), 40)
                                } else {
                                    this.showNumber(this.hasLetterA(key), characterNode, -targetBattleData.value, new math.Color(255, 176, 126, 255), 40)
                                }
                                if (targetBattleData.fieldStatus) {
                                    // 更新场上生命值
                                    this.Hp.children[this.hasLetterA(key) ? 0 : 1].getComponent(ProgressBar).progress = targetBattleData.hpAfter / targetBattleData.hpBefore
                                    this.Hp.children[this.hasLetterA(key) ? 0 : 1].getChildByName("user_li_count").getComponent(Label).string = targetBattleData.hpAfter + "/" + targetBattleData.hpBefore
                                }

                            }


                            //伤害动画
                            if (effectType == 'STUN') {

                                await this.showString(1, itemNode, new math.Color(255, 0, 0), "眩晕2回合")

                            } else if (effectType == 'POISON') {

                                await this.showString(1, itemNode, new math.Color(255, 0, 0), "中毒+" + targetBattleData.value)

                            } else if (effectType == 'MAX_HP_DOWN') {
                                if (fightProcess.sourceUnitId == 'A1101' || fightProcess.sourceUnitId == 'B1101') {
                                    await this.showString(1, itemNode, new math.Color(255, 0, 0), "飞弹抗性 -" + targetBattleData.value)
                                } else {
                                    await this.showString(1, itemNode, new math.Color(255, 0, 0), "生命上限 -" + targetBattleData.value)
                                }

                            } else if (effectType == 'HP_UP') {
                                if (fightProcess.sourceUnitId == 'A1101' || fightProcess.sourceUnitId == 'B1101') {
                                    await this.showString(1, itemNode, new math.Color(0, 255, 0), "血限不减")
                                } else {
                                    await this.showString(1, itemNode, new math.Color(0, 255, 0), "生命上限 +" + targetBattleData.value)
                                }

                            } else if (effectType == 'HEAL') {
                                await this.showString(1, itemNode, new math.Color(0, 255, 0), "+" + targetBattleData.value)

                            } else if (effectType == 'SPEED_UP') {
                                await this.showString(1, itemNode, new math.Color(0, 255, 0), "速度+" + targetBattleData.value)

                            } else {
                                await this.showString(1, itemNode, new math.Color(255, 0, 0), "-" + targetBattleData.value)
                            }
                            // 更新场下生命值
                            itemNode.getChildByName("my_hp").getComponent(ProgressBar).progress = targetBattleData.hpAfter / targetBattleData.hpBefore
                            itemNode.getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = targetBattleData.hpAfter + "/" + targetBattleData.hpBefore
                        }


                    } else {
                        this.skillName.children[this.hasLetterA(fightProcess.sourceUnitId) ? 0 : 1].active = true
                        this.skillName.children[this.hasLetterA(fightProcess.sourceUnitId) ? 0 : 1].getChildByName("Label").getComponent(Label).string = eventType

                        await new Promise(res => setTimeout(res, 800 / this.timeScale))
                        let characterNode = this.getCharacterById(fightProcess.sourceUnitId)
                        let targetCharacterNode = this.getCharacterById(fightProcess.targetUnitId)
                        let targetChangXiaNode = this.getChracterChangXiaById(fightProcess.targetUnitId)
                        //伤害掉血动画
                        if (eventType == "定海神针") {
                            AudioMgr.inst.playOneShot("sound/fight/skill/DHSZ3");
                            let selectSkeleton = targetCharacterNode.getChildByName("DHSZ").getComponent(sp.Skeleton)
                            selectSkeleton.node.active = true
                            selectSkeleton.setAnimation(0, "animation", false)
                            selectSkeleton.setCompleteListener(() => {
                                selectSkeleton.node.active = false
                                AudioMgr.inst.playOneShot("sound/fight/skill/DHSZ");
                                let selectSkeleton2 = targetCharacterNode.getChildByName("DHSZ2").getComponent(sp.Skeleton)
                                selectSkeleton2.node.active = true
                                this.showNumber(this.hasLetterA(fightProcess.targetUnitId), targetCharacterNode, -fightProcess.singleTargetValue, new math.Color(255, 176, 126, 255), 40)
                                selectSkeleton2.setAnimation(0, "animation", false)
                                selectSkeleton2.setCompleteListener(() => { selectSkeleton2.node.active = false })
                            })
                            await new Promise(res => setTimeout(res, 200 / this.timeScale))
                        } else if (eventType == "北极剑意") {
                            AudioMgr.inst.playOneShot("sound/fight/skill/DHSZ3");
                            let selectSkeleton = targetCharacterNode.getChildByName("DHSZ").getComponent(sp.Skeleton)
                            selectSkeleton.node.active = true
                            selectSkeleton.setAnimation(0, "animation", false)
                            selectSkeleton.setCompleteListener(() => {
                                selectSkeleton.node.active = false
                                AudioMgr.inst.playOneShot("sound/fight/skill/DHSZ");
                                let selectSkeleton2 = targetCharacterNode.getChildByName("DHSZ2").getComponent(sp.Skeleton)
                                selectSkeleton2.node.active = true
                                this.showNumber(this.hasLetterA(fightProcess.targetUnitId), targetCharacterNode, -fightProcess.singleTargetValue, new math.Color(255, 176, 126, 255), 40)
                                selectSkeleton2.setAnimation(0, "animation", false)
                                selectSkeleton2.setCompleteListener(() => { selectSkeleton2.node.active = false })
                            })
                            await new Promise(res => setTimeout(res, 200 / this.timeScale))
                        } else if (eventType == "绝地反击") {
                            AudioMgr.inst.playOneShot("sound/fight/skill/JDFJ");
                            await util.sundry.moveNodeToPosition(

                                characterNode,
                                {
                                    targetPosition: { x: this.hasLetterA(fightProcess.sourceUnitId) ? -90 : 90, y: 0 },
                                    moveCurve: true,
                                    moveTimeScale: this.timeScale
                                }
                            )
                            AudioMgr.inst.playOneShot("sound/fight/attack/attack");
                            let hut = targetCharacterNode.getChildByName("hut").getComponent(sp.Skeleton)
                            hut.node.active = true
                            hut.setAnimation(0, "animation", false)
                            //伤害结算
                            this.showNumber(this.hasLetterA(fightProcess.sourceUnitId), targetCharacterNode, -fightProcess.singleTargetValue, new math.Color(255, 176, 126, 255), 40)
                            this.Hp.children[this.hasLetterA(fightProcess.targetUnitId) ? 0 : 1].getComponent(ProgressBar).progress = fightProcess.targetHpAfter / fightProcess.targetHpBefore
                            this.Hp.children[this.hasLetterA(fightProcess.targetUnitId) ? 0 : 1].getChildByName("user_li_count").getComponent(Label).string = fightProcess.targetHpAfter + "/" + fightProcess.targetHpBefore

                            // 更新场下生命值
                            targetChangXiaNode.getChildByName("my_hp").getComponent(ProgressBar).progress = fightProcess.targetHpAfter / fightProcess.targetHpBefore
                            targetChangXiaNode.getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = fightProcess.targetHpAfter + "/" + fightProcess.targetHpBefore
                            // hut.setCompleteListener(() => hut.node.active = false)
                            const hurtPromise = this.playAnimation(hut)
                            this.actionAwaitQueue.push(hurtPromise)
                            //回到初始位置
                            await util.sundry.moveNodeToPosition(
                                characterNode,
                                {
                                    targetPosition: { x: this.hasLetterA(fightProcess.sourceUnitId) ? 180 : -180, y: 0 },
                                    moveCurve: true,
                                    moveTimeScale: this.timeScale
                                }
                            )
                        } else if (eventType == "新月反击") {
                            AudioMgr.inst.playOneShot("sound/fight/skill/chuanyun_grial");
                            await util.sundry.moveNodeToPosition(

                                characterNode,
                                {
                                    targetPosition: { x: this.hasLetterA(fightProcess.sourceUnitId) ? -90 : 90, y: 0 },
                                    moveCurve: true,
                                    moveTimeScale: this.timeScale
                                }
                            )
                            AudioMgr.inst.playOneShot("sound/fight/attack/attack");
                            let hut = targetCharacterNode.getChildByName("hut").getComponent(sp.Skeleton)
                            hut.node.active = true
                            hut.setAnimation(0, "animation", false)
                            //伤害结算
                            this.showNumber(this.hasLetterA(fightProcess.sourceUnitId), targetCharacterNode, -fightProcess.singleTargetValue, new math.Color(255, 176, 126, 255), 40)
                            this.Hp.children[this.hasLetterA(fightProcess.targetUnitId) ? 0 : 1].getComponent(ProgressBar).progress = fightProcess.targetHpAfter / fightProcess.targetHpBefore
                            this.Hp.children[this.hasLetterA(fightProcess.targetUnitId) ? 0 : 1].getChildByName("user_li_count").getComponent(Label).string = fightProcess.targetHpAfter + "/" + fightProcess.targetHpBefore

                            // 更新场下生命值
                            targetChangXiaNode.getChildByName("my_hp").getComponent(ProgressBar).progress = fightProcess.targetHpAfter / fightProcess.targetHpBefore
                            targetChangXiaNode.getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = fightProcess.targetHpAfter + "/" + fightProcess.targetHpBefore
                            // hut.setCompleteListener(() => hut.node.active = false)
                            const hurtPromise = this.playAnimation(hut)
                            this.actionAwaitQueue.push(hurtPromise)
                            //回到初始位置
                            await util.sundry.moveNodeToPosition(
                                characterNode,
                                {
                                    targetPosition: { x: this.hasLetterA(fightProcess.sourceUnitId) ? 180 : -180, y: 0 },
                                    moveCurve: true,
                                    moveTimeScale: this.timeScale
                                }
                            )
                        } else if (eventType.includes("白天君蓄力")) {
                            let selectSkeleton
                            AudioMgr.inst.playOneShot("sound/fight/skill/XULI");
                            if (eventType == "白天君蓄力·一") {
                                characterNode.getChildByName("xuli1").active = true
                                characterNode.getChildByName("xuli2").active = false
                                characterNode.getChildByName("xuli3").active = false
                                selectSkeleton = characterNode.getChildByName("xuli1").getComponent(sp.Skeleton)
                            } else if (eventType == "白天君蓄力·二") {
                                characterNode.getChildByName("xuli1").active = false
                                characterNode.getChildByName("xuli2").active = true
                                characterNode.getChildByName("xuli3").active = false
                                selectSkeleton = characterNode.getChildByName("xuli2").getComponent(sp.Skeleton)
                            } else if (eventType == "白天君蓄力·三") {
                                characterNode.getChildByName("xuli1").active = false
                                characterNode.getChildByName("xuli2").active = false
                                characterNode.getChildByName("xuli3").active = true
                                selectSkeleton = characterNode.getChildByName("xuli3").getComponent(sp.Skeleton)
                            }
                            selectSkeleton.node.active = true
                            selectSkeleton.setAnimation(0, "animation", true)
                            await new Promise(res => setTimeout(res, 200 / this.timeScale))
                        } else if (eventType == "三火齐飞") {
                            characterNode.getChildByName("xuli1").active = false
                            characterNode.getChildByName("xuli2").active = false
                            characterNode.getChildByName("xuli3").active = false
                        } else if (eventType == "大地净化") {
                            AudioMgr.inst.playOneShot("sound/fight/skill/HOU_JH");
                            let selectSkeleton = characterNode.getChildByName("HOU_JH").getComponent(sp.Skeleton)
                            selectSkeleton.node.active = true
                            selectSkeleton.setAnimation(0, "animation", false)
                            selectSkeleton.setCompleteListener(() => {
                                selectSkeleton.node.active = false

                                let STUNX = targetChangXiaNode.getChildByName("buff").getChildByName('STUN')
                                STUNX.active = false
                                let STUN = targetCharacterNode.getChildByName('STUN')
                                STUN.active = false


                                let POISONX = targetChangXiaNode.getChildByName("buff").getChildByName('POISON')
                                POISONX.active = false
                                let POISON = targetCharacterNode.getChildByName('POISON')
                                POISON.active = false


                                let HEAL_DOWNX = targetChangXiaNode.getChildByName("buff").getChildByName('HEAL_DOWN')
                                HEAL_DOWNX.active = false
                                let HEAL_DOWN = targetCharacterNode.getChildByName('HEAL_DOWN')
                                HEAL_DOWN.active = false

                            })
                            // const hurtPromise = this.playAnimation(selectSkeleton)
                            // this.actionAwaitQueue.push(hurtPromise)
                            // await new Promise(res => setTimeout(res, 200 / this.timeScale))
                        } else if (eventType == "满目桃花") {
                            AudioMgr.inst.playOneShot("sound/fight/skill/manmutaohua");
                            let selectSkeleton = characterNode.getChildByName("manmutaohua").getComponent(sp.Skeleton)
                            selectSkeleton.node.active = true
                            selectSkeleton.setAnimation(0, "animation", false)
                            // selectSkeleton.setCompleteListener(() => selectSkeleton.node.active = false)
                            const hurtPromise = this.playAnimation(selectSkeleton)
                            this.actionAwaitQueue.push(hurtPromise)
                            // await new Promise(res => setTimeout(res, 200 / this.timeScale))
                        } else if (eventType == "圣灵瀑" || eventType == "圣灵泉涌") {
                            AudioMgr.inst.playOneShot("sound/fight/skill/MISSILE_DAMAGE");
                            let selectSkeleton = targetCharacterNode.getChildByName("MISSILE_DAMAGE").getComponent(sp.Skeleton)
                            selectSkeleton.node.active = true
                            selectSkeleton.setAnimation(0, "animation", false)
                            // selectSkeleton.setCompleteListener(() => selectSkeleton.node.active = false)
                            const hurtPromise = this.playAnimation(selectSkeleton)
                            this.actionAwaitQueue.push(hurtPromise)
                            // await new Promise(res => setTimeout(res, 200 / this.timeScale))
                        } else if (eventType == "毒伤迸发") {
                            AudioMgr.inst.playOneShot("sound/fight/skill/1004");
                            let hut = targetCharacterNode.getChildByName("hut").getComponent(sp.Skeleton)
                            hut.node.active = true
                            hut.setAnimation(0, "animation", false)
                            hut.setCompleteListener(() => { hut.node.active = false })
                        } else if (eventType == "穿云斩" || eventType == "穿云剑") {
                            AudioMgr.inst.playOneShot("sound/fight/skill/chuanyun_grial");
                            let selectSkeleton = characterNode.getChildByName("chuanyun").getComponent(sp.Skeleton)
                            selectSkeleton.node.active = true
                            selectSkeleton.setAnimation(0, "animation", false)
                            selectSkeleton.setCompleteListener(async () => {
                                selectSkeleton.node.active = false
                                AudioMgr.inst.playOneShot("sound/fight/skill/1004");
                                let selectSkeleton2 = targetChangXiaNode.getChildByName("buff").getChildByName("chuanyun").getComponent(sp.Skeleton)
                                selectSkeleton2.node.active = true
                                await this.showString(1, targetChangXiaNode, new math.Color(255, 0, 0), fightProcess.extraDesc)
                                selectSkeleton2.setAnimation(0, "animation", false)
                                selectSkeleton2.setCompleteListener(() => { selectSkeleton2.node.active = false })
                            })
                            // await new Promise(res => setTimeout(res, 200 / this.timeScale))
                        } else if (eventType == "穿云长枪" || eventType == "圣灵斩") {
                            AudioMgr.inst.playOneShot("sound/fight/skill/chuanyun_man");
                            let selectSkeleton = characterNode.getChildByName("chuanyun").getComponent(sp.Skeleton)
                            selectSkeleton.node.active = true
                            selectSkeleton.setAnimation(0, "animation", false)
                            selectSkeleton.setCompleteListener(async () => {
                                selectSkeleton.node.active = false
                                AudioMgr.inst.playOneShot("sound/fight/skill/1004");
                                let selectSkeleton2 = targetChangXiaNode.getChildByName("buff").getChildByName("chuanyun").getComponent(sp.Skeleton)
                                selectSkeleton2.node.active = true
                                await this.showString(1, targetChangXiaNode, new math.Color(255, 0, 0), fightProcess.extraDesc)
                                selectSkeleton2.setAnimation(0, "animation", false)
                                selectSkeleton2.setCompleteListener(() => { selectSkeleton2.node.active = false })
                            })
                            // await new Promise(res => setTimeout(res, 200 / this.timeScale))
                        } else if (effectType == 'ATTACK_UP' || effectType == 'ATTACK_UP_PRET'
                            || effectType == 'ATTACK_RESIST_BOOST' || effectType == 'ATTACK_RESIST_BOOST_PRET'
                            || effectType == 'FIRE_BOOST' || effectType == 'FIRE_BOOST_PRET'
                            || effectType == 'FIRE_RESIST_BOOST' || effectType == 'FIRE_RESIST_BOOST_PRET'
                            || effectType == 'POISON_BOOST' || effectType == 'POISON_BOOST_PRET'
                            || effectType == 'POISON_RESIST_BOOST' || effectType == 'POISON_RESIST_BOOST_PRET'
                            || effectType == 'MISSILE_BOOST' || effectType == 'MISSILE_BOOST_PRET'
                            || effectType == 'MISSILE_RESIST_BOOST' || effectType == 'MISSILE_RESIST_BOOST_PRET'
                            || effectType == 'HP_UP' || effectType == 'HP_UP_PRET' || effectType == 'BLOODTHIRST' || effectType == 'HEAL'
                            || effectType == 'SPEED_UP' || effectType == 'SPEED_UP_PRET') {
                            AudioMgr.inst.playOneShot("sound/fight/skill/HP_UP");
                            if (fightProcess.targetFieldStatus) {
                                let selectSkeleton = targetCharacterNode.getChildByName("HP_UP").getComponent(sp.Skeleton)
                                selectSkeleton.node.active = true
                                selectSkeleton.setAnimation(0, "animation", false)
                                selectSkeleton.setCompleteListener(async () => {
                                    selectSkeleton.node.active = false
                                    this.showNumber(this.hasLetterA(fightProcess.targetUnitId), targetCharacterNode, +fightProcess.singleTargetValue, new math.Color(82, 201, 25, 255), 40)
                                    await this.showString(1, targetChangXiaNode, new math.Color(0, 255, 0), fightProcess.extraDesc)
                                })
                            } else {
                                let selectSkeleton2 = targetChangXiaNode.getChildByName("buff").getChildByName("HP_UP").getComponent(sp.Skeleton)
                                selectSkeleton2.node.active = true
                                await this.showString(1, targetChangXiaNode, new math.Color(0, 255, 0), fightProcess.extraDesc)
                                selectSkeleton2.setAnimation(0, "animation", false)
                                selectSkeleton2.setCompleteListener(() => { selectSkeleton2.node.active = false })
                            }

                        } else if (effectType == 'ATTACK_DOWN' || effectType == 'ATTACK_DOWN_PRET'
                            || effectType == 'ATTACK_RESIST_DOWN' || effectType == 'ATTACK_RESIST_DOWN_PRET'
                            || effectType == 'FIRE_DOWN' || effectType == 'FIRE_DOWN_PRET'
                            || effectType == 'FIRE_RESIST_DOWN' || effectType == 'FIRE_RESIST_DOWN_PRET'
                            || effectType == 'POISON_DOWN' || effectType == 'POISON_DOWN_PRET'
                            || effectType == 'POISON_RESIST_DOWN' || effectType == 'POISON_RESIST_DOWN_PRET'
                            || effectType == 'MISSILE_DOWN' || effectType == 'MISSILE_DOWN_PRET'
                            || effectType == 'MISSILE_RESIST_DOWN' || effectType == 'MISSILE_RESIST_DOWN_PRET'
                            || effectType == 'MAX_HP_DOWN' || effectType == 'MAX_HP_DOWN_PRET'
                            || effectType == 'SPEED_DOWN' || effectType == 'SPEED_DOWN_PRET') {
                            AudioMgr.inst.playOneShot("sound/fight/skill/MAX_HP_DOWN");
                            if (fightProcess.targetFieldStatus) {
                                let selectSkeleton = targetCharacterNode.getChildByName("MAX_HP_DOWN").getComponent(sp.Skeleton)
                                selectSkeleton.node.active = true
                                selectSkeleton.setAnimation(0, "animation", false)
                                selectSkeleton.setCompleteListener(async () => {
                                    selectSkeleton.node.active = false
                                    this.showNumber(this.hasLetterA(fightProcess.targetUnitId), targetCharacterNode, -fightProcess.singleTargetValue, new math.Color(255, 176, 126, 255), 40)
                                    await this.showString(1, targetChangXiaNode, new math.Color(255, 0, 0), fightProcess.extraDesc)
                                })
                            } else {
                                let selectSkeleton2 = targetChangXiaNode.getChildByName("buff").getChildByName("MAX_HP_DOWN").getComponent(sp.Skeleton)
                                selectSkeleton2.node.active = true
                                await this.showString(1, targetChangXiaNode, new math.Color(255, 0, 0), fightProcess.extraDesc)
                                selectSkeleton2.setAnimation(0, "animation", false)
                                selectSkeleton2.setCompleteListener(() => { selectSkeleton2.node.active = false })
                            }

                        } else {
                            if (fightProcess.targetFieldStatus) {
                                this.showNumber(this.hasLetterA(fightProcess.targetUnitId), targetCharacterNode, -fightProcess.singleTargetValue, new math.Color(255, 176, 126, 255), 40)
                                let hut = targetCharacterNode.getChildByName(effectType).getComponent(sp.Skeleton)
                                hut.node.active = true
                                hut.setAnimation(0, "animation", false)
                                hut.setCompleteListener(() => { hut.node.active = false })
                            }
                            AudioMgr.inst.playOneShot("sound/fight/skill/" + effectType);
                            await this.showString(1, targetChangXiaNode, new math.Color(255, 0, 0), fightProcess.extraDesc)
                        }

                        if (fightProcess.targetFieldStatus) {
                            // 更新场上生命值
                            this.Hp.children[this.hasLetterA(fightProcess.targetUnitId) ? 0 : 1].getComponent(ProgressBar).progress = fightProcess.targetHpAfter / fightProcess.targetHpBefore
                            this.Hp.children[this.hasLetterA(fightProcess.targetUnitId) ? 0 : 1].getChildByName("user_li_count").getComponent(Label).string = fightProcess.targetHpAfter + "/" + fightProcess.targetHpBefore
                        }


                        // 更新场下生命值
                        targetChangXiaNode.getChildByName("my_hp").getComponent(ProgressBar).progress = fightProcess.targetHpAfter / fightProcess.targetHpBefore
                        targetChangXiaNode.getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = fightProcess.targetHpAfter + "/" + fightProcess.targetHpBefore

                    }
                } else {
                    // let characterNode = this.getCharacterById(fightProcess.sourceUnitId)
                    let characterItemNode = this.getChracterChangXiaById(fightProcess.sourceUnitId)
                    // let targetCharacterNode = this.getCharacterById(fightProcess.targetUnitId)
                    // let targetChangXiaNode = this.getChracterChangXiaById(fightProcess.targetUnitId)
                    //技能区分全体和单体技能
                    let selectSkeleton = characterItemNode.getChildByName("select").getComponent(sp.Skeleton)
                    selectSkeleton.node.active = true
                    selectSkeleton.setAnimation(0, "animation", false)
                    tween(characterItemNode)
                        .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
                        .call(async () => {
                            if (effectType == 'HEAL' || effectType == 'XU_HEAL') {
                                AudioMgr.inst.playOneShot("sound/fight/skill/HEAL");
                            } else if (effectType == 'ATTACK_UP' || effectType == 'ATTACK_UP_PRET'
                                || effectType == 'ATTACK_RESIST_BOOST' || effectType == 'ATTACK_RESIST_BOOST_PRET'
                                || effectType == 'FIRE_BOOST' || effectType == 'FIRE_BOOST_PRET'
                                || effectType == 'FIRE_RESIST_BOOST' || effectType == 'FIRE_RESIST_BOOST_PRET'
                                || effectType == 'POISON_BOOST' || effectType == 'POISON_BOOST_PRET'
                                || effectType == 'POISON_RESIST_BOOST' || effectType == 'POISON_RESIST_BOOST_PRET'
                                || effectType == 'MISSILE_BOOST' || effectType == 'MISSILE_BOOST_PRET'
                                || effectType == 'MISSILE_RESIST_BOOST' || effectType == 'MISSILE_RESIST_BOOST_PRET'
                                || effectType == 'HP_UP' || effectType == 'HP_UP_PRET' || effectType == 'BLOODTHIRST'
                                || effectType == 'SPEED_UP' || effectType == 'SPEED_UP_PRET') {
                                AudioMgr.inst.playOneShot("sound/fight/skill/HP_UP");
                            } else if (effectType == 'ATTACK_DOWN' || effectType == 'ATTACK_DOWN_PRET'
                                || effectType == 'ATTACK_RESIST_DOWN' || effectType == 'ATTACK_RESIST_DOWN_PRET'
                                || effectType == 'FIRE_DOWN' || effectType == 'FIRE_DOWN_PRET'
                                || effectType == 'FIRE_RESIST_DOWN' || effectType == 'FIRE_RESIST_DOWN_PRET'
                                || effectType == 'POISON_DOWN' || effectType == 'POISON_DOWN_PRET'
                                || effectType == 'POISON_RESIST_DOWN' || effectType == 'POISON_RESIST_DOWN_PRET'
                                || effectType == 'MISSILE_DOWN' || effectType == 'MISSILE_DOWN_PRET'
                                || effectType == 'MISSILE_RESIST_DOWN' || effectType == 'MISSILE_RESIST_DOWN_PRET'
                                || effectType == 'MAX_HP_DOWN' || effectType == 'MAX_HP_DOWN_PRET'
                                || effectType == 'SPEED_DOWN' || effectType == 'SPEED_DOWN_PRET') {
                                AudioMgr.inst.playOneShot("sound/fight/skill/MAX_HP_DOWN");
                            } else {
                                AudioMgr.inst.playOneShot("sound/fight/skill/" + effectType);
                            }
                            await this.showString(1, characterItemNode, new math.Color(236, 163, 61, 255), eventType)
                            await new Promise(res => setTimeout(res, 300 / this.timeScale))
                            if (fightProcess.aoe == '1') {
                                let skeletons: sp.Skeleton[] = []
                                for (const key in multiTargetDataMap) {
                                    let itemNode = this.getChracterChangXiaById(key)
                                    let characterNode = this.getCharacterById(key)
                                    if (characterNode) {
                                        let selectSkeleton = characterNode.getChildByName(effectType).getComponent(sp.Skeleton)
                                        skeletons.push(selectSkeleton)
                                    }
                                    let eventSelectSkeleton = itemNode.getChildByName("buff").getChildByName(effectType).getComponent(sp.Skeleton)
                                    skeletons.push(eventSelectSkeleton)
                                }
                                skeletons.forEach(skeleton => {
                                    skeleton.node.active = true
                                    skeleton.setAnimation(0, "animation", false);
                                });
                                for (const key in multiTargetDataMap) {
                                    let itemNode = this.getChracterChangXiaById(key)
                                    let targetCharacterNode = this.getCharacterById(key)
                                    const targetBattleData = multiTargetDataMap[key]; // 拿到对应的值
                                    if (targetCharacterNode) {
                                        if (effectType == 'HEAL' || effectType == 'HP_UP') {
                                            this.showNumber(this.hasLetterA(key), targetCharacterNode, +targetBattleData.value, new math.Color(82, 201, 25, 255), 40)
                                        } else {
                                            this.showNumber(this.hasLetterA(key), targetCharacterNode, -targetBattleData.value, new math.Color(255, 176, 126, 255), 40)
                                        }
                                        this.Hp.children[this.hasLetterA(key) ? 0 : 1].getComponent(ProgressBar).progress = targetBattleData.hpAfter / targetBattleData.hpBefore
                                        this.Hp.children[this.hasLetterA(key) ? 0 : 1].getChildByName("user_li_count").getComponent(Label).string = targetBattleData.hpAfter + "/" + targetBattleData.hpBefore
                                    }
                                    //伤害动画
                                    if (effectType == 'MAX_HP_DOWN') {
                                        let result = "生命上限 -" + targetBattleData.value;
                                        await this.showString(1, itemNode, new math.Color(255, 0, 0), result)
                                    } else if (effectType == 'HP_UP') {
                                        await this.showString(1, itemNode, new math.Color(0, 255, 0), "+" + targetBattleData.value)
                                    } else if (effectType == 'HEAL') {
                                        await this.showString(1, itemNode, new math.Color(0, 255, 0), "+" + targetBattleData.value)
                                    } else {
                                        await this.showString(1, itemNode, new math.Color(255, 0, 0), "-" + targetBattleData.value)
                                    }
                                    // 更新场下生命值
                                    itemNode.getChildByName("my_hp").getComponent(ProgressBar).progress = targetBattleData.hpAfter / targetBattleData.hpBefore
                                    itemNode.getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = targetBattleData.hpAfter + "/" + targetBattleData.hpBefore
                                }
                                skeletons.forEach(skeleton => {
                                    // skeleton.setCompleteListener(() => skeleton.node.active = false)
                                    const hurtPromise = this.playAnimation(skeleton)
                                    this.actionAwaitQueue.push(hurtPromise)
                                });
                            } else {
                                let characterNode = this.getCharacterById(fightProcess.sourceUnitId)
                                let characterItemNode = this.getChracterChangXiaById(fightProcess.sourceUnitId)
                                let targetCharacterNode = this.getCharacterById(fightProcess.targetUnitId)
                                let targetChangXiaNode = this.getChracterChangXiaById(fightProcess.targetUnitId)
                                if (fightProcess.targetFieldStatus) {
                                    let effectTypeName = effectType
                                    if (effectType == 'XU_HEAL') {
                                        effectTypeName = 'HEAL'
                                        await this.showString(1, characterItemNode, new math.Color(255, 0, 0), "-" + fightProcess.sourceSelfValue)
                                        // 更新场下生命值
                                        characterItemNode.getChildByName("my_hp").getComponent(ProgressBar).progress = fightProcess.sourceHpAfter / fightProcess.sourceHpBefore
                                        characterItemNode.getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = fightProcess.sourceHpAfter + "/" + fightProcess.sourceHpBefore

                                    }


                                    let selectSkeleton = targetCharacterNode.getChildByName(effectTypeName).getComponent(sp.Skeleton)
                                    selectSkeleton.node.active = true
                                    if (effectType == "POISON" || effectType == "SILENCE" || effectType == "HEAL_DOWN" || effectType == "STUN") {
                                        selectSkeleton.setAnimation(0, "animation", true)
                                    } else {
                                        selectSkeleton.setAnimation(0, "animation", false)
                                    }
                                    await new Promise(res => setTimeout(res, 500 / this.timeScale))
                                    //伤害掉血动画
                                    if (effectType == "POISON" || effectType == "SILENCE" || effectType == "HEAL_DOWN" || effectType == "STUN") {
                                        //中毒无动画
                                    } else if (effectType == 'ATTACK_UP') {
                                        //暂无展示
                                    } else if (effectType == 'HEAL' || effectType == 'HP_UP' || effectType == 'XU_HEAL') {
                                        this.showNumber(this.hasLetterA(fightProcess.targetUnitId), targetCharacterNode, +fightProcess.singleTargetValue, new math.Color(82, 201, 25, 255), 40)
                                    } else {
                                        this.showNumber(this.hasLetterA(fightProcess.targetUnitId), targetCharacterNode, -fightProcess.singleTargetValue, new math.Color(255, 176, 126, 255), 40)
                                    }

                                    // 更新场上生命值
                                    this.Hp.children[this.hasLetterA(fightProcess.targetUnitId) ? 0 : 1].getComponent(ProgressBar).progress = fightProcess.targetHpAfter / fightProcess.targetHpBefore
                                    this.Hp.children[this.hasLetterA(fightProcess.targetUnitId) ? 0 : 1].getChildByName("user_li_count").getComponent(Label).string = fightProcess.targetHpAfter + "/" + fightProcess.targetHpBefore
                                    if (effectType != "POISON" && effectType != "SILENCE" && effectType != "HEAL_DOWN" && effectType != "STUN") {
                                        // selectSkeleton.setCompleteListener(() => selectSkeleton.node.active = false)
                                        const hurtPromise = this.playAnimation(selectSkeleton)
                                        this.actionAwaitQueue.push(hurtPromise)
                                    }
                                }
                                let effectTypeName = effectType
                                if (effectType == 'XU_HEAL') {
                                    effectTypeName = 'HEAL'
                                }
                                if (effectType == 'ATTACK_UP' || effectType == 'ATTACK_UP_PRET'
                                    || effectType == 'ATTACK_RESIST_BOOST' || effectType == 'ATTACK_RESIST_BOOST_PRET'
                                    || effectType == 'FIRE_BOOST' || effectType == 'FIRE_BOOST_PRET'
                                    || effectType == 'FIRE_RESIST_BOOST' || effectType == 'FIRE_RESIST_BOOST_PRET'
                                    || effectType == 'POISON_BOOST' || effectType == 'POISON_BOOST_PRET'
                                    || effectType == 'POISON_RESIST_BOOST' || effectType == 'POISON_RESIST_BOOST_PRET'
                                    || effectType == 'MISSILE_BOOST' || effectType == 'MISSILE_BOOST_PRET'
                                    || effectType == 'MISSILE_RESIST_BOOST' || effectType == 'MISSILE_RESIST_BOOST_PRET'
                                    || effectType == 'HP_UP' || effectType == 'HP_UP_PRET' || effectType == 'BLOODTHIRST'
                                    || effectType == 'SPEED_UP' || effectType == 'SPEED_UP_PRET') {
                                    effectTypeName = 'HP_UP'
                                }

                                if (effectType == 'ATTACK_DOWN' || effectType == 'ATTACK_DOWN_PRET'
                                    || effectType == 'ATTACK_RESIST_DOWN' || effectType == 'ATTACK_RESIST_DOWN_PRET'
                                    || effectType == 'FIRE_DOWN' || effectType == 'FIRE_DOWN_PRET'
                                    || effectType == 'FIRE_RESIST_DOWN' || effectType == 'FIRE_RESIST_DOWN_PRET'
                                    || effectType == 'POISON_DOWN' || effectType == 'POISON_DOWN_PRET'
                                    || effectType == 'POISON_RESIST_DOWN' || effectType == 'POISON_RESIST_DOWN_PRET'
                                    || effectType == 'MISSILE_DOWN' || effectType == 'MISSILE_DOWN_PRET'
                                    || effectType == 'MISSILE_RESIST_DOWN' || effectType == 'MISSILE_RESIST_DOWN_PRET'
                                    || effectType == 'MAX_HP_DOWN' || effectType == 'MAX_HP_DOWN_PRET'
                                    || effectType == 'SPEED_DOWN' || effectType == 'SPEED_DOWN_PRET') {
                                    effectTypeName = 'MAX_HP_DOWN'
                                }
                                //console.log("effectTypeName------", effectTypeName)
                                let eventSelectSkeleton = targetChangXiaNode.getChildByName("buff").getChildByName(effectTypeName).getComponent(sp.Skeleton)
                                eventSelectSkeleton.node.active = true
                                if (effectType == "POISON" || effectType == "SILENCE" || effectType == "HEAL_DOWN" || effectType == "STUN") {
                                    eventSelectSkeleton.setAnimation(0, "animation", true)
                                } else {
                                    eventSelectSkeleton.setAnimation(0, "animation", false)
                                }



                                //伤害动画
                                if (effectType == 'HEAL' || effectType == 'HP_UP' || effectType == 'SPEED_UP' || effectType == 'XU_HEAL'
                                    || effectType == 'ATTACK_UP' || effectType == 'BLOODTHIRST' || effectType == 'FIRE_BOOST'
                                    || effectType == 'HEAL_BOOST' || effectType == 'HEAL_BOOST' || effectType == 'POISON_BOOST'
                                    || effectType == 'MISSILE_BOOST') {
                                    await this.showString(1, targetChangXiaNode, new math.Color(0, 255, 0), fightProcess.extraDesc)

                                } else {
                                    await this.showString(1, targetChangXiaNode, new math.Color(255, 0, 0), fightProcess.extraDesc)

                                }



                                // 更新场下生命值
                                targetChangXiaNode.getChildByName("my_hp").getComponent(ProgressBar).progress = fightProcess.targetHpAfter / fightProcess.targetHpBefore
                                targetChangXiaNode.getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = fightProcess.targetHpAfter + "/" + fightProcess.targetHpBefore
                                if (effectType != "POISON" && effectType != "SILENCE" && effectType != "HEAL_DOWN" && effectType != "STUN") {
                                    const hurtPromise = this.playAnimation(eventSelectSkeleton)
                                    this.actionAwaitQueue.push(hurtPromise)
                                }
                            }
                        })
                        .by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
                        .start();
                    // selectSkeleton.setCompleteListener(() => selectSkeleton.node.active = false)
                    const hurtPromise = this.playAnimation(selectSkeleton)
                    this.actionAwaitQueue.push(hurtPromise)
                }
                this.skillName.children[this.hasLetterA(fightProcess.sourceUnitId) ? 0 : 1].active = false
                await new Promise(res => setTimeout(res, 1500 / this.timeScale))


            }
        }

        return this.result
    }


    // 1. 给 playAnimation 添加超时机制，防止动画不回调
    async playAnimation(Skeleton: sp.Skeleton) {
        return new Promise<void>(res => {
            if (!Skeleton) {
                res(); // 没有骨骼组件直接完成
                return;
            }
            if (!Skeleton.node) {
                res(); // 没有骨骼组件直接完成
                return;
            }


            if (!(Skeleton instanceof sp.Skeleton)) {
                res(); // 非骨骼组件直接完成
                return;
            }

            // 超时保护：5秒后强制完成
            const timeout = setTimeout(() => {
                console.warn("骨骼动画播放超时，强制完成");
                Skeleton.node.active = false;
                res();
            }, 5000);

            Skeleton.setCompleteListener(() => {
                clearTimeout(timeout); // 清除超时
                Skeleton.node.active = false;
                res();
            });
        });
    }
    async tweenToPromise(node: Node, duration: number, props: any, options?: { easing: string }) {
        return new Promise<void>(res => {
            tween(node)
                .to(duration, props, { easing: 'elasticOut' })
                .call(() => res()) // 动画完成后执行resolve
                .start();
        });
    };
    parseGuardianEffects(str) {
        // 边界防护：空字符串直接返回空数组
        if (!str || typeof str !== 'string') {
            return [];
        }

        // 步骤1：正则匹配所有 [阵营+角色:效果列表] 块
        // 正则说明：匹配 [A角色名_数字:效果1|值,效果2|值...] 格式的内容
        const blockReg = /\[([^:\]]+):([^\]]+)\]/g;
        const result = [];
        let match;

        // 步骤2：遍历每个匹配到的角色块
        while ((match = blockReg.exec(str)) !== null) {
            const [, roleInfo, effectStr] = match; // 解构：roleInfo=A白天君_1，effectStr=POISON|0,BURN|0...

            // 步骤3：解析角色基础信息（阵营、名称、位置）
            // 匹配 阵营+名称+位置（如 A白天君_1 → 阵营A，名称白天君，位置1）
            const roleReg = /^([AB])(.+?)_(\d+)$/;
            const roleMatch = roleInfo.match(roleReg);

            if (!roleMatch) {
                //console.warn(`角色信息格式错误，跳过：${roleInfo}`);
                continue;
            }

            const [, camp, name, position] = roleMatch;

            // 步骤4：解析效果列表（POISON|0 → {type: 'POISON', value: 0}）
            const effects = [];
            const effectMap = {}; // 额外生成key-value映射，方便快速查找
            if (effectStr) {
                effectStr.split(',').forEach(effectItem => {
                    const [type, value] = effectItem.split('|');
                    if (type && value !== undefined) {
                        const effectObj = {
                            type: type.trim(),
                            value: parseInt(value.trim(), 10) || 0 // 转数字，非数字则默认0
                        };
                        effects.push(effectObj);
                        effectMap[effectObj.type] = effectObj.value;
                    }
                });
            }

            // 步骤5：组装角色对象并加入结果数组
            result.push({
                camp,          // 阵营：A/B
                name,          // 角色名：白天君、真武大帝等
                position: parseInt(position, 10), // 位置：1/2/3/4/5
                effects,       // 效果列表（数组）：[{type: 'POISON', value: 0}, ...]
                effectMap      // 效果映射（对象）：{POISON: 0, BURN: 0, ...}
            });
        }

        return result;
    }
    /** 
     * 显示数值
     * num 为数值
     * color 是颜色
     */
    async showNumber(falge: boolean, character: Node, num: number, color: math.Color, size: number = 28) {
        let i = 1
        if (falge) {
            i = -1
        }
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
        if (this.isOverFight) {
            if (!numberNode || !numberNode.position || !numberNode.position.x || !numberNode.position.y || !numberNode.position.z) return
        }
        numberNode.active = true
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
    async showString(i, character: Node, color: math.Color, str: string) {
        const node = new Node
        node.setScale(
            Math.abs(node.scale.x) * i,
            node.scale.y,
            node.scale.z,
        )
        const label = node.addComponent(Label)
        label.font = await util.bundle.load("font/fzcy", Font)
        label.string = str
        label.fontSize = 30
        label.color = color
        // label.color = new math.Color(236, 163, 61, 255)
        if (this.isOverFight) {
            if (!node || !node.position || !node.position.x || !node.position.y || !node.position.z) return
        }
        character.addChild(node)
        let index = 0
        const inter = setInterval(() => {
            if (index++ > 45) {
                clearInterval(inter)
                character.removeChild(node)
                return
            }
            node.setPosition(node.position.x, node.position.y + 2.5, node.position.z)
        }, 20)
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

