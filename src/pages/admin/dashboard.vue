<template>
  <div class="admin-dashboard-page">
    <section class="dashboard-hero board-card">
      <div class="hero-copy">
        <div class="hero-kicker">运营概览</div>
        <h2>把订单、设计师产能和经营趋势，收拢到一个可信的后台概览里</h2>
        <p>
          本页只消费后端聚合统计接口，不再由前端本地拼口径。
          你可以直接在这里看清平台规模、当前履约阶段、设计师效率和最近 30 日经营走势。
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
        <div class="summary-panel">
          <div class="summary-row">
            <span>订单总量</span>
            <strong>{{ overview.orderTotal }}</strong>
          </div>
          <div class="summary-row">
            <span>已支付订单</span>
            <strong>{{ overview.paidOrderCount }}</strong>
          </div>
          <div class="summary-row">
            <span>累计成交额</span>
            <strong>¥{{ formatMoney(overview.totalRevenue) }}</strong>
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

    <section class="content-grid">
      <div class="main-column">
        <article class="board-card funnel-card">
          <div class="section-head">
            <div>
              <h3>订单漏斗</h3>
              <p>采用互斥阶段口径，避免同一订单重复计数。</p>
            </div>
            <el-button size="mini" icon="el-icon-refresh" :loading="loading" @click="loadData">刷新数据</el-button>
          </div>
          <div v-if="funnelRows.length" class="funnel-list">
            <div v-for="item in funnelRows" :key="item.label" class="funnel-row">
              <div class="funnel-copy">
                <strong>{{ item.label }}</strong>
                <span>{{ item.desc }}</span>
              </div>
              <div class="funnel-progress">
                <div class="funnel-track">
                  <div class="funnel-fill" :style="{ width: `${item.percent}%`, background: item.color }"></div>
                </div>
                <b>{{ item.count }}</b>
              </div>
            </div>
          </div>
          <div v-else class="empty-tip">暂无漏斗数据。</div>
        </article>

        <article class="board-card trend-card">
          <div class="section-head">
            <div>
              <h3>订单趋势</h3>
              <p>展示订单数、支付金额、完成订单数，支持近 7 日和近 30 日切换。</p>
            </div>
            <div class="tab-chip-row">
              <button :class="['tab-chip', { active: trendMode === '7' }]" @click="trendMode = '7'">近 7 日</button>
              <button :class="['tab-chip', { active: trendMode === '30' }]" @click="trendMode = '30'">近 30 日</button>
            </div>
          </div>
          <div v-if="activeTrendRows.length" class="trend-list">
            <div v-for="item in activeTrendRows" :key="item.date" class="trend-row">
              <div class="trend-date">{{ item.label }}</div>
              <div class="trend-track-wrap">
                <div class="trend-track">
                  <div class="trend-fill" :style="{ width: `${item.amountPercent}%` }"></div>
                </div>
              </div>
              <div class="trend-metas">
                <span>订单 {{ item.orderCount }}</span>
                <span>金额 ¥{{ formatMoney(item.paidAmount) }}</span>
                <span>完成 {{ item.finishedCount }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-tip">暂无趋势数据。</div>
        </article>

        <article class="board-card efficiency-card">
          <div class="section-head">
            <div>
              <h3>设计师效率</h3>
              <p>按设计师维度查看认领、制作、交付和完成金额。</p>
            </div>
          </div>
          <el-table :data="designerRows" v-loading="loading" size="mini">
            <el-table-column prop="designerName" label="设计师" min-width="140" />
            <el-table-column prop="claimCount" label="认领数" width="90" align="center" />
            <el-table-column prop="producingCount" label="制作中" width="90" align="center" />
            <el-table-column prop="deliveredCount" label="已交付" width="90" align="center" />
            <el-table-column label="完成金额" min-width="120" align="right">
              <template slot-scope="scope">
                <strong class="money-text">¥{{ formatMoney(scope.row.finishedAmount) }}</strong>
              </template>
            </el-table-column>
          </el-table>
        </article>
      </div>

      <div class="side-column">
        <article class="board-card stay-card">
          <div class="section-head compact-head">
            <div>
              <h3>阶段停留时长</h3>
              <p>按当前阶段统计平均停留时间。</p>
            </div>
          </div>
          <div v-if="stayRows.length" class="stay-list">
            <div v-for="item in stayRows" :key="item.label" class="stay-row">
              <div>
                <strong>{{ item.label }}</strong>
                <span>{{ item.count }} 单</span>
              </div>
              <b>{{ formatHours(item.avgHours) }}</b>
            </div>
          </div>
          <div v-else class="empty-tip">暂无停留时长数据。</div>
        </article>

        <article class="board-card recent-card">
          <div class="section-head compact-head">
            <div>
              <h3>最近订单</h3>
              <p>用于快速进入订单处理页。</p>
            </div>
            <el-button type="text" @click="go('/admin/orders')">查看全部</el-button>
          </div>
          <div v-if="recentOrders.length" class="recent-list">
            <div v-for="item in recentOrders" :key="item.id" class="recent-row">
              <div>
                <div class="recent-title">{{ item.orderNo || `订单 ${item.id}` }}</div>
                <div class="recent-meta">{{ item.addtime || '-' }}</div>
              </div>
              <el-tag size="mini" :type="statusTagType(item.orderStatus)">{{ item.orderStatus || '-' }}</el-tag>
            </div>
          </div>
          <div v-else class="empty-tip">暂无最近订单。</div>
        </article>

        <article class="board-card category-card">
          <div class="section-head compact-head">
            <div>
              <h3>热门素材分类</h3>
              <p>按素材数量统计，帮助判断素材覆盖情况。</p>
            </div>
          </div>
          <div v-if="categoryRows.length" class="category-list">
            <div v-for="item in categoryRows" :key="item.name" class="category-row">
              <div class="category-copy">
                <strong>{{ item.name }}</strong>
                <span>{{ item.count }} 个素材</span>
              </div>
              <div class="category-track">
                <div class="category-fill" :style="{ width: `${item.percent}%` }"></div>
              </div>
            </div>
          </div>
          <div v-else class="empty-tip">暂无素材分类数据。</div>
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
      trendMode: '7',
      overview: {
        userTotal: 0,
        designerTotal: 0,
        orderTotal: 0,
        paidOrderCount: 0,
        totalRevenue: 0,
        todayOrderCount: 0
      },
      recentOrders: [],
      categoryRows: [],
      funnelRows: [],
      trendRows7: [],
      trendRows30: [],
      stayRows: [],
      designerRows: []
    }
  },
  computed: {
    todayText() {
      const now = new Date()
      const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      return `${now.getMonth() + 1} 月 ${now.getDate()} 日 · ${weekNames[now.getDay()]}`
    },
    metricCards() {
      return [
        {
          label: '注册用户',
          value: this.overview.userTotal,
          sub: '平台累计注册用户',
          icon: 'el-icon-user',
          bg: '#eef4ff'
        },
        {
          label: '入驻设计师',
          value: this.overview.designerTotal,
          sub: '当前具备接单能力的设计师数',
          icon: 'el-icon-s-custom',
          bg: '#fff3ea'
        },
        {
          label: '订单总数',
          value: this.overview.orderTotal,
          sub: '全平台累计订单量',
          icon: 'el-icon-s-order',
          bg: '#f4f0ff'
        },
        {
          label: '已支付订单',
          value: this.overview.paidOrderCount,
          sub: '已进入履约链路的订单数',
          icon: 'el-icon-wallet',
          bg: '#eefaf4'
        },
        {
          label: '今日订单',
          value: this.overview.todayOrderCount,
          sub: '按创建时间统计今日新增',
          icon: 'el-icon-date',
          bg: '#f2f6ff'
        },
        {
          label: '累计成交额',
          value: `¥${this.formatMoney(this.overview.totalRevenue)}`,
          sub: '仅统计已支付且未取消订单',
          icon: 'el-icon-coin',
          bg: '#fff7ed'
        }
      ]
    },
    quickActions() {
      return [
        { label: '角色权限', path: '/admin/roles', icon: 'el-icon-s-check' },
        { label: '服装素材', path: '/admin/materials', icon: 'el-icon-picture-outline' },
        { label: '订单生产', path: '/admin/orders', icon: 'el-icon-s-order' }
      ]
    },
    activeTrendRows() {
      return this.trendMode === '30' ? this.trendRows30 : this.trendRows7
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
      return Number(value || 0).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    formatHours(value) {
      const num = Number(value || 0)
      if (num < 24) {
        return `${num.toFixed(1)} 小时`
      }
      return `${(num / 24).toFixed(1)} 天`
    },
    toNumber(value, fallback = 0) {
      const num = Number(value)
      return Number.isFinite(num) ? num : fallback
    },
    normalizePercentRows(rows, valueKey = 'count') {
      const max = Math.max(...rows.map((item) => this.toNumber(item[valueKey], 0)), 1)
      return rows.map((item) => ({
        ...item,
        percent: this.toNumber(item[valueKey], 0) > 0 ? Math.max(Math.round((this.toNumber(item[valueKey], 0) / max) * 100), 8) : 0
      }))
    },
    statusTagType(status) {
      if (status === '已完成') return 'success'
      if (status === '已发货') return 'primary'
      if (status === '生产中' || status === '待生产' || status === '待确认') return 'warning'
      if (status === '已取消') return 'info'
      return ''
    },
    normalizeTrendRows(rows = []) {
      const amountMax = Math.max(...rows.map((item) => this.toNumber(item.paidAmount, 0)), 0)
      return rows.map((item) => ({
        date: item.date,
        label: item.label || String(item.date || '').slice(5),
        orderCount: this.toNumber(item.orderCount, 0),
        paidAmount: this.toNumber(item.paidAmount, 0),
        finishedCount: this.toNumber(item.finishedCount, 0),
        amountPercent: amountMax > 0 ? Math.max(Math.round((this.toNumber(item.paidAmount, 0) / amountMax) * 100), 6) : 0
      }))
    },
    async loadData() {
      this.loading = true
      try {
        const [overviewRes, funnelRes, trendRes, stayRes, designerRes] = await Promise.all([
          this.$proxy.Request({ url: this.$proxy.Api.adminAnalyticsOverview, method: 'get', showLoading: false, showError: false }),
          this.$proxy.Request({ url: this.$proxy.Api.adminAnalyticsOrderFunnel, method: 'get', showLoading: false, showError: false }),
          this.$proxy.Request({ url: this.$proxy.Api.adminAnalyticsOrderTrend, method: 'get', showLoading: false, showError: false }),
          this.$proxy.Request({ url: this.$proxy.Api.adminAnalyticsOrderStayDuration, method: 'get', showLoading: false, showError: false }),
          this.$proxy.Request({ url: this.$proxy.Api.adminAnalyticsDesignerEfficiency, method: 'get', showLoading: false, showError: false })
        ])

        const overviewData = (overviewRes && overviewRes.data) || {}
        this.overview = {
          userTotal: this.toNumber(overviewData.userTotal, 0),
          designerTotal: this.toNumber(overviewData.designerTotal, 0),
          orderTotal: this.toNumber(overviewData.orderTotal, 0),
          paidOrderCount: this.toNumber(overviewData.paidOrderCount, 0),
          totalRevenue: this.toNumber(overviewData.totalRevenue, 0),
          todayOrderCount: this.toNumber(overviewData.todayOrderCount, 0)
        }
        this.recentOrders = Array.isArray(overviewData.recentOrders) ? overviewData.recentOrders : []
        this.categoryRows = this.normalizePercentRows(Array.isArray(overviewData.categoryTop) ? overviewData.categoryTop : [])

        const funnelSeed = [
          { label: '未支付', desc: '尚未进入支付完成状态', key: 'unpaidCount', color: 'linear-gradient(90deg, #9aa8c9, #c9d2e8)' },
          { label: '已支付', desc: '已支付但还未进入明确履约阶段', key: 'paidCount', color: 'linear-gradient(90deg, #5b6ef5, #8aa6ff)' },
          { label: '待生产', desc: '等待进入制作链路', key: 'pendingProduceCount', color: 'linear-gradient(90deg, #6d7cff, #9bb0ff)' },
          { label: '生产中', desc: '设计与制作正在进行', key: 'producingCount', color: 'linear-gradient(90deg, #ff9f43, #ffd166)' },
          { label: '已发货', desc: '进入交付与收货阶段', key: 'shippedCount', color: 'linear-gradient(90deg, #36a2eb, #73c7ff)' },
          { label: '已完成', desc: '订单已完成闭环', key: 'finishedCount', color: 'linear-gradient(90deg, #3ecf8e, #79e2ae)' },
          { label: '已取消', desc: '已取消订单，可用于复盘', key: 'canceledCount', color: 'linear-gradient(90deg, #a0aec0, #c8d1dc)' }
        ]
        const funnelData = (funnelRes && funnelRes.data) || {}
        this.funnelRows = this.normalizePercentRows(
          funnelSeed.map((item) => ({
            label: item.label,
            desc: item.desc,
            color: item.color,
            count: this.toNumber(funnelData[item.key], 0)
          }))
        )

        const trendData = (trendRes && trendRes.data) || {}
        this.trendRows7 = this.normalizeTrendRows(Array.isArray(trendData.days7) ? trendData.days7 : [])
        this.trendRows30 = this.normalizeTrendRows(Array.isArray(trendData.days30) ? trendData.days30 : [])

        this.stayRows = Array.isArray(stayRes && stayRes.data)
          ? (stayRes.data || []).map((item) => ({
              label: item.label,
              count: this.toNumber(item.count, 0),
              avgHours: this.toNumber(item.avgHours, 0)
            }))
          : []

        this.designerRows = Array.isArray(designerRes && designerRes.data)
          ? (designerRes.data || []).map((item) => ({
              designerName: item.designerName || item.shejishixingming || '未命名设计师',
              claimCount: this.toNumber(item.claimCount, 0),
              producingCount: this.toNumber(item.producingCount, 0),
              deliveredCount: this.toNumber(item.deliveredCount, 0),
              finishedAmount: this.toNumber(item.finishedAmount, 0)
            }))
          : []

        if (!overviewRes || !funnelRes || !trendRes || !stayRes || !designerRes) {
          this.$message.warning('部分统计接口加载失败，已显示可用内容')
        }
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
  border: 1px solid #e6eafb;
  background: #fff;
  box-shadow: 0 16px 34px rgba(84, 99, 183, 0.08);
}

.dashboard-hero {
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
  font-weight: 700;
}

.dashboard-hero h2 {
  margin-top: 12px;
  font-size: 32px;
  line-height: 1.35;
  color: #202a4a;
}

.dashboard-hero p {
  margin-top: 12px;
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
  color: #5b6ef5;
  border: 1px solid #dde4ff;
}

.summary-panel {
  padding: 18px;
  border-radius: 22px;
  background: linear-gradient(160deg, #5b6ef5, #7d8dff);
  color: #fff;
  display: grid;
  gap: 14px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-row span {
  color: rgba(255,255,255,0.82);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 14px;
}

.metric-card {
  padding: 18px;
  display: flex;
  gap: 14px;
  align-items: center;
}

.metric-icon {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5b6ef5;
  font-size: 22px;
}

.metric-label {
  color: #7f8bb2;
  font-size: 13px;
}

.metric-value {
  margin-top: 4px;
  color: #202a4a;
  font-size: 26px;
  font-weight: 700;
}

.metric-sub {
  margin-top: 4px;
  color: #8c96b3;
  font-size: 12px;
  line-height: 1.5;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) 360px;
  gap: 16px;
}

.main-column,
.side-column {
  display: grid;
  gap: 16px;
}

.funnel-card,
.trend-card,
.efficiency-card,
.stay-card,
.recent-card,
.category-card {
  padding: 22px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.section-head h3 {
  margin: 0;
  color: #202a4a;
  font-size: 22px;
}

.section-head p {
  margin-top: 8px;
  color: #7f8bb2;
  line-height: 1.7;
}

.compact-head h3 {
  font-size: 18px;
}

.funnel-list,
.stay-list,
.recent-list,
.category-list {
  display: grid;
  gap: 14px;
}

.funnel-row,
.stay-row,
.recent-row,
.category-row {
  display: grid;
  gap: 12px;
}

.funnel-row {
  grid-template-columns: minmax(0, 1fr) 220px;
  align-items: center;
}

.funnel-copy strong,
.category-copy strong,
.recent-title {
  color: #202a4a;
}

.funnel-copy span,
.category-copy span,
.recent-meta,
.stay-row span {
  display: block;
  margin-top: 4px;
  color: #7f8bb2;
  font-size: 12px;
}

.funnel-progress {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 32px;
  gap: 10px;
  align-items: center;
}

.funnel-track,
.category-track,
.trend-track {
  height: 10px;
  border-radius: 999px;
  background: #eef2ff;
  overflow: hidden;
}

.funnel-fill,
.category-fill,
.trend-fill {
  height: 100%;
  border-radius: inherit;
}

.category-fill,
.trend-fill {
  background: linear-gradient(90deg, #5b6ef5, #8da7ff);
}

.tab-chip-row {
  display: flex;
  gap: 10px;
}

.tab-chip {
  height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid #dbe2ff;
  background: #fff;
  color: #5c688f;
  cursor: pointer;
}

.tab-chip.active {
  background: #5b6ef5;
  color: #fff;
  border-color: #5b6ef5;
}

.trend-list {
  display: grid;
  gap: 12px;
}

.trend-row {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) 260px;
  gap: 12px;
  align-items: center;
}

.trend-date {
  color: #5c688f;
  font-size: 13px;
}

.trend-metas {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: #6e7a9d;
  font-size: 12px;
}

.money-text {
  color: #5b6ef5;
}

.stay-row {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  padding: 14px 16px;
  border-radius: 18px;
  background: #f8f9ff;
}

.category-row {
  padding: 14px 16px;
  border-radius: 18px;
  background: #f8f9ff;
}

.empty-tip {
  color: #8c96b3;
  line-height: 1.8;
}

@media (max-width: 1400px) {
  .metric-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .content-grid,
  .dashboard-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .funnel-row,
  .trend-row,
  .section-head {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .trend-metas {
    flex-wrap: wrap;
  }
}

@media (max-width: 520px) {
  .metric-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-hero,
  .funnel-card,
  .trend-card,
  .efficiency-card,
  .stay-card,
  .recent-card,
  .category-card {
    padding: 18px;
  }
}
</style>