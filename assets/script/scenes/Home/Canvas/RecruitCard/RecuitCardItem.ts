import { _decorator, Component, Label, log, Node, resources, sp, Sprite, SpriteFrame, tween } from 'cc';
import { CharacterEnum } from 'db://assets/script/game/fight/character/CharacterEnum';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

@ccclass('RecuitCardItem')
export class RecuitCardItem extends Component {

    private _index: number = 0;
    private _award: Array<number> = [];
    private _cb: Function = null;
    private _scale: number = null;
    // @property({ type: Sprite, tooltip: "招募单张卡英雄图片" }) onceHeroCard: Sprite = null;
    // @property({ type: Sprite, tooltip: "招募单张卡英雄图片光" }) heroLight: Sprite = null;
    @property(Node)
    onceHeroCard: Node = null;
    @property(Sprite)
    heroLight: Sprite = null;
    @property(Node)
    itembg: Node = null;

    @property({ type: sp.Skeleton, tooltip: "" }) choukaAni: sp.Skeleton = null;
    // @property({ type: Label, tooltip: "" }) nameLab: Label = null;
    // @property({ type: Label, tooltip: "" }) suipianLab: Label = null;
    // @property(Label)
    // nameLab: Label = null;
    // @property(Label)
    // suipianLab: Label = null;
    node: any;
    @property(Node)
    AvatarNode: Node

    @property(Node)
    LegendBorderNode: Node

    @property(Node)
    BorderNode: Node

    @property(Node)
    CampNode: Node

    @property(Node)
    LvNode: Node

    @property(Node)
    Name: Node

    @property(Node)
    Quality: Node

    @property(Node)
    Pingzhi: Node

    @property(Node)
    isBattle: Node
    @property(Node)
    Star: Node
    @property(Node)
    StackCount: Node

    @property(Node)
    Bottom: Node

    @property(Node)
    Faguang: Node

    @property(Node)
    Light: Node

    start() {

    }

    update(deltaTime: number) {

    }


    public getRandomObject(arr) {
        if (!Array.isArray(arr) || arr.length === 0) {
            return null;
        }
        const randomIndex = Math.floor(Math.random() * arr.length);
        return arr[randomIndex];
    }


    public async init(heroInfo: any, cb?: Function) {
        // this.node.active = true
        this._scale = this.node.scaleX;
        this.onceHeroCard.active = false
        let self = this
        // let heroInfo = JSON.parse(JSON.stringify(this.getRandomObject(sss))) as SHeroDataRaw
        // this.nameLab.string = heroInfo.name
        this.itembg.active = false
        const meta = CharacterEnum[heroInfo.id]
        this.AvatarNode.getComponent(Sprite).spriteFrame =
            await util.bundle.load(meta.AvatarPath, SpriteFrame)
        if (heroInfo.star > 3) {
            this.Pingzhi.getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/ui/pingzhi_0${heroInfo.star}/spriteFrame`, SpriteFrame)
        } else {
            this.Pingzhi.getComponent(Sprite).spriteFrame = null
        }
        // if (heroInfo.goIntoNum != 0) {
        //     this.isBattle.active = true
        // } else {
        //     this.isBattle.active = false
        // }
        // if (heroInfo.stackCount != 0) {
        //     if (create.stackCount > 99) {
        //         this.StackCount.getComponent(Label).string = "+99"
        //     } else {
        //         this.StackCount.getComponent(Label).string = "+" + create.stackCount
        //     }

        // }
        if (heroInfo.star > 4) {
            this.Light.active = true
        } else {
            this.Light.active = false
        }

        if (heroInfo.star < 4) {
            this.Faguang.active = false;
            this.Quality.getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/ui/card1/spriteFrame`, SpriteFrame)
            this.Bottom.getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/ui/quality_01/spriteFrame`, SpriteFrame)
        } else {
            this.Faguang.active = true;
            this.Quality.getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/ui/card2/spriteFrame`, SpriteFrame)
            this.Bottom.getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/ui/quality_05/spriteFrame`, SpriteFrame)

        }
        this.CampNode.getComponent(Sprite).spriteFrame =
            await util.bundle.load(`image/camp_icon/${heroInfo.camp}/spriteFrame`, SpriteFrame)
        // this.LvNode.getComponent(Label).string = 'Lv: ' + heroInfo.lv
        this.Name.getComponent(Label).string = heroInfo.name
        // 渲染星级
        this.Star.children.forEach(n => n.active = false)

        for (let i = 0; i < heroInfo.star; i++) {
            this.Star.children[i].active = true
            if (i + 0.5 < heroInfo.star) {
                this.Star.children[i].children[0].active = true
            }
        }
        // this.suipianLab.string = this._award[1] != ITEM_TYPE.HERO ? "英雄碎片：" + this._award[2] :"转化为英雄碎片：10"
        // this.suipianLab.string = "转化为英雄碎片：10"
        this.choukaAni.setCompleteListener(async function () {
            self.itembg.active = true
            // self.itembg.getChildByName("recruit_chip").active = true;
            self.heroLight.node.active = true // self._award[1] == ITEM_TYPE.HERO ? true : false;
            self.scheduleOnce(() => {
                if (cb) {
                    cb();
                }
            }, 1)
            self.choukaAni.node.active = false
            self.onceHeroCard.active = true
        })
        return
    }
}


