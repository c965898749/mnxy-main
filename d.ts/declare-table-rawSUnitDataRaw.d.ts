declare class SUnitDataRaw {
    /**100000+关卡x100+1位流水 */
    public id:number;
    /**名称 */
    public name:string;
    /**怪物形象 */
    public unitId:number;
    /**是否是BOSS
1=是
0=不是 */
    public type:number;
    /**提供粮草
100=战场中击杀该单位，玩家可获得100粮草。 */
    public money:number;
    /**怪物身上的毒雾，0=没有
1=黑色，2=紫色 */
    public fog:number;
    /**1 */
    public scale:number;
    /**攻击、防御、生命、暴击、闪避
爆伤，冰属性攻击，火属性攻击，冰属性抗性，火属性抗性（暴击、闪避、爆伤为百分比，0.155=1.55%（加成） */
    public alter:number[];
}