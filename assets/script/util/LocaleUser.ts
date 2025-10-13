// //////////////////////////////////////////////////////////////////////////////////////
// //
// //  Jason
// //  23-10-20
// //
// //////////////////////////////////////////////////////////////////////////////////////

// import { sys } from "cc";

// /*
// root:{
// 	global:{
// 		key:value,
// 		key:value,
// 		...
// 	},
// 	user:{
// 		xxxxx(playerid):{
// 			key:value,
// 			key:value,
// 			...
// 		},
// 		xxxxx(playerid):{
// 			key:value,
// 			key:value,
// 			...
// 		},
// 		...
// 	}
// }
// */

// export class LocaleUser {
// 	private constructor () {}

// 	private static root:any;
// 	private static userid:string;

// 	private static getSafeRoot():any {
// 		if (!LocaleUser.root) {
// 			let str:string = sys.localStorage.getItem("LOCALEUSER_ROOT");
// 			if (str && str.length > 0) {
// 				LocaleUser.root = JSON.parse(str);
// 			}
// 			if (!LocaleUser.root) {
// 				LocaleUser.root = {
// 					global:{},
// 					user:{}
// 				}
// 			}
// 		}
// 		return LocaleUser.root;
// 	}

// 	/**
//      * 设置全局值，key 和 value 不要空字符串。
//      */
//     public static setGlobal(key:string, value:string):void {
// 		if (key && key.length > 0 && value && value.length > 0) {
// 			let root:any = LocaleUser.getSafeRoot();
// 			root.global[key] = value;
// 		}
//     }

// 	/**
//      * 获取全局值，key 不要空字符串。
//      */
//     public static getGlobal(key:string):string {
// 		if (key && key.length > 0) {
// 			let root:any = LocaleUser.getSafeRoot();
// 			return root.global[key];
// 		}
//     }

// 	/**
//      * 设置userid，userid 不要空字符串。
//      */
//     public static setUserId(userid:string):void {
// 		if (userid && userid.length > 0) {
// 			LocaleUser.userid = userid;
// 		}
//     }

// 	/**
//      * 设置用户值，请确保先前已设置userid，key 和 value 不要空字符串。
//      */
//     public static setUser(key:string, value:string):void {
// 		if (LocaleUser.userid && LocaleUser.userid.length > 0) {
// 			if (key && key.length > 0 && value && value.length > 0) {
// 				let root:any = LocaleUser.getSafeRoot();
// 				if (!root.user[LocaleUser.userid]) {
// 					root.user[LocaleUser.userid] = {};
// 				}
// 				let userRoot:any = root.user[LocaleUser.userid];
// 				userRoot[key] = value;
// 			}
// 		}
//     }

// 	/**
//      * 设置用户值，请确保先前已设置userid，key 不要空字符串。
//      */
//     public static getUser(key:string):string {
// 		if (LocaleUser.userid && LocaleUser.userid.length > 0) {
// 			if (key && key.length > 0) {
// 				let root:any = LocaleUser.getSafeRoot();
// 				if (!root.user[LocaleUser.userid]) {
// 					root.user[LocaleUser.userid] = {};
// 				}
// 				let userRoot:any = root.user[LocaleUser.userid];
// 				return userRoot[key];
// 			}
// 		}
//     }

// 	/**
//      * 设置值之后，最后记得刷入一下才能保存到本地文件。
//      */
//     public static flush():void {
// 		let root:any = LocaleUser.getSafeRoot();
// 		let str:string = JSON.stringify(root);
// 		sys.localStorage.setItem("LOCALEUSER_ROOT", str);
//     }

// 	/**
//      * 清除所有保存的值。
//      */
//     public static deleteAll():void {
// 		LocaleUser.root = null;
// 		sys.localStorage.clear();
//     }
// }