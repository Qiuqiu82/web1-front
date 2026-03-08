<template>
  <div class="designer-workbench-page">
    <section class="head-card panel-card">
      <div>
        <h2>设计师工作台</h2>
        <p>按待接单、制作中、待交付分组管理订单，并快速推进关键动作。</p>
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
        <div class="kpi-label">待交付</div>
        <div class="kpi-value">{{ kpi.toShipCount }}</div>
      </article>
      <article class="kpi-card panel-card">
        <div class="kpi-label">今日认领</div>
        <div class="kpi-value">{{ kpi.todayClaimCount }}</div>
      </article>
    </section>

    <section class="group-grid">
      <article class="panel-card group-card">
        <div class="group-head">
          <h3>待接单</h3>
          <el-button type="text" @click="$router.push('/designer/orders')">进入订单管理</el-button>
        </div>
        <div v-if="poolOrders.length" class="order-mini-list">
          <div v-for="item in poolOrders" :key="`pool-${item.id}`" class="mini-row">
            <div>
              <div class="mini-title">{{ item.orderNo || item.id }}</div>
              <div class="mini-meta">用户 {{ item.userId || '-' }} · ¥{{ formatMoney(item.totalAmount) }}</div>
            </div>
            <el-button size="mini" type="primary" :loading="actionLoadingKey === `claim-${item.id}`" @click="claim(item)">认领</el-button>
          </div>
        </div>
        <el-empty v-else description="暂无待接单" :image-size="72" />
      </article>

      <article class="panel-card group-card">
        <div class="group-head">
          <h3>制作中</h3>
          <el-button type="text" @click="$router.push('/designer/orders')">查看全部</el-button>
        </div>
        <div v-if="producingOrders.length" class="order-mini-list">
          <div v-for="item in producingOrders" :key="`prod-${item.id}`" class="mini-row">
            <div>
              <div class="mini-title">{{ item.orderNo || item.id }}</div>
              <div class="mini-meta">{{ item.orderStatus }} · {{ item.designerTakeTime || '-' }}</div>
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
        <el-empty v-else description="暂无制作中订单" :image-size="72" />
      </article>

      <article class="panel-card group-card">
        <div class="group-head">
          <h3>待交付</h3>
          <el-button type="text" @click="$router.push('/designer/communication')">查看沟通</el-button>
        </div>
        <div v-if="deliveryOrders.length" class="order-mini-list">
          <div v-for="item in deliveryOrders" :key="`ship-${item.id}`" class="mini-row">
            <div>
              <div class="mini-title">{{ item.orderNo || item.id }}</div>
              <div class="mini-meta">{{ item.orderStatus }} · 需回填交付备注</div>
            </div>
            <el-button size="mini" type="success" :loading="actionLoadingKey === `ship-${item.id}`" @click="shipOrder(item)">完成并发货</el-button>
          </div>
        </div>
        <el-empty v-else description="暂无待交付订单" :image-size="72" />
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
        <div class="panel-title">热门款参考</div>
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
      actionLoadingKey: '',
      poolList: [],
      poolTotal: 0,
      mineList: [],
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
    poolOrders() {
      return this.poolList.slice(0, 5)
    },
    producingOrders() {
      return this.mineList.filter((item) => ['待生产', '生产中'].includes(item.orderStatus)).slice(0, 5)
    },
    deliveryOrders() {
      return this.mineList.filter((item) => item.orderStatus === '生产中').slice(0, 5)
    },
    trendMax() {
      if (!this.trendData.length) return 1
      const max = Math.max(...this.trendData.map((item) => item.count || 0))
      return max > 0 ? max : 1
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    formatMoney(v) {
      return Number(v || 0).toFixed(2)
    },
    parseDayKey(input) {
      if (!input) return ''
      const text = String(input)
      const match = text.match(/\d{4}-\d{2}-\d{2}/)
      if (match) return match[0]
      const date = new Date(text.replace(/-/g, '/'))
      if (Number.isNaN(date.getTime())) return ''
      return this.dayKey(date)
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

        if (!poolRes || poolRes.code !== 0 || !mineRes || mineRes.code !== 0) {
          this.$message.warning('订单数据加载存在异常，已展示可用部分')
        }

        const pool = this.parsePageData((poolRes && poolRes.data) || {})
        const mine = this.parsePageData((mineRes && mineRes.data) || {})
        this.poolList = this.normalizeOrders(pool.list)
        this.poolTotal = pool.total || this.poolList.length
        this.mineList = this.normalizeOrders(mine.list)

        const hotData = (hotRes && hotRes.code === 0 && hotRes.data) || {}
        this.hotList = hotData.list || []
        this.updateMetrics()
      } finally {
        this.loading = false
      }
    },
    async claim(row) {
      const ok = await this.$confirm(`确认认领订单 ${row.orderNo || row.id} 吗？`, '提示', {
        confirmButtonText: '确认',
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
        this.$message.error((res && res.msg) || '认领失败')
        return
      }
      this.$message.success(res.msg || '认领成功')
      await this.loadData()
      this.openCommunication(row)
    },
    async startProduction(row) {
      const ok = await this.$confirm(`确认开始制作订单 ${row.orderNo || row.id} 吗？`, '提示', {
        confirmButtonText: '确认',
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
      this.$message.success(res.msg || '已开始制作')
      await this.loadData()
    },
    async shipOrder(row) {
      const promptRes = await this.$prompt('请填写交付说明/物流单号（选填）', '完成并发货', {
        confirmButtonText: '继续发货',
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
          remark: remark ? `交付说明：${remark}` : '设计师发货'
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

.group-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.group-card {
  padding: 14px;
}

.group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.group-head h3 {
  color: #2f4486;
  font-size: 16px;
}

.order-mini-list {
  display: grid;
  gap: 8px;
}

.mini-row {
  border: 1px solid #e8eeff;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.mini-title {
  color: #2f3f72;
  font-size: 13px;
  font-weight: 700;
}

.mini-meta {
  margin-top: 4px;
  color: #8c98bc;
  font-size: 12px;
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
  .kpi-grid,
  .group-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .head-card,
  .kpi-card,
  .group-card,
  .chart-card,
  .side-card {
    padding: 12px;
  }

  .kpi-grid,
  .group-grid {
    grid-template-columns: 1fr;
  }
}
</style>