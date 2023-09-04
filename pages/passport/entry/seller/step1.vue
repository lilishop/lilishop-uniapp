<template>
  <div class="wrapper">
    <u-form label-width="200" :model="form" ref="uForm">
      <div class="column">
        <div class="flag-title light-color">基础信息</div>
        <u-form-item
          required
          :border-bottom="false"
          prop="companyName"
          label="公司名称"
          ><u-input
            v-model="form.companyName"
            :custom-style="defaultInputStyle"
        /></u-form-item>
        <u-form-item
          required
          :border-bottom="false"
          prop="companyAddressPath"
          label="公司所在地"
          >
          <div @click="showPicker()" style="margin-right: 30rpx;">选择</div>
          <u-input
            disabled
            :custom-style="defaultInputStyle"
            v-model="form.companyAddressPath"
        /></u-form-item>
        <u-form-item
          required
          :border-bottom="false"
          prop="companyAddress"
          label="公司详细地址"
          ><u-input
            :custom-style="defaultInputStyle"
            v-model="form.companyAddress"
        /></u-form-item>
        <u-form-item
          required
          :border-bottom="false"
          prop="employeeNum"
          label="员工人数"
          ><u-input
            type="number"
            :custom-style="defaultInputStyle"
            v-model="form.employeeNum"
        /></u-form-item>

        <u-form-item
          required
          :border-bottom="false"
          prop="companyPhone"
          label="公司电话"
          ><u-input
            type="number"
            :custom-style="defaultInputStyle"
            v-model="form.companyPhone"
        /></u-form-item>
        <u-form-item
          :border-bottom="false"
          prop="registeredCapital"
          label="注册资金"
          required
          ><u-input
            type="number"
            :custom-style="defaultInputStyle"
            v-model="form.registeredCapital"
        /></u-form-item>
        <u-form-item
          required
          :border-bottom="false"
          prop="linkName"
          label="联系人姓名"
          ><u-input :custom-style="defaultInputStyle" v-model="form.linkName"
        /></u-form-item>
        <u-form-item
          required
          :border-bottom="false"
          prop="linkPhone"
          label="联系人电话"
          ><u-input
            type="number"
            :custom-style="defaultInputStyle"
            v-model="form.linkPhone"
        /></u-form-item>
        <u-form-item
          required
          :border-bottom="false"
          prop="companyEmail"
          label="电子邮箱"
          ><u-input
            :custom-style="defaultInputStyle"
            v-model="form.companyEmail"
        /></u-form-item>
      </div>
      <div class="column">
        <div class="flag-title light-color">营业执照信息</div>
        <u-form-item
          required
          :border-bottom="false"
          prop="licenseNum"
          label="营业执照号"
          ><u-input :custom-style="defaultInputStyle" v-model="form.licenseNum"
        /></u-form-item>
        <u-form-item
          required
          :border-bottom="false"
          prop="scope"
          label="法定经营范围"
          ><u-input :custom-style="defaultInputStyle" v-model="form.scope"
        /></u-form-item>
        <u-form-item
          :border-bottom="false"
          prop="licencePhoto"
          label="营业执照电子版"
          required
        >
          <div>
            <u-upload
              :file-list="licencePhotoFileList"
              :header="{ accessToken: storage.getAccessToken() }"
              :action="action"
              width="200"
              @on-uploaded="onUploaded($event, 'licencePhoto')"
              :max-count="1"
              :show-progress="false"
            ></u-upload>

            <div class="tips">
              请压缩图片在2M以内，确保文字清晰以免上传或审核失败
            </div>
          </div>
        </u-form-item>
      </div>
      <div class="column">
        <div class="flag-title light-color">法人信息</div>
        <u-form-item
          required
          :border-bottom="false"
          prop="legalName"
          label="法人姓名"
          ><u-input :custom-style="defaultInputStyle" v-model="form.legalName"
        /></u-form-item>
        <u-form-item
          required
          :border-bottom="false"
          prop="legalId"
          label="法人证件号"
          ><u-input :custom-style="defaultInputStyle" v-model="form.legalId"
        /></u-form-item>
        <u-form-item
          required
          :border-bottom="false"
          prop="legalPhoto"
          label="法人证件电子版"
        >
          <div>
            <u-upload
              :file-list="legalPhotoFileList"
              :header="{ accessToken: storage.getAccessToken() }"
              :action="action"
              width="200"
              @on-uploaded="onUploaded($event, 'legalPhoto')"
              :max-count="1"
              :show-progress="false"
            ></u-upload>
          </div>
        </u-form-item>
      </div>
    </u-form>
    <div class="submit" @click="validatorStep1Form">提交/下一步</div>
    <m-city
      :provinceData="list"
      headTitle="区域选择"
      ref="cityPicker"
      @funcValue="getPickerParentValue"
      pickerSize="4"
    >
    </m-city>
  </div>
</template>

