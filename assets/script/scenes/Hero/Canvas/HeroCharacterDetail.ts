import { _decorator, Component, find, instantiate, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { CharacterStateCreate } from '../../../game/fight/character/CharacterState';
import { HolCharacter } from '../../../prefab/HolCharacter';
import { util } from '../../../util/util';
import { HolAnimation } from '../../../prefab/HolAnimation';
import { CharacterEnum } from '../../../game/fight/character/CharacterEnum';
import { HeroCharacterDetailPorperty } from './CharacterDetail/HeroCharacterDetailPorperty';
import { HeroAllHeros } from './HeroAllHeros';
import { getConfig } from '../../../common/config/config';
import { AudioMgr } from '../../../util/resource/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('HeroCharacterDetail')
export class HeroCharacterDetail extends Component {

    // 所有角色的节点
    @property(Node)
    HeroAllHeroNode: Node

    // 返回
    async goBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
        const config = getConfig()
        const close = await util.message.load()
        await this.HeroAllHeroNode.getComponent(HeroAllHeros).render(config.userData.characters)
        close()
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
    async setCharacter(create: CharacterStateCreate) {
        const propertyNode = this.node.getChildByName("Property")
        const close = await util.message.load()
        const characterAnimationNode = this.node.getChildByName("CharacterAnimation")
        if (this.$lastaNimation) characterAnimationNode.removeChild(this.$lastaNimation)
        console.log(create.id)
        const meta = CharacterEnum[create.id]
        const holAnimationPrefab = await util.bundle.load("prefab/HolAnimation", Prefab)
        const holAnimationNode = instantiate(holAnimationPrefab)
        characterAnimationNode.addChild(holAnimationNode)
        await holAnimationNode.getComponent(HolAnimation).initBones({
            animationScale: meta.AnimationScale * 1.7,
            animationDir: meta.AnimationDir,
            animationType: meta.AnimationType,
            animationPosition: meta.AnimationPosition,
            avatarPath: meta.AvatarPath,
        })
        characterAnimationNode.addChild(holAnimationNode)
        this.$lastaNimation = holAnimationNode
        holAnimationNode.active = false
        console.log(1111111111111111111111)
        // 设置属性
        await propertyNode.getComponent(HeroCharacterDetailPorperty).renderProperty(create)
        close()
        setTimeout(async () => {
            holAnimationNode.active = true
            holAnimationNode.getComponent(HolAnimation).playAnimation("rebirth", 1, "rest")
        }, 50
        )
        return
    }


}

