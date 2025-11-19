import { _decorator, Component, EditBox, Node } from 'cc';
import { getConfig, getToken } from 'db://assets/script/common/config/config';
import { AudioMgr } from 'db://assets/script/util/resource/AudioMgr';
import { util } from 'db://assets/script/util/util';
const { ccclass, property } = _decorator;

@ccclass('giftExchangeCode')
export class giftExchangeCode extends Component {

    @property(EditBox)
    giftCode: EditBox;
    start() {

    }

    update(deltaTime: number) {

    }

    async goBack() {
        AudioMgr.inst.playOneShot("sound/other/click");
        this.node.active = false
    }
    giftExchangeCodeBtn() {
        AudioMgr.inst.playOneShot("sound/other/click");
        const config = getConfig()
        const token = getToken()
        const giftCode = this.giftCode.string;
        if (!giftCode) {
            const close = util.message.confirm({ message: "请输入礼包码" })
            return;
        }
        // 验证逻辑（示例）
        if (giftCode) {
            const postData = {
                token: token,
                str: giftCode,
            };
            const options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData),
            };

            // 发送 POST 请求
            fetch(config.ServerUrl.url + "/giftExchangeCode", options)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json(); // 解析 JSON 响应
                })
                .then(data => {
                    const close = util.message.confirm({ message: data.errorMsg || "服务器异常" })
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                }
                );
        } else {

        }
    }

}


