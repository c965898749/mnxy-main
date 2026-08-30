import { _decorator, AudioSource, Component, Label, Node, sp } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { questionCrtl } from '../questionCrtl/questionCrtl';
const { ccclass, property } = _decorator;

@ccclass('KuanCrtl')
export class KuanCrtl extends Component {
    @property(Node)
    mineLevel: Node = null;
    @property(Node)
    hourOutput: Node = null;
    @property(Node)
    Tili: Node = null;
    @property(Node)
    TiliCount: Node = null;

    initialized: boolean = false
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

    // 渲染函数
    async refresh() {
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "getUserMine", options)
            .then(response => {

                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    //  data.data
                    let userMine = data.data
                    this.mineLevel.getComponent(Label).string = userMine.mineLevel
                    this.hourOutput.getComponent(Label).string = userMine.hourOutput
                    this.TiliCount.getComponent(Label).string = userMine.currentSilver + "/" + userMine.maxCapacity;
                    this.Tili.setScale(
                        userMine.currentSilver / userMine.maxCapacity,
                        1,
                        1
                    )
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );

    }

    goback() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }

    openkuanJinji() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("kuanJinjiCtrl").active = true
    }

    shenji() {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "upgradeMine", options)
            .then(response => {

                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    //  data.data
                    this.refresh()
                    const levelUpEffectSkeleton = this.node.getChildByName("LevelUpEffect").getComponent(sp.Skeleton)
                    //播放声音
                    const audioSource = levelUpEffectSkeleton.node.getComponent(AudioSource)
                    audioSource.volume = config.volume * config.volumeDetail.character
                    audioSource.play()
                    // 播放动画
                    levelUpEffectSkeleton.node.active = true
                    levelUpEffectSkeleton.node.children[0]?.getComponent(sp.Skeleton).setAnimation(0, "animation", false)
                    levelUpEffectSkeleton.setAnimation(0, "animation", false)
                    levelUpEffectSkeleton.setCompleteListener(() => levelUpEffectSkeleton.node.active = false)
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );
    }

    shouhuo() {
        // AudioMgr.inst.playOneShot("sound/other/hongb");
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "collectAllSilver", options)
            .then(response => {

                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    AudioMgr.inst.playOneShot("sound/other/getCoin");
                    this.refresh()
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );
    }
    openmessage() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("kuanMessageCrtl").active = true
    }

    async questry() {
var message = `<color=#ff3333><b><size=32>灵脉升级与属性数据总表</size></b></color>
<color=#44aaff><size=26>等级　　每小时产出　存储上限　　升级消耗</size></color>
<color=#44ee44><size=24>Lv.1　　10,000　　100,000　　0</size></color>
<color=#ffffff><size=24>Lv.2　　50,000　　500,000　　90,000</size></color>
<color=#ffffff><size=24>Lv.3　　100,000　1,000,000　450,000</size></color>
<color=#ffffff><size=24>Lv.4　　150,000　1,500,000　1,000,000</size></color>
<color=#ffffff><size=24>Lv.5　　200,000　2,000,000　1,500,000</size></color>
<color=#ffdd33><size=24>Lv.6　　250,000　2,500,000　2,000,000</size></color>
<color=#ffdd33><size=24>Lv.7　　300,000　3,000,000　2,500,000</size></color>
<color=#ffdd33><size=24>Lv.8　　350,000　3,500,000　3,000,000</size></color>
<color=#ff9922><size=24>Lv.9　　400,000　4,000,000　3,500,000</size></color>
<color=#ff9922><size=24>Lv.10　 450,000　4,500,000　4,000,000</size></color>
<color=#ff9922><size=24>Lv.11　 500,000　5,000,000　4,500,000</size></color>
<color=#ff9922><size=24>Lv.12　 550,000　5,500,000　5,000,000</size></color>

<color=#aaaaaa><size=18>注：Lv1为初始灵脉，无需升级消耗</size></color>`;
        await this.node.parent.getChildByName("questionCrtl")
            .getComponent(questionCrtl)
            .read(message)
    }
    update(deltaTime: number) {

    }
}


