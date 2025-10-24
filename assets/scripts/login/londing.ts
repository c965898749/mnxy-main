import { _decorator, assetManager, clamp01, Component, find, instantiate, Label, Node, ProgressBar, resources } from 'cc';
const { ccclass, property } = _decorator;
import { Main } from '../StartGame/Main';
import { AudioMgr } from '../manager/AudioMgr';
@ccclass('londing')
export class londing extends Component {
  @property(ProgressBar) loadBar: ProgressBar = null;     // 进度条
  @property(Label) desc: Label = null;
  start() {

  }

  update(deltaTime: number) {

  }

  protected onLoad(): void {
    // 获取已加载的分包
    // let resourceBundle = assetManager.bundles.get("resources");
    // resourceBundle = assetManager.getBundle("resources");
    let resourceBundle = assetManager.resources;

    // 获取某个指定文件夹下的所有资源信息
    //uI
    const resourceUiPaths = resourceBundle.getDirWithPath("./prefab/ui/");
    // //卡牌
    // const resourceCardPaths = resourceBundle.getDirWithPath("./prefab/card/");
    // //头像
    // const resourceHearderPaths = resourceBundle.getDirWithPath("./prefab/card/headercard/");
    let resourcePaths = []
    resourcePaths.push(...resourceUiPaths)
    // resourcePaths.push(...resourceCardPaths)
    // resourcePaths.push(...resourceHearderPaths)
    const maxLen = resourcePaths.length;
    console.log(resourcePaths, 4444)
    // 设置进度相关
    this.desc.string = ""
    this.loadBar.progress = 0;

    let loadCount = 0;
    for (let i = 0; i < maxLen; ++i) {
      const path = resourcePaths[i].path;
      resources.load(path,
        (completedCount: number, totalCount: number, item) => {
          //console.log("progress:", completedCount, totalCount);
        },
        (err: Error | null, prefab: any) => {
          if (err) {
            return console.error("preload failed: " + err.message);
          }
          if (prefab) {
            let node = instantiate(prefab);
            if (!Main.instance.dicPanel[path]) {
              Main.instance.dicPanel[path] = node;
            }
          }
          // 加载进度改变
          loadCount++;
          this.desc.string = `加载${path}`
          this.loadBar.progress = clamp01(loadCount / maxLen);
          console.log(`预加载的资源：${path}, 进度${this.loadBar.progress}`);

          if (loadCount >= maxLen) {
            this.desc.string = '加载完成'
            this.node.parent = null;
            this.node = null;
            Main.instance.showPanel("prefab/ui/HomePanel", 1)
            Main.instance.showPanel("prefab/ui/Floor", 100)
          }
        }
      );
    }
  }

}


