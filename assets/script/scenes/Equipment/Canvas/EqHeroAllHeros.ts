import { _decorator, Button, Component, Node, Prefab } from 'cc';
import { util } from '../../../util/util';
import { getConfig } from '../../../common/config/config';
import { EqHeroCharacterDetail } from './EqHeroCharacterDetail';
import { HolPreLoad } from '../../../prefab/HolPreLoad';
import { EquipmentStateCreate } from '../../../game/fight/equipment/EquipmentState';
import { HolEqCharactersQueue } from '../../../prefab/HolEqCharactersQueue';
const { ccclass, property } = _decorator;

@ccclass('EqHeroAllHeros')
export class EqHeroAllHeros extends Component {

    // 开始
    protected async start() {
        // 第一次渲染所有角色
        const holPreLoad = this.node.parent.getChildByName("HolPreLoad").getComponent(HolPreLoad)
        holPreLoad.setTips([
            "提示\n不同阵营之间相互克制，巧用阵营可以出奇制胜",
        ])
        holPreLoad.setProcess(20)
        const config = getConfig()
        // 监听进度条完成函数
        holPreLoad.listenComplete(async () => {
            await this.render(config.userData.equipments)
        })
        // 设置 100%
        holPreLoad.setProcess(100)

    }

    async render(equipmentQueue: EquipmentStateCreate[]) {
        await this.node.getChildByName("HolCharactersQueue")
            .getComponent(HolEqCharactersQueue)
            .render(equipmentQueue, async (c, n) => {
                console.log(1112)
                const characterDetail = this.node.parent.getChildByName("CharacterDetail")
                characterDetail.active = true
                await characterDetail.getComponent(EqHeroCharacterDetail).setCharacter(c)
            })
    }
}

