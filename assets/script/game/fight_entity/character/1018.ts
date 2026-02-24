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


@RegisterCharacter({ id: "1018" })
export class Character extends CharacterMetaState {

    name: string = "真武大帝"

    AnimationDir: string = "game/fight_entity/character/1018"


    AvatarPath: string = "game/texture/frames/hero/1018/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1018/spriteFrame"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

    AnimationScale: number = 1

    HpGrowth: number = 45

    AttackGrowth: number = 30

    DefenceGrowth: number = 15

    PierceGrowth: number = 15

    SpeedGrowth: number = 17

    Energy: number = 90

    CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "sacred"

    position = 2
    CharacterQuality: number = 4

    PassiveIntroduceOne: string = `
    
    绝地反击 Lv1
    被攻击时，对场上敌方造成相当于敌方攻击的10%的伤害
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    不动如山 Lv1
    在第2位时，增加自身生命上限553点
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    南华真人协同 Lv1
    与南华真人在同一队伍时，增加自身279点生命上限，181点速度
    `.replace(/ /ig, "")


    introduce: string = "武当山供奉的真身，玄武之体。"

    skillValue: string = "绝地反击  不动如山  南华真人协同"

  
}