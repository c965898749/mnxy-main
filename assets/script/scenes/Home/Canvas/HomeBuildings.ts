import { _decorator, AudioClip, AudioSource, Component, director, EventTouch, Label, math, Node, screen, Sprite, SpriteFrame, tween, UITransform, v3, Vec3 } from 'cc';
import { util } from '../../../util/util';
import { getConfig } from '../../../common/config/config';
import { AudioMgr } from "../../../util/resource/AudioMgr";
import { CharacterState, CharacterStateCreate } from '../../../game/fight/character/CharacterState';
const { ccclass, property } = _decorator;

@ccclass('HomeBuildings')
export class HomeBuildings extends Component {
    /**mask的uitransform */
    @property(UITransform)
    maskUITransform: UITransform = null!

    @property(Node)
    expBar: Node
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
    power: number = 0;
    notices = []
    initialized = false;
    /**跑马灯文本初始坐标 */
    private pmdOriginPos: Vec3 = null!

    @property(Node)
    Tili: Node
    @property(Node)
    Huoli: Node
    @property(Node)
    energyLabel: Node//体力显示
    @property(Node)
    energyHuoliLabel: Node//活力力显示
    @property({ type: cc.Integer, tooltip: "固定尺寸" })
    MaxEnergy: 720//最大体力值
    // EnergyReturnTime: 600//体力回复时间
    timer = 0
    @property({ type: cc.Integer, tooltip: "固定尺寸" })
    energy = 0
    huoliEnergy = 0
    // onLoad() {
    //     let nodesToKeep = game.getPersistRootNodes() // 获取所有持久化节点
    //     nodesToKeep.forEach(node => {
    //         director.getScene().addChild(node); // 将节点重新添加到新场景中
    //     });
    // }
    protected async start() {
        const config = getConfig()
        this.node.getChildByName("Top").getChildByName("Gold").getComponent(Label).string =
            util.sundry.formateNumber(config.userData.gold)
        this.node.getChildByName("Top").getChildByName("Lv").getComponent(Label).string = "Lv " +
            util.sundry.formateNumber(config.userData.lv)
        // this.node.getChildByName("Top").getChildByName("Diamond").getChildByName("Label").getComponent(Label).string = config.userData.diamond + ""
        this.node.getChildByName("Top").getChildByName("Nickname").getComponent(Label).string = config.userData.nickname
        this.node.getChildByName("Top").getChildByName("Exp").getChildByName("ExpCount").getComponent(Label).string = config.userData.exp + "/1000"
        this.expBar.setScale(
            config.userData.exp / 1000,
            1,
            1
        )
        const create = config.userData.characters.filter(x => x.goIntoNum != 0)
        if (config.userData.gameImg) {
            this.node.getChildByName("Top").getChildByName("head_img").getChildByName("header_qitiandashen").getComponent(Sprite).spriteFrame =
                await util.bundle.load(config.userData.gameImg, SpriteFrame)
        }
        this.node.getChildByName("mid").getChildByName("user_win_count").getComponent(Label).string = config.userData.winCount + ""
        //初始化战力
        this.power = 0
        // 渲染队伍gameImg
        this.Item.children.forEach(n => n.children[0].getComponent(Sprite).spriteFrame = null)
        this.node.getChildByName("mid").getChildByName("user_card_count").getComponent(Label).string = config.userData.characters.length + "/" + config.userData.useCardCount
        for (let i = 0; i < create.length; i++) {
            var goIntoNum = create[i].goIntoNum
            this.Item.children[goIntoNum - 1].children[0].getComponent(Sprite).spriteFrame =
                await util.bundle.load(`game/texture/frames/hero/Header/${create[i].id}/spriteFrame`, SpriteFrame)
            this.power = this.power + parseInt(this.getZhanli(create[i]).toString())
        }
        //初始化跑马灯文本的位置
        //因为mask和label节点x锚点都是0，所以x坐标的初始位置是mask的长度
        let pos = this.pmdNode.getPosition()
        this.pmdOriginPos = v3(this.maskUITransform.width, pos.y, pos.z)
        this.pmdNode.setPosition(this.pmdOriginPos)
        // 弹窗弹跳入场效果
        if (!this.checkIfTimeIsToday()) {
            this.node.parent.getChildByName("SignInCtrl").active = true
        }
        this.node.parent.getChildByName("SignInCtrl").scale = new Vec3(0, 0, 0)
        tween(this.node.parent.getChildByName("SignInCtrl"))
            .to(1, { scale: new Vec3(1, 1, 1) }, { easing: 'elasticOut' })
            .start();
        //战力计算
        this.node.getChildByName("mid").getChildByName("user_fight_count").getComponent(Label).string = this.power + ""

    }

