<template>
  <view class="add-address">
    <u-form :model="form" ref="uForm" error-type="toast" :rules="rules">
      <u-form-item label="收货人" label-width="130" prop="name" :border-bottom="true">
        <u-input
          v-model="form.name"
          border="none"
          input-align="right"
          clearable
          placeholder="请输入收货人姓名"
        />
      </u-form-item>

      <u-form-item label="手机号码" label-width="130" prop="mobile" :border-bottom="true">
        <u-input
          v-model="form.mobile"
          type="number"
          maxlength="11"
          border="none"
          input-align="right"
          placeholder="请输入收货人手机号码"
        />
      </u-form-item>

      <u-form-item label="所在区域" label-width="130" prop="___path" :border-bottom="true">
        <view class="form-value" @click="showPicker">
          {{ form.___path || '请选择所在地区' }}
        </view>
        <template #right>
          <u-icon name="arrow-right" color="#ccc" size="16"></u-icon>
        </template>
      </u-form-item>

      <u-form-item class="detailAddress" label="详细地址" label-width="130" prop="detail" :border-bottom="true">
        <u-input
          type="textarea"
          v-model="form.detail"
          maxlength="100"
          height="150"
          border="none"
          placeholder="街道楼牌号等"
        />
      </u-form-item>

      <u-form-item label="地址别名" label-width="130" :border-bottom="false">
        <u-input
          v-model="form.alias"
          border="none"
          input-align="right"
          placeholder="请输入地址别名"
        />
      </u-form-item>

      <view class="default-row">
        <u-checkbox
          usedAlone
          shape="circle"
          size="30"
          :active-color="lightColor"
          v-model:checked="form.isDefault"
          label="设为默认地址"
        ></u-checkbox>
      </view>

      <view class="saveBtn" @click="save">保存</view>
    </u-form>

    <m-city
      :provinceData="list"
      headTitle="区域选择"
      ref="cityPicker"
      @funcValue="getpickerParentValue"
      pickerSize="4"
    ></m-city>

    <uniMap v-if="mapFlag" @close="closeMap" @callback="callBackAddress" />
  </view>
