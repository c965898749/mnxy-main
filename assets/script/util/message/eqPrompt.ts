import { Prefab, find , Node} from "cc";
import { load } from "../bundle/load";
import { getNodePool } from "../resource/getNodePool";
import { HolPromptMessage, PromptMessageOption } from "../../prefab/HolPromptMessage";
import { HolPromptEqMessage } from "../../prefab/HolPromptEqMessage";

export async function preloadEqPrompt() {
    const nodePool = getNodePool(await load("prefab/HolPromptMessage" , Prefab))
    const node = nodePool.get()
    nodePool.put(node)
}

// 弹出消息 返回一个Promise 确认的话返回 true 否则返回 false
export async function eqPrompt(co: PromptMessageOption , parent: Node = find("Canvas")): Promise<void> {
    const nodePool = getNodePool(await load("prefab/HolPromptEqMessage" , Prefab))
    const node = nodePool.get()
    parent.addChild(node)
    const holPromptMessage = node.getComponent(HolPromptEqMessage)
    holPromptMessage.setContent(co)
    return new Promise(res => {
        holPromptMessage.listen("close" , () => {
            nodePool.put(node)
            res()
        })
        return
    })
}