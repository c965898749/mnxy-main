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


@RegisterCharacter({ id: "1007" })
export class Character extends CharacterMetaState {

    name: string = "聂小倩"

    AnimationDir: string = "game/fight_entity/character/1007"


    AvatarPath: string = "game/texture/frames/hero/1007/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1007/spriteFrame"

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
    
    幽灵毒击 lv{skillLv}
    受到攻击时，令场上敌人中毒，每回合损失{healVal}点生命值。 
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    剧毒痛击 lv{skillLv}
    攻击中毒单位时，额外造成{healVal}点伤害。
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    `.replace(/ /ig, "")


    introduce: string = "说到女鬼,大家都不由得心头一颤。 但是提到聂小倩,大家的心情又变得温和起来。"

    skillValue: string = "幽灵毒击  剧毒痛击"

    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(8 * skill1) + "") + "\n";
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "").replace("{healVal}", Math.floor(60 * skill2) + "") + "\n";
        }else {
             msg += this.PassiveIntroduceTwo.replace("{skillLv}",  "未开启").replace("{healVal}", Math.floor(60) + "") + "\n";
        }
        return msg;
    }

}