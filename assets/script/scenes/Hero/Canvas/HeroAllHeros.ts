import { _decorator, Button, Component, Node, Prefab } from 'cc';
import { util } from '../../../util/util';
import { getConfig } from '../../../common/config/config';
import { CharacterStateCreate } from '../../../game/fight/character/CharacterState';
import { HolCharactersQueue } from '../../../prefab/HolCharactersQueue';
import { HeroCharacterDetail } from './HeroCharacterDetail';
const { ccclass, property } = _decorator;

@ccclass('HeroAllHeros')
export class HeroAllHeros extends Component {

    // 开始
    protected async start() {
        // 第一次渲染所有角色
        const config = getConfig()
        const close = await util.message.load()
        const cahracterQueue = []
        await this.render(config.userData.characters)
        close()
    }

    async render(characterQueue: CharacterStateCreate[]) {
        await this.node.getChildByName("HolCharactersQueue")
        .getComponent(HolCharactersQueue)
        .render(characterQueue , async (c , n) => {
            console.log(1112)
            const characterDetail = this.node.parent.getChildByName("CharacterDetail")
            characterDetail.active = true
            await characterDetail.getComponent(HeroCharacterDetail).setCharacter(c)
        })
    }
}

