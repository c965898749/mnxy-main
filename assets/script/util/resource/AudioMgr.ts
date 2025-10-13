//AudioMgr.ts
import { Node, AudioSource, AudioClip, resources, director } from 'cc';
import { getConfig } from '../../common/config/config';
/**
 * @en
 * this is a sington class for audio play, can be easily called from anywhere in you project.
 * @zh
 * 这是一个用于播放音频的单件类，可以很方便地在项目的任何地方调用。
 */
export class AudioMgr {
    private static _inst: AudioMgr;
    public static get inst(): AudioMgr {
        if (this._inst == null) {
            this._inst = new AudioMgr();
        }
        return this._inst;
    }
    //AudioSource组件用于控制音频播放
    private _audioSource: AudioSource;

    private _volume: number = 0.8;//默认音量（部分web平台（ios）限制并不会生效）
    private _sound_on: boolean = true;//音效开关

    //特别：用于播放可以被打断的音效
    private _audioSource2: AudioSource;

    constructor() {
        //@en create a node as audioMgr
        //@zh 创建一个节点作为 audioMgr
        let audioMgr = new Node();
        audioMgr.name = '__audioMgr__';

        //@en add to the scene.
        //@zh 添加节点到场景
        director.getScene().addChild(audioMgr);

        //@en make it as a persistent node, so it won't be destroied when scene change.
        //@zh 标记为常驻节点，这样场景切换的时候就不会被销毁了
        director.addPersistRootNode(audioMgr);

        //@en add AudioSource componrnt to play audios.
        //@zh 添加 AudioSource 组件，用于播放音频。
        this._audioSource = audioMgr.addComponent(AudioSource);

        let audio_node2 = new Node();
        audio_node2.name = '__audio_node2__';
        director.getScene().addChild(audio_node2);
        director.addPersistRootNode(audio_node2);
        this._audioSource2 = audio_node2.addComponent(AudioSource);
        this._audioSource2.playOnAwake = false;
    }

    public get audioSource() {
        return this._audioSource;
    }

    public get AudioSource2(): AudioSource {
        return this._audioSource2;
    }
    /**
     * @en
     * play short audio, such as strikes,explosions
     * @zh
     * 播放短音频,比如 打击音效，爆炸音效等
     * @param sound clip or url for the audio
     * @param volume 
     */
    playOneShot(sound: AudioClip | string) {
        const config = getConfig()
        let volume = config.volume * config.volumeDetail.character||0
        console.log(volume)
        if (sound instanceof AudioClip) {
            this._audioSource.playOneShot(sound, volume);
        }
        else {
            resources.load(sound, (err, clip: AudioClip) => {
                if (err) {
                    console.log(err);
                }
                else {
                    this._audioSource.playOneShot(clip, volume);
                }
            });
        }
    }

    /**
     * @en
     * play long audio, such as the bg music
     * @zh
     * 播放长音频，比如 背景音乐
     * @param sound clip or url for the sound
     * @param volume 
     */
    play(sound: AudioClip | string, volume: number = 1.0) {
        if (sound instanceof AudioClip) {
            this._audioSource.stop();
            this._audioSource.clip = sound;
            this._audioSource.play();
            this.audioSource.volume = volume;
        }
        else {
            resources.load(sound, (err, clip: AudioClip) => {
                console.log(3333)
                if (err) {
                    console.log(err);
                }
                else {
                    this._audioSource.stop();
                    this._audioSource.clip = clip;
                    this._audioSource.play();
                    this.audioSource.volume = volume;
                }
            });
        }
    }

    playBgm(clip: AudioClip | string, volume: number = 1.0) {
        if (!this._sound_on) {
            this._volume = 0;
        } else {
            this._volume = volume;
        }
        let sound = clip;
        if (!sound) {
            console.error("背景音乐为空");
            return;
        }
        if (sound instanceof AudioClip) {
            this._audioSource.stop();
            this._audioSource.clip = sound; //考虑到切换背景音乐时，先停止后播放，防止出现播放叠加或不播放的问题
            this._audioSource.play();
            this._audioSource.loop = true;
            this._audioSource.volume = this._volume;
        } else {
            //(实际上不放在这里，一般来说会在ResMgr中预先加载)
            resources.load(sound, (err, audio: AudioClip) => {
                if (err) {
                    console.error("背景音乐加载失败", sound);
                } else {
                    this._audioSource.stop();
                    this._audioSource.clip = audio;
                    this._audioSource.play();
                    this._audioSource.loop = true;
                    this._audioSource.volume = this._volume;
                }
            });
        }
    };

    /**
     * 播放音效1 预加载方式
     * @param soundtype 音频类型（定义）
     * @param volume 
     */
    playEffect(sound_clip: AudioClip | string, volume: number = 1.0) {
        if (!this._sound_on) return;
        let sound = sound_clip;
        if (!sound) {
            console.error("音效为空");
            return;
        }
        //判断是不是音频剪辑
        if (sound instanceof AudioClip) {
            this._audioSource.playOneShot(sound, this._volume);
        } else {
            //动态加载(实际上不放在这里，一般来说会在ResMgr中预先加载)
            resources.load(sound, (err, audio: AudioClip) => {
                if (err) {
                    console.error("音效加载失败", sound);
                } else {
                    this._audioSource.playOneShot(audio, this._volume);
                }
            });
        }
    }

    /**
     * 播放音效2 可以被打断的音效
     * @param sound_clip 
     * @param volume 
     */
    playEffectCanBreak(sound_clip: AudioClip | string, volume: number = 1.0) {
        if (!this._sound_on) {
            this._volume = 0;
        } else {
            this._volume = volume;
        }
        let sound = sound_clip;
        if (!sound) {
            console.error("音效为空");
            return;
        }
        if (sound instanceof AudioClip) {
            this._audioSource2.stop();
            this._audioSource2.clip = sound;
            this._audioSource2.play();
            this._audioSource2.loop = false;
            this._audioSource2.volume = this._volume;
        } else {
            resources.load(sound, (err, audio: AudioClip) => {
                if (err) {
                    console.error("音效加载失败", sound);
                } else {
                    this._audioSource2.stop();
                    this._audioSource2.clip = audio;
                    this._audioSource2.play();
                    this._audioSource2.loop = false;
                    this._audioSource2.volume = this._volume;
                }
            });
        }
    }

    /**
     * 客户端音效开关
     * @param soundOpen 
     */
    setMenu(soundOpen: boolean) {
        this._sound_on = soundOpen;
        if (!this._sound_on) {
            this._audioSource.volume = 0;
            this._audioSource2.volume = 0;
            this._volume = 0;
        } else {
            this._audioSource.volume = 1.0;
            this._audioSource2.volume = 1.0;
            this._volume = 1.0;
        }
    }

    /**
     * stop the audio play
     */
    stop() {
        this._audioSource.stop();
    }

    /**
     * pause the audio play
     */
    pause() {
        this._audioSource.pause();
    }

    /**
     * resume the audio play
     */
    resume() {
        this._audioSource.play();
    }
}