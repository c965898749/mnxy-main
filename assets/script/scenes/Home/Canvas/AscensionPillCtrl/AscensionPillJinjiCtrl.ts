import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AscensionPillJinjiCtrl')
export class AscensionPillJinjiCtrl extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    initialized = false;
    huoliEnergy = 0
    MaxEnergy: 720//最大体力值
    // EnergyReturnTime: 600//体力回复时间
    timer = 0
    start() {
        // this.refushData()
        // this.refresh()
    }
    onEnable() {
        if (!this.initialized) {
            // 初始化代码
            this.initialized = true;
        } else {
            // this.refresh()
        }

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
    GetLeaveHuoliEnergy() {
        var key = 'Leave_EnergyHuoliNumber2';
        var str = localStorage.getItem(key);
        if (str) {
            return parseInt(str);
        }
        return 0;
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

    SetLeaveEnergyHuoliTime(i) {
        var key = 'Leave_EnergyHuoliTimes1';
        var value = i + "";
        localStorage.setItem(key, value);
    }
    //体力系统
    // setTili() {
    //     var EnergyReturnTime = 300
    //     this.huoliEnergy = this.GetLeaveHuoliEnergy();
    //     //cc.log(this.energy);
    //     var LeaveHuoliEnergy = this.GetLeaveHuoliEnergy();
    //     var lastTime2 = parseInt(localStorage.getItem('LastGetHuoliTime1'));
    //     if (!lastTime2) {
    //         lastTime2 = 0;
    //     }
    //     let nowTime = new Date().getTime();
    //     var hiliCount = Math.floor((nowTime - lastTime2) / 1000 / EnergyReturnTime)
    //     // 活力下次恢复剩余秒数（同理，保持一致性）
    //     var passedHuoliSeconds = (nowTime - lastTime2) / 1000;
    //     var HuoliTime = EnergyReturnTime - (passedHuoliSeconds % EnergyReturnTime);
    //     this.SetLeaveEnergyHuoliTime(HuoliTime);
    //     if (hiliCount < 0) {
    //         hiliCount = 0;
    //     }


    //     if (this.huoliEnergy > this.MaxEnergy) {
    //         let lastDate = this.GetLeaveHuoliEnergyTime();
    //         if (this.CheckLoginHuoliDate(lastDate)) {
    //             this.huoliEnergy = this.MaxEnergy;
    //             this.SetLeaveHuoliEnergy(this.MaxEnergy);
    //             updateHuoliTime();
    //         }
    //     } else if ((hiliCount + LeaveHuoliEnergy) >= this.MaxEnergy) {
    //         this.huoliEnergy = this.MaxEnergy;
    //         localStorage.setItem('LastGetHuoliTime1', nowTime + "");
    //         this.SetLeaveHuoliEnergy(this.huoliEnergy);
    //         if (hiliCount > 0) {
    //             updateHuoliTime();
    //         }
    //     } else if (hiliCount > 0) {
    //         this.huoliEnergy = hiliCount + LeaveHuoliEnergy;
    //         localStorage.setItem('LastGetHuoliTime1', nowTime + "");
    //         this.SetLeaveHuoliEnergy(this.huoliEnergy);
    //         updateHuoliTime();
    //     }


    //     if (this.energyHuoliLabel) {
    //         this.energyHuoliLabel.getComponent(Label).string = this.huoliEnergy + "/" + this.MaxEnergy;
    //         this.Huoli.setScale(
    //             this.huoliEnergy / this.MaxEnergy,
    //             1,
    //             1
    //         )
    //     }
    // }
    //     SetLeaveHuoliEnergy(i) {
    //     var key = 'Leave_EnergyHuoliNumber2';
    //     var value = i + "";
    //     localStorage.setItem(key, value);
    // }
}


