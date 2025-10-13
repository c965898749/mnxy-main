declare class SHeroTryDataRaw {
    /**id=vip等级 */
    public id:number;
    /**英雄ID */
    public heroId:number;
    /**使用英雄的等级品质1=白色 */
    public lv:number;
    /**属性增益，0.2=基础属性前三位增加20%
只加攻击、防御、生命。 */
    public up:number;
}