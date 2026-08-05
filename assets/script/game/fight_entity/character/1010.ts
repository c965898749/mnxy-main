import { math } from "cc";
import { GetCharacterCoordinatePosition, HolCharacter } from "../../../prefab/HolCharacter";
import { FightMap } from "../../../scenes/Fight/Canvas/FightMap";
import { util } from "../../../util/util";
import { ActionState } from "../../fight/ActionState";
import { BasicState } from "../../fight/BasicState";
import { BuffState } from "../../fight/buff/BuffState";
import { RegisterCharacter } from "../../fight/character/CharacterEnum";
import { CharacterMetaState } from "../../fight/character/CharacterMetaState";
import { CharacterState } from "../../fight/character/CharacterState";
import { CardSkillLevelUtil } from "../../../util/CardSkillLevelUtil";

@RegisterCharacter({ id: "1010" })
class Character extends CharacterMetaState {

    name: string = "齐天大圣"

    AnimationDir: string = "game/fight_entity/character/1010"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

    AvatarPath: string = "game/texture/frames/hero/1010/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1011/spriteFrame"

    CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "dark"

    CharacterQuality: number = 5

    AnimationScale: number = 0.7

    HpGrowth: number = 70

    AttackGrowth: number = 25

    DefenceGrowth: number = 20

    PierceGrowth: number = 10

    SpeedGrowth: number = 15

    Energy: number = 100

    position = 1


    PassiveIntroduceOne: string = `
    
    定海神针 Lv{skillLv}
    普通攻击前对敌人造成当前生命值的{healVal}%的伤害
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    大圣降临 Lv{skillLv}
    登场时回复自身生命值{healVal}%
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    最后王牌 Lv{skillLv}
    位居5号位时，提高自身{healVal}点生命，{healVal2}点攻击，{healVal3}点速度
    `.replace(/ /ig, "")


    introduce: string = "孙悟空，神通广大，曾经大闹天宫，后随唐僧去往西天取经，是所有猴子的偶像。"

    skillValue: string = "定海神针  大圣降临  最后王牌"
    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(6 * skill1) + "") + "\n";
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "").replace("{healVal}", Math.floor(20 * skill2) + "") + "\n";
        }else {
             msg += this.PassiveIntroduceTwo.replace("{skillLv}",  "未开启").replace("{healVal}", Math.floor(20) + "") + "\n";
        }
        if (skill3 > 0) {
            msg += this.SkillIntroduce.replace("{skillLv}", skill3 + "")
            .replace("{healVal}", Math.floor(253 * skill3) + "")
            .replace("{healVal2}", Math.floor(126 * skill3) + "")
            .replace("{healVal3}", Math.floor(211 * skill3) + "") + "\n";
        }else {
             msg += this.SkillIntroduce.replace("{skillLv}",  "未开启")
            .replace("{healVal}", Math.floor(253) + "")
            .replace("{healVal2}", Math.floor(126) + "")
            .replace("{healVal3}", Math.floor(211) + "") + "\n";
        }
        return msg;
    }
}