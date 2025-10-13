declare class SDialDataRaw {
    /** */
    public id:number;
    /**0=银宝箱奖励
1=金宝箱奖励
2=专属宝箱奖励 */
    public type:number;
    /**按整体权重占比 */
    public weight:number;
    /**[101,2,10]=id为101，类型为2的道具10个
0=英雄
1=装备
2=道具 */
    public award:number[][];
    /**奖品描述 */
    public txt:string;
}