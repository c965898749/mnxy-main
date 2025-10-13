declare class SSkillDataRaw {
    /**id
英雄idx100+技能流水 */
    public id:number;
    /**技能名称 */
    public name:string;
    /**技能文本描述 */
    public txt:string;
    /**0=全局
1=主动=手动点击触发
2=被动=查询施法条件
3=追击=查询施法条件
4=反击=被攻击时触发 */
    public type:number;
    /**施法条件
第1位，触发回合数
0=每1回合，1=单数回合，2=双数回合,3=死亡时触发
第2位施法者剩余血量
-1=不执行判断，0.2=20%
第3位，释放成功率
1=100% */
    public condition:number[];
    /**目标判定
第1位，0=全局，1=我方，2=敌方
第2位，技能目标类型判定
100=任意角色
101=全体角色
102=兵
103=车  104=馬    105=炮  106=象 士=107                   
108=自己
109=上一次攻击目标
110=上一次立即攻击自己的敌人
第3位，血量判定
100=全体
101=最低血量
102=最高血量
第4位=人数
-1为全体，1=攻击1个 */
    public position:number[];
    /**效果计算
第1位=公式
第2位=属性顺位
效果公式说明 */
    public affect:number[][];
    /**技能效果
第一位，效果id
第二位，持续回合数 0为立即生效 */
    public skillEffect:number[][];
    /**buff特效 */
    public eAnimId:any[];
    /**技能Spine资源名配置 */
    public skillSk:string;
    /**动作配置 */
    public animGroup:number[];
    /**解锁条件
0=默认解锁
10=10级解锁 */
    public unlocking:number;
    /**哪个英雄的技能 */
    public who:number[];
    /**技能图标 */
    public icon:number;
    /**技能弹框中，说明解锁需要多少即.第一位=品质，第二位=该品质多少级。 */
    public unlockingState:number[];
}