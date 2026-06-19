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


@RegisterCharacter({ id: "1020" })
export class Character extends CharacterMetaState {

    name: string = "长生大帝"

    AnimationDir: string = "game/fight_entity/character/1020"


    AvatarPath: string = "game/texture/frames/hero/1020/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1020/spriteFrame"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

    AnimationScale: number = 1

    HpGrowth: number = 45

    AttackGrowth: number = 30

    DefenceGrowth: number = 15

    PierceGrowth: number = 15

    SpeedGrowth: number = 17

    Energy: number = 90

    CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "sacred"

    position = 0
    CharacterQuality: number = 4

    PassiveIntroduceOne: string = `
    
    生生不息 Lv1
    场下，每当有生物死亡时治疗我方全体90点生命，只能治疗仙界生物
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    南极祝福 Lv1
    场下，受到任意伤害时提升自身56点生命值上限。
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    厚土协同 Lv1
    与厚土娘娘在同一队伍时，增加自身453点生命上限，158点攻击，158点速度
    `.replace(/ /ig, "")


    introduce: string = "长生百万年,我被认证为大帝!!!"

    skillValue: string = "生生不息  南极祝福  厚土协同"

}