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


@RegisterCharacter({ id: "1030" })
export class Character extends CharacterMetaState {

    name: string = "洛神"

    AnimationDir: string = "game/fight_entity/character/1030"


    AvatarPath: string = "game/texture/frames/hero/1030/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1030/spriteFrame"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

    AnimationScale: number = 1

    HpGrowth: number = 45

    AttackGrowth: number = 30

    DefenceGrowth: number = 15

    PierceGrowth: number = 15

    SpeedGrowth: number = 17

    Energy: number = 90

    CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "dark"

    position = 2

    CharacterQuality: number = 4

    PassiveIntroduceOne: string = `
    
    续命 Lv1
    每回合转移40生命给场上我方，只能治疗仙界
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    洛水歌声 Lv1
    每当敌方死亡时，提高我方场上单位的攻击104点，最多叠加3层
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    `.replace(/ /ig, "")

    introduce: string = "宓妃，洛水河神，歌声动人。"

    skillValue: string = "续命  洛水歌声"

}