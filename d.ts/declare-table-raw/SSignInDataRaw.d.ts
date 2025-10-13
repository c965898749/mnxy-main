declare class SSignInDataRaw {
    /** */
    public id:number;
    /** */
    public day:number;
    /**玩家官职等级 */
    public lv:number;
    /**奖励使用的icon */
    public icon:number;
    /**[0,101,10]=类型为0，id为101的道具10个
0=英雄
1=装备
2=道具
3=货币 */
    public award:number[][];
}