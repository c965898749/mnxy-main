/**
 * 卡牌技能等级计算工具，1:1对齐Java原版逻辑
 */
export namespace CardSkillLevelUtil {
    // 【与Java完全对齐】初始技能等级（1级卡牌）
    const INITIAL_SKILL_LEVELS: number[] = [1, 0, 0, 0];
    // 【与Java完全对齐】星级基础满级时技能上限
    const BASE_MAX_SKILL_LEVELS: number[] = [6, 5, 5, 5];
    // Java常量复刻
    const BASE_STAR_MAX_LEVEL = 5;
    const STAR_STEP = 0.5;
    const LEVEL_INCREMENT_PER_STAR_STEP = 5;
    // 超出基础满级后，每X级提升1级技能
    const SKILL_UP_STEP = 5;

    /**
     * 根据星级获取该星级对应的基础满级等级
     * 和Java getSkillBaseMaxLevelByStar 逻辑完全一致
     */
    function getSkillBaseMaxLevelByStar(star: number): number {
        if (star <= 0) {
            throw new Error(`星级必须大于0，当前：${star}`);
        }
        const starStepCount = (star - 1) / STAR_STEP;
        return BASE_STAR_MAX_LEVEL + Math.floor(starStepCount * LEVEL_INCREMENT_PER_STAR_STEP);
    }

    /**
     * 核心方法：根据卡牌等级和星级，计算4个技能等级（无封顶）
     * @param cardLevel 卡牌等级 ≥1
     * @param star 卡牌星级 ≥1，支持0.5步长(1/1.5/2/2.5...)
     * @returns [技能1, 技能2, 技能3, 技能4]
     */
    export function calculateSkillLevels(cardLevel: number, star: number): number[] {
        // 1. 参数校验 对齐Java异常逻辑
        if (cardLevel < 1) {
            throw new Error(`卡牌等级必须≥1，当前：${cardLevel}`);
        }
        if (star <= 0) {
            throw new Error(`星级必须大于0，当前：${star}`);
        }

        // 2. 当前星级对应的基础满级等级
        const skillBaseMaxLevel = getSkillBaseMaxLevelByStar(star);

        // 3. 拷贝初始数组，不污染原常量
        let skillLevels = [...INITIAL_SKILL_LEVELS];

        // 4. 等级=1，直接返回初始值
        if (cardLevel === 1) {
            return skillLevels;
        }

        // 5. 卡牌等级 ≤ 星级基础满级：按比例插值+向上取整
        if (cardLevel <= skillBaseMaxLevel) {
            const levelRange = skillBaseMaxLevel - 1;
            const currentProgress = cardLevel - 1;

            for (let i = 0; i < skillLevels.length; i++) {
                const skillMaxDelta = BASE_MAX_SKILL_LEVELS[i] - INITIAL_SKILL_LEVELS[i];
                // 向上取整逻辑完全复刻Java
                const addVal = Math.ceil((currentProgress * skillMaxDelta) / levelRange);
                let lv = INITIAL_SKILL_LEVELS[i] + addVal;
                // 限制不超过该星级基础上限
                skillLevels[i] = Math.min(lv, BASE_MAX_SKILL_LEVELS[i]);
            }
            return skillLevels;
        }

        // 6. 等级超过星级基础满级：以基础满级数组为基底，叠加额外等级增量
        skillLevels = [...BASE_MAX_SKILL_LEVELS];
        const exceedLevels = cardLevel - skillBaseMaxLevel;
        const extraInc = Math.floor(exceedLevels / SKILL_UP_STEP);
        for (let i = 0; i < skillLevels.length; i++) {
            skillLevels[i] += extraInc;
        }
        return skillLevels;
    }

    // 测试用例，和Java main函数一一对应，可直接运行校验
    export function test() {
        console.log("1级4星卡牌技能等级：", calculateSkillLevels(1, 4)); // [1,0,0,0]
        console.log("35级4星卡牌技能等级：", calculateSkillLevels(35, 4)); // [6,5,5,5]
        console.log("40级4星卡牌技能等级：", calculateSkillLevels(40, 4)); // [7,6,6,6]
        console.log("70级4星卡牌技能等级：", calculateSkillLevels(70, 4)); // [13,12,12,12]
        console.log("25级2星卡牌技能等级：", calculateSkillLevels(25, 2)); // [8,7,7,7]
        console.log("100级5星卡牌技能等级：", calculateSkillLevels(100, 5)); // [17,16,16,16]
    }
}