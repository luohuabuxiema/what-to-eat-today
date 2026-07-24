<template>
  <view class="container">
    <!-- iOS 风格分段选择器 -->
    <view class="segmented-control">
      <view 
        class="segment-item" 
        :class="{ active: currentTab === 'current' }"
        @tap="currentTab = 'current'"
      >
        当前菜单 ({{ foods.length }})
      </view>
      <view 
        class="segment-item" 
        :class="{ active: currentTab === 'preset' }"
        @tap="currentTab = 'preset'"
      >
        预设灵感库
      </view>
    </view>

    <!-- Tab 1: 当前转盘菜单列表 -->
    <view v-if="currentTab === 'current'" class="tab-content">
      <view class="toolbar">
        <button class="add-btn" @tap="openAddFood('current')">
          <text class="btn-icon">➕</text>
          <text>添加自定义食物</text>
        </button>

        <view class="tool-sub-row">
          <view class="text-badge">
            <text class="badge-active">已启用 {{ activeCount }} 项</text> / 共 {{ foods.length }} 项
          </view>
          
          <view class="text-actions">
            <text class="text-link" @tap="toggleSelectAll">{{ allSelected ? '全不选' : '全选' }}</text>
            <text class="text-divider">|</text>
            <text class="text-link danger" @tap="clearAll">清空全部</text>
          </view>
        </view>
      </view>

      <!-- 食物列表为空时 -->
      <view v-if="foods.length === 0" class="empty-state">
        <text class="empty-icon">🍽️</text>
        <text class="empty-title">菜单空空如也</text>
        <text class="empty-desc">你可以手动【添加食物】，或者在【预设灵感库】中一键导入套盘</text>
        <button class="empty-btn" @tap="currentTab = 'preset'">去挑选预设包</button>
      </view>

      <!-- 食物列表卡片项 -->
      <view v-else class="food-list">
        <view 
          v-for="(item, index) in foods" 
          :key="item.id || index" 
          class="food-item"
          :class="{ inactive: item.active === false }"
        >
          <view class="food-left">
            <text class="food-emoji">{{ item.emoji || '🍲' }}</text>
            <view class="food-info">
              <text class="food-name">{{ item.name }}</text>
              <text class="food-tag">{{ item.category || '自定义' }}</text>
            </view>
          </view>

          <view class="food-right">
            <switch 
              :checked="item.active !== false" 
              color="#007AFF" 
              style="transform: scale(0.8);" 
              @change="toggleItemActive(index)" 
            />
            <text class="delete-icon" @tap="deleteItem(index)">🗑️</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Tab 2: 预设灵感库 -->
    <view v-if="currentTab === 'preset'" class="tab-content">
      <view class="preset-intro">
        <text class="intro-title">💡 场景套盘一键切换</text>
        <text class="intro-desc">点击下方任意预设，即可快速替换当前转盘菜单</text>
      </view>

      <view class="preset-grid">
        <view 
          v-for="preset in presets" 
          :key="preset.id" 
          class="preset-card"
        >
          <view class="preset-header">
            <text class="preset-card-icon">{{ preset.icon }}</text>
            <view class="preset-card-info">
              <text class="preset-card-title">{{ preset.name }}</text>
              <text class="preset-card-count">{{ preset.id === 'auto' ? '自动跟随时段' : preset.foods.length + ' 种美食' }}</text>
            </view>
          </view>

          <text class="preset-card-desc">{{ preset.desc }}</text>

          <view v-if="preset.id !== 'auto'" class="preset-tags">
            <view
              v-for="(food, idx) in visiblePresetFoods(preset)" 
              :key="idx" 
              class="tag-item"
              @longpress="removePresetFood(preset.id, idx)"
            >
              {{ food.emoji }} {{ food.name }}
              <text class="tag-remove" @tap.stop="removePresetFood(preset.id, idx)">×</text>
            </view>
            <view
              v-if="preset.foods.length > 6"
              class="tag-item more"
              @tap="togglePresetExpanded(preset.id)"
            >
              {{ isPresetExpanded(preset.id) ? '收起' : `+${preset.foods.length - 6}` }}
            </view>
          </view>

          <button v-if="preset.id !== 'auto'" class="preset-add-btn" @tap="openAddFood('preset', preset.id)">+ 添加食物</button>
          <button class="preset-use-btn" @tap="applyPresetPackage(preset.id)">
            应用此预设 🎯
          </button>
        </view>
      </view>
    </view>

    <!-- iOS 风格添加食物 Modal -->
    <view v-if="showAddModal" class="modal-overlay" @tap="showAddModal = false">
      <view class="modal-card" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">{{ addTarget === 'preset' ? '添加到预设' : '添加新食物' }}</text>
          <text class="modal-close" @tap="showAddModal = false">✕</text>
        </view>

        <view class="form-item">
          <text class="form-label">食物名称</text>
          <input 
            v-model="newFoodName" 
            class="form-input" 
            placeholder="例如：螺蛳粉 / 海底捞火锅" 
            maxlength="12" 
          />
        </view>

        <view class="form-item">
          <text class="form-label">选择图标 Emoji</text>
          <view class="emoji-grid">
            <view 
              v-for="(emoji, idx) in emojiList" 
              :key="idx" 
              class="emoji-item"
              :class="{ selected: selectedEmoji === emoji }"
              @tap="selectedEmoji = emoji"
            >
              {{ emoji }}
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">食物分类</text>
          <view class="category-tags">
            <view 
              v-for="cat in categoryOptions" 
              :key="cat" 
              class="cat-tag"
              :class="{ selected: selectedCategory === cat }"
              @tap="selectedCategory = cat"
            >
              {{ cat }}
            </view>
          </view>
        </view>

        <button class="submit-btn" @tap="confirmAddFood">保存并加入转盘</button>
      </view>
    </view>

  </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { getStoredFoods, saveStoredFoods, applyPreset, clearAllFoods, getStoredPresets, saveStoredPresets } from '../../utils/storage';
