import { _decorator, Component, EditBox, Label, Node, Sprite, SpriteFrame, Toggle, ToggleComponent } from 'cc';
import { LCoin } from 'db://assets/script/common/common/Language';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

@ccclass('UserInfoCrtl')
export class UserInfoCrtl extends Component {
    @property(Node)
    Changheader: Node
    @property(EditBox)
    Nickname: EditBox;
    @property(Node)
    Tili: Node
    @property(Node)
    Huoli: Node
    @property(Node)
    Exp: Node
    @property(Node)
    Gold: Node
    @property(Node)
    Lv: Node
    @property(Node)
    StopLv: Node
    @property(Node)
    Diamond: Node
    @property(Node)
    expBar: Node
    @property(Node)
    UserId: Node

    @property(Node)
    TiliTime: Node//体力回复剩余时间
    @property(Node)
    HuoliTime: Node//体力回复剩余时间
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
    initialized: boolean = false
    @property(Node)
    Toggle: Node
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

    update(dt) {
        if (this.timer >= 50) {
            this.setTili();
            this.timer = 0;
        }
        else {
            this.timer++;
        }

    }
    formatTime(remainingSeconds) {
        var minutes = Math.floor(remainingSeconds / 60); // 向下取整，获取准确分钟数
        var seconds = Math.floor(remainingSeconds % 60); // 向下取整，获取准确秒数
        // 秒数补零：不足两位时，前面加0
        var formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
        return minutes + ":" + formattedSeconds;
    }

    //体力系统
    setTili() {
        var EnergyReturnTime = 300
        this.energy = this.GetLeaveEnergy();
        this.huoliEnergy = this.GetLeaveHuoliEnergy();
        var LeaveEnergy = this.GetLeaveEnergy();
        var LeaveHuoliEnergy = this.GetLeaveHuoliEnergy();
        var lastTime = parseInt(localStorage.getItem('LastGetTime1'));
        if (!lastTime) {
            lastTime = 0;
        }
        var lastTime2 = parseInt(localStorage.getItem('LastGetHuoliTime1'));
        if (!lastTime2) {
            lastTime2 = 0;
        }
        let nowTime = new Date().getTime();
        var tiliCount = Math.floor((nowTime - lastTime) / 1000 / EnergyReturnTime)
        var hiliCount = Math.floor((nowTime - lastTime2) / 1000 / EnergyReturnTime)
        // 修正问题2：移除多余的 Math.round，保证剩余秒数精确性
        var passedEnergySeconds = (nowTime - lastTime) / 1000; // 体力已流逝秒数
        var EnergyTime = EnergyReturnTime - (passedEnergySeconds % EnergyReturnTime); // 下次体力恢复剩余秒数
        // 活力下次恢复剩余秒数（同理，保持一致性）
        var passedHuoliSeconds = (nowTime - lastTime2) / 1000;
        var HuoliTime = EnergyReturnTime - (passedHuoliSeconds % EnergyReturnTime);
        if (tiliCount < 0) {
            tiliCount = 0;
        }
        if (hiliCount < 0) {
            hiliCount = 0;
        }
        if (this.energy > this.MaxEnergy) {
            let lastDate = this.GetLeaveEnergyTime();
            this.TiliTime.getComponent(Label).string = "体力已满";
            if (this.CheckLoginDate(lastDate)) {
                this.energy = this.MaxEnergy;
            }
        } else if ((tiliCount + LeaveEnergy) >= this.MaxEnergy) {
            this.TiliTime.getComponent(Label).string = "体力已满";
            this.energy = this.MaxEnergy;
        } else if (tiliCount > 0) {
            this.energy = tiliCount + LeaveEnergy;
        } else {
            this.TiliTime.getComponent(Label).string = "下次恢复1点体力需 " + this.formatTime(EnergyTime);
        }
        

        if (this.huoliEnergy > this.MaxEnergy) {
            let lastDate = this.GetLeaveHuoliEnergyTime();
            this.HuoliTime.getComponent(Label).string = "活力已满";
            if (this.CheckLoginHuoliDate(lastDate)) {
                this.huoliEnergy = this.MaxEnergy;
            }
        } else if ((hiliCount + LeaveHuoliEnergy) >= this.MaxEnergy) {
            this.HuoliTime.getComponent(Label).string = "活力已满";
            this.huoliEnergy = this.MaxEnergy;
        } else if (hiliCount > 0) {
            this.huoliEnergy = hiliCount + LeaveHuoliEnergy;
        } else {
            this.HuoliTime.getComponent(Label).string = "下次恢复1点活力需 " + this.formatTime(HuoliTime);
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
        return 0;
    }

    GetLeaveHuoliEnergy() {
        var key = 'Leave_EnergyHuoliNumber2';
        var str = localStorage.getItem(key);
        if (str) {
            return parseInt(str);
        }
        return 0;
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

    async changeName() {
        const config = getConfig()
        const token = getToken()
        AudioMgr.inst.playOneShot("sound/other/click");
        const username = this.Nickname.string;
        if (!username) {
            const close = util.message.confirm({ message: "昵称不能为空" })
            return;
        }
        // 是否询问
        const result = await util.message.confirm({
            message: "昵称修改续花费500钻确认修改？"
        })
        // 是否确定
        if (result === false) return
        const postData = {
            token: token,
            str: username
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/aaaa", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    var dto = data.data
                    config.userData.nickname = dto.nickname
                    config.userData.diamond = dto.diamond
                    this.node.parent.getChildByName("Buildings").getChildByName("Top").getChildByName("Nickname").getComponent(Label).string = dto.nickname
                    this.Diamond.getComponent(Label).string = dto.diamond + ""
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                    await util.message.prompt({ message: data.errorMsg })
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                //console.error('There was a problem with the fetch operation:', error);
            }
            );
    }
    async refresh() {
        const config = getConfig()
        this.UserId.getComponent(Label).string = config.userData.userId + ""
        this.Gold.getComponent(Label).string =
            LCoin(config.userData.gold)
        this.Lv.getComponent(Label).string = "Lv 等级：" +
            util.sundry.formateNumber(config.userData.lv)
        this.Diamond.getComponent(Label).string = config.userData.diamond + ""
        this.Exp.getChildByName("ExpCount").getComponent(Label).string = config.userData.exp + "/1000"
        this.expBar.setScale(
            config.userData.exp / 1000,
            1,
            1
        )
        this.node.getChildByName("head_img").getChildByName("header_qitiandashen").getComponent(Sprite).spriteFrame =
            await util.bundle.load(config.userData.gameImg, SpriteFrame)
        if (1 == config.userData.stopLevel) {
            this.Toggle.getComponent(Toggle).isChecked = true
        } else {
            this.Toggle.getComponent(Toggle).isChecked = false
        }
        this.Toggle.on('toggle', this.callback, this);
        this.Nickname.string = config.userData.nickname
    }
    callback(toggle: ToggleComponent) {
        var isChecked = 0
        if (toggle.isChecked) {
            isChecked = 1
        } else {
            isChecked = 0
        }
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            str: isChecked
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/stopLevel", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    var dto = data.data
                    config.userData.stopLevel = dto.stopLevel
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                //console.error('There was a problem with the fetch operation:', error);
            }
            );
    }
    async goBack2() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("UserInfoCrtl").active = false
    }
    changerHeader() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.Changheader.active = true
    }

    async opengiftExchangeCode() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("giftExchangeCode").active = true
    }
}


