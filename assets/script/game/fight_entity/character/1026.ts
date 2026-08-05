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


@RegisterCharacter({ id: "1026" })
export class Character extends CharacterMetaState {

    name: string = "萌年兽"

    AnimationDir: string = "game/fight_entity/character/1026"


    AvatarPath: string = "game/texture/frames/hero/1026/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1026/spriteFrame"

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
    
    爆竹送给你 Lv{skillLv}
    场上，受到任意攻击后有100%几率对全体敌方造成{healVal}~{healVal1}点随机火焰伤害
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    幸运年糕  Lv{skillLv}
    每回合增加自身{healVal}点生命点，{healVal1}点火焰伤害，最多香加5层
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    不动如山 Lv{skillLv}
    位居2号位置时，增加自身{healVal}点生命上限，{healVal1}点攻击，{healVal2}点速度
    `.replace(/ /ig, "")


    introduce: string = "成年的年兽，长得一脸萌相。最大的兴趣爱好是放鞭炮吓唬天真烂漫的村民。"

    skillValue: string = "爆竹送给你  幸运年糕  不动如山"
    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(35 * skill1) + "").replace("{healVal1}", Math.floor(140 * skill1) + "")  + "\n";
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "")
                .replace("{healVal}", Math.floor(76 * skill2) + "")
                .replace("{healVal1}", Math.floor(15 * skill2) + "") + "\n";
        } else {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(76) + "")
                .replace("{healVal1}", Math.floor(15) + "") + "\n";
        }
        if (skill3 > 0) {
            msg += this.SkillIntroduce.replace("{skillLv}", skill3 + "")
                .replace("{healVal}", Math.floor(243 * skill3) + "")
                .replace("{healVal2}", Math.floor(24 * skill3) + "")
                .replace("{healVal3}", Math.floor(12 * skill3) + "") + "\n";
        } else {
            msg += this.SkillIntroduce.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(243) + "")
                .replace("{healVal2}", Math.floor(24) + "")
                .replace("{healVal3}", Math.floor(12) + "") + "\n";
        }
        return msg;
    }

}