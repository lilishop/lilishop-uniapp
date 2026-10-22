<template>
  <view class="tpl-goods">
    <!-- 模板2/3:顶部一级分类图标横滑 -->
    <category-scroller
      v-if="template !== 4"
      :list="categoryList"
      :current-id="currentL1 && currentL1.id"
      mode="icon"
      @change="onL1Change"
    />
    <view class="tpl-main">
      <!-- 左侧:模板2/3 为二级分类,模板4 为一级分类 -->
      <category-side-list
        :list="sideList"
        :current-id="sideCurrentId"
        @change="onSideChange"
      />
      <view class="tpl-right">
        <!-- 模板2:三级分类标签横滑 (置于右栏顶部) -->
        <sub-tag-bar
          v-if="template === 2 && l3List.length"
          :list="l3List"
          :current-id="currentL3 && currentL3.id"
          @change="onL3Change"
        />
        <!-- 模板4:右上二级分类文字横滑(起点为当前一级名称,作为"全部"入口) -->
        <category-scroller
          v-if="template === 4"
          :list="l2Items"
          :current-id="topCurrentId"
          mode="text"
          @change="onL2Change"
        />
        <sort-bar :sort="sort" :order="order" @change="onSortChange" />
        <scroll-view scroll-y class="goods-scroll" @scrolltolower="loadMore">
          <m-goods-list
            v-if="goodsList.length"
            :res="goodsList"
            type="oneColumns"
            :show-fields="setting.showFields"
            :tab-bar-gap="false"
            :store-name="false"
            @add-cart="onAddCart"
          />
          <view v-else-if="!loading" class="empty-state">
            <u-empty
              :text="failed ? '加载失败，请重试' : '暂无相关商品'"
              mode="data"
              icon="http://cdn.uviewui.com/uview/empty/data.png"
              margin-top="100"
            >
              <view v-if="failed" class="retry" @click="loadGoods(true)">重试</view>
            </u-empty>
          </view>
          <uni-load-more
            v-if="showLoadMore"
            :status="loading ? 'loading' : hasMore ? 'more' : 'noMore'"
            :color="'#bfbfbf'"
            :content-text="loadMoreText"
          ></uni-load-more>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { getGoodsList } from '@/api/goods.js'
import CategoryScroller from './category-scroller.vue'
import CategorySideList from './category-side-list.vue'
import SubTagBar from './sub-tag-bar.vue'
import SortBar from './sort-bar.vue'
import MGoodsList from '@/components/m-goods-list/list.vue'

defineOptions({
  options: {
    virtualHost: true,
    addGlobalClass: true,
  },
})

const props = withDefaults(defineProps<{
  categoryList?: any[]
  setting?: any
  template?: number
}>(), {
  categoryList: () => [],
  setting: () => ({ template: 1, showFields: {} }),
  template: 2
})

const currentL1 = ref<any>(null)
const currentL2 = ref<any>(null)
const currentL3 = ref<any>(null)
const sort = ref('releaseTime')
const order = ref('desc')

const goodsList = ref<any[]>([])
const pageNumber = ref(1)
const hasMore = ref(true)
const loading = ref(false)
const failed = ref(false)

const loadMoreText = {
  contentdown: '上拉加载更多',
  contentrefresh: '正在加载...',
  contentnomore: '—— 到底啦 ——',
}

// 仅在正在加载、或者有下一页、或者商品总数达到 6 件以上触底时才展示底线，避免少量商品（如1~2件）时在空白区域突兀展示
const showLoadMore = computed(() => {
  if (!goodsList.value.length) return false
  if (loading.value) return true
  if (hasMore.value) return true
  return goodsList.value.length >= 6
})

