declare class SDailyTaskDataRaw {
    /** */
    public id:number;
    /**任务类型 */
    public type:number;
    /**完成数量 */
    public needNum:number;
    /**[101,0,10]=类型为0，id为101的道具10个
0=英雄
1=装备
2=道具
3=货币 */
    public award:number[][];
    /**文本描述 */
    public txt:string;
    /**按钮显示 */
    public btnText:string;
}