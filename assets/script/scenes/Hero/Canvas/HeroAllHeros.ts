import { _decorator, Button, Component, Node, Prefab } from 'cc';
import { util } from '../../../util/util';
import { getConfig } from '../../../common/config/config';
import { CharacterStateCreate } from '../../../game/fight/character/CharacterState';
import { HolCharactersQueue } from '../../../prefab/HolCharactersQueue';
import { HeroCharacterDetail } from './HeroCharacterDetail';
import { HolPreLoad } from '../../../prefab/HolPreLoad';
const { ccclass, property } = _decorator;

@ccclass('HeroAllHeros')
export class HeroAllHeros extends Component {

    // 开始
    protected async start() {
        // 第一次渲染所有角色
        const holPreLoad = this.node.parent.getChildByName("HolPreLoad").getComponent(HolPreLoad)
        holPreLoad.setTips([
            "提示\n不同阵营之间相互克制，巧用阵营可以出奇制胜",
            "提示\n合理培养卡牌，低星卡牌也能发挥巨大作用",
            "提示\n记得领取每日奖励，积累资源更快成长",
            "提示\n闯关遇到瓶颈可以尝试调整上阵阵容",
            "提示\n完成成就任务可以获得丰厚额外奖励",
        ]);
        holPreLoad.setProcess(20)
        const config = getConfig()
        // 监听进度条完成函数
        holPreLoad.listenComplete(async () => {
            await this.render(config.userData.characters)
        })
        // 设置 100%
        holPreLoad.setProcess(100)

    }

    async render(characterQueue: CharacterStateCreate[]) {
        await this.node.getChildByName("HolCharactersQueue")
            .getComponent(HolCharactersQueue)
            .render(characterQueue, async (c, n) => {
                console.log(1112)
                const characterDetail = this.node.parent.getChildByName("CharacterDetail")
                characterDetail.active = true
                await characterDetail.getComponent(HeroCharacterDetail).setCharacter(c)
            })
    }
}

