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


@RegisterCharacter({ id: "1115" })
export class Character extends CharacterMetaState {

    name: string = "白虎"

    AnimationDir: string = "game/fight_entity/character/1115"


    AvatarPath: string = "game/texture/frames/hero/1115/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1115/spriteFrame"

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

    灵佑 Lv{skillLv}
    回合开始时消耗自身生命上限{healVal}%血量（最高20%），为场上我方单位施加等同于扣血数值 2倍 的物理结界
       `.replace(/ /ig, "")


    PassiveIntroduceTwo: string = `
   
    血战到底 lv{skillLv}
    我方兽族单位死亡时，我方全体提高自身生命上限{healVal}点、攻击{healVal1}点，最多叠加99层
       `.replace(/ /ig, "")

    SkillIntroduce: string = `
   
    青龙 协同 lv{skillLv}
    与青龙在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度
    `.replace(/ /ig, "")

    introduce: string = "四圣兽之一，代表西方的灵兽。西方属金，其色白，故称白虎，主杀伐、掌兵戈。"

    skillValue: string = `灵佑 血战到底 青龙协同`

    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv;
        const star = state.star;
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // ========== 一技能（灵佑）：自耗血比例 = 技能等级*2%，封顶 20%（与后端 processRoundStartEffects 一致） ==========
        let costPercent = Math.min(2 * skill1, 20);

       let msg = "";
        msg += this.PassiveIntroduceOne
            .replace("{skillLv}", skill1 + "")
            .replace("{healVal}", costPercent + "") + "\n";

        // ========== 二技能（血战到底）：每层 +生命上限 技能等级*1000、+攻击 技能等级*200 ==========
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo
                .replace("{skillLv}", skill2 + "")
                .replace("{healVal}", (1000 * skill2) + "")
                .replace("{healVal1}", (200 * skill2) + "") + "\n";
        } else {
            msg += this.PassiveIntroduceTwo
                .replace("{skillLv}", "未开启")
                .replace("{healVal}", 1000 + "")
                .replace("{healVal1}", 200 + "") + "\n";
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