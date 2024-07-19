## Lilishop B2B2C 商城系统

### 商城介绍

**官网**：https://pickmall.cn

**更多 README**：https://gitee.com/beijing_hongye_huicheng/lilishop/blob/master/README.md

**演示站点**：https://m-b2b2c.pickmall.cn/ 账号：13011111111 验证码：111111

**商城 小程序/公众号/APP**：扫描二维码

![image-20210511171611793](https://static.pickmall.cn/images/h5-qrcode.png)

## lilishop-uniapp如何在本地h5和微信小程序中运行
https://www.bilibili.com/video/BV17K8EemEh2/

## lilishop-uniapp如何打包h5到服务器
https://www.bilibili.com/video/BV1CX87exE64/

### 快速开始

#### 阅读文档

`uni-app` https://uniapp.dcloud.net.cn/api/

`vue2` https://v2.cn.vuejs.org/

`uView v1` https://v1.uviewui.com/

#### 环境

在开发之前保证本地安装了以下软件
`hbulider` https://www.dcloud.io/hbuilderx.html

### 技术栈

本项目技术栈为 `uni-app` + `scss` + `ES2015` + `uView` 提前学习和了解这些知识将帮助你更好地上手我们的项目。

### 安装

1. 克隆项目到本地

```shell
git clone https://gitee.com/beijing_hongye_huicheng/lilishop-uniapp.git
```

2. 从`hbulider`中打开项目

```shell
直接将项目拖进hbulider中点击运行即可
```

### 目录结构

```
├── api  // 接口
├── components  // 组件
├── config  // 配置文件
├── CustomStartPage  // 打包配置的开屏页
├── CustomStoryboard  // ios自定义storyboard启动页
├── hybrid  // 广告配置页
├── js_sdk  // 封装的js_sdk
├── lib  // 封装的部分方法
├── pages  // 页面
├── plugins  // 插件
├── static  // 静态资源
├── store  // vuex
├── utils  // 工具类
├── uview-ui  // uview
├── App.vue  // 入口页面
├── main.js  // 入口文件
├── manifest.json  // hbulider配置文件
├── pages.json  // 路由配置文件
├── uni.scss  // 全局样式
└── vue.config.js  // vue配置文件
```

### 运行

#### 运行在 h5

在`hbulider`中点击`运行`->`运行到浏览器`->`选择自己的浏览器九号`

#### 运行在微信小程序

1.需要保证本地要有`微信开发者工具` https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

2.在`hbulider`中点击`运行`->`运行到小程序模拟器`->`微信开发者工具` 运行的时候需要配置小程序的`appid`，配置完成后即可运行

#### 运行 APP

##### 运行在安卓

在`hbulider`中点击`运行`->`运行到手机或模拟器`->`选择运行到安卓APP基座`

##### 运行在 IOS

在`hbulider`中点击`运行`->`运行到手机或模拟器`->`选择运行到IOS基座`




### 项目配置/开发

#### config配置
在根目录`config`下的`config`设置中配置了一些默认的配置，可以根据自己的需求进行修改

```
const name = "lilishop"; //全局商城name
const schemeName = "lilishop"; //唤醒app需要的schemeName
export default {
  name: name,
  schemeLink: `${schemeName}://`, //唤起app地址
  downloadLink: "https://pickmall.cn/download-page/index.html", //下载地址，下载app的地址
  shareLink: "https://m-b2b2c.pickmall.cn", //分享地址，也就是在h5中默认的复制地址
  appid: "", //小程序唯一凭证，即 AppID，可在「微信公众平台 - 设置 - 开发设置」页中获得。（需要已经成为开发者，且帐号没有异常状态）
  aMapKey: "", //在高德中申请Web服务key
  scanAuthNavigation: ["https://m-b2b2c.pickmall.cn/"], //扫码认证跳转域名配置 会根据此处配置的路由进行跳转
  iosAppId: "id1564638363", //AppStore的应用地址id 具体在分享->拷贝链接中查看
  logo: "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/4c864e133c2944efad1f7282ac8a3b9e.png", //logo地址
  customerServiceMobile: "13161366885", //客服电话
  customerServiceEmail: "lili@lili.com", //客服邮箱
  imWebSrc: "https://im.pickmall.cn", //IM地址
  baseWsUrl: "wss://im-api.pickmall.cn/lili/webSocket", // IM WS 地址
  enableGetClipboard: false, //是否启用粘贴板获取 scanAuthNavigation 中的链接，如果匹配则会跳转到对应页面
  enableMiniBarStartUpApp: true, //是否在h5中右侧浮空按钮点击启动app
  /**
   * 如需更换主题请修改此处以及uni.scss中的全局颜色
   */
  mainColor: "#ff3c2a", // 主题色
  lightColor: "#ff6b35", // 高亮主题色
  aiderLightColor: "#ff9f28", // 辅助高亮颜色
  defaultUserPhoto: "/static/missing-face.png", // 默认用户头像
  enableFetchMobileLogin: false // 是否启用获取手机号登录 如果微信小程序提示封禁手机号获取权限 可将此选项设置成false作为备用登录方案
};

```
#### 组件
在根目录`components`下的`components`设置中配置了一些默认的组件，可以根据自己的需求进行修改或阅读组件详情代码以及README.md文档

#### 页面
在`pages`文件夹写入或修改页面代码，在`pages.json`中去配置页面路由，具体配置可以参考`pages.json` 或参考uni-app的文档

在微信小程序中默认启用分包操作，如果需要在微信小程序中使用分包，需要在`pages.json`中配置分包路径，具体配置可以参考`pages.json` 或参考uni-app的文档

#### 主题
1.现在`config`中设置主题色

2.在`uni.scss`中设置全局颜色

3.替换项目中一些icon以及图片的颜色




### 常见问题

#### 微信小程序移动端启动报错

小程序直播插件报错，在`manifest`中删除代码。
![启动报错](https://docs.pickmall.cn/configure/images/live.png)

#### 微信小程序上传文件过大超出 2MB

1.关闭微信小程序，停止微信小程序运行

2.重新点击运行小程序模拟器，在最下方有一个 `运行时是否压缩代码` 勾选并重新运行

3.如果还是提示超出2MB，重新执行1步骤，然后点击`发行`->`小程序`即可

4.以上1-3步骤都不行，可以尝试删除一些自己开发的代码或本地的静态资源图片

#### 微信小程序在开发者工具中可以使用接口在测试版却不行
1.首先保证是否填写`request`合法域名 在微信小程序后台配置

2.需保证接口为https请求

request合法域名基础配置如下
```
https://buyer-api.pickmall.cn
https://common-api.pickmall.cn
https://im-api.pickmall.cn
https://restapi.amap.com
```

socket合法域名
```
wss://im-api.pickmall.cn
```
uploadFile合法域名
```
https://common-api.pickmall.cn
```
downloadFile合法域名
```
https://buyer-api.pickmall.cn
https://common-api.pickmall.cn
https://im-api.pickmall.cn
https://lilishop-oss.oss-cn-beijing.aliyuncs.com
```

#### 如何配置API
在根目录 `config` -> `api` 中配置开发环境以及生产环境 api 接口地址

#### 运行报错
初次运行时候可能因为本地环境缺少编译插件，这个时候一定要注意看报错信息，根据报错信息安装相应的插件即可

#### 如何配置微信小程序appid
在根目录 `manifest.json` 中配置微信小程序appid


#### 微信登录报错
需检查appId是否配置正确，在后台管理中信任登录的`appId`以及`appSecret`是否配置正确



