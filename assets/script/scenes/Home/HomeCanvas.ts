import { _decorator, AudioClip, AudioSource, Color, Component, director, EventTouch, Graphics, Label, math, Mask, Node, screen, Slider, UITransform } from 'cc';
import { chatCache, getConfig, getToken } from '../../common/config/config';
import { util } from '../../util/util';
import { AudioMgr } from '../../util/resource/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('HomeCanvas')
export class HomeCanvas extends Component {
    public audioSource
    timer = 0
    // ===== 世界BOSS 中间滚动公告（代码动态创建，无需手动搭节点） =====
    private wbBanner: Node = null
    private wbLabelNode: Node = null
    private wbBannerW = 0
    private wbBannerH = 0
    private wbQueue: string[] = []
    private wbAll: string[] = []
    private wbCyclesPlayed = 0
    private wbMaxCycles = 3
    private wbLastSignature = ''
    private wbCurX = 0
    private wbTextW = 0
    private wbScrolling = false
    private wbSpeed = 150
    private wbPollTimer = 0
    private wbPollInterval = 20
    private wbFetching = false
    private wbInited = false

    start() {
        this.audioSource = this.node.getComponent(AudioSource)
        this.ensureWbBanner()
    }


    async update(deltaTime: number) {
        this.updateWbBanner(deltaTime);
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
            fetch(config.ServerUrl.url + "isTrue", options)
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
                    }else  {
                        let map=data.data
                        let list=map["world"]
                        chatCache.saveToLocals(list)
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
    // ===== 世界BOSS 中间滚动公告：动态创建 + 轮询 + 逐条横向滚动 =====
    private ensureWbBanner() {
        if (this.wbInited) return
        this.wbInited = true
        const canvasUT = this.node.getComponent(UITransform)
        const cw = canvasUT ? canvasUT.width : screen.windowSize.width
        const ch = canvasUT ? canvasUT.height : screen.windowSize.height
        const ax = canvasUT ? canvasUT.anchorX : 0.5
        const ay = canvasUT ? canvasUT.anchorY : 0.5
        // 屏幕中心（兼容 Canvas 锚点非 0.5 的情况）
        const centerX = (0.5 - ax) * cw
        const centerY = (0.5 - ay) * ch
        this.wbBannerW = cw
        this.wbBannerH = 64

        const banner = new Node('wbNoticeBanner')
        banner.parent = this.node
        banner.layer = this.node.layer
        banner.setPosition(centerX, centerY, 0)
        const bUT = banner.addComponent(UITransform)
        bUT.setContentSize(this.wbBannerW, this.wbBannerH)
        banner.active = false
        this.wbBanner = banner

        // 半透明底
        const bg = new Node('bg')
        bg.parent = banner
        bg.layer = banner.layer
        const bgG = bg.addComponent(Graphics)
        bgG.fillColor = new Color(0, 0, 0, 140)
        bgG.rect(-this.wbBannerW / 2, -this.wbBannerH / 2, this.wbBannerW, this.wbBannerH)
        bgG.fill()

        // 裁剪区（文本只在横幅内可见）
        const clip = new Node('clip')
        clip.parent = banner
        clip.layer = banner.layer
        const clipUT = clip.addComponent(UITransform)
        clipUT.setContentSize(this.wbBannerW, this.wbBannerH)
        const mask = clip.addComponent(Mask)
        mask.type = Mask.Type.GRAPHICS_RECT

        // 滞动文本
        const label = new Node('label')
        label.parent = clip
        label.layer = clip.layer
        const lUT = label.addComponent(UITransform)
        lUT.setAnchorPoint(0, 0.5)
        const lbl = label.addComponent(Label)
        lbl.fontSize = 26
        lbl.lineHeight = 32
        lbl.color = new Color(255, 215, 120, 255)
        lbl.overflow = Label.Overflow.NONE
        lbl.horizontalAlign = Label.HorizontalAlign.LEFT
        lbl.verticalAlign = Label.VerticalAlign.CENTER
        lbl.string = ''
        this.wbLabelNode = label
    }

    private updateWbBanner(deltaTime: number) {
        if (!this.wbLabelNode) return
        // 定时拉取世界BOSS公告
        this.wbPollTimer += deltaTime
        if (this.wbPollTimer >= this.wbPollInterval) {
            this.wbPollTimer = 0
            this.fetchWbNotices()
        }
        // 当前无滞动内容则从队列取一条
        if (!this.wbScrolling) {
            if (this.wbQueue.length === 0) {
                // 队列播完：没有公告、或已达播放轮数 → 隐藏并停止
                if (this.wbAll.length === 0 || this.wbCyclesPlayed >= this.wbMaxCycles) {
                    if (this.wbBanner) this.wbBanner.active = false
                    return
                }
                // 开始新一轮播放
                this.wbCyclesPlayed++
                this.wbQueue = this.wbAll.slice()
            }
            if (this.wbBanner) this.wbBanner.active = true
            const msg = this.wbQueue.shift()
            const lbl = this.wbLabelNode.getComponent(Label)
            lbl.string = msg
            this.wbTextW = this.wbLabelNode.getComponent(UITransform).width
            this.wbCurX = this.wbBannerW / 2
            this.wbLabelNode.setPosition(this.wbCurX, 0, 0)
            this.wbScrolling = true
            return
        }
        // 向左滞动，整段文本滚出左边界后取下一条
        this.wbCurX -= this.wbSpeed * deltaTime
        this.wbLabelNode.setPosition(this.wbCurX, 0, 0)
        if (this.wbCurX + this.wbTextW < -this.wbBannerW / 2) {
            this.wbScrolling = false
        }
    }

    private fetchWbNotices() {
        if (this.wbFetching) return
        const config = getConfig()
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        };
        this.wbFetching = true
        fetch(config.ServerUrl.url + "notice", options)
            .then(response => response.json())
            .then(data => {
                this.wbFetching = false
                if (data && data.success == '1' && Array.isArray(data.data)) {
                    // 只保留世界BOSS相关公告（开启/击杀/半血均包含“世界BOSS”关键字）
                    const list = data.data.filter((s: string) => typeof s === 'string' && s.indexOf('世界BOSS') !== -1)
                    const sig = list.join('|')
                    this.wbAll = list
                    // 公告内容变化（出现新事件）时重置播放轮数，重新播报
                    if (sig !== this.wbLastSignature) {
                        this.wbLastSignature = sig
                        this.wbCyclesPlayed = 0
                        this.wbQueue = []
                    }
                }
            })
            .catch(error => {
                this.wbFetching = false
                console.error('世界BOSS公告拉取失败:', error)
            })
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

