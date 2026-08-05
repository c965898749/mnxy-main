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


@RegisterCharacter({ id: "1041" })
export class Character extends CharacterMetaState {

    name: string = "玄甲神"

    AnimationDir: string = "game/fight_entity/character/1041"


    AvatarPath: string = "game/texture/frames/hero/1041/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1041/spriteFrame"

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
    
    临别赠言 lv{skillLv}
    死亡 后增加后方单位{healVal}点生 命上限。
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    巨灵神协同 lv{skillLv}
    与巨灵神在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度 。
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    `.replace(/ /ig, "")

    introduce: string = "身着玄铁装甲的天将，力大无穷"

    skillValue: string = "临别赠言  巨灵神协同"

    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(108 * skill1) + "") + "\n";

        if (skill3 > 0) {
            msg += this.SkillIntroduce.replace("{skillLv}", skill3 + "")
                .replace("{healVal}", Math.floor(106 * skill3) + "")
                .replace("{healVal2}", Math.floor(106 * skill3) + "")
                .replace("{healVal3}", Math.floor(53 * skill3) + "") + "\n";
        } else {
            msg += this.SkillIntroduce.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(106) + "")
                .replace("{healVal2}", Math.floor(106) + "")
                .replace("{healVal3}", Math.floor(53) + "") + "\n";
        }
        return msg;
    }

}