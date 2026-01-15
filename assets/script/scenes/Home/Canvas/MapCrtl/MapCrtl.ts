import { _decorator, Component, Label, Node, tween, v3, Vec3 } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { PveCtrl } from '../PveCtrl/PveCtrl';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { util } from 'db://assets/script/util/util';
import { MapRankingCrtl } from '../MapRankingCrtl/MapRankingCrtl';
const { ccclass, property } = _decorator;

@ccclass('MapCrtl')
export class MapCrtl extends Component {
    @property(Node)
    Title: Node
    @property(Node)
    Map: Node
    index: number = 0
    initialized = false;
    tiles = ["踏上旅途", "冲向妖界", "龙宫探宝", "地府改命", "大闹天宫"]
    start() {
        this.Title.getComponent(Label).string = "踏上旅途 1/5"
        this.refresh()
    }
    onEnable() {
        if (!this.initialized) {
            // 初始化代码
            this.initialized = true;
        } else {
            this.refresh()
        }

    }
    refresh() {

        const config = getConfig()
        // 解析当前关卡的章、劫、关
        const [currentChapter, currentCalamity, currentStage] = config.userData.chapter.split('-').map(Number);
        const previousLevels = [];

        // 验证关卡格式是否正确
        if (
            isNaN(currentChapter) || isNaN(currentCalamity) || isNaN(currentStage) ||
            currentChapter < 1 || currentChapter > 5 ||
            currentCalamity < 1 || currentCalamity > 6 ||
            currentStage < 1 || currentStage > 10
        ) {
            throw new Error('关卡格式不正确，请使用"章-劫-关"格式，如"1-1-1"，且范围为5章6劫10关');
        }

        // 遍历所有前面的章
        for (let chapter = 1; chapter <= currentChapter; chapter++) {
            // 确定当前章需要遍历到的劫数
            const maxCalamity = chapter < currentChapter ? 6 : currentCalamity;

            // 遍历当前章的劫
            for (let calamity = 1; calamity <= maxCalamity; calamity++) {
                // 确定当前劫需要遍历到的关卡数
                const maxStage = (chapter === currentChapter && calamity === currentCalamity)
                    ? currentStage - 1
                    : 10;
                //激活当前关卡
                this.Map.children[chapter - 1].children[calamity - 1].active = true;
                // 如果当前劫有需要添加的关卡，则添加
                if (maxStage >= 1) {
                    //展示当前进度
                    this.Map.children[chapter - 1].children[calamity - 1].getChildByName("ProgressBar").getChildByName("Bar").setScale(
                        maxStage / 10,
                        1,
                        1
                    )

                } else {
                    this.Map.children[chapter - 1].children[calamity - 1].getChildByName("ProgressBar").getChildByName("Bar").setScale(
                        0 / 10,
                        1,
                        1
                    )
                }
            }
        }
    }
    update(deltaTime: number) {

    }
    right() {
        AudioMgr.inst.playOneShot("sound/other/click");
        tween(this.Map.children[this.index])
            .to(0.5, { position: v3(-640, 0) })
            .start();
        this.index++
        if (this.index >= 5) {
            this.index = 0
        }
        this.Title.getComponent(Label).string = this.tiles[this.index] + (this.index + 1) + "/5"
        this.Map.children[this.index].setPosition(640, 0, 0)
        tween(this.Map.children[this.index])
            .to(0.5, { position: v3(0, 0) })
            .start();
    }
    left() {
        AudioMgr.inst.playOneShot("sound/other/click");
        tween(this.Map.children[this.index])
            .to(0.5, { position: v3(640, 0) })
            .start();
        this.index--
        if (this.index < 0) {
            this.index = 4
        }
        this.Title.getComponent(Label).string = this.tiles[this.index] + (this.index + 1) + "/5"
        this.Map.children[this.index].setPosition(-640, 0, 0)
        tween(this.Map.children[this.index])
            .to(0.5, { position: v3(0, 0) })
            .start();
    }

    async openMap(event: Event, customEventData: string) {
        AudioMgr.inst.playOneShot("sound/other/click");
        // this.node.parent.getChildByName("PveCtrl").active = true
        console.log(customEventData)
        await this.render(customEventData)
    }
    async render(mapId) {
        await this.node.parent.getChildByName("PveCtrl")
            .getComponent(PveCtrl)
            .render(mapId)
    }
    async openta(){
        //   return await util.message.prompt({ message: "暂未开放" })
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("TrialTowerCrtl").active = true
    }

    openHotEvents() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.parent.getChildByName("HotEventsCtrl").active = true
    }
    openRanking() {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "mapRanking100", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                //console.log(data); // 处理响应数据
                if (data.success == '1') {
                    var data = data.data;
                    await this.node.parent.getChildByName("MapRankingCrtl")
                        .getComponent(MapRankingCrtl)
                        .render(data)

                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );

    }
}


