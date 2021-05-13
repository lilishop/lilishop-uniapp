<template>
  <view class="comment">
    <!-- <view class="status_bar" -->
    <!--</view> -->
    <view class="top-tab">
      <!-- <view class="good-comment">商品好评率{{ grade || "100" }}%</view> -->
      <view class="tab-btn" :v-if="commentDetail">
        <!-- <view v-for="item in selectObj" :key="item.id" @click="select(item.id)" :class="{cur:selectIndex===item.id}">{{item.text}}</view> -->
        <view @click="select(0)" :class="{ cur: selectIndex == 0 }">全部</view>
        <view @click="select(1)" :class="{ cur: selectIndex == 1 }">好评{{ commentDetail.good }}</view>
        <view @click="select(2)" :class="{ cur: selectIndex == 2 }">中评{{ commentDetail.moderate }}</view>
        <view @click="select(3)" :class="{ cur: selectIndex == 3 }">差评{{ commentDetail.worse }}</view>
        <view @click="select(4)" :class="{ cur: selectIndex == 4 }">有图{{ commentDetail.haveImage }}</view>
      </view>
    </view>

    <!-- 评价 -->

    <div class="goodsBoxOver">
      <scroll-view :style="{ height: DivHeight }" lower-threshold="150" @scrolltolower="loadmore()" scroll-anchoring enableBackToTop="true" scroll-y class="scoll-page">
        <view class="eva-section">
          <div class="nodata" v-if="commDetail.length < 1">
            <view>
              <image style="height: 240rpx; width: 320rpx" src="/static/nodata.png" alt="" />
            </view>
            <view>
              <p>暂无评价</p>
            </view>
          </div>

          <view class="eva-box" v-for="(item, index) in commDetail" :key="index">
            <view class="section-info">
              <image class="portrait" :src="item.memberProfile || '/static/missing-face.png'" mode="aspectFill"></image>
              <view class="star-con">
                <text class="name">{{ item.memberName | noPassByName }}</text>
                <text class="time">{{ item.createTime }}</text>
              </view>
              <view class="stars">
                <text :class="{ star: item.deliveryScore > 0 }"></text>
                <text :class="{ star: item.deliveryScore > 1 }"></text>
                <text :class="{ star: item.deliveryScore > 2 }"></text>
                <text :class="{ star: item.deliveryScore > 3 }"></text>
                <text :class="{ star: item.deliveryScore > 4 }"></text>
              </view>
            </view>
            <view class="section-contant">
              <div class="con">{{ item.content }}</div>
              <view class="img">

                <u-image width="140rpx" height="140rpx" v-if="item.image" v-for="(img, i) in splitImg(item.image)" :src="img" :key="i" @click="preview(splitImg(item.image), i)">
                </u-image>
              </view>
              <view class="bot">
                <text class="attr">{{ item.goodsName }} - {{ gradeList[item.grade] }}</text>
                <!-- <text class="zan" :class="{cur:item.isZan}" @click="dianzan(index)">{{item.zan}}</text> -->
              </view>
            </view>
            <view class="addComment commentStyle" v-if="item.additional_comment">
              <div>
                <b>追加评价:</b>
                <span class="addCommentSpan">{{
                  item.additional_comment.content
                }}</span>
                <view class="img">
                  <image v-for="(item, addIndex) in item.additional_comment.images" :src="item" :key="addIndex" @click="preview(item)"></image>
                </view>
              </div>
            </view>
            <view class="commentStyle" v-if="item.reply">
              商家回复：
              <span class="addCommentSpan">{{ item.reply }}</span>
              <view class="img">
                <u-image width="140rpx" height="140rpx" v-if="item.replyImage" v-for="(replyImg, replyIndex) in splitImg(replyImg.image)" :src="replyImg" :key="replyIndex"
                  @click="preview(splitImg( item.replyImage), index)">
                </u-image>
              </view>
            </view>
            <view class="commentStyle" v-if="item.additional_comment && item.additional_comment.reply">
              商家回复:
              <span class="addCommentSpan">{{
                item.additional_comment.reply.content
              }}</span>
            </view>
          </view>
        </view>

        <!-- <u-loadmore :status="status" @loadmore="loadmore()" icon-type="iconType" /> -->
      </scroll-view>
    </div>
  </view>
</template>

