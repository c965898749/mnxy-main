import { _decorator, Button, Component, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { EquipmentStateCreate } from 'db://assets/script/game/fight/equipment/EquipmentState';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

@ccclass('eqSelectCardCtrl')
export class eqSelectCardCtrl extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    initialized = false;
    $qianghuaCtrl: Node
    // $state: CharacterState;
    start() {

    }

    update(deltaTime: number) {

    }
    public backQianhua() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }

    async render(create: EquipmentStateCreate[], clickFun?: (characters: EquipmentStateCreate, node: Node) => any) {
        this.node.active = true
        const nodePool = util.resource.getNodePool(
            await util.bundle.load("prefab/fankuai", Prefab)
        )
        const childrens = [...this.ContentNode.children]
        for (let i = 0; i < childrens.length; i++) {
            const node = childrens[i];
            // console.log(i)
            node.getChildByName("Button").off("click")
            nodePool.put(node)
        }
        for (let i = 0; i < create.length; i++) {
            let item = nodePool.get()
            item.getChildByName("Button").active = true
            item.getChildByName("yxjm_df_txk").children[0].getComponent(Sprite).spriteFrame =
                await util.bundle.load(`game/texture/frames/emp/${create[i].id.split('_')[0]}/spriteFrame`, SpriteFrame)
            // 渲染星级
            item.getChildByName("star-001").children.forEach(n => n.active = false)
            for (let j = 0; j < create[i].star; j++) {
                item.getChildByName("star-001").children[j].active = true
                if (j + 0.5 < create[i].star) {
                    item.getChildByName("star-001").children[j].children[0].active = true
                }
            }
            item.getChildByName("stackCount").getComponent(Label).string = create[i].stackCount + ""
            item.getChildByName("name").getComponent(Label).string = create[i].name + "  Lv" + create[i].lv + "/" + create[i].maxLv
            // 仙、佛、圣、魔、妖、兽
            const cmp = new Map([
                ['sacred', '仙界'],
                ['nature', '佛界'],
                ['machine', '圣界'],
                ['abyss', '魔界'],
                ['dark', '妖界'],
                ['ordinary', '兽界'],
            ]);

            const position = ["仙灵", "神将", "武圣"]
            item.getChildByName("Camp").getComponent(Label).string = cmp.get(create[i].camp) + "." + create[i].profession
            // // 绑定事件
            item.getChildByName("Button").getComponent(Button).transition = 3
            item.getChildByName("Button").getComponent(Button).zoomScale = 0.9
            item.getChildByName("Button").on("click", () => { if (clickFun) clickFun(create[i], this.node) })
            this.ContentNode.addChild(item)
            continue
        }
    }
}


