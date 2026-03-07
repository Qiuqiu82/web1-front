<template>
  <div class="designer-revenue-page">
    <section class="head-card panel-card">
      <div>
        <h2>收益看板</h2>
        <p>基于现有订单数据生成估算收益，后续接入真实收益流水接口可无缝替换。</p>
      </div>
      <el-button icon="el-icon-refresh" size="mini" :loading="loading" @click="loadData">刷新</el-button>
    </section>

    <section class="kpi-grid">
      <article class="kpi-card panel-card">
        <div class="kpi-label">累计订单额</div>
        <div class="kpi-value">¥{{ formatMoney(kpi.totalAmount) }}</div>
      </article>
      <article class="kpi-card panel-card">
        <div class="kpi-label">已完成订单额</div>
        <div class="kpi-value">¥{{ formatMoney(kpi.completedAmount) }}</div>
      </article>
      <article class="kpi-card panel-card">
        <div class="kpi-label">进行中订单额</div>
        <div class="kpi-value">¥{{ formatMoney(kpi.inProgressAmount) }}</div>
      </article>
      <article class="kpi-card panel-card">
        <div class="kpi-label">本月订单数</div>
        <div class="kpi-value">{{ kpi.monthCount }}</div>
      </article>
    </section>

    <section class="content-grid">
      <article class="panel-card trend-card">
        <div class="panel-title">近 7 日金额趋势（估算）</div>
        <div v-if="trendData.length" class="trend-list">
          <div class="trend-row" v-for="item in trendData" :key="item.key">
            <div class="trend-label">{{ item.label }}</div>
            <div class="trend-track">
              <div class="trend-fill" :style="{ width: `${Math.max((item.amount / trendMax) * 100, 4)}%` }" />
            </div>
            <div class="trend-value">¥{{ formatMoney(item.amount) }}</div>
          </div>
        </div>
        <div v-else class="empty-tip">暂无趋势数据</div>
      </article>

      <article class="panel-card flow-card">
        <div class="panel-title-row">
          <div class="panel-title">收益流水（估算）</div>
          <el-tag size="mini" type="warning">估算口径</el-tag>
        </div>

        <el-table :data="flowRows" border size="small" style="width: 100%">
          <el-table-column prop="orderNo" label="订单号" min-width="170" />
          <el-table-column prop="addtime" label="时间" min-width="140" />
          <el-table-column prop="orderStatus" label="状态" width="110" />
          <el-table-column label="订单金额" min-width="110">
            <template slot-scope="scope">¥{{ formatMoney(scope.row.totalAmount) }}</template>
          </el-table-column>
          <el-table-column label="估算收益" min-width="110">
            <template slot-scope="scope">¥{{ formatMoney(scope.row.estimateIncome) }}</template>
          </el-table-column>
        </el-table>

        <div class="empty-tip" v-if="!flowRows.length">暂无流水数据</div>
      </article>
    </section>
  </div>
</template>

