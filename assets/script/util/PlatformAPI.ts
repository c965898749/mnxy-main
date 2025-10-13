// //////////////////////////////////////////////////////////////////////////////////////
// //
// //  Jason
// //  23-10-20
// //
// //////////////////////////////////////////////////////////////////////////////////////

// import { Asset, Font, JsonAsset, View, __private, assetManager, game, native, resources, sp, sys } from "cc";
// import * as fgui from "fairygui-cc";
// import { ViewDispatcher } from "./ViewDispatcher";
// import { VarVal } from "../Values/VarVal";
// import { UtilsUI } from "./UtilsUI";
// import { LyLoginAccount } from "../Views/LyLoginAccount";
// import { SdkImpl } from "./SdkImpl";
// import { HEADER_TYPE, HTTP_METHOD, HttpClient, RESPONSE_TYPE } from "./HttpClient";
// import { StrVal } from "../Values/StrVal";
// import { UtilsTool } from "./UtilsTool";
// import { PErrCode } from "../Values/PErrCode";
// import { GameServerData } from "./GameServerData";
// import { Md5 } from "../Protos/Md5";
// import { AudioManager } from "./AudioManager";
// import { DEBUG } from "cc/env";
// import { ScriptTimer } from "./ScriptTimer";

// /**
//  * 充值分支定义。
//  */
// export enum PAY_OPTION {
//     PAY_INSDK = "PAY_INSDK",
// }

// /**
//  * 额外分支定义。
//  */
// enum EXTRA_OPTION {
//     REWARD_VIDEO_AD = "REWARD_VIDEO_AD",
//     SHARE_GAME = "SHARE_GAME",
//     ON_SHARE = "ON_SHARE",
//     WX_QUERY = "WX_QUERY",
//     CLEAR_STORAGE = "CLEAR_STORAGE",
//     COPY_CLIPBOARD = "COPY_CLIPBOARD",
//     OPEN_KEFU = "OPEN_KEFU",
// }

// /**
//  * 服务器群分支定义。
//  */
// export enum BUILD_TYPE {
//     ALPHA,
//     BETA,
//     BANHAO,
//     RELEASE,
// }

// /**
//  * 版本设置参数结构。
//  */
// export interface UpdateSelInfo {
//     sdkb: string,
//     sdks: string,
//     bver: string,
//     loginUrl: string,
//     payUrl: string,
//     isExpire: boolean,
//     isUpdate: boolean
//     isPayTest: boolean,
//     isAdTest: boolean,
//     isExamine: boolean,
//     isDebug: boolean,
// }

// /**
//  * 服务器列表项结构。
//  */
// export interface ServerItem {
//     serverId: number,
//     mergeId: number,
//     status: number,
//     openTime: string,
//     desc: string,
//     name: string,
//     url: string,
// }

// /**
//  * 历史服务器列表项结构。
//  */
// export enum ServerStatus {
//     HIDE = 0,
//     CLOSE = 1,
//     WAIT = 2,
//     NEW = 3,
//     RECOMMEND = 4,
//     NORMAL = 5,
//     HOT = 6,
// }

// /**
//  * 历史服务器列表项结构。
//  */
// export interface ServerRecord {
//     serverId: number,
//     lastTime: number,
//     name: string,
// }

// export class PlatformAPI {
//     private constructor () {}
    
//     /**
//      * 原生热更参数。
//      */
//     private static xxgame:any = globalThis.xxgame;

//     /**
//      * 当前服务器群分支。
//      */
//     public static BUILD_CURRENT:BUILD_TYPE;

//     private static updateData:any = {};
//     private static URL_UPDATE:string; // 更新服地址
//     private static SDK_BIG:string; // 大渠道号
//     private static SDK_SMALL:string; // 小渠道号
//     private static BVER:string; // 用于提审时的版本控制，可在选服列表中过滤

//     // asdk的平台设备信息，如果没有接入或者其他平台则为空字符串
//     private static URL_ASDKTRACK:string; // asdk上报地址
//     private static sdkPlatInfo:string = "";
//     private static sdkPlatTable:any = "";
//     private static sdkWXQuery:any;
//     private static sdkWXCfg:any;

//     public static PASSWORLD:string = "654321";

//     private static sendQueue:Array<any>;
//     private static jsExceptions:any;

//     private static loadedResources:any;
//     private static loadedUiPackage:any;
//     private static loadedAssetTime:any;
//     private static loadingAssetQueue:any;

//     // 临时保存（先有登陆数据、再有服务器数据（服务器数据可能获取失败））。
//     // 登陆界面会确保第一次登陆后2个同时存在，否则重新登陆。
//     private static userInfo:any;
//     private static serverInfo:any;

//     /**
//      * js调用native的API。
//      */
// 	private static callNative(callback:Function, cmd:string, args:any):void {
//         // 如果重复协议，这里清除重复回调，注意。
// 		for (let i = 0; i < PlatformAPI.sendQueue.length; i++) {
// 			if (PlatformAPI.sendQueue[i].cmd == cmd) {
// 				PlatformAPI.sendQueue.splice(i, 1);
// 				break;
// 			}
// 		}
// 		PlatformAPI.sendQueue.push({
// 			cmd:cmd,
// 			args:args,
// 			callback:callback,
// 		});
// 		let sendData:string = args ? JSON.stringify({cmd:cmd, args:JSON.stringify(args)}) : JSON.stringify({cmd:cmd});
//         if (sys.isNative) {
//             native.bridge.sendToNative("callNative", sendData);
//         } else {
//             SdkImpl.getInstance().sendToNative("callNative", sendData);
//         }
// 	}

//     /**
//      * native调用js的API。
//      */
// 	public static onNative(arg0:string, recvData: string):void {
//         let obj:any = JSON.parse(recvData);
//         if (obj.cmd == "envSdkLogout") {
//             UtilsUI.restartGame();
//         }
//         else {
//             for (let i = 0; i < PlatformAPI.sendQueue.length; i++) {
//                 if (PlatformAPI.sendQueue[i].cmd == obj.cmd) {
//                     let args:any;
//                     if (obj.args && obj.args.length > 0) {
//                         args = JSON.parse(obj.args);
//                     }
//                     PlatformAPI.sendQueue[i].callback(args);
//                     PlatformAPI.sendQueue.splice(i, 1);
//                     break;
//                 }
//             }
//         }
// 	}

