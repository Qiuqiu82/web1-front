<template>
  <div class="order-page">
    <section class="header-panel">
      <div class="header-title">
        <h2>我的订单</h2>
        <p>按清晰阶段跟踪订单进度，聚焦关键操作。</p>
      </div>
      <div class="status-tabs">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          type="button"
          :class="['status-tab', { active: activeFilter === tab.value }]"
          @click="activeFilter = tab.value"
        >
          <span>{{ tab.label }}</span>
          <i>{{ tab.count }}</i>
        </button>
      </div>
    </section>

    <el-empty v-if="!filteredList.length" description="该分栏暂无订单" :image-size="92" />

    <section v-else class="order-list">
      <article class="order-card" v-for="row in filteredList" :key="row.id">
        <div class="card-main">
          <div class="card-main-left">
            <div class="order-no">订单号： {{ row.orderNo }}</div>
            <div class="order-meta">
              <span>下单时间： {{ row.addtime || '-' }}</span>
              <span>支付方式： {{ formatPayType(row.payType) }}</span>
              <span>设计师状态： {{ row.designerStatus || '-' }}</span>
            </div>
          </div>
          <div class="card-main-right">
            <span :class="['status-pill', statusKey(row)]">{{ statusLabel(row) }}</span>
            <strong>￥{{ formatMoney(row.totalAmount) }}</strong>
          </div>
        </div>

        <div class="flow-panel" :class="{ canceled: row.orderStatus === ORDER_CANCELED }">
          <div
            v-for="(step, idx) in flowSteps"
            :key="step.value"
            :class="['flow-step', { done: isFlowDone(row, idx), current: isFlowCurrent(row, idx) }]"
          >
            <div class="dot">{{ idx + 1 }}</div>
            <div class="label">{{ step.label }}</div>
          </div>
        </div>

        <div class="goods-panel" v-if="row.items.length">
          <div class="goods-row" v-for="(item, idx) in visibleItems(row)" :key="`${row.id}-${idx}`">
            <div class="goods-name">
              {{ item.productName || item.product_name || '商品' }}
              <small v-if="item.specs">· {{ item.specs }}</small>
            </div>
            <div class="goods-qty">x{{ item.quantity || 1 }}</div>
            <div class="goods-amount">￥{{ formatMoney(itemAmount(item)) }}</div>
          </div>
          <el-button v-if="row.items.length > 1" type="text" class="toggle-btn" @click="toggleItems(row.id)">
            {{ isExpanded(row.id) ? '收起商品' : `展开 ${row.items.length - 1} 条` }}
          </el-button>
        </div>
        <div v-else class="empty-goods">当前订单暂无商品明细</div>

        <div class="action-row">
          <template v-if="canPay(row)">
            <el-button type="primary" size="mini" @click="goPay(row)">去支付</el-button>
            <el-button type="success" size="mini" @click="mockFinishPay(row)">模拟支付成功</el-button>
            <el-button plain size="mini" @click="cancelOrder(row)" v-if="canCancel(row)">取消订单</el-button>
            <el-button size="mini" @click="openDetail(row)">查看详情</el-button>
          </template>
          <template v-else>
            <el-button v-if="canConfirmReceipt(row)" type="primary" size="mini" @click="confirmReceipt(row)">确认收货</el-button>
            <el-button type="primary" plain size="mini" @click="openDetail(row)">查看详情</el-button>
            <el-button size="mini" @click="showItems(row)">查看商品</el-button>
          </template>
        </div>
      </article>
    </section>

    <el-dialog title="订单商品" :visible.sync="itemsVisible" width="700px">
      <el-table :data="currentItems" border>
        <el-table-column prop="productName" label="商品" min-width="240" />
        <el-table-column prop="specs" label="规格" width="120" />
        <el-table-column prop="quantity" label="数量" width="90" />
        <el-table-column prop="price" label="单价" width="100">
          <template slot-scope="scope">￥{{ formatMoney(scope.row.price) }}</template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="110">
          <template slot-scope="scope">￥{{ formatMoney(itemAmount(scope.row)) }}</template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-drawer title="订单详情" :visible.sync="detailVisible" size="500px">
      <div v-if="currentOrder" class="detail-box">
        <p><strong>订单号：</strong> {{ currentOrder.orderNo }}</p>
        <p><strong>下单时间：</strong> {{ currentOrder.addtime || '-' }}</p>
        <p><strong>支付状态：</strong> {{ currentOrder.payStatus }}</p>
        <p><strong>订单状态：</strong> {{ currentOrder.orderStatus }}</p>
        <p><strong>支付方式：</strong> {{ formatPayType(currentOrder.payType) }}</p>
        <p><strong>订单总额：</strong> ￥{{ formatMoney(currentOrder.totalAmount) }}</p>
        <p><strong>收货人：</strong> {{ detailAddress.receiverName || currentOrder.contactName || '-' }}</p>
        <p><strong>联系电话：</strong> {{ detailAddress.receiverPhone || currentOrder.contactPhone || '-' }}</p>
        <p><strong>收货地址：</strong> {{ detailAddressText || currentOrder.address || '-' }}</p>
        <p><strong>身材档案：</strong> {{ detailBody.profileName || '-' }}</p>
        <p>
          <strong>身材数据：</strong>
          <span v-if="detailBody.profileName || detailBody.heightCm || detailBody.weightKg">
            H{{ detailBody.heightCm || '-' }} / W{{ detailBody.weightKg || '-' }} /
            腰围{{ detailBody.waistCm || '-' }} / 胸围{{ detailBody.bustCm || '-' }} /
            臀围{{ detailBody.hipCm || '-' }} / 肩宽{{ detailBody.shoulderCm || '-' }}
            <span v-if="detailBody.sizeCode"> · 尺码 {{ detailBody.sizeCode }}</span>
          </span>
          <span v-else>-</span>
        </p>
        <div class="detail-flow">
          <span v-for="step in flowSteps" :key="`detail-${step.value}`">{{ step.label }}</span>
        </div>
        <el-button
          v-if="canConfirmReceipt(currentOrder)"
          type="primary"
          size="mini"
          @click="confirmReceipt(currentOrder)"
        >
          确认收货
        </el-button>
        <el-button size="mini" @click="showItems(currentOrder)">查看商品</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
