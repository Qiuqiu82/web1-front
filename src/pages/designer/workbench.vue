<template>
  <div class="designer-workbench-page">
    <section class="head-card panel-card">
      <div>
        <h2>设计师工作台</h2>
        <p>聚合待办、订单走势与热门款参考，支持快速进入关键操作。</p>
      </div>
      <el-button icon="el-icon-refresh" size="mini" :loading="loading" @click="loadData">刷新</el-button>
    </section>

    <section class="kpi-grid">
      <article class="kpi-card panel-card">
        <div class="kpi-label">待接单</div>
        <div class="kpi-value">{{ kpi.poolCount }}</div>
      </article>
      <article class="kpi-card panel-card">
        <div class="kpi-label">制作中</div>
        <div class="kpi-value">{{ kpi.inProgressCount }}</div>
      </article>
      <article class="kpi-card panel-card">
        <div class="kpi-label">待发货</div>
        <div class="kpi-value">{{ kpi.toShipCount }}</div>
      </article>
      <article class="kpi-card panel-card">
        <div class="kpi-label">今日认领</div>
        <div class="kpi-value">{{ kpi.todayClaimCount }}</div>
      </article>
    </section>

    <section class="content-grid">
      <article class="panel-card chart-card">
        <div class="panel-title">订单状态分布</div>
        <div v-if="statusDistribution.length" class="dist-list">
          <div v-for="item in statusDistribution" :key="item.label" class="dist-row">
            <div class="dist-label">{{ item.label }}</div>
            <div class="dist-track">
              <div class="dist-fill" :style="{ width: `${item.percent}%` }" />
            </div>
            <div class="dist-value">{{ item.count }}</div>
          </div>
        </div>
        <div v-else class="empty-tip">暂无可统计订单</div>
      </article>

      <article class="panel-card chart-card">
        <div class="panel-title">近 7 日处理趋势</div>
        <div v-if="trendData.length" class="trend-list">
          <div v-for="item in trendData" :key="item.key" class="trend-row">
            <div class="trend-label">{{ item.label }}</div>
            <div class="trend-track">
              <div class="trend-fill" :style="{ width: `${Math.max((item.count / trendMax) * 100, 4)}%` }" />
            </div>
            <div class="trend-value">{{ item.count }}</div>
          </div>
        </div>
        <div v-else class="empty-tip">暂无近 7 日数据</div>
      </article>

      <article class="panel-card side-card">
        <div class="panel-title">快捷入口</div>
        <div class="quick-actions">
          <el-button type="primary" @click="$router.push('/designer/orders')">进入订单管理</el-button>
          <el-button @click="$router.push('/designer/communication')">查看用户沟通</el-button>
          <el-button @click="$router.push('/designer/revenue')">查看收益看板</el-button>
        </div>

        <div class="sub-title">热门款参考</div>
        <div v-if="hotList.length" class="hot-list">
          <div v-for="item in hotList" :key="item.id" class="hot-item" @click="toCosDetail(item)">
            <img :src="coverUrl(item)" alt="热门款" class="hot-cover" />
            <div class="hot-info">
              <div class="hot-name">{{ item.fuzhuangmingcheng || '热门款式' }}</div>
              <div class="hot-meta">热度 {{ item.clicknum || 0 }}</div>
            </div>
          </div>
        </div>
        <div v-else class="empty-tip">暂无热门款数据</div>
      </article>
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
      hotList: [],
      kpi: {
        poolCount: 0,
        inProgressCount: 0,
        toShipCount: 0,
        todayClaimCount: 0
      },
      statusDistribution: [],
      trendData: []
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
      const text = String(input)
      const byText = text.match(/\d{4}-\d{2}-\d{2}/)
      if (byText) {
        return byText[0]
      }
      const date = new Date(text.replace(/-/g, '/'))
      if (Number.isNaN(date.getTime())) {
        return ''
      }
      return this.dayKey(date)
    },
    coverUrl(item) {
      const raw = (item && item.huawentuan) || ''
      const first = raw.split(',')[0] || ''
      if (!first) {
        return ''
      }
      return first.startsWith('http') ? first : `${this.baseUrl}${first}`
    },
    toCosDetail(item) {
      this.$router.push({ path: '/index/remaicosfuDetail', query: { detailObj: JSON.stringify(item) } })
    },
    normalizeOrders(rows = []) {
      return rows.map((row) => ({
        id: row.id,
        orderNo: row.orderNo || row.order_no || '',
        orderStatus: row.orderStatus || row.order_status || '',
        designerTakeTime: row.designerTakeTime || row.designer_take_time || '',
        addtime: row.addtime || ''
      }))
    },
    buildTrendRows() {
      const days = []
      const now = new Date()
      for (let i = 6; i >= 0; i -= 1) {
        const date = new Date(now)
        date.setDate(now.getDate() - i)
        days.push({
          key: this.dayKey(date),
          label: `${date.getMonth() + 1}/${date.getDate()}`,
          count: 0
        })
      }
      return days
    },
    async loadData() {
      this.loading = true
      try {
        const [poolRes, mineRes, hotRes] = await Promise.all([
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
          })
        ])

        const poolOk = !!(poolRes && poolRes.code === 0)
        const mineOk = !!(mineRes && mineRes.code === 0)
        const hotOk = !!(hotRes && hotRes.code === 0)
        if (!poolOk || !mineOk || !hotOk) {
          this.$message.warning('部分数据加载失败，已展示可用数据')
        }

        const poolData = poolOk ? ((poolRes && poolRes.data) || {}) : {}
        const mineData = mineOk ? ((mineRes && mineRes.data) || {}) : {}
        const poolRows = this.normalizeOrders(poolData.list || [])
        const mineRows = this.normalizeOrders(mineData.list || [])
        const today = this.dayKey(new Date())

        this.kpi.poolCount = Number(poolData.total || poolRows.length || 0)
        this.kpi.inProgressCount = mineRows.filter((item) => ['待生产', '生产中'].includes(item.orderStatus)).length
        this.kpi.toShipCount = mineRows.filter((item) => item.orderStatus === '生产中').length
        this.kpi.todayClaimCount = mineRows.filter((item) => this.parseDayKey(item.designerTakeTime) === today).length

        const statusSeed = [
          { label: '待生产', count: 0 },
          { label: '生产中', count: 0 },
          { label: '已发货', count: 0 },
          { label: '已完成', count: 0 },
          { label: '已取消', count: 0 }
        ]
        mineRows.forEach((item) => {
          const target = statusSeed.find((status) => status.label === item.orderStatus)
          if (target) {
            target.count += 1
          }
        })
        const maxStatus = Math.max(...statusSeed.map((item) => item.count), 1)
        this.statusDistribution = statusSeed
          .filter((item) => item.count > 0)
          .map((item) => ({ ...item, percent: Math.max(Math.round((item.count / maxStatus) * 100), 10) }))

        const trendSeed = this.buildTrendRows()
        const trendMap = trendSeed.reduce((acc, row) => {
          acc[row.key] = row
          return acc
        }, {})
        mineRows.forEach((item) => {
          const key = this.parseDayKey(item.designerTakeTime || item.addtime)
          if (key && trendMap[key]) {
            trendMap[key].count += 1
          }
        })
        this.trendData = trendSeed

        const hotData = hotOk ? ((hotRes && hotRes.data) || {}) : {}
        this.hotList = hotData.list || []
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.designer-workbench-page {
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
  grid-template-columns: 1fr 1fr 0.9fr;
  gap: 12px;
}

