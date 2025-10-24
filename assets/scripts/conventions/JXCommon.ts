import { PART_PROPTS } from './../Game/Common/Define';





export const JXDef = {

    Time: {
        MS: 1,
        SECOND: 1000,
        MINUTE: 60 * 1000,
        HOUR: 60 * 60 * 1000,
        /**正式版 游戏中1年的原始时间 */
        GAMEYEAR: 15 * 60 * 1000,
        // GAMEYEAR: 10 * 1000
    },
    bundle: {
        texture: "texture",
        prefab: "prefabs",
        spine: "anis",
        // font: "font",
        data: "data",
        audio: "audio",
        // spineAc: "action",
        // bg: "bg",
    },
    umaPoint: {
        /**从游戏进入加载页 */
        inGameScene: "进入游戏",
        /**进入加载页 */
        loadScene: "进入加载页",
        /**看视频 */
        watchAdErr: "视屏错误",
        /**分享视频 */
        shareRecord: "分享录屏",
        /**vip打点 */
        VipCtrl: "vip界面",
        /**官爵 */
        officerCtrl: "官爵界面",
        /**签到 */
        signCtrl: "签到界面",
        /**商城 */
        storeCtrl: "商城界面",
        /**上阵 */
        goToBattle: "上阵界面",
        /**加成 */
        bless: "加成界面",
        /**英雄*/
        heroCtrl: "英雄界面",
        common: "通用界面",
        battle: "战斗",
        tower: "爬塔界面",
        setting: "设置界面",
        timeBox: "点击在线宝箱",
        levelBox: "关卡宝箱预览",
        heroTry: "英雄试用",
        openBook: "开局宝典",
        rewardCtrl: "恭喜获得领取",
        FeatureCtrl: "英雄特写界面",
        mainBox: "主页宝箱",
        detailsCtrl: "英雄详情",
        heroBattle: "布阵-上",
        blessEquip: "加持-",
        level4: "进入第四关玩家",
        guide: "新手引导",
        recruit: "抽卡招募界面",
    },
    Player: {

    },
    System: {
        /**自动保存玩家数据时间 */
        AUTO_SAVE_TIME: 1,
        /**签到轮回 */
        SIGN_ROUND: 7,
        /**公告路径 */
        NOTICE_PATH: "notice/",
    },
    SYS_CONFIG_KEY: {
        quality: 'quality',
        basicGem: 'basicGem',
        basicGold: 'basicGold',
        teamInterval: "teamInterval",
        monsterInterval: "monsterInterval",
        basicsWheat: "basicsWheat",
        basicWheat: "basicWheat",

        wheatTime: "wheatTime",
        lvCap: 'lvCap',
        sell: 'sell',
        free: 'free',
        twoUp: "twoUp",
        weakNpc: "weakNpc",
        white: 'white',
        green: 'green',
        Blue: 'Blue',
        purple: 'purple',
        orange: 'orange',
        red: 'red',
        bossNpc: "bossNpc",
        equipFitMoney: 'equipFitMoney',
        equipFitOdds: 'equipFitOdds',
        basic: "basic",
        silverBoxOpen: 'silverBoxOpen',
        GoldBoxOpen: 'GoldBoxOpen',
        dearBoxOpen: 'dearBoxOpen',
        videoForging: 'videoForging',
        heroresolve: 'heroresolve',
        towerPressTime: "towerPressTime",
        videoAwardsGold: 'videoAwardsGold',
        videoAwardsGem: 'videoAwardsGem',
        heroTv: 'heroTv',
        defScale: "defScale",
        boxDraw1: 'boxDraw1',
        boxDraw2: 'boxDraw2',
        boxDraw3: 'boxDraw3',
        forageUp: "forageUp",
        noticeTime: 'noticeTime',
        aidOpen: 'aidOpen',
        onceCard: "onceCard",
        guideHero: "guideHero",
        stoneDraw: "stoneDraw",
        stone1: "stone1",
        cerDrawCost: "jinzita",
      

    },
    LOCAL_KEY: {
    },
    SYS_IDENTITY_ID: {
        /**
         * 窗口ID规则： 一级窗口 ： A, 二级窗口B,或者一级切页，三级窗口C, 或者二级切页。
         * 1. 存在明显从属关系： AABBCC
         * 2. 通用窗口，没有明显上下级关系，不计算缺失的层级
         * 3. 窗口ID的层级只能说是尽量划分，实际游戏种的UI可能会出现越层现象，比如说抽卡上面可能有仙灵详情和技能UI。
         */
        /**加载页 */
        load: 100001,
        /**主页 */
        home: 100000,
        /**vip界面 */
        vip: 100100,
        /**关卡选择 */
        levelCtrl: 100200,
        /**签到界面 */
        sginIn: 100102,
        /**官爵界面 */
        officer: 100103,
        /**英雄信息界面 */
        detailsCtrl: 100104,
        /**加持界面 */
        blessCtrl: 100105,
        /**设置界面 */
        setting: 100106,
        /**竞技场 */
        //  towerCtrl: 100107,
        /**装备详情页 */
        EquipDetailsCtrl: 100107,

        FightDataPreView: 100108,

        TimeLimitGift: 100109,

        RankView: 100110,

        PowerUp: 100111,

        /**强化成功 */
        strengthenView: 200001,
        /**技能详情 */
        skillPage: 200002,
        /**通用框 */
        currencyFrame: 200003,
        /**宝箱预览 */
        previewCtrl: 200004,
        /**特写界面 */
        featureCtrl: 200005,
        /**宝库 */
        storePage: 101000,
        /**英雄分页 */
        heroPage: 102000,
        heroTry: 102001,
        openBox: 102002,
        /**主页分页 */
        mainPage: 103000,
        /**布阵分页 */
        squadPage: 104000,
        /**加持分页 */
        equipPage: 105000,
        /**招募分页 */
        recruitPage: 106000,
        /**战斗界面*/
        fightLayer: 601000,
        fightLayerPut: 601001,

        guessLayer: 601002,
        ceremonialGiftView: 601003,
        dailyView: 601004,



        /**戰鬥結算 */
        battleResult: 602000,
        battleResultView: 602006,
        /**战斗结算奖励 */
        battleReward: 602002,
        /**领取奖励界面 */
        rewardCtrl: 602001,
        guessResultView: 602007,

        /**翻牌界面 */
        recuitCardCtrl: 602003,

        MoreGameCtrl: 603001,

        DaioCanView: 603002,

    },
}

