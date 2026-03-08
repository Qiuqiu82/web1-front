<template>
  <div class="designer-workbench-page">
    <section class="bench-hero board-card">
      <div class="hero-copy">
        <div class="hero-kicker">Designer Center</div>
        <h2>把接单、制作、沟通和交付，收拢进一个设计师工作台</h2>
        <p>
          登录后即可快速查看待接订单、正在推进的任务、今日接单节奏以及个人资料完成度，
          同时从一个入口跳转到沟通、订单和档案页面。
        </p>
        <div class="hero-actions">
          <button v-for="item in quickActions" :key="item.path" type="button" class="action-chip" @click="go(item.path)">
            <i :class="item.icon"></i>
            <span>{{ item.label }}</span>
          </button>
        </div>
      </div>
      <div class="hero-side">
        <div class="date-chip">
          <i class="el-icon-date"></i>
          <span>{{ todayText }}</span>
        </div>
        <div class="profile-card-mini">
          <div class="profile-head">
            <strong>{{ displayName }}</strong>
            <span>档案完成度 {{ profileCompletion }}%</span>
          </div>
          <div class="completion-track">
            <div class="completion-fill" :style="{ width: `${profileCompletion}%` }"></div>
          </div>
          <p>{{ profileHint }}</p>
        </div>
      </div>
    </section>

    <section class="metric-grid">
      <article v-for="item in metricCards" :key="item.label" class="metric-card board-card">
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

    <section class="dashboard-grid">
      <div class="dashboard-main-column">
        <article class="board-card task-card">
          <div class="section-head">
            <div>
              <h3>今日任务焦点</h3>
              <p>按“待接单 / 生产中 / 待交付”划分，优先推进关键节点。</p>
            </div>
            <el-button size="mini" icon="el-icon-refresh" :loading="loading" @click="loadData">刷新数据</el-button>
          </div>
          <div class="task-grid">
            <div class="task-column">
              <div class="task-head">
                <strong>待接单</strong>
                <span>{{ poolOrders.length }} 条</span>
              </div>
              <div v-if="poolOrders.length" class="task-list">
                <div v-for="item in poolOrders" :key="`pool-${item.id}`" class="task-row">
                  <div>
                    <div class="task-title">{{ item.orderNo || item.id }}</div>
                    <div class="task-meta">用户 {{ item.userId || '-' }} · ¥{{ formatMoney(item.totalAmount) }}</div>
                  </div>
                  <el-button size="mini" type="primary" :loading="actionLoadingKey === `claim-${item.id}`" @click="claim(item)">领取</el-button>
                </div>
              </div>
              <div v-else class="empty-tip">暂时没有待领取的订单。</div>
            </div>

            <div class="task-column">
              <div class="task-head">
                <strong>制作中</strong>
                <span>{{ producingOrders.length }} 条</span>
              </div>
              <div v-if="producingOrders.length" class="task-list">
                <div v-for="item in producingOrders" :key="`prod-${item.id}`" class="task-row">
                  <div>
                    <div class="task-title">{{ item.orderNo || item.id }}</div>
                    <div class="task-meta">{{ item.orderStatus }} · {{ item.designerTakeTime || '-' }}</div>
                  </div>
                  <el-button
                    v-if="canStartProduction(item)"
                    size="mini"
                    type="primary"
                    :loading="actionLoadingKey === `start-${item.id}`"
                    @click="startProduction(item)"
                  >开始制作</el-button>
                  <el-button v-else size="mini" @click="openCommunication(item)">去沟通</el-button>
                </div>
              </div>
              <div v-else class="empty-tip">当前没有处于制作中的订单。</div>
            </div>

            <div class="task-column">
              <div class="task-head">
                <strong>待交付</strong>
                <span>{{ deliveryOrders.length }} 条</span>
              </div>
              <div v-if="deliveryOrders.length" class="task-list">
                <div v-for="item in deliveryOrders" :key="`ship-${item.id}`" class="task-row">
                  <div>
                    <div class="task-title">{{ item.orderNo || item.id }}</div>
                    <div class="task-meta">{{ item.orderStatus }} · 建议补充交付说明</div>
                  </div>
                  <el-button size="mini" type="success" :loading="actionLoadingKey === `ship-${item.id}`" @click="shipOrder(item)">完成并发货</el-button>
                </div>
              </div>
              <div v-else class="empty-tip">当前没有待交付订单。</div>
            </div>
          </div>
        </article>

        <article class="board-card chart-card">
          <div class="section-head">
            <div>
              <h3>订单状态分布</h3>
              <p>帮助你直观看到当前手头订单的阶段比例。</p>
            </div>
            <el-button type="text" @click="go('/designer/orders')">查看订单列表</el-button>
          </div>
          <div v-if="statusDistribution.length" class="status-list">
            <div v-for="item in statusDistribution" :key="item.label" class="status-row">
              <div class="status-copy">
                <strong>{{ item.label }}</strong>
              </div>
              <div class="status-meta">
                <div class="status-progress">
                  <div class="status-progress-inner" :style="{ width: `${item.percent}%` }"></div>
                </div>
                <b>{{ item.count }}</b>
              </div>
            </div>
          </div>
          <div v-else class="empty-tip">暂时还没有可统计的订单状态。</div>
        </article>
      </div>

      <div class="dashboard-side-column">
        <article class="board-card side-card">
          <div class="section-head compact">
            <h3>近 7 日处理趋势</h3>
          </div>
          <div v-if="trendData.length" class="trend-list">
            <div v-for="item in trendData" :key="item.key" class="trend-row">
              <div class="trend-label">{{ item.label }}</div>
              <div class="trend-track">
                <div class="trend-fill" :style="{ width: `${Math.max((item.count / trendMax) * 100, 6)}%` }"></div>
              </div>
              <div class="trend-value">{{ item.count }}</div>
            </div>
          </div>
          <div v-else class="empty-tip">暂时没有处理趋势数据。</div>
        </article>

        <article class="board-card side-card">
          <div class="section-head compact">
            <h3>收入概览</h3>
          </div>
          <div class="income-list">
            <div class="income-row">
              <span>累计承接金额</span>
              <strong>¥{{ formatMoney(totalOrderAmount) }}</strong>
            </div>
            <div class="income-row">
              <span>已完成订单额</span>
              <strong>¥{{ formatMoney(completedOrderAmount) }}</strong>
            </div>
            <div class="income-row">
              <span>待交付订单数</span>
              <strong>{{ kpi.toShipCount }}</strong>
            </div>
          </div>
        </article>

        <article class="board-card side-card">
          <div class="section-head compact">
            <h3>热门灵感</h3>
          </div>
          <div v-if="hotList.length" class="hot-list">
            <div v-for="item in hotList" :key="item.id" class="hot-row" @click="toCosDetail(item)">
              <img :src="coverUrl(item)" alt="热门款式" />
              <div>
                <strong>{{ item.fuzhuangmingcheng || '热门款式' }}</strong>
                <span>热度 {{ item.clicknum || 0 }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-tip">暂时还没有热门灵感内容。</div>
        </article>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'DesignerWorkbench',
  data() {
    return {
      baseUrl: this.$config.baseUrl,
      loading: false,
      actionLoadingKey: '',
      poolList: [],
      poolTotal: 0,
      mineList: [],
      hotList: [],
      profileSnapshot: {},
      kpi: {
        poolCount: 0,
        inProgressCount: 0,
        toShipCount: 0,
        todayClaimCount: 0,
        completedAmount: 0
      },
      statusDistribution: [],
      trendData: []
    }
  },
  computed: {
    displayName() {
      return localStorage.getItem('username') || this.profileSnapshot.shejishixingming || '设计师'
    },
    todayText() {
      const now = new Date()
      const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      return `${now.getMonth() + 1} 月 ${now.getDate()} 日 · ${weekNames[now.getDay()]}`
    },
    poolOrders() {
      return this.poolList.slice(0, 4)
    },
    producingOrders() {
      return this.mineList.filter((item) => ['待生产', '生产中'].includes(item.orderStatus)).slice(0, 4)
    },
    deliveryOrders() {
      return this.mineList.filter((item) => item.orderStatus === '生产中').slice(0, 4)
    },
    trendMax() {
      if (!this.trendData.length) return 1
      const max = Math.max(...this.trendData.map((item) => item.count || 0))
      return max > 0 ? max : 1
    },
    totalOrderAmount() {
      return this.mineList.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0)
    },
    completedOrderAmount() {
      return this.mineList
        .filter((item) => item.orderStatus === '已完成')
        .reduce((sum, item) => sum + Number(item.totalAmount || 0), 0)
    },
    metricCards() {
      return [
        {
          label: '待接订单',
          value: this.kpi.poolCount,
          sub: '等待领取的公开订单池',
          icon: 'el-icon-s-order',
          bg: '#eef2ff'
        },
        {
          label: '处理中任务',
          value: this.kpi.inProgressCount,
          sub: '待生产与生产中的订单',
          icon: 'el-icon-magic-stick',
          bg: '#f4f1ff'
        },
        {
          label: '今日领取',
          value: this.kpi.todayClaimCount,
          sub: '按领取时间统计',
          icon: 'el-icon-time',
          bg: '#eef8ff'
        },
        {
          label: '已完成订单额',
          value: `¥${this.formatMoney(this.completedOrderAmount)}`,
          sub: '已闭环订单累计金额',
          icon: 'el-icon-coin',
          bg: '#eef7ff'
        }
      ]
    },
    quickActions() {
      return [
        { label: '订单管理', path: '/designer/orders', icon: 'el-icon-s-order' },
        { label: '沟通记录', path: '/designer/communication', icon: 'el-icon-chat-dot-round' },
        { label: '资料档案', path: '/designer/profile', icon: 'el-icon-user' }
      ]
    },
    profileCompletion() {
      const fields = [
        this.profileSnapshot.touxiang,
        this.profileSnapshot.lianxifangshi,
        this.profileSnapshot.zhuanchang,
        this.profileSnapshot.jianjie
      ]
      const done = fields.filter((item) => String(item || '').trim()).length
      return Math.round((done / fields.length) * 100)
    },
    profileHint() {
      if (this.profileCompletion >= 100) {
        return '资料已完善，可以持续沉淀个人品牌与服务能力。'
      }
      return '建议补充头像、联系方式、专长和简介，提升合作信任感。'
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    go(path) {
      this.$router.push(path)
    },
    formatMoney(v) {
      return Number(v || 0).toFixed(2)
    },
    parseDateValue(input) {
      if (input === undefined || input === null || input === '') return null
      if (input instanceof Date) {
        return Number.isNaN(input.getTime()) ? null : input
      }
      if (typeof input === 'number') {
        const time = input < 10000000000 ? input * 1000 : input
        const date = new Date(time)
        return Number.isNaN(date.getTime()) ? null : date
      }
      const text = String(input).trim()
      if (!text) return null
      if (/^\d{10,13}$/.test(text)) {
        const time = text.length === 10 ? Number(text) * 1000 : Number(text)
        const date = new Date(time)
        return Number.isNaN(date.getTime()) ? null : date
      }
      const match = text.match(/\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}:\d{2})?/)
      if (match) {
        const normalized = match[0].replace('T', ' ')
        const date = new Date(normalized.replace(/-/g, '/'))
        if (!Number.isNaN(date.getTime())) {
          return date
        }
      }
      const fallback = new Date(text.replace('T', ' ').replace(/-/g, '/'))
      if (!Number.isNaN(fallback.getTime())) {
        return fallback
      }
      return null
    },
    parseDayKey(input) {
      const date = this.parseDateValue(input)
      return date ? this.dayKey(date) : ''
    },
    dayKey(date) {
      const year = date.getFullYear()
      const month = `${date.getMonth() + 1}`.padStart(2, '0')
      const day = `${date.getDate()}`.padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    coverUrl(item) {
      const raw = (item && item.huawentuan) || ''
      const first = raw.split(',')[0] || ''
      if (!first) return ''
      return first.startsWith('http') ? first : `${this.baseUrl}${first}`
    },
    toCosDetail(item) {
      this.$router.push({ path: '/index/remaicosfuDetail', query: { detailObj: JSON.stringify(item) } })
    },
    openCommunication(item) {
      this.$router.push({ path: '/designer/communication', query: { orderId: item.id } })
    },
    normalizeOrders(rows = []) {
      return rows.map((row) => ({
        id: row.id,
        orderNo: row.orderNo || row.order_no || '',
        userId: row.userId || row.user_id || '',
        totalAmount: row.totalAmount || row.total_amount || 0,
        orderStatus: row.orderStatus || row.order_status || '',
        designerStatus: row.designerStatus || row.designer_status || '',
        designerTakeTime: row.designerTakeTime || row.designer_take_time || '',
        addtime: row.addtime || ''
      }))
    },
    parsePageData(raw = {}) {
      const list = raw.list || raw.records || raw.rows || (Array.isArray(raw) ? raw : [])
      const total = Number(raw.total || raw.count || raw.recordsTotal || (Array.isArray(list) ? list.length : 0))
      return {
        list: Array.isArray(list) ? list : [],
        total
      }
    },
    buildTrendRows() {
      const now = new Date()
      const rows = []
      for (let i = 6; i >= 0; i -= 1) {
        const date = new Date(now)
        date.setDate(now.getDate() - i)
        rows.push({ key: this.dayKey(date), label: `${date.getMonth() + 1}/${date.getDate()}`, count: 0 })
      }
      return rows
    },
    updateMetrics() {
      const mineRows = this.mineList
      const today = this.dayKey(new Date())
      this.kpi.poolCount = this.poolTotal || this.poolList.length
      this.kpi.inProgressCount = mineRows.filter((item) => ['待生产', '生产中'].includes(item.orderStatus)).length
      this.kpi.toShipCount = mineRows.filter((item) => item.orderStatus === '生产中').length
      this.kpi.todayClaimCount = mineRows.filter((item) => {
        const claimDay = this.parseDayKey(item.designerTakeTime)
        return claimDay && claimDay === today
      }).length
      this.kpi.completedAmount = mineRows
        .filter((item) => item.orderStatus === '已完成')
        .reduce((sum, item) => sum + Number(item.totalAmount || 0), 0)

      const statusSeed = [
        { label: '待生产', count: 0 },
        { label: '生产中', count: 0 },
        { label: '已发货', count: 0 },
        { label: '已完成', count: 0 },
        { label: '已取消', count: 0 }
      ]
      mineRows.forEach((item) => {
        const target = statusSeed.find((status) => status.label === item.orderStatus)
        if (target) target.count += 1
      })
      const max = Math.max(...statusSeed.map((item) => item.count), 1)
      this.statusDistribution = statusSeed.filter((item) => item.count > 0).map((item) => ({
        ...item,
        percent: Math.max(Math.round((item.count / max) * 100), 8)
      }))

      const trendRows = this.buildTrendRows()
      const trendMap = trendRows.reduce((acc, row) => {
        acc[row.key] = row
        return acc
      }, {})
      mineRows.forEach((item) => {
        const key = this.parseDayKey(item.designerTakeTime || item.addtime)
        if (key && trendMap[key]) trendMap[key].count += 1
      })
      this.trendData = trendRows
    },
    canStartProduction(row) {
      return row && row.orderStatus === '待生产'
    },
    async loadData() {
      this.loading = true
      try {
        const [poolRes, mineRes, hotRes, sessionRes] = await Promise.all([
          this.$proxy.Request({
            url: this.$proxy.Api.cosorderDesignerPool,
            method: 'get',
            showLoading: false,
            showError: false,
            params: { page: 1, limit: 120 }
          }),
          this.$proxy.Request({
            url: this.$proxy.Api.cosorderDesignerMine,
            method: 'get',
            showLoading: false,
            showError: false,
            params: { page: 1, limit: 300 }
          }),
          this.$proxy.Request({
            url: this.$proxy.Api.remaicosfuAutoSort,
            method: 'get',
            showLoading: false,
            showError: false,
            params: { page: 1, limit: 4 }
          }),
          this.$proxy.Request({
            url: this.$proxy.Api.shejishiSession,
            method: 'get',
            showLoading: false,
            showError: false
          })
        ])

        if (!poolRes || poolRes.code !== 0 || !mineRes || mineRes.code !== 0) {
          this.$message.warning('订单数据加载存在异常，已展示可用部分。')
        }

        const pool = this.parsePageData((poolRes && poolRes.data) || {})
        const mine = this.parsePageData((mineRes && mineRes.data) || {})
        this.poolList = this.normalizeOrders(pool.list)
        this.poolTotal = pool.total || this.poolList.length
        this.mineList = this.normalizeOrders(mine.list)

        const hotData = (hotRes && hotRes.code === 0 && hotRes.data) || {}
        this.hotList = hotData.list || []
        this.profileSnapshot = (sessionRes && sessionRes.code === 0 && sessionRes.data) || {}
        this.updateMetrics()
      } finally {
        this.loading = false
      }
    },
    async claim(row) {
      const ok = await this.$confirm(`确认领取订单 ${row.orderNo || row.id} 吗？`, '提示', {
        confirmButtonText: '确认领取',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => true).catch(() => false)
      if (!ok) return

      this.actionLoadingKey = `claim-${row.id}`
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosorderDesignerClaim,
        method: 'post',
        dataType: 'json',
        showError: false,
        params: { orderId: row.id }
      })
      this.actionLoadingKey = ''

      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '领取失败')
        return
      }
      this.$message.success(res.msg || '领取成功')
      await this.loadData()
      this.openCommunication(row)
    },
    async startProduction(row) {
      const ok = await this.$confirm(`确认开始制作订单 ${row.orderNo || row.id} 吗？`, '提示', {
        confirmButtonText: '开始制作',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => true).catch(() => false)
      if (!ok) return

      this.actionLoadingKey = `start-${row.id}`
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosorderDesignerStart,
        method: 'post',
        dataType: 'json',
        showError: false,
        params: { orderId: row.id }
      })
      this.actionLoadingKey = ''
      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '开始制作失败')
        return
      }
      this.$message.success(res.msg || '已进入制作阶段')
      await this.loadData()
    },
    async shipOrder(row) {
      const promptRes = await this.$prompt('请填写交付说明或物流单号（可选）', '完成并发货', {
        confirmButtonText: '确认发货',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '例如：物流单号 + 交付说明'
      }).catch(() => null)
      if (!promptRes) return

      const remark = (promptRes.value || '').trim()
      this.actionLoadingKey = `ship-${row.id}`
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosorderDesignerShip,
        method: 'post',
        dataType: 'json',
        showError: false,
        params: {
          orderId: row.id,
          remark: remark ? `交付说明：${remark}` : '设计师已完成制作并发货'
        }
      })
      this.actionLoadingKey = ''
      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '发货失败')
        return
      }
      this.$message.success(res.msg || '发货成功')
      await this.loadData()
    }
  }
}
</script>

