import { _decorator, Component, Node } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { questionCrtl } from '../questionCrtl/questionCrtl';
const { ccclass, property } = _decorator;

@ccclass('JinjiCtrl')
export class JinjiCtrl extends Component {
    start() {

    }

    update(deltaTime: number) {

    }

    //挑战
    public async JinjichangCtrl() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("Buildings").active = false
        this.node.parent.getChildByName("JinjiCtrl").active = false
        this.node.parent.getChildByName("JinjichangCtrl").active = true
    }
    //挑战
    public async MyFriendsCrtl() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("Buildings").active = false
        this.node.parent.getChildByName("JinjiCtrl").active = false
        this.node.parent.getChildByName("MyFriendsCrtl").active = true
    }

    public async ArenaCrtl() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("Buildings").active = false
        this.node.parent.getChildByName("JinjiCtrl").active = false
        this.node.parent.getChildByName("ArenaCrtl").active = true
    }

    openHotEvents() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("HotEventsCtrl").active = true
    }

    public async duofeisheng() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("AscensionPillCtrl").active = true
    }
    public async kuanchanqianduo() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("KuanCrtl").active = true
    }

    async questry() {
        var message = `<size=28><color=#FFD700>战斗效果类型常量中文说明总表</color></size><br/><br/>

<size=24><color=#FFFFFF>一、控制与特殊状态</color><br/>
<color=#E0E0E0>驱散、沉默、沉默免疫、眩晕、眩晕免疫、嗜血、疯狂、蓄力、吸血、真实伤害</color><br/><br/>

<size=24><color=#FFFFFF>二、治疗相关效果</color><br/>
<size=22><color=#CCCCCC>基础恢复</color><br/>
<color=#E0E0E0>生命恢复、续命治疗、治疗</color><br/>
<size=22><color=#CCCCCC>治疗增减益</color><br/>
<color=#E0E0E0>受到治疗提升（固定数值）、受到治疗提升（百分比）、受到治疗下降（固定数值）、受到治疗下降（百分比）</color><br/>
<size=22><color=#CCCCCC>续命治疗增减益</color><br/>
<color=#E0E0E0>续命治疗提升（固定数值）、续命治疗提升（百分比）、续命治疗下降（固定数值）、续命治疗下降（百分比）</color><br/><br/>

<size=24><color=#FFFFFF>三、物理攻击相关效果</color><br/>
<color=#E0E0E0>伤害、攻击提升（固定数值）、攻击下降（固定数值）、攻击提升（百分比）、攻击下降（百分比）</color><br/>
<color=#E0E0E0>物理抗性提升（固定数值）、物理抗性提升（百分比）、物理抗性下降（固定数值）、物理抗性下降（百分比）</color><br/><br/>

<size=24><color=#FFFFFF>四、火焰伤害相关效果</color><br/>
<color=#E0E0E0>灼烧、火焰伤害、火焰伤害提升（固定数值）、火焰伤害提升（百分比）、火焰伤害下降（固定数值）、火焰伤害下降（百分比）</color><br/>
<color=#E0E0E0>火焰抗性提升（固定数值）、火焰抗性提升（百分比）、火焰抗性下降（固定数值）、火焰抗性下降（百分比）</color><br/><br/>

<size=24><color=#FFFFFF>五、中毒相关效果</color><br/>
<color=#E0E0E0>中毒、中毒伤害提升（固定数值）、中毒伤害提升（百分比）、中毒伤害下降（固定数值）、中毒伤害下降（百分比）</color><br/>
<color=#E0E0E0>中毒抗性提升（固定数值）、中毒抗性提升（百分比）、中毒抗性下降（固定数值）、中毒抗性下降（百分比）</color><br/><br/>

<size=24><color=#FFFFFF>六、飞弹伤害相关效果</color><br/>
<color=#E0E0E0>飞弹伤害、飞弹伤害提升（固定数值）、飞弹伤害提升（百分比）、飞弹伤害下降（固定数值）、飞弹伤害下降（百分比）</color><br/>
<color=#E0E0E0>飞弹抗性提升（固定数值）、飞弹抗性提升（百分比）、飞弹抗性下降（固定数值）、飞弹抗性下降（百分比）</color><br/><br/>

<size=24><color=#FFFFFF>七、生命上限相关效果</color><br/>
<color=#E0E0E0>生命上限提升（固定数值）、生命上限提升（百分比）、生命上限下降（固定数值）、生命上限下降（百分比）、生命上限不下降</color><br/><br/>

<size=24><color=#FFFFFF>八、速度相关效果</color><br/>
<color=#E0E0E0>速度提升（固定数值）、速度提升（百分比）、速度下降（固定数值）、速度下降（百分比）</color><br/><br/>

<size=28><color=#FFD700>一、速度结算计算规则</color></size><br/>
<size=22><color=#FFFFFF>1、数据统计规则</color><br/>
<color=#E0E0E0>原始速度：单位面板基础速度</color><br/>
<color=#E0E0E0>提升倍率：累乘全部【速度提升百分比】效果数值</color><br/>
<color=#E0E0E0>降低倍率：累乘全部【速度下降百分比】效果数值</color><br/>
<color=#E0E0E0>固定速度加成：累加全部【速度提升固定数值】效果数值</color><br/>
<color=#E0E0E0>固定速度减益：累加全部【速度下降固定数值】效果数值</color><br/><br/>
<size=22><color=#FFFFFF>2、结算公式</color><br/>
<color=#E0E0E0>最终速度 = 原始速度 × 提升倍率 × 降低倍率 + 固定速度加成 - 固定速度减益</color><br/><br/>
<size=22><color=#FFFFFF>3、行动判定</color><br/>
<color=#E0E0E0>攻击者最终速度 ≥ 目标最终速度，攻击者先手行动；反之目标先手行动</color><br/><br/>

<size=28><color=#FFD700>二、中毒伤害结算计算规则</color></size><br/>
<size=22><color=#FFFFFF>1、输出方毒伤数据统计</color><br/>
<color=#E0E0E0>原始毒伤：目标身上所有中毒效果基础伤害总和</color><br/>
<color=#E0E0E0>毒伤提升倍率：累乘全部【中毒伤害提升百分比】效果数值</color><br/>
<color=#E0E0E0>毒伤降低倍率：累乘全部【中毒伤害下降百分比】效果数值</color><br/>
<color=#E0E0E0>固定毒伤加成：累加全部【中毒伤害提升固定数值】效果数值</color><br/>
<color=#E0E0E0>固定毒伤减益：累加全部【中毒伤害下降固定数值】效果数值</color><br/><br/>
<size=22><color=#FFFFFF>2、输出方结算毒伤公式</color><br/>
<color=#E0E0E0>结算毒伤 = 原始毒伤 × 毒伤提升倍率 × 毒伤降低倍率 + 固定毒伤加成 - 固定毒伤减益</color><br/><br/>
<size=22><color=#FFFFFF>3、承受方毒抗数据统计</color><br/>
<color=#E0E0E0>原始毒抗：单位基础中毒抗性</color><br/>
<color=#E0E0E0>毒抗提升倍率：累乘全部【中毒抗性提升百分比】效果数值</color><br/>
<color=#E0E0E0>毒抗降低倍率：累乘全部【中毒抗性下降百分比】效果数值</color><br/>
<color=#E0E0E0>固定毒抗加成：累加全部【中毒抗性提升固定数值】效果数值</color><br/>
<color=#E0E0E0>固定毒抗减益：累加全部【中毒抗性下降固定数值】效果数值</color><br/><br/>
<size=22><color=#FFFFFF>4、承受方结算毒抗公式</color><br/>
<color=#E0E0E0>结算毒抗 = 原始毒抗 × 毒抗提升倍率 × 毒抗降低倍率 + 固定毒抗加成 - 固定毒抗减益</color><br/><br/>
<size=22><color=#FFFFFF>5、最终中毒伤害</color><br/>
<color=#E0E0E0>最终中毒伤害 = 结算毒伤 - 结算毒抗（最低保底1点伤害）</color><br/><br/>

<size=28><color=#FFD700>三、火焰伤害结算计算规则</color></size><br/>
<size=22><color=#FFFFFF>1、输出方火焰伤害数据统计</color><br/>
<color=#E0E0E0>原始火焰伤害：目标身上灼烧、火焰伤害基础数值总和</color><br/>
<color=#E0E0E0>火伤提升倍率：累乘全部【火焰伤害提升百分比】效果数值</color><br/>
<color=#E0E0E0>火伤降低倍率：累乘全部【火焰伤害下降百分比】效果数值</color><br/>
<color=#E0E0E0>固定火伤加成：累加全部【火焰伤害提升固定数值】效果数值</color><br/>
<color=#E0E0E0>固定火伤减益：累加全部【火焰伤害下降固定数值】效果数值</color><br/><br/>
<size=22><color=#FFFFFF>2、输出方结算火伤公式</color><br/>
<color=#E0E0E0>结算火焰伤害 = 原始火焰伤害 × 火伤提升倍率 × 火伤降低倍率 + 固定火伤加成 - 固定火伤减益</color><br/><br/>
<size=22><color=#FFFFFF>3、承受方火焰抗性数据统计</color><br/>
<color=#E0E0E0>原始火抗：单位基础火焰抗性</color><br/>
<color=#E0E0E0>火抗提升倍率：累乘全部【火焰抗性提升百分比】效果数值</color><br/>
<color=#E0E0E0>火抗降低倍率：累乘全部【火焰抗性下降百分比】效果数值</color><br/>
<color=#E0E0E0>固定火抗加成：累加全部【火焰抗性提升固定数值】效果数值</color><br/>
<color=#E0E0E0>固定火抗减益：累加全部【火焰抗性下降固定数值】效果数值</color><br/><br/>
<size=22><color=#FFFFFF>4、承受方结算火抗公式</color><br/>
<color=#E0E0E0>结算火焰抗性 = 原始火抗 × 火抗提升倍率 × 火抗降低倍率 + 固定火抗加成 - 固定火抗减益</color><br/><br/>
<size=22><color=#FFFFFF>5、最终火焰伤害</color><br/>
<color=#E0E0E0>最终火焰伤害 = 结算火焰伤害 - 结算火焰抗性（最低保底1点伤害）</color><br/><br/>

<size=28><color=#FFD700>四、飞弹伤害结算计算规则</color></size><br/>
<size=22><color=#FFFFFF>1、输出方飞弹伤害数据统计</color><br/>
<color=#E0E0E0>原始飞弹伤害：所有飞弹伤害基础数值总和</color><br/>
<color=#E0E0E0>飞弹伤提升倍率：累乘全部【飞弹伤害提升百分比】效果数值</color><br/>
<color=#E0E0E0>飞弹伤降低倍率：累乘全部【飞弹伤害下降百分比】效果数值</color><br/>
<color=#E0E0E0>固定飞弹伤加成：累加全部【飞弹伤害提升固定数值】效果数值</color><br/>
<color=#E0E0E0>固定飞弹伤减益：累加全部【飞弹伤害下降固定数值】效果数值</color><br/><br/>
<size=22><color=#FFFFFF>2、输出方结算飞弹伤公式</color><br/>
<color=#E0E0E0>结算飞弹伤害 = 原始飞弹伤害 × 飞弹伤提升倍率 × 飞弹伤降低倍率 + 固定飞弹伤加成 - 固定飞弹伤减益</color><br/><br/>
<size=22><color=#FFFFFF>3、承受方飞弹抗性数据统计</color><br/>
<color=#E0E0E0>原始飞弹抗：单位基础飞弹抗性</color><br/>
<color=#E0E0E0>飞弹抗提升倍率：累乘全部【飞弹抗性提升百分比】效果数值</color><br/>
<color=#E0E0E0>飞弹抗降低倍率：累乘全部【飞弹抗性下降百分比】效果数值</color><br/>
<color=#E0E0E0>固定飞弹抗加成：累加全部【飞弹抗性提升固定数值】效果数值</color><br/>
<color=#E0E0E0>固定飞弹抗减益：累加全部【飞弹抗性下降固定数值】效果数值</color><br/><br/>
<size=22><color=#FFFFFF>4、承受方结算飞弹抗公式</color><br/>
<color=#E0E0E0>结算飞弹抗性 = 原始飞弹抗 × 飞弹抗提升倍率 × 飞弹抗降低倍率 + 固定飞弹抗加成 - 固定飞弹抗减益</color><br/><br/>
<size=22><color=#FFFFFF>5、最终飞弹伤害</color><br/>
<color=#E0E0E0>最终飞弹伤害 = 结算飞弹伤害 - 结算飞弹抗性（最低保底1点伤害）</color><br/><br/>

<size=28><color=#FFD700>五、物理伤害结算计算规则</color></size><br/>
<size=22><color=#FFFFFF>1、输出方攻击数据统计</color><br/>
<color=#E0E0E0>原始攻击：单位面板基础攻击</color><br/>
<color=#E0E0E0>攻击提升倍率：累乘全部【攻击提升百分比】效果数值</color><br/>
<color=#E0E0E0>攻击降低倍率：累乘全部【攻击下降百分比】效果数值</color><br/>
<color=#E0E0E0>固定攻击加成：累加全部【攻击提升固定数值】效果数值</color><br/>
<color=#E0E0E0>固定攻击减益：累加全部【攻击下降固定数值】效果数值</color><br/><br/>
<size=22><color=#FFFFFF>2、输出方结算攻击公式</color><br/>
<color=#E0E0E0>结算攻击 = 原始攻击 × 攻击提升倍率 × 攻击降低倍率 + 固定攻击加成 - 固定攻击减益</color><br/><br/>
<size=22><color=#FFFFFF>3、承受方物抗数据统计</color><br/>
<color=#E0E0E0>原始物抗：单位基础物理抗性</color><br/>
<color=#E0E0E0>物抗提升倍率：累乘全部【物理抗性提升百分比】效果数值</color><br/>
<color=#E0E0E0>物抗降低倍率：累乘全部【物理抗性下降百分比】效果数值</color><br/>
<color=#E0E0E0>固定物抗加成：累加全部【物理抗性提升固定数值】效果数值</color><br/>
<color=#E0E0E0>固定物抗减益：累加全部【物理抗性下降固定数值】效果数值</color><br/><br/>
<size=22><color=#FFFFFF>4、承受方结算物抗公式</color><br/>
<color=#E0E0E0>结算物理抗性 = 原始物抗 × 物抗提升倍率 × 物抗降低倍率 + 固定物抗加成 - 固定物抗减益</color><br/><br/>
<size=22><color=#FFFFFF>5、最终物理伤害</color><br/>
<color=#E0E0E0>最终物理伤害 = 结算攻击 - 结算物理抗性（最低保底1点伤害）</color>`
        await this.node.parent.getChildByName("questionCrtl")
            .getComponent(questionCrtl)
            .read(message)
    }
}


