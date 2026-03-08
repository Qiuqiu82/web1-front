<template>
  <div class="register-page auth-page">
    <div class="page-orb orb-one"></div>
    <div class="page-orb orb-two"></div>
    <div class="page-grid"></div>

    <section class="register-showcase">
      <div class="showcase-top">
        <span class="showcase-tag">PROFILE SETUP</span>
        <span class="showcase-tag muted">定制协作身份创建</span>
      </div>

      <div class="showcase-copy">
        <p class="showcase-kicker">CREATE · CONNECT · CUSTOMIZE</p>
        <h1>{{ roleConfig.heroTitle }}</h1>
        <p class="showcase-desc">{{ roleConfig.heroDesc }}</p>
      </div>

      <div class="role-switcher">
        <button
          v-for="item in availableRoles"
          :key="item.tableName"
          type="button"
          class="switch-pill"
          :class="{ active: tableName === item.tableName }"
          @click="changeRole(item.tableName)"
        >
          <span>{{ item.roleName }}</span>
          <small>{{ item.shortDesc }}</small>
        </button>
      </div>

      <div class="highlight-list">
        <article v-for="item in roleConfig.highlights" :key="item.title" class="highlight-card">
          <strong>{{ item.title }}</strong>
          <p>{{ item.desc }}</p>
        </article>
      </div>

      <div class="note-card">
        <div class="note-head">
          <span>注册完成后</span>
          <strong>{{ roleConfig.nextStep }}</strong>
        </div>
        <ul>
          <li v-for="item in roleConfig.notes" :key="item">{{ item }}</li>
        </ul>
      </div>
    </section>

    <section class="register-card">
      <div class="card-top">
        <span class="panel-label">{{ roleConfig.badge }}</span>
        <el-button type="text" class="login-link" @click="$router.push('/login')">已有账号，去登录</el-button>
      </div>

      <div class="header">
        <h2>{{ pageTitle }}</h2>
        <p>{{ roleConfig.formIntro }}</p>
      </div>

      <el-form ref="registerForm" :model="registerForm" :rules="rules" label-position="top" class="register-form">
        <div class="form-grid">
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
              <el-input v-model.trim="registerForm.zhuanchang" placeholder="可选：盔甲 / 制服 / 礼服 / 舞台装" />
            </el-form-item>
            <el-form-item label="个人简介" prop="jianjie" class="full-row">
              <el-input
                v-model="registerForm.jianjie"
                type="textarea"
                :rows="4"
                placeholder="可选：介绍你的设计风格、接单经验与服务特色"
              />
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
              <p class="upload-tip">建议上传清晰头像，便于后续沟通与身份识别。</p>
            </div>
          </el-form-item>
        </div>

        <div class="btn-row">
          <el-button type="primary" :loading="submitting" @click="submitForm('registerForm')">立即注册</el-button>
          <el-button @click="resetForm('registerForm')">重置内容</el-button>
        </div>
      </el-form>
    </section>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tableName: 'yonghu',
      submitting: false,
      availableRoles: [
        {
          tableName: 'yonghu',
          roleName: '用户',
          shortDesc: '预约下单身份',
          badge: 'Client Access',
          heroTitle: '创建你的预约账号',
          heroDesc: '完成基础信息后即可浏览款式、提交服装预约，并在前台持续查看订单动态。',
          formIntro: '适合普通用户快速创建账号并进入预约流程。',
          nextStep: '进入用户中心',
          notes: ['浏览热卖西服与定制内容', '提交预约并跟进订单状态', '保留个人联系方式便于回访'],
          highlights: [
            { title: '快速预约', desc: '进入首页后可直接浏览热门款式并发起预约。' },
            { title: '进度可见', desc: '提交订单后可在前台持续追踪服务状态。' },
            { title: '资料清晰', desc: '完善头像与联系方式，提升沟通效率。' }
          ]
        },
        {
          tableName: 'shejishi',
          roleName: '设计师',
          shortDesc: '接单创作身份',
          badge: 'Designer Access',
          heroTitle: '搭建设计师服务名片',
          heroDesc: '创建账号后可进入设计师工作台，展示专长方向、承接任务并建立更专业的合作形象。',
          formIntro: '适合设计师完善风格信息，形成更完整的个人服务入口。',
          nextStep: '进入设计师工作台',
          notes: ['展示设计专长与个人风格', '后续更方便管理接单流程', '留下清晰头像与联系方式更专业'],
          highlights: [
            { title: '塑造品牌感', desc: '通过姓名、专长和简介快速建立个人印象。' },
            { title: '提升接单效率', desc: '角色信息明确后，后续协作路径更清晰。' },
            { title: '沉淀作品力', desc: '让账号本身成为你的线上服务门面。' }
          ]
        }
      ],
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
    },
    roleConfig() {
      return this.availableRoles.find((item) => item.tableName === this.tableName) || this.availableRoles[0]
    }
  },
  watch: {
    '$route.query.role'(value) {
      const nextRole = value === 'shejishi' ? 'shejishi' : 'yonghu'
      if (nextRole !== this.tableName) {
        this.tableName = nextRole
        this.buildRules()
        this.$nextTick(() => {
          if (this.$refs.registerForm) {
            this.$refs.registerForm.clearValidate()
          }
        })
      }
    }
  },
  created() {
    const role = this.$route.query.role
    this.tableName = role === 'shejishi' ? 'shejishi' : 'yonghu'
    this.buildRules()
  },
  methods: {
    changeRole(role) {
      if (role === this.tableName) {
        return
      }
      this.tableName = role
      this.buildRules()
      this.$router
        .replace({
          path: '/register',
          query: {
            ...this.$route.query,
            role,
            pageFlag: 'register'
          }
        })
        .catch(() => {})
      this.$nextTick(() => {
        if (this.$refs.registerForm) {
          this.$refs.registerForm.clearValidate()
        }
      })
    },
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
.auth-page {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.register-page {
  min-height: 100vh;
  padding: 32px;
  display: grid;
  grid-template-columns: minmax(340px, 0.92fr) minmax(0, 1.08fr);
  gap: 28px;
  align-items: stretch;
  background:
    radial-gradient(circle at 10% 16%, rgba(158, 184, 255, 0.5), transparent 26%),
    radial-gradient(circle at 86% 8%, rgba(255, 228, 180, 0.42), transparent 18%),
    linear-gradient(145deg, #f5efe7 0%, #eef3ff 54%, #edf6ff 100%);
}

.page-grid,
.page-orb {
  position: absolute;
  pointer-events: none;
}

.page-grid {
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, 0.24) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.18) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.45), transparent 88%);
  opacity: 0.32;
}

