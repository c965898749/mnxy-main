import { _decorator, Component, director, EditBox, instantiate, Label, Prefab, ProgressBar, sys } from 'cc';
const { ccclass, property } = _decorator;
import { util } from '../../../util/util';
import { AudioMgr } from "../../../util/resource/AudioMgr";
import { getConfig, getToken } from '../../../common/config/config';
import { DEBUG, JSB } from "cc/env";
import { GGHotUpdateInstance } from "../../../../../extensions/gg-hot-update/assets/scripts/hotupdate/GGHotUpdateInstance";
import { ggHotUpdateManager } from "../../../../../extensions/gg-hot-update/assets/scripts/hotupdate/GGHotUpdateManager";
import { GGHotUpdateInstanceEnum, GGHotUpdateInstanceState } from "../../../../../extensions/gg-hot-update/assets/scripts/hotupdate/GGHotUpdateType";
@ccclass('Loginpel')
export class Loginpel extends Component {

    @property(EditBox)
    Username: EditBox;
    @property(EditBox)
    Password: EditBox;
    @property(EditBox)
    YaoCode: EditBox;
    // redis-server.exe redis.windows.conf
    // url = "http://192.168.0.104:8080/"
    // url = "http://127.0.0.1:8080/"
    url = "http://czx.yimem.com:3000/"

    @property(Label)
    messageLabel: Label = null!;

    @property(ProgressBar)
    progressBar: ProgressBar = null!;

    @property(Label)
    progressLabel: Label = null!;

    @property(Label)
    downloadSpeedLabel: Label = null!;

    @property(Label)
    downloadSizeLabel: Label = null!;

    @property(Label)
    downloadRemainTimeLabel: Label = null!;

    @property({ tooltip: "QQ群号" })
    public qqGroupNum: string = "587452663"; // 替换为你的群号

    // 按钮点击回调：打开超链接
    public onButtonClick() {
        let groupUrl = "";
        // 1. 区分平台生成QQ加群链接
        if (sys.isBrowser) {
            // 网页端：QQ加群网页链接
            groupUrl = `https://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=rXTeZRMHy35lfIWcuardpJaZbQyUl9yp&authKey=xpEbNlr4/WHTL/cPd9FtcyI73lr95JgdPiRspKB2Gd7z/egoMqPX4hHOowZ5DgNt&noverify=0&group_code=587452663`;
        } else if (sys.isNative) {
            // 原生端：QQ私有协议
            if (sys.os === sys.OS.ANDROID) {
                groupUrl = `mqqapi://card/show_pslcard?src_type=internal&version=1&uin=${this.qqGroupNum}&card_type=group&source=qrcode`;
            } else if (sys.os === sys.OS.IOS) {
                groupUrl = `mqq://im/chat?chat_type=group&uin=${this.qqGroupNum}&version=1&src_type=web`;
            }
        }

        if (!groupUrl) {
            console.error("当前平台不支持QQ加群跳转");
            return;
        }

        // 2. ✅ 核心修改：使用Cocos内置sys.openURL，跨平台兼容
        sys.openURL(groupUrl);
        console.log(`正在打开QQ加群链接：${groupUrl}`);
    }
    protected onLoad(): void {
        if (JSB) {
            this.node.getChildByName("update").active = true;
            let packageUrl = "";
            switch (sys.os) {
                // case sys.OS.OPENHARMONY:
                //     packageUrl = `https://raw.githubusercontent.com/zhitaocai/cocos-creator-gg-hot-update-demo/v6/build/harmonyos-next/data-gg-hot-update`;
                //     break;
                // case sys.OS.OHOS:
                //     packageUrl = `https://raw.githubusercontent.com/zhitaocai/cocos-creator-gg-hot-update-demo/v6/build/ohos/data-gg-hot-update`;
                //     break;
                // case sys.OS.IOS:
                //     packageUrl = `https://raw.githubusercontent.com/zhitaocai/cocos-creator-gg-hot-update-demo/v6/build/ios/data-gg-hot-update`;
                //     break;
                case sys.OS.ANDROID:
                    // packageUrl = `https://raw.githubusercontent.com/zhitaocai/cocos-creator-gg-hot-update-demo/v6/build/android/data-gg-hot-update`;
                    // packageUrl = `http://192.168.40.10:8082/gg-hot-update-demo/build/android/data-gg-hot-update`;
                    packageUrl = `http://czx.yimem.com:5502/data-gg-hot-update`;
                    break;
            }
            ggHotUpdateManager.init({
                enableLog: DEBUG,
                packageUrl: packageUrl,
            });
        }
    }

    protected onEnable(): void {
        if (JSB) {
            ggHotUpdateManager.getInstance(GGHotUpdateInstanceEnum.BuildIn).register(this);
            ggHotUpdateManager.getInstance(GGHotUpdateInstanceEnum.BuildIn).checkUpdate();
        } else {
            this.scheduleOnce(() => {
                this._enterLobbyScene();
            }, 0.1);
        }
    }

