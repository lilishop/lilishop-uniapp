<template>
  <div class="wrapper">
    <div v-if="!askGoods.goods_id" class="noMore">
      暂无信息
    </div>
    <div class="askBox" v-else>
      <u-row :gutter="24">
        <u-col span="2" @click="goodsDetail()">
          <image class="img" :src="queryGoodsDetail.thumbnail"></image>
        </u-col>
        <u-col span="8" @click="goodsDetail()">
          <h5 style="padding-left:10rpx;">{{queryGoodsDetail.goodsName}}</h5>
        </u-col>

      </u-row>
      <u-row>
        <u-col span="12">
          <u-input v-model="params.askValue" height="200" type="textarea" :border="border" />
        </u-col>
        <u-radio-group v-model="params.anonymous" @change="radioGroupChange">
          <u-radio @change="radioChange">
            匿名提交
          </u-radio>
        </u-radio-group>
        <u-col span="12">
          <u-row :gutter="12">
            <u-col :offset="1" span="4">
              <u-button class="btns" @click="params.askValue=''">清空</u-button>
            </u-col>
            <u-col :offset="2" span="4">
              <u-button class="btns" @click="getAskMessage()" type="success">提交</u-button>
            </u-col>
          </u-row>
        </u-col>
      </u-row>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import * as API_GOODS from '../../api/goods'
import * as API_MEM from '../../api/members'
import { useStore } from '@/store'

const store = useStore()

const askGoods = ref<any>('')
const queryGoodsDetail = ref<any>('')
const border = ref(true)
const params = reactive({
  askValue: '',
  anonymous: 'YES',
})

function getGoodsData() {
  if (askGoods.value.goods_id) {
    API_GOODS.getGoods(askGoods.value.goods_id).then((result) => {
      queryGoodsDetail.value = result.data
    })
  }
}

function getAskMessage() {
  uni.showLoading()
  if (params.askValue == '') {
    uni.showToast({
      title: '请填写内容!',
      icon: 'none',
    })
    if (store.state.isShowToast) {
      uni.hideLoading()
    }
    return false
  }
  API_MEM.consultating(
    askGoods.value.goods_id,
    params.askValue,
    params.anonymous
  )
    .then((res) => {
      if (res.statusCode == 200) {
        uni.showToast({
          title: '提交成功!',
          icon: 'none',
        })
        params.askValue = ''
      }
      if (store.state.isShowToast) {
        uni.hideLoading()
      }
    })
    .catch(() => {
      if (store.state.isShowToast) {
        uni.hideLoading()
      }
    })
}

function radioGroupChange(_e: any) {}

function radioChange(_e: any) {
  if (params.anonymous == 'YES') {
    params.anonymous = 'NO'
  } else {
    params.anonymous = 'YES'
  }
}

function goodsDetail() {}

onLoad((options: any) => {
  askGoods.value = options
  getGoodsData()
})
</script>
<style scoped lang="scss">
.img {
  max-width: 100%;
  height: 100rpx;
}

.noMore {
  text-align: center;
  margin: 40rpx 0;
}

.askBox {
  padding: 32rpx;
}

::v-deep .u-col {
  text-align: center;
  padding: 16rpx 0 !important;
}

.wrapper {
  background: #fff;
  padding: 32rpx 0;
}
</style>
