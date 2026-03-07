<template>
  <div class="admin-dashboard-page">
    <section class="head-card panel-card">
      <div>
        <h2>数据概览</h2>
        <p>展示平台当前经营概况，统计数据来自现有接口聚合（失败自动降级）。</p>
      </div>
      <el-button icon="el-icon-refresh" size="mini" @click="loadData" :loading="loading">刷新数据</el-button>
    </section>

    <section class="kpi-grid">
      <article class="kpi-card panel-card">
        <div class="kpi-label">总用户数</div>
        <div class="kpi-value">{{ kpi.userTotal }}</div>
        <div class="kpi-sub">注册用户总量</div>
      </article>
      <article class="kpi-card panel-card">
        <div class="kpi-label">设计师数</div>
        <div class="kpi-value">{{ kpi.designerTotal }}</div>
        <div class="kpi-sub">当前入驻设计师</div>
      </article>
      <article class="kpi-card panel-card">
        <div class="kpi-label">今日订单数</div>
        <div class="kpi-value">{{ kpi.todayOrderCount }}</div>
        <div class="kpi-sub">按订单时间统计</div>
      </article>
      <article class="kpi-card panel-card">
        <div class="kpi-label">平台累计收益</div>
        <div class="kpi-value">¥{{ formatMoney(kpi.totalRevenue) }}</div>
        <div class="kpi-sub">优先取汇总接口，失败自动回退</div>
      </article>
    </section>

    <section class="chart-grid">
      <article class="panel-card trend-card">
        <div class="panel-title">近 7 日订单趋势</div>
        <div v-if="trendData.length" class="trend-list">
          <div v-for="item in trendData" :key="item.key" class="trend-row">
            <div class="trend-date">{{ item.label }}</div>
            <div class="trend-bar-track">
              <div class="trend-bar-fill" :style="{ width: `${Math.max((item.count / trendMax) * 100, 4)}%` }" />
            </div>
            <div class="trend-value">{{ item.count }}</div>
          </div>
        </div>
        <div v-else class="empty-tip">暂无可展示趋势数据</div>
      </article>

      <article class="panel-card category-card">
        <div class="panel-title">热门分类</div>
        <div v-if="hotCategories.length" class="category-list">
          <div v-for="item in hotCategories" :key="item.name" class="category-row">
            <div class="category-name">{{ item.name }}</div>
            <div class="category-progress">
              <div class="category-progress-inner" :style="{ width: `${item.percent}%` }" />
            </div>
            <div class="category-value">{{ item.count }}</div>
          </div>
        </div>
        <div v-else class="empty-tip">暂无分类数据，待素材数据补齐后展示</div>
      </article>
    </section>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboard',
  data() {
    return {
      loading: false,
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
    trendMax() {
      if (!this.trendData.length) {
        return 1
      }
      const max = Math.max(...this.trendData.map((item) => item.count || 0))
      return max > 0 ? max : 1
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    formatMoney(value) {
      const amount = Number(value || 0)
      return amount.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
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

      this.loading = false
    }
  }
}
</script>

<style scoped>
.admin-dashboard-page {
  display: grid;
  gap: 12px;
}

.panel-card {
  border-radius: 16px;
  border: 1px solid #e5ebff;
  background: #fff;
  box-shadow: 0 10px 24px rgba(75, 93, 154, 0.1);
}

.head-card {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.head-card h2 {
  color: #26366e;
  font-size: 24px;
}

.head-card p {
  margin-top: 6px;
  color: #8290ba;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.kpi-card {
  padding: 16px;
}

.kpi-label {
  color: #8793b7;
  font-size: 13px;
}

.kpi-value {
  margin-top: 10px;
  color: #283d86;
  font-size: 28px;
  font-weight: 700;
}

.kpi-sub {
  margin-top: 8px;
  color: #99a3c3;
  font-size: 12px;
}

.chart-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 12px;
}

.trend-card,
.category-card {
  padding: 16px;
}

.panel-title {
  color: #2f4486;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
}

.trend-list,
.category-list {
  display: grid;
  gap: 10px;
}

.trend-row,
.category-row {
  display: grid;
  grid-template-columns: 56px 1fr 44px;
  align-items: center;
  gap: 10px;
}

.trend-date,
.category-name {
  color: #5a6893;
  font-size: 13px;
}

.trend-value,
.category-value {
  text-align: right;
  color: #3a4a84;
  font-weight: 600;
  font-size: 13px;
}

.trend-bar-track,
.category-progress {
  height: 10px;
  border-radius: 999px;
  background: #edf1ff;
  overflow: hidden;
}

.trend-bar-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #5f73de 0%, #8293ef 100%);
}

.category-progress-inner {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #5c7df0 0%, #7ca4ff 100%);
}

.empty-tip {
  color: #9ca7c7;
  text-align: center;
  padding: 28px 0;
}

@media (max-width: 1200px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .chart-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .head-card {
    padding: 12px;
    flex-wrap: wrap;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .trend-row,
  .category-row {
    grid-template-columns: 52px 1fr 40px;
  }
}
</style>