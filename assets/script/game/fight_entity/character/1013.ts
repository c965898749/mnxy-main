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


@RegisterCharacter({ id: "1013" })
export class Character extends CharacterMetaState {

    name: string = "烛龙"

    AnimationDir: string = "game/fight_entity/character/1013"


    AvatarPath: string = "game/texture/frames/hero/1013/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1013/spriteFrame"

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
    
    烛火燎原 Lv{skillLv}
    场上，受到任意伤害时对全体敌方造成{healVal}点火焰伤害
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    致命衰竭 Lv{skillLv}
    场上，有单位登场时为目标添加衰弱状态，攻击减少{healVal}%，持续99回合
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    句芒协同 Lv{skillLv}
    与句芒在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点火焰伤害，{healVal3}点速度
    `.replace(/ /ig, "")


    introduce: string = "烛龙，又名烛九阴，古代神话中的神秘生物，它开眼为昼、闭眼为夜，拥有掌控时间的能力。"

    skillValue: string = "烛火燎原  致命衰竭  句芒协同"

   
    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(54 * skill1) + "") + "\n";
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "").replace("{healVal}", Math.floor(10 * skill2) + "") + "\n";
        }else {
             msg += this.PassiveIntroduceTwo.replace("{skillLv}",  "未开启").replace("{healVal}", Math.floor(10) + "") + "\n";
        }
        if (skill3 > 0) {
            msg += this.SkillIntroduce.replace("{skillLv}", skill3 + "")
            .replace("{healVal}", Math.floor(211 * skill3) + "")
            .replace("{healVal2}", Math.floor(110 * skill3) + "")
            .replace("{healVal3}", Math.floor(221 * skill3) + "") + "\n";
        }else {
             msg += this.SkillIntroduce.replace("{skillLv}",  "未开启")
            .replace("{healVal}", Math.floor(211) + "")
            .replace("{healVal2}", Math.floor(110) + "")
            .replace("{healVal3}", Math.floor(221) + "") + "\n";
        }
        return msg;
    }
}