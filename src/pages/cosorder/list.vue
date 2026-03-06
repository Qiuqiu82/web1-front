<template>
  <div class="order-page">
    <section class="header-panel">
      <div>
        <h2>My Orders</h2>
        <p>Track payment and production status. You can pay or cancel unpaid orders.</p>
      </div>
      <el-radio-group v-model="activeFilter" size="small">
        <el-radio-button label="all">All</el-radio-button>
        <el-radio-button label="unpaid">Unpaid</el-radio-button>
        <el-radio-button label="progress">In Progress</el-radio-button>
        <el-radio-button label="done">Done</el-radio-button>
      </el-radio-group>
    </section>

    <el-empty v-if="!filteredList.length" description="No orders under current filter" :image-size="90" />

    <section v-else class="order-list">
      <article class="order-card" v-for="row in filteredList" :key="row.id">
        <div class="order-head">
          <div>
            <div class="order-no">Order No: {{ row.orderNo }}</div>
            <div class="order-time">Created At: {{ row.addtime || '-' }}</div>
          </div>
          <div class="order-amount">${{ formatMoney(row.totalAmount) }}</div>
        </div>

        <div class="tag-row">
          <el-tag size="mini" :type="row.payStatus === PAY_PAID ? 'success' : 'warning'">{{ row.payStatus }}</el-tag>
          <el-tag size="mini" type="info">{{ row.orderStatus }}</el-tag>
          <el-tag size="mini">{{ row.payType || '-' }}</el-tag>
        </div>

        <div class="progress-line">
          <div v-for="step in flowSteps" :key="step" :class="['node', { active: isStepActive(row.orderStatus, step) }]">
            <span>{{ step }}</span>
          </div>
        </div>

        <div class="items-preview" v-if="parseItems(row).length">
          <div class="item" v-for="(item, idx) in parseItems(row).slice(0, 3)" :key="idx">
            <span>{{ item.productName || 'Product' }}</span>
            <span>x{{ item.quantity || 1 }}</span>
            <span>${{ formatMoney(item.amount || item.price) }}</span>
          </div>
          <div class="item-more" v-if="parseItems(row).length > 3">Total {{ parseItems(row).length }} products</div>
        </div>

        <div class="action-row">
          <el-button size="mini" @click="showItems(row)">View Items</el-button>
          <el-button v-if="canPay(row)" type="primary" size="mini" @click="goPay(row)">Pay</el-button>
          <el-button v-if="canPay(row)" type="success" size="mini" @click="mockFinishPay(row)">Mock Paid</el-button>
          <el-button v-if="canCancel(row)" type="danger" size="mini" @click="cancelOrder(row)">Cancel</el-button>
        </div>
      </article>
    </section>

    <el-dialog title="Order Items" :visible.sync="itemsVisible" width="700px">
      <el-table :data="currentItems" border>
        <el-table-column prop="productName" label="Product" min-width="220" />
        <el-table-column prop="specs" label="Spec" width="100" />
        <el-table-column prop="quantity" label="Qty" width="80" />
        <el-table-column prop="price" label="Price" width="100">
          <template slot-scope="scope">{{ formatMoney(scope.row.price) }}</template>
        </el-table-column>
        <el-table-column prop="amount" label="Subtotal" width="100">
          <template slot-scope="scope">{{ formatMoney(scope.row.amount) }}</template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
const PAY_UNPAID = '\u672a\u652f\u4ed8'
const PAY_PAID = '\u5df2\u652f\u4ed8'
const ORDER_PENDING_CONFIRM = '\u5f85\u786e\u8ba4'
const ORDER_PENDING_PRODUCE = '\u5f85\u751f\u4ea7'
const ORDER_PRODUCING = '\u751f\u4ea7\u4e2d'
const ORDER_SHIPPED = '\u5df2\u53d1\u8d27'
const ORDER_FINISHED = '\u5df2\u5b8c\u6210'
const ORDER_CANCELED = '\u5df2\u53d6\u6d88'
const FLOW = [ORDER_PENDING_CONFIRM, ORDER_PENDING_PRODUCE, ORDER_PRODUCING, ORDER_SHIPPED, ORDER_FINISHED]