//     /**
//      * 注册native调用js的API。
//      */
// 	private static registerCallJs():void {
//         if (sys.isNative) {
//             native.bridge.onNative = this.onNative;
//         }
// 	}

//     /**
//      * 获取SDK完整ID。
//      */
// 	public static getSdkId():string {
// 		return PlatformAPI.SDK_BIG + PlatformAPI.SDK_SMALL;
// 	}

//     /**
//      * 获取SDK传的参数。
//      */
// 	public static getSdkPlatInfo():string {
// 		return PlatformAPI.sdkPlatInfo;
// 	}

//     /**
//      * 获取二进制程序版本。
//      */
// 	public static getBinaryVersion():string {
// 		return PlatformAPI.BVER;
// 	}

//     /**
//      * 获得版本设置参数。
//      */
// 	private static getUpdateSelInfo():UpdateSelInfo {
// 		let selectBins:Array<UpdateSelInfo> = PlatformAPI.updateData.selectBins;
//         for (let i = 0; i < selectBins.length; i++) {
//             let selectBin:UpdateSelInfo = selectBins[i];
//             if ((selectBin.sdkb == "*" || selectBin.sdkb == PlatformAPI.SDK_BIG)
//             && (selectBin.sdks == "*" || selectBin.sdks == PlatformAPI.SDK_SMALL)
//             && (selectBin.bver == "*" || selectBin.bver == PlatformAPI.BVER)) {
//                 return selectBin;
//             }
//         }
//         return selectBins[selectBins.length - 1];
// 	}

//     /**
//      * 当前二进制程序版本是否过期。
//      */
//     public static isBinaryExpire():boolean {
//         let selectBin = this.getUpdateSelInfo();
//         if (selectBin.isExpire) {
//             return true;
//         } else {
//             return false;
//         }
//     }

//     /**
//      * 当前二进制程序版本是否可更新。
//      */
//     public static isBinaryAllowUpdate():boolean {
//         let selectBin = this.getUpdateSelInfo();
//         if (selectBin.isUpdate) {
//             return true;
//         } else {
//             return false;
//         }
//     }

//     /**
//      * 是否使用模拟充值。
//      */
//     private static isBinaryPayTest():boolean {
//         let selectBin = this.getUpdateSelInfo();
//         if (selectBin.isPayTest) {
//             return true;
//         } else {
//             return false;
//         }
//     }

//     /**
//      * 是否使用模拟广告。
//      */
//     private static isBinaryAdTest():boolean {
//         let selectBin = this.getUpdateSelInfo();
//         if (selectBin.isAdTest) {
//             return true;
//         } else {
//             return false;
//         }
//     }

//     /**
//      * 是否提审状态。
//      */
//     public static isBinaryExamine():boolean {
//         let selectBin = this.getUpdateSelInfo();
//         if (selectBin.isExamine) {
//             return true;
//         } else {
//             return false;
//         }
//     }

//     /**
//      * 是否可打开命令。
//      */
//     public static isBinaryDebug():boolean {
//         let selectBin = this.getUpdateSelInfo();
//         if (selectBin.isDebug) {
//             return true;
//         } else {
//             return false;
//         }
//     }

//     /**
//      * 是否小游戏运行在iOS系统。
//      */
//     public static isMiniGameOniOS():boolean {
//         return (PlatformAPI.sdkPlatTable && PlatformAPI.sdkPlatTable.flat.toLowerCase() == "ios");
//     }

//     /**
//      * 当前版本号全字串。
//      */
//     public static getFullVersion():string {
//         return `${PlatformAPI.getSdkId()}-${PlatformAPI.getBinaryVersion()}-${PlatformAPI.getResVersion()}-${PlatformAPI.getProtocolVersion()}`;
//     }

//     /**
//      * 当前资源内容版本号。
//      */
//     public static getResVersion():string {
//         if (PlatformAPI.xxgame) {
//             return PlatformAPI.xxgame.RES_VER;
//         } else {
//             return PErrCode.svn_version;
//         }
//     }

//     /**
//      * 当前协议版本号。
//      */
//     public static getProtocolVersion():string {
//         return PErrCode.content_version;
//     }

//     /**
//      * 获取更新服配置信息。
//      */
//     public static getUpdateData():any {
//         return PlatformAPI.updateData;
//     }

//     /**
//      * 版权信息文本。
//      */
//     public static getCopyrightText():string {
//         return PlatformAPI.updateData.copyright;
//     }

//     /**
//      * 用户隐私链接。
//      */
//     public static getLinkAgreement():string {
//         return PlatformAPI.updateData.linkAgreement;
//     }

//     /**
//      * 用户政策链接。
//      */
//     public static getLinkPolicy():string {
//         return PlatformAPI.updateData.linkPolicy;
//     }

//     /**
//      * 获得当前登录服各请求地址，登陆服选择。
//      */
//     private static getLoginCmdUrl(opName:string):string {
//         let selectBin = this.getUpdateSelInfo();
//         return `${selectBin.loginUrl}${opName}`;
//     }

//     /**
//      * 获得当前充值服回调地址，充值服选择。
//      */
//     private static getPayUrl():string {
//         let selectBin = this.getUpdateSelInfo();
//         return selectBin.payUrl;
//     }

//     /**
//      * 是否微信小游戏支持的充值档次（元）。
//      */
//     public static isBuyQuantity(money:string | number):boolean {
//         money = Number(money);
//         let quas:Array<number> = PlatformAPI.updateData.buyQuantity;
//         if (!quas) {
//             return true;
//         }
//         for (let i = 0; i < quas.length; i++) {
//             if (quas[i] == money) {
//                 return true;
//             }
//         }
//         return false;
//     }

//     /**
//      * 获得随机一个分享图片链接。
//      */
//     private static getShareImageInfo():any {
//         let urls:Array<string> = PlatformAPI.updateData.images;
// 		return urls[UtilsTool.random(0, urls.length - 1)];
//     }

//     /**
//      * 构造HTTP附带参数。
//      */
//     private static getAppendParams(obj:any):string {
//         let params:string = "?sign=jhywvR8pMpnMGDU1P5Brdx3O8pWU";
//         for (let key in obj) {
//             params = params + `&${key}=${obj[key]}`;
//         }
//         return params;
//     }

