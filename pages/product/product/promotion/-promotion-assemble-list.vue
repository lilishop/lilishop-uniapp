<template>
  <view class="group-list">
    <view class="group-name">拼购列表</view>
    <view v-if="assembleOrder.length != 0">
      <view class="group-item" v-for="(order, index) in assembleOrder" :key="index">
        <view class="group-item-user">
          <u-image shape="circle" width="40px" height="40px" :src="order.face || userImage"></u-image>
          <span class="group-item-name">{{noPassByName(order.nickName) }}</span>
        </view>
        <view>
          <span class="group-item-name">还差{{ order.toBeGroupedNum }}人成团</span>
        </view>
        <view>
          <u-button size="mini" :custom-style="joinBtnStyle" @click="buy(order)"
            >去参团</u-button
          >
        </view>
      </view>
    </view>
    <view v-else class="nomore">
      <u-empty text="暂无拼团信息" mode="list"></u-empty>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import * as API_Promotions from '@/api/promotions'
import configs from '@/config/config'
import { noPassByName } from '@/utils/filters.js'
import { useStore } from '@/store'

const props = defineProps<{
  res?: any
}>()

const emit = defineEmits<{
  'to-assemble-buy-now': [order: any]
}>()

const store = useStore()
const userImage = configs.defaultUserPhoto
const assembleOrder = ref<any[]>([])

const joinBtnStyle = computed(() => ({
  background: store.getters.lightColor,
  color: '#fff',
}))

watch(
  () => props.res,
  (res) => {
    if (res && res.length != 0) {
      Object.keys(res).forEach((item) => {
        const key = item.split('-')
        if (key && key[0] == 'PINTUAN') {
          getAssembleInfo(item)
        }
      })
    }
  },
  { immediate: true }
)

function getAssembleInfo(val: string) {
  const id = props.res[val].id
  API_Promotions.getPromotionGroupMember(id).then((res) => {
    if (res.data.success) {
      assembleOrder.value = res.data.result
    }
  })
}

function buy(order: any) {
  emit('to-assemble-buy-now', order)
}
</script>

<style lang="scss" scoped>
@import "../product.scss";
.nomore {
  padding: 10rpx 0;
}

.group-item {
  margin: 30rpx 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.group-item-user {
  display: flex;
  align-items: center;
}

.group-item-name {
  margin-left: 23rpx;
  font-size: 24rpx;
  color: #999999;
  font-weight: 400;
}
</style>
