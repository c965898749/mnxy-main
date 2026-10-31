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


@RegisterCharacter({ id: "1109" })
export class Character extends CharacterMetaState {

    name: string = "谛听"

    AnimationDir: string = "game/fight_entity/character/1109"


    AvatarPath: string = "game/texture/frames/hero/1109/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1109/spriteFrame"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

    AnimationScale: number = 1

    HpGrowth: number = 45

    AttackGrowth: number = 30

    DefenceGrowth: number = 15

    PierceGrowth: number = 15

    SpeedGrowth: number = 17

    Energy: number = 90

      CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "nature"

    position = 2

    CharacterQuality: number = 4

    PassiveIntroduceOne: string = `
    
    撞击 Lv{skillLv}
    攻击前，消耗自身 {healVal}% 生命值(不超过当前生命值20%)，向当前目标发起撞击，对目标造成等同于所消耗生命值 2 倍的伤害。
    `.replace(/ /ig, "")


    PassiveIntroduceTwo: string = `

    返璞归真 lv{skillLv}
    所受伤害减少{healVal}%，转移减伤前伤害值的40%至敌方易死护法（转移的伤害为生命流失，最多不超过谛听生命值的25%）。
    每生效一次，本神通的减伤及反弹数值会减少5%，直到0；
    `.replace(/ /ig, "")

    SkillIntroduce: string = `

    地藏 协同 lv{skillLv}
    与地藏在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度
    `.replace(/ /ig, "")

    introduce: string = "它能明辨是非、辨别真假。但是害怕真假孙悟空在地府闹事，所以选择闭口不言。"

    skillValue: string = `撞击 返璞归真 地藏协同`



    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv;
        const star = state.star;
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // ========== 二技能：每级+10%，上限40% ==========
        let skill2Percent = skill2 * 10;
        if (skill2Percent > 100) {
            skill2Percent = 100;
        }

        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.min(20, Math.floor(1 * skill1)) + "") + "\n";

        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo
                .replace("{skillLv}", skill2 + "")
                .replace("{healVal}", skill2Percent + "") + "\n";
        } else {
            msg += this.PassiveIntroduceTwo
                .replace("{skillLv}", "未开启")
                .replace("{healVal}", "100") + "\n";
        }

        if (skill3 > 0) {
            msg += this.SkillIntroduce
                .replace("{skillLv}", skill3 + "")
                .replace("{healVal}", Math.floor(352 * skill3) + "")
                .replace("{healVal2}", Math.floor(176 * skill3) + "")
                .replace("{healVal3}", Math.floor(176 * skill3) + "") + "\n";
        } else {
            msg += this.SkillIntroduce
                .replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(352) + "")
                .replace("{healVal2}", Math.floor(176) + "")
                .replace("{healVal3}", Math.floor(176) + "") + "\n";
        }
        return msg;
    }

}