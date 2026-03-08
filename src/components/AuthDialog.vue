<template>
  <transition name="auth-fade">
    <div v-if="visible" class="auth-overlay" @click.self="close">
      <section class="auth-modal" :class="{ 'is-register': activeTab === 'register' }">
        <button class="close-btn" type="button" aria-label="关闭" @click="close">
          <i class="el-icon-close"></i>
        </button>

        <div class="auth-head">
          <span class="auth-kicker">AUTH ACCESS</span>
          <h2>{{ activeTab === 'login' ? '欢迎回来' : '创建你的专属账号' }}</h2>
          <p>
            {{
              activeTab === 'login'
                ? '登录你的次元定制账号，继续查看心仪款式、提交预约，或进入设计师工作台。'
                : '只需几步就能完成注册。账号创建成功后，将自动切回登录状态继续进入。'
            }}
          </p>
        </div>

        <div class="tab-switch" role="tablist" aria-label="认证模式切换">
          <button type="button" :class="{ active: activeTab === 'login' }" @click="switchTab('login')">登录</button>
          <button type="button" :class="{ active: activeTab === 'register' }" @click="switchTab('register')">注册</button>
        </div>

        <template v-if="activeTab === 'login'">
          <div class="role-switch">
            <button
              v-for="item in loginRoles"
              :key="item.tableName"
              type="button"
              class="role-chip"
              :class="{ active: loginForm.tableName === item.tableName }"
              @click="changeLoginRole(item.tableName)"
            >
              <span>{{ item.roleName }}</span>
              <small>{{ item.desc }}</small>
            </button>
          </div>

          <el-form ref="loginForm" :model="loginForm" :rules="loginRules" label-position="top" class="auth-form login-form">
            <el-form-item label="手机号 / 邮箱 / 账号" prop="username">
              <el-input
                v-model.trim="loginForm.username"
                autocomplete="username"
                placeholder="请输入手机号、邮箱或账号"
                @keyup.enter.native="submitLogin"
              />
            </el-form-item>

            <el-form-item label="密码" prop="password">
              <el-input
                v-model.trim="loginForm.password"
                type="password"
                show-password
                autocomplete="current-password"
                placeholder="请输入密码"
                @keyup.enter.native="submitLogin"
              />
            </el-form-item>

            <div class="helper-row">
              <label class="remember-me">
                <input v-model="rememberLogin" type="checkbox" />
                <span>记住我</span>
              </label>
              <span class="plain-text-link">忘记密码？</span>
            </div>

            <el-button class="primary-action" type="primary" :loading="loginSubmitting" @click="submitLogin">登录</el-button>

            <div class="switch-row">
              <span>还没有账号？</span>
              <button type="button" class="inline-link" @click="switchTab('register')">立即注册</button>
            </div>

            <button type="button" class="designer-entry" @click="activateDesignerFlow">
              成为设计师
              <i class="el-icon-right"></i>
            </button>
          </el-form>
        </template>

        <template v-else>
          <div class="register-summary">
            <div>
              <span class="summary-label">当前身份</span>
              <strong>{{ registerRoleMeta.roleName }}</strong>
            </div>
            <p>{{ registerRoleMeta.desc }}</p>
          </div>

          <div class="role-switch role-switch-register">
            <button
              v-for="item in registerRoles"
              :key="item.tableName"
              type="button"
              class="role-chip"
              :class="{ active: registerRole === item.tableName }"
              @click="changeRegisterRole(item.tableName)"
            >
              <span>{{ item.roleName }}</span>
              <small>{{ item.desc }}</small>
            </button>
          </div>

          <el-form ref="registerForm" :model="registerForm" :rules="registerRules" label-position="top" class="auth-form register-form">
            <div class="form-section">
              <div class="section-heading">
                <strong>基础信息</strong>
                <span>先完成账号与联系信息，后续沟通会更顺畅。</span>
              </div>

              <div class="form-grid two-col">
                <el-form-item :label="registerAccountLabel" :prop="registerAccountProp">
                  <el-input
                    v-model.trim="registerForm[registerAccountProp]"
                    :placeholder="`请输入${registerAccountLabel}`"
                  />
                </el-form-item>

                <el-form-item :label="registerNameLabel" :prop="registerNameProp">
                  <el-input
                    v-model.trim="registerForm[registerNameProp]"
                    :placeholder="`请输入${registerNameLabel}`"
                  />
                </el-form-item>

                <el-form-item label="联系方式" prop="lianxifangshi">
                  <el-input
                    v-model.trim="registerForm.lianxifangshi"
                    placeholder="请输入手机号，方便预约与联系"
                  />
                </el-form-item>

                <el-form-item v-if="registerRole === 'yonghu'" label="性别" prop="xingbie">
                  <el-select v-model="registerForm.xingbie" placeholder="请选择性别" class="full-width">
                    <el-option v-for="item in genderOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>

                <el-form-item v-else label="擅长方向" prop="zhuanchang">
                  <el-input
                    v-model.trim="registerForm.zhuanchang"
                    placeholder="例如：礼服、舞台服、COS 角色还原"
                  />
                </el-form-item>
              </div>
            </div>

            <div class="form-section">
              <div class="section-heading">
                <strong>资料补充</strong>
                <span>{{ registerRole === 'shejishi' ? '补充专业信息，便于客户快速了解你的能力范围。' : '上传头像后，个人中心展示会更完整。' }}</span>
              </div>

              <el-form-item label="头像" prop="touxiang" class="full-row avatar-item">
                <div class="upload-wrap">
                  <file-upload
                    tip="上传头像"
                    action="file/upload"
                    :limit="1"
                    :multiple="true"
                    :fileUrls="registerForm.touxiang || ''"
                    @change="handleAvatarChange"
                  />
                  <p class="upload-tip">建议上传清晰头像，便于身份识别与后续沟通。</p>
                </div>
              </el-form-item>

              <el-form-item v-if="registerRole === 'shejishi'" label="个人简介" prop="jianjie" class="full-row">
                <el-input
                  v-model.trim="registerForm.jianjie"
                  type="textarea"
                  :rows="4"
                  maxlength="200"
                  show-word-limit
                  placeholder="介绍你的擅长风格、合作方式或作品经验。"
                />
              </el-form-item>
            </div>

            <div class="form-section">
              <div class="section-heading">
                <strong>账号安全</strong>
                <span>建议使用更安全的密码组合，后续登录更稳妥。</span>
              </div>

              <div class="form-grid two-col">
                <el-form-item label="设置密码" prop="mima">
                  <el-input
                    v-model.trim="registerForm.mima"
                    type="password"
                    show-password
                    autocomplete="new-password"
                    placeholder="请输入 6-20 位密码"
                  />
                </el-form-item>

                <el-form-item label="确认密码" prop="mima2">
                  <el-input
                    v-model.trim="registerForm.mima2"
                    type="password"
                    show-password
                    autocomplete="new-password"
                    placeholder="请再次输入密码"
                  />
                </el-form-item>
              </div>

              <div class="security-tips">
                <span class="password-strength" :class="passwordStrength.level">密码强度：{{ passwordStrength.label }}</span>
                <span class="confirm-tip" :class="confirmPasswordState.level">{{ confirmPasswordState.label }}</span>
              </div>
            </div>

            <el-button class="primary-action" type="primary" :loading="registerSubmitting" @click="submitRegister">立即注册</el-button>

            <div class="switch-row">
              <span>已经有账号？</span>
              <button type="button" class="inline-link" @click="switchTab('login')">立即登录</button>
            </div>

            <button type="button" class="designer-entry" @click="activateDesignerFlow">
              成为设计师
              <i class="el-icon-right"></i>
            </button>
          </el-form>
        </template>
      </section>
    </div>
  </transition>
