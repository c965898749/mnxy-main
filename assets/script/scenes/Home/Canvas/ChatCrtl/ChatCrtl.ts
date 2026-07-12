import { _decorator, Button, Color, Component, EditBox, find, instantiate, Label, Node, Prefab, RichText, ScrollView, Sprite, SpriteFrame } from 'cc';
import { chatCache, getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { FightMap } from '../../../Fight/Canvas/FightMap';
import { HomeCanvas } from '../../HomeCanvas';
import { ChannelType, ChatMsg, MsgContentType } from 'db://assets/script/common/config/ChatMsg';
const { ccclass, property } = _decorator;

@ccclass('ChatCrtl')
export class ChatCrtl extends Component {
    @property(ScrollView)
    scrollView: ScrollView = null!;
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    @property({ type: Node, tooltip: "任务列表" }) ContentNode2: Node = null;
    timer = 100
    initialized = false;
    @property(EditBox)
    chatContent: EditBox;
    tuPuhenchenList = []
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


    async update(deltaTime: number) {
        if (this.timer >= 50) {
            console.log("刷新")
            const config = getConfig()
            const nodePool = util.resource.getNodePool(
                await util.bundle.load("prefab/chatDetail", Prefab)
            )
            const childrens = [...this.ContentNode.children]
            for (let i = 0; i < childrens.length; i++) {
                const node = childrens[i];
                node.off("click")
                node.getComponent(Button).interactable = true
                nodePool.put(node)
            }
            const messageDetails = chatCache.getAllLocalList(1, null);
            for (let i = 0; i < messageDetails.length; i++) {
                let messageDetail = messageDetails[i]
                let item = nodePool.get()
                item.on("click", () => { this.clickFun2(messageDetail.itemId) })
                if (messageDetail.contentType == 2) {
                    item.getComponent(Button).interactable = true
                } else {
                    item.getComponent(Button).interactable = false
                }
                if (config.userData.userId == messageDetail.senderId) {
                    item.getChildByName("conenct").getChildByName("type").active = false
                    item.getChildByName("conenct").getChildByName("type2").active = true
                    item.getChildByName("conenct").getChildByName("SpriteSplash").getComponent(Sprite).color = new Color().fromHEX("#BEFFE4");
                } else {
                    item.getChildByName("conenct").getChildByName("type").active = true
                    item.getChildByName("conenct").getChildByName("type2").active = false
                    item.getChildByName("conenct").getChildByName("SpriteSplash").getComponent(Sprite).color = new Color().fromHEX("#D7F1E8");

                }
                item.getChildByName("top").getChildByName("name").getComponent(Label).string = messageDetail.senderName + "（战力：999999）"
                item.getChildByName("top").getChildByName("time").getComponent(Label).string = messageDetail.sendTime
                let content = null;
                content = `<color=#E36F1A>${messageDetail.content}</color>`
                item.getChildByName("conenct").getChildByName("SpriteSplash").getChildByName("RichText").getComponent(RichText).string = content
                this.ContentNode.addChild(item)
                continue
            }
            // 只有原本停在底部，才瞬移到底；翻看历史不自动跳转
            this.timer = 0;
            const stayBottom = this.isScrollAtBottom();
            this.scheduleOnce(() => {
                // 只有原本停在底部，才自动瞬移到底
                if (stayBottom) {
                    this.scrollView.scrollToBottom(0);
                }
            }, 0);
        }
        else {
            this.timer++;
        }

    }
    // 判断滚动视图是否已经在最底部
    private isScrollAtBottom(): boolean {
        const maxY = this.scrollView.getMaxScrollOffset().y;
        const curY = this.scrollView.getScrollOffset().y;
        // 误差5像素内视为底部
        return Math.abs(curY - maxY) < 5;
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
                this.tuPuhenchenList = data.data
            })
            .catch(error => {
                //console.error('There was a problem with the fetch operation:', error);
            }
            );
    }

    chatMsgSave() {
        const chatContent = this.chatContent.string;
        if (!chatContent) {
            const close = util.message.confirm({ message: "请输入传音内容" })
            return;
        }
        const config = getConfig()
        const chatMsg: ChatMsg = {
            channelType: ChannelType.WORLD,
            content: chatContent,
            contentType: MsgContentType.TEXT,
            senderId: config.userData.userId,
            senderName: config.userData.nickname,
            // 补齐缺失字段
            targetId: 0,
            msgId: Date.now(),
            sendTime: new Date().toLocaleString(),
            itemId: 0,
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(chatMsg),
        };
        fetch(config.ServerUrl.url + "chatMsgSave", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                this.chatContent.string = ""
                chatCache.saveChatItem2(chatMsg)
                const messageDetails = chatCache.getAllLocalList(1, null);
                console.log(messageDetails)
            })
            .catch(error => {
                //console.error('There was a problem with the fetch operation:', error);
            }
            );
    }

    async clickFun2(id) {
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
    public async openOther() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.getChildByName("ScrollView").active = !this.node.getChildByName("ScrollView").active
        if (this.node.getChildByName("ScrollView").active) {
            const nodePool = util.resource.getNodePool(
                await util.bundle.load("prefab/videoItem", Prefab)
            )
            const childrens = [...this.ContentNode2.children]
            for (let i = 0; i < childrens.length; i++) {
                const node = childrens[i];
                node.off("click")
                node.getComponent(Button).transition = 0
                nodePool.put(node)
            }
            for (let i = 0; i < this.tuPuhenchenList.length; i++) {
                let character = this.tuPuhenchenList[i]
                const node = nodePool.get()
                node.getChildByName("name0").getComponent(Label).string = character.userName
                node.getChildByName("name1").getComponent(Label).string = character.toUserName
                node.getComponent(Button).transition = 3
                node.getComponent(Button).zoomScale = 0.9
                node.on("click", () => { this.clickFun(character) })
                this.ContentNode2.addChild(node)
                // 绑定事件
                continue
            }
        }
    }
    async clickFun(character) {
        let content = null;
        content = `<color=#8B4513>【切磋录像】</color><color=#E36F1A>${character.userName}</color><color=#999999> VS </color><color=#E36F1A>${character.toUserName}</color>`

        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        const chatMsg: ChatMsg = {
            channelType: ChannelType.WORLD,
            content: content,
            contentType: MsgContentType.VOICE,
            senderId: config.userData.userId,
            senderName: config.userData.nickname,
            // 补齐缺失字段
            targetId: 0,
            msgId: Date.now(),
            sendTime: new Date().toLocaleString(),
            itemId: character.id,
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(chatMsg),
        };
        fetch(config.ServerUrl.url + "chatMsgSave", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                this.chatContent.string = ""
                this.node.getChildByName("ScrollView").active = !this.node.getChildByName("ScrollView").active
                chatCache.saveChatItem2(chatMsg)
            })
            .catch(error => {
                //console.error('There was a problem with the fetch operation:', error);
            }
            );
    }

    goback() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }
}


