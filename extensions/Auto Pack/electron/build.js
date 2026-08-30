const { app, BrowserWindow, powerSaveBlocker } = require('electron');
const { setMainWindow } = require('./utils/ipcHandlers');
const { registerShortcut, unRegisterShortcut, setMainWindowForShortcut } = require('./utils/shortcut');
const { setClient, setAppid } = require("./utils/steamHandlers");
const { hotRefreshStart, setMainWindowForHotRefresh, setUrlForHotRefresh } = require("./utils/hotRefresh");

let win;
let client;
const debug = false;
const setFullScreen = false;
const width = 560;
const height = 1000;
const steam = false;
const steamAppID = 480;
const hotRefresh = true;
const hotRefreshUrl = "https://czx.yimem.com:5510/pc/";

if (steam) {
  const steamworks = require('steamworks.js');
  app.whenReady().then(() => {
    if (steamworks.restartAppIfNecessary(steamAppID)) {
      app.quit();
    } else {
      client = steamworks.init(steamAppID);
      if (client) {
        setClient(client);
        setAppid(steamAppID)
        init();
      } else {
        app.quit();
      }
    };
  });
} else {
  app.on('ready', init);
}
app.on('window-all-closed', () => { app.quit(); });
app.on('will-quit', () => { unRegisterShortcut(); });

function init () {
  if (hotRefresh) {
    setUrlForHotRefresh(hotRefreshUrl)
    hotRefreshStart(() => {
      createWindow();
    });
  } else {
    createWindow();
  }
}

async function createWindow () {
  win = new BrowserWindow({
    width: width,
    height: height,
    backgroundColor: '#363B40',
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
  });
  registerShortcut();
  setMainWindow(win);
  setMainWindowForShortcut(win)
  setMainWindowForHotRefresh(win);
  win.loadURL('file://' + __dirname + "/web/index.html");
  win.removeMenu();
  win.flashFrame(false);
  win.on('closed', () => { win = null; })

  if (debug) win.webContents.openDevTools();
  win.setFullScreen(setFullScreen);
  if (setFullScreen) {
    win.maximize();
  } else {
    win.unmaximize();
    win.setSize(Number(width), Number(height));
    win.center();
  }
}

if (steam) {
  require('steamworks.js').electronEnableSteamOverlay();
}