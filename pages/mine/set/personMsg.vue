<template>
  <view class="person-msg">
    <view class="head" @click="changeFace">
      <image :src="form.face || '/static/missing-face.png'" mode="aspectFill"></image>
      <view>点击修改头像</view>
    </view>

    <u-form :model="form" ref="uForm" class="form">
      <u-form-item label="昵称" label-width="150" :border-bottom="true">
        <u-input
          v-model="form.nickName"
          border="none"
          input-align="right"
          placeholder="请输入昵称"
        />
      </u-form-item>

      <u-form-item label="性别" label-width="150" :border-bottom="true">
        <view class="sex-row">
          <u-radio-group v-model="form.sex" :active-color="lightColor" :gap="40">
            <u-radio name="1" label="男" shape="circle"></u-radio>
            <u-radio name="0" label="女" shape="circle"></u-radio>
          </u-radio-group>
        </view>
      </u-form-item>

      <u-form-item label="生日" label-width="150" :border-bottom="true">
        <view class="form-value" @click="showBirthday = true">
          {{ birthday || '请选择出生日期' }}
        </view>
        <template #right>
          <u-icon name="arrow-right" color="#ccc" size="16"></u-icon>
        </template>
      </u-form-item>

      <u-form-item label="城市" label-width="150" :border-bottom="true">
        <view class="form-value" @click="clickRegion">
          {{ form.___path || '请选择城市' }}
        </view>
        <template #right>
          <u-icon name="arrow-right" color="#ccc" size="16"></u-icon>
        </template>
      </u-form-item>

      <u-form-item label="手机号" label-width="150" :border-bottom="false">
        <view v-if="form.mobile" class="form-value">{{ form.mobile }}</view>
        <view v-else class="bind-mobile" @click="navigateTo(form.username)">绑定手机号码</view>
      </u-form-item>
    </u-form>

    <view class="bottom">
      <view class="submit" @click="submit">保存</view>
      <view class="submit light" @click="quiteLoginOut">退出登录</view>
    </view>

    <u-datetime-picker
      v-model:show="showBirthday"
      v-model="birthdayValue"
      mode="date"
      :min-date="minBirthdayDate"
      :max-date="maxBirthdayDate"
      :confirm-color="lightColor"
      @confirm="selectTime"
      @cancel="closeBirthdayPicker"
    ></u-datetime-picker>

    <m-city
      :provinceData="region"
      headTitle="区域选择"
      ref="cityPicker"
      @funcValue="getPickerParentValue"
      pickerSize="4"
    ></m-city>
  </view>
</template>

<script>
import { saveUserInfo } from "@/api/members.js";
import { upload } from "@/api/common.js";
import storage from "@/utils/storage.js";
import city from "@/components/m-city/m-city.vue";

function parseBirthdayTimestamp(str) {
  if (!str) {
    return Date.now();
  }
  const timestamp = Date.parse(String(str).replace(/-/g, "/"));
  return Number.isFinite(timestamp) ? timestamp : Date.now();
}

function formatBirthday(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default {
  components: { "m-city": city },
  data() {
    const userInfo = storage.getUserInfo() || {};
    return {
      lightColor: this.$lightColor,
      form: {
        nickName: userInfo.nickName || "",
        birthday: userInfo.birthday || "",
        face: userInfo.face || "/static/missing-face.png",
        regionId: [],
        region: userInfo.region || [],
        sex: userInfo.sex != null ? String(userInfo.sex) : "1",
        ___path: userInfo.region,
        mobile: userInfo.mobile,
        username: userInfo.username,
      },
      birthday: userInfo.birthday || "",
      birthdayValue: parseBirthdayTimestamp(userInfo.birthday),
      minBirthdayDate: new Date("1950-01-01").getTime(),
      maxBirthdayDate: Date.now(),
      region: [
        {
          id: "",
          localName: "请选择",
          children: [],
        },
      ],
      showBirthday: false,
    };
  },
  methods: {
    getPickerParentValue(e) {
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
    },

    clickRegion() {
      this.$refs.cityPicker.show();
    },

    submit() {
      delete this.form.___path;
      const params = JSON.parse(JSON.stringify(this.form));
      saveUserInfo(params).then((res) => {
        if (res.statusCode == 200) {
          storage.setUserInfo(res.data.result);
          uni.navigateBack();
        }
      });
    },

    changeFace() {
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
              const data = JSON.parse(uploadFileRes.data);
              this.form.face = data.result;
            },
          });
        },
      });
    },

    selectTime(e) {
      const timestamp = typeof e?.value === "number" ? e.value : this.birthdayValue;
      const formatted = formatBirthday(timestamp);
      this.birthdayValue = timestamp;
      this.form.birthday = formatted;
      this.birthday = formatted;
      this.showBirthday = false;
    },

    closeBirthdayPicker() {
      this.showBirthday = false;
    },

    navigateTo(username) {
      uni.navigateTo({
        url: "/pages/mine/set/securityCenter/bindMobile?username=" + username,
      });
    },

    syncUserInfo() {
      const userInfo = storage.getUserInfo() || {};
      this.form.nickName = userInfo.nickName || "";
      this.form.birthday = userInfo.birthday || "";
      this.form.face = userInfo.face || "/static/missing-face.png";
      this.form.region = userInfo.region || [];
      this.form.sex = userInfo.sex != null ? String(userInfo.sex) : "1";
      this.form.___path = userInfo.region;
      this.form.mobile = userInfo.mobile;
      this.form.username = userInfo.username;
      this.birthday = userInfo.birthday || "";
      this.birthdayValue = parseBirthdayTimestamp(userInfo.birthday);
    },
  },

  onShow() {
    this.syncUserInfo();
  },
};
</script>

<style lang="scss" scoped>
page {
  background: #fff;
}

.person-msg {
  min-height: 100vh;
  background: #fff;
  padding-bottom: 180rpx;
}

.head {
  padding: 40rpx 0 20rpx;
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

.form {
  background: #fff;
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

.sex-row {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

:deep(.sex-row .u-radio-group) {
  flex: 1;
  justify-content: flex-end;
}

.form-value {
  width: 100%;
  text-align: right;
  font-size: 28rpx;
  color: #666;
}

.bind-mobile {
  width: 100%;
  text-align: right;
  font-size: 28rpx;
  color: $main-color;
}

.bottom {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 30rpx calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-sizing: border-box;
}

.submit {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 100px;
  font-size: 30rpx;
  background: $light-color;
  color: #fff;
}

.submit + .submit {
  margin-left: 24rpx;
}

.light {
  background: rgba($color: $light-color, $alpha: 0.2) !important;
  color: $light-color !important;
}
</style>
