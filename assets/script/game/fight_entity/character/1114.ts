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


@RegisterCharacter({ id: "1114" })
export class Character extends CharacterMetaState {

    name: string = "青龙"

    AnimationDir: string = "game/fight_entity/character/1114"


    AvatarPath: string = "game/texture/frames/hero/1114/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1114/spriteFrame"

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

    青龙吐珠 Lv{skillLv}
    登场时对敌方全体护法造成50%攻击力的物理伤害;有30%的几率使目标获得眩晕。
       `.replace(/ /ig, "")


    PassiveIntroduceTwo: string = `
   
    龙威 lv{skillLv}
    回合结束时青龙吸取我方全体兽族单位（含场上与替补）各自{healVal}%的生命，回复青龙自身等量生命，并为我方全体增加等量魔法护盾（可抵挡火焰/飞弹/毒素伤害并免疫眩晕）。
       `.replace(/ /ig, "")

    SkillIntroduce: string = `
   
    玄武 协同 lv{skillLv}
    与玄武在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度
    `.replace(/ /ig, "")

    introduce: string = "四圣兽之一，代表东方的灵兽。东方属木，其色青，故称青龙，主春生、能兴云布雨。"

    skillValue: string = `青龙吐珠 龙威 玄武协同`

    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv;
        const star = state.star;
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // ========== 二技能：吸血比例 = 技能等级%，封顶 50%（与后端 processLongWei 一致） ==========
        let skill2Percent = Math.min(50, skill2);

       let msg = "";
        msg += this.PassiveIntroduceOne
            .replace("{skillLv}", skill1 + "") + "\n";

        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo
                .replace("{skillLv}", skill2 + "")
                .replace("{healVal}", skill2Percent + "") + "\n";
        } else {
            msg += this.PassiveIntroduceTwo
                .replace("{skillLv}", "未开启")
                .replace("{healVal}", skill2Percent + "") + "\n";
        }

        if (skill3 > 0) {
            msg += this.SkillIntroduce
                .replace("{skillLv}", skill3 + "")
                .replace("{healVal}", Math.floor(352 * skill3) + "")
                .replace("{healVal2}", Math.floor(176 * skill3) + "")
                .replace("{healVal3}", Math.floor(176 * skill3) + "") + "\n";
        } else {
            msg += this.SkillIntroduce
                .replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(352) + "")
                .replace("{healVal2}", Math.floor(176) + "")
                .replace("{healVal3}", Math.floor(176) + "") + "\n";
        }
        return msg;
    }


}