//     /**
//      * 反构造key1=val1&key2=val2参数为对象。
//      */
//     public static getSendParamsObject(str:string):any {
//         let obj:any = {};
//         let ttt = str.split("&");
//         for (let i = 0; i < ttt.length; i++) {
//             let block = ttt[i].split("=");
//             obj[block[0]] = block[1];
//         }
//         return obj;
//     }

//     /**
//      * 构造key1=val1&key2=val2参数。
//      */
//     public static getSendParamsEx(obj:any):string {
//         let params:string = "";
//         for (let key in obj) {
//             if (params.length > 0) {
//                 params = params + `&${key}=${obj[key]}`;
//             } else {
//                 params = `${key}=${obj[key]}`;
//             }
//         }
//         return params;
//     }

//     /**
//      * 构造HTTP附带参数。
//      */
//     private static getSendParams(obj:any):string {
//         obj.sign = "jhywvR8pMpnMGDU1P5Brdx3O8pWU";
//         return PlatformAPI.getSendParamsEx(obj);
//     }

//     /**
//      * 获得服务器最后登陆项信息。
//      */
//     public static getLastPlayerGameServerItem():ServerItem {
//         if (PlatformAPI.serverInfo) {
//             let maxPlayer:ServerRecord;
//             let players:Array<ServerRecord> = PlatformAPI.serverInfo.players;
//             for (let i = 0; i < players.length; i++) {
//                 let player:ServerRecord = players[i];
//                 if (!maxPlayer || player.lastTime > maxPlayer.lastTime) {
//                     maxPlayer = player;
//                 }
//             }
//             if (maxPlayer) {
//                 return PlatformAPI.getGameServerItem(maxPlayer.serverId);
//             }
//         }
//     }

//     /**
//      * 获得服务器状态为status的最大id项信息。
//      */
//     public static getMaxIdGameServerItem(status:number):ServerItem {
//         if (PlatformAPI.serverInfo) {
//             let maxServer:ServerItem;
//             let servers:Array<ServerItem> = PlatformAPI.serverInfo.servers;
//             for (let i = 0; i < servers.length; i++) {
//                 let server:ServerItem = servers[i];
//                 if (!status || server.status == status) {
//                     if (!maxServer || server.serverId > maxServer.serverId) {
//                         maxServer = server;
//                     }
//                 }
//             }
//             return maxServer;
//         }
//     }

//     /**
//      * 获得服务器项信息。
//      */
//     public static getGameServerItem(serverId:number):ServerItem {
//         if (PlatformAPI.serverInfo) {
//             let servers:Array<ServerItem> = PlatformAPI.serverInfo.servers;
//             for (let i = 0; i < servers.length; i++) {
//                 let server:ServerItem = servers[i];
//                 if (server.serverId == serverId) {
//                     return server;
//                 }
//             }
//         }
//     }

//     /**
//      * 获得服务器数据信息。
//      */
//     public static getServerInfo():any {
//         return PlatformAPI.serverInfo;
//     }

//     /**
//      * 获得服务器列表信息。
//      */
//     public static getGameServerList(callback:Function, isUseCurr?:boolean, isSkipLockWait?:boolean):void {
//         if (PlatformAPI.userInfo) {
//         if (isUseCurr && PlatformAPI.serverInfo) {
//             callback(PlatformAPI.userInfo, PlatformAPI.serverInfo);
//         } else {
//             if (!isSkipLockWait) {
//                 UtilsUI.lockWait()
//             };
//             HttpClient.once((response:any, error:string) => {
//                 if (!isSkipLockWait) {
//                     UtilsUI.unlockWait()
//                 };
//                 if (response) {
//                     let args:any = JSON.parse(response);
//                     if (args && args.errorcode != 0) {
//                         callback({errmsg: args.msg});
//                     } else {
//                         // 切换账号后必定更新服务器列表信息
//                         // 更新服务器信息不一定需要切换账号
//                         // 如果在请求过程中切换了账号，那么旧的回调可以判断userId进行忽略（需要服务器在本协议中新增userId参数）
//                         PlatformAPI.serverInfo = JSON.parse(args.data);
//                         callback(PlatformAPI.userInfo, PlatformAPI.serverInfo);
//                     }
//                 } else {
//                     callback({errmsg: StrVal.PLATFORM.STR101});
//                 }
//             }, PlatformAPI.getLoginCmdUrl("getLoginGameServer"), RESPONSE_TYPE.text, HTTP_METHOD.POST, PlatformAPI.getSendParams({
//                 platform: PlatformAPI.getSdkId(),
//                 userId: PlatformAPI.userInfo.userId,
//                 password: PlatformAPI.userInfo.userPass
//             }));
//         }
//         } else {
//             callback({errmsg: StrVal.PLATFORM.STR104});
//         }
//     }

//     /**
//      * 获得更新服配置。
//      */
//     public static requestUpdateServerData(callback:Function):void {
//         HttpClient.once((response:any, error:string) => {
//             if (response) {
//                 PlatformAPI.updateData = JSON.parse(response);
//                 if (PlatformAPI.updateData) {
//                     callback(true);
//                 } else {
//                     callback(false, "json decode error");
//                 }
//             } else {
//                 callback(false, error);
//             }
//         }, PlatformAPI.URL_UPDATE, RESPONSE_TYPE.text, HTTP_METHOD.GET);
//     }

//     /**
//      * 获取公告信息。
//      */
//     public static onAnnouncement(callback:Function):void {
//         UtilsUI.lockWait();
//         HttpClient.once((response:any, error:string) => {
//             UtilsUI.unlockWait();
//             if (response) {
//                 let args = JSON.parse(response);
//                 if (args && args.errorcode == 0) {
//                     let data = JSON.parse(args.data);
//                     if (data.announcement && data.announcement.length > 0) {
//                         callback(UtilsTool.base64Decode(data.announcement));
//                     } else {
//                         callback();
//                     }
//                 } else {
//                     callback();
//                 }
//             } else {
//                 callback();
//             }
//         }, this.getLoginCmdUrl("getAnnounment"), RESPONSE_TYPE.text, HTTP_METHOD.POST, PlatformAPI.getSendParams({
//             platform: PlatformAPI.getSdkId()
//         }));
//     }

//     /**
//      * 初始化。
//      */
//     public static init():void {
//         this.regErrorHandler();
//         // 在浏览器中可能没有配置表导致计算View.instance.getScaleX、Y出错，在此写上且必须要在界面管理器初始化之前。
//         View.instance.setDesignResolutionSize(750, 1334, 4);
//         game.frameRate = 60;
//         if (DEBUG) {
//             PlatformAPI.BUILD_CURRENT = BUILD_TYPE.ALPHA;
//         } else {
//             PlatformAPI.BUILD_CURRENT = BUILD_TYPE.BETA;
//         }

