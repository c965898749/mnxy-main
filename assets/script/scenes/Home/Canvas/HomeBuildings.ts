import { _decorator, AudioClip, AudioSource, Component, director, EventTouch, Label, math, Node, screen, Sprite, SpriteFrame, UITransform, v3, Vec3 } from 'cc';
import { util } from '../../../util/util';
import { getConfig } from '../../../common/config/config';
import { AudioMgr } from "../../../util/resource/AudioMgr";
const { ccclass, property } = _decorator;

@ccclass('HomeBuildings')
export class HomeBuildings extends Component {
    /**mask的uitransform */
    @property(UITransform)
    maskUITransform: UITransform = null!

    /**跑马灯label */
    @property(Node)
    pmdNode: Node = null!

    /**跑马灯的UITransform */
    @property(UITransform)
    pmdUITransform: UITransform = null!

    @property(Label)
    noticeLabel

    //跑马灯移动速度
    @property()
    speed = 1
    @property(Node)
    Item: Node

    notices = []
    initialized = false;
    /**跑马灯文本初始坐标 */
    private pmdOriginPos: Vec3 = null!
    protected async start() {
        const config = getConfig()
        this.node.getChildByName("Top").getChildByName("Gold").getComponent(Label).string =
            util.sundry.formateNumber(config.userData.gold)
        this.node.getChildByName("Top").getChildByName("Lv").getComponent(Label).string = "Lv " +
            util.sundry.formateNumber(config.userData.lv)
        this.node.getChildByName("Top").getChildByName("Nickname").getComponent(Label).string = config.userData.nickname
        this.node.getChildByName("Top").getChildByName("Tili").getChildByName("TiliCount").getComponent(Label).string = "360/720"
        this.node.getChildByName("Top").getChildByName("Huoli").getChildByName("HuoliCount").getComponent(Label).string = "360/720"
        this.node.getChildByName("Top").getChildByName("Exp").getChildByName("ExpCount").getComponent(Label).string = "450/900"
        const create = config.userData.characters.filter(x => x.goIntoNum != 0)
        // 渲染队伍
        this.Item.children.forEach(n => n.children[0].getComponent(Sprite).spriteFrame = null)
        this.node.getChildByName("mid").getChildByName("user_card_count").getComponent(Label).string = config.userData.useCardCount
        for (let i = 0; i < create.length; i++) {
            var goIntoNum = create[i].goIntoNum
            this.Item.children[goIntoNum - 1].children[0].getComponent(Sprite).spriteFrame =
                await util.bundle.load(`game/texture/frames/hero/Header/${create[i].id}/spriteFrame`, SpriteFrame)
        }
        // 战力 = (nHP + (nAttack * 3.2)) * (1 + nSkillLevel / 20) / 10
        var nHP = 0;
        var nAttack = 0;
        var nSkillLevel = 0;
        //初始化跑马灯文本的位置
        //因为mask和label节点x锚点都是0，所以x坐标的初始位置是mask的长度
        let pos = this.pmdNode.getPosition()
        this.pmdOriginPos = v3(this.maskUITransform.width, pos.y, pos.z)
        this.pmdNode.setPosition(this.pmdOriginPos)
        //     this.Star.children[i].active = true
        // if (create.goIntoNum != 0) {
        //     this.isBattle.active = true
        // } else {
        //     this.isBattle.active = false
        // }
        // this.node.getChildByName("Diamond").getChildByName("Value").getComponent(Label).string = 
        // util.sundry.formateNumber(config.userData.diamond)
        // this.node.getChildByName("Soul").getChildByName("Value").getComponent(Label).string = 
        // util.sundry.formateNumber(config.userData.soul)
        // // 触摸事件开始
        // this.node.on(Node.EventType.TOUCH_MOVE, this.onNodeTouchMove, this)
        // this.node.on(Node.EventType.TOUCH_END, this.onNodeTouchEnd, this)
        // // 初始化宽度
        // this.$FrameSize = screen.windowSize
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
        // 你的刷新逻辑
        console.log('节点被激活，正在刷新状态');
        // 例如，重新加载数据，更新UI等
        const config = getConfig()
        const create = config.userData.characters.filter(x => x.goIntoNum != 0)
        this.Item.children.forEach(n => n.children[0].getComponent(Sprite).spriteFrame = null)
        for (let i = 0; i < create.length; i++) {
            var goIntoNum = create[i].goIntoNum
            this.Item.children[goIntoNum - 1].children[0].getComponent(Sprite).spriteFrame =
                await util.bundle.load(`game/texture/frames/hero/Header/${create[i].id}/spriteFrame`, SpriteFrame)
        }
        this.node.getChildByName("mid").getChildByName("user_card_count").getComponent(Label).string = config.userData.useCardCount
    }

