<template>
  <view class="person-msg">
    <view class="head c-content" @click="changeFace">
      <image :src="form.face || '/static/missing-face.png'" mode=""></image>
      <view>点击修改头像</view>
    </view>
    <u-form :model="form" ref="uForm" class="form">
      <!-- <u-form-item label="用户名" label-width="150"
        ><u-input v-model="form.username" disabled
      /></u-form-item> -->
      <u-form-item label="昵称" label-width="150">
        <u-input v-model="form.nickName" placeholder="请输入昵称" />
      </u-form-item>
      <u-form-item label="性别" label-width="150">
        <!-- {{typeof list[0].value}} {{form.sex + typeof form.sex}} -->
        <u-radio-group v-model="form.sex" :active-color="lightColor">
          <u-radio name="1">男</u-radio>
          <u-radio name="0">女</u-radio>
        </u-radio-group>
      </u-form-item>

      <u-form-item label="生日" label-width="150" right-icon="arrow-right">
        <u-input v-model="birthday" disabled placeholder="请选择出生日期" @click="showBirth = true" />
        <u-picker v-model="showBirth" mode="time" :confirm-color="lightColor" @confirm="selectTime"></u-picker>
      </u-form-item>
      <u-form-item label="城市" label-width="150" placeholder="请选择城市" right-icon="arrow-right">
        <u-input v-model="form.___path" disabled @click="clickRegion" />
      </u-form-item>
      <view class="submit" @click="submit">保存</view>
    </u-form>

    <m-city :provinceData="region" headTitle="区域选择" ref="cityPicker" @funcValue="getpickerParentValue" pickerSize="4"></m-city>
  </view>
</template>
<script>
import { saveUserInfo } from "@/api/members.js";
import { upload } from "@/api/common.js";

import storage from "@/utils/storage.js";
import uFormItem from "@/uview-ui/components/u-form-item/u-form-item.vue";
import gkcity from "@/components/m-city/m-city.vue";
export default {
  components: { uFormItem, "m-city": gkcity },
  data() {
    return {
      lightColor: this.$lightColor,
      form: {
        face: "/static/missing-face.png",
        regionId: [],
        region: [],
        sex: "1",
        ___path: "",
      },
      birthday: "",
      photo: [
        { text: "立即拍照", color: this.$mainColor },
        { text: "从相册选择", color: this.$mainColor },
      ],
      value: "",
      region: [
        {
          id: "",
          localName: "请选择",
          children: [],
        },
      ],
      list: [
        {
          sex: "男",
          value: "1",
          disabled: false,
        },
        {
          sex: "女",
          value: "0",
          disabled: false,
        },
      ],
      showBirth: false,
      showRegion: false,
      showAction: false,
    };
  },
  created() {},
  methods: {
    getpickerParentValue(e) {
      this.form.region = [];
      this.form.regionId = [];
      let name = "";

      e.forEach((item, index) => {
        if (item.id) {
          this.form.region.push(item.localName);
          this.form.regionId.push(item.id);
          if (index == e.length - 1) {
            name += item.localName;
          } else {
            name += item.localName + ",";
          }
          this.form.___path = name;
        }
      });

      console.log(this.form);
    },

    clickRegion() {
      this.$refs.cityPicker.show();
    },
    submit() {
      if (this.form.regionId.length != 0 && this.birthday) {
        delete this.form.___path;
        let params = JSON.parse(JSON.stringify(this.form));
        saveUserInfo(params).then((res) => {
          console.log(res);
          if (res.statusCode == 200) {
            storage.setUserInfo(res.data.result);
            uni.navigateBack();
          }
        });
      } else {
        uni.showToast({
          title: "请填写生日和城市!",
          duration: 2000,
          icon: "none",
        });
      }
    },
    changeFace(index) {
      uni.chooseImage({
        success: (chooseImageRes) => {
          const tempFilePaths = chooseImageRes.tempFilePaths;
          uni.uploadFile({
            url: upload,
            filePath: tempFilePaths[0],
            name: "file",
            header: {
              accessToken: storage.getAccessToken(),
            },
            success: (uploadFileRes) => {
              let data = JSON.parse(uploadFileRes.data);

              this.form.face = data.result;
            },
          });
        },
      });
    },
    selectRegion(region) {
      //选择地址
      this.$set(
        this.form,
        "address",
        `${region.province.label} ${region.city.label} ${region.area.label}`
      );
    },
    selectTime(time) {
      // 生日
      console.log(time);
      this.form.birthday = `${time.year}-${time.month}-${time.day}`;
      this.birthday = `${time.year} - ${time.month} - ${time.day}`;
      // this.form.timestamp = `${time.year} - ${time.month} - ${time.day}`;
    },
  },
  onLoad() {
    // this.form.userName = storage.getUserInfo().username
    this.form.nickName = storage.getUserInfo().nickName;
    this.form.sex = storage.getUserInfo().sex || 1;
    this.form.birthday = storage.getUserInfo().birthday;
    this.birthday = storage.getUserInfo().birthday || "";
    this.form.___path = storage.getUserInfo().region;
    this.form.face = storage.getUserInfo().face || "";
    this.form.regionId = storage.getUserInfo().regionId || [];
    this.form.region = storage.getUserInfo().region || [];
    console.log(this.form);
  },
};
</script>

<style lang="scss" scoped>
.submit {
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  margin-top: 90rpx;

  width: 100%;
  margin: 0 auto;
  color: $main-color;
  border-radius: 100px;
}
.head {
  height: 260rpx;
  color: $font-color-light;
  font-size: $font-sm;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  line-height: 2em;
  image {
    width: 144rpx;
    height: 144rpx;
    border-radius: 50%;
  }
}
/deep/ .u-form {
  background-color: #ffffff;
  padding: 0;
  margin-top: 30rpx;
  .u-form-item {
    padding: 0 20rpx;
    height: 110rpx;
    line-height: 110rpx;
  }
}
.form {
  background-color: #ffffff;
}
</style>
