<template>
  <div class="designer-workbench-page">
    <section class="page-toolbar">
      <div class="page-copy">
        <span class="page-tag">{{ '\u5de5\u4f5c\u53f0' }}</span>
        <h2>{{ texts.heroTitle }}</h2>
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
              <div class="task-head"><strong>{{ texts.poolGroup }}</strong><span>{{ poolOrders.length }} {{ texts.unit }}</span></div>
              <div v-if="poolOrders.length" class="task-list">
                <div v-for="item in poolOrders" :key="`pool-${item.id}`" class="task-row">
                  <div><div class="task-title">{{ item.orderNo || item.id }}</div><div class="task-meta">{{ texts.userLabel }} {{ item.userId || '-' }} | {{ currency }}{{ formatMoney(item.totalAmount) }}</div></div>
                  <el-button size="mini" type="primary" :loading="actionLoadingKey === `claim-${item.id}`" @click="claim(item)">{{ texts.claim }}</el-button>
                </div>
              </div>
              <div v-else class="empty-tip">{{ texts.emptyPool }}</div>
            </div>

            <div class="task-column">
              <div class="task-head"><strong>{{ texts.producingGroup }}</strong><span>{{ producingOrders.length }} {{ texts.unit }}</span></div>
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
              <div class="task-head"><strong>{{ texts.deliveryGroup }}</strong><span>{{ deliveryOrders.length }} {{ texts.unit }}</span></div>
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
const STATUS_PENDING_PRODUCTION = '\u5f85\u751f\u4ea7'
const STATUS_PRODUCING = '\u751f\u4ea7\u4e2d'
const STATUS_SHIPPED = '\u5df2\u53d1\u8d27'
const STATUS_FINISHED = '\u5df2\u5b8c\u6210'
const STATUS_CANCELLED = '\u5df2\u53d6\u6d88'
const TEXTS = {
  heroTitle: '\u628a\u63a5\u5355\u3001\u5236\u4f5c\u3001\u6c9f\u901a\u548c\u4ea4\u4ed8\uff0c\u6536\u62e2\u8fdb\u4e00\u4e2a\u8bbe\u8ba1\u5e08\u5de5\u4f5c\u53f0',
  heroDesc: '\u767b\u5f55\u540e\u5373\u53ef\u5feb\u901f\u67e5\u770b\u5f85\u63a5\u8ba2\u5355\u3001\u6b63\u5728\u63a8\u8fdb\u7684\u4efb\u52a1\u3001\u4eca\u65e5\u63a5\u5355\u8282\u594f\u4ee5\u53ca\u4e2a\u4eba\u8d44\u6599\u5b8c\u6210\u5ea6\u3002',
  profileCompletion: '\u6863\u6848\u5b8c\u6210\u5ea6 ',
  focusTitle: '\u4eca\u65e5\u4efb\u52a1\u7126\u70b9',
  focusDesc: '\u6309\u201c\u5f85\u63a5\u5355 / \u5236\u4f5c\u4e2d / \u5f85\u4ea4\u4ed8\u201d\u5206\u7ec4\uff0c\u4f18\u5148\u63a8\u8fdb\u5173\u952e\u8282\u70b9\u3002',
  refresh: '\u5237\u65b0\u6570\u636e',
  poolGroup: '\u5f85\u63a5\u5355',
  producingGroup: '\u5236\u4f5c\u4e2d',
  deliveryGroup: '\u5f85\u4ea4\u4ed8',
  unit: '\u6761',
  userLabel: '\u7528\u6237',
  claim: '\u8ba4\u9886',
  startProduction: '\u5f00\u59cb\u5236\u4f5c',
  goComm: '\u53bb\u6c9f\u901a',
  shipNow: '\u53bb\u53d1\u8d27',
  waitingShip: '\u5f85\u53d1\u8d27',
  emptyPool: '\u6682\u65f6\u6ca1\u6709\u5f85\u9886\u53d6\u7684\u8ba2\u5355\u3002',
  emptyProducing: '\u5f53\u524d\u6ca1\u6709\u5904\u4e8e\u5236\u4f5c\u4e2d\u7684\u8ba2\u5355\u3002',
  emptyDelivery: '\u5f53\u524d\u6ca1\u6709\u5f85\u53d1\u8d27\u7684\u8ba2\u5355\u3002',
  distributionTitle: '\u8ba2\u5355\u72b6\u6001\u5206\u5e03',
  trendTitle: '\u8fd17\u65e5\u5904\u7406\u8d8b\u52bf',
  incomeTitle: '\u91d1\u989d\u6982\u89c8',
  totalAmount: '\u7d2f\u8ba1\u627f\u63a5\u91d1\u989d',
  completedAmount: '\u5df2\u5b8c\u6210\u8ba2\u5355\u989d',
  pendingShipCount: '\u5f85\u4ea4\u4ed8\u8ba2\u5355\u6570',
  emptyDistribution: '\u6682\u65f6\u8fd8\u6ca1\u6709\u53ef\u7528\u7684\u72b6\u6001\u5206\u5e03\u6570\u636e\u3002',
  emptyTrend: '\u6682\u65f6\u8fd8\u6ca1\u6709\u8fd17\u65e5\u8d8b\u52bf\u6570\u636e\u3002',
  loadWarn: '\u8ba2\u5355\u6570\u636e\u52a0\u8f7d\u5b58\u5728\u5f02\u5e38\uff0c\u5df2\u5c55\u793a\u53ef\u7528\u90e8\u5206\u3002',
  claimConfirm: '\u786e\u8ba4\u8ba4\u9886\u8ba2\u5355 ',
  startConfirm: '\u786e\u8ba4\u5f00\u59cb\u5236\u4f5c\u8ba2\u5355 ',
  promptTitle: '\u5b8c\u6210\u5e76\u53d1\u8d27',
  promptLabel: '\u8bf7\u586b\u5199\u4ea4\u4ed8\u8bf4\u660e\u6216\u7269\u6d41\u5355\u53f7\uff08\u53ef\u9009\uff09',
  promptPlaceholder: '\u4f8b\u5982\uff1a\u7269\u6d41\u5355\u53f7 + \u4ea4\u4ed8\u8bf4\u660e',
  confirm: '\u786e\u8ba4',
  cancel: '\u53d6\u6d88',
  confirmClaim: '\u786e\u8ba4\u8ba4\u9886',
  confirmStart: '\u5f00\u59cb\u5236\u4f5c',
  confirmShip: '\u786e\u8ba4\u53d1\u8d27',
  claimFail: '\u8ba4\u9886\u5931\u8d25',
  claimSuccess: '\u8ba4\u9886\u6210\u529f',
  startFail: '\u5f00\u59cb\u5236\u4f5c\u5931\u8d25',
  startSuccess: '\u5df2\u5f00\u59cb\u5236\u4f5c',
  shipFail: '\u53d1\u8d27\u64cd\u4f5c\u5931\u8d25',
  shipSuccess: '\u5df2\u6807\u8bb0\u53d1\u8d27',
  profileDone: '\u8d44\u6599\u5df2\u5b8c\u5584\uff0c\u53ef\u4ee5\u6301\u7eed\u6c89\u6dc0\u4e2a\u4eba\u54c1\u724c\u4e0e\u670d\u52a1\u80fd\u529b\u3002',
  profileTodo: '\u5efa\u8bae\u8865\u5145\u5934\u50cf\u3001\u8054\u7cfb\u65b9\u5f0f\u3001\u4e13\u957f\u548c\u7b80\u4ecb\uff0c\u63d0\u5347\u5408\u4f5c\u4fe1\u4efb\u611f\u3002'
}

