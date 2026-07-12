import { _decorator, Component, find, instantiate, Label, Node, Prefab, RichText, Sprite, SpriteFrame } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { FightMap } from '../../../Fight/Canvas/FightMap';
import { HomeCanvas } from '../../HomeCanvas';
const { ccclass, property } = _decorator;

@ccclass('VideoCrtl')
export class VideoCrtl extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
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
    goBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
        this.node.parent.getChildByName("otherCtrl").active = true
    }

    refresh() {
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId,
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "videoList", options)
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
                    await util.bundle.load("prefab/VideoDetail", Prefab)
                )
                const childrens = [...this.ContentNode.children]
                for (let i = 0; i < childrens.length; i++) {
                    const node = childrens[i];
                    node.getChildByName("fEsmZCGbB").off("click")
                    node.getChildByName("fEsnbpxoT").off("click")
                    nodePool.put(node)
                }

                for (let i = 0; i < messageDetails.length; i++) {
                    let messageDetail = messageDetails[i]
                    let item = nodePool.get()
                    item.getChildByName("fEsmZCGbB").on("click", () => { this.clickFun(messageDetail.id) })
                    item.getChildByName("fEsnbpxoT").on("click", () => { this.clickFun2(messageDetail.id) })
                    item.getChildByName("timeStr").getComponent(Label).string = messageDetail.timeStr
                    item.getChildByName("name0").getComponent(Label).string = messageDetail.userName
                    item.getChildByName("name1").getComponent(Label).string = messageDetail.toUserName
                    if (messageDetail.win == 1) {
                        item.getChildByName("win0").active = true
                        item.getChildByName("win1").active = false
                    } else {
                        item.getChildByName("win0").active = false
                        item.getChildByName("win1").active = true
                    }
                    this.ContentNode.addChild(item)
                    continue
                }
            })
            .catch(error => {
                //console.error('There was a problem with the fetch operation:', error);
            }
            );
    }
    clickFun2(id) {
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId,
            id: id
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "deleteVideo", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                this.refresh()
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


