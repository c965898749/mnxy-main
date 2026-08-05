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


@RegisterCharacter({ id: "1002" })
export class Character extends CharacterMetaState {

    name: string = "托塔天王"

    AnimationDir: string = "game/fight_entity/character/1002"


    AvatarPath: string = "game/texture/frames/hero/1002/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1002/spriteFrame"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

  AnimationScale: number = 1

    HpGrowth: number = 45

    AttackGrowth: number = 30

    DefenceGrowth: number = 15

    PierceGrowth: number = 15

    SpeedGrowth: number = 17

    Energy: number = 90

    CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "sacred"

   
    position=2

    CharacterQuality: number = 4


    PassiveIntroduceOne: string = `
     镇妖塔 Lv{skillLv}
     每当新单位入场时，对场上敌方造成{healVal}点飞弹
     `.replace(/ /ig, "")
    PassiveIntroduceTwo: string = `
    
    仙塔庇护 Lv{skillLv}
    在场,每回合恢复自身{healVal}点生命值
    `.replace(/ /ig, "")

    SkillIntroduce: string = `

    `.replace(/ /ig, "")

    introduce: string = "李靖，天庭军队大统帅，哪咤的父亲，却好像一直处理不好家庭关系。"

    skillValue: string = "镇妖塔  仙塔庇护"

    OnCreateState(self: CharacterState): void {
        if (self.star >= 2) {
            self.attack *= 1.2
            self.pierce *= 1.2
        }
        if (self.star >= 4) {
            self.attack *= 1.15
        }
    }

    // 重点：重写父类方法，自定义数值计算 + 文本替换
    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv; // 当前等级，来自 create 里的lv
        const star = state.star;
        // ========== 该角色专属数值公式，每个卡牌可以完全不一样 ==========
        const [skill1, skill2, skill3, skill4] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        // 拼接基础文本，替换占位符
        let msg = "";
        msg += this.PassiveIntroduceOne.replace("{skillLv}", skill1 + "").replace("{healVal}", Math.floor(69 * skill1) + "") + "\n";
        if(skill2>0){
            msg += this.PassiveIntroduceTwo.replace("{skillLv}", skill2 + "").replace("{healVal}", Math.floor(25 * skill2) + "") + "\n";
        }
        return msg;
    }


}