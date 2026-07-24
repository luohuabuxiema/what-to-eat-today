<template>
  <view class="container">
    <!-- iOS 顶部标题与分类 Badge -->
    <view class="header-card">
      <text class="app-title">今天吃什么 🍽️</text>
      <text class="app-subtitle">解决纠结 · 快乐享用每一餐</text>
      <view class="preset-selector" :style="{ pointerEvents: isSpinning || showResultModal ? 'none' : 'auto' }" @tap="showPresetPicker">
        <text class="preset-icon">{{ currentPresetIcon }}</text>
        <text class="preset-name">{{ currentPresetName }}</text>
        <text class="preset-arrow">▼</text>
      </view>
    </view>

    <!-- 主转盘区域 -->
    <view class="wheel-section" :style="{ pointerEvents: isSpinning || showResultModal || showPresetModal ? 'none' : 'auto' }">
      <!-- 轮盘旋转容器 (弹窗时通过 v-if 彻底隐藏原生组件防穿透) -->
      <view
        v-if="!showResultModal && !showPresetModal"
        class="wheel-wrapper"
      >
        <canvas type="2d" id="wheelCanvas" canvas-id="wheelCanvas" class="wheel-canvas"></canvas>
      </view>

      <!-- 顶部固定指针 -->
      <view class="pointer-wrapper" :style="{ opacity: showResultModal || showPresetModal ? 0 : 1 }">
        <view class="pointer-arrow"></view>
      </view>

      <!-- 中央按钮 -->
      <view
        class="center-btn"
        :class="{ 'btn-disabled': isSpinning || activeFoods.length === 0 }"
        :style="{ opacity: showResultModal || showPresetModal ? 0 : 1 }"
        @tap="spinWheel"
      >
        <text class="btn-text">{{ isSpinning ? '抽取中' : 'START' }}</text>
        <text class="btn-subtext">{{ isSpinning ? '...' : 'GO!' }}</text>
      </view>
    </view>

    <!-- 底部快捷操作栏 -->
    <view class="action-bar" :style="{ pointerEvents: isSpinning || showResultModal || showPresetModal ? 'none' : 'auto' }">
      <view class="action-btn" :class="{ 'btn-opacity': isSpinning }" @tap="shuffleFoods">
        <text class="action-icon">🔀</text>
        <text class="action-label">洗牌乱序</text>
      </view>
      <view class="action-btn primary" :class="{ 'btn-opacity': isSpinning }" @tap="goToManage">
        <text class="action-icon">⚙️</text>
        <text class="action-label">编辑菜单 ({{ activeFoods.length }}项)</text>
      </view>
      <view class="action-btn" :class="{ 'btn-opacity': isSpinning }" @tap="showPresetPickerAction">
        <text class="action-icon">📦</text>
        <text class="action-label">切换预设</text>
      </view>
    </view>

    <!-- 食物不足提示 -->
    <view v-if="activeFoods.length < 2" class="empty-tip">
      <text class="tip-icon">💡</text>
      <text class="tip-text">当前参与抽选的食物不足2项，请点击【编辑菜单】勾选或添加食物哦！</text>
    </view>

    <!-- iOS 风格中奖结果弹窗 (用高层级Sheet居中展示) -->
    <view v-if="showResultModal" class="modal-overlay" @tap="closeResult">
      <view class="modal-card" @tap.stop>
        <view class="modal-close-icon" @tap="closeResult">✕</view>
        <view class="modal-sparkle">✨ 🎉 ✨</view>
        <text class="modal-heading">今天就决定吃</text>

        <view class="modal-food-box">
          <text class="modal-food-emoji">{{ selectedFood ? selectedFood.emoji : '🍲' }}</text>
          <text class="modal-food-name">{{ selectedFood ? selectedFood.name : '' }}</text>
        </view>

        <text class="modal-food-tag">{{ selectedFood ? selectedFood.category : '' }}</text>
        <text class="modal-quote">"{{ resultQuote }}"</text>

        <view class="modal-actions">
          <button class="modal-btn confirm" @tap="confirmSelection">
            就吃这个！（记录）✅
          </button>
          <button class="modal-btn retry" @tap="reSpin">
            不满意，再转一次 🔄
          </button>
        </view>
      </view>
    </view>

    <!-- 预设选择底栏弹窗 (解决微信小程序 ActionSheet 超过6项限制与Canvas原生层穿透问题) -->
    <view v-if="showPresetModal" class="preset-sheet-overlay" @tap="closePresetModal">
      <view class="preset-sheet-card" @tap.stop>
        <view class="sheet-header">
          <text class="sheet-title">📦 选择菜单预设包</text>
          <text class="sheet-close" @tap="closePresetModal">✕</text>
        </view>
        <view class="preset-list-scroll">
          <view
            v-for="p in presetCategories"
            :key="p.id"
            class="preset-item-card"
            :class="{ active: currentPresetId === p.id }"
            @tap="selectPreset(p)"
          >
            <text class="preset-item-icon">{{ p.icon }}</text>
            <view class="preset-item-content">
              <view class="preset-item-title-row">
                <text class="preset-item-name">{{ p.name }}</text>
                <text v-if="currentPresetId === p.id" class="preset-active-badge">当前生效</text>
              </view>
              <text class="preset-item-desc">{{ p.desc }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

  </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { getStoredFoods, saveStoredFoods, addHistoryRecord, applyPreset, getStoredPresetId } from '../../utils/storage';
import { PRESET_CATEGORIES, FUN_QUOTES, type FoodItem } from '../../utils/presetData';

export default defineComponent({
  data() {
    return {
      foods: [] as FoodItem[],
      rotationAngle: 0,
      isSpinning: false,
      selectedFood: null as FoodItem | null,
      showResultModal: false,
      showPresetModal: false,
      resultQuote: '',
      currentPresetId: 'auto',
      presetCategories: PRESET_CATEGORIES,
      canvasContext: null as any,
      canvasWidth: 300,
      canvasHeight: 300,
      hapticTimer: null as any,
      spinTimer: null as any,
      spinAnimationTimer: null as any,
      colors: [
        '#FF453A', '#FF9F0A', '#30D158', '#64D2FF',
        '#0A84FF', '#BF5AF2', '#FF375F', '#FFD60A',
        '#32ADE6', '#FF851B', '#2ECC40', '#B10DC9'
      ]
    };
  },
  computed: {
    activeFoods(): FoodItem[] {
      return this.foods.filter(f => f.active !== false);
    },
    currentPresetName(): string {
      if (this.currentPresetId === 'auto') {
        const hour = new Date().getHours();
        return hour >= 17 ? '智能推荐 (晚餐)' : '智能推荐 (午餐)';
      }
      const p = PRESET_CATEGORIES.find(item => item.id === this.currentPresetId);
      return p ? p.name : '热门全能包';
    },
    currentPresetIcon(): string {
      if (this.currentPresetId === 'auto') {
        return '⏰';
      }
      const p = PRESET_CATEGORIES.find(item => item.id === this.currentPresetId);
      return p ? p.icon : '🔥';
    }
  },
  mounted() {
    this.loadData();
    setTimeout(() => { this.initCanvas(); }, 300);
  },
  onShow() {
    this.loadData();
    setTimeout(() => { this.initCanvas(); }, 300);
  },
  onUnload() {
    this.clearTimers();
  },
  methods: {
    clearTimers() {
      if (this.hapticTimer) { clearInterval(this.hapticTimer); this.hapticTimer = null; }
      if (this.spinTimer)   { clearTimeout(this.spinTimer);   this.spinTimer = null; }
      if (this.spinAnimationTimer) { clearInterval(this.spinAnimationTimer); this.spinAnimationTimer = null; }
    },

    normalizeRotationAngle() {
      this.rotationAngle = ((this.rotationAngle % 360) + 360) % 360;
    },

    loadData() {
      this.currentPresetId = getStoredPresetId();
      if (this.currentPresetId === 'auto') {
        this.foods = applyPreset('auto');
      } else {
        this.foods = getStoredFoods();
      }
    },

    initCanvas() {
      // #ifdef H5
      const h5Canvas = (
        document.querySelector('.wheel-canvas canvas') ||
        document.querySelector('#wheelCanvas canvas') ||
        document.querySelector('.wheel-canvas') ||
        document.getElementById('wheelCanvas')
      ) as HTMLCanvasElement;
      if (h5Canvas && typeof h5Canvas.getContext === 'function') {
        // uni-app H5 会自行根据 CSS 尺寸和 DPR 设置 canvas 的位图尺寸，
        // 并包装 2D context，将绘制坐标转换为高分屏坐标。此处再次手动设置
        // width / height 或 dpr transform，会造成坐标被二次缩放，圆心偏到右下角。
        this.canvasWidth = 300;
        this.canvasHeight = 300;
        const ctx = h5Canvas.getContext('2d');
        if (ctx) {
          // getContext 会复用上下文；先重置自定义 transform，避免上一轮残留。
          // 不要在这里传 dpr：uni-app H5 已经自动处理了 DPR。
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          this.canvasContext = ctx;
          this.drawWheel();
          return;
        }
      }
      // #endif

      const scope = (this as any).$scope || this;
      const query = uni.createSelectorQuery().in(scope);
      query.select('#wheelCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res && res[0] && res[0].node) {
            const canvas = res[0].node;
            const ctx = canvas.getContext('2d');
            const dpr = uni.getSystemInfoSync().pixelRatio || 2;
            // 关键修复：硬编码宽高，防止因 transform 旋转导致的 bounding box 变大，从而导致圆心错位！
            this.canvasWidth = 300;
            this.canvasHeight = 300;
            canvas.width = this.canvasWidth * dpr;
            canvas.height = this.canvasHeight * dpr;
            ctx.scale(dpr, dpr);
            this.canvasContext = ctx;
            this.drawWheel();
          } else {
            this.drawWheelFallback();
          }
        });
    },

    // 根据当前扇区的弦长自动拆行；最多两行，仍放不下才在第二行加省略号。
    wrapWheelText(ctx: any, text: string, maxWidth: number, maxLines = 2): string[] {
      const lines: string[] = [];
      let currentLine = '';
      for (const character of Array.from(text)) {
        const candidate = currentLine + character;
        if (currentLine && ctx.measureText(candidate).width > maxWidth && lines.length < maxLines - 1) {
          lines.push(currentLine);
          currentLine = character;
        } else {
          currentLine = candidate;
        }
      }

      if (ctx.measureText(currentLine).width > maxWidth) {
        let shortened = currentLine;
        while (shortened.length > 0 && ctx.measureText(shortened + '…').width > maxWidth) {
          shortened = shortened.slice(0, -1);
        }
        currentLine = shortened + '…';
      }
      if (currentLine) lines.push(currentLine);
      return lines.slice(0, maxLines);
    },

    drawWheel(rotationDegree = this.rotationAngle) {
      const ctx = this.canvasContext;
      if (!ctx) return;
      const list = this.activeFoods;
      const count = list.length;
      const cx = this.canvasWidth / 2;
      const cy = this.canvasHeight / 2;
      const radius = cx - 6;
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      if (count === 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#E5E5EA';
        ctx.fill();
        ctx.fillStyle = '#8E8E93';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('请先添加食物', cx, cy);
        return;
      }
      const arcAngle = (Math.PI * 2) / count;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotationDegree * Math.PI / 180);
      ctx.translate(-cx, -cy);
      for (let i = 0; i < count; i++) {
        const startAngle = i * arcAngle - Math.PI / 2;
        const endAngle = startAngle + arcAngle;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = this.colors[i % this.colors.length];
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(startAngle + arcAngle / 2 + Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF';
        const food = list[i];
        const textRadius = radius * 0.62;
        ctx.font = count > 10 ? 'bold 10px sans-serif' : 'bold 12px sans-serif';
        const maxTextWidth = Math.max(30, 2 * (textRadius - 8) * Math.sin(arcAngle / 2) - 6);
        const nameLines = this.wrapWheelText(ctx, food.name, maxTextWidth);
        const lineHeight = count > 10 ? 12 : 15;
        const nameCenterY = -textRadius - 8;
        const firstLineY = nameCenterY - ((nameLines.length - 1) * lineHeight) / 2;
        nameLines.forEach((line, lineIndex) => ctx.fillText(line, 0, firstLineY + lineIndex * lineHeight));
        ctx.font = count > 10 ? '14px sans-serif' : '18px sans-serif';
        ctx.fillText(food.emoji || '🍲', 0, nameCenterY + ((nameLines.length - 1) * lineHeight) / 2 + 20);
        ctx.restore();
      }
      ctx.restore();
    },

    drawWheelFallback(rotationDegree = this.rotationAngle) {
      const ctx = uni.createCanvasContext('wheelCanvas', this);
      const list = this.activeFoods;
      const count = list.length;
      const cx = 150, cy = 150, radius = 144;
      if (count === 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.setFillStyle('#E5E5EA');
        ctx.fill();
        ctx.draw();
        return;
      }
      const arcAngle = (Math.PI * 2) / count;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotationDegree * Math.PI / 180);
      ctx.translate(-cx, -cy);
      for (let i = 0; i < count; i++) {
        const startAngle = i * arcAngle - Math.PI / 2;
        const endAngle = startAngle + arcAngle;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.setFillStyle(this.colors[i % this.colors.length]);
        ctx.fill();
        ctx.setStrokeStyle('#FFFFFF');
        ctx.setLineWidth(2);
        ctx.stroke();
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(startAngle + arcAngle / 2 + Math.PI / 2);
        ctx.setTextAlign('center');
        ctx.setFillStyle('#FFFFFF');
        const food = list[i];
        const textRadius = radius * 0.62;
        ctx.setFontSize(11);
        const maxTextWidth = Math.max(30, 2 * (textRadius - 8) * Math.sin(arcAngle / 2) - 6);
        const nameLines = this.wrapWheelText(ctx, food.name, maxTextWidth);
        const lineHeight = 13;
        const nameCenterY = -textRadius - 8;
        const firstLineY = nameCenterY - ((nameLines.length - 1) * lineHeight) / 2;
        nameLines.forEach((line, lineIndex) => ctx.fillText(line, 0, firstLineY + lineIndex * lineHeight));
        ctx.setFontSize(16);
        ctx.fillText(food.emoji || '🍲', 0, nameCenterY + ((nameLines.length - 1) * lineHeight) / 2 + 20);
        ctx.restore();
      }
      ctx.restore();
      ctx.draw();
    },

    spinWheel() {
      if (this.isSpinning) return;
      if (this.activeFoods.length < 1) {
        uni.showToast({ title: '请至少勾选1个食物', icon: 'none' });
        return;
      }
      this.clearTimers();
      this.showResultModal = false;
      this.startCanvasSpin();
      return;

      /* Legacy CSS-transform animation retained below temporarily during refactor.

      // ★ Fix: 先在 isSpinning=false (transition:'none') 状态下归一化角度
      // 防止归一化时 CSS 过渡激活导致转盘短暂反转或跳动
      const normalizedBase = this.rotationAngle % 360;
      this.rotationAngle = normalizedBase;

      // 等待归一化渲染生效后，再开启 transition 并执行真正的旋转
      setTimeout(() => {
        this.isSpinning = true; // 此时才开启 transition 动画

        const count = this.activeFoods.length;
        const winnerIndex = Math.floor(Math.random() * count);
        this.selectedFood = this.activeFoods[winnerIndex];

        const sectorDegree = 360 / count;
        const targetDegree = 360 - ((winnerIndex + 0.5) * sectorDegree);
        const randomRounds = (6 + Math.floor(Math.random() * 3)) * 360;

        const finalAngle = normalizedBase + randomRounds + targetDegree;
        this.rotationAngle = finalAngle;

        this.triggerHaptics();

        this.spinTimer = setTimeout(() => {
          this.isSpinning = false;
          // 动画已结束，立即把角度收敛到等价的 0–360° 范围；
          // 弹窗关闭后重新创建 canvas 时便不会发生位置偏移。
          this.normalizeRotationAngle();
          this.resultQuote = FUN_QUOTES[Math.floor(Math.random() * FUN_QUOTES.length)];
          this.showResultModal = true;
          uni.vibrateLong();
        }, 4600);
      }, 50); // 延迟 50ms 等待角度归一化渲染生效
    },

      */
    },
    startCanvasSpin() {
      this.normalizeRotationAngle();
      this.isSpinning = true;

      const count = this.activeFoods.length;
      const winnerIndex = Math.floor(Math.random() * count);
      this.selectedFood = this.activeFoods[winnerIndex];

      const sectorDegree = 360 / count;
      // 指针固定在正上方。终点角必须等于中奖扇区对应的目标角，
      // 不能在目标角上再次叠加上一次的旋转角度。
      const targetDegree = (360 - ((winnerIndex + 0.5) * sectorDegree)) % 360;
      const startAngle = this.rotationAngle;
      const forwardDegree = (targetDegree - startAngle + 360) % 360;
      const finalAngle = startAngle + (6 + Math.floor(Math.random() * 3)) * 360 + forwardDegree;
      const duration = 4500;
      const startedAt = Date.now();

      this.triggerHaptics();
      this.spinAnimationTimer = setInterval(() => {
        const progress = Math.min((Date.now() - startedAt) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 4);
        this.drawWheel(startAngle + (finalAngle - startAngle) * easedProgress);

        if (progress === 1) {
          clearInterval(this.spinAnimationTimer);
          this.spinAnimationTimer = null;
          this.rotationAngle = finalAngle;
          this.normalizeRotationAngle();
          this.drawWheel();
          this.isSpinning = false;
          this.resultQuote = FUN_QUOTES[Math.floor(Math.random() * FUN_QUOTES.length)];
          this.showResultModal = true;
          uni.vibrateLong();
        }
      }, 16);
    },

    triggerHaptics() {
      let interval = 80;
      let elapsed = 0;
      this.hapticTimer = setInterval(() => {
        elapsed += interval;
        if (elapsed > 4000) {
          clearInterval(this.hapticTimer);
          this.hapticTimer = null;
        } else {
          uni.vibrateShort({ type: 'light' });
          interval += 15;
        }
      }, interval);
    },

    shuffleFoods() {
      if (this.isSpinning || this.showResultModal) return;
      const list = [...this.foods];
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
      this.foods = list;
      saveStoredFoods(list);
      this.drawWheel();
      uni.showToast({ title: '已打乱顺序 🔀', icon: 'none' });
    },

    showPresetPicker() {
      if (this.isSpinning || this.showResultModal) return;
      this.showPresetModal = true;
    },

    showPresetPickerAction() {
      if (this.isSpinning || this.showResultModal) return;
      this.showPresetModal = true;
    },

    selectPreset(preset: PresetCategory) {
      this.currentPresetId = preset.id;
      this.foods = applyPreset(preset.id);
      this.showPresetModal = false;
      setTimeout(() => { this.initCanvas(); }, 100);
      uni.showToast({ title: `已切换至【${preset.name}】`, icon: 'none' });
      uni.vibrateShort({ type: 'light' });
    },

    closePresetModal() {
      this.showPresetModal = false;
      setTimeout(() => { this.initCanvas(); }, 100);
    },

    confirmSelection() {
      if (this.selectedFood) {
        addHistoryRecord(this.selectedFood);
        uni.showToast({ title: '已记录到历史中 📝', icon: 'success' });
      }
      this.showResultModal = false;
      setTimeout(() => { this.initCanvas(); }, 100);
    },

    reSpin() {
      this.showResultModal = false;
      setTimeout(() => {
        this.initCanvas();
        setTimeout(() => { this.spinWheel(); }, 100);
      }, 100);
    },

    closeResult() {
      this.showResultModal = false;
      setTimeout(() => { this.initCanvas(); }, 100);
    },

    goToManage() {
      if (this.isSpinning || this.showResultModal) return;
      uni.switchTab({ url: '/pages/manage/manage' });
    }
  }
});
</script>

