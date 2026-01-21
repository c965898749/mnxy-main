import { _decorator, Component, sp, Node, Sprite, SpriteFrame, UIOpacity, Label, Button, Vec3, tween } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

@ccclass('AddEquipmentCtrl')
export class AddEquipmentCtrl extends Component {
    @property({ type: Node, tooltip: "招募单张抽卡" }) onceCard: Node = null;
    @property({ type: Button }) buttonOk: Button = null;
    @property(Node)
    BlockInputEvents: Node
    @property(Node)
    SpriteSplash1: Node
    @property(Node)
    SpriteSplash2: Node
    @property(Node)
    SpriteSplash3: Node
    @property(Node)
    SpriteSplash4: Node
    @property(Node)
    SpriteSplash5: Node
    @property(Node)
    butn1: Node
    @property(Node)
    butn2: Node
    @property(Node)
    butn3: Node
    @property(Node)
    butn4: Node
    @property(Node)
    butn5: Node
    @property(Node)
    donghua: Node
    @property(Node)
    donghua2: Node
    @property(Node)
    donghua3: Node
    @property(Node)
    cailiao: Node
    @property(Node)
    jinbi: Node
    ArenaId: number = 1;
    @property(Node)
    AvatarNode: Node

    @property(Node)
    LegendBorderNode: Node

    @property(Node)
    BorderNode: Node

    @property(Node)
    CampNode: Node

    @property(Node)
    LvNode: Node

    @property(Node)
    Name: Node

    @property(Node)
    Quality: Node

    @property(Node)
    Pingzhi: Node

    @property(Node)
    isBattle: Node
    @property(Node)
    Star: Node
    @property(Node)
    StackCount: Node

    @property(Node)
    Bottom: Node

    @property(Node)
    Faguang: Node

    @property(Node)
    Light: Node

    @property(Node)
    daNum: Node
    @property(Node)
    close: Node
    @property(Node)
    cailiaoNum
    start() {
        const config = getConfig()
        const token = getToken()
        this.jinbi.getChildByName("num2").getComponent(Label).string = "(已有" + config.userData.gold + ")"
        this.daNum.getComponent(Label).string = "(" + config.userData.diamond + ")"
        this.cailiaoNum.getComponent(Label).string = "(已有" + config.userData.bronze + ")"
    }
    //     public bronze: number = 0
    // public darkSteel: number = 0
    // public purpleGold: number = 0
    // public crystal: number = 0

