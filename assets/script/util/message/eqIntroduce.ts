import { Prefab, find , Node} from "cc";
import { getNodePool } from "../resource/getNodePool";
import { ContentOption } from "../../prefab/HolConfirmMessage";
import { HolIntroduceEqMessage, HolIntroduceOption } from "../../prefab/HolIntroduceEqMessage";
import { load } from "../bundle/load";

export async function preloadEqIntroduce() {
    const nodePool = getNodePool(await load("prefab/HolIntroduceEqMessage" , Prefab))
        const node = nodePool.get()
        nodePool.put(node)
}

// 弹出消息 返回一个Promise 确认的话返回 true 否则返回 false
export async function eqIntroduce(co: HolIntroduceOption , parent: Node = find("Canvas")): Promise<boolean> {
    const nodePool = getNodePool(await load("prefab/HolIntroduceEqMessage" , Prefab))
    const node = nodePool.get()
    parent.addChild(node)
    const holConfirmMessage = node.getComponent(HolIntroduceEqMessage)
    return new Promise(res => {
        holConfirmMessage.setContent(co)
        holConfirmMessage.listen("close" , () => nodePool.put(node))
    })
}