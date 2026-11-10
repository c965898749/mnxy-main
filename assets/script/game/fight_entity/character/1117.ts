import { RegisterCharacter } from "../../fight/character/CharacterEnum";
import { CharacterMetaState } from "../../fight/character/CharacterMetaState";
import { CharacterState } from "../../fight/character/CharacterState";
import { CardSkillLevelUtil } from "../../../util/CardSkillLevelUtil";


@RegisterCharacter({ id: "1117" })
export class Character extends CharacterMetaState {

    // 命名注意：后端 BattleManager 按角色名匹配触发"守卫/卦象"逻辑（g.getName().equals("伏羲")），
    // card 表 1117 行的 name 须与此一致
    name: string = "伏羲"

    AnimationDir: string = "game/fight_entity/character/1117"


    AvatarPath: string = "game/texture/frames/hero/1117/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1117/spriteFrame"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

    AnimationScale: number = 1

    HpGrowth: number = 45

    AttackGrowth: number = 30

    DefenceGrowth: number = 15

    PierceGrowth: number = 15

    SpeedGrowth: number = 17

    Energy: number = 90

    CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "machine"

    position = 2

    CharacterQuality: number = 5

    PassiveIntroduceOne: string = `

    守卫 lv{skillLv}
    队友遭攻击，当其生命值不足{healVal}%（最高70%）且低于自身时，自身代为承受伤害（若为物理伤害且该队友场上有物理结界，先扣除其物理盾，多余部分才转移给伏羲承受）。每次代承的伤害不会超过自身生命上限的{healVal2}%（技能等级越高，该比例越低，最低 10%）。
       `.replace(/ /ig, "")


    PassiveIntroduceTwo: string = `
   
    卦象 lv{skillLv}
    受到/躲过伤害或回合结束时位于后阵蓄力+1，满4后释放给予全体友方{healVal}%生命上限的点物理盾并回复等量血量。
       `.replace(/ /ig, "")

    SkillIntroduce: string = `
   
    神农 协同 lv{skillLv}
    与神农在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度
    `.replace(/ /ig, "")

    introduce: string = "上古创世始祖，仰观象于天、俯观法于地，始作八卦以通神明之德。执卦守阵，护佑群生。"

    skillValue: string = `守卫 卦象 神农协同`

    public getSkillDesc(state: CharacterState): string {
        const lv = state.lv;
        const star = state.star;
        const [skill1, skill2, skill3] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

        let msg = "";
        // ========== 一技能（守卫）：触发阈值 = min(70, 10×技能等级)%，单次代承上限 = 自身生命上限 × max(10, 100-5×技能等级)%（与后端 triggerOnAttackedSkills 守卫块一致） ==========
        if (skill1 > 0) {
            msg += this.PassiveIntroduceOne
                .replace("{skillLv}", skill1 + "")
                .replace("{healVal}", Math.min(70, 10 * skill1) + "")
                .replace("{healVal2}", Math.max(10, 100 - 5 * skill1) + "") + "\n";
        } else {
            msg += this.PassiveIntroduceOne
                .replace("{skillLv}", "未开启")
                .replace("{healVal}", "10")
                .replace("{healVal2}", Math.max(10, 100 - 5) + "") + "\n";
        }

        // ========== 二技能（卦象）：蓄力满4释放，结界/回血 = 各友方生命上限的 5×技能等级%（与后端 triggerFuXiGuaXiang 一致） ==========
        if (skill2 > 0) {
            msg += this.PassiveIntroduceTwo
                .replace("{skillLv}", skill2 + "")
                .replace("{healVal}", 5 * skill2 + "") + "\n";
        } else {
            msg += this.PassiveIntroduceTwo
                .replace("{skillLv}", "未开启")
                .replace("{healVal}", "5") + "\n";
        }

        // ========== 三技能（神农协同）：后端不走战斗逻辑，由 GameServiceServiceImpl 读 card 表 collHp/collAttack/collSpeed × 技能等级 叠面板，此处数值须与表内配置一致 ==========
        if (skill3 > 0) {
            msg += this.SkillIntroduce
                .replace("{skillLv}", skill3 + "")
                .replace("{healVal}", Math.floor(352 * skill3) + "")
                .replace("{healVal2}", Math.floor(176 * skill3) + "")
                .replace("{healVal3}", Math.floor(176 * skill3) + "") + "\n";
        } else {
            msg += this.SkillIntroduce
                .replace("{skillLv}", "未开启")
                .replace("{healVal}", Math.floor(352) + "")
                .replace("{healVal2}", Math.floor(176) + "")
                .replace("{healVal3}", Math.floor(176) + "") + "\n";
        }
        return msg;
    }

}
