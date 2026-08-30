//@ts-ignore
const ele = (window as any).electron;

/**
 * SteamMgr.ts
 */
export default class SteamMgr {

  /*** 获取用户信息 */
  static getUserInfo() {
    return this.steamFun("getUserInfo", true)
  }

  //#region 成就
  // 480测试成就：ACH_WIN_ONE_GAME、ACH_TRAVEL_FAR_SINGLE、ACH_WIN_100_GAMES、ACH_TRAVEL_FAR_ACCUM、NEW_ACHIEVEMENT_0_4
  /*** 成就-获得 */
  static getAchievement(achievement: string): boolean {
    return this.steamFun("getAchievement", true, achievement)
  }
  /*** 成就-清除 */
  static clearAchievement(achievement: string): boolean {
    return this.steamFun("clearAchievement", true, achievement)
  }
  /*** 成就-是否获得 */
  static isAchievementActivated(achievement: string): boolean {
    return this.steamFun("isAchievementActivated", true, achievement)
  }
  //#endregion

  //#region 创意工坊
  /*** 创意工坊-创建 */
  static createItem(updateDetails: CreativeWorkshop) {
    this.steamFunAsync("createItem", true, updateDetails)
  }

  /*** 创意工坊-订阅 itemId（带n）*/
  static subscribe(itemId: string) {
    this.steamFunAsync("subscribe", true, itemId)
  }
  /*** 创意工坊-取消订阅 itemId（带n）*/
  static unsubscribe(itemId: string) {
    this.steamFunAsync("unsubscribe", true, itemId)
  }
  /*** 创意工坊-获取订阅列表 */
  static getSubscribedItems() {
    this.steamFunAsync("getSubscribedItems", true)
  }

  /*** 创意工坊-修改 itemId（带n）*/
  static updateItem(itemId: string, updateDetails: CreativeWorkshop) {
    const data = { itemId, updateDetails }
    this.steamFunAsync("updateItem", true, data)
  }

  /*** 创意工坊-获取订阅详情 itemId（带n）*/
  static getItem(itemId: string) {
    this.steamFunAsync("getItem", true, itemId)
  }

  /*** 创意工坊-下载 itemId（带n）*/
  static download(itemId: string) {
    this.steamFunAsync("download", true, itemId)
  }

  /*** 
   * 创意工坊-获取所有物品列表 
   * key: "",  // 可在https://steamcommunity.com/dev/apikey申请
   * appid: 480, 
   * page: 1, // 页面编号
   * numperpage: 10, // 每页获取的物品数量
   * return_tags: true, // 返回物品的标签
   * return_vote_data: true, // 返回物品的投票数据
   * 
   */
  static getAllItems(key: string, appid: number = 480, page: number = 1, numperpage: number = 10, return_tags: boolean = true, return_vote_data: boolean = true) {
    const data = { key, appid, page, numperpage, return_tags, return_vote_data }
    this.steamFunAsync("getAllItems", true, data)
  }

  /*** 创意工坊-通过物品id获取相关信息 */
  static getItems(itemIds: string[]) {
    this.steamFunAsync("getItems", true, itemIds)
  }

  //#endregion

  //#region 云存储
  /*** 云存储-帐户是否启用云存储 */
  static isEnabledForAccount(): boolean {
    return this.steamFun("isEnabledForAccount", true)
  }
  /*** 云存储-应用是否启用云存储 */
  static isEnabledForApp(): boolean {
    return this.steamFun("isEnabledForApp", true)
  }
  /*** 云存储-读取云存储文件 */
  static readFile(fileName: string) {
    return this.steamFunAsync("readFile", true, fileName);
  }
  /*** 云存储-写入云存储文件 */
  static writeFile(fileName: string, fileData: string) {
    const params = { fileName, fileData };
    return this.steamFun("writeFile", true, params);
  }
  /*** 云存储-删除云存储文件 */
  static deleteFile(fileName: string) {
    return this.steamFun("deleteFile", true, fileName);
  }
  /*** 云存储-检查云存储文件是否存在 */
  static fileExists(fileName: string) {
    return this.steamFun("fileExists", true, fileName);
  }

  //#endregion

  //#region callback
  /*** 订阅 Steam 回调 */
  /***
   * PersonaStateChange回调中的bits对照表：EPersonaChange
   */
  static registerCallback(callbackType: SteamCallback, handler: (data: any) => void) {
    if (!this.isIpcRenderer()) return;
    // 主进程注册回调
    ele.ipcRenderer.sendSync('steam_registerCallback', callbackType);
    // 渲染进程监听回调事件
    ele.ipcRenderer.on('steam_callback', (event: any, msg: any) => {
      if (msg.type === callbackType) {
        handler(msg.data);
      }
    });
  }

  /*** 取消订阅 Steam 回调 */
  static unRegisterCallback(callbackType: SteamCallback) {
    if (!this.isIpcRenderer()) return;
    this.steamFun("unRegisterSteamCallback", false, callbackType);
  }
  //#endregion

