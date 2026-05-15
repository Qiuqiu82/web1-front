<template>
  <div class="profile-page">
    <section class="header-panel">
      <div>
        <h2>个人中心</h2>
      </div>
    </section>

    <el-empty
      v-if="!isUser"
      description="当前角色无权限编辑此页面"
      :image-size="90"
    />

    <section v-else class="panel">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="个人资料" name="profile">
          <div class="profile-card" v-loading="profileLoading">
            <div class="profile-summary">
              <div class="profile-avatar-preview">
                <img v-if="profileAvatarUrl" :src="profileAvatarUrl" alt="头像" />
                <span v-else>{{ profileInitial }}</span>
              </div>
              <div>
                <div class="summary-kicker">USER PROFILE</div>
                <h3>{{ profileForm.yonghuxingming || profileForm.yonghuzhanghao || '我的资料' }}</h3>
              </div>
            </div>

            <el-form
              ref="profileFormRef"
              :model="profileForm"
              :rules="profileRules"
              label-width="88px"
              class="user-profile-form"
            >
              <el-form-item label="头像">
                <file-upload
                  action="file/upload"
                  :limit="1"
                  :multiple="false"
                  :file-urls="profileForm.touxiang"
                  tip="建议上传正方形头像，支持 JPG/PNG"
                  @change="handleProfileAvatarChange"
                />
              </el-form-item>
              <el-form-item label="账号">
                <el-input v-model="profileForm.yonghuzhanghao" disabled />
              </el-form-item>
              <el-form-item label="昵称" prop="yonghuxingming">
                <el-input
                  v-model.trim="profileForm.yonghuxingming"
                  maxlength="50"
                  show-word-limit
                  placeholder="请输入昵称"
                />
              </el-form-item>
              <el-form-item label="性别" prop="xingbie">
                <el-radio-group v-model="profileForm.xingbie">
                  <el-radio label="女">女</el-radio>
                  <el-radio label="男">男</el-radio>
                  <el-radio label="保密">保密</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="profileSaving" @click="saveProfile">保存</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="地址簿" name="address">
          <div class="toolbar">
            <el-button type="primary" size="mini" @click="openAddressDialog()">新增地址</el-button>
          </div>
          <el-table :data="addressList" border>
            <el-table-column prop="receiverName" label="收货人" width="120" />
            <el-table-column prop="receiverPhone" label="手机号" width="140" />
            <el-table-column label="地址" min-width="300">
              <template slot-scope="scope">
                {{ formatAddress(scope.row) }}
              </template>
            </el-table-column>
            <el-table-column label="默认" width="90" align="center">
              <template slot-scope="scope">
                <el-tag v-if="Number(scope.row.isDefault) === 1" size="mini" type="success">是</el-tag>
                <span v-else class="muted">-</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
              <template slot-scope="scope">
                <el-button type="text" size="mini" @click="openAddressDialog(scope.row)">编辑</el-button>
                <el-button type="text" size="mini" @click="setAddressDefault(scope.row)">设为默认</el-button>
                <el-button type="text" class="danger" size="mini" @click="deleteAddress(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="身材档案" name="body">
          <div class="toolbar">
            <el-button type="primary" size="mini" @click="openBodyDialog()">新增档案</el-button>
          </div>
          <el-table :data="bodyList" border>
            <el-table-column prop="profileName" label="档案名称" min-width="140" />
            <el-table-column label="身高(cm)" width="110" align="center">
              <template slot-scope="scope">{{ scope.row.heightCm }}</template>
            </el-table-column>
            <el-table-column label="体重(kg)" width="110" align="center">
              <template slot-scope="scope">{{ scope.row.weightKg }}</template>
            </el-table-column>
            <el-table-column label="腰围/胸围/臀围/肩宽" min-width="240">
              <template slot-scope="scope">
                {{ scope.row.waistCm }} / {{ scope.row.bustCm }} / {{ scope.row.hipCm }} / {{ scope.row.shoulderCm }}
              </template>
            </el-table-column>
            <el-table-column label="默认" width="90" align="center">
              <template slot-scope="scope">
                <el-tag v-if="Number(scope.row.isDefault) === 1" size="mini" type="success">是</el-tag>
                <span v-else class="muted">-</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
              <template slot-scope="scope">
                <el-button type="text" size="mini" @click="openBodyDialog(scope.row)">编辑</el-button>
                <el-button type="text" size="mini" @click="setBodyDefault(scope.row)">设为默认</el-button>
                <el-button type="text" class="danger" size="mini" @click="deleteBody(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </section>

    <el-dialog :title="addressForm.id ? '编辑地址' : '新增地址'" :visible.sync="addressDialogVisible" width="560px">
      <el-form ref="addressFormRef" :model="addressForm" :rules="addressRules" label-width="110px">
        <el-form-item label="收货人" prop="receiverName">
          <el-input v-model.trim="addressForm.receiverName" maxlength="60" />
        </el-form-item>
        <el-form-item label="手机号" prop="receiverPhone">
          <el-input v-model.trim="addressForm.receiverPhone" maxlength="11" />
        </el-form-item>
        <el-form-item label="省/市/区">
          <div class="triple-row">
            <el-input v-model.trim="addressForm.province" placeholder="省份" />
            <el-input v-model.trim="addressForm.city" placeholder="城市" />
            <el-input v-model.trim="addressForm.district" placeholder="区县" />
          </div>
        </el-form-item>
        <el-form-item label="详细地址" prop="detailAddress">
          <el-input v-model.trim="addressForm.detailAddress" type="textarea" :rows="3" maxlength="255" show-word-limit />
        </el-form-item>
        <el-form-item label="默认">
          <el-switch v-model="addressForm.isDefault" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addressDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="addressSaving" @click="saveAddress">保存</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="bodyForm.id ? '编辑身材档案' : '新增身材档案'" :visible.sync="bodyDialogVisible" width="560px">
      <el-form ref="bodyFormRef" :model="bodyForm" :rules="bodyRules" label-width="110px">
        <el-form-item label="档案名称" prop="profileName">
          <el-input v-model.trim="bodyForm.profileName" maxlength="60" />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="身高(cm)" prop="heightCm">
              <el-input-number v-model="bodyForm.heightCm" :min="120" :max="220" :precision="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="体重(kg)" prop="weightKg">
              <el-input-number v-model="bodyForm.weightKg" :min="30" :max="180" :precision="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="腰围(cm)" prop="waistCm">
              <el-input-number v-model="bodyForm.waistCm" :min="40" :max="160" :precision="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="胸围(cm)" prop="bustCm">
              <el-input-number v-model="bodyForm.bustCm" :min="40" :max="160" :precision="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="臀围(cm)" prop="hipCm">
              <el-input-number v-model="bodyForm.hipCm" :min="40" :max="160" :precision="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="肩宽(cm)" prop="shoulderCm">
              <el-input-number v-model="bodyForm.shoulderCm" :min="30" :max="70" :precision="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="默认">
          <el-switch v-model="bodyForm.isDefault" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="bodyDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="bodySaving" @click="saveBody">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
