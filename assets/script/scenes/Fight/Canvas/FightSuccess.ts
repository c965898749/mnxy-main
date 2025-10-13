import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FightSuccess')
export class FightSuccess extends Component {
    start() {

    }

    update(deltaTime: number) {

    }

    // 跳过战斗
    async skipFight() {

        director.loadScene("Home")

    }
}

