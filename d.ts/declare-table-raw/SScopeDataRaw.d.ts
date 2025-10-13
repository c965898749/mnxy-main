declare class SScopeDataRaw {
    /**id */
    public id:number;
    /**"1=自身为中心周围单项/多向
2=自身为中心周围x圈
3=方向x，x级扇形
4=以地图为坐标。" */
    public type:number;
    /**攻击范围 */
    public scope:any;
    /**职业备注 */
    public txt:string;
}