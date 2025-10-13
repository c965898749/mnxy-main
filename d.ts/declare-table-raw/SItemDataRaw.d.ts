declare class SItemDataRaw {
    /**道具id */
    public id:number;
    /**名称 */
    public name:string;
    /**描述 */
    public txt:string;
    /**品质
1=白，2=绿，3=蓝，4=紫，5=金，6=红 */
    public quality:number;
    /**分类：0=英雄，1=装备，2=道具，3=玉石、金币、功勋 */
    public type:number;
    /**最大堆叠数 */
    public maxPile:number;
    /**图标 */
    public icon:number;
}