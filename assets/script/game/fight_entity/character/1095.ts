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


@RegisterCharacter({ id: "1095" })
export class Character extends CharacterMetaState {

    name: string = "白晶晶"

    AnimationDir: string = "game/fight_entity/character/1095"


    AvatarPath: string = "game/texture/frames/hero/1095/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1095/spriteFrame"

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
    
    谄媚噬魂 Lv{skillLv}
    场下，每回合令随机一名敌方中毒，每回合损失{healVal}点生命
    `.replace(/ /ig, "")


    PassiveIntroduceTwo: string = `


    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    百眼魔君协同 Lv{skillLv}
    与百眼魔君在同 一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击， {healVal3}点速度。
    `.replace(/ /ig, "")

    introduce: string = "晶晶深知至尊宝对紫霞的爱意，从他取下手串而不愿现身的行为中，她明白了至尊宝的心意。"

    skillValue: string = `谄媚噬魂  百眼魔君协同`


    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(7 * skill1) + "") + "\n";

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