</template>

<script>
const REMEMBER_STORAGE_KEY = 'frontAuthRememberProfile'

function createRegisterForm() {
  return {
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
  }
}

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
      rememberLogin: false,
      loginSubmitting: false,
      registerSubmitting: false,
      registerRole: 'yonghu',
      genderOptions: ['男', '女'],
      loginRoles: [
        { roleName: '普通用户', tableName: 'yonghu', desc: '查看详情 / 提交预约' },
        { roleName: '设计师', tableName: 'shejishi', desc: '接单协作 / 进入工作台' }
      ],
      registerRoles: [
        { roleName: '普通用户', tableName: 'yonghu', desc: '创建预约账号' },
        { roleName: '设计师', tableName: 'shejishi', desc: '创建设计师账号' }
      ],
      loginForm: {
        username: '',
        password: '',
        tableName: 'yonghu'
      },
      loginRules: {
        username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },
      registerForm: createRegisterForm(),
      registerRules: {}
    }
  },
  computed: {
    registerRoleMeta() {
      return this.registerRoles.find((item) => item.tableName === this.registerRole) || this.registerRoles[0]
    },
    registerAccountProp() {
      return this.registerRole === 'shejishi' ? 'shejishizhanghao' : 'yonghuzhanghao'
    },
    registerNameProp() {
      return this.registerRole === 'shejishi' ? 'shejishixingming' : 'yonghuxingming'
    },
    registerAccountLabel() {
      return this.registerRole === 'shejishi' ? '设计师账号' : '用户账号'
    },
    registerNameLabel() {
      return this.registerRole === 'shejishi' ? '设计师姓名' : '用户姓名'
    },
    passwordStrength() {
      const password = this.registerForm.mima || ''
      if (!password) {
        return { label: '未设置', level: 'idle' }
      }
      let score = 0
      if (password.length >= 6) {
        score += 1
      }
      if (/[A-Za-z]/.test(password) && /\d/.test(password)) {
        score += 1
      }
      if (/[^A-Za-z\d]/.test(password) || password.length >= 10) {
        score += 1
      }
      if (score <= 1) {
        return { label: '较弱', level: 'weak' }
      }
      if (score === 2) {
        return { label: '中等', level: 'medium' }
      }
      return { label: '较强', level: 'strong' }
    },
    confirmPasswordState() {
      if (!this.registerForm.mima && !this.registerForm.mima2) {
        return { label: '请再次输入密码进行确认', level: 'idle' }
      }
      if (!this.registerForm.mima2) {
        return { label: '确认密码后即可提交', level: 'idle' }
      }
      if (this.registerForm.mima === this.registerForm.mima2) {
        return { label: '两次密码输入一致', level: 'match' }
      }
      return { label: '两次密码不一致', level: 'mismatch' }
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
      if (this.visible) {
        this.syncFromProps()
      }
    },
    defaultRole() {
      if (this.visible) {
        this.syncFromProps()
      }
    },
    redirect(value) {
      this.pendingRoute = value || null
    },
    activeTab() {
      this.$nextTick(() => {
        if (this.$refs.loginForm) {
          this.$refs.loginForm.clearValidate()
        }
        if (this.$refs.registerForm) {
          this.$refs.registerForm.clearValidate()
        }
      })
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleEscClose)
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleEscClose)
    this.lockScroll(false)
  },
  methods: {
    lockScroll(locked) {
      if (typeof document === 'undefined') {
        return
      }
      document.body.style.overflow = locked ? 'hidden' : ''
    },
    handleEscClose(event) {
      if (event.key === 'Escape' && this.visible) {
        this.close()
      }
    },
    normalizeRole(role) {
      return role === 'shejishi' ? 'shejishi' : 'yonghu'
    },
    getRememberedProfile() {
      try {
        const raw = localStorage.getItem(REMEMBER_STORAGE_KEY)
        if (!raw) {
          return null
        }
        const parsed = JSON.parse(raw)
        if (!parsed || !parsed.username) {
          return null
        }
        return {
          username: parsed.username,
          tableName: this.normalizeRole(parsed.tableName)
        }
      } catch (e) {
        return null
      }
    },
    persistRememberedProfile() {
      const payload = {
        username: this.loginForm.username,
        tableName: this.normalizeRole(this.loginForm.tableName)
      }
      localStorage.setItem(REMEMBER_STORAGE_KEY, JSON.stringify(payload))
    },
    clearRememberedProfile() {
      localStorage.removeItem(REMEMBER_STORAGE_KEY)
    },
    resetRegisterForm() {
      this.registerForm = createRegisterForm()
    },
    syncFromProps() {
      const rememberedProfile = this.getRememberedProfile()
      const normalizedRole = this.normalizeRole(this.defaultRole || (rememberedProfile && rememberedProfile.tableName))
      this.activeTab = this.mode === 'register' ? 'register' : 'login'
      this.pendingRoute = this.redirect || null
      this.rememberLogin = !!rememberedProfile
      this.loginForm = {
        username: rememberedProfile && rememberedProfile.tableName === normalizedRole ? rememberedProfile.username : '',
        password: '',
        tableName: normalizedRole
      }
      this.registerRole = normalizedRole
      this.resetRegisterForm()
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
    switchTab(tab) {
      this.activeTab = tab === 'register' ? 'register' : 'login'
      if (this.activeTab === 'login') {
        this.changeLoginRole(this.registerRole)
      } else {
        this.changeRegisterRole(this.loginForm.tableName)
      }
    },
    close() {
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    changeLoginRole(role) {
      this.loginForm.tableName = this.normalizeRole(role)
      const rememberedProfile = this.getRememberedProfile()
      if (rememberedProfile && rememberedProfile.tableName === this.loginForm.tableName) {
        this.loginForm.username = rememberedProfile.username
      }
    },
    activateDesignerFlow() {
      if (this.activeTab === 'register') {
        this.changeRegisterRole('shejishi')
        return
      }
      this.changeLoginRole('shejishi')
    },
    changeRegisterRole(role) {
      this.registerRole = this.normalizeRole(role)
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
          { min: 6, max: 20, message: '密码长度为 6-20 位', trigger: 'blur' }
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
        xingbie: [{ required: true, message: '请输入密码', trigger: 'change' }]
      }
    },
    handleAvatarChange(fileUrls) {
      this.registerForm.touxiang = fileUrls.replace(new RegExp(this.$config.baseUrl, 'g'), '')
    },
    resolveNextRoute(role) {
      if (this.pendingRoute) {
        return this.pendingRoute
      }
      const routeMap = {
        yonghu: '/index/home',
        shejishi: '/designer/workbench'
      }
      return routeMap[role] || '/index/home'
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
            if (this.rememberLogin) {
              this.persistRememberedProfile()
            } else {
              this.clearRememberedProfile()
            }
            if (this.$http && this.$http.headers && this.$http.headers.common) {
              this.$http.headers.common.Token = token
            }

            return this.$http
              .get(`${this.loginForm.tableName}/session`, {
                headers: { Token: token }
              })
              .then((sessionRes) => {
                const currentUser = (sessionRes.data && sessionRes.data.data) || {}
                const userId = currentUser.id || currentUser.userid || currentUser.userId
                if (userId) {
                  localStorage.setItem('userid', String(userId))
                  localStorage.setItem('userId', String(userId))
                }
              })
              .catch(() => {
                this.$message.warning('登录成功，但会话信息读取失败')
              })
              .then(() => {
                const nextRoute = this.resolveNextRoute(this.loginForm.tableName)
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
            if (res.data.code !== 0) {
              this.$message.error(res.data.msg || '注册失败')
              return
            }
            const nextAccount = this.registerRole === 'shejishi' ? this.registerForm.shejishizhanghao : this.registerForm.yonghuzhanghao
            this.$message.success('注册成功，请登录')
            this.activeTab = 'login'
            this.loginForm.tableName = this.registerRole
            this.loginForm.username = nextAccount
            this.loginForm.password = ''
            this.resetRegisterForm()
            this.buildRegisterRules()
          })
          .catch(() => {
            this.$message.error('注册请求失败，请检查后端服务')
          })
          .finally(() => {
            this.registerSubmitting = false
          })
      })
    }
  }
}
</script>

