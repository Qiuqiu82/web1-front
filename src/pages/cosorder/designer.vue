<template>
  <div class="designer-page">
    <div class="page-title">设计师接单台</div>

    <el-card shadow="never" class="recommend-card">
      <div slot="header" class="clearfix">
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

    <el-tabs v-model="activeTab">
      <el-tab-pane label="待接单池" name="pool">
        <el-table :data="poolList" border v-loading="poolLoading" style="width: 100%">
          <el-table-column prop="orderNo" label="订单号" min-width="180" />
          <el-table-column prop="userId" label="用户ID" width="120" />
          <el-table-column prop="totalAmount" label="金额" width="120">
            <template slot-scope="scope">{{ formatMoney(scope.row.totalAmount) }}</template>
          </el-table-column>
          <el-table-column prop="payStatus" label="支付状态" width="110" />
          <el-table-column prop="orderStatus" label="履约状态" width="110" />
          <el-table-column prop="designerStatus" label="接单状态" width="110" />
          <el-table-column prop="addtime" label="下单时间" min-width="160" />
          <el-table-column label="操作" width="140" fixed="right">
            <template slot-scope="scope">
              <el-button
                type="primary"
                size="mini"
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
            <template slot-scope="scope">{{ formatMoney(scope.row.totalAmount) }}</template>
          </el-table-column>
          <el-table-column prop="payStatus" label="支付状态" width="110" />
          <el-table-column prop="orderStatus" label="履约状态" width="110" />
          <el-table-column prop="designerStatus" label="接单状态" width="110" />
          <el-table-column prop="designerTakeTime" label="认领时间" min-width="160" />
          <el-table-column prop="addtime" label="下单时间" min-width="160" />
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

      claimLoadingOrderId: null
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
    async claim(row) {
      const ok = await this.$confirm(`确认认领订单 ${row.orderNo || row.id} 吗？`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => true).catch(() => false)

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
.designer-page {
  width: 1200px;
  margin: 20px auto;
}
.page-title {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1f2d3d;
}
.recommend-card {
  margin-bottom: 16px;
}
.hot-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: #fff;
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
  color: #303133;
  padding: 10px 10px 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hot-meta {
  font-size: 12px;
  color: #909399;
  padding: 0 10px 10px;
}
.empty-tip {
  color: #909399;
}
.pagination {
  margin-top: 16px;
  text-align: right;
}
</style>
