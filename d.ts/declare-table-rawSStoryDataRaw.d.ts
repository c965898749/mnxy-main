declare class SStoryDataRaw {
    /**关卡id=章节*10+关卡1位流水 */
    public id:number;
    /**关卡血量 */
    public hp:number;
    /**战场地图，战场中用。 */
    public mapld:number;
    /**章节地图，章节显示用。 */
    public section:number;
    /**是否有雪地1=美雪，2=有雪 */
    public snow:number;
    /**数组[][]
[[1,2,3],[0,4],[1,2]]=该地图有3个怪物出生点，一共会出3波兵。
第一波兵分别由怪物出生点1，和怪物出生点3，一起出，怪物出生点1，出怪物组为1的怪物，出生点3，出怪物组为1的怪物。
第二波兵，三个出生点1起出，第三波兵，只有怪物出生点1出。 */
    public monsterTeam:number[][];
    /**胜利条件，数组[1,2,3]分别代表1星，2星和三星所需要剩余的血量 */
    public win:number[];
    /**失败奖励 */
    public lose:number[][];
    /**1星奖励 */
    public star1:number[][];
    /**2星奖励 */
    public star2:mumber[][];
    /**3星奖励 */
    public star3:number[][];
    /**是否有宝箱奖励，宝箱奖励是什么 */
    public sectionBox:number[][];
    /**第一位：通关失败获得经验
第二位：1星通关获得经验
第三位：2星通关获得经验
第四位：3星通关获得经验 */
    public exp:number[];
    /**地图坐标 */
    public pointXY:number[];
    /**关卡音效，使用哪个id的背景音乐 */
    public music:number;
    /**推荐战力 */
    public power:number;
    /**敌军阵容 */
    public monsterList:number[];
    /**怪物等级 */
    public monsterLevel:number[];
    /**战力比例（百分比） */
    public powerPro:number[];
}