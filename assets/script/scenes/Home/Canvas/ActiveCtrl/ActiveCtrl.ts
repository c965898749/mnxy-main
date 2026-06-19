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
<color=#FFA500><size=18>★ 新手成长礼包，含1000灵石+2个体力药</size></color>
<color=#FFA500><size=18>★ 助力升级，每升1级奖励1000灵石+3.5万银两</size></color>

<color=#87CEFA><size=18>如有任何问题，请联系客服：</size></color>
<color=#FFFFFF><size=16>▶ 游戏内：祭坛-客服石碑</size></color>
<color=#FFFFFF><size=16>▶ 官方①QQ群：1092641657</size></color>
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


<color=#FF6347><size=19>冠军奖励（价值超10000灵石）：</size></color>
<color=#FF4500><size=18>★ 专属称号【擂台霸主】（永久属性加成）</size></color>
<color=#FF4500><size=18>★ 传说级武器【如意金箍棒】</size></color>
<color=#FF4500><size=18>★ 争霸赛冠军雕像（主城广场展示1个月）</size></color>
<color=#FF4500><size=18>★ 灵石*5000 + 魂力宝珠*5</size></color>

<color=#87CEFA><size=18>赛事相关问题：</size></color>
<color=#FFFFFF><size=16>▶ 游戏内：祭坛-客服石碑</size></color>
<color=#FFFFFF><size=16>▶ 官方①QQ群：1092641657</size></color>
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
<color=#FF6347><size=18>▶ 维护补偿：灵石*5000 + 金币*10万 + 魂魄*500</size></color>

<color=#FFA500><size=19>本次更新内容：</size></color>
<color=#FFFFFF><size=17>1. 第二章【冲向妖界】关卡，掉落传说级【萌年兽】合成材料</size></color>
<color=#FFFFFF><size=17>2. 卡牌合成，增加传说级【萌年兽】合成图谱</size></color>


<color=#87CEFA><size=18>遇到烈焰屏障？联系我们：</size></color>
<color=#FFFFFF><size=16>▶ 游戏内：祭坛-客服石碑</size></color>
<color=#FFFFFF><size=16>▶ 官方①QQ群：1092641657</size></color>
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
<color=#FF6347><size=18>▶ 维护补偿：灵石*5000 + 金币*10万 + 魂魄*500</size></color>

<color=#FFA500><size=19>本次更新内容：</size></color>
<color=#FFFFFF><size=17>1. 第四章【地府改命】关卡，掉落传说级【阎王】合成材料</size></color>
<color=#FFFFFF><size=17>2. 卡牌合成，增加传说级【阎王】合成图谱</size></color>


<color=#87CEFA><size=18>遇到烈焰屏障？联系我们：</size></color>
<color=#FFFFFF><size=16>▶ 游戏内：祭坛-客服石碑</size></color>
<color=#FFFFFF><size=16>▶ 官方①QQ群：1092641657</size></color>
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
<color=#FF6347><size=18>▶ 维护补偿：灵石*5000 + 金币*10万 + 魂魄*500</size></color>

<color=#FFA500><size=19>本次更新内容：</size></color>
<color=#FFFFFF><size=17>1. 第五章【大闹天宫】关卡，掉落传说级【圣灵天将】合成材料</size></color>
<color=#FFFFFF><size=17>2. 卡牌合成，增加传说级【圣灵天将】合成图谱</size></color>


<color=#87CEFA><size=18>遇到烈焰屏障？联系我们：</size></color>
<color=#FFFFFF><size=16>▶ 游戏内：祭坛-客服石碑</size></color>
<color=#FFFFFF><size=16>▶ 官方①QQ群：1092641657</size></color>
<color=#FFFFFF><size=16>▶ GM邮箱：chengzhixiang2023@163.com</size></color>

