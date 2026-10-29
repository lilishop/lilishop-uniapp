<template>
  <u-popup class="popup" :show="addressFlag" :height="setup.height" :mode="setup.mode" :border-radius="setup.radius" @close="closeAddress()"   closeable>
    <view class="header-title">选择地址</view>
    <view class="view-box" v-if="addressDetail">
      <view class="view-item" v-for="(item, index) in addressDetail" :key="index" @click="clickAddress(item)">
        <view class="view-box-checkbox">
          <view class="checkbox" :class="{ checked: item.isDefault }">
          </view>
        </view>
        <view class="view-box-dress" :class="{ 'box-dress-blod': item.isDefault }">{{clearStrComma(item.consigneeAddressPath) }}</view>
      </view>
    </view>
    <view class="view-box" v-else>
      <view class="noMore">
        <u-empty text="暂无收货地址" mode="address"></u-empty>
      </view>
    </view>

    <!-- 按钮 -->

    <view class="btns">
      <view class="box-btn light" @click="getpicker">选择其他地址</view>
      <view class="box-btn" @click="closeAddress()">确定</view>
    </view>
    <m-city :provinceData="cityList" headTitle="区域选择" ref="cityPicker"  pickerSize="4"></m-city>
  </u-popup>
</template>
<script setup lang="ts">
import * as API_Address from '@/api/address.js';
import setup from '@/components/m-buy/popup.js';
import { clearStrComma, isLogin } from '@/utils/filters.js';
import { onMounted, ref } from 'vue';

const props = defineProps<{
  goodsId?: string | number
  addressFlag?: boolean
}>()

const emit = defineEmits<{
  closeAddress: [val: boolean]
  deliveryData: [val: any]
}>()

const checked = ref<any>('')
const addressDetail = ref<any>('')
const cityList = ref([
  {
    id: '',
    localName: '请选择',
    children: [],
  },
])

onMounted(() => {
  if (isLogin('auth')) {
    getShippingAddress()
  }
})

function closeAddress() {
  emit('closeAddress', false)
  emit('deliveryData', checked.value)
}

function getpicker() {
  uni.navigateTo({
    url: '/pages/mine/address/add',
  })
  closeAddress()
}

function getShippingAddress() {
  if (isLogin('auth')) {
    API_Address.getAddressList(1, 50).then((res) => {
      if (res.data.success) {
        addressDetail.value = res.data.result.records
        const addr = res.data.result.records.filter((item: any) => {
          return item.isDefault == 1
        })

        if (addr[0]) {
          checked.value = addr[0]
          emit('deliveryData', checked.value)
        }
      }
    })
  }
}

function clickAddress(val: any) {
  checked.value = val

  addressDetail.value.forEach((item: any) => {
    item.isDefault = false
  })
  val.isDefault = !val.isDefault
  emit('deliveryData', checked.value)
}
</script>
<style lang="scss" scoped>
.light {
  background-image: linear-gradient(
    91deg,
    $light-color 1%,
    $aider-light-color 99%
  ) !important;
  box-shadow: 0 2px 6px 0 rgba(255, 65, 66, 0.2);
}
.noMore {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-item {
  display: flex;
  align-items: center;
  padding: 22rpx 0;
}
.view-box-dress {
  letter-spacing: 1rpx;
  margin-left: 20rpx;
  line-height: 42rpx;
  color: #333;
  font-size: 28rpx;
}
.checked {
  background: $price-color;
}
.active {
  color: #fff;
}
.checkbox {
  text-align: center;
  line-height: 40rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid #ededed;
}
@import "@/components/m-buy/popup.scss";
.view-box {
  height: 810rpx;
  // #ifdef MP-WEIXIN
  height: 770rpx;
  // #endif
  padding: 0 20rpx;
  overflow-y: auto;
}
.header-title {
  font-weight: bold;
  color: #333;
  text-align: center;
  height: 90rpx;
  line-height: 90rpx;
  font-size: 34rpx;
}
</style>
