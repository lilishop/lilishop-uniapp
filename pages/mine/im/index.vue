<template>
  <view :style="themeStyle" class="wrapper">
    <u-navbar
      class="my-title"
      title-size="32"
      :title="toUser.name"
      :fixed="true"
      :placeholder="true"
      :border="false"
      :auto-back="true"
    ></u-navbar>
    <!-- 空盒子用来防止消息过少时 拉起键盘会遮盖消息 -->
    <view :animation="anData" style="height:0;">
    </view>
    <!-- 消息体 -->
    <!-- 用来获取消息体高度 -->
    <view id="msgList">
      <!-- 消息 -->
      <view class="flex-column-start" v-if="msgList.length" v-for="(item, index) in msgList" :key="index">
        <view class="flex-row-start column-time">
          <!--  <view v-show="compareTime(index, item.createTime)" class="flex-row-start date-text"
            v-text="beautifyTime(item.createTime)">
          </view> -->
        </view>
        <!-- 用户消息 头像可选加入-->
        <view v-if="item.my" class="flex justify-end padding-right one-show  align-start  padding-top">
          <view class="flex justify-end" style="width: 400rpx;margin-top: 12px;">
            <view>
              <view class="user-name">{{ user.nickName }}</view>
              <view class="margin-left padding-chat bg-user-orang" style="border-radius: 35rpx; ">
                <text style="word-break: break-all;"
                  v-if="item.messageType === 'MESSAGE' && !emojistwo.includes(item.text)">{{ item.text }}</text>
                <view v-if="item.messageType === 'MESSAGE' && emojistwo.includes(item.text)"
                  v-html="textReplaceEmoji(item.text)"></view>
                <view v-if="item.messageType == 'GOODS'">
                  <view class="goods-card u-flex u-row-between u-p-b-0" style="width:100%;margin: 0 0; ">
                    <view class="image-box" @click="jumpGoodDesc(item)">
                      <image class="image" :src="JSON.parse(item.text)['thumbnail']" mode="widthFix"></image>
                    </view>
                    <view class="goods-desc" @click="jumpGoodDesc(item)">
                      <view class="goods-desc-name">
                        <text class="goods-card-goods-name">{{
                          JSON.parse(item.text)['goodsName']
                        }}</text>
                      </view>
                      <view class="goods-desc-rice" >￥{{unitPrice(JSON.parse(item.text)['price'])
                          }}
                      </view>
                    </view>
                  </view>
                </view>
          
                <view v-if="item.messageType == 'ORDER'" @click="linkTosOrders(item.text)">
                  <view class="order-sn">
                    <div class="wes">订单号：{{ JSON.parse(item.text)['sn'] }}</div>
                    <div class='order-item flex' v-if="JSON.parse(item.text).orderItems.length"  v-for='(order,orderIndex) in JSON.parse(item.text).orderItems'>
                      <u-image  mode="widthFix" width='120rpx' height='120rpx' :src="order.image" />
                       <view class="name-or-time">
                        <div class="wes-2" >{{
                        order.name
                        }}</div>
                        <div class="main-color goods-desc-rice">{{unitPrice(order.goodsPrice, "￥")
                        }}</div>
                        
                      </view>
                    </div>
                    <view class="order-list">
                      <view class="order-time">
                          <text>{{ JSON.parse(item.text)['paymentTime'] }}</text>
                        </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view>
            <u-avatar :src="user.face" :text="user.face ? '' : user.name" bg-color="#DDDDDD"></u-avatar>
          </view>
        </view>
        <!-- 接收人消息 -->
        <view v-else class="flex-row-start margin-left margin-top one-show">
          <view class="chat-img flex-row-center">
            <u-avatar :src="toUser.face" :text="toUser.face ? '' : toUser.name" bg-color="#DDDDDD">
            </u-avatar>
          </view>
          <view class="flex" style="width: 500rpx;">
            <view>
              <view class="other-name">{{ toUser.name }}</view>
              <view class="margin-left padding-chat flex-column-start bg-to-color" style="border-radius: 35rpx;">
                <text style="word-break: break-all;"
                  v-if="item.messageType === 'MESSAGE' && !emojistwo.includes(item.text)">{{ item.text }}</text>
                <view v-if="item.messageType === 'MESSAGE' && emojistwo.includes(item.text)"
                  v-html="textReplaceEmoji(item.text)"></view>
                <view v-if="item.messageType === 'GOODS'">
                  <view class="goods-card u-flex u-row-between u-p-b-0" style="width:100%;margin: 0 0; ">
                    <view class="image-box" @click="jumpGoodDesc(item)">
                      <image class="image" :src="JSON.parse(item.text)['thumbnail']" mode="widthFix"></image>
                    </view>
                    <view class="goods-desc" @click="jumpGoodDesc(item)">
                      <view class="goods-desc-name">
                        <text class="goods-card-goods-name">{{
                          JSON.parse(item.text)['goodsName']
                        }}</text>
                      </view>
                        <view class="goods-desc-rice" >¥{{
                            JSON.parse(item.text)['price']
                          }}
                      </view>
                    </view>
                  </view>
                </view>
                <view v-if="item.messageType === 'ORDER'">
                  <view class="order-sn">
                    <text>订单号：{{ JSON.parse(item.text)['sn'] }}</text>
                    <view class="order-list">
                      <img style="height: 120rpx; width: 120rpx; margin-top: 15rpx;"
                        :src="JSON.parse(item.text)['groupImages']" mode="widthFix" />
                      <view class="name-or-time">
                        <text @click="linkTosOrders(item.text)">{{
                          JSON.parse(item.text)['groupName']
                        }}</text>
                        <view class="order-time">
                          <text>{{ JSON.parse(item.text)['paymentTime'] }}</text>
                        </view>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>

          </view>
        </view>
      </view>
      <!-- 防止消息底部被遮 -->
      <view v-if="showHide && !localImGoodsId && showHideModel" class="flex-row-start margin-left margin-top"
        style="height: 120rpx;">
      </view>
      <!-- 如果没有聊天记录，定位到底部 -->
      <view
        :style="{ position:'fixed' , bottom:(inputHeight+66)+'px' , width:  '100%' }">
        <view class="cart-message" v-if="showHide && !localImGoodsId && showHideModel">
          <view class="goods-card u-flex u-row-between u-p-b-0">
            <view class="image-box" @click="jumpGoodDesc(item)">
              <image class="image" :src="goodListData.thumbnail" mode="widthFix"></image>
            </view>
            <view class="goods-desc" @click="jumpGoodDesc(item)">
              <view class="goods-desc-name">
                <text class="goods-card-goods-name">{{
                  goodListData.goodsName
                }}</text>
              </view>
              <view class="goods-desc-rice" > ￥{{unitPrice(goodListData.price)
              }}
              </view>
            </view>
            <view class="cancel" @click="cancelModel">X</view>
            <view class="send-goods" @click="sendGoodsMessage">
              <view>发送商品</view>
            </view>
          </view>
        </view>
      </view>

      <!-- 防止消息底部被遮 -->
      <view  style="height: 120rpx;">
      </view>
    </view>
    <!-- 底部导航栏 -->
    <view :style="{position: 'fixed', bottom:inputHeight+'px'}" class="flex-column-center bottom-dh"  :animation="animationData">
      <view class="bottom-dh-char flex-row-around" style="font-size: 55rpx;">
        <!-- vue无法使用软键盘"发送" -->

        <!-- #ifndef MP-WEIXIN -->
         <div v-if="!isShow" @click="navigateToBottom"  class="dh-input">
          用一句简短的话描述您的问题
         </div>
         <input v-show="isShow" ref="inputRef" :focus="isShow"  @focus="inputBindFocus" @blur="eventHandle" :adjust-position="false" v-model="msg" class="dh-input" type="text" style="background-color: #f0f0f0;" @confirm="sendMessage"
         confirm-type="send"  placeholder="用一句简短的话描述您的问题" />
         <!-- #endif  -->

         <!-- #ifdef MP-WEIXIN -->
         <input  ref="inputRef"   @focus="inputBindFocus" @blur="eventHandle" :adjust-position="false" v-model="msg" class="dh-input" type="text" style="background-color: #f0f0f0;" @confirm="sendMessage"
         confirm-type="send"  placeholder="用一句简短的话描述您的问题" />
         <!-- #endif -->

        <view @click="sendMessage" class="cu-tag bg-main-color send round">
          发送 
        </view>
       
        <!-- <text @click="ckAdd" class="cuIcon-roundaddfill text-brown"></text> -->
      </view>
    </view>
    <div id="bottom"></div>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick, getCurrentInstance, computed } from 'vue'
