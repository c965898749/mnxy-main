import { _decorator, Component, director, EditBox } from 'cc';
const { ccclass, property } = _decorator;
import { util } from '../../../util/util';
import { AudioMgr } from "../../../util/resource/AudioMgr";
import { getToken } from '../../../common/config/config';
@ccclass('Loginpel')
export class Loginpel extends Component {



    @property(EditBox)
    Username: EditBox;
    @property(EditBox)
    Password: EditBox;
    // redis-server.exe redis.windows.conf
    // url = "http://192.168.0.104:8080/"
    url = "http://127.0.0.1:8080/"
    // url="http://czx.yimem.com:3000/"
    start() {
        const token = getToken()
        const postData = {
            token: token,
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(this.url + "updateGame", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(data => {
                console.log(data); // 处理响应数据
                if (data.success == '1') {
                    localStorage.setItem("UserConfigData", null)
                    var userInfo = data.data;
                    var config = {
                        "version": "0.0.1",
                        "volume": 0.1,
                        "userData": {
                            "userId": userInfo.userId,
                            "gold": userInfo.gold,
                            "diamond": userInfo.diamond,
                            "soul": userInfo.soul,
                            "lv": userInfo.lv,
                            "exp": userInfo.exp,
                            "nickname": userInfo.nickname,
                            "useCardCount": userInfo.useCardCount,
                            "signCount": userInfo.signCount,
                            "backpack": [],
                            "equipments": userInfo.eqCharactersList,
                            "gameImg": userInfo.gameImg,
                            "characters": userInfo.characterList,
                            "winCount": userInfo.winCount,
                            "chapter": userInfo.chapter,
                            "stopLevel": userInfo.stopLevel,
                            "weiwanCount": userInfo.weiwanCount,
                            "bronze": userInfo.bronze,
                            "darkSteel": userInfo.darkSteel,
                            "purpleGold": userInfo.purpleGold,
                            "crystal": userInfo.crystal,
                        },
                    }
                    this.SetLeaveEnergy(userInfo.tiliCount)
                    localStorage.setItem('LastGetTime1', userInfo.tiliCountTime + "");
                    localStorage.setItem('LastGetHuoliTime1', userInfo.huoliCountTime + "");
                    this.SetLeaveHuoliEnergy(userInfo.huoliCount)
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                    director.loadScene("Home")
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );
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
    update(deltaTime: number) {

    }
    register() {
        AudioMgr.inst.playOneShot("sound/other/click");
        const username = this.Username.string;
        const password = this.Password.string; // 假设有两个输入框，分别用于用户名和密码
        if (!username) {
            const close = util.message.confirm({ message: "请输入账号" })
            return;
        }
        if (!password) {
            const close = util.message.confirm({ message: "请输入密码" })
            return;
        }
        // 验证逻辑（示例）
        if (username && password) {
            const postData = {
                username: username,
                userpassword: password
            };
            // let formData = new FormData();
            // formData.append('username', username);
            // formData.append('userpassword', password);

            // 将数据转换为 JSON 字符串
            const options = {
                // method: 'POST',
                // // headers: {
                // //     'Content-Type': 'application/json'
                // // },
                // body: formData
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData),
                // body: formData
                // credentials: 'include',
                // mode: 'cors'
            };

            // 发送 POST 请求
            fetch(this.url + "registerGame", options)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json(); // 解析 JSON 响应
                })
                .then(data => {
                    console.log(data); // 处理响应数据
                    if (data.success == '1') {
                        const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                    } else {
                        const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                    }
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                }
                );
        } else {

        }
    }
    loginBtn() {
        AudioMgr.inst.playOneShot("sound/other/click");
        const username = this.Username.string;
        const password = this.Password.string; // 假设有两个输入框，分别用于用户名和密码
        if (!username) {
            const close = util.message.confirm({ message: "请输入账号" })
            return;
        }
        if (!password) {
            const close = util.message.confirm({ message: "请输入密码" })
            return;
        }
        // 验证逻辑（示例）
        if (username && password) {
            const postData = {
                username: username,
                userpassword: password
            };
            // let formData = new FormData();
            // formData.append('username', username);
            // formData.append('userpassword', password);

            // 将数据转换为 JSON 字符串
            const options = {
                // method: 'POST',
                // // headers: {
                // //     'Content-Type': 'application/json'
                // // },
                // body: formData
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData),
                // body: formData
                // credentials: 'include',
                // mode: 'cors'
            };

            // 发送 POST 请求
            fetch(this.url + "loginGame", options)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json(); // 解析 JSON 响应
                })
                .then(data => {
                    console.log(data); // 处理响应数据
                    if (data.success == '1') {
                        localStorage.setItem("UserConfigData", null)
                        var userInfo = data.data;
                        var config = {
                            "version": "0.0.1",
                            "volume": 0.1,
                            "userData": {
                                "userId": userInfo.userId,
                                "gold": userInfo.gold,
                                "diamond": userInfo.diamond,
                                "soul": userInfo.soul,
                                "lv": userInfo.lv,
                                "exp": userInfo.exp,
                                "nickname": userInfo.nickname,
                                "signCount": userInfo.signCount,
                                "useCardCount": userInfo.useCardCount,
                                "backpack": [],
                                "equipments": userInfo.eqCharactersList,
                                "characters": userInfo.characterList,
                                "gameImg": userInfo.gameImg,
                                "winCount": userInfo.winCount,
                                "chapter": userInfo.chapter,
                                "stopLevel": userInfo.stopLevel,
                                "weiwanCount": userInfo.weiwanCount,
                                "bronze": userInfo.bronze,
                                "darkSteel": userInfo.darkSteel,
                                "purpleGold": userInfo.purpleGold,
                                "crystal": userInfo.crystal,
                            },
                        }
                        this.SetLeaveEnergy(userInfo.tiliCount)
                        localStorage.setItem('LastGetTime1', userInfo.tiliCountTime + "");
                        localStorage.setItem('LastGetHuoliTime1', userInfo.huoliCountTime + "");
                        this.SetLeaveHuoliEnergy(userInfo.huoliCount)
                        localStorage.setItem("token", userInfo.token)
                        localStorage.setItem("UserConfigData", JSON.stringify(config))
                        director.loadScene("Home")
                    } else {
                        const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                    }
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                }
                );
        } else {

        }
    }
}


