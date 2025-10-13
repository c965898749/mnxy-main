declare class SEquipDataRaw {
    /**id */
    public id:number;
    /**使用图标 */
    public icon:number;
    /**最大堆叠数 */
    public maxPile:number;
    /**穿戴装备需要的等级 */
    public lv:number;
    /**装备名称 */
    public name:string;
    /**职业
0=通用
1=卒
2=车
3=马
4=炮
5=象
6=士 */
    public job:number;
    /**品质
1=白色
2=绿色
3=蓝色
4=紫色
5=橙色
6=红色 */
    public trait:number;
    /**装备类型
0=衣服
1=武器
2=头盔
3=兵书
4=突破丹 */
    public seat:number;
    /**属性
攻击,防御,血量,暴击,闪避,暴击伤害,冰属性攻击，火属性攻击，冰属性抗性，火属性抗性。 */
    public property:number[];
    /**是否可合成强化
0=可以
1=不可以 */
    public type:number;
    /**谁的装备
[0]=通用
[1000,1001]=英雄id为1000，和id为1001的英雄可以穿该装备 */
    public target:number[];
    /**强化属性，会关联全局配置中的强化系数，不同品质的装备，强化系数不同。 */
    public growPropty:number[];
    /**首次穿戴增加经验
1000=1000点经验 */
    public exp:number;
    /**强化消耗 */
    public expend:number[];
    /**回收价格，关联强化表回收成长。
[100,2,50]=类型2，道具id为100的道具50个 */
    public recycle:number[];
    /**第1位金币，第二位玉石，第三位视频 */
    public sellRecycle:number[];
    /**换肤 */
    public skin:any[];
    /**穿上装备需要显示的插槽 */
    public slots:any[];
    /**穿上装备需要显示插槽对应的状态名 */
    public showAttach:any[];
    /**脱下装备需要显示的插槽的状态 */
    public hideAttach:any[];
}