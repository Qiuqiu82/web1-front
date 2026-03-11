<template>
  <div>
    <el-upload
      ref="upload"
      :action="getActionUrl"
      list-type="picture-card"
      :multiple="multiple"
      :limit="limit"
      :headers="myHeaders"
      :file-list="fileList"
      :on-exceed="handleExceed"
      :on-preview="handleUploadPreview"
      :on-remove="handleRemove"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadErr"
      :before-upload="handleBeforeUpload"
    >
      <i class="el-icon-plus"></i>
      <div slot="tip" class="el-upload__tip" style="color:#838fa1;">{{ tip }}</div>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible" size="tiny" append-to-body>
      <img width="100%" :src="dialogImageUrl" alt>
    </el-dialog>
  </div>
</template>

<script>
import storage from '@/common/storage'
import config from '@/config/config'

export default {
  props: ['tip', 'action', 'limit', 'multiple', 'fileUrls'],
  data() {
    return {
      baseUrl: config.baseUrl,
      dialogVisible: false,
      dialogImageUrl: '',
      fileList: [],
      fileUrlList: [],
      myHeaders: {}
    }
  },
  computed: {
    getActionUrl() {
      return this.baseUrl + this.action
    },
    uploadToken() {
      return storage.get('Token') || storage.get('token') || ''
    }
  },
  mounted() {
    this.init()
    this.myHeaders = {
      Token: this.uploadToken
    }
  },
  watch: {
    fileUrls() {
      this.init()
    }
  },
  methods: {
    init() {
      const values = this.parseInputUrls(this.fileUrls)
      this.fileUrlList = values.map((item) => this.normalizeRawPath(item)).filter(Boolean)
      this.fileList = values.map((item, index) => this.createUploadFile(item, index))
    },
    parseInputUrls(value) {
      if (!value) return []
      if (Array.isArray(value)) {
        return value.map((item) => String(item || '').trim()).filter(Boolean)
      }
      return String(value)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    },
    stripQuery(url) {
      return String(url || '').split('?')[0].trim()
    },
    normalizeRawPath(value) {
      const raw = this.stripQuery(value)
      if (!raw) return ''
      if (!/^https?:/i.test(raw)) {
        return raw.replace(/^\/+/, '')
      }
      const base = String(this.baseUrl || '').replace(/\/+$/, '')
      const normalizedBase = `${base}/`
      if (raw.indexOf(normalizedBase) === 0) {
        return raw.slice(normalizedBase.length).replace(/^\/+/, '')
      }
      const uploadIndex = raw.toLowerCase().indexOf('/upload/')
      if (uploadIndex >= 0) {
        return raw.slice(uploadIndex + 1)
      }
      return raw
    },
    buildPreviewUrl(value) {
      const raw = this.stripQuery(value)
      if (!raw) return ''
      if (/^https?:/i.test(raw)) {
        return raw
      }
      return `${String(this.baseUrl || '').replace(/\/+$/, '')}/${raw.replace(/^\/+/, '')}`
    },
    createUploadFile(value, index) {
      const rawPath = this.normalizeRawPath(value)
      const previewUrl = this.buildPreviewUrl(value)
      return {
        name: String(index),
        url: previewUrl,
        rawPath
      }
    },
    emitChange() {
      this.$emit('change', this.fileUrlList.join(','))
    },
    handleBeforeUpload() {},
    handleUploadSuccess(res, file, fileList) {
      if (res && res.code === 0 && res.file) {
        const rawPath = `upload/${res.file}`
        const latestIndex = fileList.length - 1
        if (latestIndex >= 0) {
          fileList[latestIndex].url = this.buildPreviewUrl(rawPath)
          fileList[latestIndex].rawPath = rawPath
        }
        this.setFileList(fileList)
        this.emitChange()
        return
      }
      this.$message.error((res && res.msg) || '文件上传失败')
    },
    handleUploadErr() {
      this.$message.error('文件上传失败')
    },
    handleRemove(file, fileList) {
      this.setFileList(fileList)
      this.emitChange()
    },
    handleUploadPreview(file) {
      this.dialogImageUrl = file.url || this.buildPreviewUrl(file.rawPath)
      this.dialogVisible = true
    },
    handleExceed() {
      this.$message.warning(`最多上传 ${this.limit} 张图片`)
    },
    setFileList(fileList) {
      const fileArray = []
      const fileUrlArray = []
      fileList.forEach((item, index) => {
        const rawPath = this.normalizeRawPath(item.rawPath || item.url)
        const previewUrl = this.buildPreviewUrl(item.url || rawPath)
        if (!rawPath || !previewUrl) return
        fileArray.push({
          name: item.name || String(index),
          url: previewUrl,
          rawPath
        })
        fileUrlArray.push(rawPath)
      })
      this.fileList = fileArray
      this.fileUrlList = fileUrlArray
    }
  }
}
</script>

<style lang="scss" scoped>
</style>