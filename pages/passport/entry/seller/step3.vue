<template>
  <div class="wrapper">
    <u-form label-width="200" :model="form" ref="uForm">
      <div class="column">
        <div class="flag-title light-color">基础信息</div>
        <u-form-item
          required
          :border-bottom="false"
          prop="storeName"
          label="店铺名称"
          ><u-input v-model="form.storeName" :custom-style="defaultInputStyle"
        /></u-form-item>
        <u-form-item
          required
          :border-bottom="false"
          prop="storeLogo"
          label="店铺logo"
        >
          <div>
            <u-upload
              :file-list="storeLogoFileList"
              :header="{ accessToken: storage.getAccessToken() }"
              :action="action"
              width="200"
              @on-uploaded="onUploaded($event, 'storeLogo')"
              :max-count="1"
              :show-progress="false"
            ></u-upload>
          </div>
        </u-form-item>
        <u-form-item
          required
          :border-bottom="false"
          prop="goodsManagementCategory"
          label="店铺经营类目"
          >
          <div @click="showCategory()"   style="margin-right: 30rpx;">选择</div>
         
          <u-input
            :custom-style="defaultInputStyle"
            v-model="goodsManagementCategory"
            disabled
            @click="showCategory()"
        /></u-form-item>

        <u-form-item
          required
          :border-bottom="false"
          prop="storeAddressPath"
          label="店铺所在地"
        >
          <div @click="showPicker()"   style="margin-right: 30rpx;">选择</div>
          <u-input
            :custom-style="defaultInputStyle"
            v-model="form.storeAddressPath"
          
            disabled
            
          />
        </u-form-item>
       
        <!-- <u-form-item
          required
          :border-bottom="false"
          prop="storeAddressPath"
          label="店铺定位"
        >
          <div class="get-center" @click="clickUniMap()">开始定位</div>
          <div class="tips-success" v-if="form.storeCenter">已成功定位</div>
        </u-form-item> -->

        <u-form-item
          required
          :border-bottom="false"
          prop="storeAddressDetail"
          label="店铺详细地址"
          ><u-input
            :custom-style="defaultInputStyle"
            v-model="form.storeAddressDetail"
        /></u-form-item>
        <u-form-item
          required
          :border-bottom="false"
          prop="storeDesc"
          label="店铺简介"
          ><u-input
            type="textarea"
            :custom-style="defaultInputStyle"
            v-model="form.storeDesc"
        /></u-form-item>
      </div>
    </u-form>
    <div class="submit" @click="validatorStep1Form">提交平台审核</div>
    <m-city
      :provinceData="list"
      headTitle="区域选择"
      ref="cityPicker"
      @funcValue="getPickerParentValue"
      pickerSize="4"
    >
    </m-city>

    <u-select
      v-model="enableCategory"
      @confirm="confirmCategory"
      :list="categoryList"
    ></u-select>

    <uniMap v-if="mapFlag" @close="closeMap" @callback="callBackAddress" />
  </div>
</template>

