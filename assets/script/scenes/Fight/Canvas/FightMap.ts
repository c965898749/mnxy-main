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
import { ItemCtrl } from '../../Home/Canvas/Tiem/ItemCtrl';
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

    L1 = null;
    R1 = null;

    parseCharacterString(str: string): ParseResult {
        // 正则匹配：标识[A/B]、号位[1号位]、名称[牛魔王]、属性[HP=xxx,...]
        const regex = /([A-Z])\[([^:]+):([^:]+):([^\]]+)\]/g;
        const result: ParseResult = {};
        let match: RegExpExecArray | null;

        while ((match = regex.exec(str)) !== null) {
            const [, key, positionText, name, attrsStr] = match;

            // 提取号位数字并减1（如"1号位"→1→0）
            const positionNum = parseInt(positionText.replace(/[^\d]/g, ''), 10) - 1 || 0;

            // 解析属性
            const attrs: CharacterAttributes = { HP: [0, 0], ATK: 0, SPEED: 0 };
            attrsStr.split(',').forEach(attr => {
                const [k, v] = attr.split('=');
                if (!k || !v) return;

                switch (k) {
                    case 'HP':
                        const hpParts = v.split('/').map(Number);
                        attrs.HP = [hpParts[0] || 0, hpParts[1] || 0];
                        break;
                    case 'ATK':
                        attrs.ATK = Number(v) || 0;
                        break;
                    case 'SPEED':
                        attrs.SPEED = Number(v) || 0;
                        break;
                }
            });

            // 构建角色对象（存储处理后的号位数字）
            result[key] = {
                position: positionNum,
                name,
                ...attrs
            };
        }

        return result;
    }
    filterArray(arrA, arrB, side) {
        return arrA.filter(itemA =>
            !arrB.some(itemB =>
                itemB.side === side && itemB.position === itemA
            )
        );
    }

    parseEventString(str: string): EventData {
        // 分离事件描述和单位数据部分
        const [eventDesc, unitsStr] = str.split(' - ');
        const units: Unit[] = [];

        // 分割每个单位的数据
        if (unitsStr) {
            const unitEntries = unitsStr.split(',');

            // 正则表达式匹配单位信息：/([AB])\s*([^[]+)\[\s*(\d+)号位:\s*HP:(\d+)→(\d+)\s*\]/
            const unitRegex = /([AB])\s*([^[]+)\[\s*(\d+)号位:\s*HP:(\d+)→(\d+)\s*\]/;

            unitEntries.forEach(entry => {
                const match = entry.match(unitRegex);
                if (match) {
                    const [, side, name, positionStr, beforeHpStr, afterHpStr] = match;
                    units.push({
                        side,
                        name: name.trim(),
                        position: parseInt(positionStr, 10),
                        hp: {
                            before: parseInt(beforeHpStr, 10),
                            after: parseInt(afterHpStr, 10)
                        }
                    });
                }
            });


        }
        return {
            event: eventDesc.trim(),
            units
        };
    }

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
        fetch(config.ServerUrl.url + "playBattle2", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                //console.log(data); // 处理响应数据
                if (data.success == '1') {
                    console.log(data, 4444)
                    var map = data.data;
                    this.fightProcess = map['battleLogs'];
                    const campA = map['campA'];
                    const campB = map['campB'];
                    // this.name0.getComponent(Label).string = campA.filter(x=>x.id!=null)[0].name
                    // this.name1.getComponent(Label).string = campB.filter(x=>x.onField)[0].name
                    // this.result = map['result'];
                    this.L1 = campA
                    this.R1 = campB
                    for (var i = 0; i < campA.length; i++) {
                        this.tiem.children[0].children[campA[i].goIntoNum - 1].getChildByName("header").getComponent(Sprite).spriteFrame =
                            await util.bundle.load(`game/texture/frames/hero/Header/${campA[i].id}/spriteFrame`, SpriteFrame)
                        this.tiem.children[0].children[campA[i].goIntoNum - 1].getChildByName("my_hp").active = true
                        this.tiem.children[0].children[campA[i].goIntoNum - 1].getChildByName("my_hp").getChildByName("Bar").setScale(
                            campA[i].maxHp / campA[i].maxHp,
                            1,
                            1
                        )
                        this.tiem.children[0].children[campA[i].goIntoNum - 1].getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = campA[i].maxHp + "/" + campA[i].maxHp
                    }
                    for (var i = 0; i < campB.length; i++) {
                        this.tiem.children[1].children[campB[i].goIntoNum - 1].getChildByName("header").getComponent(Sprite).spriteFrame =
                            await util.bundle.load(`game/texture/frames/hero/Header/${campB[i].id}/spriteFrame`, SpriteFrame)
                        this.tiem.children[1].children[campB[i].goIntoNum - 1].getChildByName("my_hp").active = true
                        this.tiem.children[1].children[campB[i].goIntoNum - 1].getChildByName("my_hp").getChildByName("Bar").setScale(
                            campB[i].maxHp / campB[i].maxHp,
                            1,
                            1
                        )
                        this.tiem.children[1].children[campB[i].goIntoNum - 1].getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = campB[i].maxHp + "/" + campB[i].maxHp
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
        //初始化登场
        let character_0 = this.L1.filter(x => x.goIntoNum == 1)[0];
        let character_1 = this.R1.filter(x => x.goIntoNum == 1)[0];
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
            character_0.maxHp / character_0.maxHp,
            1,
            1
        )
        this.Hp.children[0].getChildByName("user_li_count").getComponent(Label).string = character_0.maxHp + "/" + character_0.maxHp
        this.Character.children[1].setPosition(180, 0, 0)

        const meta = CharacterEnum[character_1.id]
        this.Character.children[1].getComponent(Sprite).spriteFrame = await util.bundle.load(meta.AvatarPath, SpriteFrame)
        // 更新生命值
        this.Hp.children[1].getChildByName("Bar").setScale(
            character_1.maxHp / character_1.maxHp,
            1,
            1
        )
        this.Hp.children[1].getChildByName("user_li_count").getComponent(Label).string = character_1.maxHp + "/" + character_1.maxHp
        for (var i = 0; i < this.fightProcess.length; i++) {
            let fightProcess = this.fightProcess[i]
            let eventType = fightProcess.eventType
            let fieldUnitsStatus = fightProcess.fieldUnitsStatus
            this.currentRound = fightProcess.round
            if (eventType == "UNIT_ENTER") {
                let characters = this.parseCharacterString(fieldUnitsStatus)
                let charactersA = characters.A
                let charactersB = characters.B
                let character_0 = this.L1.filter(x => x.goIntoNum - 1 == charactersA.position)[0];
                let character_1 = this.R1.filter(x => x.goIntoNum - 1 == charactersB.position)[0];
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
                    charactersA.HP[0] / charactersA.HP[1],
                    1,
                    1
                )
                this.Hp.children[0].getChildByName("user_li_count").getComponent(Label).string = charactersA.HP[0] + "/" + charactersA.HP[1]
                this.Character.children[1].setPosition(180, 0, 0)

                const meta = CharacterEnum[character_1.id]
                this.Character.children[1].getComponent(Sprite).spriteFrame = await util.bundle.load(meta.AvatarPath, SpriteFrame)
                // 更新生命值
                this.Hp.children[1].getChildByName("Bar").setScale(
                    charactersB.HP[0] / charactersB.HP[1],
                    1,
                    1
                )
                this.Hp.children[1].getChildByName("user_li_count").getComponent(Label).string = charactersB.HP[0] + "/" + charactersB.HP[1]

            } else if (eventType == "ROUND_START") {
                let characters = this.parseCharacterString(fieldUnitsStatus)
                let charactersA = characters.A
                let charactersB = characters.B
                let character_0 = this.L1.filter(x => x.goIntoNum - 1 == charactersA.position)[0];
                let character_1 = this.R1.filter(x => x.goIntoNum - 1 == charactersB.position)[0];
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
                    charactersA.HP[0] / charactersA.HP[1],
                    1,
                    1
                )
                this.Hp.children[0].getChildByName("user_li_count").getComponent(Label).string = charactersA.HP[0] + "/" + charactersA.HP[1]
                this.Character.children[1].setPosition(180, 0, 0)

                const meta = CharacterEnum[character_1.id]
                this.Character.children[1].getComponent(Sprite).spriteFrame = await util.bundle.load(meta.AvatarPath, SpriteFrame)
                // 更新生命值
                this.Hp.children[1].getChildByName("Bar").setScale(
                    charactersB.HP[0] / charactersB.HP[1],
                    1,
                    1
                )
                this.Hp.children[1].getChildByName("user_li_count").getComponent(Label).string = charactersB.HP[0] + "/" + charactersB.HP[1]
            } else if (eventType == "POISON") {
                // AudioMgr.inst.playOneShot("sound/fight/skill/POISON");
                // let extraDesc = fightProcess.extraDesc
                // let eventData = this.parseEventString(extraDesc)
                // let characters = this.parseCharacterString(fieldUnitsStatus)
                // let charactersA = characters.A
                // let charactersB = characters.B
                // for (var i = 0; i < 5; i++) {
                //     let eventSelectSkeleton1 = this.tiem.children[0].children[i].getChildByName("buff").getChildByName("POISON").getComponent(sp.Skeleton)
                //     let eventSelectSkeleton2 = this.tiem.children[1].children[i].getChildByName("buff").getChildByName("POISON").getComponent(sp.Skeleton)
                //     if (eventData.units.some(item => (item.position == i + 1) && item.side == 'A')) {
                //         //伤害计算
                //     } else {
                //         eventSelectSkeleton1.node.active = false
                //         if (i == charactersA.position) {
                //             let selectSkeleton = this.Character.children[0].getChildByName("POISON").getComponent(sp.Skeleton)
                //             selectSkeleton.active = false
                //         }
                //     }

                //     if (eventData.units.some(item => (item.position == i + 1) && item.side == 'B')) {
                //         //伤害计算
                //     } else {
                //         eventSelectSkeleton2.node.active = false
                //         if (i == charactersB.position) {
                //             let selectSkeleton = this.Character.children[1].getChildByName("POISON").getComponent(sp.Skeleton)
                //             selectSkeleton.active = false
                //         }
                //     }
                // }
            } else if (eventType == "NORMAL_ATTACK") {
                let sourceCamp = fightProcess.sourceCamp
                let sourcePosition = fightProcess.sourcePosition - 1
                let targetPosition = fightProcess.targetPosition - 1
                let characters = this.parseCharacterString(fieldUnitsStatus)
                let charactersA = characters.A
                let charactersB = characters.B
                let attack = fightProcess.value
                var direction = 1
                var directionFace = 0
                var falg = 1
                if (sourceCamp == "A") {
                    direction = 0
                    directionFace = 1
                    falg = -1
                }
                await util.sundry.moveNodeToPosition(

                    this.Character.children[direction],
                    {
                        targetPosition: { x: -90 * falg, y: 0 },
                        moveCurve: true,
                        moveTimeScale: 1
                    }
                )
                AudioMgr.inst.playOneShot("sound/fight/attack/attack");
                let hut = this.Character.children[directionFace].getChildByName("hut").getComponent(sp.Skeleton)
                hut.node.active = true
                hut.setAnimation(0, "animation", false)
                //伤害结算
                this.showNumber(-falg, this.Character.children[directionFace], -attack, new math.Color(255, 176, 126, 255), 40)

                // A更新场上生命值
                this.Hp.children[0].getChildByName("Bar").setScale(
                    charactersA.HP[0] / charactersA.HP[1],
                    1,
                    1
                )
                this.Hp.children[0].getChildByName("user_li_count").getComponent(Label).string = charactersA.HP[0] + "/" + charactersA.HP[1]

                // 更新场下生命值
                this.tiem.children[0].children[sourcePosition].getChildByName("my_hp").getChildByName("Bar").setScale(
                    charactersA.HP[0] / charactersA.HP[1],
                    1,
                    1
                )
                this.tiem.children[0].children[sourcePosition].getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = charactersA.HP[0] + "/" + charactersA.HP[1]
                // B更新场上生命值

                this.Hp.children[1].getChildByName("Bar").setScale(
                    charactersB.HP[0] / charactersB.HP[1],
                    1,
                    1
                )
                this.Hp.children[1].getChildByName("user_li_count").getComponent(Label).string = charactersB.HP[0] + "/" + charactersB.HP[1]

                // 更新场下生命值
                this.tiem.children[1].children[targetPosition].getChildByName("my_hp").getChildByName("Bar").setScale(
                    charactersB.HP[0] / charactersB.HP[1],
                    1,
                    1
                )
                this.tiem.children[0].children[targetPosition].getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = charactersB.HP[0] + "/" + charactersB.HP[1]
                hut.setCompleteListener(() => hut.node.active = false)

                //回到初始位置
                await util.sundry.moveNodeToPosition(
                    this.Character.children[direction],
                    {
                        targetPosition: { x: 180 * falg, y: 0 },
                        moveCurve: true,
                        moveTimeScale: 1
                    }
                )

            } else if (eventType == "UNIT_DEATH") {
                let extraDesc = fightProcess.extraDesc
                let eventData = this.parseEventString(extraDesc)
                for (const event of eventData.units) {
                    if (event.side == "A") {
                        this.tiem.children[0].children[event.position - 1].getChildByName("dead").active = true
                    } else {
                        this.tiem.children[1].children[event.position - 1].getChildByName("dead").active = true
                    }
                }
                let characters = this.parseCharacterString(fieldUnitsStatus)
                let charactersA = characters.A
                if (charactersA.HP[0] <= 0) {
                    this.Character.children[0].getComponent(Sprite).spriteFrame = null
                }
                let charactersB = characters.B
                if (charactersB.HP[0] <= 0) {
                    this.Character.children[1].getComponent(Sprite).spriteFrame = null
                }
            } else if (eventType == "BATTLE_END") {

            } else {
                let characters = this.parseCharacterString(fieldUnitsStatus)
                let charactersA = characters.A
                let charactersB = characters.B
                let sourceCamp = fightProcess.sourceCamp
                let aoe = fightProcess.aoe
                let sourcePosition = fightProcess.sourcePosition - 1
                let targetCamp = fightProcess.targetCamp
                let damageType = fightProcess.damageType
                let targetHpBefore = fightProcess.effectType
                let targetPosition = fightProcess.targetPosition - 1
                let targetHpAfter = fightProcess.targetUnit
                let extraDesc = fightProcess.extraDesc
                let value = fightProcess.value
                let targetMaxHp = charactersB.HP[1]
                let targetAfterHp = charactersB.HP[0]
                // let targetUnit = fightProcess.targetUnit
                var isGoON = false;
                var targetIsGoON = false;
                var direction = 0
                var targetDirection = 1
                var falg = -1
                if (sourceCamp == "B") {
                    targetMaxHp = charactersA.HP[1]
                    targetAfterHp = charactersA.HP[0]
                    direction = 1
                    targetDirection = 0
                    falg = 1
                    if (charactersB.position == sourcePosition) {
                        isGoON = true;
                    }
                } else {
                    if (charactersA.position == sourcePosition) {
                        isGoON = true;
                    }
                }
                if (targetCamp == "A") {
                    if (charactersA.position == targetPosition) {
                        targetIsGoON = true;
                    }
                } else {
                    if (charactersB.position == targetPosition) {
                        targetIsGoON = true;
                    }
                }
                //判断技能是否场上释放还是场下释放
                if (isGoON) {
                    await this.showString(falg, this.Character.children[direction], new math.Color(236, 163, 61, 255), eventType)
                    await new Promise(res => setTimeout(res, 500 / this.timeScale))
                    if (damageType == "FIRE" || damageType == "POISON") {
                        if (this.Character.children[targetDirection].getComponent(Sprite).spriteFrame) {
                            AudioMgr.inst.playOneShot("sound/fight/skill/" + damageType);
                            //判断技能是否是aoe
                            if (aoe == '1') {
                                let eventData = this.parseEventString(extraDesc)
                                let skeletons: sp.Skeleton[] = []
                                for (const event of eventData.units) {
                                    if ((event.position == charactersA.position + 1) && event.side == 'A') {
                                        let selectSkeleton = this.Character.children[0].getChildByName(damageType).getComponent(sp.Skeleton)
                                        skeletons.push(selectSkeleton)
                                    }
                                    if ((event.position == charactersB.position + 1) && event.side == 'B') {
                                        let selectSkeleton = this.Character.children[1].getChildByName(damageType).getComponent(sp.Skeleton)
                                        skeletons.push(selectSkeleton)
                                    }
                                    var dir = 0
                                    if (event.side == "B") {
                                        dir = 1
                                    }
                                    let eventSelectSkeleton = this.tiem.children[dir].children[event.position - 1].getChildByName("buff").getChildByName(damageType).getComponent(sp.Skeleton)
                                    skeletons.push(eventSelectSkeleton)
                                }
                                skeletons.forEach(skeleton => {
                                    skeleton.node.active = true
                                    skeleton.setAnimation(0, "animation", false);
                                });
                                for (const event of eventData.units) {
                                    if ((event.position == charactersA.position + 1) && event.side == 'A') {
                                        //                 //伤害结算
                                        this.showNumber(-1, this.Character.children[0], -value, new math.Color(255, 176, 126, 255), 40)

                                        //                 // 更新场上生命值
                                        this.Hp.children[0].getChildByName("Bar").setScale(
                                            event.hp.after / event.hp.before,
                                            1,
                                            1
                                        )
                                        this.Hp.children[0].getChildByName("user_li_count").getComponent(Label).string = event.hp.after + "/" + event.hp.before
                                    }
                                    if ((event.position == charactersB.position + 1) && event.side == 'B') {
                                        await new Promise(res => setTimeout(res, 500 / this.timeScale))
                                        //伤害掉血动画
                                        //                 //伤害结算
                                        this.showNumber(-1, this.Character.children[1], -value, new math.Color(255, 176, 126, 255), 40)

                                        //                 // 更新场上生命值
                                        this.Hp.children[1].getChildByName("Bar").setScale(
                                            event.hp.after / event.hp.before,
                                            1,
                                            1
                                        )
                                        this.Hp.children[1].getChildByName("user_li_count").getComponent(Label).string = event.hp.after + "/" + event.hp.before
                                    }
                                    var dir = 0
                                    if (event.side == "B") {
                                        dir = 1
                                    }
                                    //伤害动画
                                    await this.showString(1, this.tiem.children[dir].children[event.position - 1], new math.Color(255, 0, 0), -value + "")
                                    // 更新场下生命值
                                    this.tiem.children[dir].children[event.position - 1].getChildByName("my_hp").getChildByName("Bar").setScale(
                                        event.hp.after / event.hp.before,
                                        1,
                                        1
                                    )
                                    this.tiem.children[dir].children[event.position - 1].getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = event.hp.after + "/" + event.hp.before
                                }
                            } else {
                                if (targetIsGoON) {
                                    let selectSkeleton = this.Character.children[targetDirection].getChildByName(damageType).getComponent(sp.Skeleton)
                                    selectSkeleton.node.active = true
                                    if (damageType == "POISON") {
                                        selectSkeleton.setAnimation(0, "animation", true)
                                    } else {
                                        selectSkeleton.setAnimation(0, "animation", false)
                                    }
                                    await new Promise(res => setTimeout(res, 500 / this.timeScale))
                                    //伤害掉血动画
                                    //                 //伤害结算
                                    this.showNumber(targetDirection == 0 ? -1 : 1, this.Character.children[targetDirection], -value, new math.Color(255, 176, 126, 255), 40)

                                    //                 // 更新场上生命值
                                    this.Hp.children[targetDirection].getChildByName("Bar").setScale(
                                        targetAfterHp / targetMaxHp,
                                        1,
                                        1
                                    )
                                    this.Hp.children[targetDirection].getChildByName("user_li_count").getComponent(Label).string = targetAfterHp + "/" + targetMaxHp
                                    if (damageType != "POISON") {
                                        selectSkeleton.setCompleteListener(() => selectSkeleton.node.active = false)
                                    }
                                }
                                let eventSelectSkeleton = this.tiem.children[targetDirection].children[targetPosition].getChildByName("buff").getChildByName(damageType).getComponent(sp.Skeleton)
                                eventSelectSkeleton.node.active = true
                                if (damageType == "POISON") {
                                    eventSelectSkeleton.setAnimation(0, "animation", true)
                                } else {
                                    eventSelectSkeleton.setAnimation(0, "animation", false)
                                }
                                //伤害动画
                                await this.showString(1, this.tiem.children[targetDirection].children[targetPosition], new math.Color(255, 0, 0), -value + "")
                                // this.showNumber(1, this.tiem.children[targetDirection].children[targetPosition], -value, new math.Color(255, 176, 126, 255), 20)
                                // 更新场下生命值
                                this.tiem.children[targetDirection].children[targetPosition].getChildByName("my_hp").getChildByName("Bar").setScale(
                                    targetHpAfter / targetHpBefore,
                                    1,
                                    1
                                )
                                this.tiem.children[targetDirection].children[targetPosition].getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = targetHpAfter + "/" + targetHpBefore
                                if (damageType != "POISON") {
                                    eventSelectSkeleton.setCompleteListener(() => eventSelectSkeleton.node.active = false)
                                }
                            }
                        }
                    } else {
                        //判断技能是否是aoe
                        if (aoe == '1') {
                            let eventData = this.parseEventString(extraDesc)
                            for (const event of eventData.units) {
                                var dir = 0
                                if (event.side == "B") {
                                    dir = 1
                                }
                                //伤害动画
                                await this.showString(1, this.tiem.children[dir].children[event.position - 1], new math.Color(255, 0, 0), -value + "")
                                // this.showNumber(1, this.tiem.children[dir].children[event.position - 1], -value, new math.Color(255, 176, 126, 255), 20)
                                // 更新场下生命值
                                this.tiem.children[dir].children[event.position - 1].getChildByName("my_hp").getChildByName("Bar").setScale(
                                    event.hp.after / event.hp.before,
                                    1,
                                    1
                                )
                            }
                        }
                        await new Promise(res => setTimeout(res, 500 / this.timeScale))
                        //伤害掉血动画
                        //                 //伤害结算
                        this.showNumber(targetDirection == 0 ? -1 : 1, this.Character.children[targetDirection], -value, new math.Color(255, 176, 126, 255), 40)

                        //                 // 更新场上生命值
                        this.Hp.children[targetDirection].getChildByName("Bar").setScale(
                            targetAfterHp / targetMaxHp,
                            1,
                            1
                        )
                        this.Hp.children[targetDirection].getChildByName("user_li_count").getComponent(Label).string = targetAfterHp + "/" + targetMaxHp
                    }

                } else {
                    //技能区分全体和单体技能

                    // let selectSkeleton = this.tiem.children[direction].children[sourcePosition].getChildByName("select").getComponent(sp.Skeleton)
                    // selectSkeleton.node.active = true
                    // selectSkeleton.setAnimation(0, "animation", false)
                    // tween(this.tiem.children[direction].children[sourcePosition])
                    //     .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
                    //     .call(async () => {
                    //         AudioMgr.inst.playOneShot("sound/fight/skill/lotteryCard");
                    //         if (damageType == "FIRE" || damageType == "POISON") {

                    //             await this.showString(1, this.tiem.children[direction].children[sourcePosition], new math.Color(236, 163, 61, 255), eventType)
                    //             await new Promise(res => setTimeout(res, 300 / this.timeScale))
                    //             AudioMgr.inst.playOneShot("sound/fight/skill/" + damageType);
                    //             let selectSkeleton = null;
                    //             if (targetIsGoON) {
                    //                 selectSkeleton = this.Character.children[targetDirection].getChildByName(damageType).getComponent(sp.Skeleton)
                    //                 selectSkeleton.node.active = true
                    //                 if (damageType == "POISON") {
                    //                     selectSkeleton.setAnimation(0, "animation", true)
                    //                 } else {
                    //                     selectSkeleton.setAnimation(0, "animation", false)
                    //                 }
                    //             }
                    //             //判断技能是否是aoe
                    //             if (aoe == '1') {
                    //                 let eventData = this.parseEventString(extraDesc)
                    //                 for (const event of eventData.units) {
                    //                     var dir = 0
                    //                     if (event.side == "B") {
                    //                         dir = 1
                    //                     }
                    //                     let eventSelectSkeleton = this.tiem.children[dir].children[event.position - 1].getChildByName("buff").getChildByName(damageType).getComponent(sp.Skeleton)
                    //                     eventSelectSkeleton.node.active = true
                    //                     if (damageType == "POISON") {
                    //                         eventSelectSkeleton.setAnimation(0, "animation", true)
                    //                     } else {
                    //                         eventSelectSkeleton.setAnimation(0, "animation", false)
                    //                     }
                    //                     //伤害动画
                    //                     this.showNumber(1, this.tiem.children[dir].children[event.position - 1], -value, new math.Color(255, 176, 126, 255), 20)
                    //                     // 更新场下生命值
                    //                     this.tiem.children[dir].children[event.position - 1].getChildByName("my_hp").getChildByName("Bar").setScale(
                    //                         event.hp.after / event.hp.before,
                    //                         1,
                    //                         1
                    //                     )
                    //                     this.tiem.children[dir].children[event.position - 1].getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = event.hp.after + "/" + event.hp.before
                    //                     if (damageType != "POISON") {
                    //                         eventSelectSkeleton.setCompleteListener(() => eventSelectSkeleton.node.active = false)
                    //                     }
                    //                 }
                    //             } else {
                    //                 let eventSelectSkeleton = this.tiem.children[targetDirection].children[targetPosition].getChildByName("buff").getChildByName(damageType).getComponent(sp.Skeleton)
                    //                 eventSelectSkeleton.node.active = true
                    //                 if (damageType == "POISON") {
                    //                     eventSelectSkeleton.setAnimation(0, "animation", true)
                    //                 } else {
                    //                     eventSelectSkeleton.setAnimation(0, "animation", false)
                    //                 }
                    //                 //伤害动画
                    //                 this.showNumber(1, this.tiem.children[targetDirection].children[targetPosition], -value, new math.Color(255, 176, 126, 255), 20)
                    //                 // 更新场下生命值
                    //                 this.tiem.children[targetDirection].children[targetPosition].getChildByName("my_hp").getChildByName("Bar").setScale(
                    //                     targetHpAfter / targetHpBefore,
                    //                     1,
                    //                     1
                    //                 )
                    //                 this.tiem.children[targetDirection].children[targetPosition].getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = targetHpAfter + "/" + targetHpBefore
                    //                 if (damageType != "POISON") {
                    //                     eventSelectSkeleton.setCompleteListener(() => eventSelectSkeleton.node.active = false)
                    //                 }
                    //             }
                    //             if (targetIsGoON) {
                    //                 await new Promise(res => setTimeout(res, 500 / this.timeScale))
                    //                 //伤害掉血动画
                    //                 //                 //伤害结算
                    //                 this.showNumber(targetDirection == 0 ? -1 : 1, this.Character.children[targetDirection], -value, new math.Color(255, 176, 126, 255), 40)

                    //                 //                 // 更新场上生命值
                    //                 this.Hp.children[targetDirection].getChildByName("Bar").setScale(
                    //                     targetAfterHp / targetMaxHp,
                    //                     1,
                    //                     1
                    //                 )
                    //                 this.Hp.children[targetDirection].getChildByName("user_li_count").getComponent(Label).string = targetAfterHp + "/" + targetMaxHp
                    //                 if (damageType != "POISON") {
                    //                     selectSkeleton.setCompleteListener(() => selectSkeleton.node.active = false)
                    //                 }
                    //             }
                    //             // let selectSkeleton2 = this.Character.children[direction].getChildByName("xuming").getComponent(sp.Skeleton)
                    //             // selectSkeleton2.node.active = true
                    //             // selectSkeleton2.setAnimation(0, "animation", false)


                    //             // await this.showString(1, this.tiem.children[direction].children[sourcePosition - 1], "-" + Math.ceil(eventType))
                    //             // this.tiem.children[fight.direction].children[fight.goIntoNum - 1].getChildByName("my_hp").getChildByName("Bar").setScale(
                    //             //     fight.hp / fight.maxHp,
                    //             //     1,
                    //             //     1
                    //             // )
                    //             // this.tiem.children[fight.direction].children[fight.goIntoNum - 1].getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = fight.hp + "/" + fight.maxHp,
                    //             // await new Promise(res => setTimeout(res, 500 / this.timeScale))

                    //             // //给场上人加血   
                    //             // this.showNumber(falg, this.Character.children[fight.direction], +fight.str, new math.Color(82, 201, 25, 255), 40)
                    //             // this.Hp.children[0].getChildByName("Bar").setScale(
                    //             //     fight.hpFace / fight.maxHpFace,
                    //             //     1,
                    //             //     1
                    //             // )
                    //             // this.Hp.children[fight.direction].getChildByName("user_li_count").getComponent(Label).string = fight.hpFace + "/" + fight.maxHpFace
                    //             // selectSkeleton2.setCompleteListener(() => selectSkeleton2.node.active = false)
                    //         } else {
                    //             //判断技能是否是aoe
                    //             if (aoe == '1') {
                    //                 let eventData = this.parseEventString(extraDesc)
                    //                 for (const event of eventData.units) {
                    //                     var dir = 0
                    //                     if (event.side == "B") {
                    //                         dir = 1
                    //                     }
                    //                     //伤害动画
                    //                     this.showNumber(1, this.tiem.children[dir].children[event.position - 1], -value, new math.Color(255, 176, 126, 255), 20)
                    //                     // 更新场下生命值
                    //                     this.tiem.children[dir].children[event.position - 1].getChildByName("my_hp").getChildByName("Bar").setScale(
                    //                         event.hp.after / event.hp.before,
                    //                         1,
                    //                         1
                    //                     )
                    //                 }
                    //             }
                    //             if (targetIsGoON) {
                    //                 await new Promise(res => setTimeout(res, 500 / this.timeScale))
                    //                 //伤害掉血动画
                    //                 //                 //伤害结算
                    //                 this.showNumber(targetDirection == 0 ? -1 : 1, this.Character.children[targetDirection], -value, new math.Color(255, 176, 126, 255), 40)

                    //                 //                 // 更新场上生命值
                    //                 this.Hp.children[targetDirection].getChildByName("Bar").setScale(
                    //                     targetAfterHp / targetMaxHp,
                    //                     1,
                    //                     1
                    //                 )
                    //                 this.Hp.children[targetDirection].getChildByName("user_li_count").getComponent(Label).string = targetAfterHp + "/" + targetMaxHp
                    //             }

                    //         }
                    //     })
                    //     .by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
                    //     .start();
                    // selectSkeleton.setCompleteListener(() => selectSkeleton.node.active = false)
                    // await new Promise(res => setTimeout(res, 1000 / this.timeScale))
                }

            }

        }

        //     //初始化登场角色
        //     let fightterList = this.fightProcess[i]["fightterList"];
        //     let character_0 = this.fightProcess[i]["leftCharter"];
        //     let character_1 = this.fightProcess[i]["rightCharter"];
        //     //0左

        //     this.tiem.children[0].children.forEach(element => {
        //         element.getChildByName("buff").getChildByName("goOn").getComponent(sp.Skeleton).node.active = false
        //     });

        //     let goOnSkeleton = this.tiem.children[0].children[character_0.goIntoNum - 1].getChildByName("buff").getChildByName("goOn").getComponent(sp.Skeleton)
        //     goOnSkeleton.node.active = true
        //     goOnSkeleton.setAnimation(0, "animation", true)
        //     this.Character.children[0].setPosition(-180, 0, 0)
        //     const meta2 = CharacterEnum[character_0.id]
        //     this.Character.children[0].getComponent(Sprite).spriteFrame = await util.bundle.load(meta2.AvatarPath, SpriteFrame)
        //     this.Character.children[0].setScale(
        //         Math.abs(this.Character.children[0].scale.x) * -1,
        //         this.Character.children[0].scale.y,
        //         this.Character.children[0].scale.z,
        //     )
        //     // 更新生命值
        //     this.Hp.children[0].getChildByName("Bar").setScale(
        //         character_0.hp / character_0.maxHp,
        //         1,
        //         1
        //     )
        //     this.Hp.children[0].getChildByName("user_li_count").getComponent(Label).string = character_0.hp + "/" + character_0.maxHp


        //     //1右
        //     this.tiem.children[1].children.forEach(element => {
        //         element.getChildByName("buff").getChildByName("goOn").getComponent(sp.Skeleton).node.active = false
        //     });

        //     goOnSkeleton = this.tiem.children[1].children[character_1.goIntoNum - 1].getChildByName("buff").getChildByName("goOn").getComponent(sp.Skeleton)
        //     goOnSkeleton.node.active = true
        //     goOnSkeleton.setAnimation(0, "animation", true)
        //     this.Character.children[1].setPosition(180, 0, 0)

        //     const meta = CharacterEnum[character_1.id]
        //     this.Character.children[1].getComponent(Sprite).spriteFrame = await util.bundle.load(meta.AvatarPath, SpriteFrame)
        //     // 更新生命值
        //     this.Hp.children[1].getChildByName("Bar").setScale(
        //         character_1.hp / character_1.maxHp,
        //         1,
        //         1
        //     )
        //     this.Hp.children[1].getChildByName("user_li_count").getComponent(Label).string = character_1.hp + "/" + character_1.maxHp



        //     //开始过程
        //     for (var n = 0; n < fightterList.length; n++) {

        //         if (this.isOverFight) {
        //             break;
        //         }

        //         var fight = fightterList[n]
        //         if (fight.goON == 1) {
        //             var falg = fight.direction
        //             if (falg == 0) {
        //                 falg = -1
        //             }
        //             //不是技能就是普通攻击
        //             if (fight.isSkill == 0) {
        //                 //攻击动作
        //                 await util.sundry.moveNodeToPosition(
        //                     this.Character.children[fight.direction],
        //                     {
        //                         targetPosition: { x: -80 * falg, y: 0 },
        //                         moveCurve: true,
        //                         moveTimeScale: 1
        //                     }
        //                 )
        //                 AudioMgr.inst.playOneShot("sound/fight/attack/attack");
        //                 let hut = this.Character.children[fight.directionFace].getChildByName("hut").getComponent(sp.Skeleton)
        //                 hut.node.active = true
        //                 hut.setAnimation(0, "animation", false)
        //                 //伤害结算
        //                 this.showNumber(-falg, this.Character.children[fight.directionFace], -fight.attack, new math.Color(255, 176, 126, 255), 40)

        //                 // 更新场上生命值
        //                 this.Hp.children[fight.directionFace].getChildByName("Bar").setScale(
        //                     fight.hpFace / fight.maxHpFace,
        //                     1,
        //                     1
        //                 )
        //                 this.Hp.children[fight.directionFace].getChildByName("user_li_count").getComponent(Label).string = fight.hpFace + "/" + fight.maxHpFace

        //                 // 更新场下生命值
        //                 this.tiem.children[fight.directionFace].children[fight.goIntoNumFace - 1].getChildByName("my_hp").getChildByName("Bar").setScale(
        //                     fight.hpFace / fight.maxHpFace,
        //                     1,
        //                     1
        //                 )
        //                 this.tiem.children[fight.directionFace].children[fight.goIntoNumFace - 1].getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = fight.hpFace + "/" + fight.maxHpFace
        //                 hut.setCompleteListener(() => hut.node.active = false)

        //                 //死亡结算
        //                 if (fight.hp <= 0) {
        //                     this.Character.children[fight.direction].getComponent(Sprite).spriteFrame = null
        //                     this.tiem.children[fight.direction].children[fight.goIntoNum - 1].getChildByName("dead").active = true
        //                 }
        //                 if (fight.hpFace <= 0) {
        //                     this.Character.children[fight.directionFace].getComponent(Sprite).spriteFrame = null
        //                     this.tiem.children[fight.directionFace].children[fight.goIntoNumFace - 1].getChildByName("dead").active = true
        //                 }


        //                 //回到初始位置
        //                 await util.sundry.moveNodeToPosition(
        //                     this.Character.children[fight.direction],
        //                     {
        //                         targetPosition: { x: 180 * falg, y: 0 },
        //                         moveCurve: true,
        //                         moveTimeScale: 1
        //                     }
        //                 )

        //             } else {

        //                 if ("仙塔庇护" == fight.buff) {
        //                     let selectSkeleton = this.tiem.children[fight.direction].children[fight.goIntoNum - 1].getChildByName("select").getComponent(sp.Skeleton)
        //                     selectSkeleton.node.active = true
        //                     selectSkeleton.setAnimation(0, "animation", false)
        //                     tween(this.tiem.children[fight.direction].children[fight.goIntoNum - 1])
        //                         .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
        //                         .call(async () => {
        //                             AudioMgr.inst.playOneShot("sound/fight/skill/lotteryCard");
        //                             let selectSkeleton2 = this.Character.children[fight.direction].getChildByName("xuming").getComponent(sp.Skeleton)
        //                             selectSkeleton2.node.active = true
        //                             selectSkeleton2.setAnimation(0, "animation", false)
        //                             //给自己减血
        //                             await this.showString(1, this.tiem.children[fight.direction].children[fight.goIntoNum - 1], "续命")
        //                             await new Promise(res => setTimeout(res, 300 / this.timeScale))
        //                             await this.showString(1, this.tiem.children[fight.direction].children[fight.goIntoNum - 1], "-" + Math.ceil(fight.str))
        //                             this.tiem.children[fight.direction].children[fight.goIntoNum - 1].getChildByName("my_hp").getChildByName("Bar").setScale(
        //                                 fight.hp / fight.maxHp,
        //                                 1,
        //                                 1
        //                             )
        //                             this.tiem.children[fight.direction].children[fight.goIntoNum - 1].getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = fight.hp + "/" + fight.maxHp,
        //                                 await new Promise(res => setTimeout(res, 500 / this.timeScale))

        //                             //给场上人加血   
        //                             this.showNumber(falg, this.Character.children[fight.direction], +fight.str, new math.Color(82, 201, 25, 255), 40)
        //                             this.Hp.children[0].getChildByName("Bar").setScale(
        //                                 fight.hpFace / fight.maxHpFace,
        //                                 1,
        //                                 1
        //                             )
        //                             this.Hp.children[fight.direction].getChildByName("user_li_count").getComponent(Label).string = fight.hpFace + "/" + fight.maxHpFace

        //                             //死亡结算
        //                             if (fight.hp <= 0) {
        //                                 this.tiem.children[fight.direction].children[fight.goIntoNum - 1].getChildByName("dead").active = true
        //                             }
        //                             selectSkeleton2.setCompleteListener(() => selectSkeleton2.node.active = false)
        //                         })
        //                         .by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
        //                         .start();
        //                     selectSkeleton.setCompleteListener(() => selectSkeleton.node.active = false)
        //                     await new Promise(res => setTimeout(res, 1000 / this.timeScale))
        //                 }

        //             }


        //         } else {

        //             //场下英雄释放技能
        //             if ("续命" == fight.buff) {
        //                 // //加血
        //                 var falg = fight.direction
        //                 if (falg == 0) {
        //                     falg = -1
        //                 }
        //                 let selectSkeleton = this.tiem.children[fight.direction].children[fight.goIntoNum - 1].getChildByName("select").getComponent(sp.Skeleton)
        //                 selectSkeleton.node.active = true
        //                 selectSkeleton.setAnimation(0, "animation", false)
        //                 tween(this.tiem.children[fight.direction].children[fight.goIntoNum - 1])
        //                     .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
        //                     .call(async () => {
        //                         AudioMgr.inst.playOneShot("sound/fight/skill/lotteryCard");
        //                         let selectSkeleton2 = this.Character.children[fight.direction].getChildByName("xuming").getComponent(sp.Skeleton)
        //                         selectSkeleton2.node.active = true
        //                         selectSkeleton2.setAnimation(0, "animation", false)
        //                         //给自己减血
        //                         await this.showString(1, this.tiem.children[fight.direction].children[fight.goIntoNum - 1], "续命")
        //                         await new Promise(res => setTimeout(res, 300 / this.timeScale))
        //                         await this.showString(1, this.tiem.children[fight.direction].children[fight.goIntoNum - 1], "-" + Math.ceil(fight.str))
        //                         this.tiem.children[fight.direction].children[fight.goIntoNum - 1].getChildByName("my_hp").getChildByName("Bar").setScale(
        //                             fight.hp / fight.maxHp,
        //                             1,
        //                             1
        //                         )
        //                         this.tiem.children[fight.direction].children[fight.goIntoNum - 1].getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = fight.hp + "/" + fight.maxHp,
        //                             await new Promise(res => setTimeout(res, 500 / this.timeScale))

        //                         //给场上人加血   
        //                         this.showNumber(falg, this.Character.children[fight.direction], +fight.str, new math.Color(82, 201, 25, 255), 40)
        //                         this.Hp.children[0].getChildByName("Bar").setScale(
        //                             fight.hpFace / fight.maxHpFace,
        //                             1,
        //                             1
        //                         )
        //                         this.Hp.children[fight.direction].getChildByName("user_li_count").getComponent(Label).string = fight.hpFace + "/" + fight.maxHpFace

        //                         //死亡结算
        //                         if (fight.hp <= 0) {
        //                             this.tiem.children[fight.direction].children[fight.goIntoNum - 1].getChildByName("dead").active = true
        //                         }
        //                         selectSkeleton2.setCompleteListener(() => selectSkeleton2.node.active = false)
        //                     })
        //                     .by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
        //                     .start();
        //                 selectSkeleton.setCompleteListener(() => selectSkeleton.node.active = false)
        //                 await new Promise(res => setTimeout(res, 1000 / this.timeScale))
        //             }
        //         }


        //         await new Promise(res => setTimeout(res, 1000 / this.timeScale))

        //     }
        //     this.currentRound++
        // }

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

