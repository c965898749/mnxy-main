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


@RegisterCharacter({ id: "1085" })
export class Character extends CharacterMetaState {

    name: string = "银角大王"

    AnimationDir: string = "game/fight_entity/character/1085"


    AvatarPath: string = "game/texture/frames/hero/1085/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1085/spriteFrame"

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

    CharacterQuality: number = 4

    PassiveIntroduceOne: string = `
    
    紫金葫芦 Lv1
    攻击后对 全体敌方造成22点火焰伤害。 
    `.replace(/ /ig, "")

    
    PassiveIntroduceTwo: string = `


    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    金角大王协同 Lv1
    与金角大王在同一队伍时，增加自身200点生命上限，50点攻击， 50点速度。
    `.replace(/ /ig, "")

    introduce: string = "太上老君座下看守炼丹炉的童子，手持紫金葫芦。"

    skillValue: string = `紫金葫芦   金角大王协同`


    
}