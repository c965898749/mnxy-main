import { _decorator, Component, director, Font, instantiate, Label, math, Node, NodeEventType, Event, sp, Prefab, Sprite, SpriteFrame, tween, Vec3, AudioClip, AudioSource, ProgressBar, UITransform, Vec2, Color } from 'cc';
import { util } from '../../../util/util';
import { HolCharacter } from '../../../prefab/HolCharacter';
import { CharacterStateCreate } from '../../../game/fight/character/CharacterState';
import { HolNumber } from '../../../prefab/HolNumber';
import { RoundState } from '../../../game/fight/RoundState';
import { common } from '../../../common/common/common';
import { HolPreLoad } from '../../../prefab/HolPreLoad';
import { battleCache, getConfig, getToken } from '../../../common/config/config';
import { CharacterEnum } from '../../../game/fight/character/CharacterEnum';
import { AudioMgr } from '../../../util/resource/AudioMgr';
import { FightSuccess } from './FightSuccess';
import { ItemCtrl } from '../../Home/Canvas/Tiem/ItemCtrl';
import { HeroCharacterDetail } from '../../Hero/Canvas/HeroCharacterDetail';
const { ccclass, property } = _decorator;
enum Style { 纯色描边, 透明衰减, 明暗衰减 }

// 效果类型常量
const CONTINUOUS_EFFECTS = ["POISON", "SILENCE", "HEAL_DOWN", "STUN", "FIXED_SOUL", "XULI1", "XULI2", "XULI3", "XULI4", "XULI5", "XULIMAN", "PHYSICAL_BARRIER"];
const BUFF_UP_TYPES = ['ATTACK_UP', 'ATTACK_UP_PRET', 'ATTACK_RESIST_BOOST', 'ATTACK_RESIST_BOOST_PRET',
    'FIRE_BOOST', 'FIRE_BOOST_PRET', 'FIRE_RESIST_BOOST', 'FIRE_RESIST_BOOST_PRET',
    'POISON_BOOST', 'POISON_BOOST_PRET', 'POISON_RESIST_BOOST', 'POISON_RESIST_BOOST_PRET',
    'MISSILE_BOOST', 'MISSILE_BOOST_PRET', 'MISSILE_RESIST_BOOST', 'MISSILE_RESIST_BOOST_PRET',
    'HP_UP', 'HP_UP_PRET', 'BLOODTHIRST', 'HEAL', 'SPEED_UP', 'SPEED_UP_PRET',
    'DODGE_UP', 'DODGE_UP_PRET'];
const DEBUFF_DOWN_TYPES = ['ATTACK_DOWN', 'ATTACK_DOWN_PRET', 'ATTACK_RESIST_DOWN', 'ATTACK_RESIST_DOWN_PRET',
    'FIRE_DOWN', 'FIRE_DOWN_PRET', 'FIRE_RESIST_DOWN', 'FIRE_RESIST_DOWN_PRET',
    'POISON_DOWN', 'POISON_DOWN_PRET', 'POISON_RESIST_DOWN', 'POISON_RESIST_DOWN_PRET',
    'MISSILE_DOWN', 'MISSILE_DOWN_PRET', 'MISSILE_RESIST_DOWN', 'MISSILE_RESIST_DOWN_PRET',
    'MAX_HP_DOWN', 'MAX_HP_DOWN_PRET', 'SPEED_DOWN', 'SPEED_DOWN_PRET',
    'DODGE_DOWN', 'DODGE_DOWN_PRET'];
// 剑类技能共用动画
const SWORD_SKILL_NAMES = ["定海神针", "斩妖剑", "北极剑意"];
// 反击类技能
const COUNTER_SKILL_NAMES = ["绝地反击", "新月反击"];

@ccclass('FightMap')
export class FightMap extends Component {
    @property(Node) SkipFight: Node
    @property(Node) tiem
    @property(Node) Character
    @property(Node) Hp
    @property(Node) name0
    @property(Node) name1
    @property(Node) skillName

    currentRound: number = 1
    isPlayAnimation: boolean = true
    allRoundQueue: Map<number, Function[]> = new Map
    allLiveCharacter: HolCharacter[] = []
    allDeadCharacter: HolCharacter[] = []
    actionAwaitQueue: Promise<any>[] = []
    fightProcess = []
    isOverFight: boolean = false
    result: boolean
    rewards = []
    levelUp = 0
    private timeScale: number = 1
    initialized = false;
    effectTypes = ["XULI1", "XULI2", "XULI3", "XULI4", "XULI5", "XULIMAN"];
    L1 = null;
    R1 = null;
    timer = 0

    async start() {
        const config = getConfig()
        const musics = await util.bundle.loadDir<AudioClip>("sound/fight/back", AudioClip)
        const music = musics[Math.floor(musics.length * Math.random())]
        const audioSource = this.node.getComponent(AudioSource)
        audioSource.clip = music
        audioSource.volume = config.volume * config.volumeDetail.home
        audioSource.play()
    }
    async update(deltaTime: number) {
        if (this.timer >= 500) this.SkipFight.active = true
        this.timer++
    }

