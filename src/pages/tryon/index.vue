<template>
  <div class="tryon-page">
    <section class="tryon-topbar">
      <div class="topbar-copy">
        <span class="topbar-kicker">{{ texts.heroEyebrow }}</span>
      </div>
      <div class="topbar-actions">
        <el-button type="primary" plain @click="syncFromSession">{{ texts.sync }}</el-button>
        <el-button @click="goBrowse">{{ texts.goBrowse }}</el-button>
      </div>
    </section>

    <section v-if="!isLoggedIn" class="panel-card auth-card">
      <strong>{{ texts.loginTitle }}</strong>
      <el-button type="primary" @click="ensureLogin">{{ texts.loginAction }}</el-button>
    </section>

    <section v-else class="tryon-workspace">
      <aside class="panel-card stage-card input-stage">
        <div class="stage-head">
          <div class="stage-title">
            <span class="stage-index">01</span>
            <div>
              <h3>{{ texts.uploadTitle }}</h3>
            </div>
          </div>
          <span class="meta-chip">{{ currentSourceLabel }}</span>
        </div>

        <div v-if="productName || styleName" class="context-strip">
          <span v-if="productName" class="context-pill">{{ productName }}</span>
          <span v-if="styleName" class="context-pill subtle">{{ styleName }}</span>
        </div>

        <div class="upload-stack">
          <div class="upload-block">
            <div class="upload-head">
              <strong>{{ texts.personTitle }}</strong>
              <span>{{ texts.personHint }}</span>
            </div>
            <el-upload
              :key="personUploaderKey"
              ref="personUploader"
              class="image-uploader"
              drag
              :action="uploadAction"
              :headers="uploadHeaders"
              :show-file-list="false"
              :limit="1"
              accept="image/*"
              :before-upload="beforeImageUpload"
              :on-success="handlePersonUploadSuccess"
            >
              <div v-if="personImagePreview" class="image-preview-shell">
                <img :src="personImagePreview" :alt="texts.personTitle" class="image-preview">
                <div class="preview-mask">{{ texts.reupload }}</div>
              </div>
              <div v-else class="upload-placeholder">
                <i class="el-icon-picture-outline"></i>
                <strong>{{ texts.personPlaceholder }}</strong>
              </div>
            </el-upload>
          </div>

          <div class="upload-block">
            <div class="upload-head">
              <strong>{{ texts.garmentTitle }}</strong>
              <span>{{ texts.garmentHint }}</span>
            </div>
            <el-upload
              :key="garmentUploaderKey"
              ref="garmentUploader"
              class="image-uploader"
              drag
              :action="uploadAction"
              :headers="uploadHeaders"
              :show-file-list="false"
              :limit="1"
              accept="image/*"
              :before-upload="beforeImageUpload"
              :on-success="handleGarmentUploadSuccess"
            >
              <div v-if="garmentImagePreview" class="image-preview-shell">
                <img :src="garmentImagePreview" :alt="texts.garmentTitle" class="image-preview">
                <div class="preview-mask">{{ texts.reupload }}</div>
                <span v-if="garmentPrefilled" class="prefill-chip">{{ texts.prefilled }}</span>
              </div>
              <div v-else class="upload-placeholder garment-placeholder">
                <i class="el-icon-suitcase"></i>
                <strong>{{ texts.garmentPlaceholder }}</strong>
              </div>
            </el-upload>
          </div>
        </div>

        <div class="control-dock">
          <div class="control-block">
            <label>{{ texts.clothType }}</label>
            <el-radio-group v-model="clothType" size="small">
              <el-radio-button label="upper">{{ texts.upper }}</el-radio-button>
              <el-radio-button label="overall">{{ texts.overall }}</el-radio-button>
            </el-radio-group>
          </div>
          <div class="control-actions">
            <el-button :disabled="!hasAnyImage" @click="resetImages">{{ texts.reset }}</el-button>
            <el-button type="primary" :loading="creatingTask" :disabled="!canSubmit" @click="submitTryOn">{{ texts.generate }}</el-button>
          </div>
        </div>
      </aside>

      <section class="panel-card stage-card result-stage">
        <div class="stage-head result-head">
          <div class="stage-title">
            <span class="stage-index">02</span>
            <div>
              <h3>{{ texts.resultTitle }}</h3>
              <p>{{ statusDescription }}</p>
            </div>
          </div>
          <el-tag :type="statusTagType" size="mini">{{ statusLabel }}</el-tag>
        </div>

        <div class="result-canvas">
          <div v-if="isWorking" class="result-waiting">
            <div class="wait-orbit">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <strong>{{ statusLabel }}</strong>
            <p>{{ statusDescription }}</p>
          </div>

          <div v-else-if="resultImagePreview" class="result-preview-shell">
            <img :src="resultImagePreview" :alt="texts.resultTitle" class="result-preview">
          </div>

          <div v-else class="result-empty">
            <i class="el-icon-magic-stick"></i>
            <strong>{{ texts.resultEmptyTitle }}</strong>
          </div>
        </div>

        <div class="result-toolbar">
          <el-button v-if="resultImagePreview" type="primary" plain @click="downloadResult">{{ texts.download }}</el-button>
          <el-button v-if="resultImagePreview" @click="clearResult">{{ texts.retry }}</el-button>
        </div>
      </section>
    </section>
  </div>