    public getZhanli(create: CharacterStateCreate) {
        // let zhanli = propts[PART_PROPTS.GongJi] * 25 + propts[PART_PROPTS.FangYu] * 25 + propts[PART_PROPTS.XueLiang] + propts[PART_PROPTS.BaoJi] * 2 + 500 * propts[PART_PROPTS.ShanBi] + 300 * (propts[PART_PROPTS.HuoGong] + propts[PART_PROPTS.HuoKang] + propts[PART_PROPTS.BingGong] + propts[PART_PROPTS.BingKang])
        var state = new CharacterState(create, null)
        let zhanli = state.attack * 25 + state.defence * 25 + state.maxHp + state.critical * 2 + 500 * state.FreeInjuryPercent + 300 * state.speed
        return zhanli;
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
        this.node.getChildByName("Top").getChildByName("Lv").getComponent(Label).string = "Lv " +
            util.sundry.formateNumber(config.userData.lv)
        this.node.getChildByName("Top").getChildByName("Gold").getComponent(Label).string =
            util.sundry.formateNumber(config.userData.gold)
        //初始化战力
        this.power = 0
        console.log(config.userData.gameImg, 444)
        if (config.userData.gameImg) {
            this.node.getChildByName("Top").getChildByName("head_img").getChildByName("header_qitiandashen").getComponent(Sprite).spriteFrame =
                await util.bundle.load(config.userData.gameImg, SpriteFrame)
        }
        for (let i = 0; i < create.length; i++) {
            var goIntoNum = create[i].goIntoNum
            this.Item.children[goIntoNum - 1].children[0].getComponent(Sprite).spriteFrame =
                await util.bundle.load(`game/texture/frames/hero/Header/${create[i].id}/spriteFrame`, SpriteFrame)
            this.power = this.power + parseInt(this.getZhanli(create[i]).toString())
        }
        this.node.getChildByName("mid").getChildByName("user_card_count").getComponent(Label).string = config.userData.characters.length + "/" + config.userData.useCardCount
        // this.node.getChildByName("Top").getChildByName("head_img").getChildByName("header_qitiandashen").getComponent(Sprite).spriteFrame =
        //     await util.bundle.load(config.userData.gameImg, SpriteFrame)
        this.node.getChildByName("mid").getChildByName("user_fight_count").getComponent(Label).string = this.power + ""
        this.node.getChildByName("mid").getChildByName("user_win_count").getComponent(Label).string = config.userData.winCount + ""
        this.expBar.setScale(
            config.userData.exp / 1000,
            1,
            1
        )
        this.node.getChildByName("Top").getChildByName("Exp").getChildByName("ExpCount").getComponent(Label).string = config.userData.exp + "/1000"
    }

