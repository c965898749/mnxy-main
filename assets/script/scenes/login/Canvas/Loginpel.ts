import { _decorator, Component, director, EditBox, instantiate, Node, Label, Prefab, ProgressBar, sys, tween, Vec3, RichText, Button, Sprite, SpriteFrame } from 'cc';
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
    isRequesting: boolean = false;
    @property(EditBox)
    Username: EditBox;
    @property(EditBox)
    Password: EditBox;
    @property(EditBox)
    Username2: EditBox;
    @property(EditBox)
    Password2: EditBox;
    @property(EditBox)
    Username3: EditBox;
    @property(EditBox)
    Password3: EditBox;
    @property(EditBox)
    YaoCode: EditBox;
    @property(EditBox)
    YaoCode2: EditBox;
    @property(EditBox)
    YaoCode3: EditBox;
    @property(Button)
    sendCode: Button;
    @property(Button)
    sendCode2: Button;
    @property(Label)
    sendCodeLabel: Label;
    @property(Label)
    sendCodeLabel2: Label;
    @property(RichText)
    RichText1: RichText;
    @property(RichText)
    RichText2: RichText;
    @property(RichText)
    RichText3: RichText;
    @property(RichText)
    RichText4: RichText;
    isEmail: boolean = true;
    @property(Label)
    severeLabel: Label;
    isSendingCode: boolean = false;
    @property({ type: Node, tooltip: "任务列表" }) ContentNode2: Node = null;
    // redis-server.exe redis.windows.conf
    serverList = [{ "id": 1, "name": "梦回西游", "url": "http://127.0.0.1:8889/" }]
    // serverList = [
    //     { "id": 1, "name": "梦回西游", "url": "https://czx.yimem.com:3002/" },
    //     { "id": 2, "name": "再续前缘", "url": "https://czx.yimem.com:3004/" },
    // ]
    url = localStorage.getItem("url") ?? this.serverList[0].url;
//更新公告内容
            content = `<color=#FF4500><size=28><b>【国庆盛典】版本更新与副本探险活动公告</b></size></color>
<color=#FFE4B5><size=20>亲爱的仙友们：</size></color>
<color=#FFA500><size=19>为优化副本探险体验，游戏将于以下时间进行版本更新：</size></color>
<color=#FFFF00><size=18>▶ 维护时间：2026年10月7日 09:00-13:00（预计4小时）</size></color>
<color=#FFFF00><size=18>▶ 维护范围：全服所有服务器</size></color>
<color=#FF6347><size=18>▶ 维护补偿：灵石*5000 + 金币*10万 + 魂魄*500</size></color>
<color=#FFA500><size=19>本次更新内容：</size></color>
<color=#FFFFFF><size=17>1. 第11章材料掉落继续翻倍，新增副本装备技能书掉落</size></color>
<color=#FFFFFF><size=17>2. 新增人妖仙兽四个护：4.5星轩辕、4.5星地藏、4星谛听、4.5星三圣母</size></color>
<color=#FFFFFF><size=17>3. 下期预告：即将开启应龙世界副本</size></color>
<color=#87CEFA><size=18>遇到月宫阻碍？联系我们：</size></color>
<color=#FFFFFF><size=16>▶ 游戏内：祭坛-客服石碑</size></color>
<color=#FFFFFF><size=16>▶ 官方①QQ群：1092641657</size></color>
<color=#FFFFFF><size=16>▶ GM邮箱：chengzhixiang2023@163.com</size></color>
<color=#FF69B4><size=18>愿仙途顺遂，国庆同乐！</size></color>
<color=#CCCCCC><size=14>【QQ神仙依梦工作室】2026年10月7日</size></color>`
// content = `<color=#FFFFFF><size=20>尊敬的各位仙友：</size>
// <color=#FFA500><size=19>月满中秋，仙府同庆！《迷你神仙》中秋限定活动正式开启，全新护法【嫦娥】登场，中秋夺月副本限时开放，海量资源礼包等你来领！</size>

