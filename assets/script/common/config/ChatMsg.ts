// 聊天频道类型
export enum ChannelType {
    WORLD = 1,     // 世界聊天
    CAVE = 2,      // 洞府聊天
    PRIVATE = 3    // 单人私聊
}

// 消息内容类型
export enum MsgContentType {
    TEXT = 1,
    VOICE = 2,
    IMAGE = 3,
}

export interface ChatMsg {
    channelType: ChannelType;
    content: string;
    senderName: string;
    contentType: MsgContentType;
    senderId: number;
    targetId: number;
    msgId: number;
    itemId: number;
    sendTime: string;
}

