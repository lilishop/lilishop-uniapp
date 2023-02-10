<template>
  <view class="wrapper">
    <u-navbar class="my-title" title-size="32" :title="toUser.name"></u-navbar>
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
                  <view class="goodsCard u-flex u-row-between u-p-b-0" style="width:100%;margin: 0 0; ">
                    <view class="imagebox" @click="jumpGoodDelic(item)">
                      <image class="image" :src="JSON.parse(item.text)['thumbnail']" mode="widthFix"></image>
                    </view>
                    <view class="goodsdesc" @click="jumpGoodDelic(item)">
                      <view class="goodsdesc-name">
                        <text class="goodsCard_goodNmae">{{
                          JSON.parse(item.text)['goodsName']
                        }}</text>
                      </view>
                      <view class="goodsdesc-rice" style="margin-top:10rpx; color: orange;"><text
                          style="font-size:20rpx;">￥{{
                            JSON.parse(item.text)['price'] | unitPrice
                          }}</text>
                      </view>
                    </view>
                  </view>
                </view>
                <view v-if="item.messageType == 'ORDER'">
                  <view class="orderSn">
                    <text>订单号：{{ JSON.parse(item.text)['sn'] }}</text>
                    <view class="oederList">
                      <img style="height: 120rpx; width: 120rpx; margin-top: 15rpx;"
                        :src="JSON.parse(item.text)['groupImages']" mode="widthFix" />
                      <view class="groupNameOrTime">
                        <text @click="linkTosOrders(item.text)">{{
                          JSON.parse(item.text)['groupName']
                        }}</text>
                        <view class="orderTime">
                          <text>{{ JSON.parse(item.text)['paymentTime'] }}</text>
                        </view>
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
                  <view class="goodsCard u-flex u-row-between u-p-b-0" style="width:100%;margin: 0 0; ">
                    <view class="imagebox" @click="jumpGoodDelic(item)">
                      <image class="image" :src="JSON.parse(item.text)['thumbnail']" mode="widthFix"></image>
                    </view>
                    <view class="goodsdesc" @click="jumpGoodDelic(item)">
                      <view class="goodsdesc-name">
                        <text class="goodsCard_goodNmae">{{
                          JSON.parse(item.text)['goodsName']
                        }}</text>
                      </view>
                      <view class="goodsdesc-rice" style="margin-top:10rpx; color: orange;"><text
                          style="font-size:20rpx;">¥{{
                            JSON.parse(item.text)['price']
                          }}</text>
                      </view>
                    </view>
                  </view>
                </view>
                <view v-if="item.messageType === 'ORDER'">
                  <view class="orderSn">
                    <text>订单号：{{ JSON.parse(item.text)['sn'] }}</text>
                    <view class="oederList">
                      <img style="height: 120rpx; width: 120rpx; margin-top: 15rpx;"
                        :src="JSON.parse(item.text)['groupImages']" mode="widthFix" />
                      <view class="groupNameOrTime">
                        <text @click="linkTosOrders(item.text)">{{
                          JSON.parse(item.text)['groupName']
                        }}</text>
                        <view class="orderTime">
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
        :style="{ position: msgList.length == 0 ? 'fixed' : '', bottom: msgList.length == 0 ? '66px' : '', width: msgList.length == 0 ? '100%' : '' }">
        <view class="cartMessage" v-if="showHide && !localImGoodsId && showHideModel">
          <view class="goodsCard u-flex u-row-between u-p-b-0">
            <view class="imagebox" @click="jumpGoodDelic(item)">
              <image class="image" :src="goodListData.thumbnail" mode="widthFix"></image>
            </view>
            <view class="goodsdesc" @click="jumpGoodDelic(item)">
              <view class="goodsdesc-name">
                <text class="goodsCard_goodNmae">{{
                  goodListData.goodsName
                }}</text>
              </view>
              <view class="goodsdesc-rice" style="margin-top:10rpx; color: orange;"><text style="font-size:20rpx;"> ￥{{
                goodListData.price | unitPrice
              }}</text>
              </view>
            </view>
            <view class="cancel" @click="cancelModel">X</view>
            <view class="sendGood" @click="sendGoodsMessage">
              <view>发送商品</view>
            </view>
          </view>
        </view>
      </view>

      <!-- loading是显示 -->
      <!-- <view v-show="msgLoad" class=" margin-left margin-top">
        <view class="chat-img flex-row-center">
          <image style="height: 75rpx;width: 75rpx;" src="../../static/image/robt.png" mode="aspectFit"></image>
        </view>
        <view class="flex" style="width: 500rpx;">
          <view class="margin-left padding-chat flex-column-start"
            style="border-radius: 35rpx;background-color: #f9f9f9;">
            <view class="cuIcon-loading turn-load" style="font-size: 35rpx;color: #3e9982;">

            </view>
          </view>
        </view>
      </view> -->
      <!-- 防止消息底部被遮 -->
      <view style="height: 120rpx;">
      </view>
    </view>
    <!-- 底部导航栏 -->
    <view class="flex-column-center" style="position: fixed;bottom: -180px;" :animation="animationData">
      <view class="bottom-dh-char flex-row-around" style="font-size: 55rpx;">
        <!-- vue无法使用软键盘"发送" -->
        <input v-model="msg" class="dh-input" type="text" style="background-color: #f0f0f0;" @confirm="sendMessage"
          confirm-type="search" placeholder-class="my-neirong-sm" placeholder="用一句简短的话描述您的问题" />
        <view @click="sendMessage" class="cu-tag bg-cyan round">
          发送
        </view>
        <!-- <text @click="ckAdd" class="cuIcon-roundaddfill text-brown"></text> -->
      </view>
      <!-- 附加栏(自定义) -->
      <view class="box-normal flex-row-around flex-wrap">
        <view class="tb-text">
          <view class="cuIcon-form"></view>
          <text>问题反馈</text>
        </view>
        <view class="tb-text">
          <view class="cuIcon-form"></view>
          <text>人工客服</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// rpx和px的比率
