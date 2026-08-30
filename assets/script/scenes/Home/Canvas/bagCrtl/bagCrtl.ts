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
    initialized: boolean = false;

    @property(Node) zhan: Node = null;
    @property(Node) find: Node = null;
    @property(Node) rew: Node = null;
    @property(Node) rew2: Node = null;
    @property(Node) rew3: Node = null;

    type = 1;

    // 缓存节点池，避免每次refresh重复load prefab
    private _itemPool: ReturnType<typeof util.resource.getNodePool> = null;
    private _charPool: ReturnType<typeof util.resource.getNodePool> = null;
    // 用于取消请求，防止并发旧请求覆盖UI

    async start() {
        const holPreLoadNode = this.node.getChildByName("HolPreLoad");
        if (!holPreLoadNode) return;
        const holPreLoad = holPreLoadNode.getComponent(HolPreLoad);
        if (!holPreLoad) return;

        holPreLoad.node.active = true;
        holPreLoad.setTips([
            "提示\n不同阵营之间相互克制，巧用阵营可以出奇制胜",
            "提示\n合理培养卡牌，低星卡牌也能发挥巨大作用",
            "提示\n记得领取每日奖励，积累资源更快成长",
            "提示\n闯关遇到瓶颈可以尝试调整上阵阵容",
            "提示\n完成成就任务可以获得丰厚额外奖励",
        ]);
        holPreLoad.setProcess(20);

        // 只在加载完成后执行refresh，删掉start直接调用refresh，避免重复刷新
        holPreLoad.listenComplete(() => {
            this.refresh();
        });
        holPreLoad.setProcess(100);

        // 预加载两个预制体，初始化池
        const itemPrefab = await util.bundle.load("prefab/ff4", Prefab);
        const charPrefab = await util.bundle.load("prefab/HolCharacterAvatar", Prefab);
        this._itemPool = util.resource.getNodePool(itemPrefab);
        this._charPool = util.resource.getNodePool(charPrefab);
    }



    refresh() {
        const config = getConfig();
        const token = getToken();
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
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                const items = data.data || [];
                this.node.active = true;

                // 回收旧节点
                if (this.ContentNode && this._itemPool) {
                    const childrens = [...this.ContentNode.children];
                    for (const node of childrens) {
                        // 解绑所有点击
                        const useBtn = node.getChildByName("use");
                        const diuBtn = node.getChildByName("diu");
                        if (useBtn) useBtn.off("click");
                        if (diuBtn) diuBtn.off("click");
                        this._itemPool.put(node);
                    }
                }

                for (const itemDetail of items) {
                    if (!this._itemPool) break;
                    const item = this._itemPool.get();
                    if (!item) continue;

                    const useBtn = item.getChildByName("use");
                    if (itemDetail.itemType == 6) {
                        if (useBtn) useBtn.active = false;
                    } else {
                        if (useBtn) {
                            useBtn.active = true;
                            useBtn.on("click", () => this.clickUseFun(itemDetail.itemId));
                        }
                    }
                    const diuBtn = item.getChildByName("diu");
                    if (diuBtn) diuBtn.on("click", () => this.clickDiuFun(itemDetail.itemId));

                    const nameLab = item.getChildByName("name")?.getComponent(Label);
                    const countLab = item.getChildByName("Count")?.getComponent(Label);
                    const numLab = item.getChildByName("textbox_bg")?.getChildByName("num")?.getComponent(Label);
                    if (nameLab) nameLab.string = itemDetail.itemName;
                    if (countLab) countLab.string = itemDetail.description;
                    if (numLab) numLab.string = itemDetail.itemCount;

                    this.loadItemIcon(item, itemDetail.icon);
                    this.ContentNode?.addChild(item);
                }
            })
            .catch(error => {
                if (error.name !== 'AbortError') {
                    console.error("背包列表请求异常", error);
                    util.message.confirm({ message: "网络异常，请重试" });
                }
            });
    }

    private async loadItemIcon(item: Node, iconPath: string) {
        try {
            const sf = await util.bundle.load(iconPath, SpriteFrame);
            const spriteNode = item.getChildByName("yxjm_df_txk")?.children[0];
            if (spriteNode) {
                const sprite = spriteNode.getComponent(Sprite);
                if (sprite) sprite.spriteFrame = sf;
            }
        } catch (e) {
            console.warn("图标加载失败", iconPath);
        }
    }

    refresh2() {
        const config = getConfig();
        const token = getToken();
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
            .then(response => response.json())
            .then(data => {
                if (data.success != '1') {
                    util.message.confirm({ message: data.errorMsg || "服务器异常" });
                    return;
                }
                const characters = data.data || [];
                if (!this.ContentNode2 || !this._charPool) return;

                // 回收旧节点
                const childrens = [...this.ContentNode2.children];
                for (const node of childrens) {
                    node.off("click");
                    this._charPool.put(node);
                }

                for (const character of characters) {
                    const node = this._charPool.get();
                    if (!node) continue;
                    this.loadAvatarIcon(node, character.icon);

                    const countNode = node.getChildByName("itemCount");
                    if (countNode) {
                        countNode.active = true;
                        const lab = countNode.getComponent(Label);
                        if (lab) lab.string = character.itemCount;
                    }
                    this.ContentNode2.addChild(node);
                    node.on("click", () => this.hechen(character));
                }
            })
            .catch(error => {
                if (error.name !== 'AbortError') {
                    console.error("材料列表请求异常", error);
                    util.message.confirm({ message: "网络异常，请重试" });
                }
            });
    }

    private async loadAvatarIcon(itemNode: Node, iconPath: string) {
        try {
            const sf = await util.bundle.load(iconPath, SpriteFrame);
            const avatarNode = itemNode.getChildByName("Avatar");
            if (avatarNode) {
                const sprite = avatarNode.getComponent(Sprite);
                if (sprite) sprite.spriteFrame = sf;
            }
        } catch (e) {
            console.warn("头像资源加载失败 path:" + iconPath, e);
        }
    }

    public async hechen(character) {
        const hechenNode = this.node.getChildByName("hechen");
        if (!hechenNode) return;
        const ctrl = hechenNode.getComponent(HechenCtrl);
        if (!ctrl) return;
        await ctrl.render(character, () => {
            this.refresh2();
        });
    }

    goback2() {
        AudioMgr.inst.playOneShot("sound/other/click");
        if (this.rew3) this.rew3.active = false;
    }

    clickUseFun(itemId) {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig();
        const token = getToken();
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
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                if (data.success == '1') {
                    const userInfo = data.data;
                    config.userData.gold = userInfo.gold;
                    config.userData.characters = userInfo.characterList;
                    localStorage.setItem("UserConfigData", JSON.stringify(config));
                    localStorage.setItem('Leave_EnergyNumber2', userInfo.tiliCount + "");
                    localStorage.setItem('LastGetTime1', userInfo.tiliCountTime + "");
                    localStorage.setItem('LastGetHuoliTime1', userInfo.huoliCountTime + "");
                    localStorage.setItem('Leave_EnergyHuoliNumber2', userInfo.huoliCount + "");
                    // 修复：成功弹出成功提示，原来写反用了errorMsg
                    util.message.confirm({ message: "使用成功" });
                } else {
                    util.message.confirm({ message: data.errorMsg || "服务器异常" });
                }
                this.refresh();
            })
            .catch(error => {
                console.error("使用物品异常", error);
                util.message.confirm({ message: "网络异常" });
            });
    }

    clickDiuFun(itemId) {
        // 丢弃物品业务待实现
    }

    async goBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        const close = await util.message.load();
        director.preloadScene("Home", () => {
            close();
            director.loadScene("Home");
        });
    }

    async zhanbao() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.zhan.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian/spriteFrame', SpriteFrame);
        this.find.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian2/spriteFrame', SpriteFrame);
        this.type = 1;
        if (this.rew) this.rew.active = true;
        if (this.rew2) this.rew2.active = false;
        this.refresh();
    }

    async frineds() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.zhan.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian2/spriteFrame', SpriteFrame);
        this.find.getComponent(Sprite).spriteFrame = await util.bundle.load('image/button/lian/spriteFrame', SpriteFrame);
        this.type = 2;
        if (this.rew) this.rew.active = false;
        if (this.rew2) this.rew2.active = true;
        this.refresh2();
    }

    onDestroy() {
        // 销毁组件时取消请求，防止回调报错
    }
}
