import { Prefab, find , Node} from "cc";
import { getNodePool } from "../resource/getNodePool";
import { Detail, ConnectOption } from "../../prefab/Detail";
import { load } from "../bundle/load";

export async function preloadDetail() {
    const nodePool = getNodePool(await load("prefab/detail" , Prefab))
        const node = nodePool.get()
        nodePool.put(node)
}

// 弹出消息 返回一个Promise 确认的话返回 true 否则返回 false
export async function setDetail(co: ConnectOption , parent: Node = find("Canvas")): Promise<boolean> {
    const nodePool = getNodePool(await load("prefab/detail" , Prefab))
    const node = nodePool.get()
    parent.addChild(node)
    const detail = node.getComponent(Detail)
    node.setPosition(co.localPos)
    return new Promise(res => {
        detail.setContent(co)
        detail.listen("close" , () => nodePool.put(node))
    })
}