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


@RegisterCharacter({ id: "1028" })
export class Character extends CharacterMetaState {

    name: string = "鲤鱼精"

    AnimationDir: string = "game/fight_entity/character/1028"


    AvatarPath: string = "game/texture/frames/hero/1028/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1028/spriteFrame"

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
    
    鱼跃龙门 Lv{skillLv}
    攻击后对场下敌方造成{healVal}点火焰伤害
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    如鱼得水 Lv{skillLv}
    每当有生物死亡时，增加自身生命上限{healVal}，最多叠加3层
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    `.replace(/ /ig, "")

    introduce: string = "东海龙王御用跟班，口头禅是“为了老大赴汤蹈火，在所不辞，咕噜”。"

    skillValue: string = "鱼跃龙门  如鱼得水"

    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(62 * skill1) + "") + "\n";
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "")
                .replace("{healVal}", Math.floor(117 * skill2) + "")+ "\n";
        } else {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(117) + "")+ "\n";
        }
      
        return msg;
    }

}