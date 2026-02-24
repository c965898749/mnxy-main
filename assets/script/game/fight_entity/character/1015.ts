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


@RegisterCharacter({ id: "1015" })
export class Character extends CharacterMetaState {

    name: string = "燃灯道人"

    AnimationDir: string = "game/fight_entity/character/1015"


    AvatarPath: string = "game/texture/frames/hero/1015/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1015/spriteFrame"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

    AnimationScale: number = 1

    HpGrowth: number = 45

    AttackGrowth: number = 30

    DefenceGrowth: number = 15

    PierceGrowth: number = 15

    SpeedGrowth: number = 17

    Energy: number = 90

    CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "sacred"

    position = 1
    CharacterQuality: number = 4

    PassiveIntroduceOne: string = `
    
    仙人指路 Lv1
    每次攻击后增加自身后方单位的攻击66点，最多叠加3次
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    信念报偿 Lv1
    死亡时，对敌方血量最小者造成325点飞弹伤害
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    紫薇大帝协同 Lv1
    与紫薇大帝在同一队伍时，增加自身453点生命上限，158点攻击，158点速度
    `.replace(/ /ig, "")


    introduce: string = "昆仑十二金仙的大师兄，曾协助姜子牙破十绝阵。"

    skillValue: string = "仙人指路  信念报偿  紫薇大帝协同"

  

}