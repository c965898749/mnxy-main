import { CharacterStateCreate } from "../../game/fight/character/CharacterState"
import { EquipmentStateCreate } from "../../game/fight/equipment/EquipmentState"
import { ItemStateCreate } from "../../game/fight/item/ItemState"

export class Resource {
    public gold: number = 0
    //   public  diamond: number = 0
    public soul: number = 0
}

class VolumeDetail {
    // 战斗音量
    fight: number = 4
    // 家园音量
    home: number = 4
    // 角色音量
    character: number = 4

    constructor(v?: Partial<VolumeDetail>) {
        if (!v) return
        Object.keys(v).forEach(k => this[k] = v[k])
    }
}

class ServerUrl {
    url=""
}

let globalId: number = 1

class UserData extends Resource {
    public diamond: number = 0

    public userId: number

    public signCount: number;

    public lv: number = 1

    public exp: number = 0

    public chapter: string = '1-1-1'

    public bronze1: number = 1
    public silvertower: number = 1
    public goldentower: number = 1

    public nickname: string = "用户12138"

    public backpack: ItemStateCreate[] = []

    public equipments: EquipmentStateCreate[] = []

    public characters: CharacterStateCreate[] = []

    public useCardCount: string

    public gameImg: string

    public winCount: number = 0

    public rate: number = 0

    public stopLevel: number = 0

    public weiwanCount: number = 0
    public bronze: number = 0
    public darkSteel: number = 0
    public purpleGold: number = 0
    public crystal: number = 0
    public myCode:string


    // 已经收集到的英雄
    public hasCollectCharacterId: string[] = []

    constructor(or?: Partial<UserData>) {
        super()
        if (!or) { return }
        this.userId = or.userId
        this.signCount = or.signCount
        this.lv = or.lv || 1
        this.nickname = or.nickname || "用户12138"
        this.exp = or.exp || 1
        this.chapter = or.chapter || '1-1-1'
        this.gold = or.gold || 1000
        this.diamond = or.diamond || 100
        this.soul = or.soul || 1000
        this.gameImg = or.gameImg
        this.myCode=or.myCode
        this.winCount = or.winCount
        this.rate = or.rate || 0
        this.bronze = or.bronze || 0
        this.darkSteel = or.darkSteel || 0
        this.purpleGold = or.purpleGold || 0
        this.crystal = or.crystal || 0
        this.stopLevel = or.stopLevel || 0
        this.weiwanCount = or.weiwanCount || 0
        this.useCardCount = or.useCardCount || "0/0"
        this.bronze1 = or.bronze1 || 1
        this.silvertower = or.silvertower || 1
        this.goldentower = or.goldentower || 1
        this.hasCollectCharacterId = or.hasCollectCharacterId || []
            // 原有的物品
            ; (or.backpack || []).forEach(i => this.addNewItem(i.id, i.number))
            // 原有角色
            ; (or.characters || []).forEach(c => { this.addNewCharacter(c) })
            // 原有装备
            ; (or.equipments || []).forEach(e => { this.addNewEquipment(e) })
    }

    // 添加新装备
    public addNewEquipment(character: EquipmentStateCreate) {
        this.equipments.push({
            ...character,
        })
    }
    // // id
    // id: string
    // // uuid
    // uuid?: number
    // // 等级
    // lv: number
    // // 品质
    // quality: number

    // // 星级
    // star: number
    // //d队伍第几个
    // goIntoNum: number

    // stackCount: number

    // isChecked: number
    // 添加新角色
    public addNewCharacter(character: CharacterStateCreate) {
        const equipment: EquipmentStateCreate[] = [];
        (character.equipment || []).forEach(e => equipment.push({ ...e, uuid: ++globalId }))
        this.characters.push({
            ...character,
            star: character.star || 1,
            equipment,
            uuid: ++globalId
        })
        if (this.hasCollectCharacterId.indexOf(character.id) === -1)
            this.hasCollectCharacterId.push(character.id)
    }

