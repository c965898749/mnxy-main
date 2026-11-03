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
const CONTINUOUS_EFFECTS = ["POISON", "SILENCE", "HEAL_DOWN", "STUN", "FIXED_SOUL", "XULI1", "XULI2", "XULI3", "XULI4", "XULI5", "XULIMAN", "PHYSICAL_BARRIER", "MAGIC_BARRIER"];
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
const COUNTER_SKILL_NAMES = ["绝地反击", "新月反击", "撞击"];

@ccclass('FightMap')
export class FightMap extends Component {
    @property(Node) SkipFight: Node
    @property(Node) tiem
    @property(Node) Character
    @property(Node) Hp
    @property(Node) name0
    @property(Node) name1
    @property(Node) skillName
    @property(Node) bossSkill
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
    // 战斗结算面板展示后的回调（true=胜利）：供上层（如自动探索）衔接后续流程
    onBattleResult: (isWin: boolean) => void = null
    // 自动探索开关：为 true 时胜利不再依赖上层外部销毁，而是由本节点延迟复用手动"确定"的干净结算销毁路径(FightSuccess.skipFight)自行销毁，销毁后经 onAutoExploreNext 回调上层继续下一关
    autoExplore: boolean = false
    onAutoExploreNext: () => void = null
    private timeScale: number = 1
    initialized = false;
    effectTypes = ["XULI1", "XULI2", "XULI3", "XULI4", "XULI5", "XULIMAN"];
    // 场下物理/法术护盾重叠处理：护盾存量映射(判定是否存在与驱动交替)、交替相位与调度标记
    private physicalShieldMap: Map<string, number> = new Map()
    private magicShieldMap: Map<string, number> = new Map()
    private barrierPhasePhysical: boolean = true
    private barrierAltScheduled: boolean = false
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
    // 应龙逆鳞阈值→简称（场下图标飘字用，仅本次新跨越的阈值才提示）
    private static readonly YINJI_TIERS: Array<[number, string]> = [
        [5, "血限不降"], [10, "物抗+"], [15, "净化负面"], [20, "敌方中毒"],
        [25, "敌物抗↓"], [30, "应龙飞弹"], [35, "印记复活"], [40, "狂暴"],
    ]
    // 各应龙上一次已知的印记数，用于判定阈值跨越
    private lastYinjiByUnit: Record<string, number> = {}
    // 各应龙当前是否处于狂暴(≥印记40)视觉态：守护 baozou2→baozou 异步衔接，跌破40时置 false
    private berserkVisual: Record<string, boolean> = {}
    // 刷新应龙场下 yinji 动画与 num 印记数量（count<=0 隐藏）；跨越新阈值时图标弹动并简短飘字
    updateYinjiNumLabel(unitId: string, yinjiCount: number) {
        const itemNode = this.getChracterChangXiaById(unitId)
        if (!itemNode) return
        const yinjiNode = itemNode.getChildByName("buff")?.getChildByName("yinji")
        if (!yinjiNode) return
        if (yinjiCount > 0) {
            yinjiNode.active = true
            const sk = yinjiNode.getComponent(sp.Skeleton)
            if (sk) { sk.node.active = true; sk.setAnimation(0, "animation", true) }
            const numLabel = yinjiNode.getChildByName("num")
            if (numLabel) numLabel.getComponent(Label).string = yinjiCount.toString()
        } else {
            yinjiNode.active = false
        }
        // 阈值跨越提示：印记增加且首次跨过某档位时，取本次跨过的最高档位飘一条简短文字
        const prev = this.lastYinjiByUnit[unitId] || 0
        if (yinjiCount > prev) {
            const crossed = FightMap.YINJI_TIERS.filter(([t]) => t > prev && t <= yinjiCount)
            if (crossed.length) {
                const [tier, name] = crossed[crossed.length - 1]
                // 印记阈值触发：场下图标统一走 select 弹动 + 简短飘字
                this.playChangXiaSelect(itemNode, `印记${tier}·${name}`)
            }
        }
        // 狂暴（印记≥40）视觉：首次跨越先播 baozou2+颤动→循环 baozou；跌破印记40移除动画
        this.updateBerserkVisual(unitId, itemNode, prev, yinjiCount)
        this.lastYinjiByUnit[unitId] = yinjiCount
    }

    // 狂暴视觉：印记≥40 首次跨越→场下 buff/baozou2 播一次性(轨道 animation-01)+颤动，完成后接 buff/baozou 循环(轨道 animation)；跌破印记40→移除两者
    private updateBerserkVisual(unitId: string, itemNode: Node, prev: number, yinjiCount: number) {
        const buffNode = itemNode.getChildByName("buff")
        const baozou = buffNode?.getChildByName("baozou")
        const baozou2 = buffNode?.getChildByName("baozou2")
        if (yinjiCount >= 40) {
            if (prev < 40) {
                this.berserkVisual[unitId] = true
                const startLoop = () => {
                    if (this.berserkVisual[unitId] !== true) return
                    if (baozou) { const s = baozou.getComponent(sp.Skeleton); if (s) { baozou.active = true; s.node.active = true; s.setAnimation(0, "animation", true) } }
                }
                const s2 = baozou2?.getComponent(sp.Skeleton)
                if (s2) {
                    baozou2!.active = true; s2.node.active = true
                    s2.setAnimation(0, "animation-01", false)
                    this.shakeNode(baozou2!)
                    s2.setCompleteListener(() => { baozou2!.active = false; s2.setCompleteListener(null); startLoop() })
                } else { startLoop() }
            } else if (baozou && !baozou.active && !(baozou2 && baozou2.active)) {
                // 已处于狂暴态但循环动画被重置（如重新登场）：确保 baozou 循环在播
                const s = baozou.getComponent(sp.Skeleton); if (s) { baozou.active = true; s.node.active = true; s.setAnimation(0, "animation", true) }
            }
        } else {
            this.berserkVisual[unitId] = false
            if (baozou) { const s = baozou.getComponent(sp.Skeleton); if (s) { s.setAnimation(0, "animation", false); s.setCompleteListener(null) }; baozou.active = false }
            if (baozou2) { const s = baozou2.getComponent(sp.Skeleton); if (s) { s.setAnimation(0, "animation-01", false); s.setCompleteListener(null) }; baozou2.active = false }
        }
    }

    // 场下图标颤动：围绕当前位置做数次小幅抖动
    private shakeNode(node: Node) {
        const p0 = node.position.clone()
        tween(node)
            .to(0.05, { position: new Vec3(p0.x + 5, p0.y + 4, p0.z) })
            .to(0.05, { position: new Vec3(p0.x - 5, p0.y - 4, p0.z) })
            .to(0.05, { position: new Vec3(p0.x + 4, p0.y - 4, p0.z) })
            .to(0.05, { position: new Vec3(p0.x - 4, p0.y + 4, p0.z) })
            .to(0.05, { position: new Vec3(p0.x + 2, p0.y + 2, p0.z) })
            .to(0.05, { position: p0 })
            .start()
    }

    // 场下图标 select 弹动（统一的施法/触发高亮）：select 骨骼播一次 + itemNode 弹性上下缩放，可选飘字
    private playChangXiaSelect(itemNode: Node, text?: string) {
        const sel = itemNode.getChildByName("select")?.getComponent(sp.Skeleton)
        if (sel) {
            sel.node.active = true
            sel.setAnimation(0, "animation", false)
            sel.setCompleteListener(() => { sel.node.active = false; sel.setCompleteListener(null) })
        }
        let t = tween(itemNode)
            .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
        if (text) t = t.call(() => { this.showBuffString(itemNode, true, text) })
        t.by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
            .start()
    }
    // 更新场下PHYSICAL_BARRIER的num护盾数值
    updateShieldNumLabel(unitId: string, shieldRemaining: number) {
        const itemNode = this.getChracterChangXiaById(unitId)
        const characterNode = this.getCharacterById(unitId)
        if (!itemNode && !characterNode) return
        // 护盾为0时：场上和场下都隐藏，并从映射移除后按剩余护盾刷新交替显隐
        if (shieldRemaining <= 0) {
            if (itemNode) {
                const barrierNode = itemNode.getChildByName("buff")?.getChildByName("PHYSICAL_BARRIER")
                if (barrierNode) barrierNode.active = false
            }
            if (characterNode) {
                const barrierNode = characterNode.getChildByName("PHYSICAL_BARRIER")
                if (barrierNode) barrierNode.active = false
            }
            this.physicalShieldMap.delete(unitId)
            this.updateBarrierAlternateState(unitId)
            return
        }
        // 护盾>0：刷新场下 num 并着为黄色（与法术护盾蓝色区分），登记映射后刷新交替显隐
        if (itemNode) {
            const barrierNode = itemNode.getChildByName("buff")?.getChildByName("PHYSICAL_BARRIER")
            if (barrierNode) {
                const numLabel = barrierNode.getChildByName("num")
                if (numLabel) {
                    const label = numLabel.getComponent(Label)
                    label.string = shieldRemaining.toString()
                    label.color = new Color(255, 210, 40, 255)
                }
            }
        }
        this.physicalShieldMap.set(unitId, shieldRemaining)
        this.updateBarrierAlternateState(unitId)
    }
    // 更新场下MAGIC_BARRIER的num护盾数值：护盾为0(耗尽/死亡)时场上+场下都隐藏动画；>0 时刷新场下数值（循环显隐由授予/登场与 CONTINUOUS_EFFECTS 机制保持，与物理护盾一致）
    updateMagicShieldNumLabel(unitId: string, magicShieldRemaining: number) {
        const itemNode = this.getChracterChangXiaById(unitId)
        const characterNode = this.getCharacterById(unitId)
        if (!itemNode && !characterNode) return
        if (magicShieldRemaining <= 0) {
            if (itemNode) {
                const barrierNode = itemNode.getChildByName("buff")?.getChildByName("MAGIC_BARRIER")
                if (barrierNode) barrierNode.active = false
            }
            if (characterNode) {
                const barrierNode = characterNode.getChildByName("MAGIC_BARRIER")
                if (barrierNode) barrierNode.active = false
            }
            this.magicShieldMap.delete(unitId)
            this.updateBarrierAlternateState(unitId)
            return
        }
        if (itemNode) {
            const barrierNode = itemNode.getChildByName("buff")?.getChildByName("MAGIC_BARRIER")
            if (barrierNode) {
                const numLabel = barrierNode.getChildByName("num")
                if (numLabel) {
                    const label = numLabel.getComponent(Label)
                    label.string = magicShieldRemaining.toString()
                    label.color = new Color(80, 160, 255, 255)
                }
            }
        }
        this.magicShieldMap.set(unitId, magicShieldRemaining)
        this.updateBarrierAlternateState(unitId)
    }

