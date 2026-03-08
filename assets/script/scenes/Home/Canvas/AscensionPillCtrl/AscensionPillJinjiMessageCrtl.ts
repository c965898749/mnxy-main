import { _decorator, Component, find, instantiate, Node, Prefab, RichText, Sprite, SpriteFrame } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { FightMap } from '../../../Fight/Canvas/FightMap';
import { HomeCanvas } from '../../HomeCanvas';
const { ccclass, property } = _decorator;

@ccclass('AscensionPillJinjiMessageCrtl')
export class AscensionPillJinjiMessageCrtl extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    @property(Node)
    zhan: Node
    @property(Node)
    find: Node
    @property(Node)
    rew: Node
    initialized: boolean = false
    type = 1;
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


    refresh() {
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId,
            str: this.type
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/duoMessageList", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                let messageDetails = data.data
                this.node.active = true
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
                    item.getChildByName("regitPlaye").on("click", () => { this.clickFun(messageDetail.fightId) })
                    item.getChildByName("yxjm_df_txk").children[0].getComponent(Sprite).spriteFrame =
                        await util.bundle.load(messageDetail.gameImg, SpriteFrame)

                    let content = null;
                    content = `<color=#E36F1A>${messageDetail.timeStr}  <color=#EEE365>我 </color>在<color=#EEE365>飞升丹夺取中</color>遭到<color=#EEE365>${messageDetail.nickname}</color>抢夺你<color=#00BCD4>${messageDetail.robPillNum}个飞升丹</color>。</color>`
                    item.getChildByName("RichText").getComponent(RichText).string = content
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
    async goBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }
}


