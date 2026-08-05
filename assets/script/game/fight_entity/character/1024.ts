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


@RegisterCharacter({ id: "1024" })
export class Character extends CharacterMetaState {

    name: string = "将臣"

    AnimationDir: string = "game/fight_entity/character/1024"


    AvatarPath: string = "game/texture/frames/hero/1024/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1024/spriteFrame"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

    AnimationScale: number = 1

    HpGrowth: number = 45

    AttackGrowth: number = 30

    DefenceGrowth: number = 15

    PierceGrowth: number = 15

    SpeedGrowth: number = 17

    Energy: number = 90

    CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "dark"

    position = 2
    CharacterQuality: number = 4

    PassiveIntroduceOne: string = `
    
    剧毒皮肤 Lv{skillLv}
    受到任意伤害时对随机敌方施放毒素，每回合损失{healVal}点生命，持续到战斗结束
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    腐败虹吸Lv{skillLv}
    攻击中毒目标时吸血{healVal}点
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    太岁灵君协同 Lv{skillLv}
    与太岁灵君在同一队伍时，增加自身{healVal}点物理抗性，{healVal2}点飞弹抗性，{healVal3}点攻击
    `.replace(/ /ig, "")

    introduce: string = "0号病原体"

    skillValue: string = "剧毒皮肤  腐败虹吸  太岁灵君协同"

    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(30 * skill1) + "") + "\n";
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "")
                .replace("{healVal}", Math.floor(118 * skill2) + "") + "\n";
        } else {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(118) + "")+ "\n";
        }
        if (skill3 > 0) {
            msg += this.SkillIntroduce.replace("{skillLv}", skill3 + "")
                .replace("{healVal}", Math.floor(94 * skill3) + "")
                .replace("{healVal2}", Math.floor(47 * skill3) + "")
                .replace("{healVal3}", Math.floor(79 * skill3) + "") + "\n";
        } else {
            msg += this.SkillIntroduce.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(94) + "")
                .replace("{healVal2}", Math.floor(47) + "")
                .replace("{healVal3}", Math.floor(79) + "") + "\n";
        }
        return msg;
    }
}