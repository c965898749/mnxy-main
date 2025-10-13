declare class SHeroDataRaw {
    /** */
    public id:number;
    /**英雄头像 */
    public icon:number;
    /**1=真实的英雄
0=怪物表使用的英雄原型 */
    public true:number;
    /**英雄名字 */
    public name:string;
    /**是否站在原地攻击
0=在原地
1=跑过去打 */
    public act:number;
    /**1=卒
2=車
3=馬
4=炮
5=象
6=士 */
    public type:number;
    /**初始品质：
1=白卡
2=绿卡
3=蓝卡
4=紫卡
5=金卡
6=红卡 */
    public trait:number;
    /**出生星星（初始星级） */
    public birthStar:number;
    /**动作文件夹名称 */
    public animation:string;
    /**初始属性：攻击，防御，生命，暴击，闪避，爆伤，冰属性攻击，火属性攻击，冰属性抗性，火属性抗性。 */
    public property:number[];
    /**英雄成长值，每级提升的属性。 */
    public growValue:number[];
    /**出战耗粮食 */
    public food:number;
    /**获得条件
0=默认解锁
1=非默认解锁。 */
    public unlock:number;
    /**解锁该英雄需要的初始碎片 */
    public unlockStar:number;
    /**星级成长需要碎片，数组。
星级、月亮、太阳、皇冠。
[20,30,40,50]=英雄为星级时，每次升星需要20个碎片，晋升为月亮后，每次需要消耗30碎片。 */
    public star:number[];
    /**普攻音效 */
    public atkAudio:number;
    /**普攻攻击范围 */
    public scope:number;
    /**技能数组
[1,2,3]代表拥有id为1,2,3的技能 */
    public skill:number[];
    /**普攻动作 */
    public action:number;
    /**移动速度
10=1秒钟移动100像素 */
    public ms:number;
    /**普通CD，单位秒 */
    public cd:number;
    /**上阵后每秒额外产生多少粮草 */
    public wheatUp:number;
    /**英雄传记属性说明 */
    public tale:string;
    /**抽卡时显示的描述，抽到的时候 */
    public show:string;
    /**插槽 */
    public slots:string[];
    /**默认状态 */
    public defaultAttach:string[];
}