// <color=#FFFF00><size=18>▶ 新增护法：嫦娥</size>
// <color=#FFFFFF><size=17>技能1：桂影栖身
// 嫦娥在场下时，每回合增加闪避，最多叠加30%。</size>
// <color=#FFFFFF><size=17>技能2：月满重生
// 我方有单位阵亡时，消耗自身一定比例生命上限血量复活该单位；复活单位恢复50%最大生命值，最低消耗血量40%，且不能复活固魂单位。</size>
// <color=#FFFFFF><size=17>羁绊技能：王母协同
// 与王母在同一队伍时，提升自身生命上限、攻击与速度属性。</size>
// <color=#FF4500><size=18>仙友提示：嫦娥兼具闪避叠加与复活能力，搭配王母激活羁绊，队伍生存能力大幅提升，是本次中秋版本强力辅助护法！</color>

// <color=#FFFF00><size=18>▶ 限时活动副本：中秋夺月</size>
// <color=#FFFFFF><size=17>活动期间，【中秋夺月】副本限时开启。挑战副本可获取月华晶石、各类矿石等丰厚养成材料，助力仙友培养嫦娥，提升护法实力。副本难度分多档，仙友可根据自身队伍实力选择挑战。</size>

// <color=#FFFF00><size=18>▶ 中秋专属礼包🎁</size>
// <color=#FFFFFF><size=17>礼包内含：2000青铜矿、2000玄铁矿、2000紫金矿、2000月华晶石
// 礼包兑换方式：点击头像 → 点击兑换 → 输入兑换码：中秋快乐
// 注意事项：兑换码有效期仅限中秋活动期间，每个账号仅可兑换一次；礼包奖励将直接发放至背包，请仙友留意查收。</size>

// <color=#FFA500><size=19>▶ 系统功能新增</size>
// <color=#FFFFFF><size=17>新增装备分解功能，为防止装备误分解，可点击装备详情右上角锁定装备。</size>

// <color=#87CEFA><size=18>▶ 版本前瞻预告</size>
// <color=#FFFFFF><size=17>国庆将开启第11章主线以及世界BOSS副本，敬请期待！</size>

