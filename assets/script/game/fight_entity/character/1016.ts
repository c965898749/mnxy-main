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


@RegisterCharacter({ id: "1016" })
export class Character extends CharacterMetaState {

    name: string = "镇元子"

    AnimationDir: string = "game/fight_entity/character/1016"


    AvatarPath: string = "game/texture/frames/hero/1016/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1016/spriteFrame"

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
    
    魂力飞弹 Lv1
    场下，每当新单位入场时，对场上敌人造成178点飞弹伤害
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    禁心咒 Lv1
    场下，每当有单位登场，有50%几率令场上英雄沉默2回合
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    多宝道人同 Lv1
    与多宝道人在同一队伍时，增加自身338点生命上限，88点攻击，260点速度
    `.replace(/ /ig, "")


    introduce: string = "地仙之祖，长居五庄观，种植人参果,"

    skillValue: string = "魂力飞弹  禁心咒  多宝道人同"

   

}