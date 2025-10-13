declare class SAddDialDataRaw {
    /** */
    public id:number;
    /**需要次数 */
    public needNext:number;
    /**[0,101,10]=类型为0，id为101的道具10个
0=英雄
1=装备
2=道具
3=货币 */
    public award:number[];
    /** */
    public pond:number;
}