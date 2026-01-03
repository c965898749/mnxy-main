import { _decorator, Component, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { getConfig } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

@ccclass('ArenaRankingCrtl')
export class ArenaRankingCrtl extends Component {
    @property({ type: Node, tooltip: "任务列表" }) ContentNode: Node = null;
    @property(Node)
    ff3: Node
    start() {

    }

    update(deltaTime: number) {

    }
    async render(userlist, arenaScore) {
        const config = getConfig()
        this.node.active = true
        const nodePool = util.resource.getNodePool(
            await util.bundle.load("prefab/ff3", Prefab)
        )
        const childrens = [...this.ContentNode.children]
        for (let i = 0; i < childrens.length; i++) {
            const node = childrens[i];
            nodePool.put(node)
        }
        this.ff3.getChildByName("Label").getComponent(Label).string = "lv " + config.userData.lv
        this.ff3.getChildByName("yxjm_df_txk").getChildByName("header").getComponent(Sprite).spriteFrame =
            await util.bundle.load(config.userData.gameImg, SpriteFrame)
        this.ff3.getChildByName("name").getComponent(Label).string = config.userData.nickname
        const index = userlist.findIndex((item) => item.userId === config.userData.userId)
        this.ff3.getChildByName("jingdu").getComponent(Label).string = "积分：" + arenaScore
        if (index === -1) {
            this.ff3.getChildByName("ranking").getChildByName("num").getComponent(Label).string = "暂未上榜"
        } else {
            this.ff3.getChildByName("ranking").getChildByName("num").getComponent(Label).string =
                (index + 1).toString()
        }
        for (let i = 0; i < userlist.length; i++) {
            let item = nodePool.get()
            item.getChildByName("jieName").getComponent(Label).string = "积分：" + userlist[i].arenaScore
            item.getChildByName("name").getComponent(Label).string = userlist[i].nickname
            item.getChildByName("Lv").getComponent(Label).string = "lv " + userlist[i].lv
            item.getChildByName("ranking").getChildByName("num").getComponent(Label).string = userlist[i].gameRanking
            item.getChildByName("yxjm_df_txk").getChildByName("header").getComponent(Sprite).spriteFrame =
                await util.bundle.load(userlist[i].gameImg, SpriteFrame)
            this.ContentNode.addChild(item)
            continue
        }
    }
    backPk() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }
}


