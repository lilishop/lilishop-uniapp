<template>
    


    <!-- 自定义地图组件  -->
  <map
    class="map"
    :latitude="latitude"
    :longitude="longitude"
    scale="18"
    :markers="markers"
    :show-location="true"
    @markertap="markertap"
    @updated="mapUpdated"
    @tap="closeMapMarker"
  ></map>
</template>
<script>
import amap from "@/js_sdk/amap-wx.130.js";
export default {
  data() {
    return {};
  },
  mounted() {
    this.initMap();
  },
  methods: {
    markertap() {},
    mapUpdated() {},
    closeMapMarker() {},

    // 初始化地图
    initMap() {
      this.amapPlugin = new amap.AMapWX({
        key: "c03fe63e4ed7cfc6612304b3f46c19b5", //该key 是在高德中申请的微信小程序key
      });

      this.amapPlugin.getRegeo({
        type: "gcj02", //map 组件使用的经纬度是国测局坐标， type 为 gcj02

        success: function (res) {
          const latitude = res[0].latitude;

          const longitude = res[0].longitude;

          that.longitude = longitude;

          that.latitude = latitude;

          that.mapInfo = res[0];
        },

        fail: (res) => {
          console.log(JSON.stringify(res));
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.map {
  width: 100%;
  height: 100%;
}
</style>