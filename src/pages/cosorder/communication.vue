<template>
  <div class="order-communication-page">
    <section class="comm-header-card">
      <div class="comm-header-copy">
        <div class="header-topline">
          <el-button type="text" icon="el-icon-arrow-left" class="back-button" @click="$router.push('/index/cosorder')">
            返回我的订单
          </el-button>
          <span class="header-kicker">订单履约沟通中心</span>
        </div>
        <h2>订单沟通</h2>
        <p>围绕订单与设计师即时沟通，统一查看制作进度、发货备注和历史记录。</p>
      </div>
      <div class="header-side">
        <div class="summary-chip">
          <strong>{{ visibleSessions.length }}</strong>
          <span>可沟通订单</span>
        </div>
        <el-button size="small" icon="el-icon-refresh" :loading="sessionLoading" @click="refreshCurrent">刷新</el-button>
      </div>
    </section>

    <el-empty
      v-if="!isUser"
      description="当前角色不可使用订单沟通页面"
      :image-size="96"
    />

    <section v-else class="comm-layout">
      <aside class="comm-sidebar panel-card">
        <div class="sidebar-search">
          <i class="el-icon-search" />
          <input
            v-model.trim="keyword"
            type="text"
            placeholder="搜索订单号"
            @keyup.enter="loadSessions(false)"
          />
        </div>

        <div class="sidebar-filter-row">
          <button
            v-for="tab in statusTabs"
            :key="tab.value"
            type="button"
            :class="['status-filter', { active: activeFilter === tab.value }]"
            @click="activeFilter = tab.value"
          >
            <span>{{ tab.label }}</span>
            <i>{{ tab.count }}</i>
          </button>
        </div>

        <div v-if="visibleSessions.length" class="session-list">
          <button
            v-for="item in visibleSessions"
            :key="item.orderId"
            type="button"
            :class="['session-card', { active: selectedSession && selectedSession.orderId === item.orderId }]"
            @click="selectSession(item)"
          >
            <span class="session-avatar">{{ sessionAvatar(item) }}</span>
            <span class="session-copy">
              <span class="session-topline">
                <strong>{{ item.orderNo || `订单${item.orderId}` }}</strong>
                <b>{{ sessionTime(item) }}</b>
              </span>
              <small>{{ sessionPreview(item) }}</small>
              <em>{{ sessionStateText(item) }}</em>
            </span>
          </button>
        </div>
        <el-empty v-else description="暂无可沟通订单" :image-size="84" />
      </aside>

      <main class="comm-main panel-card" v-if="selectedSession">
        <header class="comm-main-header">
          <div class="main-header-copy">
            <p class="header-kicker">订单 {{ selectedSession.orderNo || selectedSession.orderId }}</p>
            <div class="main-title-row">
              <h3>{{ sessionHeaderTitle }}</h3>
              <span :class="['state-pill', statusKey(selectedSession)]">{{ sessionStateText(selectedSession) }}</span>
            </div>
            <div class="header-meta">
              <span>设计师状态：{{ selectedSession.designerStatus || '待接单' }}</span>
              <span>最近更新：{{ sessionTime(selectedSession) }}</span>
            </div>
          </div>
          <div class="mode-switch">
            <button
              type="button"
              :class="['mode-btn', { active: activePane === 'messages' }]"
              @click="activePane = 'messages'"
            >
              沟通消息
            </button>
            <button
              type="button"
              :class="['mode-btn', { active: activePane === 'delivery' }]"
              @click="activePane = 'delivery'"
            >
              交付记录
            </button>
          </div>
        </header>

        <section v-if="activePane === 'messages'" class="chat-stage">
          <div v-if="messages.length" ref="messageList" class="message-list">
            <template v-for="(msg, idx) in messages">
              <div v-if="showDateDivider(idx)" :key="`day-${msg.id || idx}`" class="date-divider">
                <span>{{ messageDayLabel(msg.addtime) }}</span>
              </div>
              <div :key="msg.id || `msg-${idx}`" :class="['bubble-row', { mine: isMine(msg) }]">
                <span v-if="!isMine(msg)" class="bubble-avatar">{{ roleBadge(msg.senderRole) }}</span>
                <div class="bubble-stack">
                  <div class="bubble-name">{{ msg.senderName || roleText(msg.senderRole) }}</div>
                  <div class="bubble-card">{{ msg.content }}</div>
                  <div class="bubble-time">{{ messageTime(msg.addtime) }}</div>
                </div>
              </div>
            </template>
          </div>
          <el-empty v-else description="暂无沟通消息，发送第一条消息开始协作" :image-size="84" />

          <div class="composer">
            <button type="button" class="icon-button" @click="loadCurrentDetail">
              <i class="el-icon-refresh" />
            </button>
            <div class="composer-box">
              <textarea
                v-model.trim="draftMessage"
                maxlength="500"
                placeholder="输入想确认的定制细节，回车发送，Shift + 回车换行"
                @keydown="handleMessageKeydown"
              />
              <div class="composer-foot">
                <span>当前消息围绕订单留档，方便后续回看。</span>
                <span>{{ draftMessage.length }}/500</span>
              </div>
            </div>
            <button type="button" class="send-button" :disabled="sendLoading" @click="sendMessage">
              {{ sendLoading ? '发送中' : '发送' }}
            </button>
          </div>
        </section>

        <section v-else class="delivery-stage">
          <div class="delivery-head">
            <div>
              <h4>交付记录</h4>
              <p>统一查看状态流转、发货备注与关键节点说明。</p>
            </div>
            <el-button type="text" @click="loadDelivery">刷新记录</el-button>
          </div>

          <div v-if="deliveryList.length" class="delivery-list">
            <div v-for="(item, idx) in deliveryList" :key="`${item.time}-${idx}`" class="delivery-item">
              <span class="delivery-dot" :class="item.type === 'DELIVERY' ? 'delivery' : 'status'" />
              <div class="delivery-card">
                <div class="delivery-topline">
                  <strong>{{ item.title || '-' }}</strong>
                  <span>{{ item.time || '-' }}</span>
                </div>
                <p>{{ item.content || '-' }}</p>
                <div class="delivery-meta">{{ item.operatorRole || '-' }} · {{ item.operatorName || '-' }}</div>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无交付记录" :image-size="84" />
        </section>
      </main>

      <aside class="comm-side-info panel-card" v-if="selectedSession">
        <section class="info-card info-highlight">
          <span class="info-label">当前订单</span>
          <h4>{{ selectedSession.orderNo || `订单${selectedSession.orderId}` }}</h4>
          <p>{{ sessionPreview(selectedSession) }}</p>
          <div class="info-tag-row">
            <span :class="['mini-tag', statusKey(selectedSession)]">{{ sessionStateText(selectedSession) }}</span>
            <span class="mini-tag neutral">{{ selectedSession.designerStatus || '待接单' }}</span>
          </div>
        </section>

        <section class="info-card">
          <div class="info-head">
            <span class="info-label">履约概览</span>
            <span class="info-progress">{{ progressPercent(selectedSession) }}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-bar" :style="{ width: `${progressPercent(selectedSession)}%` }" />
          </div>
          <ul class="info-list">
            <li>
              <span>付款状态</span>
              <strong>{{ payStatusText(selectedSession) }}</strong>
            </li>
            <li>
              <span>订单状态</span>
              <strong>{{ sessionStateText(selectedSession) }}</strong>
            </li>
            <li>
              <span>设计师状态</span>
              <strong>{{ selectedSession.designerStatus || '待接单' }}</strong>
            </li>
            <li>
              <span>最近更新</span>
              <strong>{{ sessionTime(selectedSession) }}</strong>
            </li>
          </ul>
        </section>

        <section class="info-card">
          <div class="info-head">
            <span class="info-label">最近交付</span>
          </div>
          <div v-if="latestDelivery" class="delivery-brief">
            <strong>{{ latestDelivery.title || '-' }}</strong>
            <p>{{ latestDelivery.content || '-' }}</p>
            <span>{{ latestDelivery.time || '-' }}</span>
          </div>
          <el-empty v-else description="暂无交付摘要" :image-size="70" />
        </section>

        <section class="info-card quick-card">
          <div class="info-head">
            <span class="info-label">快捷操作</span>
          </div>
          <el-button size="small" plain @click="$router.push('/index/cosorder')">返回订单列表</el-button>
          <el-button size="small" plain @click="activePane = 'delivery'">查看交付记录</el-button>
          <el-button size="small" type="primary" plain @click="activePane = 'messages'">继续沟通</el-button>
        </section>
      </aside>

      <section v-else class="comm-empty panel-card">
        <el-empty description="请从左侧选择一个订单会话" :image-size="96" />
      </section>
    </section>
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

