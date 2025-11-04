import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FloatAnimation')
export class FloatAnimation extends Component {
    // 浮动幅度（像素）
    @property
    floatRange: number = 20;

    // 浮动周期（秒）
    @property
    duration: number = 0.8;

    private originalY: number = 0;

    start() {
        this.originalY = this.node.position.y;
        this.startFloatAnimation();
    }

    startFloatAnimation() {
        // 向上浮动
        tween(this.node)
            .to(this.duration, { position: new Vec3(this.node.position.x, this.originalY + this.floatRange, this.node.position.z) }, { easing: 'sineInOut' })
            // 向下浮动
            .to(this.duration, { position: new Vec3(this.node.position.x, this.originalY, this.node.position.z) }, { easing: 'sineInOut' })
            // 循环执行
            .union()
            .repeatForever()
            .start();
    }
}


