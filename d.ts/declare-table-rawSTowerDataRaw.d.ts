declare class STowerDataRaw {
    /**关卡id=章节*10+关卡1位流水 */
    public id:number;
    /**玩家关卡血量 */
    public hp:number;
    /**战场地图，战场中用。 */
    public mapld:number;
    /**数组[][]
[[1,2,3],[0,4],[1,2]]=该地图有3个怪物出生点，一共会出3波兵。
第一波兵分别由怪物出生点1，和怪物出生点3，一起出，怪物出生点1，出怪物组为1的怪物，出生点3，出怪物组为1的怪物。
第二波兵，三个出生点1起出，第三波兵，只有怪物出生点1出。 */
    public monsterTeam:number[][];
    /**失败奖励 */
    public lose:number[][];
    /**胜利奖励 */
    public winAward:number[][];
    /**通关后挂机奖励，每分钟。 */
    public hook:number[][];
    /**是否有宝箱奖励，宝箱奖励是什么 */
    public sectionBox:number[][];
    /**第一位：通关失败获得经验
第二位：胜利获得经验 */
    public exp:number[];
    /**进入对应楼层后播放的音乐（战斗中） */
    public music:number;
    /**守卫 */
    public guard:number;
    /**守卫装备 */
    public guardclothes:number[];
}