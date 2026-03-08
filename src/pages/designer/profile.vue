<template>
  <div class="designer-profile-page">
    <section class="hero-card profile-card-shell">
      <div class="hero-copy">
        <span class="section-kicker">资料档案</span>
        <h2>把个人介绍、作品案例和履约成果，沉淀成一张可持续经营的设计师名片</h2>
        <p>
          本页负责两件核心事情：维护设计师资料，以及把已交付订单沉淀为作品案例库。
          资料越完整、案例越清晰，后续工作台、沟通页和收益页的信息就越可信。
        </p>
        <div class="hero-actions">
          <el-button type="primary" icon="el-icon-edit" @click="openProfileDialog">编辑个人资料</el-button>
          <el-button icon="el-icon-plus" @click="openPortfolioDialog('create')">新增作品</el-button>
          <el-button icon="el-icon-refresh" :loading="loading" @click="loadData">刷新</el-button>
        </div>
      </div>
      <div class="hero-side">
        <div class="avatar-frame">
          <img v-if="profileAvatar" :src="profileAvatar" alt="设计师头像" />
          <div v-else class="avatar-placeholder">{{ nameInitial }}</div>
        </div>
        <div class="identity-block">
          <strong>{{ displayName }}</strong>
          <span>账号：{{ profile.account || '-' }}</span>
        </div>
        <div class="completion-card">
          <div class="completion-top">
            <span>资料完整度</span>
            <strong>{{ completionPercent }}%</strong>
          </div>
          <div class="completion-track">
            <div class="completion-fill" :style="{ width: `${completionPercent}%` }"></div>
          </div>
          <p>{{ completionHint }}</p>
        </div>
      </div>
    </section>

    <section class="metric-grid">
      <article v-for="item in metricCards" :key="item.label" class="metric-card">
        <div class="metric-icon" :style="{ background: item.bg }">
          <i :class="item.icon"></i>
        </div>
        <div>
          <div class="metric-label">{{ item.label }}</div>
          <div class="metric-value">{{ item.value }}</div>
          <div class="metric-sub">{{ item.sub }}</div>
        </div>
      </article>
    </section>

    <section class="content-grid">
      <article class="panel-card profile-panel">
        <div class="panel-head">
          <div>
            <h3>个人资料</h3>
            <p>当前读取设计师 session，并支持保存头像、联系方式、擅长方向与个人简介。</p>
          </div>
          <el-button type="text" @click="openProfileDialog">编辑</el-button>
        </div>
        <div class="profile-detail-grid">
          <div class="detail-item">
            <span>设计师姓名</span>
            <strong>{{ profile.name || '-' }}</strong>
          </div>
          <div class="detail-item">
            <span>设计师账号</span>
            <strong>{{ profile.account || '-' }}</strong>
          </div>
          <div class="detail-item">
            <span>联系方式</span>
            <strong>{{ profile.phone || '-' }}</strong>
          </div>
          <div class="detail-item">
            <span>擅长方向</span>
            <div class="tag-wrap">
              <el-tag v-for="tag in specialtyTags" :key="tag" size="mini" effect="plain">{{ tag }}</el-tag>
              <span v-if="!specialtyTags.length" class="empty-inline">暂未填写</span>
            </div>
          </div>
        </div>
        <div class="intro-panel">
          <div class="intro-title">个人简介</div>
          <div class="intro-text">{{ profile.intro || '暂未填写简介，建议补充风格特长、服务经验和交付特点。' }}</div>
        </div>
      </article>

      <article class="panel-card portfolio-panel">
        <div class="panel-head portfolio-head">
          <div>
            <h3>作品集管理</h3>
            <p>仅管理当前设计师自己的作品，案例订单只能关联已发货或已完成订单。</p>
          </div>
          <div class="toolbar-actions">
            <el-input
              v-model.trim="filters.keyword"
              size="small"
              clearable
              placeholder="搜索作品标题、标签或简介"
              class="toolbar-input"
              @keyup.enter.native="handleFilter"
              @clear="handleFilter"
            />
            <el-select v-model="filters.status" size="small" clearable placeholder="全部状态" @change="handleFilter">
              <el-option label="启用" value="启用" />
              <el-option label="隐藏" value="隐藏" />
            </el-select>
            <el-button size="small" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
            <el-button size="small" icon="el-icon-plus" @click="openPortfolioDialog('create')">新增作品</el-button>
          </div>
        </div>

        <el-table v-loading="loading" :data="portfolioList" class="portfolio-table">
          <el-table-column label="封面" width="92">
            <template slot-scope="scope">
              <div class="cover-cell">
                <img v-if="scope.row.coverImageUrl" :src="scope.row.coverImageUrl" alt="作品封面" />
                <div v-else class="cover-fallback">无图</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="作品信息" min-width="260">
            <template slot-scope="scope">
              <div class="work-title">{{ scope.row.title || '-' }}</div>
              <div class="work-intro">{{ scope.row.intro || '暂无简介' }}</div>
              <div class="tag-wrap compact-tags">
                <el-tag v-for="tag in scope.row.tagList.slice(0, 4)" :key="tag" size="mini" effect="plain">{{ tag }}</el-tag>
                <span v-if="!scope.row.tagList.length" class="empty-inline">未设置标签</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="90">
            <template slot-scope="scope">
              <el-tag :type="scope.row.status === '启用' ? 'success' : 'info'" size="mini">{{ scope.row.status || '启用' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="排序" width="80" prop="sortOrder" />
          <el-table-column label="案例订单" min-width="220">
            <template slot-scope="scope">
              <div class="order-summary">
                <div class="order-summary-count">已关联 {{ scope.row.linkedOrderCount }} 单</div>
                <div v-if="scope.row.linkedOrderNoList.length" class="order-chip-row">
                  <span v-for="no in scope.row.linkedOrderNoList.slice(0, 3)" :key="no" class="order-chip">{{ no }}</span>
                  <span v-if="scope.row.linkedOrderNoList.length > 3" class="order-chip muted">+{{ scope.row.linkedOrderNoList.length - 3 }}</span>
                </div>
                <span v-else class="empty-inline">暂未关联订单</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250" fixed="right">
            <template slot-scope="scope">
              <div class="table-actions">
                <el-button size="mini" type="primary" plain @click="openPortfolioDialog('edit', scope.row)">编辑</el-button>
                <el-button size="mini" @click="openLinkDialog(scope.row)">关联订单</el-button>
                <el-button size="mini" type="danger" plain @click="removePortfolio(scope.row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrap">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next"
            :current-page="filters.page"
            :page-size="filters.limit"
            :page-sizes="[6, 10, 20]"
            :total="portfolioTotal"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </article>
    </section>

    <el-dialog title="编辑个人资料" :visible.sync="profileDialogVisible" width="640px">
      <el-form :model="profileForm" label-width="96px" class="dialog-form">
        <el-form-item label="设计师姓名">
          <el-input v-model.trim="profileForm.shejishixingming" maxlength="30" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="头像">
          <file-upload
            action="file/upload"
            :limit="1"
            :multiple="false"
            :file-urls="profileForm.touxiang"
            tip="建议上传 1 张清晰头像"
            @change="(val) => { profileForm.touxiang = val }"
          />
        </el-form-item>
        <el-form-item label="联系方式">
          <el-input v-model.trim="profileForm.lianxifangshi" maxlength="50" placeholder="请输入手机号、微信或常用联系方式" />
        </el-form-item>
        <el-form-item label="擅长方向">
          <el-input v-model.trim="profileForm.zhuanchang" maxlength="100" placeholder="例如：洛丽塔、女仆、军装、兽耳、舞台服" />
        </el-form-item>
        <el-form-item label="个人简介">
          <el-input
            v-model.trim="profileForm.jianjie"
            type="textarea"
            :rows="5"
            maxlength="300"
            show-word-limit
            placeholder="介绍你的设计风格、服务特点和交付经验"
          />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="profileDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="profileSubmitting" @click="submitProfile">保存资料</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="portfolioMode === 'create' ? '新增作品' : '编辑作品'" :visible.sync="portfolioDialogVisible" width="760px">
      <el-form :model="portfolioForm" label-width="96px" class="dialog-form">
        <el-form-item label="作品标题">
          <el-input v-model.trim="portfolioForm.title" maxlength="40" placeholder="请输入作品标题" />
        </el-form-item>
        <el-form-item label="封面图片">
          <file-upload
            action="file/upload"
            :limit="1"
            :multiple="false"
            :file-urls="portfolioForm.coverImage"
            tip="建议上传 1 张封面图"
            @change="(val) => { portfolioForm.coverImage = val }"
          />
        </el-form-item>
        <el-form-item label="作品图集">
          <file-upload
            action="file/upload"
            :limit="8"
            :multiple="true"
            :file-urls="portfolioForm.imageListValue"
            tip="可上传多张作品细节图"
            @change="(val) => { portfolioForm.imageListValue = val }"
          />
        </el-form-item>
        <el-form-item label="风格标签">
          <el-input v-model.trim="portfolioForm.styleTags" maxlength="120" placeholder="多个标签请用逗号分隔，例如：学院风,女仆,甜酷" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="portfolioForm.status">
            <el-radio-button label="启用" />
            <el-radio-button label="隐藏" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序值">
          <el-input-number v-model="portfolioForm.sortOrder" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="作品简介">
          <el-input
            v-model.trim="portfolioForm.intro"
            type="textarea"
            :rows="5"
            maxlength="500"
            show-word-limit
            placeholder="说明设计灵感、面料特点、制作亮点或适用场景"
          />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="portfolioDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="portfolioSubmitting" @click="submitPortfolio">保存作品</el-button>
      </span>
    </el-dialog>

    <el-dialog title="关联案例订单" :visible.sync="orderDialogVisible" width="720px">
      <div class="link-dialog-head">
        <strong>{{ currentPortfolioTitle || '未选择作品' }}</strong>
        <p>仅可选择当前设计师自己名下、且已发货或已完成的订单作为案例。</p>
      </div>
      <el-checkbox-group v-model="selectedOrderIds" v-loading="orderOptionsLoading" class="order-option-group">
        <label v-for="item in orderOptions" :key="item.id" class="order-option-item">
          <el-checkbox :label="item.id">
            <span class="order-option-title">{{ item.orderNo || `订单 ${item.id}` }}</span>
            <span class="order-option-meta">{{ item.orderStatus }} · ¥{{ formatMoney(item.totalAmount) }} · {{ item.addtime || '-' }}</span>
          </el-checkbox>
        </label>
      </el-checkbox-group>
      <el-empty v-if="!orderOptionsLoading && !orderOptions.length" description="暂无可关联的订单" :image-size="90" />
      <span slot="footer">
        <el-button @click="orderDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="orderSubmitting" @click="submitOrderLinks">保存关联</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'DesignerProfile',
  data() {
    return {
      baseUrl: this.$config.baseUrl,
      loading: false,
      profileSubmitting: false,
      portfolioSubmitting: false,
      orderOptionsLoading: false,
      orderSubmitting: false,
      profileDialogVisible: false,
      portfolioDialogVisible: false,
      orderDialogVisible: false,
      portfolioMode: 'create',
      currentPortfolioId: null,
      currentPortfolioTitle: '',
      profile: {
        id: '',
        account: '',
        name: '',
        avatar: '',
        phone: '',
        specialty: '',
        intro: ''
      },
      profileForm: {
        shejishixingming: '',
        touxiang: '',
        lianxifangshi: '',
        zhuanchang: '',
        jianjie: ''
      },
      filters: {
        page: 1,
        limit: 6,
        keyword: '',
        status: ''
      },
      portfolioList: [],
      portfolioTotal: 0,
      portfolioStats: {
        total: 0,
        enabledCount: 0,
        orderLinkCount: 0
      },
      portfolioForm: {
        id: null,
        title: '',
        coverImage: '',
        imageListValue: '',
        styleTags: '',
        intro: '',
        status: '启用',
        sortOrder: 0
      },
      orderOptions: [],
      selectedOrderIds: [],
      linkedOrderIdsSnapshot: []
    }
  },
  computed: {
    displayName() {
      return this.profile.name || localStorage.getItem('username') || '设计师'
    },
    profileAvatar() {
      return this.toFileUrl(this.profile.avatar)
    },
    nameInitial() {
      const name = this.displayName || '设计师'
      return String(name).slice(0, 1)
    },
    specialtyTags() {
      return this.splitTags(this.profile.specialty)
    },
    completionPercent() {
      const fields = [this.profile.name, this.profile.avatar, this.profile.phone, this.profile.specialty, this.profile.intro]
      const done = fields.filter((item) => String(item || '').trim()).length
      return Math.round((done / fields.length) * 100)
    },
    completionHint() {
      if (this.completionPercent >= 100) {
        return '资料已完整，可继续沉淀作品和案例订单。'
      }
      if (this.completionPercent >= 60) {
        return '建议补齐头像或简介，提升用户与管理员对你的识别度。'
      }
      return '当前资料仍较少，建议尽快完善基础信息。'
    },
    metricCards() {
      return [
        {
          label: '作品总数',
          value: this.portfolioStats.total,
          sub: '当前设计师名下的作品条目',
          icon: 'el-icon-picture-outline',
          bg: 'linear-gradient(135deg, rgba(86, 110, 255, 0.18), rgba(93, 224, 255, 0.22))'
        },
        {
          label: '启用作品',
          value: this.portfolioStats.enabledCount,
          sub: '面向后续展示的有效作品数',
          icon: 'el-icon-medal-1',
          bg: 'linear-gradient(135deg, rgba(102, 126, 234, 0.18), rgba(167, 139, 250, 0.20))'
        },
        {
          label: '关联案例',
          value: this.portfolioStats.orderLinkCount,
          sub: '累计沉淀到作品集的订单案例',
          icon: 'el-icon-collection-tag',
          bg: 'linear-gradient(135deg, rgba(74, 144, 226, 0.18), rgba(138, 196, 255, 0.2))'
        },
        {
          label: '资料完成度',
          value: `${this.completionPercent}%`,
          sub: '头像、专长、简介和联系方式覆盖情况',
          icon: 'el-icon-user-solid',
          bg: 'linear-gradient(135deg, rgba(100, 149, 237, 0.18), rgba(144, 205, 244, 0.2))'
        }
      ]
    }
  },  created() {
    this.loadData()
  },
  methods: {
    formatMoney(value) {
      return Number(value || 0).toFixed(2)
    },
    safeText(...values) {
      for (let i = 0; i < values.length; i += 1) {
        const value = values[i]
        if (value !== undefined && value !== null && String(value).trim() !== '') {
          return String(value).trim()
        }
      }
      return ''
    },
    parseNumber(value, fallback = 0) {
      const num = Number(value)
      return Number.isFinite(num) ? num : fallback
    },
    toFileUrl(url) {
      const raw = String(url || '').trim()
      if (!raw) return ''
      if (/^https?:/i.test(raw)) return raw
      return `${this.baseUrl}${raw}`
    },
    splitTags(value) {
      return String(value || '')
        .split(/[，,、\s]+/)
        .map((item) => item.trim())
        .filter(Boolean)
    },
    parseImageList(raw) {
      if (!raw) return []
      if (Array.isArray(raw)) {
        return raw.map((item) => String(item || '').trim()).filter(Boolean)
      }
      const text = String(raw).trim()
      if (!text) return []
      if (text.startsWith('[')) {
        try {
          const list = JSON.parse(text)
          if (Array.isArray(list)) {
            return list.map((item) => String(item || '').trim()).filter(Boolean)
          }
        } catch (e) {
          return []
        }
      }
      return text.split(',').map((item) => item.trim()).filter(Boolean)
    },
    normalizePortfolioRows(rows = []) {
      return rows.map((item) => {
        const linkedOrderNos = this.safeText(item.linkedOrderNos, item.linked_order_nos)
        const imageListRaw = this.safeText(item.imageListJson, item.image_list_json)
        const coverImage = this.safeText(item.coverImage, item.cover_image)
        return {
          id: item.id,
          title: this.safeText(item.title),
          coverImage,
          coverImageUrl: this.toFileUrl(coverImage),
          imageListJson: imageListRaw,
          imageListValue: this.parseImageList(imageListRaw).join(','),
          styleTags: this.safeText(item.styleTags, item.style_tags),
          tagList: this.splitTags(this.safeText(item.styleTags, item.style_tags)),
          intro: this.safeText(item.intro),
          status: this.safeText(item.status) || '启用',
          sortOrder: this.parseNumber(this.safeText(item.sortOrder, item.sort_order), 0),
          addtime: this.safeText(item.addtime),
          linkedOrderCount: this.parseNumber(this.safeText(item.linkedOrderCount, item.linked_order_count), 0),
          linkedOrderNos,
          linkedOrderNoList: linkedOrderNos ? linkedOrderNos.split(/[，,、]+/).map((part) => part.trim()).filter(Boolean) : []
        }
      })
    },
    normalizeOrderOptions(rows = []) {
      return rows.map((item) => ({
        id: item.id,
        orderNo: this.safeText(item.orderNo, item.order_no),
        orderStatus: this.safeText(item.orderStatus, item.order_status),
        totalAmount: this.parseNumber(this.safeText(item.totalAmount, item.total_amount), 0),
        addtime: this.safeText(item.addtime),
        linked: Number(item.linked) === 1 || item.linked === true
      }))
    },
    resetPortfolioForm() {
      this.portfolioForm = {
        id: null,
        title: '',
        coverImage: '',
        imageListValue: '',
        styleTags: '',
        intro: '',
        status: '启用',
        sortOrder: 0
      }
    },
    async loadProfile() {
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.shejishiSession,
        method: 'get',
        showLoading: false,
        showError: false
      })
      const data = (res && res.data) || {}
      this.profile = {
        id: data.id || '',
        account: this.safeText(data.shejishizhanghao),
        name: this.safeText(data.shejishixingming),
        avatar: this.safeText(data.touxiang),
        phone: this.safeText(data.lianxifangshi),
        specialty: this.safeText(data.zhuanchang),
        intro: this.safeText(data.jianjie)
      }
      return !!res
    },
    async loadPortfolios() {
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.designerPortfolioPage,
        method: 'get',
        showLoading: false,
        showError: false,
        params: {
          page: this.filters.page,
          limit: this.filters.limit,
          keyword: this.filters.keyword,
          status: this.filters.status
        }
      })
      const data = (res && res.data) || {}
      this.portfolioList = this.normalizePortfolioRows(data.list || [])
      this.portfolioTotal = this.parseNumber(data.total, 0)
      const stats = data.stats || {}
      this.portfolioStats = {
        total: this.parseNumber(stats.total, this.portfolioTotal),
        enabledCount: this.parseNumber(stats.enabledCount, 0),
        orderLinkCount: this.parseNumber(stats.orderLinkCount, 0)
      }
      return !!res
    },
    async loadData() {
      this.loading = true
      try {
        const [profileOk, portfolioOk] = await Promise.all([this.loadProfile(), this.loadPortfolios()])
        if (!profileOk || !portfolioOk) {
          this.$message.warning('部分资料加载失败，已展示当前可用内容')
        }
      } finally {
        this.loading = false
      }
    },
    handleFilter() {
      this.filters.page = 1
      this.loadPortfolios()
    },
    handleSizeChange(size) {
      this.filters.limit = size
      this.filters.page = 1
      this.loadPortfolios()
    },
    handleCurrentChange(page) {
      this.filters.page = page
      this.loadPortfolios()
    },
    openProfileDialog() {
      this.profileForm = {
        shejishixingming: this.profile.name,
        touxiang: this.profile.avatar,
        lianxifangshi: this.profile.phone,
        zhuanchang: this.profile.specialty,
        jianjie: this.profile.intro
      }
      this.profileDialogVisible = true
    },
    async submitProfile() {
      if (!String(this.profileForm.shejishixingming || '').trim()) {
        this.$message.warning('请先填写设计师姓名')
        return
      }
      this.profileSubmitting = true
      try {
        const res = await this.$proxy.Request({
          url: this.$proxy.Api.shejishiUpdateMyProfile,
          method: 'post',
          dataType: 'json',
          params: { ...this.profileForm }
        })
        if (!res) return
        this.$message.success(res.msg || '资料已更新')
        this.profileDialogVisible = false
        await this.loadProfile()
      } finally {
        this.profileSubmitting = false
      }
    },
    openPortfolioDialog(mode, row) {
      this.portfolioMode = mode
      if (mode === 'edit' && row) {
        this.portfolioForm = {
          id: row.id,
          title: row.title,
          coverImage: row.coverImage,
          imageListValue: row.imageListValue,
          styleTags: row.styleTags,
          intro: row.intro,
          status: row.status || '启用',
          sortOrder: row.sortOrder || 0
        }
      } else {
        this.resetPortfolioForm()
      }
      this.portfolioDialogVisible = true
    },
    async submitPortfolio() {
      if (!String(this.portfolioForm.title || '').trim()) {
        this.$message.warning('请输入作品标题')
        return
      }
      this.portfolioSubmitting = true
      try {
        const isCreate = this.portfolioMode === 'create'
        const res = await this.$proxy.Request({
          url: isCreate ? this.$proxy.Api.designerPortfolioSave : this.$proxy.Api.designerPortfolioUpdate,
          method: 'post',
          dataType: 'json',
          params: {
            id: this.portfolioForm.id,
            title: this.portfolioForm.title,
            coverImage: this.portfolioForm.coverImage,
            imageListJson: this.portfolioForm.imageListValue,
            styleTags: this.portfolioForm.styleTags,
            intro: this.portfolioForm.intro,
            status: this.portfolioForm.status,
            sortOrder: this.portfolioForm.sortOrder
          }
        })
        if (!res) return
        this.$message.success(res.msg || (isCreate ? '作品已新增' : '作品已更新'))
        this.portfolioDialogVisible = false
        await this.loadPortfolios()
      } finally {
        this.portfolioSubmitting = false
      }
    },
    removePortfolio(row) {
      this.$confirm(`确定删除作品“${row.title || row.id}”吗？`, '提示', {
        type: 'warning'
      })
        .then(async () => {
          const res = await this.$proxy.Request({
            url: this.$proxy.Api.designerPortfolioDelete,
            method: 'post',
            dataType: 'json',
            params: { ids: [row.id] }
          })
          if (!res) return
          this.$message.success(res.msg || '作品已删除')
          if (this.portfolioList.length === 1 && this.filters.page > 1) {
            this.filters.page -= 1
          }
          await this.loadPortfolios()
        })
        .catch(() => {})
    },
    async openLinkDialog(row) {
      this.currentPortfolioId = row.id
      this.currentPortfolioTitle = row.title
      this.orderDialogVisible = true
      this.orderOptionsLoading = true
      try {
        const res = await this.$proxy.Request({
          url: this.$proxy.Api.designerPortfolioOrderOptions,
          method: 'get',
          showLoading: false,
          showError: false,
          params: { portfolioId: row.id }
        })
        const list = this.normalizeOrderOptions((res && res.data) || [])
        this.orderOptions = list
        this.selectedOrderIds = list.filter((item) => item.linked).map((item) => item.id)
        this.linkedOrderIdsSnapshot = [...this.selectedOrderIds]
        if (!res) {
          this.$message.warning('可关联订单加载失败，请稍后重试')
        }
      } finally {
        this.orderOptionsLoading = false
      }
    },
    async submitOrderLinks() {
      if (!this.currentPortfolioId) return
      const added = this.selectedOrderIds.filter((id) => !this.linkedOrderIdsSnapshot.includes(id))
      const removed = this.linkedOrderIdsSnapshot.filter((id) => !this.selectedOrderIds.includes(id))
      if (!added.length && !removed.length) {
        this.orderDialogVisible = false
        return
      }
      this.orderSubmitting = true
      try {
        if (added.length) {
          const res = await this.$proxy.Request({
            url: this.$proxy.Api.designerPortfolioLinkOrder,
            method: 'post',
            dataType: 'json',
            params: {
              portfolioId: this.currentPortfolioId,
              orderIds: added
            }
          })
          if (!res) return
        }
        if (removed.length) {
          const res = await this.$proxy.Request({
            url: this.$proxy.Api.designerPortfolioUnlinkOrder,
            method: 'post',
            dataType: 'json',
            params: {
              portfolioId: this.currentPortfolioId,
              orderIds: removed
            }
          })
          if (!res) return
        }
        this.$message.success('案例订单已更新')
        this.orderDialogVisible = false
        await this.loadPortfolios()
      } finally {
        this.orderSubmitting = false
      }
    }
  }
}
</script><style scoped>
.designer-profile-page {
  --profile-primary: #4f6ef7;
  --profile-primary-soft: rgba(79, 110, 247, 0.12);
  --profile-secondary: #7c8cff;
  --profile-accent: #55c7ff;
  --profile-bg: #eef4ff;
  --profile-surface: #ffffff;
  --profile-border: rgba(102, 126, 234, 0.12);
  --profile-text: #24324a;
  --profile-muted: #6f7d96;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-card-shell,
.panel-card,
.metric-card {
  background: var(--profile-surface);
  border: 1px solid var(--profile-border);
  border-radius: 24px;
  box-shadow: 0 20px 45px rgba(61, 86, 178, 0.08);
}

.hero-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) 320px;
  gap: 20px;
  padding: 28px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(79, 110, 247, 0.96), rgba(104, 125, 255, 0.92) 58%, rgba(85, 199, 255, 0.9));
  color: #fff;
}

