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


@RegisterCharacter({ id: "1055" })
export class Character extends CharacterMetaState {

    name: string = "圣灵天将"

    AnimationDir: string = "game/fight_entity/character/1055"


    AvatarPath: string = "game/texture/frames/hero/1055/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1055/spriteFrame"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

  AnimationScale: number = 1

    HpGrowth: number = 45

    AttackGrowth: number = 30

    DefenceGrowth: number = 15

    PierceGrowth: number = 15

    SpeedGrowth: number = 17

    Energy: number = 90

    CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "sacred"

   position = 1

    CharacterQuality: number = 4

    PassiveIntroduceOne: string = `
    
    圣灵法阵 Lv{skillLv}
    位居1号位置时，每次攻击前布置圣灵法阵，令敌我双方生命上限不会降低持续2同会
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `

    圣灵斩 Lv{skillLv}
    攻击武圣单位时，额外造成{healVal}点真实伤害
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    瑶池仙女协同 Lv{skillLv}
    与瑶池仙女在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度
    `.replace(/ /ig, "")

    introduce: string = "威风凛凛的天庭大将，是众多仙女仰慕的对象。"

    skillValue: string = `圣灵法阵  圣灵斩  瑶池仙女协同`


    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "") + "\n";
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "")
                .replace("{healVal}", Math.floor(150 * skill2) + "")+ "\n";
        } else {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(150) + "")+ "\n";
        }
        if (skill3 > 0) {
            msg += this.SkillIntroduce.replace("{skillLv}", skill3 + "")
                .replace("{healVal}", Math.floor(423 * skill3) + "")
                .replace("{healVal2}", Math.floor(141 * skill3) + "")
                .replace("{healVal3}", Math.floor(151 * skill3) + "") + "\n";
        } else {
            msg += this.SkillIntroduce.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(423) + "")
                .replace("{healVal2}", Math.floor(141) + "")
                .replace("{healVal3}", Math.floor(151) + "") + "\n";
        }
        return msg;
    }

}