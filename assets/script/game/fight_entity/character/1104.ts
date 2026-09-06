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


@RegisterCharacter({ id: "1104" })
export class Character extends CharacterMetaState {

    name: string = "玄武"

    AnimationDir: string = "game/fight_entity/character/1104"


    AvatarPath: string = "game/texture/frames/hero/1104/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1104/spriteFrame"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

    AnimationScale: number = 1

    HpGrowth: number = 45

    AttackGrowth: number = 30

    DefenceGrowth: number = 15

    PierceGrowth: number = 15

    SpeedGrowth: number = 17

    Energy: number = 90

    CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "nature"

    position = 2

    CharacterQuality: number = 4

    PassiveIntroduceOne: string = `
    
    吞噬 Lv{skillLv}
    在场上回合开始时，{healVal}%概率吞噬已阵亡护法并获得其10%的基础生命上限和基础攻击力加成。(被吞噬的护法不会复活)
    `.replace(/ /ig, "")


    PassiveIntroduceTwo: string = `

    守卫 lv{skillLv}
    队友被攻击时，若其生命不足{healVal}%且低于自身则代承受伤害，回合结束时恢复上限40%的生命值。
    `.replace(/ /ig, "")

    SkillIntroduce: string = `

    朱雀 协同 lv{skillLv}
    与朱雀在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度
    `.replace(/ /ig, "")

    introduce: string = "四圣兽之-根据五行学说，它是代表北方的灵兽，因北方属水，色玄，故称玄武。"

    skillValue: string = `吞噬 静岳 朱雀协同`

    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(10 * skill1) + "") + "\n";
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "")
                .replace("{healVal}", Math.floor(10 * skill2) + "")+ "\n";
        } else {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(10) + "") + "\n";
        }
        if (skill3 > 0) {
            msg += this.SkillIntroduce.replace("{skillLv}", skill3 + "")
                .replace("{healVal}", Math.floor(352 * skill3) + "")
                .replace("{healVal2}", Math.floor(176 * skill3) + "")
                .replace("{healVal3}", Math.floor(176 * skill3) + "") + "\n";
        } else {
            msg += this.SkillIntroduce.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(352) + "")
                .replace("{healVal2}", Math.floor(176) + "")
                .replace("{healVal3}", Math.floor(176) + "") + "\n";
        }
        return msg;
    }
}