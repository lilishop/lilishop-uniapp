<template>
  <view :style="themeStyle" class="sign-in">
    <view class="date-card">
      <div class="box">
        <div class="circle-box">
          <div class="cricle" @click="handleSignIn()">
            <span v-if="!hasSignedToday" :class="{ active: signAnimating || hasSignedToday }">签到</span>
            <span v-else :class="{ active: signAnimating || hasSignedToday }"
              :style="hasSignedToday ? 'transform: rotateY(0deg);' : ''">已签</span>
          </div>
        </div>
        <text class="tips">坚持每天连续签到可以获多重奖励哦</text>
      </div>
    </view>
    <div class="date-card">
      <view class="date-con">
        <view class="date-tit">
          <div class="current-month">
            <div class="day">每日记录<span> ({{ currentMonth }})</span></div>
          </div>
        </view>
        <view class="week">
          <text v-for="item in weekArr" :key="item.id">{{ item }}</text>
        </view>
        <view class="date" v-for="(obj, rowIndex) in calendarRows" :key="rowIndex">
          <view class="item" v-for="(item, dayIndex) in obj" :key="dayIndex" :class="item == '' ? 'hide' : ''"
            :animation="item == currentDay ? animationData : ''">
            <view class="just" :class="signedDays.indexOf(item) != -1 ? 'active' : ''">
              <view class="top">{{ item }} </view>
              <view class="bottom">
                <u-icon name="error" v-if="item <= currentDay" size="24" color="#999"></u-icon>
              </view>
            </view>
            <view class="back" :class="signedDays.indexOf(item) != -1 ? 'active' : ''" :style="
                signedDays.indexOf(item) != -1 && hasSignedToday
                  ? 'transform: rotateY(0deg);'
                  : signedDays.indexOf(item) != -1 && item != currentDay
                  ? 'transform: rotateY(0deg);'
                  : ''
              ">
              <view class="top">{{ item }}</view>
              <view class="bottom">
                <u-icon name="checkmark" size="24" :color="aiderLightColor"></u-icon>
              </view>
            </view>
          </view>
        </view>
      </view>
    </div>
    <view class="mask" :class="{ show: showSuccessMask, trans: maskClosing }" ref="mask">
      <view class="mask-header">
        <text class="close"></text>
        <text>签到成功</text>
        <text class="close" @click="closeSuccessMask">×</text>
      </view>
      <view class="mask-con">
        <u-icon size="120" style="margin: 50rpx 0" :color="aiderLightColor" name="checkmark"></u-icon>
        <text class="text">连续签到可获得额外奖励哦！</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { sign, signTime } from '@/api/point.js'
import { getThemeStyle } from '@/utils/theme'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))
const aiderLightColor = computed(() => store.getters.aiderLightColor)

const signAnimating = ref(false)
const animationData = ref({})
const showSuccessMask = ref(false)
const maskClosing = ref(false)
const weekArr = ['日', '一', '二', '三', '四', '五', '六']
const monthLabels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const currentMonth = ref('')
const currentMonthIndex = ref(0)
const currentYear = ref(0)
const currentDay = ref(0)
const calendarRows = ref<any[][]>([])
const signedDays = ref<number[]>([])
const signRecords = ref<any[]>([])
const hasSignedToday = ref(false)

onLoad(async () => {
	const response = await signTime(
		`${new Date().getFullYear()}${padZero(new Date().getMonth() + 1)}`
	)
	signRecords.value = response.data.result
	buildCalendar()
})

function padZero(val: number) {
	return val >= 10 ? String(val) : `0${val}`
}

async function handleSignIn() {
	if (hasSignedToday.value || signAnimating.value) return

	const response = await sign()
	if (response.data.code !== 200) {
		uni.showToast({
			title: response.data.message,
			duration: 2000,
			icon: 'none',
		})
		return
	}

	const animation = uni.createAnimation({ duration: 200, timingFunction: 'linear' })
	signedDays.value.push(currentDay.value)
	animation.rotateY(0).step()
	animationData.value = animation.export()

	setTimeout(() => {
		signAnimating.value = true
		showSuccessMask.value = true
		hasSignedToday.value = true
		animation.rotateY(0).step()
		animationData.value = animation.export()
	}, 200)
}

function closeSuccessMask() {
	showSuccessMask.value = false
	maskClosing.value = true
	setTimeout(() => {
		maskClosing.value = false
	}, 500)
}

function buildCalendar() {
	const date = new Date()
	const monthIndex = date.getMonth()
	currentYear.value = date.getFullYear()
	currentMonth.value = monthLabels[monthIndex]
	currentMonthIndex.value = monthIndex + 1
	currentDay.value = date.getDate()
	syncSignedDays()
	const firstWeekDay = getWeekByDay(`${currentYear.value}-${monthIndex + 1}-1`)
	buildMonthDays(monthIndex, firstWeekDay)
}

