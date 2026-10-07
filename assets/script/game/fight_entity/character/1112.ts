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


@RegisterCharacter({ id: "1112" })
export class Character extends CharacterMetaState {

    name: string = "地藏菩萨"

    AnimationDir: string = "game/fight_entity/character/1112"


    AvatarPath: string = "game/texture/frames/hero/1112/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1112/spriteFrame"

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
    
     
    不屈意志 Lv{skillLv}
    回合开始时有{healVal}%概率消耗自身生命上限25%血量复活该单位；复活单位恢复100%最大生命值（最高70%且不能复活固魂单位）
       `.replace(/ /ig, "")


    PassiveIntroduceTwo: string = `
   
    审死 lv{skillLv}
    在偶数回合结束时击杀一名本方护法(优先妖族护法)。本方所有护法回复生命并驱散所有负面效果，其值等同于亡者{healVal}%扣除生命。对敌方所有护法造成等同于亡者攻击力{healVal2}%的物理伤害（最高不超过50%）。
       `.replace(/ /ig, "")

    SkillIntroduce: string = `
   
    观音姐姐协同 lv{skillLv}
    与观音姐姐在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度
    `.replace(/ /ig, "")

    introduce: string = "地狱不空，誓不成佛；众生度尽，方证菩提。"

    skillValue: string = `不屈意志 审死 观音姐姐协同`

    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv;
        const star = state.star;
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // ========== 二技能：每级+10%，上限40% ==========
        let skill2Percent = skill2 * 5;
        if (skill2Percent > 50) {
            skill2Percent = 50;
        }

        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.min(70, Math.floor(10 * skill1)) + "") + "\n";

        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo
                .replace("{skillLv}", skill2 + "")
                .replace("{healVal}", skill2Percent + "")
                .replace("{healVal2}", skill2Percent + "") + "\n";
        } else {
            msg += this.PassiveIntroduceTwo
                .replace("{skillLv}", "未开启")
                .replace("{healVal}", "50")    
                .replace("{healVal2}", "50") + "\n";
        }

        if (skill3 > 0) {
            msg += this.SkillIntroduce
                .replace("{skillLv}", skill3 + "")
                .replace("{healVal}", Math.floor(211 * skill3) + "")
                .replace("{healVal2}", Math.floor(158 * skill3) + "")
                .replace("{healVal3}", Math.floor(158 * skill3) + "") + "\n";
        } else {
            msg += this.SkillIntroduce
                .replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(211) + "")
                .replace("{healVal2}", Math.floor(158) + "")
                .replace("{healVal3}", Math.floor(158) + "") + "\n";
        }
        return msg;
    }


}