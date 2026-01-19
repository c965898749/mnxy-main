import { _decorator, AudioSource, Component, find, instantiate, Label, Node, Prefab, sp, Sprite, SpriteFrame } from 'cc';
import { CharacterState, CharacterStateCreate } from '../../../../game/fight/character/CharacterState';
import { util } from '../../../../util/util';
import { getConfig, getToken, updateConfig } from '../../../../common/config/config';
import { HolUserResource } from '../../../../prefab/HolUserResource';
import { CharacterEnum } from '../../../../game/fight/character/CharacterEnum';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { EqHeroCharacterDetail } from '../../../Equipment/Canvas/EqHeroCharacterDetail';
import { EquipmentStateCreate } from 'db://assets/script/game/fight/equipment/EquipmentState';
import { SelectEqCardCtrl } from '../../../Home/Canvas/qianghua/SelectEqCardCtrl';
const { ccclass, property } = _decorator;

// 升级所需金币
function levelUpNeedGold(create: CharacterStateCreate): number {
    return Math.ceil(
        CharacterEnum[create.id].CharacterQuality * create.lv * (create.lv / (create.lv + 80) + 1) * 100
    )
}

// 升级所需钻石
function levelUpNeedSoule(create: CharacterStateCreate): number {
    return Math.ceil(
        CharacterEnum[create.id].CharacterQuality * create.lv * (create.lv / (create.lv + 80) + 1) * 100 * 0.5
    )
}

@ccclass('HeroCharacterDetailPorperty')
export class HeroCharacterDetailPorperty extends Component {

    @property(Node)
    empNode: Node
    // 角色状态
    private $state: CharacterState

    // 是否询问升级
    private $answerLevelUp: boolean = true
    // 是否询问升级
    private $answerSell: boolean = true



    // 渲染属性
    async renderProperty(create: CharacterStateCreate) {
        console.log("渲染角色属性", create)
        this.$state = new CharacterState(create, null)
        this.node.getChildByName("Name").getComponent(Label).string = "名称: " + this.$state.meta.name
        this.node.getChildByName("Lv").getComponent(Label).string = "Lv: " + this.$state.lv
        this.node.getChildByName("Hp").getChildByName("Value").getComponent(Label).string = Math.ceil(this.$state.maxHp) + ''
        this.node.getChildByName("Attack").getChildByName("Value").getComponent(Label).string = Math.ceil(this.$state.attack) + ''
        this.node.getChildByName("Defence").getChildByName("Value").getComponent(Label).string = Math.ceil(this.$state.defence) + ''
        this.node.getChildByName("Speed").getChildByName("Value").getComponent(Label).string = Math.ceil(this.$state.speed) + ''
        this.node.getChildByName("introduce").getComponent(Label).string = this.$state.meta.introduce + ''
        this.node.getChildByName("skill").getChildByName("Value").getComponent(Label).string = this.$state.meta.skillValue + ''
        // 仙、佛、圣、魔、妖、兽
        const cmp = new Map([
            ['sacred', '仙界'],
            ['nature', '佛界'],
            ['machine', '圣界'],
            ['abyss', '魔界'],
            ['dark', '妖界'],
            ['ordinary', '兽界'],
        ]);

        const position = ["仙灵", "神将", "武圣"]
        const nameNode = ["防具", "兵刃", "法器", "宝具"]
        this.node.getChildByName("Zhongzu").getComponent(Label).string = cmp.get(this.$state.meta.CharacterCamp) + "." + position[this.$state.meta.position]

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

        if (create.goIntoNum != 0) {
            this.node.getChildByName("State").getChildByName("shanzhen").children[0].active = true
        } else {
            this.node.getChildByName("State").getChildByName("shanzhen").children[0].active = false
        }
        let eqCharactersList = getConfig().userData.equipments
        this.empNode.children.forEach(async (n, index) => {
            n.off("click")
            let eqCharacters = eqCharactersList.find(x => x.eqType == index && x.goIntoNum + "" == create.id)
            if (eqCharacters) {
                n.getChildByName("Label").getComponent(Label).string = ""
                n.getChildByName("header_qitiandashen").getComponent(Sprite).spriteFrame =
                await util.bundle.load(`game/texture/frames/emp/${eqCharacters.id}/spriteFrame`, SpriteFrame)
            } else {
                n.getChildByName("Label").getComponent(Label).string = nameNode[index]
                n.getChildByName("header_qitiandashen").getComponent(Sprite).spriteFrame = null
            }
            n.on("click", () => this.empOnclick(create.id, index))
        })
    }