<style scoped>
.designer-workbench-page {
  display: grid;
  gap: 16px;
}

.board-card {
  border-radius: 24px;
  border: 1px solid #e6eafb;
  background: #fff;
  box-shadow: 0 16px 34px rgba(84, 99, 183, 0.08);
}

.bench-hero {
  padding: 24px 26px;
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) 320px;
  gap: 18px;
  background: linear-gradient(135deg, #f5f7ff 0%, #ffffff 46%, #eff2ff 100%);
}

.hero-kicker {
  display: inline-flex;
  height: 30px;
  align-items: center;
  padding: 0 12px;
  border-radius: 999px;
  background: #eef1ff;
  color: #5b6ef5;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 700;
}

.bench-hero h2 {
  margin-top: 12px;
  font-size: 32px;
  line-height: 1.35;
  color: #202a4a;
}

.bench-hero p {
  margin-top: 12px;
  max-width: 760px;
  line-height: 1.85;
  color: #7f8bb2;
}

.hero-actions {
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.action-chip {
  padding: 12px 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 16px;
  border: 1px solid #dbe2ff;
  background: #fff;
  color: #445077;
  cursor: pointer;
}

.action-chip i {
  color: #5b6ef5;
}

.hero-side {
  display: grid;
  gap: 14px;
}

.date-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-self: end;
  height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #dde4ff;
  color: #6f7aa2;
}

