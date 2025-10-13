declare class SActionRaw {
    /**id */
    public id:number;
    /**动作脚本 */
    public scAct:number;
    /**目的地类型 */
    public targetType:number;
    /**子弹id */
    public bullet:any[];
    /**弹道类型 */
    public bulletType:number;
    /**子弹组开始间隔 */
    public bulletInterval:number;
    /**移动到目的地的时间 */
    public moveTime:number;
    /**近战目的地偏移X */
    public airOffsetX:number;
    /**分段动作索引 */
    public segmentIdxs:any[];
    /**碰撞爆点 */
    public collision:any[];
    /**动作效果，倒数第三位是缩放 */
    public effect:any[];
    /**效果偏移 */
    public position:any[];
    /**说明 */
    public des:string;
}