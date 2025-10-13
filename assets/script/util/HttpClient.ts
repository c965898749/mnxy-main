//////////////////////////////////////////////////////////////////////////////////////
//
//  Jason
//  23-10-20
//
//////////////////////////////////////////////////////////////////////////////////////

import { sys } from "cc";
import FormData from './Protos/formData.js';

export enum HEADER_TYPE {
    formdata,
    json,
    text,
    www,
}

export enum RESPONSE_TYPE {
    empty = "",
    arraybuffer = "arraybuffer",
    blob = "blob",
    document = "document",
    json = "json",
    text = "text",
}

export enum HTTP_METHOD {
    GET = "GET",
    POST = "POST",
}

export class HttpClient {
    private constructor () {}
    /**
     * 创建一个HttpRequest。
     */
    public static once(callback:Function, url:string, responseType?:RESPONSE_TYPE, method?:HTTP_METHOD, data?:any, headerType?:HEADER_TYPE):void {
        // XMLHttpRequest 使用示例详情见官方API文档。
        let request = new XMLHttpRequest();
        request.responseType = responseType ? responseType : RESPONSE_TYPE.text;
        request.onreadystatechange = () => {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    if (callback) {
                        callback(request.response);
                        callback = null;
                    }
                } else {
                    if (callback) {
                        callback(null, `${request.status} ${request.statusText}`);
                        callback = null;
                    }
                }
            }
        };
        request.timeout = 10000;
        request.ontimeout = (evt:ProgressEvent<EventTarget>) => {
            if (callback) {
                callback(null, `${request.status} timeout ${request.statusText}`);
                callback = null;
            }
        }
        request.onerror = (evt:ProgressEvent<EventTarget>) => {
            if (callback) {
                callback(null, `${request.status} onerror ${request.statusText}`);
                callback = null;
            }
        }
        console.log(url);
        let useNoCache = true;
        if (sys.platform == sys.Platform.DESKTOP_BROWSER || sys.platform == sys.Platform.MOBILE_BROWSER) {
            useNoCache = false;
            if (!data && url.indexOf("?") == -1) {
                url = url + "?timestamp=" + Date.now();
            }
        }
        request.open(method ? method : HTTP_METHOD.GET, url, true);
        // 防止缓存。
        if (useNoCache) {
            request.setRequestHeader('Cache-Control', 'no-cache');
            request.setRequestHeader('Pragma', 'no-cache');
        }
        if (data) {
            let sendVal:any;
            if (headerType == HEADER_TYPE.formdata) {
                sendVal = new FormData(); // 微信小游戏不支持基础库FormData，使用第三方。
                for (let key in data) {
                    sendVal.append(key, data[key]);
                }
                let fromInfo = sendVal.getData();
                request.setRequestHeader("Content-Type", fromInfo.contentType);
                sendVal = fromInfo.buffer;
            } else if (headerType == HEADER_TYPE.json) {
                request.setRequestHeader("Content-Type", "application/json");
                sendVal = JSON.stringify(data);
            } else if (headerType == HEADER_TYPE.text) {
                sendVal = data;
            } else {
                request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                sendVal = data;
            }
            request.send(sendVal);
        }
        else {
            request.send();
        }
    }
}