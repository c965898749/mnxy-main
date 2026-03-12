import { _decorator, Component, Label, Node, RichText, Sprite, SpriteFrame } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { questionCrtl } from '../questionCrtl/questionCrtl';
import { AscensionPillJinjiCtrl } from './AscensionPillJinjiCtrl';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
const { ccclass, property } = _decorator;

@ccclass('AscensionPillCtrl')
export class AscensionPillCtrl extends Component {
    @property(Node)
    numNode: Node
    @property(Node)
    useNumNode: Node
    @property(Node)
    introduceBack: Node
    initialized: boolean = false
    num = 0;
    @property(Node)
    RichTextNode: Node
    @property(Node)
    p1Node: Node
    @property(Node)
    p2Node: Node
    @property(Node)
    p3Node: Node
    @property(Node)
    p4Node: Node
    @property(Node)
    p5Node: Node
    @property(Node)
    p6Node: Node
    @property(Node)
    headNode: Node
    @property(Node)
    headName: Node
    customEventNum
    p4 = 0
    p5 = 0
    p6 = 0
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

    public async bodyReceive(event: Event, customEventData: string) {
        AudioMgr.inst.playOneShot("sound/other/click");
        let activeCtrl = this.node.parent.getChildByName("AscensionPillJinjiCtrl")
        activeCtrl.active = true
        await this.node.parent.getChildByName("AscensionPillJinjiCtrl")
            .getComponent(AscensionPillJinjiCtrl)
            .render(customEventData)
    }

    opendetail() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("AscensionPillJinjiMessageCrtl").active = true
    }
    refresh() {
        const config = getConfig()
        const token = getToken()

        const postData = {
            token: token,
            userId: config.userData.userId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "ascensionPillDetail", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                //console.log(data); // 处理响应数据
                if (data.success == '1') {
                    let map = data.data
                    const robRecord = map['robRecord'];
                    const p1 = map['p1'];
                    this.p1Node.getComponent(Label).string = p1
                    const p2 = map['p2'];
                    this.p2Node.getComponent(Label).string = p2
                    const p3 = map['p3'];
                    this.p3Node.getComponent(Label).string = p3
                    this.p4 = map['p4'];
                    this.p4Node.getComponent(Label).string = "材料 " + this.p4 + "/7"
                    this.p5 = map['p5'];
                    this.p5Node.getComponent(Label).string = "材料 " + this.p5 + "/7"
                    this.p6 = map['p6'];
                    this.p6Node.getComponent(Label).string = "材料 " + this.p6 + "/7"
                    let content = null;
                    if (this.customEventNum) {
                        if (this.customEventNum == "1") {
                            this.numNode.getComponent(Label).string = this.p4 + ""
                        }
                        if (this.customEventNum == "2") {
                            this.numNode.getComponent(Label).string = this.p5 + ""
                        }
                        if (this.customEventNum == "3") {
                            this.numNode.getComponent(Label).string = this.p6 + ""
                        }
                    }
                    content = `<color=#E36F1A>${robRecord.timeStr}  <color=#EEE365>我 </color>在<color=#EEE365>飞升丹夺取中</color>遭到<color=#EEE365>${robRecord.nickname}</color>抢夺你<color=#00BCD4>${robRecord.robPillNum}个${robRecord.itemName}</color>。</color>`
                    this.RichTextNode.getComponent(RichText).string = content
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );
    }
    async openIntroduceBack(event: Event, customEventData: string) {
        AudioMgr.inst.playOneShot("sound/other/click");
        console.log(customEventData);
        this.customEventNum = customEventData
        this.introduceBack.active = true
        if (customEventData == "1") {
            this.headNode.getComponent(Sprite).spriteFrame = await util.bundle.load('image/bagCrtl/10400025/spriteFrame', SpriteFrame)
            this.numNode.getComponent(Label).string = this.p4 + ""
            this.headName.getComponent(Label).string = "力量琥珀"
        } else if (customEventData == "2") {
            this.headNode.getComponent(Sprite).spriteFrame = await util.bundle.load('image/bagCrtl/10400024/spriteFrame', SpriteFrame)
            this.numNode.getComponent(Label).string = this.p5 + ""
            this.headName.getComponent(Label).string = "元神勾玉"
        } else {
            this.headNode.getComponent(Sprite).spriteFrame = await util.bundle.load('image/bagCrtl/10400026/spriteFrame', SpriteFrame)
            this.numNode.getComponent(Label).string = this.p6 + ""
            this.headName.getComponent(Label).string = "月汐灵石"
        }

    }
    closeIntroduceBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.introduceBack.active = false
    }

    async feiShenhechen() {
        AudioMgr.inst.playOneShot("sound/other/click");
        var useNum = Number(this.useNumNode.getComponent(Label).string)
        if (Number(useNum) < 7) {
            return await util.message.prompt({ message: "请至少选择7个飞升材料" })
        }
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            str: useNum,
            userId: config.userData.userId,
            id: this.customEventNum
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "feiShenhechen", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    this.refresh()
                    this.useNumNode.getComponent(Label).string = "0"
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );


    }
}