<style scoped>
.auth-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(17, 24, 39, 0.48);
  backdrop-filter: blur(10px);
}

.auth-modal {
  --primary-start: #5a67f8;
  --primary-end: #b04dff;
  width: min(460px, 100%);
  position: relative;
  border-radius: 30px;
  background:
    radial-gradient(circle at top left, rgba(121, 134, 255, 0.14), transparent 34%),
    linear-gradient(180deg, #ffffff 0%, #fcfbff 100%);
  box-shadow: 0 30px 90px rgba(31, 41, 55, 0.22);
  padding: 30px 30px 28px;
  color: #1f2937;
}

.auth-modal.is-register {
  width: min(760px, 100%);
}

.close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 50%;
  background: rgba(148, 163, 184, 0.12);
  color: #8a94a7;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(148, 163, 184, 0.2);
  color: #4b5563;
}

.auth-head {
  padding-right: 44px;
}

.auth-kicker {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(90, 103, 248, 0.1);
  color: #5a67f8;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.auth-head h2 {
  margin: 14px 0 10px;
  font-size: 38px;
  line-height: 1.08;
  color: #1f2937;
}

.auth-head p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.8;
}

.tab-switch {
  margin-top: 24px;
  display: inline-grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  padding: 6px;
  width: 100%;
  border-radius: 18px;
  background: #f3f4f8;
}

