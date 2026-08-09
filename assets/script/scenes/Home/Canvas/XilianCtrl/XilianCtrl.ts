import { _decorator, Component, instantiate, Label, Node, Prefab, sp, Sprite, SpriteFrame, tween, v3 } from 'cc';
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
    start() {

    }

    update(deltaTime: number) {

    }
    skillDict: Record<number, string> = {
        1: "诛仙", 2: "食人", 3: "驱魔", 4: "斗兽",
        5: "仙师", 6: "人杰", 7: "魔王", 8: "兽灵",
        9: "返火", 10: "辟土", 11: "逆雷", 12: "分水",
        13: "驭兵", 14: "破妄",
        15: "踏浪", 16: "破岩", 17: "驱雷", 18: "蹈火",
        19: "不侵", 20: "灭法",
        21: "突袭", 22: "闪避"
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
<color=#ffdd77><size=22>【诛仙】</size></color>物理攻击时有（<color=#ff6666>宝石最低等级 * 0.5%</color>）几率攻击仙族护法时额外提升<color=#ff6666>75%</color>攻击力，回合结束移除该加成
<color=#ffdd77><size=22>【食人】</size></color>物理攻击时有（<color=#ff6666>宝石最低等级 * 0.5%</color>）几率攻击人族护法时额外提升<color=#ff6666>75%</color>攻击力，回合结束移除该加成
<color=#ffdd77><size=22>【驱魔】</size></color>物理攻击时有（<color=#ff6666>宝石最低等级 * 0.5%</color>）几率攻击魔族护法时额外提升<color=#ff6666>75%</color>攻击力，回合结束移除该加成
<color=#ffdd77><size=22>【斗兽】</size></color>物理攻击时有（<color=#ff6666>宝石最低等级 * 0.5%</color>）几率攻击兽族护法时额外提升<color=#ff6666>75%</color>攻击力，回合结束移除该加成


<color=#77ddff><size=22>【仙师】</size></color>提升除自身外的所有仙族护法生命上限，提升值为生命值 * <color=#ff6666>1% * 宝石最低等级</color> <color=#aaaaaa>多个仙师套装可以叠加效果</color>
<color=#77ddff><size=22>【人杰】</size></color>提升除自身外的所有人族护法生命上限，提升值为生命值 * <color=#ff6666>1% * 宝石最低等级</color> <color=#aaaaaa>多个人杰套装可以叠加效果</color>
<color=#77ddff><size=22>【魔王】</size></color>提升除自身外的所有魔族护法生命上限，提升值为生命值 * <color=#ff6666>1% * 宝石最低等级</color> <color=#aaaaaa>多个魔王套装可以叠加效果</color>
<color=#77ddff><size=22>【兽灵】</size></color>提升除自身外的所有兽族护法生命上限，提升值为生命值 * <color=#ff6666>1% * 宝石最低等级</color> <color=#aaaaaa>多个兽灵套装可以叠加效果


<color=#ff9955><size=22>【返火】</size></color>受到火属性伤害时，有（<color=#ff6666>宝石最低等级 * 0.5%</color>）几率对伤害来源造成等值的物理伤害，且有同样几率免疫燃烧、锢魂 <color=#aaaaaa>伤害反弹和抵抗负面分别独立触发</color>
<color=#ff9955><size=22>【辟土】</size></color>受到土属性伤害时，有（<color=#ff6666>宝石最低等级 * 0.5%</color>）几率对伤害来源造成等值的物理伤害，且有同样几率免疫毒砂、凝滞
<color=#ff9955><size=22>【逆雷】</size></color>受到雷属性伤害时，有（<color=#ff6666>宝石最低等级 * 0.5%</color>）几率对伤害来源造成等值的物理伤害，且有同样几率免疫麻痹、盲目
<color=#ff9955><size=22>【分水】</size></color>受到水属性伤害时，有（<color=#ff6666>宝石最低等级 * 0.5%</color>）几率对伤害来源造成等值的物理伤害，且有同样几率免疫僵化、禁疗


<color=#cc99ff><size=22>【驭兵】</size></color>攻击时有（<color=#ff6666>宝石最低等级 * 0.5%</color>）几率增加<color=#ff6666>50%</color>攻击，攻击后身上每有一把剑则保留增加攻击力的<color=#ff6666>20%</color>，回合结束移除该加成
<color=#cc99ff><size=22>【破妄】</size></color>攻击前有（<color=#ff6666>宝石最低等级 * 0.5%</color>）几率将对面三位护法生命上限恢复到初始值 <color=#aaaaaa>"不侵、法术护盾都无法抵挡破妄，反击、连击、乱舞都能触发破妄"</color>


<color=#66eeaa><size=22>【踏浪】</size></color>攻击时有（<color=#ff6666>宝石最低等级 * 0.5%</color>）几率提升<color=#ff6666>50%</color>攻击力，并且使目标失去神通（僵化），行动一次后清除，回合结束移除攻击加成 <color=#aaaaaa>如果护法带有踏浪神通，效果可叠加</color>
<color=#66eeaa><size=22>【破岩】</size></color>攻击时有（<color=#ff6666>宝石最低等级 * 0.5%</color>）几率提升<color=#ff6666>50%</color>攻击力，并且使目标持续降低攻击力（毒砂5），回合结束移除攻击加成 <color=#aaaaaa>如果护法带有破岩神通，效果可叠加</color>
<color=#66eeaa><size=22>【驱雷】</size></color>攻击时有（<color=#ff6666>宝石最低等级 * 0.5%</color>）几率提升<color=#ff6666>50%</color>攻击力，并且使目标无法释放法术书（麻痹），行动一次后清除，回合结束移除攻击加成 <color=#aaaaaa>如果护法带有驱雷神通，效果可叠加</color>
<color=#66eeaa><size=22>【蹈火】</size></color>攻击时有（<color=#ff6666>宝石最低等级 * 0.5%</color>）几率提升<color=#ff6666>50%</color>攻击力，并且使目标持续失去生命值（燃烧），回合结束移除攻击加成 <color=#aaaaaa>如果护法带有蹈火神通，效果可叠加</color>


<color=#ee88bb><size=22>【不侵】</size></color>被攻击时有（<color=#ff6666>宝石最低等级 * 0.5%</color>）几率抵抗对方给予的持续效果，如燃烧、毒砂、禁疗、绝杀、驱逐、摧毁、乱阵、僵化、早夭等 <color=#aaaaaa>不可抵抗弱化、破妄</color>
<color=#ee88bb><size=22>【灭法】</size></color>攻击时对具备仙衣、不侵效果的目标造成的伤害提高（<color=#ff6666>宝石最低等级 * 0.5%</color>），并且有相同几率清除对方的无敌效果（本次攻击不产生伤害） <color=#aaaaaa>灭法造成的伤害为物理伤害</color>


<color=#ffcc44><size=22>【突袭】</size></color>攻击时有（<color=#ff6666>宝石最低等级 * 0.5%</color>）几率触发，本次攻击不会受到反击、护体等神通，并额外增加<color=#ff6666>50%</color>攻击力，回合结束移除该加成
<color=#ffcc44><size=22>【闪避】</size></color>有（<color=#ff6666>宝石最低等级 * 0.24%</color>）几率躲过物理攻击 <color=#aaaaaa>如果护法带有闪避神通，效果可叠加</color>

<color=#ff3333>装备宝石槽未装满洗练属性不激活，属性计算取装备镶嵌宝石最低等级</color>
<color=#ff3333>每次洗炼需要消耗水之元、火之元、土之元、生之元、雷之元、道之元各72枚</color>
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
                this.selecEquipment.getChildByName("xilian").getComponent(Label).string = this.skillDict[c.xilian] || ""
                this.$state = c
                return
            })
    }


    async hechenBtn2() {
        AudioMgr.inst.playOneShot("sound/other/click");
        if (!this.$state) {
            return await util.message.prompt({ message: "请选择装备！" })
        }
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId,
            id: this.$state.uuid
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
                    config.userData.equipments = data.data
                    const create = config.userData.equipments.find(equip => equip.uuid === this.$state.uuid);
                    this.selecEquipment.getChildByName("xilian").getComponent(Label).string = this.skillDict[create.xilian] || ""
                    localStorage.setItem("UserConfigData", JSON.stringify(config))


                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                //console.error('There was a problem with the fetch operation:', error);
            }
            );
    }
    goback() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false;
    }
}


