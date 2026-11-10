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


@RegisterCharacter({ id: "15" })
export class Character extends CharacterMetaState {

    name: string = "世界boss应龙"

    AnimationDir: string = "game/fight_entity/character/1091"


    AvatarPath: string = "game/texture/frames/hero/1091/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1091/spriteFrame"

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
    每当护法消耗自身血量时，应龙获得10层印记
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
    回合结束时吸取全场每个单位当前物理结界与魔法护盾的各50%并将自身的印记给后方单位各3层；若应龙结界总数超过自身生命上限，则自身以及前后护法恢复超出差值生命值。
    `.replace(/ /ig, "")

    SkillIntroduce: string = `

    龙族始祖 Lv{skillLv}
    世界boss应龙免疫沉默、换位、眩晕
    `.replace(/ /ig, "")

    introduce: string = "云从龙，风从虎。应龙乃有翼之龙、四象之长，行雨破阵、以血养魂。"

    skillValue: string = `龙血刻印 应龙逆鳞 苍龙吸水 龙族始祖`


    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        const atkRes = 100 * skill2;   // 阈值10/30 物理减伤数值
        const poisonVal = 100 * skill2;   // 阈值20 对位中毒量
        const missileVal = 100 * skill2;  // 阈值30 对位飞弹基础伤害
        const atk = 100 * skill2;     // 阈值40 狂暴攻击加成
        const speed = 100 * skill2;   // 阈值40 狂暴速度加成
        // 苍龙吸水：世界boss应龙固定吸取每单位当前盾值各50%，无按等级计算的吸取量（应龙·祖魂1116仍为1000*skill3点）

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
            .replace("{skillLv}", skill3 + "") + "\n";

        // 龙族始祖（世界boss应龙）：已移除1号位属性加成，仅保留免疫沉默/换位/眩晕（后端 isYinglongBoss 守卫），无动态数值
        msg += this.SkillIntroduce.replace("{skillLv}", skill4 > 0 ? skill4 + "" : "未开启") + "\n";

        return msg;
    }

}