//         PlatformAPI.sendQueue = new Array<any>();
// 		PlatformAPI.registerCallJs();
//         PlatformAPI.jsExceptions = {};
//         PlatformAPI.loadedResources = {};
//         PlatformAPI.loadedUiPackage = {};
//         PlatformAPI.loadedAssetTime = {};
//         PlatformAPI.loadingAssetQueue = {};
        
//         PlatformAPI.doSdkParams(() => {
//             PlatformAPI.postSdkPointData(PlatformAPI.ASDK_TRACKID.INIT_GAME);
//             ViewDispatcher.init();
//         })
//     }

//     /**
//      * 清理缓存。
//      */
//     public static clear():void {
//         PlatformAPI.sendQueue = null;
//         PlatformAPI.jsExceptions = null;
//         for (let key in PlatformAPI.loadedResources) {
//             assetManager.releaseAsset(PlatformAPI.loadedResources[key]);
//         }
//         PlatformAPI.loadedResources = null;
//         for (let key in PlatformAPI.loadedUiPackage) {
//             fgui.UIPackage.removePackage(key);
//         }
//         PlatformAPI.loadedUiPackage = null;
//         PlatformAPI.loadedAssetTime = null;
//         resources.releaseAll();
//         PlatformAPI.loadingAssetQueue = null;
//     }

//     /**
//      * 获取平台参数信息。
//      */
// 	public static doSdkParams(callback:Function):void {
// 		// 获取SDK游戏内参数
//         PlatformAPI.callNative((args:any) => {
//             if (args.errmsg) {
//                 // 应不可能失败！
//             }
//             else {
//                 // 这里覆盖游戏内参数。
//                 if (args.URL_UPDATE) {
//                     PlatformAPI.URL_UPDATE = args.URL_UPDATE;
//                 }
//                 if (args.SDK_BIG) {
//                     PlatformAPI.SDK_BIG = args.SDK_BIG;
//                 }
//                 if (args.SDK_SMALL) {
//                     PlatformAPI.SDK_SMALL = args.SDK_SMALL;
//                 }
//                 if (args.BVER) {
//                     PlatformAPI.BVER = args.BVER;
//                 }
//                 if (args.URL_ASDKTRACK) {
//                     PlatformAPI.URL_ASDKTRACK = args.URL_ASDKTRACK;
//                 }
//                 if (args.sdkPlatInfo) {
//                     PlatformAPI.sdkPlatInfo = args.sdkPlatInfo;
//                     PlatformAPI.sdkPlatTable = JSON.parse(args.sdkPlatInfo);
//                 }

//                 callback();
//             }
//         }, "doSdkParams", null)
// 	}

//     /**
//      * 调用初始化SDK接口。
//      */
// 	public static doSdkInit(callback:Function):void {
//         PlatformAPI.callNative((args:any) => {
//             callback(args);
//         }, "doSdkInit", null)
// 	}

//     /**
//      * 使用游戏内账号登录界面。
//      */
// 	private static showLoginAccountUI(callback:Function, isFirst:boolean):void {
// 		ViewDispatcher.pushViewEvent(null, ViewDispatcher.EVENT_PUSH, LyLoginAccount, 0, {callback:(data:any) => {
// 			if (data.errmsg) {
// 				PlatformAPI.userInfo = null;
// 				callback(data);
// 			} else {
// 				// args => userId:string, userPass:string, nickname:string
// 				PlatformAPI.userInfo = data;
// 				PlatformAPI.getGameServerList(callback);
// 			}
// 		}, isFirst:isFirst});
// 	}
// 	/**
//      * 调用登录接口。
//      */
// 	public static doSdkLogin(callback:Function, isFirst:boolean):void {
//         UtilsUI.lockWait();
// 		PlatformAPI.callNative((args:any) => {
//             UtilsUI.unlockWait();
//             if (args.errmsg) {
//                 PlatformAPI.userInfo = null; // 注销
//                 callback({errmsg:args.errmsg});
//             } else {
//                 if (args.isUseGameLogin == "1") {
//                     this.showLoginAccountUI(callback, isFirst);
//                 } else {
//                     // args => userId:string, userPass:string, nickname:string
//                     if (args.userPass.length <= 0) {
//                         args.userPass = PlatformAPI.PASSWORLD;
//                     }
//                     PlatformAPI.userInfo = args;
//                     PlatformAPI.getGameServerList(callback);
//                 }
//             }
//         }, "doSdkLogin", null)
// 	}

//     /**
//      * 调用充值接口。
//      */
// 	public static doSdkPay(callback:Function, payInfo:any):void {
//         payInfo.isPayTest = this.isBinaryPayTest();
//         payInfo.payUrl = this.getPayUrl();
//         PlatformAPI.callNative((args:any) => {
//             if (args.isUsePayVirtual == "1") {
//                 SdkImpl.payVirtual((aaa:any, emsg:string) => {
//                     if (emsg) {
//                         callback({errmsg:emsg});
//                     } else {
//                         callback({payInfo:payInfo});
//                     }
//                 }, payInfo, args.payUrl);
//             } else {
//                 if (args.errmsg) {
//                     callback({errmsg:args.errmsg});
//                 } else {
//                     callback({payInfo:payInfo});
//                 }
//             }
//         }, "doSdkPay", payInfo)
// 	}

//     /**
//      * 调用登出SDK接口。
//      */
// 	public static doSdkLogout(callback:Function):void {
//         PlatformAPI.callNative((args:any) => {
//             PlatformAPI.userInfo = null; // 无论是否成功都清除
//             PlatformAPI.serverInfo = null; // 同步清除（2者应该同时存在）
//             callback(args);
//         }, "doSdkLogout", null)
// 	}

//     /**
//      * 调用上报SDK接口。
//      */
// 	public static doSdkSubmit(callback:Function, submitInfo:any):void {
//         PlatformAPI.callNative((args:any) => {
//             callback(args);
//         }, "doSdkSubmit", submitInfo)
// 	}

//     /**
//      * 获得设备信息。
//      */
// 	public static doSdkPkgInfo(callback:Function):void {
//         PlatformAPI.callNative((args:any) => {
//             callback(args);
//         }, "doSdkPkgInfo", null)
// 	}

