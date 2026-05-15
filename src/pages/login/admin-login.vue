<template>
  <div class="admin-auth-page">
    <div class="bg-orb orb-left"></div>
    <div class="bg-orb orb-right"></div>

    <section class="admin-auth-stage">
      <header class="stage-top">
        <router-link class="brand" to="/index/home">
          <div class="brand-mark">衣</div>
          <div class="brand-copy">
            <strong>次元定制平台</strong>
            <span>ADMIN AUTH PORTAL</span>
          </div>
        </router-link>
        <router-link class="stage-home-link" to="/index/home">返回首页</router-link>
      </header>

      <div class="stage-copy">
        <span class="auth-kicker">AUTH ACCESS</span>
        <h1>管理员后台登录</h1>
        <p>
          统一使用和前台、设计师工作台一致的品牌界面语言。登录后可进入后台总览、权限管理、
          素材维护与订单协同模块。
        </p>
      </div>

      <div class="stage-panels">
        <article class="info-panel overview-panel">
          <span class="panel-eyebrow">ROLE</span>
          <strong>管理员入口仅面向后台运营账号</strong>
          <p>普通用户与设计师请继续使用首页登录弹窗或对应工作台入口，避免混用账号体系。</p>
        </article>

        <div class="capability-grid">
          <article class="capability-card" v-for="item in showcaseCards" :key="item.title">
            <span class="capability-icon">{{ item.icon }}</span>
            <strong>{{ item.title }}</strong>
            <p>{{ item.desc }}</p>
          </article>
        </div>

        <article class="info-panel entry-panel">
          <div class="entry-copy">
            <span class="panel-eyebrow">OTHER ENTRY</span>
            <strong>其他身份入口</strong>
          </div>
          <div class="entry-links">
            <router-link to="/login">用户登录</router-link>
            <router-link :to="{ path: '/login', query: { role: 'shejishi' } }">设计师登录</router-link>
          </div>
        </article>
      </div>
    </section>

    <section class="admin-auth-card">
      <div class="card-head">
        <span class="panel-label">Back Office</span>
        <span class="status-chip">
          <i class="el-icon-lock"></i>
          <span>安全认证</span>
        </span>
      </div>

      <div class="card-title">
        <h2>欢迎回来</h2>
        <p>请输入管理员账号和密码，验证通过后进入后台首页。</p>
      </div>

      <div class="admin-role-banner">
        <div>
          <span class="panel-eyebrow">ACCOUNT TYPE</span>
          <strong>管理员账号</strong>
        </div>
        <small>支持后台总览、角色权限、素材与订单管理</small>
      </div>

      <el-form ref="loginForm" :model="loginForm" :rules="rules" label-position="top" class="auth-form">
        <el-form-item label="管理员账号" prop="username">
          <el-input
            v-model.trim="loginForm.username"
            prefix-icon="el-icon-user"
            placeholder="请输入管理员账号"
            autocomplete="username"
          />
        </el-form-item>

        <el-form-item label="登录密码" prop="password">
          <el-input
            v-model.trim="loginForm.password"
            type="password"
            show-password
            prefix-icon="el-icon-lock"
            placeholder="请输入登录密码"
            autocomplete="current-password"
            @keyup.enter.native="submitForm('loginForm')"
          />
        </el-form-item>

        <div class="helper-row">
          <span>若登录失败，请先确认后端服务和管理员账号状态。</span>
          <router-link to="/index/home">回到首页</router-link>
        </div>

        <el-button class="primary-action" type="primary" :loading="submitting" @click="submitForm('loginForm')">
          登录后台
        </el-button>
        <el-button class="secondary-action" @click="resetForm('loginForm')">重置</el-button>
      </el-form>
    </section>
  </div>
</template>

