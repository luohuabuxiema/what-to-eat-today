<template>
  <view class="sr-container">
    <view class="main-card">
      <!-- 标题 -->
      <view class="title-container">
        <view class="main-title">
          <uni-icons type="contact" size="24" color="#409EFF"></uni-icons>
          AI 图像超分辨率重建系统
        </view>
      </view>

      <!-- 结果对比 -->
      <view v-if="result.status === 'success'" class="comparison-container">
        <view class="bottomImg"
              :style="{
            height: imgHeight,
            width: imgWidth,
            backgroundImage: 'url(' + result.outputImage + ')'
          }">

          <text class="imgLabel">{{ bottomLabel }}</text>

          <view v-if="result.outputImage" class="upperImg"
                :style="{
              backgroundImage: 'url(' + result.inputImage1 + ')',
              width: (100 - upperImgWidth) + '%'
            }">
            <text class="imgLabel">{{ upperLabel }}</text>
          </view>

          <view v-else class="upperUndefined" :style="{ width: (100 - upperImgWidth) + '%' }">
            <text>暂无结果</text>
          </view>

          <view class="spanHandle"
                :style="{ left: 'calc(' + upperImgWidth + '% - 24px)' }">
            <uni-icons type="more" size="24" color="#409EFF"></uni-icons>
          </view>

          <!-- 滑块控制上层图片的宽度 -->
          <slider
              class="inputRange"
              :value="upperImgWidth"
              min="0"
              max="100"
              @changing="onSliderChange"
              @change="onSliderChange"
              activeColor="#409EFF"
              backgroundColor="#C0C4CC"
              block-size="24"
          />

        </view>
      </view>

      <text class="info-text">拖动滑块查看前后对比效果</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

// 默认图片（使用在线示例图片）
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
const upperImgWidth = ref(50)

const bottomLabel = ref("修复结果")
const upperLabel = ref("原图")

// 首次加载时初始化
onMounted(() => {
  // 模拟图片加载完成后的尺寸计算
  setTimeout(() => {
    imgWidth.value = "700px"
    imgHeight.value = "400px"
  }, 500)
})

// 滑块变化事件
const onSliderChange = (e: any) => {
  upperImgWidth.value = e.detail.value
}
</script>

<style scoped>
.sr-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 30px;
  overflow: hidden;
  width: 100%;
  max-width: 900px;
}

.title-container {
  text-align: center;
  margin-bottom: 25px;
}

.main-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 700;
}

.comparison-container {
  margin: 30px 0;
  display: flex;
  justify-content: center;
}

.bottomImg {
  position: relative;
  width: 100%;
  max-width: 700px;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  background-size: cover;
  background-position: center;
}

.upperImg {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  z-index: 1;
  background-size: cover;
  background-position: right top;
  border-left: 2px solid rgba(255, 255, 255, 0.5);
  background-repeat: no-repeat;
  overflow: hidden;
}

.imgLabel {
  position: absolute;
  bottom: 20px;
  padding: 6px 12px;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 14px;
  border-radius: 4px;
  z-index: 2;
}

.bottomImg .imgLabel {
  left: 20px;
}

.upperImg .imgLabel {
  right: 20px;
}

.spanHandle {
  position: absolute;
  z-index: 2;
  height: 48px;
  width: 48px;
  border-radius: 50%;
  top: calc(90% - 24px);
  background-color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.inputRange {
  position: absolute;
  bottom: -30rpx; /* 放在底部，不覆盖图片 */
  left: 0;
  width: 100%;
  z-index: 3;
  opacity: 1; /* 保持可见，先确认能拖动 */
}


.upperUndefined {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  z-index: 1;
  font-size: 20px;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 2px solid rgba(255, 255, 255, 0.5);
  color: #909399;
}

.info-text {
  text-align: center;
  margin-top: 20px;
  color: #606266;
  font-size: 14px;
  display: block;
  width: 100%;
}
</style>