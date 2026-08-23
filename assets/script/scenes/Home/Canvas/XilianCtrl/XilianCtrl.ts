import { _decorator, Component, instantiate, Label, Layout, Node, Prefab, RichText, sp, Sprite, SpriteFrame, Toggle, tween, v3 } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { questionCrtl } from '../questionCrtl/questionCrtl';
import { EqHeroCharacterDetail } from '../../../Equipment/Canvas/EqHeroCharacterDetail';
import { EquipmentStateCreate } from 'db://assets/script/game/fight/equipment/EquipmentState';
import { SelectEqCardCtrl } from '../qianghua/SelectEqCardCtrl';
const { ccclass, property } = _decorator;

@ccclass('XilianCtrl')
export class XilianCtrl extends Component {
    @property(Layout)
    ContentNode: Layout;
    str = ""
    start() {

    }

    update(deltaTime: number) {

    }
    skillDict: Record<number, string> = {
        0: "突击",
        1: "灵能",
        2: "防护",
        3: "御灵",
        4: "暴击",
        5: "暴抗",
        6: "闪避",
        7: "命中",
        8: "速度",
        9: "生命"
    };



    qualityColor: Record<number, string> = {
        0: "#88ff88", //普通绿色
        1: "#bb77ff", //优秀紫色
        2: "#ffdd77"  //极品金色
    };
    qualityName: Record<number, string> = {
        0: "普通",
        1: "优秀",
        2: "极品"
    };

    @property(Node)
    hechen: Node
    @property(Node)
    t1: Node
    @property(Node)
    t2: Node
    @property(Node)
    t3: Node
    @property(Node)
    t4: Node
    @property(Node)
    t5: Node
    @property(Node)
    t6: Node
    @property(Node)
    selecEquipment: Node
    private $state: EquipmentStateCreate

    async questry() {


        const suitText = `<size=18>
<color=#ffdd77><size=22>【突击】</size></color>增加卡牌物理攻击伤害，突击每高于敌方防护1点，额外增加<color=#ff6666>0.1%</color>物理伤害

<color=#ffdd77><size=22>【灵能】</size></color>增加卡牌飞弹、火焰、毒素伤害，灵能每高于敌方御灵1点，额外增加<color=#ff6666>0.1%</color>飞弹、火焰、毒素伤害

<color=#77ddff><size=22>【防护】</size></color>降低自身受到的物理攻击伤害

<color=#77ddff><size=22>【御灵】</size></color>降低自身受到的飞弹、火焰、毒素伤害

<color=#ff9955><size=22>【暴击】</size></color>提高自身物理攻击暴击概率

<color=#ff9955><size=22>【暴抗】</size></color>降低自身被暴击的概率

<color=#cc99ff><size=22>【闪避】</size></color>提高自身闪避物理攻击的概率

<color=#cc99ff><size=22>【命中】</size></color>提高自身攻击命中概率，克制敌方闪避效果

<color=#66eeaa><size=22>【速度】</size></color>增加卡牌速度属性，影响出手先后顺序

<color=#ee88bb><size=22>【生命】</size></color>增加卡牌生命值上限

<color=#ff3333>洗练满 50 次则激活第二属性（可开启洗洗炼锁定每次100灵石）</color>
<color=#ff3333>每次洗炼消耗水之元、火之元、土之元、生之元、雷之元、道之元各2枚</color>
</size>`;



        this.node.parent.getChildByName("questionCrtl")
            .getComponent(questionCrtl)
            .read(suitText)
    }


    async empOnclick() {
        // AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        var cahracterQueue = []
        cahracterQueue = config.userData.equipments
        await this.render(cahracterQueue)
    }
    async render(characterQueue: EquipmentStateCreate[]) {
        const holAnimationPrefab = await util.bundle.load("prefab/SelectEqCardCtrl", Prefab)
        const holAnimationNode = instantiate(holAnimationPrefab)
        this.node.parent.addChild(holAnimationNode)
        await holAnimationNode
            .getComponent(SelectEqCardCtrl)
            .render(characterQueue, async (c, n) => {
                n.removeFromParent();
                n.destroy()
                this.selecEquipment.getComponent(Sprite).spriteFrame =
                    await util.bundle.load(`game/texture/frames/emp/${c.id.split('_')[0]}/spriteFrame`, SpriteFrame)
                this.xilian(c);
                this.$state = c
                return
            })
    }

