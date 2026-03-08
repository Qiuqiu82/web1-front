<template>
  <transition name="auth-fade">
    <div v-if="visible" class="auth-overlay" @click.self="close">
      <div class="auth-modal">
        <button class="close-btn" type="button" @click="close">
          <i class="el-icon-close"></i>
        </button>

        <section class="auth-showcase">
          <div class="showcase-tag">TAOBAO-STYLE ACCESS</div>
          <h2>先逛首页，喜欢再登录</h2>
          <p>
            你可以像逛电商首页一样先浏览热门款式与灵感内容；当准备查看详情、提交预约或进入个人中心时，
            再通过居中弹窗快速登录或注册，体验更轻、更顺手。
          </p>

          <div class="showcase-cards">
            <article v-for="item in showcaseCards" :key="item.title" class="showcase-card">
              <strong>{{ item.title }}</strong>
              <span>{{ item.desc }}</span>
            </article>
          </div>

          <div class="showcase-note">
            <div>
              <span class="note-label">当前模式</span>
              <strong>{{ activeTab === 'login' ? '账号登录' : '注册新账号' }}</strong>
            </div>
            <p>
              {{
                activeTab === 'login'
                  ? '登录后会自动进入你当前对应的工作区域。设计师登录后将直接进入设计师工作台。'
                  : '注册成功后会自动切回登录，方便继续完成身份进入。'
              }}
            </p>
          </div>
        </section>

        <section class="auth-panel">
          <div class="panel-head">
            <div>
              <span class="panel-kicker">WELCOME</span>
              <h3>{{ activeTab === 'login' ? '欢迎回来' : '快速创建账号' }}</h3>
            </div>
            <div class="tab-switch">
              <button type="button" :class="{ active: activeTab === 'login' }" @click="activeTab = 'login'">登录</button>
              <button type="button" :class="{ active: activeTab === 'register' }" @click="activeTab = 'register'">注册</button>
            </div>
          </div>

          <template v-if="activeTab === 'login'">
            <div class="role-pills login-roles">
              <button
                v-for="item in loginRoles"
                :key="item.tableName"
                type="button"
                class="role-pill"
                :class="{ active: loginForm.tableName === item.tableName }"
                @click="loginForm.tableName = item.tableName"
              >
                <span>{{ item.roleName }}</span>
                <small>{{ item.desc }}</small>
              </button>
            </div>

            <el-form ref="loginForm" :model="loginForm" :rules="loginRules" label-position="top" class="auth-form compact">
              <el-form-item label="账号" prop="username">
                <el-input
                  v-model.trim="loginForm.username"
                  prefix-icon="el-icon-user"
                  placeholder="请输入账号"
                  autocomplete="username"
                />
              </el-form-item>

              <el-form-item label="密码" prop="password">
                <el-input
                  v-model.trim="loginForm.password"
                  type="password"
                  show-password
                  prefix-icon="el-icon-lock"
                  placeholder="请输入密码"
                  autocomplete="current-password"
                />
              </el-form-item>

              <div class="action-row">
                <el-button type="primary" :loading="loginSubmitting" @click="submitLogin">登录并继续</el-button>
                <el-button @click="resetLogin">重置</el-button>
              </div>
            </el-form>
          </template>

          <template v-else>
            <div class="role-pills register-roles">
              <button
                v-for="item in registerRoles"
                :key="item.tableName"
                type="button"
                class="role-pill"
                :class="{ active: registerRole === item.tableName }"
                @click="changeRegisterRole(item.tableName)"
              >
                <span>{{ item.roleName }}</span>
                <small>{{ item.desc }}</small>
              </button>
            </div>

            <el-form ref="registerForm" :model="registerForm" :rules="registerRules" label-position="top" class="auth-form register-form">
              <template v-if="registerRole === 'yonghu'">
                <div class="form-grid two-col">
                  <el-form-item label="用户账号" prop="yonghuzhanghao">
                    <el-input v-model.trim="registerForm.yonghuzhanghao" placeholder="请输入用户账号" />
                  </el-form-item>
                  <el-form-item label="用户姓名" prop="yonghuxingming">
                    <el-input v-model.trim="registerForm.yonghuxingming" placeholder="请输入用户姓名" />
                  </el-form-item>
                </div>

                <el-form-item label="性别" prop="xingbie">
                  <el-radio-group v-model="registerForm.xingbie">
                    <el-radio v-for="item in genderOptions" :key="item" :label="item">{{ item }}</el-radio>
                  </el-radio-group>
                </el-form-item>
              </template>

              <template v-else>
                <div class="form-grid two-col">
                  <el-form-item label="设计师账号" prop="shejishizhanghao">
                    <el-input v-model.trim="registerForm.shejishizhanghao" placeholder="请输入设计师账号" />
                  </el-form-item>
                  <el-form-item label="设计师姓名" prop="shejishixingming">
                    <el-input v-model.trim="registerForm.shejishixingming" placeholder="请输入设计师姓名" />
                  </el-form-item>
                </div>

                <div class="form-grid two-col">
                  <el-form-item label="设计专长">
                    <el-input v-model.trim="registerForm.zhuanchang" placeholder="例如：舞台服、礼服、改版定制" />
                  </el-form-item>
                  <el-form-item label="个人简介">
                    <el-input v-model.trim="registerForm.jianjie" placeholder="简单介绍你的风格方向" />
                  </el-form-item>
                </div>
              </template>

              <div class="form-grid two-col">
                <el-form-item label="手机号" prop="lianxifangshi">
                  <el-input v-model.trim="registerForm.lianxifangshi" placeholder="请输入手机号" />
                </el-form-item>
                <el-form-item label="头像地址">
                  <el-input v-model.trim="registerForm.touxiang" placeholder="可选：输入头像图片地址" />
                </el-form-item>
              </div>

              <div class="form-grid two-col">
                <el-form-item label="密码" prop="mima">
                  <el-input v-model.trim="registerForm.mima" type="password" show-password placeholder="请输入密码" />
                </el-form-item>
                <el-form-item label="确认密码" prop="mima2">
                  <el-input v-model.trim="registerForm.mima2" type="password" show-password placeholder="请再次输入密码" />
                </el-form-item>
              </div>

              <div class="action-row">
                <el-button type="primary" :loading="registerSubmitting" @click="submitRegister">注册并继续</el-button>
                <el-button @click="resetRegister">重置</el-button>
              </div>
            </el-form>
          </template>
        </section>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'AuthDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'login'
    },
    defaultRole: {
      type: String,
      default: 'yonghu'
    },
    redirect: {
      type: [String, Object],
      default: null
    }
  },
  data() {
    return {
      activeTab: 'login',
      pendingRoute: null,
      loginSubmitting: false,
      registerSubmitting: false,
      registerRole: 'yonghu',
      showcaseCards: [
        { title: '先浏览', desc: '首页内容保持开放，先种草再决定。' },
        { title: '再登录', desc: '查看详情或提交预约时再轻量登录。' },
        { title: '直达目标', desc: '设计师登录后直接进入工作台。' }
      ],
      genderOptions: ['男', '女'],
      loginRoles: [
        { roleName: '用户', tableName: 'yonghu', desc: '查看详情 / 提交预约' },
        { roleName: '设计师', tableName: 'shejishi', desc: '接单协作 / 工作台' }
      ],
      registerRoles: [
        { roleName: '用户', tableName: 'yonghu', desc: '创建预约账号' },
        { roleName: '设计师', tableName: 'shejishi', desc: '创建设计师账号' }
      ],
      loginForm: {
        username: '',
        password: '',
        tableName: 'yonghu'
      },
      loginRules: {
        username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        tableName: [{ required: true, message: '请选择身份', trigger: 'change' }]
      },
      registerForm: {
        xingbie: '',
        yonghuzhanghao: '',
        yonghuxingming: '',
        shejishizhanghao: '',
        shejishixingming: '',
        lianxifangshi: '',
        touxiang: '',
        zhuanchang: '',
        jianjie: '',
        mima: '',
        mima2: ''
      },
      registerRules: {}
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(value) {
        if (value) {
          this.syncFromProps()
          this.lockScroll(true)
        } else {
          this.lockScroll(false)
        }
      }
    },
    mode() {
      this.syncFromProps()
    },
    defaultRole() {
      this.syncFromProps()
    },
    redirect(value) {
      this.pendingRoute = value || null
    }
  },
  beforeDestroy() {
    this.lockScroll(false)
  },
  methods: {
    lockScroll(locked) {
      if (typeof document === 'undefined') {
        return
      }
      document.body.style.overflow = locked ? 'hidden' : ''
    },
    normalizeRole(role) {
      return role === 'shejishi' ? 'shejishi' : 'yonghu'
    },
    syncFromProps() {
      this.activeTab = this.mode === 'register' ? 'register' : 'login'
      this.pendingRoute = this.redirect || null
      this.loginForm.tableName = this.normalizeRole(this.defaultRole)
      this.registerRole = this.normalizeRole(this.defaultRole)
      this.buildRegisterRules()
      this.$nextTick(() => {
        if (this.$refs.loginForm) {
          this.$refs.loginForm.clearValidate()
        }
        if (this.$refs.registerForm) {
          this.$refs.registerForm.clearValidate()
        }
      })
    },
    close() {
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    resetLogin() {
      if (this.$refs.loginForm) {
        this.$refs.loginForm.resetFields()
      }
      this.loginForm.tableName = this.normalizeRole(this.defaultRole)
    },
    changeRegisterRole(role) {
      this.registerRole = role === 'shejishi' ? 'shejishi' : 'yonghu'
      this.buildRegisterRules()
      this.$nextTick(() => {
        if (this.$refs.registerForm) {
          this.$refs.registerForm.clearValidate()
        }
      })
    },
    buildRegisterRules() {
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

      if (this.registerRole === 'shejishi') {
        this.registerRules = {
          ...baseRules,
          shejishizhanghao: [
            { required: true, message: '请输入设计师账号', trigger: 'blur' },
            { min: 3, max: 20, message: '账号长度为 3-20 位', trigger: 'blur' }
          ],
          shejishixingming: [{ required: true, message: '请输入设计师姓名', trigger: 'blur' }]
        }
        return
      }

      this.registerRules = {
        ...baseRules,
        yonghuzhanghao: [
          { required: true, message: '请输入用户账号', trigger: 'blur' },
          { min: 3, max: 20, message: '账号长度为 3-20 位', trigger: 'blur' }
        ],
        yonghuxingming: [{ required: true, message: '请输入用户姓名', trigger: 'blur' }],
        xingbie: [{ required: true, message: '请选择性别', trigger: 'change' }]
      }
    },
    submitLogin() {
      if (this.loginSubmitting) {
        return
      }
      this.$refs.loginForm.validate((valid) => {
        if (!valid) {
          return false
        }
        this.loginSubmitting = true
        const roleNameMap = {
          yonghu: '用户',
          shejishi: '设计师'
        }
        this.$http
          .get(`${this.loginForm.tableName}/login`, {
            params: this.loginForm
          })
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
            localStorage.setItem('role', roleNameMap[this.loginForm.tableName] || '用户')
            if (this.$http && this.$http.headers && this.$http.headers.common) {
              this.$http.headers.common.Token = token
            }

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
                const defaultRouteMap = {
                  shejishi: '/designer/workbench',
                  yonghu: '/index/home'
                }
                const nextRoute =
                  this.loginForm.tableName === 'shejishi'
                    ? '/designer/workbench'
                    : this.pendingRoute || defaultRouteMap[this.loginForm.tableName] || '/index/home'
                this.$message.success('登录成功')
                this.$emit('success', { type: 'login', role: this.loginForm.tableName })
                this.close()
                this.$router.push(nextRoute)
              })
          })
          .catch(() => {
            this.$message.error('登录请求失败，请检查后端服务')
          })
          .finally(() => {
            this.loginSubmitting = false
          })
      })
    },
    buildRegisterPayload() {
      const basePayload = {
        mima: this.registerForm.mima,
        touxiang: this.registerForm.touxiang,
        lianxifangshi: this.registerForm.lianxifangshi
      }
      if (this.registerRole === 'shejishi') {
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
    submitRegister() {
      if (this.registerSubmitting) {
        return
      }
      this.$refs.registerForm.validate((valid) => {
        if (!valid) {
          return false
        }
        if (this.registerForm.mima !== this.registerForm.mima2) {
          this.$message.error('两次输入的密码不一致')
          return false
        }
        this.registerSubmitting = true
        this.$http
          .post(`${this.registerRole}/register`, this.buildRegisterPayload())
          .then((res) => {
            if (res.data.code === 0) {
              this.$message.success('注册成功，请登录')
              this.activeTab = 'login'
              this.loginForm.tableName = this.registerRole
              this.loginForm.username =
                this.registerRole === 'shejishi'
                  ? this.registerForm.shejishizhanghao
                  : this.registerForm.yonghuzhanghao
              this.loginForm.password = ''
            } else {
              this.$message.error(res.data.msg || '注册失败')
            }
          })
          .catch(() => {
            this.$message.error('注册请求失败，请检查后端服务')
          })
          .finally(() => {
            this.registerSubmitting = false
          })
      })
    },
    resetRegister() {
      if (this.$refs.registerForm) {
        this.$refs.registerForm.resetFields()
      }
      this.registerRole = this.normalizeRole(this.defaultRole)
      this.buildRegisterRules()
    }
  }
}
</script>