import { EMOJI_OPTIONS, type FoodItem, type PresetCategory } from '../../utils/presetData';

export default defineComponent({
  data() {
    return {
      currentTab: 'current',
      foods: [] as FoodItem[],
      presets: [] as PresetCategory[],
      showAddModal: false,
      addTarget: 'current' as 'current' | 'preset',
      targetPresetId: '',
      expandedPresetIds: [] as string[],
      newFoodName: '',
      selectedEmoji: '🍲',
      selectedCategory: '正餐',
      emojiList: EMOJI_OPTIONS,
      categoryOptions: ['小吃', '正餐', '粉面', '快餐', '夜宵', '日韩', '西餐', '甜品', '减脂']
    };
  },
  computed: {
    activeCount(): number {
      return this.foods.filter(f => f.active !== false).length;
    },
    allSelected(): boolean {
      return this.foods.length > 0 && this.foods.every(f => f.active !== false);
    }
  },
  onShow() {
    this.loadFoods();
  },
  methods: {
    loadFoods() {
      this.foods = getStoredFoods();
      this.presets = getStoredPresets();
    },

    openAddFood(target: 'current' | 'preset', presetId = '') {
      this.addTarget = target;
      this.targetPresetId = presetId;
      this.newFoodName = '';
      this.showAddModal = true;
    },

    isPresetExpanded(presetId: string) {
      return this.expandedPresetIds.includes(presetId);
    },

    visiblePresetFoods(preset: PresetCategory) {
      return this.isPresetExpanded(preset.id) ? preset.foods : preset.foods.slice(0, 6);
    },

    togglePresetExpanded(presetId: string) {
      const index = this.expandedPresetIds.indexOf(presetId);
      if (index >= 0) {
        this.expandedPresetIds.splice(index, 1);
      } else {
        this.expandedPresetIds.push(presetId);
      }
    },

    save() {
      saveStoredFoods(this.foods);
    },

    toggleItemActive(index: number) {
      const current = this.foods[index].active;
      this.foods[index].active = current === false ? true : false;
      this.save();
      uni.vibrateShort({ type: 'light' });
    },

    deleteItem(index: number) {
      uni.showModal({
        title: '确认删除',
        content: `确定要把【${this.foods[index].name}】从转盘中移除吗？`,
        confirmColor: '#FF3B30',
        success: (res) => {
          if (res.confirm) {
            this.foods.splice(index, 1);
            this.save();
            uni.showToast({ title: '已删除', icon: 'none' });
            uni.vibrateShort({ type: 'medium' });
          }
        }
      });
    },

    toggleSelectAll() {
      const targetState = !this.allSelected;
      this.foods.forEach(f => f.active = targetState);
      this.save();
      uni.vibrateShort({ type: 'light' });
    },

    clearAll() {
      uni.showModal({
        title: '清空全部',
        content: '确定要清空当前所有食物吗？清空后可以重新自定义添加或从预设导入。',
        confirmColor: '#FF3B30',
        success: (res) => {
          if (res.confirm) {
            this.foods = clearAllFoods();
            uni.showToast({ title: '已清空', icon: 'none' });
          }
        }
      });
    },

    applyPresetPackage(presetId: string) {
      const p = this.presets.find(item => item.id === presetId)!;
      uni.showModal({
        title: '应用预设包',
        content: `确定导入【${p.name}】覆盖当前转盘列表吗？`,
        confirmColor: '#007AFF',
        success: (res) => {
          if (res.confirm) {
            this.foods = applyPreset(presetId);
            this.currentTab = 'current';
            uni.showToast({ title: `已成功应用【${p.name}】`, icon: 'success' });
            uni.vibrateShort({ type: 'medium' });
          }
        }
      });
    },

    removePresetFood(presetId: string, foodIndex: number) {
      const preset = this.presets.find(item => item.id === presetId);
      if (!preset) return;
      const food = preset.foods[foodIndex];
      uni.showModal({
        title: '移除预设食物',
        content: `确定从「${preset.name}」移除「${food.name}」吗？`,
        confirmColor: '#FF3B30',
        success: (res) => {
          if (res.confirm) {
            preset.foods.splice(foodIndex, 1);
            saveStoredPresets(this.presets);
            uni.showToast({ title: '已移除', icon: 'none' });
          }
        }
      });
    },

    confirmAddFood() {
      if (!this.newFoodName.trim()) {
        uni.showToast({ title: '请输入食物名称', icon: 'none' });
        return;
      }

      const newFood: FoodItem = {
        id: `custom_${Date.now()}`,
        name: this.newFoodName.trim(),
        emoji: this.selectedEmoji,
        category: this.selectedCategory,
        active: true
      };

      if (this.addTarget === 'preset') {
        const preset = this.presets.find(item => item.id === this.targetPresetId);
        if (!preset) return;
        preset.foods.unshift(newFood);
        saveStoredPresets(this.presets);
      } else {
        this.foods.unshift(newFood);
        this.save();
      }

      this.newFoodName = '';
      this.showAddModal = false;
      uni.showToast({ title: '添加成功！', icon: 'success' });
      uni.vibrateShort({ type: 'medium' });
    }
  }
});
</script>

