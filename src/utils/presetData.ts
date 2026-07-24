// 默认预设分类与食物库
export interface FoodItem {
  id?: string;
  name: string;
  emoji: string;
  category: string;
  active?: boolean;
}

export interface PresetCategory {
  id: string;
  name: string;
  icon: string;
  desc: string;
  foods: FoodItem[];
}

export const PRESET_CATEGORIES: PresetCategory[] = [
  {
    id: 'default',
    name: '热门全能包',
    icon: '🔥',
    desc: '包含最受欢迎的日常各类美食，解决绝大多数选择困难症',
    foods: [
      { name: '麻辣烫', emoji: '🍢', category: '小吃', active: true },
      { name: '火锅', emoji: '🍲', category: '正餐', active: true },
      { name: '螺蛳粉', emoji: '🍜', category: '粉面', active: true },
      { name: '汉堡炸鸡', emoji: '🍔', category: '快餐', active: true },
      { name: '烧烤串串', emoji: '🍢', category: '夜宵', active: true },
      { name: '日式拉面', emoji: '🍜', category: '粉面', active: true },
      { name: '酸菜鱼', emoji: '🐟', category: '正餐', active: true },
      { name: '广式饮茶', emoji: '🥟', category: '特色', active: true },
      { name: '湘菜/炒菜', emoji: '🌶️', category: '正餐', active: true },
      { name: '寿司/刺身', emoji: '🍣', category: '日料', active: true },
      { name: '披萨/意面', emoji: '🍕', category: '西餐', active: true },
      { name: '轻食沙拉', emoji: '🥗', category: '减脂', active: true }
    ]
  },
  {
    id: 'date',
    name: '情侣约会',
    icon: '👩‍❤️‍👨',
    desc: '适合两个人一起慢慢享用的浪漫与美味',
    foods: [
      { name: '经典西餐牛排', emoji: '🥩', category: '西餐', active: true },
      { name: '韩式水晶烤肉', emoji: '🥓', category: '日韩', active: true },
      { name: '泰式冬阴功火锅', emoji: '🍲', category: '东南亚', active: true },
      { name: '日式精致料理', emoji: '🍣', category: '日料', active: true },
      { name: '海鲜自助大餐', emoji: '🦀', category: '自助', active: true },
      { name: '浪漫甜品下午茶', emoji: '🍰', category: '甜品', active: true },
      { name: '椰子鸡火锅', emoji: '🥥', category: '火锅', active: true },
      { name: '小资意式餐厅', emoji: '🍝', category: '西餐', active: true }
    ]
  },
  {
    id: 'takeout',
    name: '打工人外卖',
    icon: '🛵',
    desc: '快捷方便，适合工作日午餐和外卖卡位',
    foods: [
      { name: '黄焖鸡米饭', emoji: '🍗', category: '快餐', active: true },
      { name: '隆江猪脚饭', emoji: '🍖', category: '快餐', active: true },
      { name: '肯德基/麦当劳', emoji: '🍟', category: '快餐', active: true },
      { name: '重庆小面', emoji: '🍜', category: '粉面', active: true },
      { name: '兰州牛肉拉面', emoji: '🍜', category: '粉面', active: true },
      { name: '沙县小吃', emoji: '🥟', category: '快餐', active: true },
      { name: '东北手工水饺', emoji: '🥟', category: '面食', active: true },
      { name: '煲仔饭', emoji: '🍲', category: '快餐', active: true }
    ]
  },
  {
    id: 'night',
    name: '深夜夜宵',
    icon: '🌙',
    desc: '越夜越美味，解压与解馋首选',
    foods: [
      { name: '炭火烧烤串', emoji: '🍢', category: '夜宵', active: true },
      { name: '香辣小龙虾', emoji: '🦞', category: '夜宵', active: true },
      { name: '炸鸡+啤酒', emoji: '🍗', category: '夜宵', active: true },
      { name: '生滚海鲜砂锅粥', emoji: '🥣', category: '粥品', active: true },
      { name: '绝味卤味鸭脖', emoji: '🦆', category: '卤味', active: true },
      { name: '酸辣粉/冷面', emoji: '🍜', category: '小吃', active: true },
      { name: '关东煮', emoji: '🍢', category: '小吃', active: true }
    ]
  },
  {
    id: 'fitness',
    name: '减脂健康',
    icon: '🥗',
    desc: '低卡清爽无负担，减脂期必备',
    foods: [
      { name: '香煎鸡胸肉沙拉', emoji: '🥗', category: '轻食', active: true },
      { name: '金枪鱼全麦三明治', emoji: '🥪', category: '轻食', active: true },
      { name: '紫米杂粮饭团', emoji: '🍙', category: '主食', active: true },
      { name: '清蒸海鲜/虾仁', emoji: '🦐', category: '高蛋白', active: true },
      { name: '鲜榨蔬果汁', emoji: '🧃', category: '饮品', active: true },
      { name: '水煮牛肉碗', emoji: '🥩', category: '高蛋白', active: true }
    ]
  }
];