<script>
// import { getGoodsDetail } from '@/api/goods.js';
import * as membersApi from "@/api/members.js";
export default {
  data() {
    return {
      header: {
        top: 0,
        height: 50,
      },
      DivHeight: "",
      status: "loadmore",
      commentObj: {},
      selectObj: [],
      commentDetail: "",
      selectIndex: "0", //检索条件
      imgUrl: "",
      previewImgFlag: false,
      // 评论分页提交数据
      params: {
        pageNumber: 1,
        pageSize: 10,
        grade: "",
      },
      gradeList: {
        GOOD: "好评",
        MODERATE: "中评",
        WORSE: "差评",
        HAVEIMAGE: "有图",
      },
      // 评论详情
      commDetail: [],
      dataTotal: 0,

      opid: "",
      grade: "100%",
    };
  },
  async onLoad(options) {
    this.grade = options.grade;

    this.getGoodsCommentsFun(options.id);
    this.getGoodsCommentsNum(options.id);
    this.opid = options.id;
  },
  mounted() {},
  methods: {
    splitImg(val) {
      if (val && val.split(",")) {
        return val.split(",");
      } else if (val) {
        return val;
      } else {
        return false;
      }
    },
    loadmore() {
      this.params.pageNumber++;
      this.getGoodsCommentsFun(this.opid);
    },

    // 获取商品评论
    getGoodsCommentsFun(id) {
      this.status = "loading";
      // getGoodsComments
      membersApi.getGoodsComments(id, this.params).then((res) => {
        if (
          res.data.result.records == [] ||
          res.data.result.records == "" ||
          res.data.result.records == null
        ) {
          this.status = "noMore";
          return false;
        }
        this.commDetail = this.commDetail.concat(res.data.result.records);

        console.log(this.commDetail);
        this.dataTotal = res.data.result.total;
        this.status = "loadmore";
      });
    },

    getGoodsCommentsNum(id) {
      membersApi.getGoodsCommentsCount(id).then((res) => {
        if (res.statusCode === 200) {
          this.commentDetail = res.data.result;
        }
      });
    },
    select(index) {
      //顶部筛选条件
      this.selectIndex = index;
      console.log(this.selectIndex);
      this.params.grade = ["", "GOOD", "MODERATE", "WORSE", ""][
        this.selectIndex
      ];
      this.selectIndex == 4 ? (this.params.haveImage = 1) : true;
      this.params.pageNumber = 1;
      this.params.pageSize = 10;
      this.commDetail = [];
      if (this.selectIndex == 0) {
        this.params = {
          pageNumber: 1,
          pageSize: 10,
          grade: "",
        };
      }

      this.getGoodsCommentsFun(this.opid);
    },
    // 返回
    back() {
      uni.navigateTo({
        url: "./product?id=" + this.opid,
      });
    },
    // 点赞
    dianzan(index) {
      if (this.commentObj.item[index].isZan) {
        this.commentObj.item[index].zan--;
      } else {
        this.commentObj.item[index].zan++;
      }
      this.commentObj.item[index].isZan = !this.commentObj.item[index].isZan;
    },
    // 预览
    preview(urls, index) {
      console.log(urls);
      uni.previewImage({
        current: index,
        urls: urls,
        longPressActions: {
          itemList: ["保存图片"],
          success: function (data) {
            uni.showToast({
              title: "保存成功",
              duration: 2000,
              icon: "none",
            });
          },
          fail: function (err) {
            uni.showToast({
              title: "保存失败",
              duration: 2000,
              icon: "none",
            });
          },
        },
      });
    },
    close() {
      this.previewImgFlag = false;
      this.imgUrl = "";
    },
  },
};
</script>

<style lang="scss" scoped>
.commentStyle {
  margin-top: 16rpx;
  padding: 14rpx 26rpx;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 22rpx;
  font-weight: 700;
  text-align: left;
  line-height: 40rpx;
}

.addCommentSpan {
  color: $u-tips-color !important;
  padding-left: 20rpx;
}
.img {
  display: flex;
  flex-wrap: wrap;
  /* height: 140rpx; */
  overflow: hidden;

  image {
    width: 166rpx;
    height: 166rpx;
    margin: 0 15rpx 15rpx 0;

    &:nth-of-type(3n + 0) {
      margin: 0 0 15rpx 0;
    }
  }
}

.goodsBoxOver {
  overflow-y: scroll;
}

.headerBox {
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-size: 34rpx;

  .left,
  .right {
    position: absolute;
    width: max-content;
    height: max-content;
    top: 0;
    bottom: 0;
    margin: auto;
  }

  .left {
    float: left;
    top: 0;
    bottom: 0;
    left: 20rpx;
  }

  .right {
    float: right;
    right: 20rpx;
  }
}