<color=#FF69B4><size=18>愿火焰指引你的道路，勇士们！</size></color>
<color=#CCCCCC><size=14>【QQ神仙依梦工作室】2025年12月21日</size></color>`
        }
        if (this.page == "page4") {
            content = `<color=#FFFFFF><size=20>各位道友：</size>
<color=#FFA500><size=19>全新五星限定卡牌、全新矿场玩法、属性上限增益重磅上线，助力各位道友潜心修炼、纵横三界，具体更新详情如下：</size>

<color=#FFFF00><size=18>▶ 全新五星卡牌：太上老君限定魂魄来袭</size><color=#FFFF00><size=18>▶ 魂魄获取方式：完成每日任务，开启活跃宝箱即可100%获取太上老君五星卡魂魄</size>
<color=#FFFF00><size=18>▶ 卡牌合成规则：集齐180个太上老君五星魂魄，即可合成完整五星太上老君卡牌</size>
<color=#FFA500><size=19>全新修炼玩法更新：</size>
<color=#FFFFFF><size=17>1. 新增矿场抢夺玩法，道友可通过矿场挑战抢夺海量修炼资源，大幅提升修炼速度</size>
<color=#FFFFFF><size=17>2. 全方位优化修炼体系，解锁全新资源获取渠道，告别修炼停滞，提速进阶</size>
<color=#FFFFFF><size=17>3. 大幅度提升全服玩家活力上限、体力上限，解锁更多玩法次数，自由探索三界</size>
<color=#FFFFFF><size=17>4. 活力、体力上限为永久增益，所有道友上线即可自动生效，无需手动激活</size>
<color=#FF6347><size=19>五星太上老君卡牌专属优势：</size><color=#FF4500><size=18>★ 顶级五星仙卡资质，附带专属仙法buff，战力大幅跃升</size>
<color=#FF4500><size=18>★ 契合修炼体系特性，搭配矿场玩法可额外提升资源获取效率</size><color=#FF4500><size=18>★ 稀有永久卡牌，属性稳定增益，助力道友登顶武道巅峰</size>

<color=#87CEFA><size=18>玩法问题咨询渠道：</size>
<color=#FFFFFF><size=16>▶ 游戏内：祭坛-客服石碑</size>
<color=#FFFFFF><size=16>▶ 官方①QQ群：1092641657</size>
<color=#FFFFFF><size=16>▶ GM邮箱：chengzhixiang2023@163.com</size>

<color=#FF69B4><size=18>仙卡现世助力修行，矿场争锋问鼎仙途，各位道友速速启程！</size>
<color=#CCCCCC><size=14>【QQ神仙依梦工作室】2026年6月19日</size> `
        }
        //         if (this.page == "page4") {
        //             content = `<color=#FFD700><size=28><b>【福利狂欢】海量奖励限时派送中！</b></size></color>
        // <color=#FFFFFF><size=20>各位玩家请注意！多重福利盛宴已开启，多重错过！</size></color>

        // <color=#FF6347><size=20>✨ 全民登录豪礼 ✨</size></color>
        // <color=#FFFF00><size=18>▶ 累计登录2天：灵石*500</size></color>
        // <color=#FFFF00><size=18>▶ 累计登录5天：开荒神器【轩辕剑】</size></color>
        // <color=#FFFF00><size=18>▶ 累计登录7天：传说伙伴【瑶池仙女】</size></color>

        // <color=#FF6347><size=20>🎁 兑换福利 🎁</size></color>
        // <color=#FFFF00><size=18>▶ 拒绝玄学，集齐指定素材可合成：传说级4.5星伙伴【齐天大圣】等</size></color>
        // <color=#FFFF00><size=18>▶ 完成日常任务额外得：限定头像框「福利达人」</size></color>
        // <color=#FFFF00><size=18>▶ 分享活动至社交平台：灵石*100 + 10万*金币</size></color>

        // <color=#FFA500><size=19>活动时间：永久</size></color>
        // <color=#FFA500><size=19>分享活动奖励领取：祭坛-客服石碑</size></color>

        // <color=#87CEFA><size=18>奖励发放问题请联系：</size></color>
        // <color=#FFFFFF><size=16>▶ 游戏内：祭坛-客服石碑</size></color>
        // <color=#FFFFFF><size=16>▶ 官方①QQ群：1092641657</size></color>
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
        if (this.page == "page6") {
            content = `<color=#FFD700><size=28><b>【版本更新】飞升系统重磅上线！</b></size></color>

<color=#FFFFFF><size=20>全新飞升系统解锁等级上限，好友邀请福利同步开启！</size></color>
<color=#FF6347><size=20>✨ 全新飞升系统 ✨</size></color>
<color=#FFFF00><size=18>▶ 突破等级限制，每次飞升最大等级+5！</size></color>
<color=#FFFF00><size=18>▶ 飞升需消耗：飞升丹 + 同品质卡牌</size></color>

<color=#FF6347><size=20>🎁 好友邀请福利 🎁</size></color>
<color=#FFFF00><size=18>▶ 1位好友50级：少年王天君*1 </size></color>
<color=#FFFF00><size=18>▶ 10位好友80级：魂力宝珠*10 </size></color>
<color=#FFFF00><size=18>▶ 30位好友100级：女娲石*1</size></color>
<color=#FFA500><size=19>活动时间：永久 | 好友邀请：其他-好友邀请-二维码</size></color>

<color=#87CEFA><size=18>奖励发放问题请联系：</size></color>
<color=#FFFFFF><size=16>▶ 游戏内：祭坛-客服石碑</size></color>
<color=#FFFFFF><size=16>▶ 官方①QQ群：1092641657</size></color>
<color=#FFFFFF><size=16>▶ GM邮箱：chengzhixiang2023@163.com</size></color>
<color=#FF69B4><size=18>突破等级上限，邀好友领豪礼，畅玩新版本！</size></color>
<color=#CCCCCC><size=14>【QQ神仙依梦工作室】2026年02月16日</size></color>`
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


