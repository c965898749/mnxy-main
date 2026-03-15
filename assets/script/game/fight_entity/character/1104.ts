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


@RegisterCharacter({ id: "1104" })
export class Character extends CharacterMetaState {

    name: string = "玄武"

    AnimationDir: string = "game/fight_entity/character/1104"


    AvatarPath: string = "game/texture/frames/hero/1104/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1104/spriteFrame"

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
    
    吞噬 Lv1
    回合开始时，50%概率吞噬已阵亡护法并获得其10%的基础生命上限和基础攻击力加成。(只能1次)
    `.replace(/ /ig, "")


    PassiveIntroduceTwo: string = `

    静岳 lv1
    回合开始时濒危(生命值低于25%)或被复活后，该回合不受伤害，队友被攻击时，若其生命不足80%且低于自身则代承受伤害，回合结束时恢复上限40%的生命值。
    `.replace(/ /ig, "")

    SkillIntroduce: string = `

    朱雀 协同 lv1
    与朱雀在同一队伍时，增加自身352点生命上限，176点攻击，176点速度
    `.replace(/ /ig, "")

    introduce: string = "四圣兽之-根据五行学说，它是代表北方的灵兽，因北方属水，色玄，故称玄武。"

    skillValue: string = `吞噬 静岳 朱雀协同`


}