.hero-card::after {
  content: '';
  position: absolute;
  inset: auto -90px -120px auto;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  filter: blur(4px);
}

.section-kicker {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 12px;
  letter-spacing: 0.08em;
}

.hero-copy {
  position: relative;
  z-index: 1;
}

.hero-copy h2 {
  margin: 16px 0 12px;
  font-size: 30px;
  line-height: 1.35;
}

.hero-copy p {
  margin: 0;
  max-width: 700px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.88);
}

.hero-actions {
  margin-top: 22px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-side {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;
  padding: 20px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(10px);
}

.avatar-frame {
  width: 88px;
  height: 88px;
  border-radius: 24px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.avatar-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 32px;
  font-weight: 700;
}

.identity-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.identity-block strong {
  font-size: 22px;
}

.identity-block span,
.completion-card p {
  color: rgba(255, 255, 255, 0.84);
}

.completion-card {
  width: 100%;
}

.completion-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.completion-track {
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  overflow: hidden;
}

.completion-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ffffff, #a8e8ff);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.metric-icon {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--profile-primary);
  font-size: 22px;
}

.metric-label {
  font-size: 13px;
  color: var(--profile-muted);
}

.metric-value {
  margin: 6px 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--profile-text);
}

.metric-sub {
  font-size: 12px;
  color: var(--profile-muted);
  line-height: 1.6;
}

