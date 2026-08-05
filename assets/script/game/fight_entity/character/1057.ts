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


@RegisterCharacter({ id: "1057" })
export class Character extends CharacterMetaState {

    name: string = "月刃夫人"

    AnimationDir: string = "game/fight_entity/character/1057"


    AvatarPath: string = "game/texture/frames/hero/1057/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1057/spriteFrame"

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
    
    新月反击 Lv{skillLv}
    场上，每当受到飞弹伤害时对场上敌方造成{healVal}点物理伤害
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `

    疫病切割 Lv{skillLv}
    登场时，为敌方场上附加疾病疾病令受到的治疗效果降低{healVal}%
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    金钩大王协同 Lv{skillLv}
    与金钩大王在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度
    `.replace(/ /ig, "")

    introduce: string = "遇到行人,它便跳出来与人猜拳,输者就会被它吃掉。此时不必担心,因为它猜拳时总是出剪刀。"

    skillValue: string = `新月反击  疫病切割  金钩大王协同`


    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(155 * skill1) + "") + "\n";
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "")
                .replace("{healVal}", Math.floor(20 * skill2) + "")+ "\n";
        } else {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(20) + "")+ "\n";
        }
        if (skill3 > 0) {
            msg += this.SkillIntroduce.replace("{skillLv}", skill3 + "")
                .replace("{healVal}", Math.floor(705 * skill3) + "")
                .replace("{healVal2}", Math.floor(88 * skill3) + "")
                .replace("{healVal3}", Math.floor(176 * skill3) + "") + "\n";
        } else {
            msg += this.SkillIntroduce.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(705) + "")
                .replace("{healVal2}", Math.floor(88) + "")
                .replace("{healVal3}", Math.floor(176) + "") + "\n";
        }
        return msg;
    }

}