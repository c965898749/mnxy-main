import { Component } from "cc";
import { BasicState } from "../BasicState";
import { EquipmentMetaState } from "./EquipmentMetaState";
import { EquipmentEnum } from "./EquipmentEnum";
import { CharacterState } from "../character/CharacterState";

export type EquipmentStateCreate = {
    // id
    id: string
    // uuid
    uuid?: number
    // 等级
    lv: number
    // 品质
    quality: number

    // 星级
    star: number
    //d队伍第几个
    goIntoNum: number

    stackCount: number

    isChecked: number

    fireRes: number

    poisonRes: number

    projectileRes: number

    fireGrowth: number

    poisonGrowth: number

    projectileGrowth: number

    img: string

    name: string

    camp: string

    introduce: string
}

export class EquipmentState extends BasicState<EquipmentMetaState> {
    // 名称
    name: string

    camp: string
    // 所属角色
    character: CharacterState
    // 角色星级
    star: number
    // 最大生命值
    maxHp: number
    // 攻击力
    attack: number
    // 防御力
    defence: number
    // 速度
    speed: number
    // 治疗效率
    curePercent: number
    // 伤害率
    hurtPercent: number
    // 暴击
    critical: number
    // 格挡
    block: number
    // 等级
    lv: number
    // 等级
    maxLv: number

    fireRes: number

    poisonRes: number

    projectileRes: number

    fireGrowth: number

    poisonGrowth: number

    projectileGrowth: number

    img: string
    introduce: string
    // id
    id: string
    // 构造器
    constructor(create: EquipmentStateCreate, character: CharacterState) {
        const meta = EquipmentEnum[create.id]
        super(meta)
        this.character = character
        this.star = create.star
        this.lv = create.lv
        this.maxHp = create.lv * meta.HpGrowth
        this.attack = create.lv * meta.AttackGrowth
        this.defence = create.lv * meta.DefenceGrowth
        this.speed = create.lv * meta.SpeedGrowth
        this.curePercent = meta.CurePercent
        this.hurtPercent = meta.HurtPercent
        this.critical = meta.Critical
        this.block = meta.Block
        this.fireRes = create.fireRes
        this.poisonRes = create.poisonRes
        this.projectileRes = create.projectileRes
        this.fireGrowth = create.fireGrowth
        this.poisonGrowth = create.poisonGrowth
        this.projectileGrowth = create.projectileGrowth
        this.img = create.img
        this.name = create.name
        this.camp = create.camp
        this.id = create.id
        this.introduce=create.introduce
    }

    // 添加属性到角色
    AddPropertyToCharacter: (self: this) => Promise<any>
}