<template>
  <div class="cos-detail">
    <section class="head-panel">
      <div>
        <h2>{{ detail.fuzhuangmingcheng || '服装详情' }}</h2>
        <p>{{ detail.fuzhuangkuanshi || '款式待定' }}</p>
      </div>
      <el-button round @click="$router.push('/index/browse')">返回浏览</el-button>
    </section>

    <section class="detail-grid">
      <div class="gallery-card">
        <el-carousel v-if="detailBanner.length" height="520px" indicator-position="inside" class="banner">
          <el-carousel-item v-for="(img, i) in detailBanner" :key="i">
            <img :src="imgUrl(img)" class="banner-img" />
          </el-carousel-item>
        </el-carousel>
        <el-empty v-else description="暂无图片" :image-size="90" />
      </div>

      <div class="info-card">
        <div class="price">￥{{ Number(detail.fuzhuangjiage || 0).toFixed(2) }}</div>
        <div class="meta-item"><span>编号</span><b>{{ detail.fuzhuangbianhao || '-' }}</b></div>
        <div class="meta-item"><span>款式</span><b>{{ detail.fuzhuangkuanshi || '-' }}</b></div>
        <div class="meta-item"><span>面料</span><b>{{ detail.mianliaoleibie || '-' }}</b></div>
        <div class="meta-item"><span>热度</span><b>{{ detail.clicknum || 0 }}</b></div>

        <el-button type="primary" class="buy-btn" @click="openCustomize">立即定制</el-button>
      </div>
    </section>

    <section class="content-card">
      <div class="title">商品详情</div>
      <div class="content" v-html="detail.fuzhuangxiangqing || '暂无详情'" />
    </section>

    <el-dialog title="定制信息" :visible.sync="customizeDialogVisible" width="800px">
      <el-form :model="cartForm" label-width="110px" class="custom-form">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="商品">
              <el-input :value="detail.fuzhuangmingcheng" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数量">
              <el-input-number v-model="cartForm.quantity" :min="1" :max="99" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="尺码">
              <el-select v-model="cartForm.sizeCode" placeholder="选择尺码" style="width: 100%">
                <el-option v-for="s in sizeOptions" :key="s" :label="s" :value="s" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="面料">
              <el-select
                v-model="cartForm.materialName"
                placeholder="选择面料"
                style="width: 100%"
                :disabled="!materialOptions.length"
              >
                <el-option v-for="m in materialOptions" :key="m" :label="m" :value="m" />
              </el-select>
              <div v-if="!materialOptions.length" class="material-tip">当前无面料限制，将使用商品默认面料。</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="身材档案">
          <div class="body-row">
            <el-select v-model="selectedBodyProfileId" placeholder="选择档案" style="width: calc(100% - 140px)">
              <el-option
                v-for="item in bodyProfileOptions"
                :key="item.id"
                :label="bodyProfileLabel(item)"
                :value="item.id"
              />
            </el-select>
            <el-button type="text" @click="$router.push('/index/profile')">管理档案</el-button>
          </div>
          <div class="body-tip" v-if="selectedBodySnapshot.profileName">
            {{ selectedBodySnapshot.profileName }} ·
            身高{{ selectedBodySnapshot.heightCm }} / 体重{{ selectedBodySnapshot.weightKg }} /
            腰围{{ selectedBodySnapshot.waistCm }} / 胸围{{ selectedBodySnapshot.bustCm }} /
            臀围{{ selectedBodySnapshot.hipCm }} / 肩宽{{ selectedBodySnapshot.shoulderCm }}
          </div>
          <div v-else class="body-tip">未选择身材档案，仍可继续下单。</div>
        </el-form-item>

        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="版型轮廓">
              <el-select v-model="cartForm.silhouette" style="width: 100%">
                <el-option v-for="item in silhouetteOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="穿着松量">
              <el-select v-model="cartForm.fitType" style="width: 100%">
                <el-option v-for="item in fitTypeOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="配色主题">
          <el-input v-model="cartForm.colorTheme" placeholder="例如：蓝白、酒红金、黑银" />
        </el-form-item>

        <el-form-item label="工艺标签">
          <el-checkbox-group v-model="cartForm.craftTags">
            <el-checkbox v-for="item in craftTagOptions" :key="item" :label="item" />
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="配件标签">
          <el-checkbox-group v-model="cartForm.accessoryTags">
            <el-checkbox v-for="item in accessoryTagOptions" :key="item" :label="item" />
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="参考图片链接">
          <el-input
            v-model="cartForm.referenceImages"
            type="textarea"
            :rows="2"
            placeholder="多个链接请用逗号或换行分隔"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="cartForm.remark" type="textarea" :rows="3" placeholder="补充你的定制需求" />
        </el-form-item>

        <div class="summary-box">
          <div class="summary-title">快照摘要</div>
          <div class="summary-text">{{ designSummary }}</div>
          <div class="summary-tip" v-if="draftState.id">
            草稿编号： {{ draftState.id }} · 版本： {{ draftState.versionNo }}
          </div>
        </div>
      </el-form>

      <span slot="footer">
        <el-button @click="customizeDialogVisible = false">取消</el-button>
        <el-button :loading="draftSaving" @click="saveDraft(true)">保存草稿</el-button>
        <el-button type="primary" @click="addToCart">加入购物车</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
