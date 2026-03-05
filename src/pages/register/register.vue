<template>
  <div>
    <div
      class="container"
      :style='{"minHeight":"100vh","width":"100%","alignItems":"center","background":"url(http://codegen.caihongy.cn/20221231/7a3226bd0dfc41549fbee764c9f6552d.jpg) no-repeat center top / 100% 100%","justifyContent":"center","display":"flex"}'
    >
      <el-form
        v-if="pageFlag === 'register'"
        ref="registerForm"
        class="rgs-form"
        :model="registerForm"
        :rules="rules"
        :style='{"padding":"20px","boxShadow":"0px 0px 0px #9cd8da,inset 0px 0px 0px 0px #e0f8e8","margin":"0","borderColor":"#00adb5  #00adb5 #00adb5 #00adb5","borderRadius":"30px","background":"rgba(255,255,255,.0)","borderWidth":"0px","width":"800px","minWidth":"800px","borderStyle":"solid double solid double","height":"auto"}'
      >
        <div v-if="true" :style='{"width":"100%","margin":"0 0 4px 0","fontSize":"20px","color":"#3086b9","textAlign":"center","fontWeight":"500"}'>
          USER / REGISTER
        </div>
        <div v-if="true" :style='{"margin":"0 auto 20px","borderColor":"#c4deee","color":"#3086b9","textAlign":"center","borderWidth":"4px 0px","width":"80%","fontSize":"22px","lineHeight":"44px","borderStyle":"dotted dashed","fontWeight":"500"}'>
          私人西服定制注册
        </div>

        <template v-if="tableName === 'yonghu'">
          <el-form-item :style='{"width":"80%","padding":"0","margin":"0 auto 20px","height":"auto"}' prop="yonghuzhanghao">
            <el-input v-model="registerForm.yonghuzhanghao" placeholder="请输入用户账号" />
          </el-form-item>
          <el-form-item :style='{"width":"80%","padding":"0","margin":"0 auto 20px","height":"auto"}' prop="mima">
            <el-input v-model="registerForm.mima" type="password" placeholder="请输入密码" />
          </el-form-item>
          <el-form-item :style='{"width":"80%","padding":"0","margin":"0 auto 20px","height":"auto"}' prop="mima2">
            <el-input v-model="registerForm.mima2" type="password" placeholder="请再次输入密码" />
          </el-form-item>
          <el-form-item :style='{"width":"80%","padding":"0","margin":"0 auto 20px","height":"auto"}' prop="yonghuxingming">
            <el-input v-model="registerForm.yonghuxingming" placeholder="请输入用户姓名" />
          </el-form-item>
          <el-form-item :style='{"width":"80%","padding":"0","margin":"0 auto 20px","height":"auto"}' prop="touxiang">
            <file-upload
              tip="点击上传头像"
              action="file/upload"
              :limit="1"
              :multiple="true"
              :fileUrls="registerForm.touxiang ? registerForm.touxiang : ''"
              @change="yonghutouxiangUploadChange"
            />
          </el-form-item>
          <el-form-item :style='{"width":"80%","padding":"0","margin":"0 auto 20px","height":"auto"}' prop="xingbie">
            <el-select v-model="registerForm.xingbie" placeholder="请选择性别">
              <el-option v-for="(item, index) in yonghuxingbieOptions" :key="index" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item :style='{"width":"80%","padding":"0","margin":"0 auto 20px","height":"auto"}' prop="lianxifangshi">
            <el-input v-model="registerForm.lianxifangshi" placeholder="请输入联系方式" />
          </el-form-item>
        </template>

        <template v-else-if="tableName === 'shejishi'">
          <el-form-item :style='{"width":"80%","padding":"0","margin":"0 auto 20px","height":"auto"}' prop="shejishizhanghao">
            <el-input v-model="registerForm.shejishizhanghao" placeholder="请输入设计师账号" />
          </el-form-item>
          <el-form-item :style='{"width":"80%","padding":"0","margin":"0 auto 20px","height":"auto"}' prop="mima">
            <el-input v-model="registerForm.mima" type="password" placeholder="请输入密码" />
          </el-form-item>
          <el-form-item :style='{"width":"80%","padding":"0","margin":"0 auto 20px","height":"auto"}' prop="mima2">
            <el-input v-model="registerForm.mima2" type="password" placeholder="请再次输入密码" />
          </el-form-item>
          <el-form-item :style='{"width":"80%","padding":"0","margin":"0 auto 20px","height":"auto"}' prop="shejishixingming">
            <el-input v-model="registerForm.shejishixingming" placeholder="请输入设计师姓名" />
          </el-form-item>
          <el-form-item :style='{"width":"80%","padding":"0","margin":"0 auto 20px","height":"auto"}' prop="touxiang">
            <file-upload
              tip="点击上传头像"
              action="file/upload"
              :limit="1"
              :multiple="true"
              :fileUrls="registerForm.touxiang ? registerForm.touxiang : ''"
              @change="shejishitouxiangUploadChange"
            />
          </el-form-item>
          <el-form-item :style='{"width":"80%","padding":"0","margin":"0 auto 20px","height":"auto"}' prop="lianxifangshi">
            <el-input v-model="registerForm.lianxifangshi" placeholder="请输入联系方式" />
          </el-form-item>
          <el-form-item :style='{"width":"80%","padding":"0","margin":"0 auto 20px","height":"auto"}' prop="zhuanchang">
            <el-input v-model="registerForm.zhuanchang" placeholder="请输入擅长方向（可选）" />
          </el-form-item>
          <el-form-item :style='{"width":"80%","padding":"0","margin":"0 auto 20px","height":"auto"}' prop="jianjie">
            <el-input v-model="registerForm.jianjie" type="textarea" :rows="3" placeholder="请输入个人简介（可选）" />
          </el-form-item>
        </template>

        <el-button
          :style='{"border":"0","cursor":"pointer","padding":"0px","boxShadow":"0px 0px 0px #9cdde0","margin":"12px 16px 10px 240px","color":"#fff","display":"inline-block","outline":"none","borderRadius":"8px","background":"linear-gradient(320deg, rgba(48,134,185,1) 0%, rgba(197,230,250,1) 80%, rgba(48,134,185,1) 100%)","width":"128px","fontSize":"16px","height":"40px"}'
          type="primary"
          @click="submitForm('registerForm')"
        >注册</el-button>
        <el-button
          :style='{"border":"0px solid #bbb","cursor":"pointer","padding":"0px","boxShadow":"1px 2px 3px #ccc","margin":"12px auto 5px","color":"#333","display":"inline-block","outline":"none","borderRadius":"8px","background":"linear-gradient(320deg, rgba(204,204,204,1) 0%, rgba(255,255,255,1) 80%, rgba(204,204,204,1) 100%),#999","width":"128px","fontSize":"16px","height":"40px"}'
          @click="resetForm('registerForm')"
        >重置</el-button>
        <router-link :style='{"cursor":"pointer","padding":"0 10%","color":"#333","display":"inline-block","width":"100%","lineHeight":"1","fontSize":"12px","textDecoration":"none"}' to="/login">
          已有账户登录
        </router-link>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      pageFlag: '',
      tableName: '',
      registerForm: {
        xingbie: '',
        yonghuzhanghao: '',
        shejishizhanghao: '',
        mima: '',
        mima2: '',
        yonghuxingming: '',
        shejishixingming: '',
        touxiang: '',
        lianxifangshi: '',
        zhuanchang: '',
        jianjie: ''
      },
      rules: {},
      yonghuxingbieOptions: []
    }
  },
  created() {
    this.pageFlag = this.$route.query.pageFlag
    this.tableName = this.$route.query.role
    this.yonghuxingbieOptions = '男,女'.split(',')
    this.buildRules()
  },
  methods: {
    buildRules() {
      const baseRules = {
        mima: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        mima2: [{ required: true, message: '请再次输入密码', trigger: 'blur' }]
      }

      if (this.tableName === 'yonghu') {
        this.rules = {
          ...baseRules,
          yonghuzhanghao: [{ required: true, message: '请输入用户账号', trigger: 'blur' }],
          yonghuxingming: [{ required: true, message: '请输入用户姓名', trigger: 'blur' }],
          xingbie: [{ required: true, message: '请选择性别', trigger: 'change' }],
          lianxifangshi: [{ required: true, validator: this.$validate.isMobile, trigger: 'blur' }]
        }
        return
      }

      if (this.tableName === 'shejishi') {
        this.rules = {
          ...baseRules,
          shejishizhanghao: [{ required: true, message: '请输入设计师账号', trigger: 'blur' }],
          shejishixingming: [{ required: true, message: '请输入设计师姓名', trigger: 'blur' }],
          lianxifangshi: [{ required: true, validator: this.$validate.isMobile, trigger: 'blur' }]
        }
        return
      }

      this.rules = { ...baseRules }
    },
    yonghutouxiangUploadChange(fileUrls) {
      this.registerForm.touxiang = fileUrls.replace(new RegExp(this.$config.baseUrl, 'g'), '')
    },
    shejishitouxiangUploadChange(fileUrls) {
      this.registerForm.touxiang = fileUrls.replace(new RegExp(this.$config.baseUrl, 'g'), '')
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false
        }

        if (this.tableName !== 'yonghu' && this.tableName !== 'shejishi') {
          this.$message.error('不支持的注册角色')
          return false
        }

        const accountField = this.tableName === 'shejishi' ? 'shejishizhanghao' : 'yonghuzhanghao'
        const accountLabel = this.tableName === 'shejishi' ? '设计师账号' : '用户账号'
        const account = this.registerForm[accountField] || ''

        if (account.length < 3) {
          this.$message.error(`${accountLabel}长度不能小于3`)
          return false
        }
        if (account.length > 20) {
          this.$message.error(`${accountLabel}长度不能大于20`)
          return false
        }

        if (this.registerForm.mima !== this.registerForm.mima2) {
          this.$message.error('两次密码输入不一致')
          return false
        }
        if (this.registerForm.mima.length < 3) {
          this.$message.error('密码长度不能小于3')
          return false
        }
        if (this.registerForm.mima.length > 20) {
          this.$message.error('密码长度不能大于20')
          return false
        }

        const url = `${this.tableName}/register`
        this.$http.post(url, this.registerForm).then((res) => {
          if (res.data.code === 0) {
            this.$message({
              message: '注册成功',
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.$router.push('/login')
              }
            })
          } else {
            this.$message.error(res.data.msg)
          }
        })
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.container {
  position: relative;
  background: url(http://codegen.caihongy.cn/20221231/7a3226bd0dfc41549fbee764c9f6552d.jpg) no-repeat center top / 100% 100%;

  .el-date-editor.el-input {
    width: 100%;
  }

  .rgs-form .el-input ::v-deep .el-input__inner {
    border-radius: 0px;
    padding: 0 10px;
    box-shadow: 0px 0px 0px #a0d8db;
    outline: none;
    color: #999;
    background: #fff;
    width: 100%;
    font-size: 14px;
    border-color: #c4deee;
    border-width: 0 0 2px;
    border-style: dotted;
    height: 40px;
  }

  .rgs-form .el-select ::v-deep .el-input__inner {
    border: 0px solid #eacb96;
    padding: 0 10px;
    color: #999;
    font-size: 14px;
    border-color: #c4deee;
    border-radius: 0px;
    box-shadow: 0px 0px 0px #a0d8db;
    outline: none;
    background: #fff;
    width: 100%;
    border-width: 0 0 2px;
    border-style: dotted;
    height: 40px;
  }

  .rgs-form ::v-deep .el-upload--picture-card {
    background: transparent;
    border: 0;
    border-radius: 0;
    width: auto;
    height: auto;
    line-height: initial;
    vertical-align: middle;
  }

  .rgs-form ::v-deep .upload .upload-img {
    border: 2px dotted #c4deee;
    cursor: pointer;
    border-radius: 0px;
    color: #c4deee;
    background: #fff;
    width: 160px;
    font-size: 32px;
    line-height: 80px;
    text-align: center;
    height: 80px;
  }

  .rgs-form ::v-deep .el-upload-list .el-upload-list__item {
    border: 2px dotted #c4deee;
    cursor: pointer;
    border-radius: 0px;
    color: #c4deee;
    background: #fff;
    width: 160px;
    font-size: 32px;
    line-height: 80px;
    text-align: center;
    height: 80px;
  }

  .rgs-form ::v-deep .el-upload .el-icon-plus {
    border: 2px dotted #c4deee;
    cursor: pointer;
    border-radius: 0px;
    color: #c4deee;
    background: #fff;
    width: 160px;
    font-size: 32px;
    line-height: 80px;
    text-align: center;
    height: 80px;
  }
}
</style>