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


@RegisterCharacter({ id: "1106" })
export class Character extends CharacterMetaState {

    name: string = "虞姬"

    AnimationDir: string = "game/fight_entity/character/1106"


    AvatarPath: string = "game/texture/frames/hero/1106/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1106/spriteFrame"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

    AnimationScale: number = 1

    HpGrowth: number = 45

    AttackGrowth: number = 30

    DefenceGrowth: number = 15

    PierceGrowth: number = 15

    SpeedGrowth: number = 17

    Energy: number = 90

    CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "machine"

    position = 2

    CharacterQuality: number = 4

    PassiveIntroduceOne: string = `
    
     
    不动如山 Lv{skillLv}
    位于2号位增加物理抗性{healVal}点伤害
       `.replace(/ /ig, "")


    PassiveIntroduceTwo: string = `
   
      乌江之殇 lv{skillLv}
      回合开始时扣除前后护法 {healVal}% 的当前生命（上限40%），给该护法增加其值 80% 的物理结界。扣血有 50% 概率可触发蓄力
       `.replace(/ /ig, "")

    SkillIntroduce: string = `
   
       项羽 协同 lv{skillLv}
       与项羽在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度
       `.replace(/ /ig, "")

    introduce: string = "霸王，我做你的护盾！"

    skillValue: string = `不动如山 乌江之殇 项羽协同`

    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);
        let skill22 = 0;
        // 边界判空限制
        if (lv <= 0) {
            skill22 = 0;
        } else if (lv >= 100) {
            skill22 = 10;
        } else {
            skill22 = Math.floor(lv / 10);
        }
        // 100级上限对应10箭，每10等级+1箭，均分

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", skill1 + "") + "\n";
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "")
                .replace("{healVal}", skill22 + "") + "\n";
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