<style scoped>
.auth-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(10, 18, 44, 0.46);
  backdrop-filter: blur(10px);
  display: grid;
  place-items: center;
  padding: 24px;
}

.auth-modal {
  width: min(1080px, 100%);
  max-height: min(760px, calc(100vh - 48px));
  overflow: auto;
  display: grid;
  grid-template-columns: minmax(320px, 0.9fr) minmax(0, 1.1fr);
  border-radius: 30px;
  background: rgba(255, 252, 246, 0.96);
  box-shadow: 0 32px 80px rgba(12, 20, 48, 0.28);
  position: relative;
}

.close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 2;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  cursor: pointer;
}

.auth-showcase {
  padding: 40px 34px;
  color: #fff8ee;
  background: linear-gradient(160deg, #0f173d 0%, #24346f 52%, #556fd3 100%);
  border-radius: 30px 0 0 30px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.showcase-tag,
.panel-kicker,
.note-label {
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.auth-showcase h2 {
  font-size: 34px;
  line-height: 1.28;
  color: #fff;
}

.auth-showcase p {
  line-height: 1.9;
  color: rgba(243, 247, 255, 0.92);
}

.showcase-cards {
  display: grid;
  gap: 12px;
}

.showcase-card {
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: grid;
  gap: 6px;
}

.showcase-card strong {
  color: #fff;
}

.showcase-card span {
  color: rgba(243, 247, 255, 0.85);
  font-size: 13px;
}

.showcase-note {
  margin-top: auto;
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.showcase-note strong {
  display: inline-block;
  margin-top: 6px;
  color: #fff;
  font-size: 18px;
}

.showcase-note p {
  margin-top: 10px;
  font-size: 13px;
}

.auth-panel {
  padding: 38px 34px;
  background: linear-gradient(180deg, #fffdf7 0%, #fffaf1 100%);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.panel-head h3 {
  margin-top: 8px;
  color: #1b2148;
  font-size: 32px;
}

.tab-switch {
  display: inline-flex;
  padding: 4px;
  border-radius: 999px;
  background: #eef2ff;
}

.tab-switch button {
  border: none;
  background: transparent;
  color: #6776a5;
  height: 38px;
  padding: 0 18px;
  border-radius: 999px;
  cursor: pointer;
}

.tab-switch button.active {
  background: #fff;
  color: #23346e;
  box-shadow: 0 8px 18px rgba(85, 102, 172, 0.12);
}

.role-pills {
  display: grid;
  gap: 12px;
  margin-top: 24px;
  margin-bottom: 22px;
}

.login-roles,
.register-roles {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.role-pill {
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid #e7ebfb;
  background: #fff;
  color: #31406d;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.role-pill span {
  display: block;
  font-weight: 700;
}

.role-pill small {
  display: block;
  margin-top: 6px;
  color: #7c88af;
}

.role-pill.active {
  border-color: #4f69d7;
  background: linear-gradient(180deg, #f6f8ff 0%, #edf2ff 100%);
  box-shadow: 0 12px 22px rgba(79, 105, 215, 0.12);
}

.auth-form {
  margin-top: 6px;
}

.form-grid {
  display: grid;
  gap: 12px;
}

.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
}

.auth-panel ::v-deep .el-form-item__label {
  padding-bottom: 8px;
  color: #33416d;
  font-weight: 600;
}

.auth-panel ::v-deep .el-input__inner,
.auth-panel ::v-deep .el-textarea__inner {
  border-radius: 16px;
  border-color: #dfe6ff;
  background: #fff;
}

.auth-panel ::v-deep .el-input__inner {
  height: 46px;
}

.auth-panel ::v-deep .el-input__inner:focus,
.auth-panel ::v-deep .el-textarea__inner:focus {
  border-color: #6880df;
  box-shadow: 0 0 0 4px rgba(98, 122, 214, 0.1);
}

.auth-panel ::v-deep .el-button--primary {
  border: none;
  background: linear-gradient(135deg, #23346e 0%, #4f69d7 100%);
  box-shadow: 0 14px 26px rgba(79, 105, 215, 0.2);
}

.auth-fade-enter-active,
.auth-fade-leave-active {
  transition: opacity 0.2s ease;
}

.auth-fade-enter,
.auth-fade-leave-to {
  opacity: 0;
}

@media (max-width: 960px) {
  .auth-modal {
    grid-template-columns: 1fr;
  }

  .auth-showcase {
    border-radius: 30px 30px 0 0;
  }
}

@media (max-width: 640px) {
  .auth-overlay {
    padding: 12px;
  }

  .auth-showcase,
  .auth-panel {
    padding: 24px 18px;
  }

  .login-roles,
  .register-roles,
  .two-col {
    grid-template-columns: 1fr;
  }

  .panel-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .auth-showcase h2,
  .panel-head h3 {
    font-size: 26px;
  }
}
</style>
