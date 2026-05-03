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


@RegisterCharacter({ id: "1068" })
export class Character extends CharacterMetaState {

    name: string = "金霞童子"

    AnimationDir: string = "game/fight_entity/character/1068"


    AvatarPath: string = "game/texture/frames/hero/1068/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1068/spriteFrame"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

  AnimationScale: number = 1

    HpGrowth: number = 45

    AttackGrowth: number = 30

    DefenceGrowth: number = 15

    PierceGrowth: number = 15

    SpeedGrowth: number = 17

    Energy: number = 90

    CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "sacred"

   position = 1

    CharacterQuality: number = 4

    PassiveIntroduceOne: string = `
    
    灵力飞弹 Lv1
    每当新单位入场时，对场上敌 人造成35点飞 弹伤害。
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    白鹤协同 Lv5
    与白鹤童子在同 一队伍时，增加自身18点飞弹伤害。
    `.replace(/ /ig, "")

    introduce: string = "太乙真人的近侍童子，哪吒的师弟。"

    skillValue: string = `灵力飞弹  白鹤协同`



}