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


@RegisterCharacter({ id: "1013" })
export class Character extends CharacterMetaState {

    name: string = "烛龙"

    AnimationDir: string = "game/fight_entity/character/1013"


    AvatarPath: string = "game/texture/frames/hero/1013/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1013/spriteFrame"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

    AnimationScale: number = 1

    HpGrowth: number = 45

    AttackGrowth: number = 30

    DefenceGrowth: number = 15

    PierceGrowth: number = 15

    SpeedGrowth: number = 17

    Energy: number = 90

    CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "dark"

    position = 1
    CharacterQuality: number = 4

    PassiveIntroduceOne: string = `
    
    烛火燎原 Lv1
    受到任意伤害时对全体敌方造成54点火焰伤害
    `.replace(/ /ig, "")

    PassiveIntroduceTwo: string = `
    
    致命衰竭 Lv1
    场上，有单位登场时为目标添加衰弱状态，攻击减少10%，持续99回合
    `.replace(/ /ig, "")

    SkillIntroduce: string = `
    
    句芒协同 Lv1
    与句芒在同一队伍时增加自身197点生命上限，99点火焰伤害，197点速度
    `.replace(/ /ig, "")


    introduce: string = "烛龙，又名烛九阴，古代神话中的神秘生物，它开眼为昼、闭眼为夜，拥有掌控时间的能力。"

    skillValue: string = "烛火燎原  致命衰竭  句芒协同"

    OnCreateState(self: CharacterState): void {
        if (self.star >= 2) {
            self.attack *= 1.2
            self.pierce *= 1.2
        }
        if (self.star >= 4) {
            self.attack *= 1.15
        }
    }

    GetOnAttack(): (self: BasicState<any>, actionState: ActionState, fightMap: FightMap) => Promise<any> {
        return async (self: CharacterState, actionState: ActionState, fightMap: FightMap) => {
            let enemies = self.component.getEnimies(fightMap.allLiveCharacter)
            if (enemies.length <= 0) return
            enemies = enemies.sort((a, b) => a.coordinate.col - b.coordinate.col)
            actionState.targets.push(enemies[0].state)
            // 播放动画
            if (fightMap.isPlayAnimation) {
                await util.sundry.moveNodeToPosition(
                    self.component.node,
                    {
                        targetPosition: GetCharacterCoordinatePosition(
                            actionState.targets[0].component.direction,
                            "attack"
                        ),
                        moveCurve: true,
                        moveTimeScale: actionState.targets[0].component.holAnimation.timeScale
                    }
                )
                await self.component.holAnimation.playAnimation("attack", 1, self.component.defaultState)
            }
            // 结算
            for (const target of actionState.targets) {
                // // 添加恐惧
                // if (self.star >= 4 && Math.random() < 0.2) {
                //     const fearBuff = new BuffState({ id: "fear" })
                //     target.component.addBuff(self.component, fearBuff)
                //     fightMap.listenRoundEvent(2, () => target.component.deleteBuff(fearBuff))
                // }
                // 攻击
                fightMap.actionAwaitQueue.push(
                    self.component.attack(self.attack * 1, target.component)
                )
            }
            // 播放动画
            if (fightMap.isPlayAnimation) {
                await util.sundry.moveNodeToPosition(
                    self.component.node,
                    {
                        targetPosition: GetCharacterCoordinatePosition(
                            self.component.direction,
                            "ordinary"
                        ),
                        moveCurve: true,
                        moveTimeScale: self.component.holAnimation.timeScale
                    }
                )
            }
            return
        }
    }

    GetOnSkill(): (self: BasicState<any>, actionState: ActionState, fightMap: FightMap) => Promise<any> {
        return async (self: CharacterState, actionState: ActionState, fightMap: FightMap) => {
            let enemies = self.component.getEnimies(fightMap.allLiveCharacter)
            if (enemies.length <= 0) return
            actionState.targets.push(enemies[Math.floor(enemies.length * Math.random())].state)
            // 播放动画
            if (fightMap.isPlayAnimation) {
                await util.sundry.moveNodeToPosition(
                    self.component.node,
                    {
                        targetPosition: GetCharacterCoordinatePosition(
                            actionState.targets[0].component.direction,
                            "attack"
                        ),
                        moveCurve: false,
                        moveTimeScale: actionState.targets[0].component.holAnimation.timeScale
                    }
                )
                await self.component.holAnimation.playAnimation("skill", 1, self.component.defaultState)
            }
            // 结算
            for (const target of actionState.targets) {
                // 添加流血 TODO
                const bleedBuff = new BuffState({ id: "bleed" }, {
                    roundReduceBleed: self.attack * 0.5
                })
                target.component.addBuff(self.component, bleedBuff)
                // 两回合后去掉
                fightMap.listenRoundEvent(2, () => target.component.deleteBuff(bleedBuff))
                // 攻击
                fightMap.actionAwaitQueue.push(
                    self.component.attack(self.attack * 1.5, target.component)
                )
            }
            // 播放动画
            if (fightMap.isPlayAnimation) {
                await util.sundry.moveNodeToPosition(
                    self.component.node,
                    {
                        targetPosition: GetCharacterCoordinatePosition(
                            self.component.direction,
                            "ordinary"
                        ),
                        moveCurve: true,
                        moveTimeScale: self.component.holAnimation.timeScale
                    }
                )
            }
            return
        }
    }

}