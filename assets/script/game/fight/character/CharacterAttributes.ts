// 角色属性接口
interface CharacterAttributes {
  HP: [number, number];
  ATK: number;
  SPEED: number;
}

// 角色完整信息接口（存储处理后的号位数字）
interface Character extends CharacterAttributes {
  position: number; // 处理后的号位数字（如1号位→0）
  name: string;     // 角色名
}

// 解析结果类型
type ParseResult = Record<string, Character>;