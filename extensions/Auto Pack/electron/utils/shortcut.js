const { app, globalShortcut } = require('electron');

var win;

function setMainWindowForShortcut (data) {
  win = data;
}

function registerShortcut () {
  // 关闭应用
  globalShortcut.register('CommandOrControl+Q', () => {
    app.quit();
  });

  // 老板键
  globalShortcut.register('Ctrl+Alt+Q', () => {
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
    }
  });

}

function unRegisterShortcut () {
  globalShortcut.unregisterAll();
}

module.exports = { registerShortcut, unRegisterShortcut, setMainWindowForShortcut };
