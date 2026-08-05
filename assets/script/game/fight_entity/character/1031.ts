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


@RegisterCharacter({ id: "1031" })
export class Character extends CharacterMetaState {

    name: string = "禺绒王"

    AnimationDir: string = "game/fight_entity/character/1031"


    AvatarPath: string = "game/texture/frames/hero/1031/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1031/spriteFrame"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

  AnimationScale: number = 1

    HpGrowth: number = 45

    AttackGrowth: number = 30

    DefenceGrowth: number = 15

    PierceGrowth: number = 15

    SpeedGrowth: number = 17

    Energy: number = 90

    CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "dark"

   position=2

    CharacterQuality: number = 4

    PassiveIntroduceOne: string = `
    
    剧毒加深 Lv{skillLv}
    攻击中毒敌人时，为其增加1层毒素效果，每回合损失{healVal}点生命
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    妖力聚集 Lv{skillLv}
    每次攻击后增加自身后方单位的攻击{healVal}点，最多叠加5层
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    大圣鸿威 Lv{skillLv}
    与蛟魔王在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击
    `.replace(/ /ig, "")

    introduce: string = "孙悟空的结拜七兄弟之一，驱神大圣，国宝金丝猴精。"

    skillValue: string = "剧毒加深  妖力聚集  大圣鸿威"

    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(35 * skill1) + "") + "\n";
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "")
                .replace("{healVal}", Math.floor(42 * skill2) + "")+ "\n";
        } else {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(42) + "")+ "\n";
        }
        if (skill3 > 0) {
            msg += this.SkillIntroduce.replace("{skillLv}", skill3 + "")
                .replace("{healVal}", Math.floor(705 * skill3) + "")
                .replace("{healVal2}", Math.floor(141 * skill3) + "") + "\n";
        } else {
            msg += this.SkillIntroduce.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(705) + "")
                .replace("{healVal2}", Math.floor(141) + "")+ "\n";
        }
        return msg;
    }
}