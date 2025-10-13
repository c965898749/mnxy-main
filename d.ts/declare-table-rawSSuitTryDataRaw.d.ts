declare class SSuitTryDataRaw {
    /**套装id */
    public id:number;
    /**套装名称 */
    public name:string;
    /**套装
当存在数组中全部id时，即显示套装名称 */
    public suit:number[];
    /**英雄等级 */
    public lv:number;
    /**英雄星级
1=1星 */
    public star:number;
    /**增益倍数 */
    public up:number;
}