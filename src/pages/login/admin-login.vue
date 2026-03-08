<template>
  <div class="admin-login-page">
    <div class="page-orb orb-one"></div>
    <div class="page-orb orb-two"></div>

    <section class="admin-showcase">
      <span class="showcase-tag">ADMIN ACCESS</span>
      <p class="showcase-kicker">CONTROL · REVIEW · OPERATE</p>
      <h1>管理员后台入口</h1>
      <p class="showcase-desc">
        该登录页仅供管理员进入后台使用。普通用户与设计师请使用前台登录或首页弹窗入口。
      </p>

      <div class="showcase-grid">
        <article class="showcase-card" v-for="item in showcaseCards" :key="item.title">
          <strong>{{ item.title }}</strong>
          <span>{{ item.desc }}</span>
        </article>
      </div>
    </section>

    <section class="admin-login-card">
      <div class="card-top">
        <span class="panel-label">Back Office</span>
        <router-link class="home-link" to="/index/home">返回首页</router-link>
      </div>

      <h2>管理员登录</h2>
      <p class="sub">请输入管理员账号和密码，登录后进入后台总览。</p>

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
          />
        </el-form-item>

        <div class="action-row">
          <el-button type="primary" :loading="submitting" @click="submitForm('loginForm')">登录后台</el-button>
          <el-button @click="resetForm('loginForm')">重置</el-button>
        </div>
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
        { title: '数据总览', desc: '统一查看平台指标、订单和配置状态。' },
        { title: '内容维护', desc: '维护商品、资讯、轮播图与系统内容。' },
        { title: '权限管理', desc: '后台角色与业务流程在此集中处理。' }
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
.admin-login-page {
  min-height: 100vh;
  padding: 28px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(420px, 520px);
  gap: 28px;
  align-items: center;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 12% 18%, rgba(121, 141, 255, 0.42), transparent 28%),
    radial-gradient(circle at 86% 12%, rgba(255, 215, 149, 0.22), transparent 16%),
    linear-gradient(140deg, #eef3ff 0%, #f7f4ee 55%, #eef5ff 100%);
}

.page-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(14px);
  pointer-events: none;
}

.orb-one {
  width: 320px;
  height: 320px;
  top: -100px;
  left: -90px;
  background: radial-gradient(circle, rgba(121, 141, 255, 0.42) 0%, rgba(121, 141, 255, 0) 72%);
}

.orb-two {
  width: 280px;
  height: 280px;
  right: -70px;
  bottom: -100px;
  background: radial-gradient(circle, rgba(255, 215, 149, 0.44) 0%, rgba(255, 215, 149, 0) 72%);
}

.admin-showcase,
.admin-login-card {
  position: relative;
  z-index: 1;
}

.admin-showcase {
  padding: 44px;
  border-radius: 32px;
  color: #f9f7f2;
  background: linear-gradient(160deg, rgba(8, 15, 42, 0.98) 0%, rgba(28, 40, 88, 0.96) 52%, rgba(69, 92, 175, 0.92) 100%);
  box-shadow: 0 32px 72px rgba(20, 31, 76, 0.24);
}

.showcase-tag {
  display: inline-flex;
  align-items: center;
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.08);
  font-size: 12px;
  letter-spacing: 0.2em;
}

.showcase-kicker {
  margin-top: 22px;
  color: rgba(218, 183, 122, 0.96);
  letter-spacing: 0.26em;
  font-size: 12px;
}

.admin-showcase h1 {
  margin-top: 16px;
  font-size: 52px;
  line-height: 1.08;
  font-family: 'Georgia', 'Times New Roman', 'STSong', serif;
}

.showcase-desc {
  margin-top: 16px;
  max-width: 580px;
  line-height: 1.85;
  color: rgba(237, 241, 255, 0.84);
}

.showcase-grid {
  margin-top: 26px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.showcase-card {
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.showcase-card strong,
.showcase-card span {
  display: block;
}

.showcase-card span {
  margin-top: 8px;
  color: rgba(226, 233, 255, 0.8);
  line-height: 1.7;
}

.admin-login-card {
  border-radius: 30px;
  padding: 32px;
  background: rgba(255, 252, 246, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.75);
  box-shadow: 0 28px 60px rgba(44, 53, 103, 0.14);
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

.admin-login-card h2 {
  margin-top: 18px;
  color: #171c43;
  font-size: 34px;
  font-family: 'Georgia', 'Times New Roman', 'STSong', serif;
}

.sub {
  margin-top: 12px;
  color: #6d7595;
  line-height: 1.8;
}

.auth-form {
  margin-top: 24px;
}

.action-row {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.action-row .el-button {
  min-width: 128px;
}

.admin-login-card ::v-deep .el-form-item__label {
  padding-bottom: 8px;
  color: #2a3769;
  font-weight: 600;
}

.admin-login-card ::v-deep .el-input__inner {
  height: 48px;
  border-radius: 16px;
  border-color: rgba(36, 47, 93, 0.12);
  background: rgba(255, 255, 255, 0.88);
}

.admin-login-card ::v-deep .el-input__inner:focus {
  border-color: rgba(70, 94, 179, 0.6);
  box-shadow: 0 0 0 4px rgba(90, 112, 196, 0.1);
}

.admin-login-card ::v-deep .el-button--primary {
  border: none;
  background: linear-gradient(135deg, #1f2d63 0%, #4660b5 100%);
  box-shadow: 0 14px 28px rgba(49, 65, 133, 0.22);
}

@media (max-width: 1080px) {
  .admin-login-page {
    grid-template-columns: 1fr;
    padding: 18px;
  }

  .showcase-grid {
    grid-template-columns: 1fr;
  }

  .admin-showcase {
    padding: 30px;
  }

  .admin-showcase h1 {
    font-size: 40px;
  }
}

@media (max-width: 640px) {
  .admin-login-page {
    padding: 14px;
  }

  .admin-showcase,
  .admin-login-card {
    padding: 22px;
    border-radius: 24px;
  }

  .admin-showcase h1 {
    font-size: 32px;
  }

  .card-top,
  .action-row {
    display: block;
  }

  .action-row .el-button {
    width: 100%;
  }

  .action-row .el-button + .el-button {
    margin-left: 0;
    margin-top: 12px;
  }
}
</style>
