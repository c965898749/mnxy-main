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


@RegisterCharacter({ id: "1068" })
export class Character extends CharacterMetaState {

    name: string = "金霞童子"

    AnimationDir: string = "game/fight_entity/character/1068"


    AvatarPath: string = "game/texture/frames/hero/1068/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1068/spriteFrame"

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
    
    灵力飞弹 Lv{skillLv}
    每当新单位入场时，对场上敌 人造成{healVal}点飞弹伤害。
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    白鹤协同 Lv{skillLv}
    与白鹤童子在同 一队伍时，增加自身{healVal}点飞弹伤害。
    `.replace(/ /ig, "")

    introduce: string = "太乙真人的近侍童子，哪吒的师弟。"

    skillValue: string = `灵力飞弹  白鹤协同`

    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(35 * skill1) + "") + "\n";

        if (skill3 > 0) {
            msg += this.SkillIntroduce.replace("{skillLv}", skill3 + "")
                .replace("{healVal}", Math.floor(18 * skill3) + "")+ "\n";
        } else {
            msg += this.SkillIntroduce.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(18) + "")+ "\n";
        }
        return msg;
    }

}