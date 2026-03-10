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


@RegisterCharacter({ id: "1092" })
export class Character extends CharacterMetaState {

    name: string = "河伯"

    AnimationDir: string = "game/fight_entity/character/1092"


    AvatarPath: string = "game/texture/frames/hero/1092/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1092/spriteFrame"

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
    每回合转移39生命给场上我方，只能治疗仙界
    `.replace(/ /ig, "")

    
    PassiveIntroduceTwo: string = `

    不动如山 Lv1
    位于3号位时，增加自身200点生命上限，50点攻击，50点速度
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    

    `.replace(/ /ig, "")

    introduce: string = "河神的称呼叫河伯，即常说的河伯。河伯名冯夷（或作冰夷，无夷），始见于《庄子》、《楚辞》、《山海经等》。"

    skillValue: string = `续命   不动如山`

}