const PAY_UNPAID = 'UNPAID'
const PAY_PAID = 'PAID'
const ORDER_PENDING_CONFIRM = 'WAIT_CONFIRM'
const ORDER_PENDING_PRODUCE = 'WAIT_PRODUCE'
const ORDER_PRODUCING = 'PRODUCING'
const ORDER_SHIPPED = 'SHIPPED'
const ORDER_FINISHED = 'DONE'
const ORDER_CANCELED = 'CANCELED'

const FLOW_STEPS = [
  { value: ORDER_PENDING_CONFIRM, label: '待确认' },
  { value: ORDER_PENDING_PRODUCE, label: '待生产' },
  { value: ORDER_PRODUCING, label: '生产中' },
  { value: ORDER_SHIPPED, label: '待收货' },
  { value: ORDER_FINISHED, label: '已完成' }
]

const PROGRESS_STATUS = [ORDER_PENDING_CONFIRM, ORDER_PENDING_PRODUCE, ORDER_PRODUCING]

export default {
  data() {
    return {
      PAY_UNPAID,
      PAY_PAID,
      ORDER_PENDING_CONFIRM,
      ORDER_PENDING_PRODUCE,
      ORDER_PRODUCING,
      ORDER_SHIPPED,
      ORDER_FINISHED,
      ORDER_CANCELED,
      list: [],
      activeFilter: 'all',
      flowSteps: FLOW_STEPS,
      expandedMap: {},
      itemsVisible: false,
      currentItems: [],
      currentOrder: null,
      detailVisible: false,
      payInfo: {},
      pollTimer: null,
      sessionUser: {
        userId: 0,
        userTable: 'yonghu'
      }
    }
  },
  computed: {
    filterTabs() {
      return [
        { label: '全部', value: 'all', count: this.list.length },
        { label: '待付款', value: 'unpaid', count: this.list.filter((row) => this.statusKey(row) === 'unpaid').length },
        { label: '制作中', value: 'progress', count: this.list.filter((row) => this.statusKey(row) === 'progress').length },
        { label: '待收货', value: 'shipping', count: this.list.filter((row) => this.statusKey(row) === 'shipping').length },
        { label: '已完成', value: 'done', count: this.list.filter((row) => this.statusKey(row) === 'done').length }
      ]
    },
    filteredList() {
      if (this.activeFilter === 'all') {
        return this.list
      }
      return this.list.filter((row) => {
        if (this.activeFilter === 'unpaid') return this.statusKey(row) === 'unpaid'
        if (this.activeFilter === 'progress') return this.statusKey(row) === 'progress'
        if (this.activeFilter === 'shipping') return this.statusKey(row) === 'shipping'
        if (this.activeFilter === 'done') return this.statusKey(row) === 'done'
        return true
      })
    },
    detailAddress() {
      if (!this.currentOrder) return {}
      return this.parseSnapshot(this.currentOrder.addressSnapshotJson || this.currentOrder.address_snapshot_json)
    },
    detailAddressText() {
      const snap = this.detailAddress
      return `${snap.province || ''}${snap.city || ''}${snap.district || ''}${snap.detailAddress || ''}`
    },
    detailBody() {
      if (!this.currentOrder) return {}
      return this.parseSnapshot(this.currentOrder.bodyProfileSnapshotJson || this.currentOrder.body_profile_snapshot_json)
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
    formatPayType(payType) {
      const text = String(payType || '').trim().toUpperCase()
      if (!text || text === '-') return '-'
      if (text === 'ALIPAY') return '支付宝'
      if (text === 'WECHAT') return '微信'
      return payType
    },
    parseSnapshot(raw) {
      if (!raw) return {}
      try {
        return typeof raw === 'string' ? JSON.parse(raw) : raw
      } catch (e) {
        return {}
      }
    },
    normalizeItems(row) {
      const raw = row.itemsJson || row.items_json
      if (!raw) return []
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        return Array.isArray(parsed) ? parsed : []
      } catch (e) {
        return []
      }
    },
    itemAmount(item) {
      if (item.amount != null) return item.amount
      return Number(item.price || 0) * Number(item.quantity || 1)
    },
    visibleItems(row) {
      if (this.isExpanded(row.id)) return row.items
      return row.items.slice(0, 1)
    },
    isExpanded(orderId) {
      return !!this.expandedMap[orderId]
    },
    toggleItems(orderId) {
      this.$set(this.expandedMap, orderId, !this.expandedMap[orderId])
    },
    normalizeStatus(raw) {
      const text = String(raw || '').trim()
      const map = {
        未支付: PAY_UNPAID,
        已支付: PAY_PAID,
        待确认: ORDER_PENDING_CONFIRM,
        待生产: ORDER_PENDING_PRODUCE,
        生产中: ORDER_PRODUCING,
        已发货: ORDER_SHIPPED,
        已完成: ORDER_FINISHED,
        已取消: ORDER_CANCELED,
        UNPAID: PAY_UNPAID,
        PAID: PAY_PAID,
        WAIT_CONFIRM: ORDER_PENDING_CONFIRM,
        WAIT_PRODUCE: ORDER_PENDING_PRODUCE,
        PRODUCING: ORDER_PRODUCING,
        SHIPPED: ORDER_SHIPPED,
        DONE: ORDER_FINISHED,
        CANCELED: ORDER_CANCELED
      }
      return map[text] || text
    },
    statusKey(row) {
      const payStatus = this.normalizeStatus(row.payStatus)
      const orderStatus = this.normalizeStatus(row.orderStatus)
      if (orderStatus === ORDER_CANCELED) return 'canceled'
      if (payStatus === PAY_UNPAID) return 'unpaid'
      if (orderStatus === ORDER_FINISHED) return 'done'
      if (orderStatus === ORDER_SHIPPED) return 'shipping'
      if (PROGRESS_STATUS.includes(orderStatus)) return 'progress'
      return 'unknown'
    },
    statusLabel(row) {
      const key = this.statusKey(row)
      if (key === 'unpaid') return '待付款'
      if (key === 'progress') return '制作中'
      if (key === 'shipping') return '待收货'
      if (key === 'done') return '已完成'
      if (key === 'canceled') return '已取消'
      return '处理中'
    },
    flowIndex(row) {
      return FLOW_STEPS.findIndex((step) => step.value === this.normalizeStatus(row.orderStatus))
    },
    isFlowDone(row, idx) {
      const current = this.flowIndex(row)
      if (this.normalizeStatus(row.orderStatus) === ORDER_CANCELED) return false
      return current > idx
    },
    isFlowCurrent(row, idx) {
      const current = this.flowIndex(row)
      if (this.normalizeStatus(row.orderStatus) === ORDER_CANCELED) return false
      if (current < 0) return idx === 0
      return current === idx
    },
    canPay(row) {
      return this.normalizeStatus(row.payStatus) === PAY_UNPAID
    },
    canCancel(row) {
      return this.normalizeStatus(row.payStatus) === PAY_UNPAID && this.normalizeStatus(row.orderStatus) === ORDER_PENDING_CONFIRM
    },
    canConfirmReceipt(row) {
      if (!row) return false
      return this.normalizeStatus(row.payStatus) === PAY_PAID && this.normalizeStatus(row.orderStatus) === ORDER_SHIPPED
    },
    async load() {
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosorderPage,
        method: 'get',
        params: { page: 1, limit: 50 }
      })
      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '加载订单失败')
        return
      }

      const data = res.data || []
      const rows = Array.isArray(data) ? data : data.list || []
      this.list = rows.map((r) => {
        const normalized = {
          ...r,
          orderNo: r.orderNo || r.order_no || '',
          totalAmount: r.totalAmount || r.total_amount || 0,
          payStatus: this.normalizeStatus(r.payStatus || r.pay_status || PAY_UNPAID),
          orderStatus: this.normalizeStatus(r.orderStatus || r.order_status || ORDER_PENDING_CONFIRM),
          payType: r.payType || r.pay_type || '-',
          designerStatus: r.designerStatus || r.designer_status || '-',
          addressSnapshotJson: r.addressSnapshotJson || r.address_snapshot_json || '',
          bodyProfileSnapshotJson: r.bodyProfileSnapshotJson || r.body_profile_snapshot_json || ''
        }
        return { ...normalized, items: this.normalizeItems(normalized) }
      })
    },
    async goPay(row) {
      const orderNo = row.orderNo || row.order_no
      if (!orderNo) {
        this.$message.warning('订单号缺失')
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
        this.$message.warning('请先登录')
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
        this.$message.error((res && (res.msg || res.info)) || '创建支付订单失败')
        return
      }

      this.currentOrder = row
      this.payInfo = res.data || {}
      this.$message.success('支付订单已创建')
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

        if (!statusRes || statusRes.code !== 0) return
        const payStatusRaw = (statusRes.data && (statusRes.data.payStatus || statusRes.data.pay_status)) || ''
        const payStatus = this.normalizeStatus(payStatusRaw)
        if (payStatus === PAY_PAID) {
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
        this.$message.warning('订单号缺失')
        return
      }

      if (!this.currentOrder || (this.currentOrder.orderNo || this.currentOrder.order_no) !== rowOrderNo) {
        await this.goPay(row)
      }

      const payOrderNo = this.payInfo.payOrderNo || this.payInfo.pay_order_no
      if (!payOrderNo) {
        this.$message.warning('请先点击去支付')
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

      this.$message.success('模拟支付成功，正在刷新')
      this.startPoll(rowOrderNo)
    },
    async cancelOrder(row) {
      const orderId = row.id
      if (!orderId) {
        this.$message.warning('订单ID缺失')
        return
      }
      const ok = await this.$confirm('确认取消该订单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => true)
        .catch(() => false)

      if (!ok) return

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
    async confirmReceipt(row) {
      const orderId = row && row.id
      if (!orderId) {
        this.$message.warning('订单ID缺失')
        return
      }

      const ok = await this.$confirm('确认已收货吗？', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消订单',
        type: 'warning'
      })
        .then(() => true)
        .catch(() => false)

      if (!ok) return

      const res = await this.$proxy.Request({
        url: `${this.$proxy.Api.cosorderConfirmReceiptPrefix}${orderId}`,
        method: 'post',
        dataType: 'json',
        params: {}
      })

      if (!res || res.code !== 0) {
        this.$message.error((res && (res.msg || res.info)) || '确认收货失败')
        return
      }

      this.$message.success(res.msg || '已确认收货')
      this.load()
    },
    showItems(row) {
      this.currentItems = row.items || []
      this.itemsVisible = true
    },
    openDetail(row) {
      this.currentOrder = row
      this.detailVisible = true
    }
  }
}
</script>

