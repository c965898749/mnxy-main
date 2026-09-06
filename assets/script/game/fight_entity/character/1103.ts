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


@RegisterCharacter({ id: "1103" })
export class Character extends CharacterMetaState {

    name: string = "哮天犬"

    AnimationDir: string = "game/fight_entity/character/1103"


    AvatarPath: string = "game/texture/frames/hero/1103/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1103/spriteFrame"

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

    CharacterQuality: number = 4

    PassiveIntroduceOne: string = `
    
    兽妖 Lv{skillLv}
    攻击前有{healVal}%概率提升攻击且使攻击附带疾病效果（本方每有一名兽族，额外增加20%的攻击力，攻击后清除）。
    `.replace(/ /ig, "")


    PassiveIntroduceTwo: string = `

    月之暗面 lv{skillLv}
    场上，哮天犬(兽族护法数*20%)概率将所受伤害的10%转移给已方兽族护法。
    `.replace(/ /ig, "")

    SkillIntroduce: string = `

    玄武 协同 lv{skillLv}
    与玄武在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度
    `.replace(/ /ig, "")

    introduce: string = "吞天地环宇，食日月风雷。"

    skillValue: string = `兽妖 月之暗面 玄武协同`

    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(10 * skill1) + "") + "\n";

        if (skill3 > 0) {
            msg += this.SkillIntroduce.replace("{skillLv}", skill3 + "")
                .replace("{healVal}", Math.floor(352 * skill3) + "")
                .replace("{healVal2}", Math.floor(176 * skill3) + "")
                .replace("{healVal3}", Math.floor(176 * skill3) + "") + "\n";
        } else {
            msg += this.SkillIntroduce.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(352) + "")
                .replace("{healVal2}", Math.floor(176) + "")
                .replace("{healVal3}", Math.floor(176) + "") + "\n";
        }
        return msg;
    }
}