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


@RegisterCharacter({ id: "1107" })
export class Character extends CharacterMetaState {

    name: string = "嫦娥"

    AnimationDir: string = "game/fight_entity/character/1107"


    AvatarPath: string = "game/texture/frames/hero/1107/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1107/spriteFrame"

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
    
     
    桂影栖身 Lv{skillLv}
    嫦娥在场下时，每回合增加{healVal}%闪避，最多叠加30%
       `.replace(/ /ig, "")


    PassiveIntroduceTwo: string = `
   
    月满重生 lv{skillLv}
    我方有单位阵亡时，消耗自身生命上限{healVal}%血量复活该单位；复活单位恢复50%最大生命值（最低消耗血量40%且不能复活固魂单位）
       `.replace(/ /ig, "")

    SkillIntroduce: string = `
   
    王母协同 lv{skillLv}
    与王母在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度
    `.replace(/ /ig, "")

    introduce: string = "明月寄相思，桂香伴中秋。"

    skillValue: string = `桂影栖身 月满重生 王母协同`

public getSkillDesc(state: CharacterState): string {
    const lv = state.lv;
    const star = state.star;
    const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

    // ========== 二技能：每级+10%，上限40% ==========
    let skill2Percent = skill2 * 10;
    if (skill2Percent > 40) {
        skill2Percent = 40;
    }

    let msg = "";
    msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", skill1 + "") + "\n";

    if (skill2 > 0) {
        msg += this.PassiveIntroduceTwo
            .replace("{skillLv}", skill2 + "")
            .replace("{healVal}", skill2Percent + "") + "\n";
    } else {
        msg += this.PassiveIntroduceTwo
            .replace("{skillLv}", "未开启")
            .replace("{healVal}", "100") + "\n";
    }

    if (skill3 > 0) {
        msg += this.SkillIntroduce
            .replace("{skillLv}", skill3 + "")
            .replace("{healVal}", Math.floor(302 * skill3) + "")
            .replace("{healVal2}", Math.floor(158 * skill3) + "")
            .replace("{healVal3}", Math.floor(211 * skill3) + "") + "\n";
    } else {
        msg += this.SkillIntroduce
            .replace("{skillLv}", "未开启")
            .replace("{healVal}", Math.floor(302) + "")
            .replace("{healVal2}", Math.floor(158) + "")
            .replace("{healVal3}", Math.floor(211) + "") + "\n";
    }
    return msg;
}


}