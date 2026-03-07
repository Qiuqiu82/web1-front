<template>
  <div class="designer-page order-theme">
    <section class="head-panel">
      <div>
        <h2>设计师接单台</h2>
        <p>从待接单池快速认领订单，并持续追踪我的订单进度。</p>
      </div>
    </section>

    <el-card shadow="never" class="recommend-card panel-card">
      <div slot="header" class="card-header">
        <span>热门款参考（热度排序）</span>
      </div>
      <el-row :gutter="12" v-if="hotList.length">
        <el-col :span="6" v-for="item in hotList" :key="item.id">
          <div class="hot-item" @click="toCosDetail(item)">
            <img :src="coverUrl(item)" alt="热门款" class="hot-cover" />
            <div class="hot-name">{{ item.fuzhuangmingcheng || '-' }}</div>
            <div class="hot-meta">热度：{{ item.clicknum || 0 }}</div>
          </div>
        </el-col>
      </el-row>
      <div v-else class="empty-tip">暂无热门款数据</div>
    </el-card>

    <section class="panel-card tabs-panel">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="待接单池" name="pool">
          <el-table :data="poolList" border v-loading="poolLoading" style="width: 100%">
            <el-table-column prop="orderNo" label="订单号" min-width="180" />
            <el-table-column prop="userId" label="用户ID" width="120" />
            <el-table-column prop="totalAmount" label="金额" width="120">
              <template slot-scope="scope">￥{{ formatMoney(scope.row.totalAmount) }}</template>
            </el-table-column>
            <el-table-column prop="payStatus" label="支付状态" width="110">
              <template slot-scope="scope">
                <el-tag size="mini" :type="payTagType(scope.row.payStatus)">{{ scope.row.payStatus || '-' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="orderStatus" label="履约状态" width="120">
              <template slot-scope="scope">
                <span :class="['status-chip', orderStatusClass(scope.row.orderStatus)]">{{ scope.row.orderStatus || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="designerStatus" label="接单状态" width="120" />
            <el-table-column prop="addtime" label="下单时间" min-width="160" />
            <el-table-column label="操作" width="140" fixed="right">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  class="claim-btn"
                  :loading="claimLoadingOrderId === scope.row.id"
                  @click="claim(scope.row)"
                >
                  认领
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              @size-change="handlePoolSizeChange"
              @current-change="handlePoolCurrentChange"
              :current-page="poolPage"
              :page-size="poolLimit"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              :total="poolTotal"
              background
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="我的订单" name="mine">
          <el-table :data="mineList" border v-loading="mineLoading" style="width: 100%">
            <el-table-column prop="orderNo" label="订单号" min-width="180" />
            <el-table-column prop="userId" label="用户ID" width="120" />
            <el-table-column prop="totalAmount" label="金额" width="120">
              <template slot-scope="scope">￥{{ formatMoney(scope.row.totalAmount) }}</template>
            </el-table-column>
            <el-table-column prop="payStatus" label="支付状态" width="110">
              <template slot-scope="scope">
                <el-tag size="mini" :type="payTagType(scope.row.payStatus)">{{ scope.row.payStatus || '-' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="orderStatus" label="履约状态" width="120">
              <template slot-scope="scope">
                <span :class="['status-chip', orderStatusClass(scope.row.orderStatus)]">{{ scope.row.orderStatus || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="designerStatus" label="接单状态" width="120" />
            <el-table-column prop="designerTakeTime" label="认领时间" min-width="160" />
            <el-table-column prop="addtime" label="下单时间" min-width="160" />
            <el-table-column label="操作" width="260" fixed="right">
              <template slot-scope="scope">
                <el-button
                  v-if="canStartProduction(scope.row)"
                  type="primary"
                  size="mini"
                  :loading="actionLoadingKey === `${scope.row.id}-start`"
                  @click="startProduction(scope.row)"
                >
                  开始制作
                </el-button>
                <el-button
                  v-if="canShip(scope.row)"
                  type="success"
                  size="mini"
                  :loading="actionLoadingKey === `${scope.row.id}-ship`"
                  @click="shipOrder(scope.row)"
                >
                  制作完成并发货
                </el-button>
                <span v-if="!canStartProduction(scope.row) && !canShip(scope.row)" class="noop-tip">当前状态无需操作</span>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              @size-change="handleMineSizeChange"
              @current-change="handleMineCurrentChange"
              :current-page="minePage"
              :page-size="mineLimit"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              :total="mineTotal"
              background
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </section>
  </div>
</template>

<script>
export default {
  data() {
    return {
      baseUrl: this.$config.baseUrl,
      activeTab: 'pool',
      hotList: [],

      poolLoading: false,
      poolList: [],
      poolPage: 1,
      poolLimit: 10,
      poolTotal: 0,

      mineLoading: false,
      mineList: [],
      minePage: 1,
      mineLimit: 10,
      mineTotal: 0,

      claimLoadingOrderId: null,
      actionLoadingKey: ''
    }
  },
  created() {
    if (!this.ensureDesigner()) {
      return
    }
    this.loadHot()
    this.loadPool()
    this.loadMine()
  },
  methods: {
    ensureDesigner() {
      const tableName = localStorage.getItem('sessionTable') || localStorage.getItem('UserTableName') || ''
      const roleName = localStorage.getItem('role') || ''
      const isDesigner = tableName === 'shejishi' || roleName === '设计师' || roleName === 'DESIGNER'
      if (!isDesigner) {
        this.$message.error('仅设计师可访问该页面')
        this.$router.replace('/index/home')
        return false
      }
      return true
    },
    formatMoney(v) {
      return Number(v || 0).toFixed(2)
    },
    payTagType(status) {
      if (status === '已支付') return 'success'
      if (status === '未支付') return 'warning'
      return 'info'
    },
    orderStatusClass(status) {
      if (status === '待确认') return 'status-confirm'
      if (status === '待生产' || status === '生产中') return 'status-progress'
      if (status === '已发货') return 'status-ship'
      if (status === '已完成') return 'status-done'
      if (status === '已取消') return 'status-cancel'
      return 'status-default'
    },
    canStartProduction(row) {
      return row && row.orderStatus === '待生产'
    },
    canShip(row) {
      return row && row.orderStatus === '生产中'
    },
    normalizeRows(rows = []) {
      return rows.map((row) => ({
        ...row,
        orderNo: row.orderNo || row.order_no || '',
        userId: row.userId || row.user_id || '',
        totalAmount: row.totalAmount || row.total_amount || 0,
        payStatus: row.payStatus || row.pay_status || '',
        orderStatus: row.orderStatus || row.order_status || '',
        designerStatus: row.designerStatus || row.designer_status || '待接单',
        designerTakeTime: row.designerTakeTime || row.designer_take_time || '-'
      }))
    },
    coverUrl(item) {
      const raw = item.huawentuan || ''
      const first = raw.split(',')[0] || ''
      if (!first) {
        return ''
      }
      return first.startsWith('http') ? first : `${this.baseUrl}${first}`
    },
    toCosDetail(item) {
      this.$router.push({ path: '/index/remaicosfuDetail', query: { detailObj: JSON.stringify(item) } })
    },
    async loadHot() {
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.remaicosfuAutoSort,
        method: 'get',
        params: {
          page: 1,
          limit: 4
        },
        showLoading: false
      })
      if (!res || res.code !== 0) {
        return
      }
      const data = res.data || {}
      this.hotList = data.list || []
    },
    async loadPool() {
      this.poolLoading = true
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosorderDesignerPool,
        method: 'get',
        params: {
          page: this.poolPage,
          limit: this.poolLimit
        }
      })
      this.poolLoading = false
      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '待接单加载失败')
        return
      }
      const data = res.data || {}
      this.poolList = this.normalizeRows(data.list || [])
      this.poolTotal = Number(data.total || 0)
    },
    async loadMine() {
      this.mineLoading = true
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosorderDesignerMine,
        method: 'get',
        params: {
          page: this.minePage,
          limit: this.mineLimit
        }
      })
      this.mineLoading = false
      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '我的订单加载失败')
        return
      }
      const data = res.data || {}
      this.mineList = this.normalizeRows(data.list || [])
      this.mineTotal = Number(data.total || 0)
    },
    handlePoolSizeChange(v) {
      this.poolLimit = v
      this.poolPage = 1
      this.loadPool()
    },
    handlePoolCurrentChange(v) {
      this.poolPage = v
      this.loadPool()
    },
    handleMineSizeChange(v) {
      this.mineLimit = v
      this.minePage = 1
      this.loadMine()
    },
    handleMineCurrentChange(v) {
      this.minePage = v
      this.loadMine()
    },
    async confirmAction(message) {
      return this.$confirm(message, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => true)
        .catch(() => false)
    },
    async startProduction(row) {
      const ok = await this.confirmAction(`确认开始制作订单 ${row.orderNo || row.id} 吗？`)
      if (!ok) return

      this.actionLoadingKey = `${row.id}-start`
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosorderDesignerStart,
        method: 'post',
        dataType: 'json',
        params: {
          orderId: row.id
        }
      })
      this.actionLoadingKey = ''

      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '开始制作失败')
        return
      }
      this.$message.success(res.msg || '已开始制作')
      await this.loadMine()
    },
    async shipOrder(row) {
      const promptRes = await this.$prompt('可填写交付说明、物流单号或素材链接（选填）', '制作完成并发货', {
        confirmButtonText: '继续发货',
        cancelButtonText: '取消',
        inputPlaceholder: '例如：物流单号 + 交付说明',
        inputType: 'textarea',
        inputValue: ''
      }).catch(() => null)
      if (!promptRes) {
        return
      }

      const deliveryRemark = (promptRes.value || '').trim()
      this.actionLoadingKey = `${row.id}-ship`
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosorderDesignerShip,
        method: 'post',
        dataType: 'json',
        params: {
          orderId: row.id,
          remark: deliveryRemark ? `交付说明：${deliveryRemark}` : '设计师发货'
        }
      })
      this.actionLoadingKey = ''

      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '发货操作失败')
        return
      }
      this.$message.success(res.msg || '已标记发货')
      await this.loadMine()
    },
    async claim(row) {
      const ok = await this.confirmAction(`确认认领订单 ${row.orderNo || row.id} 吗？`)

      if (!ok) {
        return
      }

      this.claimLoadingOrderId = row.id
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosorderDesignerClaim,
        method: 'post',
        dataType: 'json',
        params: {
          orderId: row.id
        }
      })
      this.claimLoadingOrderId = null

      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '认领失败')
        return
      }

      this.$message.success(res.msg || '认领成功')
      await this.loadPool()
      await this.loadMine()
    }
  }
}
</script>

