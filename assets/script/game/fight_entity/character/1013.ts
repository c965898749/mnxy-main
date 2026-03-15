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


@RegisterCharacter({ id: "1013" })
export class Character extends CharacterMetaState {

    name: string = "烛龙"

    AnimationDir: string = "game/fight_entity/character/1013"


    AvatarPath: string = "game/texture/frames/hero/1013/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1013/spriteFrame"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

    AnimationScale: number = 1

    HpGrowth: number = 45

    AttackGrowth: number = 30

    DefenceGrowth: number = 15

    PierceGrowth: number = 15

    SpeedGrowth: number = 17

    Energy: number = 90

    CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "dark"

    position = 1
    CharacterQuality: number = 4

    PassiveIntroduceOne: string = `
    
    烛火燎原 Lv1
    场上，受到任意伤害时对全体敌方造成54点火焰伤害
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    致命衰竭 Lv1
    场上，有单位登场时为目标添加衰弱状态，攻击减少10%，持续99回合
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    句芒协同 Lv1
    与句芒在同一队伍时，增加自身211点生命上限，110点火焰伤害，221点速度
    `.replace(/ /ig, "")


    introduce: string = "烛龙，又名烛九阴，古代神话中的神秘生物，它开眼为昼、闭眼为夜，拥有掌控时间的能力。"

    skillValue: string = "烛火燎原  致命衰竭  句芒协同"

   

}