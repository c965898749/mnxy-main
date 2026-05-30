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


@RegisterCharacter({ id: "1063" })
export class Character extends CharacterMetaState {

    name: string = "黑山老妖"

    AnimationDir: string = "game/fight_entity/character/1063"


    AvatarPath: string = "game/texture/frames/hero/1063/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1063/spriteFrame"

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
    
    百毒感染 Lv1
    登场时令敌方全体中毒，每回合损失40
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    白晶晶协同 Lv1
    与白晶晶在同一队伍时，增加自身350点生命上限，88点攻击，88点速度。
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    `.replace(/ /ig, "")

    introduce: string = "他深爱着聂小倩，甚至不惜一切代价要迎娶她，这显示出他具有深情的一面。"

    skillValue: string = `百毒感染  白晶晶协同`


    OnCreateState(self: CharacterState): void {
        if (self.star >= 2) {
            self.attack *= 1.2
            self.pierce *= 1.2
        }
        if (self.star >= 4) {
            self.attack *= 1.15
        }
    }

  
}