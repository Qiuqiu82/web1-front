<template>
  <div class="login-page">
    <div class="login-left">
      <div class="badge">定制工作台</div>
      <h1>欢迎来到次元定制平台</h1>
      <p>
        一个登录页支持三种角色：管理员协同、用户下单、设计师接单。
      </p>
      <ul>
        <li>热门款式按热度优先推荐</li>
        <li>订单状态全链路可追踪</li>
        <li>设计师接单池支持快速认领</li>
      </ul>
    </div>

    <div class="login-card">
      <h2>登录</h2>
      <p class="sub">请选择角色并输入账号密码</p>

      <el-form ref="loginForm" :model="loginForm" :rules="rules" label-position="top">
        <el-form-item label="账号" prop="username">
          <el-input
            v-model.trim="loginForm.username"
            placeholder="请输入账号"
            prefix-icon="el-icon-user"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model.trim="loginForm.password"
            type="password"
            show-password
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
          />
        </el-form-item>

        <el-form-item label="角色" prop="tableName">
          <el-radio-group v-model="loginForm.tableName">
            <el-radio-button v-for="item in roles" :key="item.tableName" :label="item.tableName">
              {{ item.roleName }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item class="btn-row">
          <el-button type="primary" :loading="submitting" @click="submitForm('loginForm')">登录</el-button>
          <el-button @click="resetForm('loginForm')">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="register-links">
        <router-link
          v-for="item in roles"
          :key="`register-${item.tableName}`"
          v-if="item.hasFrontRegister === '是'"
          :to="{ path: '/register', query: { role: item.tableName, pageFlag: 'register' } }"
        >
          注册{{ item.roleName }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roleMenus: [
        {
          roleName: '管理员',
          tableName: 'users',
          hasFrontLogin: '是',
          hasFrontRegister: '否'
        },
        {
          roleName: '用户',
          tableName: 'yonghu',
          hasFrontLogin: '是',
          hasFrontRegister: '是'
        },
        {
          roleName: '设计师',
          tableName: 'shejishi',
          hasFrontLogin: '是',
          hasFrontRegister: '是'
        }
      ],
      roles: [],
      submitting: false,
      role: '',
      loginForm: {
        username: '',
        password: '',
        tableName: ''
      },
      rules: {
        username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        tableName: [{ required: true, message: '请选择角色', trigger: 'change' }]
      }
    }
  },
  created() {
    this.roles = this.roleMenus.filter((item) => item.hasFrontLogin === '是')
    const roleFromQuery = this.$route.query.role
    if (roleFromQuery && this.roles.some((item) => item.tableName === roleFromQuery)) {
      this.loginForm.tableName = roleFromQuery
    } else if (this.roles.length) {
      this.loginForm.tableName = this.roles[0].tableName
    }
    this.role = this.currentRoleName(this.loginForm.tableName)
  },
  methods: {
    currentRoleName(tableName) {
      const target = this.roles.find((item) => item.tableName === tableName)
      return (target && target.roleName) || ''
    },
    submitForm(formName) {
      if (this.submitting) {
        return
      }
      this.role = this.currentRoleName(this.loginForm.tableName)
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false
        }

        const loginApi = `${this.loginForm.tableName}/login`
        const isAdminLogin = this.loginForm.tableName === 'users'
        this.submitting = true
        const loginRequest = isAdminLogin
          ? this.$http.post(loginApi, null, { params: this.loginForm })
          : this.$http.get(loginApi, { params: this.loginForm })

        loginRequest
          .then((res) => {
            if (res.data.code !== 0) {
              this.$message.error(res.data.msg || '登录失败')
              return
            }
            const token = res.data.token
            localStorage.setItem('Token', token)
            localStorage.setItem('UserTableName', this.loginForm.tableName)
            localStorage.setItem('sessionTable', this.loginForm.tableName)
            localStorage.setItem('username', this.loginForm.username)
            localStorage.setItem('adminName', this.loginForm.username)
            localStorage.setItem('role', this.role)
            if (this.$http && this.$http.headers && this.$http.headers.common) {
              this.$http.headers.common.Token = token
            }

            const targetRouteMap = {
              users: '/index/cosorder-admin',
              shejishi: '/index/cosorder-designer',
              yonghu: '/index/home'
            }
            const targetRoute = targetRouteMap[this.loginForm.tableName] || '/index/home'

            return this.$http
              .get(`${this.loginForm.tableName}/session`, {
                headers: { Token: token }
              })
              .then((sessionRes) => {
                const curr = (sessionRes.data && sessionRes.data.data) || {}
                const uid = curr.id || curr.userid || curr.userId
                if (uid) {
                  localStorage.setItem('userid', String(uid))
                  localStorage.setItem('userId', String(uid))
                }
              })
              .catch(() => {
                this.$message.warning('登录成功，但会话信息读取失败')
              })
              .then(() => {
                this.$router.push(targetRoute)
                this.$message.success('登录成功')
              })
          })
          .catch(() => {
            this.$message.error('登录请求失败，请检查后端服务')
          })
          .finally(() => {
            this.submitting = false
          })
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
      if (this.roles.length) {
        this.loginForm.tableName = this.roles[0].tableName
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  padding: 24px;
  background: radial-gradient(circle at 8% 12%, #9fb5ff 0, #f0f4ff 34%, #f5f7fc 100%);
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 20px;
  align-items: center;
}

.login-left {
  border-radius: 24px;
  padding: 34px;
  color: #fff;
  background: linear-gradient(145deg, #243a7a 0%, #3550a9 45%, #5670ca 100%);
  box-shadow: 0 22px 38px rgba(52, 74, 140, 0.34);
}

.badge {
  display: inline-block;
  font-size: 12px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 999px;
  padding: 4px 10px;
}

.login-left h1 {
  margin-top: 18px;
  font-size: 38px;
  line-height: 1.3;
}

.login-left p {
  margin-top: 16px;
  line-height: 1.8;
  color: rgba(235, 242, 255, 0.96);
}

.login-left ul {
  margin-top: 18px;
  padding-left: 20px;
  display: grid;
  gap: 8px;
  color: rgba(238, 244, 255, 0.95);
}

.login-card {
  border-radius: 22px;
  border: 1px solid #e8edff;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  padding: 28px;
  box-shadow: 0 20px 40px rgba(89, 109, 173, 0.2);
}

.login-card h2 {
  font-size: 30px;
  color: #283972;
}

.sub {
  margin-top: 8px;
  color: #8892b3;
}

.btn-row {
  margin-top: 8px;
}

.btn-row .el-button {
  min-width: 110px;
}

.register-links {
  margin-top: 10px;
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.register-links a {
  color: #4052a0;
  text-decoration: none;
  font-weight: 600;
}

.register-links a:hover {
  color: #2d3f86;
}

@media (max-width: 980px) {
  .login-page {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .login-left {
    padding: 24px;
  }

  .login-left h1 {
    font-size: 30px;
  }
}
</style>