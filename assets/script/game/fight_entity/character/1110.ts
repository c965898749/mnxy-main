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


@RegisterCharacter({ id: "1110" })
export class Character extends CharacterMetaState {

    name: string = "三圣母"

    AnimationDir: string = "game/fight_entity/character/1110"


    AvatarPath: string = "game/texture/frames/hero/1110/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1110/spriteFrame"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

    AnimationScale: number = 1

    HpGrowth: number = 45

    AttackGrowth: number = 30

    DefenceGrowth: number = 15

    PierceGrowth: number = 15

    SpeedGrowth: number = 17

    Energy: number = 90

    CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "sacred"

    position = 2

    CharacterQuality: number = 4

    PassiveIntroduceOne: string = `
    
     
    遁让 Lv{skillLv}
    在场上时，受到飞弹、火焰、毒素属性伤害超出生命值上限20%，则有{healVal}%概率与后场未阵亡仙族护法交换并躲过伤害。
       `.replace(/ /ig, "")


    PassiveIntroduceTwo: string = `
   
    破除禁锢 lv{skillLv}
    登场时对我方气血最低的三个护法恢复其生命上限*{healVal}%（不超过70%）的生命值，并有100%的概率移除目标身上的所有负面状态。
       `.replace(/ /ig, "")

    SkillIntroduce: string = `
   
    王母协同 lv{skillLv}
    与王母在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点物理抗性，{healVal3}点速度
    `.replace(/ /ig, "")

    introduce: string = "明月寄相思，桂香伴中秋。"

    skillValue: string = `遁让 破除禁锢 王母协同`

    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv;
        const star = state.star;
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // ========== 二技能：每级+10%，上限40% ==========
        let skill2Percent = skill2 * 10;
        if (skill2Percent > 70) {
            skill2Percent = 70;
        }

        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.min(100, Math.floor(10 * skill1)) + "") + "\n";

        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo
                .replace("{skillLv}", skill2 + "")
                .replace("{healVal}", skill2Percent + "") + "\n";
        } else {
            msg += this.PassiveIntroduceTwo
                .replace("{skillLv}", "未开启")
                .replace("{healVal}", "70") + "\n";
        }

        if (skill3 > 0) {
            msg += this.SkillIntroduce
                .replace("{skillLv}", skill3 + "")
                .replace("{healVal}", Math.floor(350 * skill3) + "")
                .replace("{healVal2}", Math.floor(158 * skill3) + "")
                .replace("{healVal3}", Math.floor(158 * skill3) + "") + "\n";
        } else {
            msg += this.SkillIntroduce
                .replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(350) + "")
                .replace("{healVal2}", Math.floor(158) + "")
                .replace("{healVal3}", Math.floor(158) + "") + "\n";
        }
        return msg;
    }


}