.page-orb {
  border-radius: 50%;
  filter: blur(12px);
  opacity: 0.85;
  z-index: 0;
}

.orb-one {
  width: 300px;
  height: 300px;
  top: -90px;
  left: -60px;
  background: radial-gradient(circle, rgba(255, 211, 142, 0.92) 0%, rgba(255, 211, 142, 0) 72%);
}

.orb-two {
  width: 360px;
  height: 360px;
  right: -80px;
  bottom: -120px;
  background: radial-gradient(circle, rgba(120, 144, 255, 0.34) 0%, rgba(120, 144, 255, 0) 72%);
}

.register-showcase,
.register-card {
  position: relative;
  z-index: 1;
}

.register-showcase {
  padding: 38px;
  border-radius: 32px;
  color: #f9f7f2;
  background:
    linear-gradient(165deg, rgba(10, 16, 42, 0.98) 0%, rgba(25, 35, 78, 0.96) 50%, rgba(61, 82, 154, 0.94) 100%);
  box-shadow: 0 34px 74px rgba(22, 30, 69, 0.26);
  display: flex;
  flex-direction: column;
  gap: 26px;
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
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 249, 238, 0.95);
  font-size: 12px;
  letter-spacing: 0.2em;
}

.showcase-tag.muted {
  color: rgba(224, 230, 255, 0.8);
}

.showcase-kicker {
  margin: 0;
  color: rgba(219, 184, 124, 0.96);
  letter-spacing: 0.28em;
  font-size: 12px;
}

.showcase-copy h1 {
  margin: 18px 0 0;
  font-size: 48px;
  line-height: 1.12;
  font-family: 'Georgia', 'Times New Roman', 'STSong', serif;
}

.showcase-desc {
  margin: 18px 0 0;
  max-width: 520px;
  line-height: 1.82;
  color: rgba(236, 241, 255, 0.84);
}

