import { _decorator, Component, Node } from 'cc';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { ArenaDetailCrtl } from '../ArenaDetailCrtl/ArenaDetailCrtl';
import { ArenaApplyCrtl } from '../ArenaApplyCrtl/ArenaApplyCrtl';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

@ccclass('ArenaCrtl')
export class ArenaCrtl extends Component {

    start() {

    }

    update(deltaTime: number) {

    }
    goback() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
        this.node.parent.getChildByName("JinjiCtrl").active = true
    }

    async openArena(event: Event, customEventData: string) {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        const token = getToken()
        const postData = {
            token: token,
            userId: config.userData.userId,
            str: customEventData
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "isSignedUp", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                //console.log(data); // 处理响应数据
                if (data.success == '1') {
                    let map=data.data;
                    let isSignedUp=map["isSignedUp"]
                    let gameArenaRanks=map["gameArenaRanks"]
                    if (isSignedUp) {
                        await this.render(customEventData)
                    } else {

                        await this.renderApply(customEventData,gameArenaRanks)
                    }
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );

    }
    async render(arenaId) {
        await this.node.parent.getChildByName("ArenaDetailCrtl")
            .getComponent(ArenaDetailCrtl)
            .render(arenaId)
    }

    async renderApply(arenaId,gameArenaRanks) {
        await this.node.parent.getChildByName("ArenaApplyCrtl")
            .getComponent(ArenaApplyCrtl)
            .renderApply(arenaId,gameArenaRanks)
    }
}


