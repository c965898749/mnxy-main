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


@RegisterCharacter({ id: "1005" })
export class Character extends CharacterMetaState {

    name: string = "妲己"

    AnimationDir: string = "game/fight_entity/character/1005"


    AvatarPath: string = "game/texture/frames/hero/1005/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1005/spriteFrame"

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
    
    妖狐蔽天 Lv1
    场下，每回合开始有35%几率使当前敌人眩晕，持续1回合
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    谄媚噬魂 Lv1
    场下，每回合令随机一名敌方中毒，每回合损失7点生命
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    众妖皆狂 Lv1
    与白素贞在同一队伍时，增加自身453点生命上限，158点攻击，158点速度
    `.replace(/ /ig, "")


    introduce: string = "四大妖姬之一，魅力无边，向往着自由的爱情，却因为任务被安置在了纣王身边。"

    skillValue: string = "妖狐蔽天  谄媚噬魂  众妖皆狂"

}