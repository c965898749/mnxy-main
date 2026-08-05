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


@RegisterCharacter({ id: "1052" })
export class Character extends CharacterMetaState {

    name: string = "瑶姬"

    AnimationDir: string = "game/fight_entity/character/1052"


    AvatarPath: string = "game/texture/frames/hero/1052/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1052/spriteFrame"

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
    
    倾盆大雨 Lv{sakillLv}
    我方单位登场时，有50%几率令敌方场上单位眩晕2回合
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `

    续命 Lv{skillLv}
    每回合转移{healVal}生命给场上我方，只能治疗仙界
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    陆压道君协同 Lv{skillLv}
    与陆压道君在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度
    `.replace(/ /ig, "")

    introduce: string = "巫山神女，曾消灭十二恶龙，又帮助大禹治水。"

    skillValue: string = `倾盆大雨  续命  陆压道君协同`


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
                .replace("{healVal}", Math.floor(160 * skill2) + "") + "\n";
        } else {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(160) + "") + "\n";
        }
        if (skill3 > 0) {
            msg += this.SkillIntroduce.replace("{skillLv}", skill3 + "")
                .replace("{healVal}", Math.floor(634 * skill3) + "")
                .replace("{healVal2}", Math.floor(203 * skill3) + "")
                .replace("{healVal3}", Math.floor(139 * skill3) + "") + "\n";
        } else {
            msg += this.SkillIntroduce.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(634) + "")
                .replace("{healVal2}", Math.floor(203) + "")
                .replace("{healVal3}", Math.floor(139) + "") + "\n";
        }
        return msg;
    }

}