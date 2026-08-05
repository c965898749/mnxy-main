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


@RegisterCharacter({ id: "1038" })
export class Character extends CharacterMetaState {

    name: string = "田螺仙子"

    AnimationDir: string = "game/fight_entity/character/1038"


    AvatarPath: string = "game/texture/frames/hero/1038/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1038/spriteFrame"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

  AnimationScale: number = 1

    HpGrowth: number = 45

    AttackGrowth: number = 30

    DefenceGrowth: number = 15

    PierceGrowth: number = 15

    SpeedGrowth: number = 17

    Energy: number = 90

    CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "dark"

    position = 0
    CharacterQuality: number = 5

    PassiveIntroduceOne: string = `
    
    田螺歌声 Lv{skillLv}
    减少后方单位50%中毒伤害
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    清水治愈 Lv{skillLv}
    每回合转移{healVal}生命给场上我方，只能治疗仙界
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    `.replace(/ /ig, "")


    introduce: string = "喜欢宅在田螺里的仙子，当月光酒下时就唱起，在山的那边海的那边有只小田螺..."

    skillValue: string = "田螺歌声  清水治愈"


    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "")+ "\n";
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "")
                .replace("{healVal}", Math.floor(39 * skill2) + "") + "\n";
        } else {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(39) + "") + "\n";
        }
      
        return msg;
    }
}