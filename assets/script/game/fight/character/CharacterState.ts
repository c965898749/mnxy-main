import { Component } from "cc";
import { BasicState } from "../BasicState";
import { CharacterMetaState } from "./CharacterMetaState";
import { BuffState } from "../buff/BuffState";
import { CharacterEnum } from "./CharacterEnum";
import { EquipmentState, EquipmentStateCreate } from "../equipment/EquipmentState";
import { HolCharacter } from "../../../prefab/HolCharacter";

export type CharacterStateCreate = {
    // id
    id: string
    // uuid
    uuid?: number
    // 等级
    lv: number
    // 等级
    maxLv: number
    // 星级
    star: number
    // 是否上场
    onStage: number
    // 拥有装备
    equipment: EquipmentStateCreate[]
    //d队伍第几个
    goIntoNum: number

    stackCount: number

    isChecked: number

    profession: string

    camp: string
    maxHp: number
    attack: number
    defence: number
    speed: number
    pierce: number
    name: string
}

export class CharacterState extends BasicState<CharacterMetaState> {

    /**
     * 所属组件
     * 一般来说是 HolCharacter 对象
     */
    component: HolCharacter

    // 名称
    name: string
    // 等级
    lv: number
    // 等级
    maxLv: number
    // 角色星级
    star: number
    // 所属create
    create: CharacterStateCreate

    // 生命值
    hp: number
    // 最大生命值
    maxHp: number
    // 能量值
    energy: number
    // 最大能量值
    maxEnergy: number
    // 攻击力
    attack: number
    // 防御力
    defence: number
    // 速度
    speed: number
    // 穿透
    pierce: number
    // 治疗效率
    curePercent: number = 1.0
    // 伤害率
    hurtPercent: number = 1.0
    // 免伤率
    FreeInjuryPercent: number = 0.0
    // 暴击
    critical: number
    // 格挡
    block: number = 5

    // 所有buff
    buff: BuffState[] = []
    // 所有装备
    equipment: EquipmentState[] = []

    // 是否上场
    onStage: number

    profession: string

    camp: string

    /** 
     * 构造器
     * component 是所属组件
     */
    constructor(create: CharacterStateCreate, component: HolCharacter) {
        const meta: CharacterMetaState = CharacterEnum[create.id]
        super(meta)
        this.lv = create.lv
        this.maxLv = create.maxLv
        this.star = create.star
        this.name = create.name
        this.component = component
        this.create = create
        this.onStage = create.onStage

        this.maxEnergy = meta.Energy
        this.maxHp = create.maxHp 
        this.attack = create.attack 
        this.defence = create.defence
        this.speed = create.speed
        this.pierce = create.pierce
        this.critical = meta.Critical
        this.block = meta.Block

        this.profession = create.profession

        this.camp = create.camp

        // create.equipment.forEach(ec => this.addEquipment(ec))
        meta.OnCreateState(this)

        this.hp = this.maxHp
        this.energy = 20
    }

}