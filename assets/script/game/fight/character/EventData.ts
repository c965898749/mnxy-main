// 定义类型接口
interface Unit {
  side: string;
  name: string;
  position: number;
  hp: {
    before: number;
    after: number;
  };
}

interface EventData {
  event: string;
  units: Unit[];
}


