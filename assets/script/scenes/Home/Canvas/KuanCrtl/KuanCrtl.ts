import { _decorator, Component, Label, Node } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

@ccclass('KuanCrtl')
export class KuanCrtl extends Component {
    @property(Node)
    mineLevel: Node = null;
    @property(Node)
    hourOutput: Node = null;
    @property(Node)
    Tili: Node = null;
    @property(Node)
    TiliCount: Node = null;

    initialized: boolean = false
    start() {
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

    // 渲染函数
    async refresh() {
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
        fetch(config.ServerUrl.url + "getUserMine", options)
            .then(response => {

                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {
                    //  data.data
                    let userMine = data.data
                    this.mineLevel.getComponent(Label).string = userMine.mineLevel
                    this.hourOutput.getComponent(Label).string = userMine.hourOutput
                    this.TiliCount.getComponent(Label).string = userMine.currentSilver + "/" + userMine.maxCapacity;
                    this.Tili.setScale(
                        userMine.currentSilver / userMine.maxCapacity,
                        1,
                        1
                    )
                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }
            );

    }

    goback() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }

    update(deltaTime: number) {

    }
}


