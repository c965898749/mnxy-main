declare interface SceneGuanQia {
	level: number,
	isFullPower:boolean,
}
/** 战场UI窗口参数 */
declare interface ArgsBattleViewCtrl<T> {
	/** 场景ID */
	sceneId: number;
	/** 场景特有参数 */
	args?: T;
	/** 关闭按钮回调 */
	colseCb?: any;
	unClosk?: boolean
	/** 强制不关闭界面 */
}



/**本地存储的数据结构 */
interface LEquipData {
	insId: string;
	id: number;
	lv: number;
	quality: number,
}

interface LItemData {
	id: number;
	type: number;
	num: number;
}

interface front {
	isbattle: number,
	id: number,
}

interface IHeroData {
	/**经验 */
	exp?: number,
	tableId: number;
	/**已经是计算好了的（装备 转化的属性） */
	propts: number[];
	/**英雄等级 */
	lv: number;
	/**装备id */
	equips?: string[];
	/**当前已解锁的技能 */
	skillIds: number[];
	/**套装Buff 效果 */
	suitBuffIds: number[];
	camp: number;
	heroId?: string;
	/**品质 */
	trait: number;
	/**星星数量 */
	star?: number;
}

interface starLv {
	lv: number,
	count: number
}

/**官爵 */
interface OfficeBox {
	/**激励视频宝箱 */
	adBox: number,
	/**普通宝箱 */
	box: number
}

interface chapterBox {
	/**章节是否解锁 */
	level: number,
	/**章节宝箱所在关卡 */
	levelBox: number,
	/**章节宝箱状态 */
	box: number,
}

/**vip奖励领取 */
interface vipReward {
	/**首次礼包 */
	recycle: number,
	/**每日礼包 */
	recycleUp: number,
}

interface equipSell {
	/**交易方式 */
	sell: number,
	/**交易数据 */
	sellData: object,
}

interface DrawConfig {
	/**奖品id */
	id: number,
	/**奖品类型 */
	type: number,
	/**奖励数据 */
	award: number[][],
	/**奖励存在奖池中的权重 */
	weight: number,
}

/**招募抽卡 */
interface recruitDrawConfig {
	/**奖品id */
	id: number,
	/**奖励数据 */
	award: number[],
	/**奖励存在奖池中的权重 */
	weight: number,
}

/**点击穿戴 */
interface equipWear {
	/**id */
	id: string,
	/**是否可以穿戴 */
	existence: boolean,
	/**穿戴等级 */
	Lv: number,
}

/**穿戴效果 */
interface wearEffect {
	/**穿戴英雄 */
	heroId: number,
	/**穿戴id */
	id: string,
	/**穿戴节点组 */
	content: Array<cc.Node>
	/**穿戴等级 */
	Lv: number,
	/**装备原存储区 */
	equip: cc.Node
}

/**跳转装备详情页 */
interface jumpEquip {
	insId: string,
	bool: boolean,
	site: number,
}

interface SelectGridInfo {
	pos: cc.Vec2,
	heroId: number
}

interface suitInfo {
	IHeroData: IHeroData
	suit: SSuitDataRaw
}

/**抽奖货币方式 */
interface DrawCurrencyInfo {
	id: number,
	type: number,
	num: number,
}

interface CURRENCYANIM {
	startPos: cc.Vec2,
	id: number
}

interface COINPAREM {
	coin: string,
	add: string
}

interface ONLINEREWARD {
	bool: boolean,
	reward: number[][],
	index: number = 1,
}

interface FEAT {
	bool: boolean,
	reward: number[],
	index: number,
}
interface FEATREWARD {
	index: number,
	reward: number[],
}

interface STOREGOODS {
	pillIndex: Array<Array<number>> = null,
	chipIndex: Array<Array<number>> = null,
	pillInfo: number = null,
	chipInfo: Array<number> = null,
}

interface recruitCardCtrl {
	recruitNum: number,
	award: Array<Array<number>>,
	cb: Function,
}