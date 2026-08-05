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


@RegisterCharacter({ id: "1036" })
export class Character extends CharacterMetaState {

    name: string = "蓝鲨精"

    AnimationDir: string = "game/fight_entity/character/1036"


    AvatarPath: string = "game/texture/frames/hero/1036/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1036/spriteFrame"

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
    
   乘风破浪 Lv1
   任意位置，蓄力2(每蓄满2个回合触发一次)，增加我方全体火焰抗性12点，最多叠加3层，持续99回合
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    稳坐中军 lv1
    位居3号位时，增加前方单位 145点生命上限。
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    `.replace(/ /ig, "")


    introduce: string = "绿鲨精的结拜兄弟，过去是东海龙王的贴身保镖，某天顿悟人生，带着弟弟绿鲨精开始了浪迹天涯的生活。"

    skillValue: string = "乘风破浪  稳坐中军"

    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(12 * skill1) + "") + "\n";
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "")
                .replace("{healVal}", Math.floor(145 * skill2) + "") + "\n";
        } else {
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(145) + "")+ "\n";
        }
        return msg;
    }

}