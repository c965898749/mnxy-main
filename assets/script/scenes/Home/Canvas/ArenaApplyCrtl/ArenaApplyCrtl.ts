import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { ArenaDetailCrtl } from '../ArenaDetailCrtl/ArenaDetailCrtl';
import { util } from 'db://assets/script/util/util';
import { CharacterStateCreate } from 'db://assets/script/game/fight/character/CharacterState';
import { SelectCardCtrl } from '../qianghua/SelectCardCtrl';
import { CharacterEnum } from 'db://assets/script/game/fight/character/CharacterEnum';
import { ArenaRankingCrtl } from '../ArenaRankingCrtl/ArenaRankingCrtl';
const { ccclass, property } = _decorator;

@ccclass('ArenaApplyCrtl')
export class ArenaApplyCrtl extends Component {
    ArenaId: number
    @property(Node)
    Item: Node
    @property(Node)
    apply: Node
    @property(Node)
    Item2: Node
    @property(Node)
    enterAnra: Node
    @property(Node)
    remainingTime: Node
    @property(Node)
    side1: Node
    @property(Node)
    side2: Node
    @property(Node)
    title: Node
    @property(Node)
    header: Node
    @property(Node)
    winName: Node
    @property(Node)
    weiwanCount: Node
    public weiwanId: string = null;
    arenaRanking100 = [];
    public _side1: string = null;
    public _side2: string = null;
    public cahracterQueue: CharacterStateCreate[] = []
    start() {

    }

    update(deltaTime: number) {
        // 1. 获取当前时间对象
        const now = new Date();

        // 2. 判断是否为周日（JavaScript中周日的星期值为0，周一至周六对应1-6）
        const isSunday = now.getDay() === 0;

        // 3. 获取当前小时数（24小时制，范围0-23）
        const currentHour = now.getHours();

        // 4. 核心判断：是否是周日 且 小时数大于等于22
        const isAfterSunday22 = isSunday && currentHour >= 22;

        // 5. 输出判断结果
        if (isAfterSunday22) {
            this.remainingTime.getComponent(Label).string = this.getTimeToMondayMidnight();
        } else {
            const year = now.getFullYear();
            const firstDay = new Date(year, 0, 1);
            const dayDiff = Math.floor((now.getTime() - firstDay.getTime()) / 86400000);
            const adjust = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
            const week = Math.max(Math.floor((dayDiff + adjust + 1) / 7), 1);
            const yearAndWeek = `${year}第${week}周`;
            this.title.getComponent(Label).string = yearAndWeek + "赛季进行中";
        }
    }
    getTimeToMondayMidnight() {
        // 1. 获取当前时间的Date对象
        const now = new Date();
        // 2. 获取当前是一周的第几天（0=周日，1=周一，2=周二...6=周六）
        const currentDay = now.getDay();

        // 3. 计算需要添加的天数，以到达下一个周一
        let daysToAdd;
        if (currentDay === 0) {
            // 如果当前是周日，只需加1天就是周一
            daysToAdd = 1;
        } else if (currentDay === 1) {
            // 如果当前是周一
            const currentHours = now.getHours();
            const currentMinutes = now.getMinutes();
            const currentSeconds = now.getSeconds();
            // 判断是否已经过了周一凌晨0点，若已过则需要等下下周周一
            if (currentHours > 0 || currentMinutes > 0 || currentSeconds > 0) {
                daysToAdd = 7;
            } else {
                // 正好是周一凌晨0点，剩余时间为0
                daysToAdd = 0;
            }
        } else {
            // 周二到周六（2-6），计算距离周一的天数（例如周二需加6天，周三加5天...）
            daysToAdd = 8 - currentDay;
        }

        // 4. 创建下一个周一凌晨0点的Date对象
        const nextMonday = new Date(now);
        // 设置日期：当前日期 + 需要添加的天数
        nextMonday.setDate(now.getDate() + daysToAdd);
        // 设置时间为凌晨0点0分0秒
        nextMonday.setHours(0, 0, 0, 0);

        // 5. 计算时间差（毫秒数）
        const timeDiffMs = nextMonday.getTime() - now.getTime();
        // 若时间差为负数（理论上不会出现，做容错处理）
        if (timeDiffMs < 0) {
            return "00:00:00";
        }

        // 6. 将毫秒数转换为 小时:分钟:秒
        // 总秒数
        const totalSeconds = Math.floor(timeDiffMs / 1000);
        // 小时：总秒数 ÷ 3600
        const hours = Math.floor(totalSeconds / 3600);
        // 分钟：(总秒数 % 3600) ÷ 60
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        // 秒：总秒数 % 60
        const seconds = totalSeconds % 60;

        // 7. 补零处理，确保每个部分都是两位数，拼接成HH:MM:SS格式
        const formatNumber = (num) => num.toString().padStart(2, '0');
        return `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(seconds)}`;
    }

