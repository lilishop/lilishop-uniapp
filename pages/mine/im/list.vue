<template>
  <view class="content">
    <u-navbar class="my-title" title-size="32" :title="'消息(' + talkList.length + ')'"></u-navbar>
    <scroll-view class="list-scroll-content" scroll-y @scrolltolower="loadData(tabIndex)">
      
      <!-- 消息列表 -->
      <div class="iconBox">
        <view class="icon-list">
          <view class="icon-item" @click="cleanUnread()">
            <div class="bag bag1">
              <u-icon name="trash" size="50" color="#fff"></u-icon>
            </div>
            <view>清除未读</view>
          </view>
          <view class="icon-item" @click="navigateTo('/pages/tabbar/home/title')">
            <div class="bag bag2">
              <u-icon name="bell" size="50" color="#fff"></u-icon>
            </div>
            <view>系统消息</view>
          </view>
        </view>
      </div>
      <u-search class="nav-search" v-model="userName" clearabled @change="userTalkList()" placeholder="搜索用户"
        :show-action="false"></u-search>
      <view class="talk-view" :key="index" v-for="(item, index) in talkList">
        <view>
          <view @click="onclickToTalkInfo(item)">
            <view class="talk-item-view">
              <view class="talk-img">
                <u-avatar :src="item.face" :text="item.face ? '' : item.name" bg-color="#DDDDDD"></u-avatar>
              </view>
              <view class="talk-info">
                <view class="talk-name u-line-2">{{ item.name }}
                  <u-tag class="talk-tag" size="mini" text="店铺" type="warning" v-if="item.storeFlag" />
                </view>
                <view class="talk-message">
                  <span v-if="item.lastMessageType == 'MESSAGE'">{{ item.lastTalkMessage }}</span>
                  <span v-if="item.lastMessageType == 'GOODS'">[商品链接]</span>
                  <span v-if="item.lastMessageType == 'ORDER'">[订单信息]</span>
                </view>
              </view>
              <view class="talk-time">
                <view>
                  {{ beautifyTime(item.lastTalkTime) }}
                </view>
                <view>
                  <u-badge type="error" absolute :offset="[45, 20]" :count="item.unread"></u-badge>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <!-- 空白页 -->
      <u-empty text="暂无信息" mode="list" v-if="talkList.length === 0"></u-empty>
    </scroll-view>
  </view>
</template>

<script>
import { getTalkList, clearmeaager } from "@/api/im.js";
import storage from "@/utils/storage.js";
import { beautifyTime } from "@/utils/filters.js"
export default {
  data () {
    return {
      storage,
      count: {
        loadStatus: "more",
      },
      talkList: [], //聊天列表
      userName: '',
      pointData: {}, //累计获取 未输入 集合
    };
  },

  onShow () {
    this.userTalkList();
  },
  onPullDownRefresh () {
    this.userTalkList()
    console.log('下拉事件');
    setTimeout(function () {
      uni.stopPullDownRefresh();
    }, 1000);
  },
  /**
   * 触底加载
   */
  onReachBottom () {
    this.userTalkList();
  },
  methods: {
    beautifyTime,
    onclickToTalkInfo (val) {
      storage.setTalkToUser(val)
      uni.navigateTo({
        url:
          "/pages/mine/im/index?talkId=" + val.id,
      });
    },
    /**
     * 获取聊天列表
     */
    userTalkList () {
      let params = {
        userName: this.userName,
      }
      uni.showLoading({
        title: "加载中",
      });
      getTalkList(params).then((res) => {
        uni.hideLoading();
        if (res.data.success) {
          this.talkList = res.data.result;
          console.log(this.talkList, 'this.talkListthis.talkList');
        }
      });
    },
    navigateTo (url) {
      uni.navigateTo({
        url,
      });
    },
    cleanUnread () {
      clearmeaager().then((res) => {
        console.log(res);
        if (res.data.code == 200) {
          this.userTalkList();
          uni.showToast({
            icon: "none",
            title: res.data.message,
          });
        }
      })
    },
  },
};
</script>
  
<style lang="scss" scoped>
.talk-view {
  border-radius: 20rpx;
  background-color: #fff;

  .talk-item-view {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    padding: 10rpx 20rpx;

    .talk-img {
      width: 100rpx;
      height: 100rpx;
      margin-right: 10rpx;
      margin-bottom: 10rpx;
    }

    .talk-info {
      padding-left: 30rpx;
      flex: 1;

      .talk-name {
        font-size: 28rpx;
        margin-bottom: 10rpx;
        font-weight: bold;
        color: #333333;
      }

      .talk-message {
        font-size: 28rpx;
        margin-top: 10rpx;
        color: #888787;

      }


      .talk-tag {
        margin-left: 10rpx;
      }
    }
  }
}

.talk-time {
  position: relative;
}

.iconBox {
  width: 94%;
  margin: 0 3%;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 24rpx 0 rgba($color: #f6f6f6, $alpha: 1);
  // transform: translateY(-30rpx);
}

.icon-list {
  height: 140rpx;
  text-align: center;
  font-size: $font-sm;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 3%;
  color: #999;

  .icon-item {
    position: relative;
    line-height: 2em;
    width: 96rpx;

    :first-child {
      font-size: 48rpx;
      margin-bottom: 10rpx;
    }
  }
}

.bag {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  margin: 0 auto;
}

.bag1 {
  background: #ff0015;
}

.bag2 {
  background: #73AF7C;
}
</style>
<style lang="scss" scoped>
@import "./index-app.scss";
</style>