</template>

<script>
import config from '@/config/config'
import { loadTryonContext } from '@/utils/Tryon'

const TEXTS = {
  heroEyebrow: '\u0041\u0049\u0020\u865a\u62df\u8bd5\u7a7f',
  heroTitle: '\u4e0a\u4f20\u771f\u4eba\u7167\u548c\u670d\u88c5\u56fe\uff0c\u751f\u6210\u4f60\u7684\u8bd5\u7a7f\u6548\u679c',
  heroDesc: '\u628a\u590d\u6742\u7684 3D \u53c2\u6570\u6539\u6210\u76f4\u63a5\u4e0a\u4f20\u56fe\u7247\u7684\u8bd5\u7a7f\u6d41\u7a0b\uff0c\u66f4\u9002\u5408\u5feb\u901f\u9884\u89c8\u4e0a\u8eab\u6548\u679c\u3002',
  sync: '\u540c\u6b65\u5546\u54c1\u4fe1\u606f',
  goBrowse: '\u53bb\u6d4f\u89c8\u66f4\u591a\u6b3e\u5f0f',
  loginTitle: '\u767b\u5f55\u540e\u5373\u53ef\u4f7f\u7528 AI\u8bd5\u7a7f',
  loginDesc: '\u4e3a\u4e86\u63a7\u5236\u751f\u6210\u8d44\u6e90\uff0c\u5f53\u524d\u8bd5\u7a7f\u529f\u80fd\u9700\u8981\u767b\u5f55\u540e\u624d\u80fd\u542f\u52a8\u3002',
  loginAction: '\u7acb\u5373\u767b\u5f55',
  uploadTitle: '\u8bd5\u7a7f\u8f93\u5165',
  uploadDesc: '\u5efa\u8bae\u4e0a\u4f20\u6e05\u6670\u7684\u5168\u8eab\u7167\u4e0e\u670d\u88c5\u56fe\uff0c\u4ee5\u83b7\u5f97\u66f4\u7a33\u5b9a\u7684\u751f\u6210\u6548\u679c\u3002',
  currentProduct: '\u5f53\u524d\u9884\u586b\u5546\u54c1',
  style: '\u98ce\u683c',
  personTitle: '\u6211\u7684\u5168\u8eab\u7167',
  personTip: '\u7ad6\u56fe\u3001\u6b63\u9762\u3001\u56db\u80a2\u5c3d\u91cf\u5b8c\u6574',
  personPlaceholder: '\u70b9\u51fb\u4e0a\u4f20\u5168\u8eab\u7167',
  personHint: '\u652f\u6301 jpg / png / webp',
  garmentTitle: '\u8981\u8bd5\u7a7f\u7684\u670d\u88c5\u56fe',
  garmentTip: '\u53ef\u76f4\u63a5\u4f7f\u7528\u5546\u54c1\u4e3b\u56fe\uff0c\u4e5f\u53ef\u4ee5\u91cd\u65b0\u4e0a\u4f20',
  garmentPlaceholder: '\u70b9\u51fb\u4e0a\u4f20\u670d\u88c5\u56fe',
  garmentHint: '\u5355\u4ef6\u670d\u88c5\u56fe\u6548\u679c\u66f4\u597d',
  reupload: '\u91cd\u65b0\u4e0a\u4f20',
  prefilled: '\u5546\u54c1\u9884\u586b',
  clothType: '\u670d\u88c5\u7c7b\u578b',
  upper: '\u4e0a\u88c5',
  overall: '\u5168\u8eab\u5957\u88c5',
  reset: '\u91cd\u7f6e\u56fe\u7247',
  generate: '\u5f00\u59cb AI\u8bd5\u7a7f',
  noticeTitle: '\u4f7f\u7528\u63d0\u793a',
  noticeList: [
    '\u4eba\u50cf\u7167\u5c3d\u91cf\u907f\u514d\u5927\u9762\u79ef\u906e\u6321\uff0c\u80cc\u666f\u7b80\u6d01\u4f1a\u66f4\u7a33\u5b9a\u3002',
    '\u670d\u88c5\u56fe\u5efa\u8bae\u9009\u62e9\u6b63\u9762\u6216\u5e73\u94fa\u56fe\uff0c\u4e0d\u8981\u4f7f\u7528\u8fc7\u5ea6\u88c1\u526a\u7684\u5c01\u9762\u3002',
    '\u8bd5\u7a7f\u751f\u6210\u901a\u5e38\u9700\u8981\u6570\u5341\u79d2\uff0c\u8bf7\u8010\u5fc3\u7b49\u5f85\u3002'
  ],
  resultTitle: '\u8bd5\u7a7f\u7ed3\u679c',
  generatingTitle: '\u6b63\u5728\u751f\u6210\u4e0a\u8eab\u6548\u679c',
  generatingDesc: '\u7cfb\u7edf\u4f1a\u81ea\u52a8\u8fdb\u884c\u4eba\u50cf\u5904\u7406\u3001\u906e\u7f69\u8bc6\u522b\u4e0e\u670d\u88c5\u5408\u6210\u3002',
  resultEmptyTitle: '\u7ed3\u679c\u5c06\u663e\u793a\u5728\u8fd9\u91cc',
  resultEmptyDesc: '\u5b8c\u6210\u56fe\u7247\u4e0a\u4f20\u540e\uff0c\u70b9\u51fb\u201c\u5f00\u59cb AI\u8bd5\u7a7f\u201d\u5373\u53ef\u751f\u6210\u3002',
  download: '\u4e0b\u8f7d\u7ed3\u679c',
  retry: '\u91cd\u65b0\u751f\u6210',
  queued: '\u6392\u961f\u4e2d',
  running: '\u751f\u6210\u4e2d',
  success: '\u5df2\u5b8c\u6210',
  failed: '\u751f\u6210\u5931\u8d25',
  idle: '\u5f85\u5f00\u59cb',
  sourceProduct: '\u5df2\u5e26\u5165\u5546\u54c1\u4e3b\u56fe',
  sourceUpload: '\u5df2\u4e0a\u4f20\u65b0\u670d\u88c5\u56fe',
  sourceManual: '\u5f85\u8865\u5145\u56fe\u7247'
}

