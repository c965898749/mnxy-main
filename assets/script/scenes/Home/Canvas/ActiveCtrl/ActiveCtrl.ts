import { _decorator, Component, Label, Node, RichText, Sprite, SpriteFrame } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

@ccclass('ActiveCtrl')
export class ActiveCtrl extends Component {

    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;

    @property(Node)
    Page: Node
    public page: string
    initialized: boolean = false
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
    update(deltaTime: number) {

    }

    async refresh() {
        // db://assets/resources/image/ad/ad3.jpg

        this.Page.getComponent(Sprite).spriteFrame = await util.bundle.load("image/HotEvents/" + this.page + "/spriteFrame", SpriteFrame)
        var content = `<color=#FFD700><size=28><b>          QQ神仙招募开启，重返青春战场！</b></size></color>
<color=#FFFFFF><size=20>亲爱的玩家朋友们：</size></color>

<color=#98FB98><size=19>     个人独戏《QQ神仙》正式开启！相信无数的玩家为这一天已经等待了很久，凝聚了万千用户期待的QQ神仙，超燃时代正式拉开帷幕！</size></color>

<color=#98FB98><size=19>为迎接大家的热情，我们也准备了丰富的运营活动：</size></color>
<color=#FFA500><size=18>★ 梦回2013活动礼包，助力仙友再续前缘，含10000钻、1个女娲石和30000银两</size></color>
<color=#FFA500><size=18>★ 累计登录7天，领取传说伙伴【瑶池仙女】</size></color>
<color=#FFA500><size=18>★ 新手成长礼包，含1000钻石+2个体力药</size></color>
<color=#FFA500><size=18>★ 助力升级，每升1级奖励1000钻石+3.5万银两</size></color>

<color=#87CEFA><size=18>如有任何问题，请联系客服：</size></color>
<color=#FFFFFF><size=16>▶ 游戏内：祭坛-客服石碑</size></color>
<color=#FFFFFF><size=16>▶ 官方①QQ群：587452663</size></color>
<color=#FFFFFF><size=16>▶ GM邮箱：chengzhixiang2023@163.com</size></color>

<color=#FF69B4><size=18>感谢各位玩家的支持与理解，祝大家游戏愉快！</size></color>
<color=#CCCCCC><size=14>【QQ神仙依梦工作室】2025年12月21日</size></color>`
        if (this.page == "page2") {
            content = `<color=#FFD700><size=28><b>【擂台争霸赛】全新赛季开启公告</b></size></color>
<color=#FFFFFF><size=20>各位武道强者：</size></color>

<color=#FFA500><size=19>万众期待的擂台争霸赛S3赛季即将开启，赛事详情如下：</size></color>
<color=#FFFF00><size=18>▶ 报名时间：12月27日（周六00:00-20:00)</size></color>
<color=#FFFF00><size=18>▶ 参赛条件：报名费5000金币</size></color>
<color=#FFFF00><size=18>▶ 比赛时间：12月29日（每晚20:00-23:00)</size></color>

<color=#FFA500><size=19>赛事规则：</size></color>
<color=#FFFFFF><size=17>1. 报名时间可调整护法以及阵容</size></color>
<color=#FFFFFF><size=17>2. 比赛时间不可替换护法（系统固定）</size></color>
<color=#FFFFFF><size=17>3. 采用单败淘汰赛制，可手动调整顺序（每轮1分钟内）</size></color>
<color=#FFFFFF><size=17>4. 擂台赛下级（只允许3星以及下护法,10級以下玩家属性上升：80%）</size></color>
<color=#FFFFFF><size=17>5. 擂台赛中级（只允许4星以及下护法, 21級以下玩家属性上升：40%）</size></color>
<color=#FFFFFF><size=17>6. 擂台赛大师(只允许4星以及上护法)</size></color>
<color=#FFFFFF><size=17>7. 周末16强晋级冠亚季军，全服玩家可参与竞猜</size></color>
<color=#FFFFFF><size=17>8. 场次不足8人，则不进行赛事</size></color>


<color=#FF6347><size=19>冠军奖励（价值超10000钻石）：</size></color>
<color=#FF4500><size=18>★ 专属称号【擂台霸主】（永久属性加成）</size></color>
<color=#FF4500><size=18>★ 传说级武器【如意金箍棒】</size></color>
<color=#FF4500><size=18>★ 争霸赛冠军雕像（主城广场展示1个月）</size></color>
<color=#FF4500><size=18>★ 钻石*5000 + 魂力宝珠*5</size></color>

<color=#87CEFA><size=18>赛事相关问题：</size></color>
<color=#FFFFFF><size=16>▶ 游戏内：祭坛-客服石碑</size></color>
<color=#FFFFFF><size=16>▶ 官方①QQ群：587452663</size></color>
<color=#FFFFFF><size=16>▶ GM邮箱：chengzhixiang2023@163.com</size></color>

<color=#FF69B4><size=18>狭路相逢勇者胜，擂台之上，等你来战！</size></color>
<color=#CCCCCC><size=14>【QQ神仙依梦工作室】2025年12月21日</size></color>`
        }
        if (this.page == "BlazingMaze") {
            content = `<color=#FF4500><size=28><b>【烈焰迷阵】版本更新与副本探险活动公告</b></size></color>
<color=#FFE4B5><size=20>亲爱的烈焰勇士们：</size></color>

<color=#FFA500><size=19>为优化副本探险体验，游戏将于以下时间进行版本更新：</size></color>
<color=#FFFF00><size=18>▶ 维护时间：2025年12月21日 09:00-13:00（预计4小时）</size></color>
<color=#FFFF00><size=18>▶ 维护范围：全服所有服务器</size></color>
<color=#FF6347><size=18>▶ 维护补偿：钻石*5000 + 金币*10万 + 魂魄*500</size></color>

<color=#FFA500><size=19>本次更新内容：</size></color>
<color=#FFFFFF><size=17>1. 第二章【冲向妖界】关卡，掉落传说级【萌年兽】合成材料</size></color>
<color=#FFFFFF><size=17>2. 卡牌合成，增加传说级【萌年兽】合成图谱</size></color>


<color=#87CEFA><size=18>遇到烈焰屏障？联系我们：</size></color>
<color=#FFFFFF><size=16>▶ 游戏内：祭坛-客服石碑</size></color>
<color=#FFFFFF><size=16>▶ 官方①QQ群：587452663</size></color>
<color=#FFFFFF><size=16>▶ GM邮箱：chengzhixiang2023@163.com</size></color>

<color=#FF69B4><size=18>愿火焰指引你的道路，勇士们！</size></color>
<color=#CCCCCC><size=14>【QQ神仙依梦工作室】2025年12月21日</size></color>`
        }
        if (this.page == "NetherBattlefield") {
            content = `<color=#FF4500><size=28><b>【幽冥战域】版本更新与副本探险活动公告</b></size></color>
<color=#FFE4B5><size=20>亲爱的烈焰勇士们：</size></color>

<color=#FFA500><size=19>为优化副本探险体验，游戏将于以下时间进行版本更新：</size></color>
<color=#FFFF00><size=18>▶ 维护时间：2025年12月21日 09:00-13:00（预计4小时）</size></color>
<color=#FFFF00><size=18>▶ 维护范围：全服所有服务器</size></color>
<color=#FF6347><size=18>▶ 维护补偿：钻石*5000 + 金币*10万 + 魂魄*500</size></color>

<color=#FFA500><size=19>本次更新内容：</size></color>
<color=#FFFFFF><size=17>1. 第四章【地府改命】关卡，掉落传说级【阎王】合成材料</size></color>
<color=#FFFFFF><size=17>2. 卡牌合成，增加传说级【阎王】合成图谱</size></color>


<color=#87CEFA><size=18>遇到烈焰屏障？联系我们：</size></color>
<color=#FFFFFF><size=16>▶ 游戏内：祭坛-客服石碑</size></color>
<color=#FFFFFF><size=16>▶ 官方①QQ群：587452663</size></color>
<color=#FFFFFF><size=16>▶ GM邮箱：chengzhixiang2023@163.com</size></color>

<color=#FF69B4><size=18>愿火焰指引你的道路，勇士们！</size></color>
<color=#CCCCCC><size=14>【QQ神仙依梦工作室】2025年12月21日</size></color>`
        }
        if (this.page == "CelestialSpiritArchgeneral") {
            content = `<color=#FF4500><size=28><b>【圣灵天将】版本更新与副本探险活动公告</b></size></color>
<color=#FFE4B5><size=20>亲爱的烈焰勇士们：</size></color>

<color=#FFA500><size=19>为优化副本探险体验，游戏将于以下时间进行版本更新：</size></color>
<color=#FFFF00><size=18>▶ 维护时间：2025年12月21日 09:00-13:00（预计4小时）</size></color>
<color=#FFFF00><size=18>▶ 维护范围：全服所有服务器</size></color>
<color=#FF6347><size=18>▶ 维护补偿：钻石*5000 + 金币*10万 + 魂魄*500</size></color>

<color=#FFA500><size=19>本次更新内容：</size></color>
<color=#FFFFFF><size=17>1. 第五章【大闹天宫】关卡，掉落传说级【圣灵天将】合成材料</size></color>
<color=#FFFFFF><size=17>2. 卡牌合成，增加传说级【圣灵天将】合成图谱</size></color>


<color=#87CEFA><size=18>遇到烈焰屏障？联系我们：</size></color>
<color=#FFFFFF><size=16>▶ 游戏内：祭坛-客服石碑</size></color>
<color=#FFFFFF><size=16>▶ 官方①QQ群：587452663</size></color>
<color=#FFFFFF><size=16>▶ GM邮箱：chengzhixiang2023@163.com</size></color>

<color=#FF69B4><size=18>愿火焰指引你的道路，勇士们！</size></color>
<color=#CCCCCC><size=14>【QQ神仙依梦工作室】2025年12月21日</size></color>`
        }
        if (this.page == "page4") {
            content = `<size=30><color=#FFD700><b>【试炼塔开启 登顶赢锻造神材】</b></color></size>
<color=#FFE4B5><size=20>亲爱的烈焰勇士们：</size></color>

<color=#FFA500><size=20>全新试炼塔现已震撼开放！共设三大段位，层层闯关，步步为营，<color=#FFFFFF><b>海量锻造材料</b></color>等你来拿，助力打造专属仙侠神装！</size></color>
<size=19>
<color=#CD7F32><b>◆ 青铜之塔 ◆</b></color>
<color=#FFFFFF>入门试炼，新手进阶必争之地
通关奖励：<color=#CD7F32>青铜矿、初级强化石</color>
适用装备：新手过渡武器/防具</color>
<color=#C0C0C0>────────────────</color>
<color=#E6E6FA><b>◆ 白银之塔 ◆</b></color>
<color=#FFFFFF>高手角逐，实力验证进阶战场
通关奖励：<color=#E6E6FA>玄铁矿、中级强化石</color>
适用装备：精品仙侠套装部件</color>
<color=#C0C0C0>────────────────</color>
<color=#FFD700><b>◆ 黄金之塔 ◆</b></color>
<color=#FFFFFF>巅峰对决，登顶者傲视全服
通关奖励：<color=#FFD700>紫金石、高级强化石、顶级神器图谱</color>
适用装备：传说级仙侠神装</color>
<color=#C0C0C0>▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁</color>
<color=#FF6B6B><b>【挑战规则】</b></color>
<color=#FFFFFF>1. 每日可免费挑战3次，次数耗尽可消耗仙玉重置
2. 每段位分100层，逐层通关解锁下一层奖励
3. 通关塔顶后选择一键探索，将自动探索
4. 通关黄金之塔顶层可获得<b>专属称号：【塔王】</b></color>

<color=#4ECDC4><b>【锻造指引】</b></color>
<color=#FFFFFF>收集对应段位材料后，可前往【装备打造】打造/强化装备
高段位材料可合成高品质道具，神装进阶不容错过！</color></size>

<color=#87CEFA><size=18>遇到烈焰屏障？联系我们：</size></color>
<color=#FFFFFF><size=16>▶ 游戏内：祭坛-客服石碑</size></color>
<color=#FFFFFF><size=16>▶ 官方①QQ群：587452663</size></color>
<color=#FFFFFF><size=16>▶ GM邮箱：chengzhixiang2023@163.com</size></color>

<color=#FFD700><size=18><b>即刻登顶试炼塔，锻造你的专属仙侠神兵！</b></size></color>
<color=#CCCCCC><size=14>【QQ神仙依梦工作室】2026年1月11日</size></color>
`
        }
        //         if (this.page == "page4") {
        //             content = `<color=#FFD700><size=28><b>【福利狂欢】海量奖励限时派送中！</b></size></color>
        // <color=#FFFFFF><size=20>各位玩家请注意！多重福利盛宴已开启，多重错过！</size></color>

        // <color=#FF6347><size=20>✨ 全民登录豪礼 ✨</size></color>
        // <color=#FFFF00><size=18>▶ 累计登录2天：钻石*500</size></color>
        // <color=#FFFF00><size=18>▶ 累计登录5天：开荒神器【轩辕剑】</size></color>
        // <color=#FFFF00><size=18>▶ 累计登录7天：传说伙伴【瑶池仙女】</size></color>

        // <color=#FF6347><size=20>🎁 兑换福利 🎁</size></color>
        // <color=#FFFF00><size=18>▶ 拒绝玄学，集齐指定素材可合成：传说级4.5星伙伴【齐天大圣】等</size></color>
        // <color=#FFFF00><size=18>▶ 完成日常任务额外得：限定头像框「福利达人」</size></color>
        // <color=#FFFF00><size=18>▶ 分享活动至社交平台：钻石*100 + 10万*金币</size></color>

        // <color=#FFA500><size=19>活动时间：永久</size></color>
        // <color=#FFA500><size=19>分享活动奖励领取：祭坛-客服石碑</size></color>

        // <color=#87CEFA><size=18>奖励发放问题请联系：</size></color>
        // <color=#FFFFFF><size=16>▶ 游戏内：祭坛-客服石碑</size></color>
        // <color=#FFFFFF><size=16>▶ 官方①QQ群：587452663</size></color>
        // <color=#FFFFFF><size=16>▶ GM邮箱：chengzhixiang2023@163.com</size></color>

        // <color=#FF69B4><size=18>海量奖励已就位，快来领取属于你的专属福利！</size></color>
        // <color=#CCCCCC><size=14>【QQ神仙依梦工作室】2025年12月21日</size></color>`
        //         }
        if (this.page == "KongtongSealCtrl") {
            content = `<color=#9932CC><size=28><b>【崆峒窟】副本每周六开启！</b></size></color>
<color=#E6E6FA><size=20>各位召唤师，传说中的崆峒印已现世，限时召唤开启！</size></color>

<color=#FFFFFF><size=20>狼妖偶然得到了一批崆峒印，实力大涨不知天高地厚地到处为害世间。炼妖师赶快出手降妖，夺回崆峒印吧!集齐5个3星崆峒印，就能合成3.5星崆峒印，集齐5个3.5星崆峒印，就能合成4星战将!单个3.5星崆峒印还能和任意星级的满级卡牌合成出3.5星战将哦!</size></color>
<color=#FFA500><size=19>副本开启时间：</size></color>
<color=#FFFF00><size=18>▶ 每周六 00:00 - 23:00</size></color>
<color=#FFFF00><size=18>▶ 挑战次数：每日3次</size></color>
 
<color=#87CEFA><size=18>召唤入口：</size></color>
<color=#FFFFFF><size=16>▶ 探险-热门活动</size></color>
<color=#FFFFFF><size=16>▶ 疑问咨询：chengzhixiang2023@163.com</size></color>

<color=#FF69B4><size=18>抓住时机，让顶级神将助你横扫战场！</size></color>
<color=#CCCCCC><size=14>【QQ神仙依梦工作室】2025年12月21日</size></color>`
        }
        this.ContentNode.getComponent(RichText).string = content
    }

    async goBack2() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("ActiveCtrl").active = false
    }

    init(name: string) {
        this.page = name;
        console.log(this.page)
    }

}