    protected onDisable(): void {
        if (JSB) {
            ggHotUpdateManager.getInstance(GGHotUpdateInstanceEnum.BuildIn).unregister(this);
        }
    }

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 监听 GG 热更新回调

    /**
     * 检查更新失败后，最大重试次数
     */
    private _checkUpdateRetryMaxTimes = 3;
    /**
     * 检查更新失败后，累计重试次数
     */
    private _checkUpdateRetryCurTimes = 0;
    /**
     * 检查更新失败后，重试间隔(秒)
     */
    private _checkUpdateRetryIntervalInSecond = 5;
    /**
     * 热更新失败后，最大重试次数
     */
    private _hotUpdateRetryMaxTimes = 3;
    /**
     * 热更新失败后，累计重试次数
     */
    private _hotUpdateRetryCurTimes = 0;
    /**
     * 热更新失败后，重试间隔(秒)
     */
    private _hotUpdateRetryIntervalInSecond = 5;

    async onGGHotUpdateInstanceCallBack(instance: GGHotUpdateInstance): Promise<void> {

        if (instance == null) {
            this.messageLabel.string = "";
            this._setUpdateProgressVisability(false);
            return;
        }

        switch (instance.state) {
            case GGHotUpdateInstanceState.Idle:
                this.messageLabel.string = "";
                this._setUpdateProgressVisability(false);
                break;
            case GGHotUpdateInstanceState.CheckUpdateInProgress:
                this.messageLabel.string = "检查更新中...";
                this._setUpdateProgressVisability(false);
                break;
            case GGHotUpdateInstanceState.CheckUpdateFailedParseLocalProjectManifestError:
            case GGHotUpdateInstanceState.CheckUpdateFailedParseRemoteVersionManifestError:
            case GGHotUpdateInstanceState.CheckUpdateFailedDownloadRemoteProjectManifestError:
            case GGHotUpdateInstanceState.CheckUpdateFailedParseRemoteProjectManifestError: {
                // 检查更新失败
                if (this._checkUpdateRetryCurTimes >= this._checkUpdateRetryMaxTimes) {
                    this.messageLabel.string = `解析远程 project.manifest 失败`;
                    // 如果是解析本地信息失败导致的检查更新失败，那么可以考虑清除本地的下载缓存目录，以清空所有缓存，提高下次能正确更新的概率
                    if (instance.state == GGHotUpdateInstanceState.CheckUpdateFailedParseLocalProjectManifestError) {
                        instance.clearDownloadCache();
                    }
                    // 弹窗提示检查失败以及提供重试机制
                    // showAlertDialog({
                    //     titleLabel: "Check for Updates Failed",
                    //     msgLabel: "There seems to be a problem during the update check.\nPlease check if your network connection is active.",
                    //     cancelBtnVisable: false,
                    //     confirmBtnVisable: true,
                    //     confirmBtnLabel: "Retry",
                    //     onConfirmBtnClick: () => {
                    //         this.checkUpdateRetryCurTimes = 0;
                    //         instance.checkUpdate();
                    //         hideAlertDialog();
                    //     },
                    // });
                } else {
                    this.messageLabel.string = `检查更新失败：${instance.state}，当前累计重试次数：${this._checkUpdateRetryCurTimes}，最大重试次数：${this._checkUpdateRetryMaxTimes}，还没达到最大重试次数，将在${this._checkUpdateRetryIntervalInSecond}s后重试`;
                    this.scheduleOnce(() => {
                        this._checkUpdateRetryCurTimes++;
                        instance.checkUpdate();
                    }, this._checkUpdateRetryIntervalInSecond);
                }
                break;
            }
            case GGHotUpdateInstanceState.CheckUpdateSucNewVersionFound:
                this.messageLabel.string = `检查更新成功，并且发现现版本，开始热更新`;
                // 检查更新成功，并且发现现版本，开始热更新
                instance.hotUpdate();
                break;
            case GGHotUpdateInstanceState.CheckUpdateSucAlreadyUpToDate:
                this.messageLabel.string = `检查更新成功，但没有发现新版本，跳过热更新`;
                // 检查更新成功，但没有发现新版本，跳过热更新
                this._enterLobbyScene();
                break;
            case GGHotUpdateInstanceState.HotUpdateDownloading:
                this.messageLabel.string = "文件下载中";
                this._setUpdateProgressVisability(true);
                this._updateProgress(instance.totalBytes, instance.downloadedBytes, instance.downloadSpeedInSecond, instance.downloadRemainTimeInSecond);
                break;
            case GGHotUpdateInstanceState.HotUpdateExtracting:
                let percent = 0;
                if (instance.zipExtractTotalBytes > 0) {
                    percent = instance.zipExtractedBytes / instance.zipExtractTotalBytes;
                }
                this.messageLabel.string = `${(percent * 100).toFixed(2)}%`;
                this._setUpdateProgressVisability(false);
                break;
            case GGHotUpdateInstanceState.HotUpdateSuc: {
                // 热更新：成功，重启游戏
                // 等一小段时间在重启
                this.messageLabel.string = "更新成功，即将重启游戏";
                this.scheduleOnce(() => {
                    ggHotUpdateManager.restartGame();
                });
                break;
            }
            case GGHotUpdateInstanceState.HotUpdateFailed: {
                // 热更新：失败，尝试进行一定次数的重试
                if (this._hotUpdateRetryCurTimes >= this._hotUpdateRetryMaxTimes) {
                    this.messageLabel.string = "更新失败";
                    // console.log(`热更新过程中出现下载失败的文件，当前累计重试次数：${this._hotUpdateRetryCurTimes}，最大重试次数：${this._hotUpdateRetryMaxTimes}，已达到最大重试次数，将弹出重试弹窗`);
                    // 如果尝试一定次数之后，依旧失败，那么弹窗提示
                    // showAlertDialog({
                    //     titleLabel: "Update Resources Failed",
                    //     msgLabel: "There seems to be a problem during the resources update process.\nPlease check if your network connection is active.",
                    //     cancelBtnVisable: false,
                    //     confirmBtnVisable: true,
                    //     confirmBtnLabel: "Retry",
                    //     onConfirmBtnClick: () => {
                    //         this.hotUpdateRetryCurTimes = 0;
                    //         instance.hotUpdate();
                    //         hideAlertDialog();
                    //     },
                    // });
                } else {
                    this.messageLabel.string = `热更新过程中出现下载失败的文件，当前累计重试次数：${this._hotUpdateRetryCurTimes}，最大重试次数：${this._hotUpdateRetryMaxTimes}，还没有达到最大重试次数，将在${this._hotUpdateRetryIntervalInSecond}s后重试`;
                    // console.log(
                    //     `热更新过程中出现下载失败的文件，当前累计重试次数：${this._hotUpdateRetryCurTimes}，最大重试次数：${this._hotUpdateRetryMaxTimes}，还没有达到最大重试次数，将在${this._hotUpdateRetryIntervalInSecond}s后重试`
                    // );
                    this.scheduleOnce(() => {
                        this._hotUpdateRetryCurTimes++;
                        instance.hotUpdate();
                    }, this._hotUpdateRetryIntervalInSecond);
                }
                break;
            }
        }
    }