<style scoped>
.order-page {
  --order-primary: #5264ff;
  --order-primary-deep: #3346da;
  --order-primary-soft: #edf1ff;
  --order-text-main: #24356d;
  --order-text-sub: #8591b4;
  --order-border: #e7edff;
  --order-shadow: 0 10px 24px rgba(68, 88, 150, 0.1);
  display: grid;
  gap: 14px;
}

.header-panel {
  border-radius: 16px;
  border: 1px solid var(--order-border);
  background: #fff;
  box-shadow: var(--order-shadow);
  padding: 16px;
  display: grid;
  gap: 12px;
}

.header-title h2 {
  color: var(--order-text-main);
  font-size: 26px;
}

.header-title p {
  margin-top: 6px;
  color: var(--order-text-sub);
}

.status-tabs {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.status-tab {
  border: 1px solid var(--order-border);
  background: #fff;
  color: #4b5f96;
  border-radius: 12px;
  height: 42px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.status-tab i {
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--order-primary-soft);
  color: #5163a0;
  font-style: normal;
  line-height: 18px;
  font-size: 12px;
  font-weight: 700;
}

.status-tab.active {
  border-color: rgba(82, 100, 255, 0.35);
  background: linear-gradient(140deg, #5264ff 0%, #7c8dff 100%);
  color: #fff;
  box-shadow: 0 12px 20px rgba(82, 100, 255, 0.25);
}

.status-tab.active i {
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
}

.order-list {
  display: grid;
  gap: 12px;
}

.order-card {
  border-radius: 16px;
  border: 1px solid var(--order-border);
  background: #fff;
  box-shadow: var(--order-shadow);
  padding: 14px;
  display: grid;
  gap: 12px;
}

.card-main {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.order-no {
  font-size: 16px;
  font-weight: 700;
  color: var(--order-text-main);
}

.order-meta {
  margin-top: 6px;
  color: var(--order-text-sub);
  font-size: 12px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.card-main-right {
  text-align: right;
  display: grid;
  justify-items: flex-end;
  gap: 6px;
}

.card-main-right strong {
  color: #1f2f66;
  font-size: 24px;
  line-height: 1;
}

.status-pill {
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 700;
}

.status-pill.unpaid {
  background: #fff3df;
  color: #b6750f;
}

.status-pill.progress {
  background: #ecf0ff;
  color: var(--order-primary-deep);
}

.status-pill.shipping {
  background: #ebf5ff;
  color: #2f6ca0;
}

.status-pill.done {
  background: #e9f9ef;
  color: #2f7a4c;
}

.status-pill.canceled {
  background: #f3f4f6;
  color: #7a859c;
}

.flow-panel {
  border-radius: 12px;
  background: #f8faff;
  border: 1px solid #eef2ff;
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.flow-step {
  position: relative;
  text-align: center;
  color: #8491b8;
}

.flow-step .dot {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  margin: 0 auto;
  border: 1px solid #dce4ff;
  background: #fff;
  line-height: 24px;
  font-size: 12px;
  font-weight: 700;
}

.flow-step .label {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 600;
}

.flow-step::after {
  content: '';
  position: absolute;
  top: 12px;
  left: calc(50% + 17px);
  width: calc(100% - 24px);
  height: 2px;
  background: #dfe5ff;
}

.flow-step:last-child::after {
  display: none;
}

.flow-step.done .dot,
.flow-step.current .dot {
  border-color: transparent;
  background: linear-gradient(140deg, #5264ff 0%, #7c8dff 100%);
  color: #fff;
}

.flow-step.done,
.flow-step.current {
  color: #3950a2;
}

.flow-step.done::after {
  background: linear-gradient(140deg, #5264ff 0%, #7c8dff 100%);
}

.goods-panel {
  border: 1px solid #edf1ff;
  border-radius: 12px;
  padding: 10px;
  background: #fcfdff;
}

.goods-row {
  display: grid;
  grid-template-columns: 1fr 70px 110px;
  gap: 10px;
  align-items: center;
  color: #536291;
  font-size: 13px;
}

.goods-row + .goods-row {
  margin-top: 8px;
}

.goods-name small {
  color: #8e99bb;
  font-size: 12px;
}

.goods-qty {
  text-align: right;
}

.goods-amount {
  text-align: right;
  color: #2f4489;
  font-weight: 600;
}

.toggle-btn {
  margin-top: 6px;
  padding: 0;
}

.empty-goods {
  border-radius: 10px;
  border: 1px dashed #e5ebff;
  color: #93a0c4;
  font-size: 13px;
  padding: 10px;
}

.action-row {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-box {
  padding: 0 4px;
  display: grid;
  gap: 8px;
}

.detail-box p {
  color: #4f5f8f;
}

.detail-box strong {
  color: #273973;
}

.detail-flow {
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.detail-flow span {
  font-size: 12px;
  color: #4b5f95;
  border-radius: 999px;
  background: #edf1ff;
  padding: 4px 10px;
}

@media (max-width: 900px) {
  .status-tabs,
  .flow-panel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .card-main {
    flex-direction: column;
  }

  .card-main-right {
    justify-items: flex-start;
    text-align: left;
  }

  .goods-row {
    grid-template-columns: 1fr;
    gap: 2px;
  }

  .goods-qty,
  .goods-amount {
    text-align: left;
  }

  .action-row {
    justify-content: flex-start;
  }
}
</style>