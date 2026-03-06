<template>
  <div class="admin-order-page order-theme">
    <section class="head-panel">
      <div>
        <h2>订单协同中心</h2>
        <p>聚焦订单状态推进与履约日志，保留原有筛选、流转与详情能力。</p>
      </div>
    </section>

    <section class="search-panel">
      <el-form :inline="true" :model="searchForm" class="search-bar">
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderNo" placeholder="支持模糊搜索" clearable />
        </el-form-item>
        <el-form-item label="支付状态">
          <el-select v-model="searchForm.payStatus" clearable placeholder="全部">
            <el-option label="未支付" value="未支付" />
            <el-option label="已支付" value="已支付" />
          </el-select>
        </el-form-item>
        <el-form-item label="履约状态">
          <el-select v-model="searchForm.orderStatus" clearable placeholder="全部">
            <el-option label="待确认" value="待确认" />
            <el-option label="待生产" value="待生产" />
            <el-option label="生产中" value="生产中" />
            <el-option label="已发货" value="已发货" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </section>

    <section class="table-panel">
      <el-table :data="list" border v-loading="loading" style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" min-width="180" />
        <el-table-column prop="userId" label="用户ID" width="120" />
        <el-table-column prop="totalAmount" label="订单金额" width="120">
          <template slot-scope="scope">￥{{ formatMoney(scope.row.totalAmount) }}</template>
        </el-table-column>
        <el-table-column prop="payStatus" label="支付状态" width="120">
          <template slot-scope="scope">
            <el-tag size="mini" :type="payTagType(scope.row.payStatus)">{{ scope.row.payStatus || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderStatus" label="履约状态" width="130">
          <template slot-scope="scope">
            <span :class="['status-chip', orderStatusClass(scope.row.orderStatus)]">{{ scope.row.orderStatus || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="payType" label="支付方式" width="120" />
        <el-table-column prop="addtime" label="下单时间" min-width="160" />
        <el-table-column label="操作" width="320" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="openDetail(scope.row)">详情</el-button>
            <el-button
              v-if="nextStatus(scope.row.orderStatus)"
              type="primary"
              size="mini"
              class="promote-btn"
              @click="transition(scope.row)"
            >
              {{ transitionLabel(scope.row.orderStatus) }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pageIndex"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          :total="total"
          background
        />
      </div>
    </section>

    <el-dialog title="订单详情与状态轨迹" :visible.sync="detailVisible" width="900px">
      <div v-if="currentOrder" class="detail-box">
        <p><strong>订单号：</strong>{{ currentOrder.order_no || currentOrder.orderNo }}</p>
        <p><strong>用户ID：</strong>{{ currentOrder.user_id || currentOrder.userId }}</p>
        <p><strong>支付状态：</strong>{{ currentOrder.pay_status || currentOrder.payStatus }}</p>
        <p><strong>履约状态：</strong>{{ currentOrder.order_status || currentOrder.orderStatus }}</p>
        <p><strong>支付方式：</strong>{{ currentOrder.pay_type || currentOrder.payType || '-' }}</p>
      </div>

      <div class="log-title">状态流转日志</div>
      <el-table :data="statusLogs" border max-height="360">
        <el-table-column prop="addtime" label="时间" min-width="160" />
        <el-table-column label="支付状态变化" min-width="150">
          <template slot-scope="scope">
            {{ emptyDash(scope.row.from_pay_status) }} → {{ emptyDash(scope.row.to_pay_status) }}
          </template>
        </el-table-column>
        <el-table-column label="履约状态变化" min-width="150">
          <template slot-scope="scope">
            {{ emptyDash(scope.row.from_order_status) }} → {{ emptyDash(scope.row.to_order_status) }}
          </template>
        </el-table-column>
        <el-table-column prop="operator_role" label="角色" width="110" />
        <el-table-column prop="operator_id" label="操作人ID" width="120" />
        <el-table-column prop="remark" label="备注" min-width="160" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      pageIndex: 1,
      pageSize: 10,
      searchForm: {
        orderNo: '',
        payStatus: '',
        orderStatus: ''
      },
      detailVisible: false,
      currentOrder: null,
      statusLogs: []
    }
  },
  created() {
    if (!this.ensureAdmin()) {
      return
    }
    this.load()
  },
  methods: {
    ensureAdmin() {
      const tableName = localStorage.getItem('sessionTable') || localStorage.getItem('UserTableName') || ''
      const roleName = localStorage.getItem('role') || ''
      const isAdmin = tableName === 'users' || roleName === '管理员'
      if (!isAdmin) {
        this.$message.error('仅管理员可访问订单协同页面')
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
    emptyDash(v) {
      return v == null || v === '' ? '-' : v
    },
    search() {
      this.pageIndex = 1
      this.load()
    },
    resetSearch() {
      this.searchForm.orderNo = ''
      this.searchForm.payStatus = ''
      this.searchForm.orderStatus = ''
      this.pageIndex = 1
      this.load()
    },
    handleSizeChange(v) {
      this.pageSize = v
      this.pageIndex = 1
      this.load()
    },
    handleCurrentChange(v) {
      this.pageIndex = v
      this.load()
    },
    async load() {
      this.loading = true
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosorderAdminPage,
        method: 'get',
        params: {
          page: this.pageIndex,
          limit: this.pageSize,
          orderNo: this.searchForm.orderNo || undefined,
          payStatus: this.searchForm.payStatus || undefined,
          orderStatus: this.searchForm.orderStatus || undefined
        }
      })
      this.loading = false

      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '订单加载失败')
        return
      }

      const data = res.data || {}
      const rows = data.list || []
      this.list = rows.map((r) => ({
        ...r,
        orderNo: r.orderNo || r.order_no || '',
        userId: r.userId || r.user_id || '',
        totalAmount: r.totalAmount || r.total_amount || 0,
        payStatus: r.payStatus || r.pay_status || '',
        orderStatus: r.orderStatus || r.order_status || '',
        payType: r.payType || r.pay_type || '-'
      }))
      this.total = Number(data.total || 0)
    },
    nextStatus(orderStatus) {
      if (orderStatus === '待生产') return '生产中'
      if (orderStatus === '生产中') return '已发货'
      if (orderStatus === '已发货') return '已完成'
      return ''
    },
    transitionLabel(orderStatus) {
      if (orderStatus === '待生产') return '推进到生产中'
      if (orderStatus === '生产中') return '推进到已发货'
      if (orderStatus === '已发货') return '推进到已完成'
      return '推进状态'
    },
    async transition(row) {
      const toStatus = this.nextStatus(row.orderStatus || row.order_status)
      if (!toStatus) {
        return
      }

      const promptResult = await this.$prompt('请输入流转备注（可选）', '订单状态流转', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: ''
      }).catch(() => null)

      if (!promptResult) {
        return
      }

      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosorderAdminTransition,
        method: 'post',
        dataType: 'json',
        params: {
          orderId: row.id,
          toOrderStatus: toStatus,
          remark: promptResult.value || ''
        }
      })

      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '状态流转失败')
        return
      }

      this.$message.success('状态流转成功')
      await this.load()
      if (this.detailVisible && this.currentOrder && this.currentOrder.id === row.id) {
        await this.openDetail(row)
      }
    },
    async openDetail(row) {
      const res = await this.$proxy.Request({
        url: `${this.$proxy.Api.cosorderAdminDetailPrefix}${row.id}`,
        method: 'get'
      })

      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '加载详情失败')
        return
      }

      const data = res.data || {}
      this.currentOrder = data.order || row
      this.statusLogs = data.statusLogs || []
      this.detailVisible = true
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

.admin-order-page {
  width: 100%;
  display: grid;
  gap: 12px;
}

.head-panel,
.search-panel,
.table-panel {
  border-radius: 16px;
  border: 1px solid var(--order-border);
  background: #fff;
  box-shadow: var(--order-shadow);
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

.search-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
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

.promote-btn {
  border-radius: 10px;
}

.pagination {
  margin-top: 16px;
  text-align: right;
}

.detail-box {
  background: #f8faff;
  border: 1px solid #edf1ff;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 12px;
}

.detail-box p {
  margin: 6px 0;
  color: #4f5f8f;
}

.log-title {
  margin: 8px 0 10px;
  font-weight: 700;
  color: #334377;
}

@media (max-width: 900px) {
  .search-panel,
  .table-panel,
  .head-panel {
    padding: 12px;
  }
}
</style>
