import { _decorator, Button, Component, EventTouch, Label, Node, Sprite, SpriteFrame, tween, UIOpacity, v3, Vec3 } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { CharacterEnum } from 'db://assets/script/game/fight/character/CharacterEnum';
import { util } from 'db://assets/script/util/util';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
// import { HeroCharacterDetail } from '../../../Hero/Canvas/HeroCharacterDetail';
import { ItemCtrl } from "./ItemCtrl";
import { CharacterState, CharacterStateCreate } from 'db://assets/script/game/fight/character/CharacterState';
const { ccclass, property } = _decorator;

@ccclass('TiemCtrl')
export class TiemCtrl extends Component {

    @property(Node)
    Item: Node
    initialized = false;
    @property(Node)
    Zhanli: Node
    arr = []
    //移动速度
    moveSpeed = 0.15
    //排序x间距
    spacingY = 10

    nodePool: Node[] = []

    tempId = 0
    touchId = null
    lastTouchId = null

    power: number = 0;
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


    async refresh() {
        this.arr = []
        //移动速度
        this.moveSpeed = 0.15
        //排序x间距
        this.spacingY = 10

        this.nodePool = []

        this.tempId = 0
        this.touchId = null
        this.lastTouchId = null
        // 你的刷新逻辑
        const config = getConfig()
        const create = config.userData.characters.filter(x => x.goIntoNum != 0)
        this.Item.children.forEach(n => n.getChildByName("tiemHeader").children[0].getComponent(Sprite).spriteFrame = null)
        //初始化战力
        this.power = 0
        for (let i = 0; i < create.length; i++) {
            const meta = CharacterEnum[create[i].id]
            var goIntoNum = create[i].goIntoNum
            this.Item.children[goIntoNum - 1].getChildByName("tiemHeader").children[0].getComponent(Sprite).spriteFrame =
                await util.bundle.load(`game/texture/frames/hero/Header/${create[i].id}/spriteFrame`, SpriteFrame)
            // 渲染星级
            this.Item.children[goIntoNum - 1].children[4].active = true
            this.Item.children[goIntoNum - 1].children[3].active = true
            this.Item.children[goIntoNum - 1].children[2].active = true
            this.Item.children[goIntoNum - 1].children[4].children.forEach(n => n.active = false)
            for (let j = 0; j < create[i].star; j++) {
                this.Item.children[goIntoNum - 1].children[4].children[j].active = true
                if (j + 0.5 < create[i].star) {
                    this.Item.children[goIntoNum - 1].children[4].children[j].children[0].active = true
                }
            }
            this.Item.children[goIntoNum - 1].children[2].getComponent(Label).string = create[i].name + "  Lv" + create[i].lv + "/" + create[i].maxLv
            // 仙、佛、圣、魔、妖、兽
            const cmp = new Map([
                ['sacred', '仙界'],
                ['nature', '佛界'],
                ['machine', '圣界'],
                ['abyss', '魔界'],
                ['dark', '妖界'],
                ['ordinary', '兽界'],
            ]);
            this.power = this.power + parseInt(this.getZhanli(create[i]).toString())
            const position = ["仙灵", "神将", "武圣"]
            this.Item.children[goIntoNum - 1].children[3].getComponent(Label).string = cmp.get(create[i].camp) + "." + create[i].profession
            // // 绑定事件
            // this.Item.children[goIntoNum - 1].on("click", () => { this.clickFun(create[i]) })
            continue
        }
        this.Zhanli.getComponent(Label).string = this.power + ""
        this.Item.children.forEach(element => {

            let node: Node = element
            // node.opacity = 0;
            // node.scale = 1
            console.log(this.tempId, 33333)
            let pos = v3(0, 0)
            if (this.tempId == 0) {
                pos = v3(-40, 310)
            } else if (this.tempId == 1) {
                pos = v3(0, 155)
            } else if (this.tempId == 2) {
                pos = v3(50, 0)
            } else if (this.tempId == 3) {
                pos = v3(0, -155)
            } else if (this.tempId == 4) {
                pos = v3(-40, -310)
            }
            // let pos = this.getItemPos(this.tempId, this.tempId + 1)
            console.log(pos)
            let id = this.tempId
            var aa = create.filter(x => x.goIntoNum - 1 == id)
            let data = {
                name: id,
                id: id,
                index: id,
                node: node,
                originPos: pos,
                checkPos: pos,
                create: aa && aa.length > 0 ? aa[0] : null
            }
            this.arr.push(data);
            node.getComponent(ItemCtrl).initData(data, this)
            this.tempId++
        });
    }
    public getZhanli(create: CharacterStateCreate) {
        // let zhanli = propts[PART_PROPTS.GongJi] * 25 + propts[PART_PROPTS.FangYu] * 25 + propts[PART_PROPTS.XueLiang] + propts[PART_PROPTS.BaoJi] * 2 + 500 * propts[PART_PROPTS.ShanBi] + 300 * (propts[PART_PROPTS.HuoGong] + propts[PART_PROPTS.HuoKang] + propts[PART_PROPTS.BingGong] + propts[PART_PROPTS.BingKang])
        let zhanli = create.attack * 25 + create.defence?create.defence * 25:0 + create.maxHp + 300 * create.speed
        return zhanli;
    }

    update(deltaTime: number) {

    }

    async itemUpdate() {
        var item = this.arr.sort(this.sortDataf)
        var str = [];
        for (var i = 0; i < item.length; i++) {
            item[i].node.getChildByName("1").getComponent(Sprite).spriteFrame =
                await util.bundle.load(`image/number/${i + 1}/spriteFrame`, SpriteFrame)
            if (item[i].create) {
                str.push(item[i].create.id)
            } else {
                str.push("@")
            }
        }
        //更新战队
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            str: str.join(','),
            userId: config.userData.userId
        };
        console.log(item, 555)
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "/itemUpdate", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                console.log(data); // 处理响应数据
                if (data.success == '1') {
                    var userInfo = data.data;
                    config.userData.characters = userInfo.characterList
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );
    }


    getItemPos(i, totalCount) {
        let startY = -(totalCount - 1) * (145 + this.spacingY) / 2
        let startX = -40
        if (i == 0 || i == 4) {
            startX = -40
        } else if (i == 1 || i == 3) {
            startX = 0
        } else {
            startX = 50
        }
        let pos = v3(0, 0)
        pos.y = startY + (145 + this.spacingY) * i
        pos.x = startX
        return pos
    }

    upDateIndexByX(isEnd = false) {
        this.arr.sort(this.sortData)
        let count = this.arr.length;
        for (let i = 0; i < count; i++) {
            let data = this.arr[i]
            if (!isEnd && data.index == i) continue;
            data.index = i
            let pos = this.getItemPos(i, count)
            data.originPos = pos
            if (data.node.getComponent(ItemCtrl).isTouch) {
                continue;
            }
            data.checkPos = pos
            tween(data.node)
                .to(this.moveSpeed, { position: pos })
                .start()
        }
    }
    //获取按照x轴大小
    sortData(a, b) {
        return a.checkPos.y - b.checkPos.y
    }

    sortDataf(a, b) {
        return b.checkPos.y - a.checkPos.y
    }


    // 返回

}