var l
// 可用窗口高度
var wh
// 顶部空盒子的高度
var mgUpHeight
import {
  getTalkMessage,
  getTalkByUser,
  jumpObtain
} from "@/api/im.js";
import SocketService from "@/utils/socket_service.js";
import storage from "@/utils/storage.js";
import {
  beautifyTime
} from "@/utils/filters.js"
import config from '@/config/config.js'
import { textReplaceEmoji, emojistwo } from '@/utils/emojis.js';
export default {
  // 页面卸载后清除imGoodId
  onUnload () {
    // #ifdef H5
    uni.setStorageSync("imGoodId", '');
    // #endif

    if (this.socketOpen == true) {
      uni.closeSocket();
    }
  },
  onReady (options) {
    // 没有goodsid则不显示 发送商品弹窗
    this.showHideModel = options.goodsid
    // 发送后刷新页面不显示 发送商品弹窗 local里面imGoodId不为空显示
    // #ifdef H5
    this.localImGoodsId = uni.getStorageSync("imGoodId");
    // #endif
    this.resolve = options
    // 请求商品信息
    if (this.resolve.goodsid) {
      this.commodityDetails()
    }
    // 如果需要缓存消息缓存msgList即可
    // 监听键盘拉起
    // 因为无法控制键盘拉起的速度,所以这里尽量以慢速处理
    uni.onKeyboardHeightChange(res => {
      const query = uni.createSelectorQuery()
      query.select('#msgList').boundingClientRect(data => {
        // 若消息体没有超过2倍的键盘则向下移动差值,防止遮住消息体
        var up = res.height * 2 - data.height - l * 110
        if (up > 0) {
          // 动态改变空盒子高度
          this.messageBoxMove(up, 300)
          // 记录改变的值,若不收回键盘且发送了消息用来防止消息过多被遮盖
          mgUpHeight = up
        }
        // 收回
        if (res.height == 0) {
          this.messageBoxMove(0, 0)
        }
      }).exec();
    })
    var query = uni.getSystemInfoSync()

    l = query.screenWidth / 750
    wh = query.windowHeight
    this.scrollHeight = (query.windowHeight - 44) + "px"
    this.user = storage.getUserInfo()
    this.toUser = storage.getTalkToUser()

    if (options.talkId) {
      this.params.talkId = options.talkId;
      this.getTalkMessage()
    } else {
      this.getTalk(options.userId)

    }

    // this.ws.connect();
    this.sokcet();
  },
  onPullDownRefresh () {
    this.params.pageNumber = this.params.pageNumber + 1
    this.getTalkMessage()
    setTimeout(function () {
      uni.stopPullDownRefresh();
    }, 1000);
  },

  data () {
    return {
      textReplaceEmoji,
      emojistwo,
      socketOpen: false, //是否连接
      storage,
      fixed: 'fixed',
      bottom: '50px',
      width: '100%',
      showHideModel: undefined,
      localImGoodsId: '',
      showHide: true,
      msgLoad: false,
      anData: {},
      animationData: {},
      msgList: [],
      oldHeight: 0,
      params: { //搜索条件
        talkId: '',
        pageSize: 10,
        pageNumber: 1,
      },
      goToIndex: 0, // 前往位置
      msg: "",
      go: 0,
      newMessageNum: 0,
      user: {},
      toUser: {},
      scrollHeight: 0,
      ws: new SocketService(),
      resolve: {},
      goodListData: {}
    }
  },
  // watch: {
  //   'ws.callBackMapping': {
  //     handler: function (val) {
  //       val = JSON.parse(val)
  //       if (val.messageResultType == 'MESSAGE') {
  //         this.msgList.push(val.result)
  //       }
  //       this.newMessageNum++;
  //       //接收到消息后发送已读
  //       let msg = val
  //       msg.operation_type = 'READ'
  //       this.ws.send(JSON.stringify(msg))
  //     }
  //   }
  // },
  methods: {
    sendMessage () {
      if (this.msg == "") {
        return 0;
      }
      if (this.socketOpen == false) {
        return
      }
      let msg = {
        operation_type: "MESSAGE",
        to: this.toUser.userId,
        from: this.user.id,
        message_type: "MESSAGE",
        context: this.msg,
        talk_id: this.params.talkId,
      }
      let data = JSON.stringify(msg);
      try {
        uni.sendSocketMessage({
          data: data
        });
        this.msgList.push({
          "text": this.msg,
          "my": true,
          "messageType": 'MESSAGE'
        })
        let type = 'down';
        this.msgGo(type)
        this.msg = ""
      } catch (e) {
        uni.closeSocket();
      }
    },
    sendGoodsMessage () {
      let msg = {
        operation_type: "MESSAGE",
        to: this.toUser.userId,
        from: this.user.id,
        message_type: "GOODS",
        context: this.goodListData,
        talk_id: this.params.talkId,
      }
      let data = JSON.stringify(msg);
      uni.sendSocketMessage({
        data: data
      });
      this.msgList.push({
        "text": JSON.stringify(this.goodListData),
        "my": true,
        "messageType": 'GOODS'
      })
      this.showHide = false
      // #ifdef H5
      uni.setStorageSync("imGoodId", 1111111);
      // #endif
      this.$nextTick(() => {
        uni.pageScrollTo({
          scrollTop: 2000000,
          duration: 300
        });
      })
    },
    sokcet () {
      var _this = this;
      uni.closeSocket();
      this.socketOpen = false;
      try {
        //WebSocket的地址
        var url = config.baseWsUrl + '/' + storage.getAccessToken();
        // 连接
        uni.connectSocket({
          url: url,
        });
        // 监听WebSocket连接已打开
        uni.onSocketOpen(function (res) {
          _this.socketOpen = true;
        });
        if (!this.socketOpen) {
          // 监听连接失败
          uni.onSocketError(function (err) {
              if (err && err.code !== 1000) {
				//断线重连等待3秒
				setTimeout(()=>{},3000)
                _this.socketOpen = true;
                uni.connectSocket({
                  url: url,
                });
              }
            }
          });
        }
        // 监听连接关闭
        uni.onSocketClose(function (err) {
          if (err && err.code !== 1000) {
            setTimeout(function () {
              _this.socketOpen = true;
              uni.connectSocket({
                url: url,
              });
            }, 999999)
          }
        });
        // 监听收到信息
        uni.onSocketMessage(function (res) {
          res.data = JSON.parse(res.data)
          console.log(res.data.result);
          if (res.data.messageResultType == 'MESSAGE') {
            _this.msgList.push(res.data.result)
            console.log(_this.msgList)
          }
          console.log(res.data)
          _this.msgGo()
        })
      } catch (e) {

      }finally{
		  
		  uni.closeSocket()
	  }

    },
    beautifyTime,
    //订单详情
    linkTosOrders (val) {
      let order = JSON.parse(val)
      uni.navigateTo({
        url: '/pages/order/orderDetail?sn=' + order.sn,
      });

    },
    // 跳转商品详情页
    jumpGoodDelic (item) {
      let info = JSON.parse(item.text)
      uni.navigateTo({
        url: `/pages/product/goods?id=${info.id}&goodsId=${info.goodsId}`,
      });
    },

    //取消发送
    cancelModel () {
      this.showHide = false
    },
    // 请求商品详情
    commodityDetails () {
      jumpObtain(this.resolve.skuid, this.resolve.goodsid).then((res) => {
        this.goodListData = res.data.result.data
      })
    },

    // 切换输入法时移动输入框(按照官方的上推页面的原理应该会自动适应不同的键盘高度-->官方bug)
    goPag (kh) {
      this.retractBox(0, 250)
      if (this.keyHeight != 0) {
        if (kh - this.keyHeight > 0) {
          this.retractBox(this.keyHeight - kh, 250)
        }

      }
    },
    // 移动顶部的空盒子
    messageBoxMove (x, t) {
      var animation = uni.createAnimation({
        duration: t,
        timingFunction: 'linear',
      })

      this.animation = animation

      animation.height(x).step()

      this.anData = animation.export()
    },
    // 保持消息体可见
    msgGo (type) {
      console.log(type, 'typetypetype');
      const query = uni.createSelectorQuery()
      // 延时100ms保证是最新的高度
      setTimeout(() => {
        // 获取消息体高度
        query.select('#msgList').boundingClientRect(data => {
          // 如果超过scorll高度就滚动scorll
          if (type == 'up') {
            this.go = data.height - this.oldHeight
          } else if (type == 'down') {
            this.go = data.height - wh + 120
          }
          // if (this.oldHeight > 0) {
          // 	this.go = data.height - this.oldHeight
          // } else {
          // 	// if (data.height - (wh - 32) > 0) {
          // 	this.go = data.height - wh + 120
          // }
          // 保证键盘第一次拉起时消息体能保持可见
          var moveY = wh - data.height
          // 超出页面则缩回空盒子
          if (moveY - mgUpHeight < 0) {
            // 小于0则视为0
            if (moveY < 0) {
              this.messageBoxMove(0, 200)
            } else {
              // 否则缩回盒子对应的高度
              this.messageBoxMove(moveY, 200)
            }
          }
          uni.pageScrollTo({
            scrollTop: this.go,
            duration: 0
          })
          this.oldHeight = data.height
        }).exec();
      }, 100)
    },
    // 回答问题的业务逻辑
    answer (id) {
      // 这里应该传入问题的id,模拟就用index代替了

    },
    // sendMessage() {
    // 	// 消息为空不做任何操作
    // 	if (this.msg == "") {
    // 		return 0;
    // 	}
    // 	// 显示消息 msg消息文本,my鉴别是谁发的消息(不能用俩个消息数组循环,否则消息不会穿插)
    // 	let msg = {
    // 		operation_type: "MESSAGE",
    // 		to: this.toUser.userId,
    // 		from: this.user.id,
    // 		message_type: "MESSAGE",
    // 		context: this.msg,
    // 		talk_id: this.params.talkId,
    // 	}
    // 	this.ws.send(JSON.stringify(msg))
    // 	this.msgList.push({
    // 		"text": this.msg,
    // 		"my": true,
    // 		"messageType": 'MESSAGE'
    // 	})
    // 	console.log(this.msgList, 'this.msgListthis.msgListthis.msgListthis.msgListthis.msgList')
    // 	// 保证消息可见
    // 	let type = 'down';
    // 	this.msgGo(type)
    // 	// 回答问题
    // 	// this.msgKf(this.msg)
    // 	// 清除消息
    // 	this.msg = ""
    // },
    // msgKf(x) {
    // 	// loading
    // 	// this.msgLoad = true
    // 	// 这里连接服务器获取答案

    // 	// 下面模拟请求
    // 	// setTimeout(() => {
    // 	// 	// 取消loading
    // 	// 	this.msgLoad = false
    // 	// 	// this.msgGo()
    // 	// }, 2000)
    // },
    // 不建议输入框聚焦时操作此动画
    ckAdd () {
      if (!this.showTow) {
        this.retractBox(-180, 350)
      } else {
        this.retractBox(0, 200)
      }
      this.showTow = !this.showTow
    },
    hideKey () {
      uni.hideKeyboard()
    },
    // 拉起/收回附加栏
    retractBox (x, t) {

      var animation = uni.createAnimation({
        duration: t,
        timingFunction: 'ease',
      })

      this.animation = animation

      animation.translateY(x).step()

      this.animationData = animation.export()
    },
    async getTalkMessage () {
      let type = '';
      await getTalkMessage(this.params).then(res => {
        if (res.data.success) {
          if (this.msgList.length >= 10) {
            this.msgList.unshift(...res.data.result)
            type = 'up'
          } else {
            this.msgList = res.data.result
            type = 'down'
          }
          this.msgList.forEach(item => {
            if (item.fromUser === this.user.id) {
              item.my = true
            }
          })
        }
      })
      console.log(this.msgList);
      this.msgGo(type)
    },
    touchMoreMessage (e) {
      if (e.target.scrollTop == 0) {
        this.params.pageNumber = this.params.pageNumber + 1
        this.getTalkMessage()
      }

    },
    async getTalk (userId) {
      getTalkByUser(userId).then(res => {
        if (res.data.success) {
          this.toUser = res.data.result
          this.params.talkId = res.data.result.id
          this.getTalkMessage()
        }
      })
    },
    // 处理消息时间是否显示
    compareTime (index, datetime) {
      if (datetime == undefined) {
        return false;
      }
      if (typeof datetime == "number") {
        datetime = this.unixToDate(datetime, "yyyy-MM-dd hh:mm");
      }

      if (this.msgList[index].is_revoke == 1) {
        return false;
      }
      if (datetime) {
        datetime = datetime.replace(/-/g, "/");
      }

      let time = Math.floor(Date.parse(datetime) / 1000);
      let currTime = Math.floor(new Date().getTime() / 1000);

      // 当前时间5分钟内时间不显示
      if (currTime - time < 300) return false;
      // 判断是否是最后一条消息,最后一条消息默认显示时间
      if (index == this.msgList.length - 1) {
        return true;
      }
      let nextDate
      if (this.msgList[index + 1] && this.msgList[index + 1].createTime) {
        nextDate = this.msgList[index + 1].createTime.replace(/-/g, "/");
        if (nextDate - datetime < 300) return false;
      }

      return !(
        this.unixToDate(new Date(datetime), "{y}-{m}-{d} {h}:{i}") ==
        this.unixToDate(new Date(nextDate), "{y}-{m}-{d} {h}:{i}")
      );
    },

    /**
     * 将unix时间戳转换为指定格式
     * @param unix   时间戳【秒】
     * @param format 转换格式
     * @returns {*|string}
     */
    unixToDate (unix, format) {
      if (!unix) return unix;
      let _format = format || "yyyy-MM-dd hh:mm:ss";
      const d = new Date(unix);
      const o = {
        "M+": d.getMonth() + 1,
        "d+": d.getDate(),
        "h+": d.getHours(),
        "m+": d.getMinutes(),
        "s+": d.getSeconds(),
        "q+": Math.floor((d.getMonth() + 3) / 3),
        S: d.getMilliseconds(),
      };
      if (/(y+)/.test(_format))
        _format = _format.replace(
          RegExp.$1,
          (d.getFullYear() + "").substr(4 - RegExp.$1.length)
        );
      for (const k in o)
        if (new RegExp("(" + k + ")").test(_format))
          _format = _format.replace(
            RegExp.$1,
            RegExp.$1.length === 1 ?
              o[k] :
              ("00" + o[k]).substr(("" + o[k]).length)
          );
      return _format;
    },
  }
}
</script>

