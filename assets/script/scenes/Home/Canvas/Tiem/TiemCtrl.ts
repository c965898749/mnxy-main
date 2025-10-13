import { _decorator, Button, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { getConfig } from 'db://assets/script/common/config/config';
import { CharacterEnum } from 'db://assets/script/game/fight/character/CharacterEnum';
import { util } from 'db://assets/script/util/util';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { HeroCharacterDetail } from '../../../Hero/Canvas/HeroCharacterDetail';
const { ccclass, property } = _decorator;

@ccclass('TiemCtrl')
export class TiemCtrl extends Component {

    @property(Node)
    Item: Node
    initialized = false;
    // @property(Node)
    // CharacterDetail: Node
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
    async refresh() {

        // 你的刷新逻辑
        const config = getConfig()
        const create = config.userData.characters.filter(x => x.goIntoNum != 0)
        this.Item.children.forEach(n => n.getChildByName("tiemHeader").children[0].getComponent(Sprite).spriteFrame = null)
        for (let i = 0; i < create.length; i++) {
            const meta = CharacterEnum[create[i].id]
            var goIntoNum = create[i].goIntoNum
            this.Item.children[goIntoNum - 1].getChildByName("tiemHeader").children[0].getComponent(Sprite).spriteFrame =
                await util.bundle.load(`game/texture/frames/hero/Header/${create[i].id}/spriteFrame`, SpriteFrame)
            // 渲染星级
            this.Item.children[goIntoNum - 1].children[4].active=true
            this.Item.children[goIntoNum - 1].children[3].active=true
            this.Item.children[goIntoNum - 1].children[2].active=true
            this.Item.children[goIntoNum - 1].children[4].children.forEach(n => n.active = false)
            for (let j = 0; j < create[i].star; j++) {
                this.Item.children[goIntoNum - 1].children[4].children[j].active = true
                if (j + 0.5 < create[i].star) {
                    this.Item.children[goIntoNum - 1].children[4].children[j].children[0].active = true
                }
            }
            this.Item.children[goIntoNum - 1].children[2].getComponent(Label).string = meta.name + "  Lv" + create[i].lv + "/25"
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
            this.Item.children[goIntoNum - 1].children[3].getComponent(Label).string = cmp.get(meta.CharacterCamp) + "." + position[meta.position]
            // 绑定事件
            this.Item.children[goIntoNum - 1].on("click", () => { this.clickFun(create[i]) })
            continue
        }
    }
    public async clickFun(c) {
        // AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("TiemCtrl").active = false
        this.node.parent.getChildByName("Floor").active = false
        const characterDetail = this.node.parent.getChildByName("CharacterDetail")
        characterDetail.active = true
        await characterDetail.getComponent(HeroCharacterDetail).setCharacter(c)
    }


    update(deltaTime: number) {

    }


    // 返回

}


