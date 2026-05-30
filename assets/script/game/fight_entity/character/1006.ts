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


@RegisterCharacter({ id: "1006" })
export class Character extends CharacterMetaState {

    name: string = "铁扇公主"

    AnimationDir: string = "game/fight_entity/character/1006"


    AvatarPath: string = "game/texture/frames/hero/1006/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1006/spriteFrame"

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
    
    芭蕉扇 Lv1
    场上，每次普通攻击后对当前敌人造成36点火焰伤害
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    

    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    

    `.replace(/ /ig, "")


    introduce: string = "铁扇公主又名罗刹女，是牛魔王的老婆，红孩儿的母亲。"

    skillValue: string = "芭蕉扇"

    OnCreateState(self: CharacterState): void {
        if (self.star >= 2) {
            self.attack *= 1.2
            self.pierce *= 1.2
        }
        if (self.star >= 4) {
            self.attack *= 1.15
        }
    }

   

}