    // 添加新物品
    public addNewItem(id: string, num: number) {
        for (let i = 0; i < this.backpack.length; i++) {
            const item = this.backpack[i];
            if (item.id === id) {
                item.number += num
                return
            }
        }
        this.backpack.push({ id, number: num })
    }
}

class Config {

    // 版本
    public version: string = "0.0.1"

    // 总音量
    public volume: number = 0.1

    // 用户数据
    public userData: UserData = new UserData()

    // 详细音量
    public volumeDetail: VolumeDetail = new VolumeDetail()

    public ServerUrl: ServerUrl = new ServerUrl()

    constructor(con?: Partial<Config>) {
        if (!con) return
        if (con.version !== this.version) return
        Object.keys(con).forEach(k => this[k] = con[k])
        this.userData = new UserData(con.userData)
        this.volumeDetail = new VolumeDetail(con.volumeDetail)
    }

}

// 如果没有用户数据则创建一个新的数据
let config: Config = null

// 存储config信息
export function stockConfig() {
    config.userData.backpack = config.userData.backpack.filter(i => i.number > 0)
    localStorage.setItem("UserConfigData", JSON.stringify(config))
}

export function updateConfig() {
    // config.userData.characters = config.userData.characters
    localStorage.setItem("UserConfigData", JSON.stringify(config))
}


// 获取config
export function getConfig(): Config {

    const configJSON = localStorage.getItem("UserConfigData")
    config = configJSON ? new Config(JSON.parse(configJSON)) : new Config
    localStorage.setItem("UserConfigData", JSON.stringify(config))
    return config
}

export function getToken() {
    return localStorage.getItem("token")
}


export function updateTiliTime() {
    const config = getConfig()
    const token = getToken()
    var lastTime = parseInt(localStorage.getItem('LastGetTime1'));
    var key = 'Leave_EnergyNumber2';
    var str = localStorage.getItem(key);
    if (str) {
        str
    }
    const postData = {
        token: token,
        str: lastTime,
        tiLi: parseInt(str),
        userId: config.userData.userId,
    };
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
    };
    fetch(config.ServerUrl.url + "updateTli", options)
        .then(response => {

            return response.json(); // 解析 JSON 响应
        })
        .then(async data => {
            if (data.success == '1') {
                // console.log("更新体力时间成功");
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        }
        );

}

export function updateHuoliTime() {
    const config = getConfig()
    const token = getToken()
    var lastTime = parseInt(localStorage.getItem('LastGetHuoliTime1'));
    var key = 'Leave_EnergyHuoliNumber2';
    var str = localStorage.getItem(key);
    if (!str) {
        str = "0";
    }
    const postData = {
        token: token,
        str: lastTime,
        huoLi: parseInt(str),
        userId: config.userData.userId,
    };
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
    };
    fetch(config.ServerUrl.url + "updateTli3", options)
        .then(response => {

            return response.json(); // 解析 JSON 响应
        })
        .then(async data => {
            if (data.success == '1') {
                // console.log("更新活力力时间成功");
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        }
        );

}

export function updateTiliAndHuoLi() {
    const config = getConfig()
    const token = getToken()
    const postData = {
        token: token,
        userId: config.userData.userId,
    };
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
    };
    fetch(config.ServerUrl.url + "updateTli2", options)
        .then(response => {

            return response.json(); // 解析 JSON 响应
        })
        .then(async data => {
            if (data.success == '1') {
                const userInfo = data.data;
                localStorage.setItem('Leave_EnergyNumber2', userInfo.tiliCount + "");
                localStorage.setItem('LastGetTime1', userInfo.tiliCountTime + "");
                localStorage.setItem('LastGetHuoliTime1', userInfo.huoliCountTime + "");
                localStorage.setItem('Leave_EnergyHuoliNumber2', userInfo.huoliCount + "");
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        }
        );

}



/** 完整后端返回战斗结构 */
type BattleFullData = {
    battleLogs: any[];
    campA: any;
    campB: any;
    name0: string;
    name1: string;
    isWin: number;
};