<style scoped>
.container {
  padding: 16px;
  background-color: #F2F2F7;
  min-height: 100vh;
  box-sizing: border-box;
}

.segmented-control {
  display: flex;
  background: #E3E3E9;
  border-radius: 12px;
  padding: 3px;
  margin-bottom: 16px;
}

.segment-item {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #8E8E93;
  border-radius: 9px;
  transition: all 0.2s ease;
}

.segment-item.active {
  background: #FFFFFF;
  color: #1C1C1E;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.add-btn {
  width: 100%;
  min-height: 52px;
  box-sizing: border-box;
  background: #007AFF;
  color: #FFFFFF;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 700;
  padding: 10px 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.25);
  white-space: nowrap;
  line-height: 1.3;
}

.btn-icon {
  margin-right: 6px;
}

.tool-sub-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.text-badge {
  font-size: 12px;
  color: #8E8E93;
}

.badge-active {
  font-weight: 700;
  color: #007AFF;
}

.text-actions {
  font-size: 13px;
}

.text-link {
  color: #007AFF;
  font-weight: 600;
}

.text-link.danger {
  color: #FF3B30;
}

.text-divider {
  color: #C7C7CC;
  margin: 0 8px;
}

.empty-state {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-title {
  font-size: 18px;
  font-weight: 700;
  color: #1C1C1E;
  margin-bottom: 6px;
}

.empty-desc {
  font-size: 13px;
  color: #8E8E93;
  margin-bottom: 20px;
  line-height: 1.5;
}

.empty-btn {
  background: #E5E5EA;
  color: #007AFF;
  font-weight: 700;
  font-size: 14px;
  border-radius: 14px;
  padding: 8px 20px;
  border: none;
}

.food-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.food-item {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: opacity 0.2s ease;
}

.food-item.inactive {
  opacity: 0.5;
  background: #FAFAFC;
}

.food-left {
  display: flex;
  align-items: center;
}

.food-emoji {
  font-size: 26px;
  margin-right: 12px;
}

.food-info {
  display: flex;
  flex-direction: column;
}

.food-name {
  font-size: 16px;
  font-weight: 700;
  color: #1C1C1E;
}

.food-tag {
  font-size: 11px;
  color: #8E8E93;
  margin-top: 2px;
}

.food-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.delete-icon {
  font-size: 18px;
  padding: 4px;
}

.preset-intro {
  margin-bottom: 4px;
}

.intro-title {
  font-size: 16px;
  font-weight: 700;
  color: #1C1C1E;
  display: block;
}

.intro-desc {
  font-size: 12px;
  color: #8E8E93;
}

.preset-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 10px;
}

