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


@RegisterCharacter({ id: "1025" })
export class Character extends CharacterMetaState {

    name: string = "大鹏金翅雕"

    AnimationDir: string = "game/fight_entity/character/1025"


    AvatarPath: string = "game/texture/frames/hero/1025/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1025/spriteFrame"

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
    
    鹏程万里  Lv{skillLv}
    登场时提高我方全体妖界生物的速度{healVal}点
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    屠杀  Lv{skillLv}
    场上，攻击前有75%几率对目标造成{healVal}点火焰伤害，如果目标是神将，则有几率一击必杀
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    将臣协同 Lv{skillLv}
    与将臣在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度
    `.replace(/ /ig, "")


    introduce: string = "孔雀大明王的兄弟，如来佛祖的舅舅，狮驼国三王，最强的后天妖怪。"

    skillValue: string = "鹏程万里  屠杀  将臣协同"

    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(130 * skill1) + "") + "\n";
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "")
                .replace("{healVal}", Math.floor(236 * skill2) + "")+ "\n";
        } else {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(236) + "")+ "\n";
        }
        if (skill3 > 0) {
            msg += this.SkillIntroduce.replace("{skillLv}", skill3 + "")
                .replace("{healVal}", Math.floor(789 * skill3) + "")
                .replace("{healVal2}", Math.floor(197 * skill3) + "")
                .replace("{healVal3}", Math.floor(49 * skill3) + "") + "\n";
        } else {
            msg += this.SkillIntroduce.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(789) + "")
                .replace("{healVal2}", Math.floor(197) + "")
                .replace("{healVal3}", Math.floor(49) + "") + "\n";
        }
        return msg;
    }

}