    // ===== 场下物理/法术护盾重叠处理：num 颜色区分(物理黄/法术蓝)，两者同时存在时交替显示（含各自 num），单者存在时常显 =====
    // 只切换“场下”护盾节点的可见性（场上的法盾/物盾不交替、照常同时显示，故不动 characterNode）
    private setBarrierVisible(unitId: string, name: string, visible: boolean) {
        const itemNode = this.getChracterChangXiaById(unitId)
        const off = itemNode?.getChildByName("buff")?.getChildByName(name)
        if (off) off.active = visible
    }
    // 依据当前交替相位与护盾存量设置场下显隐：双盾时场下只显示其一并随相位切换，单盾时常显（场上不受影响）
    private applyBarrierPhase(unitId: string) {
        const hasP = (this.physicalShieldMap.get(unitId) || 0) > 0
        const hasM = (this.magicShieldMap.get(unitId) || 0) > 0
        const dual = hasP && hasM
        const showPhysical = hasP && (!dual || this.barrierPhasePhysical)
        const showMagic = hasM && (!dual || !this.barrierPhasePhysical)
        this.setBarrierVisible(unitId, "PHYSICAL_BARRIER", showPhysical)
        this.setBarrierVisible(unitId, "MAGIC_BARRIER", showMagic)
    }
    // 护盾数量变化后刷新该单位显隐；首次出现双盾时启动交替调度
    private updateBarrierAlternateState(unitId: string) {
        const hasP = (this.physicalShieldMap.get(unitId) || 0) > 0
        const hasM = (this.magicShieldMap.get(unitId) || 0) > 0
        if (hasP && hasM && !this.barrierAltScheduled) this.startBarrierAlternateScheduler()
        this.applyBarrierPhase(unitId)
    }
    // 每 0.7s 翻转相位，对所有有盾单位重新应用（单盾不受影响，仅双盾交替）
    private startBarrierAlternateScheduler() {
        this.barrierAltScheduled = true
        this.schedule(() => {
            this.barrierPhasePhysical = !this.barrierPhasePhysical
            const ids = new Set<string>([...this.physicalShieldMap.keys(), ...this.magicShieldMap.keys()])
            ids.forEach(id => this.applyBarrierPhase(id))
        }, 0.7)
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
        if (effectType == 'XU_HEAL') { AudioMgr.inst.playOneShot("sound/fight/skill/HEAL"); return; }
        if (effectType == 'CRIT_UP' || effectType == 'CRIT_UP_PRET') { AudioMgr.inst.playOneShot("sound/fight/skill/ATTACK_UP"); return; }
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
        // 场上大头像节点是按侧共用的单节点，被“死亡→补位→复活→再补位”链路反复复用；上一占用者的登场弹性 tween 可能被后续死亡/复活流程打断，
        // 使该节点 scale 停在 (0,0,0)。若仍用“当前 scale”推导 scaleNew，新登场单位会被弹回 0 → 精灵加载成功但不可见（“场上没有英雄图片”）。
        // 与 handleSwap 用固定静止缩放保持一致：取绝对值并对 0 兜底为 1，符号按阵营侧决定。
        const magX = Math.abs(characterNode.scale.x) || 1
        const magY = Math.abs(characterNode.scale.y) || 1
        let scaleNew = new Vec3(isLeft ? -magX : magX, magY, magY)
        characterNode.active = true
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
                // 护盾：登场时把该单位场下期间获得的护盾同步到场上（以护盾映射为准，不读节点 active，避免受交替显隐影响），随后套用交替相位
                if ((this.physicalShieldMap.get(fp.sourceUnitId) || 0) > 0) {
                    const onBarrier = characterNode.getChildByName("PHYSICAL_BARRIER")
                    if (onBarrier) {
                        onBarrier.active = true
                        onBarrier.getComponent(sp.Skeleton).setAnimation(0, "animation", true)
                    }
                }
                if ((this.magicShieldMap.get(fp.sourceUnitId) || 0) > 0) {
                    const onMagicBarrier = characterNode.getChildByName("MAGIC_BARRIER")
                    if (onMagicBarrier) {
                        onMagicBarrier.active = true
                        onMagicBarrier.getComponent(sp.Skeleton).setAnimation(0, "animation", true)
                    }
                }
                this.updateBarrierAlternateState(fp.sourceUnitId)
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
                if (data.value > 0) this.showDamageOrHealNumber(key, characterNode, -data.value, false)
                this.updateHpOnField(key, data.hpAfter, data.hpBefore)
                this.actionAwaitQueue.push(this.playAnimToPromise(skeleton))
            }
            let itemNode = this.getChracterChangXiaById(key)
            if (itemNode) {
                let skeleton = itemNode.getChildByName("buff").getChildByName("POISON2").getComponent(sp.Skeleton)
                skeleton.node.active = true; skeleton.setAnimation(0, "animation", false)
                if (data.value > 0) await this.showBuffString(itemNode, false, "-" + data.value)
                this.updateHpOffField(key, data.hpAfter, data.hpBefore)
                this.actionAwaitQueue.push(this.playAnimToPromise(skeleton))
            }
            // 中毒被魔法护盾吸收时：同步法盾剩余值（逐跳扣减、耗尽即隐藏）
            if (data.magicShieldRemaining !== undefined) {
                this.updateMagicShieldNumLabel(key, data.magicShieldRemaining)
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
            // 阵亡：法盾/物理盾及其上方数值一并清除（走护盾=0的隐藏分支：场上+场下节点都隐藏、映射移除、刷新交替显隐）
            this.updateShieldNumLabel(key, 0)
            this.updateMagicShieldNumLabel(key, 0)
        }
        await new Promise(res => setTimeout(res, 200 / this.timeScale))
    }

    // --- 审死·献祭：地藏施法（技能名+高亮）→ 护法身上 shengsi 动画 + 1004 音效 → 护法死亡 ---
    private async handleShenSiKill(fp) {
        await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
        const sideIdx = this.isLeft(fp.sourceUnitId) ? 0 : 1
        const sourceItemNode = this.getChracterChangXiaById(fp.sourceUnitId)
        // 1. 地藏施法：场上用 skillName 飘技能名，场下播 select 弹跳 + 飘字
        if (fp.sourceFieldStatus) {
            this.skillName.children[sideIdx].active = true
            this.skillName.children[sideIdx].getChildByName("Label").getComponent(Label).string = fp.eventType
        } else if (sourceItemNode) {
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
            await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
        }
        await new Promise(res => setTimeout(res, 300 / this.timeScale))

        // 2. 献祭护法：播放 shengsi 动画 + 1004 音效
        //    场上节点与场下 buff 容器的 shengsi 并行播放（独立 if、不互斥：在场单位的场下小图标同样要播）
        const targetId = fp.targetUnitId
        const targetChar = this.getCharacterById(targetId)
        const targetItem = this.getChracterChangXiaById(targetId)
        AudioMgr.inst.playOneShot("sound/fight/skill/1004")
        const shengsiSks: sp.Skeleton[] = []
        if (targetChar) {
            const n = targetChar.getChildByName("shengsi")
            if (n) shengsiSks.push(n.getComponent(sp.Skeleton))
        }
        if (targetItem) {
            const n = targetItem.getChildByName("buff")?.getChildByName("shengsi")
            if (n) shengsiSks.push(n.getComponent(sp.Skeleton))
        }
        shengsiSks.forEach(sk => { sk.node.active = true; sk.setAnimation(0, "animation", false) })
        if (shengsiSks.length > 0) {
            await Promise.all(shengsiSks.map(sk => this.playAnimToPromise(sk)))
        }

        // 3. 护法死亡：清空场上精灵 + 显示场下死亡标记
        if (targetChar) {
            targetChar.getComponent(Sprite).spriteFrame = null
            targetChar.children.forEach(buffNode => { buffNode.active = false; })
        }
        if (targetItem) {
            const deadNode = targetItem.getChildByName("dead")
            if (deadNode) deadNode.active = true
            const buffParent = targetItem.getChildByName("buff")
            if (buffParent) buffParent.children.forEach(buffNode => {
                if (buffNode.name !== "FIXED_SOUL") buffNode.active = false;
            })
        }
        // 阵亡：清除法盾/物理盾映射（否则交替调度器会继续显示已死单位的护盾）
        this.updateShieldNumLabel(targetId, 0)
        this.updateMagicShieldNumLabel(targetId, 0)
        // 4. 更新献祭护法血条（即死无前置伤害日志驱动，此处补上：场下小图标血条必更，场上按死亡前状态）
        if (fp.targetFieldStatus) {
            this.updateHpOnField(targetId, fp.targetHpAfter, fp.targetHpBefore)
        }
        this.updateHpOffField(targetId, fp.targetHpAfter, fp.targetHpBefore)
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
            // 魔法护盾：每回合同步盾量——耗尽(<=0)则隐藏场上+场下动画，否则刷新数值（授予后靠此保持常显）
            if (data.magicShieldRemaining !== undefined) {
                this.updateMagicShieldNumLabel(key, data.magicShieldRemaining)
            }
        }
        await new Promise(res => setTimeout(res, 1000 / this.timeScale))
    }

    // ========== 技能事件分发 ==========
    private async handleSkillEvent(fp) {
        await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
        // 应龙印记：任意应龙相关日志回写了 yinjiCount 时，刷新该应龙场下 yinji 动画的 num（这些日志 sourceUnitId 均为应龙自身）
        if (fp.yinjiCount !== null && fp.yinjiCount !== undefined) {
            this.updateYinjiNumLabel(fp.sourceUnitId, fp.yinjiCount)
        }
        // 乌江之殇：回合开始被动，独立处理
        if (fp.eventType == '乌江之殇') {
            await this.handleWujiangSkill(fp)
            this.skillName.children[this.isLeft(fp.sourceUnitId) ? 0 : 1].active = false
            await new Promise(res => setTimeout(res, 1500 / this.timeScale))
            return
        }
        // 龙威：吸血+加盾+青龙回血合并为一条日志，独立处理
        if (fp.eventType == '龙威') {
            await this.handleLongWei(fp)
            this.skillName.children[this.isLeft(fp.sourceUnitId) ? 0 : 1].active = false
            await new Promise(res => setTimeout(res, 1500 / this.timeScale))
            return
        }
        // 白虎·灵佑：回合开始白虎自耗血 + 全体物理结界，独立处理
        if (fp.eventType == '灵佑') {
            await this.handleLingYou(fp)
            this.skillName.children[this.isLeft(fp.sourceUnitId) ? 0 : 1].active = false
            await new Promise(res => setTimeout(res, 1500 / this.timeScale))
            return
        }
        // 白虎·血战到底：兽族死亡触发全队叠生命上限/攻击，独立处理
        if (fp.eventType == '血战到底') {
            await this.handleXueZhan(fp)
            this.skillName.children[this.isLeft(fp.sourceUnitId) ? 0 : 1].active = false
            await new Promise(res => setTimeout(res, 1500 / this.timeScale))
            return
        }
        // 应龙·龙血刻印：护法自损→应龙+1印记（施法者=应龙），独立处理
        if (fp.eventType == '龙血刻印') {
            await this.handleLongXueKeYin(fp)
            this.skillName.children[this.isLeft(fp.sourceUnitId) ? 0 : 1].active = false
            await new Promise(res => setTimeout(res, 1500 / this.timeScale))
            return
        }
        // 应龙·血刻加命：友方受增益→+10×印记 生命上限，独立处理
        if (fp.eventType == '血刻加命') {
            await this.handleXueKeJiaMing(fp)
            this.skillName.children[this.isLeft(fp.sourceUnitId) ? 0 : 1].active = false
            await new Promise(res => setTimeout(res, 1500 / this.timeScale))
            return
        }
        // 应龙·苍龙吸水：吸全场护盾 + 结界溢出恢复应龙自身生命，独立处理
        if (fp.eventType == '苍龙吸水') {
            await this.handleCangLongXiShui(fp)
            this.skillName.children[this.isLeft(fp.sourceUnitId) ? 0 : 1].active = false
            await new Promise(res => setTimeout(res, 1500 / this.timeScale))
            return
        }
        // 应龙·应龙逆鳞阈值40 狂暴：先红字掉10%上限血、再绿字加攻速，独立处理（仅 ATTACK_UP 命中，其余应龙逆鳞阈值仍走通用路由）
        if (fp.eventType == '应龙逆鳞' && fp.effectType == 'ATTACK_UP') {
            await this.handleKuangbao(fp)
            this.skillName.children[this.isLeft(fp.sourceUnitId) ? 0 : 1].active = false
            await new Promise(res => setTimeout(res, 1500 / this.timeScale))
            return
        }
        // 应龙·免疫致命：消耗印记替我方挡下超生命上限10%的致死伤害（受保者=目标单位），独立处理
        if (fp.eventType == '免疫致命') {
            await this.handleMianYiZhiMing(fp)
            this.skillName.children[this.isLeft(fp.sourceUnitId) ? 0 : 1].active = false
            // 免疫致命为无伤害的被动反馈，无血条/数值动画可看，空尾压到 600ms 以免响应迟滞
            await new Promise(res => setTimeout(res, 600 / this.timeScale))
            return
        }
        // 应龙·龙炎群伤：消耗1印记对敌全体火焰伤害 AOE，独立处理
        if (fp.eventType == '龙炎群伤') {
            await this.handleLongYanQunShang(fp)
            this.skillName.children[this.isLeft(fp.sourceUnitId) ? 0 : 1].active = false
            await new Promise(res => setTimeout(res, 1500 / this.timeScale))
            return
        }
        // 应龙·还魂：消耗30印记给随机阵亡友方施加还魂（该单位仍阵亡），场下持续播放 huanhun 动画，独立处理
        if (fp.eventType == '还魂') {
            await this.handleHuanhun(fp)
            this.skillName.children[this.isLeft(fp.sourceUnitId) ? 0 : 1].active = false
            await new Promise(res => setTimeout(res, 1500 / this.timeScale))
            return
        }
        // 应龙·还魂复活：还魂倒计时结束，满血复活并移除 huanhun 动画，独立处理
        if (fp.eventType == '还魂复活') {
            await this.handleYinjiFuhuo(fp)
            this.skillName.children[this.isLeft(fp.sourceUnitId) ? 0 : 1].active = false
            await new Promise(res => setTimeout(res, 1500 / this.timeScale))
            return
        }
        // 青龙吐珠：登场雷击群伤，先 shihou 施法音，随后每个被电目标各一声 leidian（类轩辕连续音效），独立处理
        if (fp.eventType == '青龙吐珠') {
            await this.handleQinglongTuZhu(fp)
            this.skillName.children[this.isLeft(fp.sourceUnitId) ? 0 : 1].active = false
            await new Promise(res => setTimeout(res, 1500 / this.timeScale))
            return
        }
        // 月满重生 / 不屈意志 / 归元：复活技能，独立处理（归元=朱雀凤凰卵满血复活）
        if (fp.eventType == '月满重生' || fp.eventType == '不屈意志' || fp.eventType == '归元') {
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
        // 遁让：三圣母受击换位+躲过伤害，复用换位动画
        if (fp.eventType == '遁让') {
            await this.handleSwap(fp)
            this.skillName.children[this.isLeft(fp.sourceUnitId) ? 0 : 1].active = false
            await new Promise(res => setTimeout(res, 1500 / this.timeScale))
            return
        }
        // 返璞归真：伤害转移（谛听减伤+回复生命，敌方易死护法受转移伤害）
        if (fp.eventType == '返璞归真') {
            await this.handleFanPuGuiZhen(fp)
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
        // 审死·献祭：地藏施法→护法身上 shengsi+1004→护法死亡（单目标、无 multiTargetDataMap；回血/伤害的多目标“审死”仍走通用路由）
        if (fp.eventType == '审死' && !fp.multiTargetDataMap) {
            await this.handleShenSiKill(fp)
            this.skillName.children[this.isLeft(fp.sourceUnitId) ? 0 : 1].active = false
            await new Promise(res => setTimeout(res, 1500 / this.timeScale))
            return
        }
        // 焚尽八荒：朱雀消耗自身25%生命上限的火焰伤害 AOE；通用 AoE 路由只更新 multiTargetDataMap 里的敌方目标、不处理施法者自身血条，
        // 而场上大血条(this.Hp.children[side])是按侧共享的、只有朱雀确为场上单位时才能安全写入，故按场上/场下分别补上朱雀自身的扣血表现
        if (fp.eventType == '焚尽八荒') {
            // 后端对焚尽八荒传的 sourceHpBefore 是“扣血前当前HP”而非生命上限（与其他技能传 maxHp 不同），
            // 而场上/场下血条都把第三个参数当作上限分母，直接用 sourceHpBefore 会让最大血量看起来变小；故按 unitId 取真实 maxHp 作分母
            const srcData = (this.L1 || []).find(x => x.uuid === fp.sourceUnitId) || (this.R1 || []).find(x => x.uuid === fp.sourceUnitId)
            const srcMaxHp = (srcData && srcData.maxHp) ? srcData.maxHp : fp.sourceHpBefore
            if (fp.sourceFieldStatus) {
                // 场上：飘自耗伤害数字(-25%上限) + 刷新该侧场上大血条
                const srcChar = this.getCharacterById(fp.sourceUnitId)
                if (srcChar) this.showDamageOrHealNumber(fp.sourceUnitId, srcChar, fp.sourceHpBefore - fp.sourceHpAfter, false)
                this.updateHpOnField(fp.sourceUnitId, fp.sourceHpAfter, srcMaxHp)
            }
            // 无论场上场下，都同步场下小头像血条
            this.updateHpOffField(fp.sourceUnitId, fp.sourceHpAfter, srcMaxHp)
        }
        // 死亡之焰：应龙印记≥100 boss技，在 bossSkill 覆盖节点上播放一次 skill2 动画（不循环、播完自动隐藏），随后落到下方通用 AOE 路由做伤害/血条/死亡表现
        if (fp.eventType == '死亡之焰') {
            const bsSk = this.bossSkill?.getComponent(sp.Skeleton)
            if (bsSk) {
                this.bossSkill.active = true; bsSk.node.active = true
                bsSk.setAnimation(0, "skill2", false)
                bsSk.setCompleteListener(() => { this.bossSkill.active = false; bsSk.node.active = false; bsSk.setCompleteListener(null) })
            }
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

        // 2a. 清除场下死亡标记（防御式：节点不存在时不抛异常中断后续流程）
        if (targetItemNode) {
            const deadNode = targetItemNode.getChildByName("dead")
            if (deadNode) deadNode.active = false
        }

        // 2b. 恢复场上角色精灵（仅当复活单位确实在场上时；场下复活不弹场上精灵）
        if (targetCharacterNode && fp.targetFieldStatus) {
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

        // 2c. 播放固魂动画（月满重生/不屈意志复活均附加固魂）
        if (fp.eventType == '月满重生' || fp.eventType == '不屈意志') {
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
        }

        // 2d. 更新被复活单位血条（复活后HP / 最大HP）
        if (fp.targetFieldStatus) {
            this.updateHpOnField(targetId, fp.targetHpAfter, fp.targetHpBefore)
        }
        this.updateHpOffField(targetId, fp.targetHpAfter, fp.targetHpBefore)

        // 2e. 更新地藏/嫦娥生命消耗显示（sourceHpBefore=扣血前HP, sourceHpAfter=扣血后HP, value=消耗量）
        // 归元为朱雀自身满血复活、无生命消耗，跳过 source 消耗飘字
        if (fp.sourceFieldStatus) {
            this.updateHpOnField(fp.sourceUnitId, fp.sourceHpAfter, fp.sourceHpBefore)
        }
        this.updateHpOffField(fp.sourceUnitId, fp.sourceHpAfter, fp.sourceHpBefore)
        if (fp.eventType != '归元' && sourceItemNode) {
            await this.showBuffString(sourceItemNode, false, "生命 -" + fp.sourceSelfValue)
        }

        // 2f. 场下飘字
        if (targetItemNode && fp.extraDesc) {
            await this.showBuffString(targetItemNode, true, fp.extraDesc)
        }

        // 2g. 归元·凤凰卵形态切换：变蛋时图片路径 id 后加 _1，破壳时去掉 _1 还原（场下 header 头像 + 场上中央大图，卵留场时中央也显示蛋）
        if (fp.eventType == '归元' && targetItemNode) {
            const heroId = targetId.replace(/[a-zA-Z]/g, '')
            const isEggForm = fp.extraDesc == '化身为凤凰卵'
            const folder = isEggForm ? heroId + '_1' : heroId
            const headerNode = targetItemNode.getChildByName("header")
            if (headerNode) {
                headerNode.getComponent(Sprite).spriteFrame =
                    await util.bundle.load(`game/texture/frames/hero/Header/${folder}/spriteFrame`, SpriteFrame)
            }
            // 场上中央大图：卵留场时 2b 会按普通形象加载，这里覆盖为蛋图；破壳则还原普通图
            if (targetCharacterNode && fp.targetFieldStatus) {
                targetCharacterNode.getComponent(Sprite).spriteFrame =
                    await util.bundle.load(`game/texture/frames/hero/${folder}/spriteFrame`, SpriteFrame)
            }
            // 变蛋：移除一切负面效果的动画（对应后端 clearNegative，卵为纯净肉盾）
            if (isEggForm) {
                const NEG_BUFFS = ["POISON", "POISON2", "SILENCE", "STUN", "HEAL_DOWN"]
                const buffParent = targetItemNode.getChildByName("buff")
                if (buffParent) buffParent.children.forEach(n => { if (NEG_BUFFS.indexOf(n.name) !== -1) n.active = false })
                if (targetCharacterNode) NEG_BUFFS.forEach(name => { const n = targetCharacterNode.getChildByName(name); if (n) n.active = false })
            }
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
        const isSourceLeft = this.isLeft(sourceId)
        // 场上大头像节点按阵营 side 直取（与 handleUnitEnter 一致），避免依赖场上节点上可能未设置的 id 标签导致取不到旧上场单位、跳过换图
        let characterNode = this.Character.children[isSourceLeft ? 0 : 1]

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
                    // 护盾：复活/上场时把场下期间获得的护盾同步到场上（以护盾映射为准），随后套用交替相位
                    if ((this.physicalShieldMap.get(newOnFieldId) || 0) > 0) {
                        const onBarrier = characterNode.getChildByName("PHYSICAL_BARRIER")
                        if (onBarrier) {
                            onBarrier.active = true
                            onBarrier.getComponent(sp.Skeleton).setAnimation(0, "animation", true)
                        }
                    }
                    if ((this.magicShieldMap.get(newOnFieldId) || 0) > 0) {
                        const onMagicBarrier = characterNode.getChildByName("MAGIC_BARRIER")
                        if (onMagicBarrier) {
                            onMagicBarrier.active = true
                            onMagicBarrier.getComponent(sp.Skeleton).setAnimation(0, "animation", true)
                        }
                    }
                    this.updateBarrierAlternateState(newOnFieldId)
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
                        // 互换后重启持续效果的循环动画，防止图标互换后 buff 动画停住
                        for (const child of [srcChild, tgtChild]) {
                            if (child.active && this.isContinuousEffect(child.name)) {
                                const sk = child.getComponent(sp.Skeleton)
                                if (sk) sk.setAnimation(0, "animation", true)
                            }
                        }
                    }
                }
            }

            // 4e. 同步站位数据(goIntoNum)与座位点击绑定：DOM 图片已互换，站位数据与点击详情也必须跟上，否则“站位值”与“显示图片”对不上
            const swapCamp = isSourceLeft ? this.L1 : this.R1
            const srcCreate = swapCamp ? swapCamp.find(x => x.uuid === sourceId) : null
            const tgtCreate = swapCamp ? swapCamp.find(x => x.uuid === targetId) : null
            if (srcCreate && tgtCreate) {
                const tmpGo = srcCreate.goIntoNum
                srcCreate.goIntoNum = tgtCreate.goIntoNum
                tgtCreate.goIntoNum = tmpGo
                const sh = sourceItemNode.getChildByName("header")
                const th = targetItemNode.getChildByName("header")
                if (sh) { sh.off("click"); sh.on("click", () => this.clickFun(tgtCreate)) }
                if (th) { th.off("click"); th.on("click", () => this.clickFun(srcCreate)) }
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

    // --- 返璞归真：谛听减伤+转移伤害给敌方易死护法 ---
    private async handleFanPuGuiZhen(fp) {
        AudioMgr.inst.playOneShot("sound/fight/attack/attack")
        const sideIdx = this.isLeft(fp.sourceUnitId) ? 0 : 1
        const sourceItemNode = this.getChracterChangXiaById(fp.sourceUnitId)
        // 技能名字飘字
        if (fp.sourceFieldStatus) {
            this.skillName.children[sideIdx].active = true
            this.skillName.children[sideIdx].getChildByName("Label").getComponent(Label).string = fp.eventType
        } else {
            if (sourceItemNode) {
                // 播放场下 select 动画 + 弹跳位移 + 缩放
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
                await Promise.all(this.actionAwaitQueue)
                this.actionAwaitQueue = []
            }
        }
        const targetChar = this.getCharacterById(fp.targetUnitId)
        const targetItem = this.getChracterChangXiaById(fp.targetUnitId)
        if (fp.targetFieldStatus) {
            // 目标在场上：播放hut受击动画 + 飘字
            if (targetChar) {
                let hut = targetChar.getChildByName("hut").getComponent(sp.Skeleton)
                hut.node.active = true; hut.setAnimation(0, "animation", false)
                this.showDamageOrHealNumber(fp.targetUnitId, targetChar, -fp.singleTargetValue, false)
                this.actionAwaitQueue.push(this.playAnimToPromise(hut))
            }
        } else {
            // 目标在场下：播放chuanyun受击动画 + 飘字
            if (targetItem) {
                let sk = targetItem.getChildByName("buff").getChildByName("chuanyun").getComponent(sp.Skeleton)
                sk.node.active = true; sk.setAnimation(0, "animation", false)
                this.showBuffString(targetItem, false, "-" + fp.singleTargetValue)
                sk.setCompleteListener(() => { sk.node.active = false })
            }
        }
        // 根据目标是否在场上分别更新血条
        if (fp.targetFieldStatus) {
            this.updateHpOnField(fp.targetUnitId, fp.targetHpAfter, fp.targetHpBefore)
        }
        this.updateHpOffField(fp.targetUnitId, fp.targetHpAfter, fp.targetHpBefore)
        // 更新谛听（source）自身血条（减伤后受到的伤害）
        if (fp.sourceFieldStatus) {
            this.updateHpOnField(fp.sourceUnitId, fp.sourceHpAfter, fp.sourceHpBefore)
        }
        this.updateHpOffField(fp.sourceUnitId, fp.sourceHpAfter, fp.sourceHpBefore)
        await new Promise(res => setTimeout(res, 500 / this.timeScale))
    }

    // --- 白虎·灵佑：回合开始白虎自耗血 + 全体存活友方获得物理结界（2×耗血），与乌江之殇同为 PHYSICAL_BARRIER 持续效果 ---
    private async handleLingYou(fp) {
        const sideIdx = this.isLeft(fp.sourceUnitId) ? 0 : 1
        const sourceItemNode = this.getChracterChangXiaById(fp.sourceUnitId)
        if (fp.sourceFieldStatus) {
            this.skillName.children[sideIdx].active = true
            this.skillName.children[sideIdx].getChildByName("Label").getComponent(Label).string = fp.eventType
        } else {
            if (sourceItemNode) {
                let selectSkeleton = sourceItemNode.getChildByName("select").getComponent(sp.Skeleton)
                selectSkeleton.node.active = true
                selectSkeleton.setAnimation(0, "animation", false)
                // 白虎在场下释放灵佑：场下 buff/huxiao 播放呼哨施法动画（一次性，播完隐藏），同时播 shihou 施法音效
                const hx = sourceItemNode.getChildByName("buff")?.getChildByName("huxiao")?.getComponent(sp.Skeleton)
                if (hx) { hx.node.active = true; hx.setAnimation(0, "animation", false); hx.setCompleteListener(() => { hx.node.active = false }); AudioMgr.inst.playOneShot("sound/fight/skill/shihou") }
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
            await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
        }
        await new Promise(res => setTimeout(res, 800 / this.timeScale))
        AudioMgr.inst.playOneShot("sound/fight/skill/HEAL")
        for (const key in fp.multiTargetDataMap) {
            const data = fp.multiTargetDataMap[key]
            const characterNode = this.getCharacterById(key)
            const itemNode = this.getChracterChangXiaById(key)
            // 仅施法者白虎自耗血飘红字（value=hpCost），其余友方仅加盾不掉血
            if (data.value > 0 && characterNode) {
                this.showNumber(this.isLeft(key), characterNode, -data.value, new math.Color(255, 176, 126, 255), 40)
            }
            if (data.fieldStatus) this.updateHpOnField(key, data.hpAfter, data.hpBefore)
            this.updateHpOffField(key, data.hpAfter, data.hpBefore)
            // PHYSICAL_BARRIER：仅真正吃到护盾的目标(shieldRemaining>0)播放盾动画与刷新盾数值（白虎场下自耗 shieldRemaining=0 只掉血不加盾）
            if (data.shieldRemaining > 0 && itemNode) {
                const bnode = itemNode.getChildByName("buff")?.getChildByName("PHYSICAL_BARRIER")
                if (bnode) { const sk = bnode.getComponent(sp.Skeleton); sk.node.active = true; sk.setAnimation(0, "animation", true) }
                this.updateShieldNumLabel(key, data.shieldRemaining)
                // 场下图标飘字：本次获得物盾（绿字"物盾+xxx"）
                if (data.shieldChange > 0) await this.showBuffString(itemNode, true, "物盾+" + data.shieldChange)
            }
            if (data.shieldRemaining > 0 && data.fieldStatus && characterNode) {
                const onB = characterNode.getChildByName("PHYSICAL_BARRIER")?.getComponent(sp.Skeleton)
                if (onB) { onB.node.active = true; onB.setAnimation(0, "animation", true) }
            }
        }
        // 灵佑自耗致死：前端直接判断施法者HP归零即显示dead + 清盾（不依赖后端UNIT_DEATH日志）
        if (fp.sourceHpAfter <= 0) {
            const srcId = fp.sourceUnitId
            const srcChar = this.getCharacterById(srcId)
            if (srcChar) {
                srcChar.getComponent(Sprite).spriteFrame = null
                srcChar.children.forEach(n => { n.active = false })
            }
            if (sourceItemNode) {
                sourceItemNode.getChildByName("dead").active = true
                const bp = sourceItemNode.getChildByName("buff")
                if (bp) bp.children.forEach(n => { if (n.name !== "FIXED_SOUL") n.active = false })
            }
            this.updateShieldNumLabel(srcId, 0)
            this.updateMagicShieldNumLabel(srcId, 0)
        }
    }

    // --- 白虎·血战到底：兽族死亡触发全队叠层，每个存活友方 maxHp/攻击增长（同时回等量血：加血动画+绿字+血条上限增长） ---
    private async handleXueZhan(fp) {
        await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
        const sideIdx = this.isLeft(fp.sourceUnitId) ? 0 : 1
        if (fp.sourceFieldStatus) {
            this.skillName.children[sideIdx].active = true
            this.skillName.children[sideIdx].getChildByName("Label").getComponent(Label).string = fp.eventType
        } else {
            const srcItem = this.getChracterChangXiaById(fp.sourceUnitId)
            if (srcItem) {
                const sel = srcItem.getChildByName("select").getComponent(sp.Skeleton)
                sel.node.active = true; sel.setAnimation(0, "animation", false)
                tween(srcItem)
                    .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
                    .call(async () => {
                        await this.showString(1, srcItem, new math.Color(236, 163, 61, 255), fp.eventType)
                        await new Promise(res => setTimeout(res, 300 / this.timeScale))
                    })
                    .by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
                    .start()
                this.actionAwaitQueue.push(this.playAnimToPromise(sel))
                await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
            }
        }
        AudioMgr.inst.playOneShot("sound/fight/skill/HP_UP")
        for (const key in fp.multiTargetDataMap) {
            const data = fp.multiTargetDataMap[key]
            const characterNode = this.getCharacterById(key)
            const itemNode = this.getChracterChangXiaById(key)
            // 提高生命上限同时回复等量生命：播放加血(HEAL)动画（场上角色 + 场下 buff 节点）
            if (data.fieldStatus && characterNode) {
                const onSk = characterNode.getChildByName("HEAL")?.getComponent(sp.Skeleton)
                if (onSk) { onSk.node.active = true; onSk.setAnimation(0, "animation", false); onSk.setCompleteListener(() => { onSk.node.active = false }); this.actionAwaitQueue.push(this.playAnimToPromise(onSk)) }
            }
            if (itemNode) {
                const offSk = itemNode.getChildByName("buff")?.getChildByName("HEAL")?.getComponent(sp.Skeleton)
                if (offSk) { offSk.node.active = true; offSk.setAnimation(0, "animation", false); offSk.setCompleteListener(() => { offSk.node.active = false }); this.actionAwaitQueue.push(this.playAnimToPromise(offSk)) }
            }
            // 生命上限增长：场上绿字 + 血条上限（hpBefore=新上限maxHp）同步增长
            if (characterNode) this.showDamageOrHealNumber(key, characterNode, data.value, true)
            if (data.fieldStatus) this.updateHpOnField(key, data.hpAfter, data.hpBefore)
            this.updateHpOffField(key, data.hpAfter, data.hpBefore)
            if (itemNode && fp.extraDesc) await this.showBuffString(itemNode, true, fp.extraDesc)
        }
        await new Promise(res => setTimeout(res, 1000 / this.timeScale))
    }

    // --- 应龙·龙血刻印：①护法自损→应龙+印记（单目标）；②苍龙吸水印记分发（单条多目标日志：应龙减 need、每个后方护法+3） ---
    private async handleLongXueKeYin(fp) {
        await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
        const sideIdx = this.isLeft(fp.sourceUnitId) ? 0 : 1
        const srcItem = this.getChracterChangXiaById(fp.sourceUnitId)
        if (fp.sourceFieldStatus) {
            this.skillName.children[sideIdx].active = true
            this.skillName.children[sideIdx].getChildByName("Label").getComponent(Label).string = fp.eventType
            await new Promise(res => setTimeout(res, 800 / this.timeScale))
        } else if (srcItem) {
            const sel = srcItem.getChildByName("select").getComponent(sp.Skeleton)
            sel.node.active = true; sel.setAnimation(0, "animation", false)
            tween(srcItem)
                .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
                .call(async () => {
                    await this.showString(1, srcItem, new math.Color(236, 163, 61, 255), fp.eventType)
                    await new Promise(res => setTimeout(res, 300 / this.timeScale))
                })
                .by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
                .start()
            this.actionAwaitQueue.push(this.playAnimToPromise(sel))
            await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
        }
        AudioMgr.inst.playOneShot("sound/fight/skill/HP_UP")
        const targets = fp.multiTargetDataMap ? Object.keys(fp.multiTargetDataMap) : []
        if (targets.length > 0) {
            // 苍龙吸水·印记分发（合并为一条日志）：应龙自身减 need（红字，num 已由 handleSkillEvent 按 yinjiCount 刷新）
            if (srcItem && fp.extraDesc) await this.showBuffString(srcItem, false, fp.extraDesc)
            // 再对每个后方护法：刷新其场下印记 num + 并行飘“印记+X”绿字
            for (const key of targets) {
                const data = fp.multiTargetDataMap[key]
                if (data.yinjiCount !== null && data.yinjiCount !== undefined) this.updateYinjiNumLabel(key, data.yinjiCount)
            }
            await Promise.all(targets.map(key => {
                const data = fp.multiTargetDataMap[key]
                const item = this.getChracterChangXiaById(key)
                return (item && data.value) ? this.showBuffString(item, true, "印记+" + data.value) : Promise.resolve()
            }))
        } else {
            // 龙血刻印·应龙自增（护法自损→应龙+10）：仅应龙身上飘字（num 已由 handleSkillEvent 统一刷新）
            if (srcItem && fp.extraDesc) await this.showBuffString(srcItem, true, fp.extraDesc)
            // 场上应龙获得印记：角色身上播放一次 yinji2（不循环，播完自动隐藏）
            if (fp.sourceFieldStatus) {
                const charNode = this.getCharacterById(fp.sourceUnitId)
                const yinji2 = charNode?.getChildByName("yinji2")
                const sk = yinji2?.getComponent(sp.Skeleton)
                if (sk) {
                    yinji2.active = true; sk.node.active = true
                    sk.setAnimation(0, "animation", false)
                    sk.setCompleteListener(() => { yinji2.active = false; sk.setCompleteListener(null) })
                }
            }
        }
    }

    // --- 应龙·血刻加命：友方受增益→全体+10×印记生命上限（与血战到底同：绿字+刷新血条上限） ---
    private async handleXueKeJiaMing(fp) {
        await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
        const sideIdx = this.isLeft(fp.sourceUnitId) ? 0 : 1
        if (fp.sourceFieldStatus) {
            this.skillName.children[sideIdx].active = true
            this.skillName.children[sideIdx].getChildByName("Label").getComponent(Label).string = fp.eventType
        } else {
            const srcItem = this.getChracterChangXiaById(fp.sourceUnitId)
            if (srcItem) {
                const sel = srcItem.getChildByName("select").getComponent(sp.Skeleton)
                sel.node.active = true; sel.setAnimation(0, "animation", false)
                tween(srcItem)
                    .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
                    .call(async () => {
                        await this.showString(1, srcItem, new math.Color(236, 163, 61, 255), fp.eventType)
                        await new Promise(res => setTimeout(res, 300 / this.timeScale))
                    })
                    .by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
                    .start()
                this.actionAwaitQueue.push(this.playAnimToPromise(sel))
                await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
            }
        }
        AudioMgr.inst.playOneShot("sound/fight/skill/HP_UP")
        for (const key in fp.multiTargetDataMap) {
            const data = fp.multiTargetDataMap[key]
            const characterNode = this.getCharacterById(key)
            const itemNode = this.getChracterChangXiaById(key)
            // HP_UP 增益动画：场上播角色身上 HP_UP spine + 绿字；场下播 itemNode/buff/HP_UP spine（与血战到底等 buff 一致，保证反向提升的兽族施法者在场下也有动画）
            if (data.fieldStatus && characterNode) {
                const onSk = characterNode.getChildByName("HP_UP")?.getComponent(sp.Skeleton)
                if (onSk) { onSk.node.active = true; onSk.setAnimation(0, "animation", false); onSk.setCompleteListener(() => { onSk.node.active = false }) }
                this.showDamageOrHealNumber(key, characterNode, data.value, true)
            } else if (itemNode) {
                const offSk = itemNode.getChildByName("buff")?.getChildByName("HP_UP")?.getComponent(sp.Skeleton)
                if (offSk) {
                    offSk.node.active = true; offSk.setAnimation(0, "animation", false)
                    offSk.setCompleteListener(() => { offSk.node.active = false })
                    this.actionAwaitQueue.push(this.playAnimToPromise(offSk))
                }
            }
            if (data.fieldStatus) this.updateHpOnField(key, data.hpAfter, data.hpBefore)
            this.updateHpOffField(key, data.hpAfter, data.hpBefore)
            if (itemNode && fp.extraDesc) await this.showBuffString(itemNode, true, fp.extraDesc)
        }
        await new Promise(res => setTimeout(res, 1000 / this.timeScale))
    }

    // --- 应龙·苍龙吸水：护盾刷新(应龙获得吸收的物/法盾) + 结界溢出治疗(应龙自恢复)，两种日志共用一个处理器 ---
    private async handleCangLongXiShui(fp) {
        await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
        const sideIdx = this.isLeft(fp.sourceUnitId) ? 0 : 1
        if (fp.sourceFieldStatus) {
            this.skillName.children[sideIdx].active = true
            this.skillName.children[sideIdx].getChildByName("Label").getComponent(Label).string = fp.eventType
            await new Promise(res => setTimeout(res, 800 / this.timeScale))
        } else {
            const srcItem = this.getChracterChangXiaById(fp.sourceUnitId)
            if (srcItem) {
                const sel = srcItem.getChildByName("select").getComponent(sp.Skeleton)
                sel.node.active = true; sel.setAnimation(0, "animation", false)
                tween(srcItem)
                    .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
                    .call(async () => {
                        await this.showString(1, srcItem, new math.Color(236, 163, 61, 255), fp.eventType)
                        await new Promise(res => setTimeout(res, 300 / this.timeScale))
                    })
                    .by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
                    .start()
                this.actionAwaitQueue.push(this.playAnimToPromise(sel))
                await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
            }
        }
        // 护盾吸取日志用 shihou 施法音；生命上限削减复用阎王·生死簿的 MAX_HP_DOWN 音效；结界溢出治疗用 HEAL 加血音
        AudioMgr.inst.playOneShot(fp.effectType == 'MAX_HP_DOWN' ? "sound/fight/skill/MAX_HP_DOWN" : (fp.effectType == 'HEAL' ? "sound/fight/skill/HEAL" : "sound/fight/skill/shihou"))
        for (const key in fp.multiTargetDataMap) {
            const data = fp.multiTargetDataMap[key]
            const characterNode = this.getCharacterById(key)
            const itemNode = this.getChracterChangXiaById(key)
            // 生命上限削减（苍龙吸水·结界溢出削敌）：复用阎王·生死簿的 MAX_HP_DOWN 动画（场上+场下 spine）+ 红字
            if (fp.effectType == 'MAX_HP_DOWN') {
                if (data.fieldStatus && characterNode) {
                    const onSk = characterNode.getChildByName("MAX_HP_DOWN")?.getComponent(sp.Skeleton)
                    if (onSk) { onSk.node.active = true; onSk.setAnimation(0, "animation", false); onSk.setCompleteListener(() => { onSk.node.active = false }) }
                }
                const offSk = itemNode?.getChildByName("buff")?.getChildByName("MAX_HP_DOWN")?.getComponent(sp.Skeleton)
                if (offSk) { offSk.node.active = true; offSk.setAnimation(0, "animation", false); this.actionAwaitQueue.push(this.playAnimToPromise(offSk)) }
                if (characterNode && data.value > 0) this.showDamageOrHealNumber(key, characterNode, -data.value, false)
                if (data.fieldStatus) this.updateHpOnField(key, data.hpAfter, data.hpBefore)
                this.updateHpOffField(key, data.hpAfter, data.hpBefore)
                if (itemNode && fp.extraDesc) await this.showBuffString(itemNode, false, "生命上限 -" + data.value)
                continue
            }
            // 结界溢出治疗（苍龙吸水·超上限差值恢复自身及前后护法）：加血(HEAL)动画 + 绿字 + 血条上升
            if (fp.effectType == 'HEAL') {
                if (data.fieldStatus && characterNode) {
                    const onSk = characterNode.getChildByName("HEAL")?.getComponent(sp.Skeleton)
                    if (onSk) { onSk.node.active = true; onSk.setAnimation(0, "animation", false); onSk.setCompleteListener(() => { onSk.node.active = false }); this.actionAwaitQueue.push(this.playAnimToPromise(onSk)) }
                    this.showDamageOrHealNumber(key, characterNode, data.value, true)
                }
                if (itemNode) {
                    const offSk = itemNode.getChildByName("buff")?.getChildByName("HEAL")?.getComponent(sp.Skeleton)
                    if (offSk) { offSk.node.active = true; offSk.setAnimation(0, "animation", false); offSk.setCompleteListener(() => { offSk.node.active = false }); this.actionAwaitQueue.push(this.playAnimToPromise(offSk)) }
                }
                if (data.fieldStatus) this.updateHpOnField(key, data.hpAfter, data.hpBefore)
                this.updateHpOffField(key, data.hpAfter, data.hpBefore)
                if (itemNode) await this.showBuffString(itemNode, true, "生命值+" + data.value)
                continue
            }
            // 护盾数值刷新（应龙吸收后的护盾总量）
            if (data.shieldRemaining !== undefined && data.shieldRemaining > 0) {
                this.updateShieldNumLabel(key, data.shieldRemaining)
                const pb = itemNode?.getChildByName("buff")?.getChildByName("PHYSICAL_BARRIER")
                if (pb) { const sk = pb.getComponent(sp.Skeleton); sk.node.active = true; sk.setAnimation(0, "animation", true) }
            }
            if (data.magicShieldRemaining !== undefined && data.magicShieldRemaining > 0) {
                this.updateMagicShieldNumLabel(key, data.magicShieldRemaining)
                const mb = itemNode?.getChildByName("buff")?.getChildByName("MAGIC_BARRIER")
                if (mb) { const sk = mb.getComponent(sp.Skeleton); sk.node.active = true; sk.setAnimation(0, "animation", true) }
            }
            // 血条（生命上限削减后新上限 hpBefore 会变小）
            if (data.fieldStatus) this.updateHpOnField(key, data.hpAfter, data.hpBefore)
            this.updateHpOffField(key, data.hpAfter, data.hpBefore)
            // 吸盾飘字：被吸单位红字"物盾-x"/"法盾-x"，应龙自身绿字"物盾+x"/"法盾+x"
            if (itemNode) {
                if (data.shieldChange > 0) await this.showBuffString(itemNode, true, "物盾+" + data.shieldChange)
                else if (data.shieldChange < 0) await this.showBuffString(itemNode, false, "物盾-" + Math.abs(data.shieldChange))
                if (data.magicShieldChange > 0) await this.showBuffString(itemNode, true, "法盾+" + data.magicShieldChange)
                else if (data.magicShieldChange < 0) await this.showBuffString(itemNode, false, "法盾-" + Math.abs(data.magicShieldChange))
            }
        }
        await new Promise(res => setTimeout(res, 1000 / this.timeScale))
    }

    // --- 应龙·应龙逆鳞阈值40 狂暴：先红字掉10%生命上限的血+血条下降，再绿字加攻击/速度（sourceSelfValue=hpCost、extraDesc=攻击+X 速度+X） ---
    private async handleKuangbao(fp) {
        await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
        const ylId = fp.sourceUnitId
        const sideIdx = this.isLeft(ylId) ? 0 : 1
        const charNode = this.getCharacterById(ylId)
        const itemNode = this.getChracterChangXiaById(ylId)
        // 施法表现：场上飘技能名，场下 select 弹跳 + 飘字
        if (fp.sourceFieldStatus) {
            this.skillName.children[sideIdx].active = true
            this.skillName.children[sideIdx].getChildByName("Label").getComponent(Label).string = fp.eventType
            await new Promise(res => setTimeout(res, 800 / this.timeScale))
        } else if (itemNode) {
            const sel = itemNode.getChildByName("select").getComponent(sp.Skeleton)
            sel.node.active = true; sel.setAnimation(0, "animation", false)
            tween(itemNode)
                .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
                .call(async () => {
                    await this.showString(1, itemNode, new math.Color(236, 163, 61, 255), fp.eventType)
                    await new Promise(res => setTimeout(res, 300 / this.timeScale))
                })
                .by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
                .start()
            this.actionAwaitQueue.push(this.playAnimToPromise(sel))
            await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
        }
        // 1) 红字：掉 10% 生命上限的血（-hpCost）+ 血条下降
        const hpCost = fp.sourceSelfValue
        AudioMgr.inst.playOneShot("sound/fight/skill/DAMAGE")
        if (charNode) this.showDamageOrHealNumber(ylId, charNode, -hpCost, false)
        if (itemNode) await this.showBuffString(itemNode, false, "生命 -" + hpCost)
        if (fp.sourceFieldStatus) this.updateHpOnField(ylId, fp.sourceHpAfter, fp.sourceHpBefore)
        this.updateHpOffField(ylId, fp.sourceHpAfter, fp.sourceHpBefore)
        await new Promise(res => setTimeout(res, 500 / this.timeScale))
        // 2) 绿字：加攻击/速度（HP_UP 动画 + 绿字 extraDesc）
        AudioMgr.inst.playOneShot("sound/fight/skill/HP_UP")
        if (charNode) {
            const sk = charNode.getChildByName("HP_UP")?.getComponent(sp.Skeleton)
            if (sk) { sk.node.active = true; sk.setAnimation(0, "animation", false); sk.setCompleteListener(() => { sk.node.active = false }) }
        }
        if (itemNode) {
            const offSk = itemNode.getChildByName("buff")?.getChildByName("HP_UP")?.getComponent(sp.Skeleton)
            if (offSk) { offSk.node.active = true; offSk.setAnimation(0, "animation", false); offSk.setCompleteListener(() => { offSk.node.active = false }) }
            await this.showBuffString(itemNode, true, fp.extraDesc)
        }
        await new Promise(res => setTimeout(res, 500 / this.timeScale))
    }

    // --- 应龙·免疫致命：消耗应龙印记替友军挡下致死伤害（受保单位不掉血，仅飘名+提示），单目标 ---
    private async handleMianYiZhiMing(fp) {
        await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
        const sideIdx = this.isLeft(fp.sourceUnitId) ? 0 : 1
        const defItem = this.getChracterChangXiaById(fp.targetUnitId)
        if (fp.sourceFieldStatus) {
            this.skillName.children[sideIdx].active = true
            this.skillName.children[sideIdx].getChildByName("Label").getComponent(Label).string = fp.eventType
            await new Promise(res => setTimeout(res, 800 / this.timeScale))
        } else if (defItem) {
            const sel = defItem.getChildByName("select").getComponent(sp.Skeleton)
            sel.node.active = true; sel.setAnimation(0, "animation", false)
            tween(defItem)
                .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
                .call(async () => {
                    await this.showString(1, defItem, new math.Color(120, 200, 255, 255), fp.eventType)
                    await new Promise(res => setTimeout(res, 300 / this.timeScale))
                })
                .by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
                .start()
            this.actionAwaitQueue.push(this.playAnimToPromise(sel))
            await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
        }
        AudioMgr.inst.playOneShot("sound/fight/skill/shihou")
        // 受保者护盾/受保动画：场上播角色身上 PHYSICAL_BARRIER spine，场下播 itemNode/buff/PHYSICAL_BARRIER spine（与血刻加命场下动画一致，保证免疫致命触发时场下单位也有可见表现）
        const defChar = this.getCharacterById(fp.targetUnitId)
        if (fp.targetFieldStatus && defChar) {
            const onSk = defChar.getChildByName("PHYSICAL_BARRIER")?.getComponent(sp.Skeleton)
            if (onSk) { onSk.node.active = true; onSk.setAnimation(0, "animation", false); onSk.setCompleteListener(() => { onSk.node.active = false }) }
        } else if (defItem) {
            const offSk = defItem.getChildByName("buff")?.getChildByName("PHYSICAL_BARRIER")?.getComponent(sp.Skeleton)
            if (offSk) {
                offSk.node.active = true; offSk.setAnimation(0, "animation", false)
                offSk.setCompleteListener(() => { offSk.node.active = false })
                this.actionAwaitQueue.push(this.playAnimToPromise(offSk))
            }
        }
        // 免疫=本次伤害未生效，HP与受击前一致，按当前值刷新血条，并飘“免疫致命”
        if (fp.targetFieldStatus) this.updateHpOnField(fp.targetUnitId, fp.targetHpAfter, fp.targetHpBefore)
        this.updateHpOffField(fp.targetUnitId, fp.targetHpAfter, fp.targetHpBefore)
        // extraDesc 与 eventType 同为“免疫致命”时不再多飘一次（否则屏幕出现两个“免疫致命”）；仅当后端给了不同的补充文案才显示
        if (defItem && fp.extraDesc && fp.extraDesc !== fp.eventType) await this.showBuffString(defItem, true, fp.extraDesc)
        // 应龙消耗1层印记：显式刷新应龙场下印记数（幂等）+ 飘“印记-1”红字（免疫致命常被龙血刻印 +10 掩盖，需明确提示扣减）
        if (fp.yinjiCount !== null && fp.yinjiCount !== undefined) {
            this.updateYinjiNumLabel(fp.sourceUnitId, fp.yinjiCount)
            const ylItem = this.getChracterChangXiaById(fp.sourceUnitId)
            if (ylItem) await this.showBuffString(ylItem, false, "印记-1")
        }
    }

    // --- 应龙·龙炎群伤：消耗1印记对敌全体火焰伤害 AOE（红字+扣血，死亡另走 UNIT_DEATH） ---
    private async handleLongYanQunShang(fp) {
        await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
        const sideIdx = this.isLeft(fp.sourceUnitId) ? 0 : 1
        if (fp.sourceFieldStatus) {
            this.skillName.children[sideIdx].active = true
            this.skillName.children[sideIdx].getChildByName("Label").getComponent(Label).string = fp.eventType
            await new Promise(res => setTimeout(res, 800 / this.timeScale))
        } else {
            const srcItem = this.getChracterChangXiaById(fp.sourceUnitId)
            if (srcItem) {
                const sel = srcItem.getChildByName("select").getComponent(sp.Skeleton)
                sel.node.active = true; sel.setAnimation(0, "animation", false)
                tween(srcItem)
                    .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
                    .call(async () => {
                        await this.showString(1, srcItem, new math.Color(236, 163, 61, 255), fp.eventType)
                        await new Promise(res => setTimeout(res, 300 / this.timeScale))
                    })
                    .by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
                    .start()
                this.actionAwaitQueue.push(this.playAnimToPromise(sel))
                await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
            }
        }
        AudioMgr.inst.playOneShot("sound/fight/skill/FIRE_DAMAGE")
        for (const key in fp.multiTargetDataMap) {
            const data = fp.multiTargetDataMap[key]
            const characterNode = this.getCharacterById(key)
            if (characterNode) this.showDamageOrHealNumber(key, characterNode, data.value, false)
            if (data.fieldStatus) this.updateHpOnField(key, data.hpAfter, data.hpBefore)
            this.updateHpOffField(key, data.hpAfter, data.hpBefore)
        }
        await new Promise(res => setTimeout(res, 1000 / this.timeScale))
    }

    // --- 应龙·还魂：消耗印记给随机阵亡友方施加还魂（该单位仍处阵亡态），场下持续循环播放 huanhun 动画，复活时由 handleYinjiFuhuo 移除 ---
    private async handleHuanhun(fp) {
        await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
        const sideIdx = this.isLeft(fp.sourceUnitId) ? 0 : 1
        if (fp.sourceFieldStatus) {
            this.skillName.children[sideIdx].active = true
            this.skillName.children[sideIdx].getChildByName("Label").getComponent(Label).string = fp.eventType
            await new Promise(res => setTimeout(res, 800 / this.timeScale))
        } else {
            const srcItem = this.getChracterChangXiaById(fp.sourceUnitId)
            if (srcItem) {
                const sel = srcItem.getChildByName("select").getComponent(sp.Skeleton)
                sel.node.active = true; sel.setAnimation(0, "animation", false)
                tween(srcItem)
                    .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
                    .call(async () => {
                        await this.showString(1, srcItem, new math.Color(236, 163, 61, 255), fp.eventType)
                        await new Promise(res => setTimeout(res, 300 / this.timeScale))
                    })
                    .by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
                    .start()
                this.actionAwaitQueue.push(this.playAnimToPromise(sel))
                await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
            }
        }
        AudioMgr.inst.playOneShot("sound/fight/skill/HEAL")
        // 还魂目标（仍阵亡、在场下）：持续循环播放 itemNode/buff/huanhun 动画，直到复活（不减血、不清 dead 标记）
        const targetItem = this.getChracterChangXiaById(fp.targetUnitId)
        if (targetItem) {
            const hh = targetItem.getChildByName("buff")?.getChildByName("huanhun")
            if (hh) {
                hh.active = true
                const sk = hh.getComponent(sp.Skeleton)
                if (sk) { sk.node.active = true; sk.setAnimation(0, "animation-01", true) }
            }
            if (fp.extraDesc) await this.showBuffString(targetItem, true, fp.extraDesc)
        }
    }

    // --- 应龙·还魂复活：还魂倒计时结束，满血复活（应龙无生命消耗），参考 handleRevive 但不加固魂/不飘自耗 ---
    private async handleYinjiFuhuo(fp) {
        await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
        const sideIdx = this.isLeft(fp.sourceUnitId) ? 0 : 1
        const srcItem = this.getChracterChangXiaById(fp.sourceUnitId)
        if (fp.sourceFieldStatus) {
            this.skillName.children[sideIdx].active = true
            this.skillName.children[sideIdx].getChildByName("Label").getComponent(Label).string = fp.eventType
        } else if (srcItem) {
            const sel = srcItem.getChildByName("select").getComponent(sp.Skeleton)
            sel.node.active = true; sel.setAnimation(0, "animation", false)
            tween(srcItem)
                .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
                .call(async () => {
                    await this.showString(1, srcItem, new math.Color(236, 163, 61, 255), fp.eventType)
                    await new Promise(res => setTimeout(res, 300 / this.timeScale))
                })
                .by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
                .start()
            this.actionAwaitQueue.push(this.playAnimToPromise(sel))
            await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
        }
        AudioMgr.inst.playOneShot("sound/fight/skill/HEAL")
        const targetId = fp.targetUnitId
        const targetItemNode = this.getChracterChangXiaById(targetId)
        // 复活生效：移除场下 huanhun 持续动画
        if (targetItemNode) {
            const hh = targetItemNode.getChildByName("buff")?.getChildByName("huanhun")
            if (hh) { const sk = hh.getComponent(sp.Skeleton); if (sk) sk.setAnimation(0, "animation-01", false); hh.active = false }
        }
        const targetCharacterNode = this.getCharacterById(targetId)
        const isTargetLeft = this.isLeft(targetId)
        // 清除场下死亡标记
        if (targetItemNode) {
            const deadNode = targetItemNode.getChildByName("dead")
            if (deadNode) deadNode.active = false
        }
        // 复活登场：仅当复活单位确在场上时恢复精灵 + 弹出动画
        if (targetCharacterNode && fp.targetFieldStatus) {
            targetCharacterNode.getComponent(Sprite).spriteFrame =
                await util.bundle.load(`game/texture/frames/hero/${targetId.replace(/[a-zA-Z]/g, '')}/spriteFrame`, SpriteFrame)
            const scaleNew = new Vec3(
                isTargetLeft ? Math.abs(targetCharacterNode.scale.x) * -1 : Math.abs(targetCharacterNode.scale.x),
                targetCharacterNode.scale.y, targetCharacterNode.scale.z)
            targetCharacterNode.scale = new Vec3(0, 0, 0)
            this.actionAwaitQueue.push(this.tweenToPromise(targetCharacterNode, 0.8, { scale: scaleNew }, { easing: 'elasticOut' }))
            targetCharacterNode.getChildByName("id").active = true
            targetCharacterNode.getChildByName("id").getComponent(Label).string = targetId
        }
        // 复活单位血条（targetHpBefore=生命上限, targetHpAfter=复活血量）
        if (fp.targetFieldStatus) this.updateHpOnField(targetId, fp.targetHpAfter, fp.targetHpBefore)
        this.updateHpOffField(targetId, fp.targetHpAfter, fp.targetHpBefore)
        if (targetItemNode && fp.extraDesc) await this.showBuffString(targetItemNode, true, fp.extraDesc)
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
            
            // 更新血条：根据目标是否在场上分别更新
            if (data.fieldStatus) {
                this.updateHpOnField(key, data.hpAfter, data.hpBefore)
            }
            this.updateHpOffField(key, data.hpAfter, data.hpBefore)
            
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

    // --- 青龙·龙威：吸血(双方兽族掉血) + 加盾(我方) + 青龙自身吸血回血，一条日志内同时表现；施法音效 shihou，青龙回血额外 HEAL 动画+音效 ---
    private async handleLongWei(fp) {
        await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
        const sideIdx = this.isLeft(fp.sourceUnitId) ? 0 : 1
        // 施法表现：场上飘技能名，场下 select 弹跳 + 飘字
        if (fp.sourceFieldStatus) {
            this.skillName.children[sideIdx].active = true
            this.skillName.children[sideIdx].getChildByName("Label").getComponent(Label).string = fp.eventType
            await new Promise(res => setTimeout(res, 800 / this.timeScale))
        } else {
            const srcItem = this.getChracterChangXiaById(fp.sourceUnitId)
            if (srcItem) {
                const sel = srcItem.getChildByName("select").getComponent(sp.Skeleton)
                sel.node.active = true; sel.setAnimation(0, "animation", false)
                tween(srcItem)
                    .by(0.5, { position: new Vec3(0, 20, 0), scale: new Vec3(0.2, 0.2, 0.2) }, { easing: 'elasticOut' })
                    .call(async () => {
                        await this.showString(1, srcItem, new math.Color(236, 163, 61, 255), fp.eventType)
                        await new Promise(res => setTimeout(res, 300 / this.timeScale))
                    })
                    .by(0.5, { position: new Vec3(0, -20, 0), scale: new Vec3(-0.2, -0.2, -0.2) }, { easing: 'elasticIn' })
                    .start()
                this.actionAwaitQueue.push(this.playAnimToPromise(sel))
                await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
            }
        }
        // shihou 音效：龙威施法一次
        AudioMgr.inst.playOneShot("sound/fight/skill/shihou")

        let qlHealPlayed = false
        for (const key in fp.multiTargetDataMap) {
            const data = fp.multiTargetDataMap[key]
            const itemNode = this.getChracterChangXiaById(key)
            const characterNode = this.getCharacterById(key)
            if (data.healValue > 0) {
                // 青龙吸血回血：治疗动画 + 绿字 + HEAL 音效
                if (characterNode) {
                    const onHeal = characterNode.getChildByName('HEAL')?.getComponent(sp.Skeleton)
                    if (onHeal) { onHeal.node.active = true; onHeal.setAnimation(0, "animation", false); onHeal.setCompleteListener(() => { onHeal.node.active = false }) }
                    this.showDamageOrHealNumber(key, characterNode, data.healValue, true)
                }
                const offHeal = itemNode?.getChildByName("buff")?.getChildByName('HEAL')?.getComponent(sp.Skeleton)
                if (offHeal) { offHeal.node.active = true; offHeal.setAnimation(0, "animation", false); offHeal.setCompleteListener(() => { offHeal.node.active = false }) }
                if (!qlHealPlayed) { AudioMgr.inst.playOneShot("sound/fight/skill/HEAL"); qlHealPlayed = true }
            } else if (data.value > 0) {
                // 被吸血单位掉血：红字
                if (characterNode) this.showDamageOrHealNumber(key, characterNode, -data.value, false)
            }
            // 血条更新（吸血掉血 / 回血后的最终 HP）
            if (data.fieldStatus) this.updateHpOnField(key, data.hpAfter, data.hpBefore)
            this.updateHpOffField(key, data.hpAfter, data.hpBefore)
            // 加盾（我方 magicShieldRemaining>0），场上+场下持续循环，与物理护盾一致
            if (data.magicShieldRemaining > 0) {
                const offM = itemNode?.getChildByName("buff")?.getChildByName('MAGIC_BARRIER')?.getComponent(sp.Skeleton)
                if (offM) { offM.node.active = true; offM.setAnimation(0, "animation", true) }
                if (data.fieldStatus && characterNode) {
                    const onM = characterNode.getChildByName('MAGIC_BARRIER')?.getComponent(sp.Skeleton)
                    if (onM) { onM.node.active = true; onM.setAnimation(0, "animation", true) }
                }
                this.updateMagicShieldNumLabel(key, data.magicShieldRemaining)
            }
            // 场下飘字
            if (itemNode) {
                if (data.healValue > 0) await this.showBuffString(itemNode, true, "+" + data.healValue)
                else if (data.value > 0) await this.showBuffString(itemNode, false, "-" + data.value)
                // 本次获得法盾（绿字"法盾+xxx"）
                if (data.magicShieldChange > 0) await this.showBuffString(itemNode, true, "法盾+" + data.magicShieldChange)
            }
        }
        await new Promise(res => setTimeout(res, 1000 / this.timeScale))
    }

    // --- 青龙·青龙吐珠：登场对敌方全体雷击群伤；先 shihou 施法音，随后每个被电目标各一声 leidian 音效+leidian 动画（类轩辕连续音效），命中可眩晕 ---
    private async handleQinglongTuZhu(fp) {
        await Promise.all(this.actionAwaitQueue); this.actionAwaitQueue = []
        const sideIdx = this.isLeft(fp.sourceUnitId) ? 0 : 1
        // 施法：场上飘技能名 + 先播 shihou
        this.skillName.children[sideIdx].active = true
        this.skillName.children[sideIdx].getChildByName("Label").getComponent(Label).string = fp.eventType
        AudioMgr.inst.playOneShot("sound/fight/skill/shihou")
        // 青龙在场上释放：自身播放 longxiao 施法动画（一次性，播完隐藏）
        if (fp.sourceFieldStatus) {
            const caster = this.getCharacterById(fp.sourceUnitId)
            const lx = caster?.getChildByName("longxiao")?.getComponent(sp.Skeleton)
            if (lx) { lx.node.active = true; lx.setAnimation(0, "animation", false); lx.setCompleteListener(() => { lx.node.active = false }) }
        }
        await new Promise(res => setTimeout(res, 800 / this.timeScale))

        let anyStun = false
        for (const key in fp.multiTargetDataMap) {
            const data = fp.multiTargetDataMap[key]
            const characterNode = this.getCharacterById(key)
            const itemNode = this.getChracterChangXiaById(key)
            // 每道雷一声 leidian 音效
            AudioMgr.inst.playOneShot("sound/fight/skill/leidian")
            // 场上 leidian 动画（一次性，播完隐藏）
            if (characterNode) {
                const onL = characterNode.getChildByName('leidian')?.getComponent(sp.Skeleton)
                if (onL) { onL.node.active = true; onL.setAnimation(0, "animation", false); onL.setCompleteListener(() => { onL.node.active = false }) }
            }
            // 场下 leidian 动画
            const offL = itemNode?.getChildByName("buff")?.getChildByName('leidian')?.getComponent(sp.Skeleton)
            if (offL) { offL.node.active = true; offL.setAnimation(0, "animation", false); offL.setCompleteListener(() => { offL.node.active = false }) }
            // 伤害数字 + 血条
            if (characterNode) {
                this.showDamageOrHealNumber(key, characterNode, data.value, false)
                if (data.fieldStatus) this.updateHpOnField(key, data.hpAfter, data.hpBefore)
            }
            this.updateHpOffField(key, data.hpAfter, data.hpBefore)
            await this.showAoeBuffString(fp, key, data, itemNode)
            // 眩晕：补挂 STUN 循环动画（音效整段统一一次）
            if (data.stunned) {
                anyStun = true
                if (characterNode) {
                    const sOn = characterNode.getChildByName('STUN')?.getComponent(sp.Skeleton)
                    if (sOn) { sOn.node.active = true; sOn.setAnimation(0, "animation", true) }
                }
                const sOff = itemNode?.getChildByName("buff")?.getChildByName('STUN')?.getComponent(sp.Skeleton)
                if (sOff) { sOff.node.active = true; sOff.setAnimation(0, "animation", true) }
            }
        }
        if (anyStun) AudioMgr.inst.playOneShot("sound/fight/skill/STUN")
    }

    // --- 审死回血附带驱散：隐藏单位身上可见的持续负面 buff 动画（场上+场下）---
    private hideNegativeBuffs(characterNode: Node, itemNode: Node) {
        for (const debuff of ["STUN", "SILENCE", "POISON", "HEAL_DOWN"]) {
            const fn = characterNode?.getChildByName(debuff)
            if (fn) fn.active = false
            const bn = itemNode?.getChildByName("buff")?.getChildByName(debuff)
            if (bn) bn.active = false
        }
    }

    // --- 场上群体技能 ---
    private async handleSkillOnFieldAoe(fp) {
        const sideIdx = this.isLeft(fp.sourceUnitId) ? 0 : 1
        this.skillName.children[sideIdx].active = true
        this.skillName.children[sideIdx].getChildByName("Label").getComponent(Label).string = fp.eventType
        await new Promise(res => setTimeout(res, 800 / this.timeScale))
        // 吾乃轩辕使用 DAMAGE 音效（即 effectType 同名音效），其余技能同样沿用 effectType 同名音效
        const isWuNaiXuanYuan = fp.eventType == "吾乃轩辕"
        // 应龙·应龙逆鳞阈值15 净化（驱散负面）：场上动画沿用厚土"大地净化"的 HOU_JH（含其音效），故跳过通用 effectType(HEAL) 音效
        const isYlPurge = fp.eventType == '应龙逆鳞' && fp.effectType == 'HEAL'
        // 吾乃轩辕：DAMAGE 音效在场上动画结束后播放；其余技能在开头播放
        if (!isWuNaiXuanYuan && !isYlPurge) {
            AudioMgr.inst.playOneShot("sound/fight/skill/" + fp.effectType);
        }
        let skeletons: sp.Skeleton[] = []
        // 吾乃轩辕：先播放释放者场上的 wunaixuanyuan 动画和 chuanyun_man 音效，完成后回调播放场下动画
        if (isWuNaiXuanYuan) {
            const sourceChar = this.getCharacterById(fp.sourceUnitId)
            if (sourceChar) {
                const wnNode = sourceChar.getChildByName("wunaixuanyuan") || sourceChar.getChildByName(fp.effectType)
                if (wnNode) {
                    const sk = wnNode.getComponent(sp.Skeleton)
                    sk.node.active = true
                    sk.setAnimation(0, "animation", false)
                    AudioMgr.inst.playOneShot("sound/fight/skill/chuanyun_man")
                    sk.setCompleteListener(async () => {
                        sk.node.active = false
                        // 场上动画播完后，播放 DAMAGE 音效和场下动画
                        AudioMgr.inst.playOneShot("sound/fight/skill/" + fp.effectType);
                        let skeletons: sp.Skeleton[] = []
                        for (const key in fp.multiTargetDataMap) {
                            let itemNode = this.getChracterChangXiaById(key)
                            let characterNode = this.getCharacterById(key)
                            // 跳过释放者的场上角色（已在上面播放），其余场上被击单位播默认受击动画(effectType)
                            if (characterNode && key != fp.sourceUnitId) {
                                const wnNode = characterNode.getChildByName(fp.effectType)
                                if (wnNode) skeletons.push(wnNode.getComponent(sp.Skeleton))
                            }
                            // 场下小图标：chuanyun + hut 受击动画同时播放
                            const buffNode = itemNode?.getChildByName("buff")
                            const cyNode = buffNode?.getChildByName("chuanyun")
                            if (cyNode) skeletons.push(cyNode.getComponent(sp.Skeleton))
                            const hutNode = buffNode?.getChildByName("hut")
                            if (hutNode) skeletons.push(hutNode.getComponent(sp.Skeleton))
                        }
                        skeletons.forEach(s => {
                            s.node.active = true
                            s.setAnimation(0, "animation", false)
                            this.actionAwaitQueue.push(this.playAnimToPromise(s))
                        })
                        // 场下受击音效只播一次，避免多个目标叠加
                        AudioMgr.inst.playOneShot("sound/fight/attack/attack")
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
                    })
                    return  // 吾乃轩辕的处理在回调中完成
                }
            }
        }
        // 非吾乃轩辕的原有逻辑
        for (const key in fp.multiTargetDataMap) {
            let itemNode = this.getChracterChangXiaById(key)
            let characterNode = this.getCharacterById(key)
            // 净化：不在每个目标身上播通用 HEAL 受击动画，改为隐藏其持续负面 buff 动画（HOU_JH 场上动画稍后在施法者应龙身上统一播放）
            if (isYlPurge) { this.hideNegativeBuffs(characterNode, itemNode); continue }
            if (characterNode) skeletons.push(characterNode.getChildByName(fp.effectType).getComponent(sp.Skeleton))
            skeletons.push(itemNode.getChildByName("buff").getChildByName(fp.effectType).getComponent(sp.Skeleton))
            // 破除禁锢 / 审死回血：在 HEAL 之外额外播放 hpUp2 动画（HP_UP 节点用的就是 hpUp2 spine 资源）
            if (fp.eventType == "破除禁锢" || (fp.eventType == "审死" && fp.effectType == 'HEAL')) {
                const fieldHpUp = characterNode?.getChildByName("HP_UP")
                if (fieldHpUp) skeletons.push(fieldHpUp.getComponent(sp.Skeleton))
                const buffHpUp = itemNode?.getChildByName("buff")?.getChildByName("HP_UP")
                if (buffHpUp) skeletons.push(buffHpUp.getComponent(sp.Skeleton))
            }
            // 审死/破除禁锢回血附带驱散：隐藏该友方身上的持续负面 buff 动画
            if ((fp.eventType == "审死" || fp.eventType == "破除禁锢") && fp.effectType == 'HEAL') this.hideNegativeBuffs(characterNode, itemNode)
        }
        // 应龙净化：沿用厚土"大地净化"的 HOU_JH 场上驱散动画（施法者在场上，节点按侧共用必带 HOU_JH），含 HOU_JH 音效
        if (isYlPurge) {
            AudioMgr.inst.playOneShot("sound/fight/skill/HOU_JH")
            const houNode = this.getCharacterById(fp.sourceUnitId)?.getChildByName('HOU_JH')
            if (houNode) {
                const sk = houNode.getComponent(sp.Skeleton)
                sk.node.active = true; sk.setAnimation(0, "animation", false)
                sk.setCompleteListener(() => { sk.node.active = false })
                this.actionAwaitQueue.push(this.playAnimToPromise(sk))
            }
        }
        skeletons.forEach(s => {
            s.node.active = true
            if (this.isContinuousEffect(fp.effectType)) s.setAnimation(0, "animation", true);
            else { s.setAnimation(0, "animation", false); this.actionAwaitQueue.push(this.playAnimToPromise(s)) }
        })
        let stunSoundPlayed = false
        for (const key in fp.multiTargetDataMap) {
            const data = fp.multiTargetDataMap[key];
            const itemNode = this.getChracterChangXiaById(key)
            const characterNode = this.getCharacterById(key)
            if (characterNode) {
                if (fp.effectType != 'POISON' && !(fp.eventType == '应龙逆鳞' && fp.effectType == 'HEAL')) {
                    const isHeal = fp.effectType == 'HEAL' || fp.effectType == 'HP_UP' || fp.effectType == 'SPEED_UP'
                    this.showDamageOrHealNumber(key, characterNode, data.value, isHeal)
                }
                this.updateHpOnField(key, data.hpAfter, data.hpBefore)
            }
            await this.showAoeBuffString(fp, key, data, itemNode)
            this.updateHpOffField(key, data.hpAfter, data.hpBefore)
            // 群体伤害日志里带 data.stunned 标记的目标（如青龙吐珠 30% 眩晕）：伤害结算后补挂眩晕动画（场上+场下，与登场眩晕一致循环）
            if (data.stunned) {
                // 眩晕音效：本次群伤只要有目标被晕就播一次 STUN 音（多目标不叠加）
                if (!stunSoundPlayed) { AudioMgr.inst.playOneShot("sound/fight/skill/STUN"); stunSoundPlayed = true }
                if (characterNode) {
                    const sOn = characterNode.getChildByName('STUN')?.getComponent(sp.Skeleton)
                    if (sOn) { sOn.node.active = true; sOn.setAnimation(0, "animation", true) }
                }
                const sOff = itemNode?.getChildByName("buff")?.getChildByName('STUN')?.getComponent(sp.Skeleton)
                if (sOff) { sOff.node.active = true; sOff.setAnimation(0, "animation", true) }
            }
        }
    }
    async showAoeBuffString(fp, key, data, itemNode) {
        const et = fp.effectType
        if (fp.eventType == '应龙逆鳞' && et == 'HEAL') await this.showBuffString(itemNode, true, "净化")
        else if (et == 'STUN') await this.showBuffString(itemNode, false, "眩晕2回合")
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
            // 根据目标是否在场上分流更新血条
            if (fp.targetFieldStatus) {
                this.updateHpOnField(fp.targetUnitId, fp.targetHpAfter, fp.targetHpBefore)
            }
            if (this.effectTypes.indexOf(fp.effectType) !== -1) {
                for (const et of this.effectTypes) {
                    if (et != fp.effectType) { const n = targetItem.getChildByName("buff").getChildByName(et); if (n) n.active = false; }
                }
            }
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
        if (fp.eventType == "撞击") {
            // 撞击：先播放消耗血量音效，再播放普攻音效
            AudioMgr.inst.playOneShot("sound/fight/skill/shihou")
        } else if (fp.eventType == "绝地反击") {
            AudioMgr.inst.playOneShot("sound/fight/skill/JDFJ")
        } else {
            AudioMgr.inst.playOneShot("sound/fight/skill/chuanyun_grial")
        }
        await util.sundry.moveNodeToPosition(charNode, {
            targetPosition: { x: isLeft ? 90 : -90, y: 0 }, moveCurve: true, moveTimeScale: this.timeScale
        })
        AudioMgr.inst.playOneShot("sound/fight/attack/attack");
        // 撞击：命中瞬间在场上源角色身上播放 zhuangji 撞击动画
        if (fp.eventType == "撞击") {
            const zhuangjiNode = charNode?.getChildByName("zhuangji")
            if (zhuangjiNode) {
                const zhuangji = zhuangjiNode.getComponent(sp.Skeleton)
                zhuangjiNode.active = true
                zhuangji.setAnimation(0, "animation", false)
                zhuangji.setCompleteListener(() => { zhuangjiNode.active = false })
            }
        }
        let hut = targetChar.getChildByName("hut").getComponent(sp.Skeleton)
        hut.node.active = true; hut.setAnimation(0, "animation", false)
        this.showDamageOrHealNumber(fp.sourceUnitId, targetChar, -fp.singleTargetValue, false)
        this.updateHpBoth(fp.targetUnitId, fp.targetHpAfter, fp.targetHpBefore)
        // 撞击：更新攻击者自身HP（自损）+ 飘字
        if (fp.eventType == "撞击") {
            this.showDamageOrHealNumber(fp.sourceUnitId, charNode, -fp.sourceSelfValue, false)
            this.updateHpBoth(fp.sourceUnitId, fp.sourceHpAfter, fp.sourceHpBefore)
            // 场下图标也飘字
            const sourceItemNode = this.getChracterChangXiaById(fp.sourceUnitId)
            if (sourceItemNode) {
                this.showBuffString(sourceItemNode, false, "生命 -" + fp.sourceSelfValue)
            }
        }
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
        if (fp.targetFieldStatus && targetChar) {
            // 目标在场上：播放场上角色动画
            let sk = targetChar.getChildByName("MAX_HP_DOWN").getComponent(sp.Skeleton)
            sk.node.active = true; sk.setAnimation(0, "animation", false)
            sk.setCompleteListener(async () => {
                sk.node.active = false
                this.showDamageOrHealNumber(fp.targetUnitId, targetChar, -fp.singleTargetValue, false)
                await this.showBuffString(targetItem, false, fp.extraDesc)
            })
        } else {
            // 目标在场下：播放场下图标动画
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
            // 审死/破除禁锢回血：在 HEAL 之外额外播放 hpUp2 动画（HP_UP 节点用的就是 hpUp2 spine 资源），并隐藏持续负面 buff 动画（附带驱散）
            if ((fp.eventType == "审死" || fp.eventType == "破除禁锢") && fp.effectType == 'HEAL') {
                const fieldHpUp = characterNode?.getChildByName("HP_UP")
                if (fieldHpUp) skeletons.push(fieldHpUp.getComponent(sp.Skeleton))
                const buffHpUp = itemNode?.getChildByName("buff")?.getChildByName("HP_UP")
                if (buffHpUp) skeletons.push(buffHpUp.getComponent(sp.Skeleton))
                this.hideNegativeBuffs(characterNode, itemNode)
            }
        }
        // 持续型效果（如中毒 POISON）循环播放且不能 await（否则 playAnimToPromise 会在 5s 超时后关掉节点）；非持续效果播一遍并入队等待
        skeletons.forEach(s => {
            s.node.active = true
            if (this.isContinuousEffect(fp.effectType)) s.setAnimation(0, "animation", true)
            else s.setAnimation(0, "animation", false)
        });
        for (const key in fp.multiTargetDataMap) {
            const data = fp.multiTargetDataMap[key];
            const itemNode = this.getChracterChangXiaById(key)
            const targetChar = this.getCharacterById(key)
            if (targetChar) {
                if (!(fp.eventType == '应龙逆鳞' && fp.effectType == 'HEAL')) {
                    const isHeal = fp.effectType == 'HEAL' || fp.effectType == 'HP_UP'
                    this.showDamageOrHealNumber(key, targetChar, data.value, isHeal)
                }
                this.updateHpOnField(key, data.hpAfter, data.hpBefore)
            }
            if (fp.effectType == 'MAX_HP_DOWN') await this.showBuffString(itemNode, false, "生命上限 -" + data.value)
            else if (fp.eventType == '应龙逆鳞' && fp.effectType == 'HEAL') await this.showBuffString(itemNode, true, "净化")
            else if (fp.effectType == 'HP_UP' || fp.effectType == 'HEAL') await this.showBuffString(itemNode, true, "+" + data.value)
            else await this.showBuffString(itemNode, false, "-" + data.value)
            this.updateHpOffField(key, data.hpAfter, data.hpBefore)
        }
        if (!this.isContinuousEffect(fp.effectType)) skeletons.forEach(s => this.actionAwaitQueue.push(this.playAnimToPromise(s)));
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
            // buff/debuff类型在场上角色节点统一用 HP_UP/MAX_HP_DOWN 动画节点
            else if (this.isBuffUpEffect(fp.effectType)) effectTypeName = 'HP_UP'
            else if (this.isDebuffDownEffect(fp.effectType)) effectTypeName = 'MAX_HP_DOWN'
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
        const fightSuccessComp = this.node.getChildByName("FightSuccess").getComponent(FightSuccess)
        await fightSuccessComp.read(this.rewards, this.levelUp)
        this.node.getChildByName("FightFailure").active = false
        this.node.getChildByName("FightSuccess").active = true
        this.onBattleResult && this.onBattleResult(true)
        // 胜利 + 自动探索：延迟数秒后复用手动"确定/领取"的干净结算路径(skipFight：等级刷新+主界面音乐+销毁本战斗节点)，无需玩家点击；
        // 由本节点自行销毁，避免上层外部强杀仍活跃的 spine/音频子树导致原生闪退，销毁后再回调上层继续下一关
        if (this.autoExplore) {
            this.scheduleOnce(() => {
                // 崩溃根因(已用带符号 libcocos.so 定位)：原生每帧 MiddlewareManager::render -> SkeletonRenderer::render
                // -> RenderEntity::clearDynamicRenderDrawInfos 命中已释放的 SkeletonRenderer（销毁 spine 密集的战斗节点时，
                // 其 SkeletonRenderer 仍留在 middleware 渲染队列中被 use-after-free）。
                // 将 SkeletonRenderer 从渲染队列 detach 靠的是“禁用组件”而非停用节点，故销毁前先递归禁用子树内所有 sp.Skeleton，
                // 隔一帧（让渲染器完成 detach）再走与手动一致的 skipFight 销毁，销毁后再回调上层继续下一关
                this._detachSpineRecursively(this.node)
                this.scheduleOnce(() => {
                    fightSuccessComp.skipFight()
                    this.onAutoExploreNext && this.onAutoExploreNext()
                }, 0)
            }, 4)
        }
    }

    // 递归禁用子树内所有 sp.Skeleton 组件，触发其 SkeletonRenderer 从 middleware 渲染队列 detach，避免销毁后仍被渲染导致原生 use-after-free 崩溃
    private _detachSpineRecursively(node: Node) {
        const skeletons = node.getComponents(sp.Skeleton)
        for (let i = 0; i < skeletons.length; i++) {
            skeletons[i].enabled = false
        }
        const children = node.children
        for (let i = 0; i < children.length; i++) {
            this._detachSpineRecursively(children[i])
        }
    }
    private fightEnd() {
        this.node.getChildByName("FightFailure").active = true
        this.node.getChildByName("FightSuccess").active = false
        this.onBattleResult && this.onBattleResult(false)
    }
    public async clickFun(c) {
        console.log(c, 999);
        AudioMgr.inst.playOneShot("sound/other/click");
        const characterDetail = this.node.getChildByName("CharacterDetail")
        characterDetail.active = true
        await characterDetail.getComponent(HeroCharacterDetail).setCharacter(c)
    }
}
