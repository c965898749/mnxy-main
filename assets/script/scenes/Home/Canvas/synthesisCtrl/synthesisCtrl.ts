import { _decorator, Button, Component, Label, Node, Prefab, sp, Sprite, SpriteFrame, tween, v3 } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { CharacterStateCreate } from 'db://assets/script/game/fight/character/CharacterState';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { SelectCardCtrl } from '../qianghua/SelectCardCtrl';
import { RecuitCardItem } from '../RecruitCard/RecuitCardItem';
const { ccclass, property } = _decorator;

@ccclass('synthesisCtrl')
export class synthesisCtrl extends Component {
    @property({ type: Node, tooltip: "招募单张抽卡" }) onceCard: Node = null;
    @property({ type: Button }) buttonOk: Button = null;
    @property(Node)
    hechen: Node
    @property(Node)
    tuPu: Node
    @property(Node)
    chouKa: Node
    @property(Node)
    noTupuhecheng: Node
    @property(Node)
    tupuhecheng: Node
    @property(Node)
    z1: Node
    z1Id = null
    @property(Node)
    z2: Node
    z2Id = null
    @property(Node)
    z3: Node
    z3Id = null
    @property(Node)
    z4: Node
    z4Id = null
    @property(Node)
    z5: Node
    z5Id = null
    @property(Node)
    Star: Node
    @property(Node)
    Gold1: Node
    @property(Node)
    Gold2: Node

    henc = false;
    public cahracterQueue: CharacterStateCreate[] = []
    start() {

    }

    update(deltaTime: number) {

    }

    async hechenBtn() {
        AudioMgr.inst.playOneShot("sound/other/click");
        if (this.z1Id == null || this.z2Id == null || this.z3Id == null || this.z4Id == null || this.z5Id == null) {
            return await util.message.prompt({ message: "请选择合成卡" })
        }
        const config = getConfig()
        const token = getToken()
        console.log(config.userData.userId, 555)
        const postData = {
            token: token,
            userId: config.userData.userId,
            str: this.z1Id + "," + this.z2Id + "," + this.z3Id + "," + this.z4Id + "," + this.z5Id
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/findHechenCard", options)
            .then(response => {

                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    let hut = this.hechen.getComponent(sp.Skeleton)
                    hut.node.active = true
                    AudioMgr.inst.playOneShot("sound/other/getcard");
                    hut.setAnimation(0, "animation", false)
                    tween(this.z1)
                        .to(0.5, { position: v3(0, 116.665) })
                        .start();
                    tween(this.z2)
                        .to(0.5, { position: v3(0, 116.665) })
                        .start();
                    tween(this.z3)
                        .to(0.5, { position: v3(0, 116.665) })
                        .start();
                    tween(this.z4)
                        .to(0.5, { position: v3(0, 116.665) })
                        .start();
                    tween(this.z5)
                        .to(0.5, { position: v3(0, 116.665) })
                        .start();
                    hut.setCompleteListener(() => {
                        hut.node.active = false;
                        this.z1.position = v3(3.955, -150.385)
                        this.z2.position = v3(-241.24, 5.932)
                        this.z3.position = v3(247.172, 7.91)
                        this.z4.position = v3(-213.557, 290.674)
                        this.z5.position = v3(191.805, 300.561)
                        this.z1Id = null
                        this.z1.getChildByName("Avatar").getComponent(Sprite).spriteFrame = null
                        this.z2Id = null
                        this.z2.getChildByName("Avatar").getComponent(Sprite).spriteFrame = null
                        this.z3Id = null
                        this.z3.getChildByName("Avatar").getComponent(Sprite).spriteFrame = null
                        this.z4Id = null
                        this.z4.getChildByName("Avatar").getComponent(Sprite).spriteFrame = null
                        this.z5Id = null
                        this.z5.getChildByName("Avatar").getComponent(Sprite).spriteFrame = null
                    })
                    var map = data.data;
                    let dto = map['dto'];
                    // let user = map['user'];
                    this.onceCard.active = true;
                    // AudioMgr.inst.playOneShot("sound/other/click");
                    if (this.onceCard.children.length > 0) {
                        let comp = this.onceCard.getChildByName("RecuitCardItem").getComponent(RecuitCardItem);
                        comp.init(dto.hero,() => {
                            this.buttonOk.node.active = true;
                        });
                        config.userData.characters = dto.characters
                        // config.userData.soul = user.soul
                        localStorage.setItem("UserConfigData", JSON.stringify(config))
                    } else {
                        const nodePool = util.resource.getNodePool(
                            await util.bundle.load("/prefab/RecuitCardItem", Prefab)
                        )
                        const node = nodePool.get()
                        const characterAvatar = node.getComponent(RecuitCardItem)
                        this.onceCard.addChild(node)
                        // AudioMgr.inst.playOneShot("sound/other/getcard");
                        characterAvatar.init(dto.hero, () => {
                            this.buttonOk.node.active = true;
                        });
                        config.userData.characters = dto.characters
                        // config.userData.soul = user.soul
                        localStorage.setItem("UserConfigData", JSON.stringify(config))
                    }

                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );
    }
    hechenBtn2() {
        AudioMgr.inst.playOneShot("sound/other/click");
        let hut = this.hechen.getComponent(sp.Skeleton)
        hut.node.active = true
        AudioMgr.inst.playOneShot("sound/other/getcard");
        hut.setAnimation(0, "animation", false)
        hut.setCompleteListener(() => hut.node.active = false)
    }

    isOk() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.onceCard.removeAllChildren();
        this.buttonOk.node.active = false;
        this.onceCard.active = false;
    }

    async tuPuBtn() {
        AudioMgr.inst.playOneShot("sound/other/click");
        if (this.henc) {
            this.tuPu.getComponent(Sprite).spriteFrame = await util.bundle.load('image/synthesis/h1/spriteFrame', SpriteFrame)
            this.chouKa.getComponent(Sprite).spriteFrame = await util.bundle.load('image/synthesis/synthesis/spriteFrame', SpriteFrame)
            this.noTupuhecheng.active = true;
            this.tupuhecheng.active = false
        } else {
            this.tuPu.getComponent(Sprite).spriteFrame = await util.bundle.load('image/synthesis/h2/spriteFrame', SpriteFrame)
            this.chouKa.getComponent(Sprite).spriteFrame = await util.bundle.load('image/synthesis/synthesis2/spriteFrame', SpriteFrame)
            this.noTupuhecheng.active = false;
            this.tupuhecheng.active = true
        }
        this.henc = !this.henc
    }
    goback() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false;
        this.node.parent.getChildByName("CardCrtl").active = true
    }