<script>
import { applyFirst } from "@/api/entry";
import city from "@/components/m-city/m-city.vue";
import storage from "@/utils/storage.js";
import { upload } from "@/api/common.js";
import * as RegExp from "@/utils/RegExp.js";
export default {
  components: { "m-city": city },
  data() {
    return {
      storage,
      action: upload, //图片上传数据
      defaultInputStyle: {
        background: "#f7f7f7",
        padding: "0 20rpx",
        "border-radius": "10rpx",
      },
      legalPhotoFileList: [],
      licencePhotoFileList: [],
      form: {
        companyName: "",
        companyAddressIdPath: [],
        companyAddressPath: "",
        companyAddress: "",
        employeeNum: "",
        registeredCapital: "",
        linkName: "",
        linkPhone: "",
        companyPhone: "",
        companyEmail: "",
        licenseNum: "",
        scope: "",
        legalPhoto: "",
        licencePhoto: "",
        legalName: "",
        legalId: "",
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
        companyName: [{ required: true, message: "请填写公司信息" }],
        companyAddressPath: [{ required: true, message: "请选择公司所在地" }],
        companyAddress: [{ required: true, message: "请填写公司详细地址" }],
        employeeNum: [{ required: true, message: "请填写公司员工总数" }],
        registeredCapital: [{ required: true, message: "请填写公司注册资金" }],
        linkName: [{ required: true, message: "请填写联系人姓名" }],
        linkPhone: [
          { required: true, message: "请填写联系人电话" },
          {
            // 自定义验证函数，见上说明
            validator: (rule, value, callback) => {
              // 上面有说，返回true表示校验通过，返回false表示不通过
              // this.$u.test.mobile()就是返回true或者false的
              return this.$u.test.mobile(value);
            },
            message: "手机号码不正确",
            // 触发器可以同时用blur和change
            trigger: ["change", "blur"],
          },
        ],
        companyPhone: [
          { required: true, message: "请填写公司电话" },
          {
            // 自定义验证函数，见上说明
            validator: (rule, value, callback) => {
              // 上面有说，返回true表示校验通过，返回false表示不通过
              // this.$u.test.mobile()就是返回true或者false的
              return this.$u.test.mobile(value);
            },
            message: "请填写正确的号码",
            // 触发器可以同时用blur和change
            trigger: ["change", "blur"],
          },
        ],
        companyEmail: [
          { required: true, message: "请填写电子邮箱" },
          {
            // 自定义验证函数，见上说明
            validator: (rule, value, callback) => {
              // 上面有说，返回true表示校验通过，返回false表示不通过
              // this.$u.test.mobile()就是返回true或者false的
              return this.$u.test.email(value);
            },
            message: "请填写正确的电子邮箱",
            // 触发器可以同时用blur和change
            trigger: ["change", "blur"],
          },
        ],
        licenseNum: [
          { required: true, message: "请填写营业执照号" },
          { pattern: RegExp.licenseNum, message: "请输入正确的营业执照号" },
        ],
        scope: [{ required: true, message: "请填写营业执照所示经营范围" }],
        legalPhoto: [{ required: true, message: "请上传法人身份证照片" }],
        licencePhoto: [{ required: true, message: "请上传营业执照" }],
        legalName: [{ required: true, message: "请输入法人姓名" }],
        legalId: [
          { required: true, message: "请输入法人证件号" },
          { pattern: RegExp.IDCard, message: "请输入正确的证件号" },
        ],
      },
    };
  },
  mounted() {
    this.$refs.uForm.setRules(this.rules);
  },
  props: ["companyData"],
  watch: {
    companyData: {
      handler(val) {
        if (val) {
          this.$set(this, "form", val);
          // 给图片赋值
          const judgeDeepPhoto = ["legalPhoto", "licencePhoto"];
          judgeDeepPhoto.forEach((key) => {
            if (this.form[key]) {
              this.form[key].split(",").forEach((item) => {
                this[`${key}FileList`].push({ url: item });
              });
            }
          });
        }
      },
      deep: true,
    },
  },
  methods: {
    // 图片上传
    onUploaded(lists, key) {
      let images = [];
      lists.forEach((item) => {
        images.push(item.response.result);
      });
      this.form[key] = images;
    },
    getPickerParentValue(e) {
      this.form.companyAddressIdPath = [];

      let name = "";
      e.forEach((item, index) => {
        if (item.id) {
          // 遍历数据
          this.form.companyAddressIdPath.push(item.id);
          if (index == e.length - 1) {
            name += item.localName;
          } else {
            name += item.localName + ",";
          }
          this.form.companyAddressPath = name;
        }
      });
    },
    // 显示三级地址联动
    showPicker() {
      console.log(this.$refs)
      this.$refs.cityPicker.show();
    },
    validatorStep1Form() {
      this.$refs.uForm.validate(async (valid) => {
        console.log(valid);
        if (valid) {
          const params = { ...this.form };

          params.legalPhoto = params.legalPhoto.toString();
          params.licencePhoto = params.licencePhoto.toString();
          params.companyAddressIdPath = params.companyAddressIdPath.toString();
          delete params.complexAddress;

          const res = await applyFirst(params);
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
</style>
