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


@RegisterCharacter({ id: "1102" })
export class Character extends CharacterMetaState {

    name: string = "银甲神"

    AnimationDir: string = "game/fight_entity/character/1102"


    AvatarPath: string = "game/texture/frames/hero/1102/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1102/spriteFrame"

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
    每回合转移40生命给场上我方，只能治疗仙界
    `.replace(/ /ig, "")


    PassiveIntroduceTwo: string = `

    金甲神 协同 lv1
    与金甲神在同一队伍时，增加自身108生命上限，105攻击，47速度
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    `.replace(/ /ig, "")

    introduce: string = "金鳌十天君之一，也为道教护法神，以“红水阵”阵主闻名。"

    skillValue: string = `红水阵法 斩妖剑 法宝反噬`


}