const PHONE_REG = /^1\d{10}$/

export default {
  name: 'ProfileCenter',
  data() {
    return {
      activeTab: 'profile',
      profileLoading: false,
      profileSaving: false,
      profileRaw: {},
      profileForm: this.createProfileForm(),
      addressList: [],
      bodyList: [],
      addressDialogVisible: false,
      bodyDialogVisible: false,
      addressSaving: false,
      bodySaving: false,
      addressForm: this.createAddressForm(),
      bodyForm: this.createBodyForm(),
      profileRules: {
        yonghuxingming: [
          { required: true, message: '请输入昵称', trigger: 'blur' },
          { max: 50, message: '昵称最多 50 个字符', trigger: 'blur' }
        ],
        xingbie: [{ required: true, message: '请选择性别', trigger: 'change' }]
      },
      addressRules: {
        receiverName: [{ required: true, message: '请输入收货人', trigger: 'blur' }],
        receiverPhone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            validator: (_, value, callback) => {
              if (!PHONE_REG.test(String(value || ''))) {
                callback(new Error('手机号格式不正确'))
                return
              }
              callback()
            },
            trigger: 'blur'
          }
        ],
        detailAddress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
      },
      bodyRules: {
        profileName: [{ required: true, message: '请输入档案名称', trigger: 'blur' }],
        heightCm: [{ required: true, message: '请输入身高', trigger: 'change' }],
        weightKg: [{ required: true, message: '请输入体重', trigger: 'change' }],
        waistCm: [{ required: true, message: '请输入腰围', trigger: 'change' }],
        bustCm: [{ required: true, message: '请输入胸围', trigger: 'change' }],
        hipCm: [{ required: true, message: '请输入臀围', trigger: 'change' }],
        shoulderCm: [{ required: true, message: '请输入肩宽', trigger: 'change' }]
      }
    }
  },
  computed: {
    isUser() {
      const table = localStorage.getItem('sessionTable') || localStorage.getItem('UserTableName') || ''
      return table === 'yonghu'
    },
    profileAvatarUrl() {
      return this.toFileUrl(this.profileForm.touxiang)
    },
    profileInitial() {
      const name = String(this.profileForm.yonghuxingming || this.profileForm.yonghuzhanghao || '用户').trim()
      return name ? name.slice(0, 1) : '用'
    }
  },
  created() {
    if (!this.isUser) return
    this.loadAll()
  },
  methods: {
    createProfileForm() {
      return {
        id: null,
        yonghuzhanghao: '',
        yonghuxingming: '',
        touxiang: '',
        xingbie: '保密',
        lianxifangshi: '',
        shentishuju: ''
      }
    },
    createAddressForm() {
      return {
        id: null,
        receiverName: '',
        receiverPhone: '',
        province: '',
        city: '',
        district: '',
        detailAddress: '',
        isDefault: 0,
        status: '启用'
      }
    },
    createBodyForm() {
      return {
        id: null,
        profileName: '',
        heightCm: null,
        weightKg: null,
        waistCm: null,
        bustCm: null,
        hipCm: null,
        shoulderCm: null,
        isDefault: 0,
        status: '启用'
      }
    },
    normalizeAddress(row) {
      return {
        id: row.id,
        receiverName: row.receiverName || row.receiver_name || '',
        receiverPhone: row.receiverPhone || row.receiver_phone || '',
        province: row.province || '',
        city: row.city || '',
        district: row.district || '',
        detailAddress: row.detailAddress || row.detail_address || '',
        isDefault: Number(row.isDefault != null ? row.isDefault : row.is_default || 0),
        status: row.status || '启用'
      }
    },
    normalizeBody(row) {
      return {
        id: row.id,
        profileName: row.profileName || row.profile_name || '',
        heightCm: Number(row.heightCm != null ? row.heightCm : row.height_cm || 0),
        weightKg: Number(row.weightKg != null ? row.weightKg : row.weight_kg || 0),
        waistCm: Number(row.waistCm != null ? row.waistCm : row.waist_cm || 0),
        bustCm: Number(row.bustCm != null ? row.bustCm : row.bust_cm || 0),
        hipCm: Number(row.hipCm != null ? row.hipCm : row.hip_cm || 0),
        shoulderCm: Number(row.shoulderCm != null ? row.shoulderCm : row.shoulder_cm || 0),
        isDefault: Number(row.isDefault != null ? row.isDefault : row.is_default || 0),
        status: row.status || '启用'
      }
    },
    normalizeProfile(row = {}) {
      return {
        id: row.id || null,
        yonghuzhanghao: row.yonghuzhanghao || '',
        yonghuxingming: row.yonghuxingming || '',
        touxiang: this.normalizeFilePath(row.touxiang || ''),
        xingbie: row.xingbie || '保密',
        lianxifangshi: row.lianxifangshi || '',
        shentishuju: row.shentishuju || ''
      }
    },
    normalizeFilePath(value) {
      const raw = String(value || '').trim()
      if (!raw) return ''
      if (!/^https?:/i.test(raw)) return raw.replace(/^\/+/, '')
      const base = String(this.$config.baseUrl || '').replace(/\/+$/, '')
      if (raw.indexOf(`${base}/`) === 0) {
        return raw.slice(base.length + 1).replace(/^\/+/, '')
      }
      const uploadIndex = raw.toLowerCase().indexOf('/upload/')
      return uploadIndex >= 0 ? raw.slice(uploadIndex + 1) : raw
    },
    toFileUrl(value) {
      const raw = String(value || '').trim()
      if (!raw) return ''
      if (/^https?:/i.test(raw)) return raw
      return `${String(this.$config.baseUrl || '').replace(/\/+$/, '')}/${raw.replace(/^\/+/, '')}`
    },
    formatAddress(row) {
      if (!row) return ''
      return `${row.province || ''}${row.city || ''}${row.district || ''}${row.detailAddress || ''}`
    },
    async loadAll() {
      await Promise.all([this.loadProfile(), this.loadAddressList(), this.loadBodyList()])
    },
    async loadProfile() {
      this.profileLoading = true
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.yonghuSession,
        method: 'get',
        showLoading: false,
        showError: false
      })
      this.profileLoading = false
      if (!res || res.code !== 0) return
      const data = res.data || {}
      this.profileRaw = data
      this.profileForm = this.normalizeProfile(data)
    },
    async loadAddressList() {
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosProfileAddressPage,
        method: 'get',
        showLoading: false,
        params: { page: 1, limit: 100 }
      })
      if (!res || res.code !== 0) return
      const rows = (res.data && (res.data.list || res.data)) || []
      this.addressList = (Array.isArray(rows) ? rows : []).map(this.normalizeAddress)
    },
    async loadBodyList() {
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosProfileBodyPage,
        method: 'get',
        showLoading: false,
        params: { page: 1, limit: 100 }
      })
      if (!res || res.code !== 0) return
      const rows = (res.data && (res.data.list || res.data)) || []
      this.bodyList = (Array.isArray(rows) ? rows : []).map(this.normalizeBody)
    },
    openAddressDialog(row) {
      this.addressForm = row ? { ...this.normalizeAddress(row) } : this.createAddressForm()
      this.addressDialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.addressFormRef) this.$refs.addressFormRef.clearValidate()
      })
    },
    openBodyDialog(row) {
      this.bodyForm = row ? { ...this.normalizeBody(row) } : this.createBodyForm()
      this.bodyDialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.bodyFormRef) this.$refs.bodyFormRef.clearValidate()
      })
    },
    handleProfileAvatarChange(fileUrls) {
      this.profileForm.touxiang = this.normalizeFilePath(fileUrls)
    },
    saveProfile() {
      this.$refs.profileFormRef.validate(async (valid) => {
        if (!valid) return
        if (!this.profileForm.id) {
          this.$message.error('用户信息加载失败，请刷新后重试')
          return
        }
        this.profileSaving = true
        const payload = {
          ...this.profileRaw,
          id: this.profileForm.id,
          yonghuzhanghao: this.profileForm.yonghuzhanghao,
          yonghuxingming: this.profileForm.yonghuxingming,
          touxiang: this.normalizeFilePath(this.profileForm.touxiang),
          xingbie: this.profileForm.xingbie,
          lianxifangshi: this.profileForm.lianxifangshi,
          shentishuju: this.profileForm.shentishuju
        }
        let res = null
        try {
          res = await this.$proxy.Request({
            url: this.$proxy.Api.yonghuUpdate,
            method: 'post',
            dataType: 'json',
            params: payload
          })
        } finally {
          this.profileSaving = false
        }
        if (!res || res.code !== 0) {
          this.$message.error((res && res.msg) || '保存个人资料失败')
          return
        }
        this.$message.success('个人资料已保存')
        localStorage.setItem('username', this.profileForm.yonghuxingming || this.profileForm.yonghuzhanghao)
        await this.loadProfile()
      })
    },
    saveAddress() {
      this.$refs.addressFormRef.validate(async (valid) => {
        if (!valid) return
        this.addressSaving = true
        const api = this.addressForm.id ? this.$proxy.Api.cosProfileAddressUpdate : this.$proxy.Api.cosProfileAddressSave
        const res = await this.$proxy.Request({
          url: api,
          method: 'post',
          dataType: 'json',
          params: { ...this.addressForm }
        })
        this.addressSaving = false
        if (!res || res.code !== 0) {
          this.$message.error((res && res.msg) || '保存地址失败')
          return
        }
        this.$message.success('地址已保存')
        this.addressDialogVisible = false
        this.loadAddressList()
      })
    },
    saveBody() {
      this.$refs.bodyFormRef.validate(async (valid) => {
        if (!valid) return
        this.bodySaving = true
        const api = this.bodyForm.id ? this.$proxy.Api.cosProfileBodyUpdate : this.$proxy.Api.cosProfileBodySave
        const res = await this.$proxy.Request({
          url: api,
          method: 'post',
          dataType: 'json',
          params: { ...this.bodyForm }
        })
        this.bodySaving = false
        if (!res || res.code !== 0) {
          this.$message.error((res && res.msg) || '保存身材档案失败')
          return
        }
        this.$message.success('身材档案已保存')
        this.bodyDialogVisible = false
        this.loadBodyList()
      })
    },
    async deleteAddress(row) {
      const ok = await this.$confirm('确认删除该地址吗？', '提示', { type: 'warning' })
        .then(() => true)
        .catch(() => false)
      if (!ok) return

      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosProfileAddressDelete,
        method: 'post',
        dataType: 'json',
        params: { id: row.id }
      })
      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '删除失败')
        return
      }
      this.$message.success('已删除')
      this.loadAddressList()
    },
    async deleteBody(row) {
      const ok = await this.$confirm('确认删除该身材档案吗？', '提示', { type: 'warning' })
        .then(() => true)
        .catch(() => false)
      if (!ok) return

      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosProfileBodyDelete,
        method: 'post',
        dataType: 'json',
        params: { id: row.id }
      })
      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '删除失败')
        return
      }
      this.$message.success('已删除')
      this.loadBodyList()
    },
    async setAddressDefault(row) {
      const res = await this.$proxy.Request({
        url: `${this.$proxy.Api.cosProfileAddressSetDefaultPrefix}${row.id}`,
        method: 'post',
        dataType: 'json',
        params: {}
      })
      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '设置默认失败')
        return
      }
      this.$message.success('默认地址已更新')
      this.loadAddressList()
    },
    async setBodyDefault(row) {
      const res = await this.$proxy.Request({
        url: `${this.$proxy.Api.cosProfileBodySetDefaultPrefix}${row.id}`,
        method: 'post',
        dataType: 'json',
        params: {}
      })
      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '设置默认失败')
        return
      }
      this.$message.success('默认身材档案已更新')
      this.loadBodyList()
    }
  }
}
</script>

