import { _decorator, Component, director, EditBox, error, Label, sys } from 'cc';
const { ccclass, property } = _decorator;
import { util } from '../../../util/util';
import { AudioMgr } from "../../../util/resource/AudioMgr";
import { getConfig, getToken } from '../../../common/config/config';
@ccclass('Loginpel')
export class Loginpel extends Component {



    @property(EditBox)
    Username: EditBox;
    @property(EditBox)
    Password: EditBox;
    // redis-server.exe redis.windows.conf
    // url = "http://192.168.0.104:8080/"
    // url = "http://127.0.0.1:8080/"
    url="http://czx.yimem.com:3000/"


    // 绑定到界面的版本显示标签（可选）
    @property(Label)
    public versionLabel: Label | null = null;

    // 服务器版本接口地址（替换为你的实际接口）
    // 本地游戏业务版本（建议在 package.json 中配置，这里先硬编码示例）
    private readonly LOCAL_GAME_VERSION = '1.0.0';

    onLoad() {
        // 初始化显示本地版本
        this.showLocalVersion();
        // 启动版本校验
        this.checkVersion();
    }

    /**
     * 显示本地版本信息
     */
    private showLocalVersion() {
        // const engineVersion = sys.engineVersion; // 引擎版本
        const gameVersion = this.LOCAL_GAME_VERSION; // 游戏版本

        if (this.versionLabel) {
            this.versionLabel.string = `本地版本：游戏${gameVersion} `;
        }
        console.log(`本地版本 - 游戏：${gameVersion}`);
    }

    /**
     * 核心逻辑：校验版本
     */
    private async checkVersion() {
        // try {
        //     // 1. 请求服务器版本信息
        //     let serverVersion = await this.getServerVersion();
        //     if(serverVersion){
        //     console.log('服务器最新版本：', serverVersion);

        //     // 2. 对比游戏业务版本（重点）
        //     if (this.LOCAL_GAME_VERSION!= serverVersion.version) {
        //         // 版本不一致，触发更新
        //         this.triggerUpdate(serverVersion.pkgUrl);
        //     } else {
        //         // 版本一致，进入游戏
        //         console.log('版本最新，进入游戏');
        //         this.enterGame();
        //     }
        //     }else{
        //          this.enterGame();
        //     }

        // } catch (err) {
        //     error('版本校验失败：', err);
        //     // 网络失败时的兜底逻辑（可选：提示重试/直接进入游戏）
        //     this.handleCheckFailed();
        // }
        this.enterGame();
    }

    /**
     * 请求服务器版本接口
     * @returns 服务器版本信息（包含game版本和下载地址）
     */
    private async getServerVersion(): Promise<{ version: string; description?: string; pkgUrl: string }> {
        return new Promise((resolve, reject) => {
            const config = getConfig()
            const token = getToken()
            const postData = {
                token: token,
            };
            const options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData),
            };
            fetch(config.ServerUrl.url + "/gameVersion", options)
                .then(response => {

                    return response.json(); // 解析 JSON 响应
                })
                .then(async data => {
                    if (data.success == '0') {
                        resolve(data.data);
                    }
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                }
                );
        });
    }


    /**
     * 触发更新流程
     * @param downloadUrl 新版本下载地址
     */
    private triggerUpdate(downloadUrl: string) {
        console.log('检测到新版本，即将更新');
        // 1. 弹出更新提示（这里用 alert 示例，实际项目替换为自定义弹窗）
        if (confirm('检测到新版本，是否立即更新？')) {
            // 2. 跳转下载链接（不同平台处理方式不同）
            if (sys.isBrowser) {
                // 浏览器端：打开新标签页
                window.open(downloadUrl, '_blank');
            } else if (sys.isNative) {
                // 原生端（安卓/iOS）：调用原生方法打开下载链接
                // 需结合原生插件，示例伪代码：
                // jsb.reflection.callStaticMethod('org/cocos2dx/javascript/UpdateUtil', 'openDownloadUrl', '(Ljava/lang/String;)V', downloadUrl);
                alert('请前往应用商店更新');
            }
        } else {
            // 用户取消更新：可选退出游戏/继续使用旧版本
            director.end(); // 退出游戏（可替换为其他逻辑）
        }
    }

    /**
     * 版本一致，进入游戏主场景
     */
    private enterGame() {
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

    /**
     * 版本校验失败的兜底处理
     */
    private handleCheckFailed() {
        if (confirm('版本校验失败，是否继续进入游戏？')) {
            this.enterGame();
        } else {
            director.end();
        }
    }



    start() {



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