<style lang="scss" scoped>
.orderTime {
  margin-top: 15rpx;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.wrapper {
  height: auto !important;
}

.oederList {
  display: flex;
  color: black;
  font-size: 20rpx;
  font-weight: bold;
  width: 95%;
}

.orderSn {
  width: 350rpx;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.groupNameOrTime {
  margin: 15rpx 15rpx;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.orderGood {
  background-color: #ffffff;
}

.goodsCard {
  border-radius: 20rpx;
  margin-top: 15rpx;
  background-color: #ffffff;
  padding-left: 12rpx;
  width: 95%;
  height: 120rpx;
  display: flex;
  flex-wrap: wrap;
  color: #302c2b;



  .imagebox {
    width: 122rpx;
    height: 122rpx;

    .image {
      width: 122rpx;
      border-radius: 10rpx;
    }
  }

  .goodsdesc {
    flex: 1;
    overflow: hidden;
    margin-left: 12rpx;
    width: 400rpx;

    .goodsdesc-name {
      font-size: 12px;
      line-height: 1.5;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      margin-bottom: 20rpx;


      .goodsCard_goodNmae {
        color: black;
        text-overflow: ellipsis;
        font-size: 20rpx;
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

  .sendGood {
    color: #ffffff;
    height: 40rpx;
    width: 110rpx;
    background-color: #f21c0c;
    font-size: 18rpx;
    border-radius: 17rpx;
    text-align: center;
    line-height: 40rpx;
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

.cartMessage {
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

.column-time {
  justify-content: center;
}

.center-box {
  width: 720rpx;
  padding-left: 25rpx;
}

.hui-box {
  width: 750rpx;
  height: 100%;

}

.date-text {
  font-size: 12px;
  color: grey;
}

.dh-input {
  width: 500rpx;
  height: 65rpx;
  border-radius: 30rpx;
  padding-left: 15rpx;
  font-size: 35rpx;
  background-color: #FFFFFF;
}

.box-normal {
  width: 750rpx;
  height: 180px;
  background-color: #FFFFFF;
}

.tb-text view {
  font-size: 65rpx;
}

.tb-text text {
  font-size: 25rpx;
  color: #737373;
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
</style>

<style lang="scss" scoped>
@import "./index-app.scss";
</style>
