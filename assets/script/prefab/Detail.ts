import { _decorator, Component, Event, find, Label, Node, NodeEventType } from 'cc';
const { ccclass, property } = _decorator;

export type ConnectOption = {
    // 内容
    message: string ,
    name: string ,
    localPos,
}

@ccclass('Detail')
export class Detail extends Component {

    @property(Node)
    ContentNode: Node
    @property(Node)
    NameNode: Node

    private $closeQueue: Function[] = []

    listen(e: "close" , fn: Function) {
        if (e === "close") this.$closeQueue.push(fn)
    }

    // 设置内容
    public setContent(option: ConnectOption) {
        this.ContentNode.getComponent(Label).string = option.message
        this.NameNode.getComponent(Label).string = option.name
        this.node.getChildByName("Introduce").active = true
    }
    
    // 关闭函数
    public closeNode() {
        for (const close of this.$closeQueue) close()
    }

}

