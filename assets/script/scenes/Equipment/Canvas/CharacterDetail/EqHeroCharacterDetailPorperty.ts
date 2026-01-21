import { _decorator, AudioSource, Component, find, Label, Node, sp, Sprite, SpriteFrame } from 'cc';
import { util } from '../../../../util/util';
import { CharacterEnum } from '../../../../game/fight/character/CharacterEnum';
import { EquipmentState, EquipmentStateCreate } from 'db://assets/script/game/fight/equipment/EquipmentState';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
const { ccclass, property } = _decorator;

// 升级所需金币
function levelUpNeedGold(create: EquipmentStateCreate): number {
    return Math.ceil(
        CharacterEnum[create.id].CharacterQuality * create.lv * (create.lv / (create.lv + 80) + 1) * 100
    )
}

// 升级所需钻石
function levelUpNeedSoule(create: EquipmentStateCreate): number {
    return Math.ceil(
        CharacterEnum[create.id].CharacterQuality * create.lv * (create.lv / (create.lv + 80) + 1) * 100 * 0.5
    )
}

@ccclass('EqHeroCharacterDetailPorperty')
export class EqHeroCharacterDetailPorperty extends Component {

    // 角色状态
    private $state: EquipmentStateCreate

    // 是否询问升级
    private $answerLevelUp: boolean = true
    // 是否询问升级
    private $answerSell: boolean = true