// 模板2/3:左侧为当前一级的二级分类;模板4:左侧为一级分类
const sideList = computed(() =>
  props.template === 4
    ? props.categoryList
    : (currentL1.value && currentL1.value.children) || []
)
const sideCurrentId = computed(() =>
  props.template === 4
    ? currentL1.value && currentL1.value.id
    : currentL2.value && currentL2.value.id
)
// 模板2 的三级标签
const l3List = computed(() =>
  (currentL2.value && currentL2.value.children) || []
)
// 模板4 顶部:当前一级名称(作为"全部") + 其二级分类
const l2Items = computed(() => {
  if (!currentL1.value) return []
  return [currentL1.value, ...((currentL1.value.children) || [])]
})
const topCurrentId = computed(() =>
  (currentL2.value && currentL2.value.id) || (currentL1.value && currentL1.value.id)
)

const queryCategoryId = computed(() =>
  (currentL3.value && currentL3.value.id) ||
  (currentL2.value && currentL2.value.id) ||
  (currentL1.value && currentL1.value.id)
)

watch(
  () => props.categoryList,
  (list) => {
    if (list && list.length && !currentL1.value) {
      currentL1.value = list[0]
      currentL2.value = props.template === 4 ? null : (list[0].children && list[0].children[0]) || null
      currentL3.value = (currentL2.value && currentL2.value.children && currentL2.value.children[0]) || null
      loadGoods(true)
    }
  },
  { immediate: true }
)

function onL1Change(item: any) {
  if (currentL1.value && item.id === currentL1.value.id) return
  currentL1.value = item
  currentL2.value = props.template === 4 ? null : (item.children && item.children[0]) || null
  currentL3.value = (currentL2.value && currentL2.value.children && currentL2.value.children[0]) || null
  resetSort()
  loadGoods(true)
}

function onSideChange(item: any) {
  if (props.template === 4) {
    onL1Change(item)
    return
  }
  if (currentL2.value && item.id === currentL2.value.id) return
  currentL2.value = item
  currentL3.value = (item.children && item.children[0]) || null
  loadGoods(true)
}

function onL3Change(item: any) {
  if (currentL3.value && item.id === currentL3.value.id) return
  currentL3.value = item
  loadGoods(true)
}

function onL2Change(item: any) {
  // 选中一级名称项 = 全部(L2 置空)
  if (currentL1.value && item.id === currentL1.value.id) {
    currentL2.value = null
  } else {
    currentL2.value = item
  }
  loadGoods(true)
}

function onSortChange(payload: { sort: string; order: string }) {
  sort.value = payload.sort
  order.value = payload.order
  loadGoods(true)
}

function resetSort() {
  sort.value = 'releaseTime'
  order.value = 'desc'
}

async function loadGoods(reset = false) {
  if (loading.value || !queryCategoryId.value) return
  if (reset) {
    pageNumber.value = 1
    goodsList.value = []
    hasMore.value = true
  }
  loading.value = true
  failed.value = false
  try {
    const res = await getGoodsList({
      categoryId: queryCategoryId.value,
      sort: sort.value,
      order: order.value,
      pageNumber: pageNumber.value,
      pageSize: 10,
    })
    const records = (res.data && res.data.result && res.data.result.records) || []
    goodsList.value.push(...records)
    hasMore.value = records.length >= 10
  } catch (e) {
    failed.value = true
    uni.showToast({ title: '加载失败,请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function loadMore() {
  if (!hasMore.value || loading.value) return
  pageNumber.value += 1
  loadGoods(false)
}

function onAddCart(item: any) {
  uni.navigateTo({
    url: '/pages/product/goods?id=' + item.id + '&goodsId=' + item.goodsId,
  })
}
</script>

<style lang="scss" scoped>
.tpl-goods {
  flex: 1;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  overflow: hidden;
}
.tpl-main {
  flex: 1;
  min-height: 0;
  height: 0;
  display: flex;
  overflow: hidden;
}
.tpl-right {
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #ffffff;
}
.goods-scroll {
  flex: 1;
  min-height: 0;
  height: 0;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0 100rpx;
}
.retry {
  margin-top: 24rpx;
  padding: 12rpx 50rpx;
  border: 1rpx solid $light-color;
  color: $light-color;
  border-radius: 36rpx;
  font-size: 24rpx;
  font-weight: 500;
}
</style>
