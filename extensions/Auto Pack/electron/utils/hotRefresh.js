
const { app, BrowserWindow, ipcMain } = require('electron');
const Request = require('request');
const AdmZip = require('adm-zip');
const Fs = require('fs');
const Fse = require('fs-extra');
const Path = require('path');
const LocalVersion = app.getVersion();

let url = ``;
let callback;
let mainWindow;
let progressWin;
let downloadRequest;

ipcMain.on('retry-update', (event) => {
  downloadRequest && downloadRequest.abort();
  module.exports.hotRefreshStart(callback);
});
ipcMain.on('close-update', (event) => {
  progressWin && progressWin.close();
  mainWindow && mainWindow.close();
});

module.exports = {
  setUrlForHotRefresh (data) {
    url = data;
  },
  setMainWindowForHotRefresh (window) {
    mainWindow = window;
  },
  async hotRefreshStart (cb) {
    if (cb) callback = cb;
    /*** 通过读取 url/config.json 中的version字段获取线上版本号 */
    const onlineVersion = await getOnlineVersion();

    /*** 比较线上线下的版本号是否一致 */
    if (LocalVersion === onlineVersion) { callback(); return; }

    /*** 创建显示进度条的子界面 */
    if (!progressWin) createProgressWindow();
    /*** 定义资源地址，resources.zip即为构建后的目录压缩包 */
    const updateZipUrl = `${url}/${onlineVersion}/resources.zip`;
    /*** 定义解压缩地址，即为resources目录 */
    const resourcesPath = Path.dirname(process.resourcesPath);
    /*** 定义与progressWin通信的webContents */
    const progressContents = progressWin.webContents;
    /*** 通知progressWin开始更新 */
    progressContents.send('update-started');
    progressContents.send('update-tip', '正在更新资源，请勿关闭窗口');
    /*** 开始下载 */
    downloadFile({ url: updateZipUrl, targetPath: resourcesPath },
      async (progress) => {
        progressContents.send('update-progress', progress);
      }).then(async (filePath) => {
        console.log(filePath);
        progressContents.send('update-tip', `下载文件成功，正在安装到本地中`);
        const zip = new AdmZip(filePath)
        zip.extractAllToAsync(resourcesPath, true, (err) => {
          if (err) {
            console.error(err)
            return
          }
          Fse.removeSync(filePath)

          progressContents.send('update-tip', `安装完成，即将重启`);
          setTimeout(() => {
            /*** 重新启动 */
            app.relaunch();
            app.exit(0);
          }, 2000);
        })
      }).catch(err => {
        progressContents.send('update-tip', `下载文件失败:${err}`);
      }).finally(() => {

      });

  },
};


function createProgressWindow () {
  progressWin = new BrowserWindow({
    parent: mainWindow,
    width: 500,
    height: 250,
    backgroundColor: '#F5F5F5',
    frame: false,
    movable: false,
    maximizable: false,
    minimizable: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
  });
  progressWin.loadFile(Path.dirname(__dirname) + '/progress/progress.html');
}

function closeProgressWindow () {
  if (progressWin) {
    progressWin.close();
    progressWin = null;
  }
}
function download (url, targetPath, cb = () => { }) {
  let status
  const req = Request({
    method: 'GET',
    uri: encodeURI(url)
  })
  downloadRequest = req
  try {
    const stream = Fs.createWriteStream(targetPath)
    let len = 0
    let cur = 0
    req.pipe(stream)
    req.on('response', (data) => {
      len = parseInt(data.headers['content-length'])
    })
    req.on('data', (chunk) => {
      cur += chunk.length
      const progress = (100 * cur / len).toFixed(2)
      status = 'progressing'
      cb(status, progress)
    })
    req.on('end', function () {
      if (req.response.statusCode === 200) {
        if (len === cur) {
          console.log(targetPath + ' Download complete ')
          status = 'completed'
          cb(status, 100)
        } else {
          stream.end()
          removeFile(targetPath)
          status = 'error'
          cb(status, '网络波动，下载文件不全')
        }
      } else {
        stream.end()
        removeFile(targetPath)
        status = 'error'
        cb(status, req.response.statusMessage)
      }
    })
    req.on('error', (e) => {
      stream.end()
      removeFile(targetPath)
      if (len !== cur) {
        status = 'error'
        cb(status, '网络波动，下载失败')
      } else {
        status = 'error'
        cb(status, e)
      }
    })
  } catch (error) {
    console.log(error)
  }
}
function removeFile (targetPath) {
  try {
    Fse.removeSync(targetPath)
  } catch (error) {
    console.log(error)
  }
}
async function downloadFile ({ url, targetPath, folder = './' }, cb = () => { }) {
  if (!targetPath || !url) { throw new Error('targetPath or url is nofind') }

  try {
    await Fse.ensureDirSync(Path.join(targetPath, folder))
  } catch (error) {
    throw new Error(error)
  }
  return new Promise((resolve, reject) => {
    const name = url.split('/').pop()
    const filePath = Path.join(targetPath, folder, name)
    download(url, filePath, (status, result) => {
      if (status === 'completed') {
        resolve(filePath)
      }
      if (status === 'error') {
        reject(result)
      }
      if (status === 'progressing') {
        cb && cb(result)
      }
    })
  })
}
function getOnlineVersion () {
  return new Promise((resolve, reject) => {
    Request(`${url}/config.json`, { json: true }, (error, response, body) => {
      if (error) {
        console.error('Error fetching JSON:', error);
        // progressContents.send('update-tip', `获取版本号失败:${error}`);
        reject(error)
      } else {
        const version = body.version;
        console.log(version);
        // progressContents.send('update-tip', `获取版本号成功:${version}`);
        resolve(version);
      }
    });
  })
}