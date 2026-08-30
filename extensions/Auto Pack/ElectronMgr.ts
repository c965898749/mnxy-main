//@ts-ignore
const ele = (window as any).electron;

/**
 * ElectronMgr.ts
 */
export default class ElectronMgr {

  /**
   * 获取启动参数[完整] 
   * @formatting 格式化条件：路径/xxx.exe -id=2 -token=12313
   * @return     {id:"2",token:"12313"}
   */
  static getLaunchArgs(formatting: boolean = false) {
    if (!this.isIpcRenderer()) return;
    return ele.ipcRenderer.sendSync("getLaunchArgs", formatting);
  }

  /**
   * 设置窗口大小
   */
  static setWinSize(width: number, height: number) {
    if (!this.isIpcRenderer()) return;
    ele.ipcRenderer.send("cst_setWinSize", width.toString(), height.toString());
  }

  /**
   * 设置是否全屏
   */
  static setFullScreen(full: boolean) {
    if (!this.isIpcRenderer()) return;
    ele.ipcRenderer.send("cst_setFullScreen", full.toString());
  }

  /**
   * 通知
   */
  static showNotification(title: string, body: string) {
    if (!this.isIpcRenderer()) return;
    ele.ipcRenderer.send("cst_notification", title.toString(), body.toString());
  }

  /**
   * 开关debug
   * ！！！正式环境必须通过打包关闭
   */
  static devTools(debug: boolean) {
    if (!this.isIpcRenderer()) return;
    ele.ipcRenderer.send("cst_setDebug", debug);
  }

  /**
   * 设置主题颜色
   * @themeSource light | dark | system
   */
  static setThemeSource(themeSource: string) {
    if (!this.isIpcRenderer()) return;
    ele.ipcRenderer.send("cst_themeSource", themeSource.toString());
  }

  /**
   * 无感打印
   * 需要电脑连接打印机驱动且设置默认打印机
   * @return data.state >= 0 打印成功
   */
  static print(base64: string) {
    if (!this.isIpcRenderer()) return;
    const result = ele.ipcRenderer.sendSync("cst_print", base64);
    return result;
  }

  /**
   * 退出游戏
   */
  static quit() {
    if (!this.isIpcRenderer()) return;
    ele.ipcRenderer.send("cst_quit");
  }

  /**
  * 自定义命令
  * 无需回复的 reply=false
  */
  static cstFun(fun: string, reply: boolean = false, params: any = null) {
    if (!this.isIpcRenderer()) return;
    if (!reply) return ele.ipcRenderer.send("cst_fun", fun, params);
    else return ele.ipcRenderer.sendSync("cst_fun", fun, params);
  }
  /*** await ElectronMgr.cstFunAsync("func", true, params) */
  static cstFunAsync(fun: string, reply: boolean = false, params: any = null) {
    if (!this.isIpcRenderer()) return;
    if (!reply) return ele.ipcRenderer.send("cst_fun_async", fun, params);
    else return ele.ipcRenderer.sendSync("cst_fun_async", fun, params);
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