function syncSignedDays() {
	const date = new Date()
	const monthIndex = date.getMonth()
	signedDays.value = []
	hasSignedToday.value = false

	signRecords.value.forEach((item) => {
		const datePart = item.createTime.split(' ')[0]
		const parts = datePart.split('-')
		if (
			Number(parts[0]) === currentYear.value &&
			Number(parts[1]) === currentMonthIndex.value
		) {
			signedDays.value.push(Number(parts[2]))
		}
		if (
			Number(parts[0]) === date.getFullYear() &&
			Number(parts[1]) === monthIndex + 1 &&
			Number(parts[2]) === date.getDate()
		) {
			hasSignedToday.value = true
		}
	})
}

function buildMonthDays(monthIndex: number, firstWeekDay: number) {
	const daysInRow: any[] = []
	const rows: any[][] = []
	for (let i = 0; i < firstWeekDay; i++) {
		daysInRow.push('')
	}

	const isLongMonth = [0, 2, 4, 6, 7, 9, 11].includes(monthIndex)
	const isFebruary = monthIndex === 1
	let totalDays = isLongMonth ? 31 : 30
	if (isFebruary) {
		const year = currentYear.value
		const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
		totalDays = isLeap ? 29 : 28
	}

	for (let day = 1; day <= totalDays; day++) {
		daysInRow.push(day)
	}

	while (daysInRow.length) {
		const row = daysInRow.splice(0, 7)
		while (row.length < 7) {
			row.push('')
		}
		rows.push(row)
	}
	calendarRows.value = rows
}

function getWeekByDay(dayValue: string) {
	return new Date(Date.parse(dayValue.replace(/-/g, '/'))).getDay()
}
</script>
<style scoped>
page {
  background: #f7f7f7;
}
</style>
<style lang="scss" scoped>
.date-card {
  padding: 0 32rpx;
  margin: 32rpx 0;
  box-shadow: 0 4rpx 24rpx 0 rgba($color: #f6f6f6, $alpha: 1);
}
.tips {
  margin-top: 54rpx;
  color: #999;
  font-size: 24rpx;
  letter-spacing: 1rpx;
}

.circle-box {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: $aider-light-color;
  box-shadow: 0 4rpx 24rpx 0 $aider-light-color;
  display: flex;
  justify-content: center; //这个是X轴居中
  align-items: center; //这个是 Y轴居中
 
}

.cricle {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: $aider-light-color;
  text-align: center;
  line-height: 160rpx;
  color: #fff;
  font-size: 40rpx;
}
.current-month {
  width: 100%;
  margin: 20rpx 0;
}
.box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding:64rpx 32rpx;
  background: #fff;
  border-radius: 20rpx;
}
.sign-in {
  color: #333;
  .date-con {
    background: #fff;
    min-height: 730rpx;
    border-radius: 20rpx;
    padding: 0 28rpx;
  }
  .day {
    font-size: 36rpx;

    > span {
      font-size: 30rpx;
      color: #999;
      margin-left: 20rpx;
    }
  }
  .date-tit {
    display: flex;
    justify-content: space-between;
    margin: 0 0 30rpx 0;
  }

  .week {
    display: flex;
    justify-content: space-between;
    color: #a6a6a6;
    font-size: 26rpx;

    text {
      width: 66rpx;
      text-align: center;
    }
  }

  .date {
    margin: 10rpx 0 36rpx;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;

    .item {
      width: 66rpx;
      height: 96rpx;
      border-radius: 5px;
      overflow: hidden;

      position: relative;

      &.hide {
        opacity: 0;
      }

      .just,
      .back {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        position: absolute;

        .top {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1.2;
          min-height: 0;

          &:before {
            content: "";
            width: 40rpx;
            height: 40rpx;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            top: 50%;
            margin-top: -28rpx;
          }
        }
      }

      .just {
        &.active {
          display: none;
        }
      }
      .back {
        display: none;
        &.active {
          display: flex;
        }

        .top {
          color: $aider-light-color;
        }
      }

      .bottom {
        color: #999;
        font-size: 20rpx;
        height: 36rpx;
        min-height: 36rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
    }
  }
  .mask {
    position: fixed;
    top: 0;
    bottom: 0;
    left: -100%;
    right: 100%;
    background: rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.5s;

    &.show {
      opacity: 1;
      left: 0;
      right: 0;
    }

    &.trans {
      left: 0;
      right: 0;
    }

    .mask-header {
      width: 540rpx;
      height: 130rpx;
      line-height: 130rpx;
      background: $aider-light-color;
      color: #fff;
      font-size: 40rpx;
      font-weight: 500;
      display: flex;
      justify-content: space-between;

      .close {
        width: 60rpx;
        font-size: 66rpx;
        font-weight: 400;
        line-height: 60rpx;
      }
    }

    .mask-con {
      width: 540rpx;
      height: 380rpx;
      background: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #999;
      font-size: 24rpx;
      border-radius: 0 0 9px 9px;

      .keep-sign {
        font-size: 30rpx;
        margin-top: 30rpx;

        text {
          font-size: 46rpx;
          font-weight: 500;
          color: #999;
          padding: 0 6rpx 0 8rpx;
        }
      }

      .mark {
        // flex: 1;
        display: flex;
        align-items: flex-end;
        position: relative;
        margin-bottom: 16rpx;

        text {
          margin-left: 4rpx;
          color: #999;
        }
      }

      .text {
        color: #6f6f6f;
        height: 90rpx;
      }
    }
  }
}
</style>