//     /**
//      * 观看广告。
//      */
// 	public static doSdkRewardVideoAD(callback:Function, isSkip?:boolean):void {
//         if (isSkip) {
//             UtilsUI.sendwatchad();
//             callback();
//         } else {
//             PlatformAPI.callNative((args:any) => {
//                 if (args.isSuccess == "1") {
//                     UtilsUI.sendwatchad();
//                     callback();
//                 } else {
//                     callback(args.errmsg);
//                 }
//                 // 音效在小程序中会失声。
//                 AudioManager.setBGMPause(true);
//                 AudioManager.setBGMPause(false);
//             }, "doSdkExtra", {
//                 option: EXTRA_OPTION.REWARD_VIDEO_AD,
//                 adunits: PlatformAPI.updateData.adunits,
//                 isAdTest: this.isBinaryAdTest()
//             })
//         }
// 	}

//     /**
//      * 右上角分享（邀请）。
//      */
// 	public static doSdkOnShareGame(callback?:Function, query?:any):void {
//         let __query:string;
//         if (query) {
//             __query = PlatformAPI.getSendParamsEx(query);
//         }
//         let info = this.getShareImageInfo();
//         PlatformAPI.callNative((args:any) => {
//             if (args.isSuccess == "1") {
//                 if (callback) {
//                     callback();
//                 }
//             } else {
//                 if (callback) {
//                     callback(args.errmsg);
//                 }
//             }
//         }, "doSdkExtra", {option: EXTRA_OPTION.ON_SHARE, callback: () => {
//             return {
//                 title: info.title,
//                 imageUrl: info.imageUrl,
//                 query: __query
//             }
//         }})
// 	}

//     /**
//      * 分享。
//      */
// 	public static doSdkShareGame(callback:Function, shareData:any, isSkip?:boolean):void {
//         if (isSkip) {
//             callback();
//         } else {
//             if (!shareData.imageUrl) {
//                 let info = this.getShareImageInfo();
//                 shareData.title = info.title;
//                 shareData.imageUrl = info.imageUrl;
//             }
//             PlatformAPI.callNative((args:any) => {
//                 if (args.isSuccess == "1") {
//                     callback();
//                 } else {
//                     callback(args.errmsg);
//                 }
//             }, "doSdkExtra", {option: EXTRA_OPTION.SHARE_GAME, shareData: shareData})
//         }
// 	}

//     /**
//      * 获得微信启动信息（同步的）。
//      */
// 	public static doSdkGetWXQuery(callback:Function):void {
//         PlatformAPI.callNative((args:any) => {
//             if (args.isSuccess == "1") {
//                 if (args.query) {
//                     this.sdkWXQuery = args.query;
//                     this.sdkWXCfg = args.asdkcfg;
//                 }
//                 callback(null, this.sdkWXQuery, this.sdkWXCfg);
//             } else {
//                 callback(args.errmsg);
//             }
//         }, "doSdkExtra", {option: EXTRA_OPTION.WX_QUERY})
// 	}

//     /**
//      * 清理本地缓存。
//      */
// 	public static doSdkClearStorage(callback:Function):void {
//         PlatformAPI.callNative((args:any) => {
//             if (args.isSuccess == "1") {
//                 callback();
//             } else {
//                 callback(args.errmsg);
//             }
//         }, "doSdkExtra", {option: EXTRA_OPTION.CLEAR_STORAGE})
// 	}

//     /**
//      * 复制到剪贴板。
//      */
// 	public static doSdkCopyToClipboard(callback:Function, copytext:string):void {
//         PlatformAPI.callNative((args:any) => {
//             if (args.isSuccess == "1") {
//                 callback();
//             } else {
//                 callback(args.errmsg);
//             }
//         }, "doSdkExtra", {option: EXTRA_OPTION.COPY_CLIPBOARD, copytext: copytext})
// 	}

//     /**
//      * 拉起小游戏智能客服窗口。
//      */
// 	public static doSdkOpenKeFu(callback:Function):void {
//         PlatformAPI.callNative((args:any) => {
//             if (args.isSuccess == "1") {
//                 callback();
//             } else {
//                 callback(args.errmsg);
//             }
//         }, "doSdkExtra", {option: EXTRA_OPTION.OPEN_KEFU, kfid: PlatformAPI.updateData.kfid})
// 	}

//     // ######################################################### 以下是加载资源与错误报告 #########################################################
//     /**
//      * 获得更新目录路径。
//      */
//     public static getSaveRootPath(): string {
//         return PlatformAPI.xxgame.saveRootPath;
//     }

//     /**
//      * 获得更新压缩包名称。
//      */
//     public static getFilePatchZip(): string {
//         return PlatformAPI.xxgame.filePatchZip;
//     }

//     /**
//      * 缓存内存资源（非显存）。
//      */
//     public static setCacheResource(path:string, asset:Asset): void {
//         if (asset) {
//             if (!PlatformAPI.loadedResources[path]) {
//                 PlatformAPI.loadedResources[path] = asset;
//                 asset.addRef();
//             }
//         } else {
//             let asset:Asset = PlatformAPI.loadedResources[path];
//             if (asset) {
//                 delete PlatformAPI.loadedResources[path];
//                 asset.decRef();
//             }
//         }
//     }

//     /**
//      * 获取缓存资源。
//      */
//     public static getCacheResource(path:string): any {
//         return PlatformAPI.loadedResources[path];
//     }

//     /**
//      * 卸载Spine资源。
//      * 当没用引用时卸载，来释放内存，主要是显存。
//      */
//     public static releaseFguiAssetSpine(ref:any, old:number): void {
//         let dateNow = Date.now();
//         let temps = new Array<string>();
//         for (let key in PlatformAPI.loadedResources) {
//             if (key.startsWith(VarVal.RESOURCE_DIR.SPINE_P)) {
//                 let asset:Asset = PlatformAPI.loadedResources[key];
//                 if (asset.refCount <= 1) {
//                     let isHit = false;
//                     for (let key in ref) {
//                         if (ref[key] === asset) {
//                             isHit = true;
//                             break;
//                         }
//                     }
//                     if (!isHit && (dateNow - PlatformAPI.loadedAssetTime[key] >= old)) {
//                         temps.push(key);
//                     }
//                 }
//             }
//         }
//         for (let i = 0; i < temps.length; i++) {
//             let key = temps[i];
//             console.log("release Spine ->", key);
//             let asset:Asset = PlatformAPI.loadedResources[key];
//             delete PlatformAPI.loadedAssetTime[key];
//             PlatformAPI.setCacheResource(key, null);
//             assetManager.releaseAsset(asset);
//         }
//     }

