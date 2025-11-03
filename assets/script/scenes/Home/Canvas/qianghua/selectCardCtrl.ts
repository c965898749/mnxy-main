import { _decorator, Button, Component, instantiate, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { getConfig } from 'db://assets/script/common/config/config';
import { CharacterEnum } from 'db://assets/script/game/fight/character/CharacterEnum';
import { CharacterState, CharacterStateCreate } from 'db://assets/script/game/fight/character/CharacterState';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

@ccclass('SelectCardCtrl')
export class SelectCardCtrl extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    initialized = false;
    $qianghuaCtrl: Node
    $state: CharacterState;
    start() {
        // this.initData()
    }

    onEnable() {
        // if (!this.initialized) {
        //     // 初始化代码
        //     this.initialized = true;
        // } else {
        //     // this.refresh()
        //     this.initData()
        // }

    }
    update(deltaTime: number) {

    }


    public backQianhua() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }

    async render(create: CharacterStateCreate[] , clickFun?: (characters: CharacterStateCreate , node: Node) => any) {
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
            item.getChildByName("stackCount").getComponent(Label).string =create[i].stackCount+""
            item.getChildByName("name").getComponent(Label).string = meta.name + "  Lv" + create[i].lv + "/"+create[i].maxLv
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
            item.getChildByName("Button").getComponent(Button).transition = 3
            item.getChildByName("Button").getComponent(Button).zoomScale = 0.9
            item.getChildByName("Button").on("click" , () => {if (clickFun) clickFun(create[i] , this.node)})
            this.ContentNode.addChild(item)
            continue
        }
    }
    
}


