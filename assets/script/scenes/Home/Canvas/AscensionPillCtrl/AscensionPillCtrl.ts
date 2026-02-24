import { _decorator, Component, Node } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { questionCrtl } from '../questionCrtl/questionCrtl';
const { ccclass, property } = _decorator;

@ccclass('AscensionPillCtrl')
export class AscensionPillCtrl extends Component {
    start() {

    }

    update(deltaTime: number) {

    }

    async questry() {
        let message = `<size=26><color=#FFD700><b>飞升丹抢夺·极简最终版</b></color></size>

<size=24><color=#FFFFFF><b>1. 抢夺规则</b></color></size>
<size=22><color=#E0E0E0>
- 每人每天免费抢 <color=#00FF99>3 次</color>
- 胜利：抢走对方 <color=#00FF99>20% 飞升丹或素材</color>（最少1颗或任意素材）
- 失败：<color=#00FF99>无损失</color>
- 只能抢 <color=#00FF99>战力相近玩家</color>
</color></size>

<size=24><color=#FFFFFF><b>2. 免战符</b></color></size>
<size=22><color=#E0E0E0>
- 使用后获得 <color=#00FF99>8 小时免战</color>，期间不会被任何人抢夺
- 免战结束自动解除
- 每人每天限用 <color=#00FF99>1 张</color>，避免一直无敌
</color></size>

<size=24><color=#FFFFFF><b>3. 保护机制</b></color></size>
<size=22><color=#E0E0E0>
- 丹量 ≤ <color=#00FF99>2 颗</color>：不会被抢
</color></size>

<size=24><color=#FFFFFF><b>4. 复仇</b></color></size>
<size=22><color=#E0E0E0>
- 被抢后 <color=#00FF99>2 小时内</color>可免费复仇 <color=#00FF99>1 次</color>，胜利即可夺回丹药
</color></size>`
        this.node.parent.getChildByName("questionCrtl")
            .getComponent(questionCrtl)
            .read(message)
    }

    async goBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }

    public async bodyReceive1() {
        AudioMgr.inst.playOneShot("sound/other/click");
        return await util.message.prompt({ message: "暂未开放" })
    }

    public async bodyReceive2() {
        AudioMgr.inst.playOneShot("sound/other/click");
        return await util.message.prompt({ message: "暂未开放" })
    }

    public async bodyReceive3() {
        AudioMgr.inst.playOneShot("sound/other/click");
        return await util.message.prompt({ message: "暂未开放" })
    }

}


