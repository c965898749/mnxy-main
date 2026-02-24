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


@RegisterCharacter({ id: "1072" })
export class Character extends CharacterMetaState {

    name: string = "多宝道人"

    AnimationDir: string = "game/fight_entity/character/1072"


    AvatarPath: string = "game/texture/frames/hero/1072/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1072/spriteFrame"

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
    
    上古光明 Lv1
    光环-敌我双方生命上限不会变化
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `


    续命 Lv1
    场下，每回合攻击前转移125点生命给我方场上，只能治疗仙界
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    真武大帝协同 Lv1
    与真武大帝在同一队伍时，增加自身1063点生命上限，319点攻击
    `.replace(/ /ig, "")

    introduce: string = "通天教主的大弟子，先天宝物收藏家"

    skillValue: string = `上古光明  续命  真武大帝协同`


  
}