// <color=#FF69B4><size=18>月照仙途，共贺中秋，祝各位仙友中秋安康，仙运昌隆！</size>
// <color=#CCCCCC><size=14>【迷你神仙依梦工作室】2026年09月27日</size> `


    checkUpdateToday = false;
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

    @property(Node)
    ContentNode: Node

    @property({ tooltip: "QQ群号" })
    public qqGroupNum: string = "1092641657"; // 替换为你的群号

    // 按钮点击回调：打开超链接
    public onButtonClick() {
        let groupUrl = "";
        // 1. 区分平台生成QQ加群链接
        if (sys.isBrowser) {
            // 网页端：QQ加群网页链接
            groupUrl = `http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=fnX_AEpW4t9XJpp-879tk2lkDo-XAKyq&authKey=RGLrlQBABDeCblVIuTlC33MYlk73F%2FXDhhLI9heMn9fycTq9G6yVVlI5l4BuqehF&noverify=0&group_code=1092641657`;
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
                // case sys.OS.WINDOWS:
                //     packageUrl = `http://czx.yimem.com:5502/data-gg-hot-update`;
                //     this.serverList = [
                //         { "id": 1, "name": "梦回西游", "url": "http://czx.yimem.com:3000/" },
                //         { "id": 2, "name": "再续前缘", "url": "http://czx.yimem.com:3003/" },
                //     ]
                //     break;
                case sys.OS.IOS:
                    packageUrl = `https://czx.yimem.com:5508/data-gg-hot-update`;
                    this.serverList = [
                        { "id": 1, "name": "梦回西游", "url": "https://czx.yimem.com:3002/" },
                        { "id": 2, "name": "再续前缘", "url": "https://czx.yimem.com:3004/" },
                    ]
                    break;
                case sys.OS.ANDROID:
                    packageUrl = `http://czx.yimem.com:5502/data-gg-hot-update`;
                    this.serverList = [
                        { "id": 1, "name": "梦回西游", "url": "http://czx.yimem.com:3000/" },
                        { "id": 2, "name": "再续前缘", "url": "http://czx.yimem.com:3003/" },
                    ]
                    break;
            }
            ggHotUpdateManager.init({
                enableLog: DEBUG,
                packageUrl: packageUrl,
            });
        }
        this.url = localStorage.getItem("url") ?? this.serverList[0].url;
        for (let i = this.serverList.length - 1; i >= 0; i--) {
            if (this.url == this.serverList[i].url) {
                this.severeLabel.string = this.serverList[i].name;
            }
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
                // 更新后清空公告缓存，下次进入重新展示公告
                localStorage.removeItem("noticeSeen")
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
        // 检查公告缓存：没有缓存则阻止进入游戏并弹公告
        if (!localStorage.getItem("noticeSeen")) {
            this.ContentNode.getComponent(RichText).string = this.content
            this.node.getChildByName("GameNotice").active = true
            this.node.getChildByName("GameNotice").scale = new Vec3(0, 0, 0)
            tween(this.node.getChildByName("GameNotice"))
                .to(1, { scale: new Vec3(1, 1, 1) }, { easing: 'elasticOut' })
                .start();
            return
        }
        this.enterGame()
    }

    openGameNotice() {
        if (this.node.getChildByName("GameNotice").active) {
            this.node.getChildByName("GameNotice").active = false
        } else {
            AudioMgr.inst.playOneShot("sound/other/click");
            this.ContentNode.getComponent(RichText).string = this.content
            this.node.getChildByName("GameNotice").active = true
            this.node.getChildByName("GameNotice").scale = new Vec3(0, 0, 0)
            tween(this.node.getChildByName("GameNotice"))
                .to(1, { scale: new Vec3(1, 1, 1) }, { easing: 'elasticOut' })
                .start();
        }

    }
    closeGameNotice() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.getChildByName("GameNotice").active = false
        // 标记公告已读，下次进入不再弹出
        localStorage.setItem("noticeSeen", "1")
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
    private async enterGame() {
        if (this.isRequesting) return;
        this.isRequesting = true;
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
                    this.node.parent.getChildByName("HolPreLoad").active=true
                    localStorage.setItem("UserConfigData", null)
                    var userInfo = data.data;
                    var config = {
                        "version": "0.0.1",
                        "volume": 0.1,
                        "ServerUrl": {
                            "url": this.url
                        },
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
                            "myCode": userInfo.myCode
                        },
                    }
                    for (let i = 0; i < userInfo.eqCharactersList.length; i++) {
                        console.log(userInfo.eqCharactersList[i].gemList, 999)
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
                setTimeout(() => {
                    this.isRequesting = false;
                }, 3000);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                setTimeout(() => {
                    this.isRequesting = false;
                }, 3000);
            });
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
        const username = this.Username2.string;
        const yaoCode = this.YaoCode.string;
        const yaoCode2 = this.YaoCode2.string;
        const password = this.Password2.string; // 假设有两个输入框，分别用于用户名和密码
        if (!username) {
            const close = util.message.confirm({ message: "请输入账号" })
            return;
        }
        if (this.isEmail) {
            const emailRegex = /^[a-zA-Z0-9_\-.]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
            if (!emailRegex.test(username)) {
                util.message.confirm({ message: "请输入有效的邮箱地址" });
                return;
            }
        } else {
            // 手机号正则
            const phoneRegex = /^1[3-9]\d{9}$/;
            const trimPhone = username.trim();
            if (!phoneRegex.test(trimPhone)) {
                util.message.confirm({ message: "请输入有效的手机号码" });
                return;
            }
        }
        if (!password) {
            const close = util.message.confirm({ message: "请输入密码" })
            return;
        }
        if (!yaoCode) {
            const close = util.message.confirm({ message: "请输入验证码" })
            return;
        }
        // 验证逻辑（示例）
        if (username && password) {
            const postData = {
                username: username,
                userpassword: password,
                yaoCode: yaoCode,
                yaoCode2: yaoCode2
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
    forgotPassword() {
        AudioMgr.inst.playOneShot("sound/other/click");
        const username = this.Username3.string;
        const yaoCode3 = this.YaoCode3.string;
        const password = this.Password3.string; // 假设有两个输入框，分别用于用户名和密码
        if (!username) {
            const close = util.message.confirm({ message: "请输入账号" })
            return;
        }
        if (this.isEmail) {
            const emailRegex = /^[a-zA-Z0-9_\-.]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
            if (!emailRegex.test(username)) {
                util.message.confirm({ message: "请输入有效的邮箱地址" });
                return;
            }
        } else {
            // 手机号正则
            const phoneRegex = /^1[3-9]\d{9}$/;
            const trimPhone = username.trim();
            if (!phoneRegex.test(trimPhone)) {
                util.message.confirm({ message: "请输入有效的手机号码" });
                return;
            }
        }

        if (!password) {
            const close = util.message.confirm({ message: "请输入密码" })
            return;
        }
        if (!yaoCode3) {
            const close = util.message.confirm({ message: "请输入验证码" })
            return;
        }
        // 验证逻辑（示例）
        if (username && password) {
            const postData = {
                username: username,
                userpassword: password,
                yaoCode: yaoCode3
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
            fetch(this.url + "forgotPassword", options)
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
    updateStoreData() {
        AudioMgr.inst.playOneShot("sound/other/click");
        const username = this.Username2.string;
        if (!username) {
            const close = util.message.confirm({ message: "请输入账号" })
            return;
        }
        if (this.isEmail) {
            const emailRegex = /^[a-zA-Z0-9_\-.]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
            if (!emailRegex.test(username)) {
                util.message.confirm({ message: "请输入有效的邮箱地址" });
                return;
            }
        } else {
            // 手机号正则
            const phoneRegex = /^1[3-9]\d{9}$/;
            const trimPhone = username.trim();
            if (!phoneRegex.test(trimPhone)) {
                util.message.confirm({ message: "请输入有效的手机号码" });
                return;
            }
        }

        // 验证逻辑（示例）
        const postData = {
            str: username,
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        let cc = 'sendVerificationCode'
        if (!this.isEmail) {
            cc = 'sendVerificationMobileCode'
        }
        // 发送 POST 请求
        fetch(this.url + cc, options)
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
                    this.sendCode.interactable = false
                    let time = 60
                    let self = this
                    this.sendCodeLabel.string = "(" + time + ")"
                    this.schedule(function () {
                        time--
                        this.sendCodeLabel.string = "(" + time + ")"
                        if (time <= 0) {
                            this.sendCodeLabel.string = "发送验证码"
                        }
                    }, 1, 60)
                    this.scheduleOnce(function () {
                        self.sendCode.interactable = true
                        self.sendCodeLabel.string = "发送验证码"
                    }, 60)
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );
    }
    updateStoreData2() {
        AudioMgr.inst.playOneShot("sound/other/click");
        const username = this.Username3.string;
        if (!username) {
            const close = util.message.confirm({ message: "请输入账号" })
            return;
        }
        if (this.isEmail) {
            const emailRegex = /^[a-zA-Z0-9_\-.]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
            if (!emailRegex.test(username)) {
                util.message.confirm({ message: "请输入有效的邮箱地址" });
                return;
            }
        } else {
            // 手机号正则
            const phoneRegex = /^1[3-9]\d{9}$/;
            const trimPhone = username.trim();
            if (!phoneRegex.test(trimPhone)) {
                util.message.confirm({ message: "请输入有效的手机号码" });
                return;
            }
        }
        // 验证逻辑（示例）
        const postData = {
            str: username,
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        let cc = 'sendVerificationCode'
        if (!this.isEmail) {
            cc = 'sendVerificationMobileCode'
        }
        // 发送 POST 请求
        fetch(this.url + cc, options)
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
                    this.sendCode2.interactable = false
                    let time = 60
                    let self = this
                    this.sendCodeLabel2.string = "(" + time + ")"
                    this.schedule(function () {
                        time--
                        this.sendCodeLabel2.string = "(" + time + ")"
                        if (time <= 0) {
                            this.sendCodeLabel2.string = "发送验证码"
                        }
                    }, 1, 60)
                    this.scheduleOnce(function () {
                        self.sendCode2.interactable = true
                        self.sendCodeLabel2.string = "发送验证码"
                    }, 60)
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );
    }
    closeYao() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.getChildByName("YaoCode").active = false
    }

    goback() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.getChildByName("setCount").active = false
    }

    goback2() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.getChildByName("register").active = false
    }
    goback3() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.getChildByName("ServerList").active = false
    }
    goback4() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.getChildByName("forgotPassword").active = false
    }
    registerBtn() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.getChildByName("register").active = true
    }

    forgotPasswordBtn() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.getChildByName("forgotPassword").active = true
    }


    async openServerList() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.getChildByName("ServerList").active = true
        const nodePool = util.resource.getNodePool(
            await util.bundle.load("prefab/server", Prefab)
        )
        const childrens = [...this.ContentNode2.children]
        for (let i = 0; i < childrens.length; i++) {
            const node = childrens[i];
            node.off("click")
            nodePool.put(node)
        }
        for (let i = this.serverList.length - 1; i >= 0; i--) {
            let item = nodePool.get()
            if (this.url == this.serverList[i].url) {
                item.getComponent(Sprite).spriteFrame =
                    await util.bundle.load("image/back/22/spriteFrame", SpriteFrame)
            } else {
                item.getComponent(Sprite).spriteFrame =
                    await util.bundle.load("image/back/11/spriteFrame", SpriteFrame)
            }
            item.getChildByName("num").getComponent(Label).string = i + 1 + "服"
            item.getChildByName("name").getComponent(Label).string = this.serverList[i].name
            if (i == this.serverList.length - 1) {
                item.getChildByName("tuijian").active = true
                item.getChildByName("good").getComponent(Sprite).spriteFrame =
                    await util.bundle.load("image/back/good/spriteFrame", SpriteFrame)
            } else {
                item.getChildByName("tuijian").active = false
                item.getChildByName("good").getComponent(Sprite).spriteFrame =
                    await util.bundle.load("image/back/bad/spriteFrame", SpriteFrame)
            }
            // // 绑定事件
            item.on("click", () => {
                this.url = this.serverList[i].url
                localStorage.setItem("url", this.url)
                this.severeLabel.string = this.serverList[i].name;
                localStorage.setItem("token", null)
                this.openServerList()
            })
            this.ContentNode2.addChild(item)
            continue
        }
    }

    changeRegister(event: Event, customEventData: string) {
        AudioMgr.inst.playOneShot("sound/other/click");
        if (customEventData == "1") {
            this.isEmail = true
            this.RichText1.string = " <color=#222222><u font-size='24'>邮箱注册</u> </color>"
            this.RichText2.string = " <color=#858585>短信注册</color>"
        } else {
            this.isEmail = false
            this.RichText2.string = " <color=#222222><u font-size='24'>短信注册</u> </color>"
            this.RichText1.string = " <color=#858585>邮箱注册</color>"
        }
    }

    changeRegister2(event: Event, customEventData: string) {
        AudioMgr.inst.playOneShot("sound/other/click");
        if (customEventData == "1") {
            this.isEmail = true
            this.RichText3.string = " <color=#222222><u font-size='24'>邮箱账号</u> </color>"
            this.RichText4.string = " <color=#858585>短信账号</color>"
        } else {
            this.isEmail = false
            this.RichText4.string = " <color=#222222><u font-size='24'>短信账号</u> </color>"
            this.RichText3.string = " <color=#858585>邮箱账号</color>"
        }
    }

    loginBtn3() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.getChildByName("setCount").active = true
    }

    loginBtn() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.enterGame();
    }
    loginBtn2() {
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
                        const close = util.message.confirm({ message: data.errorMsg })
                        localStorage.setItem("UserConfigData", null)
                        var userInfo = data.data;
                        localStorage.setItem("token", userInfo.token)
                        this.node.getChildByName("setCount").active = false
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


