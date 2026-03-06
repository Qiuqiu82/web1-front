<template>
  <div class="register-page">
    <div class="register-card">
      <div class="header">
        <h2>{{ pageTitle }}</h2>
        <p>注册后即可进入对应端口进行使用。</p>
      </div>

      <el-form ref="registerForm" :model="registerForm" :rules="rules" label-position="top">
        <template v-if="tableName === 'yonghu'">
          <el-form-item label="用户账号" prop="yonghuzhanghao">
            <el-input v-model.trim="registerForm.yonghuzhanghao" placeholder="请输入用户账号" />
          </el-form-item>
          <el-form-item label="用户姓名" prop="yonghuxingming">
            <el-input v-model.trim="registerForm.yonghuxingming" placeholder="请输入用户姓名" />
          </el-form-item>
          <el-form-item label="性别" prop="xingbie">
            <el-select v-model="registerForm.xingbie" placeholder="请选择性别" style="width: 100%">
              <el-option v-for="item in yonghuxingbieOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="设计师账号" prop="shejishizhanghao">
            <el-input v-model.trim="registerForm.shejishizhanghao" placeholder="请输入设计师账号" />
          </el-form-item>
          <el-form-item label="设计师姓名" prop="shejishixingming">
            <el-input v-model.trim="registerForm.shejishixingming" placeholder="请输入设计师姓名" />
          </el-form-item>
          <el-form-item label="擅长方向" prop="zhuanchang">
            <el-input v-model.trim="registerForm.zhuanchang" placeholder="可选：盔甲 / 制服 / 礼服" />
          </el-form-item>
          <el-form-item label="个人简介" prop="jianjie">
            <el-input
              v-model="registerForm.jianjie"
              type="textarea"
              :rows="3"
              placeholder="可选：简要介绍设计经验"
            />
          </el-form-item>
        </template>

        <el-form-item label="密码" prop="mima">
          <el-input v-model.trim="registerForm.mima" type="password" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="mima2">
          <el-input
            v-model.trim="registerForm.mima2"
            type="password"
            show-password
            placeholder="请再次输入密码"
          />
        </el-form-item>
        <el-form-item label="联系电话" prop="lianxifangshi">
          <el-input v-model.trim="registerForm.lianxifangshi" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="头像" prop="touxiang">
          <file-upload
            tip="上传头像"
            action="file/upload"
            :limit="1"
            :multiple="true"
            :fileUrls="registerForm.touxiang || ''"
            @change="handleAvatarChange"
          />
        </el-form-item>

        <div class="btn-row">
          <el-button type="primary" :loading="submitting" @click="submitForm('registerForm')">注册</el-button>
          <el-button @click="resetForm('registerForm')">重置</el-button>
          <el-button type="text" @click="$router.push('/login')">已有账号，去登录</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tableName: 'yonghu',
      submitting: false,
      yonghuxingbieOptions: ['男', '女'],
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
      rules: {}
    }
  },
  computed: {
    pageTitle() {
      return this.tableName === 'shejishi' ? '设计师注册' : '用户注册'
    }
  },
  created() {
    const role = this.$route.query.role
    this.tableName = role === 'shejishi' ? 'shejishi' : 'yonghu'
    this.buildRules()
  },
  methods: {
    buildRules() {
      const baseRules = {
        mima: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 20, message: '密码长度为 3-20 位', trigger: 'blur' }
        ],
        mima2: [{ required: true, message: '请再次输入密码', trigger: 'blur' }],
        lianxifangshi: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1\d{10}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ]
      }

      if (this.tableName === 'shejishi') {
        this.rules = {
          ...baseRules,
          shejishizhanghao: [
            { required: true, message: '请输入设计师账号', trigger: 'blur' },
            { min: 3, max: 20, message: '账号长度为 3-20 位', trigger: 'blur' }
          ],
          shejishixingming: [{ required: true, message: '请输入设计师姓名', trigger: 'blur' }]
        }
        return
      }

      this.rules = {
        ...baseRules,
        yonghuzhanghao: [
          { required: true, message: '请输入用户账号', trigger: 'blur' },
          { min: 3, max: 20, message: '账号长度为 3-20 位', trigger: 'blur' }
        ],
        yonghuxingming: [{ required: true, message: '请输入用户姓名', trigger: 'blur' }],
        xingbie: [{ required: true, message: '请选择性别', trigger: 'change' }]
      }
    },
    handleAvatarChange(fileUrls) {
      this.registerForm.touxiang = fileUrls.replace(new RegExp(this.$config.baseUrl, 'g'), '')
    },
    buildPayload() {
      const basePayload = {
        mima: this.registerForm.mima,
        touxiang: this.registerForm.touxiang,
        lianxifangshi: this.registerForm.lianxifangshi
      }
      if (this.tableName === 'shejishi') {
        return {
          ...basePayload,
          shejishizhanghao: this.registerForm.shejishizhanghao,
          shejishixingming: this.registerForm.shejishixingming,
          zhuanchang: this.registerForm.zhuanchang,
          jianjie: this.registerForm.jianjie
        }
      }
      return {
        ...basePayload,
        yonghuzhanghao: this.registerForm.yonghuzhanghao,
        yonghuxingming: this.registerForm.yonghuxingming,
        xingbie: this.registerForm.xingbie
      }
    },
    submitForm(formName) {
      if (this.submitting) {
        return
      }
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false
        }
        if (this.registerForm.mima !== this.registerForm.mima2) {
          this.$message.error('两次输入的密码不一致')
          return false
        }

        this.submitting = true
        const url = `${this.tableName}/register`
        const payload = this.buildPayload()
        this.$http
          .post(url, payload)
          .then((res) => {
            if (res.data.code === 0) {
              this.$message.success('注册成功，请登录')
              this.$router.push({ path: '/login', query: { role: this.tableName } })
            } else {
              this.$message.error(res.data.msg || '注册失败')
            }
          })
          .catch(() => {
            this.$message.error('注册请求失败，请检查后端服务')
          })
          .finally(() => {
            this.submitting = false
          })
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: radial-gradient(circle at 15% 18%, #a8b7ff 0, #edf2ff 36%, #f6f7fc 100%);
  display: grid;
  place-items: center;
  padding: 20px;
}

.register-card {
  width: min(760px, 100%);
  border-radius: 22px;
  border: 1px solid #e8edff;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(6px);
  padding: 26px;
  box-shadow: 0 18px 40px rgba(84, 104, 168, 0.22);
}

.header h2 {
  font-size: 30px;
  color: #283973;
}

.header p {
  margin-top: 6px;
  color: #8a94b6;
}

.btn-row {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-row .el-button:first-child {
  min-width: 120px;
}

.register-card ::v-deep .upload .upload-img,
.register-card ::v-deep .el-upload-list .el-upload-list__item,
.register-card ::v-deep .el-upload .el-icon-plus {
  width: 132px;
  height: 132px;
  line-height: 132px;
  border-radius: 12px;
  border: 1px dashed #d3dbff;
  background: #f8faff;
}
</style>