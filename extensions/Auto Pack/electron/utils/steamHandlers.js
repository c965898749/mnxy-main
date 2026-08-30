const { requestFunc } = require('./request');
const { saveFiles, cleanupFiles } = require('./filesHelper');

var client;
var appid;
var callbackMap = new Map();

module.exports = {
  /*** ccc端无需关注该函数，不可删除 */
  setClient: function (data) {
    client = data;
  },
  setAppid: function (data) {
    appid = data;
  },
  isSteam: function () {
    return client ? true : false;
  },


  /*** 获取steam用户信息 */
  getUserInfo: function () {
    const userinfo = {
      name: client.localplayer.getName(),
      level: client.localplayer.getLevel(),
      ipCountry: client.localplayer.getIpCountry(),
      steamId: client.localplayer.getSteamId()
    }
    return userinfo;
  },

  //#region 成就
  /*** 检查achievement成就是否已经获得 */
  isAchievementActivated: function (achievement) {
    const isAchievement = client.achievement.isActivated(achievement);
    return isAchievement;
  },

  /*** 获得achievement成就 */
  getAchievement: function (achievement) {
    return client.achievement.activate(achievement);
  },

  /*** 清除achievement成就 */
  clearAchievement: function (achievement) {
    return client.achievement.clear(achievement);
  },

  activateToWebPage: function (url) {
    return client.overlay.activateToWebPage(url);
  },
  //#endregion 成就


  //#region 创意工坊
  /*** 创建->修改->订阅 */
  createItem: async function (updateDetails) {
    try {
      let data = updateDetails;
      const filePath = await saveFiles(updateDetails);
      data.previewPath = filePath.previewFilePath;
      data.contentPath = filePath.contentFilePath;
      const result = await client.workshop.createItem(appid);
      const { itemId } = result;
      const updateResult = await client.workshop.updateItem(itemId, data, appid);
      await client.workshop.subscribe(itemId);
      cleanupFiles(filePath.directoryPath);
      return { success: true, msg: itemId };
    } catch (error) {
      return { success: false, msg: error };
    }
  },

  /*** 修改 */
  updateItem: async function (data) {
    let { itemId, updateDetails } = data;
    try {
      const cleanedId = cleanItemId(itemId);
      const filePath = await saveFiles(updateDetails);
      if (filePath.contentFilePath) {
        updateDetails.contentPath = filePath.contentFilePath;
      }
      if (filePath.previewFilePath) {
        updateDetails.previewPath = filePath.previewFilePath;
      }
      try {
        const result = await client.workshop.updateItem(cleanedId, updateDetails, appid);
        // 仅在有预览路径或内容路径时才清理文件
        if (filePath.directoryPath) {
          cleanupFiles(filePath.directoryPath);
        }
        return { success: true, msg: result };
      } catch (error) {
        return { success: false, msg: error };
      }
    } catch (error) {
      return { success: false, msg: error };
    }
  },

  /*** 订阅 */
  subscribe: async function (itemId) {
    try {
      const cleanedId = cleanItemId(itemId);
      const result = await client.workshop.subscribe(cleanedId);
      return { success: true, msg: result };
    } catch (error) {
      return { success: false, msg: error };
    }
  },

  /*** 取消订阅 */
  unsubscribe: async function (itemId) {
    try {
      const cleanedId = cleanItemId(itemId);
      await client.workshop.unsubscribe(cleanedId);
      return { success: true, msg: '取消订阅成功' };
    } catch (error) {
      return { success: false, msg: error };
    }
  },

  /*** 通过itemId获取Info */
  getItemInfo: async function (itemId) {
    try {
      const cleanedId = cleanItemId(itemId);
      const state = await client.workshop.state(cleanedId);
      const installInfo = await client.workshop.installInfo(cleanedId);
      const downloadInfo = await client.workshop.downloadInfo(cleanedId);
      return { success: true, state, installInfo, downloadInfo };
    } catch (error) {
      return { success: false, msg: error };
    }
  },

  /*** 获取item */
  getItems: async function (itemIdArray) {
    try {
      const cleanedIds = itemIdArray.map(id => cleanItemId(id));
      const items = await client.workshop.getItems(cleanedIds)
      return { success: true, items };
    } catch (error) {
      return { success: false, msg: error };
    }
  },

  /*** 获取订阅列表 */
  getSubscribedItems: async function () {
    try {
      const items = await client.workshop.getSubscribedItems();
      return { success: true, items };
    } catch (error) {
      return { success: false, msg: error };
    }
  },

  /*** 获取创意工坊所有的item */
  getAllItems: async function (params) {
    try {
      const url = 'https://api.steampowered.com/IPublishedFileService/QueryFiles/v1/';
      const response = await requestFunc(url, params);
      return { success: true, response };
    } catch (error) {
      return { success: false, msg: error };
    }
  },

  /*** 下载创意工坊 */
  download: async function (data) {
    const { itemId, highPriority } = data;
    try {
      const cleanedId = cleanItemId(itemId);
      const success = await client.workshop.download(cleanedId, highPriority);
      if (success) {
        return { success: true, msg: '下载成功' };
      } else {
        return { success: false, msg: '下载失败' };
      }
    } catch (error) {
      return { success: false, msg: error };
    }
  },
  //#endregion 创意工坊


  //#region 云存储

  /*** 帐户是否启用云存储 */
  isEnabledForAccount: function () {
    return client.cloud.isEnabledForAccount();
  },

  /*** 应用是否启用云存储 */
  isEnabledForApp: function () {
    return client.cloud.isEnabledForApp(appid);
  },

  /*** 读取云存储文件 */
  readFile: function (fileName) {
    try {
      const data = client.cloud.readFile(fileName);
      return { success: true, data };
    } catch (error) {
      return { success: false, msg: error };
    }
  },

  /*** 写入云存储文件 */
  writeFile: function (data) {
    const { fileName, fileData } = data;
    try {
      const success = client.cloud.writeFile(fileName, fileData);
      return { success: success, msg: success ? '写入成功' : '写入失败' };
    } catch (error) {
      return { success: false, msg: error };
    }
  },

  /*** 删除云存储文件 */
  deleteFile: function (fileName) {
    try {
      const success = client.cloud.deleteFile(fileName);
      return { success: success, msg: success ? '删除成功' : '删除失败' };
    } catch (error) {
      return { success: false, msg: error };
    }
  },

  /*** 检查云存储文件是否存在 */
  fileExists: function (fileName) {
    try {
      const exists = client.cloud.fileExists(fileName);
      return { success: true, exists };
    } catch (error) {
      return { success: false, msg: error };
    }
  },

  //#endregion


  //#region callback
  /*** 订阅 */
  registerSteamCallback: function (data) {
    try {
      const { callbackType, handler } = data; // callbackType: SteamCallback 类型, handler: 回调函数
      // 防止重复注册
      if (callbackMap.has(callbackType)) {
        console.warn(`Steam callback ${callbackType} already registered`);
        return { success: false, msg: 'already registered' };
      }

      // 注册 Steam 回调，并返回 Handle
      const handle = client.callback.register(callbackType, handler);
      callbackMap.set(callbackType, handle);

      return { success: true, handle };
    } catch (error) {
      return { success: false, msg: error };
    }
  },
  /*** 取消订阅 */
  unRegisterSteamCallback: function (callbackType) {
    const handle = callbackMap.get(callbackType);
    if (handle) {
      handle.disconnect();
      callbackMap.delete(callbackType);
    }
  },
  //#endregion


  //#region auth
  getSessionTicketWithSteamId: async function (data) {
    const { steamId64, timeoutSeconds } = data;
    try {
      const ticket = await client.auth.getSessionTicketWithSteamId(BigInt(steamId64), timeoutSeconds,);
      const bytes = ticket.getBytes();
      setTimeout(() => { try { ticket.cancel(); } catch { } }, 30_000);
      return { success: true, ticket: bytes, };
    } catch (error) {
      return { success: false, error: String(error), };
    }
  },

  getSessionTicketWithIp: async function (data) {
    const { ip, timeoutSeconds } = data;
    try {
      const ticket = await client.auth.getSessionTicketWithIp(ip, timeoutSeconds,);
      const bytes = ticket.getBytes();
      setTimeout(() => { try { ticket.cancel(); } catch { } }, 30_000);
      return { success: true, ticket: bytes, };
    } catch (error) {
      return { success: false, error: String(error), };
    }
  },

  getAuthTicketForWebApi: async function (data) {
    const { identity, timeoutSeconds } = data;
    try {
      const ticket = await client.auth.getAuthTicketForWebApi(identity, timeoutSeconds,);
      const bytes = ticket.getBytes();
      setTimeout(() => { try { ticket.cancel(); } catch { } }, 30_000);
      return { success: true, ticket: bytes, };
    } catch (error) {
      return { success: false, error: String(error), };
    }
  },

  //#endregion



  /*** 指定model调用 */
  steamModel: function (args) {
    return client[args[0]][args[1]](...args.slice(2));
  },

  /*** 指定model调用 */
  steamModelAsync: async function (args) {
    return client[args[0]][args[1]](...args.slice(2));
  },
};



const cleanItemId = function (itemId) {
  if (typeof itemId === 'string') {
    return BigInt(itemId.replace(/n$/, ''));
  } else if (typeof itemId === 'number') {
    return BigInt(itemId);
  } else if (typeof itemId === 'bigint') {
    return itemId;
  } else {
    throw new Error('Unsupported itemId type');
  }
};