    async renderApply(arenaId) {
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId,
            str: arenaId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "isSignedUp", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                //console.log(data); // 处理响应数据
                if (data.success == '1') {
                    let map = data.data;
                    let isSignedUp = map["isSignedUp"]
                    let gameArenaRanks = map["gameArenaRanks"]
                    this.ArenaId = arenaId;
                    this.weiwanId = null
                    this.arenaRanking100 = []
                    this.node.active = true
                    if (isSignedUp) {
                        const create = map['gameArenaBattlecharacters'];
                        this.Item2.active = true
                        this.Item.active = false
                        this.apply.active = false
                        this.enterAnra.active = true
                        for (let i = 0; i < create.length; i++) {
                            var goIntoNum2 = create[i].goIntoNum
                            this.Item2.children[goIntoNum2 - 1].children[0].getComponent(Sprite).spriteFrame =
                                await util.bundle.load(`game/texture/frames/hero/Header/${create[i].id}/spriteFrame`, SpriteFrame)
                        }

                    } else {
                        this.Item.active = true
                        this.Item2.active = false
                        this.apply.active = true
                        this.enterAnra.active = false
                        const create = config.userData.characters.filter(x => x.goIntoNum != 0)
                        this.ArenaId = arenaId;
                        this.Item.children.forEach(n => n.children[0].getComponent(Sprite).spriteFrame = null)
                        for (let i = 0; i < create.length; i++) {
                            var goIntoNum = create[i].goIntoNum
                            this.Item.children[goIntoNum - 1].children[0].getComponent(Sprite).spriteFrame =
                                await util.bundle.load(`game/texture/frames/hero/Header/${create[i].id}/spriteFrame`, SpriteFrame)
                        }
                    }
                    if (gameArenaRanks && gameArenaRanks.length > 0) {
                        let gameArenaRank = gameArenaRanks[0]
                        this.header.getComponent(Sprite).spriteFrame =
                            await util.bundle.load(gameArenaRank.gameImg, SpriteFrame)
                        this.arenaRanking100 = gameArenaRanks
                        this.weiwanId = gameArenaRank.userId
                        this.winName.getComponent(Label).string = gameArenaRank.nickname
                        this.weiwanCount.getComponent(Label).string = gameArenaRank.weiwanCount

                    }
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );
    }

