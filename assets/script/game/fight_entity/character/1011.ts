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


@RegisterCharacter({ id: "1011" })
export class Character extends CharacterMetaState {

    name: string = "玄冥"

    AnimationDir: string = "game/fight_entity/character/1011"


    AvatarPath: string = "game/texture/frames/hero/1011/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1011/spriteFrame"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

  AnimationScale: number = 1

    HpGrowth: number = 45

    AttackGrowth: number = 30

    DefenceGrowth: number = 15

    PierceGrowth: number = 15

    SpeedGrowth: number = 17

    Energy: number = 90

    CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "dark"

     position = 0
    CharacterQuality: number = 4

    PassiveIntroduceOne: string = `
    
    毒入骨髓 Lv1
    场下，每回合令随机敌方中毒每回损失16点生命
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    疫病侵染 Lv1
    场下，我方单位登场时为场上敌人收到疾病效果，疾病令其受到治疗减少8%，最多叠加1层
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    大鹏金翅雕协同 Lv1
    与大鹏金翅雕在同一队伍时增加自身725点生命上限，95点毒素伤害，253点速度
    `.replace(/ /ig, "")


    introduce: string = "四时、四方之神之一的冬天之神——北方玄冥。"

    skillValue: string = "毒入骨髓  疫病侵染  大鹏金翅雕协同"



}