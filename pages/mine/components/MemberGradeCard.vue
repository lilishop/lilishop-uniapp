<template>
  <view class="member-card" :style="{ color: cardColor }">
    <image v-if="grade.gradeBackground && !backgroundFailed" :key="grade.gradeBackground" class="card-background" :src="grade.gradeBackground"
      mode="aspectFill" @load="backgroundLoaded = true" @error="backgroundFailed = true" />
    <view class="member-card-content">
      <view class="card-status">{{ isCurrent ? '当前等级' : '等级预览' }}</view>
      <view class="grade-heading">
        <image v-if="grade.gradeImage && !iconFailed" :key="grade.gradeImage" class="grade-icon" :src="grade.gradeImage" mode="aspectFit" @error="iconFailed = true" />
        <u-icon v-else name="level" size="30" :color="cardColor" /><text class="grade-title">{{ grade.gradeName }}</text>
      </view>
      <text class="card-subtitle">{{ benefitCount }} 项专属权益 · {{ thresholdText }}</text>
    </view>
  </view>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
const props = defineProps({ grade: { type: Object, required: true }, benefitCount: { type: Number, default: 0 }, isCurrent: { type: Boolean, default: false } })
const backgroundLoaded = ref(false), backgroundFailed = ref(false), iconFailed = ref(false)
const cardColor = computed(() => {
  if (!backgroundLoaded.value || backgroundFailed.value) return '#fff5df'
  const color = props.grade.gradeFontColor
  return /^#[0-9a-f]{6}$/i.test(color || '') ? color : '#333333'
})
const thresholdText = computed(() => props.grade.isDefault ? '默认等级' : `${Math.max(0, Number(props.grade.requiredExperience) || 0).toLocaleString('en-US')} 经验值可达`)
watch(() => props.grade.gradeBackground, () => { backgroundLoaded.value = false; backgroundFailed.value = false }, { flush: 'sync' })
watch(() => props.grade.gradeImage, () => { iconFailed.value = false }, { flush: 'sync' })
</script>
<style scoped lang="scss">
.member-card { position: relative; overflow: hidden; width: 100%; height: 100%; border-radius: 24rpx; background: linear-gradient(115deg, #51443b, #8e7351); }
.card-background { position: absolute; width: 100%; height: 100%; top: 0; left: 0; }
.member-card-content { position: relative; height: 100%; padding: 30rpx 32rpx; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; }
.card-status { border: 1rpx solid currentColor; opacity: .8; font-size: 20rpx; padding: 4rpx 14rpx; border-radius: 20rpx; }
.grade-heading { display: flex; align-items: center; gap: 14rpx; margin: 18rpx 0 12rpx; max-width: 100%; }
.grade-icon { width: 68rpx; height: 68rpx; flex-shrink: 0; }
.grade-title { font-size: 38rpx; line-height: 1.4; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card-subtitle { font-size: 23rpx; opacity: .85; }
</style>