<style scoped>
.profile-page {
  display: grid;
  gap: 14px;
}

.header-panel,
.panel {
  border-radius: 16px;
  border: 1px solid #e8edff;
  background: #fff;
  padding: 16px;
}

.header-panel h2 {
  color: #27386f;
  font-size: 26px;
}

.header-panel p {
  margin-top: 6px;
  color: #8090b3;
}

.toolbar {
  margin-bottom: 10px;
  display: flex;
  justify-content: flex-end;
}

.profile-card {
  max-width: 760px;
  padding: 8px 4px 18px;
}

.profile-summary {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 24px;
  padding: 18px;
  border-radius: 18px;
  background:
    radial-gradient(circle at 18% 10%, rgba(64, 158, 255, 0.18), transparent 28%),
    linear-gradient(135deg, #f8fbff 0%, #fff7f1 100%);
  border: 1px solid #e8edff;
}

.profile-avatar-preview {
  width: 86px;
  height: 86px;
  flex: 0 0 auto;
  border-radius: 20px;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #3f8cff 0%, #1dc9a0 100%);
  color: #fff;
  font-size: 30px;
  font-weight: 700;
  box-shadow: 0 14px 30px rgba(63, 140, 255, 0.22);
}

.profile-avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.summary-kicker {
  margin-bottom: 4px;
  color: #6d83bd;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.profile-summary h3 {
  margin: 0;
  color: #22356b;
  font-size: 22px;
}

.profile-summary p {
  margin: 8px 0 0;
  color: #7b89a8;
  line-height: 1.7;
}

.user-profile-form {
  max-width: 560px;
}

.user-profile-form ::v-deep .el-upload--picture-card,
.user-profile-form ::v-deep .el-upload-list--picture-card .el-upload-list__item {
  width: 96px;
  height: 96px;
  line-height: 96px;
  border-radius: 12px;
}

.user-profile-form ::v-deep .el-input__inner {
  border-radius: 8px;
}

.triple-row {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.muted {
  color: #9aa5c2;
}

.danger {
  color: #e25555;
}

@media (max-width: 900px) {
  .profile-summary {
    align-items: flex-start;
    flex-direction: column;
  }

  .triple-row {
    grid-template-columns: 1fr;
  }
}
</style>
