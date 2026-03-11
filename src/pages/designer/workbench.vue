<template>
  <div class="designer-workbench-page">
    <section class="page-toolbar">
      <div class="page-copy">
        <span class="page-tag">{{ '\u5de5\u4f5c\u53f0' }}</span>
        <p>{{ texts.heroDesc }}</p>
      </div>
      <div class="page-actions">
        <div class="mini-chip"><i class="el-icon-date"></i><span>{{ todayText }}</span></div>
        <button v-for="item in quickActions" :key="item.path" type="button" class="action-chip" @click="go(item.path)">
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </button>
      </div>
    </section>

    <section class="metric-grid">
      <article v-for="item in metricCards" :key="item.label" class="metric-card board-card">
        <div class="metric-icon" :style="{ background: item.bg }"><i :class="item.icon"></i></div>
        <div><div class="metric-label">{{ item.label }}</div><div class="metric-value">{{ item.value }}</div><div class="metric-sub">{{ item.sub }}</div></div>
      </article>
    </section>

    <section class="dashboard-grid">
      <div class="dashboard-main-column">
        <article class="board-card task-card">
          <div class="section-head">
            <div><h3>{{ texts.focusTitle }}</h3><p>{{ texts.focusDesc }}</p></div>
            <el-button size="mini" icon="el-icon-refresh" :loading="loading" @click="loadData">{{ texts.refresh }}</el-button>
          </div>
          <div class="task-grid">
            <div class="task-column">
              <div class="task-head"><strong>{{ texts.poolGroup }}</strong><span>{{ kpi.poolCount }} {{ texts.unit }}</span></div>
              <div v-if="poolOrders.length" class="task-list">
                <div v-for="item in poolOrders" :key="`pool-${item.id}`" class="task-row">
                  <div><div class="task-title">{{ item.orderNo || item.id }}</div><div class="task-meta">{{ texts.userLabel }} {{ item.userId || '-' }} | {{ currency }}{{ formatMoney(item.totalAmount) }}</div></div>
                  <el-button size="mini" type="primary" :loading="actionLoadingKey === `claim-${item.id}`" @click="claim(item)">{{ texts.claim }}</el-button>
                </div>
              </div>
              <div v-else class="empty-tip">{{ texts.emptyPool }}</div>
            </div>

            <div class="task-column">
              <div class="task-head"><strong>{{ texts.producingGroup }}</strong><span>{{ kpi.inProgressCount }} {{ texts.unit }}</span></div>
              <div v-if="producingOrders.length" class="task-list">
                <div v-for="item in producingOrders" :key="`prod-${item.id}`" class="task-row">
                  <div><div class="task-title">{{ item.orderNo || item.id }}</div><div class="task-meta">{{ item.orderStatus || '-' }} | {{ item.designerTakeTime || '-' }}</div></div>
                  <el-button v-if="canStartProduction(item)" size="mini" type="primary" :loading="actionLoadingKey === `start-${item.id}`" @click="startProduction(item)">{{ texts.startProduction }}</el-button>
                  <el-button v-else size="mini" @click="openCommunication(item)">{{ texts.goComm }}</el-button>
                </div>
              </div>
              <div v-else class="empty-tip">{{ texts.emptyProducing }}</div>
            </div>

            <div class="task-column">
              <div class="task-head"><strong>{{ texts.deliveryGroup }}</strong><span>{{ kpi.toShipCount }} {{ texts.unit }}</span></div>
              <div v-if="deliveryOrders.length" class="task-list">
                <div v-for="item in deliveryOrders" :key="`ship-${item.id}`" class="task-row">
                  <div><div class="task-title">{{ item.orderNo || item.id }}</div><div class="task-meta">{{ texts.waitingShip }} | {{ currency }}{{ formatMoney(item.totalAmount) }}</div></div>
                  <el-button size="mini" type="primary" :loading="actionLoadingKey === `ship-${item.id}`" @click="shipOrder(item)">{{ texts.shipNow }}</el-button>
                </div>
              </div>
              <div v-else class="empty-tip">{{ texts.emptyDelivery }}</div>
            </div>
          </div>
        </article>
      </div>

      <div class="dashboard-side-column">
        <article class="board-card side-card">
          <div class="section-head compact"><h3>{{ texts.distributionTitle }}</h3></div>
          <div v-if="statusDistribution.length" class="distribution-list">
            <div v-for="item in statusDistribution" :key="item.label" class="distribution-row">
              <div class="distribution-meta"><span>{{ item.label }}</span><strong>{{ item.count }}</strong></div>
              <div class="distribution-track"><div class="distribution-fill" :style="{ width: distributionWidth(item.count) }"></div></div>
            </div>
          </div>
          <div v-else class="empty-tip">{{ texts.emptyDistribution }}</div>
        </article>

        <article class="board-card side-card">
          <div class="section-head compact"><h3>{{ texts.trendTitle }}</h3></div>
          <div v-if="trendData.length" class="trend-list">
            <div v-for="item in trendData" :key="item.label" class="trend-row">
              <div class="trend-label">{{ item.label }}</div>
              <div class="trend-bar"><span :style="{ width: trendWidth(item.count) }"></span></div>
              <strong>{{ item.count }}</strong>
            </div>
          </div>
          <div v-else class="empty-tip">{{ texts.emptyTrend }}</div>
        </article>

        <article class="board-card side-card">
          <div class="section-head compact"><h3>{{ texts.incomeTitle }}</h3></div>
          <div class="income-list">
            <div class="income-row"><span>{{ texts.totalAmount }}</span><strong>{{ currency }}{{ formatMoney(totalOrderAmount) }}</strong></div>
            <div class="income-row"><span>{{ texts.completedAmount }}</span><strong>{{ currency }}{{ formatMoney(completedOrderAmount) }}</strong></div>
            <div class="income-row"><span>{{ texts.pendingShipCount }}</span><strong>{{ kpi.toShipCount }}</strong></div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script>
