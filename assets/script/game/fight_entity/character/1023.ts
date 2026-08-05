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


@RegisterCharacter({ id: "1023" })
export class Character extends CharacterMetaState {

    name: string = "句芒"

    AnimationDir: string = "game/fight_entity/character/1023"


    AvatarPath: string = "game/texture/frames/hero/1023/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1023/spriteFrame"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

    AnimationScale: number = 1

    HpGrowth: number = 45

    AttackGrowth: number = 30

    DefenceGrowth: number = 15

    PierceGrowth: number = 15

    SpeedGrowth: number = 17

    Energy: number = 90

    CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "dark"

    position = 1
    CharacterQuality: number = 4

    PassiveIntroduceOne: string = `
    
    残酷收割 Lv{skillLv}
    每当有生物死亡时，回复自身{healVal}%最大生命
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    嗜血 Lv{skillLv}
    受到普通攻击时，为自身添加嗜血效果，提高攻击{healVal}点，速度{healVal1}点
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    大圣协同 Lv{skillLv}
    与齐天大圣在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度
    `.replace(/ /ig, "")


    introduce: string = "操纵自然力量的巫神，可以控制风雨雷电能与树木交谈。"

    skillValue: string = "残酷收割  嗜血  大圣协同"
  
    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(6* skill1) + "") + "\n";
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "")
                .replace("{healVal}", Math.floor(118 * skill2) + "")
                .replace("{healVal1}", Math.floor(20 * skill2) + "") + "\n";
        } else {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(118) + "")
                .replace("{healVal1}", Math.floor(20) + "") + "\n";
        }
        if (skill3 > 0) {
            msg += this.SkillIntroduce.replace("{skillLv}", skill3 + "")
                .replace("{healVal}", Math.floor(211 * skill3) + "")
                .replace("{healVal2}", Math.floor(105 * skill3) + "")
                .replace("{healVal3}", Math.floor(158 * skill3) + "") + "\n";
        } else {
            msg += this.SkillIntroduce.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(211) + "")
                .replace("{healVal2}", Math.floor(105) + "")
                .replace("{healVal3}", Math.floor(158) + "") + "\n";
        }
        return msg;
    }
}