import { _decorator, AudioSource, Component, instantiate, Label, Node, Prefab, sp, Sprite, SpriteFrame } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { EquipmentStateCreate } from 'db://assets/script/game/fight/equipment/EquipmentState';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { eqSelectCardCtrl3 } from '../eqSelectCardCtrl/eqSelectCardCtrl3';
import { util } from 'db://assets/script/util/util';
import { Rewards } from '../../rewards/Rewards';

const { ccclass, property } = _decorator;

@ccclass('EqFengjieCtrl')
export class EqFengjieCtrl extends Component {
    @property(Node)
    congCard
    public myMap = new Map<string, number>(); // 键为字符串，值为数字
    public cahracterQueue2: EquipmentStateCreate[] = []
    start() {

    }

    update(deltaTime: number) {

    }

    public async zhuSelectCard2() {
        AudioMgr.inst.playOneShot("sound/other/click");

        const config = getConfig()
        this.cahracterQueue2 = []
        this.cahracterQueue2 = config.userData.equipments.filter(e => e.isSuo != 1)
        ////console.log(this.cahracterQueue2)
        await this.render2(this.cahracterQueue2)
    }

    async render2(characterQueue: EquipmentStateCreate[]) {
        await this.node.parent.getChildByName("eqSelectCardCtrl3")
            .getComponent(eqSelectCardCtrl3)
            .render(characterQueue, this, this.myMap)
    }

    async initData(map: Map<string, number>) {
        console.log(map, 55555)
        this.myMap = map
        if (this.myMap.size > 0) {
            let total = 0;
            this.myMap.forEach((value) => {
                total += value;
            });
            this.congCard.getChildByName("main_bg").getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/qianghua/congCard/spriteFrame`, SpriteFrame)
            this.congCard.getChildByName("num").getComponent(Label).string = total + ""

        } else {
            this.congCard.getChildByName("main_bg").getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/qianghua/congCard2/spriteFrame`, SpriteFrame)
            this.congCard.getChildByName("num").getComponent(Label).string = null

        }
    }

    async calce() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.congCard.getChildByName("main_bg").getComponent(Sprite).spriteFrame =
            await util.bundle.load(`image/qianghua/congCard2/spriteFrame`, SpriteFrame)
        this.congCard.getChildByName("num").getComponent(Label).string = null
        this.myMap.clear();
    }

    async qianghua() {
        if (!this.myMap || this.myMap.size == 0) {
            return await util.message.prompt({ message: "请选择分解装备" })
        }
        const config = getConfig()
        const token = getToken()
        var equipments = config.userData.equipments;
        let cahracter4 = [];
        this.myMap.forEach((value, key) => {
            cahracter4 = equipments.filter(x => key == x.uuid + "" && x.star >= 4);
        })
        // 
        // 是否询问
        if (cahracter4.length > 0) {
            const result = await util.message.confirm({
                message: "确定使用4星以上分解装备吗?"
            })
            // 是否确定
            if (result === false) return
        }
        const postData = {
            token: token,
            userId: config.userData.userId,
            myMap: Array.from(this.myMap), // 转二维数组：[["a",1], ["b",2]]
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "fenjie", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    var map = data.data;
                    var user = map['user'];
                    config.userData.equipments = user.eqCharactersList
                    const reward = map["rewards"];
                    config.userData.gold = user.gold
                    config.userData.bronze = user.bronze
                    config.userData.darkSteel = user.darkSteel
                    config.userData.purpleGold = user.purpleGold
                    config.userData.crystal = user.crystal
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                    this.myMap.clear();
                    AudioMgr.inst.playOneShot("sound/other/click");
                    let selectSkeleton = this.node.getChildByName("donghua").getComponent(sp.Skeleton)
                    selectSkeleton.node.active = true
                    selectSkeleton.setAnimation(0, "animation", false)
                    AudioMgr.inst.playOneShot("sound/other/getcard");
                    this.congCard.getChildByName("main_bg").getComponent(Sprite).spriteFrame =
                        await util.bundle.load(`image/qianghua/congCard2/spriteFrame`, SpriteFrame)
                    this.congCard.getChildByName("num").getComponent(Label).string = null
                    selectSkeleton.setCompleteListener(() => {
                        selectSkeleton.node.active = false
                    })
                    const rewardsFab = await util.bundle.load("prefab/rewards", Prefab)
                    const rewards = instantiate(rewardsFab)
                    this.node.parent.addChild(rewards)
                    await rewards
                        .getComponent(Rewards)
                        .read(reward)
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                //console.error('There was a problem with the fetch operation:', error);
            }
            );
    }
    async goBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }

}


