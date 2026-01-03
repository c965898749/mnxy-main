import { _decorator, Component, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

@ccclass('RankingCrtl')
export class RankingCrtl extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    @property(Node)
    myRangking: Node
    start() {

    }

    update(deltaTime: number) {

    }

    backPk() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("RankingCrtl").active = false
    }

    async render(userlist, myRangking) {
        // console.log(userlist)
        this.node.active = true
        const nodePool = util.resource.getNodePool(
            await util.bundle.load("prefab/ff", Prefab)
        )
        const childrens = [...this.ContentNode.children]
        for (let i = 0; i < childrens.length; i++) {
            const node = childrens[i];
            nodePool.put(node)
        }
        this.myRangking.getComponent(Label).string = myRangking
        for (let i = 0; i < userlist.length; i++) {
            let item = nodePool.get()
            item.getChildByName("tiaozhan").active = false
            item.getChildByName("textbox_bg").children[0].getComponent(Label).string = "lv " + userlist[i].lv
            // 绑定事件
            item.getChildByName("name").getComponent(Label).string = userlist[i].nickname
            item.getChildByName("Count").getComponent(Label).string = "胜 " + userlist[i].winCount
            item.getChildByName("ranking").getChildByName("num").getComponent(Label).string = userlist[i].gameRanking
            item.getChildByName("yxjm_df_txk").getChildByName("header").getComponent(Sprite).spriteFrame =
                await util.bundle.load(userlist[i].gameImg, SpriteFrame)
            this.ContentNode.addChild(item)
            continue
        }
    }
}


