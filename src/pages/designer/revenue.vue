<template>
  <div class="designer-revenue-page">
    <section class="hero-card">
      <div class="hero-copy">
        <span class="section-kicker">收益看板</span>
        <h2>当前以“设计师名下已支付订单成交额”为口径，观察阶段表现与履约节奏</h2>
        <p>
          本轮收益仍是经营视角的订单金额，不代表最终结算收入。
          你可以在这里查看累计规模、近 7 日趋势和按订单拆分的流水明细，为后续真实结算模块预留统一口径。
        </p>
        <div class="hero-actions">
          <el-button type="primary" icon="el-icon-refresh" :loading="loading" @click="loadData">刷新看板</el-button>
          <el-button icon="el-icon-s-order" @click="$router.push('/designer/orders')">查看订单管理</el-button>
        </div>
      </div>
      <div class="hero-side">
        <div class="formula-card">
          <span class="formula-label">当前口径说明</span>
          <strong>仅统计已支付且未取消的本人订单</strong>
          <p>累计金额、进行中金额、已完成金额与本月订单数全部来自后端聚合接口。</p>
        </div>
      </div>
    </section>

    <section class="summary-grid">
      <article v-for="item in summaryCards" :key="item.label" class="summary-card">
        <div class="summary-icon" :style="{ background: item.bg }">
          <i :class="item.icon"></i>
        </div>
        <div>
          <div class="summary-label">{{ item.label }}</div>
          <div class="summary-value">{{ item.value }}</div>
          <div class="summary-sub">{{ item.sub }}</div>
        </div>
      </article>
    </section>

    <section class="chart-grid">
      <article class="panel-card trend-panel">
        <div class="panel-head">
          <div>
            <h3>近 7 日订单金额趋势</h3>
            <p>按天聚合设计师名下已支付订单金额。</p>
          </div>
          <span class="head-note">金额单位：元</span>
        </div>
        <div v-if="trendList.length" class="trend-list">
          <div v-for="item in trendList" :key="`amount-${item.date}`" class="trend-row">
            <span class="trend-date">{{ formatShortDate(item.date) }}</span>
            <div class="trend-track">
              <div class="trend-fill amount-fill" :style="{ width: `${item.amountPercent}%` }"></div>
            </div>
            <strong class="trend-value">¥{{ formatMoney(item.amount) }}</strong>
          </div>
        </div>
        <el-empty v-else description="近 7 日暂无金额数据" :image-size="88" />
      </article>

      <article class="panel-card trend-panel secondary-panel">
        <div class="panel-head">
          <div>
            <h3>近 7 日订单数量趋势</h3>
            <p>用于观察近期接单与推进节奏。</p>
          </div>
          <span class="head-note">单位：单</span>
        </div>
        <div v-if="trendList.length" class="trend-list">
          <div v-for="item in trendList" :key="`count-${item.date}`" class="trend-row">
            <span class="trend-date">{{ formatShortDate(item.date) }}</span>
            <div class="trend-track secondary-track">
              <div class="trend-fill count-fill" :style="{ width: `${item.countPercent}%` }"></div>
            </div>
            <strong class="trend-value">{{ item.count }}</strong>
          </div>
        </div>
        <el-empty v-else description="近 7 日暂无订单数量数据" :image-size="88" />
      </article>
    </section>

    <section class="panel-card flow-panel">
      <div class="panel-head flow-head">
        <div>
          <h3>收益流水明细</h3>
          <p>按订单维度查看时间、状态、金额与设计师处理状态。</p>
        </div>
        <div class="toolbar-actions">
          <el-input
            v-model.trim="filters.orderNo"
            size="small"
            clearable
            placeholder="搜索订单号"
            class="toolbar-input"
            @keyup.enter.native="handleFilter"
            @clear="handleFilter"
          />
          <el-button size="small" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="flowList" class="flow-table">
        <el-table-column label="订单号" min-width="180">
          <template slot-scope="scope">
            <span class="order-no">{{ scope.row.orderNo || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="时间" min-width="170" prop="addtime" />
        <el-table-column label="订单状态" width="120">
          <template slot-scope="scope">
            <el-tag :type="orderStatusType(scope.row.orderStatus)" size="mini">{{ scope.row.orderStatus || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="130">
          <template slot-scope="scope">
            <strong class="amount-text">¥{{ formatMoney(scope.row.totalAmount) }}</strong>
          </template>
        </el-table-column>
        <el-table-column label="设计师状态" width="130">
          <template slot-scope="scope">
            <el-tag :type="designerStatusType(scope.row.designerStatus)" size="mini" effect="plain">{{ scope.row.designerStatus || '-' }}</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :current-page="filters.page"
          :page-size="filters.limit"
          :page-sizes="[8, 10, 20]"
          :total="flowTotal"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'DesignerRevenue',
  data() {
    return {
      loading: false,
      summary: {
        totalAmount: 0,
        completedAmount: 0,
        inProgressAmount: 0,
        monthOrderCount: 0
      },
      trendList: [],
      flowList: [],
      flowTotal: 0,
      filters: {
        page: 1,
        limit: 8,
        orderNo: ''
      }
    }
  },
  computed: {
    summaryCards() {
      return [
        {
          label: '累计订单金额',
          value: `¥${this.formatMoney(this.summary.totalAmount)}`,
          sub: '当前设计师名下已支付订单累计成交额',
          icon: 'el-icon-coin',
          bg: 'linear-gradient(135deg, rgba(79, 110, 247, 0.16), rgba(85, 199, 255, 0.2))'
        },
        {
          label: '已完成订单金额',
          value: `¥${this.formatMoney(this.summary.completedAmount)}`,
          sub: '订单状态已完成的累计金额',
          icon: 'el-icon-circle-check',
          bg: 'linear-gradient(135deg, rgba(92, 172, 121, 0.16), rgba(163, 230, 193, 0.22))'
        },
        {
          label: '进行中订单金额',
          value: `¥${this.formatMoney(this.summary.inProgressAmount)}`,
          sub: '待确认、待生产、生产中、已发货阶段的金额',
          icon: 'el-icon-loading',
          bg: 'linear-gradient(135deg, rgba(94, 114, 228, 0.18), rgba(140, 170, 255, 0.22))'
        },
        {
          label: '本月订单数',
          value: this.summary.monthOrderCount,
          sub: '本月新增的已支付订单数量',
          icon: 'el-icon-date',
          bg: 'linear-gradient(135deg, rgba(100, 149, 237, 0.16), rgba(163, 202, 255, 0.2))'
        }
      ]
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    formatMoney(value) {
      return Number(value || 0).toFixed(2)
    },
    parseNumber(value, fallback = 0) {
      const num = Number(value)
      return Number.isFinite(num) ? num : fallback
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
    orderStatusType(status) {
      if (status === '已完成') return 'success'
      if (status === '已发货') return 'primary'
      if (status === '生产中' || status === '待生产') return 'warning'
      if (status === '已取消') return 'info'
      return ''
    },
    designerStatusType(status) {
      if (status === '已交付') return 'success'
      if (status === '生产中') return 'warning'
      if (status === '已认领') return 'primary'
      return 'info'
    },
    formatShortDate(dateText) {
      const text = this.safeText(dateText)
      if (!text) return '-'
      return text.slice(5)
    },
    normalizeTrend(rows = []) {
      const amountMax = Math.max(...rows.map((item) => this.parseNumber(item.amount, 0)), 0)
      const countMax = Math.max(...rows.map((item) => this.parseNumber(item.count, 0)), 0)
      return rows.map((item) => {
        const amount = this.parseNumber(item.amount, 0)
        const count = this.parseNumber(item.count, 0)
        return {
          date: this.safeText(item.date),
          amount,
          count,
          amountPercent: amountMax > 0 ? Math.max((amount / amountMax) * 100, 6) : 0,
          countPercent: countMax > 0 ? Math.max((count / countMax) * 100, 6) : 0
        }
      })
    },
    normalizeFlow(rows = []) {
      return rows.map((item) => ({
        id: item.id,
        orderNo: this.safeText(item.orderNo, item.order_no),
        addtime: this.safeText(item.addtime),
        orderStatus: this.safeText(item.orderStatus, item.order_status),
        totalAmount: this.parseNumber(this.safeText(item.totalAmount, item.total_amount), 0),
        designerStatus: this.safeText(item.designerStatus, item.designer_status)
      }))
    },
    async loadSummary() {
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.designerRevenueSummary,
        method: 'get',
        showLoading: false,
        showError: false
      })
      const data = (res && res.data) || {}
      this.summary = {
        totalAmount: this.parseNumber(data.totalAmount, 0),
        completedAmount: this.parseNumber(data.completedAmount, 0),
        inProgressAmount: this.parseNumber(data.inProgressAmount, 0),
        monthOrderCount: this.parseNumber(data.monthOrderCount, 0)
      }
      return !!res
    },
    async loadTrend() {
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.designerRevenueTrend,
        method: 'get',
        showLoading: false,
        showError: false
      })
      this.trendList = this.normalizeTrend((res && res.data) || [])
      return !!res
    },
    async loadFlow() {
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.designerRevenueFlowPage,
        method: 'get',
        showLoading: false,
        showError: false,
        params: {
          page: this.filters.page,
          limit: this.filters.limit,
          orderNo: this.filters.orderNo
        }
      })
      const data = (res && res.data) || {}
      this.flowList = this.normalizeFlow(data.list || [])
      this.flowTotal = this.parseNumber(data.total, 0)
      return !!res
    },
    async loadData() {
      this.loading = true
      try {
        const [summaryOk, trendOk, flowOk] = await Promise.all([this.loadSummary(), this.loadTrend(), this.loadFlow()])
        if (!summaryOk || !trendOk || !flowOk) {
          this.$message.warning('部分收益数据加载失败，已展示当前可用内容')
        }
      } finally {
        this.loading = false
      }
    },
    handleFilter() {
      this.filters.page = 1
      this.loadFlow()
    },
    handleSizeChange(size) {
      this.filters.limit = size
      this.filters.page = 1
      this.loadFlow()
    },
    handleCurrentChange(page) {
      this.filters.page = page
      this.loadFlow()
    }
  }
}
</script><style scoped>
.designer-revenue-page {
  --revenue-primary: #4f6ef7;
  --revenue-secondary: #7d89ff;
  --revenue-accent: #55c7ff;
  --revenue-surface: #ffffff;
  --revenue-border: rgba(102, 126, 234, 0.12);
  --revenue-bg: #eef4ff;
  --revenue-text: #24324a;
  --revenue-muted: #6f7d96;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hero-card,
.summary-card,
.panel-card {
  background: var(--revenue-surface);
  border: 1px solid var(--revenue-border);
  border-radius: 24px;
  box-shadow: 0 18px 44px rgba(61, 86, 178, 0.08);
}

.hero-card {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) 320px;
  gap: 22px;
  padding: 28px;
  background: linear-gradient(135deg, rgba(79, 110, 247, 0.96), rgba(99, 120, 248, 0.92) 58%, rgba(85, 199, 255, 0.88));
  color: #fff;
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

.hero-copy h2 {
  margin: 16px 0 12px;
  font-size: 30px;
  line-height: 1.35;
}

.hero-copy p {
  margin: 0;
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
  display: flex;
  align-items: stretch;
}

.formula-card {
  width: 100%;
  border-radius: 24px;
  padding: 22px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(10px);
}

.formula-label {
  display: block;
  margin-bottom: 12px;
  font-size: 12px;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.74);
}