    async update(deltaTime: number) {
        if (this.timer >= 50) {
            this.setTili();
            this.timer = 0;
        }
        else {
            this.timer++;
        }
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



    //体力系统
    setTili() {
        var EnergyReturnTime = 600
        this.energy = this.GetLeaveEnergy();
        this.huoliEnergy = this.GetLeaveHuoliEnergy();
        //cc.log(this.energy);
        var LeaveEnergy = this.GetLeaveEnergy();
        var LeaveHuoliEnergy = this.GetLeaveHuoliEnergy();
        var lastTime = parseInt(localStorage.getItem('LastGetTime1'));
        if (!lastTime) {
            lastTime = 0;
        }
        let nowTime = new Date().getTime();
        var tiliCount = Math.round((nowTime - lastTime) / 1000 / EnergyReturnTime)
        var hiliCount = Math.round((nowTime - lastTime) / 1000 / EnergyReturnTime)
        var EnergyTime = EnergyReturnTime - Math.round(((nowTime - lastTime) / 1000 % EnergyReturnTime))
        this.SetLeaveEnergyTime(EnergyTime);
        if (tiliCount < 0) {
            tiliCount = 0;
        }
        if (hiliCount < 0) {
            hiliCount = 0;
        }
        if (this.energy > this.MaxEnergy) {
            let lastDate = this.GetLeaveEnergyTime();
            if (this.CheckLoginDate(lastDate)) {
                this.energy = this.MaxEnergy;
                this.SetLeaveEnergy(this.MaxEnergy);
            }
        } else if ((tiliCount + LeaveEnergy) >= this.MaxEnergy) {
            this.energy = this.MaxEnergy;
            localStorage.setItem('LastGetTime1', nowTime + "");
            this.SetLeaveEnergy(this.energy);
        } else if (tiliCount > 0) {
            this.energy = tiliCount + LeaveEnergy;
            localStorage.setItem('LastGetTime1', nowTime + "");
            this.SetLeaveEnergy(this.energy);
        }


        if (this.huoliEnergy > this.MaxEnergy) {
            let lastDate = this.GetLeaveHuoliEnergyTime();
            if (this.CheckLoginHuoliDate(lastDate)) {
                this.huoliEnergy = this.MaxEnergy;
                this.SetLeaveHuoliEnergy(this.MaxEnergy);
            }
        } else if ((hiliCount + LeaveHuoliEnergy) >= this.MaxEnergy) {
            this.huoliEnergy = this.MaxEnergy;
            localStorage.setItem('LastGetHuoliTime1', nowTime + "");
            this.SetLeaveHuoliEnergy(this.huoliEnergy);
        } else if (hiliCount > 0) {
            this.huoliEnergy = hiliCount + LeaveHuoliEnergy;
            localStorage.setItem('LastGetHuoliTime1', nowTime + "");
            this.SetLeaveHuoliEnergy(this.huoliEnergy);
        }



        if (this.energyLabel) {
            this.energyLabel.getComponent(Label).string = this.energy + "/" + this.MaxEnergy;
            this.Tili.setScale(
                this.energy / this.MaxEnergy,
                1,
                1
            )
        }
        if (this.energyHuoliLabel) {
            this.energyHuoliLabel.getComponent(Label).string = this.huoliEnergy + "/" + this.MaxEnergy;
            this.Huoli.setScale(
                this.huoliEnergy / this.MaxEnergy,
                1,
                1
            )
        }
    }

    //体力
    GetLeaveEnergy() {
        var key = 'Leave_EnergyNumber2';
        var str = localStorage.getItem(key);
        if (str) {
            return parseInt(str);
        }
        return 10;
    }
    GetLeaveHuoliEnergy() {
        var key = 'Leave_EnergyHuoliNumber2';
        var str = localStorage.getItem(key);
        if (str) {
            return parseInt(str);
        }
        return 10;
    }
    SetLeaveEnergy(i) {
        var key = 'Leave_EnergyNumber2';
        var value = i + "";
        localStorage.setItem(key, value);
    }
    SetLeaveHuoliEnergy(i) {
        var key = 'Leave_EnergyHuoliNumber2';
        var value = i + "";
        localStorage.setItem(key, value);
    }
    //体力获取时间
    GetLeaveEnergyTime() {
        var key = 'Leave_EnergyTimes1';
        var str = localStorage.getItem(key);
        if (str) {
            return parseInt(str);
        }
        return 600;
    }
    //体力获取时间
    GetLeaveHuoliEnergyTime() {
        var key = 'Leave_EnergyHuoliTimes1';
        var str = localStorage.getItem(key);
        if (str) {
            return parseInt(str);
        }
        return 600;
    }
    SetLeaveEnergyTime(i) {
        var key = 'Leave_EnergyTimes1';
        var value = i + "";
        localStorage.setItem(key, value);
    }
    SetLeaveEnergyHuoliTime(i) {
        var key = 'Leave_EnergyHuoliTimes1';
        var value = i + "";
        localStorage.setItem(key, value);
    }
    CheckLoginDate(time) {
        var lastTime = new Date(time);
        var now = new Date();
        if (now.getFullYear() !== lastTime.getFullYear() ||
            now.getMonth() !== lastTime.getMonth() ||
            now.getDate() !== lastTime.getDate()) {
            // this.needReset = true;
            return true;
        }
        // cc.log("不需要重置", lastTime.toDateString(), now.toDateString())
        return false;
    }
    CheckLoginHuoliDate(time) {
        var lastTime = new Date(time);
        var now = new Date();
        if (now.getFullYear() !== lastTime.getFullYear() ||
            now.getMonth() !== lastTime.getMonth() ||
            now.getDate() !== lastTime.getDate()) {
            // this.needReset = true;
            return true;
        }
        // cc.log("不需要重置", lastTime.toDateString(), now.toDateString())
        return false;
    }


    public checkIfTimeIsToday() {
        const cachedTime = localStorage.getItem('cachedTime');
        if (!cachedTime) return false;

        const cachedDate = new Date(cachedTime);
        const today = new Date();
        console.log(cachedDate)
        console.log(today)
        return cachedDate.getFullYear() === today.getFullYear() &&
            cachedDate.getMonth() === today.getMonth() &&
            cachedDate.getDate() === today.getDate();
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
        this.node.parent.getChildByName("Buildings").active = false
        this.node.parent.getChildByName("otherCtrl").active = false
        this.node.parent.getChildByName("JinjiCtrl").active = false
        this.node.parent.getChildByName("CardCrtl").active = false
        this.node.parent.getChildByName("EquipmentCtrl").active = false
        this.node.parent.getChildByName("ShopCtrl").active = false
        this.node.parent.getChildByName("PveCtrl").active = false
        this.node.parent.getChildByName("synthesisCtrl").active = false
        this.node.parent.getChildByName("MapCrtl").active = true
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
        this.node.parent.getChildByName("Buildings").active = false
        this.node.parent.getChildByName("otherCtrl").active = false
        this.node.parent.getChildByName("JinjiCtrl").active = false
        this.node.parent.getChildByName("MapCrtl").active = false
        this.node.parent.getChildByName("EquipmentCtrl").active = false
        this.node.parent.getChildByName("ShopCtrl").active = false
        this.node.parent.getChildByName("PveCtrl").active = false
        this.node.parent.getChildByName("synthesisCtrl").active = false
        this.node.parent.getChildByName("CardCrtl").active = true
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
        this.node.parent.getChildByName("CardCrtl").active = false
        this.node.parent.getChildByName("MapCrtl").active = false
        this.node.parent.getChildByName("EquipmentCtrl").active = false
        this.node.parent.getChildByName("ShopCtrl").active = false
        this.node.parent.getChildByName("PveCtrl").active = false
        this.node.parent.getChildByName("synthesisCtrl").active = false
        this.node.parent.getChildByName("Buildings").active = true
    }
    //挑战
    public async Tiaozhan() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("Buildings").active = false
        this.node.parent.getChildByName("otherCtrl").active = false
        this.node.parent.getChildByName("CardCrtl").active = false
        this.node.parent.getChildByName("MapCrtl").active = false
        this.node.parent.getChildByName("EquipmentCtrl").active = false
        this.node.parent.getChildByName("ShopCtrl").active = false
        this.node.parent.getChildByName("PveCtrl").active = false
        this.node.parent.getChildByName("synthesisCtrl").active = false
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
        this.node.parent.getChildByName("JinjiCtrl").active = false
        this.node.parent.getChildByName("CardCrtl").active = false
        this.node.parent.getChildByName("MapCrtl").active = false
        this.node.parent.getChildByName("EquipmentCtrl").active = false
        this.node.parent.getChildByName("ShopCtrl").active = false
        this.node.parent.getChildByName("PveCtrl").active = false
        this.node.parent.getChildByName("synthesisCtrl").active = false
        this.node.parent.getChildByName("otherCtrl").active = true
    }