// 趣味中奖评语
PRESET_CATEGORIES.push({
  id: 'guangxi_lunch',
  name: '午餐',
  icon: '🍜',
  desc: '嗦粉、吃饭和简餐都有，适合工作日中午快速决定。',
  foods: [
    { name: '柳州螺蛳粉', emoji: '🍜', category: '粉面', active: true },
    { name: '南宁老友粉', emoji: '🍜', category: '粉面', active: true },
    { name: '桂林米粉', emoji: '🍜', category: '粉面', active: true },
    { name: '生榨米粉', emoji: '🍜', category: '粉面', active: true },
    { name: '玉林牛腩粉', emoji: '🥣', category: '粉面', active: true },
    { name: '猪脚粉', emoji: '🍜', category: '粉面', active: true },
    { name: '卷筒粉', emoji: '🥢', category: '小吃', active: true },
    { name: '黄焖鸡米饭', emoji: '🍛', category: '盖饭', active: true },
    { name: '烧鸭饭', emoji: '🍚', category: '盖饭', active: true },
    { name: '叉烧饭', emoji: '🍱', category: '盖饭', active: true },
    { name: '酸笋炒肉盖饭', emoji: '🍛', category: '盖饭', active: true },
    { name: '快餐两荤一素', emoji: '🍱', category: '简餐', active: true }
  ]
});

PRESET_CATEGORIES.push({
  id: 'guangxi_dinner',
  name: '广西晚餐',
  icon: '🍲',
  desc: '桂菜招牌加家常小炒，适合两三人一起吃晚饭。',
  foods: [
    { name: '阳朔啤酒鱼', emoji: '🐟', category: '桂菜', active: true },
    { name: '南宁柠檬鸭', emoji: '🦆', category: '桂菜', active: true },
    { name: '荔浦芋扣肉', emoji: '🥩', category: '桂菜', active: true },
    { name: '平乐十八酿', emoji: '🍲', category: '桂菜', active: true },
    { name: '全州醋血鸭', emoji: '🦆', category: '桂菜', active: true },
    { name: '梧州纸包鸡', emoji: '🍗', category: '桂菜', active: true },
    { name: '酸笋炒牛肉', emoji: '🥩', category: '家常菜', active: true },
    { name: '酸辣土豆丝', emoji: '🥔', category: '家常菜', active: true },
    { name: '番茄炒鸡蛋', emoji: '🍅', category: '家常菜', active: true },
    { name: '蒜蓉炒时蔬', emoji: '🥬', category: '家常菜', active: true },
    { name: '豆角炒肉末', emoji: '🥘', category: '家常菜', active: true },
    { name: '北海海鲜小炒', emoji: '🦞', category: '海鲜', active: true }
  ]
});

export const FUN_QUOTES: string[] = [
  "对象表示听你的，就吃这个！",
  "太棒了！不用再纠结了，立刻出发！",
  "宇宙的终极选择：今天非它莫属！",
  "转盘帮你决定好了，违者洗碗一次 😜",
  "香气已经扑鼻而来了，准备开吃！",
  "生活需要仪式感，今晚就享受它！",
  "简单粗暴，就选这个！",
  "对象偷偷点赞了这个决定 💖"
];

// 默认图标库
export const EMOJI_OPTIONS: string[] = [
  '🍲', '🍢', '🍜', '🍔', '🍕', '🍣', '🥩', '🥟', '🥗', '🦞', 
  '🍟', '🍗', '🥪', '🍰', '🧋', '🍱', '🍤', '🍙', '🌶️', '🥞'
];
