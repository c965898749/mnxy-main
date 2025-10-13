declare class SActionCollisionRaw {
    /**id */
    public collisionId:number;
    /** */
    public isSpine:number;
    /**爆点文件[文件名,前缀，数值位数，结束索引，是否开启光效叠加，缩放，透明度] */
    public effect:any[][];
    /**爆点层级 */
    public visFirst:any[];
    /**位置偏移 */
    public position:any[][];
    /**动作状态 */
    public state:any;
}