export class JXVec2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number) {
        this.x = x || 0;
        this.y = y || 0;
    }
}

export class JXMath {
    /**
     * 根据当前坐标到目标目标计算先x后y的路线
     * @param air 目标坐标
     * @param cur 当前坐标
     * @param type 数值类型 
     */
    public static getRightAngleRoute<T extends { x: number, y: number }>(air: T, cur: T, type: { new(x: number, y: number): T }): T[] {
        let ret: T[] = [];
        if (air.x != cur.x) {
            let step = (air.x - cur.x) / Math.abs(air.x - cur.x);
            for (let x = cur.x; x != air.x; x += step) {
                ret.push(new type(x + step, cur.y));
            }
        }
        if (air.y != cur.y) {
            let step = (air.y - cur.y) / Math.abs(air.y - cur.y);
            for (let y = cur.y; y != air.y; y += step) {
                ret.push(new type(air.x, y + step));
            }
        }
        return ret;
    }

    /**
     * 二维转一维索引
     * @param x x坐标，起始为0
     * @param y y坐标，起始为0
     * @param width 长度
     */
    public static encodeV2xxyy(x: number, y: number, width: number): number {
        return (y) * width + (x);
    };

    /**
     * 一维索引转为二维坐标
     * @param idx 地图索引
     */
    public static decodeV2xxyy(idx: number, width: number): [number, number] {
        let x = idx % width;
        let y = Math.floor(idx / width);
        return [x, y];
    }

    /**
     * 获取二维直角坐标系下相邻整数坐标对应索引
     * @param idx 索引格子
     * @param width 网格宽度
     * @param height 网格高度
     */
    public static getV2NeighborIds(idx: number, width: number, height: number): number[] {
        let result = [];
        let [x, y] = this.decodeV2xxyy(idx, width);
        for (let x1 = x - 1; x1 <= x + 1; x1++) {
            for (let y1 = y - 1; y1 <= y + 1; y1++) {
                if (x1 < 0 || x1 >= width) continue;
                if (y1 < 0 || y1 >= height) continue;
                if (x1 == x && y1 == y) continue;
                result.push(this.encodeV2xxyy(x1, y1, width))
            }
        }

        return result;
    }

    /**
     * 副本地图计算上一次步长的位置
     * @param last 上一次的当前位置
     * @param cur 这一次的当前位置
     * @param type 构造
     */
    public static getLastStepPos<T extends { x: number, y: number }>(last: T, cur: T, type: { new(x: number, y: number): T }): T {
        if (cur.y - last.y >= 1) {
            let step = (cur.y - last.y) / Math.abs(cur.y - last.y);
            return new type(cur.x, cur.y - step);
        }
        else {
            let step = (cur.x - last.x) / Math.abs(cur.x - last.x);
            return new type(cur.x - step, cur.y);
        }
    }

    public static newArray(len: number, fill?: number): Array<number> {
        let arr = [];
        for (let i = 0; i < len; i++) {
            arr.push(fill || 0);
        }
        return arr;
    }



    /**
     * 数组乱序
     * @param array 需要乱序的数组
     * @param random 随机函数
     * @param isSelf 是否打乱自身，默认打乱自身
     */
    public static shuffle<T>(array: Array<T>, random: { (): number }, isSelf = true): Array<T> {
        let result: Array<T>;
        if (!isSelf) {
            result = [];
            for (let i = 0; i < array.length; i++) {
                result.push(array[i]);
            }
        } else {
            result = array;
        }
        let m = result.length;
        let t, j;
        while (m) {
            j = Math.floor(random() * m--);
            t = result[m];
            result[m] = result[j];
            result[j] = t;
        }
        return result;
    }

