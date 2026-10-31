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


@RegisterCharacter({ id: "1113" })
export class Character extends CharacterMetaState {

    name: string = "朱雀"

    AnimationDir: string = "game/fight_entity/character/1113"


    AvatarPath: string = "game/texture/frames/hero/1113/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1113/spriteFrame"

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
    
     
    焚尽八荒 Lv{skillLv}
    回合开始时消耗自身生命上限25%血量对敌方全体护法造成2倍消耗血量值的火焰伤害;
       `.replace(/ /ig, "")


    PassiveIntroduceTwo: string = `
   
    归元 lv{skillLv}
    死亡时化身为凤凰卵（固魂无法触发技能），持续{healVal}回合复活(最少2回合且复活为归元剩余血量)，期间无法攻击、移动、释放技能，不受任何技能效果影响；
       `.replace(/ /ig, "")

    SkillIntroduce: string = `
   
    白虎 协同 lv{skillLv}
    与白虎在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度
    `.replace(/ /ig, "")

    introduce: string = "我看起来像凤凰，但不是凤凰。"

    skillValue: string = `焚尽八荒 归元 白虎协同`

    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv;
        const star = state.star;
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // ========== 二技能：每级+10%，上限40% ==========
        let skill2Percent = 10 - skill2;
        if (skill2Percent < 2) {
            skill2Percent = 2;
        }

       let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "")+ "\n";

        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo
                .replace("{skillLv}", skill2 + "")
                .replace("{healVal}", skill2Percent + "")
                .replace("{healVal2}", skill2Percent + "") + "\n";
        } else {
            msg += this.PassiveIntroduceTwo
                .replace("{skillLv}", "未开启")
                .replace("{healVal}", "10")    
                .replace("{healVal2}", "10") + "\n";
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