const STATUS_PENDING_PRODUCTION = '待生产'
const STATUS_PRODUCING = '生产中'
const STATUS_SHIPPED = '已发货'
const STATUS_FINISHED = '已完成'
const STATUS_CANCELLED = '已取消'
const TEXTS = {
  heroTitle: '把接单、制作、沟通和交付，收拢进一个设计师工作台',
  heroDesc: '登录后即可快速查看待接订单、正在推进的任务、今日接单节奏以及个人资料完成度。',
  profileCompletion: '档案完成度 ',
  focusTitle: '今日任务焦点',
  focusDesc: '按“待接单 / 制作中 / 待交付”分组，优先推进关键节点。',
  refresh: '刷新数据',
  poolGroup: '待接单',
  producingGroup: '制作中',
  deliveryGroup: '待交付',
  unit: '条',
  userLabel: '用户',
  claim: '认领',
  startProduction: '开始制作',
  goComm: '去沟通',
  shipNow: '去发货',
  waitingShip: '待发货',
  emptyPool: '暂时没有待领取的订单。',
  emptyProducing: '当前没有处于制作中的订单。',
  emptyDelivery: '当前没有待发货的订单。',
  distributionTitle: '订单状态分布',
  trendTitle: '近7日处理趋势',
  incomeTitle: '金额概览',
  totalAmount: '累计承接金额',
  completedAmount: '已完成订单额',
  pendingShipCount: '待交付订单数',
  emptyDistribution: '暂时还没有可用的状态分布数据。',
  emptyTrend: '暂时还没有近7日趋势数据。',
  loadWarn: '订单数据加载存在异常，已展示可用部分。',
  claimConfirm: '确认认领订单 ',
  startConfirm: '确认开始制作订单 ',
  promptTitle: '完成并发货',
  promptLabel: '请填写交付说明或物流单号（可选）',
  promptPlaceholder: '例如：物流单号 + 交付说明',
  confirm: '确认',
  cancel: '取消',
  confirmClaim: '确认认领',
  confirmStart: '开始制作',
  confirmShip: '确认发货',
  claimFail: '认领失败',
  claimSuccess: '认领成功',
  startFail: '开始制作失败',
  startSuccess: '已开始制作',
  shipFail: '发货操作失败',
  shipSuccess: '已标记发货',
  profileDone: '资料已完善，可以持续沉淀个人品牌与服务能力。',
  profileTodo: '建议补充头像、联系方式、专长和简介，提升合作信任感。'
}

