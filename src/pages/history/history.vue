<template>
  <view class="container">
    <!-- 统计卡片 -->
    <view class="stats-card">
      <text class="stats-icon">📊</text>
      <view class="stats-info">
        <text class="stats-title">已拯救纠结症 <text class="stats-num">{{ historyList.length }}</text> 次</text>
        <text class="stats-sub" v-if="topFood">
          👑 最常抽中：{{ topFood.emoji }} {{ topFood.name }} ({{ topFood.count }}次)
        </text>
        <text class="stats-sub" v-else>转盘抽取记录将自动保存在这里</text>
      </view>
    </view>

    <!-- 顶部操作 -->
    <view v-if="historyList.length > 0" class="history-header">
      <text class="header-title">最近决策记录</text>
      <text class="clear-link" @tap="clearHistory">清空记录</text>
    </view>

    <!-- 空状态 -->
    <view v-if="historyList.length === 0" class="empty-state">
      <text class="empty-icon">📜</text>
      <text class="empty-title">暂无决策历史</text>
      <text class="empty-desc">去首页转盘转一转，抽中的美食会自动记录下来哦~</text>
      <button class="go-spin-btn" @tap="goToSpin">去玩转盘 🎯</button>
    </view>

    <!-- 历史记录列表 -->
    <view v-else class="history-list">
      <view 
        v-for="(item, index) in historyList" 
        :key="item.id || index" 
        class="history-item"
      >
        <view class="item-left">
          <text class="item-emoji">{{ item.emoji || '🍲' }}</text>
          <view class="item-details">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-category">{{ item.category || '精选美食' }}</text>
          </view>
        </view>

        <view class="item-right">
          <text class="item-date">{{ item.date }}</text>
          <text class="item-time">{{ item.time }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { getStoredHistory, clearStoredHistory, type HistoryRecord } from '../../utils/storage';

export default defineComponent({
  data() {
    return {
      historyList: [] as HistoryRecord[]
    };
  },
  computed: {
    topFood(): { name: string; emoji: string; count: number } | null {
      if (this.historyList.length === 0) return null;
      const countMap: Record<string, { name: string; emoji: string; count: number }> = {};
      this.historyList.forEach(item => {
        const key = `${item.emoji || '🍲'} ${item.name}`;
        if (!countMap[key]) {
          countMap[key] = { name: item.name, emoji: item.emoji || '🍲', count: 0 };
        }
        countMap[key].count++;
      });
      const sorted = Object.values(countMap).sort((a, b) => b.count - a.count);
      return sorted[0];
    }
  },
  onShow() {
    this.loadHistory();
  },
  methods: {
    loadHistory() {
      this.historyList = getStoredHistory();
    },

    clearHistory() {
      uni.showModal({
        title: '清空历史',
        content: '确定要清空所有决策历史记录吗？',
        confirmColor: '#FF3B30',
        success: (res) => {
          if (res.confirm) {
            clearStoredHistory();
            this.historyList = [];
            uni.showToast({ title: '已清空', icon: 'none' });
          }
        }
      });
    },

    goToSpin() {
      uni.switchTab({ url: '/pages/index/index' });
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

.stats-card {
  background: linear-gradient(135deg, #007AFF, #5856D6);
  border-radius: 20px;
  padding: 20px;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  box-shadow: 0 8px 24px rgba(0, 122, 255, 0.25);
  margin-bottom: 20px;
}

.stats-icon {
  font-size: 36px;
  margin-right: 14px;
}

.stats-info {
  display: flex;
  flex-direction: column;
}

.stats-title {
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stats-num {
  font-size: 22px;
  font-weight: 900;
  color: #FFD60A;
}

.stats-sub {
  font-size: 13px;
  opacity: 0.9;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;
}

.header-title {
  font-size: 16px;
  font-weight: 700;
  color: #1C1C1E;
}

.clear-link {
  font-size: 13px;
  color: #FF3B30;
  font-weight: 600;
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

.go-spin-btn {
  background: #007AFF;
  color: #FFFFFF;
  font-weight: 700;
  font-size: 14px;
  border-radius: 14px;
  padding: 8px 24px;
  border: none;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.item-left {
  display: flex;
  align-items: center;
}

.item-emoji {
  font-size: 28px;
  margin-right: 12px;
}

.item-details {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 16px;
  font-weight: 700;
  color: #1C1C1E;
}

.item-category {
  font-size: 12px;
  color: #8E8E93;
  margin-top: 2px;
}

.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.item-date {
  font-size: 13px;
  font-weight: 600;
  color: #1C1C1E;
}

.item-time {
  font-size: 11px;
  color: #8E8E93;
  margin-top: 2px;
}
</style>
