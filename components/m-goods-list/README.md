## 商品列表展示

### OBJECT 参数说明

| 属性        | 说明                                                       | 类型    | 必填 |
| ----------- | ---------------------------------------------------------- | ------- | ---- |
| `res`       | 显示数据                                                   | Array   | 是   |
| `type`      | 商品展示类型 oneColumns twoColumns  ，默认展示一行两列商品 | String  | 否   |
| `storeName` | 是否展示店铺名称，默认展示                                 | Boolean | 否   |
| `keywords` | 高亮展示搜索内容                                 | String | 否   |
| `showFields` | 商品卡片字段开关(Object,null=现状渲染全量字段)。键:`subTitle` 副标题、`spec` 规格摘要(取 attrList 前 2 项)、`tags` 促销标签、`selfTag` 自营、`price` 价格、`linePrice` 划线价(仅 marketPrice>price 时显示)、`sales` 已售/评论、`cart` 购物车按钮。新增字段(副标题/规格/划线价/购物车)仅在 showFields 提供时才会渲染;目前仅 oneColumns 布局支持开关 | Object | 否 |

### EVENTS 事件说明

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `addCart` | 点击购物车按钮(showFields.cart 开启时渲染) | 当前商品对象 |

