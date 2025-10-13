declare class SCallDataRaw {
    /** */
    public id:number;
    /**按整体权重占比 */
    public weight:number;
    /**[101,2,10]=id为101，类型为2的道具10个
0=英雄
1=装备
2=道具 */
    public award:number[];
    /**奖品描述 */
    public txt:string;
}