<script>
export default {
  name: 'DesignerRevenue',
  data() {
    return {
      loading: false,
      orders: [],
      trendData: [],
      flowRows: [],
      kpi: {
        totalAmount: 0,
        completedAmount: 0,
        inProgressAmount: 0,
        monthCount: 0
      }
    }
  },
  computed: {
    trendMax() {
      if (!this.trendData.length) {
        return 1
      }
      const max = Math.max(...this.trendData.map((item) => item.amount || 0))
      return max > 0 ? max : 1
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    formatMoney(value) {
      return Number(value || 0).toFixed(2)
    },
    dayKey(date) {
      const year = date.getFullYear()
      const month = `${date.getMonth() + 1}`.padStart(2, '0')
      const day = `${date.getDate()}`.padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    parseDate(input) {
      if (!input) {
        return null
      }
      const text = String(input)
      const date = new Date(text.replace(/-/g, '/'))
      if (!Number.isNaN(date.getTime())) {
        return date
      }
      const byText = text.match(/\d{4}-\d{2}-\d{2}/)
      if (!byText) {
        return null
      }
      const fallback = new Date(byText[0].replace(/-/g, '/'))
      return Number.isNaN(fallback.getTime()) ? null : fallback
    },
    normalizeRows(rows = []) {
      return rows.map((row) => ({
        id: row.id,
        orderNo: row.orderNo || row.order_no || '',
        orderStatus: row.orderStatus || row.order_status || '',
        addtime: row.addtime || '',
        totalAmount: Number(row.totalAmount || row.total_amount || 0)
      }))
    },
    buildTrendRows() {
      const result = []
      const now = new Date()
      for (let i = 6; i >= 0; i -= 1) {
        const date = new Date(now)
        date.setDate(now.getDate() - i)
        result.push({
          key: this.dayKey(date),
          label: `${date.getMonth() + 1}/${date.getDate()}`,
          amount: 0,
          count: 0
        })
      }
      return result
    },
    async loadData() {
      this.loading = true
      try {
        const res = await this.$proxy.Request({
          url: this.$proxy.Api.cosorderDesignerMine,
          method: 'get',
          showLoading: false,
          showError: false,
          params: { page: 1, limit: 500 }
        })

        if (!res || res.code !== 0) {
          this.$message.warning('收益数据加载失败，已显示空状态')
          this.orders = []
          this.trendData = []
          this.flowRows = []
          this.kpi = {
            totalAmount: 0,
            completedAmount: 0,
            inProgressAmount: 0,
            monthCount: 0
          }
          return
        }

        const rows = this.normalizeRows((res.data && res.data.list) || [])
        this.orders = rows

        const now = new Date()
        const currentMonth = `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}`

        const totalAmount = rows.reduce((sum, row) => sum + Number(row.totalAmount || 0), 0)
        const completedAmount = rows
          .filter((row) => row.orderStatus === '已完成')
          .reduce((sum, row) => sum + Number(row.totalAmount || 0), 0)
        const inProgressAmount = rows
          .filter((row) => ['待生产', '生产中', '已发货'].includes(row.orderStatus))
          .reduce((sum, row) => sum + Number(row.totalAmount || 0), 0)
        const monthCount = rows.filter((row) => {
          const date = this.parseDate(row.addtime)
          if (!date) {
            return false
          }
          const key = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`
          return key === currentMonth
        }).length

        this.kpi = {
          totalAmount,
          completedAmount,
          inProgressAmount,
          monthCount
        }

        const trendSeed = this.buildTrendRows()
        const trendMap = trendSeed.reduce((acc, item) => {
          acc[item.key] = item
          return acc
        }, {})
        rows.forEach((row) => {
          const date = this.parseDate(row.addtime)
          if (!date) {
            return
          }
          const key = this.dayKey(date)
          if (trendMap[key]) {
            trendMap[key].amount += Number(row.totalAmount || 0)
            trendMap[key].count += 1
          }
        })
        this.trendData = trendSeed

        this.flowRows = [...rows]
          .sort((a, b) => {
            const timeA = this.parseDate(a.addtime)
            const timeB = this.parseDate(b.addtime)
            return (timeB ? timeB.getTime() : 0) - (timeA ? timeA.getTime() : 0)
          })
          .slice(0, 20)
          .map((row) => ({
            ...row,
            estimateIncome: Number(row.totalAmount || 0) * 0.35
          }))
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.designer-revenue-page {
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
  margin-top: 8px;
  color: #283d86;
  font-size: 28px;
  font-weight: 700;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.trend-card,
.flow-card {
  padding: 16px;
}

.panel-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.panel-title {
  color: #2f4486;
  font-size: 16px;
  font-weight: 700;
}

.trend-list {
  display: grid;
  gap: 10px;
}

.trend-row {
  display: grid;
  grid-template-columns: 60px 1fr 120px;
  align-items: center;
  gap: 8px;
}

.trend-label {
  color: #5d6c99;
  font-size: 13px;
}

.trend-track {
  height: 10px;
  border-radius: 999px;
  background: #edf1ff;
  overflow: hidden;
}

.trend-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #6073de 0%, #7f95f0 100%);
}

.trend-value {
  color: #445587;
  text-align: right;
  font-weight: 600;
  font-size: 12px;
}

.empty-tip {
  color: #99a4c3;
  text-align: center;
  padding: 16px 0;
}

@media (max-width: 1200px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .head-card,
  .kpi-card,
  .trend-card,
  .flow-card {
    padding: 12px;
  }

  .head-card {
    flex-wrap: wrap;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .trend-row {
    grid-template-columns: 56px 1fr 90px;
  }
}
</style>
