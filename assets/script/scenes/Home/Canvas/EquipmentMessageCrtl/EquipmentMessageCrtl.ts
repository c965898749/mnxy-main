import { _decorator, Component, instantiate, Node, Prefab, RichText, Sprite, SpriteFrame } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { EqHeroCharacterDetail } from '../../../Equipment/Canvas/EqHeroCharacterDetail';
const { ccclass, property } = _decorator;

@ccclass('EquipmentMessageCrtl')
export class EquipmentMessageCrtl extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    initialized: boolean = false
    ArenaId: number
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
    backPk() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }
    initData(arenaId) {
        this.ArenaId = arenaId
        this.node.active = true
    }
    refresh() {
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/equipmentMessageList", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                let messageDetails = data.data
                // this.node.active = true
                const nodePool = util.resource.getNodePool(
                    await util.bundle.load("prefab/equipmentDetail", Prefab)
                )
                const childrens = [...this.ContentNode.children]
                for (let i = 0; i < childrens.length; i++) {
                    const node = childrens[i];
                    node.getChildByName("yxjm_df_txk").off("click")
                    nodePool.put(node)
                }

                for (let i = 0; i < messageDetails.length; i++) {
                    let messageDetail = messageDetails[i]
                    let item = nodePool.get()
                    item.getChildByName("yxjm_df_txk").on("click", () => { this.clickFun(messageDetail) })
                    item.getChildByName("yxjm_df_txk").children[0].getComponent(Sprite).spriteFrame =
                        await util.bundle.load(`game/texture/frames/emp/${messageDetail.id.split('_')[0]}/spriteFrame`, SpriteFrame)

                    var content = `<color=#E5D75A>${messageDetail.userName}  <color=#E69A3A>${messageDetail.timeStr}打造了 </color><color=#E5D75A>${messageDetail.eqName}</color><color=#EEE365>(${messageDetail.star}星)</color></color></color>`

                    item.getChildByName("RichText").getComponent(RichText).string = content
                    // // 绑定事件

                    this.ContentNode.addChild(item)
                    continue
                }
            })
            .catch(error => {
                //console.error('There was a problem with the fetch operation:', error);
            }
            );
    }

    async clickFun(eqCharacters) {
        const holAnimationPrefab = await util.bundle.load("prefab/CharacterDetail2", Prefab)
        const holAnimationNode = instantiate(holAnimationPrefab)
        this.node.parent.addChild(holAnimationNode)
        await holAnimationNode
            .getComponent(EqHeroCharacterDetail)
            .setCharacter(eqCharacters, async (c, n) => {
                // n.removeFromParent();
                // n.destroy()
                // this.clickFun1(c.id, n, empType)
                return
            })
        // this.node.parent.getChildByName("CharacterDetail").active = true
    }
    update(deltaTime: number) {

    }
}


