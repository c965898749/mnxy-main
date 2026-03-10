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


@RegisterCharacter({ id: "1101" })
export class Character extends CharacterMetaState {

    name: string = "王天君"

    AnimationDir: string = "game/fight_entity/character/1101"


    AvatarPath: string = "game/texture/frames/hero/1101/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1101/spriteFrame"

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
    
    红水阵法 Lv1
    登场时令敌方全体陷入“红水阵飞弹抗性降低39点，持续6回合
    `.replace(/ /ig, "")


    PassiveIntroduceTwo: string = `

    斩妖剑 Lv1
    攻击妖界单位时，有35%几率额外追加一次真实伤害，数值相当于敌方当前生命的40%
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    法宝反噬 Lv1
    场上触发，每当有单位死亡时，对场上敌方身后单位造成237点飞弹伤害
    `.replace(/ /ig, "")

    introduce: string = "金鳌十天君之一，也为道教护法神，以“红水阵”阵主闻名。"

    skillValue: string = `红水阵法 斩妖剑 法宝反噬`


   

}