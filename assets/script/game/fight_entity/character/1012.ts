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


@RegisterCharacter({ id: "1012" })
export class Character extends CharacterMetaState {

    name: string = "厚土娘娘"

    AnimationDir: string = "game/fight_entity/character/1012"


    AvatarPath: string = "game/texture/frames/hero/1012/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1012/spriteFrame"

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
    
    大地净化 Lv{skillLv}
    场上，每当敌方单位登场，驱散自身减益效果
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    后土聚能 Lv{skillLv}
    场上，每回合提高自身生命上限{healVal}点、攻击{healVal1}点，最多叠加99层
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    燃灯道人协同 Lv{skillLv}
    与燃灯道人在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度
    `.replace(/ /ig, "")


    introduce: string = "四御之一，大地之母，掌管阴阳生育,万物之美，山川之秀。"

    skillValue: string = "大地净化  后土聚能  厚土之力"

    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "") + "\n";
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "")
                .replace("{healVal}", Math.floor(197 * skill2) + "")
                .replace("{healVal1}", Math.floor(67 * skill2) + "") + "\n";
        } else {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(197) + "")
                .replace("{healVal1}", Math.floor(67) + "") + "\n";
        }
        if (skill3 > 0) {
            msg += this.SkillIntroduce.replace("{skillLv}", skill3 + "")
                .replace("{healVal}", Math.floor(266 * skill3) + "")
                .replace("{healVal2}", Math.floor(88 * skill3) + "")
                .replace("{healVal3}", Math.floor(158 * skill3) + "") + "\n";
        } else {
            msg += this.SkillIntroduce.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(266) + "")
                .replace("{healVal2}", Math.floor(88) + "")
                .replace("{healVal3}", Math.floor(158) + "") + "\n";
        }
        return msg;
    }

}