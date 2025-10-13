import {CharacterStateCreate} from "./../../game/fight/character/CharacterState"

class Common {
    // 左侧队伍
    leftCharacter: Map<{row: number , col: number} , CharacterStateCreate> = new Map()
    // 右侧队伍
    rightCharacter: Map<{row: number , col: number} , CharacterStateCreate> = new Map()
}

// 公共内存
export const common = new Common

// common.leftCharacter.set({row: 1, col: 1} , {
//     id: "1010" ,
//     lv: 100 ,
//     star: 5 ,
//     onStage:1,
//     equipment: []
// })
// common.leftCharacter.set({row: 1 , col: 1} , {
//     id: "1010" ,
//     lv: 100 ,
//     star: 5 ,
//     onStage:0,
//     equipment: []
// })
// common.rightCharacter.set({row: 1 , col: 1} , {
//     id: "1012" ,
//     lv: 100 ,
//     star: 5 ,
//     onStage:1,
//     equipment: []
// })
// common.rightCharacter.set({row: 1 , col: 1} , {
//     id: "1010" ,
//     lv: 100 ,
//     star: 5 ,
//     onStage:0,
//     equipment: []
// })
// common.rightCharacter.set({row: 1 , col: 1} , {
//     id: "1012" ,
//     lv: 100 ,
//     star: 5 ,
//     onStage:0,
//     equipment: []
// })