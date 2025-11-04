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

        this.Page.getComponent(Sprite).spriteFrame = await util.bundle.load("image/page/" + this.page + "/spriteFrame", SpriteFrame)
        var content = `<color=#FFD700><size=28><b>【游戏公告】版本更新与活动通知</b></size></color>
<color=#FFFFFF><size=20>亲爱的玩家朋友们：</size></color>

<color=#98FB98><size=19>为了给大家带来更好的游戏体验，我们将于以下时间进行版本更新维护：</size></color>
<color=#FFFF00><size=18>▶ 维护时间：2025年10月30日 08:00-12:00（预计4小时）</size></color>
<color=#FFFF00><size=18>▶ 维护范围：全服</size></color>
<color=#FF6347><size=18>▶ 维护补偿：钻石*200 + 体力药剂*3（维护后通过邮件发放）</size></color>

<color=#98FB98><size=19>本次更新内容：</size></color>
<color=#FFFFFF><size=17>1. 新增【秋日限定】活动副本，掉落限定皮肤碎片</size></color>
<color=#FFFFFF><size=17>2. 优化战斗系统流畅度，减少技能释放延迟</size></color>
<color=#FFFFFF><size=17>3. 修复部分玩家反馈的闪退问题</size></color>
<color=#FFFFFF><size=17>4. 商城新增【超值成长礼包】，限时7折优惠</size></color>

<color=#98FB98><size=19>限时活动预告：</size></color>
<color=#FFA500><size=18>★ 累计登录7天，领取SSR伙伴【暗影刺客】</size></color>
<color=#FFA500><size=18>★ 充值任意金额，额外赠送限定限定头像框</size></color>
<color=#FFA500><size=18>★ 活动时间：2025年10月30日-11月6日</size></color>

<color=#87CEFA><size=18>如有任何问题，请联系客服：</size></color>
<color=#FFFFFF><size=16>▶ 游戏内：设置-客服中心</size></color>
<color=#FFFFFF><size=16>▶ 官方QQ群：123456789</size></color>
<color=#FFFFFF><size=16>▶ 客服邮箱：service@gameexample.com</size></color>

<color=#FF69B4><size=18>感谢各位玩家的支持与理解，祝大家游戏愉快！</size></color>
<color=#CCCCCC><size=14>【游戏运营团队】2025年10月28日</size></color>`
        if (this.page == "page2") {
            content = `<color=#FFD700><size=28><b>【擂台争霸赛】全新赛季开启公告</b></size></color>
<color=#FFFFFF><size=20>各位武道强者：</size></color>

<color=#FFA500><size=19>万众期待的擂台争霸赛S3赛季即将开启，赛事详情如下：</size></color>
<color=#FFFF00><size=18>▶ 报名时间：2025年11月5日-11月10日 23:59</size></color>
<color=#FFFF00><size=18>▶ 参赛条件：角色等级≥50级，战力≥10万</size></color>
<color=#FFFF00><size=18>▶ 比赛时间：11月12日-11月26日（每晚20:00-22:00）</size></color>

<color=#FFA500><size=19>赛事规则：</size></color>
<color=#FFFFFF><size=17>1. 采用单败淘汰赛制，每场3局2胜，限时5分钟</size></color>
<color=#FFFFFF><size=17>2. 禁止使用回复类道具，赛前可配置3套备战阵容</size></color>
<color=#FFFFFF><size=17>3. 晋级16强开启直播解说，全服玩家可参与竞猜</size></color>

<color=#FF6347><size=19>冠军奖励（价值超10000钻石）：</size></color>
<color=#FF4500><size=18>★ 专属称号【擂台霸主】（永久属性加成）</size></color>
<color=#FF4500><size=18>★ 传说级武器【破阵霸王枪】（唯一特效外观）</size></color>
<color=#FF4500><size=18>★ 争霸赛冠军雕像（主城广场展示1个月）</size></color>
<color=#FF4500><size=18>★ 钻石*5000 + 顶级强化石*20</size></color>

<color=#87CEFA><size=18>赛事相关问题：</size></color>
<color=#FFFFFF><size=16>▶ 报名入口：主界面-活动中心-擂台争霸赛</size></color>
<color=#FFFFFF><size=16>▶ 规则详情：点击报名页"赛事手册"查看</size></color>
<color=#FFFFFF><size=16>▶ 裁判申诉：referee@wargame.com</size></color>

<color=#FF69B4><size=18>狭路相逢勇者胜，擂台之上，等你来战！</size></color>
<color=#CCCCCC><size=14>【擂台争霸赛组委会】2025年10月28日</size></color>`
        }
        if (this.page == "page3") {
            content = `<color=#FF4500><size=28><b>【烈焰迷阵】版本更新与深渊挑战活动公告</b></size></color>
<color=#FFE4B5><size=20>亲爱的烈焰勇士们：</size></color>

<color=#FFA500><size=19>为优化深渊迷宫体验，游戏将于以下时间进行版本更新：</size></color>
<color=#FFFF00><size=18>▶ 维护时间：2025年10月31日 09:00-13:00（预计4小时）</size></color>
<color=#FFFF00><size=18>▶ 维护范围：全服所有服务器</size></color>
<color=#FF6347><size=18>▶ 维护补偿：火焰晶石*300 + 迷阵地图*5 + 史诗复活卷轴*1</size></color>

<color=#FFA500><size=19>本次更新内容：</size></color>
<color=#FFFFFF><size=17>1. 新增【地狱烈焰】难度迷宫，掉落传说级装备锻造材料</size></color>
<color=#FFFFFF><size=17>2. 优化火焰陷阱判定机制，修复部分场景卡顿问题</size></color>
<color=#FFFFFF><size=17>3. 新增职业【火焰祭司】，掌握独特火焰治愈技能</size></color>
<color=#FFFFFF><size=17>4. 迷阵商店新增【烈焰战魂】系列皮肤，限时兑换</size></color>

<color=#FFA500><size=19>限时活动：深渊征服者挑战</size></color>
<color=#FF4500><size=18>★ 活动时间：2025年11月1日-11月8日</size></color>
<color=#FF4500><size=18>★ 累计通关迷阵50层，领取限定称号【焚天者】</size></color>
<color=#FF4500><size=18>★ 参与跨服迷阵竞速赛，前100名获得专属头像框</size></color>
<color=#FF4500><size=18>★ 每日登录可领取【迷阵探索礼包】，内含随机符文</size></color>

<color=#87CEFA><size=18>遇到烈焰屏障？联系我们：</size></color>
<color=#FFFFFF><size=16>▶ 游戏内：祭坛-客服石碑</size></color>
<color=#FFFFFF><size=16>▶ 官方火焰议会QQ群：987654321</size></color>
<color=#FFFFFF><size=16>▶ 祭司邮箱：flame@firemaze.com</size></color>

<color=#FF69B4><size=18>愿火焰指引你的道路，勇士们！</size></color>
<color=#CCCCCC><size=14>【烈焰迷阵运营团队】2025年10月28日</size></color>`
        }
        if (this.page == "page4") {
            content = `<color=#FFD700><size=28><b>【福利狂欢】海量奖励限时派送中！</b></size></color>
<color=#FFFFFF><size=20>各位玩家请注意！多重福利盛宴已开启，多重错过！</size></color>

<color=#FF6347><size=20>✨ 全民登录豪礼 ✨</size></color>
<color=#FFFF00><size=18>▶ 累计登录1天：钻石*300 + 高级经验药*5</size></color>
<color=#FFFF00><size=18>▶ 累计登录3天：限定时装【星耀勇者】（永久）</size></color>
<color=#FFFF00><size=18>▶ 累计登录7天：SSR伙伴【暗夜行者】+ 进阶石*100</size></color>

<color=#FF6347><size=20>🔥 充值翻倍活动 🔥</size></color>
<color=#FFFF00><size=18>▶ 所有充值档位首充翻倍重置，最高额外得5000钻石</size></color>
<color=#FFFF00><size=18>▶ 单笔充值满648元，加赠传说级武器宝箱（必出橙色装备）</size></color>
<color=#FFFF00><size=18>▶ 累计充值达2000元，解锁专属专属坐骑【雷霆战狮】</size></color>

<color=#FF6347><size=20>🎁 限时兑换福利 🎁</size></color>
<color=#FFFF00><size=18>▶ 每日签到可兑换：稀有材料*20 + 体力*100</size></color>
<color=#FFFF00><size=18>▶ 完成日常任务额外得：限定头像框「福利达人」</size></color>
<color=#FFFF00><size=18>▶ 分享活动至社交平台：钻石*100 + 抽奖券*2</size></color>

<color=#FFA500><size=19>活动时间：2025年10月30日-11月6日</size></color>
<color=#FFA500><size=19>奖励领取：主界面-福利中心-丰厚奖励活动</size></color>

<color=#87CEFA><size=18>奖励发放问题请联系：</size></color>
<color=#FFFFFF><size=16>▶ 游戏内：设置-客服反馈</size></color>
<color=#FFFFFF><size=16>▶ 福利专线：400-888-8888</size></color>

<color=#FF69B4><size=18>海量奖励已就位，快来领取属于你的专属福利！</size></color>
<color=#CCCCCC><size=14>【游戏福利运营组】2025年10月28日</size></color>`
        }
        if (this.page == "page5") {
            content = `<color=#9932CC><size=28><b>【神将降临】高级召唤概率UP活动开启！</b></size></color>
<color=#E6E6FA><size=20>各位召唤师，传说中的高级神将已现世，限时召唤开启！</size></color>

<color=#FF66FF><size=20>🌟 限定召唤池开启 🌟</size></color>
<color=#FFFF00><size=18>▶ 活动时间：2025年11月1日-11月8日 23:59</size></color>
<color=#FFFF00><size=18>▶ 召唤概率：UR神将出现概率提升至3.5%（常规1.2%）</size></color>
<color=#FFFF00><size=18>▶ 保底机制：累计50次召唤必出UR级神将（可叠加）</size></color>

<color=#FF66FF><size=20>👑 本期限定神将 👑</size></color>
<color=#FFFFFF><size=17>▷ 【帝释天】：群体AOE伤害+眩晕控制，版本最强输出</size></color>
<color=#FFFFFF><size=17>▷ 【幽冥玄女】：全体治疗+复活，续航核心辅助</size></color>
<color=#FFFFFF><size=17>▷ 【混沌战神】：单体爆发+无视防御，推图必备神将</size></color>

<color=#FF66FF><size=20>🎁 召唤额外福利 🎁</size></color>
<color=#FFFF00><size=18>▶ 首次十连召唤：免费额外赠送SSR碎片SSR神将碎片*50</size></color>
<color=#FFFF00><size=18>▶ 累计召唤30次：解锁解锁限定皮肤【帝释天·苍穹之姿】</size></color>
<color=#FFFF00><size=18>▶ 召唤达到100次：解锁神将专属神器【破界神鞭】</size></color>

<color=#87CEFA><size=18>召唤入口：</size></color>
<color=#FFFFFF><size=16>▶ 主界面-神殿-高级召唤阵</size></color>
<color=#FFFFFF><size=16>▶ 活动期间每日赠送免费召唤次数*2</size></color>
<color=#FFFFFF><size=16>▶ 疑问咨询：godcall@game.com</size></color>

<color=#FF69B4><size=18>抓住时机，让顶级神将助你横扫战场！</size></color>
<color=#CCCCCC><size=14>【神将召唤运营组】2025年10月28日</size></color>`
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


