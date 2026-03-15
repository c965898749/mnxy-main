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


@RegisterCharacter({ id: "1103" })
export class Character extends CharacterMetaState {

    name: string = "哮天犬"

    AnimationDir: string = "game/fight_entity/character/1103"


    AvatarPath: string = "game/texture/frames/hero/1103/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1103/spriteFrame"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

    AnimationScale: number = 1

    HpGrowth: number = 45

    AttackGrowth: number = 30

    DefenceGrowth: number = 15

    PierceGrowth: number = 15

    SpeedGrowth: number = 17

    Energy: number = 90

    CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "ordinary"

    position = 2

    CharacterQuality: number = 4

    PassiveIntroduceOne: string = `
    
    兽妖 Lv1
    攻击前有10%概率提升攻击且使攻击附带疾病效果（本方每有一名兽族，额外增加20%的攻击力，攻击后清除）。
    `.replace(/ /ig, "")


    PassiveIntroduceTwo: string = `

    月之暗面 lv1
    场上，哮天犬(兽族护法数*20%)概率将所受伤害的10%转移给已方兽族护法。
    `.replace(/ /ig, "")

    SkillIntroduce: string = `

    玄武 协同 lv1
    与玄武在同一队伍时，增加自身352点生命上限，176点攻击，176点速度
    `.replace(/ /ig, "")

    introduce: string = "吞天地环宇，食日月风雷。"

    skillValue: string = `兽妖 月之暗面 玄武协同`


}