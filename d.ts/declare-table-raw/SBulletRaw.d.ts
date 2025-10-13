declare class SBulletRaw {
    /**id=技能id */
    public id:number;
    /**动画类型 */
    public isSpine:number;
    /**同源发射时间间隔 */
    public interval:number;
    /**子弹动画配置[文件名,前缀，数值位数，结束索引，是否开启光效叠加，缩放，透明度] */
    public aniconfig:any[];
    /**子弹飞行时间 */
    public duration:number;
    /**轨迹脚本                        0=水平直线弹道           1=水平曲线弹道           2=垂直目标弹道 */
    public scType:number;
    /**脚本参数1 偏移                                           [开始x,开始y,命中x，命中y] */
    public param1:any[];
    /**脚本参数2 用于贝塞尔曲线计算 轨迹脚本为1 需要配置                                          [角度1,长度1,角度2,长度2] */
    public param2:any[];
    /**脚本参数3 用于贝塞尔曲线范围值 对应 param2                                               [角度范围1，长度范围1，角度范围2,长都范围2] */
    public param3:any[];
    /**脚本参数4 */
    public param4:any[];
    /**缓动函数 */
    public ease:string;
    /**补充动作1                                  子弹动画配置[文件名,动画名，x，y，是否开启光效叠加，缩放，透明度] */
    public supAction1:any[];
}