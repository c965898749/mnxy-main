import { _decorator, Component, Node } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

@ccclass('SignInCtrl')
export class SignInCtrl extends Component {
    @property(Node)
    BlockInputEvents: Node
    @property(Node)
    DayLi: Node
    initialized = false;
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

    async refresh() {
        // 你的刷新逻辑
        // console.log('节点被激活，正在刷新状态');
        // 例如，重新加载数据，更新UI等
        const config = getConfig()
        const signCount = config.userData.signCount
        // console.log(config.userData, 333)
        // console.log(signCount, 2222)
        for (var i = 0; i < signCount; i++) {
            this.DayLi.children[i].getChildByName("sign_18").active = true
            this.DayLi.children[i].getChildByName("sign_15").active = true
        }
    }

    update(deltaTime: number) {

    }

    public close() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
        const now = new Date();
        const config = getConfig()
        localStorage.setItem('cachedTime' + config.userData.userId, now.toString());
    }

    public qiandao() {
        AudioMgr.inst.playOneShot("sound/other/click");
        const now = new Date();
        const config = getConfig()
        localStorage.setItem('cachedTime' + config.userData.userId, now.toString());
        const token = getToken()
        const postData = {
            token: token,
        };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
        };
        fetch(config.ServerUrl.url + "signUp", options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(async data => {
                if (data.success == '1') {

                    var userInfo = data.data
                    config.userData.characters = userInfo.characterList
                    config.userData.diamond = userInfo.diamond
                    config.userData.signCount = userInfo.signCount
                    localStorage.setItem("UserConfigData", JSON.stringify(config))
                    await new Promise(res => setTimeout(res, 500))
                    this.refresh()

                } else {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                }
            })
            .catch(error => {
                // console.error('There was a problem with the fetch operation:', error);
            }
            );

    }
}


