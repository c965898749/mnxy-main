declare class SVipDataRaw {
    /**id=vip等级 */
    public id:number;
    /**达到该vip需要关看视频的次数 */
    public next:number;
    /**buff=达到该vip获得的增益
0=战场加速、百分比
1=战场初始资源、加具体数值
2=合成消耗资源、百分比
3=强化消耗资源、百分比
4=竞技场免费强征次数
5=宝库每日免费购买次数(具体数量） */
    public buff:number[];
    /**6=卒类英雄在战斗中，攻击力提升，百分比，0.1=提升10% */
    public buff2:number[][];
    /**每日礼包
第一位：ID
第二位：类型、0=英雄，1=装备、2=道具、3=货币
第三位：数量 */
    public recycle:number[][];
    /**首次礼包 */
    public recycleUp:number[][];
    /**VIP权益中文描述 */
    public txt:string;
}