<script>
import { applyThird } from "@/api/entry";
import { getCategoryList } from "@/api/goods";
import city from "@/components/m-city/m-city.vue";
import storage from "@/utils/storage.js";
import { upload } from "@/api/common.js";
import uniMap from "@/components/uniMap";
import permision from "@/js_sdk/wa-permission/permission.js";
export default {
  components: { "m-city": city, uniMap },
  data() {
    return {
      storage,
      mapFlag: false,
      action: upload, //图片上传数据
      defaultInputStyle: {
        background: "#f7f7f7",
        padding: "0 20rpx",
        "border-radius": "10rpx",
      },
      goodsManagementCategory: "",
      storeLogoFileList: [],
      categoryList: [],
      form: {
        storeName: "",
        storeLogo: "",
        goodsManagementCategory: "",
        storeAddressPath: "",
        storeAddressDetail: "",
        storeDesc: "",
      },
      list: [
        {
          id: "",
          localName: "请选择",
          children: [],
        },
      ],
      rules: {
        // 验证规则
        goodsManagementCategory: [
          { required: true, message: "请选择店铺经营类目" },
        ],
        storeName: [{ required: true, message: "请填写店铺名称" }],
        storeLogo: [{ required: true, message: "请上传店铺logo" }],
        storeDesc: [{ required: true, message: "请填写店铺简介" }],
        storeCenter: [{ required: true, message: "请选择店铺位置" }],
        storeAddressIdPath: [{ required: true, message: "请选择店铺位置" }],
        storeAddressDetail: [{ required: true, message: "请输入店铺详细地址" }],
      },
      enableCategory: false,
    };
  },
  mounted() {
    this.$refs.uForm.setRules(this.rules);
    this.fetchCategoryList();
  },
  props: ["companyData"],
  watch: {
    companyData: {
      handler(val) {
        this.$set(this, "form", val);
        // 给图片赋值
        const judgeDeepPhoto = ["storeLogo"];

        judgeDeepPhoto.forEach((key) => {
          if (this.form[key]) {
            this.form[key].split(",").forEach((item) => {
              this[`${key}FileList`].push({ url: item });
            });
          }
        });
      },
      deep: true,
      immediate: true,
    },
  },

  methods: {
    callBackAddress(val) {
      console.log(val);
      this.form.storeAddressDetail = val.address;
      this.form.storeCenter = `${val.longitude},${val.latitude}`;
    },
    // 关闭地图
    closeMap() {
      this.mapFlag = false;
    },
    // 打开地图并访问权限
    clickUniMap() {
      console.log("click");
      // #ifdef APP-PLUS
      if (plus.os.name == "iOS") {
        // ios系统
        permision.judgeIosPermission("location")
          ? (this.mapFlag = true)
          : this.refuseMap();
      } else {
        // 安卓
        this.requestAndroidPermission(
          "android.permission.ACCESS_FINE_LOCATION"
        );
      }
      // #endif

      // #ifndef APP-PLUS
      this.mapFlag = true;
      // #endif
    },

    // 如果拒绝权限 提示区设置
    refuseMap() {
      uni.showModal({
        title: "温馨提示",
        content: "您已拒绝定位,请开启",
        confirmText: "去设置",
        success(res) {
          if (res.confirm) {
            //打开授权设置
            // #ifndef MP-WEIXIN
            uni.getSystemInfo({
              success(res) {
                if (res.platform == "ios") {
                  //IOS
                  plus.runtime.openURL("app-settings://");
                } else if (res.platform == "android") {
                  //安卓
                  let main = plus.android.runtimeMainActivity();
                  let Intent = plus.android.importClass(
                    "android.content.Intent"
                  );
                  let mIntent = new Intent("android.settings.ACTION_SETTINGS");
                  main.startActivity(mIntent);
                }
              },
            });
            // #endif
          }
        },
      });
    },
    // 获取安卓是否拥有地址权限
    async requestAndroidPermission(permisionID) {
      var result = await permision.requestAndroidPermission(permisionID);

      if (result == 1) {
        this.mapFlag = true;
      } else {
        this.refuseMap();
      }
    },

    confirmCategory(val) {
      this.form.goodsManagementCategory = val[0].value;
      this.goodsManagementCategory = val[0].label;
    },
    async fetchCategoryList() {
      const res = await getCategoryList(0);
      if (res.data.success) {
        if (res.data.result.length) {
          this.categoryList = res.data.result.map((item) => {
            return { label: item.name, value: item.id };
          });

          if (this.form.goodsManagementCategory) {
            this.goodsManagementCategory = this.categoryList.find(
              (item) => this.form.goodsManagementCategory == item.value
            ).label;
          }
        }
      }
    },
    // 图片上传
    onUploaded(lists, key) {
      let images = [];
      lists.forEach((item) => {
        images.push(item.response.result);
      });
      this.form[key] = images;
    },
    getPickerParentValue(e) {
      this.form.storeAddressIdPath = [];
      console.log(e)
      let name = "";
      e.forEach((item, index) => {
        if (item.id) {
          // 遍历数据
          this.form.storeAddressIdPath.push(item.id);
          if (index == e.length - 1) {
            name += item.localName;
          } else {
            name += item.localName + ",";
          }
          this.$set(this.form,'storeAddressPath',name)
        }
      });

      this.form.storeCenter = e[e.length-1].center
    },
    // 显示三级地址联动
    showPicker() {
      this.$refs.cityPicker.show();
    },
    showCategory() {
      this.enableCategory = true;
    },
    validatorStep1Form() {
      this.$refs.uForm.validate(async (valid) => {
        console.log(valid);
        if (valid) {
          const params = { ...this.form };
          params.storeLogo = params.storeLogo.toString();
          params.storeAddressIdPath = params.storeAddressIdPath.toString();
          const res = await applyThird(params);
          if (res.data.success) {
            uni.showToast({
              title: "提交成功!",
              icon: "none",
            });
            this.$emit("callback");
          }
        }
      });
    },
  },
};
</script>
<style>
/* page {
  background: #fff;
} */
</style>
<style lang="scss" scoped>
@import url("./entry.scss");
.get-center {
  padding: 12rpx 30rpx;
  background: $light-color;
  border-radius: 10rpx;
  font-size: 24rpx;
  color: #fff;
  font-weight: bold;
  display: inline;
}
.column {
  padding: 32rpx;
  margin-bottom: 20rpx;
  background: #fff;
}
.submit {
  color: #fff;
  margin-top: 120rpx;
  background: rgba($light-color, 0.8);
}
.tips {
  color: #999;
  font-size: 24rpx;
  line-height: 1.2;
  margin-top: 10rpx;
}
.tips-success {
  color: $weChat-color;
  font-size: 24rpx;
}
</style>