.chart-card,
.side-card {
  padding: 16px;
}

.panel-title {
  color: #2f4486;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
}

.dist-list,
.trend-list {
  display: grid;
  gap: 10px;
}

.dist-row,
.trend-row {
  display: grid;
  grid-template-columns: 58px 1fr 36px;
  align-items: center;
  gap: 8px;
}

.dist-track,
.trend-track {
  height: 10px;
  border-radius: 999px;
  background: #edf1ff;
  overflow: hidden;
}

.dist-fill,
.trend-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #6073de 0%, #7f95f0 100%);
}

.dist-label,
.trend-label {
  color: #5d6c99;
  font-size: 13px;
}

.dist-value,
.trend-value {
  color: #445587;
  text-align: right;
  font-weight: 600;
  font-size: 12px;
}

.quick-actions {
  display: grid;
  gap: 8px;
}

.quick-actions .el-button {
  margin-left: 0;
}

.sub-title {
  margin-top: 14px;
  margin-bottom: 8px;
  color: #445687;
  font-weight: 700;
}

.hot-list {
  display: grid;
  gap: 8px;
}

.hot-item {
  display: flex;
  gap: 8px;
  border: 1px solid #ebefff;
  border-radius: 10px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.hot-item:hover {
  border-color: #d7dfff;
  box-shadow: 0 8px 16px rgba(70, 92, 162, 0.12);
}

.hot-cover {
  width: 54px;
  height: 54px;
  border-radius: 8px;
  object-fit: cover;
  background: #f5f7fa;
  flex-shrink: 0;
}

.hot-name {
  color: #2f3f72;
  font-size: 13px;
  font-weight: 600;
}

.hot-meta {
  margin-top: 4px;
  color: #8c98bc;
  font-size: 12px;
}

.empty-tip {
  color: #99a4c3;
  text-align: center;
  padding: 18px 0;
}

@media (max-width: 1200px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .head-card,
  .kpi-card,
  .chart-card,
  .side-card {
    padding: 12px;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>
