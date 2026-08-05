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


@RegisterCharacter({ id: "1060" })
export class Character extends CharacterMetaState {

    name: string = "鹏魔王"

    AnimationDir: string = "game/fight_entity/character/1060"


    AvatarPath: string = "game/texture/frames/hero/1060/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1060/spriteFrame"

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
    
    死雨风暴 Lv1
    死亡时，敌方所有生物中毒每回合损失10点生命
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `

    死亡徘徊 Lv1
    死亡时，令当前敌人中毒,令敌方每回合损失70点生命
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    大圣鸿威 Lv1
    与狮驼王在同一队伍时，增加自身705点生命上限，63点攻击，176点速度
    `.replace(/ /ig, "")

    introduce: string = "为七大圣之一，自称混天大圣，位列第三。"

    skillValue: string = `死雨风暴  死亡徘徊  大圣鸿威`


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
                  .replace("{healVal}", Math.floor(70 * skill2) + "") + "\n";
          } else {
              msg += this.PassiveIntroduceTwo.replace("{skillLv}", "未开启")
                  .replace("{healVal}", Math.floor(70) + "")+ "\n";
          }
          if (skill3 > 0) {
              msg += this.SkillIntroduce.replace("{skillLv}", skill3 + "")
                  .replace("{healVal}", Math.floor(705 * skill3) + "")
                  .replace("{healVal2}", Math.floor(63 * skill3) + "")
                  .replace("{healVal3}", Math.floor(176 * skill3) + "") + "\n";
          } else {
              msg += this.SkillIntroduce.replace("{skillLv}", "未开启")
                  .replace("{healVal}", Math.floor(705) + "")
                  .replace("{healVal2}", Math.floor(63) + "")
                  .replace("{healVal3}", Math.floor(176) + "") + "\n";
          }
          return msg;
      }

}