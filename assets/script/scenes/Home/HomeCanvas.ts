import { _decorator, AudioClip, AudioSource, Component, EventTouch, math, Node, screen, Slider } from 'cc';
import { util } from '../../util/util';
import { getConfig } from '../../common/config/config';
const { ccclass, property } = _decorator;

@ccclass('HomeCanvas')
export class HomeCanvas extends Component {
    public audioSource
    protected async start() {

        // const close = await util.message.load({})

        // 初始化音乐
        await this.initMusic()

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
}

