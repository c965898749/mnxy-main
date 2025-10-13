declare class SSkillEffectRaw {
    /**id */
    public id:number;
    /**效果名称 */
    public name:string;
    /**技能描述图片名 */
    public effectDes:string;
    /**技能描述 */
    public des:string;
    /**效果类型
1=伤害
2=治疗
3=减益
4=增益
5=追加
6=反馈
7=强化
8=控制
9=禁止
10=免疫
11=清楚
12=特殊 */
    public effectType:number;
    /**技能效果模型 */
    public effectMold:number;
}