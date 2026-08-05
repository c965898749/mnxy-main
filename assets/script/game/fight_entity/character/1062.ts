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


@RegisterCharacter({ id: "1062" })
export class Character extends CharacterMetaState {

    name: string = "蛟魔王"

    AnimationDir: string = "game/fight_entity/character/1062"


    AvatarPath: string = "game/texture/frames/hero/1062/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1062/spriteFrame"

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
    
    剧毒痛击 Lv{skillLv}
    攻击中毒单位额外造成{healVal}伤害
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `

    防火阵法 Lv{skillLv}
    光环-我方全体增加火焰减伤50%
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    大圣鸿威 Lv{skillLv}
    与鹏魔王在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度
    `.replace(/ /ig, "")

    introduce: string = "孙悟空的结拜七兄弟之一，覆海大圣!，游泳健将，喜欢生鱼片，蚝仔和虾兵们。"

    skillValue: string = `剧毒痛击  防火阵法 大圣鸿威`


    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(80 * skill1) + "") + "\n";
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "") + "\n";
        } else {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", "未开启") + "\n";
        }
        if (skill3 > 0) {
            msg += this.SkillIntroduce.replace("{skillLv}", skill3 + "")
                .replace("{healVal}", Math.floor(564 * skill3) + "")
                .replace("{healVal2}", Math.floor(45 * skill3) + "")
                .replace("{healVal3}", Math.floor(221 * skill3) + "") + "\n";
        } else {
            msg += this.SkillIntroduce.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(564) + "")
                .replace("{healVal2}", Math.floor(45) + "")
                .replace("{healVal3}", Math.floor(221) + "") + "\n";
        }
        return msg;
    }

}