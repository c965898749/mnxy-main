import { _decorator, AudioSource, Component, Node, Slider } from 'cc';
import { getConfig } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('SetCtrl')
export class SetCtrl extends Component {
    @property(Slider)
    slider_music: Slider = null;
    @property(Slider)
    slider_effect: Slider = null;
    start() {
        const config = getConfig()
        let music_volume = config.volume * config.volumeDetail.home
        this.slider_music.progress = music_volume;
        let effect_volume = config.volume * config.volumeDetail.character
        this.slider_effect.progress = effect_volume;
    }

    update(deltaTime: number) {

    }

    public onSliderEffect(event: Slider, customEventData) {
        const config = getConfig()
        config.volumeDetail.character = Math.round(event.progress * 10);
        localStorage.setItem("UserConfigData", JSON.stringify(config))
    }
    public colseSet() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }
}


