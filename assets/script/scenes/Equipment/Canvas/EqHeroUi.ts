import { _decorator, Component, director, EventMouse, Node } from 'cc';
import { util } from '../../../util/util';
import { getConfig } from '../../../common/config/config';
import { EqHeroAllHeros } from './EqHeroAllHeros';
import { AudioMgr } from '../../../util/resource/AudioMgr';
import { EquipmentStateCreate } from '../../../game/fight/equipment/EquipmentState';
import { EquipmentEnum } from '../../../game/fight/equipment/EquipmentEnum';
const { ccclass, property } = _decorator;

@ccclass('EqHeroUi')
export class EqHeroUi extends Component {


    // 当前过滤阵容
    private $currentCamp: string = ""
    // 阵容过滤
    async filterByCamp(e: EventMouse, camp: string) {
        const allHeros = this.node.parent.getChildByName("AllHeros").getComponent(EqHeroAllHeros)
        let cahracterQueue: EquipmentStateCreate[] = []
        this.node.children.forEach(node => {
            const lightNode = node.getChildByName("Light")
            if (lightNode) lightNode.active = false
        })
        if (this.$currentCamp === camp) {
            const config = getConfig()
            const close = await util.message.load()
            cahracterQueue = cahracterQueue.concat(config.userData.equipments)
            await allHeros.render(cahracterQueue)
            close()
            this.$currentCamp = ""
        } else {
            //   const meta = CharacterEnum[create.id]
            this.$currentCamp = camp
            const config = getConfig()
            const close = await util.message.load()
            cahracterQueue = cahracterQueue.concat(config.userData.equipments)
            cahracterQueue = cahracterQueue.filter(c => EquipmentEnum[c.id].CharacterCamp === camp)
            await allHeros.render(cahracterQueue)
            close()
            e.target.getChildByName("Light").active = true
        }
    }
}

