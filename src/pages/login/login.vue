<template>
  <div class="login-page auth-page">
    <div class="page-orb orb-one"></div>
    <div class="page-orb orb-two"></div>
    <div class="page-grid"></div>

    <section class="showcase-panel">
      <div class="showcase-top">
        <span class="showcase-tag">ATELIER ACCESS</span>
        <span class="showcase-tag muted">高级定制工作台</span>
      </div>

      <div class="showcase-copy">
        <p class="showcase-kicker">COSPLAY · TAILORING · COLLAB</p>
        <h1>进入你的定制工坊控制台</h1>
        <p class="showcase-desc">
一个入口，连接用户下单中心与设计师工作区。前台登录保持轻量，后台管理员则使用独立入口。
        </p>
      </div>

      <div class="metric-list">
        <article v-for="item in heroStats" :key="item.label" class="metric-card">
          <strong>{{ item.value }}</strong>
          <span>{{ item.label }}</span>
        </article>
      </div>

      <div class="focus-card">
        <div class="focus-head">
          <span>当前入口</span>
          <strong>{{ activeRole.title }}</strong>
        </div>
        <p>{{ activeRole.description }}</p>
        <ul>
          <li v-for="item in activeRole.highlights" :key="item">{{ item }}</li>
        </ul>
      </div>
    </section>

    <section class="login-card">
      <div class="card-top">
        <span class="panel-label">Sign In</span>
        <router-link class="home-link" to="/index/home">返回首页</router-link>
      </div>

      <h2>欢迎登录</h2>
      <p class="sub">先选择身份，再输入账号与密码。系统会自动进入对应的工作区域。</p>

      <div class="role-pills">
        <button
          v-for="item in roles"
          :key="item.tableName"
          type="button"
          class="role-pill"
          :class="{ active: loginForm.tableName === item.tableName }"
          @click="loginForm.tableName = item.tableName"
        >
          <span class="role-name">{{ item.roleName }}</span>
          <span class="role-desc">{{ item.shortDesc }}</span>
        </button>
      </div>

      <el-form ref="loginForm" :model="loginForm" :rules="rules" label-position="top" class="auth-form">
        <el-form-item label="账号" prop="username">
          <el-input
            v-model.trim="loginForm.username"
            placeholder="请输入账号"
            prefix-icon="el-icon-user"
            autocomplete="username"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model.trim="loginForm.password"
            type="password"
            show-password
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            autocomplete="current-password"
          />
        </el-form-item>

        <el-form-item class="btn-row">
          <el-button type="primary" :loading="submitting" @click="submitForm('loginForm')">立即登录</el-button>
          <el-button @click="resetForm('loginForm')">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="card-footer">
        <span>还没有账号？</span>
        <router-link
          v-for="item in registerRoles"
          :key="`register-${item.tableName}`"
          :to="{ path: '/register', query: { role: item.tableName, pageFlag: 'register' } }"
        >
          注册{{ item.roleName }}
        </router-link>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  data() {
    return {
      heroStats: [
        { label: '前台身份入口', value: '2 类' },
        { label: '订单协作链路', value: '全流程' },
        { label: '定制体验氛围', value: '高级感' }
      ],
      roleMenus: [

        {
          roleName: '用户',
          tableName: 'yonghu',
          hasFrontLogin: '是',
          hasFrontRegister: '是',
          shortDesc: '预约下单',
          title: '用户中心',
          description: '快速查看热卖款式、提交预约订单，并持续跟踪定制进度。',
          highlights: ['浏览热门款式', '一键提交预约', '追踪订单进度']
        },
        {
          roleName: '设计师',
          tableName: 'shejishi',
          hasFrontLogin: '是',
          hasFrontRegister: '是',
          shortDesc: '接单创作',
          title: '设计师工作台',
          description: '集中处理接单、展示专长方向，并与客户保持更高效的协作。',
          highlights: ['管理接单任务', '展示擅长风格', '沉淀个人作品力']
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
        tableName: [{ required: true, message: '请选择身份', trigger: 'change' }]
      }
    }
  },
  computed: {
    registerRoles() {
      return this.roles.filter((item) => item.hasFrontRegister === '是')
    },
    activeRole() {
      return (
        this.roles.find((item) => item.tableName === this.loginForm.tableName) || {
          title: '工作台',
          description: '请选择身份后继续登录。',
          highlights: []
        }
      )
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
              users: '/admin/dashboard',
              shejishi: '/designer/workbench',
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
.auth-page {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.login-page {
  --ink: #16183b;
  --muted: #687192;
  --gold: #d5b37a;
  min-height: 100vh;
  padding: 32px;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(420px, 0.85fr);
  gap: 28px;
  align-items: stretch;
  background:
    radial-gradient(circle at top left, rgba(186, 203, 255, 0.95), transparent 32%),
    radial-gradient(circle at 88% 14%, rgba(255, 221, 173, 0.32), transparent 18%),
    linear-gradient(135deg, #f7f3ec 0%, #eef2ff 48%, #edf4ff 100%);
}

.page-grid,
.page-orb {
  position: absolute;
  pointer-events: none;
}

.page-grid {
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, 0.22) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.18) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.42), transparent 88%);
  opacity: 0.35;
}

.page-orb {
  border-radius: 50%;
  filter: blur(12px);
  opacity: 0.8;
  z-index: 0;
}

.orb-one {
  width: 280px;
  height: 280px;
  top: -80px;
  right: -40px;
  background: radial-gradient(circle, rgba(255, 216, 150, 0.9) 0%, rgba(255, 216, 150, 0) 70%);
}

.orb-two {
  width: 360px;
  height: 360px;
  left: -120px;
  bottom: -120px;
  background: radial-gradient(circle, rgba(120, 140, 255, 0.34) 0%, rgba(120, 140, 255, 0) 72%);
}

.showcase-panel,
.login-card {
  position: relative;
  z-index: 1;
}

.showcase-panel {
  padding: 42px;
  border-radius: 32px;
  color: #f9f7f2;
  background:
    linear-gradient(160deg, rgba(7, 16, 47, 0.96) 0%, rgba(25, 39, 88, 0.96) 55%, rgba(69, 91, 170, 0.92) 100%);
  box-shadow: 0 32px 70px rgba(21, 31, 74, 0.28);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 32px;
}

.showcase-top {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.showcase-tag {
  display: inline-flex;
  align-items: center;
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.26);
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 250, 240, 0.96);
  font-size: 12px;
  letter-spacing: 0.22em;
}

