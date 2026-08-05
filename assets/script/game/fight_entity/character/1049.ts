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


@RegisterCharacter({ id: "1049" })
export class Character extends CharacterMetaState {

    name: string = "东岳大帝"

    AnimationDir: string = "game/fight_entity/character/1049"


    AvatarPath: string = "game/texture/frames/hero/1049/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1049/spriteFrame"

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
    
    大帝威慑 Lv{skillLv}
    普通攻击降低敌方的攻击{healVal}点，最多叠加3层
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `

    圣灵瀑 Lv{skillLv}
    场上，每当受到治疗时，对场上敌方造成{healVal}点飞弹伤害
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    大帝协同 Lv{skillLv}
    与南岳大帝在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度
    `.replace(/ /ig, "")

    introduce: string = "东岳大帝是泰山的山神，尊称东岳泰山天齐大生仁圣大帝。"

    skillValue: string = `大帝威慑  圣灵瀑  大帝协同`


    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(20 * skill1) + "") + "\n";
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "")
                .replace("{healVal}", Math.floor(146 * skill2) + "") + "\n";
        } else {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(146) + "") + "\n";
        }
        if (skill3 > 0) {
            msg += this.SkillIntroduce.replace("{skillLv}", skill3 + "")
                .replace("{healVal}", Math.floor(423 * skill3) + "")
                .replace("{healVal2}", Math.floor(141 * skill3) + "")
                .replace("{healVal3}", Math.floor(150 * skill3) + "") + "\n";
        } else {
            msg += this.SkillIntroduce.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(423) + "")
                .replace("{healVal2}", Math.floor(141) + "")
                .replace("{healVal3}", Math.floor(150) + "") + "\n";
        }
        return msg;
    }

}