import {
  onLoad,
  onHide,
  onUnload,
  onPullDownRefresh,
  onPageScroll,
} from '@dcloudio/uni-app'
import {
  getTalkMessage as fetchTalkMessageApi,
  getTalkByUser,
  jumpObtain,
} from '@/api/im.js'
import SocketService from '@/utils/socket_service.js'
import storage from '@/utils/storage.js'
import { beautifyTime, unitPrice } from '@/utils/filters.js'
import config from '@/config/config.js'
import { textReplaceEmoji, emojistwo } from '@/utils/emojis.js'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

// rpx和px的比率
let l: number
// 可用窗口高度
let wh: number
// 顶部空盒子的高度
let mgUpHeight: number

const { proxy } = getCurrentInstance()!

const socketOpen = ref(false)
const showHideModel = ref<string | undefined>(undefined)
const localImGoodsId = ref('')
const showHide = ref(true)
const anData = ref<Record<string, any>>({})
const animationData = ref<Record<string, any>>({})
const msgList = ref<any[]>([])
const oldHeight = ref(0)
const params = ref({
  talkId: '',
  pageSize: 10,
  pageNumber: 1,
})
const msg = ref('')
const go = ref(0)
const user = ref<Record<string, any>>({})
const toUser = ref<Record<string, any>>({})
const scrollHeight = ref(0)
const ws = new SocketService()
const resolve = ref<Record<string, any>>({})
const goodListData = ref<Record<string, any>>({})
const reconnectCount = ref(0)
const inputHeight = ref(0)
const isShow = ref(false)

