<template></template>
<script>
import { getAddressCode } from "@/api/address";

export default {
  data() {
    return {};
  },
  mounted() {
    this.init();
  },
  methods: {
    // 初始化地图并且调用
    initMap() {
      let that = this;
      uni.chooseLocation({
        success: function (res) {
          /**获取地址详情地址 */
          that.posToCity(res.latitude, res.longitude).then((val) => {
            /**获取地址code */
            getAddressCode(
              val.regeocode.addressComponent.citycode,
              val.regeocode.addressComponent.township
            ).then((code) => {
              that.$emit("callback", { ...val, ...res, ...code });
              that.$emit("close");
            });
          });
        },
        fail() {
          that.$emit("close");
        },
      });
    },

    // 根据当前客户端判断
    init() {
      // #ifdef MP-WEIXIN
      this.wechatMap();
      // #endif
      // #ifndef MP-WEIXIN
      this.initMap();
      // #endif
    },

    // 如果是微信小程序单独走微信小程序授权模式
    wechatMap() {
      let that = this;
      uni.authorize({
        scope: "scope.userLocation",
        success() {
          // 允许授权
          that.initMap();
        },
        fail() {
          //拒绝授权
          uni.showModal({
            content: "检测到您没打开获取地址功能权限，是否去设置打开？",
            confirmText: "确认",
            cancelText: "取消",
            success: (res) => {
              if (res.confirm) {
                uni.openSetting({
                  success: (res) => {
                    that.initMap();
                  },
                });
              } else {
                that.$emit("close");
                return false;
              }
            },
          });
          return false;
        },
      });
    },

    posToCity(latitude, longitude) {
      return new Promise((resolve, reject) => {
        uni.request({
          url: `https://restapi.amap.com/v3/geocode/regeo`,
          method: "GET",
          data: {
            key: "d649892b3937a5ad20b76dacb2bcb5bd", //web服务的key
            location: `${longitude},${latitude}`,
          },
          success: ({ data }) => {
            const { status, info, regeocode } = data;
            if (status === "1") {
              resolve(data);
            } else {
              reject(info);
            }
          },
          fail: (err) => {
            reject(err);
          },
        });
      });
    },
  },
};
</script>
<style lang="scss" scoped>
</style>