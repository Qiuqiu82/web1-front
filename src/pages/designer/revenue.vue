<template>
  <div class="designer-revenue-page">
    <section class="page-toolbar">
      <div class="page-copy">
        <span class="page-tag">{{ '\u6536\u76ca\u770b\u677f' }}</span>
        <h2>{{ '\u8bbe\u8ba1\u5e08\u8ba2\u5355\u6210\u4ea4\u6982\u89c8' }}</h2>
        <p>{{ '\u57fa\u4e8e\u5f53\u524d\u8bbe\u8ba1\u5e08\u5df2\u652f\u4ed8\u4e14\u672a\u53d6\u6d88\u7684\u8ba2\u5355\uff0c\u67e5\u770b\u6c47\u603b\u3001\u8d8b\u52bf\u4e0e\u6d41\u6c34\u660e\u7ec6\uff0c\u9875\u9762\u4fdd\u6301\u8f7b\u91cf\u5c55\u793a\u3002' }}</p>
      </div>
      <div class="page-actions">
        <div class="mini-chip">{{ '\u7edf\u8ba1\u53e3\u5f84\uff1a\u5df2\u652f\u4ed8\u4e14\u672a\u53d6\u6d88' }}</div>
        <el-button type="primary" plain icon="el-icon-refresh" :loading="loading" @click="loadData">{{ '\u5237\u65b0\u770b\u677f' }}</el-button>
        <el-button plain icon="el-icon-s-order" @click="$router.push('/designer/orders')">{{ '\u67e5\u770b\u8ba2\u5355\u7ba1\u7406' }}</el-button>
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
            <h3>{{ '\u6700\u8fd1 7 \u65e5\u8d8b\u52bf' }}</h3>
            <p>{{ '\u540c\u65f6\u5bf9\u6bd4\u6bcf\u65e5\u8ba2\u5355\u6210\u4ea4\u91d1\u989d\u548c\u8ba2\u5355\u6570\uff0c\u65b9\u4fbf\u89c2\u5bdf\u8282\u594f\u53d8\u5316\u3002' }}</p>
          </div>
          <span class="head-note">{{ '\u540e\u7aef\u805a\u5408' }}</span>
        </div>

        <div v-if="trendList.length" class="trend-list">
          <div v-for="item in trendList" :key="item.date" class="trend-row">
            <div class="trend-date">{{ formatShortDate(item.date) }}</div>
            <div class="trend-bars">
              <div class="trend-track">
                <div class="trend-fill amount-fill" :style="{ width: trendWidth(item.amount, trendAmountMax) }"></div>
              </div>
              <div class="trend-track secondary-track">
                <div class="trend-fill count-fill" :style="{ width: trendWidth(item.count, trendCountMax) }"></div>
              </div>
            </div>
            <div class="trend-value">
              <strong>{{ currency }}{{ formatMoney(item.amount) }}</strong>
              <span>{{ item.count }} {{ '\u5355' }}</span>
            </div>
          </div>
        </div>
        <el-empty v-else :description="'\u6682\u65e0\u8d8b\u52bf\u6570\u636e'" :image-size="90" />
      </article>

      <article class="panel-card note-panel">
        <div class="panel-head compact-head">
          <div>
            <h3>{{ '\u7edf\u8ba1\u8bf4\u660e' }}</h3>
            <p>{{ '\u672c\u9875\u5c55\u793a\u7684\u201c\u6536\u76ca\u201d\u4e3a MVP \u9636\u6bb5\u7684\u6210\u4ea4\u989d\u89c6\u56fe\uff0c\u4e0d\u4ee3\u8868\u5b9e\u9645\u7ed3\u7b97\u6216\u63d0\u73b0\u91d1\u989d\u3002' }}</p>
          </div>
        </div>
        <div class="note-list">
          <div class="note-item">
            <span>{{ '\u5f53\u524d\u6708\u7d2f\u8ba1\u8ba2\u5355\u6570' }}</span>
            <strong>{{ summary.monthOrderCount || 0 }} {{ '\u5355' }}</strong>
          </div>
          <div class="note-item">
            <span>{{ '\u8fdb\u884c\u4e2d\u91d1\u989d' }}</span>
            <strong>{{ currency }}{{ formatMoney(summary.inProgressAmount) }}</strong>
          </div>
          <div class="note-item">
            <span>{{ '\u6570\u636e\u66f4\u65b0\u65b9\u5f0f' }}</span>
            <strong>{{ '\u5b9e\u65f6\u8c03\u7528\u540e\u7aef\u805a\u5408\u63a5\u53e3' }}</strong>
          </div>
          <div class="note-item">
            <span>{{ '\u6d41\u6c34\u8303\u56f4' }}</span>
            <strong>{{ '\u4ec5\u542b\u5f53\u524d\u8bbe\u8ba1\u5e08\u540d\u4e0b\u8ba2\u5355' }}</strong>
          </div>
        </div>
      </article>
    </section>

    <section class="panel-card flow-panel">
      <div class="panel-head flow-head">
        <div>
          <h3>{{ '\u6d41\u6c34\u660e\u7ec6' }}</h3>
          <p>{{ '\u652f\u6301\u6309\u8ba2\u5355\u53f7\u7b5b\u9009\uff0c\u5206\u9875\u67e5\u770b\u5f53\u524d\u8bbe\u8ba1\u5e08\u7684\u8ba2\u5355\u6210\u4ea4\u6d41\u6c34\u3002' }}</p>
        </div>
        <div class="toolbar-actions">
          <el-input
            v-model.trim="filters.orderNo"
            size="small"
            clearable
            class="toolbar-input"
            :placeholder="'\u641c\u7d22\u8ba2\u5355\u53f7'"
            @keyup.enter.native="handleFilter"
            @clear="handleFilter"
          />
          <el-button size="small" type="primary" icon="el-icon-search" @click="handleFilter">{{ '\u67e5\u8be2' }}</el-button>
        </div>
      </div>

      <el-table :data="flowList" border stripe>
        <el-table-column :label="'\u8ba2\u5355\u53f7'" min-width="180">
          <template slot-scope="scope">
            <span class="order-no">{{ scope.row.orderNo || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="'\u8ba2\u5355\u72b6\u6001'" min-width="120">
          <template slot-scope="scope">
            <el-tag size="mini" effect="plain" :type="orderStatusType(scope.row.orderStatus)">{{ scope.row.orderStatus || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="'\u8bbe\u8ba1\u5e08\u72b6\u6001'" min-width="120">
          <template slot-scope="scope">
            <el-tag size="mini" effect="plain" :type="designerStatusType(scope.row.designerStatus)">{{ scope.row.designerStatus || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="'\u8ba2\u5355\u91d1\u989d'" min-width="120" align="right">
          <template slot-scope="scope">
            <span class="amount-text">{{ currency }}{{ formatMoney(scope.row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="'\u65f6\u95f4'" min-width="180" prop="addtime" />
      </el-table>
      <el-empty v-if="!flowList.length" :description="'\u6682\u65e0\u6d41\u6c34\u8bb0\u5f55'" :image-size="90" />

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
const ORDER_STATUS_FINISHED = '\u5df2\u5b8c\u6210'
const ORDER_STATUS_SHIPPED = '\u5df2\u53d1\u8d27'
const ORDER_STATUS_PRODUCING = '\u751f\u4ea7\u4e2d'
const ORDER_STATUS_PENDING = '\u5f85\u751f\u4ea7'
const ORDER_STATUS_CANCELLED = '\u5df2\u53d6\u6d88'
const DESIGNER_STATUS_CLAIMED = '\u5df2\u8ba4\u9886'
const DESIGNER_STATUS_WORKING = '\u5236\u4f5c\u4e2d'
const DESIGNER_STATUS_DELIVERED = '\u5df2\u4ea4\u4ed8'

export default {
  name: 'DesignerRevenue',
  data() {
    return {
      currency: '\u00a5',
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
          label: '\u7d2f\u8ba1\u8ba2\u5355\u91d1\u989d',
          value: `${this.currency}${this.formatMoney(this.summary.totalAmount)}`,
          sub: '\u5f53\u524d\u8bbe\u8ba1\u5e08\u540d\u4e0b\u5df2\u652f\u4ed8\u4e14\u672a\u53d6\u6d88\u8ba2\u5355\u7684\u6210\u4ea4\u989d\u6c47\u603b',
          icon: 'el-icon-coin',
          bg: 'linear-gradient(135deg, rgba(79, 110, 247, 0.16), rgba(85, 199, 255, 0.2))'
        },
        {
          label: '\u5df2\u5b8c\u6210\u8ba2\u5355\u91d1\u989d',
          value: `${this.currency}${this.formatMoney(this.summary.completedAmount)}`,
          sub: '\u5df2\u5b8c\u6210\u72b6\u6001\u8ba2\u5355\u7684\u6210\u4ea4\u91d1\u989d',
          icon: 'el-icon-medal-1',
          bg: 'linear-gradient(135deg, rgba(102, 126, 234, 0.18), rgba(167, 139, 250, 0.2))'
        },
        {
          label: '\u8fdb\u884c\u4e2d\u91d1\u989d',
          value: `${this.currency}${this.formatMoney(this.summary.inProgressAmount)}`,
          sub: '\u5f53\u524d\u5904\u4e8e\u5f85\u751f\u4ea7\u3001\u751f\u4ea7\u4e2d\u6216\u5df2\u53d1\u8d27\u7684\u8ba2\u5355\u91d1\u989d',
          icon: 'el-icon-data-line',
          bg: 'linear-gradient(135deg, rgba(74, 144, 226, 0.16), rgba(143, 212, 255, 0.18))'
        },
        {
          label: '\u672c\u6708\u8ba2\u5355\u6570',
          value: `${this.summary.monthOrderCount || 0}`,
          sub: '\u5f53\u6708\u5185\u7eb3\u5165\u7edf\u8ba1\u53e3\u5f84\u7684\u8ba2\u5355\u6570\u91cf',
          icon: 'el-icon-s-order',
          bg: 'linear-gradient(135deg, rgba(96, 165, 250, 0.16), rgba(186, 230, 253, 0.2))'
        }
      ]
    },
    trendAmountMax() {
      return Math.max(...this.trendList.map((item) => this.parseNumber(item.amount, 0)), 0)
    },
    trendCountMax() {
      return Math.max(...this.trendList.map((item) => this.parseNumber(item.count, 0)), 0)
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
    trendWidth(value, max) {
      if (!max) return '0%'
      return `${Math.max((Number(value || 0) / max) * 100, 6)}%`
    },
    orderStatusType(status) {
      if (status === ORDER_STATUS_FINISHED) return 'success'
      if (status === ORDER_STATUS_SHIPPED) return 'warning'
      if (status === ORDER_STATUS_PRODUCING) return 'primary'
      if (status === ORDER_STATUS_PENDING) return 'info'
      if (status === ORDER_STATUS_CANCELLED) return 'danger'
      return ''
    },
    designerStatusType(status) {
      if (status === DESIGNER_STATUS_DELIVERED) return 'success'
      if (status === DESIGNER_STATUS_WORKING) return 'primary'
      if (status === DESIGNER_STATUS_CLAIMED) return 'warning'
      return 'info'
    },
    formatShortDate(dateText) {
      const text = this.safeText(dateText)
      if (!text) return '-'
      return text.length >= 10 ? text.slice(5, 10) : text
    },
    normalizeTrend(rows = []) {
      return rows.map((item) => ({
        date: this.safeText(item.date),
        amount: this.parseNumber(item.amount, 0),
        count: this.parseNumber(item.count, 0)
      }))
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
          this.$message.warning('\u770b\u677f\u6570\u636e\u6709\u90e8\u5206\u52a0\u8f7d\u5931\u8d25\uff0c\u5df2\u5c55\u793a\u53ef\u7528\u5185\u5bb9')
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
</script>

<style scoped>
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

.summary-card,
.panel-card {
  background: var(--revenue-surface);
  border: 1px solid var(--revenue-border);
  border-radius: 20px;
  box-shadow: none;
}

.page-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.page-copy {
  display: grid;
  gap: 6px;
}

.page-tag {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid #dbe6ff;
  background: #f7faff;
  color: #5870bc;
  font-size: 12px;
  letter-spacing: 0.04em;
}

.page-copy h2 {
  margin: 0;
  color: var(--revenue-text);
  font-size: 28px;
  line-height: 1.35;
}

.page-copy p {
  margin: 0;
  max-width: 760px;
  color: var(--revenue-muted);
  line-height: 1.75;
}

.page-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.mini-chip {
  display: inline-flex;
  align-items: center;
  height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid #dfe7ff;
  background: #fff;
  color: var(--revenue-muted);
  font-size: 13px;
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
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
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

.compact-head {
  margin-bottom: 16px;
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
  grid-template-columns: 70px minmax(0, 1fr) 110px;
  gap: 14px;
  align-items: center;
}

.trend-date {
  font-size: 13px;
  color: var(--revenue-muted);
}

.trend-bars {
  display: grid;
  gap: 8px;
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
  display: grid;
  justify-items: end;
  gap: 4px;
}

.trend-value strong {
  color: var(--revenue-text);
}

.trend-value span {
  color: var(--revenue-muted);
  font-size: 12px;
}

.note-panel {
  display: flex;
  flex-direction: column;
}

.note-list {
  display: grid;
  gap: 12px;
}

.note-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

.note-item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.note-item span {
  color: var(--revenue-muted);
}

.note-item strong {
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
  .page-toolbar {
    flex-direction: column;
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

  .page-copy h2 {
    font-size: 22px;
  }

  .summary-card,
  .panel-card {
    border-radius: 18px;
  }

  .panel-card,
  .summary-card {
    padding: 18px;
  }

  .trend-row {
    grid-template-columns: 58px minmax(0, 1fr);
  }

  .trend-value {
    grid-column: 1 / -1;
    justify-items: start;
  }
}
</style>