    // 渲染属性
    async renderProperty(create: EquipmentStateCreate, clickFun?: (characters: EquipmentStateCreate, node: Node) => any) {
        this.$state = create
        this.node.getChildByName("Name").getComponent(Label).string = "名称: " + create.name
        this.node.getChildByName("Lv").getComponent(Label).string = "Lv: " + create.lv
        this.node.getChildByName("introduce").getComponent(Label).string = create.introduce + ''
        this.node.getChildByName("CharacterAnimation").getComponent(Sprite).spriteFrame =
            await util.bundle.load(`game/texture/frames/emp/${create.id.split('_')[0]}/spriteFrame`, SpriteFrame)
        this.node.getChildByName("Attribute").children.forEach(n => n.active = false)
        if (create.star < 3.5) {
            this.node.getChildByName("Attribute").children[0].active = true
            this.node.getChildByName("Attribute").children[0].getChildByName("Icon").getComponent(Label).string = create.name.split('.')[0]
            if (create.name.split('.')[0] == "锋利") {
                this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.wlAtk + ''
            } else if (create.name.split('.')[0] == "坚韧") {
                this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.wlDef + ''
            } else if (create.name.split('.')[0] == "火焰") {
                this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.hyAtk + ''
            } else if (create.name.split('.')[0] == "火抗") {
                this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.hyDef + ''
            } else if (create.name.split('.')[0] == "毒素") {
                this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.dsDef + ''
            } else if (create.name.split('.')[0] == "毒抗") {
                this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.dsDef + ''
            } else if (create.name.split('.')[0] == "飞弹") {
                this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.fdAtk + ''
            } else if (create.name.split('.')[0] == "弹抗") {
                this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.fdDef + ''
            } else if (create.name.split('.')[0] == "治愈") {
                this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.zlDef + ''
            }
        }
        if (create.star >= 3.5) {
            this.node.getChildByName("Attribute").children[0].active = true
            this.node.getChildByName("Attribute").children[0].getChildByName("Icon").getComponent(Label).string = create.name.split('.')[0]
            if (create.name.split('.')[0] == "锋利") {
                this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.wlAtk + ''
            } else if (create.name.split('.')[0] == "坚韧") {
                this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.wlDef + ''
            } else if (create.name.split('.')[0] == "火焰") {
                this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.hyAtk + ''
            } else if (create.name.split('.')[0] == "火抗") {
                this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.hyDef + ''
            } else if (create.name.split('.')[0] == "毒素") {
                this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.dsAtk + ''
            } else if (create.name.split('.')[0] == "毒抗") {
                this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.dsDef + ''
            } else if (create.name.split('.')[0] == "飞弹") {
                this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.fdAtk + ''
            } else if (create.name.split('.')[0] == "弹抗") {
                this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.fdDef + ''
            } else if (create.name.split('.')[0] == "治愈") {
                this.node.getChildByName("Attribute").children[0].getChildByName("Value").getComponent(Label).string = create.zlDef + ''
            }


            this.node.getChildByName("Attribute").children[1].active = true
            this.node.getChildByName("Attribute").children[1].getChildByName("Icon").getComponent(Label).string = create.name.split('.')[1]
            if (create.name.split('.')[0] == "锋利") {
                this.node.getChildByName("Attribute").children[1].getChildByName("Value").getComponent(Label).string = create.wlAtk + ''
            } else if (create.name.split('.')[0] == "坚韧") {
                this.node.getChildByName("Attribute").children[1].getChildByName("Value").getComponent(Label).string = create.wlDef + ''
            } else if (create.name.split('.')[0] == "火焰") {
                this.node.getChildByName("Attribute").children[1].getChildByName("Value").getComponent(Label).string = create.hyAtk + ''
            } else if (create.name.split('.')[0] == "火抗") {
                this.node.getChildByName("Attribute").children[1].getChildByName("Value").getComponent(Label).string = create.hyDef + ''
            } else if (create.name.split('.')[0] == "毒素") {
                this.node.getChildByName("Attribute").children[1].getChildByName("Value").getComponent(Label).string = create.dsAtk + ''
            } else if (create.name.split('.')[0] == "毒抗") {
                this.node.getChildByName("Attribute").children[1].getChildByName("Value").getComponent(Label).string = create.dsDef + ''
            } else if (create.name.split('.')[0] == "飞弹") {
                this.node.getChildByName("Attribute").children[1].getChildByName("Value").getComponent(Label).string = create.fdAtk + ''
            } else if (create.name.split('.')[0] == "弹抗") {
                this.node.getChildByName("Attribute").children[1].getChildByName("Value").getComponent(Label).string = create.fdDef + ''
            } else if (create.name.split('.')[0] == "治愈") {
                this.node.getChildByName("Attribute").children[1].getChildByName("Value").getComponent(Label).string = create.zlDef + ''
            }
        }
        // 仙、佛、圣、魔、妖、兽
        const cmp = new Map([
            ['sacred', '仙界'],
            ['nature', '佛界'],
            ['machine', '圣界'],
            ['abyss', '魔界'],
            ['dark', '妖界'],
            ['ordinary', '兽界'],
        ]);

        this.node.getChildByName("Zhongzu").getComponent(Label).string = cmp.get(create.camp) + "     " + create.profession

        // 渲染星级
        const starNode = this.node.getChildByName("Star")
        starNode.children.forEach(n => n.active = false)
        starNode.children.forEach(n => n.children[0].active = false)
        starNode.children.forEach(n => n.children[1].active = false)
        for (let i = 0; i < 5; i++)
            starNode.children[i].active = true
        for (let i = 0; i < create.star; i++) {
            starNode.children[i].children[0].active = true
            if (i + 0.5 == create.star) {
                starNode.children[i].children[1].active = true
            }
        }
        this.node.getChildByName("sell").off("click")
        if (create.goIntoNum != 0) {
            this.node.getChildByName("sell").active = true
            this.node.getChildByName("sell").on("click", () => { if (clickFun) clickFun(create, this.node) })
        } else {
            this.node.getChildByName("sell").active = false
        }
    }

    // 显示所有的属性
    async showAllProperty() {
        let message = `基本属性\n`
        message += `攻击: ${Math.ceil(this.$state.attack)}\n\n`
        message += `洗练属性\n`
        message += `暂无开放\n\n`
        message += `技能\n`
        message += `无\n`
        // message += `${create.PassiveIntroduceOne}\n`
        // message += `${create.PassiveIntroduceTwo}\n`
        // message += `${create.SkillIntroduce}\n`
        // message += ` 攻击: ${Math.ceil(create.attack)}\n`
        // message += ` 物抗: ${Math.ceil(create.defence)}\n`
        // message += ` 速度: ${Math.ceil(create.speed)}\n`
        // message += ` 真实: ${Math.ceil(create.pierce)}\n`
        // message += ` 闪避率: ${Math.ceil(create.block)}%\n`
        // message += ` 暴击率: ${Math.ceil(create.critical)}%\n`
        // message += ` 免伤率: ${Math.ceil(create.FreeInjuryPercent * 100)}%\n`
        // message += ` 最大能量: ${Math.ceil(create.maxEnergy)}\n`
        await util.message.introduce({ message })
    }




