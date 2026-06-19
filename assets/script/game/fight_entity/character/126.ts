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


@RegisterCharacter({ id: "126" })
export class Character extends CharacterMetaState {

    name: string = "太上老君"

    AnimationDir: string = "game/fight_entity/character/126"


    AvatarPath: string = "game/texture/frames/hero/126/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/126/spriteFrame"

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
    
    元气消散 Lv1
    每当有新单位登场时，有40%几率驱散敌方全体的增益效果。 
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    无为而治 Lv1
    任意位置，每当受到伤害时有20%几率令场上敌方晕眩2回合。 
    `.replace(/ /ig, "")
    
    PassiveIntroduceThree: string = `
    
    复仇飞弹 Lv1
    我方单位死亡时，对场上敌方造成1305点飞弹伤害。 
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    元始天尊协同 Lv1
    与元始天尊在同一队伍时，增加自身175点生命上限，77点攻击， 51点速度。
    `.replace(/ /ig, "")

    introduce: string = "敢言烈火难摧汝，何不丹炉走一轮？"

    skillValue: string = `元气消散 无为而治 复仇飞弹 元始天尊协同`


}