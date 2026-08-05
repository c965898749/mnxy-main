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


@RegisterCharacter({ id: "1092" })
export class Character extends CharacterMetaState {

  name: string = "河伯"

  AnimationDir: string = "game/fight_entity/character/1092"


  AvatarPath: string = "game/texture/frames/hero/1092/spriteFrame"

  HeaderPath: string = "game/texture/frames/hero/Header/1092/spriteFrame"

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
    
    续命 Lv{skillLv}
    每回合转移{healVal}生命给场上我方，只能治疗仙界
    `.replace(/ /ig, "")


  PassiveIntroduceTwo: string = `

    不动如山 Lv{skillLv}
    位于3号位时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度
    `.replace(/ /ig, "")

  SkillIntroduce: string = `
    

    `.replace(/ /ig, "")

  introduce: string = "河神的称呼叫河伯，即常说的河伯。河伯名冯夷（或作冰夷，无夷），始见于《庄子》、《楚辞》、《山海经等》。"

  skillValue: string = `续命   不动如山`

  public getSkillDesc(state: CharacterState): string {
    const lv = state.lv; // 当前等级，来自 create 里的lv
    const star = state.star;
    // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
    const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

    // 拼接基础文本，替换占位符
    let msg = "";
    msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(39 * skill1) + "") + "\n";

    if (skill3 > 0) {
      msg += this.SkillIntroduce.replace("{skillLv}", skill3 + "")
        .replace("{healVal}", Math.floor(200 * skill3) + "")
        .replace("{healVal2}", Math.floor(50 * skill3) + "")
        .replace("{healVal3}", Math.floor(50 * skill3) + "") + "\n";
    } else {
      msg += this.SkillIntroduce.replace("{skillLv}", "未开启")
        .replace("{healVal}", Math.floor(200) + "")
        .replace("{healVal2}", Math.floor(50) + "")
        .replace("{healVal3}", Math.floor(50) + "") + "\n";
    }
    return msg;
  }

}