export default {
  data() {
    return {
      PAY_UNPAID,
      PAY_PAID,
      ORDER_PENDING_CONFIRM,
      ORDER_FINISHED,
      ORDER_CANCELED,
      list: [],
      activeFilter: 'all',
      flowSteps: FLOW,
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
  computed: {
    filteredList() {
      if (this.activeFilter === 'all') {
        return this.list
      }
      if (this.activeFilter === 'unpaid') {
        return this.list.filter((row) => row.payStatus === PAY_UNPAID)
      }
      if (this.activeFilter === 'progress') {
        return this.list.filter(
          (row) => row.payStatus === PAY_PAID && ![ORDER_FINISHED, ORDER_CANCELED].includes(row.orderStatus)
        )
      }
      if (this.activeFilter === 'done') {
        return this.list.filter((row) => row.orderStatus === ORDER_FINISHED)
      }
      return this.list
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
      this.sessionUser.userTable =
        localStorage.getItem('sessionTable') || localStorage.getItem('UserTableName') || 'yonghu'
    },
    formatMoney(v) {
      return Number(v || 0).toFixed(2)
    },
    canPay(row) {
      return (row.payStatus || '') === PAY_UNPAID
    },
    canCancel(row) {
      return (row.payStatus || '') === PAY_UNPAID && (row.orderStatus || '') === ORDER_PENDING_CONFIRM
    },
    parseItems(row) {
      const raw = row.itemsJson || row.items_json
      if (!raw) {
        return []
      }
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        return Array.isArray(parsed) ? parsed : []
      } catch (e) {
        return []
      }
    },
    isStepActive(currentStatus, step) {
      const currentIndex = FLOW.indexOf(currentStatus)
      const stepIndex = FLOW.indexOf(step)
      if (currentStatus === ORDER_CANCELED) {
        return false
      }
      if (currentIndex < 0) {
        return stepIndex === 0
      }
      return stepIndex <= currentIndex
    },
    async load() {
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosorderPage,
        method: 'get',
        params: { page: 1, limit: 50 }
      })
      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || 'Failed to load orders')
        return
      }

      const data = res.data || []
      const rows = Array.isArray(data) ? data : data.list || []
      this.list = rows.map((r) => ({
        ...r,
        orderNo: r.orderNo || r.order_no || '',
        totalAmount: r.totalAmount || r.total_amount || 0,
        payStatus: r.payStatus || r.pay_status || PAY_UNPAID,
        orderStatus: r.orderStatus || r.order_status || ORDER_PENDING_CONFIRM,
        payType: r.payType || r.pay_type || '-'
      }))
    },
    async goPay(row) {
      const orderNo = row.orderNo || row.order_no
      if (!orderNo) {
        this.$message.warning('Order number is missing')
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
        this.$message.warning('Please login before payment')
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
        this.$message.error((res && (res.msg || res.info)) || 'Failed to create pay order')
        return
      }

      this.currentOrder = row
      this.payInfo = res.data || {}
      this.$message.success('Pay order created. Waiting for payment.')
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
        if (payStatus === PAY_PAID) {
          this.stopPoll()
          this.load()
          this.$message.success('Payment succeeded')
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
        this.$message.warning('Order number is missing')
        return
      }

      if (!this.currentOrder || (this.currentOrder.orderNo || this.currentOrder.order_no) !== rowOrderNo) {
        await this.goPay(row)
      }

      const payOrderNo = this.payInfo.payOrderNo || this.payInfo.pay_order_no
      if (!payOrderNo) {
        this.$message.warning('Pay order missing, click Pay first')
        return
      }

      const mockRes = await this.$proxy.Request({
        url: this.$proxy.Api.cosPayMockSuccess,
        method: 'post',
        params: { payOrderNo }
      })
      if (!mockRes || mockRes.code !== 0) {
        this.$message.error((mockRes && (mockRes.msg || mockRes.info)) || 'Mock pay failed')
        return
      }

      this.$message.success('Mock pay succeeded, refreshing status')
      this.startPoll(rowOrderNo)
    },
    async cancelOrder(row) {
      const orderId = row.id
      if (!orderId) {
        this.$message.warning('Order id is missing')
        return
      }
      const ok = await this.$confirm('Cancel this order?', 'Notice', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(() => true)
        .catch(() => false)

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
        this.$message.error((res && (res.msg || res.info)) || 'Cancel failed')
        return
      }

      this.$message.success('Order canceled')
      this.load()
    },
    showItems(row) {
      this.currentItems = this.parseItems(row)
      this.itemsVisible = true
    }
  }
}
</script>

<style scoped>
.order-page {
  display: grid;
  gap: 14px;
}

.header-panel {
  border-radius: 16px;
  border: 1px solid #e8edff;
  background: #fff;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.header-panel h2 {
  color: #273871;
  font-size: 26px;
}

.header-panel p {
  margin-top: 6px;
  color: #7f8ab2;
}

.order-list {
  display: grid;
  gap: 12px;
}

.order-card {
  border-radius: 14px;
  border: 1px solid #e8edff;
  background: #fff;
  padding: 14px;
  box-shadow: 0 10px 22px rgba(75, 96, 160, 0.08);
}

.order-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.order-no {
  font-size: 16px;
  font-weight: 700;
  color: #24356d;
}

.order-time {
  margin-top: 6px;
  color: #97a0bf;
  font-size: 12px;
}

.order-amount {
  color: #2a3c78;
  font-size: 24px;
  font-weight: 700;
}

.tag-row {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.progress-line {
  margin-top: 12px;
  border-radius: 10px;
  background: #f5f7ff;
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
}

.node {
  text-align: center;
  border-radius: 8px;
  background: #e8edff;
  color: #7e89b0;
  padding: 6px 4px;
  font-size: 12px;
}

.node.active {
  background: linear-gradient(140deg, #4d63ff 0%, #7488ff 100%);
  color: #fff;
}

.items-preview {
  margin-top: 12px;
  border-radius: 10px;
  border: 1px solid #edf1ff;
  padding: 10px;
  display: grid;
  gap: 8px;
}

.item {
  display: grid;
  grid-template-columns: 1fr 70px 100px;
  gap: 10px;
  color: #5f6d9b;
  font-size: 13px;
}

.item-more {
  color: #98a1bf;
  font-size: 12px;
}

.action-row {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 900px) {
  .progress-line {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>