.preset-card {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.preset-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.preset-card-icon {
  font-size: 30px;
  margin-right: 10px;
}

.preset-card-info {
  display: flex;
  flex-direction: column;
}

.preset-card-title {
  font-size: 17px;
  font-weight: 800;
  color: #1C1C1E;
}

.preset-card-count {
  font-size: 12px;
  color: #8E8E93;
}

.preset-card-desc {
  font-size: 13px;
  color: #636366;
  margin-bottom: 12px;
  display: block;
}

.preset-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}

.tag-item {
  background: #F2F2F7;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 12px;
  color: #1C1C1E;
  position: relative;
  display: flex;
  align-items: center;
  min-height: 25px;
  box-sizing: border-box;
}

.tag-remove {
  width: 15px;
  height: 15px;
  margin-left: 4px;
  border-radius: 50%;
  background: #FF3B30;
  color: #FFFFFF;
  font-size: 13px;
  line-height: 14px;
  text-align: center;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.tag-item:hover .tag-remove,
.tag-item:active .tag-remove {
  opacity: 1;
}

.preset-add-btn {
  background: #F2F2F7;
  color: #007AFF;
  font-weight: 700;
  font-size: 13px;
  border-radius: 12px;
  border: 1px dashed #007AFF;
  padding: 7px 0;
  margin: 0 0 8px;
}

.preset-use-btn {
  background: #E5E5EA;
  color: #007AFF;
  font-weight: 700;
  font-size: 14px;
  border-radius: 12px;
  border: none;
  padding: 8px 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.modal-card {
  width: 100%;
  background: #FFFFFF;
  border-radius: 28px 28px 0 0;
  padding: 20px 20px 34px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 18px;
  font-weight: 800;
  color: #1C1C1E;
}

.modal-close {
  font-size: 20px;
  color: #8E8E93;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #8E8E93;
}

.form-input {
  background: #F2F2F7;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 15px;
  color: #1C1C1E;
}

.emoji-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.emoji-item {
  width: 40px;
  height: 40px;
  background: #F2F2F7;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
}

.emoji-item.selected {
  background: #007AFF;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cat-tag {
  background: #F2F2F7;
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 13px;
  color: #1C1C1E;
}

.cat-tag.selected {
  background: #007AFF;
  color: #FFFFFF;
  font-weight: 700;
}

.submit-btn {
  background: #007AFF;
  color: #FFFFFF;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  padding: 12px 0;
  margin-top: 10px;
  border: none;
}
</style>
