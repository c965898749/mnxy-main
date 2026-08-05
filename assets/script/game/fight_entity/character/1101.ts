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


@RegisterCharacter({ id: "1101" })
export class Character extends CharacterMetaState {

    name: string = "王天君"

    AnimationDir: string = "game/fight_entity/character/1101"


    AvatarPath: string = "game/texture/frames/hero/1101/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1101/spriteFrame"

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
    
    红水阵法 Lv{skillLv}
    登场时令敌方全体陷入“红水阵飞弹抗性降低{healVal}点，持续6回合
    `.replace(/ /ig, "")


    PassiveIntroduceTwo: string = `

    斩妖剑 Lv{skillLv}
    攻击妖界单位时，有{healVal}%几率额外追加一次真实伤害，数值相当于敌方当前生命的40%
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    法宝反噬 Lv{skillLv}
    场上触发，每当有单位死亡时，对场上敌方身后单位造成{healVal}点飞弹伤害
    `.replace(/ /ig, "")

    introduce: string = "金鳌十天君之一，也为道教护法神，以“红水阵”阵主闻名。"

    skillValue: string = `红水阵法 斩妖剑 法宝反噬`


    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(39 * skill1) + "") + "\n";
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "")
                .replace("{healVal}", Math.floor(35 * skill2) + "") + "\n";
        } else {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(35) + "")+ "\n";
        }
        if (skill3 > 0) {
            msg += this.SkillIntroduce.replace("{skillLv}", skill3 + "")
                .replace("{healVal}", Math.floor(237 * skill3) + "")+ "\n";
        } else {
            msg += this.SkillIntroduce.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(237) + "")+ "\n";
        }
        return msg;
    }

}