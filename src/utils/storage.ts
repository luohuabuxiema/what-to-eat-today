import { PRESET_CATEGORIES, type FoodItem } from './presetData';

const STORAGE_KEYS = {
  FOOD_LIST: 'WHAT_TO_EAT_FOODS_V1',
  PRESET_ID: 'WHAT_TO_EAT_PRESET_ID_V1',
  PRESET_LIST: 'WHAT_TO_EAT_PRESETS_V1',
  HISTORY: 'WHAT_TO_EAT_HISTORY_V1'
};

export interface HistoryRecord {
  id: string;
  name: string;
  emoji: string;
  category: string;
  time: string;
  date: string;
}

// 获取初始化食物列表
export function getStoredFoods(): FoodItem[] {
  try {
    const data = uni.getStorageSync(STORAGE_KEYS.FOOD_LIST);
    if (data && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (e) {
    console.error('Failed to get foods from storage', e);
  }
  const defaultFoods: FoodItem[] = PRESET_CATEGORIES[0].foods.map((f, idx) => ({
    id: `food_${Date.now()}_${idx}`,
    ...f
  }));
  saveStoredFoods(defaultFoods);
  return defaultFoods;
}

// 保存食物列表
export function saveStoredFoods(foods: FoodItem[]): void {
  try {
    uni.setStorageSync(STORAGE_KEYS.FOOD_LIST, foods);
  } catch (e) {
    console.error('Failed to save foods', e);
  }
}

// 预设也允许用户维护；首次使用时从内置数据深拷贝，避免直接修改常量。
export function getStoredPresets() {
  try {
    const data = uni.getStorageSync(STORAGE_KEYS.PRESET_LIST);
    if (data && Array.isArray(data)) {
      // 将旧版“广西午晚餐合并卡”迁移为分开的午餐与晚餐卡片。
      const normalizedData = data.filter((preset: { id: string }) => preset.id !== 'guangxi');
      // 新版本新增内置预设时，保留用户编辑，同时补充尚未出现的预设包。
      const missing = PRESET_CATEGORIES
        .filter(defaultPreset => !normalizedData.some((preset: { id: string }) => preset.id === defaultPreset.id))
        .map(defaultPreset => JSON.parse(JSON.stringify(defaultPreset)));
      if (missing.length > 0 || normalizedData.length !== data.length) {
        const merged = [...normalizedData, ...missing];
        saveStoredPresets(merged);
        return merged;
      }
      return data;
    }
  } catch (e) {}
  const presets = JSON.parse(JSON.stringify(PRESET_CATEGORIES));
  saveStoredPresets(presets);
  return presets;
}

export function saveStoredPresets(presets: typeof PRESET_CATEGORIES): void {
  try {
    uni.setStorageSync(STORAGE_KEYS.PRESET_LIST, presets);
  } catch (e) {
    console.error('Failed to save presets', e);
  }
}

// 获取历史记录
export function getStoredHistory(): HistoryRecord[] {
  try {
    const history = uni.getStorageSync(STORAGE_KEYS.HISTORY);
    return (history && Array.isArray(history)) ? history : [];
  } catch (e) {
    return [];
  }
}

// 添加历史记录
export function addHistoryRecord(food: FoodItem): HistoryRecord | undefined {
  try {
    const list = getStoredHistory();
    const now = new Date();
    const record: HistoryRecord = {
      id: `hist_${Date.now()}`,
      name: food.name,
      emoji: food.emoji || '🍲',
      category: food.category || '推荐',
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: `${now.getMonth() + 1}月${now.getDate()}日`
    };
    list.unshift(record);
    if (list.length > 50) {
      list.pop();
    }
    uni.setStorageSync(STORAGE_KEYS.HISTORY, list);
    return record;
  } catch (e) {
    console.error('Failed to add history record', e);
  }
}

// 清空历史记录
export function clearStoredHistory(): void {
  try {
    uni.removeStorageSync(STORAGE_KEYS.HISTORY);
  } catch (e) {}
}

// 切换/应用场景预设包
export function getStoredPresetId(): string {
  try {
    const id = uni.getStorageSync(STORAGE_KEYS.PRESET_ID);
    if (id) return id;
  } catch (e) {}
  return 'auto';
}

export function saveStoredPresetId(presetId: string): void {
  try {
    uni.setStorageSync(STORAGE_KEYS.PRESET_ID, presetId);
  } catch (e) {}
}

// 切换/应用场景预设包
export function applyPreset(presetId: string): FoodItem[] {
  saveStoredPresetId(presetId);
  
  let targetId = presetId;
  if (presetId === 'auto') {
    const hour = new Date().getHours();
    targetId = hour >= 17 ? 'guangxi_dinner' : 'guangxi_lunch';
  }
  
  const presets = getStoredPresets();
  const preset = presets.find(p => p.id === targetId) || presets[0];
  const newFoods: FoodItem[] = preset.foods.map((f, idx) => ({
    id: `food_${Date.now()}_${idx}`,
    ...f
  }));
  saveStoredFoods(newFoods);
  return newFoods;
}

// 清空全部
export function clearAllFoods(): FoodItem[] {
  saveStoredFoods([]);
  return [];
}
