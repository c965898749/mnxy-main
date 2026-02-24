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


@RegisterCharacter({ id: "1023" })
export class Character extends CharacterMetaState {

    name: string = "句芒"

    AnimationDir: string = "game/fight_entity/character/1023"


    AvatarPath: string = "game/texture/frames/hero/1023/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1023/spriteFrame"

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
    
    残酷收割 Lv1
    每当有生物死亡时，回复自身6%最大生命
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    嗜血 Lv1
    受到普通攻击时，为自身添加嗜血效果，提高攻击118点，速度20点
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    大圣协同 Lv1
    与齐天大圣在同一队伍时，增加自身211点生命上限，105点攻击，158点速度
    `.replace(/ /ig, "")


    introduce: string = "操纵自然力量的巫神，可以控制风雨雷电能与树木交谈。"

    skillValue: string = "残酷收割  嗜血  大圣协同"
  

}