.formula-card strong {
  display: block;
  font-size: 22px;
  line-height: 1.4;
}

.formula-card p {
  margin: 12px 0 0;
  color: rgba(255, 255, 255, 0.84);
  line-height: 1.8;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px;
}

.summary-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--revenue-primary);
  font-size: 22px;
}

.summary-label {
  font-size: 13px;
  color: var(--revenue-muted);
}

.summary-value {
  margin: 6px 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--revenue-text);
}

.summary-sub {
  font-size: 12px;
  color: var(--revenue-muted);
  line-height: 1.7;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.panel-card {
  padding: 22px;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.panel-head h3 {
  margin: 0 0 8px;
  color: var(--revenue-text);
  font-size: 22px;
}

.panel-head p {
  margin: 0;
  color: var(--revenue-muted);
  line-height: 1.7;
}

.head-note {
  padding: 7px 12px;
  border-radius: 999px;
  background: var(--revenue-bg);
  color: var(--revenue-primary);
  font-size: 12px;
}

.trend-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.trend-row {
  display: grid;
  grid-template-columns: 62px minmax(0, 1fr) 96px;
  gap: 12px;
  align-items: center;
}

.trend-date {
  font-size: 13px;
  color: var(--revenue-muted);
}

.trend-track {
  height: 12px;
  border-radius: 999px;
  background: rgba(79, 110, 247, 0.08);
  overflow: hidden;
}

.secondary-track {
  background: rgba(85, 199, 255, 0.1);
}

.trend-fill {
  height: 100%;
  min-width: 0;
  border-radius: inherit;
}

.amount-fill {
  background: linear-gradient(90deg, #4f6ef7, #8ec2ff);
}

.count-fill {
  background: linear-gradient(90deg, #55c7ff, #9d8cff);
}

.trend-value {
  color: var(--revenue-text);
  text-align: right;
}

.flow-head {
  gap: 18px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-input {
  width: 220px;
}

.order-no {
  color: var(--revenue-text);
  font-weight: 600;
}

.amount-text {
  color: var(--revenue-primary);
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .chart-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .hero-card {
    grid-template-columns: 1fr;
  }

  .panel-head,
  .flow-head {
    flex-direction: column;
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
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .hero-card,
  .summary-card,
  .panel-card {
    border-radius: 20px;
  }

  .hero-card,
  .panel-card,
  .summary-card {
    padding: 18px;
  }

  .trend-row {
    grid-template-columns: 58px minmax(0, 1fr) 82px;
  }
}
</style>