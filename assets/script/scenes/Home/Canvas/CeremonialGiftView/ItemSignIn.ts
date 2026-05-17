import { _decorator, Button, Component, Label, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ItemSignIn')
export class ItemSignIn extends Component {

    @property(Sprite) icon: Sprite = null;
    @property(Node) signBtn: Node = null;
    @property(Label) reward: Label = null;

    @property(Node) light: Node = null;


    protected siginIndata = null;

    start() {

    }

    update(deltaTime: number) {
        
    }

    initTextureWithData(array, index, isRoleStand: boolean = false, isBoldName: boolean = false) {
        this.siginIndata = array;
        let arr = this.siginIndata.award[0];
        let id = null;
        let num = null;
        // this.assetImpl.spriteAtlasFrame(this.icon, Res.texture.views.icon, 'icon_100');
        // // if (index == 1 || index == 4) {
        // //     this.assetImpl.spriteAtlasFrame(this.light.getComponent(cc.Sprite), Res.texture.views.sign, "ui_zk");
        // // }else   if (index == 6 ) {
        // //     this.assetImpl.spriteAtlasFrame(this.light.getComponent(cc.Sprite), Res.texture.views.sign, "ui_jk");
        // // }else{
        // //     this.light.active = false
        // // }
        // switch (arr[PART_ITEM.TYPE]) {
        //     case ITEM_TYPE.HERO:
        //         {
        //             let hero: SHeroDataRaw = GameMgr.heroData.getRaw(arr[PART_ITEM.ID]);
        //             this.reward.string = hero.name + '';
        //             this.assetImpl.spriteFrame(this.icon, Res.texture.hero.hero + this.siginIndata.icon);
        //             this.icon.node.setScale(0.6);
        //             this.light.active = true
        //             this.assetImpl.spriteAtlasFrame(this.light.getComponent(cc.Sprite), Res.texture.views.sign, "ui_jk");
        //             // this.node.getChildByName('str').active = true;
        //             // this.node.getChildByName('str').scale = 1.2;
        //             break;
        //         }
        //     case ITEM_TYPE.PROP:
        //         {

        //             break;
        //         }
        //     case ITEM_TYPE.EQUIPDATA:
        //         {
        //             let equip: SEquipDataRaw = GameMgr.equipData.getRaw(arr[PART_ITEM.ID]);
        //             this.reward.string = equip.name + '';
        //             this.assetImpl.spriteAtlasFrame(this.icon, Res.texture.views.icon, 'icon_' + equip.icon);
        //             this.assetImpl.spriteAtlasFrame(this.light.getComponent(cc.Sprite), Res.texture.views.sign, "ui_zk");
        //             break;
        //         }
        //     case ITEM_TYPE.CURRENCY:
        //         {
        //             this.assetImpl.spriteAtlasFrame(this.icon, Res.texture.views.icon, 'icon_' + this.siginIndata.icon);
        //             this.reward.string = arr[PART_ITEM.NUM] + '';
        //             this.light.active = false
        //             break;
        //         }
        //     default:
        //         break;
        // }


        // this.assetImpl.spriteFrame(this.heroImg, Res.texture.hero.hero + this._sHeroData.icon);
        // this.assetImpl.spriteAtlasFrame(this.bg, Res.texture.views.common, "quality_" + this.data.quality)
    }

    /**展示已签到表现 */
    public haveSigned() {
        // this.signBtn.getComponent(Button).enableAutoGrayEffect = true;
        this.signBtn.getComponent(Button).interactable = false;
        this.signBtn.getChildByName("recrive").active = true;
        this.node.getChildByName("light").active = false;

    }

    /**隐藏未签到表现 */
    public hideSigned() {
        this.signBtn.getChildByName("recrive").active = false;
        // this.signBtn.getComponent(Button).enableAutoGrayEffect = false;
        this.signBtn.getComponent(Button).interactable = false;
        this.node.getChildByName("light").active = false;

    }

    public recoverySigned() {
        this.signBtn.getChildByName("recrive").active = false;
        this.signBtn.getComponent(Button).interactable = true;
        this.node.getChildByName("light").active = true;

    }

    /**是否展示今日已签到边框 */
    public showTodayToday(isShow: boolean) {
        if (isShow)
            this.hideSigned()
    }
}


