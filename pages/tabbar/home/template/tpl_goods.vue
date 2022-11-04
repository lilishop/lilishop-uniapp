<template>
  <div class="layout">
    <u-sticky>
      <div class="goods-cell-title">
        <div
          class="goods-item-title"
          :class="{ 'selected-title': selected.index == index }"
          @click="handleClickTitle(title, index)"
          v-for="(title, index) in res.list[0].titleWay"
          :key="index"
        >
          <h4 class="h4">{{ title.title }}</h4>
          <div>{{ title.desc }}</div>
        </div>
      </div>
    </u-sticky>
    <div class="goods-list">
      <div
        v-if="
          item.___index != undefined
            ? selected.index == item.___index
            : selected.val == item.type
        "
        @click="handleClick(item)"
        class="goods-item"
        v-for="(item, item_index) in res.list[0].listWay"
        :key="item_index"
      >
        <div class="goods-img">
          <u-image
            :src="item.img"
            height="350rpx"
            mode="aspectFit"
            width="100%"
          >
            <u-loading slot="loading"></u-loading>
          </u-image>
        </div>
        <div class="goods-desc">
          <div class="goods-title">
            {{ item.title }}
          </div>
          <div class="goods-bottom">
            <div class="goods-price">
              ¥<span
                >{{ $options.filters.goodsFormatPrice(item.price)[0] }} </span
              >.{{ $options.filters.goodsFormatPrice(item.price)[1] }}
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="res.list[0].titleWay[selected.index].bindCategory && goodsData.length"
        v-for="(item, index) in goodsData"
        :key="index"
        class="goods-item"
        @click="handleClick(item)"
      >
        <div class="goods-img">
          <u-image
            :src="item.thumbnail"
            height="350rpx"
            mode="aspectFit"
            width="100%"
          >
            <u-loading slot="loading"></u-loading>
          </u-image>
        </div>
        <div class="goods-desc">
          <div class="goods-title">
            {{ item.goodsName }}
          </div>
          <div class="goods-bottom">
            <div class="goods-price">
              ¥<span
                >{{ $options.filters.goodsFormatPrice(item.price)[0] }} </span
              >.{{ $options.filters.goodsFormatPrice(item.price)[1] }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { getGoodsList } from "@/api/goods.js";
export default {
  title: "商品分类以及商品",
  data() {
    return {
      selected: {
        index: 0,
        val: "",
      },
      params: {
        pageNumber: 1,
        pageSize: 100,
        categoryId: "",
      },
      goodsData: [], //商品循环内容
      goodsResult:"", //es总返回内容
    };
  },
  props: ["res","enableBottomLoad"],
  watch: {
    res: {
      handler(val) {
        // 监听父级的值 如果有值将值赋给selected
        if (val) {
          console.log(val)
          // 如果第一个标签页绑定为商品
          this.selected.val = this.res.list[0].listWay[0] ? this.res.list[0].listWay[0].type: '';
          // 如果第一个标签为绑定为分类
          this.res.list[0].titleWay[0].bindCategory ? this.initGoods(this.res.list[0].titleWay[0]) : ''
        }
      },
      immediate: true,
    },
  },
  mounted() {
    uni.$on('onReachBottom',()=>{
      if(this.enableBottomLoad && this.goodsResult.totalElements >= this.params.pageNumber * this.params.pageSize){
        this.params.pageNumber++
        this.initGoods(this.res.list[0].titleWay[this.selected.index])
      }
      
    })
  },
  destroyed(){
    uni.$off('onReachBottom')
  },
  methods: {
    handleClick(item) {
      uni.navigateTo({
        url: `/pages/product/goods?id=${item.id}&goodsId=${item.goodsId}`,
      });
    },
    closeGoods(val, index) {
      this.res.list[0].listWay.splice(index, 1);
    },
    async initGoods(val) {
      if(this.enableBottomLoad) this.params.pageSize = 20
      val ? this.params.categoryId = val.bindCategory.id : '';
      const res = await getGoodsList(this.params);
      if (res.data.success) {
        this.goodsResult = res.data.result
        const result = res.data.result.content.map(item=>item.content)
        this.goodsData.push(...result);
        console.log(this.goodsData)
      }
    },
    handleClickTitle(val, index) {
      this.selected.index = index;
      this.selected.val = val.title;
      if (val.bindCategory) {
        this.params.pageNumber = 1
        this.goodsData = []
        this.initGoods(val);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
$w_94: 94%;

.layout {
  padding: 8px 0;
  background: #f9f9f9;
}

.selected-title {
  > h4 {
    font-size: 30rpx;
    color: #000 !important;
  }

  > div {
    font-weight: bold;
    color: $main-color !important;
  }
}

.goods-cell-title {
  background: #f9f9f9;
  padding: 10px;
  transition: 0.35s;
  display: flex;
  cursor: pointer;

  > .goods-item-title {
    flex: 1;
    text-align: center;

    > h4 {
      font-size: 32rpx;
    }

    > div {
      color: #999;
      font-size: 24rpx;
    }
  }
}

.goods-list {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
}

.goods-item {
  width: 50%;
  margin-bottom: 10px;
  border-radius: 0.4em;
  overflow: hidden;
}

.goods-img {
  position: relative;
  margin: 0 auto;
  // width: 158px;
  width: $w_94;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
  overflow: hidden;
  > img {
    width: 100%;
    height: 100%;
  }
}

.goods-desc {
  border-bottom-left-radius: 20rpx;
  border-bottom-right-radius: 20rpx;
  width: $w_94;
  background: #fff;
  padding: 8rpx 0 8rpx 8rpx;
  margin: 0 auto;
  > .goods-title {
    font-size: 24rpx;
    height: 67rpx;
    display: -webkit-box;
    font-weight: 500;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  > .goods-bottom {
    display: flex;
    font-weight: bold;
    > .goods-price {
      line-height: 2;
      color: $main-color;
      > span {
        font-size: 42rpx;
      }
    }
  }
}
</style>