const SIZE_OPTIONS = ['S', 'M', 'L', 'XL']

export default {
  data() {
    return {
      tablename: 'remaicosfu',
      baseUrl: '',
      detail: {},
      detailBanner: [],
      customizeDialogVisible: false,
      materialOptions: [],
      bodyProfileOptions: [],
      selectedBodyProfileId: null,
      draftSaving: false,
      draftState: {
        id: null,
        versionNo: 1
      },
      silhouetteOptions: ['修身', '常规', '宽松', '伞摆', '直筒'],
      fitTypeOptions: ['常规', '宽松', '弹力', '舞台友好'],
      craftTagOptions: ['包边', '滚边', '暗扣', '隐形拉链', '拼色', '褶裥'],
      accessoryTagOptions: ['披风', '腰带', '臂章', '蝴蝶结', '金属扣', '可拆卸'],
      cartForm: {
        sizeCode: 'M',
        materialName: '',
        silhouette: '常规',
        fitType: '常规',
        colorTheme: '',
        craftTags: [],
        accessoryTags: [],
        referenceImages: '',
        quantity: 1,
        remark: ''
      }
    }
  },
  computed: {
    sizeOptions() {
      return SIZE_OPTIONS
    },
    selectedBodyProfile() {
      return this.bodyProfileOptions.find((item) => Number(item.id) === Number(this.selectedBodyProfileId)) || null
    },
    selectedBodySnapshot() {
      const item = this.selectedBodyProfile
      if (!item) {
        return {}
      }
      return {
        profileName: item.profileName,
        heightCm: item.heightCm,
        weightKg: item.weightKg,
        waistCm: item.waistCm,
        bustCm: item.bustCm,
        hipCm: item.hipCm,
        shoulderCm: item.shoulderCm,
        sizeCode: this.cartForm.sizeCode
      }
    },
    designSummary() {
      const parts = []
      if (this.cartForm.sizeCode) parts.push(`尺码:${this.cartForm.sizeCode}`)
      if (this.cartForm.materialName) parts.push(`面料:${this.cartForm.materialName}`)
      if (this.selectedBodySnapshot.profileName) parts.push(`身材:${this.selectedBodySnapshot.profileName}`)
      if (this.cartForm.silhouette) parts.push(`版型轮廓:${this.cartForm.silhouette}`)
      if (this.cartForm.fitType) parts.push(`松量:${this.cartForm.fitType}`)
      if (this.cartForm.colorTheme) parts.push(`配色:${this.cartForm.colorTheme}`)
      if (this.cartForm.craftTags.length) parts.push(`工艺:${this.cartForm.craftTags.join('|')}`)
      if (this.cartForm.accessoryTags.length) parts.push(`配件:${this.cartForm.accessoryTags.join('|')}`)
      return parts.length ? parts.join(' / ') : '默认定制'
    }
  },
  created() {
    this.baseUrl = this.$config.baseUrl
    const detailObj = this.$route.query.detailObj
    if (detailObj) {
      try {
        this.detail = JSON.parse(detailObj)
      } catch (e) {
        this.detail = {}
      }
    }
    if (this.detail.id || this.$route.query.id) {
      this.loadDetail(this.detail.id || this.$route.query.id)
    }
  },
  methods: {
    imgUrl(img) {
      if (!img) return ''
      return img.startsWith('http') ? img : this.baseUrl + img
    },
    bodyProfileLabel(item) {
      return `${item.profileName} (${item.heightCm}cm / ${item.weightKg}kg)`
    },
    normalizeBodyProfileRow(row) {
      return {
        id: row.id,
        profileName: row.profileName || row.profile_name || '默认档案',
        heightCm: Number(row.heightCm != null ? row.heightCm : row.height_cm || 0),
        weightKg: Number(row.weightKg != null ? row.weightKg : row.weight_kg || 0),
        waistCm: Number(row.waistCm != null ? row.waistCm : row.waist_cm || 0),
        bustCm: Number(row.bustCm != null ? row.bustCm : row.bust_cm || 0),
        hipCm: Number(row.hipCm != null ? row.hipCm : row.hip_cm || 0),
        shoulderCm: Number(row.shoulderCm != null ? row.shoulderCm : row.shoulder_cm || 0),
        isDefault: Number(row.isDefault != null ? row.isDefault : row.is_default || 0)
      }
    },
    ensureSizeCode(sizeCode) {
      const safe = String(sizeCode || '').trim().toUpperCase()
      if (this.sizeOptions.includes(safe)) {
        return safe
      }
      return 'M'
    },
    loadDetail(id) {
      this.$http.get(`${this.tablename}/detail/${id}`).then((res) => {
        if (res.data.code === 0 && res.data.data) {
          this.detail = res.data.data
          this.detailBanner = (this.detail.huawentuan || '')
            .split(',')
            .map((s) => s.trim())
            .filter((s) => !!s)
          this.loadMaterialOptions()
        }
      })
    },
    async loadMaterialOptions() {
      const styleName = this.detail.fuzhuangkuanshi || ''
      if (!styleName) {
        this.materialOptions = this.detail.mianliaoleibie ? [this.detail.mianliaoleibie] : []
        return
      }

      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosMaterialRuleByStyle,
        method: 'get',
        params: { styleName },
        showLoading: false
      })

      const rows = (res && res.code === 0 && (res.data || [])) || []
      const names = rows
        .map((item) => item.materialName || item.material_name || '')
        .map((name) => String(name).trim())
        .filter((name) => !!name)

      if (this.detail.mianliaoleibie) {
        names.push(String(this.detail.mianliaoleibie).trim())
      }

      this.materialOptions = Array.from(new Set(names))
    },
    async loadBodyProfiles() {
      const [pageRes, defaultRes] = await Promise.all([
        this.$proxy.Request({
          url: this.$proxy.Api.cosProfileBodyPage,
          method: 'get',
          showLoading: false,
          params: { page: 1, limit: 100 }
        }),
        this.$proxy.Request({
          url: this.$proxy.Api.cosProfileBodyDefault,
          method: 'get',
          showLoading: false
        })
      ])

      const rows = (pageRes && pageRes.code === 0 && pageRes.data && (pageRes.data.list || pageRes.data)) || []
      this.bodyProfileOptions = (Array.isArray(rows) ? rows : []).map(this.normalizeBodyProfileRow)

      const defaultRow = defaultRes && defaultRes.code === 0 ? defaultRes.data : null
      if (defaultRow && defaultRow.id) {
        this.selectedBodyProfileId = Number(defaultRow.id)
        return
      }
      const localDefault = this.bodyProfileOptions.find((item) => Number(item.isDefault) === 1)
      this.selectedBodyProfileId = localDefault ? Number(localDefault.id) : this.bodyProfileOptions[0] && Number(this.bodyProfileOptions[0].id)
    },
    resetFormDefaults() {
      this.cartForm.sizeCode = 'M'
      this.cartForm.materialName = this.materialOptions[0] || this.detail.mianliaoleibie || ''
      this.cartForm.silhouette = '常规'
      this.cartForm.fitType = '常规'
      this.cartForm.colorTheme = ''
      this.cartForm.craftTags = []
      this.cartForm.accessoryTags = []
      this.cartForm.referenceImages = ''
      this.cartForm.quantity = 1
      this.cartForm.remark = ''
      this.draftState = { id: null, versionNo: 1 }
    },
    async openCustomize() {
      if (!localStorage.getItem('Token')) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      await this.loadMaterialOptions()
      this.resetFormDefaults()
      await this.loadBodyProfiles()
      await this.loadLatestDraft()
      this.customizeDialogVisible = true
    },
    normalizeDraftRow(row) {
      if (!row) return null
      return {
        id: row.id,
        versionNo: Number(row.versionNo || row.version_no || 1),
        designSummary: row.designSummary || row.design_summary || '',
        designJson: row.designJson || row.design_json || '{}',
        sizeCode: row.sizeCode || row.size_code || '',
        materialName: row.materialName || row.material_name || '',
        colorTheme: row.colorTheme || row.color_theme || '',
        fitType: row.fitType || row.fit_type || '',
        silhouette: row.silhouette || '',
        craftTags: row.craftTags || row.craft_tags || '',
        accessoryTags: row.accessoryTags || row.accessory_tags || '',
        referenceImages: row.referenceImages || row.reference_images || '',
        customNote: row.customNote || row.custom_note || ''
      }
    },
    applyDraft(draft) {
      if (!draft) return
      this.draftState = {
        id: draft.id,
        versionNo: draft.versionNo || 1
      }

      let payload = {}
      try {
        payload = draft.designJson ? JSON.parse(draft.designJson) : {}
      } catch (e) {
        payload = {}
      }

      this.cartForm.sizeCode = this.ensureSizeCode(payload.sizeCode || draft.sizeCode || this.cartForm.sizeCode)
      this.cartForm.materialName = payload.materialName || draft.materialName || this.cartForm.materialName
      this.cartForm.silhouette = payload.silhouette || draft.silhouette || this.cartForm.silhouette
      this.cartForm.fitType = payload.fitType || draft.fitType || this.cartForm.fitType
      this.cartForm.colorTheme = payload.colorTheme || draft.colorTheme || ''
      this.cartForm.craftTags = Array.isArray(payload.craftTags)
        ? payload.craftTags
        : String(draft.craftTags || '')
            .split(',')
            .map((s) => s.trim())
            .filter((s) => !!s)
      this.cartForm.accessoryTags = Array.isArray(payload.accessoryTags)
        ? payload.accessoryTags
        : String(draft.accessoryTags || '')
            .split(',')
            .map((s) => s.trim())
            .filter((s) => !!s)
      this.cartForm.referenceImages = Array.isArray(payload.referenceImages)
        ? payload.referenceImages.join(',')
        : draft.referenceImages || ''
      this.cartForm.remark = payload.customNote || draft.customNote || ''

      const profileId = payload.bodyProfileId || (payload.bodyProfileSnapshot && payload.bodyProfileSnapshot.id)
      if (profileId) {
        this.selectedBodyProfileId = Number(profileId)
      }
    },
    async loadLatestDraft() {
      const productId = this.detail.id
      if (!productId) return

      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosCustomDesignLatest,
        method: 'get',
        showLoading: false,
        params: { productId }
      })

      if (!res || res.code !== 0 || !res.data) {
        return
      }
      const draft = this.normalizeDraftRow(res.data)
      this.applyDraft(draft)
    },
    parseMultiInput(input) {
      return String(input || '')
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter((s) => !!s)
    },
    buildBodyProfileSnapshot() {
      const body = this.selectedBodySnapshot
      if (!body || !body.profileName) {
        return {
          sizeCode: this.cartForm.sizeCode
        }
      }
      return {
        ...body,
        sizeCode: this.cartForm.sizeCode
      }
    },
    buildDesignPayload() {
      const bodyProfileSnapshot = this.buildBodyProfileSnapshot()
      return {
        productId: this.detail.id,
        productName: this.detail.fuzhuangmingcheng || '',
        styleName: this.detail.fuzhuangkuanshi || '',
        sizeCode: this.cartForm.sizeCode,
        materialName: this.cartForm.materialName,
        silhouette: this.cartForm.silhouette,
        fitType: this.cartForm.fitType,
        colorTheme: this.cartForm.colorTheme,
        craftTags: [...this.cartForm.craftTags],
        accessoryTags: [...this.cartForm.accessoryTags],
        referenceImages: this.parseMultiInput(this.cartForm.referenceImages),
        customNote: this.cartForm.remark,
        summary: this.designSummary,
        bodyProfileId: this.selectedBodyProfileId || null,
        bodyProfileSnapshot,
        snapshotAt: new Date().toISOString()
      }
    },
    async saveDraft(showMessage = true) {
      this.cartForm.sizeCode = this.ensureSizeCode(this.cartForm.sizeCode)
      if (!this.cartForm.sizeCode) {
        this.$message.warning('请选择尺码')
        return null
      }

      const payload = this.buildDesignPayload()
      this.draftSaving = true
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosCustomDesignSave,
        method: 'post',
        dataType: 'json',
        params: {
          id: this.draftState.id || undefined,
          productId: this.detail.id,
          productName: this.detail.fuzhuangmingcheng,
          styleName: this.detail.fuzhuangkuanshi,
          designSummary: this.designSummary,
          sizeCode: this.cartForm.sizeCode,
          materialName: this.cartForm.materialName,
          colorTheme: this.cartForm.colorTheme,
          fitType: this.cartForm.fitType,
          silhouette: this.cartForm.silhouette,
          craftTags: this.cartForm.craftTags,
          accessoryTags: this.cartForm.accessoryTags,
          referenceImages: this.parseMultiInput(this.cartForm.referenceImages),
          customNote: this.cartForm.remark,
          status: 'Draft',
          designPayload: payload
        }
      })
      this.draftSaving = false

      if (!res || res.code !== 0) {
        if (showMessage) {
          this.$message.error((res && res.msg) || '保存草稿失败')
        }
        return null
      }

      const draft = this.normalizeDraftRow(res.data)
      if (draft) {
        this.draftState.id = draft.id
        this.draftState.versionNo = draft.versionNo || 1
      }
      if (showMessage) {
        this.$message.success('草稿已保存')
      }
      return this.draftState.id
    },
    async addToCart() {
      const userId = Number(localStorage.getItem('userid') || localStorage.getItem('userId') || 0)
      const userTable = localStorage.getItem('sessionTable') || localStorage.getItem('UserTableName') || 'yonghu'
      if (!userId) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }

      this.cartForm.sizeCode = this.ensureSizeCode(this.cartForm.sizeCode)
      if (!this.cartForm.sizeCode) {
        this.$message.warning('请选择尺码')
        return
      }

      const draftId = await this.saveDraft(false)
      const quantity = Number(this.cartForm.quantity || 1)
      const price = Number(this.detail.fuzhuangjiage || 0)
      const firstCover = (this.detail.huawentuan || '').split(',')[0] || ''
      const snapshot = this.buildDesignPayload()

      const payload = {
        userId,
        userTable,
        productId: this.detail.id,
        productName: this.detail.fuzhuangmingcheng,
        productCover: firstCover,
        specs: this.designSummary,
        quantity,
        price,
        amount: (price * quantity).toFixed(2),
        checked: 1,
        customDraftId: draftId || this.draftState.id || undefined,
        customSummary: this.designSummary,
        customSnapshotVersion: this.draftState.versionNo || 1,
        customSnapshotJson: JSON.stringify(snapshot)
      }

      const res = await this.$proxy.Request({
        url: this.$proxy.Api.coscartAdd,
        method: 'post',
        dataType: 'json',
        params: payload
      })

      if (res && res.code === 0) {
        this.$message.success('已加入购物车')
        this.customizeDialogVisible = false
        this.$confirm('已加入购物车，是否前往购物车？', '提示', {
          type: 'success'
        })
          .then(() => this.$router.push('/index/coscart'))
          .catch(() => {})
      } else {
        this.$message.error((res && res.msg) || '加入购物车失败')
      }
    }
  }
}
</script>