    private _enterLobbyScene() {
        this.node.getChildByName("update").active = false;
        this.enterGame()
    }



    /**
       * 设置下载进度可见性
       */
    private _setUpdateProgressVisability(visable: boolean) {
        this.progressBar.node.active = visable;
        this.progressLabel.node.active = visable;
        this.downloadSpeedLabel.node.active = visable;
        this.downloadSizeLabel.node.active = visable;
        this.downloadRemainTimeLabel.node.active = visable;
    }

    /**
     * 更新下载进度
     *
     * @param totalBytes 总下载字节数
     * @param downloadedBytes 已下载字节数
     * @param byteSpeedInSecond 下载速度（Bytes/s)
     * @param remainTimeInScond 下载剩余时间(s)
     */
    private _updateProgress(totalBytes: number, downloadedBytes: number, byteSpeedInSecond: number, remainTimeInScond: number) {
        let percent = 0;
        if (totalBytes > 0) {
            percent = downloadedBytes / totalBytes;
        }
        this.progressBar.progress = percent;
        this.progressLabel.string = (percent * 100).toFixed(2) + "%";
        this.downloadSizeLabel.string = `Size: ${this._byte2MB(downloadedBytes).toFixed(2)}MB/${this._byte2MB(totalBytes).toFixed(2)}MB`;
        this.downloadSpeedLabel.string = `Speed: ${this._byte2MB(byteSpeedInSecond).toFixed(2)}MB/s`;
        if (remainTimeInScond >= 0) {
            this.downloadRemainTimeLabel.string = `Remaining Time: ${remainTimeInScond}s`;
        } else {
            this.downloadRemainTimeLabel.string = `Remaining Time: -- s`;
        }
    }

    private _byte2MB(bytes: number): number {
        return bytes / 1024 / 1024;
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
                // console.log(data); // 处理响应数据
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
                             "myCode":userInfo.myCode
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
        this.node.getChildByName("YaoCode").active = true

    }

    closeYao() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.getChildByName("YaoCode").active = false
    }
    yaoCode() {
        AudioMgr.inst.playOneShot("sound/other/click");
        const username = this.Username.string;
        const yaoCode = this.YaoCode.string;
        const password = this.Password.string; // 假设有两个输入框，分别用于用户名和密码
        if (!username) {
            const close = util.message.confirm({ message: "请输入账号" })
            return;
        }
        if (!password) {
            const close = util.message.confirm({ message: "请输入密码" })
            return;
        }
        if (!yaoCode) {
            const close = util.message.confirm({ message: "请输入邀请码" })
            return;
        }
        // 验证逻辑（示例）
        if (username && password) {
            const postData = {
                username: username,
                userpassword: password,
                yaoCode:yaoCode
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
                    // console.log(data); // 处理响应数据
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
                    // console.log(data); // 处理响应数据
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
                                "myCode":userInfo.myCode
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


