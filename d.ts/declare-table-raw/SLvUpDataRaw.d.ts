declare class SLvUpDataRaw {
    /**强化等级 */
    public id:number;
    /**属性成长
0.1=该等级强化在基础强化属性上加10%
0=不加 */
    public grow:number;
    /**消耗资源加成
0.1=该等级强化在基础消耗资源上加10%
0=不加 */
    public moneyUp:number;
    /**0=不加
0.1=在基础售价上增加10% */
    public moneySale:number;
    /**成功率
1=100% */
    public odds:number;
    /**失败是否掉级
0=失败不掉级
1=失败后掉0~1级
2=失败后掉0~2级 */
    public levelOff:number;
}