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


@RegisterCharacter({ id: "1059" })
export class Character extends CharacterMetaState {

    name: string = "六耳猕猴"

    AnimationDir: string = "game/fight_entity/character/1059"


    AvatarPath: string = "game/texture/frames/hero/1059/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1059/spriteFrame"

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
    
    幻影箭 Lv{skillLv}
    场下，每回合对敌方3号位置单位造成{healVal}点真实伤害
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `

    长年怀恨 Lv{skillLv}
    场下，受到火焰伤害时增加攻击{healVal}点，最多增加5次
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    众妖皆狂 Lv{skillLv}
    与黄眉老佛在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度
    `.replace(/ /ig, "")

    introduce: string = "入戏太深，自己都以为是大圣本尊。"

    skillValue: string = `幻影箭  长年怀恨  黄眉老佛协同`


    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(41 * skill1) + "") + "\n";
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "")
                .replace("{healVal}", Math.floor(55 * skill2) + "")+ "\n";
        } else {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(55) + "")+ "\n";
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