//     /**
//      * 卸载fgui包内Atlas-Texture2D、Image-SpriteFrame资源。
//      * 当没用引用时卸载，来释放内存，主要是显存。
//      */
//     public static releaseFguiAssetTex2D(ref:any, old:number): void {
//         let dateNow = Date.now();
//         for (let key in PlatformAPI.loadedUiPackage) {
//             let pkg:fgui.UIPackage = PlatformAPI.loadedUiPackage[key];
//             let items:Array<fgui.PackageItem> = pkg["_items"];
//             for (let i = 0; i < items.length; i++) {
//                 let pi = items[i];
//                 if (pi.type == fgui.PackageItemType.Atlas && !ref[pi.file] && pi.asset && !pi.isUseTemp && (dateNow - pi.assetTime >= old)) {
//                     console.log("release Texture2D ->", pi.file);
//                     // 空白图常驻内存，不在此处，所以不会被释放。
//                     let asset = pi.asset;
//                     pkg.removeItemAsset(pi);
//                     this.releaseFguiAssetSpriteFrame(pi.file);
//                     assetManager.releaseAsset(asset);
//                     asset = undefined;
//                     this.setCacheResource(pi.file, null); // 暂时不清除，因为再次加载会有小小卡顿（填充空白图）
//                     break;
//                 }
//             }
//         }
//     }

//     private static releaseFguiAssetSpriteFrame(path:string): void {
//         for (let key in PlatformAPI.loadedUiPackage) {
//             let pkg:fgui.UIPackage = PlatformAPI.loadedUiPackage[key];
//             let items:Array<fgui.PackageItem> = pkg["_items"];
//             for (let i = 0; i < items.length; i++) {
//                 let pi = items[i];
//                 if ((pi.type == fgui.PackageItemType.Image || pi.type == fgui.PackageItemType.Font) && pi.file == path) {
//                     pkg.removeItemAsset(pi);
//                 }
//             }
//         }
//     }

//     /**
//      * 获取fgui包内资源路径。
//      */
//     private static getFguiResPathByPkg(pkg:fgui.UIPackage, isUseEmpty:boolean): Array<string> {
//         let resPaths:Array<string> = new Array<string>();
//         let items:Array<fgui.PackageItem> = pkg["_items"];
//         for (let i = 0; i < items.length; i++) {
//             let pi:fgui.PackageItem = items[i];
//             if (pi.type == fgui.PackageItemType.Atlas) {
//                 if (isUseEmpty) {
//                     fgui.UIPackage.tempTexFile = VarVal.SPROTO_EMPTY;
//                     resPaths.push(VarVal.SPROTO_EMPTY);
//                 } else {
//                     resPaths.push(pi.file);
//                 }
//             } else if (pi.type == fgui.PackageItemType.Sound) {
//                 resPaths.push(pi.file);
//             }
//         }
//         // 来自fgui的资源加载请求。
//         pkg.onLoadFromPackage = (updateSpriteFrame:Function, pi:fgui.PackageItem) => {
//             let ai = pi.owner.getDependAtlasItem(pi);
//             if (ai) {
//                 if (ai.isUseTemp) {
//                     PlatformAPI.getResourceAsync((res:any) => {
//                         if (res) {
//                             if (ai.isUseTemp) {
//                                 PlatformAPI.setCacheResource(ai.file, res);
//                                 ai.owner.reloadItemAsset(ai);
//                             }
//                             if (pi.isUseTemp) {
//                                 pi.owner.reloadItemAsset(pi);
//                             }
//                             updateSpriteFrame(pi);
//                             if (pi.type == fgui.PackageItemType.Font) {
//                                 ViewDispatcher.viewRecreateFguiGObject(ViewDispatcher.getViewContainer().parent, pi);
//                             }
//                         }
//                     }, ai.file);
//                 } else {
//                     if (pi.isUseTemp) {
//                         pi.owner.reloadItemAsset(pi);
//                     }
//                     updateSpriteFrame(pi);
//                     if (pi.type == fgui.PackageItemType.Font) {
//                         ViewDispatcher.viewRecreateFguiGObject(ViewDispatcher.getViewContainer().parent, pi);
//                     }
//                 }
//             }
//         }
//         return resPaths;
//     }

//     /**
//      * 加载fgui资源包（每个包只能调用一次，即初始化加载时）。
//      */
//     public static loadUiPackage(callback:Function, resName:string, isUseEmpty:boolean): void {
//         if (resName && resName.length > 0) {
//             if (PlatformAPI.loadedUiPackage[resName]) { // 不要重复加载，它内部没有去重。
//                 callback(null, true);
//             } else {
//                 let path:string = VarVal.RESOURCE_DIR.UI_P + resName;
//                 PlatformAPI.getResourceAsync((res:Asset) => {
//                     if (res) {
//                         PlatformAPI.setCacheResource(path, res);
//                         let pkg = fgui.UIPackage.addPackage(path);
//                         let resPaths:Array<string> = PlatformAPI.getFguiResPathByPkg(pkg, isUseEmpty);
//                         if (resPaths.length == 0) {
//                             PlatformAPI.loadedUiPackage[resName] = pkg;
//                             callback(null, true);
//                         } else {
//                             let loadCount = 0;
//                             let doneCount = 0;
//                             for (let i = 0; i < resPaths.length; i++) {
//                                 PlatformAPI.getResourceAsync((asset:Asset) => {
//                                     loadCount++;
//                                     if (asset) {
//                                         PlatformAPI.setCacheResource(resPaths[i], asset);
//                                         doneCount++;
//                                     }
//                                     if (loadCount == resPaths.length) {
//                                         if (loadCount == doneCount) {
//                                             PlatformAPI.loadedUiPackage[resName] = pkg;
//                                             callback(null, true);
//                                         } else {
//                                             callback("load asset fail", false);
//                                         }
//                                     }
//                                 }, resPaths[i]);
//                             }
//                         }
//                     } else {
//                         callback("load res fail", false);
//                     }
//                 }, path);
//                 /*
//                 //这里填写的是相对于resources里的路径。
//                 fgui.UIPackage.loadPackage(path, (err:any, pkg: fgui.UIPackage) => {
//                     if (pkg) {
//                         PlatformAPI.loadedUiPackage[resName] = pkg;
//                         //这里不需要再调用addPackage了，直接可以开始创建界面了。
//                         callback(null, true);
//                     } else {
//                         callback(err, false);
//                     }
//                 });
//                 */
//             }
//         } else {
//             callback(null, true);
//         }
//     }

