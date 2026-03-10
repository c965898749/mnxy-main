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


@RegisterCharacter({ id: "1100" })
export class Character extends CharacterMetaState {

    name: string = "宫女"

    AnimationDir: string = "game/fight_entity/character/1100"


    AvatarPath: string = "game/texture/frames/hero/1100/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1100/spriteFrame"

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
    
    续命 Lv1
    每回合转移60生命给场上我方，只能治疗仙界
    `.replace(/ /ig, "")


    PassiveIntroduceTwo: string = `


    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    

    `.replace(/ /ig, "")

    introduce: string = "一个男性独尊的世界里，宫女们以柔弱的肩膀，扛起了侍奉天子的重任。"

    skillValue: string = `续命`


   

}