    async xilian(characters: EquipmentStateCreate) {
        try {
            const layoutComp = this.ContentNode;
            if (!layoutComp) return;

            // ✅关键点：Layout组件取 .node 拿到节点
            const layoutNode = layoutComp.node;

            if (layoutNode.children.length > 0) {
                layoutNode.removeAllChildren();
            }

            const xilianPrefab = await util.bundle.load("prefab/xilian", Prefab);
            if (!xilianPrefab) return;
            let cc = 0
            if (characters.xilianList.length > 0) {
                cc = characters.xilianList.length
            }
            for (let index = 0; index < characters.xilianList.length; index++) {
                const content = characters.xilianList[index];
                if (!content) continue;
                const xilian = instantiate(xilianPrefab);

                const richTextNode = xilian.getChildByName("RichText");
                const toggleNode = xilian.getChildByName("Toggle");
                const id = xilian.getChildByName("id");
                if (cc > 1) {
                    toggleNode.active = true
                    if (this.str == content.id + "") {
                        toggleNode.getComponent(Toggle).isChecked = true
                    } else {
                        toggleNode.getComponent(Toggle).isChecked = false
                    }
                } else {
                    toggleNode.active = false
                }
                if (richTextNode) {
                    const labelComp = richTextNode.getComponent(RichText);
                    const attrName = this.skillDict[content.xilian];
                    const qColor = this.qualityColor[content.quality];
                    id.getComponent(Label).string = content.id + ""
                    // const qName = this.qualityName[content.quality];
                    let valStr: string;
                    //4‑7暴击、暴抗、闪避、命中保留1位小数；其余直接数字
                    if (content.xilian >= 4 && content.xilian <= 7) {
                        valStr = (Number(content.value)).toFixed(1) + '%';
                    } else {
                        valStr = String(content.value);
                    }
                    const line = `<color=${qColor}><size=20>${attrName}+${valStr}</size></color>`;
                    if (labelComp) labelComp.string = line;
                }
                layoutNode.addChild(xilian);
            }
        } catch (e) {
            console.error("渲染奖励列表异常：", e);
        }
    }
    async hechenBtn2() {
        AudioMgr.inst.playOneShot("sound/other/click");
        if (!this.$state) {
            return await util.message.prompt({ message: "请选择装备！" })
        }
        let allChecked = true;
        const layoutComp = this.ContentNode;
        if (!layoutComp) return;
        // ✅关键点：Layout组件取 .node 拿到节点
        const layoutNode = layoutComp.node;
        for (let index = 0; index < layoutNode.children.length; index++) {

            const content = layoutNode.children[index];
            if (!content) continue;

            const toggleComp = content.getChildByName("Toggle").getComponent(Toggle);
            // 只要有一个未勾选，全部勾选标记置false
            if (!toggleComp.isChecked) {
                allChecked = false;
            } else {
                // 勾选的收集id
                this.str = content.getChildByName("id").getComponent(Label).string;
            }

        }

        if (layoutNode.children.length > 1 && allChecked) {
            return await util.message.prompt({ message: "洗练属性请勿全部锁定！" })
        }
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId,
            id: this.$state.uuid,
            str: this.str,
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "xilianCard", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    let hut = this.hechen.getComponent(sp.Skeleton)
                    hut.node.active = true
                    AudioMgr.inst.playOneShot("sound/other/getcard");
                    hut.setAnimation(0, "animation", false)
                    tween(this.t1)
                        .to(0.5, { position: v3(-157.524, -53.702) })
                        .start();
                    tween(this.t2)
                        .to(0.5, { position: v3(0, 168.265) })
                        .start();
                    tween(this.t3)
                        .to(0.5, { position: v3(130.674, 107.403) })
                        .start();
                    tween(this.t4)
                        .to(0.5, { position: v3(0, -168.265) })
                        .start();
                    tween(this.t5)
                        .to(0.5, { position: v3(-121.723, 107.403) })
                        .start();
                    tween(this.t6)
                        .to(0.5, { position: v3(159.314, -48.331) })
                        .start();
                    hut.setCompleteListener(() => {
                        hut.node.active = false;
                        this.t1.position = v3(0, 0.0)
                        this.t2.position = v3(0, 0.0)
                        this.t3.position = v3(0, 0.0)
                        this.t4.position = v3(0, 0.0)
                        this.t5.position = v3(0, 0.0)
                        this.t6.position = v3(0, 0.0)
                    })
                    let map = data.data
                    let eqCharactersList = map["eqCharactersList"]
                    let xilian = map["xilian"]
                    let info = map["info"]
                    if(info){
                        config.userData.diamond = info.diamond
                    }
                    const str = this.formatRefineList(xilian);
                    config.userData.equipments = eqCharactersList
                    const create = config.userData.equipments.find(equip => equip.uuid === this.$state.uuid);
                    // this.selecEquipment.getChildByName("xilian").getComponent(Label).string = this.skillDict[create.xilian] || ""
                    this.xilian(create)
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                    await util.message.eqPrompt({ message: str })

                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                //console.error('There was a problem with the fetch operation:', error);
            }
            );
    }
    /**
 * 将java返回的 List<Map<string,Object>> refineList 转为富文本字符串
 * java返回结构：{attr:number, quality:number, value:number|double}
 * skillDict 与上面保持一致
 * quality:0普通，1优秀，2极品
 */
    formatRefineList(refineList: Array<{ xilian: number, quality: number, value: number | number }>): string {



        const lines: string[] = [];
        // lines.push(`<size=18>`);

        for (const item of refineList) {
            const attrName = this.skillDict[item.xilian];
            const qColor = this.qualityColor[item.quality];
            const qName = this.qualityName[item.quality];
            let valStr: string;
            //4‑7暴击、暴抗、闪避、命中保留1位小数；其余直接数字
            if (item.xilian >= 4 && item.xilian <= 7) {
                valStr = (Number(item.value)).toFixed(1) + '%';
            } else {
                valStr = String(item.value);
            }
            const line = `<color=${qColor}><size=20>${attrName}+${valStr}</size></color>`;
            // const line = `【${attrName}】${qName}：${valStr}`;
            lines.push(line);
        }

        // lines.push(`</size>`);
        return lines.join("\n");
    }

    goback() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false;
    }
}