<style scoped>
.container {
  background-color: #F2F2F7;
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 16px 30px 16px;
  position: relative;
}

/* ===== 头部卡片 ===== */
.header-card {
  width: 100%;
  background: #FFFFFF;
  border-radius: 20px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;
  box-sizing: border-box;
}
.app-title {
  font-size: 22px;
  font-weight: 700;
  color: #1C1C1E;
  margin-bottom: 4px;
}
.app-subtitle {
  font-size: 13px;
  color: #8E8E93;
  margin-bottom: 12px;
}
.preset-selector {
  display: flex;
  align-items: center;
  background: #E5E5EA;
  padding: 6px 14px;
  border-radius: 20px;
}
.preset-icon { font-size: 14px; margin-right: 6px; }
.preset-name { font-size: 13px; font-weight: 600; color: #007AFF; margin-right: 6px; }
.preset-arrow { font-size: 10px; color: #007AFF; }

/* ===== 转盘区域 ===== */
.wheel-section {
  position: relative;
  width: 300px;
  height: 300px;
  min-height: 300px;
  flex-shrink: 0;
  /* ★ Fix: 不能用 overflow:hidden，微信小程序 Canvas 2D 坐标系会错位 */
  /* 改用 translateZ(0) 创建 GPU 合成层，隔离子元素旋转对 flex 布局的影响 */
  transform: translateZ(0);
  margin: 0 auto 24px auto;
  box-sizing: border-box;
}
.wheel-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.14), inset 0 0 0 6px rgba(255, 255, 255, 0.8);
  overflow: hidden;
  background: #FFFFFF;
  /* ★ Fix: 用 center center 替代 150px 150px，兼容性更好，避免部分 WebView 计算偏差 */
  transform-origin: center center;
  will-change: transform;
  transition: opacity 0.2s ease;
}
.wheel-canvas {
  width: 300px;
  height: 300px;
  display: block;
}
.pointer-wrapper {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  transition: opacity 0.2s ease;
}
.pointer-arrow {
  width: 0;
  height: 0;
  border-left: 14px solid transparent;
  border-right: 14px solid transparent;
  border-top: 24px solid #FF3B30;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.25));
}
.center-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFFFFF, #F2F2F7);
  box-shadow: 0 8px 24px rgba(0,0,0,0.16), 0 0 0 4px rgba(255,255,255,0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 12;
  transition: opacity 0.2s ease;
}
.btn-disabled { opacity: 0.65; }
.btn-text { font-size: 14px; font-weight: 800; color: #007AFF; }
.btn-subtext { font-size: 10px; font-weight: 600; color: #FF9500; }

/* ===== 操作栏 ===== */
.action-bar {
  width: 100%;
  display: flex;
  gap: 10px;
  box-sizing: border-box;
}
.action-btn {
  flex: 1;
  background: #FFFFFF;
  border-radius: 16px;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.action-btn.primary { background: #007AFF; }
.action-btn.primary .action-label { color: #FFFFFF; }
.btn-opacity { opacity: 0.5; }
.action-icon { font-size: 18px; margin-bottom: 4px; }
.action-label { font-size: 12px; font-weight: 600; color: #1C1C1E; }

/* ===== 提示条 ===== */
.empty-tip {
  margin-top: 16px;
  background: #FFF9E6;
  border: 1px solid #FFE599;
  border-radius: 12px;
  padding: 10px 14px;
  display: flex;
  align-items: flex-start;
  width: 100%;
  box-sizing: border-box;
}
.tip-icon { font-size: 16px; margin-right: 8px; }
.tip-text { font-size: 12px; color: #D9822B; flex: 1; line-height: 1.6; }

/* ===== iOS 风格中奖结果弹窗 ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 99999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  box-sizing: border-box;
}
.modal-card {
  width: 100%;
  background: #FFFFFF;
  border-radius: 24px;
  padding: 28px 20px 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
  position: relative;
  box-sizing: border-box;
}
.modal-close-icon {
  position: absolute;
  top: 16px;
  right: 18px;
  font-size: 18px;
  color: #8E8E93;
  padding: 4px;
}
.modal-sparkle {
  font-size: 24px;
  margin-bottom: 6px;
}
.modal-heading {
  font-size: 15px;
  color: #8E8E93;
  margin-bottom: 16px;
}
.modal-food-box {
  display: flex;
  align-items: center;
  background: #F2F2F7;
  padding: 14px 28px;
  border-radius: 20px;
  margin-bottom: 8px;
}
.modal-food-emoji {
  font-size: 40px;
  margin-right: 12px;
}
.modal-food-name {
  font-size: 28px;
  font-weight: 800;
  color: #1C1C1E;
}
.modal-food-tag {
  font-size: 12px;
  color: #007AFF;
  background: #E5F1FF;
  padding: 2px 10px;
  border-radius: 10px;
  margin-bottom: 14px;
  font-weight: 600;
}
.modal-quote {
  font-size: 14px;
  color: #FF9500;
  font-weight: 600;
  text-align: center;
  margin-bottom: 24px;
}
.modal-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.modal-btn {
  width: 100%;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  padding: 12px 0;
  border: none;
}
.modal-btn.confirm {
  background: #007AFF;
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}
.modal-btn.retry {
  background: #E5E5EA;
  color: #1C1C1E;
}

/* ===== 预设选择底栏弹窗 ===== */
.preset-sheet-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
  z-index: 99999;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
.preset-sheet-card {
  width: 100%;
  background: #FFFFFF;
  border-radius: 24px 24px 0 0;
  padding: 20px 16px 30px 16px;
  max-height: 75vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 4px;
}
.sheet-title {
  font-size: 18px;
  font-weight: 800;
  color: #1C1C1E;
}
.sheet-close {
  font-size: 18px;
  color: #8E8E93;
  padding: 4px;
}
.preset-list-scroll {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 60vh;
  padding-bottom: 10px;
}
.preset-item-card {
  background: #F2F2F7;
  border-radius: 16px;
  padding: 14px;
  display: flex;
  align-items: flex-start;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}
.preset-item-card.active {
  background: #E5F1FF;
  border-color: #007AFF;
}
.preset-item-icon {
  font-size: 26px;
  margin-right: 12px;
  line-height: 1.2;
}
.preset-item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.preset-item-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.preset-item-name {
  font-size: 15px;
  font-weight: 700;
  color: #1C1C1E;
}
.preset-active-badge {
  font-size: 11px;
  font-weight: 700;
  color: #FFFFFF;
  background: #007AFF;
  padding: 2px 8px;
  border-radius: 10px;
}
.preset-item-desc {
  font-size: 12px;
  color: #636366;
  line-height: 1.4;
}
</style>
