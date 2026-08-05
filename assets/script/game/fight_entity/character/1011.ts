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


@RegisterCharacter({ id: "1011" })
export class Character extends CharacterMetaState {

    name: string = "玄冥"

    AnimationDir: string = "game/fight_entity/character/1011"


    AvatarPath: string = "game/texture/frames/hero/1011/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1011/spriteFrame"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

  AnimationScale: number = 1

    HpGrowth: number = 45

    AttackGrowth: number = 30

    DefenceGrowth: number = 15

    PierceGrowth: number = 15

    SpeedGrowth: number = 17

    Energy: number = 90

    CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "dark"

     position = 0
    CharacterQuality: number = 4

    PassiveIntroduceOne: string = `
    
    毒入骨髓 Lv{skillLv}
    场下，每回合令随机敌方中毒每回损失{healVal}点生命
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    疫病侵染 Lv{skillLv}
    场下，我方单位登场时为场上敌人收到疾病效果，疾病令其受到治疗减少{healVal}%，最多叠加1层
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    大鹏金翅雕协同 Lv{skillLv}
    与大鹏金翅雕在同一队伍时增加自身{healVal}点生命上限，{healVal2}点毒素伤害，{healVal3}点速度
    `.replace(/ /ig, "")


    introduce: string = "四时、四方之神之一的冬天之神——北方玄冥。"

    skillValue: string = "毒入骨髓  疫病侵染  大鹏金翅雕协同"

    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(16 * skill1) + "") + "\n";
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "").replace("{healVal}", Math.floor(8 * skill2) + "") + "\n";
        }else {
             msg += this.PassiveIntroduceTwo.replace("{skillLv}",  "未开启").replace("{healVal}", Math.floor(8) + "") + "\n";
        }
        if (skill3 > 0) {
            msg += this.SkillIntroduce.replace("{skillLv}", skill3 + "")
            .replace("{healVal}", Math.floor(725 * skill3) + "")
            .replace("{healVal2}", Math.floor(95 * skill3) + "")
            .replace("{healVal3}", Math.floor(253 * skill3) + "") + "\n";
        }else {
             msg += this.SkillIntroduce.replace("{skillLv}",  "未开启")
            .replace("{healVal}", Math.floor(725) + "")
            .replace("{healVal2}", Math.floor(95) + "")
            .replace("{healVal3}", Math.floor(253) + "") + "\n";
        }
        return msg;
    }

}