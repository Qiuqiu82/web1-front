<template>
  <div class="order-page">
    <div class="page-title">我的订单</div>

    <el-table :data="list" style="width: 100%" border>
      <el-table-column prop="orderNo" label="订单号" min-width="190" />
      <el-table-column prop="totalAmount" label="订单金额" width="120">
        <template slot-scope="scope">{{ formatMoney(scope.row.totalAmount) }}</template>
      </el-table-column>
      <el-table-column prop="payStatus" label="支付状态" width="110" />
      <el-table-column prop="orderStatus" label="履约状态" width="120" />
      <el-table-column prop="payType" label="支付方式" width="120" />
      <el-table-column prop="addtime" label="下单时间" min-width="170" />
      <el-table-column label="操作" width="320" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" @click="showItems(scope.row)">查看商品</el-button>
          <el-button
            v-if="canPay(scope.row)"
            type="primary"
            size="mini"
            @click="goPay(scope.row)"
          >
            去支付
          </el-button>
          <el-button
            v-if="canPay(scope.row)"
            type="success"
            size="mini"
            @click="mockFinishPay(scope.row)"
          >
            模拟支付成功
          </el-button>
          <el-button
            v-if="canCancel(scope.row)"
            type="danger"
            size="mini"
            @click="cancelOrder(scope.row)"
          >
            取消订单
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="订单商品" :visible.sync="itemsVisible" width="680px">
      <el-table :data="currentItems" border>
        <el-table-column prop="productName" label="商品" min-width="200" />
        <el-table-column prop="specs" label="规格" width="100" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="price" label="单价" width="100">
          <template slot-scope="scope">{{ formatMoney(scope.row.price) }}</template>
        </el-table-column>
        <el-table-column prop="amount" label="小计" width="100">
          <template slot-scope="scope">{{ formatMoney(scope.row.amount) }}</template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      list: [],
      itemsVisible: false,
      currentItems: [],
      currentOrder: null,
      payInfo: {},
      pollTimer: null,
      sessionUser: {
        userId: 0,
        userTable: 'yonghu'
      }
    }
  },
  created() {
    this.initSessionUser()
    this.load()
  },
  beforeDestroy() {
    this.stopPoll()
  },
  methods: {
    initSessionUser() {
      this.sessionUser.userId = Number(localStorage.getItem('userid') || localStorage.getItem('userId') || 0)
      this.sessionUser.userTable = localStorage.getItem('sessionTable') || localStorage.getItem('UserTableName') || 'yonghu'
    },
    formatMoney(v) {
      return Number(v || 0).toFixed(2)
    },
    canPay(row) {
      return (row.payStatus || '') === '未支付'
    },
    canCancel(row) {
      return (row.payStatus || '') === '未支付' && (row.orderStatus || '') === '待确认'
    },
    async load() {
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosorderPage,
        method: 'get',
        params: { page: 1, limit: 50 }
      })
      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '订单加载失败')
        return
      }

      const data = res.data || []
      const rows = Array.isArray(data) ? data : (data.list || [])
      this.list = rows.map((r) => ({
        ...r,
        orderNo: r.orderNo || r.order_no || '',
        totalAmount: r.totalAmount || r.total_amount || 0,
        payStatus: r.payStatus || r.pay_status || '未支付',
        orderStatus: r.orderStatus || r.order_status || '待确认',
        payType: r.payType || r.pay_type || '-'
      }))
    },
    async goPay(row) {
      const orderNo = row.orderNo || row.order_no
      if (!orderNo) {
        this.$message.warning('订单号不存在')
        return
      }
      const userId = this.sessionUser.userId || Number(row.userId || row.user_id || 0)
      const userTable =
        this.sessionUser.userTable ||
        row.userTable ||
        row.user_table ||
        localStorage.getItem('sessionTable') ||
        localStorage.getItem('UserTableName') ||
        'yonghu'

      if (!localStorage.getItem('Token') || !userId) {
        this.$message.warning('请先登录后再支付')
        this.$router.push('/login')
        return
      }
      this.sessionUser.userId = userId
      this.sessionUser.userTable = userTable

      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosPayCreate,
        method: 'post',
        dataType: 'json',
        params: {
          orderNo,
          userId,
          userTable,
          payChannel: 'mock'
        }
      })

      if (!res || res.code !== 0) {
        this.$message.error((res && (res.msg || res.info)) || '创建支付单失败')
        return
      }

      this.currentOrder = row
      this.payInfo = res.data || {}
      this.$message.success('已创建支付单，等待支付')
      this.startPoll(orderNo)
    },
    startPoll(orderNo) {
      this.stopPoll()
      this.pollTimer = setInterval(async () => {
        const statusRes = await this.$proxy.Request({
          url: this.$proxy.Api.cosPayStatus,
          method: 'get',
          params: {
            orderNo,
            userId: this.sessionUser.userId,
            userTable: this.sessionUser.userTable
          },
          showLoading: false
        })

        if (!statusRes || statusRes.code !== 0) {
          return
        }
        const payStatus = (statusRes.data && (statusRes.data.payStatus || statusRes.data.pay_status)) || ''
        if (payStatus === '已支付') {
          this.stopPoll()
          this.load()
          this.$message.success('支付成功')
        }
      }, 3000)
    },
    stopPoll() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer)
        this.pollTimer = null
      }
    },
    async mockFinishPay(row) {
      const rowOrderNo = row && (row.orderNo || row.order_no)
      if (!rowOrderNo) {
        this.$message.warning('未找到订单号')
        return
      }

      if (!this.currentOrder || (this.currentOrder.orderNo || this.currentOrder.order_no) !== rowOrderNo) {
        await this.goPay(row)
      }

      const payOrderNo = this.payInfo.payOrderNo || this.payInfo.pay_order_no
      if (!payOrderNo) {
        this.$message.warning('未获取到支付单号，请先点击去支付')
        return
      }

      const mockRes = await this.$proxy.Request({
        url: this.$proxy.Api.cosPayMockSuccess,
        method: 'post',
        params: { payOrderNo }
      })
      if (!mockRes || mockRes.code !== 0) {
        this.$message.error((mockRes && (mockRes.msg || mockRes.info)) || '模拟支付失败')
        return
      }

      this.$message.success('模拟支付成功，正在刷新状态')
      this.startPoll(rowOrderNo)
    },
    async cancelOrder(row) {
      const orderId = row.id
      if (!orderId) {
        this.$message.warning('订单ID不存在')
        return
      }
      const ok = await this.$confirm('确认取消该订单吗？', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => true).catch(() => false)

      if (!ok) {
        return
      }

      const res = await this.$proxy.Request({
        url: `${this.$proxy.Api.cosorderCancelPrefix}${orderId}`,
        method: 'post',
        dataType: 'json',
        params: {}
      })

      if (!res || res.code !== 0) {
        this.$message.error((res && (res.msg || res.info)) || '取消订单失败')
        return
      }

      this.$message.success('订单已取消')
      this.load()
    },
    showItems(row) {
      const raw = row.itemsJson || row.items_json
      if (!raw) {
        this.currentItems = []
        this.itemsVisible = true
        return
      }
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        this.currentItems = Array.isArray(parsed) ? parsed : []
      } catch (e) {
        this.currentItems = []
      }
      this.itemsVisible = true
    }
  }
}
</script>

<style scoped>
.order-page {
  width: 1200px;
  margin: 20px auto;
}
.page-title {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1f2d3d;
}
</style>
