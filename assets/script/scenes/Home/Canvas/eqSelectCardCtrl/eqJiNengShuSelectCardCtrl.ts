import { _decorator, Component, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

/**
 * 技能书选择面板：由 EqLianHuaCtrl 的 congCard 打开。
 * 用预制体 fankuai3 渲染背包中的技能书（低/中/高/英雄），
 * 每个 fankuai3 含：name(名字) / stackCount(数量) / id(技能书itemId) / Button(选择) / yxjm_df_txk>Sprite(图片) / dec(描述)。
 * 点击“选择”回调 onPick(bookItemId) 并关闭面板。
 */
@ccclass('eqJiNengShuSelectCardCtrl')
export class eqJiNengShuSelectCardCtrl extends Component {
    @property({ type: Node, tooltip: "技能书容器" }) ContentNode: Node = null;
    initialized = false;

    start() {

    }

    update(deltaTime: number) {

    }

    /**
     * @param books  后端 eqSkillBookList 返回的技能书列表
     * @param onPick 选中某本技能书后的回调，参数为整本技能书对象（含 bookItemId/icon/stackCount）
     */
    public async render(books: any[], onPick: (book: any) => void) {
        this.node.active = true
        const nodePool = util.resource.getNodePool(
            await util.bundle.load("prefab/fankuai3", Prefab)
        )
        // 回收旧的 item
        const childrens = [...this.ContentNode.children]
        for (let i = 0; i < childrens.length; i++) {
            const node = childrens[i];
            const btn = node.getChildByName("Button")
            if (btn) btn.off('click')
            nodePool.put(node)
        }

        if (!books || books.length === 0) {
            await util.message.prompt({ message: "背包里没有可用的技能书" })
            return
        }

        for (let i = 0; i < books.length; i++) {
            const book = books[i];
            const item = nodePool.get()

            const nameLab = item.getChildByName("name")
            if (nameLab) nameLab.getComponent(Label).string = book.name || ""

            const decLab = item.getChildByName("dec")
            if (decLab) decLab.getComponent(Label).string = book.description || ""

            const idLab = item.getChildByName("id")
            if (idLab) idLab.getComponent(Label).string = book.bookItemId + ""

            const stackLab = item.getChildByName("stackCount")
            if (stackLab) stackLab.getComponent(Label).string = "x" + (book.stackCount != null ? book.stackCount : 0)

            // 技能书图片：yxjm_df_txk 下的 Sprite（与 ShopCtrl 的材料图标同一渲染口径）
            const iconParent = item.getChildByName("yxjm_df_txk")
            if (iconParent) {
                const sprNode = iconParent.getChildByName("Sprite") || iconParent.children[0]
                if (sprNode) {
                    const sprite = sprNode.getComponent(Sprite)
                    if (sprite) {
                        if (book.icon) {
                            sprite.spriteFrame = await util.bundle.load(book.icon, SpriteFrame)
                        } else {
                            sprite.spriteFrame = null
                        }
                    }
                }
            }

            // 选择按钮
            const btn = item.getChildByName("Button")
            if (btn) {
                btn.off('click')
                btn.on('click', () => {
                    AudioMgr.inst.playOneShot("sound/other/click");
                    this.node.active = false
                    if (onPick) onPick(book)
                }, this)
            }

            this.ContentNode.addChild(item)
        }
    }

    public back() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }
}