.tab-switch button {
  height: 42px;
  border: none;
  border-radius: 14px;
  background: transparent;
  color: #7b8292;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-switch button.active {
  background: #ffffff;
  color: #1f2937;
  box-shadow: 0 10px 22px rgba(148, 163, 184, 0.18);
}

.role-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 24px;
}

.role-chip {
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid #e6eaf2;
  background: #ffffff;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.role-chip span {
  display: block;
  color: #1f2937;
  font-size: 15px;
  font-weight: 700;
}

.role-chip small {
  display: block;
  margin-top: 6px;
  color: #8b95a7;
  font-size: 12px;
  line-height: 1.5;
}

.role-chip.active {
  border-color: rgba(90, 103, 248, 0.4);
  background: rgba(90, 103, 248, 0.06);
  box-shadow: 0 16px 30px rgba(90, 103, 248, 0.12);
}

.register-summary {
  margin-top: 22px;
  padding: 16px 18px;
  border-radius: 20px;
  background: linear-gradient(180deg, #f8f9ff 0%, #f7f4ff 100%);
  border: 1px solid #e8ebf6;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.summary-label {
  display: block;
  color: #8b95a7;
  font-size: 12px;
}

.register-summary strong {
  display: block;
  margin-top: 6px;
  color: #1f2937;
  font-size: 20px;
}

.register-summary p {
  margin: 0;
  color: #6b7280;
  line-height: 1.7;
  max-width: 340px;
}

.auth-form {
  margin-top: 24px;
}

.form-section {
  padding: 20px;
  border-radius: 22px;
  border: 1px solid #edf0f6;
  background: #ffffff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.form-section + .form-section {
  margin-top: 14px;
}

.section-heading {
  display: grid;
  gap: 6px;
  margin-bottom: 16px;
}

.section-heading strong {
  color: #1f2937;
  font-size: 16px;
}

.section-heading span {
  color: #8b95a7;
  font-size: 13px;
  line-height: 1.6;
}

.form-grid {
  display: grid;
  gap: 14px;
}

.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.full-width {
  width: 100%;
}

.upload-wrap {
  border-radius: 18px;
  padding: 14px;
  background: #f9fafc;
  border: 1px dashed #d8dfeb;
}

.upload-tip {
  margin: 10px 0 0;
  color: #8b95a7;
  font-size: 12px;
}

.security-tips {
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #8b95a7;
  font-size: 12px;
}

.password-strength.weak,
.confirm-tip.mismatch {
  color: #ef4444;
}

.password-strength.medium {
  color: #f59e0b;
}

.password-strength.strong,
.confirm-tip.match {
  color: #10b981;
}

.password-strength.idle,
.confirm-tip.idle {
  color: #8b95a7;
}

.helper-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 6px 0 18px;
}