page {
  background: #f7f7f7;
}

.preview-img {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* background: rgba(0,0,0,0.5); */
  background-repeat: no-repeat;
  background-color: rgba(0, 0, 0, 0.5);
  background-position: center;
  background-size: 90% auto;
  z-index: 1000;

  .close {
    position: absolute;
    width: 100rpx;
    height: 100rpx;
    text-align: center;
    line-break: 50rpx;
    /* background: rgba(0,0,0,0.5); */
    font-size: 80rpx;
    color: #fff;
    top: 100rpx;
  }

  image {
    /* width: 100%; */
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
}
// .goodsBoxOver{
// 	height: calc(100vh - 200rpx) ;
// }

.comment {
  color: #333;
  background: #f7f7f7;

  overflow: hidden;
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #fff;
    z-index: 999;
    display: flex;
    justify-content: space-between;
    height: 90rpx;
    line-height: 90rpx;
    font-size: 30rpx;
    transition: all 0.5s;

    .back {
      width: 90rpx;
      background: url(/static/search/back.png);
      background-size: 100%;
    }

    .share {
      width: 90rpx;
      background: url(/static/search/back.png);
      background-size: 100%;
    }
  }

  .header-line {
    height: 2px;
    background: #f2f2f2;
    position: fixed;
    top: 90rpx;
    left: 0;
    right: 0;
    z-index: 999;
  }

  .header-line1 {
    height: 20rpx;
    position: static;
  }

  .top-tab {
    background: #fff;
    margin-bottom: 10rpx;
    border-radius: 20rpx;
    display: flex;
    flex-direction: column;
    padding: 0 30rpx 0 30rpx;
    font-size: 24rpx;

    .good-comment {
      text-align: right;
      color: #a5a5a5;
    }

    .tab-btn {
      margin-top: 20rpx;
      display: flex;
      flex-wrap: wrap;

      view {
        min-width: 118rpx;
        text-align: center;
        height: 50rpx;
        line-height: 50rpx;
        padding: 0 10rpx;
        background: #f8f8fe;
        border-radius: 25rpx;
        margin: 0 20rpx 30rpx 0;

        &.cur {
          background: $aider-light-color;
          color: #fff;
        }
      }
    }
  }

  .eva-section {
    padding: 20rpx 0;

    .eva-box {
      padding: 40rpx;
      margin-bottom: 10rpx;
      background: #fff;
      border-radius: 20rpx;
      /* star */
      .star-con {
        display: flex;
        flex-direction: column;

        view {
          flex: 1;
          display: flex;
          align-items: center;
        }

        .time {
          font-size: 24rpx;
          color: #999;
        }
      }

      .section-info {
        display: flex;

        .stars {
          flex: 1;
          display: flex;
          justify-content: flex-end;
          align-items: center;

          .star {
            width: 30rpx;
            height: 30rpx;
            background: url("/static/star.png");
            background-size: 100%;
          }
        }
        .portrait {
          flex-shrink: 0;
          width: 80rpx;
          height: 80rpx;
          border-radius: 100px;
          margin-right: 20rpx;
        }
      }
      .section-contant {
        display: flex;
        flex-direction: column;

        .con {
          font-size: 24rpx;
          line-height: 46rpx;
          font-weight: 400;
          color: $font-color-dark;
          color: #333;
          padding: 26rpx 0;
        }

        .img {
          display: flex;
          flex-wrap: wrap;
          /* height: 140rpx; */
          overflow: hidden;
          > * {
            margin-right: 16rpx;
          }
        }

        .bot {
          display: flex;
          justify-content: space-between;
          font-size: $font-sm;
          color: $font-color-light;
          margin-top: 20rpx;

          .zan {
            color: #333;
            position: relative;

            &:before {
              content: "";
              width: 40rpx;
              height: 40rpx;
              background: url(/static/search/delete.png);
              background-size: 100%;
              position: absolute;
              left: -50rpx;
              top: -6rpx;
            }

            &.cur:before {
              background: url(/static/global/selected.png);
              background-size: 100%;
            }
          }
        }
      }

      .reply {
        padding: 16rpx 30rpx;
        background: #f8f8fe;
        font-size: 24rpx;
        border-radius: 5px;
        margin-top: 20rpx;

        text {
          color: #999;
          line-height: 48rpx;
        }
      }
    }
  }
}

.nodata {
  padding-top: 300rpx;
  color: #999999;
  text-align: center;

  img {
    width: 346rpx;
    height: 304rpx;
  }
}
</style>
