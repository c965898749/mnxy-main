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
    // redis-server.exe redis.windows.conf
    // url = "http://192.168.0.104:8080/"
    url = "http://127.0.0.1:8080/YIMEM_war/"
    // url="http://czx.yimem.com:3000/"
}

let globalId: number = 1

class UserData extends Resource {
    public diamond: number = 0

    public userId: number

    public signCount: number;

    public lv: number = 1

    public exp: number = 0

    public chapter: string = '1-1-1'

    public nickname: string = "用户12138"

    public backpack: ItemStateCreate[] = []

    public equipments: EquipmentStateCreate[] = []

    public characters: CharacterStateCreate[] = []

    public useCardCount: string

    public gameImg: string

    public winCount: number = 0

    public stopLevel: number = 0
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
        this.winCount = or.winCount
        this.stopLevel = or.stopLevel || 0
        this.useCardCount = or.useCardCount || "0/0"
        this.hasCollectCharacterId = or.hasCollectCharacterId || []
            // 原有的物品
            ; (or.backpack || []).forEach(i => this.addNewItem(i.id, i.number))
            // 原有角色
            ; (or.characters || []).forEach(c => { this.addNewCharacter(c) })
            // 原有装备
            ; (or.equipments || []).forEach(e => { this.addNewEquipment(e.id, e.lv) })
    }

    // 添加新装备
    public addNewEquipment(id: string, lv?: number, quality?: number) {
        this.equipments.push({
            id,
            lv: lv || 1,
            uuid: ++globalId,
            quality: quality || 1
        })
    }

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
    console.log(config.userData.diamond, 444)
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
