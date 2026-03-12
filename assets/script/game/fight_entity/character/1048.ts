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


@RegisterCharacter({ id: "1048" })
export class Character extends CharacterMetaState {

    name: string = "西岳大帝"

    AnimationDir: string = "game/fight_entity/character/1048"


    AvatarPath: string = "game/texture/frames/hero/1048/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1048/spriteFrame"

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
    
    灵力飞弹 Lv1
    每当新单位入场时，对场上敌方造成84点飞弹伤害
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `

    策兵奇袭 Lv1
    场下，每回合增加自身16点飞弹伤害，最多叠加5层
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    大帝协同 Lv1
    与北岳大帝在同一队伍时，增加自身604点生命上限上限，159点攻击，211点速度
    `.replace(/ /ig, "")

    introduce: string = "西岳大帝是五岳大帝之一，主管西岳华山。"

    skillValue: string = `灵力飞弹  策兵奇袭  大帝协同`


   

}