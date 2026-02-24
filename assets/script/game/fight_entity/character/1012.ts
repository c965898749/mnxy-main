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


@RegisterCharacter({ id: "1012" })
export class Character extends CharacterMetaState {

    name: string = "厚土娘娘"

    AnimationDir: string = "game/fight_entity/character/1012"


    AvatarPath: string = "game/texture/frames/hero/1012/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1012/spriteFrame"

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
    
    大地净化 Lv1
    场上，每当敌方单位登场，驱散自身减益效果
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    后土聚能 Lv1
    场上，每回合提高自身生命上限197点、攻击67点，最多叠加99层
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    燃灯道人协同 Lv1
    与燃灯道人在同一队伍时，增加自身1862点生命上限，88点，158点速度
    `.replace(/ /ig, "")


    introduce: string = "四御之一，大地之母，掌管阴阳生育,万物之美，山川之秀。"

    skillValue: string = "大地净化  后土聚能  厚土之力"


    
}