//     /**
//      * 加载spine资源。
//      */
//     public static loadSpine(callback:Function, resName:string): void {
//     ScriptTimer.setTimeout(() => {
//         let path:string = VarVal.RESOURCE_DIR.SPINE_P + resName + "/" + resName;
//         this.getResourceAsync((asset:sp.SkeletonData) => {
//             if (asset) {
//                 PlatformAPI.loadedAssetTime[path] = Date.now();
//                 PlatformAPI.setCacheResource(path, asset);
//                 callback(asset);
//             } else {
//                 // 重新加载？
//                 console.warn("载资源失败->", path);
//             }
//         }, path, sp.SkeletonData)
//     }, 1)
//     }

//     public static loadFontTTF(fontName:string, doneCall?:Function) {
//         this.getResourceAsync((asset:Font) => {
//             fgui.registerFont(fontName, asset);
//             if (doneCall) {
//                 doneCall();
//             }
//         }, UtilsTool.stringFormat("font/{0}",[fontName]), Font)
//     }

//     /**
//      * 加载字体资源。
//      */
//     public static loadAllFontTTF(){
//        // this.loadFontTTF(VarVal.FONT_NAME.ART_BIG); // 预加载中已加载。
//        // this.loadFontTTF(VarVal.FONT_NAME.COMMON); // 预加载中已加载。
//        // this.loadFontTTF(VarVal.FONT_NAME.ART_SLI);
//        fgui.UIConfig.defaultFont = VarVal.FONT_NAME.COMMON;
//     }

//     /**
//      * 获得resources/Data下资源。
//      */
//     public static getResource_Data(name: string): any {
//         // 此处获取的资源必须已经预加载
//         let asset:JsonAsset = PlatformAPI.getCacheResource(VarVal.RESOURCE_DIR.DATA_P + name);
//         return asset.json;
//     }

//     /**
//      * 传入resource的相对路径加载资源。
//      * 如果有2个相同资源同时加载，测试得出是同一个引用对象，应该是网络请求中有去重后统一回调的。
//      */
//     public static getResourceAsync<T extends Asset>(callback: Function, path: string, type?: __private._types_globals__Constructor<T>): void {
//         if (path && path.length > 0) {
//             let asset: any = PlatformAPI.getCacheResource(path);
//             if (asset) {
//                 callback(asset);
//             } else {
//                 let assetQueue:Array<Function> = this.loadingAssetQueue[path];
//                 if (!assetQueue) {
//                     assetQueue = new Array<Function>();
//                     this.loadingAssetQueue[path] = assetQueue;
//                 }
//                 assetQueue.push(callback);
//                 if (assetQueue.length == 1) {
//                     resources.load(path, type, (err:Error, asset:Asset) => {
//                         for (let i = 0; i < assetQueue.length; i++) {
//                             assetQueue[i](asset);
//                         }
//                         delete this.loadingAssetQueue[path];
//                     });
//                 }
//             }
//         } else {
//             callback();
//         }
//     }

//     /**
//      * 获得IP归属地。
//      */
//     public static getIPAddress(callback:Function, ip:string): void {
//         let url:string = PlatformAPI.updateData.ipAddressUrl;
//         if(url && url.length > 0) {
//             HttpClient.once((response: any, error: string) => {
//                 if (response) {
//                     // https://whois.pconline.com.cn/ipJson.jsp?ip=183.2.172.42&json=true（废弃，小程序平台charset为GBK且gzip）
//                     // {"ip":"183.2.172.42","pro":"广东省","proCode":"440000","city":"广州市","cityCode":"440100","region":"","regionCode":"0","addr":"广东省广州市 电信","regionNames":"","err":""}
//                     // https://searchplugin.csdn.net/api/v1/ip/get?ip=183.2.172.42
//                     // {"code":200,"msg":"success","data":{"address":"中国 广东 广州 电信","ip":"183.2.172.42"}}
//                     // https://www.ip.cn/api/index?ip&type=0
//                     // {"rs":1,"code":0,"address":"中国  广东省 深圳市 电信","ip":"218.17.186.205","isDomain":0}
//                     let ipItem = JSON.parse(response);
//                     if (ipItem) {
//                         let province:string;
//                         if (ipItem.pro) {
//                             province = ipItem.pro;
//                         } else if (ipItem.data && ipItem.data.address) {
//                             province = ipItem.data.address.split(" ")[1];
//                         } else if (ipItem.address) {
//                             province = ipItem.address.split(" ")[2];
//                         }
//                         callback(province);
//                     } else {
//                         callback();
//                     }
//                 } else {
//                     callback();
//                 }
//             }, UtilsTool.stringFormat(url, [ip]), RESPONSE_TYPE.text, HTTP_METHOD.GET);
//         } else {
//             callback();
//         }
//     }

//     /**
//      * 注册异常捕获上报。
//      */
//     private static postException(build:number, msg:string): void {
//         /*
//         let url:string = PlatformAPI.updateData.exceptionUrl;
//         if(url && url.length > 0) {
//             let playerData:any = GameServerData.getInstance().getExceptionUserInfo();
//             HttpClient.once((response:any) => {
//                 if (response) {
//                     let args = JSON.parse(response);
//                     if (args.errorcode != 0) {
//                         callback(null, args.msg);
//                     } else {
//                         callback(JSON.parse(args.data));
//                     }
//                 } else {
//                     callback(null);
//                 }
//             }, url, null, HTTP_METHOD.POST, {type: build, user: JSON.stringify(playerData), json: msg}, HEADER_TYPE.formdata)
//         }
//         */
//         let playerData:any = GameServerData.getInstance().getExceptionUserInfo();
//         PlatformAPI.postSdkPointData(PlatformAPI.ASDK_TRACKID.GAME_LOGINPV, {
//             type:build,
//             serverId:playerData.serverId,
//             guid:playerData.guid,
//             name:playerData.name,
//             error:msg,
//         }, PlatformAPI.updateData.exceptionUrl);
//     }

