<template>
  <view class="container">
    <!-- 图片对比区域 -->
    <view class="compare-box">
      <image class="img original" :src="originalImg" mode="aspectFill"></image>
      <view class="mask" :style="{ width: maskWidth + 'px' }">
        <image class="img enhanced" :src="enhancedImg" mode="aspectFill"></image>
      </view>

      <!-- 滑块 -->
      <movable-area class="slider-area">
        <movable-view
            class="slider"
            direction="horizontal"
            :x="maskWidth"
            @change="onSliderMove"
        >
          <view class="slider-btn"></view>
        </movable-view>
      </movable-area>

      <!-- 左右文字标签 -->
      <view class="label left">原图</view>
      <view class="label right">优化后</view>
    </view>

    <!-- 选择图片按钮 -->
    <view class="btn-box">
      <button type="primary" @click="chooseImage">选择图片</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const originalImg = ref('/static/input.png') // 原图路径
const enhancedImg = ref('/static/out.png') // 优化后图路径

const maskWidth = ref(200) // 遮罩初始宽度

// 滑动条移动时更新遮罩宽度
function onSliderMove(e) {
  maskWidth.value = e.detail.x
}

// 模拟选择图片
function chooseImage() {
  uni.showToast({
    title: '这里可以调用 uni.chooseImage()',
    icon: 'none'
  })
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f8f8f8;
  height: 100vh;
}

.compare-box {
  position: relative;
  width: 90%;
  height: 400px;
  margin-top: 20px;
  overflow: hidden;
  border-radius: 12px;
}

.img {
  width: 100%;
  height: 100%;
}

.mask {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  overflow: hidden;
}

.slider-area {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.slider {
  width: 0;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.slider-btn {
  width: 30px;
  height: 30px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  border: 2px solid #007aff;
}

.label {
  position: absolute;
  top: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 14px;
  color: #fff;
}

.label.left {
  left: 10px;
  background: rgba(0, 0, 0, 0.4);
}

.label.right {
  right: 10px;
  background: rgba(0, 0, 0, 0.4);
}

.btn-box {
  margin-top: 20px;
  width: 80%;
}
</style>
