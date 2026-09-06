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


@RegisterCharacter({ id: "1105" })
export class Character extends CharacterMetaState {

    name: string = "后羿"

    AnimationDir: string = "game/fight_entity/character/1105"


    AvatarPath: string = "game/texture/frames/hero/1105/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1105/spriteFrame"

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
    
     
       落日余晖 Lv{skillLv}
       在场下每回增加{healVal}%暴击(最多叠加50%)
       `.replace(/ /ig, "")


    PassiveIntroduceTwo: string = `
   
       乾坤破 lv{skillLv}
       受到任意伤害或回合结束时位于场下蓄力+1满4后则攻击时以30%攻击力对易死目标进行{healVal}连射（触发暴击且最多10箭）
       `.replace(/ /ig, "")

    SkillIntroduce: string = `
   
       嫦娥 协同 lv{skillLv}
       与嫦娥在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度
       `.replace(/ /ig, "")

    introduce: string = "十日作乱烤焦大地，后羿射九日留其一。"

    skillValue: string = `落日余晖 乾坤破 嫦娥协同`

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