<template>
  <div class="register-page">
    <div class="register-card">
      <div class="header">
        <h2>{{ pageTitle }}</h2>
        <p>Create an account, then sign in to the matching workspace.</p>
      </div>

      <el-form ref="registerForm" :model="registerForm" :rules="rules" label-position="top">
        <template v-if="tableName === 'yonghu'">
          <el-form-item label="User Account" prop="yonghuzhanghao">
            <el-input v-model.trim="registerForm.yonghuzhanghao" placeholder="Input user account" />
          </el-form-item>
          <el-form-item label="User Name" prop="yonghuxingming">
            <el-input v-model.trim="registerForm.yonghuxingming" placeholder="Input user name" />
          </el-form-item>
          <el-form-item label="Gender" prop="xingbie">
            <el-select v-model="registerForm.xingbie" placeholder="Select gender" style="width: 100%">
              <el-option v-for="item in yonghuxingbieOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="Designer Account" prop="shejishizhanghao">
            <el-input v-model.trim="registerForm.shejishizhanghao" placeholder="Input designer account" />
          </el-form-item>
          <el-form-item label="Designer Name" prop="shejishixingming">
            <el-input v-model.trim="registerForm.shejishixingming" placeholder="Input designer name" />
          </el-form-item>
          <el-form-item label="Specialty" prop="zhuanchang">
            <el-input v-model.trim="registerForm.zhuanchang" placeholder="Optional: armor / suit / dress" />
          </el-form-item>
          <el-form-item label="Profile" prop="jianjie">
            <el-input
              v-model="registerForm.jianjie"
              type="textarea"
              :rows="3"
              placeholder="Optional: short self introduction"
            />
          </el-form-item>
        </template>

        <el-form-item label="Password" prop="mima">
          <el-input v-model.trim="registerForm.mima" type="password" show-password placeholder="Input password" />
        </el-form-item>
        <el-form-item label="Confirm Password" prop="mima2">
          <el-input
            v-model.trim="registerForm.mima2"
            type="password"
            show-password
            placeholder="Input password again"
          />
        </el-form-item>
        <el-form-item label="Phone" prop="lianxifangshi">
          <el-input v-model.trim="registerForm.lianxifangshi" placeholder="Input phone number" />
        </el-form-item>

        <el-form-item label="Avatar" prop="touxiang">
          <file-upload
            tip="Upload avatar"
            action="file/upload"
            :limit="1"
            :multiple="true"
            :fileUrls="registerForm.touxiang || ''"
            @change="handleAvatarChange"
          />
        </el-form-item>

        <div class="btn-row">
          <el-button type="primary" :loading="submitting" @click="submitForm('registerForm')">Register</el-button>
          <el-button @click="resetForm('registerForm')">Reset</el-button>
          <el-button type="text" @click="$router.push('/login')">Already have an account?</el-button>
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
      yonghuxingbieOptions: ['Male', 'Female'],
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
      return this.tableName === 'shejishi' ? 'Designer Register' : 'User Register'
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
          { required: true, message: 'Please input password', trigger: 'blur' },
          { min: 3, max: 20, message: 'Password length: 3-20', trigger: 'blur' }
        ],
        mima2: [{ required: true, message: 'Please input confirm password', trigger: 'blur' }],
        lianxifangshi: [
          { required: true, message: 'Please input phone', trigger: 'blur' },
          { pattern: /^1\d{10}$/, message: 'Please input valid phone', trigger: 'blur' }
        ]
      }

      if (this.tableName === 'shejishi') {
        this.rules = {
          ...baseRules,
          shejishizhanghao: [
            { required: true, message: 'Please input designer account', trigger: 'blur' },
            { min: 3, max: 20, message: 'Account length: 3-20', trigger: 'blur' }
          ],
          shejishixingming: [{ required: true, message: 'Please input designer name', trigger: 'blur' }]
        }
        return
      }

      this.rules = {
        ...baseRules,
        yonghuzhanghao: [
          { required: true, message: 'Please input user account', trigger: 'blur' },
          { min: 3, max: 20, message: 'Account length: 3-20', trigger: 'blur' }
        ],
        yonghuxingming: [{ required: true, message: 'Please input user name', trigger: 'blur' }],
        xingbie: [{ required: true, message: 'Please select gender', trigger: 'change' }]
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
          this.$message.error('Passwords do not match')
          return false
        }

        this.submitting = true
        const url = `${this.tableName}/register`
        const payload = this.buildPayload()
        this.$http
          .post(url, payload)
          .then((res) => {
            if (res.data.code === 0) {
              this.$message.success('Register success, please login')
              this.$router.push({ path: '/login', query: { role: this.tableName } })
            } else {
              this.$message.error(res.data.msg || 'Register failed')
            }
          })
          .catch(() => {
            this.$message.error('Register request failed, please check backend')
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