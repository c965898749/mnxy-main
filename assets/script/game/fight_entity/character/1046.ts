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


@RegisterCharacter({ id: "1046" })
export class Character extends CharacterMetaState {

    name: string = "仙龟丞相"

    AnimationDir: string = "game/fight_entity/character/1046"


    AvatarPath: string = "game/texture/frames/hero/1046/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1046/spriteFrame"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

  AnimationScale: number = 1

    HpGrowth: number = 45

    AttackGrowth: number = 30

    DefenceGrowth: number = 15

    PierceGrowth: number = 15

    SpeedGrowth: number = 17

    Energy: number = 90

    CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "sacred"

   position = 0

    CharacterQuality: number = 4

    PassiveIntroduceOne: string = `
    

    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `


    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    `.replace(/ /ig, "")

    introduce: string = "龙宫执政大臣，曾辅佐多位龙王君主。平日最爱沙滩太阳浴。"

        skillValue: string = `
    平时他们都说我不学无术、
    ，现在你看到了，他们是对的。`




}