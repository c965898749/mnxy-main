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


@RegisterCharacter({ id: "1024" })
export class Character extends CharacterMetaState {

    name: string = "将臣"

    AnimationDir: string = "game/fight_entity/character/1024"


    AvatarPath: string = "game/texture/frames/hero/1024/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1024/spriteFrame"

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
    
    剧毒皮肤 Lv1
    受到任意伤害时对随机敌方施放毒素，每回合损失30点生命，持续到战斗结束
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    腐败虹吸Lv1
    攻击中毒目标时吸血118点
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    太岁灵君协同 Lv1
    与太岁灵君在同一队伍时，增加自身94点物理抗性，47点飞弹抗性，79点攻击
    `.replace(/ /ig, "")

    introduce: string = "0号病原体"

    skillValue: string = "剧毒皮肤  腐败虹吸  太岁灵君协同"
  
}