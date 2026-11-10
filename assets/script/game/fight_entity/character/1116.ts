import { math } from "cc";
import { GetCharacterCoordinatePosition } from "../../../prefab/HolCharacter";
import { FightMap } from "../../../scenes/Fight/Canvas/FightMap";
import { util } from "../../../util/util";
import { ActionState } from "../../fight/ActionState";
import { BasicState } from "../../fight/BasicState";
import { RegisterCharacter } from "../../fight/character/CharacterEnum";
import { CharacterMetaState } from "../../fight/character/CharacterMetaState";
import { CharacterState } from "../../fight/character/CharacterState";
import { BuffState } from "../../fight/buff/BuffState";
import { CardSkillLevelUtil } from "../../../util/CardSkillLevelUtil";


@RegisterCharacter({ id: "1116" })
export class Character extends CharacterMetaState {

    // 命名注意：不可叫“应龙”——老卡 1091 已占用此名，且后端 BattleManager 按角色名 switch 触发老应龙的“龙息”（case "应龙"），
    // 同名会误挂龙息逻辑并让玩家在背包/图鉴/战场无法区分；card 表 1116 行的 name 须与此一致
    name: string = "应龙·祖魂"

    // 复用应龙美术资源（与世界boss应龙 15.ts 同源）
    AnimationDir: string = "game/fight_entity/character/1116"


    AvatarPath: string = "game/texture/frames/hero/1116/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1116/spriteFrame"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

    AnimationScale: number = 1

    HpGrowth: number = 45

    AttackGrowth: number = 30

    DefenceGrowth: number = 15

    PierceGrowth: number = 15

    SpeedGrowth: number = 17

    Energy: number = 90

    CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "nature"

    position = 2

    CharacterQuality: number = 5

    PassiveIntroduceOne: string = `

    龙血刻印 Lv{skillLv}
    每当护法消耗自身血量时，应龙获得5层印记
    `.replace(/ /ig, "")


    PassiveIntroduceTwo: string = `

    应龙逆鳞 Lv{skillLv}
    印记1-免疫致命：消耗1层印记，挡下超过10%生命上限的致死伤害；
    印记5-血限不降：生命上限不再下降；
    印记10-增加物抗：物理增加+{atkRes}；
    印记15-净化负面：每回合开始驱散自身负面；
    印记20-敌方中毒：消耗1层对敌方随机护法中毒{poison}点；
    印记25-物抗降低：敌方对位物理减少-{atkRes}；
    印记30-应龙飞弹：消耗1层对敌方随机护法造成{missile}点基础飞弹伤害；
    印记35-消耗印记复活：消耗累积30印记给已阵亡单位加还魂效果（还魂2回合满血复活且固魂单位不能复活）;
    印记40-狂暴：每回合开始消耗1层印记将自身生命上限-10%血量转化成自身攻击+{atk}，速度+{speed};
    印记100-死亡之焰：消耗全部印记对敌方全体造成当前血量限100%真实伤害;
    `.replace(/ /ig, "")


    PassiveIntroduceThree: string = `
    
    苍龙吸水 Lv{skillLv}
    回合结束时吸取全场每个单位{drain}点物理结界与魔法护盾并将自身的印记给后方单位各3层；若应龙结界总数超过自身生命上限，则自身以及前后护法恢复超出差值生命值。
    `.replace(/ /ig, "")

    SkillIntroduce: string = `

    龙族始祖 Lv{skillLv}
    位居1号位置时，增加自身{healVal}点生命上限，{healVal1}点攻击，{healVal2}点速度
    `.replace(/ /ig, "")

    introduce: string = "云从龙，风从虎。应龙乃有翼之龙、四象之长，行雨破阵、以血养魂。昔日世界boss之威，今以祖魂之形为降服者所用。"

    skillValue: string = `龙血刻印 应龙逆鳞 苍龙吸水 龙族始祖`


    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 玩家版应龙：机制与世界boss应龙同源（后端 isYinglong 已识别 1116），
        // 强度由玩家自身 lv/star 推导的技能等级 + card 表 1116 行 coll 三值控制 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        const atkRes = 100 * skill2;   // 阈值10/30 物理减伤数值（与后端 processYinglongForUnit 一致）
        const poisonVal = 100 * skill2;   // 阈值20 对位中毒量
        const missileVal = 100 * skill2;  // 阈值30 对位飞弹基础伤害
        const atk = 100 * skill2;     // 阈值40 狂暴攻击加成
        const speed = 100 * skill2;   // 阈值40 狂暴速度加成
        const drain = 1000 * skill3;   // 苍龙吸水 每单位吸取量

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "") + "\n";

        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo
                .replace("{skillLv}", skill2 + "")
                .replace(/\{atkRes\}/g, atkRes + "")
                .replace(/\{poison\}/g, poisonVal + "")
                .replace(/\{missile\}/g, missileVal + "")
                .replace(/\{atk\}/g, atk + "")
                .replace(/\{speed\}/g, speed + "") + "\n";
        } else {
            msg += this.PassiveIntroduceTwo
                .replace("{skillLv}", "未开启")
                .replace(/\{atkRes\}/g, 100 + "")
                .replace(/\{poison\}/g, 100 + "")
                .replace(/\{missile\}/g, 100 + "")
                .replace(/\{atk\}/g, 100 + "")
                .replace(/\{speed\}/g, 100 + "") + "\n";
        }

        msg += this.PassiveIntroduceThree
            .replace("{skillLv}", skill3 + "")
            .replace(/\{drain\}/g, drain + "") + "\n";

        // 龙族始祖：玩家版协同基数取 boss 的一半（176/88/88），须与 card 表 1116 行 coll_hp/coll_attack/coll_speed 一致
        if (skill4 > 0) {
            msg += this.SkillIntroduce.replace("{skillLv}", skill4 + "")
                .replace("{healVal}", Math.floor(176 * skill4) + "")
                .replace("{healVal1}", Math.floor(88 * skill4) + "")
                .replace("{healVal2}", Math.floor(88 * skill4) + "") + "\n";
        } else {
            msg += this.SkillIntroduce.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(176) + "")
                .replace("{healVal1}", Math.floor(88) + "")
                .replace("{healVal2}", Math.floor(88) + "") + "\n";
        }

        return msg;
    }

}