    async mobai() {
        AudioMgr.inst.playOneShot("sound/other/click");
        if (!this.weiwanId) {
            return await util.message.prompt({ message: "暂无冠军" })
        }
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: this.weiwanId,
            id: config.userData.userId,
            finalLevel: this.ArenaId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "mobai", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                //console.log(data); // 处理响应数据
                if (data.success == '1') {
                    this.weiwanCount.getComponent(Label).string = data.data.weiwanCount
                    config.userData.gold = data.data.gold
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                    const close = util.message.confirm({ message: data.errorMsg })
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );
    }
    goback() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
        this.node.parent.getChildByName("ArenaCrtl").active = true
    }

    async openArena() {
        // 1. 获取当前时间对象
        const now = new Date();

        // 2. 判断是否为周日（JavaScript中周日的星期值为0，周一至周六对应1-6）
        const isSunday = now.getDay() === 0;

        // 3. 获取当前小时数（24小时制，范围0-23）
        const currentHour = now.getHours();

        // 4. 核心判断：是否是周日 且 小时数大于等于22
        const isAfterSunday22 = isSunday && currentHour >= 22;
        if (isAfterSunday22) {
            return await util.message.prompt({ message: "赛季还未还开始，请耐心等待" })
        }
        const config = getConfig()
        const token = getToken()
        AudioMgr.inst.playOneShot("sound/other/click");
        if (this.ArenaId == 1) {
            const create = config.userData.characters.filter(x => x.goIntoNum != 0 && x.star > 3)
            if (create && create.length > 0) {
                return await util.message.prompt({ message: "初级擂台只能出战3星及以下卡牌" })
            }
            if (this._side1) {
                const k = config.userData.characters.filter(x => x.id == this._side1 && x.star > 3)
                if (k && k.length > 0) {
                    return await util.message.prompt({ message: "初级擂台只能出战3星及以下卡牌" })
                }
            }
            if (this._side2) {
                const k = config.userData.characters.filter(x => x.id == this._side2 && x.star > 3)
                if (k && k.length > 0) {
                    return await util.message.prompt({ message: "初级擂台只能出战3星及以下卡牌" })
                }
            }
        } else if (this.ArenaId == 2) {
            const create = config.userData.characters.filter(x => x.goIntoNum != 0 && x.star > 4)
            if (create && create.length > 0) {
                return await util.message.prompt({ message: "中级擂台只能出战4星及以下卡牌" })
            }
            if (this._side1) {
                const k = config.userData.characters.filter(x => x.id == this._side1 && x.star > 4)
                if (k && k.length > 0) {
                    return await util.message.prompt({ message: "中级擂台只能出战4星及以下卡牌" })
                }
            }
            if (this._side2) {
                const k = config.userData.characters.filter(x => x.id == this._side2 && x.star > 4)
                if (k && k.length > 0) {
                    return await util.message.prompt({ message: "中级擂台只能出战4星及以下卡牌" })
                }
            }
        }
        if (!this._side1 && !this._side2) {
            const result = await util.message.confirm({
                message: "确定不配置副卡吗?"
            })
            // 是否确定
            if (result === false) return
        }
        const postData = {
            token: token,
            userId: config.userData.userId,
            id: this._side1,
            str: this._side2,
            finalLevel: this.ArenaId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "arenaSignup", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                //console.log(data); // 处理响应数据
                if (data.success == '1') {
                    await this.node.parent.getChildByName("ArenaDetailCrtl")
                        .getComponent(ArenaDetailCrtl)
                        .render(this.ArenaId)
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );
    }


    public async zhuSelectCard(event: Event, customEventData: string) {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        this.cahracterQueue = []
        this.cahracterQueue = config.userData.characters
        this.cahracterQueue = this.cahracterQueue.filter(x => x.goIntoNum == 0)
        if (this._side1 && "1" != customEventData) {
            this.cahracterQueue = this.cahracterQueue.filter(x => this._side1 != x.id)
        }
        if (this._side2 && "2" != customEventData) {
            this.cahracterQueue = this.cahracterQueue.filter(x => this._side2 != x.id)
        }
        await this.renderfuCard(this.cahracterQueue, customEventData)
    }



    async renderfuCard(characterQueue: CharacterStateCreate[], customEventData) {
        await this.node.parent.getChildByName("SelectCardCtrl")
            .getComponent(SelectCardCtrl)
            .render(characterQueue, async (c, n) => {
                n.active = false
                this.clickFun(c, customEventData)
                return
            })
    }

    async clickFun(reg, customEventData) {
        if ("1" == customEventData) {
            this._side1 = reg.id
            this.side1.getComponent(Sprite).spriteFrame =
                await util.bundle.load(`game/texture/frames/hero/Header/${reg.id}/spriteFrame`, SpriteFrame)
        }

        if ("2" == customEventData) {
            this._side2 = reg.id
            this.side2.getComponent(Sprite).spriteFrame =
                await util.bundle.load(`game/texture/frames/hero/Header/${reg.id}/spriteFrame`, SpriteFrame)
        }
    }
    async render() {
        await this.node.parent.getChildByName("ArenaDetailCrtl")
            .getComponent(ArenaDetailCrtl)
            .render(this.ArenaId)
    }


    async openRanking() {
        AudioMgr.inst.playOneShot("sound/other/click");
        if (this.arenaRanking100 && this.arenaRanking100.length > 0) {
            await this.node.parent.getChildByName("ArenaRankingCrtl")
                .getComponent(ArenaRankingCrtl)
                .render(this.arenaRanking100, "--")
        }
    }
}


