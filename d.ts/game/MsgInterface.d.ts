//装备提升信息
declare interface EquipAddInfo {
	equipId: string,
	exp: number
}
//装备穿戴信息
declare interface EquipPutInfo {
	heroId: number,
	site: number,
	equipId: string
}

/**合成强化放入槽位信息 */
declare interface EquipBlessInfo {
	heroId: number,
	site: number,
	trait: number,
	equipId: string
}

declare interface BlessInfo {
	lv: number,
	trait: number,
	slv: number,
	trait: [],
}

declare interface SynthesisEquip {
	/**装备id */
	id: number,
	/**强化等级 */
	slv: number,
	/**类型 */
	type: number,
	/**数量 */
	num: number
}

declare interface HeroAddExp {
	heroId: number,
	exp: number
}

declare interface HeroSetSkill {
	heroId: number,
	skill: any[]
}

declare interface HeroZhangLi {
	heroId: number,
}

declare interface OfficeGetReward {
	id: number
}