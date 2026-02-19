import { GGEventManager } from "./GGEventManager";

/**
 * 观察者系统
 *
 * @author caizhitao
 * @created 2024-08-30 10:40:53
 */
export abstract class GGObserverSystem<T> {
    private _observers: Set<T> | null = null;

    /**
     * 观察者
     */
    get observers(): Set<T> {
        if (this._observers == null) {
            this._observers = new Set();
        }
        return this._observers;
    }

    /**
     * 注册观察者
     */
    register(obserber: T) {
        this.observers.add(obserber);
    }
    /**
     * 注销观察者
     */
    unregister(observer: T) {
        this.observers.delete(observer);
    }
    /**
     * 注销所有观察者
     */
    unregisterAll() {
        this.observers.clear();
    }

    // //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 事件广播相关接口

    /**
     * 事件管理器
     */
    private get eventManager(): GGEventManager {
        if (this._eventManager == null) {
            this._eventManager = new GGEventManager();
        }
        return this._eventManager;
    }
    private _eventManager: GGEventManager | null = null;

    /**
     * 监听消息
     *
     * @param msgId 消息id
     * @param callback 回调函数
     * @param target 回调函数执行对象
     */
    on(msgId: string, callback: Function, target?: any) {
        this.eventManager.on(msgId, callback, target);
    }

    /**
     * 监听消息（回调函数执行一次后会自动销毁，不用主动off）
     *
     * @param msgId 消息id
     * @param callback 回调函数
     * @param target 回调函数执行对象
     */
    onOnce(msgId: string, callback: Function, target?: any): void {
        this.eventManager.onOnce(msgId, callback, target);
    }

    /**
     * 取消监听消息
     *
     * @param msgId 消息id
     * @param callback 回调函数
     * @param target 回调函数执行对象
     */
    off(msgId: string, callback?: Function, target?: any) {
        this.eventManager.off(msgId, callback, target);
    }

    /**
     * 取消监听某个已经注册对象的所有消息
     *
     * @param target 回调函数的执行对象
     */
    offTarget(target: any) {
        this.eventManager.offTarget(target);
    }

    /**
     * 广播事件
     *
     * @param eventName 事件名
     * @param param 传递的剩余不定参数
     */
    emit(eventName: string, ...param: any[]): void {
        this.eventManager.emit(eventName, ...param);
    }
}
