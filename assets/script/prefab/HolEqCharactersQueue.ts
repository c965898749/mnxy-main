import { _decorator, Button, Component, Node, Prefab } from 'cc';
import { util } from '../util/util';
import { EquipmentStateCreate } from '../game/fight/equipment/EquipmentState';
import { HolEqCharacterAvatar } from './HolEqCharacterAvatar';
import { renderListInChunks } from '../util/ListLoader';
const { ccclass, property } = _decorator;

@ccclass('HolEqCharactersQueue')
export class HolEqCharactersQueue extends Component {
    // 内容节点
    @property(Node)
    ContentNode: Node

    // 渲染函数：分帧创建节点避免单帧卡页；setCharacter 内部已并行预取贴图，此处不 await
    async render(characters: EquipmentStateCreate[] , clickFun?: (characters: EquipmentStateCreate , node: Node) => any) {
        const nodePool = util.resource.getNodePool(
            await util.bundle.load("prefab/HeroEqCardItem" , Prefab)
        )
        const childrens = [...this.ContentNode.children]
        for (let i = 0; i < childrens.length; i++) {
            const node = childrens[i];
            node.off("click")
            node.getComponent(Button).transition = 0
            nodePool.put(node)
        }
        console.log(characters,5555)
        renderListInChunks(this, this.ContentNode, characters, (character) => {
            const node = nodePool.get()
            const characterAvatar = node.getComponent(HolEqCharacterAvatar)
            characterAvatar.setCharacter(character)
            node.getComponent(Button).transition = 3
            node.getComponent(Button).zoomScale = 0.9
            // 绑定事件
            node.on("click" , () => {if (clickFun) clickFun(character , node)})
            return node
        })
        return
    }
}