</template>
<script>
import { addAddress, editAddress, getAddressDetail } from "@/api/address.js";
import city from "@/components/m-city/m-city.vue";
import uniMap from "@/components/uniMap";
import permision from "@/js_sdk/wa-permission/permission.js";
export default {
  components: {
    "m-city": city,
    uniMap,
  },
  onShow() {
    // 判断当前系统权限定位是否开启
  },
  methods: {
    // 关闭地图
    closeMap() {
      this.mapFlag = false;
    },
    // 打开地图并访问权限
    clickUniMap() {
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

    // 选择地址后数据的回调
    callBackAddress(val) {
      console.log(val)
      uni.showLoading({
        title: "加载中",
      });

      if (val.regeocode && val) {
        let address = val.regeocode;
        this.form.detail = address.formatted_address; //地址详情
        this.form.___path = val.data.result.name;
        this.form.consigneeAddressIdPath = val.data.result.id; // 地址id分割
        this.form.consigneeAddressPath = val.data.result.name; //地址名称， '，'分割
        this.form.lat = val.latitude; //纬度
        this.form.lon = val.longitude; //经度
         uni.hideLoading();
      }

      this.mapFlag = !this.mapFlag; //关闭地图
    },

    // 保存当前 地址
    save() {
      this.$refs.uForm.validate().then(() => {
        const params = { ...this.form };
        delete params.___path;

        if (Array.isArray(params.consigneeAddressIdPath)) {
          params.consigneeAddressIdPath = params.consigneeAddressIdPath.join(",");
        }
        if (Array.isArray(params.consigneeAddressPath)) {
          params.consigneeAddressPath = params.consigneeAddressPath.join(",");
        }

        if (!params.id) {
          addAddress(params).then((res) => {
            if (res.data.success) {
              uni.navigateBack();
            } else {
              uni.showToast({
                title: res.data.message || "保存失败",
                icon: "none",
              });
            }
          });
        } else {
          delete params.updateBy;
          delete params.updateTime;
          editAddress(params).then((res) => {
            if (res.data.success) {
              uni.navigateBack();
            } else {
              uni.showToast({
                title: res.data.message || "保存失败",
                icon: "none",
              });
            }
          });
        }
      }).catch(() => {});
    },

    // 三级地址联动回调
    getpickerParentValue(e) {
      // 将需要绑定的地址设置为空，并赋值
      this.form.consigneeAddressIdPath = [];
      this.form.consigneeAddressPath = [];
      let name = "";

      e.forEach((item, index) => {
        if (item.id) {
          // 遍历数据
          this.form.consigneeAddressIdPath.push(item.id);
          this.form.consigneeAddressPath.push(item.localName);
          name += item.localName;
          this.form.___path = name;
        }
        if (index == e.length - 1) {
          //如果是最后一个
          let _town = item.children.filter((_child) => {
            return _child.id == item.id;
          });

          this.form.lat = _town[0].center.split(",")[1];
          this.form.lon = _town[0].center.split(",")[0];
        }
      });
    },

    // 显示三级地址联动
    showPicker() {
      this.$refs.cityPicker.show();
    },
  },
  mounted() {},
  data() {
    return {
      lightColor: this.$lightColor, //高亮颜色
      mapFlag: false, // 地图选择开
      routerVal: "",
      form: {
        detail: "", //地址详情
        name: "", //收货人姓名
        mobile: "", //手机号码
        consigneeAddressIdPath: [], //地址id
        consigneeAddressPath: [], //地址名字
        ___path: "", //所在区域
        isDefault: false, //是否默认地址
      },
      // 表单提交校验规则
      rules: {
        name: [
          {
            required: true,
            message: "收货人姓名不能为空",
            trigger: ["blur", "change"],
          },
        ],
        mobile: [
          {
            required: true,
            message: "手机号码不能为空",
            trigger: ["blur", "change"],
          },
          {
            validator: (rule, value, callback) => {
              return this.$u.test.mobile(value);
            },
            message: "手机号码不正确",
            trigger: ["change", "blur"],
          },
        ],
        ___path: [
          {
            required: true,
            message: "请选择所在区域",
            trigger: ["change"],
          },
        ],
        detail: [
          {
            required: true,
            message: "请填写详细地址",
            trigger: ["blur", "change"],
          },
        ],
      },
      list: [
        {
          id: "",
          localName: "请选择",
          children: [],
        },
      ],
    };
  },
  onLoad(option) {
    uni.showLoading({
      title: "加载中",
    });
    this.routerVal = option;
    // 如果当前是编辑地址,则需要查询出地址详情信息
    if (option.id) {
      getAddressDetail(option.id).then((res) => {
        const params = res.data.result;
        params.___path = params.consigneeAddressPath;
        this["form"] = params;

         if (this.$store.state.isShowToast){ uni.hideLoading() };
      });
    }
     uni.hideLoading();
  },
  // 初始化rules必须要在onReady生命周期，因为onLoad生命周期组件可能尚未创建完毕
  onReady() {
    this.$refs.uForm.setRules(this.rules);
  },
};
</script>
<style scoped lang="scss">
page {
  background: #f5f5f5;
}

.add-address {
  min-height: 100vh;
  background: #fff;
  padding-bottom: 40rpx;
}

:deep(.u-form-item) {
  padding: 0 30rpx;
  min-height: 100rpx;
}

:deep(.u-form-item__body) {
  min-height: 100rpx;
  align-items: center;
}

:deep(.u-form-item__body__left__content__label) {
  font-size: 30rpx;
  color: #333;
}

:deep(.u-form-item__body__right__content__slot) {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

:deep(.u-input) {
  padding: 0 !important;
}

:deep(.u-input__content__field-wrapper__field) {
  font-size: 28rpx !important;
  color: #666 !important;
}

.form-value {
  width: 100%;
  text-align: right;
  font-size: 28rpx;
  color: #666;
}

.detailAddress {
  :deep(.u-form-item__body) {
    align-items: flex-start;
    padding-top: 24rpx;
    padding-bottom: 24rpx;
    min-height: auto;
  }

  :deep(.u-form-item__body__left) {
    padding-top: 8rpx;
  }

  :deep(.u-form-item__body__right__content__slot) {
    justify-content: flex-start;
    align-items: flex-start;
  }
}

.default-row {
  padding: 24rpx 30rpx;
}

:deep(.default-row .u-checkbox__label) {
  font-size: 28rpx;
  color: $font-color-light;
}

.saveBtn {
  margin: 40rpx 30rpx 0;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 30rpx;
  background: $light-color;
  color: #fff;
  border-radius: 40rpx;
}
</style>