    public async zhuSelectCard(event: Event, customEventData: string) {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        this.cahracterQueue = []
        this.cahracterQueue = config.userData.characters
        if (this.z1Id) {
            this.cahracterQueue = this.cahracterQueue.filter(x => this.z1Id != x.id)
        }
        if (this.z2Id) {
            this.cahracterQueue = this.cahracterQueue.filter(x => this.z2Id != x.id)
        }
        if (this.z3Id) {
            this.cahracterQueue = this.cahracterQueue.filter(x => this.z3Id != x.id)
        }
        if (this.z4Id) {
            this.cahracterQueue = this.cahracterQueue.filter(x => this.z4Id != x.id)
        }
        if (this.z5Id) {
            this.cahracterQueue = this.cahracterQueue.filter(x => this.z5Id != x.id)
        }
        await this.render(this.cahracterQueue, customEventData)
    }

    async render(characterQueue: CharacterStateCreate[], z: string) {
        await this.node.parent.getChildByName("SelectCardCtrl")
            .getComponent(SelectCardCtrl)
            .render(characterQueue, async (c, n) => {
                n.active = false
                this.clickFun(c, z)
                return
            })
    }

    async clickFun(create, z) {
        var id = create.id
        AudioMgr.inst.playOneShot("sound/other/click");
        if ("z1" == z) {
            this.z1Id = id
            this.z1.getChildByName("Avatar").getComponent(Sprite).spriteFrame =
                await util.bundle.load(`game/texture/frames/hero/Header/${create.id}/spriteFrame`, SpriteFrame)
            console.log(11)
        } else if ("z2" == z) {
            this.z2Id = id
            this.z2.getChildByName("Avatar").getComponent(Sprite).spriteFrame =
                await util.bundle.load('game/texture/frames/hero/Header/' + create.id + '/spriteFrame', SpriteFrame)
        } else if ("z3" == z) {
            this.z3Id = id
            this.z3.getChildByName("Avatar").getComponent(Sprite).spriteFrame =
                await util.bundle.load('game/texture/frames/hero/Header/' + create.id + '/spriteFrame', SpriteFrame)
        } else if ("z4" == z) {
            this.z4Id = id
            this.z4.getChildByName("Avatar").getComponent(Sprite).spriteFrame =
                await util.bundle.load('game/texture/frames/hero/Header/' + create.id + '/spriteFrame', SpriteFrame)
        } else if ("z5" == z) {
            this.z5Id = id
            this.z5.getChildByName("Avatar").getComponent(Sprite).spriteFrame =
                await util.bundle.load('game/texture/frames/hero/Header/' + create.id + '/spriteFrame', SpriteFrame)
        }
        if (this.z1Id != null && this.z2Id != null && this.z3Id != null && this.z4Id != null && this.z5Id != null) {
            const config = getConfig()
            const token = getToken()
            console.log(config.userData.userId, 555)
            const postData = {
                token: token,
                userId: config.userData.userId,
                str: this.z1Id + "," + this.z2Id + "," + this.z3Id + "," + this.z4Id + "," + this.z5Id
            };
            const options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData),
            };
            fetch(config.ServerUrl.url + "/checkHechen", options)
                .then(response => {

                    return response.json(); // 解析 JSON 响应
                })
                .then(async data => {
                    if (data.success == '1') {
                        var data = data.data;
                        this.Star.getComponent(Label).string = data
                        // 将字符串转换为数字
                        const num = parseFloat(data);
                        const multiple = (num - 1) / 0.5 + 1;
                        this.Gold1.getComponent(Label).string = multiple * 50000 + ""
                    } else {
                        this.Star.getComponent(Label).string = "0"
                        this.Gold1.getComponent(Label).string = "0"
                    }
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                }
                );
        }

    }
    canleBtn() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.z1Id = null
        this.z1.getChildByName("Avatar").getComponent(Sprite).spriteFrame = null
        this.z2Id = null
        this.z2.getChildByName("Avatar").getComponent(Sprite).spriteFrame = null
        this.z3Id = null
        this.z3.getChildByName("Avatar").getComponent(Sprite).spriteFrame = null
        this.z4Id = null
        this.z4.getChildByName("Avatar").getComponent(Sprite).spriteFrame = null
        this.z5Id = null
        this.z5.getChildByName("Avatar").getComponent(Sprite).spriteFrame = null
    }

}


