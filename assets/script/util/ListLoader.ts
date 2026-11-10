import { Component, Node, SpriteFrame } from 'cc';
import { util } from './util';

/**
 * 列表渲染性能工具：
 * 1) loadSpriteFramesParallel：把一次列表所需的全部贴图路径去重后并行预取，返回 路径→SpriteFrame 映射；
 *    之后填充节点时用 map.get 同步取帧，不再产生逐卡串行的 await IO。
 * 2) renderListInChunks：分帧创建列表节点（每帧 chunkSize 个），避免同一帧实例化几百个节点造成掉帧；
 *    对同一 contentNode 再次调用会自动作废上一轮未完成的渲染（防止快速反复刷新时旧数据覆盖新列表）。
 */

// 每个 contentNode 当前生效的渲染代次，新一轮 +1，旧链发现代次不符即停
const activeGen = new WeakMap<Node, number>()

// 并行预取一批贴图路径（null/空路径跳过，重复路径只加载一次；加载失败的项在 map 中为 null）
export async function loadSpriteFramesParallel(paths: Array<string | null | undefined>): Promise<Map<string, SpriteFrame>> {
    const uniq = Array.from(new Set(paths.filter(p => !!p) as string[]))
    const frames = await Promise.all(uniq.map(p => util.bundle.load(p, SpriteFrame)))
    const map = new Map<string, SpriteFrame>()
    uniq.forEach((p, i) => map.set(p, frames[i]))
    return map
}

/**
 * 分帧渲染列表。调用前由调用方自行回收旧节点。
 * @param host       承载 scheduleOnce 的组件（生命周期须覆盖整个渲染过程，一般传列表脚本自身）
 * @param contentNode 列表内容节点（作为中断令牌）
 * @param items      数据数组
 * @param buildItem  同步构建单项节点（贴图须来自预取缓存，不允许内部再 await IO）
 * @param chunkSize  每帧创建节点数，默认 10
 */
export function renderListInChunks<T>(
    host: Component,
    contentNode: Node,
    items: T[],
    buildItem: (item: T, index: number) => Node,
    chunkSize: number = 10
) {
    const gen = (activeGen.get(contentNode) || 0) + 1
    activeGen.set(contentNode, gen)
    let index = 0
    const step = () => {
        // 已有更新的渲染轮次开始，旧链立即终止
        if (activeGen.get(contentNode) !== gen) return
        const end = Math.min(index + chunkSize, items.length)
        for (; index < end; index++) {
            const node = buildItem(items[index], index)
            if (node) contentNode.addChild(node)
        }
        if (index < items.length) host.scheduleOnce(step, 0)
    }
    step()
}
