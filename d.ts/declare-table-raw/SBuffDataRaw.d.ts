declare class SBuffDataRaw {
    /**100+1位流水 */
    public id:number;
    /** */
    public name:string;
    /**触发条件 */
    public conditions:number[];
    /**目标判定
第1位，0=全局，1=我方，2=敌方
第2位，技能目标类型判定
100=任意角色
101=人族
102=兽族
103=机械
第3位，站位判定                                                                                                                                
0=全部1=前排
2=中排
3=后排 */
    public targets:number[];
    /**加成属性：[0.1，0.2……]=加10%攻击，20%防御……
1=攻击
2=防御
3=血量
4=能量
5=暴击
6=闪避
7=爆伤 */
    public attribute:number[];
    /**文本描述 */
    public txt:string;
    /** */
    public icon:number;
    /**增益类型0=英雄的，1=开局宝典 */
    public type:number;
}