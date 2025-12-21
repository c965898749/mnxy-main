import { _decorator, Button, Component, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { getConfig } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { ActiveCtrl } from '../ActiveCtrl/ActiveCtrl';
const { ccclass, property } = _decorator;

@ccclass('HotEventsCtrl')
export class HotEventsCtrl extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    initialized = false;
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
    async refresh() {
        const config = getConfig()
        const postData = {
            // : token,
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "getActivityList", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                //console.log(data); // 处理响应数据
                if (data.success == '1') {
                    var data = data.data;
                    const nodePool = util.resource.getNodePool(
                        await util.bundle.load("prefab/HotEvents", Prefab)
                    )
                    const childrens = [...this.ContentNode.children]
                    for (let i = 0; i < childrens.length; i++) {
                        const node = childrens[i];
                        node.getChildByName("anjian2").off("click")
                        node.getComponent(Button).node.off("click")
                        nodePool.put(node)
                    }
                    for (let i = 0; i < data.length; i++) {
                        let hotActive = data[i]
                        let item = nodePool.get()
                        item.getComponent(Sprite).spriteFrame =
                            await util.bundle.load("image/HotEvents/" + hotActive.activityCode + "/spriteFrame", SpriteFrame)
                        if (hotActive.isNotice == "1") {
                            item.getChildByName("anjian2").active = false
                            item.getComponent(Button).node.on("click", () => {
                                this.noticeActive(hotActive.activityCode)
                            })
                        } else {
                            item.getChildByName("anjian2").on("click", () => {
                                this.openHotEvents(hotActive.activityCode)
                            })
                        }
                        this.ContentNode.addChild(item)
                        continue
                    }
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );
    }

    noticeActive(activityCode) {
        AudioMgr.inst.playOneShot("sound/other/click");
        let activeCtrl = this.node.parent.getChildByName("ActiveCtrl")
        activeCtrl.getComponent(ActiveCtrl).init(activityCode)
        activeCtrl.active = true
    }
    update(deltaTime: number) {

    }

    openHotEvents(reg) {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName(reg).active = true
    }
    goback() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }
}


