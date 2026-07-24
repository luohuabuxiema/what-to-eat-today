<template>
  <view class="sr-container">
    <view class="main-card">
      <!-- 结果对比 -->
      <view v-if="result.status === 'success'" class="comparison-container">
        <view class="image-comparison" :style="{ height: imgHeight, width: imgWidth }">
          <image class="comparison-image" :src="result.outputImage" mode="aspectFit"></image>
          <view class="after-layer" :style="{clipPath: `polygon(${clipPercent}% 0, 100% 0, 100% 100%, ${clipPercent}% 100%)`}">
            <text class="image-label label-after">修复结果</text>
          </view>


          <view class="before-layer" :style="{clipPath: `polygon(0 0, ${clipPercent}% 0, ${clipPercent}% 100%, 0 100%)`}">
            <image class="comparison-image"
                   :src="result.inputImage1"
                   mode="aspectFit"></image>
            <text class="image-label label-before">原图 </text>
          </view>

          <!--滑块 -->
          <view class="comparison-slider"
                :style="{ left: clipPercent + '%' }"
                @touchstart="startDrag"
                @touchmove="handleTouchMove"
                @touchend="stopDrag">
            <view class="slider-handle">
              <uni-icons type="more" size="24" color="#409EFF"></uni-icons>
            </view>
          </view>
        </view>

      </view>

      <text class="info-text">拖动滑块查看前后对比效果</text>
    </view>
  </view>

  <view class="option-container">
    <radio-group>
      <label class="option-item">
        <radio value="2" :checked="scaleOption === '2'" color="#409EFF" />
        <text>高清修复（满足大部分场景）</text>
      </label>
      <label class="option-item">
        <radio value="4" :checked="scaleOption === '4'" color="#409EFF" />
        <text>超清修复（超高清晰度，超强修复能力）</text>
      </label>
    </radio-group>
  </view>

  <view class="button-container">
    <button class="btn upload-btn">📷 点击上传</button>
    <button class="btn save-btn">💾 保存图片</button>
  </view>



</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

// 默认图片
const DEFAULT_IMAGES = {
  input: '/static/input.png',
  output: '/static/out.png'
}



const result = reactive({
  status: 'success',
  inputImage1: DEFAULT_IMAGES.input,
  outputImage: DEFAULT_IMAGES.output,
  message: '示例图片'
})

const imgHeight = ref("400px")
const imgWidth = ref("700px")
const clipPercent = ref(50)

// 倍数选择
const scaleOption = ref('2')

// 首次加载时初始化
onMounted(() => {
  setTimeout(() => {
    imgWidth.value = "700px"
    imgHeight.value = "400px"
  }, 500)
})

const isDragging = ref(false)
const containerLeft = ref(0)
const containerWidth = ref(0)

const startDrag = (e: any) => {
  isDragging.value = true
  const query = uni.createSelectorQuery()
  query.select('.image-comparison').boundingClientRect((rect: any) => {
    if (rect) {
      containerLeft.value = rect.left
      containerWidth.value = rect.width
    }
  }).exec()
}

const handleTouchMove = (e: any) => {
  if (!isDragging.value) return
  const currentX = e.touches[0].pageX
  let newPercent = ((currentX - containerLeft.value) / containerWidth.value) * 100
  newPercent = Math.max(0, Math.min(100, newPercent))
  clipPercent.value = newPercent
}

const stopDrag = () => {
  isDragging.value = false
}




</script>

<style scoped>
.sr-container {
  padding: 20rpx;
  background-color: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-card {
  background: white;
  border-radius: 32rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.1);
  padding: 20rpx;
  overflow: hidden;
  width: 100%;
  max-width: 900rpx;
}

.comparison-container {
  display: flex;
  justify-content: center;
}

.image-comparison {
  position: relative;
  width: 100%;
  max-width: 700rpx;
  height: 400rpx;
  overflow: hidden;
}

.comparison-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.after-layer,
.before-layer {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 2;
  overflow: hidden;
}

.label-after {
  right: 20rpx;
  bottom: 20rpx;
}

.label-before {
  left: 20rpx;
  bottom: 20rpx;
}

.image-label {
  position: absolute;
  padding: 12rpx 24rpx;
  color: white;
  border-radius: 8rpx;
  font-size: 28rpx;
  font-weight: 500;
  z-index: 3;
}

.comparison-slider {
  position: absolute;
  top: 0;
  left: 50%;
  width: 8rpx;
  height: 100%;
  background: white;
  z-index: 3;
  transform: translateX(-4rpx);
}

.slider-handle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.2);
}

.info-text {
  text-align: center;
  color: #606266;
  font-size: 28rpx;
  display: block;
  width: 100%;
  margin-top: 20rpx;
}

/* 缩放单选框 */
radio {
  transform: scale(0.8); /* 0.8 = 80% 大小 */
  margin-right: 12rpx;   /* 缩小后，右边留点间距 */
}

/* 倍数选择 */
.option-container {
  margin: 20rpx 0;
}
.option-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}
.option-item text {
  margin-left: 16rpx;
  font-size: 28rpx;
  color: #333;
}

/* 按钮区域 */
.button-container {
  display: flex;
  justify-content: space-between;
  margin-top: 30rpx;
}

.btn {
  flex: 1;
  margin: 0 16rpx;
  padding: 28rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 300;
  text-align: center;
  background-color: #409EFF;
  color: white;
}


</style>