<script>
export default {
  name: 'AdminLogin',
  data() {
    return {
      submitting: false,
      showcaseCards: [
        { icon: '览', title: '数据总览', desc: '统一查看平台指标、订单履约状态与近期开单趋势。' },
        { icon: '材', title: '内容维护', desc: '维护素材、服装数据与前台展示内容，保持信息一致。' },
        { icon: '权', title: '权限管理', desc: '集中处理管理员、用户和设计师的角色边界与访问范围。' }
      ],
      loginForm: {
        username: '',
        password: ''
      },
      rules: {
        username: [{ required: true, message: '请输入管理员账号', trigger: 'blur' }],
        password: [{ required: true, message: '请输入登录密码', trigger: 'blur' }]
      }
    }
  },
  created() {
    const token = localStorage.getItem('Token') || ''
    const tableName = localStorage.getItem('sessionTable') || localStorage.getItem('UserTableName') || ''
    if (token && tableName === 'users') {
      this.$router.replace('/admin/dashboard')
    }
  },
  methods: {
    submitForm(formName) {
      if (this.submitting) {
        return
      }
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false
        }
        this.submitting = true
        this.$http
          .post('users/login', null, {
            params: {
              ...this.loginForm,
              tableName: 'users'
            }
          })
          .then((res) => {
            if (res.data.code !== 0) {
              this.$message.error(res.data.msg || '登录失败')
              return
            }
            const token = res.data.token
            localStorage.setItem('Token', token)
            localStorage.setItem('UserTableName', 'users')
            localStorage.setItem('sessionTable', 'users')
            localStorage.setItem('username', this.loginForm.username)
            localStorage.setItem('adminName', this.loginForm.username)
            localStorage.setItem('role', '管理员')
            if (this.$http && this.$http.headers && this.$http.headers.common) {
              this.$http.headers.common.Token = token
            }

            return this.$http
              .get('users/session', {
                headers: { Token: token }
              })
              .then((sessionRes) => {
                const current = (sessionRes.data && sessionRes.data.data) || {}
                const userId = current.id || current.userid || current.userId
                if (userId) {
                  localStorage.setItem('userid', String(userId))
                  localStorage.setItem('userId', String(userId))
                }
              })
              .catch(() => {
                this.$message.warning('登录成功，但会话信息读取失败')
              })
              .then(() => {
                this.$message.success('管理员登录成功')
                this.$router.replace('/admin/dashboard')
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
    }
  }
}
</script>

<style scoped>
.admin-auth-page {
  --accent: #5a67f8;
  --accent-soft: #7d8fff;
  min-height: 100vh;
  padding: 24px;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(380px, 460px);
  gap: 24px;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #f4f8ff 0%, #f8f7fc 42%, #f3f5fb 100%);
}

.bg-orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(2px);
  opacity: 0.56;
  pointer-events: none;
}

.orb-left {
  width: 320px;
  height: 320px;
  top: -76px;
  left: -80px;
  background: radial-gradient(circle at center, rgba(129, 158, 255, 0.4), rgba(129, 158, 255, 0));
}

.orb-right {
  width: 420px;
  height: 420px;
  top: -120px;
  right: -140px;
  background: radial-gradient(circle at center, rgba(255, 182, 146, 0.35), rgba(255, 182, 146, 0));
}

.admin-auth-stage,
.admin-auth-card {
  position: relative;
  z-index: 1;
}

.admin-auth-stage {
  padding: 18px;
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.68);
  box-shadow: 0 20px 56px rgba(66, 89, 145, 0.12);
  backdrop-filter: blur(14px);
}

.stage-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(140deg, var(--accent) 0%, var(--accent-soft) 65%, #9ba8ff 100%);
  box-shadow: 0 10px 24px rgba(82, 100, 255, 0.28);
  color: #fff;
  font-size: 22px;
  font-weight: 700;
}

.brand-copy strong,
.brand-copy span {
  display: block;
}

.brand-copy strong {
  color: #1f2b59;
  font-size: 18px;
}

.brand-copy span {
  margin-top: 2px;
  color: #8290b8;
  font-size: 11px;
  letter-spacing: 0.14em;
}

.stage-home-link {
  color: #5a66a0;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}

.stage-copy {
  margin-top: 34px;
}

.auth-kicker,
.panel-label,
.panel-eyebrow {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(90, 103, 248, 0.1);
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.stage-copy h1 {
  margin: 14px 0 12px;
  color: #1f2937;
  font-size: 48px;
  line-height: 1.06;
}

.stage-copy p {
  max-width: 640px;
  margin: 0;
  color: #6b7280;
  line-height: 1.85;
  font-size: 15px;
}

.stage-panels {
  margin-top: 26px;
  display: grid;
  gap: 16px;
}

.info-panel,
.capability-card,
.admin-role-banner {
  border-radius: 24px;
  border: 1px solid #e8ecf8;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, #f9fbff 100%);
  box-shadow: 0 12px 30px rgba(148, 163, 184, 0.12);
}

.info-panel {
  padding: 20px 22px;
}

.info-panel strong,
.info-panel p {
  display: block;
}

.info-panel strong {
  margin-top: 12px;
  color: #1f2937;
  font-size: 19px;
}

.info-panel p {
  margin: 10px 0 0;
  color: #6b7280;
  line-height: 1.75;
}

.capability-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.capability-card {
  padding: 20px;
}

.capability-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(90, 103, 248, 0.12), rgba(125, 143, 255, 0.22));
  color: #4455d4;
  font-size: 18px;
  font-weight: 700;
}

.capability-card strong,
.capability-card p {
  display: block;
}

.capability-card strong {
  margin-top: 16px;
  color: #1f2937;
  font-size: 16px;
}

.capability-card p {
  margin: 8px 0 0;
  color: #7b8292;
  line-height: 1.7;
  font-size: 13px;
}

.entry-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.entry-copy strong {
  display: block;
  margin-top: 10px;
  color: #1f2937;
  font-size: 18px;
}

.entry-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.entry-links a {
  padding: 10px 16px;
  border-radius: 14px;
  border: 1px solid #dce3f7;
  background: #fff;
  color: #3d4b80;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
}

.admin-auth-card {
  border-radius: 30px;
  padding: 30px;
  background:
    radial-gradient(circle at top left, rgba(121, 134, 255, 0.14), transparent 34%),
    linear-gradient(180deg, #ffffff 0%, #fcfbff 100%);
  border: 1px solid rgba(255, 255, 255, 0.92);
  box-shadow: 0 30px 90px rgba(31, 41, 55, 0.16);
}

.card-head,
.status-chip,
.helper-row {
  display: flex;
  align-items: center;
}

.card-head {
  justify-content: space-between;
  gap: 12px;
}

.status-chip {
  gap: 6px;
  padding: 8px 12px;
  border-radius: 999px;
  background: #f4f7ff;
  color: #53639d;
  font-size: 13px;
  font-weight: 600;
}

.card-title {
  margin-top: 20px;
}

.card-title h2 {
  margin: 0;
  color: #1f2937;
  font-size: 36px;
  line-height: 1.08;
}

.card-title p {
  margin: 12px 0 0;
  color: #6b7280;
  line-height: 1.8;
}

.admin-role-banner {
  margin-top: 22px;
  padding: 18px 20px;
  display: grid;
  gap: 10px;
}

.admin-role-banner strong,
.admin-role-banner small {
  display: block;
}

.admin-role-banner strong {
  margin-top: 10px;
  color: #1f2937;
  font-size: 18px;
}

.admin-role-banner small {
  color: #7b8292;
  line-height: 1.6;
}

.auth-form {
  margin-top: 24px;
}

.helper-row {
  justify-content: space-between;
  gap: 12px;
  margin: 6px 0 18px;
  color: #7b8292;
  font-size: 13px;
}

.helper-row a {
  color: #6b61ff;
  text-decoration: none;
  font-weight: 600;
}

.primary-action,
.secondary-action {
  width: 100%;
}

.primary-action {
  height: 50px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(90deg, var(--accent) 0%, var(--accent-soft) 100%);
  box-shadow: 0 16px 28px rgba(128, 90, 213, 0.25);
}

.secondary-action {
  margin-top: 12px;
  height: 48px;
  border-radius: 16px;
  border-color: #dbe2f3;
  color: #4b587f;
  background: #fff;
}

.admin-auth-card ::v-deep .el-form-item {
  margin-bottom: 18px;
}

.admin-auth-card ::v-deep .el-form-item__label {
  padding-bottom: 8px;
  color: #374151;
  font-weight: 700;
}

.admin-auth-card ::v-deep .el-input__inner {
  height: 50px;
  border-radius: 16px;
  border-color: #dde3ee;
  background: #fbfbfe;
  color: #1f2937;
}

.admin-auth-card ::v-deep .el-input__inner:focus {
  border-color: #8070ff;
  box-shadow: 0 0 0 4px rgba(128, 112, 255, 0.12);
  background: #fff;
}

.admin-auth-card ::v-deep .el-button--primary:hover,
.admin-auth-card ::v-deep .el-button--primary:focus {
  background: linear-gradient(90deg, var(--accent) 0%, var(--accent-soft) 100%);
  opacity: 0.96;
}

@media (max-width: 1080px) {
  .admin-auth-page {
    grid-template-columns: 1fr;
    padding: 18px;
  }

  .stage-copy h1 {
    font-size: 40px;
  }

  .capability-grid {
    grid-template-columns: 1fr;
  }

  .entry-panel {
    display: grid;
  }
}

@media (max-width: 640px) {
  .admin-auth-page {
    padding: 14px;
  }

  .admin-auth-stage,
  .admin-auth-card {
    padding: 22px;
    border-radius: 24px;
  }

  .stage-top,
  .entry-panel,
  .helper-row,
  .card-head {
    display: grid;
  }

  .stage-copy h1 {
    font-size: 32px;
  }

  .brand-copy strong {
    font-size: 16px;
  }

  .card-title h2 {
    font-size: 30px;
  }
}
</style>