    update(deltaTime: number) {

    }
    goBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
        this.node.parent.getChildByName("EquipmentCtrl").active = true
    }
    isOk() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.onceCard.active = false;
        this.buttonOk.node.active = false;
        this.BlockInputEvents.active = false;
        this.onceCard.active = false;
    }



    async shuaEq() {
        return await util.message.prompt({ message: "主人，店铺还没有开张哦~" })
    }
    dazhao() {
        this.BlockInputEvents.active = true
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId,
            str: this.ArenaId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/danChouEq", options)
            .then(response => {
                if (!response.ok) {
                    this.BlockInputEvents.active = false
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                console.log(data); // 处理响应数据
                if (data.success == '1') {
                    AudioMgr.inst.playOneShot("sound/other/gongyi");
                    var map = data.data;
                    let dto = map['dto'];
                    let heroInfo = dto.hero
                    let user = map['user'];
                    let self = this
                    this.AvatarNode.getComponent(Sprite).spriteFrame =
                        await util.bundle.load(`game/texture/frames/emp/${heroInfo.id.split('_')[0]}/spriteFrame`, SpriteFrame)
                    if (heroInfo.star > 3) {
                        this.Pingzhi.getComponent(Sprite).spriteFrame =
                            await util.bundle.load(`image/ui/pingzhi_0${heroInfo.star}/spriteFrame`, SpriteFrame)
                    } else {
                        this.Pingzhi.getComponent(Sprite).spriteFrame = null
                    }
                    if (heroInfo.star > 4) {
                        this.Light.active = true
                    } else {
                        this.Light.active = false
                    }

                    if (heroInfo.star < 4) {
                        this.Faguang.active = false;
                        this.Quality.getComponent(Sprite).spriteFrame =
                            await util.bundle.load(`image/ui/card1/spriteFrame`, SpriteFrame)
                        this.Bottom.getComponent(Sprite).spriteFrame =
                            await util.bundle.load(`image/ui/quality_01/spriteFrame`, SpriteFrame)
                    } else {
                        this.Faguang.active = true;
                        this.Quality.getComponent(Sprite).spriteFrame =
                            await util.bundle.load(`image/ui/card2/spriteFrame`, SpriteFrame)
                        this.Bottom.getComponent(Sprite).spriteFrame =
                            await util.bundle.load(`image/ui/quality_05/spriteFrame`, SpriteFrame)

                    }
                    this.CampNode.getComponent(Sprite).spriteFrame =
                        await util.bundle.load(`image/camp_icon/${heroInfo.camp}/spriteFrame`, SpriteFrame)
                    // this.LvNode.getComponent(Label).string = 'Lv: ' + heroInfo.lv
                    this.Name.getComponent(Label).string = heroInfo.name
                    // 渲染星级
                    this.Star.children.forEach(n => n.active = false)

                    for (let i = 0; i < heroInfo.star; i++) {
                        this.Star.children[i].active = true
                        if (i + 0.5 < heroInfo.star) {
                            this.Star.children[i].children[0].active = true
                        }
                    }
                    let selectSkeleton = this.donghua.getComponent(sp.Skeleton)
                    selectSkeleton.node.active = true
                    selectSkeleton.setAnimation(0, "animation", false)
                    selectSkeleton.setCompleteListener(() => {
                        selectSkeleton.node.active = false
                        AudioMgr.inst.playOneShot("sound/other/getcard");
                        let selectSkeleton2;
                        if (this.ArenaId > 2) {
                            selectSkeleton2 = this.donghua3.getComponent(sp.Skeleton)
                        } else {
                            selectSkeleton2 = this.donghua2.getComponent(sp.Skeleton)
                        }
                        selectSkeleton2.node.active = true
                        selectSkeleton2.setAnimation(0, "animation", false)
                        this.onceCard.active = true;
                        this.onceCard.scale = new Vec3(0, 0, 0)
                        tween(this.onceCard)
                            .to(1.5, { scale: new Vec3(1, 1, 1) }, { easing: 'elasticOut' })
                            .start();
                        selectSkeleton2.setCompleteListener(() => {
                            selectSkeleton2.node.active = false
                            this.buttonOk.node.active = true;
                        })
                    })
                    config.userData.equipments = dto.characters
                    config.userData.gold = user.gold
                    config.userData.bronze = user.bronze
                    config.userData.darkSteel = user.darkSteel
                    config.userData.purpleGold = user.purpleGold
                    config.userData.crystal = user.crystal
                    if (this.ArenaId == 1) {
                        this.cailiaoNum.getComponent(Label).string = "(已有" + config.userData.bronze + ")"

                    } else if (this.ArenaId == 2) {
                        this.cailiaoNum.getComponent(Label).string = "(已有" + config.userData.darkSteel + ")"

                    } else if (this.ArenaId == 3) {
                        this.cailiaoNum.getComponent(Label).string = "(已有" + config.userData.purpleGold + ")"

                    } else if (this.ArenaId == 4) {
                        this.cailiaoNum.getComponent(Label).string = "(已有" + config.userData.crystal + ")"
                    }
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                } else {
                    this.BlockInputEvents.active = false
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                this.BlockInputEvents.active = false
                const close = util.message.confirm({ message: error })
            }
            );



    }

    public async zhuSelectCard(event: Event, customEventData: string) {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        const token = getToken()
        this.jinbi.getChildByName("num2").getComponent(Label).string = "(已有" + config.userData.gold + ")"
        if (customEventData == "1") {
            this.ArenaId = 1
            this.SpriteSplash1.active = true
            this.SpriteSplash2.active = false
            this.SpriteSplash3.active = false
            this.SpriteSplash4.active = false
            this.SpriteSplash5.active = false
            this.butn2.getComponent(UIOpacity).opacity = 100;
            this.butn3.getComponent(UIOpacity).opacity = 100;
            this.butn4.getComponent(UIOpacity).opacity = 100;
            this.butn5.getComponent(UIOpacity).opacity = 100;
            this.butn1.getComponent(UIOpacity).opacity = 255;
            this.cailiao.getComponent(Sprite).spriteFrame =
                await util.bundle.load('image/bagCrtl/17000009/spriteFrame', SpriteFrame)
            this.cailiao.getChildByName("num").getComponent(Label).string = "X1000"
            this.jinbi.getChildByName("num").getComponent(Label).string = "X50000"
            this.cailiaoNum.getComponent(Label).string = "(已有" + config.userData.bronze + ")"
        }
        if (customEventData == "2") {
            this.ArenaId = 2
            this.SpriteSplash2.active = true
            this.SpriteSplash1.active = false
            this.SpriteSplash3.active = false
            this.SpriteSplash4.active = false
            this.SpriteSplash5.active = false
            this.butn1.getComponent(UIOpacity).opacity = 100;
            this.butn3.getComponent(UIOpacity).opacity = 100;
            this.butn4.getComponent(UIOpacity).opacity = 100;
            this.butn5.getComponent(UIOpacity).opacity = 100;
            this.butn2.getComponent(UIOpacity).opacity = 255;
            this.cailiao.getComponent(Sprite).spriteFrame =
                await util.bundle.load('image/bagCrtl/17000010/spriteFrame', SpriteFrame)
            this.cailiao.getChildByName("num").getComponent(Label).string = "X2000"
            this.jinbi.getChildByName("num").getComponent(Label).string = "X150000"
            this.cailiaoNum.getComponent(Label).string = "(已有" + config.userData.darkSteel + ")"
        }
        if (customEventData == "3") {
            this.ArenaId = 3
            this.SpriteSplash3.active = true
            this.SpriteSplash1.active = false
            this.SpriteSplash2.active = false
            this.SpriteSplash4.active = false
            this.SpriteSplash5.active = false
            this.butn1.getComponent(UIOpacity).opacity = 100;
            this.butn2.getComponent(UIOpacity).opacity = 100;
            this.butn4.getComponent(UIOpacity).opacity = 100;
            this.butn5.getComponent(UIOpacity).opacity = 100;
            this.butn3.getComponent(UIOpacity).opacity = 255;
            this.cailiao.getComponent(Sprite).spriteFrame =
                await util.bundle.load('image/bagCrtl/17000011/spriteFrame', SpriteFrame)
            this.cailiao.getChildByName("num").getComponent(Label).string = "X5000"
            this.jinbi.getChildByName("num").getComponent(Label).string = "X350000"
            this.cailiaoNum.getComponent(Label).string = "(已有" + config.userData.purpleGold + ")"
        }
        if (customEventData == "4") {
            this.ArenaId = 4
            this.SpriteSplash4.active = true
            this.SpriteSplash2.active = false
            this.SpriteSplash3.active = false
            this.SpriteSplash1.active = false
            this.SpriteSplash5.active = false
            this.butn1.getComponent(UIOpacity).opacity = 100;
            this.butn2.getComponent(UIOpacity).opacity = 100;
            this.butn3.getComponent(UIOpacity).opacity = 100;
            this.butn5.getComponent(UIOpacity).opacity = 100;
            this.butn4.getComponent(UIOpacity).opacity = 255;
            this.cailiao.getComponent(Sprite).spriteFrame =
                await util.bundle.load('image/bagCrtl/17000012/spriteFrame', SpriteFrame)
            this.cailiao.getChildByName("num").getComponent(Label).string = "X10000"
            this.jinbi.getChildByName("num").getComponent(Label).string = "X550000"
            this.cailiaoNum.getComponent(Label).string = "(已有" + config.userData.crystal + ")"
        }
        if (customEventData == "5") {
            this.SpriteSplash5.active = true
            this.SpriteSplash2.active = false
            this.SpriteSplash3.active = false
            this.SpriteSplash4.active = false
            this.SpriteSplash1.active = false
            this.butn1.getComponent(UIOpacity).opacity = 100;
            this.butn2.getComponent(UIOpacity).opacity = 100;
            this.butn4.getComponent(UIOpacity).opacity = 100;
            this.butn3.getComponent(UIOpacity).opacity = 100;
            this.butn5.getComponent(UIOpacity).opacity = 255;
            this.daNum.getComponent(Label).string = "(" + config.userData.diamond + ")"
        }
    }

}


