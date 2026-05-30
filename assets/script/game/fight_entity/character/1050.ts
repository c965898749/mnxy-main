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


@RegisterCharacter({ id: "1050" })
export class Character extends CharacterMetaState {

    name: string = "哪吒"

    AnimationDir: string = "game/fight_entity/character/1050"


    AvatarPath: string = "game/texture/frames/hero/1050/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1050/spriteFrame"

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
    
    穿云斩 Lv1
    普通攻击后，对当前敌方身后一个单位造成125点真实伤害
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `

    莲花圣体 Lv1
    减免受到的火焰伤害、毒素伤害、飞弹伤害各10%
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    玄女协同 Lv1
    与九天玄女在同一队伍时，增加自身352点生命上限，176点攻击，176点速度
    `.replace(/ /ig, "")

    introduce: string = "哪吒是托塔天王李靖的第三个儿子,母亲是殷夫人。"

    skillValue: string = `穿云斩  莲花圣体  玄女协同`


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