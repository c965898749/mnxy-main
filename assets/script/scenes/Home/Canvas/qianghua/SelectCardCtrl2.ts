import { _decorator, Component, EventHandler, instantiate, Label, Node, Prefab, Sprite, SpriteFrame, Toggle, ToggleComponent } from 'cc';
import { getConfig } from 'db://assets/script/common/config/config';
import { CharacterEnum } from 'db://assets/script/game/fight/character/CharacterEnum';
import { CharacterStateCreate } from 'db://assets/script/game/fight/character/CharacterState';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { qianghuaCtrl } from './qianghuaCtrl';
import { AttrLevelCtrl } from './AttrLevelCtrl';
const { ccclass, property } = _decorator;

@ccclass('SelectCardCtrl2')
export class SelectCardCtrl2 extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    initialized = false;
    qianghuaCtrl: qianghuaCtrl = null
    public myMap = new Map<string, number>(); // 键为字符串，值为数字
    create: CharacterStateCreate[]
    start() {

    }


    update(deltaTime: number) {

    }



    public backQianhua() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }
    public async queDingQianhua() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
        this.qianghuaCtrl.getComponent(qianghuaCtrl).initData(this.myMap)
    }
    public async canleQianhua() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("qianghuaCtrl").getChildByName("congCard").getChildByName("main_bg").getComponent(Sprite).spriteFrame =
            await util.bundle.load(`image/qianghua/congCard2/spriteFrame`, SpriteFrame)
        this.node.parent.getChildByName("qianghuaCtrl").getChildByName("congCard").getChildByName("num").getComponent(Label).string = null
        this.node.parent.getChildByName("qianghuaCtrl").getComponent(qianghuaCtrl).myMap.clear();
        const childrens = [...this.ContentNode.children]
        for (let i = 0; i < childrens.length; i++) {
            const node = childrens[i];
            node.getChildByName("Toggle").getComponent(Toggle).isChecked = false
            node.getChildByName("stackCount").getComponent(Label).string = this.create[i].stackCount + ""
            node.getChildByName("Toggle").getComponent(Toggle).isChecked = false
            node.getChildByName("itemCount").getComponent(Label).string = "1"
            node.getChildByName("cong").active = false
        }
    }


    async render(create: CharacterStateCreate[], qianghuaCtrlInstance: qianghuaCtrl, map: Map<string, number>) {
        this.create = create
        this.myMap = map
        this.qianghuaCtrl = qianghuaCtrlInstance
        this.node.active = true
        const nodePool = util.resource.getNodePool(
            await util.bundle.load("prefab/fankuai", Prefab)
        )
        const childrens = [...this.ContentNode.children]
        for (let i = 0; i < childrens.length; i++) {
            const node = childrens[i];
            node.getChildByName("Toggle").off('toggle')
            node.getChildByName("levelUp").off('click')
            nodePool.put(node)
        }

        for (let i = 0; i < create.length; i++) {
            let item = nodePool.get()
            item.getChildByName("Toggle").active = true
            item.getChildByName("levelUp").active = true
            item.getChildByName("itemCount").active = true
            item.getChildByName("stackCount").getComponent(Label).string = create[i].stackCount + ""
            item.getChildByName("Toggle").getComponent(Toggle).isChecked = false
            item.getChildByName("itemCount").getComponent(Label).string = "1"
            item.getChildByName("cong").active = false
            for (const [key, value] of this.myMap) {
                if (create[i].id == key + "") {
                    item.getChildByName("Toggle").getComponent(Toggle).isChecked = true
                    item.getChildByName("cong").active = true
                    item.getChildByName("stackCount").getComponent(Label).string = (Number(create[i].stackCount) + 1 - Number(value)) + ""
                    item.getChildByName("itemCount").getComponent(Label).string = value + ""
                }
            }
            const meta = CharacterEnum[create[i].id]
            item.getChildByName("yxjm_df_txk").children[0].getComponent(Sprite).spriteFrame =
                await util.bundle.load(`game/texture/frames/hero/Header/${create[i].id}/spriteFrame`, SpriteFrame)
            // 渲染星级
            item.getChildByName("star-001").children.forEach(n => n.active = false)
            for (let j = 0; j < create[i].star; j++) {
                item.getChildByName("star-001").children[j].active = true
                if (j + 0.5 < create[i].star) {
                    item.getChildByName("star-001").children[j].children[0].active = true
                }
            }
            item.getChildByName("name").getComponent(Label).string = meta.name + "  Lv" + create[i].lv + "/" + create[i].maxLv
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
            item.getChildByName("Camp").getComponent(Label).string = cmp.get(meta.CharacterCamp) + "." + position[meta.position]
            // // 绑定事件
            // this.Item.children[goIntoNum - 1].on("click", () => { this.clickFun(create[i]) })
            item.getChildByName("id").getComponent(Label).string = create[i].id;
            // item.getChildByName("Toggle").on('toggle', callback, this);
            this.ContentNode.addChild(item)
            item.getComponent(AttrLevelCtrl).initData(this)
            continue
        }
    }

}