.showcase-tag.muted {
  color: rgba(224, 230, 255, 0.82);
}

.showcase-kicker {
  margin: 0;
  color: rgba(213, 179, 122, 0.96);
  letter-spacing: 0.28em;
  font-size: 12px;
}

.showcase-copy h1 {
  margin: 18px 0 0;
  max-width: 560px;
  font-size: 52px;
  line-height: 1.1;
  font-family: 'Georgia', 'Times New Roman', 'STSong', serif;
  font-weight: 700;
}

.showcase-desc {
  margin: 18px 0 0;
  max-width: 560px;
  line-height: 1.85;
  color: rgba(237, 241, 255, 0.86);
  font-size: 15px;
}

.metric-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.metric-card {
  padding: 18px 18px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
}

.metric-card strong {
  display: block;
  font-size: 28px;
  line-height: 1;
  color: #fff8ea;
}

.metric-card span {
  display: block;
  margin-top: 10px;
  color: rgba(229, 235, 255, 0.8);
  font-size: 13px;
}

.focus-card {
  padding: 24px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 247, 231, 0.14) 0%, rgba(255, 255, 255, 0.06) 100%);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.focus-head {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
}

.focus-head span {
  color: rgba(223, 230, 255, 0.8);
  font-size: 13px;
}

.focus-head strong {
  color: #fff7e7;
  font-size: 18px;
}

.focus-card p {
  margin: 14px 0 0;
  color: rgba(238, 242, 255, 0.84);
  line-height: 1.8;
}

.focus-card ul {
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}

.focus-card li {
  position: relative;
  padding-left: 18px;
  color: rgba(247, 249, 255, 0.92);
}

.focus-card li::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--gold);
  box-shadow: 0 0 0 6px rgba(213, 179, 122, 0.12);
}

