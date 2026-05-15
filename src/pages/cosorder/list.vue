<template>
  <div class="order-page">
    <section class="header-panel">
      <div class="header-title">
        <h2>我的订单</h2>
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
            <el-button plain size="mini" @click="cancelOrder(row)" v-if="canCancel(row)">取消订单</el-button>
            <el-button size="mini" @click="openDetail(row)">查看详情</el-button>
          </template>
          <template v-else>
            <el-button v-if="canConfirmReceipt(row)" type="primary" size="mini" @click="confirmReceipt(row)">确认收货</el-button>
            <el-button type="primary" plain size="mini" @click="openDetail(row)">查看详情</el-button>
            <el-button v-if="canCommunicate(row)" size="mini" @click="openCommunication(row)">订单沟通</el-button>
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

    <el-dialog
      :title="`${payChannelLabel}扫码支付`"
      :visible.sync="payDialogVisible"
      width="560px"
      custom-class="pay-demo-dialog"
      @closed="handlePayDialogClosed"
    >
      <div v-if="currentOrder" class="pay-dialog-body">
        <div class="pay-hero">
          <div>
            <span class="pay-kicker">ORDER PAYMENT</span>
            <h3>请使用{{ payChannelLabel }}扫码完成支付</h3>
          </div>
          <strong>￥{{ formatMoney(currentOrder.totalAmount) }}</strong>
        </div>

        <div class="pay-content-grid">
          <div class="pay-qr-card">
            <img :src="payQrUrl" :alt="`${payChannelLabel}收款码`" />
            <span>{{ payChannelLabel }}收款码</span>
          </div>

          <div class="pay-info-card">
            <div class="pay-info-row">
              <span>订单号</span>
              <b>{{ currentOrder.orderNo || '-' }}</b>
            </div>
            <div class="pay-info-row">
              <span>支付单号</span>
              <b>{{ payOrderNo || '-' }}</b>
            </div>
            <div class="pay-info-row">
              <span>支付方式</span>
              <b>{{ payChannelLabel }}</b>
            </div>
            <div class="pay-info-row">
              <span>有效期至</span>
              <b>{{ payExpireTime || '-' }}</b>
            </div>
          </div>
        </div>


      </div>
      <span slot="footer">
        <el-button @click="payDialogVisible = false">稍后支付</el-button>
        <el-button type="primary" :loading="payConfirming" @click="confirmPayComplete">
          我已完成支付
        </el-button>
      </span>
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
        <div class="detail-actions">
          <el-button size="mini" @click="showItems(currentOrder)">查看商品</el-button>
          <el-button v-if="canCommunicate(currentOrder)" type="primary" plain size="mini" @click="openCommunication(currentOrder)">前往沟通页</el-button>
        </div>
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
      commTab: 'messages',
      commMessages: [],
      commDelivery: [],
      commDraft: '',
      commSending: false,
      payInfo: {},
      payDialogVisible: false,
      payConfirming: false,
      selectedPayChannel: 'WECHAT',
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
    },
    normalizedPayChannel() {
      const channel = String(this.selectedPayChannel || '').trim().toUpperCase()
      return channel === 'ALIPAY' ? 'ALIPAY' : 'WECHAT'
    },
    payChannelLabel() {
      return this.normalizedPayChannel === 'ALIPAY' ? '支付宝' : '微信'
    },
    payQrUrl() {
      const fileName = this.normalizedPayChannel === 'ALIPAY' ? 'zfb.jpg' : 'wx.jpg'
      return `${String(this.$config.baseUrl || '').replace(/\/+$/, '')}/upload/pay/${fileName}`
    },
    payOrderNo() {
      return this.payInfo.payOrderNo || this.payInfo.pay_order_no || ''
    },
    payExpireTime() {
      const value = this.payInfo.expireTime || this.payInfo.expire_time || ''
      return value ? String(value).replace('T', ' ') : ''
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
      if (text === 'MOCK') return '微信'
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
    canCommunicate(row) {
      if (!row) return false
      return this.normalizeStatus(row.payStatus) === PAY_PAID && this.normalizeStatus(row.orderStatus) !== ORDER_CANCELED
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
      this.selectedPayChannel = this.resolvePayChannel(row)

      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosPayCreate,
        method: 'post',
        dataType: 'json',
        params: {
          orderNo,
          userId,
          userTable,
          payChannel: this.normalizedPayChannel.toLowerCase()
        }
      })

      if (!res || res.code !== 0) {
        this.$message.error((res && (res.msg || res.info)) || '创建支付订单失败')
        return
      }

      this.currentOrder = row
      this.payInfo = res.data || {}
      this.$message.success('支付订单已创建')
      this.payDialogVisible = true
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
          this.payDialogVisible = false
          await this.load()
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
    resolvePayChannel(row) {
      const raw = String((row && (row.payType || row.pay_type)) || '').trim().toUpperCase()
      return raw === 'ALIPAY' ? 'ALIPAY' : 'WECHAT'
    },
    handlePayDialogClosed() {
      this.payConfirming = false
      this.stopPoll()
    },
    async confirmPayComplete() {
      if (this.payConfirming) return
      const rowOrderNo = this.currentOrder && (this.currentOrder.orderNo || this.currentOrder.order_no)
      const payOrderNo = this.payOrderNo
      if (!payOrderNo) {
        this.$message.warning('支付单号缺失，请重新发起支付')
        return
      }
      if (!rowOrderNo) {
        this.$message.warning('订单号缺失')
        return
      }

      this.payConfirming = true
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosPayMockSuccess,
        method: 'post',
        params: { payOrderNo }
      })
      this.payConfirming = false

      if (!res || res.code !== 0) {
        this.$message.error((res && (res.msg || res.info)) || '支付确认失败')
        return
      }

      this.$message.success('支付确认成功，正在刷新订单状态')
      this.payDialogVisible = false
      this.stopPoll()
      await this.load()
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
    getCommSessionList() {
      return this.list.filter((row) => row && row.id)
    },
    selectCommSession(row) {
      if (!row || !row.id) return
      this.currentOrder = row
      this.commTab = 'messages'
      this.commDraft = ''
      this.loadCommData()
    },
    currentCommPartnerName() {
      const row = this.currentOrder || {}
      return row.designerName || row.designer_name || '设计师'
    },
    commAvatarText(row) {
      const base = String((row && (row.orderNo || row.order_no || row.id)) || '会话')
      return base.slice(-2)
    },
    commSessionTitle(row) {
      return row.orderNo || row.order_no || `订单${row.id}`
    },
    commSessionStatus(row) {
      return this.statusLabel(row)
    },
    commSessionPreview(row) {
      if (this.currentOrder && row.id === this.currentOrder.id && this.commMessages.length) {
        const last = this.commMessages[this.commMessages.length - 1]
        const prefix = last.senderName || this.roleText(last.senderRole)
        return `${prefix}：${last.content}`
      }
      if (row.designerStatus && row.designerStatus !== '-') {
        return `设计师状态：${row.designerStatus}`
      }
      return '可在这里和设计师确认定制细节'
    },
    commSessionTime(row) {
      return row.addtime || '-'
    },
    commRoleBadge(role) {
      const text = String(role || '').toUpperCase()
      if (text === 'USER') return '我'
      if (text === 'DESIGNER') return '设'
      return '聊'
    },
    messageTime(value) {
      const text = String(value || '')
      if (!text) return '--:--'
      return text.length >= 16 ? text.slice(11, 16) : text
    },
    messageDayKey(value) {
      const text = String(value || '')
      return text.length >= 10 ? text.slice(0, 10) : text || '未知时间'
    },
    messageDayLabel(value) {
      return this.messageDayKey(value) || '最近消息'
    },
    showCommDateDivider(index) {
      if (index === 0) return true
      return this.messageDayKey(this.commMessages[index].addtime) !== this.messageDayKey(this.commMessages[index - 1].addtime)
    },
    normalizeCommMessages(rows = []) {
      return rows.map((row) => ({
        id: row.id,
        senderRole: row.senderRole || row.sender_role || '',
        senderName: row.senderName || row.sender_name || '',
        content: row.content || '',
        addtime: row.addtime || row.addTime || ''
      }))
    },
    roleText(role) {
      const text = String(role || '').toUpperCase()
      if (text === 'DESIGNER') return '设计师'
      if (text === 'USER') return '用户'
      return role || '-'
    },
    isMineCommMessage(msg) {
      return String(msg.senderRole || '').toUpperCase() === 'USER'
    },
    async loadCommData() {
      const orderId = this.currentOrder && this.currentOrder.id
      if (!orderId) {
        this.commMessages = []
        this.commDelivery = []
        return
      }

      const [msgRes, deliveryRes] = await Promise.all([
        this.$proxy.Request({
          url: this.$proxy.Api.cosorderCommMessagePage,
          method: 'get',
          showLoading: false,
          showError: false,
          params: { orderId, page: 1, limit: 200 }
        }),
        this.$proxy.Request({
          url: this.$proxy.Api.cosorderCommDelivery,
          method: 'get',
          showLoading: false,
          showError: false,
          params: { orderId }
        })
      ])

      this.commMessages = msgRes && msgRes.code === 0 ? this.normalizeCommMessages((msgRes.data && msgRes.data.list) || []) : []
      this.commDelivery = deliveryRes && deliveryRes.code === 0 ? (deliveryRes.data || []) : []
    },
    async sendCommMessage() {
      const orderId = this.currentOrder && this.currentOrder.id
      if (!orderId) {
        this.$message.warning('订单ID缺失')
        return
      }
      if (!this.commDraft) {
        this.$message.warning('请输入消息内容')
        return
      }

      this.commSending = true
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosorderCommSend,
        method: 'post',
        dataType: 'json',
        showError: false,
        params: {
          orderId,
          content: this.commDraft,
          messageType: 'TEXT'
        }
      })
      this.commSending = false

      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '消息发送失败')
        return
      }

      this.commDraft = ''
      await this.loadCommData()
    },
    handleCommKeydown(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        this.sendCommMessage()
      }
    },
    openDetail(row) {
      this.currentOrder = row
      this.detailVisible = true
    },
    openCommunication(row) {
      const orderId = row && row.id
      if (!orderId) {
        this.$message.warning('订单ID缺失')
        return
      }
      this.$router.push({ path: '/index/cosorder-comm', query: { orderId } })
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

.detail-actions {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

::v-deep .pay-demo-dialog {
  border-radius: 20px;
  overflow: hidden;
}

::v-deep .pay-demo-dialog .el-dialog__header {
  padding: 18px 22px 12px;
  background: #f8faff;
  border-bottom: 1px solid #e7edff;
}

::v-deep .pay-demo-dialog .el-dialog__body {
  padding: 22px;
}

.pay-dialog-body {
  display: grid;
  gap: 18px;
}

.pay-hero {
  border-radius: 18px;
  padding: 18px;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  color: #fff;
  background:
    linear-gradient(135deg, rgba(15, 26, 64, 0.92), rgba(46, 73, 150, 0.86)),
    repeating-linear-gradient(135deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 14px);
}

.pay-kicker {
  display: inline-flex;
  color: rgba(255, 255, 255, 0.68);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
}

.pay-hero h3 {
  margin: 8px 0 0;
  font-size: 20px;
  line-height: 1.35;
}

.pay-hero p {
  margin-top: 8px;
  max-width: 310px;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.7;
  font-size: 13px;
}

.pay-hero strong {
  white-space: nowrap;
  font-size: 26px;
  line-height: 1;
}

.pay-content-grid {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 16px;
  align-items: stretch;
}

.pay-qr-card,
.pay-info-card {
  border-radius: 18px;
  border: 1px solid #e8edff;
  background: #fff;
  box-shadow: 0 12px 26px rgba(77, 96, 160, 0.08);
}

.pay-qr-card {
  padding: 16px;
  display: grid;
  place-items: center;
  gap: 10px;
}

.pay-qr-card img {
  width: 176px;
  height: 176px;
  object-fit: contain;
  border-radius: 12px;
  background: #f6f8ff;
}

.pay-qr-card span {
  color: #33467c;
  font-weight: 700;
}

.pay-info-card {
  padding: 14px 16px;
  display: grid;
  gap: 11px;
  align-content: center;
}

.pay-info-row {
  display: grid;
  gap: 4px;
}

.pay-info-row span {
  color: #8995b7;
  font-size: 12px;
}

.pay-info-row b {
  color: #283973;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-all;
}

.detail-comm {
  margin-top: 12px;
}

.comm-shell {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  min-height: 560px;
  border: 1px solid var(--order-border);
  border-radius: 24px;
  background:
    radial-gradient(circle at top left, rgba(110, 126, 255, 0.16), transparent 38%),
    linear-gradient(180deg, #f9fbff 0%, #f3f6ff 100%);
  box-shadow: 0 18px 42px rgba(75, 95, 171, 0.12);
  overflow: hidden;
}

.comm-sidebar {
  display: grid;
  grid-template-rows: auto auto 1fr;
  gap: 14px;
  padding: 22px 18px;
  background: rgba(255, 255, 255, 0.84);
  border-right: 1px solid rgba(109, 126, 233, 0.12);
  backdrop-filter: blur(10px);
}

.comm-sidebar-head,
.comm-chat-head,
.comm-delivery-head,
.delivery-topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.comm-kicker {
  margin: 0;
  color: #8c98bc;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.comm-sidebar-head h3,
.comm-chat-head h3,
.comm-delivery-head h4 {
  margin: 6px 0 0;
  color: var(--order-text-main);
}

.comm-count {
  min-width: 34px;
  height: 34px;
  padding: 0 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--order-primary-deep);
  background: var(--order-primary-soft);
  font-weight: 700;
}

.comm-sidebar-tip,
.comm-chat-sub,
.comm-delivery-head p {
  color: #7f8cb2;
  font-size: 13px;
  line-height: 1.7;
}

.comm-session-list {
  display: grid;
  gap: 10px;
  align-content: start;
  overflow-y: auto;
  padding-right: 4px;
}

.comm-session-item {
  width: 100%;
  border: 1px solid transparent;
  border-radius: 18px;
  background: rgba(240, 244, 255, 0.88);
  padding: 14px 12px;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  gap: 12px;
  text-align: left;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.comm-session-item:hover,
.comm-session-item.active {
  transform: translateY(-1px);
  border-color: rgba(92, 109, 233, 0.22);
  box-shadow: 0 14px 28px rgba(87, 107, 186, 0.12);
  background: #ffffff;
}

.comm-avatar,
.comm-badge {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #596cff 0%, #8fa4ff 100%);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 10px 20px rgba(89, 108, 255, 0.22);
}

.comm-session-copy {
  min-width: 0;
  display: grid;
  gap: 6px;
}

.comm-session-copy strong,
.comm-message-name,
.delivery-card strong {
  color: var(--order-text-main);
}

.comm-session-copy small,
.delivery-desc,
.delivery-meta {
  color: #7c89af;
  line-height: 1.6;
}

.comm-session-copy small {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.comm-session-copy em {
  font-style: normal;
  color: var(--order-primary-deep);
  font-size: 12px;
}

.comm-session-time,
.comm-message-time {
  color: #9ba7c6;
  font-size: 12px;
  white-space: nowrap;
}

.comm-chat-panel {
  min-width: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  background: rgba(255, 255, 255, 0.68);
}

.comm-chat-head {
  padding: 22px 26px 18px;
  border-bottom: 1px solid rgba(109, 126, 233, 0.12);
}

.comm-mode-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border-radius: 999px;
  background: rgba(236, 241, 255, 0.92);
}

.comm-mode-btn {
  border: 0;
  background: transparent;
  color: #6677a6;
  font-size: 13px;
  padding: 9px 16px;
  border-radius: 999px;
  cursor: pointer;
}

.comm-mode-btn.active {
  background: linear-gradient(135deg, #5d6dff 0%, #7b8cff 100%);
  color: #fff;
  box-shadow: 0 10px 18px rgba(93, 109, 255, 0.2);
}

.comm-chat-main,
.comm-delivery-panel {
  min-height: 0;
  display: grid;
}

.comm-chat-main {
  grid-template-rows: minmax(0, 1fr) auto;
}

.comm-message-list,
.delivery-list {
  min-height: 0;
  overflow-y: auto;
  padding: 22px 26px 18px;
}

.comm-message-list {
  display: grid;
  gap: 14px;
  align-content: start;
}

.comm-date-divider {
  display: flex;
  justify-content: center;
}

.comm-date-divider span {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(229, 235, 255, 0.9);
  color: #7b88ac;
  font-size: 12px;
}

.comm-message-row {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.comm-message-row.mine {
  justify-content: flex-end;
}

.comm-message-row.mine .comm-bubble-wrap {
  align-items: flex-end;
}

.comm-message-row.mine .comm-bubble {
  border-radius: 22px 22px 8px 22px;
  background: linear-gradient(135deg, #5668ff 0%, #7c90ff 100%);
  color: #fff;
  box-shadow: 0 16px 26px rgba(93, 109, 255, 0.2);
}

.comm-bubble-wrap {
  max-width: min(78%, 520px);
  display: grid;
  gap: 6px;
}

.comm-message-name {
  font-size: 12px;
}

.comm-bubble {
  border-radius: 22px 22px 22px 8px;
  padding: 14px 16px;
  background: #ffffff;
  color: #33467c;
  line-height: 1.7;
  word-break: break-word;
  box-shadow: 0 12px 26px rgba(109, 126, 185, 0.08);
}

.comm-composer {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 12px;
  align-items: end;
  padding: 18px 26px 24px;
  border-top: 1px solid rgba(109, 126, 233, 0.12);
  background: rgba(255, 255, 255, 0.82);
}

.comm-refresh-btn,
.comm-send-btn {
  border: 0;
  cursor: pointer;
}

.comm-refresh-btn {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  color: var(--order-primary-deep);
  background: var(--order-primary-soft);
}

.comm-input-box {
  min-width: 0;
  border-radius: 22px;
  background: rgba(241, 244, 255, 0.96);
  box-shadow: inset 0 0 0 1px rgba(112, 130, 234, 0.14);
  padding: 14px 16px 10px;
}

.comm-input-box textarea {
  width: 100%;
  min-height: 84px;
  max-height: 140px;
  border: 0;
  outline: none;
  resize: none;
  background: transparent;
  color: var(--order-text-main);
  line-height: 1.7;
  font-size: 14px;
}

.comm-input-box textarea::placeholder {
  color: #97a3c3;
}

.comm-input-foot {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: #96a2c1;
  font-size: 12px;
}

.comm-send-btn {
  min-width: 84px;
  height: 50px;
  padding: 0 18px;
  border-radius: 16px;
  background: linear-gradient(135deg, #5567ff 0%, #7c91ff 100%);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 18px 28px rgba(91, 108, 255, 0.22);
}

.comm-send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.comm-delivery-panel {
  grid-template-rows: auto minmax(0, 1fr);
}

.comm-delivery-head {
  padding: 22px 26px 0;
}

.delivery-list {
  display: grid;
  gap: 14px;
  align-content: start;
}

.delivery-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.delivery-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 14px;
  flex-shrink: 0;
}

.delivery-dot.status {
  background: #6d7ff1;
  box-shadow: 0 0 0 6px rgba(109, 127, 241, 0.14);
}

.delivery-dot.delivery {
  background: #2ab47d;
  box-shadow: 0 0 0 6px rgba(42, 180, 125, 0.14);
}

.delivery-card {
  flex: 1;
  border-radius: 18px;
  padding: 16px 18px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 22px rgba(104, 121, 183, 0.08);
}

.delivery-desc {
  margin-top: 8px;
}

.delivery-meta {
  margin-top: 8px;
  font-size: 12px;
}

@media (max-width: 900px) {
  .comm-shell {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .comm-sidebar {
    border-right: 0;
    border-bottom: 1px solid rgba(109, 126, 233, 0.12);
  }

  .comm-session-list {
    max-height: 260px;
  }

  .comm-chat-head,
  .comm-composer,
  .comm-delivery-head {
    padding-left: 18px;
    padding-right: 18px;
  }

  .comm-message-list,
  .delivery-list {
    padding-left: 18px;
    padding-right: 18px;
  }

  .comm-chat-head,
  .comm-composer {
    grid-template-columns: 1fr;
  }

  .comm-mode-switch {
    width: 100%;
    justify-content: space-between;
  }

  .comm-mode-btn {
    flex: 1;
  }

  .comm-composer {
    grid-template-columns: 1fr;
  }

  .comm-refresh-btn,
  .comm-send-btn {
    width: 100%;
  }

  .comm-bubble-wrap {
    max-width: 100%;
  }
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
