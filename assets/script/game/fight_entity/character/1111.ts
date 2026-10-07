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


@RegisterCharacter({ id: "1111" })
export class Character extends CharacterMetaState {

    name: string = "轩辕"

    AnimationDir: string = "game/fight_entity/character/1111"


    AvatarPath: string = "game/texture/frames/hero/1111/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1111/spriteFrame"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

    AnimationScale: number = 1

    HpGrowth: number = 45

    AttackGrowth: number = 30

    DefenceGrowth: number = 15

    PierceGrowth: number = 15

    SpeedGrowth: number = 17

    Energy: number = 90

    CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "machine"

    position = 2

    CharacterQuality: number = 4

    PassiveIntroduceOne: string = `
    
     
    背水 Lv{skillLv}
    攻击时若生命值低于目标，则提升{healVal}%攻击力、增加50%速度。
       `.replace(/ /ig, "")


    PassiveIntroduceTwo: string = `
   
    吾乃轩辕 lv{skillLv}
    攻击后，对敌我全体护法追加{healVal}%的物理伤害（最大40%），我每存在一个人族敌方护法造成的追加伤害提升20%我方护法造成的追加伤害减少20%。
       `.replace(/ /ig, "")

    SkillIntroduce: string = `
   
    伏羲协同 lv{skillLv}
    与伏羲在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度
    `.replace(/ /ig, "")

    introduce: string = "剑镇蚩尤，道启洪荒。\n根生华夏，万古流芳。"

    skillValue: string = `背水 吾乃轩辕 伏羲协同`

    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv;
        const star = state.star;
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // ========== 二技能：每级+10%，上限40% ==========
        let skill2Percent = skill2 * 5;
        if (skill2Percent > 40) {
            skill2Percent = 40;
        }

        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(10 * skill1) + "") + "\n";

        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo
                .replace("{skillLv}", skill2 + "")
                .replace("{healVal}", skill2Percent + "") + "\n";
        } else {
            msg += this.PassiveIntroduceTwo
                .replace("{skillLv}", "未开启")
                .replace("{healVal}", "40") + "\n";
        }

        if (skill3 > 0) {
            msg += this.SkillIntroduce
                .replace("{skillLv}", skill3 + "")
                .replace("{healVal}", Math.floor(266 * skill3) + "")
                .replace("{healVal2}", Math.floor(266 * skill3) + "")
                .replace("{healVal3}", Math.floor(158 * skill3) + "") + "\n";
        } else {
            msg += this.SkillIntroduce
                .replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(266) + "")
                .replace("{healVal2}", Math.floor(266) + "")
                .replace("{healVal3}", Math.floor(158) + "") + "\n";
        }
        return msg;
    }


}