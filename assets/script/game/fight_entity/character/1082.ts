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


@RegisterCharacter({ id: "1082" })
export class Character extends CharacterMetaState {

    name: string = "玉兔精"

    AnimationDir: string = "game/fight_entity/character/1082"


    AvatarPath: string = "game/texture/frames/hero/1082/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1082/spriteFrame"

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
    
    幸运之脚 Lv{skillLv}
    场下 ，每回合提高自己速度 {healVal}点，最多叠加5 层。
    `.replace(/ /ig, "")

    
    PassiveIntroduceTwo: string = `

    绝色小兔 Lv{skillLv}
    出售价格提高。
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    

    `.replace(/ /ig, "")

    introduce: string = "她原本是天上的玉兔，因思凡下界，跑到了天竺国。"

    skillValue: string = `幸运之脚   绝色小兔`


    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(20 * skill1) + "") + "\n";
       
        return msg;
    }

}