export default {
  name: 'DesignerWorkbench',
  data() {
    return {
      texts: TEXTS,
      currency: '¥',
      loading: false,
      actionLoadingKey: '',
      poolList: [],
      mineList: [],
      profileSnapshot: {},
      kpi: { poolCount: 0, inProgressCount: 0, toShipCount: 0, todayClaimCount: 0 },
      summary: { totalOrderAmount: 0, completedOrderAmount: 0 },
      statusDistribution: [],
      trendData: []
    }
  },
  computed: {
    displayName() { return localStorage.getItem('username') || this.profileSnapshot.shejishixingming || '设计师' },
    todayText() {
      const now = new Date()
      const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      return `${now.getMonth() + 1}月${now.getDate()}日 | ${weekNames[now.getDay()]}`
    },
    poolOrders() { return this.poolList.slice(0, 4) },
    producingOrders() { return this.mineList.filter((item) => [STATUS_PENDING_PRODUCTION, STATUS_PRODUCING].includes(item.orderStatus)).slice(0, 4) },
    deliveryOrders() { return this.mineList.filter((item) => item.orderStatus === STATUS_PRODUCING).slice(0, 4) },
    trendMax() { return Math.max(1, ...this.trendData.map((item) => item.count || 0)) },
    distributionMax() { return Math.max(1, ...this.statusDistribution.map((item) => item.count || 0)) },
    totalOrderAmount() { return Number(this.summary.totalOrderAmount || 0) },
    completedOrderAmount() { return Number(this.summary.completedOrderAmount || 0) },
    metricCards() {
      return [
        { label: this.texts.poolGroup, value: this.kpi.poolCount, sub: '等待领取的公开订单池', icon: 'el-icon-s-order', bg: '#eef2ff' },
        { label: '处理中任务', value: this.kpi.inProgressCount, sub: '待生产与生产中的订单', icon: 'el-icon-magic-stick', bg: '#f4f1ff' },
        { label: '今日领取', value: this.kpi.todayClaimCount, sub: '按领取时间统计', icon: 'el-icon-time', bg: '#eef8ff' },
        { label: '已完成订单额', value: `${this.currency}${this.formatMoney(this.completedOrderAmount)}`, sub: '已闭环订单累计金额', icon: 'el-icon-coin', bg: '#eef7ff' }
      ]
    },
    quickActions() {
      return [
        { label: '订单管理', path: '/designer/orders', icon: 'el-icon-s-order' },
        { label: '沟通记录', path: '/designer/communication', icon: 'el-icon-chat-dot-round' },
        { label: '热门灵感', path: '/designer/inspirations', icon: 'el-icon-picture-outline-round' },
        { label: '资料档案', path: '/designer/profile', icon: 'el-icon-user' }
      ]
    },
    profileCompletion() {
      const fields = [this.profileSnapshot.touxiang, this.profileSnapshot.lianxifangshi, this.profileSnapshot.zhuanchang, this.profileSnapshot.jianjie]
      const done = fields.filter((item) => String(item || '').trim()).length
      return Math.round((done / fields.length) * 100)
    },
    profileHint() { return this.profileCompletion >= 100 ? this.texts.profileDone : this.texts.profileTodo }
  },
  created() { this.loadData() },
  methods: {
    go(path) { this.$router.push(path) },
    formatMoney(value) { return Number(value || 0).toFixed(2) },
    parseNumber(value, fallback = 0) {
      const num = Number(value)
      return Number.isFinite(num) ? num : fallback
    },
    formatTrendLabel(dateText) {
      const text = String(dateText || '').trim()
      if (!text) return '-'
      if (text.length >= 10) {
        const month = String(Number(text.slice(5, 7)))
        const day = String(Number(text.slice(8, 10)))
        return `${month}/${day}`
      }
      return text
    },
    distributionWidth(count) { return `${Math.max(18, Math.round((count / this.distributionMax) * 100))}%` },
    trendWidth(count) { return `${Math.max(10, Math.round((count / this.trendMax) * 100))}%` },
    normalizeOrders(rows = []) {
      return rows.map((row) => ({
        ...row,
        id: row.id || row.orderId || row.order_id || '',
        orderNo: row.orderNo || row.order_no || '',
        userId: row.userId || row.user_id || '',
        totalAmount: this.parseNumber(row.totalAmount || row.total_amount || 0),
        orderStatus: row.orderStatus || row.order_status || '',
        designerStatus: row.designerStatus || row.designer_status || '',
        designerTakeTime: row.designerTakeTime || row.designer_take_time || '',
        addtime: row.addtime || ''
      }))
    },
    parsePageData(rawData) {
      const data = rawData || {}
      const list = data.list || data.records || data.rows || (Array.isArray(data) ? data : [])
      const total = Number(data.total || data.count || data.recordsTotal || (Array.isArray(list) ? list.length : 0))
      return { list: Array.isArray(list) ? list : [], total }
    },
    applySummary(rawData = {}) {
      const summary = rawData || {}
      const statusMap = {}
      const statusRows = Array.isArray(summary.statusDistribution) ? summary.statusDistribution : []
      statusRows.forEach((item) => {
        const label = String((item && item.label) || '').trim()
        if (label) {
          statusMap[label] = this.parseNumber(item.count, 0)
        }
      })
      this.kpi = {
        poolCount: this.parseNumber(summary.poolCount, 0),
        inProgressCount: this.parseNumber(summary.inProgressCount, 0),
        toShipCount: this.parseNumber(summary.toShipCount, 0),
        todayClaimCount: this.parseNumber(summary.todayClaimCount, 0)
      }
      this.summary = {
        totalOrderAmount: this.parseNumber(summary.totalOrderAmount, 0),
        completedOrderAmount: this.parseNumber(summary.completedOrderAmount, 0)
      }
      this.statusDistribution = [STATUS_PENDING_PRODUCTION, STATUS_PRODUCING, STATUS_SHIPPED, STATUS_FINISHED, STATUS_CANCELLED].map((label) => ({
        label,
        count: this.parseNumber(statusMap[label], 0)
      }))
      const trendRows = Array.isArray(summary.claimTrend) ? summary.claimTrend : []
      this.trendData = trendRows.map((item) => ({
        date: item && item.date ? String(item.date) : '',
        label: (item && item.label) || this.formatTrendLabel(item && item.date),
        count: this.parseNumber(item && item.count, 0)
      }))
    },
    canStartProduction(row) { return row && row.orderStatus === STATUS_PENDING_PRODUCTION },
    async loadData() {
      this.loading = true
      try {
        const [summaryRes, poolRes, mineRes, sessionRes] = await Promise.all([
          this.$proxy.Request({ url: this.$proxy.Api.designerWorkbenchSummary, method: 'get', showLoading: false, showError: false }),
          this.$proxy.Request({ url: this.$proxy.Api.cosorderDesignerPool, method: 'get', showLoading: false, showError: false, params: { page: 1, limit: 20 } }),
          this.$proxy.Request({ url: this.$proxy.Api.cosorderDesignerMine, method: 'get', showLoading: false, showError: false, params: { page: 1, limit: 20 } }),
          this.$proxy.Request({ url: this.$proxy.Api.shejishiSession, method: 'get', showLoading: false, showError: false })
        ])
        if (!summaryRes || summaryRes.code !== 0 || !poolRes || poolRes.code !== 0 || !mineRes || mineRes.code !== 0) {
          this.$message.warning(this.texts.loadWarn)
        }
        this.poolList = this.normalizeOrders(this.parsePageData((poolRes && poolRes.data) || {}).list)
        this.mineList = this.normalizeOrders(this.parsePageData((mineRes && mineRes.data) || {}).list)
        this.profileSnapshot = (sessionRes && sessionRes.code === 0 && sessionRes.data) || {}
        this.applySummary((summaryRes && summaryRes.code === 0 && summaryRes.data) || {})
      } finally {
        this.loading = false
      }
    },
    async confirmAction(message, confirmButtonText) {
      return this.$confirm(message, this.texts.confirm, { confirmButtonText, cancelButtonText: this.texts.cancel, type: 'warning' }).then(() => true).catch(() => false)
    },
    async claim(row) {
      const ok = await this.confirmAction(`${this.texts.claimConfirm}${row.orderNo || row.id}？`, this.texts.confirmClaim)
      if (!ok) return
      this.actionLoadingKey = `claim-${row.id}`
      const res = await this.$proxy.Request({ url: this.$proxy.Api.cosorderDesignerClaim, method: 'post', dataType: 'json', showError: false, params: { orderId: row.id } })
      this.actionLoadingKey = ''
      if (!res || res.code !== 0) { this.$message.error((res && res.msg) || this.texts.claimFail); return }
      this.$message.success(res.msg || this.texts.claimSuccess)
      await this.loadData()
      this.openCommunication(row)
    },
    async startProduction(row) {
      const ok = await this.confirmAction(`${this.texts.startConfirm}${row.orderNo || row.id}？`, this.texts.confirmStart)
      if (!ok) return
      this.actionLoadingKey = `start-${row.id}`
      const res = await this.$proxy.Request({ url: this.$proxy.Api.cosorderDesignerStart, method: 'post', dataType: 'json', showError: false, params: { orderId: row.id } })
      this.actionLoadingKey = ''
      if (!res || res.code !== 0) { this.$message.error((res && res.msg) || this.texts.startFail); return }
      this.$message.success(res.msg || this.texts.startSuccess)
      await this.loadData()
    },
    async shipOrder(row) {
      const promptRes = await this.$prompt(this.texts.promptLabel, this.texts.promptTitle, { confirmButtonText: this.texts.confirmShip, cancelButtonText: this.texts.cancel, inputType: 'textarea', inputPlaceholder: this.texts.promptPlaceholder }).catch(() => null)
      if (!promptRes) return
      const remark = (promptRes.value || '').trim()
      this.actionLoadingKey = `ship-${row.id}`
      const res = await this.$proxy.Request({ url: this.$proxy.Api.cosorderDesignerShip, method: 'post', dataType: 'json', showError: false, params: { orderId: row.id, remark: remark || '设计师已完成制作并发货' } })
      this.actionLoadingKey = ''
      if (!res || res.code !== 0) { this.$message.error((res && res.msg) || this.texts.shipFail); return }
      this.$message.success(res.msg || this.texts.shipSuccess)
      await this.loadData()
    },
    openCommunication(row) { this.$router.push({ path: '/designer/communication', query: { orderId: row.id } }) }
  }
}
</script>