    public static getZhanli(propts: number[]) {
        // let prop = (propts[PART_PROPTS.GongJi] + propts[PART_PROPTS.FangYu] + propts[PART_PROPTS.BingGong] + propts[PART_PROPTS.BingKang] + propts[PART_PROPTS.HuoGong] + propts[PART_PROPTS.GongJi] + propts[PART_PROPTS.HuoKang]) * 3
        // let zhanli = (prop + propts[PART_PROPTS.XueLiang]) * (propts[PART_PROPTS.BaoJi] + propts[PART_PROPTS.BaoShang] + propts[PART_PROPTS.ShanBi])
        let zhanli = propts[PART_PROPTS.GongJi] * 25 + propts[PART_PROPTS.FangYu] * 25 + propts[PART_PROPTS.XueLiang] + propts[PART_PROPTS.BaoJi] * 2 + 500 * propts[PART_PROPTS.ShanBi] + 300 * (propts[PART_PROPTS.HuoGong] + propts[PART_PROPTS.HuoKang] + propts[PART_PROPTS.BingGong] + propts[PART_PROPTS.BingKang])
        return zhanli;
    }

    public static getEquipZhanli(propts: number[]) {
        // let prop = (propts[PART_PROPTS.GongJi] + propts[PART_PROPTS.FangYu] + propts[PART_PROPTS.BingGong] + propts[PART_PROPTS.BingKang] + propts[PART_PROPTS.HuoGong] + propts[PART_PROPTS.GongJi] + propts[PART_PROPTS.HuoKang]) * 3
        //  let zhanli = (prop + propts[PART_PROPTS.XueLiang]) * (1 + propts[PART_PROPTS.BaoJi] + propts[PART_PROPTS.BaoShang] + propts[PART_PROPTS.ShanBi])

        let zhanli = propts[PART_PROPTS.GongJi] * 25 + propts[PART_PROPTS.FangYu] * 25 + propts[PART_PROPTS.XueLiang] + propts[PART_PROPTS.BaoJi] * 2 + 500 * propts[PART_PROPTS.ShanBi] + 300 * (propts[PART_PROPTS.HuoGong] + propts[PART_PROPTS.HuoKang] + propts[PART_PROPTS.BingGong] + propts[PART_PROPTS.BingKang])
        return zhanli;
    }
}
/** 通用随机类 */
export class JXRandom {
    /** 随机函数获取函数 */
    protected _getPrng: { (seed: string): { (): number } }
    /** 随机函数 , 已定随机种子的获取函数*/
    protected _prng: { (): number }
    public get prng(): { (): number } {
        if (!this._prng) {
            this._prng = this._getPrng(this._seed);
        }
        return this._prng;
    }

    /** 随机种子 */
    protected _seed: string;
    /** 随机次数 */
    protected _nRandomTimes: number = 0;
    /** 获取随机种子 */
    public get seed(): string {
        return this._seed
    }
    /**
     * 随机构造类
     * @param getPrng 随机种子获取函数
     * @param seed 可选，随机种子
     */
    constructor(getPrng: { (seed: string): { (): number } }, seed?: string) {
        if (!getPrng) {
            throw new Error("the genPrng call back is not ready!");
        }
        this._getPrng = getPrng;
        this._seed = seed || Date.now().toString();
    }

    /** 获取一个随机数 */
    public getRandom(): number {
        this._nRandomTimes++;
        return this.prng();
    }

    /**
     * 根据随机区间，获取随机整数
     * @param min 最小值
     * @param max 最大值
     */
    public randomFloor(min?: number, max?: number): number {
        min = min || 0;
        max = max || 100;
        let res = Math.floor(min + this.getRandom() * (max - min));
        return res;
    }
    /**
     * 根据随机区间，获取不重复的随机整数组
     * @param len 获取长度
     * @param min 最小值
     * @param max 最大值
     */
    public randoms(len: number, min: number, max: number): number[] {
        // if (len >= (max - min)) return JXMath.newArray(max - min).map((v, i) => i + min);
        let arr = JXMath.newArray(max - min).map((v, i) => i + min);
        var rds = new Array();
        for (var i = 0; i < len; i++) {
            if (arr.length <= 0) break;
            var arrIndex = Math.floor(this.randomFloor(0, arr.length));
            rds[i] = arr[arrIndex];
            arr.splice(arrIndex, 1);
        }
        return rds;
    }

    // public clamp(clamp: number, min?: number, max?: number): number {
    // }
}
// 指定长度和基数生成uuid
export function generateUid(len?: number, radix?: number): string {
    let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    let uuid = [],
        i;
    radix = radix || chars.length;

    if (len) {
        // Compact form
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    } else {
        // rfc4122, version 4 form
        let r;

        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }

    return uuid.join('');
}