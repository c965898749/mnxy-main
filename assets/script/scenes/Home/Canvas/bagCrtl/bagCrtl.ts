import { _decorator, Button, Component, director, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { HolPreLoad } from 'db://assets/script/prefab/HolPreLoad';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { HechenCtrl } from '../HechenCtrl/HechenCtrl';
const { ccclass, property } = _decorator;

@ccclass('bagCrtl')
export class bagCrtl extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    @property({ type: Node, tooltip: "任务列表" }) ContentNode2: Node = null;
    initialized: boolean = false
    @property(Node)
    zhan: Node
    @property(Node)
    find: Node
    @property(Node)
    rew: Node
    @property(Node)
    rew2: Node
    @property(Node)
    rew3: Node
    type = 1;
    async start() {
        // 第一次渲染所有角色
        const holPreLoad = this.node.getChildByName("HolPreLoad").getComponent(HolPreLoad)
        holPreLoad.node.active = true
        holPreLoad.setTips([
            "提示\n不同阵营之间相互克制，巧用阵营可以出奇制胜",
        ])
        holPreLoad.setProcess(20)
        // const config = getConfig()
        // 监听进度条完成函数
        holPreLoad.listenComplete(async () => {
            this.refresh()
        })
        // // 设置 100%
        holPreLoad.setProcess(100)
        const config = getConfig()
        this.refresh()
    }
    // onEnable() {
    //     if (!this.initialized) {
    //         // 初始化代码
    //         this.initialized = true;
    //     } else {
    //         this.refresh()
    //     }

    // }

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
        fetch(config.ServerUrl.url + "bagItemList", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                let items = data.data
                this.node.active = true
                const nodePool = util.resource.getNodePool(
                    await util.bundle.load("prefab/ff4", Prefab)
                )
                const childrens = [...this.ContentNode.children]
                for (let i = 0; i < childrens.length; i++) {
                    const node = childrens[i];
                    node.getChildByName("use").off("click")
                    node.getChildByName("diu").off("click")
                    nodePool.put(node)
                }

                for (let i = 0; i < items.length; i++) {
                    let itemDetail = items[i]
                    let item = nodePool.get()

                    if (itemDetail.itemType == 6) {
                        item.getChildByName("use").active = false
                    } else {
                        item.getChildByName("use").active = true
                        item.getChildByName("use").on("click", () => { this.clickUseFun(itemDetail.itemId) })
                    }
                    item.getChildByName("diu").on("click", () => { this.clickDiuFun(itemDetail.itemId) })
                    item.getChildByName("name").getComponent(Label).string = itemDetail.itemName
                    item.getChildByName("Count").getComponent(Label).string = itemDetail.description
                    item.getChildByName("textbox_bg").getChildByName("num").getComponent(Label).string = itemDetail.itemCount
                    item.getChildByName("yxjm_df_txk").children[0].getComponent(Sprite).spriteFrame =
                        await util.bundle.load(itemDetail.icon, SpriteFrame)
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

    async refresh2() {
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "cailiao", options)
            .then(response => {

                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    var characters = data.data;
                    const nodePool2 = util.resource.getNodePool(
                        await util.bundle.load("prefab/HolCharacterAvatar", Prefab)
                    )
                    const childrens = [...this.ContentNode2.children]
                    for (let i = 0; i < childrens.length; i++) {
                        const node = childrens[i];
                        node.off("click")
                        // node.getComponent(Button).transition = 0
                        nodePool2.put(node)
                    }
                    for (const character of characters) {
                        const node = nodePool2.get()
                        node.getChildByName("Avatar").getComponent(Sprite).spriteFrame = await util.bundle.load(character.icon, SpriteFrame)
                        node.getChildByName("itemCount").active = true
                        node.getChildByName("itemCount").getComponent(Label).string = character.itemCount
                        // node.getComponent(Button).transition = 3
                        // node.getComponent(Button).zoomScale = 0.9
                        this.ContentNode2.addChild(node)
                        // 绑定事件
                        node.on("click", () => { this.hechen(character) })
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
        return
    }

    public async hechen(character) {
        await this.node.getChildByName("hechen")
            .getComponent(HechenCtrl)
            .render(character, async () => {
                this.refresh2()
                return
            })
    }



    goback2() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.rew3.active = false
    }

    clickUseFun(itemId) {
        // useBagItem
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
        fetch(config.ServerUrl.url + "useBagItem", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    const userInfo = data.data;
                    config.userData.gold = userInfo.gold
                    config.userData.characters = userInfo.characterList
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                    localStorage.setItem('Leave_EnergyNumber2', userInfo.tiliCount + "");
                    localStorage.setItem('LastGetTime1', userInfo.tiliCountTime + "");
                    localStorage.setItem('LastGetHuoliTime1', userInfo.huoliCountTime + "");
                    localStorage.setItem('Leave_EnergyHuoliNumber2', userInfo.huoliCount + "");
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
                this.refresh()
            })
            .catch(error => {
                //console.error('There was a problem with the fetch operation:', error);
            }
            );
    }
    clickDiuFun(itemId) {

    }
    update(deltaTime: number) {

    }
    async goBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        const close = await util.message.load()
        director.preloadScene("Home", () => close())
        director.loadScene("Home")
    }

    async zhanbao() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.zhan.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian/spriteFrame', SpriteFrame)
        this.find.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian2/spriteFrame', SpriteFrame)
        // this.rew.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian2/spriteFrame', SpriteFrame)
        this.type = 1;
        this.rew.active = true
        this.rew2.active = false
        this.refresh()
    }
    async frineds() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.zhan.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian2/spriteFrame', SpriteFrame)
        this.find.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian/spriteFrame', SpriteFrame)
        // this.rew.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian2/spriteFrame', SpriteFrame)
        this.type = 2;
        this.rew.active = false
        this.rew2.active = true
        this.refresh2()
    }
    // async rewads() {
    //     AudioMgr.inst.playOneShot("sound/other/click");
    //     this.zhan.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian2/spriteFrame', SpriteFrame)
    //     this.find.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian2/spriteFrame', SpriteFrame)
    //     this.rew.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian/spriteFrame', SpriteFrame)
    //     this.type = 3;
    //     this.refresh()
    // }
}