export default {
  name: 'AiTryOnPage',
  data() {
    return {
      texts: TEXTS,
      baseUrl: config.baseUrl,
      tryonContext: null,
      clothType: 'upper',
      personImagePath: '',
      personImagePreview: '',
      personUploaderKey: 0,
      garmentImagePath: '',
      garmentImagePreview: '',
      garmentUploaderKey: 0,
      garmentPrefilled: false,
      creatingTask: false,
      pollTimer: null,
      taskId: '',
      taskStatus: 'idle',
      resultImagePath: '',
      resultImagePreview: '',
      taskMessage: '',
      loginPrompted: false
    }
  },
  computed: {
    isLoggedIn() {
      if (this.$parent) {
        this.$parent.authVersion
      }
      return !!localStorage.getItem('Token')
    },
    uploadAction() {
      return `${String(this.baseUrl || '').replace(/\/+$/, '')}/file/upload`
    },
    uploadHeaders() {
      const token = localStorage.getItem('Token') || localStorage.getItem('token') || ''
      return {
        Token: token,
        token
      }
    },
    productName() {
      return this.tryonContext && this.tryonContext.productName ? this.tryonContext.productName : ''
    },
    styleName() {
      return this.tryonContext && this.tryonContext.styleName ? this.tryonContext.styleName : ''
    },
    currentSourceLabel() {
      if (this.garmentImagePath) {
        return this.garmentPrefilled ? this.texts.sourceProduct : this.texts.sourceUpload
      }
      return this.texts.sourceManual
    },
    hasAnyImage() {
      return !!(this.personImagePath || this.garmentImagePath)
    },
    canSubmit() {
      return !!(this.personImagePath && this.garmentImagePath && !this.isWorking)
    },
    isWorking() {
      return this.creatingTask || this.taskStatus === 'queued' || this.taskStatus === 'running'
    },
    statusLabel() {
      if (this.taskStatus === 'queued') return this.texts.queued
      if (this.taskStatus === 'running') return this.texts.running
      if (this.taskStatus === 'success') return this.texts.success
      if (this.taskStatus === 'failed') return this.texts.failed
      return this.texts.idle
    },
    statusTagType() {
      if (this.taskStatus === 'success') return 'success'
      if (this.taskStatus === 'failed') return 'danger'
      if (this.isWorking) return 'warning'
      return 'info'
    },
    statusDescription() {
      if (this.taskMessage) return this.taskMessage
      if (this.taskStatus === 'queued') return this.texts.generatingDesc
      if (this.taskStatus === 'running') return this.texts.generatingDesc
      if (this.taskStatus === 'success') return '\u8bd5\u7a7f\u56fe\u5df2\u751f\u6210\uff0c\u53ef\u4ee5\u9884\u89c8\u6216\u4e0b\u8f7d\u3002'
      if (this.taskStatus === 'failed') return '\u672c\u6b21\u751f\u6210\u672a\u6210\u529f\uff0c\u53ef\u91cd\u65b0\u4e0a\u4f20\u6216\u518d\u8bd5\u4e00\u6b21\u3002'
      return this.texts.resultEmptyDesc
    }
  },
  created() {
    this.syncFromSession(false)
  },
  mounted() {
    if (!this.isLoggedIn) {
      this.ensureLogin(true)
    }
  },
  beforeDestroy() {
    this.clearPollTimer()
  },
  methods: {
    buildPreviewUrl(value) {
      const raw = String(value || '').trim()
      if (!raw) return ''
      if (/^https?:/i.test(raw)) return raw
      return `${String(this.baseUrl || '').replace(/\/+$/, '')}/${raw.replace(/^\/+/, '')}`
    },
    syncFromSession(showMessage = true) {
      const context = loadTryonContext()
      this.tryonContext = context || null
      if (!this.garmentPrefilled) {
        if (context && context.cover) {
          this.garmentImagePath = context.cover
          this.garmentImagePreview = this.buildPreviewUrl(context.cover)
          this.garmentPrefilled = true
        } else if (!this.resultImagePath) {
          this.garmentImagePath = ''
          this.garmentImagePreview = ''
          this.garmentPrefilled = false
        }
      }
      if (showMessage) {
        this.$message.success(context && context.cover ? '\u5df2\u540c\u6b65\u5f53\u524d\u5546\u54c1\u4e3b\u56fe' : '\u5f53\u524d\u6ca1\u6709\u53ef\u7528\u7684\u5546\u54c1\u9884\u586b\u4fe1\u606f')
      }
    },
    goBrowse() {
      this.$router.push('/index/browse')
    },
    ensureLogin(silent = false) {
      if (this.isLoggedIn) return true
      if (silent && this.loginPrompted) return false
      this.loginPrompted = true
      const redirect = { path: this.$route.path, query: { ...this.$route.query } }
      if (this.$parent && typeof this.$parent.openAuth === 'function') {
        this.$parent.openAuth('login', 'yonghu', redirect)
      } else {
        this.$authDialogBus.$emit('open', { mode: 'login', role: 'yonghu', redirect })
      }
      return false
    },
    beforeImageUpload(file) {
      const isImage = /^image\//.test(file.type) || /\.(png|jpe?g|webp|bmp)$/i.test(file.name || '')
      if (!isImage) {
        this.$message.error('\u53ea\u80fd\u4e0a\u4f20\u56fe\u7247\u6587\u4ef6')
        return false
      }
      const isValidSize = file.size / 1024 / 1024 <= 15
      if (!isValidSize) {
        this.$message.error('\u5355\u5f20\u56fe\u7247\u4e0d\u80fd\u8d85\u8fc7 15MB')
        return false
      }
      return true
    },
    handlePersonUploadSuccess(res) {
      this.handleUploadSuccess('person', res)
    },
    handleGarmentUploadSuccess(res) {
      this.handleUploadSuccess('garment', res)
    },
    handleUploadSuccess(kind, res) {
      if (!res || Number(res.code) !== 0 || !res.file) {
        this.$message.error((res && res.msg) || '\u56fe\u7247\u4e0a\u4f20\u5931\u8d25')
        return
      }
      const rawPath = `upload/${res.file}`
      const previewUrl = this.buildPreviewUrl(rawPath)
      if (kind === 'person') {
        this.personImagePath = rawPath
        this.personImagePreview = previewUrl
      } else {
        this.garmentImagePath = rawPath
        this.garmentImagePreview = previewUrl
        this.garmentPrefilled = false
      }
      this.$message.success('\u56fe\u7247\u4e0a\u4f20\u6210\u529f')
    },
    resetUploaderState() {
      const uploaders = ['personUploader', 'garmentUploader']
      uploaders.forEach((refName) => {
        const uploader = this.$refs[refName]
        if (uploader && typeof uploader.clearFiles === 'function') {
          uploader.clearFiles()
        }
      })
      this.personUploaderKey += 1
      this.garmentUploaderKey += 1
    },
    resetImages() {
      this.resetUploaderState()
      this.personImagePath = ''
      this.personImagePreview = ''
      this.garmentPrefilled = false
      this.clearResult()
      if (this.tryonContext && this.tryonContext.cover) {
        this.garmentImagePath = this.tryonContext.cover
        this.garmentImagePreview = this.buildPreviewUrl(this.tryonContext.cover)
        this.garmentPrefilled = true
      } else {
        this.garmentImagePath = ''
        this.garmentImagePreview = ''
      }
    },
    clearResult() {
      this.clearPollTimer()
      this.taskId = ''
      this.taskStatus = 'idle'
      this.taskMessage = ''
      this.resultImagePath = ''
      this.resultImagePreview = ''
      this.creatingTask = false
    },
    async submitTryOn() {
      if (!this.ensureLogin()) {
        return
      }
      if (!this.personImagePath) {
        this.$message.warning('\u8bf7\u5148\u4e0a\u4f20\u5168\u8eab\u7167')
        return
      }
      if (!this.garmentImagePath) {
        this.$message.warning('\u8bf7\u5148\u4e0a\u4f20\u6216\u9009\u62e9\u670d\u88c5\u56fe')
        return
      }
      this.clearResult()
      this.creatingTask = true
      this.taskStatus = 'queued'
      this.taskMessage = '\u6b63\u5728\u521b\u5efa\u8bd5\u7a7f\u4efb\u52a1\u2026'
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.tryonTaskCreate,
        method: 'post',
        dataType: 'json',
        showLoading: false,
        timeout: 60 * 1000,
        params: {
          personImage: this.personImagePath,
          garmentImage: this.garmentImagePath,
          clothType: this.clothType,
          sourcePage: this.$route.path,
          productId: this.tryonContext && this.tryonContext.productId ? this.tryonContext.productId : null
        }
      })
      this.creatingTask = false
      const code = Number(res && res.code)
      if (!res || (code !== 0 && code !== 200)) {
        this.taskStatus = 'failed'
        this.taskMessage = (res && res.msg) || '\u8bd5\u7a7f\u4efb\u52a1\u521b\u5efa\u5931\u8d25'
        return
      }
      const data = res.data || {}
      this.taskId = data.taskId || ''
      this.taskStatus = data.status || 'queued'
      this.taskMessage = '\u8bd5\u7a7f\u4efb\u52a1\u5df2\u63d0\u4ea4\uff0c\u6b63\u5728\u7b49\u5f85\u751f\u6210\u3002'
      if (!this.taskId) {
        this.taskStatus = 'failed'
        this.taskMessage = '\u8bd5\u7a7f\u4efb\u52a1\u7f3a\u5c11 taskId'
        return
      }
      this.pollTaskStatus(0)
    },
    clearPollTimer() {
      if (this.pollTimer) {
        clearTimeout(this.pollTimer)
        this.pollTimer = null
      }
    },
    scheduleNextPoll(attempt) {
      this.clearPollTimer()
      this.pollTimer = setTimeout(() => {
        this.pollTaskStatus(attempt + 1)
      }, 2500)
    },
    async pollTaskStatus(attempt = 0) {
      if (!this.taskId) return
      if (attempt > 180) {
        this.taskStatus = 'failed'
        this.taskMessage = '\u8bd5\u7a7f\u8017\u65f6\u8fc7\u957f\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5'
        return
      }
      const res = await this.$proxy.Request({
        url: `${this.$proxy.Api.tryonTaskStatusPrefix}${this.taskId}`,
        method: 'get',
        showLoading: false,
        showError: false,
        timeout: 20 * 1000
      })
      const code = Number(res && res.code)
      if (!res || (code !== 0 && code !== 200)) {
        this.taskStatus = 'failed'
        this.taskMessage = (res && res.msg) || '\u83b7\u53d6\u8bd5\u7a7f\u72b6\u6001\u5931\u8d25'
        return
      }
      const data = res.data || {}
      const status = String(data.status || '').toLowerCase()
      this.taskStatus = status || 'running'
      this.taskMessage = data.errorMessage || data.message || this.taskMessage
      if (status === 'success') {
        this.resultImagePath = data.resultImageUrl || ''
        this.resultImagePreview = this.buildPreviewUrl(this.resultImagePath)
        this.taskMessage = '\u8bd5\u7a7f\u751f\u6210\u5b8c\u6210\uff0c\u53ef\u76f4\u63a5\u9884\u89c8\u6216\u4e0b\u8f7d\u3002'
        return
      }
      if (status === 'failed') {
        this.taskMessage = data.errorMessage || '\u8bd5\u7a7f\u751f\u6210\u5931\u8d25'
        return
      }
      this.taskMessage = status === 'queued'
        ? '\u4efb\u52a1\u5df2\u8fdb\u5165\u961f\u5217\uff0c\u5373\u5c06\u5f00\u59cb\u751f\u6210\u3002'
        : '\u6a21\u578b\u6b63\u5728\u5408\u6210\u8bd5\u7a7f\u6548\u679c\uff0c\u8bf7\u518d\u7b49\u5f85\u4e00\u4f1a\u3002'
      this.scheduleNextPoll(attempt)
    },
    downloadResult() {
      if (!this.resultImagePreview) return
      const link = document.createElement('a')
      link.href = this.resultImagePreview
      link.target = '_blank'
      link.download = `ai-tryon-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
}
</script>

<style scoped>
.tryon-page {
  --tryon-bg: #f4f6fb;
  --tryon-panel: rgba(255, 255, 255, 0.88);
  --tryon-line: rgba(32, 48, 92, 0.1);
  --tryon-line-strong: rgba(48, 73, 138, 0.16);
  --tryon-text: #1f2a4a;
  --tryon-muted: #7280a7;
  --tryon-accent: #4566ff;
  --tryon-accent-soft: rgba(69, 102, 255, 0.08);
  --tryon-radius: 28px;
  font-family: 'Avenir Next', 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  display: grid;
  gap: 18px;
  padding: 8px 0 18px;
  color: var(--tryon-text);
}

.tryon-topbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(38, 56, 107, 0.08);
}

.topbar-copy {
  display: grid;
  gap: 6px;
}

.topbar-kicker {
  display: inline-flex;
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(69, 102, 255, 0.12);
  color: #5a73d7;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.topbar-copy h2 {
  margin: 0;
  max-width: 680px;
  font-size: 32px;
  line-height: 1.08;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.topbar-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: flex-start;
}

.panel-card {
  background: var(--tryon-panel);
  border: 1px solid var(--tryon-line);
  border-radius: var(--tryon-radius);
  box-shadow: none;
  backdrop-filter: blur(18px);
}

.auth-card {
  min-height: 120px;
  padding: 24px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.auth-card strong {
  font-size: 18px;
  font-weight: 700;
}

.tryon-workspace {
  display: grid;
  grid-template-columns: 420px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.stage-card {
  min-height: 720px;
}

.input-stage {
  padding: 20px;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
  gap: 16px;
}

.result-stage {
  padding: 20px;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 16px;
}

.stage-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.stage-title {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}

.stage-index {
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid rgba(69, 102, 255, 0.16);
  background: rgba(69, 102, 255, 0.05);
  color: var(--tryon-accent);
  font-size: 12px;
  font-weight: 700;
}

.stage-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.stage-title p {
  margin: 4px 0 0;
  color: var(--tryon-muted);
  line-height: 1.6;
  font-size: 13px;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 11px;
  border-radius: 999px;
  background: #121b33;
  color: #fff;
  font-size: 12px;
  white-space: nowrap;
}

.context-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.context-pill {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(46, 68, 124, 0.1);
  background: rgba(247, 249, 255, 0.92);
  color: #2a3e78;
  font-size: 12px;
}

.context-pill.subtle {
  color: var(--tryon-muted);
}

.upload-stack {
  display: grid;
  gap: 14px;
  min-height: 0;
}

.upload-block {
  display: grid;
  gap: 10px;
}

.upload-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.upload-head strong {
  font-size: 14px;
  font-weight: 700;
}

.upload-head span {
  color: var(--tryon-muted);
  font-size: 12px;
}

.image-uploader,
.image-uploader ::v-deep .el-upload,
.image-uploader ::v-deep .el-upload-dragger {
  width: 100%;
}

.image-uploader ::v-deep .el-upload-dragger {
  height: 100%;
  min-height: 264px;
  overflow: hidden;
  border-radius: 24px;
  border: 1px dashed rgba(58, 84, 150, 0.16);
  background: linear-gradient(180deg, rgba(248, 250, 255, 0.98) 0%, rgba(242, 246, 255, 0.92) 100%);
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.image-uploader:hover ::v-deep .el-upload-dragger {
  border-color: rgba(69, 102, 255, 0.28);
  transform: translateY(-1px);
}

.image-preview-shell {
  position: relative;
  width: 100%;
  height: 264px;
  padding: 18px;
  background:
    radial-gradient(circle at top, rgba(102, 128, 255, 0.14), transparent 55%),
    linear-gradient(180deg, #f9fbff 0%, #f1f5ff 100%);
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.preview-mask {
  position: absolute;
  left: 16px;
  bottom: 16px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(16, 24, 47, 0.76);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.prefill-chip {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(69, 102, 255, 0.92);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.upload-placeholder {
  min-height: 264px;
  padding: 24px;
  display: grid;
  place-items: center;
  text-align: center;
  color: var(--tryon-muted);
}

.upload-placeholder i {
  font-size: 30px;
  color: var(--tryon-accent);
  margin-bottom: 10px;
}

.upload-placeholder strong {
  display: block;
  color: #22335e;
  font-size: 15px;
  font-weight: 700;
}

.control-dock {
  display: grid;
  gap: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(40, 58, 108, 0.08);
  align-items: start;
}

.control-block {
  display: grid;
  gap: 10px;
}

.control-block label {
  color: #31467f;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.control-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: flex-start;
}

.result-head .stage-title {
  min-width: 0;
}

.result-canvas {
  min-height: 0;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid var(--tryon-line-strong);
  background:
    radial-gradient(circle at top, rgba(91, 110, 245, 0.12), transparent 52%),
    linear-gradient(180deg, #fafcff 0%, #f2f6ff 100%);
}

.result-waiting,
.result-empty,
.result-preview-shell {
  width: 100%;
  height: 100%;
  min-height: 560px;
}

.result-waiting,
.result-empty {
  display: grid;
  place-items: center;
  text-align: center;
  padding: 32px 28px;
}

.result-waiting strong,
.result-empty strong {
  display: block;
  margin-top: 14px;
  font-size: 22px;
  font-weight: 700;
}

.result-waiting p,
.result-empty p {
  margin: 8px 0 0;
  max-width: 360px;
  color: var(--tryon-muted);
  line-height: 1.7;
}

.result-empty i {
  font-size: 40px;
  color: var(--tryon-accent);
}

.wait-orbit {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.wait-orbit span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f66ff, #81b9ff);
  animation: waitPulse 1.2s infinite ease-in-out;
  box-shadow: 0 10px 18px rgba(79, 102, 255, 0.18);
}

.wait-orbit span:nth-child(2) {
  animation-delay: 0.18s;
}

.wait-orbit span:nth-child(3) {
  animation-delay: 0.36s;
}

.result-preview-shell {
  padding: 18px;
}

.result-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.result-toolbar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

@keyframes waitPulse {
  0%,
  80%,
  100% {
    transform: translateY(0) scale(0.92);
    opacity: 0.32;
  }
  40% {
    transform: translateY(-8px) scale(1);
    opacity: 1;
  }
}

@media (max-width: 1180px) {
  .tryon-workspace {
    grid-template-columns: 1fr;
  }

  .stage-card {
    min-height: auto;
  }

  .result-waiting,
  .result-empty,
  .result-preview-shell {
    min-height: 440px;
  }
}

@media (max-width: 768px) {
  .tryon-topbar,
  .auth-card,
  .stage-head,
  .upload-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .topbar-copy h2 {
    font-size: 24px;
  }

  .panel-card,
  .auth-card,
  .input-stage,
  .result-stage {
    border-radius: 22px;
  }

  .input-stage,
  .result-stage,
  .auth-card {
    padding: 18px;
  }

  .image-uploader ::v-deep .el-upload-dragger,
  .image-preview-shell,
  .upload-placeholder,
  .result-waiting,
  .result-empty,
  .result-preview-shell {
    min-height: 280px;
    height: 280px;
  }

  .result-preview {
    min-height: 244px;
  }

  .result-toolbar,
  .control-actions,
  .topbar-actions {
    width: 100%;
  }
}
</style>
