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


@RegisterCharacter({ id: "1045" })
export class Character extends CharacterMetaState {

    name: string = "金甲神"

    AnimationDir: string = "game/fight_entity/character/1045"


    AvatarPath: string = "game/texture/frames/hero/1045/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1045/spriteFrame"

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
    
    顽强体质 lv1
    上场时，受到治疗的效果提高 5%。
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `

    银甲神 协同 lv1
    与银甲神在同一队伍时，增 加自 身108生命上限，105攻击，47速度
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    `.replace(/ /ig, "")

    introduce: string = "身披金甲的天将，是银甲神的大哥"

    skillValue: string = "顽强体质 银甲神"


}