.profile-card-mini {
  padding: 18px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid #dde4ff;
  display: grid;
  gap: 12px;
}

.profile-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.profile-head strong {
  color: #202a4a;
  font-size: 18px;
}

.profile-head span,
.profile-card-mini p {
  color: #7f8bb2;
  font-size: 13px;
}

.completion-track,
.status-progress,
.trend-track {
  height: 10px;
  border-radius: 999px;
  background: #eef1fb;
  overflow: hidden;
}

.completion-fill,
.status-progress-inner,
.trend-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #8a8eff 0%, #5b6ef5 100%);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.metric-card {
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  color: #4a57a0;
  font-size: 20px;
}

.metric-label {
  color: #8792b8;
  font-size: 13px;
}

.metric-value {
  margin-top: 6px;
  color: #202a4a;
  font-size: 24px;
  font-weight: 700;
}

.metric-sub {
  margin-top: 4px;
  color: #99a2c5;
  font-size: 12px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) 320px;
  gap: 16px;
}

.dashboard-main-column,
.dashboard-side-column {
  display: grid;
  gap: 16px;
}

.task-card,
.chart-card,
.side-card {
  padding: 20px 22px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.section-head h3 {
  color: #222d4e;
  font-size: 18px;
}

.section-head p {
  margin-top: 6px;
  color: #8591b8;
  font-size: 13px;
}

.section-head.compact {
  margin-bottom: 14px;
}

.task-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.task-column {
  padding: 16px;
  border-radius: 20px;
  background: #f8f9ff;
  border: 1px solid #edf0ff;
}

.task-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.task-head strong {
  color: #25315a;
}

.task-head span,
.task-meta,
.hot-row span,
.trend-label,
.empty-tip,
.income-row span {
  color: #8591b8;
  font-size: 13px;
}

.task-list,
.status-list,
.trend-list,
.income-list,
.hot-list {
  margin-top: 14px;
  display: grid;
  gap: 12px;
}

.task-row,
.status-row,
.trend-row,
.income-row,
.hot-row {
  display: grid;
  align-items: center;
  gap: 12px;
}

.task-row {
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 12px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #e8ecff;
}

.task-title,
.hot-row strong {
  color: #232f55;
  font-weight: 700;
}

.status-row {
  grid-template-columns: minmax(0, 1fr) 180px;
  padding: 12px 0;
  border-bottom: 1px solid #edf0ff;
}

.status-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.status-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-meta b,
.trend-value,
.income-row strong {
  color: #232f55;
  font-weight: 700;
}

.trend-row {
  grid-template-columns: 56px minmax(0, 1fr) 44px;
}

.income-row {
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 12px 0;
  border-bottom: 1px solid #edf0ff;
}

.income-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.hot-row {
  grid-template-columns: 64px minmax(0, 1fr);
  padding: 10px;
  border-radius: 16px;
  background: #f8f9ff;
  border: 1px solid #edf0ff;
  cursor: pointer;
}

.hot-row img {
  width: 64px;
  height: 64px;
  border-radius: 14px;
  object-fit: cover;
  background: #eef1fb;
}

@media (max-width: 1280px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid,
  .bench-hero {
    grid-template-columns: 1fr;
  }

  .task-grid {
    grid-template-columns: 1fr;
  }

  .date-chip {
    justify-self: start;
  }
}

@media (max-width: 768px) {
  .metric-grid {
    grid-template-columns: 1fr;
  }

  .task-row,
  .status-row,
  .trend-row,
  .income-row {
    grid-template-columns: 1fr;
  }

  .section-head,
  .profile-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .bench-hero {
    padding: 18px;
  }
}
</style>
