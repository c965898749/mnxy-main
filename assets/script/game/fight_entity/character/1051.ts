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


@RegisterCharacter({ id: "1051" })
export class Character extends CharacterMetaState {

    name: string = "九天玄女"

    AnimationDir: string = "game/fight_entity/character/1051"


    AvatarPath: string = "game/texture/frames/hero/1051/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1051/spriteFrame"

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
    
    觅心神箭 Lv{skillLv}
    每回合对生命值最低的敌方造成{healVal}点飞弹伤害
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `

    穿云剑 Lv{skillLv}
    普通攻击后，对场上敌方身后一个单位造成{healVal}点真实伤害
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    仙将神临 Lv{skillLv}
    与杨戬在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度
    `.replace(/ /ig, "")

    introduce: string = "法力强大的女神，象征正义的美貌神女。"

    skillValue: string = `觅心神箭  穿云剑  仙将神临`


    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(42 * skill1) + "") + "\n";
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "")
                .replace("{healVal}", Math.floor(52 * skill2) + "")+ "\n";
        } else {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(52) + "") + "\n";
        }
        if (skill3 > 0) {
            msg += this.SkillIntroduce.replace("{skillLv}", skill3 + "")
                .replace("{healVal}", Math.floor(781 * skill3) + "")
                .replace("{healVal2}", Math.floor(130 * skill3) + "")
                .replace("{healVal3}", Math.floor(139 * skill3) + "") + "\n";
        } else {
            msg += this.SkillIntroduce.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(781) + "")
                .replace("{healVal2}", Math.floor(130) + "")
                .replace("{healVal3}", Math.floor(139) + "") + "\n";
        }
        return msg;
    }

}