export default {
  name: 'DesignerWorkbench',
  data() {
    return {
      texts: TEXTS,
      currency: '\u00a5',
      loading: false,
      actionLoadingKey: '',
      poolList: [],
      mineList: [],
      profileSnapshot: {},
      kpi: { poolCount: 0, inProgressCount: 0, toShipCount: 0, todayClaimCount: 0 },
      statusDistribution: [],
      trendData: []
    }
  },
  computed: {
    displayName() { return localStorage.getItem('username') || this.profileSnapshot.shejishixingming || '\u8bbe\u8ba1\u5e08' },
    todayText() {
      const now = new Date()
      const weekNames = ['\u5468\u65e5', '\u5468\u4e00', '\u5468\u4e8c', '\u5468\u4e09', '\u5468\u56db', '\u5468\u4e94', '\u5468\u516d']
      return `${now.getMonth() + 1}\u6708${now.getDate()}\u65e5 | ${weekNames[now.getDay()]}`
    },
    poolOrders() { return this.poolList.slice(0, 4) },
    producingOrders() { return this.mineList.filter((item) => [STATUS_PENDING_PRODUCTION, STATUS_PRODUCING].includes(item.orderStatus)).slice(0, 4) },
    deliveryOrders() { return this.mineList.filter((item) => item.orderStatus === STATUS_PRODUCING).slice(0, 4) },
    trendMax() { return Math.max(1, ...this.trendData.map((item) => item.count || 0)) },
    distributionMax() { return Math.max(1, ...this.statusDistribution.map((item) => item.count || 0)) },
    totalOrderAmount() { return this.mineList.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0) },
    completedOrderAmount() { return this.mineList.filter((item) => item.orderStatus === STATUS_FINISHED).reduce((sum, item) => sum + Number(item.totalAmount || 0), 0) },
    metricCards() {
      return [
        { label: this.texts.poolGroup, value: this.kpi.poolCount, sub: '\u7b49\u5f85\u9886\u53d6\u7684\u516c\u5f00\u8ba2\u5355\u6c60', icon: 'el-icon-s-order', bg: '#eef2ff' },
        { label: '\u5904\u7406\u4e2d\u4efb\u52a1', value: this.kpi.inProgressCount, sub: '\u5f85\u751f\u4ea7\u4e0e\u751f\u4ea7\u4e2d\u7684\u8ba2\u5355', icon: 'el-icon-magic-stick', bg: '#f4f1ff' },
        { label: '\u4eca\u65e5\u9886\u53d6', value: this.kpi.todayClaimCount, sub: '\u6309\u9886\u53d6\u65f6\u95f4\u7edf\u8ba1', icon: 'el-icon-time', bg: '#eef8ff' },
        { label: '\u5df2\u5b8c\u6210\u8ba2\u5355\u989d', value: `${this.currency}${this.formatMoney(this.completedOrderAmount)}`, sub: '\u5df2\u95ed\u73af\u8ba2\u5355\u7d2f\u8ba1\u91d1\u989d', icon: 'el-icon-coin', bg: '#eef7ff' }
      ]
    },
    quickActions() {
      return [
        { label: '\u8ba2\u5355\u7ba1\u7406', path: '/designer/orders', icon: 'el-icon-s-order' },
        { label: '\u6c9f\u901a\u8bb0\u5f55', path: '/designer/communication', icon: 'el-icon-chat-dot-round' },
        { label: '\u70ed\u95e8\u7075\u611f', path: '/designer/inspirations', icon: 'el-icon-picture-outline-round' },
        { label: '\u8d44\u6599\u6863\u6848', path: '/designer/profile', icon: 'el-icon-user' }
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
    parseDateValue(input) {
      if (input === undefined || input === null || input === '') return null
      const date = input instanceof Date ? input : new Date(String(input).replace(/-/g, '/'))
      return Number.isNaN(date.getTime()) ? null : date
    },
    parseDayKey(input) {
      const date = this.parseDateValue(input)
      if (!date) return ''
      const month = `${date.getMonth() + 1}`.padStart(2, '0')
      const day = `${date.getDate()}`.padStart(2, '0')
      return `${date.getFullYear()}-${month}-${day}`
    },
    distributionWidth(count) { return `${Math.max(18, Math.round((count / this.distributionMax) * 100))}%` },
    trendWidth(count) { return `${Math.max(10, Math.round((count / this.trendMax) * 100))}%` },
    normalizeOrders(rows = []) {
      return rows.map((row) => ({
        ...row,
        id: row.id || row.orderId || row.order_id || '',
        orderNo: row.orderNo || row.order_no || '',
        userId: row.userId || row.user_id || '',
        totalAmount: row.totalAmount || row.total_amount || 0,
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
    updateMetrics() {
      const mineRows = this.mineList
      const today = this.parseDayKey(new Date())
      this.kpi.poolCount = this.poolList.length
      this.kpi.inProgressCount = mineRows.filter((item) => [STATUS_PENDING_PRODUCTION, STATUS_PRODUCING].includes(item.orderStatus)).length
      this.kpi.toShipCount = mineRows.filter((item) => item.orderStatus === STATUS_PRODUCING).length
      this.kpi.todayClaimCount = mineRows.filter((item) => this.parseDayKey(item.designerTakeTime || item.addtime) === today).length
      this.statusDistribution = [STATUS_PENDING_PRODUCTION, STATUS_PRODUCING, STATUS_SHIPPED, STATUS_FINISHED, STATUS_CANCELLED].map((label) => ({ label, count: mineRows.filter((item) => item.orderStatus === label).length }))
      const trendMap = {}
      for (let idx = 6; idx >= 0; idx -= 1) {
        const date = new Date()
        date.setDate(date.getDate() - idx)
        const key = this.parseDayKey(date)
        trendMap[key] = { label: `${date.getMonth() + 1}/${date.getDate()}`, count: 0 }
      }
      mineRows.forEach((item) => {
        const key = this.parseDayKey(item.designerTakeTime || item.addtime)
        if (key && trendMap[key]) trendMap[key].count += 1
      })
      this.trendData = Object.values(trendMap)
    },
    canStartProduction(row) { return row && row.orderStatus === STATUS_PENDING_PRODUCTION },
    async loadData() {
      this.loading = true
      try {
        const [poolRes, mineRes, sessionRes] = await Promise.all([
          this.$proxy.Request({ url: this.$proxy.Api.cosorderDesignerPool, method: 'get', showLoading: false, showError: false, params: { page: 1, limit: 120 } }),
          this.$proxy.Request({ url: this.$proxy.Api.cosorderDesignerMine, method: 'get', showLoading: false, showError: false, params: { page: 1, limit: 300 } }),
          this.$proxy.Request({ url: this.$proxy.Api.shejishiSession, method: 'get', showLoading: false, showError: false })
        ])
        if (!poolRes || poolRes.code !== 0 || !mineRes || mineRes.code !== 0) {
          this.$message.warning(this.texts.loadWarn)
        }
        this.poolList = this.normalizeOrders(this.parsePageData((poolRes && poolRes.data) || {}).list)
        this.mineList = this.normalizeOrders(this.parsePageData((mineRes && mineRes.data) || {}).list)
        this.profileSnapshot = (sessionRes && sessionRes.code === 0 && sessionRes.data) || {}
        this.updateMetrics()
      } finally {
        this.loading = false
      }
    },
    async confirmAction(message, confirmButtonText) {
      return this.$confirm(message, this.texts.confirm, { confirmButtonText, cancelButtonText: this.texts.cancel, type: 'warning' }).then(() => true).catch(() => false)
    },
    async claim(row) {
      const ok = await this.confirmAction(`${this.texts.claimConfirm}${row.orderNo || row.id}\uff1f`, this.texts.confirmClaim)
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
      const ok = await this.confirmAction(`${this.texts.startConfirm}${row.orderNo || row.id}\uff1f`, this.texts.confirmStart)
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
      const res = await this.$proxy.Request({ url: this.$proxy.Api.cosorderDesignerShip, method: 'post', dataType: 'json', showError: false, params: { orderId: row.id, remark: remark || '\u8bbe\u8ba1\u5e08\u5df2\u5b8c\u6210\u5236\u4f5c\u5e76\u53d1\u8d27' } })
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