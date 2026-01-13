import { _decorator, AudioSource, Component, find, Label, Node, sp, Sprite } from 'cc';
import { CharacterState, CharacterStateCreate } from '../../../../game/fight/character/CharacterState';
import { util } from '../../../../util/util';
import { getConfig, getToken, updateConfig } from '../../../../common/config/config';
import { HolUserResource } from '../../../../prefab/HolUserResource';
import { CharacterEnum } from '../../../../game/fight/character/CharacterEnum';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
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

    // 角色状态
    private $state: CharacterState

    // 是否询问升级
    private $answerLevelUp: boolean = true
    // 是否询问升级
    private $answerSell: boolean = true



    // 渲染属性
    async renderProperty(create: CharacterStateCreate) {
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
        // 是否满级
        if (create.lv >= 100) {
            this.node.getChildByName("LevelUp").active = false
        } else {
            this.node.getChildByName("LevelUp").active = true
            // 升级所需资源
            this.node.getChildByName("LevelUp")
                .getChildByName("LevelUpGold")
                .getChildByName("Value")
                .getComponent(Label).string = util.sundry.formateNumber(levelUpNeedGold(create))
            this.node.getChildByName("LevelUp")
                .getChildByName("LevelUpSoul")
                .getChildByName("Value")
                .getComponent(Label).string = util.sundry.formateNumber(levelUpNeedSoule(create))
        }
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
            userId:config.userData.userId
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

