import { _decorator, Component, find, instantiate, Node, Prefab, RichText, Sprite, SpriteFrame } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { FightMap } from '../../../Fight/Canvas/FightMap';
import { HomeCanvas } from '../../HomeCanvas';
const { ccclass, property } = _decorator;

@ccclass('ArenaMessageCrtl')
export class ArenaMessageCrtl extends Component {
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
            userId: config.userData.userId,
            finalLevel: this.ArenaId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/arenaMessageList", options)
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
                    await util.bundle.load("prefab/messageDetail", Prefab)
                )
                const childrens = [...this.ContentNode.children]
                for (let i = 0; i < childrens.length; i++) {
                    const node = childrens[i];
                    node.getChildByName("regitPlaye").off("click")
                    node.getChildByName("getRewards").off("click")
                    node.getChildByName("fEsmZCGbB").off("click")
                    node.getChildByName("fEsnbpxoT").off("click")
                    nodePool.put(node)
                }

                for (let i = 0; i < messageDetails.length; i++) {
                    let messageDetail = messageDetails[i]
                    let item = nodePool.get()

                    item.getChildByName("regitPlaye").active = true
                    item.getChildByName("fEsmZCGbB").active = false
                    item.getChildByName("fEsnbpxoT").active = false
                    item.getChildByName("getRewards").active = false
                    item.getChildByName("regitPlaye").on("click", () => { this.clickFun(messageDetail.gameFightId) })
                    item.getChildByName("yxjm_df_txk").children[0].getComponent(Sprite).spriteFrame =
                        await util.bundle.load(messageDetail.img, SpriteFrame)

                    let content = `<color=#E36F1A>${messageDetail.timeStr}  <color=#EEE365>${messageDetail.userName}</color>在<color=#EEE365>擂台赛</color>攻击了<color=#EEE365>${messageDetail.toUserName}</color>，激烈战斗后最终<color=#00BCD4>${messageDetail.isWin == 0 ? '获胜' : '落败'}</color>。</color>`

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

    async clickFun(id) {
        AudioMgr.inst.playOneShot("sound/other/click");
        const holAnimationPrefab = await util.bundle.load("prefab/FightMap", Prefab)
        const holAnimationNode = instantiate(holAnimationPrefab)
        this.node.parent.addChild(holAnimationNode)
        await holAnimationNode
            .getComponent(FightMap)
            .render(id, null, null)
        find('Canvas').getComponent(HomeCanvas).audioSource.pause()
        this.node.parent.getChildByName("FightMap").active = true
    }
    update(deltaTime: number) {

    }
}