<style scoped>
.designer-workbench-page { display:grid; gap:16px; }
.board-card { border-radius:18px; border:1px solid #e7edff; background:#fff; box-shadow:none; }
.page-toolbar { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; }
.page-copy { display:grid; gap:6px; }
.page-tag { display:inline-flex; width:fit-content; align-items:center; padding:5px 10px; border-radius:999px; border:1px solid #dbe6ff; background:#f7faff; color:#5870bc; font-size:12px; letter-spacing:.04em; }
.page-copy h2 { margin:0; color:#24356b; font-size:26px; line-height:1.35; }
.page-copy p { margin:0; max-width:760px; color:#7d89af; line-height:1.75; }
.page-actions { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:10px; }
.mini-chip { display:inline-flex; align-items:center; gap:8px; height:38px; padding:0 14px; border-radius:999px; border:1px solid #dfe7ff; background:#fff; color:#5f6d96; }
.action-chip { border:1px solid #dfe7ff; border-radius:999px; padding:9px 14px; background:#fff; color:#3657c8; cursor:pointer; display:inline-flex; align-items:center; gap:8px; transition:.2s ease; }
.action-chip:hover { border-color:#bfd0ff; background:#f6f9ff; }
.metric-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; }
.metric-card { display:flex; align-items:center; gap:14px; padding:18px; }
.metric-icon { width:50px; height:50px; border-radius:16px; display:grid; place-items:center; color:#3657c8; font-size:20px; }
.metric-label { color:#7b88b4; font-size:13px; }
.metric-value { margin-top:4px; color:#24356b; font-size:24px; font-weight:700; }
.metric-sub { margin-top:6px; color:#8b97bb; font-size:12px; line-height:1.6; }
.dashboard-grid { display:grid; grid-template-columns:minmax(0,1.4fr) 360px; gap:14px; }
.dashboard-main-column,.dashboard-side-column { display:grid; gap:14px; }
.task-card,.side-card { padding:20px; }
.section-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:16px; }
.section-head h3 { color:#24356b; font-size:20px; }
.section-head p { margin-top:6px; color:#7d89af; line-height:1.7; }
.section-head.compact { margin-bottom:12px; }
.task-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; }
.task-column { border-radius:18px; border:1px solid #edf2ff; background:#fbfcff; padding:14px; }
.task-head { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:12px; color:#24356b; }
.task-list { display:grid; gap:10px; }
.task-row { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:12px; border-radius:14px; background:#fff; border:1px solid #edf1ff; }
.task-title { color:#24356b; font-weight:700; }
.task-meta,.empty-tip { color:#7f8cb4; font-size:13px; line-height:1.6; }
.distribution-list,.trend-list,.income-list { display:grid; gap:12px; }
.distribution-row,.income-row { display:grid; gap:8px; }
.distribution-meta,.income-row { display:flex; align-items:center; justify-content:space-between; gap:10px; }
.distribution-track,.trend-bar { height:10px; border-radius:999px; background:#edf2ff; overflow:hidden; }
.distribution-fill,.trend-bar span { display:block; height:100%; border-radius:inherit; background:linear-gradient(90deg,#4f6ef7,#8fd4ff); }
.trend-row { display:grid; grid-template-columns:56px minmax(0,1fr) 28px; align-items:center; gap:10px; }
.trend-label { color:#7f8cb4; font-size:12px; }
.income-row span { color:#7f8cb4; }
.income-row strong { color:#24356b; }
@media (max-width:1200px){ .metric-grid{ grid-template-columns:repeat(2,minmax(0,1fr)); } .dashboard-grid{ grid-template-columns:1fr; } }
@media (max-width:900px){ .page-toolbar{ flex-direction:column; } .page-actions{ justify-content:flex-start; } .task-grid{ grid-template-columns:1fr; } }
@media (max-width:640px){ .metric-grid{ grid-template-columns:1fr; } .page-copy h2{ font-size:22px; } .task-card,.side-card{ padding:18px; } }
</style>