    async render(fightId, rewards, levelUp) {
        this.actionAwaitQueue = [];
        this.isOverFight = false;
        this.rewards = rewards
        this.levelUp = levelUp
        const holPreLoad = this.node.getChildByName("HolPreLoad").getComponent(HolPreLoad)
        holPreLoad.setTips([
            "提示\n不同阵营之间相互克制，巧用阵营可以出奇制胜",
            "提示\n合理培养卡牌，低星卡牌也能发挥巨大作用",
            "提示\n记得领取每日奖励，积累资源更快成长",
            "提示\n闯关遇到瓶颈可以尝试调整上阵阵容",
            "提示\n完成成就任务可以获得丰厚额外奖励",
        ]);
        holPreLoad.setProcess(20)
        const images = await util.bundle.loadDir("image/fightMap", SpriteFrame)
        this.node.getComponent(Sprite).spriteFrame = images[Math.floor(math.randomRange(0, images.length))]
        holPreLoad.setProcess(50)
        try {
            const battleInfo = await battleCache.getBattleFullInfo(fightId);
            const fightProcess = battleInfo.battleLogs;
            this.fightProcess = fightProcess;
            const campA = battleInfo.campA;
            const campB = battleInfo.campB;
            this.name0.getComponent(Label).string = battleInfo.name0;
            this.name1.getComponent(Label).string = battleInfo.name1;
            this.result = battleInfo.isWin == 0;
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
                let create = campA[i]
                this.tiem.children[0].children[campA[i].goIntoNum - 1].getChildByName("header").on("click", () => this.clickFun(create))
            }
            for (var i = 0; i < campB.length; i++) {
                this.tiem.children[1].children[campB[i].goIntoNum - 1].getChildByName("header").getComponent(Sprite).spriteFrame =
                    await util.bundle.load(`game/texture/frames/hero/Header/${campB[i].id}/spriteFrame`, SpriteFrame)
                this.tiem.children[1].children[campB[i].goIntoNum - 1].getChildByName("id").getComponent(Label).string = campB[i].uuid
                this.tiem.children[1].children[campB[i].goIntoNum - 1].getChildByName("my_hp").active = true
                let progress = campB[i].maxHp / campB[i].maxHp
                this.tiem.children[1].children[campB[i].goIntoNum - 1].getChildByName("my_hp").getComponent(ProgressBar).progress = progress
                this.tiem.children[1].children[campB[i].goIntoNum - 1].getChildByName("my_hp").getChildByName("user_li_count").getComponent(Label).string = campB[i].maxHp + "/" + campB[i].maxHp
                let create = campB[i]
                this.tiem.children[1].children[campB[i].goIntoNum - 1].getChildByName("header").on("click", () => this.clickFun(create))
            }
        } catch (err: any) {
            switch (err.message) {
                case "TOKEN_EXPIRED": console.log("登录已失效，请重新登录"); break;
                case "BATTLE_RECORD_EXPIRED": console.log("该战斗记录已过期（仅保留7天）"); break;
                default: console.error("获取战斗失败", err);
            }
        }
        holPreLoad.listenComplete(async () => {
            await new Promise(res => setTimeout(res, 500))
            const result = await this.fightStart()
            if (result) this.fightSuccess()
            else this.fightEnd()
        })
        holPreLoad.setProcess(100)
    }

    // ========== 工具方法 ==========
    setTimeScale(e: Event) {
        this.timeScale++
        if (this.timeScale > 3) this.timeScale = 1
        e.target.getChildByName("Value").getComponent(Label).string = "x" + this.timeScale
    }
    async skipFight() {
        const result = await util.message.confirm({ message: "确定要跳过战斗吗?" })
        if (result) {
            this.isOverFight = true
            await new Promise(res => setTimeout(res, 500))
        }
    }
    getChracterChangXiaById(id) {
        for (var i = 0; i < this.tiem.children[0].children.length; i++)
            if (this.tiem.children[0].children[i].getChildByName("id").getComponent(Label).string == id) return this.tiem.children[0].children[i]
        for (var i = 0; i < this.tiem.children[1].children.length; i++)
            if (this.tiem.children[1].children[i].getChildByName("id").getComponent(Label).string == id) return this.tiem.children[1].children[i]
    }
    getCharacterById(id) {
        for (var i = 0; i < this.Character.children.length; i++)
            if (this.Character.children[i].getChildByName("id").getComponent(Label).string == id) return this.Character.children[i]
    }
    hasLetterA(str: string): boolean {
        if (typeof str !== 'string') return false;
        return !!str.match(/A/g);
    }
    isLeft(id: string): boolean { return this.hasLetterA(id) }

    // ========== HP 更新 ==========
    updateHpOnField(unitId, hpAfter, hpBefore) {
        const hpNode = this.Hp.children[this.isLeft(unitId) ? 0 : 1]
        hpNode.getComponent(ProgressBar).progress = hpAfter / hpBefore
        hpNode.getChildByName("user_li_count").getComponent(Label).string = hpAfter + "/" + hpBefore
    }
    updateHpOffField(unitId, hpAfter, hpBefore) {
        const item = this.getChracterChangXiaById(unitId)
        if (!item) return
        item.getChildByName("my_hp").getComponent(ProgressBar).progress = hpAfter / hpBefore
        const liCount = item.getChildByName("my_li_count")
        if (liCount) liCount.getComponent(Label).string = hpAfter + "/" + hpBefore
        const label = item.getChildByName("my_hp").getChildByName("user_li_count")
        if (label) label.getComponent(Label).string = hpAfter + "/" + hpBefore
    }
    updateHpBoth(unitId, hpAfter, hpBefore) {
        this.updateHpOnField(unitId, hpAfter, hpBefore)
        this.updateHpOffField(unitId, hpAfter, hpBefore)
    }

    // ========== 显示辅助 ==========
    showDamageOrHealNumber(unitId, characterNode, value, isHeal: boolean) {
        const color = isHeal ? new math.Color(82, 201, 25, 255) : new math.Color(255, 176, 126, 255)
        const displayValue = isHeal ? Math.abs(value) : -Math.abs(value)
        this.showNumber(this.isLeft(unitId), characterNode, displayValue, color, 40)
    }
    async showBuffString(changXiaNode, isBuff: boolean, text: string) {
        const color = isBuff ? new math.Color(0, 255, 0) : new math.Color(255, 0, 0)
        await this.showString(1, changXiaNode, color, text)
    }
    // 更新场下PHYSICAL_BARRIER的num护盾数值
    updateShieldNumLabel(unitId: string, shieldRemaining: number) {
        const itemNode = this.getChracterChangXiaById(unitId)
        const characterNode = this.getCharacterById(unitId)
        if (!itemNode && !characterNode) return
        // 护盾为0时，场上和场下的PHYSICAL_BARRIER都要隐藏
        if (shieldRemaining <= 0) {
            if (itemNode) {
                const barrierNode = itemNode.getChildByName("buff")?.getChildByName("PHYSICAL_BARRIER")
                if (barrierNode) barrierNode.active = false
            }
            if (characterNode) {
                const barrierNode = characterNode.getChildByName("PHYSICAL_BARRIER")
                if (barrierNode) barrierNode.active = false
            }
            return
        }
        // 护盾大于0时，更新场下num数值
        if (itemNode) {
            const barrierNode = itemNode.getChildByName("buff")?.getChildByName("PHYSICAL_BARRIER")
            if (barrierNode) {
                const numLabel = barrierNode.getChildByName("num")
                if (numLabel) {
                    numLabel.getComponent(Label).string = shieldRemaining.toString()
                }
            }
        }
    }
    isContinuousEffect(effectType: string): boolean {
        return CONTINUOUS_EFFECTS.indexOf(effectType) !== -1
    }
    isBuffUpEffect(effectType: string): boolean {
        return BUFF_UP_TYPES.indexOf(effectType) !== -1
    }
    isDebuffDownEffect(effectType: string): boolean {
        return DEBUFF_DOWN_TYPES.indexOf(effectType) !== -1
    }

    // ========== 动画 Promise 化 ==========
    async playAnimToPromise(Skeleton: sp.Skeleton): Promise<void> {
        return new Promise<void>(res => {
            if (!Skeleton || !Skeleton.node || !(Skeleton instanceof sp.Skeleton)) { res(); return; }
            const timeout = setTimeout(() => {
                console.warn("骨骼动画播放超时，强制完成");
                Skeleton.node.active = false; res();
            }, 5000);
            Skeleton.setCompleteListener(() => {
                clearTimeout(timeout); Skeleton.node.active = false; res();
            });
        });
    }
    async tweenToPromise(node: Node, duration: number, props: any, options?: { easing: string }) {
        return new Promise<void>(res => {
            tween(node).to(duration, props, { easing: 'elasticOut' }).call(() => res()).start();
        });
    }

    // ========== 音效 ==========
    playEffectSound(effectType: string) {
        if (this.isBuffUpEffect(effectType)) { AudioMgr.inst.playOneShot("sound/fight/skill/HP_UP"); return; }
        if (this.isDebuffDownEffect(effectType)) { AudioMgr.inst.playOneShot("sound/fight/skill/MAX_HP_DOWN"); return; }
        if (this.effectTypes.indexOf(effectType) !== -1) { AudioMgr.inst.playOneShot("sound/fight/skill/XULI"); return; }
        AudioMgr.inst.playOneShot("sound/fight/skill/" + effectType);
    }

    // ========== 战斗主循环 ==========
    private async fightStart(): Promise<boolean> {
        const cc = [
            new Color(200, 200, 200, 200), new Color(0, 230, 0, 200), new Color(0, 100, 255, 200),
            new Color(120, 0, 220, 200), new Color(255, 80, 0, 200), new Color(255, 0, 0, 200),
            new Color(255, 220, 30, 200), new Color(230, 0, 200, 200), new Color(180, 100, 0, 200),
            new Color(255, 255, 255, 200), new Color(80, 220, 240, 200), new Color(0, 110, 60, 200),
            new Color(240, 130, 20, 200), new Color(180, 100, 255, 200), new Color(255, 160, 40, 200),
            new Color(0, 40, 160, 200), new Color(255, 100, 160, 200), new Color(130, 140, 160, 200),
            new Color(100, 240, 80, 200), new Color(20, 20, 30, 200)
        ];
        for (var i = 0; i < this.fightProcess.length; i++) {
            if (this.isOverFight) break;
            let fp = this.fightProcess[i]
            this.currentRound = fp.round
            switch (fp.eventType) {
                case "ROUND_START": break;
                case "UNIT_ENTER": await this.handleUnitEnter(fp, cc); break;
                case "POISON": await this.handlePoison(fp); break;
                case "NORMAL_ATTACK": await this.handleNormalAttack(fp); break;
                case "UNIT_DEATH": await this.handleUnitDeath(fp); break;
                case "BATTLE_END": i = this.fightProcess.length; break;
                case "BUFF_END": await this.handleBuffEnd(fp); break;
                default: await this.handleSkillEvent(fp); break;
            }
        }
        return this.result
    }

    // ========== 事件处理器 ==========
    private async handleUnitEnter(fp, cc) {
        await Promise.all(this.actionAwaitQueue)
        this.actionAwaitQueue = []
        const isLeft = this.isLeft(fp.sourceUnitId)
        let characterNode = this.Character.children[isLeft ? 0 : 1]
        characterNode.setPosition(isLeft ? -180 : 180, 0, 0)
        let scaleNew = new Vec3(isLeft ? Math.abs(characterNode.scale.x) * -1 : Math.abs(characterNode.scale.x), characterNode.scale.y, characterNode.scale.z)
        characterNode.scale = new Vec3(0, 0, 0)
        characterNode.getComponent(Sprite).spriteFrame =
            await util.bundle.load(`game/texture/frames/hero/${fp.sourceUnitId.replace(/[a-zA-Z]/g, '')}/spriteFrame`, SpriteFrame)
        let material = characterNode.getComponent(Sprite).getMaterialInstance(0);
        if (fp.flyup == 0) {
            material.setProperty('enable', 0);
        } else {
            material.setProperty('enable', 1);
            material.setProperty('outerActive', 1);
            material.setProperty('outerStyle', Style.透明衰减);
            material.setProperty('outerColor', cc[fp.flyup - 1]);
            material?.setProperty('outerWidth', 0.8);
            material.setProperty('innerActive', 0);
            material.setProperty('brightness', 1);
            let ut = characterNode.getComponent(UITransform);
            material.setProperty('texSize', new Vec2(ut.width, ut.height));
            material.setProperty('centerScale', 1);
        }
        for (const key in fp.multiTargetDataMap) {
            const data = fp.multiTargetDataMap[key];
            if (data.stunned) { let s = characterNode.getChildByName('STUN').getComponent(sp.Skeleton); s.node.active = true; s.setAnimation(0, "animation", true) }
            if (data.silence) { let s = characterNode.getChildByName('SILENCE').getComponent(sp.Skeleton); s.node.active = true; s.setAnimation(0, "animation", true) }
            if (data.poison) { let s = characterNode.getChildByName('POISON').getComponent(sp.Skeleton); s.node.active = true; s.setAnimation(0, "animation", true) }
            if (data.healDown) { let s = characterNode.getChildByName('HEAL_DOWN').getComponent(sp.Skeleton); s.node.active = true; s.setAnimation(0, "animation", true) }
        }
        // 登场时同步场下的蓄力和护盾动画到场上
        const enterItemNode = this.getChracterChangXiaById(fp.sourceUnitId)
        if (enterItemNode) {
            const buffParent = enterItemNode.getChildByName("buff")
            if (buffParent) {
                // 护盾：场下PHYSICAL_BARRIER激活时，场上也激活
                const offBarrier = buffParent.getChildByName("PHYSICAL_BARRIER")
                if (offBarrier && offBarrier.active) {
                    const onBarrier = characterNode.getChildByName("PHYSICAL_BARRIER")
                    if (onBarrier) {
                        onBarrier.active = true
                        onBarrier.getComponent(sp.Skeleton).setAnimation(0, "animation", true)
                    }
                }
                // 蓄力：检查场下哪个蓄力等级激活，场上同步
                for (const et of this.effectTypes) {
                    const offEffect = buffParent.getChildByName(et)
                    if (offEffect && offEffect.active) {
                        const onEffect = characterNode.getChildByName(et)
                        if (onEffect) {
                            onEffect.active = true
                            onEffect.getComponent(sp.Skeleton).setAnimation(0, "animation", true)
                        }
                    }
                }
            }
        }
        let hpNode = this.Hp.children[isLeft ? 0 : 1]
        hpNode.getComponent(ProgressBar).progress = fp.sourceHpAfter / fp.sourceHpBefore
        hpNode.getChildByName("user_li_count").getComponent(Label).string = fp.sourceHpAfter + "/" + fp.sourceHpBefore
        const hurtPromise = this.tweenToPromise(characterNode, 1, { scale: scaleNew }, { easing: 'elasticOut' });
        this.actionAwaitQueue.push(hurtPromise)
        characterNode.getChildByName("id").active = true
        characterNode.getChildByName("id").getComponent(Label).string = fp.sourceUnitId
        await new Promise(res => setTimeout(res, 1000 / this.timeScale))
    }

    private async handlePoison(fp) {
        await Promise.all(this.actionAwaitQueue)
        this.actionAwaitQueue = []
        for (const key in fp.multiTargetDataMap) {
            const data = fp.multiTargetDataMap[key];
            let characterNode = this.getCharacterById(key)
            if (characterNode) {
                let skeleton = characterNode.getChildByName("POISON2").getComponent(sp.Skeleton)
                skeleton.node.active = true; skeleton.setAnimation(0, "animation", false)
                this.showDamageOrHealNumber(key, characterNode, -data.value, false)
                this.updateHpOnField(key, data.hpAfter, data.hpBefore)
                this.actionAwaitQueue.push(this.playAnimToPromise(skeleton))
            }
            let itemNode = this.getChracterChangXiaById(key)
            if (itemNode) {
                let skeleton = itemNode.getChildByName("buff").getChildByName("POISON2").getComponent(sp.Skeleton)
                skeleton.node.active = true; skeleton.setAnimation(0, "animation", false)
                await this.showBuffString(itemNode, false, "-" + data.value)
                this.updateHpOffField(key, data.hpAfter, data.hpBefore)
                this.actionAwaitQueue.push(this.playAnimToPromise(skeleton))
            }
        }
        await new Promise(res => setTimeout(res, 1000 / this.timeScale))
    }

    private async handleNormalAttack(fp) {
        await Promise.all(this.actionAwaitQueue)
        this.actionAwaitQueue = []
        let characterNode = this.getCharacterById(fp.sourceUnitId)
        if (characterNode) {
            await util.sundry.moveNodeToPosition(characterNode, {
                targetPosition: { x: this.isLeft(fp.sourceUnitId) ? 90 : -90, y: 0 }, moveCurve: true, moveTimeScale: this.timeScale
            })
        }
        if (fp.effectType == "DISP") {
            await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
            let targetChar = this.getCharacterById(fp.targetUnitId)
            let targetItem = this.getChracterChangXiaById(fp.targetUnitId)
            if (targetChar) {
                let skeleton = targetChar.getChildByName("DISP").getComponent(sp.Skeleton)
                skeleton.node.active = true; skeleton.setAnimation(0, "animation", false)
                skeleton.setCompleteListener(() => { AudioMgr.inst.playOneShot("sound/fight/skill/DISP"); skeleton.node.active = false; })
            }
            if (targetItem) await this.showBuffString(targetItem, false, fp.extraDesc)
        } else if (fp.effectType == "CRIT") {
            await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
            let targetChar = this.getCharacterById(fp.targetUnitId)
            let targetItem = this.getChracterChangXiaById(fp.targetUnitId)
            AudioMgr.inst.playOneShot("sound/fight/skill/chuanyun_grial");
            if (targetChar) {
                let critSkeleton = targetChar.getChildByName("CRIT").getComponent(sp.Skeleton)
                critSkeleton.node.active = true; critSkeleton.setAnimation(0, "animation", false)
                critSkeleton.setCompleteListener(() => { critSkeleton.node.active = false; })
                AudioMgr.inst.playOneShot("sound/fight/attack/attack");
                let hut = targetChar.getChildByName("hut").getComponent(sp.Skeleton)
                hut.node.active = true; hut.setAnimation(0, "animation", false)
                this.showDamageOrHealNumber(fp.targetUnitId, targetChar, -fp.singleTargetValue, false)
                this.actionAwaitQueue.push(this.playAnimToPromise(hut))
            }
            this.updateHpBoth(fp.targetUnitId, fp.targetHpAfter, fp.targetHpBefore)
            if (targetItem) await this.showBuffString(targetItem, false, fp.extraDesc)
        } else if (fp.effectType == "CRIT_DISP") {
            await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
            let targetChar = this.getCharacterById(fp.targetUnitId)
            let targetItem = this.getChracterChangXiaById(fp.targetUnitId)
            AudioMgr.inst.playOneShot("sound/fight/skill/chuanyun_grial");
            if (targetChar) {
                let critSkeleton = targetChar.getChildByName("CRIT").getComponent(sp.Skeleton)
                critSkeleton.node.active = true; critSkeleton.setAnimation(0, "animation", false)
                critSkeleton.setCompleteListener(async () => {
                    critSkeleton.node.active = false;
                    if (targetItem) await this.showBuffString(targetItem, false, fp.extraDesc)
                    let dispSkeleton = targetChar.getChildByName("DISP").getComponent(sp.Skeleton)
                    dispSkeleton.node.active = true; dispSkeleton.setAnimation(0, "animation", false)
                    dispSkeleton.setCompleteListener(() => { AudioMgr.inst.playOneShot("sound/fight/skill/DISP"); dispSkeleton.node.active = false; })
                    if (targetItem) await this.showBuffString(targetItem, false, fp.extraDesc)
                })
            }
        } else {
            AudioMgr.inst.playOneShot("sound/fight/attack/attack");
            let targetChar = this.getCharacterById(fp.targetUnitId)
            if (targetChar) {
                let hut = targetChar.getChildByName("hut").getComponent(sp.Skeleton)
                hut.node.active = true; hut.setAnimation(0, "animation", false)
                this.showDamageOrHealNumber(fp.targetUnitId, targetChar, -fp.singleTargetValue, false)
                this.actionAwaitQueue.push(this.playAnimToPromise(hut))
            }
            this.updateHpBoth(fp.targetUnitId, fp.targetHpAfter, fp.targetHpBefore)
        }
        // 物理伤害时更新护盾数值
        if (fp.shieldRemaining !== undefined && fp.targetUnitId) {
            this.updateShieldNumLabel(fp.targetUnitId, fp.shieldRemaining)
        }
        if (characterNode) {
            await util.sundry.moveNodeToPosition(characterNode, {
                targetPosition: { x: this.isLeft(fp.sourceUnitId) ? -180 : 180, y: 0 }, moveCurve: true, moveTimeScale: this.timeScale
            })
        }
        await new Promise(res => setTimeout(res, 200 / this.timeScale))
    }

    private async handleUnitDeath(fp) {
        await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
        const killList = fp.multiTargetDataMap ? Object.keys(fp.multiTargetDataMap) : [fp.targetUnitId]
        for (const key of killList) {
            let characterNode = this.getCharacterById(key)
            if (characterNode) {
                characterNode.getComponent(Sprite).spriteFrame = null
                characterNode.children.forEach(buffNode => { buffNode.active = false; });
            }
            let itemNode = this.getChracterChangXiaById(key)
            if (itemNode) {
                itemNode.getChildByName("dead").active = true
                itemNode.getChildByName("buff").children.forEach(buffNode => {
                    if (buffNode.name !== "FIXED_SOUL") buffNode.active = false;
                });
            }
        }
        await new Promise(res => setTimeout(res, 200 / this.timeScale))
    }

    private async handleBuffEnd(fp) {
        await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
        for (const key in fp.multiTargetDataMap) {
            const data = fp.multiTargetDataMap[key];
            const itemNode = this.getChracterChangXiaById(key)
            const characterNode = this.getCharacterById(key)
            const buffParent = itemNode?.getChildByName("buff")
            for (const [status, nodeName] of [['stunned', 'STUN'], ['silence', 'SILENCE'], ['poison', 'POISON'], ['healDown', 'HEAL_DOWN']] as const) {
                if (!data[status]) {
                    if (buffParent) buffParent.getChildByName(nodeName).active = false
                    if (characterNode) characterNode.getChildByName(nodeName).active = false
                }
            }
        }
        await new Promise(res => setTimeout(res, 1000 / this.timeScale))
    }

    // ========== 技能事件分发 ==========
    private async handleSkillEvent(fp) {
        await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
        // 乌江之殇：回合开始被动，独立处理
        if (fp.eventType == '乌江之殇') {
            await this.handleWujiangSkill(fp)
            this.skillName.children[this.isLeft(fp.sourceUnitId) ? 0 : 1].active = false
            await new Promise(res => setTimeout(res, 1500 / this.timeScale))
            return
        }
        // 月满重生：复活技能，独立处理
        if (fp.eventType == '月满重生') {
            await this.handleRevive(fp)
            this.skillName.children[this.isLeft(fp.sourceUnitId) ? 0 : 1].active = false
            await new Promise(res => setTimeout(res, 1500 / this.timeScale))
            return
        }
        // 换位秘术：换位技能，独立处理
        if (fp.eventType == '换位秘术') {
            await this.handleSwap(fp)
            this.skillName.children[this.isLeft(fp.sourceUnitId) ? 0 : 1].active = false
            await new Promise(res => setTimeout(res, 1500 / this.timeScale))
            return
        }
        // 元气消散：驱散增益+清护盾，护盾数值先变0再关动画
        if (fp.eventType == '元气消散') {
            // 场下释放：播放源单位 select 动画 + 技能名飘字
            if (!fp.sourceFieldStatus) {
                const sourceItemNode = this.getChracterChangXiaById(fp.sourceUnitId)
                if (sourceItemNode) {
                    let selectSkeleton = sourceItemNode.getChildByName("select").getComponent(sp.Skeleton)
                    selectSkeleton.node.active = true
                    selectSkeleton.setAnimation(0, "animation", false)
                    tween(sourceItemNode)
                        .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
                        .call(async () => {
                            this.playEffectSound(fp.effectType)
                            await this.showString(1, sourceItemNode, new math.Color(236, 163, 61, 255), fp.eventType)
                            await new Promise(res => setTimeout(res, 300 / this.timeScale))
                        })
                        .by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
                        .start()
                    this.actionAwaitQueue.push(this.playAnimToPromise(selectSkeleton))
                }
                await Promise.all(this.actionAwaitQueue)
                this.actionAwaitQueue = []
            }
            await this.handleYuanQiXiaoSan(fp)
            this.skillName.children[this.isLeft(fp.sourceUnitId) ? 0 : 1].active = false
            await new Promise(res => setTimeout(res, 1500 / this.timeScale))
            return
        }
        if (fp.sourceFieldStatus) {
            if (fp.aoe == 1) await this.handleSkillOnFieldAoe(fp)
            else await this.handleSkillOnFieldSingle(fp)
        } else {
            await this.handleSkillOffField(fp)
        }
        this.skillName.children[this.isLeft(fp.sourceUnitId) ? 0 : 1].active = false
        await new Promise(res => setTimeout(res, 1500 / this.timeScale))
    }

    // --- 月满重生：复活单位（恢复场上显示、清除死亡标记、添加固魂动画） ---
    private async handleRevive(fp) {
        const sideIdx = this.isLeft(fp.sourceUnitId) ? 0 : 1
        const sourceItemNode = this.getChracterChangXiaById(fp.sourceUnitId)

        // 1. 播放嫦娥场下 select 动画 + 飘技能名
        if (sourceItemNode) {
            let selectSkeleton = sourceItemNode.getChildByName("select").getComponent(sp.Skeleton)
            selectSkeleton.node.active = true
            selectSkeleton.setAnimation(0, "animation", false)
            tween(sourceItemNode)
                .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
                .call(async () => {
                    AudioMgr.inst.playOneShot("sound/fight/skill/HEAL")
                    await this.showString(1, sourceItemNode, new math.Color(236, 163, 61, 255), fp.eventType)
                    await new Promise(res => setTimeout(res, 300 / this.timeScale))
                })
                .by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
                .start()
            this.actionAwaitQueue.push(this.playAnimToPromise(selectSkeleton))
        }
        await Promise.all(this.actionAwaitQueue)
        this.actionAwaitQueue = []

        // 2. 处理被复活单位
        const targetId = fp.targetUnitId
        const targetItemNode = this.getChracterChangXiaById(targetId)
        const targetCharacterNode = this.getCharacterById(targetId)
        const isTargetLeft = this.isLeft(targetId)

        // 2a. 清除场下死亡标记
        if (targetItemNode) {
            targetItemNode.getChildByName("dead").active = false
        }

        // 2b. 恢复场上角色精灵（之前死亡时被清空）
        if (targetCharacterNode) {
            targetCharacterNode.getComponent(Sprite).spriteFrame =
                await util.bundle.load(`game/texture/frames/hero/${targetId.replace(/[a-zA-Z]/g, '')}/spriteFrame`, SpriteFrame)
            // 缩放动画：从0弹出
            const scaleNew = new Vec3(
                isTargetLeft ? Math.abs(targetCharacterNode.scale.x) * -1 : Math.abs(targetCharacterNode.scale.x),
                targetCharacterNode.scale.y,
                targetCharacterNode.scale.z
            )
            targetCharacterNode.scale = new Vec3(0, 0, 0)
            const revivePromise = this.tweenToPromise(targetCharacterNode, 0.8, { scale: scaleNew }, { easing: 'elasticOut' })
            this.actionAwaitQueue.push(revivePromise)
            targetCharacterNode.getChildByName("id").active = true
            targetCharacterNode.getChildByName("id").getComponent(Label).string = targetId
        }

        // 2c. 播放固魂动画（持续效果，场上+场下都播）
        // 场下固魂动画
        if (targetItemNode) {
            const fixedSoulNode = targetItemNode.getChildByName("buff")?.getChildByName("FIXED_SOUL")
            if (fixedSoulNode) {
                fixedSoulNode.active = true
                fixedSoulNode.getComponent(sp.Skeleton).setAnimation(0, "animation", true)
            }
        }
        // 场上固魂动画
        if (targetCharacterNode) {
            const fixedSoulCharNode = targetCharacterNode.getChildByName("FIXED_SOUL")
            if (fixedSoulCharNode) {
                fixedSoulCharNode.active = true
                fixedSoulCharNode.getComponent(sp.Skeleton).setAnimation(0, "animation", true)
            }
        }

        // 2d. 更新被复活单位血条（复活后HP / 最大HP）
        this.updateHpOnField(targetId, fp.targetHpAfter, fp.targetHpBefore)
        this.updateHpOffField(targetId, fp.targetHpAfter, fp.targetHpBefore)

        // 2e. 更新嫦娥生命消耗显示（sourceHpBefore=扣血前HP, sourceHpAfter=扣血后HP, value=消耗量）
        this.updateHpOnField(fp.sourceUnitId, fp.sourceHpAfter, fp.sourceHpBefore)
        this.updateHpOffField(fp.sourceUnitId, fp.sourceHpAfter, fp.sourceHpBefore)
        if (sourceItemNode) {
            await this.showBuffString(sourceItemNode, false, "生命 -" + fp.sourceSelfValue)
        }

        // 2f. 场下飘字
        if (targetItemNode && fp.extraDesc) {
            await this.showBuffString(targetItemNode, true, fp.extraDesc)
        }

        await new Promise(res => setTimeout(res, 500 / this.timeScale))
    }

    // --- 换位秘术：将自身与随机队友互换位置 ---
    private async handleSwap(fp) {
        const sourceId = fp.sourceUnitId   // 捡漏小妖
        const targetId = fp.targetUnitId   // 互换的队友
        const sourceItemNode = this.getChracterChangXiaById(sourceId)
        const targetItemNode = this.getChracterChangXiaById(targetId)
        // 场上角色节点：换位前在场上的单位，其 ID 还在 characterNode 上
        // sourceFieldStatus 是换位后的状态，所以反转查找
        let characterNode = this.getCharacterById(sourceId) || this.getCharacterById(targetId)
        const isSourceLeft = this.isLeft(sourceId)

        // 1. 播放捡漏小妖场下 select 动画 + 飘技能名
        if (sourceItemNode) {
            let selectSkeleton = sourceItemNode.getChildByName("select").getComponent(sp.Skeleton)
            selectSkeleton.node.active = true
            selectSkeleton.setAnimation(0, "animation", false)
            tween(sourceItemNode)
                .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
                .call(async () => {
                    AudioMgr.inst.playOneShot("sound/fight/skill/DISP")
                    await this.showString(1, sourceItemNode, new math.Color(236, 163, 61, 255), fp.eventType)
                    await new Promise(res => setTimeout(res, 300 / this.timeScale))
                })
                .by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
                .start()
            this.actionAwaitQueue.push(this.playAnimToPromise(selectSkeleton))
        }
        await Promise.all(this.actionAwaitQueue)
        this.actionAwaitQueue = []

        // 2. 隐藏旧单位（捡漏小妖）场上角色
        if (characterNode) {
            characterNode.getComponent(Sprite).spriteFrame = null
            characterNode.children.forEach(child => { child.active = false })
        }

        // 3. 显示新上场单位场上角色 + 同步登场效果
        // sourceFieldStatus 是换位后状态：true=捡漏小妖上场了(原来场下)，false=捡漏小妖下场了(原来场上)
        const newOnFieldId = fp.sourceFieldStatus ? sourceId : targetId
        if (characterNode) {
            const heroId = newOnFieldId.replace(/[a-zA-Z]/g, '')
            characterNode.getComponent(Sprite).spriteFrame =
                await util.bundle.load(`game/texture/frames/hero/${heroId}/spriteFrame`, SpriteFrame)
            // 更新场上角色 ID 标签，使 getCharacterById 能正确找到新单位
            const idNode = characterNode.getChildByName("id")
            if (idNode) { idNode.active = true; idNode.getComponent(Label).string = newOnFieldId }
            // 同步新单位场下的蓄力和护盾动画到场上（与 handleUnitEnter 一致）
            const newItemNode = this.getChracterChangXiaById(newOnFieldId)
            if (newItemNode) {
                const buffParent = newItemNode.getChildByName("buff")
                if (buffParent) {
                    // 护盾：场下PHYSICAL_BARRIER激活时，场上也激活
                    const offBarrier = buffParent.getChildByName("PHYSICAL_BARRIER")
                    if (offBarrier && offBarrier.active) {
                        const onBarrier = characterNode.getChildByName("PHYSICAL_BARRIER")
                        if (onBarrier) {
                            onBarrier.active = true
                            onBarrier.getComponent(sp.Skeleton).setAnimation(0, "animation", true)
                        }
                    }
                    // 蓄力：检查场下哪个蓄力等级激活，场上同步
                    for (const et of this.effectTypes) {
                        const offEffect = buffParent.getChildByName(et)
                        if (offEffect && offEffect.active) {
                            const onEffect = characterNode.getChildByName(et)
                            if (onEffect) {
                                onEffect.active = true
                                onEffect.getComponent(sp.Skeleton).setAnimation(0, "animation", true)
                            }
                        }
                    }
                }
            }
            // 弹性登场动画
            characterNode.scale = new Vec3(0, 0, 0)
            const scaleNew = new Vec3(isSourceLeft ? -1 : 1, 1, 1)
            const hurtPromise = this.tweenToPromise(characterNode, 1, { scale: scaleNew }, { easing: 'elasticOut' })
            this.actionAwaitQueue.push(hurtPromise)
            await new Promise(res => setTimeout(res, 1000 / this.timeScale))
        }

        // 4. 互换场下图标内容（头像、ID、血条）
        if (sourceItemNode && targetItemNode) {
            // 4a. 互换头像
            const srcHeader = sourceItemNode.getChildByName("header")
            const tgtHeader = targetItemNode.getChildByName("header")
            if (srcHeader && tgtHeader) {
                const srcSf = srcHeader.getComponent(Sprite).spriteFrame
                srcHeader.getComponent(Sprite).spriteFrame = tgtHeader.getComponent(Sprite).spriteFrame
                tgtHeader.getComponent(Sprite).spriteFrame = srcSf
            }
            // 4b. 互换 ID 标签（使 getChracterChangXiaById 能正确查找）
            const srcIdLabel = sourceItemNode.getChildByName("id")
            const tgtIdLabel = targetItemNode.getChildByName("id")
            if (srcIdLabel && tgtIdLabel) {
                const srcId = srcIdLabel.getComponent(Label).string
                srcIdLabel.getComponent(Label).string = tgtIdLabel.getComponent(Label).string
                tgtIdLabel.getComponent(Label).string = srcId
            }
            // 4c. 互换血条显示
            const srcHp = sourceItemNode.getChildByName("my_hp")
            const tgtHp = targetItemNode.getChildByName("my_hp")
            if (srcHp && tgtHp) {
                const srcProgress = srcHp.getComponent(ProgressBar).progress
                const srcText = srcHp.getChildByName("user_li_count")?.getComponent(Label)?.string || ""
                const tgtProgress = tgtHp.getComponent(ProgressBar).progress
                const tgtText = tgtHp.getChildByName("user_li_count")?.getComponent(Label)?.string || ""
                srcHp.getComponent(ProgressBar).progress = tgtProgress
                const srcLiCount = sourceItemNode.getChildByName("my_li_count")
                if (srcLiCount) srcLiCount.getComponent(Label).string = tgtText
                const srcUserLi = srcHp.getChildByName("user_li_count")
                if (srcUserLi) srcUserLi.getComponent(Label).string = tgtText
                tgtHp.getComponent(ProgressBar).progress = srcProgress
                const tgtLiCount = targetItemNode.getChildByName("my_li_count")
                if (tgtLiCount) tgtLiCount.getComponent(Label).string = srcText
                const tgtUserLi = tgtHp.getChildByName("user_li_count")
                if (tgtUserLi) tgtUserLi.getComponent(Label).string = srcText
            }
            // 4d. 互换 buff 状态（护盾、蓄力、控制等视觉效果跟着图标走）
            const srcBuff = sourceItemNode.getChildByName("buff")
            const tgtBuff = targetItemNode.getChildByName("buff")
            if (srcBuff && tgtBuff) {
                for (const srcChild of srcBuff.children) {
                    const tgtChild = tgtBuff.getChildByName(srcChild.name)
                    if (tgtChild) {
                        // 互换 active 状态
                        const tmpActive = srcChild.active
                        srcChild.active = tgtChild.active
                        tgtChild.active = tmpActive
                        // 互换护盾数值
                        if (srcChild.name === "PHYSICAL_BARRIER") {
                            const srcNum = srcChild.getChildByName("num")
                            const tgtNum = tgtChild.getChildByName("num")
                            if (srcNum && tgtNum) {
                                const tmpNum = srcNum.getComponent(Label).string
                                srcNum.getComponent(Label).string = tgtNum.getComponent(Label).string
                                tgtNum.getComponent(Label).string = tmpNum
                            }
                        }
                    }
                }
            }
        }
        // 更新场上HP（使用新上场单位的 HP 数据）
        if (characterNode) {
            if (fp.sourceFieldStatus) {
                // 捡漏小妖现在在场上下（原来场下），用 source HP
                this.updateHpOnField(newOnFieldId, fp.sourceHpAfter, fp.sourceHpBefore)
            } else {
                // 捡漏小妖现在在场下（原来场上），队友上场，用 target HP
                this.updateHpOnField(newOnFieldId, fp.targetHpAfter, fp.targetHpBefore)
            }
        }

        // 5. 飘字
        if (sourceItemNode) {
            await this.showBuffString(sourceItemNode, false, fp.extraDesc || "换位")
        }
    }

    // --- 元气消散：驱散增益+清护盾，护盾数值先变0再关动画 ---
    private async handleYuanQiXiaoSan(fp) {
        if (!fp.multiTargetDataMap) return
        for (const key in fp.multiTargetDataMap) {
            const itemNode = this.getChracterChangXiaById(key)
            const characterNode = this.getCharacterById(key)
            // 1. 护盾数值先变0
            if (itemNode) {
                const barrierNode = itemNode.getChildByName("buff")?.getChildByName("PHYSICAL_BARRIER")
                if (barrierNode) {
                    const numLabel = barrierNode.getChildByName("num")
                    if (numLabel) numLabel.getComponent(Label).string = "0"
                }
            }
            if (characterNode) {
                const barrierNode = characterNode.getChildByName("PHYSICAL_BARRIER")
                if (barrierNode) {
                    const numLabel = barrierNode.getChildByName("num")
                    if (numLabel) numLabel.getComponent(Label).string = "0"
                }
            }
            // 2. 再关闭护盾动画
            if (itemNode) {
                const barrierNode = itemNode.getChildByName("buff")?.getChildByName("PHYSICAL_BARRIER")
                if (barrierNode) barrierNode.active = false
            }
            if (characterNode) {
                const barrierNode = characterNode.getChildByName("PHYSICAL_BARRIER")
                if (barrierNode) barrierNode.active = false
            }
        }
        await new Promise(res => setTimeout(res, 500 / this.timeScale))
    }

    // --- 乌江之殇：回合开始扣血+物理结界（持续效果） ---
    private async handleWujiangSkill(fp) {
        const sideIdx = this.isLeft(fp.sourceUnitId) ? 0 : 1
        const sourceItemNode = this.getChracterChangXiaById(fp.sourceUnitId)
        const sourceCharacterNode = this.getCharacterById(fp.sourceUnitId)
        
        if (fp.sourceFieldStatus) {
            // 场上释放：用 skillName 显示技能名字
            this.skillName.children[sideIdx].active = true
            this.skillName.children[sideIdx].getChildByName("Label").getComponent(Label).string = fp.eventType
        } else {
            // 场下释放：用 showString 在场下图标上飘技能名字（参考 handleSkillOffField）
            if (sourceItemNode) {
                let selectSkeleton = sourceItemNode.getChildByName("select").getComponent(sp.Skeleton)
                selectSkeleton.node.active = true
                selectSkeleton.setAnimation(0, "animation", false)
                tween(sourceItemNode)
                    .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
                    .call(async () => {
                        await this.showString(1, sourceItemNode, new math.Color(236, 163, 61, 255), fp.eventType)
                        await new Promise(res => setTimeout(res, 300 / this.timeScale))
                    })
                    .by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
                    .start()
                this.actionAwaitQueue.push(this.playAnimToPromise(selectSkeleton))
            }
            await Promise.all(this.actionAwaitQueue)
            this.actionAwaitQueue = []
        }
        
        // 播放音效和PHYSICAL_BARRIER动画
        await new Promise(res => setTimeout(res, 800 / this.timeScale))
        AudioMgr.inst.playOneShot("sound/fight/skill/HEAL")
        
        // 遍历所有目标（multiTargetDataMap里的所有单位都要有动画）
        for (const key in fp.multiTargetDataMap) {
            const data = fp.multiTargetDataMap[key]
            const characterNode = this.getCharacterById(key)
            const itemNode = this.getChracterChangXiaById(key)
            
            // 扣血数字（红色）- 只在场上显示
            if (characterNode) {
                this.showNumber(this.isLeft(key), characterNode, -data.value, new math.Color(255, 176, 126, 255), 40)
            }
            
            // 更新血条（场上+场下）
            this.updateHpBoth(key, data.hpAfter, data.hpBefore)
            
            // PHYSICAL_BARRIER动画：场下动画和文字必须播放，场上动画额外播放
            // 1. 场下动画和文字（所有单位都播放）
            if (itemNode) {
                let sk = itemNode.getChildByName("buff").getChildByName("PHYSICAL_BARRIER").getComponent(sp.Skeleton)
                sk.node.active = true
                sk.setAnimation(0, "animation", true) // 持续循环
                // 更新护盾数值
                if (data.shieldRemaining !== undefined) {
                    this.updateShieldNumLabel(key, data.shieldRemaining)
                }
                // 场下飘字
                if (fp.extraDesc) {
                    await this.showString(1, itemNode, new math.Color(0, 255, 0), fp.extraDesc)
                }
            }
            // 2. 场上动画（额外播放，如果单位在场上）
            if (data.fieldStatus && characterNode) {
                let sk = characterNode.getChildByName("PHYSICAL_BARRIER").getComponent(sp.Skeleton)
                sk.node.active = true
                sk.setAnimation(0, "animation", true) // 持续循环
            }
        }
    }

    // --- 场上群体技能 ---
    private async handleSkillOnFieldAoe(fp) {
        const sideIdx = this.isLeft(fp.sourceUnitId) ? 0 : 1
        this.skillName.children[sideIdx].active = true
        this.skillName.children[sideIdx].getChildByName("Label").getComponent(Label).string = fp.eventType
        await new Promise(res => setTimeout(res, 800 / this.timeScale))
        AudioMgr.inst.playOneShot("sound/fight/skill/" + fp.effectType);
        let skeletons: sp.Skeleton[] = []
        for (const key in fp.multiTargetDataMap) {
            let itemNode = this.getChracterChangXiaById(key)
            let characterNode = this.getCharacterById(key)
            if (characterNode) skeletons.push(characterNode.getChildByName(fp.effectType).getComponent(sp.Skeleton))
            skeletons.push(itemNode.getChildByName("buff").getChildByName(fp.effectType).getComponent(sp.Skeleton))
        }
        skeletons.forEach(s => {
            s.node.active = true
            if (this.isContinuousEffect(fp.effectType)) s.setAnimation(0, "animation", true);
            else { s.setAnimation(0, "animation", false); this.actionAwaitQueue.push(this.playAnimToPromise(s)) }
        })
        for (const key in fp.multiTargetDataMap) {
            const data = fp.multiTargetDataMap[key];
            const itemNode = this.getChracterChangXiaById(key)
            const characterNode = this.getCharacterById(key)
            if (characterNode) {
                if (fp.effectType != 'POISON') {
                    const isHeal = fp.effectType == 'HEAL' || fp.effectType == 'HP_UP' || fp.effectType == 'SPEED_UP'
                    this.showDamageOrHealNumber(key, characterNode, data.value, isHeal)
                }
                this.updateHpOnField(key, data.hpAfter, data.hpBefore)
            }
            await this.showAoeBuffString(fp, key, data, itemNode)
            this.updateHpOffField(key, data.hpAfter, data.hpBefore)
        }
    }
    async showAoeBuffString(fp, key, data, itemNode) {
        const et = fp.effectType
        if (et == 'STUN') await this.showBuffString(itemNode, false, "眩晕2回合")
        else if (et == 'POISON') await this.showBuffString(itemNode, false, "中毒+" + data.value)
        else if (et == 'POISON_RESIST_BOOST_PRET') await this.showBuffString(itemNode, true, "中毒-" + data.value + "%")
        else if (et == 'MAX_HP_DOWN') {
            const desc = (fp.sourceUnitId == 'A1101' || fp.sourceUnitId == 'B1101') ? "飞弹抗性 -" + data.value : "生命上限 -" + data.value
            await this.showBuffString(itemNode, false, desc)
        } else if (et == 'HP_UP') {
            const desc = (fp.sourceUnitId == 'A1101' || fp.sourceUnitId == 'B1101') ? "血限不减" : "生命上限 +" + data.value
            await this.showBuffString(itemNode, true, desc)
        } else if (et == 'HEAL') await this.showBuffString(itemNode, true, "+" + data.value)
        else if (et == 'SPEED_UP') await this.showBuffString(itemNode, true, "速度+" + data.value)
        else await this.showBuffString(itemNode, false, "-" + data.value)
    }

    // --- 场上单体技能 ---
    private async handleSkillOnFieldSingle(fp) {
        const sideIdx = this.isLeft(fp.sourceUnitId) ? 0 : 1
        this.skillName.children[sideIdx].active = true
        this.skillName.children[sideIdx].getChildByName("Label").getComponent(Label).string = fp.eventType
        await new Promise(res => setTimeout(res, 800 / this.timeScale))
        const characterNode = this.getCharacterById(fp.sourceUnitId)
        const targetChar = this.getCharacterById(fp.targetUnitId)
        const targetItem = this.getChracterChangXiaById(fp.targetUnitId)
        if (SWORD_SKILL_NAMES.indexOf(fp.eventType) !== -1) {
            await this.playSwordSkill(fp, targetChar, targetItem)
        } else if (COUNTER_SKILL_NAMES.indexOf(fp.eventType) !== -1) {
            await this.playCounterSkill(fp, characterNode, targetChar, targetItem)
        } else if (this.effectTypes.indexOf(fp.effectType) !== -1) {
            AudioMgr.inst.playOneShot("sound/fight/skill/XULI");
            for (const et of this.effectTypes) { const n = characterNode.getChildByName(et); if (n) n.active = false; }
            let sk = characterNode.getChildByName(fp.effectType).getComponent(sp.Skeleton)
            sk.node.active = true; sk.setAnimation(0, "animation", true)
            await new Promise(res => setTimeout(res, 200 / this.timeScale))
        } else if (fp.eventType == "三火齐飞") {
            for (const name of this.effectTypes) { const n = characterNode.getChildByName(name); if (n) n.active = false; }
        } else if (fp.eventType == "乾坤破") {
            await this.playQiankunSkill(fp, characterNode, targetItem, targetChar)
        } else if (fp.eventType == "大地净化") {
            await this.playDijinghuaSkill(fp, characterNode, targetChar, targetItem)
        } else if (fp.eventType == "满目桃花") {
            AudioMgr.inst.playOneShot("sound/fight/skill/manmutaohua");
            let sk = characterNode.getChildByName("manmutaohua").getComponent(sp.Skeleton)
            sk.node.active = true; sk.setAnimation(0, "animation", false)
            this.actionAwaitQueue.push(this.playAnimToPromise(sk))
        } else if (fp.eventType == "圣灵瀑" || fp.eventType == "圣灵泉涌") {
            AudioMgr.inst.playOneShot("sound/fight/skill/MISSILE_DAMAGE");
            let sk = targetChar.getChildByName("MISSILE_DAMAGE").getComponent(sp.Skeleton)
            sk.node.active = true; sk.setAnimation(0, "animation", false)
            this.actionAwaitQueue.push(this.playAnimToPromise(sk))
        } else if (fp.eventType == "毒伤迸发") {
            AudioMgr.inst.playOneShot("sound/fight/skill/1004");
            let hut = targetChar.getChildByName("hut").getComponent(sp.Skeleton)
            hut.node.active = true; hut.setAnimation(0, "animation", false)
            hut.setCompleteListener(() => { hut.node.active = false })
        } else if (fp.eventType == "穿云斩" || fp.eventType == "穿云剑") {
            await this.playChuanyunSkill(fp, characterNode, targetItem, "chuanyun", "sound/fight/skill/chuanyun_grial")
        } else if (fp.eventType == "穿云长枪" || fp.eventType == "圣灵斩") {
            await this.playChuanyunSkill(fp, characterNode, targetItem, "chuanyun", "sound/fight/skill/chuanyun_man")
        } else if (this.isBuffUpEffect(fp.effectType)) {
            await this.playBuffUpAnimation(fp, targetChar, targetItem)
        } else if (this.isDebuffDownEffect(fp.effectType)) {
            await this.playDebuffDownAnimation(fp, targetChar, targetItem)
        } else {
            await this.playDefaultSkillEffect(fp, targetChar, targetItem)
        }
        // 闪避buff不更新血条
        if (fp.effectType !== 'DODGE_UP' && fp.effectType !== 'DODGE_UP_PRET' && fp.effectType !== 'DODGE_DOWN' && fp.effectType !== 'DODGE_DOWN_PRET') {
            if (targetChar) this.updateHpOnField(fp.targetUnitId, fp.targetHpAfter, fp.targetHpBefore)
        }
        if (this.effectTypes.indexOf(fp.effectType) !== -1) {
            for (const et of this.effectTypes) {
                if (et != fp.effectType) { const n = targetItem.getChildByName("buff").getChildByName(et); if (n) n.active = false; }
            }
        }
        if (fp.effectType !== 'DODGE_UP' && fp.effectType !== 'DODGE_UP_PRET' && fp.effectType !== 'DODGE_DOWN' && fp.effectType !== 'DODGE_DOWN_PRET') {
            this.updateHpOffField(fp.targetUnitId, fp.targetHpAfter, fp.targetHpBefore)
        }
    }

    // ========== 技能动画子方法 ==========
    private async playSwordSkill(fp, targetChar, targetItem) {
        AudioMgr.inst.playOneShot("sound/fight/skill/DHSZ3");
        let sk1 = targetChar.getChildByName("DHSZ").getComponent(sp.Skeleton)
        sk1.node.active = true; sk1.setAnimation(0, "animation", false)
        sk1.setCompleteListener(() => {
            sk1.node.active = false
            AudioMgr.inst.playOneShot("sound/fight/skill/DHSZ");
            let sk2 = targetChar.getChildByName("DHSZ2").getComponent(sp.Skeleton)
            sk2.node.active = true; sk2.setAnimation(0, "animation", false)
            this.showDamageOrHealNumber(fp.targetUnitId, targetChar, -fp.singleTargetValue, false)
            sk2.setCompleteListener(() => { sk2.node.active = false })
        })
        await new Promise(res => setTimeout(res, 200 / this.timeScale))
    }
    private async playCounterSkill(fp, charNode, targetChar, targetItem) {
        const isLeft = this.isLeft(fp.sourceUnitId)
        if (fp.eventType == "绝地反击") AudioMgr.inst.playOneShot("sound/fight/skill/JDFJ");
        else AudioMgr.inst.playOneShot("sound/fight/skill/chuanyun_grial");
        await util.sundry.moveNodeToPosition(charNode, {
            targetPosition: { x: isLeft ? 90 : -90, y: 0 }, moveCurve: true, moveTimeScale: this.timeScale
        })
        AudioMgr.inst.playOneShot("sound/fight/attack/attack");
        let hut = targetChar.getChildByName("hut").getComponent(sp.Skeleton)
        hut.node.active = true; hut.setAnimation(0, "animation", false)
        this.showDamageOrHealNumber(fp.sourceUnitId, targetChar, -fp.singleTargetValue, false)
        this.updateHpBoth(fp.targetUnitId, fp.targetHpAfter, fp.targetHpBefore)
        this.actionAwaitQueue.push(this.playAnimToPromise(hut))
        await util.sundry.moveNodeToPosition(charNode, {
            targetPosition: { x: isLeft ? -180 : 180, y: 0 }, moveCurve: true, moveTimeScale: this.timeScale
        })
    }
    private async playQiankunSkill(fp, charNode, targetItem, targetChar) {
        const changXiaNode = this.getChracterChangXiaById(fp.sourceUnitId)
        for (const name of this.effectTypes) {
            const n = charNode.getChildByName(name); if (n) n.active = false;
            const n2 = changXiaNode?.getChildByName("buff").getChildByName(name); if (n2) n2.active = false;
        }
        AudioMgr.inst.playOneShot("sound/fight/skill/chuanyun_man");
        let sk = charNode.getChildByName("chuanyun2").getComponent(sp.Skeleton)
        sk.node.active = true; sk.setAnimation(0, "animation", false)
        sk.setCompleteListener(async () => {
            sk.node.active = false
            AudioMgr.inst.playOneShot("sound/fight/skill/1004");
            let sk2 = targetItem.getChildByName("buff").getChildByName("chuanyun").getComponent(sp.Skeleton)
            sk2.node.active = true
            await this.showBuffString(targetItem, false, fp.extraDesc)
            sk2.setAnimation(0, "animation", false)
            sk2.setCompleteListener(() => { sk2.node.active = false })
        })
    }
    private async playDijinghuaSkill(fp, charNode, targetChar, targetItem) {
        AudioMgr.inst.playOneShot("sound/fight/skill/HOU_JH");
        let sk = charNode.getChildByName("HOU_JH").getComponent(sp.Skeleton)
        sk.node.active = true; sk.setAnimation(0, "animation", false)
        sk.setCompleteListener(() => {
            sk.node.active = false
            for (const name of ['STUN', 'POISON', 'HEAL_DOWN']) {
                targetItem.getChildByName("buff").getChildByName(name).active = false
                targetChar.getChildByName(name).active = false
            }
        })
    }
    private async playChuanyunSkill(fp, charNode, targetItem, skeletonName, sound) {
        AudioMgr.inst.playOneShot(sound);
        let sk = charNode.getChildByName(skeletonName).getComponent(sp.Skeleton)
        sk.node.active = true; sk.setAnimation(0, "animation", false)
        sk.setCompleteListener(async () => {
            sk.node.active = false
            AudioMgr.inst.playOneShot("sound/fight/skill/1004");
            let sk2 = targetItem.getChildByName("buff").getChildByName("chuanyun").getComponent(sp.Skeleton)
            sk2.node.active = true
            await this.showBuffString(targetItem, false, fp.extraDesc)
            sk2.setAnimation(0, "animation", false)
            sk2.setCompleteListener(() => { sk2.node.active = false })
        })
    }
    private async playBuffUpAnimation(fp, targetChar, targetItem) {
        AudioMgr.inst.playOneShot("sound/fight/skill/HP_UP");
        if (targetChar) {
            let sk = targetChar.getChildByName("HP_UP").getComponent(sp.Skeleton)
            sk.node.active = true; sk.setAnimation(0, "animation", false)
            sk.setCompleteListener(async () => {
                sk.node.active = false
                this.showDamageOrHealNumber(fp.targetUnitId, targetChar, fp.singleTargetValue, true)
                await this.showBuffString(targetItem, true, fp.extraDesc)
            })
        } else {
            let sk = targetItem.getChildByName("buff").getChildByName("HP_UP").getComponent(sp.Skeleton)
            sk.node.active = true
            await this.showBuffString(targetItem, true, fp.extraDesc)
            sk.setAnimation(0, "animation", false)
            sk.setCompleteListener(() => { sk.node.active = false })
        }
    }
    private async playDebuffDownAnimation(fp, targetChar, targetItem) {
        AudioMgr.inst.playOneShot("sound/fight/skill/MAX_HP_DOWN");
        if (targetChar) {
            let sk = targetChar.getChildByName("MAX_HP_DOWN").getComponent(sp.Skeleton)
            sk.node.active = true; sk.setAnimation(0, "animation", false)
            sk.setCompleteListener(async () => {
                sk.node.active = false
                this.showDamageOrHealNumber(fp.targetUnitId, targetChar, -fp.singleTargetValue, false)
                await this.showBuffString(targetItem, false, fp.extraDesc)
            })
        } else {
            let sk = targetItem.getChildByName("buff").getChildByName("MAX_HP_DOWN").getComponent(sp.Skeleton)
            sk.node.active = true
            await this.showBuffString(targetItem, false, fp.extraDesc)
            sk.setAnimation(0, "animation", false)
            sk.setCompleteListener(() => { sk.node.active = false })
        }
    }
    private async playDefaultSkillEffect(fp, targetChar, targetItem) {
        if (targetChar) {
            console.log(fp.effectType, 444);
            this.showDamageOrHealNumber(fp.targetUnitId, targetChar, -fp.singleTargetValue, false)
            let sk = targetChar.getChildByName(fp.effectType).getComponent(sp.Skeleton)
            sk.node.active = true
            if (this.isContinuousEffect(fp.effectType)) sk.setAnimation(0, "animation", true);
            else { sk.setAnimation(0, "animation", false); sk.setCompleteListener(() => { sk.node.active = false }) }
        } else {
            let sk = targetItem.getChildByName("buff").getChildByName(fp.effectType).getComponent(sp.Skeleton)
            sk.node.active = true
            if (this.isContinuousEffect(fp.effectType)) sk.setAnimation(0, "animation", true)
            else { sk.setAnimation(0, "animation", false); sk.setCompleteListener(() => { sk.node.active = false }) }
        }
        AudioMgr.inst.playOneShot("sound/fight/skill/" + fp.effectType);
        await this.showBuffString(targetItem, false, fp.extraDesc)
    }

    // --- 场下技能 ---
    private async handleSkillOffField(fp) {
        let characterItemNode = this.getChracterChangXiaById(fp.sourceUnitId)
        let selectSkeleton = characterItemNode.getChildByName("select").getComponent(sp.Skeleton)
        selectSkeleton.node.active = true; selectSkeleton.setAnimation(0, "animation", false)
        tween(characterItemNode)
            .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
            .call(async () => {
                this.playEffectSound(fp.effectType)
                await this.showString(1, characterItemNode, new math.Color(236, 163, 61, 255), fp.eventType)
                await new Promise(res => setTimeout(res, 300 / this.timeScale))
                if (fp.aoe == '1') await this.handleOffFieldAoe(fp)
                else await this.handleOffFieldSingle(fp)
            })
            .by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
            .start();
        this.actionAwaitQueue.push(this.playAnimToPromise(selectSkeleton))
    }
    private async handleOffFieldAoe(fp) {
        let skeletons: sp.Skeleton[] = []
        for (const key in fp.multiTargetDataMap) {
            let itemNode = this.getChracterChangXiaById(key)
            let characterNode = this.getCharacterById(key)
            if (characterNode) skeletons.push(characterNode.getChildByName(fp.effectType).getComponent(sp.Skeleton))
            skeletons.push(itemNode.getChildByName("buff").getChildByName(fp.effectType).getComponent(sp.Skeleton))
        }
        skeletons.forEach(s => { s.node.active = true; s.setAnimation(0, "animation", false); });
        for (const key in fp.multiTargetDataMap) {
            const data = fp.multiTargetDataMap[key];
            const itemNode = this.getChracterChangXiaById(key)
            const targetChar = this.getCharacterById(key)
            if (targetChar) {
                const isHeal = fp.effectType == 'HEAL' || fp.effectType == 'HP_UP'
                this.showDamageOrHealNumber(key, targetChar, data.value, isHeal)
                this.updateHpOnField(key, data.hpAfter, data.hpBefore)
            }
            if (fp.effectType == 'MAX_HP_DOWN') await this.showBuffString(itemNode, false, "生命上限 -" + data.value)
            else if (fp.effectType == 'HP_UP' || fp.effectType == 'HEAL') await this.showBuffString(itemNode, true, "+" + data.value)
            else await this.showBuffString(itemNode, false, "-" + data.value)
            this.updateHpOffField(key, data.hpAfter, data.hpBefore)
        }
        skeletons.forEach(s => this.actionAwaitQueue.push(this.playAnimToPromise(s)));
    }
    private async handleOffFieldSingle(fp) {
        const targetChar = this.getCharacterById(fp.targetUnitId)
        const targetItem = this.getChracterChangXiaById(fp.targetUnitId)
        const characterItemNode = this.getChracterChangXiaById(fp.sourceUnitId)
        if (targetChar) {
            let effectTypeName = fp.effectType
            if (fp.effectType == 'XU_HEAL') {
                effectTypeName = 'HEAL'
                await this.showBuffString(characterItemNode, false, "-" + fp.sourceSelfValue)
                this.updateHpOffField(fp.sourceUnitId, fp.sourceHpAfter, fp.sourceHpBefore)
            }
            let sk = targetChar.getChildByName(effectTypeName).getComponent(sp.Skeleton)
            sk.node.active = true
            if (this.isContinuousEffect(fp.effectType)) sk.setAnimation(0, "animation", true)
            else sk.setAnimation(0, "animation", false)
            await new Promise(res => setTimeout(res, 500 / this.timeScale))
            if (!this.isContinuousEffect(fp.effectType) && fp.effectType != 'ATTACK_UP') {
                const isHeal = fp.effectType == 'HEAL' || fp.effectType == 'HP_UP' || fp.effectType == 'XU_HEAL'
                this.showDamageOrHealNumber(fp.targetUnitId, targetChar, fp.singleTargetValue, isHeal)
            }
            this.updateHpOnField(fp.targetUnitId, fp.targetHpAfter, fp.targetHpBefore)
            if (!this.isContinuousEffect(fp.effectType)) this.actionAwaitQueue.push(this.playAnimToPromise(sk))
        }
        // 场下buff动画
        let effectTypeName = fp.effectType
        if (fp.effectType == 'XU_HEAL') effectTypeName = 'HEAL'
        else if (this.isBuffUpEffect(fp.effectType) || fp.effectType == 'CRIT_UP' || fp.effectType == 'CRIT_UP_PRET' || fp.effectType == 'DODGE_UP' || fp.effectType == 'DODGE_UP_PRET') effectTypeName = 'HP_UP'
        else if (this.isDebuffDownEffect(fp.effectType) || fp.effectType == 'CRIT_DOWN_PRET' || fp.effectType == 'DODGE_DOWN_PRET') effectTypeName = 'MAX_HP_DOWN'
        let eventSk = targetItem.getChildByName("buff").getChildByName(effectTypeName).getComponent(sp.Skeleton)
        eventSk.node.active = true
        if (this.effectTypes.indexOf(fp.effectType) !== -1) {
            for (const et of this.effectTypes) {
                if (et != fp.effectType) { const n = targetItem.getChildByName("buff").getChildByName(et); if (n) n.active = false; }
            }
        }
        if (this.isContinuousEffect(fp.effectType)) eventSk.setAnimation(0, "animation", true);
        else eventSk.setAnimation(0, "animation", false);
        const isBuff = this.isBuffUpEffect(fp.effectType) || ['HEAL', 'HP_UP', 'SPEED_UP', 'XU_HEAL', 'ATTACK_UP', 'BLOODTHIRST', 'FIRE_BOOST', 'HEAL_BOOST', 'POISON_BOOST', 'MISSILE_BOOST', 'CRIT_UP', 'DODGE_UP'].indexOf(fp.effectType) !== -1
        await this.showBuffString(targetItem, isBuff, fp.extraDesc)
        // 桂影栖身等闪避buff不更新血条
        if (fp.effectType !== 'DODGE_UP' && fp.effectType !== 'DODGE_UP_PRET' && fp.effectType !== 'DODGE_DOWN' && fp.effectType !== 'DODGE_DOWN_PRET') {
            this.updateHpOffField(fp.targetUnitId, fp.targetHpAfter, fp.targetHpBefore)
        }
        if (!this.isContinuousEffect(fp.effectType)) this.actionAwaitQueue.push(this.playAnimToPromise(eventSk))
    }

    // ========== 其他方法 ==========
    parseGuardianEffects(str) {
        if (!str || typeof str !== 'string') return [];
        const blockReg = /\[([^:\]]+):([^\]]+)\]/g;
        const result = []; let match;
        while ((match = blockReg.exec(str)) !== null) {
            const [, roleInfo, effectStr] = match;
            const roleReg = /^([AB])(.+?)_(\d+)$/;
            const roleMatch = roleInfo.match(roleReg);
            if (!roleMatch) continue;
            const [, camp, name, position] = roleMatch;
            const effects = []; const effectMap = {};
            if (effectStr) {
                effectStr.split(',').forEach(effectItem => {
                    const [type, value] = effectItem.split('|');
                    if (type && value !== undefined) {
                        const effectObj = { type: type.trim(), value: parseInt(value.trim(), 10) || 0 };
                        effects.push(effectObj); effectMap[effectObj.type] = effectObj.value;
                    }
                });
            }
            result.push({ camp, name, position: parseInt(position, 10), effects, effectMap });
        }
        return result;
    }

    async showNumber(falge: boolean, character: Node, num: number, color: math.Color, size: number = 28) {
        let i = falge ? -1 : 1
        const holNumberNodePool = util.resource.getNodePool(await util.bundle.load("prefab/HolNumber", Prefab))
        const numberNode = holNumberNodePool.get()
        numberNode.setScale(Math.abs(numberNode.scale.x) * i, numberNode.scale.y, numberNode.scale.z)
        const holNumber = numberNode.getComponent(HolNumber)
        holNumber.color = color; holNumber.frontSize = size; holNumber.number = num
        if (this.isOverFight && (!numberNode?.position?.x || !numberNode?.position?.y || !numberNode?.position?.z)) return
        numberNode.active = true; character.addChild(numberNode)
        const ordinarySibling = numberNode.getSiblingIndex(); numberNode.setSiblingIndex(9999)
        return new Promise<void>(res => {
            let i = 0
            const inter = setInterval(() => {
                if (++i > 45) { res(); holNumberNodePool.put(numberNode); numberNode.setSiblingIndex(ordinarySibling); numberNode.setPosition(0, 0, numberNode.position.z); return clearInterval(inter) }
                numberNode.setPosition(numberNode.position.x, numberNode.position.y + 3, numberNode.position.z)
            }, 20 / 1.3)
        })
    }

    async showString(i, character: Node, color: math.Color, str: string) {
        const node = new Node
        node.setScale(Math.abs(node.scale.x) * i, node.scale.y, node.scale.z)
        const label = node.addComponent(Label)
        label.font = await util.bundle.load("font/fzcy", Font)
        label.string = str; label.fontSize = 30; label.color = color
        if (this.isOverFight && (!node?.position?.x || !node?.position?.y || !node?.position?.z)) return
        character.addChild(node)
        let index = 0
        const inter = setInterval(() => {
            if (index++ > 45) { clearInterval(inter); character.removeChild(node); return }
            node.setPosition(node.position.x, node.position.y + 2.5, node.position.z)
        }, 20)
    }

    private async fightSuccess() {
        await this.node.getChildByName("FightSuccess").getComponent(FightSuccess).read(this.rewards, this.levelUp)
        this.node.getChildByName("FightFailure").active = false
        this.node.getChildByName("FightSuccess").active = true
    }
    private fightEnd() {
        this.node.getChildByName("FightFailure").active = true
        this.node.getChildByName("FightSuccess").active = false
    }
    public async clickFun(c) {
        console.log(c, 999);
        AudioMgr.inst.playOneShot("sound/other/click");
        const characterDetail = this.node.getChildByName("CharacterDetail")
        characterDetail.active = true
        await characterDetail.getComponent(HeroCharacterDetail).setCharacter(c)
    }
}