onLoad((options: Record<string, string | undefined> = {}) => {
  showHideModel.value = options.goodsid
  // #ifdef H5
  localImGoodsId.value = uni.getStorageSync('imGoodId')
  // #endif
  resolve.value = options
  if (resolve.value.goodsid) {
    commodityDetails()
  }

  const query = uni.getSystemInfoSync()
  l = query.screenWidth / 750
  wh = query.windowHeight
  scrollHeight.value = query.windowHeight - 44 + 'px'
  user.value = storage.getUserInfo()
  toUser.value = storage.getTalkToUser()

  if (options.talkId) {
    params.value.talkId = options.talkId
    fetchTalkMessages()
  } else {
    getTalk(options.userId!)
  }

  socket()
})

onHide(() => {
  uni.closeSocket()
})

onUnload(() => {
  // #ifdef H5
  uni.setStorageSync('imGoodId', '')
  // #endif
  uni.closeSocket()
})

onPullDownRefresh(() => {
  params.value.pageNumber = params.value.pageNumber + 1
  fetchTalkMessages()
  setTimeout(() => {
    uni.stopPullDownRefresh()
  }, 1000)
})

onPageScroll(() => {
  // #ifdef APP-PLUS
  uni.hideKeyboard()
  isShow.value = false
  // #endif
})

function navigateToBottom() {
  // #ifdef H5
  isShow.value = true
  ;(proxy as any).$refs.inputRef?.focus()
  // #endif

  // #ifdef APP-PLUS
  nextTick(() => {
    uni.pageScrollTo({
      scrollTop: 5000000,
      duration: 50,
      success: () => {
        setTimeout(() => {
          isShow.value = true
        }, 200)
      },
      fail: () => {},
      complete: () => {},
    })
  })
  // #endif
}

function eventHandle() {
  inputHeight.value = 0
  isShow.value = false
}

function inputBindFocus(e: any) {
  if (e.detail.height) {
    // #ifdef APP-PLUS
    if (uni.getSystemInfoSync().platform == 'ios') {
      inputHeight.value = e.detail.height - 40
    } else {
      inputHeight.value = e.detail.height
    }
    // #endif

    // #ifndef APP-PLUS
    inputHeight.value = e.detail.height
    // #endif
  }
}

