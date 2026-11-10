import { _decorator, Component, instantiate, Label, Layout, Node, Prefab, resources, UITransform, v3, tween, NodeEventType } from 'cc';
const { ccclass, property, menu } = _decorator;

@ccclass('menuView')
export class menuView extends Component {

    @property({ type: Prefab, tooltip: "选项行预制体（menuItem：selectBtn(Button)→numlabel(Label)）；留空则从 resources/prefab/menuItem 加载" })
    itemPrefab: Prefab = null;

    @property({ tooltip: "下拉选项文案；留空则用代码里的默认列表" })
    itemArray: string[] = [];

    @property({ tooltip: "默认选中显示（未选择时按钮上的文字）" })
    defaultLabel: string = '全部';

    // 下拉筛选回调（场景 Button.clickEvents 或代码赋值均可）
    onSelect: (text: string) => void = null;

    /** 默认选项：英雄星级（含“全部”用于复位）；外部传入的列表优先于它 */
    static readonly STAR_ITEMS = ['全部', '5星', '4.5星', '4星', '3.5星', '3星', '2.5星', '2星', '1.5星', '1星'];

    private selectBtn: Node = null;
    private btnLabel: Label = null;
    private scrollView: Node = null;
    private content: Node = null;
    private triangle: Node = null;

    // 是否已经下拉
    private isDropDown: boolean = false;

    // 当前生效的选项列表与已加载的行预制体（供 setItems 重建用）
    private $items: string[] = null;
    private $rowPrefab: Prefab = null;
    // 是否已由外部通过 setItems 指定过列表
    private $externalSet: boolean = false;

    onLoad() {
        this.selectBtn = this.node.getChildByName("selectBtn");
        this.btnLabel = this.selectBtn.getChildByName("btnLabel").getComponent(Label);
        if (this.defaultLabel) this.btnLabel.string = this.defaultLabel;

        this.scrollView = this.node.getChildByName("ScrollView");
        this.content = this.scrollView.getChildByName("view").getChildByName("content");
        // content 无 Layout 时补一个纵向布局，保证选项行依次排开且容器高度自动撑开
        let layout = this.content.getComponent(Layout);
        if (!layout) layout = this.content.addComponent(Layout);
        layout.type = Layout.Type.VERTICAL;
        layout.resizeMode = Layout.ResizeMode.CONTAINER;
        layout.spacingY = 6;
        this.scrollView.active = false;

        this.triangle = this.selectBtn.getChildByName("triangle");
        this.triangle.angle = 90;

        // 只给 selectBtn 本身注册展开/收起点击
        this.selectBtn.on(Node.EventType.TOUCH_END, this.comboboxClicked, this);

        this.init();
    }

    private init() {
        // 外部已 setItems 时以其为准，否则回退 itemArray → STAR_ITEMS
        if (!this.$externalSet) {
            this.$items = this.itemArray && this.itemArray.length > 0 ? this.itemArray : menuView.STAR_ITEMS;
        }
        // 预制体优先用编辑器赋值；未赋值时从 resources 加载（路径与旧版代码一致）
        if (this.itemPrefab) {
            this.$rowPrefab = this.itemPrefab;
            this.buildItems(this.$items, this.itemPrefab);
        } else {
            resources.load('prefab/menuItem', Prefab, (err, prefab) => {
                if (err || !prefab) { console.error("menuItem 预制体加载失败", err); return; }
                this.$rowPrefab = prefab;
                this.buildItems(this.$items, prefab);
            });
        }
    }

    /**
     * 由外部传入下拉选项列表（不一定是星级，任意文案均可），并立即重建选项行。
     * 优先级：此接口 > 编辑器 itemArray > 内置 STAR_ITEMS。
     * 建议在自身 onLoad 之前调用（如父界面 start 里接线时），若行预制体尚未加载完成会自动排队，加载后一并重建。
     */
    setItems(items: string[]) {
        if (!items || items.length === 0) return;
        this.$items = items;
        this.$externalSet = true;
        // 重建时先收起下拉，避免选项列表在展开状态下突变
        if (this.isDropDown) this.comboboxClicked();
        if (this.$rowPrefab) this.buildItems(this.$items, this.$rowPrefab);
        // 预制体还在异步加载中时不处理：init 的加载回调会用最新的 $items 建选项
    }

    /**
     * 外部复位按钮显示文字（不触发选择回调），常用于列表重新打开时把下拉恢复为“全部”。
     */
    showText(text: string) {
        if (this.btnLabel) this.btnLabel.string = text;
        if (this.isDropDown) this.comboboxClicked();
    }

    private buildItems(items: string[], prefab: Prefab) {
        // 重建前回收旧选项行
        this.content.removeAllChildren();
        // content 锚点在顶部(0.5,1)，首行从容器顶部往下排
        this.content.getComponent(UITransform).setAnchorPoint(0.5, 1);
        for (let i = 0; i < items.length; i++) {
            const row = instantiate(prefab);
            row.parent = this.content;

            // 预制体结构：menuItem → selectBtn(Button) → numlabel(Label)
            const btn = row.getChildByName("selectBtn");
            const lab = btn.getChildByName("numlabel").getComponent(Label);
            lab.string = items[i];

            // cc 3.x 的 on 第四参是 useCapture 而非自定义数据，用闭包捕获选项文本
            const text = items[i];
            btn.on(NodeEventType.TOUCH_END, () => this.itemClicked(text), this);
        }
    }

    private itemClicked(text: string) {
        if (text == null) return;
        this.btnLabel.string = text;
        // 选定后收起下拉
        if (this.isDropDown) this.comboboxClicked();
        // 通知外部执行筛选：回调优先，同时在自身节点派发事件，供场景脚本 event 监听（不依赖编辑器 ClickEvent 接线）
        this.onSelect && this.onSelect(text);
        this.node.emit('menu-selected', text);
    }

    comboboxClicked() {
        // 先翻转状态，再按新状态播放动画，避免三角与展开状态不同步
        this.isDropDown = !this.isDropDown;
        this.rotateTriangle();
        this.showHideDropDownBox(this.isDropDown);
    }

    //下拉菜单动画
    downAni(target: Node, isShow: boolean) {
        const cur = target.position;
        if (isShow) {
            target.active = true;
            tween(target).to(0.2, { position: v3(cur.x, cur.y - 8) })
                .to(0.2, { position: v3(cur.x, cur.y) })
                .start();
        } else {
            tween(target).to(0.2, { position: v3(cur.x, cur.y + 8) })
                .to(0.2, { position: v3(cur.x, cur.y) })
                .call(() => {
                    target.active = false;
                })
                .start();
        }
    }

    rotateTriangle() {
        // 旋转小三角形(正值为逆时针，负值为顺时针)
        if (this.isDropDown) {
            tween(this.triangle).to(0.2, { angle: 180 }).start();
        } else {
            tween(this.triangle).to(0.2, { angle: 90 }).start();
        }
    }

    showHideDropDownBox(isShow: boolean) {
        // 下拉框显示与隐藏
        this.isDropDown = isShow;
        this.downAni(this.scrollView, isShow);
    }

    onDestroy() {
        // 摘掉自身注册的监听，防止场景切换后回调悬挂
        if (this.selectBtn && this.selectBtn.isValid) {
            this.selectBtn.off(Node.EventType.TOUCH_END, this.comboboxClicked, this);
        }
        if (this.content && this.content.isValid) {
            this.content.removeAllChildren();
        }
    }
}