.content-grid {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.panel-card {
  padding: 22px;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.panel-head h3 {
  margin: 0 0 8px;
  color: var(--profile-text);
  font-size: 22px;
}

.panel-head p {
  margin: 0;
  color: var(--profile-muted);
  line-height: 1.7;
}

.profile-detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.detail-item {
  padding: 14px 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(238, 244, 255, 0.92), rgba(248, 250, 255, 0.98));
  border: 1px solid rgba(102, 126, 234, 0.08);
}

.detail-item span {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--profile-muted);
}

.detail-item strong {
  font-size: 15px;
  color: var(--profile-text);
}

.tag-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.compact-tags {
  margin-top: 10px;
}

.empty-inline {
  color: var(--profile-muted);
  font-size: 12px;
}

.intro-panel {
  margin-top: 16px;
  padding: 18px;
  border-radius: 20px;
  background: var(--profile-bg);
}

.intro-title {
  margin-bottom: 10px;
  font-size: 13px;
  color: var(--profile-muted);
}

.intro-text {
  color: var(--profile-text);
  line-height: 1.8;
  white-space: pre-line;
}

.portfolio-head {
  gap: 18px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-input {
  width: 240px;
}

.cover-cell {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  overflow: hidden;
  background: var(--profile-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-cell img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-fallback {
  font-size: 12px;
  color: var(--profile-muted);
}

.work-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--profile-text);
}

.work-intro {
  margin-top: 6px;
  color: var(--profile-muted);
  line-height: 1.7;
}

.order-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-summary-count {
  color: var(--profile-text);
  font-weight: 600;
}

.order-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.order-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(79, 110, 247, 0.1);
  color: var(--profile-primary);
  font-size: 12px;
}