    async empOnclick(itemId, empType) {
        // AudioMgr.inst.playOneShot("sound/other/click");
        console.log("点击了装备栏位", itemId, empType)
        const config = getConfig()
        var cahracterQueue = []
        cahracterQueue = config.userData.equipments
        cahracterQueue = cahracterQueue.filter(x => x.goIntoNum == itemId && x.eqType == empType)
        if (cahracterQueue.length > 0) {
            let eqCharacters = cahracterQueue[0]
            const holAnimationPrefab = await util.bundle.load("prefab/CharacterDetail", Prefab)
            const holAnimationNode = instantiate(holAnimationPrefab)
            this.node.parent.addChild(holAnimationNode)
            await holAnimationNode
                .getComponent(EqHeroCharacterDetail)
                .setCharacter(eqCharacters, async (c, n) => {
                    // n.removeFromParent();
                    // n.destroy()
                    this.clickFun1(c.id, n, empType)
                    return
                })
            this.node.parent.getChildByName("CharacterDetail").active = true
        } else {
            var cahracterQueue2 = []
            cahracterQueue2 = config.userData.equipments
            cahracterQueue2 = cahracterQueue2.filter(x => x.goIntoNum == 0 && x.eqType == empType)
            await this.render(cahracterQueue2, itemId, empType)
        }
    }
    async render(characterQueue: EquipmentStateCreate[], itemId: string, empType: number) {
        const holAnimationPrefab = await util.bundle.load("prefab/SelectEqCardCtrl", Prefab)
        const holAnimationNode = instantiate(holAnimationPrefab)
        this.node.parent.addChild(holAnimationNode)
        await holAnimationNode
            .getComponent(SelectEqCardCtrl)
            .render(characterQueue, async (c, n) => {
                n.removeFromParent();
                n.destroy()
                this.clickFun2(c, itemId, empType)
                return
            })
    }
    // 上阵
    public async clickFun1(itemId, node, empType) {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            id: itemId,
            userId: config.userData.userId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/changeEqState", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    var userInfo = data.data;
                    const nameNode = ["防具", "兵刃", "法器", "宝具"]
                    config.userData.equipments = userInfo.eqCharactersList
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                    this.empNode.children[empType].getChildByName("Label").getComponent(Label).string = nameNode[empType]
                    this.empNode.children[empType].getChildByName("header_qitiandashen").getComponent(Sprite).spriteFrame = null
                    node.getChildByName("sell").active = false
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );
    }

    public async clickFun2(create, itemId, empType) {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            id: create.id,
            str: itemId,
            userId: config.userData.userId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/changeEqState2", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    var userInfo = data.data;
                    config.userData.equipments = userInfo.eqCharactersList
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                    let cahracterQueue = userInfo.eqCharactersList.filter(x => x.goIntoNum == itemId && x.eqType == empType)
                    this.empNode.children[empType].getChildByName("Label").getComponent(Label).string = ""
                    this.empNode.children[empType].getChildByName("header_qitiandashen").getComponent(Sprite).spriteFrame =
                          await util.bundle.load(`game/texture/frames/emp/${cahracterQueue[0].id}/spriteFrame`, SpriteFrame)
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );


    }

    // 显示所有的属性
    async showAllProperty() {
        let message = ``
        message += `${this.$state.meta.PassiveIntroduceOne}\n`
        message += `${this.$state.meta.PassiveIntroduceTwo}\n`
        message += `${this.$state.meta.SkillIntroduce}\n`
        // message += ` 攻击力: ${Math.ceil(this.$state.attack)}\n`
        // message += ` 防御力: ${Math.ceil(this.$state.defence)}\n`
        // message += ` 速度值: ${Math.ceil(this.$state.speed)}\n`
        // message += ` 穿透值: ${Math.ceil(this.$state.pierce)}\n`
        // message += ` 格挡率: ${Math.ceil(this.$state.block)}%\n`
        // message += ` 暴击率: ${Math.ceil(this.$state.critical)}%\n`
        // message += ` 免伤率: ${Math.ceil(this.$state.FreeInjuryPercent * 100)}%\n`
        // message += ` 最大能量: ${Math.ceil(this.$state.maxEnergy)}\n`
        await util.message.introduce({ message })
    }


    // 上阵
    async changeState() {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            id: this.$state.create.id,
            userId: config.userData.userId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/changeState", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    var userInfo = data.data;
                    config.userData.characters = userInfo.characterList
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                    this.node.getChildByName("State").getChildByName("shanzhen").children[0].active = !this.node.getChildByName("State").getChildByName("shanzhen").children[0].active
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );


    }

    // 英雄升级
    async characterLevelUp() {
        this.node.getChildByName("Name").getComponent(Label).string = "名称: " + this.$state.meta.name
        const config = getConfig()
        // 是否询问
        if (this.$answerLevelUp) {
            const result = await util.message.confirm({
                message: "确定要升级吗?",
                selectBoxMessage: "不再询问",
                selectBoxCallback: (b: boolean) => { this.$answerLevelUp = !b }
            })
            // 是否确定
            if (result === false) return
        }
        // 资源不足
        if (
            config.userData.gold < levelUpNeedGold(this.$state.create)
            ||
            config.userData.soul < levelUpNeedSoule(this.$state.create)
        ) return await util.message.prompt({ message: "资源不足" })
        // 资源减少
        config.userData.gold -= levelUpNeedGold(this.$state.create)
        config.userData.soul -= levelUpNeedSoule(this.$state.create)
        // 角色等级提升
        this.$state.create.lv++
        // 重新渲染
        await this.renderProperty(this.$state.create)
        find("Canvas/HolUserResource").getComponent(HolUserResource).render() // 资源渲染
        const levelUpEffectSkeleton = this.node.getChildByName("LevelUp").getChildByName("LevelUpEffect").getComponent(sp.Skeleton)
        //播放声音
        const audioSource = levelUpEffectSkeleton.node.getComponent(AudioSource)
        audioSource.volume = config.volume * config.volumeDetail.character
        audioSource.play()
        // 播放动画
        levelUpEffectSkeleton.node.active = true
        levelUpEffectSkeleton.node.children[0]?.getComponent(sp.Skeleton).setAnimation(0, "animation", false)
        levelUpEffectSkeleton.setAnimation(0, "animation", false)
        levelUpEffectSkeleton.setCompleteListener(() => levelUpEffectSkeleton.node.active = false)
    }

    async touchCancel() {
        // if (this.data.create) {
        //     this.clickFun(this.data.create)
        // } else {
        //     const config = getConfig()
        //     var cahracterQueue = []
        //     cahracterQueue = config.userData.characters
        //     cahracterQueue = cahracterQueue.filter(x => x.goIntoNum == 0)
        //     await this.render(cahracterQueue)
        // }
    }

    async characteSell() {
        // 是否询问
        if (this.$answerSell) {
            const result = await util.message.confirm({
                message: "确定要出售吗?",
                selectBoxMessage: "不再询问",
                selectBoxCallback: (b: boolean) => { this.$answerSell = !b }
            })
            // 是否确定
            if (result === false) return
        }
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId,
            id: this.$state.create.id
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/characteSell", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    var map = data.data;
                    let dto = map['dto'];
                    let user = map['user'];
                    let gold = map['gold'];
                    config.userData.characters = dto.characters
                    config.userData.gold = user.gold
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                    AudioMgr.inst.playOneShot("sound/other/getCoin");
                    await util.message.prompt({ message: "获得金币：" + gold })
                } else {
                    AudioMgr.inst.playOneShot("sound/other/tantdoor");
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );

    }
}