    async update(deltaTime: number) {
        const config = getConfig()
        await new Promise(res => setTimeout(res, 5000))
        if (this.pmdNode) {
            if (this.pmdNode.getPosition().x < -this.pmdUITransform.width) {
                //回到初始点
                //console.log(this.notices)
                if (this.notices.length > 0) {
                    this.noticeLabel.string = this.notices[0]
                    this.notices = this.notices.slice(1);
                } else {
                    const options = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                    };
                    fetch(config.ServerUrl.url + "notice", options)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            return response.json(); // 解析 JSON 响应
                        })
                        .then(async data => {
                            //console.log(data); // 处理响应数据
                            if (data.success == '1') {
                                this.notices = data.data
                            } else {
                                const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                            }
                        })
                        .catch(error => {
                            console.error('There was a problem with the fetch operation:', error);
                        }
                        );

                }
                this.pmdNode.setPosition(this.pmdOriginPos)
            } else {
                let originPos = this.pmdNode.getPosition()
                this.pmdNode.setPosition(v3(originPos.x - this.speed, originPos.y, originPos.z))
            }
        }
    }

    // protected onDestroy(): void {
    //     // 触摸事件销毁
    //     this.node.off(Node.EventType.TOUCH_MOVE, this.onNodeTouchMove, this)
    //     this.node.off(Node.EventType.TOUCH_END, this.onNodeTouchEnd, this)
    // }

    // private $FrameSize: math.Size

    // // 触摸移动场景
    // private $lastPositionX = -1
    // private onNodeTouchMove(event: EventTouch) {
    //     const currentPositionX = event.touch.getLocationX()
    //     if (this.$lastPositionX !== -1) {
    //         const positionX = this.node.position.x + (currentPositionX - this.$lastPositionX) * 0.9
    //         if (Math.abs(positionX) <= (1826 - this.$FrameSize.width) / 2)
    //             this.node.setPosition(
    //                 positionX,
    //                 this.node.position.y,
    //                 this.node.position.z
    //             )
    //     }
    //     this.$lastPositionX = currentPositionX
    //     return
    // }
    // private onNodeTouchEnd() {
    //     this.$lastPositionX = -1
    // }

    // 打开关卡选择场景
    public async OpenLevelMap() {
        AudioMgr.inst.playOneShot("sound/other/click");
        // const close = await util.message.load()
        // // director.preloadScene("Fight", () => {
        // //     close()
        // // })
        // director.loadScene("Fight")
    }

    // 打开商店场景
    public async OpenShopMap() {
        AudioMgr.inst.playOneShot("sound/other/click");
    }

    // 打开勇气试炼
    public async OpenCourageMap() {
        AudioMgr.inst.playOneShot("sound/other/click");
    }

    // 打开抽卡界面
    public async OpenDrawCard() {
        AudioMgr.inst.playOneShot("sound/other/click");
    }


    // 打开征服之塔
    public async OpenConquer() {
        AudioMgr.inst.playOneShot("sound/other/click");
    }
    // 打开背包
    async OpenHero() {
        AudioMgr.inst.playOneShot("sound/other/click");
        const close = await util.message.load()
        director.preloadScene("Hero", () => {
            close()
        })
        director.loadScene("Hero")
    }


    // 打开召唤
    public async Zhaohuan() {
        //console.log(111)
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("Buildings").active = false
        this.node.parent.getChildByName("RecruitCtrl").active = true
    }

    // d队伍
    public async Tiem() {
        //console.log(111)
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("Buildings").active = false
        this.node.parent.getChildByName("TiemCtrl").active = true
    }
    //回到主页
    public async BackHome() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("RecruitCtrl").active = false
        this.node.parent.getChildByName("TiemCtrl").active = false
        this.node.parent.getChildByName("JinjiCtrl").active = false
        this.node.parent.getChildByName("JinjichangCtrl").active = false
        this.node.parent.getChildByName("qianghuaCtrl").active = false
        this.node.parent.getChildByName("otherCtrl").active = false
        this.node.parent.getChildByName("Buildings").active = true
    }
    //挑战
    public async Tiaozhan() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("Buildings").active = false
        this.node.parent.getChildByName("otherCtrl").active = false
        this.node.parent.getChildByName("JinjiCtrl").active = true
    }

    //强化
    public async Qianhua() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("Buildings").active = false
        this.node.parent.getChildByName("qianghuaCtrl").active = true
    }

    //强化
    public async Other() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("Buildings").active = false
        this.node.parent.getChildByName("otherCtrl").active = true
    }


}

