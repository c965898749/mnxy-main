import { _decorator, Component, find, instantiate, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { util } from '../../../util/util';
import { HolAnimation } from '../../../prefab/HolAnimation';
import { EqHeroCharacterDetailPorperty } from './CharacterDetail/EqHeroCharacterDetailPorperty';
import { EqHeroAllHeros } from './EqHeroAllHeros';
import { getConfig } from '../../../common/config/config';
import { AudioMgr } from '../../../util/resource/AudioMgr';
import { EquipmentState, EquipmentStateCreate } from '../../../game/fight/equipment/EquipmentState';
import { EquipmentEnum } from '../../../game/fight/equipment/EquipmentEnum';
import { HolEqAnimation } from '../../../prefab/HolEqAnimation';
const { ccclass, property } = _decorator;

@ccclass('EqHeroCharacterDetail')
export class EqHeroCharacterDetail extends Component {

    // 所有角色的节点
    @property(Node)
    HeroAllHeroNode: Node

    // 返回
    async goBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false;
        // this.node.removeFromParent();
        this.node.destroy();
        // const config = getConfig()
        // const close = await util.message.load()
        // await this.HeroAllHeroNode.getComponent(EqHeroAllHeros).render(config.userData.equipments)
        // close()
    }

    async goBack2() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("TiemCtrl").active = true
        this.node.parent.getChildByName("Floor").active = true

        const close = await util.message.load()
        console.log(this.node.getChildByName("CharacterAnimation"), 99)
        this.node.getChildByName("CharacterAnimation").children.forEach(element => {
            element.active = false
        });
        this.node.getChildByName("CharacterAnimation").removeAllChildren
        this.node.active = false
        close()
    }

    // 上一次的角色动画
    private $lastaNimation: Node
    // 设置角色
    //  async render(create: EquipmentStateCreate[], clickFun?: (characters: EquipmentStateCreate, node: Node) => any) {
    async setCharacter(create: EquipmentStateCreate, clickFun?: (characters: EquipmentStateCreate, node: Node) => any) {
        const propertyNode = this.node.getChildByName("Property")
        // const close = await util.message.load()
        const characterAnimationNode = this.node.getChildByName("CharacterAnimation")
        if (this.$lastaNimation) characterAnimationNode.removeChild(this.$lastaNimation)
        console.log(create.id)
        const meta = EquipmentEnum[create.id]
        // const holAnimationPrefab = await util.bundle.load("prefab/HolAnimation", Prefab)
        // const holAnimationNode = instantiate(holAnimationPrefab)
        // characterAnimationNode.addChild(holAnimationNode)
        //没有动画直接贴图
        // await holAnimationNode.getComponent(HolEqAnimation).initBones({
        //     animationScale: null,
        //     animationDir:null,
        //     animationType: null,
        //     animationPosition: null,
        //     avatarPath: create.img,
        // })
        // characterAnimationNode.addChild(holAnimationNode)
        // this.$lastaNimation = holAnimationNode
        // holAnimationNode.active = false
        // 设置属性
        await propertyNode.getComponent(EqHeroCharacterDetailPorperty).renderProperty(create,clickFun)
        // close()
        // setTimeout(async () => {
        //     holAnimationNode.active = true
        //     holAnimationNode.getComponent(HolAnimation).playAnimation("rebirth", 1, "rest")
        // }, 50
        // )
        return

    }


}