  //#region auth
  static getSessionTicketWithSteamId(steamId64: string, timeoutSeconds: number = 30) {
    const data = { steamId64, timeoutSeconds };
    return this.steamFunAsync("getSessionTicketWithSteamId", true, data);
  }
  static getSessionTicketWithIp(ip: string, timeoutSeconds: number = 30) {
    const data = { ip, timeoutSeconds };
    return this.steamFunAsync("getSessionTicketWithIp", true, data);
  }
  static getAuthTicketForWebApi(identity: string, timeoutSeconds: number = 30) {
    const data = { identity, timeoutSeconds };
    return this.steamFunAsync("getAuthTicketForWebApi", true, data);
  }
  //#endregion

  /**
   * 自定义命令 steam专用
   * 无需回复的 reply=false
   * SteamMgr.steamFun("getUserInfo", true)
   */
  static steamFun(fun: string, reply: boolean = false, params: any = null) {
    if (!this.isIpcRenderer()) return;
    if (!reply) return ele.ipcRenderer.send("steam_fun", fun, params);
    else return ele.ipcRenderer.sendSync("steam_fun", fun, params);
  }

  static steamFunAsync(fun: string, reply: boolean = false, params: any = null) {
    if (!this.isIpcRenderer()) return;
    console.log("steamFunAsync:", fun, params);
    if (!reply) return ele.ipcRenderer.send("steam_fun_async", fun, params);
    else return ele.ipcRenderer.sendSync("steam_fun_async", fun, params);
  }

  /**
   * 指定model调用
   */
  static steamModel(model: string, fun: string, reply: boolean = true, ...params: any[]) {
    if (!this.isIpcRenderer()) return;
    if (!reply) return ele.ipcRenderer.send('steam_fun', 'steamModel', [model, fun, ...params]);
    else return ele.ipcRenderer.sendSync('steam_fun', 'steamModel', [model, fun, ...params]);
  }

  /**
   * 指定model调用
   */
  static steamModelAsync(model: string, fun: string, reply: boolean = true, ...params: any[]) {
    if (!this.isIpcRenderer()) return;
    if (!reply) return ele.ipcRenderer.send('steam_fun_async', 'steamModelAsync', [model, fun, ...params]);
    else return ele.ipcRenderer.sendSync('steam_fun_async', 'steamModelAsync', [model, fun, ...params]);
  }

  static isIpcRenderer(): boolean {
    if (!ele && !ele.ipcRenderer) {
      console.error("ele or ipcRenderer is not defined.");
      return false;
    }
    return true;
  }

  static isSteam(): boolean {
    if (!this.isIpcRenderer()) return false;
    return ele.ipcRenderer.sendSync('steam_fun', 'isSteam');
  }
}

export enum SteamVisibility {
  Public,
  FriendsOnly,
  Private,
  Unlisted,
}

export interface CreativeWorkshop {
  title: string;
  description: string;
  changeNote: string;
  previewPath: string; // "data:image/jpeg;base64,........",
  contentPath: any; // { "en": "base64" },
  tags: Array<string>, // ["tag1", "tag2"],
  visibility: SteamVisibility;
}

export const enum SteamCallback {
  PersonaStateChange = 0,
  SteamServersConnected = 1,
  SteamServersDisconnected = 2,
  SteamServerConnectFailure = 3,
  LobbyDataUpdate = 4,
  LobbyChatUpdate = 5,
  P2PSessionRequest = 6,
  P2PSessionConnectFail = 7,
  GameLobbyJoinRequested = 8,
  MicroTxnAuthorizationResponse = 9
}

/**
 * Steam 好友状态变更标志（按位或组合）
 * 用于 PersonaStateChange 回调的 flags.bits
 */
export const enum EPersonaChange {
  /** 1：昵称（Steam Display Name）发生变化 */
  k_EPersonaChangeName = 0x0001,

  /** 2：状态变化（在线/离线/忙碌等） */
  k_EPersonaChangeStatus = 0x0002,

  /** 4：刚上线 */
  k_EPersonaChangeComeOnline = 0x0004,

  /** 8：刚下线 */
  k_EPersonaChangeGoneOffline = 0x0008,

  /** 16：当前正在玩的游戏变了 */
  k_EPersonaChangeGamePlayed = 0x0010,

  /** 32：所在服务器发生变化 */
  k_EPersonaChangeGameServer = 0x0020,

  /** 64：头像变化 */
  k_EPersonaChangeAvatar = 0x0040,

  /** 128：加入某个来源（群组、战队等） */
  k_EPersonaChangeJoinedSource = 0x0080,

  /** 256：离开某个来源（群组、战队等） */
  k_EPersonaChangeLeftSource = 0x0100,

  /** 512：好友关系发生变化（加好友、删除好友、屏蔽等） */
  k_EPersonaChangeRelationshipChanged = 0x0200,

  /** 1024：第一次设置昵称 */
  k_EPersonaChangeNameFirstSet = 0x0400,

  /** 2048：直播状态变化（Broadcast） */
  k_EPersonaChangeBroadcast = 0x0800,

  /** 4096：好友昵称（备注）变化 */
  k_EPersonaChangeNickname = 0x1000,

  /** 8192：Steam 等级变化 */
  k_EPersonaChangeSteamLevel = 0x2000,

  /** 16384：RichPresence（游戏内状态文本）变化 */
  k_EPersonaChangeRichPresence = 0x4000,
}
