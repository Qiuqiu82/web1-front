<template>
  <div class="admin-dashboard-page">
    <section class="dashboard-hero board-card">
      <div class="hero-copy">
        <div class="hero-kicker">Platform Overview</div>
        <h2>把平台运营、订单节奏和素材状态，集中放在一个后台里</h2>
        <p>
          这里汇总用户、设计师、订单与素材数据，方便你快速看清今天的重点动作，
          也便于从一个入口切到权限、素材和订单处理页面。
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
        <div class="hero-summary">
          <div class="summary-row">
            <span>平台累计收益</span>
            <strong>¥{{ formatMoney(kpi.totalRevenue) }}</strong>
          </div>
          <div class="summary-row">
            <span>今日订单数</span>
            <strong>{{ kpi.todayOrderCount }}</strong>
          </div>
          <div class="summary-row">
            <span>当前热门分类</span>
            <strong>{{ hotCategories[0] ? hotCategories[0].name : '待补充' }}</strong>
          </div>
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
        <article class="board-card chart-card">
          <div class="section-head">
            <div>
              <h3>近 7 日订单趋势</h3>
              <p>按订单创建时间统计，帮助判断近期订单热度。</p>
            </div>
            <el-button size="mini" icon="el-icon-refresh" :loading="loading" @click="loadData">刷新数据</el-button>
          </div>
          <div v-if="trendData.length" class="trend-list">
            <div v-for="item in trendData" :key="item.key" class="trend-row">
              <div class="trend-date">{{ item.label }}</div>
              <div class="trend-track">
                <div class="trend-fill" :style="{ width: `${Math.max((item.count / trendMax) * 100, 6)}%` }"></div>
              </div>
              <div class="trend-value">{{ item.count }}</div>
            </div>
          </div>
          <div v-else class="empty-tip">暂时还没有可展示的订单趋势数据。</div>
        </article>

        <article class="board-card status-card">
          <div class="section-head">
            <div>
              <h3>订单状态概览</h3>
              <p>帮助你快速识别当前平台重点处理的订单阶段。</p>
            </div>
            <el-button type="text" @click="go('/admin/orders')">前往订单管理</el-button>
          </div>
          <div class="status-list">
            <div v-for="item in statusRows" :key="item.label" class="status-row">
              <div class="status-copy">
                <strong>{{ item.label }}</strong>
                <span>{{ item.desc }}</span>
              </div>
              <div class="status-meta">
                <div class="status-progress">
                  <div class="status-progress-inner" :style="{ width: `${item.percent}%` }"></div>
                </div>
                <b>{{ item.count }}</b>
              </div>
            </div>
          </div>
        </article>

        <article class="board-card recent-card">
          <div class="section-head">
            <div>
              <h3>最近订单</h3>
              <p>展示最近进入系统的订单，方便快速跟踪。</p>
            </div>
            <el-button type="text" @click="go('/admin/orders')">查看全部</el-button>
          </div>
          <div v-if="recentOrders.length" class="recent-list">
            <div v-for="(item, index) in recentOrders" :key="`${item.addtime}-${index}`" class="recent-row">
              <div>
                <div class="recent-title">订单 {{ index + 1 }}</div>
                <div class="recent-meta">{{ item.addtime || '-' }}</div>
              </div>
              <div class="recent-amount">¥{{ formatMoney(item.totalAmount) }}</div>
              <el-tag size="mini" :type="statusTagType(item.orderStatus)">{{ item.orderStatus || '待确认' }}</el-tag>
            </div>
          </div>
          <div v-else class="empty-tip">暂时还没有订单数据。</div>
        </article>
      </div>

      <div class="dashboard-side-column">
        <article class="board-card side-card">
          <div class="section-head compact">
            <h3>运营提醒</h3>
          </div>
          <div class="notice-list">
            <div v-for="item in noticeList" :key="item.title" class="notice-row">
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.desc }}</p>
              </div>
              <span>{{ item.tag }}</span>
            </div>
          </div>
        </article>

        <article class="board-card side-card">
          <div class="section-head compact">
            <h3>素材分类热度</h3>
          </div>
          <div v-if="hotCategories.length" class="category-list">
            <div v-for="item in hotCategories.slice(0, 5)" :key="item.name" class="category-row">
              <div class="category-name">{{ item.name }}</div>
              <div class="category-track">
                <div class="category-fill" :style="{ width: `${item.percent}%` }"></div>
              </div>
              <div class="category-value">{{ item.count }}</div>
            </div>
          </div>
          <div v-else class="empty-tip">暂时还没有素材分类统计。</div>
        </article>

        <article class="board-card side-card">
          <div class="section-head compact">
            <h3>快捷入口</h3>
          </div>
          <div class="shortcut-list">
            <button v-for="item in quickActions" :key="`side-${item.path}`" type="button" class="shortcut-item" @click="go(item.path)">
              <i :class="item.icon"></i>
              <div>
                <strong>{{ item.label }}</strong>
                <span>{{ item.desc }}</span>
              </div>
            </button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboard',
  data() {
    return {
      loading: false,
      orders: [],
      kpi: {
        userTotal: 0,
        designerTotal: 0,
        todayOrderCount: 0,
        totalRevenue: 0
      },
      trendData: [],
      hotCategories: []
    }
  },
  computed: {
    todayText() {
      const now = new Date()
      const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      return `${now.getMonth() + 1} 月 ${now.getDate()} 日 · ${weekNames[now.getDay()]}`
    },
    trendMax() {
      if (!this.trendData.length) {
        return 1
      }
      const max = Math.max(...this.trendData.map((item) => item.count || 0))
      return max > 0 ? max : 1
    },
    metricCards() {
      return [
        {
          label: '注册用户',
          value: this.kpi.userTotal,
          sub: '累计平台用户总量',
          icon: 'el-icon-user',
          bg: '#eef4ff'
        },
        {
          label: '入驻设计师',
          value: this.kpi.designerTotal,
          sub: '当前可协作设计师数',
          icon: 'el-icon-s-custom',
          bg: '#fff3ea'
        },
        {
          label: '今日订单',
          value: this.kpi.todayOrderCount,
          sub: '按创建时间统计',
          icon: 'el-icon-tickets',
          bg: '#f2f6ff'
        },
        {
          label: '累计收益',
          value: `¥${this.formatMoney(this.kpi.totalRevenue)}`,
          sub: '支持聚合接口回退计算',
          icon: 'el-icon-coin',
          bg: '#fff7ed'
        }
      ]
    },
    quickActions() {
      return [
        { label: '查看角色权限', desc: '统一查看角色分布与权限入口', path: '/admin/roles', icon: 'el-icon-s-check' },
        { label: '维护素材资产', desc: '管理面料、库存与规则配置', path: '/admin/materials', icon: 'el-icon-picture-outline' },
        { label: '处理平台订单', desc: '进入订单管理统一跟进流程', path: '/admin/orders', icon: 'el-icon-s-order' }
      ]
    },
    noticeList() {
      return [
        { title: '关注待确认订单', desc: '优先处理刚进入平台的定制订单，避免积压。', tag: '订单' },
        { title: '检查素材覆盖率', desc: '及时补充热门分类素材，避免前台展示内容失衡。', tag: '素材' },
        { title: '同步设计师状态', desc: '确认设计师侧接单和交付链路运行正常。', tag: '协同' }
      ]
    },
    recentOrders() {
      return [...this.orders]
        .sort((a, b) => String(b.addtime || '').localeCompare(String(a.addtime || '')))
        .slice(0, 5)
    },
    statusRows() {
      const seed = [
        { label: '待确认', desc: '需要管理员关注的新进入订单', count: 0 },
        { label: '待生产', desc: '等待设计师进入制作流程', count: 0 },
        { label: '生产中', desc: '正在推进定制与制作阶段', count: 0 },
        { label: '已发货', desc: '已经进入履约交付阶段', count: 0 },
        { label: '已完成', desc: '客户已完成订单闭环', count: 0 },
        { label: '已取消', desc: '已取消订单，便于后续复盘', count: 0 }
      ]
      this.orders.forEach((item) => {
        const target = seed.find((row) => row.label === item.orderStatus)
        if (target) {
          target.count += 1
        }
      })
      const max = Math.max(...seed.map((row) => row.count), 1)
      return seed.map((row) => ({
        ...row,
        percent: Math.max(Math.round((row.count / max) * 100), row.count ? 8 : 0)
      }))
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    go(path) {
      this.$router.push(path)
    },
    formatMoney(value) {
      const amount = Number(value || 0)
      return amount.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    statusTagType(status) {
      if (status === '已完成') return 'success'
      if (status === '生产中' || status === '待生产') return 'warning'
      if (status === '已取消') return 'info'
      return ''
    },
    dayKey(date) {
      const year = date.getFullYear()
      const month = `${date.getMonth() + 1}`.padStart(2, '0')
      const day = `${date.getDate()}`.padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    parseDayKey(input) {
      if (!input) {
        return ''
      }
      if (input instanceof Date && !Number.isNaN(input.getTime())) {
        return this.dayKey(input)
      }
      const text = String(input)
      const byText = text.match(/\d{4}-\d{2}-\d{2}/)
      if (byText) {
        return byText[0]
      }
      const parsed = new Date(text.replace(/-/g, '/'))
      if (Number.isNaN(parsed.getTime())) {
        return ''
      }
      return this.dayKey(parsed)
    },
    buildRecentDays(days = 7) {
      const result = []
      const now = new Date()
      for (let index = days - 1; index >= 0; index -= 1) {
        const d = new Date(now)
        d.setDate(now.getDate() - index)
        result.push({
          key: this.dayKey(d),
          label: `${d.getMonth() + 1}/${d.getDate()}`,
          count: 0
        })
      }
      return result
    },
    pickNumber(source, keys) {
      if (!source || typeof source !== 'object') {
        return null
      }
      for (let i = 0; i < keys.length; i += 1) {
        const raw = source[keys[i]]
        const num = Number(raw)
        if (raw !== '' && raw != null && !Number.isNaN(num)) {
          return num
        }
      }
      return null
    },
    normalizeOrders(list) {
      if (!Array.isArray(list)) {
        return []
      }
      return list.map((item) => ({
        totalAmount: Number(item.totalAmount || item.total_amount || 0),
        payStatus: item.payStatus || item.pay_status || '',
        orderStatus: item.orderStatus || item.order_status || '',
        addtime: item.addtime || item.createTime || item.insertTime || item.create_time || ''
      }))
    },
    buildHotCategories(materialRows) {
      const countMap = {}
      ;(materialRows || []).forEach((row) => {
        const name = row.categoryName || row.category_name || '未分类'
        countMap[name] = (countMap[name] || 0) + 1
      })
      const list = Object.keys(countMap)
        .map((name) => ({ name, count: countMap[name] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
      if (!list.length) {
        return []
      }
      const max = list[0].count
      return list.map((item) => ({
        ...item,
        percent: Math.max(Math.round((item.count / max) * 100), 10)
      }))
    },
    extractRevenue(payload) {
      const direct = Number(payload)
      if (!Number.isNaN(direct) && payload !== '' && payload != null) {
        return direct
      }
      if (payload && typeof payload === 'object') {
        const value = this.pickNumber(payload, ['result', 'value', 'sum', 'total', 'amount', 'totalAmount'])
        if (value != null) {
          return value
        }
      }
      return null
    },
    async loadData() {
      this.loading = true
      try {
        const [userRes, designerRes, orderRes, revenueRes, materialRes] = await Promise.all([
          this.$proxy.Request({
            url: this.$proxy.Api.yonghuPage,
            method: 'get',
            showLoading: false,
            params: { page: 1, limit: 1 }
          }),
          this.$proxy.Request({
            url: this.$proxy.Api.shejishiPage,
            method: 'get',
            showLoading: false,
            params: { page: 1, limit: 1 }
          }),
          this.$proxy.Request({
            url: this.$proxy.Api.cosorderAdminPage,
            method: 'get',
            showLoading: false,
            params: { page: 1, limit: 300 }
          }),
          this.$proxy.Request({
            url: this.$proxy.Api.commonCalCosorderTotalAmount,
            method: 'get',
            showLoading: false
          }),
          this.$proxy.Request({
            url: this.$proxy.Api.cosMaterialAdminPage,
            method: 'get',
            showLoading: false,
            params: { page: 1, limit: 300 }
          })
        ])

        this.kpi.userTotal = Number(((userRes || {}).data || {}).total || 0)
        this.kpi.designerTotal = Number(((designerRes || {}).data || {}).total || 0)

        const orders = this.normalizeOrders((((orderRes || {}).data || {}).list) || [])
        this.orders = orders
        const today = this.dayKey(new Date())
        const trendSeed = this.buildRecentDays(7)
        const trendMap = trendSeed.reduce((acc, item) => {
          acc[item.key] = item
          return acc
        }, {})

        let todayOrderCount = 0
        orders.forEach((item) => {
          const key = this.parseDayKey(item.addtime)
          if (!key) {
            return
          }
          if (key === today) {
            todayOrderCount += 1
          }
          if (trendMap[key]) {
            trendMap[key].count += 1
          }
        })
        this.kpi.todayOrderCount = todayOrderCount
        this.trendData = trendSeed

        const revenue = this.extractRevenue((revenueRes || {}).data)
        if (revenue != null) {
          this.kpi.totalRevenue = revenue
        } else {
          const paidSum = orders
            .filter((item) => item.payStatus === '已支付' || item.orderStatus === '已完成')
            .reduce((sum, item) => sum + Number(item.totalAmount || 0), 0)
          this.kpi.totalRevenue = paidSum || orders.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0)
        }

        const materials = ((((materialRes || {}).data || {}).list) || [])
        this.hotCategories = this.buildHotCategories(materials)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.admin-dashboard-page {
  display: grid;
  gap: 16px;
}

.board-card {
  border-radius: 24px;
  border: 1px solid #ece7df;
  background: #fff;
  box-shadow: 0 16px 34px rgba(97, 79, 59, 0.08);
}

.dashboard-hero {
  padding: 24px 26px;
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) 320px;
  gap: 18px;
  background: linear-gradient(135deg, #fff8f2 0%, #ffffff 42%, #fff4eb 100%);
}

.hero-kicker {
  display: inline-flex;
  height: 30px;
  align-items: center;
  padding: 0 12px;
  border-radius: 999px;
  background: #fff2e5;
  color: #ff8b4d;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 700;
}

.dashboard-hero h2 {
  margin-top: 12px;
  font-size: 32px;
  line-height: 1.35;
  color: #2a2f3d;
}

.dashboard-hero p {
  margin-top: 12px;
  max-width: 760px;
  line-height: 1.85;
  color: #7f879a;
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
  border: 1px solid #ffe3d1;
  background: #fff;
  color: #4f5669;
  cursor: pointer;
}

.action-chip i {
  color: #ff8b4d;
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
  border: 1px solid #f0e5d9;
  color: #6e7487;
}

.hero-summary {
  padding: 18px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid #f0e5d9;
  display: grid;
  gap: 12px;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.summary-row span {
  color: #8b93a8;
  font-size: 13px;
}

.summary-row strong {
  color: #2a2f3d;
  font-size: 18px;
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
  color: #5b647c;
  font-size: 20px;
}

.metric-label {
  color: #8b93a8;
  font-size: 13px;
}

.metric-value {
  margin-top: 6px;
  color: #2a2f3d;
  font-size: 24px;
  font-weight: 700;
}

.metric-sub {
  margin-top: 4px;
  color: #9aa2b6;
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

.chart-card,
.status-card,
.recent-card,
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
  color: #2b3240;
  font-size: 18px;
}

.section-head p {
  margin-top: 6px;
  color: #8c94aa;
  font-size: 13px;
}

.section-head.compact {
  margin-bottom: 14px;
}

.trend-list,
.status-list,
.notice-list,
.shortcut-list,
.category-list,
.recent-list {
  margin-top: 16px;
  display: grid;
  gap: 12px;
}

.trend-row,
.category-row,
.recent-row,
.notice-row,
.status-row {
  display: grid;
  align-items: center;
  gap: 12px;
}

.trend-row {
  grid-template-columns: 64px minmax(0, 1fr) 44px;
}

.trend-track,
.category-track,
.status-progress {
  height: 10px;
  border-radius: 999px;
  background: #f4efe8;
  overflow: hidden;
}

.trend-fill,
.category-fill,
.status-progress-inner {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #ffb482 0%, #ff8b4d 100%);
}

.trend-date,
.category-name,
.status-copy span,
.recent-meta,
.notice-row p {
  color: #8b93a8;
  font-size: 13px;
}

.trend-value,
.category-value,
.recent-amount {
  color: #2a2f3d;
  font-weight: 700;
}

.status-row {
  grid-template-columns: minmax(0, 1fr) 260px;
  padding: 14px 0;
  border-bottom: 1px solid #f3eee7;
}

.status-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.status-copy strong,
.notice-row strong,
.shortcut-item strong,
.recent-title {
  color: #2a2f3d;
  font-weight: 700;
}

.status-copy span {
  display: block;
  margin-top: 6px;
}

.status-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-meta b {
  width: 22px;
  text-align: right;
}

.recent-row {
  grid-template-columns: minmax(0, 1fr) auto auto;
  padding: 12px 0;
  border-bottom: 1px solid #f3eee7;
}

.recent-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.notice-row {
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 14px;
  border-radius: 18px;
  background: #faf7f3;
}

.notice-row p {
  margin-top: 6px;
  line-height: 1.7;
}

.notice-row span {
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  background: #fff;
  color: #ff8b4d;
  font-size: 12px;
  border: 1px solid #ffe2cf;
}

.shortcut-item {
  padding: 14px 12px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  border-radius: 18px;
  border: 1px solid #f1e9df;
  background: #fff;
  cursor: pointer;
  text-align: left;
}

.shortcut-item i {
  width: 18px;
  margin-top: 2px;
  color: #ff8b4d;
}

.shortcut-item span {
  display: block;
  margin-top: 6px;
  color: #8b93a8;
  font-size: 12px;
  line-height: 1.7;
}

@media (max-width: 1280px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid,
  .dashboard-hero {
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

  .trend-row,
  .status-row,
  .recent-row,
  .notice-row {
    grid-template-columns: 1fr;
  }

  .section-head,
  .summary-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .dashboard-hero {
    padding: 18px;
  }
}
</style>