.remember-me {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
}

.remember-me input {
  width: 16px;
  height: 16px;
  accent-color: #6b61ff;
}

.plain-text-link {
  color: #6b61ff;
  font-size: 14px;
  font-weight: 600;
}

.primary-action {
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(90deg, var(--primary-start) 0%, var(--primary-end) 100%);
  box-shadow: 0 16px 28px rgba(128, 90, 213, 0.25);
}

.switch-row {
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #7b8292;
  font-size: 14px;
}

.inline-link,
.designer-entry {
  border: none;
  background: transparent;
  cursor: pointer;
}

.inline-link {
  color: #6b61ff;
  font-size: 14px;
  font-weight: 700;
}

.designer-entry {
  margin: 18px auto 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #8b3dff;
  font-size: 16px;
  font-weight: 700;
}

.auth-modal ::v-deep .el-form-item {
  margin-bottom: 18px;
}

.auth-modal ::v-deep .el-form-item__label {
  padding-bottom: 8px;
  color: #374151;
  font-weight: 700;
}

.auth-modal ::v-deep .el-input__inner,
.auth-modal ::v-deep .el-textarea__inner,
.auth-modal ::v-deep .el-select .el-input__inner {
  border-radius: 16px;
  border-color: #dde3ee;
  background: #fbfbfe;
  color: #1f2937;
}

.auth-modal ::v-deep .el-input__inner {
  height: 50px;
}

.auth-modal ::v-deep .el-input__inner:focus,
.auth-modal ::v-deep .el-textarea__inner:focus {
  border-color: #8070ff;
  box-shadow: 0 0 0 4px rgba(128, 112, 255, 0.12);
  background: #ffffff;
}

.auth-modal ::v-deep .el-button--primary:hover,
.auth-modal ::v-deep .el-button--primary:focus {
  background: linear-gradient(90deg, var(--primary-start) 0%, var(--primary-end) 100%);
  opacity: 0.96;
}

.auth-fade-enter-active,
.auth-fade-leave-active {
  transition: opacity 0.22s ease;
}

.auth-fade-enter,
.auth-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .auth-overlay {
    padding: 14px;
  }

  .auth-modal,
  .auth-modal.is-register {
    width: min(100%, 100%);
    padding: 24px 18px 22px;
    border-radius: 24px;
  }

  .auth-head h2 {
    font-size: 30px;
  }

  .role-switch,
  .two-col {
    grid-template-columns: 1fr;
  }

  .register-summary {
    display: grid;
  }
}
</style>