//     /**
//      * 注册异常捕获上报。
//      */
//     private static onJsException(msg:string): void {
//         let md5 = Md5.hashStr(msg);
//         if (!PlatformAPI.jsExceptions[md5]) {
//             PlatformAPI.jsExceptions[md5] = true;
//             PlatformAPI.postException(PlatformAPI.BUILD_CURRENT, msg);

//             // 注意区分是否开发模式、测试模式
//             //if (PlatformAPI.BUILD_CURRENT != BUILD_TYPE.ALPHA) {
//                 if (msg.length > 4096) {
//                     msg = msg.substring(0, 4096)
//                 }
//                 UtilsUI.showException(msg);
//             //}
//         }
//     }

//     /**
//      * 注册异常捕获上报。
//      */
//     private static regErrorHandler(): void {
//         if(sys.isNative) {
//             globalThis.__errorHandler = (event: Event | string, source?: string, lineno?: number, colno?: number, error?: Error) => {
//                 PlatformAPI.postGameError(error.stack);
//             };
//         } else if(sys.isBrowser) {
//             globalThis.onerror = function (event: Event | string, source?: string, lineno?: number, colno?: number, error?: Error) {
//                 PlatformAPI.postGameError(error.stack);
//             };
//         }
//     }

//     /**
//      * 上报异常。
//      */
//     public static postGameError(msg:string): void {
//         console.error(msg);
//         PlatformAPI.onJsException(msg);
//     }

//     /**
//      * 中台上报。
//      */
//     public static ASDK_TRACKID = {
//         // 启动
//         INIT_GAME: "1000000",
//         // 热更新
//         UPDATE_BEGINE: "1001000",
//         UPDATE_END: "1002000",
//         // 加载资源
//         LOADRES_BEGIN: "1003000",
//         LOADRES_END: "1004000",
//         // 初始化SDK
//         INIT_SDK_DO: "1005000",
//         INIT_SDK_SUCC: "1006000",
//         INIT_SDK_FAIL: "1007000",
//         // 登录
//         LUNCH_LOGIN: "1008000",
//         LUNCH_LOGIN_SUCC: "1009000",
//         LUNCH_LOGIN_FAIL: "1010000",
//         // 打开界面
//         LUNCH_SERVERLIST: "1011000",
//         LUNCH_NOTICE_VIEW: "1012000",
//         LUNCH_CREATEROLE: "1013000",
//         // LUNCH_CREATEROLE_SUCC: "1014000", // 交给服务器
//         // LUNCH_MAINPAGE: "1015000", // 交给服务器
        
//         // 自定义事件
//         GAME_LOGINPV: "1000001", // PV数据打点
//     }

//     /**
//      * 打点
//      */
//     public static GAME_POINT = {
//         // ICON_END: "A000",  //打开小游戏，微信加载完毕后，程序启动。
//         LOING_ONE: "A001",  //加载条开始加载的第一秒
//         LOONG_END: "A002",  //加载条加载完毕
//         CLEANCACHE_ONE: "A003", //在加载界面，第一次点击 【清理缓存】
//         CLEANCACHE_TWO: "A004", //在加载界面，第二次点击 【清理缓存】

//         CHOOSE_SHOW: "B000", //进入选服界面，弹出 【开始闯荡】 按钮 时
//         JOIN_ONE: "B001",   //在选服界面，第一次点击【开始闯荡】按钮
//         JOIN_TWO: "B002",   //在选服界面，第二次点击【开始闯荡】按钮
//         CHOOSE_CLEANCACHEONE: "B004",   //在选服界面，第一次点击 【清理缓存】
//         CHOOSE_CLEANCACHETWO: "B005",   //在选服界面，第二次点击 【清理缓存】
//         CHOOSE_JOINFAIL: "B006",   //在选服界面，点击【开始闯荡】按钮弹出失败提示
//         CHOOSE_JOINFAILTHREE: "B007",   //在选服界面，点击【开始闯荡】按钮弹出失败提示，且停留3秒

//         PAGE_STAR5S: "C000",    //进入游戏，在任意界面，停留5秒
//         PAGE_STAR30S: "C001",    //进入游戏，在任意界面，停留30秒
//         PAGE_STAR5M: "C002",    //进入游戏，在任意界面，停留5分钟
//         PAGE_STAR10M: "C003",    //进入游戏，在任意界面，停留10分钟
//         PAGE_STAR20M: "C004",    //进入游戏，在任意界面，停留20分钟
//         PAGE_STAR30M: "C005",    //进入游戏，在任意界面，停留30分钟

//         LOGIN_TWO: "D001",  //登陆2次
//         LOGIN_THREE: "D002",  //登陆3次
//         LOGIN_SUCC: "E001",  //登陆成功
//         CREATE_SUCC: "E002",  //创角成功
//     }

//     public static postSdkPointData(trackId:string, sendVals?:any, url?:string): void {
//         let useUrl:string;
//         if (url) {
//             if (url.length > 0) {
//                 useUrl = url;
//             }
//         } else {
//             if (PlatformAPI.URL_ASDKTRACK && PlatformAPI.URL_ASDKTRACK.length > 0) {
//                 useUrl = PlatformAPI.URL_ASDKTRACK;
//             }
//         }
//         if (useUrl && PlatformAPI.sdkPlatTable != "") {
//             let ttt = PlatformAPI.sdkPlatTable;
//             let ttime = new Date();
//             ttt.time = `${ttime.getFullYear()}-${ttime.getMonth() + 1}-${ttime.getDate()} ${ttime.getHours()}:${ttime.getMinutes()}:${ttime.getSeconds()}`;
//             if (this.userInfo) {
//                 ttt.accountid = this.userInfo.userId;
//             }
//             if (sendVals) {
//                 sendVals = JSON.stringify(sendVals);
//             } else {
//                 sendVals = "{}";
//             }
//             console.log(useUrl,444)
//             HttpClient.once((response) => {
//                 // do nothing
//             }, useUrl, null, HTTP_METHOD.POST, {
//                 TrackId: trackId,
//                 PublicProperties: JSON.stringify(ttt),
//                 TrackProperties: sendVals
//             }, HEADER_TYPE.formdata)
//         }
//     }

//     public static asdkMd(id:string): void {
//         if (globalThis.wx) {
//             globalThis.wx.asdk.asdkMd(id, (res) => {
//                 console.log('asdkMd: '+JSON.stringify(res))
//             });
//         }
//     }
// }