    // // 英雄升级
    // async characterLevelUp() {
    //     this.node.getChildByName("Name").getComponent(Label).string = "名称: " + create.name
    //     const config = getConfig()
    //     // 是否询问
    //     if (this.$answerLevelUp) {
    //         const result = await util.message.confirm({
    //             message: "确定要升级吗?",
    //             selectBoxMessage: "不再询问",
    //             selectBoxCallback: (b: boolean) => { this.$answerLevelUp = !b }
    //         })
    //         // 是否确定
    //         if (result === false) return
    //     }
    //     // 资源不足
    //     if (
    //         config.userData.gold < levelUpNeedGold(create.create)
    //         ||
    //         config.userData.soul < levelUpNeedSoule(create.create)
    //     ) return await util.message.prompt({ message: "资源不足" })
    //     // 资源减少
    //     config.userData.gold -= levelUpNeedGold(create.create)
    //     config.userData.soul -= levelUpNeedSoule(create.create)
    //     // 角色等级提升
    //     create.create.lv++
    //     // 重新渲染
    //     await this.renderProperty(create.create)
    //     find("Canvas/HolUserResource").getComponent(HolUserResource).render() // 资源渲染
    //     const levelUpEffectSkeleton = this.node.getChildByName("LevelUp").getChildByName("LevelUpEffect").getComponent(sp.Skeleton)
    //     //播放声音
    //     const audioSource = levelUpEffectSkeleton.node.getComponent(AudioSource)
    //     audioSource.volume = config.volume * config.volumeDetail.character
    //     audioSource.play()
    //     // 播放动画
    //     levelUpEffectSkeleton.node.active = true
    //     levelUpEffectSkeleton.node.children[0]?.getComponent(sp.Skeleton).setAnimation(0, "animation", false)
    //     levelUpEffectSkeleton.setAnimation(0, "animation", false)
    //     levelUpEffectSkeleton.setCompleteListener(() => levelUpEffectSkeleton.node.active = false)
    // }

    // async characteSell() {
    //     // 是否询问
    //     if (this.$answerSell) {
    //         const result = await util.message.confirm({
    //             message: "确定要出售吗?",
    //             selectBoxMessage: "不再询问",
    //             selectBoxCallback: (b: boolean) => { this.$answerSell = !b }
    //         })
    //         // 是否确定
    //         if (result === false) return
    //     }
    //     const config = getConfig()
    //     const token = getToken()
    //     const postData = {
    //         token: token,
    //         userId: config.userData.userId,
    //         id: create.create.id
    //     };
    //     const options = {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify(postData),
    //     };
    //     fetch(config.ServerUrl.url + "/characteSell", options)
    //         .then(response => {
    //             if (!response.ok) {
    //                 throw new Error('Network response was not ok');
    //             }
    //             return response.json(); // 解析 JSON 响应
    //         })
    //         .then(async data => {
    //             if (data.success == '1') {
    //                 var map = data.data;
    //                 let dto = map['dto'];
    //                 let user = map['user'];
    //                 let gold = map['gold'];
    //                 config.userData.characters = dto.characters
    //                 config.userData.gold = user.gold
    //                 localStorage.setItem("UserConfigData", JSON.stringify(config))
    //                 AudioMgr.inst.playOneShot("sound/other/getCoin");
    //                 await util.message.prompt({ message: "获得金币：" + gold })
    //             } else {
    //                 AudioMgr.inst.playOneShot("sound/other/tantdoor");
    //                 const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
    //             }
    //         })
    //         .catch(error => {
    //             console.error('There was a problem with the fetch operation:', error);
    //         }
    //         );

    // }
}