function sendMessage() {
  if (msg.value == '') {
    return 0
  }
  if (socketOpen.value == false) {
    return
  }
  const payload = {
    operation_type: 'MESSAGE',
    to: toUser.value.userId,
    from: user.value.id,
    message_type: 'MESSAGE',
    context: msg.value,
    talk_id: params.value.talkId,
  }
  const data = JSON.stringify(payload)
  uni.sendSocketMessage({
    data: data,
  })
  msgList.value.push({
    text: msg.value,
    my: true,
    messageType: 'MESSAGE',
  })
  const type = 'down'
  msgGo(type)
  msg.value = ''
}

function sendGoodsMessage() {
  const payload = {
    operation_type: 'MESSAGE',
    to: toUser.value.userId,
    from: user.value.id,
    message_type: 'GOODS',
    context: goodListData.value,
    talk_id: params.value.talkId,
  }
  const data = JSON.stringify(payload)
  uni.sendSocketMessage({
    data: data,
  })
  msgList.value.push({
    text: JSON.stringify(goodListData.value),
    my: true,
    messageType: 'GOODS',
  })
  showHide.value = false
  // #ifdef H5
  uni.setStorageSync('imGoodId', 1111111)
  // #endif
  nextTick(() => {
    uni.pageScrollTo({
      scrollTop: 2000000,
      duration: 300,
    })
  })
}

function socket() {
  uni.closeSocket()
  socketOpen.value = false
  try {
    const url = config.baseWsUrl + '/' + storage.getAccessToken()
    uni.connectSocket({
      url: url,
    })
    uni.onSocketOpen(function () {
      socketOpen.value = true
    })
    if (!socketOpen.value) {
      uni.onSocketError(function (err: any) {
        if (reconnectCount.value < 3) {
          if (err && err.code != 1000) {
            socketOpen.value = true
            setTimeout(() => {
              uni.connectSocket({
                url: url,
              })
            }, 2000)
          }
        } else {
          uni.closeSocket()
        }
        reconnectCount.value++
      })
    }
    uni.onSocketMessage(function (res) {
      const data = JSON.parse(res.data as string)
      console.log(data.result)
      if (data.messageResultType == 'MESSAGE') {
        msgList.value.push(data.result)
        console.log(msgList.value)
      }
      console.log(data)
      msgGo()
    })
  } catch (e) {
    uni.closeSocket()
  }
  uni.onSocketClose((res) => {
    if (res.code != null && res.code != 1000) {
      socket()
    }
  })
}

function linkTosOrders(val: string) {
  const order = JSON.parse(val)
  uni.navigateTo({
    url: '/pages/order/orderDetail?sn=' + order.sn,
  })
}

function jumpGoodDesc(item: any) {
  const info = JSON.parse(item.text)
  uni.navigateTo({
    url: `/pages/product/goods?id=${info.id}&goodsId=${info.goodsId}`,
  })
}

function cancelModel() {
  showHide.value = false
}

function commodityDetails() {
  jumpObtain(resolve.value.skuid, resolve.value.goodsid).then((res) => {
    goodListData.value = res.data.result.data
  })
}

function messageBoxMove(x: number, t: number) {
  const animation = uni.createAnimation({
    duration: t,
    timingFunction: 'linear',
  })
  animation.height(x).step()
  anData.value = animation.export()
}

function msgGo(type?: string) {
  const query = uni.createSelectorQuery()
  setTimeout(() => {
    query
      .select('#msgList')
      .boundingClientRect((data: any) => {
        if (type == 'up') {
          go.value = data.height - oldHeight.value
        } else if (type == 'down') {
          go.value = data.height - wh + 120
        }
        const moveY = wh - data.height
        if (moveY - mgUpHeight < 0) {
          if (moveY < 0) {
            messageBoxMove(0, 200)
          } else {
            messageBoxMove(moveY, 200)
          }
        }
        uni.pageScrollTo({
          scrollTop: go.value,
          duration: 0,
        })
        oldHeight.value = data.height
      })
      .exec()
  }, 100)
}

