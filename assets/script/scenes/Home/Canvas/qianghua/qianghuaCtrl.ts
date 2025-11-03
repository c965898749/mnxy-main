import { _decorator, Component, sp, Node, Prefab, Sprite, Vec3, AudioSource, SpriteFrame, find, Label, ToggleComponent } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { SelectCardCtrl } from './SelectCardCtrl';
import { SelectCardCtrl2 } from './SelectCardCtrl2';
import { CharacterStateCreate } from 'db://assets/script/game/fight/character/CharacterState';
import { CharacterEnum } from 'db://assets/script/game/fight/character/CharacterEnum';
const { ccclass, property } = _decorator;

@ccclass('qianghuaCtrl')
export class qianghuaCtrl extends Component {
    @property(Node)
    zhuCard: Node
    @property(Node)
    congCard
    @property(Node)
    gold
    initialized = false;
    zhuCardId: string
    public _ids = new Set();
    public _zhuId = null;
    public cahracterQueue: CharacterStateCreate[] = []
    public cahracterQueue2: CharacterStateCreate[] = []
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
    refresh() {
        const config = getConfig()
        this.gold.getComponent(Label).string = config.userData.gold
    }


    update(deltaTime: number) {

    }

    public async zhuSelectCard() {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        this.cahracterQueue = []
        this.cahracterQueue = config.userData.characters
        if (this._ids.size > 0) {
            this.cahracterQueue = this.cahracterQueue.filter(x => !this._ids.has(x.id))
        }
        await this.render(this.cahracterQueue)
    }

    public async zhuSelectCard2() {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        this.cahracterQueue2 = []
        this.cahracterQueue2 = config.userData.characters
        this.cahracterQueue2 = this.cahracterQueue2.map(cahracter => {
            if (this._ids.has(cahracter.id)) {
                ////console.log(this._ids)
                // 复制原对象并修改status，避免直接修改原对象
                cahracter.isChecked = 1
            } else {
                cahracter.isChecked = 0
            }
            return cahracter
        });
        if (this._zhuId) {
            this.cahracterQueue2 = this.cahracterQueue2.filter(x => this._zhuId != x.id)
        }
        ////console.log(this.cahracterQueue2)
        await this.render2(this.cahracterQueue2)
    }

    async render(characterQueue: CharacterStateCreate[]) {
        await this.node.parent.getChildByName("SelectCardCtrl")
            .getComponent(SelectCardCtrl)
            .render(characterQueue, async (c, n) => {
                n.active = false
                this.clickFun(c)
                return
            })
    }
    async render2(characterQueue: CharacterStateCreate[]) {
        await this.node.parent.getChildByName("SelectCardCtrl2")
            .getComponent(SelectCardCtrl2)
            .render(characterQueue, (c) => { this.congka(c) })
    }