.order-chip.muted {
  background: rgba(111, 125, 150, 0.12);
  color: var(--profile-muted);
}

.table-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

.dialog-form {
  padding-right: 12px;
}

.link-dialog-head {
  margin-bottom: 16px;
  padding: 14px 16px;
  border-radius: 18px;
  background: var(--profile-bg);
}

.link-dialog-head strong {
  display: block;
  color: var(--profile-text);
  font-size: 16px;
}

.link-dialog-head p {
  margin: 8px 0 0;
  color: var(--profile-muted);
}

.order-option-group {
  max-height: 420px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-option-item {
  display: block;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(102, 126, 234, 0.12);
  background: #fff;
}

.order-option-title {
  display: inline-block;
  min-width: 140px;
  color: var(--profile-text);
  font-weight: 600;
}

.order-option-meta {
  display: inline-block;
  margin-left: 10px;
  color: var(--profile-muted);
}

@media (max-width: 1200px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .hero-card {
    grid-template-columns: 1fr;
  }

  .panel-head,
  .portfolio-head {
    flex-direction: column;
  }

  .toolbar-actions {
    width: 100%;
  }

  .toolbar-input {
    width: 100%;
  }

  .pagination-wrap {
    justify-content: flex-start;
    overflow: auto;
  }
}

@media (max-width: 640px) {
  .designer-profile-page {
    gap: 16px;
  }

  .hero-card,
  .panel-card,
  .metric-card {
    border-radius: 20px;
  }

  .hero-card,
  .panel-card {
    padding: 18px;
  }

  .metric-grid {
    grid-template-columns: 1fr;
  }
}
</style>