    //强化
    public async OpenEquipment() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("Buildings").active = false
        this.node.parent.getChildByName("JinjiCtrl").active = false
        this.node.parent.getChildByName("CardCrtl").active = false
        this.node.parent.getChildByName("MapCrtl").active = false
        this.node.parent.getChildByName("otherCtrl").active = false
        this.node.parent.getChildByName("ShopCtrl").active = false
        this.node.parent.getChildByName("PveCtrl").active = false
        this.node.parent.getChildByName("synthesisCtrl").active = false
        this.node.parent.getChildByName("EquipmentCtrl").active = true
    }

    public async OpenShop() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("Buildings").active = false
        this.node.parent.getChildByName("JinjiCtrl").active = false
        this.node.parent.getChildByName("CardCrtl").active = false
        this.node.parent.getChildByName("MapCrtl").active = false
        this.node.parent.getChildByName("otherCtrl").active = false
        this.node.parent.getChildByName("EquipmentCtrl").active = false
        this.node.parent.getChildByName("PveCtrl").active = false
        this.node.parent.getChildByName("synthesisCtrl").active = false
        this.node.parent.getChildByName("ShopCtrl").active = true
    }



    public jianLi() {
        AudioMgr.inst.playOneShot("sound/other/click");
        // this.node.parent.getChildByName("SignInCtrl").active = true
        // this.node.parent.getChildByName("SignInCtrl").scale = new Vec3(0, 0, 0)
        // tween(this.node.parent.getChildByName("SignInCtrl"))
        //     .to(1, { scale: new Vec3(1, 1, 1) }, { easing: 'elasticOut' })
        //     .start();
        this.node.parent.getChildByName("DailyView").active = true
        this.node.parent.getChildByName("DailyView").scale = new Vec3(0, 0, 0)
        tween(this.node.parent.getChildByName("DailyView"))
            .to(1, { scale: new Vec3(1, 1, 1) }, { easing: 'elasticOut' })
            .start();
    }

    openUserInfo() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("UserInfoCrtl").active = true
    }
}