    async congka(toggle: ToggleComponent) {

        var id = toggle.node.parent.getChildByName("id").getComponent(Label).string
        ////console.log(id, 33)
        var cong = toggle.node.parent.getChildByName("cong")
        if (toggle.isChecked) {
            this._ids.add(id)
            cong.active = true
        } else {
            this._ids = new Set([...this._ids].filter(num => num != id));
            cong.active = false
        }
        if (this._ids.size > 0) {
            this.congCard.getChildByName("main_bg").getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/qianghua/congCard/spriteFrame`, SpriteFrame)
            this.congCard.getChildByName("num").getComponent(Label).string = this._ids.size + ""

        } else {
            this.congCard.getChildByName("main_bg").getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/qianghua/congCard2/spriteFrame`, SpriteFrame)
            this.congCard.getChildByName("num").getComponent(Label).string = null

        }

    }

    async clickFun(create) {
        this._zhuId = create.id
        AudioMgr.inst.playOneShot("sound/other/click");
        let $node = this.zhuCard.getChildByName("HeroCardItem");
        $node.getChildByName("heroMask").getChildByName("hero").getComponent(Sprite).spriteFrame =
            await util.bundle.load('game/texture/frames/hero/' + create.id + '/spriteFrame', SpriteFrame)
        const meta = CharacterEnum[create.id]
        if (create.star < 4.5) {
            $node.getChildByName("LegendBorder").active = false
        } else {
            $node.getChildByName("LegendBorder").active = true
        }
        if (create.star >= 3) {
            $node.getChildByName("ui_pinzhi").getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/ui/pingzhi_0${create.star}/spriteFrame`, SpriteFrame)
        } else {
            $node.getChildByName("ui_pinzhi").getComponent(Sprite).spriteFrame = null
        }
        if (create.star < 4) {
            $node.getChildByName("quality").getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/ui/card1/spriteFrame`, SpriteFrame)
            $node.getChildByName("bottom").getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/ui/quality_01/spriteFrame`, SpriteFrame)
        } else {
            $node.getChildByName("quality").getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/ui/card2/spriteFrame`, SpriteFrame)
            $node.getChildByName("bottom").getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/ui/quality_05/spriteFrame`, SpriteFrame)

        }
        $node.getChildByName("Camp").getComponent(Sprite).spriteFrame =
            await util.bundle.load(`image/camp_icon/${meta.CharacterCamp}/spriteFrame`, SpriteFrame)
        $node.getChildByName("LV").getComponent(Label).string = 'Lv: ' + create.lv
        $node.getChildByName("namebg").getChildByName("name_1001").getComponent(Label).string = meta.name
        // 渲染星级
        $node.getChildByName("star").children.forEach(n => n.active = false)

        for (let i = 0; i < create.star; i++) {
            $node.getChildByName("star").children[i].active = true
            if (i + 0.5 < create.star) {
                $node.getChildByName("star").children[i].children[0].active = true
            }
        }
        $node.active = true
    }



    async qianghua() {
        if (!this._zhuId) {
            return await util.message.prompt({ message: "请选择强化主卡" })
        }
        if (this._ids.size <= 0) {
            return await util.message.prompt({ message: "请选择强化从卡" })
        }
        if (this._ids.has(this._zhuId)) {
            return await util.message.prompt({ message: "不能将主卡当做强化从卡" })
        }
        const config = getConfig()
        var cahracters = config.userData.characters
        var gold=config.userData.gold;
        var cahracter = cahracters.filter(x => x.id == this._zhuId);
        if (gold<10) {
            return await util.message.prompt({ message: "银两不足！" })
        }
        if (!cahracter) {
            return await util.message.prompt({ message: "卡牌不存在！" })
        }
        if (cahracter[0].lv >= cahracter[0].maxLv) {
            return await util.message.prompt({ message: "卡牌已满级请飞升后再次强化。" })
        }
        var cahracter4 = cahracters.filter(x => this._ids.has(x.id) && x.star >= 4);
        console.log(cahracter4, 55)
        // 是否询问
        if (cahracter4.length > 0) {
            const result = await util.message.confirm({
                message: "确定使用4星以上当强化素材吗?"
                // selectBoxMessage: "不再询问",
                // selectBoxCallback: (b: boolean) => { this.$answerLevelUp = !b }
            })
            // 是否确定
            if (result === false) return
        }
        const token = getToken()
        const postData = {
            token: token,
            userId:config.userData.userId,
            id: this._zhuId,
            str: Array.from(this._ids).join(',')
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/cardLevelUp", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    var userInfo = data.data;
                     config.userData.gold=userInfo.gold
                    config.userData.characters = userInfo.characterList
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                    var cahr = userInfo.characterList.filter(x => x.id == this._zhuId)[0];
                    this.congCard.getChildByName("main_bg").getComponent(Sprite).spriteFrame =
                        await util.bundle.load(`image/qianghua/congCard2/spriteFrame`, SpriteFrame)
                    this.congCard.getChildByName("num").getComponent(Label).string = null
                    this.gold.getComponent(Label).string=userInfo.gold
                    this.zhuCard.getChildByName("HeroCardItem").getChildByName("LV").getComponent(Label).string = 'Lv: ' + cahr.lv
                    this._ids = new Set();
                    AudioMgr.inst.playOneShot("sound/other/click");
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
                //console.error('There was a problem with the fetch operation:', error);
            }
            );
    }

    async calce() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.zhuCard.getChildByName("HeroCardItem").active = false
        this.congCard.getChildByName("main_bg").getComponent(Sprite).spriteFrame =
            await util.bundle.load(`image/qianghua/congCard2/spriteFrame`, SpriteFrame)
        this.congCard.getChildByName("num").getComponent(Label).string = null
        this._ids = new Set()
        this._zhuId = null
    }
}


