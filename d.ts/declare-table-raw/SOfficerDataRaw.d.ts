declare class SOfficerDataRaw {
    /**官职等级id */
    public id:number;
    /**官职称谓 */
    public name:string;
    /**所需功勋 */
    public exp:number;
    /**宝箱奖励 */
    public award:number[][];
    /**官职图标 */
    public icon:number;
    /**看视频额外获得的增益
[200,300]=官职为当前官职时，看视频额外多获得多少金币、玉石 */
    public tv:number[];
}