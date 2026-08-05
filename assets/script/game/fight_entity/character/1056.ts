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


@RegisterCharacter({ id: "1056" })
export class Character extends CharacterMetaState {

    name: string = "狮驼王"

    AnimationDir: string = "game/fight_entity/character/1056"


    AvatarPath: string = "game/texture/frames/hero/1056/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1056/spriteFrame"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

  AnimationScale: number = 1

    HpGrowth: number = 45

    AttackGrowth: number = 30

    DefenceGrowth: number = 15

    PierceGrowth: number = 15

    SpeedGrowth: number = 17

    Energy: number = 90

    CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "dark"

   position = 2

    CharacterQuality: number = 4

    PassiveIntroduceOne: string = `
    
    毒气阻碍  Lv{skillLv}
    攻击后有机率对敌方身后中毒{healVal}
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `

    疾病打击 Lv{skillLv}
    普攻后50%几率降低{healVal}%治疗
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    大圣鸿威协同 Lv{skillLv}
    与禺绒王在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度
    `.replace(/ /ig, "")

    introduce: string = "孙悟空的结拜七兄弟之一，移山大圣，西域来的狮王，力大无穷却性格温顺，参与过愚公组织的山体改造工程。"

    skillValue: string = `毒气阻碍  疾病打击  大圣鸿威`


    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(142 * skill1) + "") + "\n";
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "")
                .replace("{healVal}", Math.floor(10 * skill2) + "")+ "\n";
        } else {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(10) + "") + "\n";
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