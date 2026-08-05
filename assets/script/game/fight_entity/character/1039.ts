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


@RegisterCharacter({ id: "1039" })
export class Character extends CharacterMetaState {

    name: string = "驱魔真君"

    AnimationDir: string = "game/fight_entity/character/1039"


    AvatarPath: string = "game/texture/frames/hero/1039/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1039/spriteFrame"

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
    CharacterQuality: number = 5

    PassiveIntroduceOne: string = `
    
    圣灵泉涌 Lv{skillLv}
    受到治疗时，对场上敌方造成{healVal}点飞弹伤害
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    顽强体魄 Lv{skillLv}
    受到治疗的效果提升{healVal}%
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    `.replace(/ /ig, "")


    introduce: string = "他因相貌丑陋，在殿试时被皇帝嫌弃，愤而撞柱身亡。死后，他化为捉鬼的神祇，被玉皇大帝封为“驱魔帝君”"

    skillValue: string = "圣灵泉涌  顽强体魄"

    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(32 * skill1) + "") + "\n";
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "")
                .replace("{healVal}", Math.floor(10 * skill2) + "") + "\n";
        } else {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(10) + "")+ "\n";
        }
       
        return msg;
    }

}