export default {
  name: 'CosorderCommunication',
  data() {
    return {
      keyword: '',
      activeFilter: 'all',
      sessionList: [],
      selectedSession: null,
      messages: [],
      deliveryList: [],
      draftMessage: '',
      activePane: 'messages',
      sessionLoading: false,
      detailLoading: false,
      sendLoading: false,
      pollTimer: null,
      pollLoading: false
    }
  },
  computed: {
    isUser() {
      const tableName = localStorage.getItem('sessionTable') || localStorage.getItem('UserTableName') || ''
      return tableName === 'yonghu'
    },
    currentRole() {
      return 'USER'
    },
    visibleSessions() {
      return this.sessionList.filter((item) => {
        if (!this.canCommunicate(item)) return false
        if (this.activeFilter === 'progress') return this.statusKey(item) === 'progress'
        if (this.activeFilter === 'shipping') return this.statusKey(item) === 'shipping'
        if (this.activeFilter === 'done') return this.statusKey(item) === 'done'
        return true
      })
    },
    statusTabs() {
      const list = this.sessionList.filter((item) => this.canCommunicate(item))
      return [
        { label: '全部', value: 'all', count: list.length },
        { label: '制作中', value: 'progress', count: list.filter((item) => this.statusKey(item) === 'progress').length },
        { label: '待收货', value: 'shipping', count: list.filter((item) => this.statusKey(item) === 'shipping').length },
        { label: '已完成', value: 'done', count: list.filter((item) => this.statusKey(item) === 'done').length }
      ]
    },
    sessionHeaderTitle() {
      if (!this.selectedSession) return '订单沟通'
      return this.selectedSession.designerId ? '与设计师协作中' : '等待设计师接单'
    },
    latestDelivery() {
      return this.deliveryList.length ? this.deliveryList[this.deliveryList.length - 1] : null
    }
  },
  watch: {
    '$route.query.orderId'() {
      this.syncSelection(true)
    }
  },
  created() {
    if (this.isUser) {
      this.loadSessions(false)
    }
  },
  beforeDestroy() {
    this.stopPoll()
  },
  methods: {
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
      if ([ORDER_PENDING_CONFIRM, ORDER_PENDING_PRODUCE, ORDER_PRODUCING].includes(orderStatus)) return 'progress'
      return 'unknown'
    },
    payStatusText(row) {
      return this.normalizeStatus(row.payStatus) === PAY_PAID ? '已支付' : '未支付'
    },
    progressPercent(row) {
      const key = this.statusKey(row)
      if (key === 'done') return 100
      if (key === 'shipping') return 80
      if (key === 'progress') return 56
      return 24
    },
    canCommunicate(row) {
      return this.normalizeStatus(row.payStatus) === PAY_PAID && this.normalizeStatus(row.orderStatus) !== ORDER_CANCELED
    },
    sessionStateText(row) {
      const key = this.statusKey(row)
      if (key === 'progress') return '制作中'
      if (key === 'shipping') return '待收货'
      if (key === 'done') return '已完成'
      return row.orderStatus || '-'
    },
    normalizeSessionRows(rows = []) {
      return rows.map((row) => ({
        orderId: row.orderId || row.order_id || row.id,
        orderNo: row.orderNo || row.order_no || '',
        userId: row.userId || row.user_id || '',
        designerId: row.designerId || row.designer_id || '',
        payStatus: this.normalizeStatus(row.payStatus || row.pay_status || PAY_UNPAID),
        orderStatus: this.normalizeStatus(row.orderStatus || row.order_status || ORDER_PENDING_CONFIRM),
        designerStatus: row.designerStatus || row.designer_status || '',
        orderTime: row.orderTime || row.order_time || row.addtime || '',
        designerTakeTime: row.designerTakeTime || row.designer_take_time || '',
        lastMessage: row.lastMessage || row.last_message || '',
        lastMessageTime: row.lastMessageTime || row.last_message_time || ''
      }))
    },
    normalizeMessageRows(rows = []) {
      return rows.map((row) => ({
        id: row.id,
        senderRole: row.senderRole || row.sender_role || '',
        senderName: row.senderName || row.sender_name || '',
        content: row.content || '',
        messageType: row.messageType || row.message_type || 'TEXT',
        addtime: row.addtime || row.addTime || ''
      }))
    },
    roleText(role) {
      const text = String(role || '').toUpperCase()
      if (text === 'DESIGNER') return '设计师'
      if (text === 'USER') return '我'
      return role || '-'
    },
    roleBadge(role) {
      const text = String(role || '').toUpperCase()
      if (text === 'DESIGNER') return '设'
      if (text === 'USER') return '我'
      return '聊'
    },
    isMine(msg) {
      return String(msg.senderRole || '').toUpperCase() === this.currentRole
    },
    sessionAvatar(item) {
      return String(item.orderNo || item.orderId || '会话').slice(-2)
    },
    sessionPreview(item) {
      if (item.lastMessage) return item.lastMessage
      if (item.designerStatus) return `设计师状态：${item.designerStatus}`
      return '可在这里与设计师确认定制细节'
    },
    sessionTime(item) {
      return item.lastMessageTime || item.designerTakeTime || item.orderTime || '-'
    },
    messageTime(value) {
      const text = String(value || '')
      if (!text) return '--:--'
      return text.length >= 16 ? text.slice(11, 16) : text
    },
    messageDayKey(value) {
      const text = String(value || '')
      return text.length >= 10 ? text.slice(0, 10) : text || '最近消息'
    },
    messageDayLabel(value) {
      return this.messageDayKey(value)
    },
    showDateDivider(index) {
      if (index === 0) return true
      return this.messageDayKey(this.messages[index].addtime) !== this.messageDayKey(this.messages[index - 1].addtime)
    },
    async loadSessions(preserveCurrent = true) {
      this.sessionLoading = true
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosorderCommSessionPage,
        method: 'get',
        showLoading: false,
        showError: false,
        params: {
          page: 1,
          limit: 100,
          keyword: this.keyword || undefined
        }
      })
      this.sessionLoading = false

      if (!res || res.code !== 0) {
        this.$message.warning((res && res.msg) || '会话数据加载失败')
        this.sessionList = []
        this.selectedSession = null
        this.messages = []
        this.deliveryList = []
        return
      }

      this.sessionList = this.normalizeSessionRows((res.data && res.data.list) || [])
      this.syncSelection(preserveCurrent)
    },
    syncSelection(preserveCurrent = true) {
      const routeOrderId = this.$route.query.orderId
      const currentOrderId = preserveCurrent && this.selectedSession ? this.selectedSession.orderId : null
      const candidates = this.visibleSessions
      const target = candidates.find((item) => String(item.orderId) === String(routeOrderId)) ||
        candidates.find((item) => String(item.orderId) === String(currentOrderId)) ||
        candidates[0] || null

      if (!target) {
        this.selectedSession = null
        this.messages = []
        this.deliveryList = []
        this.stopPoll()
        return
      }

      const changed = !this.selectedSession || String(this.selectedSession.orderId) !== String(target.orderId)
      this.selectedSession = target
      if (changed) {
        this.activePane = 'messages'
        this.draftMessage = ''
      }
      this.loadCurrentDetail()
      this.startPoll()
    },
    selectSession(item) {
      this.$router.push({ path: '/index/cosorder-comm', query: { orderId: item.orderId } })
    },
    async loadCurrentDetail() {
      if (!this.selectedSession || !this.selectedSession.orderId) {
        this.messages = []
        this.deliveryList = []
        return
      }
      this.detailLoading = true
      try {
        await Promise.all([this.loadMessages(), this.loadDelivery()])
      } finally {
        this.detailLoading = false
      }
    },
    async loadMessages() {
      if (!this.selectedSession || !this.selectedSession.orderId) return
      const previousCount = this.messages.length
      const previousLastId = previousCount ? this.messages[previousCount - 1].id : null
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosorderCommMessagePage,
        method: 'get',
        showLoading: false,
        showError: false,
        params: {
          orderId: this.selectedSession.orderId,
          page: 1,
          limit: 200
        }
      })
      if (!res || res.code !== 0) return
      const nextMessages = this.normalizeMessageRows((res.data && res.data.list) || [])
      const nextLastId = nextMessages.length ? nextMessages[nextMessages.length - 1].id : null
      this.messages = nextMessages
      if (nextMessages.length !== previousCount || nextLastId !== previousLastId) {
        this.$nextTick(() => this.scrollToBottom())
      }
    },
    async loadDelivery() {
      if (!this.selectedSession || !this.selectedSession.orderId) return
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosorderCommDelivery,
        method: 'get',
        showLoading: false,
        showError: false,
        params: { orderId: this.selectedSession.orderId }
      })
      if (!res || res.code !== 0) return
      this.deliveryList = res.data || []
    },
    async sendMessage() {
      if (!this.selectedSession || !this.selectedSession.orderId) {
        this.$message.warning('订单ID缺失')
        return
      }
      if (!this.draftMessage) {
        this.$message.warning('请输入消息内容')
        return
      }
      this.sendLoading = true
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosorderCommSend,
        method: 'post',
        dataType: 'json',
        showError: false,
        params: {
          orderId: this.selectedSession.orderId,
          content: this.draftMessage,
          messageType: 'TEXT'
        }
      })
      this.sendLoading = false

      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '消息发送失败')
        return
      }

      this.draftMessage = ''
      await Promise.all([this.loadMessages(), this.loadSessions()])
    },
    handleMessageKeydown(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        this.sendMessage()
      }
    },
    refreshCurrent() {
      this.loadSessions()
    },
    scrollToBottom() {
      const el = this.$refs.messageList
      if (!el) return
      el.scrollTop = el.scrollHeight
    },
    async pollCurrentDetail() {
      if (this.pollLoading || !this.selectedSession || !this.selectedSession.orderId) return
      this.pollLoading = true
      try {
        await Promise.all([this.loadMessages(), this.loadDelivery()])
      } finally {
        this.pollLoading = false
      }
    },
    startPoll() {
      this.stopPoll()
      this.pollTimer = setInterval(() => {
        this.pollCurrentDetail()
      }, 5000)
    },
    stopPoll() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer)
        this.pollTimer = null
      }
    }
  }
}
</script>

