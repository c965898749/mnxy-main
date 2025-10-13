declare class SMapDataRaw {
    /** */
    public id:number;
    /**地图数据id */
    public map:number;
    /**路径id=可行金区域 */
    public logic:number[][];
    /**地图整体风格 */
    public style:number;
    /**路径说明 */
    public txt:string;
}