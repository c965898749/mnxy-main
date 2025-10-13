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
    位于5号位时，增加自身453点生命上限，178点攻击，178点速度
    `.replace(/ /ig, "")


    introduce: string = "孙悟空，神通广大，曾经大闹天宫，后随唐僧去往西天取经，是所有猴子的偶像。"

    skillValue: string = "定海神针  大圣降临  最后王牌"

    OnCreateState(self: CharacterState): void {
        if (self.star >= 2) {
            self.speed *= 1.2
            self.attack *= 1.2
            self.pierce *= 1.2
        }
        if (self.star >= 4) {
            self.maxHp *= 1.2
            self.attack *= 1.2
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

    GetOnSkill(): (self: CharacterState, actionState: ActionState, fightMap: FightMap) => Promise<any> {
        return async (self: CharacterState, actionState: ActionState, fightMap: FightMap) => {
            const selfComponent = self.component
            // 获取敌人
            const enemys = selfComponent.getEnimies(fightMap.allLiveCharacter)
                .sort((a, b) => a.coordinate.col - b.coordinate.col)
            const enemy = enemys[0]
            if (!enemy) return
            actionState.targets.push(enemy.state)
            enemys.forEach((e, i) => {
                if (i === 0) return
                if (e.coordinate.row === enemy.coordinate.row)
                    actionState.targets.push(e.state)
            })
            // 播放动画
            if (fightMap.isPlayAnimation) {
                // 移动过去
                await util.sundry.moveNodeToPosition(selfComponent.node, {
                    moveCurve: true,
                    targetPosition: GetCharacterCoordinatePosition(
                        enemy.direction,
                        "attack"
                    ),
                    moveTimeScale: self.component.holAnimation.timeScale
                })
                await selfComponent.holAnimation.playAnimation("skill", 1)
                selfComponent.holAnimation.playAnimation(selfComponent.defaultState)
            }
            // 造成伤害 ...
            for (const target of actionState.targets) {
                // 添加眩晕状态
                const vertigo = new BuffState({ id: "vertigo" })
                target.component.addBuff(selfComponent, vertigo)
                // 两回合后去掉
                fightMap.listenRoundEvent(2, () => target.component.deleteBuff(vertigo))
                // 攻击
                fightMap.actionAwaitQueue.push(
                    selfComponent.attack(self.attack * 1.5, target.component)
                )
            }
            // 回到原位
            if (fightMap.isPlayAnimation)
                await util.sundry.moveNodeToPosition(selfComponent.node, {
                    moveCurve: true,
                    targetPosition: GetCharacterCoordinatePosition(
                        selfComponent.direction
                    ),
                    moveTimeScale: self.component.holAnimation.timeScale
                })
            return
        }
    }
}