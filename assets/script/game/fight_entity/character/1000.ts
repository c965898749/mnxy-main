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


@RegisterCharacter({ id: "1000" })
export class Character extends CharacterMetaState {

    name: string = "陈莹莹"

    AnimationDir: string = "game/fight_entity/character/1000"


    AvatarPath: string = "game/texture/frames/hero/1000/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1000/spriteFrame"

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
    
    打拳头 Lv1
    攻击时，对面冰冻……
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `

    跳跃冰冻 Lv1
    让全体冰冻……
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    冰冻尖刺 Lv1
    无敌、免疫一切效果……
    `.replace(/ /ig, "")

    introduce: string = "亲女儿，无敌是多磨寂寞"

    skillValue: string = `打拳头 跳跃冰冻 冰冻尖刺`


   


}