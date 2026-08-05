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


@RegisterCharacter({ id: "1064" })
export class Character extends CharacterMetaState {

    name: string = "天蓬元帅"

    AnimationDir: string = "game/fight_entity/character/1064"


    AvatarPath: string = "game/texture/frames/hero/1064/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1064/spriteFrame"

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
    
    满目桃花 Lv{skillLv}
    场上遇到女性敌人时，自身攻击降低50%，速度增加50%，持续6回合
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    醉钉耙 Lv{skillLv}
    场上，攻击后有{healVal}%几率对随机敌方造成真实伤害，数值等同于目标力量的50%
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    大师兄说的对 Lv{skillLv}
    与齐天大圣在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度
    `.replace(/ /ig, "")

    introduce: string = "我既不是野猪，也不是老母猪，我本是天河里的天蓬元帅。"

    skillValue: string = `满目桃花  醉钉耙  大师兄说的对`


    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "") + "\n";
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "")
                .replace("{healVal}", Math.floor(10 * skill2) + "") + "\n";
        } else {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(10) + "")+ "\n";
        }
        if (skill3 > 0) {
            msg += this.SkillIntroduce.replace("{skillLv}", skill3 + "")
                .replace("{healVal}", Math.floor(930 * skill3) + "")
                .replace("{healVal2}", Math.floor(170 * skill3) + "")
                .replace("{healVal3}", Math.floor(170 * skill3) + "") + "\n";
        } else {
            msg += this.SkillIntroduce.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(930) + "")
                .replace("{healVal2}", Math.floor(170) + "")
                .replace("{healVal3}", Math.floor(170) + "") + "\n";
        }
        return msg;
    }
}