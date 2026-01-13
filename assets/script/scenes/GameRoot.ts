import { _decorator, AudioClip, AudioSource, Component, director, Node, Slider } from 'cc';
import { getConfig, getToken } from '../common/config/config';
import { util } from '../util/util';
const { ccclass, property } = _decorator;

@ccclass('GameRoot')
export class GameRoot extends Component {
    public audioSource
    protected async start() {
        // const close = await util.message.load({})
        //判断是否有token
        // 初始化音乐
        const token = getToken()
        if (token) {
            await this.initMusic()
        } else {
            localStorage.setItem("UserConfigData", null)
            director.preloadScene("login", () => {
                close()
            })
            director.loadScene("login")
        }

        // close()
    }

    // 初始化播放音乐
    private async initMusic() {
        const config = getConfig()
        // 音乐们
        const musics = await util.bundle.loadDir<AudioClip>("sound/home", AudioClip)
        const music = musics[Math.floor(musics.length * Math.random())]
        this.audioSource = this.node.getComponent(AudioSource)
        this.audioSource.clip = music
        this.audioSource.volume = config.volume * config.volumeDetail.home
        this.audioSource.play()
    }

    public onSliderMusic(event: Slider, customEventData) {
        const config = getConfig()
        config.volumeDetail.home = Math.round(event.progress * 10);
        config.volumeDetail.fight = Math.round(event.progress * 10);
        localStorage.setItem("UserConfigData", JSON.stringify(config))
        const audioSource = this.node.getComponent(AudioSource)
        audioSource.volume = config.volume * config.volumeDetail.home
    }


    update(deltaTime: number) {

    }
}