<style scoped>
.cos-detail {
  display: grid;
  gap: 14px;
}

.head-panel {
  border-radius: 16px;
  border: 1px solid #e8edff;
  background: #fff;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.head-panel h2 {
  color: #263871;
  font-size: 30px;
}

.head-panel p {
  margin-top: 6px;
  color: #808cb4;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 12px;
}

.gallery-card,
.info-card,
.content-card {
  border-radius: 16px;
  border: 1px solid #e8edff;
  background: #fff;
  padding: 14px;
}

.banner {
  border-radius: 12px;
  overflow: hidden;
  background: #f3f6ff;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #f5f7ff;
}

.price {
  font-size: 38px;
  color: #2c3f81;
  font-weight: 700;
}

.meta-item {
  margin-top: 10px;
  border-radius: 10px;
  background: #f5f7ff;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  color: #4f5f95;
}

.meta-item span {
  color: #7f8ab2;
}

.buy-btn {
  margin-top: 14px;
  width: 100%;
  height: 42px;
  font-size: 15px;
}

.title {
  font-size: 18px;
  color: #2a3b75;
  font-weight: 700;
}

.content {
  margin-top: 10px;
  color: #525b7a;
  line-height: 1.85;
}

.custom-form {
  max-height: 62vh;
  overflow-y: auto;
  padding-right: 8px;
}

.material-tip,
.body-tip {
  margin-top: 6px;
  font-size: 12px;
  color: #8b96ba;
  line-height: 1.6;
}

.body-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.summary-box {
  margin-top: 10px;
  border-radius: 12px;
  border: 1px solid #dfe7ff;
  background: #f7f9ff;
  padding: 10px 12px;
}

.summary-title {
  font-size: 13px;
  font-weight: 700;
  color: #3e4e8d;
}

.summary-text {
  margin-top: 6px;
  color: #4f5f95;
  line-height: 1.7;
  font-size: 13px;
}

.summary-tip {
  margin-top: 6px;
  color: #8792b7;
  font-size: 12px;
}

@media (max-width: 1080px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>