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
            你可以像逛淘宝一样先浏览热门款式与灵感内容；当准备查看详情、下单预约或进入个人中心时，再用居中弹窗快速登录或注册。
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
            <p>{{ activeTab === 'login' ? '登录后会返回你刚刚想查看的页面或操作。' : '注册成功后会自动切回登录，让进入体验更顺手。' }}</p>
          </div>
        </section>

        <section class="auth-panel">
          <div class="panel-head">
            <div>
              <span class="panel-kicker">WELCOME</span>
              <h3>{{ activeTab === 'login' ? '欢迎回来' : '创建账号' }}</h3>
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
                <el-input v-model.trim="loginForm.username" prefix-icon="el-icon-user" placeholder="请输入账号" autocomplete="username" />
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

            <el-form ref="registerForm" :model="registerForm" :rules="registerRules" label-position="top" class="auth-form">
              <div class="grid-form">
                <template v-if="registerRole === 'yonghu'">
                  <el-form-item label="用户账号" prop="yonghuzhanghao">
                    <el-input v-model.trim="registerForm.yonghuzhanghao" placeholder="请输入用户账号" />
                  </el-form-item>
                  <el-form-item label="用户姓名" prop="yonghuxingming">
                    <el-input v-model.trim="registerForm.yonghuxingming" placeholder="请输入用户姓名" />
                  </el-form-item>
                  <el-form-item label="性别" prop="xingbie">
                    <el-select v-model="registerForm.xingbie" placeholder="请选择性别" style="width: 100%">
                      <el-option v-for="item in genderOptions" :key="item" :label="item" :value="item" />
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
                  <el-form-item label="个人简介" prop="jianjie" class="full-row">
                    <el-input v-model="registerForm.jianjie" type="textarea" :rows="3" placeholder="可选：填写设计风格、接单经验和服务特色" />
                  </el-form-item>
                </template>

                <el-form-item label="密码" prop="mima">
                  <el-input v-model.trim="registerForm.mima" type="password" show-password placeholder="请输入密码" />
                </el-form-item>
                <el-form-item label="确认密码" prop="mima2">
                  <el-input v-model.trim="registerForm.mima2" type="password" show-password placeholder="请再次输入密码" />
                </el-form-item>
                <el-form-item label="联系电话" prop="lianxifangshi">
                  <el-input v-model.trim="registerForm.lianxifangshi" placeholder="请输入手机号" />
                </el-form-item>
                <el-form-item label="头像" prop="touxiang" class="full-row avatar-row">
                  <div class="upload-box">
                    <file-upload
                      tip="上传头像"
                      action="file/upload"
                      :limit="1"
                      :multiple="true"
                      :fileUrls="registerForm.touxiang || ''"
                      @change="handleAvatarChange"
                    />
                  </div>
                </el-form-item>
              </div>

              <div class="action-row">
                <el-button type="primary" :loading="registerSubmitting" @click="submitRegister">注册账号</el-button>
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
      type: Object,
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
        { title: '先浏览', desc: '首页内容始终可见，先种草再决定。' },
        { title: '再登录', desc: '查看详情、预约下单时再轻量登录。' },
        { title: '继续操作', desc: '成功后自动回到你刚刚想看的内容。' }
      ],
      genderOptions: ['男', '女'],
      loginRoles: [
        { roleName: '用户', tableName: 'yonghu', desc: '查看详情 / 预约下单' },
        { roleName: '设计师', tableName: 'shejishi', desc: '接单协作 / 工作台' },
        { roleName: '管理员', tableName: 'users', desc: '系统后台入口' }
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
          return
        }
        this.lockScroll(false)
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
    syncFromProps() {
      this.activeTab = this.mode === 'register' ? 'register' : 'login'
      this.pendingRoute = this.redirect || null
      this.loginForm.tableName = this.normalizeRole(this.defaultRole, true)
      this.registerRole = this.normalizeRole(this.defaultRole, false)
      this.buildRegisterRules()
      this.$nextTick(() => {
        if (this.$refs.loginForm) this.$refs.loginForm.clearValidate()
        if (this.$refs.registerForm) this.$refs.registerForm.clearValidate()
      })
    },
    normalizeRole(role, allowAdmin) {
      if (role === 'shejishi') return 'shejishi'
      if (allowAdmin && role === 'users') return 'users'
      return 'yonghu'
    },
    close() {
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    resetLogin() {
      if (this.$refs.loginForm) {
        this.$refs.loginForm.resetFields()
      }
      this.loginForm.tableName = this.normalizeRole(this.defaultRole, true)
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
    handleAvatarChange(fileUrls) {
      this.registerForm.touxiang = fileUrls.replace(new RegExp(this.$config.baseUrl, 'g'), '')
    },
    submitLogin() {
      if (this.loginSubmitting) {
        return
      }
      this.$refs.loginForm.validate((valid) => {
        if (!valid) {
          return false
        }
        const loginApi = `${this.loginForm.tableName}/login`
        const isAdminLogin = this.loginForm.tableName === 'users'
        this.loginSubmitting = true
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
            const roleNameMap = {
              users: '管理员',
              yonghu: '用户',
              shejishi: '设计师'
            }
            localStorage.setItem('Token', token)
            localStorage.setItem('UserTableName', this.loginForm.tableName)
            localStorage.setItem('sessionTable', this.loginForm.tableName)
            localStorage.setItem('username', this.loginForm.username)
            localStorage.setItem('adminName', this.loginForm.username)
            localStorage.setItem('role', roleNameMap[this.loginForm.tableName] || '')
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
                this.$message.success('登录成功')
                this.$emit('success', { type: 'login', role: this.loginForm.tableName })
                const nextRoute = this.pendingRoute
                this.close()
                if (nextRoute) {
                  this.$router.push(nextRoute)
                }
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
        const url = `${this.registerRole}/register`
        const payload = this.buildRegisterPayload()
        this.$http
          .post(url, payload)
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

.showcase-tag {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.08);
  font-size: 12px;
  letter-spacing: 0.18em;
}

.auth-showcase h2 {
  font-size: 38px;
  line-height: 1.15;
  font-family: 'Georgia', 'Times New Roman', 'STSong', serif;
}

.auth-showcase p {
  line-height: 1.85;
  color: rgba(237, 241, 255, 0.84);
}

.showcase-cards {
  display: grid;
  gap: 12px;
}

.showcase-card {
  padding: 18px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.08);
}

.showcase-card strong,
.showcase-card span {
  display: block;
}

.showcase-card span {
  margin-top: 8px;
  color: rgba(228, 234, 255, 0.76);
}

.showcase-note {
  margin-top: auto;
  padding: 20px;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255, 241, 214, 0.14), rgba(255, 255, 255, 0.06));
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.note-label {
  display: block;
  color: rgba(223, 230, 255, 0.8);
  font-size: 13px;
}

.showcase-note strong {
  display: block;
  margin-top: 6px;
  color: #fff8ea;
  font-size: 20px;
}

.auth-panel {
  padding: 34px;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.panel-kicker {
  display: inline-block;
  color: #7c86aa;
  font-size: 12px;
  letter-spacing: 0.2em;
}

.panel-head h3 {
  margin-top: 10px;
  color: #17204b;
  font-size: 32px;
  font-family: 'Georgia', 'Times New Roman', 'STSong', serif;
}

.tab-switch {
  display: inline-flex;
  gap: 8px;
  padding: 6px;
  border-radius: 999px;
  background: #f2f5ff;
}

.tab-switch button,
.role-pill {
  cursor: pointer;
}

.tab-switch button {
  border: none;
  background: transparent;
  color: #5f6d98;
  padding: 9px 16px;
  border-radius: 999px;
  font-weight: 700;
}

.tab-switch button.active {
  background: linear-gradient(135deg, #24346f 0%, #5870d7 100%);
  color: #fff;
}

.role-pills {
  margin-top: 22px;
  display: grid;
  gap: 10px;
}

.login-roles {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.register-roles {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.role-pill {
  border: 1px solid rgba(37, 53, 110, 0.12);
  border-radius: 18px;
  background: #fff;
  padding: 14px 14px 12px;
  text-align: left;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.role-pill:hover {
  transform: translateY(-1px);
  border-color: rgba(82, 100, 255, 0.28);
  box-shadow: 0 16px 28px rgba(68, 85, 149, 0.12);
}

.role-pill.active {
  background: linear-gradient(135deg, rgba(31, 45, 99, 0.96), rgba(83, 104, 206, 0.92));
  border-color: transparent;
}

.role-pill span,
.role-pill small {
  display: block;
}

.role-pill span {
  color: #24315d;
  font-weight: 700;
}

.role-pill small {
  margin-top: 6px;
  color: #818cae;
}

.role-pill.active span,
.role-pill.active small {
  color: #fffaf1;
}

.auth-form {
  margin-top: 22px;
}

.auth-form.compact {
  max-width: 480px;
}

.grid-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 14px;
}

.full-row {
  grid-column: 1 / -1;
}

.avatar-row {
  margin-bottom: 6px;
}

.upload-box {
  padding: 14px;
  border-radius: 18px;
  border: 1px dashed rgba(79, 97, 180, 0.22);
  background: linear-gradient(180deg, #f8faff, #fffdf8);
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

.auth-panel ::v-deep .el-form-item__label {
  padding-bottom: 8px;
  color: #2a3769;
  font-weight: 600;
}

.auth-panel ::v-deep .el-input__inner,
.auth-panel ::v-deep .el-textarea__inner {
  border-radius: 16px;
  border-color: rgba(36, 47, 93, 0.12);
  background: rgba(255, 255, 255, 0.92);
}

.auth-panel ::v-deep .el-input__inner {
  height: 46px;
}

.auth-panel ::v-deep .el-input__inner:focus,
.auth-panel ::v-deep .el-textarea__inner:focus {
  border-color: rgba(70, 94, 179, 0.6);
  box-shadow: 0 0 0 4px rgba(90, 112, 196, 0.1);
}

.auth-panel ::v-deep .el-button--primary {
  border: none;
  background: linear-gradient(135deg, #22316c 0%, #5870d7 100%);
  box-shadow: 0 14px 28px rgba(50, 67, 136, 0.2);
}

.auth-panel ::v-deep .upload .upload-img,
.auth-panel ::v-deep .el-upload-list .el-upload-list__item,
.auth-panel ::v-deep .el-upload .el-icon-plus {
  width: 110px;
  height: 110px;
  line-height: 110px;
  border-radius: 14px;
  border: 1px dashed #d7def8;
  background: #f8faff;
}

.auth-fade-enter-active,
.auth-fade-leave-active {
  transition: opacity 0.22s ease;
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

  .login-roles,
  .register-roles,
  .grid-form {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .auth-overlay {
    padding: 12px;
  }

  .auth-showcase,
  .auth-panel {
    padding: 22px;
  }

  .auth-showcase h2 {
    font-size: 30px;
  }

  .panel-head {
    flex-direction: column;
  }

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