.role-switcher {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.switch-pill {
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 22px;
  padding: 16px 18px;
  background: rgba(255, 255, 255, 0.08);
  color: #fffaf2;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.switch-pill:hover {
  transform: translateY(-1px);
  border-color: rgba(219, 184, 124, 0.48);
}

.switch-pill span,
.switch-pill small {
  display: block;
}

.switch-pill span {
  font-size: 16px;
  font-weight: 700;
}

.switch-pill small {
  margin-top: 6px;
  color: rgba(226, 232, 255, 0.76);
}

.switch-pill.active {
  background: linear-gradient(135deg, rgba(255, 246, 227, 0.18), rgba(255, 255, 255, 0.08));
  border-color: rgba(219, 184, 124, 0.68);
  box-shadow: 0 16px 34px rgba(17, 24, 53, 0.18);
}

.highlight-list {
  display: grid;
  gap: 14px;
}

.highlight-card {
  padding: 18px 20px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.highlight-card strong {
  display: block;
  font-size: 17px;
  color: #fff7e7;
}

.highlight-card p {
  margin: 10px 0 0;
  line-height: 1.75;
  color: rgba(229, 235, 255, 0.8);
}

.note-card {
  margin-top: auto;
  padding: 24px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 247, 231, 0.14) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.note-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.note-head span {
  color: rgba(223, 230, 255, 0.8);
  font-size: 13px;
}

.note-head strong {
  color: #fff7e7;
  font-size: 18px;
}

.note-card ul {
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}

.note-card li {
  position: relative;
  padding-left: 18px;
  color: rgba(247, 249, 255, 0.92);
}

.note-card li::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(219, 184, 124, 0.96);
  box-shadow: 0 0 0 6px rgba(219, 184, 124, 0.12);
}

.register-card {
  border-radius: 30px;
  padding: 32px;
  background: rgba(255, 251, 245, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.72);
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

.login-link {
  padding: 0;
  color: #49578a;
}

.header {
  margin-top: 18px;
}

.header h2 {
  margin: 0;
  color: #171b40;
  font-size: 34px;
  font-family: 'Georgia', 'Times New Roman', 'STSong', serif;
}

.header p {
  margin: 12px 0 0;
  color: #67708f;
  line-height: 1.8;
}

.register-form {
  margin-top: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

.full-row {
  grid-column: 1 / -1;
}

.avatar-item {
  margin-bottom: 8px;
}

.upload-wrap {
  padding: 18px;
  border-radius: 22px;
  border: 1px dashed rgba(71, 89, 160, 0.22);
  background: linear-gradient(180deg, rgba(246, 249, 255, 0.94) 0%, rgba(255, 252, 247, 0.98) 100%);
}

.upload-tip {
  margin: 12px 0 0;
  color: #7a839f;
  font-size: 13px;
}

.btn-row {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.btn-row .el-button {
  min-width: 132px;
}

.register-card ::v-deep .el-form-item__label {
  padding-bottom: 8px;
  color: #2a3769;
  font-weight: 600;
}

.register-card ::v-deep .el-input__inner,
.register-card ::v-deep .el-textarea__inner {
  border-radius: 16px;
  border-color: rgba(36, 47, 93, 0.12);
  background: rgba(255, 255, 255, 0.84);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.register-card ::v-deep .el-input__inner {
  height: 48px;
}

.register-card ::v-deep .el-input__inner:focus,
.register-card ::v-deep .el-textarea__inner:focus {
  border-color: rgba(70, 94, 179, 0.6);
  box-shadow: 0 0 0 4px rgba(90, 112, 196, 0.1);
}

.register-card ::v-deep .el-button--primary {
  border: none;
  background: linear-gradient(135deg, #1f2d63 0%, #4660b5 100%);
  box-shadow: 0 14px 28px rgba(49, 65, 133, 0.2);
}

.register-card ::v-deep .el-button--default {
  border-color: rgba(36, 47, 93, 0.14);
  color: #304070;
}

.register-card ::v-deep .upload .upload-img,
.register-card ::v-deep .el-upload-list .el-upload-list__item,
.register-card ::v-deep .el-upload .el-icon-plus {
  width: 132px;
  height: 132px;
  line-height: 132px;
  border-radius: 16px;
  border: 1px dashed #d7def8;
  background: #f8faff;
}

@media (max-width: 1180px) {
  .register-page {
    grid-template-columns: 1fr;
    padding: 18px;
  }

  .register-showcase,
  .register-card {
    padding: 26px;
  }

  .showcase-copy h1 {
    font-size: 40px;
  }
}

@media (max-width: 720px) {
  .register-page {
    padding: 14px;
    gap: 16px;
  }

  .register-showcase,
  .register-card {
    padding: 22px;
    border-radius: 24px;
  }

  .showcase-copy h1 {
    font-size: 32px;
  }

  .role-switcher,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .card-top,
  .note-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-row {
    display: block;
  }

  .btn-row .el-button {
    width: 100%;
  }

  .btn-row .el-button + .el-button {
    margin-left: 0;
    margin-top: 12px;
  }
}
</style>
