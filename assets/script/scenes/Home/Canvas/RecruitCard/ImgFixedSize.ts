import { _decorator, Component, Node, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ImgFixedSize')
export class ImgFixedSize extends Component {
    start() {

    }

    update(deltaTime: number) {

    }
    @property({ type: cc.Integer, tooltip: "固定尺寸" })
    public set fixedSize(value) {
        this._fixedSize = value;
        this.onSizeChanged();
    }

    public get fixedSize() {
        return this._fixedSize;
    }

    @property({ type: cc.Integer, tooltip: "固定尺寸" })
    private _fixedSize: number = 1;

    onLoad() {
        this._fixedSize = this.fixedSize;
        this.node.on(cc.Node.EventType.SIZE_CHANGED, this.onSizeChanged, this);
        this.onSizeChanged();
    }

    /**当尺寸变化时，重置node节点大小 */
    onSizeChanged() {
        const uiTransform = this.node.getComponent(UITransform);
        const width = uiTransform.contentSize.width;
        const height = uiTransform.contentSize.height;
        var max = Math.max(width, height);
        this.node.setScale(this.fixedSize / max, this.fixedSize / max);
    }
}


