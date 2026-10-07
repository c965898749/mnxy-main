import { math } from "cc";
import { GetCharacterCoordinatePosition } from "../../../prefab/HolCharacter";
import { FightMap } from "../../../scenes/Fight/Canvas/FightMap";
import { util } from "../../../util/util";
import { ActionState } from "../../fight/ActionState";
import { BasicState } from "../../fight/BasicState";
import { RegisterCharacter } from "../../fight/character/CharacterEnum";
import { CharacterMetaState } from "../../fight/character/CharacterMetaState";
import { CharacterState } from "../../fight/character/CharacterState";
import { BuffState } from "../../fight/buff/BuffState";
import { CardSkillLevelUtil } from "../../../util/CardSkillLevelUtil";


@RegisterCharacter({ id: "1109" })
export class Character extends CharacterMetaState {

    name: string = "谛听"

    AnimationDir: string = "game/fight_entity/character/1109"


    AvatarPath: string = "game/texture/frames/hero/1109/spriteFrame"

    HeaderPath: string = "game/texture/frames/hero/Header/1109/spriteFrame"

    AnimationType: "DrangonBones" | "Spine" = "Spine"

    AnimationScale: number = 1

    HpGrowth: number = 45

    AttackGrowth: number = 30

    DefenceGrowth: number = 15

    PierceGrowth: number = 15

    SpeedGrowth: number = 17

    Energy: number = 90

      CharacterCamp: "ordinary" | "nature" | "abyss" | "dark" | "machine" | "sacred" = "nature"

    position = 2

    CharacterQuality: number = 4

    PassiveIntroduceOne: string = `
    
    撞击 Lv{skillLv}
    攻击前，消耗自身 {healVal}% 生命值(不超过当前生命值20%)，向当前目标发起撞击，对目标造成等同于所消耗生命值 2 倍的伤害。
    `.replace(/ /ig, "")


    PassiveIntroduceTwo: string = `

    返璞归真 lv{skillLv}
    所受伤害减少{healVal}%，转移减伤前伤害值的40%至敌方易死护法（转移的伤害为生命流失，最多不超过谛听生命值的25%）。
    每生效一次，本神通的减伤及反弹数值会减少5%，直到0；
    `.replace(/ /ig, "")

    SkillIntroduce: string = `

    地藏 协同 lv{skillLv}
    与地藏在同一队伍时，增加自身{healVal}点生命上限，{healVal2}点攻击，{healVal3}点速度
    `.replace(/ /ig, "")

    introduce: string = "它能明辨是非、辨别真假。但是害怕真假孙悟空在地府闹事，所以选择闭口不言。"

    skillValue: string = `撞击 返璞归真 地藏协同`

public getSkillDesc(state: CharacterState): string {
    const lv = state.lv;
    const star = state.star;
    const [skill1, skill2, skill3] = CardSkillLevelUtil.calculateSkillLevels(lv, star);

    // 一技能：10 * skill1，上限20
    const rawVal1 = 1 * skill1;
    const val1 = Math.floor(math.clamp(rawVal1, 0, 20));

    // 二技能：10 * skill2，上限100
    const rawVal2 = 10 * skill2;
    const val2 = Math.floor(math.clamp(rawVal2, 0, 100));

    const val3Hp = Math.floor(352 * skill3);
    const val3Atk = Math.floor(176 * skill3);
    const val3Spd = Math.floor(176 * skill3);

    // 封装替换方法
    const replaceText = (text: string, map: Record<string, string>) => {
        let res = text;
        for (const key in map) {
            res = res.replace(`{${key}}`, map[key]);
        }
        return res;
    };

    const passive1 = replaceText(this.PassiveIntroduceOne, {
        skillLv: skill1.toString(),
        healVal: val1.toString()
    });

    const passive2Map = skill2 > 0
        ? { skillLv: skill2.toString(), healVal: val2.toString() }
        : { skillLv: "未开启", healVal: "—" };
    const passive2 = replaceText(this.PassiveIntroduceTwo, passive2Map);

    const skill3Map = skill3 > 0
        ? {
            skillLv: skill3.toString(),
            healVal: val3Hp.toString(),
            healVal2: val3Atk.toString(),
            healVal3: val3Spd.toString()
        }
        : { skillLv: "未开启", healVal: "—", healVal2: "—", healVal3: "—" };
    const skill3Str = replaceText(this.SkillIntroduce, skill3Map);

    return `${passive1}\n${passive2}\n${skill3Str}`;
}



}