.login-card {
  align-self: center;
  border-radius: 30px;
  padding: 32px;
  background: rgba(255, 252, 246, 0.86);
  border: 1px solid rgba(255, 255, 255, 0.72);
  box-shadow: 0 28px 60px rgba(44, 53, 103, 0.16);
  backdrop-filter: blur(18px);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.panel-label {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(31, 45, 98, 0.08);
  color: #3b4674;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.home-link {
  color: #59658d;
  text-decoration: none;
  font-size: 13px;
}

.home-link:hover {
  color: #1d2a58;
}

.login-card h2 {
  margin: 18px 0 0;
  color: var(--ink);
  font-size: 34px;
  font-family: 'Georgia', 'Times New Roman', 'STSong', serif;
}

.sub {
  margin: 12px 0 0;
  color: #687192;
  line-height: 1.8;
}

.role-pills {
  margin-top: 24px;
  display: grid;
  gap: 12px;
}

.role-pill {
  width: 100%;
  border: 1px solid rgba(36, 47, 93, 0.1);
  border-radius: 20px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.role-pill:hover {
  transform: translateY(-1px);
  border-color: rgba(53, 74, 150, 0.28);
  box-shadow: 0 16px 28px rgba(54, 70, 133, 0.12);
}

.role-pill.active {
  background: linear-gradient(135deg, rgba(29, 42, 88, 0.96), rgba(74, 96, 180, 0.92));
  border-color: transparent;
  box-shadow: 0 18px 34px rgba(41, 58, 118, 0.18);
}

.role-name,
.role-desc {
  display: block;
}

.role-name {
  font-size: 16px;
  font-weight: 700;
  color: #22305f;
}

.role-desc {
  color: #7a839e;
  font-size: 13px;
}

.role-pill.active .role-name,
.role-pill.active .role-desc {
  color: #fffaf0;
}

.auth-form {
  margin-top: 22px;
}

.btn-row {
  margin-top: 10px;
}

.btn-row ::v-deep .el-form-item__content {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.btn-row .el-button {
  min-width: 128px;
}

.card-footer {
  margin-top: 22px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  color: #7b84a2;
  font-size: 14px;
}

.card-footer a {
  color: #1f3170;
  text-decoration: none;
  font-weight: 700;
}

.card-footer a:hover {
  color: #4f64b5;
}

.login-card ::v-deep .el-form-item__label {
  padding-bottom: 8px;
  color: #2a3769;
  font-weight: 600;
}

.login-card ::v-deep .el-input__inner {
  height: 48px;
  border-radius: 16px;
  border-color: rgba(36, 47, 93, 0.12);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.login-card ::v-deep .el-input__inner:focus {
  border-color: rgba(70, 94, 179, 0.6);
  box-shadow: 0 0 0 4px rgba(90, 112, 196, 0.1);
}

.login-card ::v-deep .el-button--primary {
  border: none;
  background: linear-gradient(135deg, #1f2d63 0%, #4660b5 100%);
  box-shadow: 0 14px 28px rgba(49, 65, 133, 0.22);
}

.login-card ::v-deep .el-button--default {
  border-color: rgba(36, 47, 93, 0.14);
  color: #304070;
}

@media (max-width: 1080px) {
  .login-page {
    grid-template-columns: 1fr;
    padding: 18px;
  }

  .showcase-panel {
    padding: 28px;
  }

  .showcase-copy h1 {
    font-size: 40px;
  }

  .metric-list {
    grid-template-columns: 1fr;
  }

  .login-card {
    align-self: stretch;
  }
}

@media (max-width: 640px) {
  .login-page {
    padding: 14px;
    gap: 16px;
  }

  .showcase-panel,
  .login-card {
    padding: 22px;
    border-radius: 24px;
  }

  .showcase-copy h1 {
    font-size: 32px;
  }

  .focus-head,
  .card-top,
  .role-pill {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-row .el-button {
    width: 100%;
  }

  .btn-row ::v-deep .el-form-item__content {
    display: block;
  }

  .btn-row ::v-deep .el-form-item__content .el-button + .el-button {
    margin-left: 0;
    margin-top: 12px;
  }
}
</style>

