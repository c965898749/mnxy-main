import { _decorator, AudioClip, AudioSource, Component, director, EventTouch, math, Node, screen, Slider } from 'cc';
import { getConfig, getToken } from '../../common/config/config';
import { util } from '../../util/util';
import { AudioMgr } from '../../util/resource/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('HomeCanvas')
export class HomeCanvas extends Component {
    public audioSource
    timer = 0
    start() {
        this.audioSource = this.node.getComponent(AudioSource)
    }


    async update(deltaTime: number) {
        if (this.timer >= 1000) {

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
            fetch(config.ServerUrl.url + "/isTrue", options)
                .then(response => {

                    return response.json(); // 解析 JSON 响应
                })
                .then(async data => {
                    if (data.success == '0') {
                        const result = await util.message.confirm({
                            message: "账号已在其他设备登录，已为您下线。\n\n非本人操作请立即修改密码。"
                        })
                        AudioMgr.inst.playOneShot("sound/other/click");
                        localStorage.setItem("token", null)
                        localStorage.setItem("UserConfigData", null)
                        director.preloadScene("login", () => {
                            close()
                        })
                        director.loadScene("login")
                    }
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                }
                );
            this.timer = 0;
        }
        else {
            this.timer++;
        }

    }
    public onSliderMusic(event: Slider, customEventData) {
        const config = getConfig()
        config.volumeDetail.home = Math.round(event.progress * 10);
        config.volumeDetail.fight = Math.round(event.progress * 10);
        localStorage.setItem("UserConfigData", JSON.stringify(config))
        const audioSource = this.node.getComponent(AudioSource)
        audioSource.volume = config.volume * config.volumeDetail.home
    }
}

