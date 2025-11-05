import { _decorator, Component, director, find, instantiate, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
import { FightMap } from '../../../Fight/Canvas/FightMap';
import { HomeCanvas } from '../../HomeCanvas';
const { ccclass, property } = _decorator;

@ccclass('JinjichangCtrl')
export class JinjichangCtrl extends Component {
    @property(Node)
    WinCount: Node
    @property(Node)
    GameRanking: Node
    @property(Node)
    Kk: Node
    start() {
        this.refushData()
    }

    update(deltaTime: number) {

    }

    public refushData() {
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "jingji", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                //console.log(data); // 处理响应数据
                if (data.success == '1') {
                    var map = data.data;
                    let user = map['user'];
                    //console.log(user); //
                    this.WinCount.getComponent(Label).string = user.winCount
                    this.GameRanking.getComponent(Label).string = user.gameRanking
                    let parking = map['parking'];
                    for (let i = 0; i < this.Kk.children.length; i++) {
                        this.Kk.children[i].children[1].children[0].getComponent(Label).string = "lv " + parking[i].lv
                        // 绑定事件
                        this.Kk.children[i].children[2].on("click", () => { this.clickJiebanFun(parking[i].userId) })
                        this.Kk.children[i].children[3].on("click", () => { this.clickTiaozhanFun(parking[i].userId) })
                        this.Kk.children[i].children[4].getComponent(Label).string = parking[i].nickname
                        this.Kk.children[i].children[5].getComponent(Label).string = "胜 " + parking[i].winCount
                        this.Kk.children[i].getChildByName("yxjm_df_txk").getChildByName("header").getComponent(Sprite).spriteFrame =
                            await util.bundle.load(parking[i].gameImg, SpriteFrame)
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
    public clickJiebanFun(userId) {
        AudioMgr.inst.playOneShot("sound/other/click");
        console.log(userId)
    }

    public clickTiaozhanFun(userId) {
        AudioMgr.inst.playOneShot("sound/other/click");
        // director.addPersistRootNode(this.node);
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: userId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "battle", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                //console.log(data); // 处理响应数据
                if (data.success == '1') {
                    const holAnimationPrefab = await util.bundle.load("prefab/FightMap", Prefab)
                    const holAnimationNode = instantiate(holAnimationPrefab)
                    this.node.parent.addChild(holAnimationNode)
                    await holAnimationNode
                        .getComponent(FightMap)
                        .render(data.data.id,null,null)
                    find('Canvas').getComponent(HomeCanvas).audioSource.pause()
                    this.node.parent.getChildByName("FightMap").active = true
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );

    }
}