/** 本地单条缓存结构 */
export  interface BattleLogItem {
    battleId: string;
    saveTime: number;
    battleData: BattleFullData; // 存储后端整套map数据
}



export class BattleLogStorage {
    private  readonly STORAGE_KEY = "battle_log_list";
    // 本地最大缓存战斗数量，超出删除最早一条
    private  readonly MAX_STORE_COUNT = 1000;

    /** 读取本地缓存列表（localStorage 整体存JSON字符串） */
    private  getAllLocalList(): BattleLogItem[] {
        const jsonStr = localStorage.getItem(this.STORAGE_KEY);
        if (!jsonStr) return [];
        try {
            const list = JSON.parse(jsonStr);
            return Array.isArray(list) ? list : [];
        } catch (err) {
            localStorage.removeItem(this.STORAGE_KEY);
            return [];
        }
    }

    /** 写入本地，数组转JSON字符串持久化 */
    private  saveToLocal(list: BattleLogItem[]) {
        const jsonStr = JSON.stringify(list);
        localStorage.setItem(this.STORAGE_KEY, jsonStr);
    }

    /** 删除单条失效战斗缓存 */
    public  removeLocalBattle(battleId: string) {
        let list = this.getAllLocalList();
        list = list.filter(item => item.battleId !== battleId);
        this.saveToLocal(list);
    }

    /** 根据战斗ID查询本地缓存 */
    public  getLocalBattle(battleId: string): BattleLogItem | null {
        const list = this.getAllLocalList();
        return list.find(item => item.battleId === battleId) ?? null;
    }

    /** 新增/更新缓存，自动控容量 */
    public  saveBattleItem(item: BattleLogItem) {
        let list = this.getAllLocalList();
        // 去重，同ID只保留最新
        list = list.filter(v => v.battleId !== item.battleId);
        list.push(item);
        // 超过上限循环删最旧
        while (list.length > this.MAX_STORE_COUNT) {
            list.shift();
        }
        this.saveToLocal(list);
    }

    /** 统一获取完整战斗数据入口 */
    public  async getBattleFullInfo(battleId: string): Promise<BattleFullData> {
        // 1. 优先读本地缓存
        const localItem = this.getLocalBattle(battleId);
        if (localItem) {
            return localItem.battleData;
        }

        // 2. 本地无数据，请求后端
        const fullBattleData = await this.requestBattleServer(battleId);

        // 3. 存入本地缓存
        const saveItem: BattleLogItem = {
            battleId: battleId,
            saveTime: Date.now(),
            battleData: fullBattleData
        };
        this.saveBattleItem(saveItem);

        return fullBattleData;
    }

    /** POST 请求 playBattle 接口，完全适配你的后端逻辑 */
    private  async requestBattleServer(fightId: string): Promise<BattleFullData> {
        const token = getToken();
        const postData = {
            token: token,
            id: fightId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };

        const res = await fetch(config.ServerUrl.url + "playBattle", options);
        if (!res.ok) throw new Error("网络请求失败");
        const data = await res.json();

        // 1. Token过期分支（自行匹配后端返回码）
        if (data.success === "2") {
            throw new Error("TOKEN_EXPIRED");
        }

        // 2. success=0 代表：Redis7天过期 / 服务端本地文件已删除 → 战斗记录失效
        if (data.success !== "1") {
            // 清理本地旧缓存，避免永久存失效数据
            this.removeLocalBattle(fightId);
            throw new Error("BATTLE_RECORD_EXPIRED");
        }

        let map = data.data;
        // 兜底：极端场景后端返回字符串JSON，自动解析
        if (typeof map === "string") {
            try {
                map = JSON.parse(map);
            } catch (parseErr) {
                throw new Error("战斗数据JSON解析失败");
            }
        }

        // map 结构：battleLogs、campA、campB、name0、name1、isWin
        return map as BattleFullData;
    }

    /** 清空所有战斗本地缓存 */
    public  clearAll() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
}

// 全局单例，所有外部直接导入这个实例
export const battleCache = new BattleLogStorage();