// import { _decorator, find, instantiate, Prefab, resources } from "cc";
// import { CSVManager } from "../uitls/csvManager";
// const { ccclass, property } = _decorator;

// @ccclass("ConfigManager")
// export class ConfigManager {
//     static _instance:ConfigManager;
//     static get instance(){
//         if(this._instance)
//         {
//             return this._instance;
//         }
//         this._instance = new ConfigManager();
//         return this._instance;
//     }
//     csvManager:CSVManager =new CSVManager();
    
//     //加载表的总数
//     private csvCount:number = 0;
//     private currentLoadCount:number =0;
//     loadCsv()
//     {
//         resources.loadDir("datas",(err:any,assets)=>{
//             if(err){
//                 return;
//             }
//             this.csvCount = assets.length;
//             assets.forEach((item)=>{
//                 resources.load("datas/"+item.name,(err,asset:any)=>{
//                     if(err)
//                     {
//                         console.log(err.message||err);
//                         return;
//                     }
//                     let text = asset.text;
//                     if(text)
//                     {
//                       this.csvManager.addTable(item.name,text);

//                         this.checkLoadCsvFinish();
//                     }
//                 })
//             })
            
//         })
//     }

//     private checkLoadCsvFinish(){
//         this.currentLoadCount++;
//         if(this.currentLoadCount>= this.csvCount)
//         {
//             console.log("表格加载完成")
//         }
//     }

//     public queryAll(tableName:string, key:string, value:any){
//         return this.csvManager.queryAll(tableName,key,value);
//     }

// }