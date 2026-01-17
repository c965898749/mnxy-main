import { _decorator, Component, Label, Node, Prefab, Sprite, SpriteFrame, UIOpacity } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

@ccclass('MapRankingCrtl')
export class MapRankingCrtl extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    @property(Node)
    ff3: Node
    initialized: boolean = false
    qingtongRanking = [];
    baiyingRanking = [];
    huangjinRanking = [];
    tanglangRanking = [];
    @property(Node)
    buttonNode: Node
    start() {
        this.refresh()
    }
    onEnable() {
        if (!this.initialized) {
            // 初始化代码
            this.initialized = true;
        } else {
            this.refresh()
        }

    }
    refresh() {

    }
    update(deltaTime: number) {

    }

    backPk() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }

    async render(map) {
        this.tanglangRanking = [];
        this.qingtongRanking = [];
        this.baiyingRanking = [];
        this.huangjinRanking = [];
        this.tanglangRanking = map["tanglangRanking"];
        this.qingtongRanking = map["qingtongRanking"];
        this.baiyingRanking = map["baiyingRanking"];
        this.huangjinRanking = map["huangjinRanking"];
        this.selectType(null, "1")
    }

    async selectType(event: Event, customEventData: string) {

        AudioMgr.inst.playOneShot("sound/other/click");
        this.buttonNode.children.forEach((btn) => {
            btn.getComponent(UIOpacity).opacity = 100
        })
        this.buttonNode.children[Number(customEventData) - 1].getComponent(UIOpacity).opacity = 255
        const config = getConfig()
        this.node.active = true
        const nodePool = util.resource.getNodePool(
            await util.bundle.load("prefab/ff3", Prefab)
        )
        const childrens = [...this.ContentNode.children]
        for (let i = 0; i < childrens.length; i++) {
            const node = childrens[i];
            nodePool.put(node)
        }
        if (customEventData == "1") {

            const userlist = this.tanglangRanking;
            this.ff3.getChildByName("Label").getComponent(Label).string = "lv " + config.userData.lv
            this.ff3.getChildByName("yxjm_df_txk").getChildByName("header").getComponent(Sprite).spriteFrame =
                await util.bundle.load(config.userData.gameImg, SpriteFrame)
            this.ff3.getChildByName("name").getComponent(Label).string = config.userData.nickname
            const index = userlist.findIndex((item) => item.userId === config.userData.userId)
            this.ff3.getChildByName("jingdu").getComponent(Label).string = "我当前进度：" + config.userData.chapter
            if (index === -1) {
                this.ff3.getChildByName("ranking").getChildByName("num").getComponent(Label).string = "暂未上榜"
            } else {
                this.ff3.getChildByName("ranking").getChildByName("num").getComponent(Label).string =
                    (index + 1).toString()
            }
            for (let i = 0; i < userlist.length; i++) {
                let item = nodePool.get()
                const [currentChapter, currentCalamity, currentStage] = userlist[i].chapter.split('-').map(Number);
                item.getChildByName("titleName").getComponent(Label).string = "第" + currentChapter + "章 " + userlist[i].titleName
                item.getChildByName("jieName").getComponent(Label).string = "第" + currentCalamity + "劫 " + userlist[i].jieName
                item.getChildByName("guanName").getComponent(Label).string = "第" + currentStage + "关 " + userlist[i].guanName
                item.getChildByName("name").getComponent(Label).string = userlist[i].nickname
                item.getChildByName("Lv").getComponent(Label).string = "lv " + userlist[i].lv
                item.getChildByName("ranking").getChildByName("num").getComponent(Label).string = userlist[i].gameRanking
                item.getChildByName("yxjm_df_txk").getChildByName("header").getComponent(Sprite).spriteFrame =
                    await util.bundle.load(userlist[i].gameImg, SpriteFrame)
                this.ContentNode.addChild(item)
                continue
            }
        } else {
            let userlist = []
            if (customEventData == "2") {
                userlist = this.qingtongRanking;
            } else if (customEventData == "3") {
                userlist = this.baiyingRanking;
            } else if (customEventData == "4") {
                userlist = this.huangjinRanking;
            }
            console.log(userlist, 333);
            this.ff3.getChildByName("Label").getComponent(Label).string = "lv " + config.userData.lv
            this.ff3.getChildByName("yxjm_df_txk").getChildByName("header").getComponent(Sprite).spriteFrame =
                await util.bundle.load(config.userData.gameImg, SpriteFrame)
            this.ff3.getChildByName("name").getComponent(Label).string = config.userData.nickname
            const index = userlist.findIndex((item) => item.userId === config.userData.userId)
            this.ff3.getChildByName("jingdu").getComponent(Label).string = "我当前进度：第 " + config.userData.bronze1 + " 层"
            if (index === -1) {
                this.ff3.getChildByName("ranking").getChildByName("num").getComponent(Label).string = "暂未上榜"
            } else {
                this.ff3.getChildByName("ranking").getChildByName("num").getComponent(Label).string =
                    (index + 1).toString()
            }
            for (let i = 0; i < userlist.length; i++) {
                let item = nodePool.get()
                item.getChildByName("titleName").getComponent(Label).string = "青铜塔"
                item.getChildByName("jieName").getComponent(Label).string = "第" + (userlist[i].floorNum > 100 ? 100 : userlist[i].floorNum) + "层"
                item.getChildByName("guanName").getComponent(Label).string = this.formatToAncientDate(userlist[i].passTime)
                item.getChildByName("name").getComponent(Label).string = userlist[i].nickname
                item.getChildByName("Lv").getComponent(Label).string = "lv " + userlist[i].lv
                item.getChildByName("ranking").getChildByName("num").getComponent(Label).string = userlist[i].gameRanking
                item.getChildByName("yxjm_df_txk").getChildByName("header").getComponent(Sprite).spriteFrame =
                    await util.bundle.load(userlist[i].gameImg, SpriteFrame)
                this.ContentNode.addChild(item)
                continue
            }

        }

    }

    /**
     * 时间戳/Date对象 转 「公元xxx年xx月xx日xxx时辰」格式
     * @param source 入参支持：秒级时间戳/毫秒级时间戳/Date对象
     * @returns 格式化后的古代时间字符串 例：公元2026年01月17日子时
     */
    formatToAncientDate(source: number | Date): string {
        // 步骤1：统一处理入参，转为标准Date对象
        let date: Date;
        if (source instanceof Date) {
            date = source;
        } else {
            let timestamp = source;
            // 自动识别10位秒级时间戳，转为毫秒级
            if (timestamp.toString().length === 10) {
                timestamp = timestamp * 1000;
            }
            date = new Date(timestamp);
        }

        // 步骤2：获取公历年月日，补0格式化
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString();
        const day = date.getDate().toString();

        // 步骤3：十二时辰对照规则（核心：23点为子时起点）
        const SHI_CHEN_MAP = [
            { start: 23, end: 1, name: '子时' },
            { start: 1, end: 3, name: '丑时' },
            { start: 3, end: 5, name: '寅时' },
            { start: 5, end: 7, name: '卯时' },
            { start: 7, end: 9, name: '辰时' },
            { start: 9, end: 11, name: '巳时' },
            { start: 11, end: 13, name: '午时' },
            { start: 13, end: 15, name: '未时' },
            { start: 15, end: 17, name: '申时' },
            { start: 17, end: 19, name: '酉时' },
            { start: 19, end: 21, name: '戌时' },
            { start: 21, end: 23, name: '亥时' }
        ];

        // 步骤4：根据当前小时匹配时辰
        const hours = date.getHours();
        let currentShiChen = '子时'; // 默认值
        for (const item of SHI_CHEN_MAP) {
            if (item.start === 23) {
                // 特殊处理子时：23点-凌晨1点
                if (hours >= 23 || hours < 1) {
                    currentShiChen = item.name;
                    break;
                }
            } else {
                if (hours >= item.start && hours < item.end) {
                    currentShiChen = item.name;
                    break;
                }
            }
        }

        // 步骤5：拼接最终格式：公元XXX年XX月XX日XX时辰
        return `${year}-${month}-${day} ${currentShiChen}`;
    }


}