<style scoped>
.order-theme {
  --order-primary: #5264ff;
  --order-primary-soft: #edf1ff;
  --order-text-main: #25356a;
  --order-text-sub: #8590b2;
  --order-border: #e7edff;
  --order-shadow: 0 10px 24px rgba(68, 88, 150, 0.1);
}

.designer-page {
  width: 100%;
  display: grid;
  gap: 12px;
}

.panel-card,
.head-panel,
.tabs-panel {
  border-radius: 16px;
  border: 1px solid var(--order-border);
  background: #fff;
  box-shadow: var(--order-shadow);
}

.head-panel {
  padding: 14px;
}

.head-panel h2 {
  color: var(--order-text-main);
  font-size: 24px;
}

.head-panel p {
  margin-top: 6px;
  color: var(--order-text-sub);
}

.recommend-card {
  margin-bottom: 0;
}

.card-header {
  font-weight: 700;
  color: #334377;
}

.hot-item {
  border: 1px solid #ebeef5;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: #fff;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hot-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 20px rgba(78, 98, 161, 0.15);
}

.hot-cover {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
  background: #f5f7fa;
}

.hot-name {
  font-size: 14px;
  font-weight: 600;
  color: #2f3d6f;
  padding: 10px 10px 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hot-meta {
  font-size: 12px;
  color: #9099b5;
  padding: 0 10px 10px;
}

.empty-tip {
  color: #9099b5;
}

.tabs-panel {
  padding: 12px;
}

.status-chip {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.status-confirm {
  background: #f0f3ff;
  color: #4a5c9f;
}

.status-progress {
  background: #ebefff;
  color: #3e52a8;
}

.status-ship {
  background: #eaf5ff;
  color: #3570a4;
}

.status-done {
  background: #e9f8ef;
  color: #2f7a4c;
}

.status-cancel {
  background: #f3f4f6;
  color: #7b8398;
}

.status-default {
  background: #f4f6fb;
  color: #687699;
}

.claim-btn {
  min-width: 72px;
  border-radius: 10px;
}

.noop-tip {
  color: #8a95b7;
  font-size: 12px;
}

.pagination {
  margin-top: 16px;
  text-align: right;
}

@media (max-width: 900px) {
  .tabs-panel,
  .head-panel {
    padding: 12px;
  }
}
</style>