<style scoped>
.order-communication-page {
  --comm-primary: #5668ff;
  --comm-primary-deep: #394ed3;
  --comm-primary-soft: #eef2ff;
  --comm-surface: rgba(255, 255, 255, 0.84);
  --comm-border: #e5ebff;
  --comm-text: #263568;
  --comm-text-sub: #7f8bb0;
  height: calc(100vh - 120px);
  min-height: 620px;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 12px;
  overflow: hidden;
}

.comm-header-card,
.panel-card {
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.92);
  background: var(--comm-surface);
  box-shadow: 0 18px 44px rgba(79, 101, 174, 0.12);
  backdrop-filter: blur(14px);
}

.comm-header-card {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 16px 20px;
  background:
    radial-gradient(circle at top left, rgba(107, 130, 255, 0.16), transparent 36%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(246, 248, 255, 0.95) 100%);
}

.comm-header-copy h2 {
  margin-top: 6px;
  color: var(--comm-text);
  font-size: 24px;
  line-height: 1.2;
}

.comm-header-copy p {
  margin-top: 6px;
  max-width: 760px;
  color: var(--comm-text-sub);
  font-size: 13px;
  line-height: 1.6;
}

.header-topline {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.header-kicker {
  color: #8b97bc;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.back-button {
  padding: 0;
}

.header-side {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.summary-chip {
  min-width: 96px;
  padding: 10px 14px;
  border-radius: 16px;
  background: rgba(238, 242, 255, 0.92);
  display: grid;
  justify-items: center;
}

.summary-chip strong {
  color: var(--comm-primary-deep);
  font-size: 22px;
}

.summary-chip span {
  margin-top: 2px;
  color: #7f8cb1;
  font-size: 12px;
}

.comm-layout {
  min-height: 0;
  height: 100%;
  display: grid;
  grid-template-columns: 296px minmax(0, 1fr) 256px;
  gap: 14px;
}

.comm-sidebar,
.comm-main,
.comm-empty,
.comm-side-info {
  min-height: 0;
  overflow: hidden;
}

.comm-sidebar {
  padding: 14px;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: 12px;
}

.sidebar-search {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  height: 48px;
  border-radius: 16px;
  background: #f4f6ff;
  box-shadow: inset 0 0 0 1px rgba(109, 124, 222, 0.12);
}

.sidebar-search i {
  color: #8a96be;
}

.sidebar-search input {
  flex: 1;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--comm-text);
  font-size: 14px;
}

.sidebar-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status-filter {
  border: 0;
  border-radius: 999px;
  background: #f1f4ff;
  color: #6170a0;
  padding: 8px 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.status-filter i {
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  font-style: normal;
  background: rgba(86, 104, 255, 0.1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.status-filter.active {
  background: linear-gradient(135deg, var(--comm-primary) 0%, #7d8fff 100%);
  color: #fff;
  box-shadow: 0 14px 24px rgba(86, 104, 255, 0.2);
}

.status-filter.active i {
  background: rgba(255, 255, 255, 0.2);
}

.session-list {
  min-height: 0;
  overflow-y: auto;
  display: grid;
  gap: 8px;
  align-content: start;
  padding-right: 4px;
}

.session-card {
  width: 100%;
  border: 1px solid transparent;
  border-radius: 18px;
  background: rgba(242, 245, 255, 0.9);
  padding: 12px 10px;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 10px;
  text-align: left;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.session-card:hover,
.session-card.active {
  transform: translateY(-1px);
  border-color: rgba(94, 110, 232, 0.2);
  background: #fff;
  box-shadow: 0 16px 28px rgba(94, 110, 188, 0.12);
}

.session-avatar,
.bubble-avatar {
  width: 42px;
  height: 42px;
  border-radius: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #5970ff 0%, #8aa0ff 100%);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 12px 20px rgba(89, 112, 255, 0.22);
}

.session-copy {
  min-width: 0;
  display: grid;
  gap: 5px;
}

.session-topline {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.session-topline strong,
.bubble-name,
.delivery-card strong,
.main-title-row h3,
.delivery-head h4,
.info-card h4,
.info-list strong,
.delivery-brief strong {
  color: var(--comm-text);
}

.session-copy small,
.header-meta,
.delivery-card p,
.delivery-meta,
.composer-foot,
.comm-header-copy p,
.delivery-head p,
.info-card p,
.info-list span,
.delivery-brief span {
  color: var(--comm-text-sub);
}

.session-topline b {
  color: #9ba6c7;
  font-size: 11px;
  font-weight: 600;
}

.session-copy small {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-copy em {
  font-style: normal;
  color: var(--comm-primary-deep);
  font-size: 12px;
}

.session-time,
.bubble-time {
  color: #98a3c6;
  font-size: 12px;
  white-space: nowrap;
}

.comm-main {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-height: 0;
}

.main-header-copy {
  min-width: 0;
}

.main-title-row {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.comm-main-header {
  padding: 16px 18px 14px;
  border-bottom: 1px solid rgba(110, 125, 229, 0.12);
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
}

.main-title-row h3 {
  font-size: 20px;
  line-height: 1.25;
}

.state-pill,
.mini-tag {
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  line-height: 1;
}

.state-pill.progress,
.mini-tag.progress {
  background: rgba(86, 104, 255, 0.12);
  color: var(--comm-primary-deep);
}

.state-pill.shipping,
.mini-tag.shipping {
  background: rgba(49, 174, 129, 0.12);
  color: #1f9a65;
}

.state-pill.done,
.mini-tag.done {
  background: rgba(46, 179, 112, 0.12);
  color: #1d9a60;
}

.state-pill.canceled,
.mini-tag.canceled {
  background: rgba(235, 90, 90, 0.12);
  color: #c55252;
}

.state-pill.unknown,
.mini-tag.neutral,
.state-pill.unpaid {
  background: rgba(145, 156, 195, 0.12);
  color: #6b789f;
}

.header-meta {
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
}

.mode-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border-radius: 999px;
  background: #eef2ff;
}

.mode-btn {
  border: 0;
  background: transparent;
  color: #6675a4;
  font-size: 13px;
  padding: 9px 16px;
  border-radius: 999px;
  cursor: pointer;
}

.mode-btn.active {
  background: linear-gradient(135deg, var(--comm-primary) 0%, #7c8fff 100%);
  color: #fff;
  box-shadow: 0 10px 18px rgba(86, 104, 255, 0.22);
}

.chat-stage,
.delivery-stage {
  min-height: 0;
  height: 100%;
  display: grid;
}

.chat-stage {
  grid-template-rows: minmax(0, 1fr) auto;
}

.message-list,
.delivery-list {
  min-height: 0;
  overflow-y: auto;
  padding: 16px 18px 12px;
}

.message-list {
  display: grid;
  gap: 14px;
  align-content: start;
}

.date-divider {
  display: flex;
  justify-content: center;
}

.date-divider span {
  border-radius: 999px;
  background: #eef2ff;
  color: #7f8cb1;
  padding: 6px 12px;
  font-size: 12px;
}

.bubble-row {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.bubble-row.mine {
  justify-content: flex-end;
}

.bubble-row.mine .bubble-stack {
  align-items: flex-end;
}

.bubble-row.mine .bubble-card {
  border-radius: 22px 22px 8px 22px;
  background: linear-gradient(135deg, #5668ff 0%, #7d90ff 100%);
  color: #fff;
  box-shadow: 0 18px 26px rgba(86, 104, 255, 0.22);
}

.bubble-stack {
  max-width: min(78%, 520px);
  display: grid;
  gap: 6px;
}

.bubble-name {
  font-size: 12px;
}

.bubble-card {
  border-radius: 22px 22px 22px 8px;
  background: #fff;
  color: #34477d;
  padding: 14px 16px;
  line-height: 1.7;
  word-break: break-word;
  box-shadow: 0 12px 22px rgba(111, 123, 181, 0.08);
}

.composer {
  position: sticky;
  bottom: 0;
  z-index: 3;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 12px;
  align-items: end;
  padding: 12px 18px 16px;
  border-top: 1px solid rgba(110, 125, 229, 0.12);
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(12px);
}

.icon-button,
.send-button {
  border: 0;
  cursor: pointer;
}

.icon-button {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  background: #eef2ff;
  color: var(--comm-primary-deep);
}

.composer-box {
  min-width: 0;
  border-radius: 22px;
  background: #f3f6ff;
  box-shadow: inset 0 0 0 1px rgba(113, 128, 232, 0.14);
  padding: 14px 16px 10px;
}

.composer-box textarea {
  width: 100%;
  min-height: 60px;
  max-height: 120px;
  border: 0;
  outline: none;
  resize: none;
  background: transparent;
  color: var(--comm-text);
  font-size: 14px;
  line-height: 1.7;
}

.composer-box textarea::placeholder {
  color: #9aa5c6;
}

.composer-foot {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
}

.send-button {
  min-width: 84px;
  height: 50px;
  padding: 0 18px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--comm-primary) 0%, #7d8fff 100%);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 16px 28px rgba(86, 104, 255, 0.24);
}

.send-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.delivery-stage {
  grid-template-rows: auto minmax(0, 1fr);
}

.delivery-head {
  padding: 16px 18px 0;
  display: flex;
  justify-content: space-between;
  gap: 14px;
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
  background: #29b77f;
  box-shadow: 0 0 0 6px rgba(41, 183, 127, 0.14);
}

.delivery-card {
  flex: 1;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  padding: 16px 18px;
  box-shadow: 0 12px 22px rgba(104, 121, 183, 0.08);
}

.delivery-topline {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.delivery-topline span {
  color: #98a4c7;
  font-size: 12px;
}

.delivery-card p {
  margin-top: 8px;
  line-height: 1.7;
}

.delivery-meta {
  margin-top: 8px;
  font-size: 12px;
}

.comm-side-info {
  padding: 14px;
  display: grid;
  gap: 12px;
  align-content: start;
  overflow-y: auto;
}

.info-card {
  border-radius: 18px;
  background: rgba(244, 247, 255, 0.92);
  padding: 14px;
  box-shadow: inset 0 0 0 1px rgba(110, 125, 229, 0.1);
}

.info-highlight {
  background:
    radial-gradient(circle at top right, rgba(113, 132, 255, 0.18), transparent 48%),
    rgba(244, 247, 255, 0.96);
}

.info-label {
  color: #8c98bc;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.info-card h4 {
  margin-top: 8px;
  font-size: 18px;
}

.info-card p {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.6;
}

.info-tag-row {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.info-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.info-progress {
  color: var(--comm-primary-deep);
  font-size: 13px;
  font-weight: 700;
}

.progress-track {
  margin-top: 12px;
  height: 8px;
  border-radius: 999px;
  background: rgba(123, 138, 219, 0.14);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #5668ff 0%, #7e92ff 100%);
}

.info-list {
  margin-top: 14px;
  display: grid;
  gap: 10px;
  list-style: none;
}

.info-list li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.info-list span,
.info-list strong {
  font-size: 13px;
}

.delivery-brief {
  margin-top: 12px;
  display: grid;
  gap: 8px;
}

.delivery-brief p {
  margin-top: 0;
}

.quick-card .el-button + .el-button {
  margin-left: 0;
  margin-top: 10px;
}

.comm-empty {
  grid-column: 2 / 4;
  display: grid;
  place-items: center;
}

@media (max-width: 1180px) {
  .comm-layout {
    grid-template-columns: 280px minmax(0, 1fr);
  }

  .comm-side-info {
    display: none;
  }

  .comm-empty {
    grid-column: 2 / 3;
  }
}

@media (max-width: 980px) {
  .order-communication-page {
    height: auto;
    min-height: auto;
    overflow: visible;
  }

  .comm-header-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-side {
    width: 100%;
    justify-content: space-between;
  }

  .comm-layout {
    height: auto;
    grid-template-columns: 1fr;
  }

  .comm-sidebar {
    min-height: auto;
  }

  .session-list {
    max-height: 300px;
  }

  .comm-main-header,
  .composer,
  .delivery-head {
    padding-left: 18px;
    padding-right: 18px;
  }

  .message-list,
  .delivery-list {
    padding-left: 18px;
    padding-right: 18px;
  }

  .comm-main-header,
  .composer {
    flex-direction: column;
  }

  .mode-switch {
    width: 100%;
    justify-content: space-between;
  }

  .mode-btn {
    flex: 1;
  }

  .composer {
    position: static;
    grid-template-columns: 1fr;
  }

  .icon-button,
  .send-button {
    width: 100%;
  }

  .bubble-stack {
    max-width: 100%;
  }

  .comm-empty {
    grid-column: auto;
  }
}
</style>
