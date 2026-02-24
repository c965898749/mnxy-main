import { math } from "cc";
import { GetCharacterCoordinatePosition, HolCharacter } from "../../../prefab/HolCharacter";
import { FightMap } from "../../../scenes/Fight/Canvas/FightMap";
import { util } from "../../../util/util";
import { ActionState } from "../../fight/ActionState";
import { BasicState } from "../../fight/BasicState";
import { BuffState } from "../../fight/buff/BuffState";
import { RegisterCharacter } from "../../fight/character/CharacterEnum";
import { CharacterMetaState } from "../../fight/character/CharacterMetaState";
import { CharacterState } from "../../fight/character/CharacterState";

@RegisterCharacter({ id: "1010" })
class Character extends CharacterMetaState {

    name: string = "齐天大圣"

    AnimationDir: string = "game/fight_entity/character/1010"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

    AvatarPath: string = "game/texture/frames/hero/1010/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1011/spriteFrame"

    CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "dark"

    CharacterQuality: number = 5

    AnimationScale: number = 0.7

    HpGrowth: number = 70

    AttackGrowth: number = 25

    DefenceGrowth: number = 20

    PierceGrowth: number = 10

    SpeedGrowth: number = 15

    Energy: number = 100

    position = 1


    PassiveIntroduceOne: string = `
    
    定海神针 Lv1
    普通攻击前对敌人造成当前生命值的6%的伤害
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    大圣降临 Lv1
    登场时回复自身生命值20%
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    最后王牌 Lv1
    位居5号位时，提高自身253点生命，126点攻击，211点速度
    `.replace(/ /ig, "")


    introduce: string = "孙悟空，神通广大，曾经大闹天宫，后随唐僧去往西天取经，是所有猴子的偶像。"

    skillValue: string = "定海神针  大圣降临  最后王牌"

}