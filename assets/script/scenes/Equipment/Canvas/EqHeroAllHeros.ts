import { _decorator, Button, Component, instantiate, Node, Prefab } from 'cc';
import { util } from '../../../util/util';
import { getConfig, getToken } from '../../../common/config/config';
import { EqHeroCharacterDetail } from './EqHeroCharacterDetail';
import { HolPreLoad } from '../../../prefab/HolPreLoad';
import { EquipmentStateCreate } from '../../../game/fight/equipment/EquipmentState';
import { HolEqCharactersQueue } from '../../../prefab/HolEqCharactersQueue';
import { AudioMgr } from '../../../util/resource/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('EqHeroAllHeros')
export class EqHeroAllHeros extends Component {

    // 开始
    protected async start() {
        // 第一次渲染所有角色
        const holPreLoad = this.node.parent.getChildByName("HolPreLoad").getComponent(HolPreLoad)
        holPreLoad.node.active = true
        holPreLoad.setTips([
            "提示\n不同阵营之间相互克制，巧用阵营可以出奇制胜",
        ])
        holPreLoad.setProcess(20)
        // const config = getConfig()
        // 监听进度条完成函数
        holPreLoad.listenComplete(async () => {
            await this.render(config.userData.equipments)
        })
        // // 设置 100%
        holPreLoad.setProcess(100)
        const config = getConfig()
        await this.render(config.userData.equipments)
    }
    async render(equipmentQueue: EquipmentStateCreate[]) {
        await this.node.getChildByName("HolCharactersQueue")
            .getComponent(HolEqCharactersQueue)
            .render(equipmentQueue, async (c, n) => {
                let eqCharacters = c
                const holAnimationPrefab = await util.bundle.load("prefab/CharacterDetail", Prefab)
                const holAnimationNode = instantiate(holAnimationPrefab)
                this.node.parent.addChild(holAnimationNode)
                await holAnimationNode
                    .getComponent(EqHeroCharacterDetail)
                    .setCharacter(eqCharacters, async (c, n) => {
                        this.clickFun1(c.id, n)
                        return
                    })
                this.node.parent.getChildByName("CharacterDetail").active = true
            })
    }
    public async clickFun1(itemId, node) {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            id: itemId,
            userId: config.userData.userId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/changeEqState", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    var userInfo = data.data;
                    config.userData.equipments = userInfo.eqCharactersList
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                    node.getChildByName("sell").active = false
                    await this.render(config.userData.equipments)
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );
    }
}

