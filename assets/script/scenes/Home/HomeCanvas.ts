import { _decorator, AudioClip, AudioSource, Component, EventTouch, math, Node, screen, Slider } from 'cc';
import { getConfig } from '../../common/config/config';
const { ccclass, property } = _decorator;

@ccclass('HomeCanvas')
export class HomeCanvas extends Component {
    public audioSource
    start() {
        this.audioSource = this.node.getComponent(AudioSource)
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

