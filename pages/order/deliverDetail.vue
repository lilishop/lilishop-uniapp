<template>
	<div>
		<view class="logistics-detail">
			<view class="card">
				<div v-if="logisticsList && logisticsList.length>0">
					<ul class="express-log" v-for="(packageItem, packageIndex) in logisticsList" :key="packageIndex" v-if="packageItem">
						<div class="layui-layer-wrap">
							<dl>
								<dt>物流公司：</dt>
								<dd><div class="text-box">{{ packageItem.logisticsName }}</div></dd>
							</dl>
							<dl>
								<dt>快递单号：</dt>
								<dd>
									<div nctype="ordersSn" class="text-box">
										<a class="item" :href='"https://www.baidu.com/s?wd="+packageItem.logisticsNo' target="_blank">{{ packageItem.logisticsNo }}</a>
									</div>
								</dd>
							</dl>
							<div class="div-express-log">
								<ul class="express-log express-log-name">
									<li v-for="(item, index) in packageItem.orderPackageItemList" :key="index">
										<p class="time" style="width: 50%;"><span>商品名称：</span><span>{{ item.goodsName }}</span></p>
										<p class="time" style="width: 30%;"><span>发货时间：</span><span>{{ item.logisticsTime }}</span></p>
										<p class="time" style="width: 20%;"><span>发货数量：</span><span>{{ item.deliverNumber }}</span></p>
									</li>
								</ul>
							</div>
							<div class="div-express-log">
								<ul class="express-log" v-if="packageItem.traces && packageItem.traces.traces">
									<li v-for="(item, index) in packageItem.traces.traces" :key="index">
										<span class="time">{{ item.AcceptTime || item.acceptTime }}</span>
										<span class="detail">{{ item.AcceptStation || item.remark }}</span>
									</li>
								</ul>
								<ul class="express-log" v-else>
									<li>暂无物流信息</li>
								</ul>
							</div>
						</div>
					</ul>
				</div>
			</view>
		</view>
	</div>
</template>

<script>
import { getPackage } from "@/api/trade.js";
export default {
    data() {
        return {
            order: {},
            logisticsList: [],
        }
    },
    components: {
    },
    computed: {
    },
	onLoad(option) {
	  let sn = option.order_sn;
	  this.tracesList(sn);
	},
    mounted() {
    },
    methods: {
        tracesList(sn) {
            getPackage(sn).then((res) => {
                if(res.data.success){
                    this.logisticsList = res.data.result;
                }
            });
        },
    },
}
</script>
<style >
page {
    background: #fff;
}
</style>
<style lang="scss" scoped>
// @import url('./goods.scss');
.goods-item-view {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 10rpx 30rpx;

    .goods-img {
        flex: 1;
    }

    .goods-info {
        padding-left: 30rpx;
        flex: 3;

        .goods-title {
            margin-bottom: 10rpx;
            color: $font-color-dark;
        }

        .goods-specs {
            font-size: 24rpx;
            margin-bottom: 10rpx;
            color: #cccccc;
        }

        .goods-price {
            font-size: 28rpx;
            margin-bottom: 10rpx;
            color: #ff5a10;
        }
    }

    .goods-num {
        >.good-complaint {
            margin-top: 10rpx;
        }

        text-align: center;
        flex: 1;
        width: 60rpx;
        color: $main-color;
    }
}


.goods-info {
    flex: 2;
}

.card-title {
  background: #f2f2f2;
}
.logistics-detail {
  margin-top: 20rpx;
  padding: 0 16rpx;
}
.card {
  background: #fff;
  border-radius: 20rpx;
  width: 100%;
  > .card-title {
    font-size: 24rpx;
    border-top-left-radius: 20rpx;
    border-top-right-radius: 20rpx;
    padding: 16rpx;
  }
  > .time-line {
    padding: 16rpx 32rpx;
  }
}
.u-order-title {
  font-weight: bold;
}
.u-order-desc {
  font-size: 26rpx;
  color: #666;
  margin: 10rpx 0;
}
.u-order-time {
  font-size: 24rpx;
  color: #999;
}
.empty {
  padding: 40rpx 0;
}



.express-log {
  /*margin: 5px -10px 5px 5px;*/
  padding: 20rpx;
  list-style-type: none;
  li {
	  display: flex;
	  margin-top: 18rpx;
  }
  li:nth-of-type(1) {
	  margin-top: 0;
  }
  .time {
    width: 140rpx;
    display: flex;
    // float: left;
	flex-direction: column;
	font-size: 24rpx;
	line-height: 40rpx;
	span:nth-of-type(1) {
		margin-bottom: 16rpx;
	}
  }

  .detail {
    width: 100%;
	flex: 1;
    margin-left: 30rpx;
    display: inline-block;
	font-size: 24rpx;
	line-height: 40rpx;
  }

  li {
    line-height: 60rpx;
  }
}
.layui-layer-wrap {
  dl {
    border-top: solid 1px #f5f5f5;
    margin-top: -2rpx;
    overflow: hidden;

    dt {
      font-size: 26rpx;
      line-height: 40rpx;
      display: inline-block;
      padding: 16rpx 1% 16rpx 0;
      color: #999;
    }

    dd {
      font-size: 26rpx;
      line-height: 40rpx;
      display: inline-block;
      padding: 16rpx 0 16rpx 16rpx;
      border-left: solid 2rpx #f5f5f5;

      .text-box {
        line-height: 40rpx;
        color: #333;
        word-break: break-all;
      }
    }
  }
}
.div-express-log {
  // max-height: 600rpx;
  border: solid 2rpx #e7e7e7;
  background: #fafafa;
  border-radius: 10rpx;
  margin-bottom: 6rpx;
  // overflow-y: auto;
  // overflow-x: auto;
}
</style>