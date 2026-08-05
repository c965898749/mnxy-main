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


@RegisterCharacter({ id: "126" })
export class Character extends CharacterMetaState {

  name: string = "太上老君"

  AnimationDir: string = "game/fight_entity/character/126"


  AvatarPath: string = "game/texture/frames/hero/126/spriteFrame"

  HeaderPath: string = "game/texture/frames/hero/Header/126/spriteFrame"

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
    
    元气消散 Lv{skillLv}
    每当有新单位登场时，有40%几率驱散敌方全体的增益效果。 
    `.replace(/ /ig, "")

  PassiveIntroduceTwo: string = `
    
    无为而治 Lv{skillLv}
    任意位置，每当受到伤害时有20%几率令场上敌方晕眩2回合。 
    `.replace(/ /ig, "")

  PassiveIntroduceThree: string = `
    
    复仇飞弹 Lv{skillLv}
    我方单位死亡时，对场上敌方造成{healVal}点伤害。}点飞弹伤害。 
    `.replace(/ /ig, "")

  SkillIntroduce: string = `
    
    元始天尊协同 Lv{skillLv}
    与元始天尊在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击， {healVal3}点速度。
    `.replace(/ /ig, "")

  introduce: string = "敢言烈火难摧汝，何不丹炉走一轮？"

  skillValue: string = `元气消散 无为而治 复仇飞弹 元始天尊协同`

  public getSkillDesc(state: CharacterState): string {
    const lv = state.lv; // 当前等级，来自 create 里的lv
    const star = state.star;
    // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
    const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

    // 拼接基础文本，替换占位符
    let msg = "";
    msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "") + "\n";
    if (skill2 > 0) {
      msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "")+"\n";
    } else {
      msg += this.PassiveIntroduceTwo.replace("{skillLv}", "未开启")+"\n";
    }
    if (skill3 > 0) {
      msg += this.PassiveIntroduceThree.replace("{skillLv}", skill3 + "")
        .replace("{healVal}", Math.floor(430 * skill3) + "")+ "\n";
    } else {
      msg += this.PassiveIntroduceThree.replace("{skillLv}", "未开启")
        .replace("{healVal}", Math.floor(430) + "") + "\n";
    }
    if (skill4 > 0) {
      msg += this.SkillIntroduce.replace("{skillLv}", skill4 + "")
        .replace("{healVal}", Math.floor(175 * skill4) + "")
        .replace("{healVal2}", Math.floor(77 * skill4) + "")
        .replace("{healVal3}", Math.floor(51 * skill4) + "") + "\n";
    } else {
      msg += this.SkillIntroduce.replace("{skillLv}", "未开启")
        .replace("{healVal}", Math.floor(175) + "")
        .replace("{healVal2}", Math.floor(77) + "")
        .replace("{healVal3}", Math.floor(51) + "") + "\n";
    }
    return msg;
  }
}