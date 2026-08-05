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


@RegisterCharacter({ id: "1035" })
export class Character extends CharacterMetaState {

    name: string = "阎王"

    AnimationDir: string = "game/fight_entity/character/1035"


    AvatarPath: string = "game/texture/frames/hero/1035/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1035/spriteFrame"

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
    
    生死簿 Lv{skillLv}
    每回合，降低敌我全体生命上限{healVal}
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    幽冥审判 Lv{skillLv}
    每当有敌方登场，令随机敌方中毒{healVal}
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    不动如山 Lv{skillLv}
    位居2号位置时，增加自身{healVal}点生命上限，{healVal2}点速度
    `.replace(/ /ig, "")


    introduce: string = "阴间地狱的主宰，手持生死薄掌管人的生死轮回。"

    skillValue: string = "生死簿  幽冥审判  不动如山"

    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(100 * skill1) + "") + "\n";
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "")
                .replace("{healVal}", Math.floor(73 * skill2) + "") + "\n";
        } else {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(73) + "") + "\n";
        }
        if (skill3 > 0) {
            msg += this.SkillIntroduce.replace("{skillLv}", skill3 + "")
                .replace("{healVal}", Math.floor(729 * skill3) + "")
                .replace("{healVal2}", Math.floor(130 * skill3) + "")+ "\n";
        } else {
            msg += this.SkillIntroduce.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(729) + "")
                .replace("{healVal2}", Math.floor(130) + "") + "\n";
        }
        return msg;
    }

}