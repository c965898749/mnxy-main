import { _decorator, Component, Label, Node, tween, Vec3 } from 'cc';
import { getConfig } from '../common/config/config';
const { ccclass, property } = _decorator;

@ccclass('HolPreLoad')
export class HolPreLoad extends Component {

    @property(Node)
    public ValueNode: Node

    @property(Node)
    public TipNode: Node

    private $tips: string[] = ["提示\n我是一个小提示"]

    private $current: number = 0
    private $process: number = 0

    private $completeQueue: Function[] = []

    setProcess(num: number) {
        this.$process = num
    }

    setTips(tips: string[]) {
        this.$tips = tips
    }

    listenComplete(com: Function) {
        this.$completeQueue.push(com)
        //注入场景方法
    }

    private $currentIndex: number = 0
    private $accumulateTime: number = 0
    protected update(dt: number): void {
        if (this.$current >= 100) {
            //执行场景方法
            this.$completeQueue.forEach(c => c())
            this.node.active = false
            // 弹窗弹跳入场效果
            if (!this.checkIfTimeIsToday()) {
                this.node.parent.getChildByName("SignInCtrl").active = true
                this.node.parent.getChildByName("SignInCtrl").scale = new Vec3(0, 0, 0)
                tween(this.node.parent.getChildByName("SignInCtrl"))
                    .to(1, { scale: new Vec3(1, 1, 1) }, { easing: 'elasticOut' })
                    .start();
            }
            return
        }
        if (this.$current < this.$process) {
            this.$current += dt * 45
            this.ValueNode.setScale(this.$current / 100, 1, 1)
        }
        this.$accumulateTime -= dt
        if (this.$accumulateTime <= 0) {
            this.TipNode.getComponent(Label).string =
                this.$tips[this.$currentIndex]
            this.$currentIndex++
            this.$accumulateTime = 4
            if (this.$currentIndex >= this.$tips.length) this.$currentIndex = 0
        }
    }
    public checkIfTimeIsToday() {
        const config = getConfig()
        const cachedTime = localStorage.getItem('cachedTime' + config.userData.userId);
        if (!cachedTime) return false;

        const cachedDate = new Date(cachedTime);
        const today = new Date();
        console.log(cachedDate)
        console.log(today)
        return cachedDate.getFullYear() === today.getFullYear() &&
            cachedDate.getMonth() === today.getMonth() &&
            cachedDate.getDate() === today.getDate();
    }
}