async function fetchTalkMessages() {
  let type = ''
  await fetchTalkMessageApi(params.value).then((res) => {
    if (res.data.success) {
      if (msgList.value.length >= 10) {
        msgList.value.unshift(...res.data.result)
        type = 'up'
      } else {
        msgList.value.unshift(...res.data.result)
        type = 'down'
      }
      msgList.value.forEach((item) => {
        if (item.fromUser === user.value.id) {
          item.my = true
        }
      })
    }
  })
  console.log(msgList.value)
  msgGo(type)
}

function getTalk(userId: string) {
  getTalkByUser(userId).then((res) => {
    if (res.data.success) {
      toUser.value = res.data.result
      params.value.talkId = res.data.result.id
      fetchTalkMessages()
    }
  })
}
</script>

<style lang="scss" scoped>
.send{
  font-size: 24rpx !important;
}
.order-time {
  margin-top: 15rpx;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.wrapper {
  height: auto !important;
}

.order-list {
  display: flex;
  color: black;
  font-size: 20rpx;
  font-weight: bold;
  width: 95%;
}

.order-sn {
  width: 350rpx;

}

.name-or-time {
  width: 200rpx;
  margin: 15rpx 15rpx;

}


.goods-card {
  border-radius: 20rpx;
  margin-top: 15rpx;
  background-color: #ffffff;
  padding-left: 12rpx;
  width: 95%;
  height: 120rpx;
  display: flex;
  flex-wrap: wrap;
  color: #302c2b;



  .image-box {
    width: 122rpx;
    height: 122rpx;
    overflow: hidden;

    .image {
      width: 122rpx;
      border-radius: 10rpx;
    }
  }

  .goods-desc {
    flex: 1;
    overflow: hidden;
    margin-left: 12rpx;
    width: 400rpx;

    .goods-desc-name {
      font-size: 30rpx;
      line-height: 1.5;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      margin-bottom: 20rpx;


      .goods-card-goods-name {
        color: black;
        text-overflow: ellipsis;
        font-size: 26rpx;
        font-weight: bold;
      }
    }

    .price {
      margin-top: 50rpx;
      line-height: 2;
      margin-left: 5px;
      font-size: 26rpx;
      font-weight: 700;
    }
  }

  .send-goods {
    color: #ffffff;
    height: 50rpx;
    width: 130rpx;
    background-color: #f21c0c;
    font-size: 24rpx;
    border-radius: 17rpx;
    text-align: center;
    line-height: 50rpx;
    padding: 0 10rpx;
    position: relative;
    top: 20rpx;
    right: 20rpx;
  }
}

.cancel {
  color: #737373;
  position: relative;
  bottom: 40rpx;
  left: 12%;
}

.cart-message {
  display: flex;
  justify-content: center;
  align-items: center;
}

.bottom-dh-char {
  background-color: #f9f9f9;
  width: 750rpx;
  height: 110rpx;
}

.user-name {
  text-align: right;
  font-size: 24rpx;
  color: #737373;
  margin-bottom: 10rpx;
  margin-right: 10rpx;
}

.other-name {
  text-align: left;
  font-size: 24rpx;
  color: #737373;
  margin-bottom: 10rpx;
  margin-left: 10rpx;
}
.dh-input {
  line-height: 65rpx;
  width: 500rpx;
  height: 65rpx;
  border-radius: 30rpx;
  padding-left: 15rpx;
  font-size: 22rpx;
  background-color: #FFFFFF;
}
.column-time {
  justify-content: center;
}



.chat-img {
  border-radius: 50%;
  width: 100rpx;
  height: 100rpx;
  background-color: #f7f7f7;
}

.padding-chat {
  padding: 17rpx 20rpx;
}

.tb-nv {
  width: 50rpx;
  height: 50rpx;
}
.goods-desc-rice{
  font-size: 24rpx;
  color: $main-color;
  font-weight: bold;
  margin-top: 10rpx;
}
.order-item{
  margin: 10rpx 0
}


uni-page-head {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
}
.bottom-dh{
  position: fixed;   // input 所在盒子设置绝对定位
  flex-shrink: 0;
  width: 100%;
  left: 0;
  bottom: 0;  // 默认 0
  z-index: 199;
  padding-bottom: env(safe-area-inset-bottom);
  background: #FFFFFF;
  box-sizing: border-box;

}

</style>

<style lang="scss" scoped>
@import "./index-app.scss";
</style>
