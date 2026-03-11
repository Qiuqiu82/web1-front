<template>
  <div class="designer-communication-page">
    <section class="page-toolbar">
      <div class="page-copy">
        <span class="page-tag">{{ texts.pageTag }}</span>
        <h2>{{ texts.pageTitle }}</h2>
      </div>
      <div class="page-actions">
        <el-input
          v-model.trim="keyword"
          size="small"
          clearable
          class="search-input"
          :placeholder="texts.searchPlaceholder"
          @clear="loadSessions"
          @keyup.enter.native="loadSessions"
        />
        <el-button size="small" icon="el-icon-search" @click="loadSessions">{{ texts.search }}</el-button>
        <el-button size="small" icon="el-icon-refresh" :loading="sessionLoading" @click="refreshCurrent">{{ texts.refresh }}</el-button>
      </div>
    </section>

    <section class="chat-shell">
      <aside class="session-panel panel-card" v-loading="sessionLoading">
        <div class="session-head">
          <div>
            <h3>{{ texts.sessionTitle }}</h3>
            <p>{{ texts.sessionDesc }}</p>
          </div>
          <span class="session-count">{{ filteredSessions.length }}</span>
        </div>

        <div v-if="filteredSessions.length" class="session-list">
          <button
            v-for="item in filteredSessions"
            :key="item.orderId"
            type="button"
            class="session-item"
            :class="{ active: selectedSession && selectedSession.orderId === item.orderId }"
            @click="selectSession(item)"
          >
            <div class="session-item-top">
              <strong>{{ item.orderNo || `${texts.orderLabel}${item.orderId}` }}</strong>
              <span class="session-time">{{ item.lastMessageTime || item.designerTakeTime || item.orderTime || '-' }}</span>
            </div>
            <div class="session-tags">
              <span>{{ texts.userLabel }} {{ item.userId || '-' }}</span>
              <span>{{ item.orderStatus || texts.unknown }}</span>
            </div>
            <div class="session-preview">{{ item.lastMessage || texts.emptyMessageHint }}</div>
          </button>
        </div>
        <el-empty v-else :description="texts.emptySessions" :image-size="84" />
      </aside>

      <section v-if="selectedSession" class="chat-layout">
        <article class="chat-panel panel-card" v-loading="detailLoading">
          <header class="chat-header">
            <div>
              <div class="chat-title-row">
                <h3>{{ selectedSession.orderNo || `${texts.orderLabel}${selectedSession.orderId}` }}</h3>
                <span class="online-dot"></span>
                <span class="chat-status">{{ selectedSession.orderStatus || texts.unknown }}</span>
              </div>
              <p>{{ texts.userLabel }} {{ selectedSession.userId || '-' }} · {{ texts.claimTime }} {{ selectedSession.designerTakeTime || '-' }}</p>
            </div>
            <div class="chat-header-actions">
              <el-button type="text" @click="refreshCurrent">{{ texts.reload }}</el-button>
              <el-button type="text" @click="openOrderDetail">{{ texts.viewOrder }}</el-button>
            </div>
          </header>

          <div ref="messageStream" class="message-stream">
            <div v-if="messages.length" class="message-list">
              <div
                v-for="msg in messages"
                :key="msg.id"
                class="bubble-row"
                :class="{ mine: isMine(msg) }"
              >
                <div class="bubble-avatar">{{ senderInitial(msg) }}</div>
                <div class="bubble-stack">
                  <div class="bubble-meta">
                    <span>{{ msg.senderName || roleText(msg.senderRole) }}</span>
                    <small>{{ msg.addtime || '-' }}</small>
                  </div>
                  <div class="bubble-card">{{ msg.content || texts.emptyContent }}</div>
                </div>
              </div>
            </div>
            <el-empty v-else :description="texts.emptyMessages" :image-size="88" />
          </div>

          <footer class="composer">
            <div class="composer-hint">{{ texts.composeHint }}</div>
            <el-input
              v-model.trim="draftMessage"
              type="textarea"
              :rows="4"
              maxlength="500"
              show-word-limit
              resize="none"
              :placeholder="texts.composePlaceholder"
              @keydown.native="handleMessageKeydown"
            />
            <div class="composer-actions">
              <el-button @click="draftMessage = ''">{{ texts.clear }}</el-button>
              <el-button type="primary" :loading="sendLoading" @click="sendMessage">{{ texts.send }}</el-button>
            </div>
          </footer>
        </article>

        <aside class="context-panel panel-card">
          <section class="context-block">
            <div class="context-head">
              <h3>{{ texts.orderInfoTitle }}</h3>
            </div>
            <div class="meta-grid">
              <div class="meta-item">
                <span>{{ texts.orderNoText }}</span>
                <strong>{{ selectedSession.orderNo || '-' }}</strong>
              </div>
              <div class="meta-item">
                <span>{{ texts.userIdText }}</span>
                <strong>{{ selectedSession.userId || '-' }}</strong>
              </div>
              <div class="meta-item">
                <span>{{ texts.orderStatusText }}</span>
                <strong>{{ selectedSession.orderStatus || texts.unknown }}</strong>
              </div>
              <div class="meta-item">
                <span>{{ texts.designerStatusText }}</span>
                <strong>{{ selectedSession.designerStatus || texts.unknown }}</strong>
              </div>
            </div>
          </section>

          <section class="context-block timeline-block">
            <div class="context-head">
              <h3>{{ texts.deliveryTitle }}</h3>
            </div>
            <div v-if="deliveryList.length" class="timeline-list">
              <div v-for="(item, idx) in deliveryList" :key="`${item.time}-${idx}`" class="timeline-item">
                <div :class="['timeline-dot', item.type === 'DELIVERY' ? 'delivery' : 'status']"></div>
                <div class="timeline-content">
                  <div class="timeline-title">{{ item.title || texts.unknown }}</div>
                  <div class="timeline-desc">{{ item.content || texts.emptyContent }}</div>
                  <div class="timeline-meta">
                    <span>{{ item.operatorRole || '-' }}</span>
                    <span>{{ item.operatorName || '-' }}</span>
                    <span>{{ item.time || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
            <el-empty v-else :description="texts.emptyDelivery" :image-size="74" />
          </section>
        </aside>
      </section>

      <article v-else class="panel-card empty-state">
        <el-empty :description="texts.emptyDetail" :image-size="96" />
      </article>
    </section>
  </div>
</template>

<script>
const TEXTS = {
  pageTag: '\u8ba2\u5355\u6c9f\u901a',
  pageTitle: '\u8bbe\u8ba1\u5e08\u5373\u65f6\u6c9f\u901a\u9762\u677f',
  pageDesc: '\u56f4\u7ed5\u8ba2\u5355\u4f1a\u8bdd\u96c6\u4e2d\u67e5\u770b\u6d88\u606f\u3001\u8ddf\u8fdb\u4ea4\u4ed8\u72b6\u6001\uff0c\u8ba9\u5ba2\u6237\u6c9f\u901a\u66f4\u50cf\u771f\u5b9e\u804a\u5929\u7a97\u53e3\u3002',
  searchPlaceholder: '\u641c\u7d22\u8ba2\u5355\u53f7 / \u7528\u6237 ID',
  search: '\u641c\u7d22',
  refresh: '\u5237\u65b0',
  sessionTitle: '\u4f1a\u8bdd\u5217\u8868',
  sessionDesc: '\u9009\u62e9\u8ba2\u5355\u4ee5\u8fdb\u5165\u5f53\u524d\u6c9f\u901a\u3002',
  orderLabel: '\u8ba2\u5355',
  userLabel: '\u7528\u6237',
  unknown: '\u672a\u77e5',
  emptyMessageHint: '\u6682\u65e0\u6d88\u606f\uff0c\u70b9\u51fb\u8fdb\u5165\u5f00\u59cb\u6c9f\u901a\u3002',
  emptySessions: '\u6682\u65e0\u4f1a\u8bdd\u6570\u636e',
  claimTime: '\u8ba4\u9886\u65f6\u95f4',
  reload: '\u91cd\u65b0\u52a0\u8f7d',
  viewOrder: '\u67e5\u770b\u8ba2\u5355',
  emptyContent: '\u6682\u65e0\u5185\u5bb9',
  emptyMessages: '\u6682\u65e0\u6d88\u606f\uff0c\u53ef\u4ece\u4e0b\u65b9\u8f93\u5165\u6846\u5f00\u59cb\u6c9f\u901a',
  composeHint: '\u6309 Enter \u53d1\u9001\uff0cShift + Enter \u6362\u884c',
  composePlaceholder: '\u8f93\u5165\u4f60\u60f3\u548c\u7528\u6237\u786e\u8ba4\u7684\u5236\u4f5c\u7ec6\u8282\u3001\u8fdb\u5ea6\u6216\u4ea4\u4ed8\u4fe1\u606f\u2026',
  clear: '\u6e05\u7a7a',
  send: '\u53d1\u9001',
  orderInfoTitle: '\u8ba2\u5355\u4e0a\u4e0b\u6587',
  orderNoText: '\u8ba2\u5355\u53f7',
  userIdText: '\u7528\u6237 ID',
  orderStatusText: '\u8ba2\u5355\u72b6\u6001',
  designerStatusText: '\u8bbe\u8ba1\u5e08\u72b6\u6001',
  deliveryTitle: '\u4ea4\u4ed8\u8bb0\u5f55',
  emptyDelivery: '\u6682\u65e0\u4ea4\u4ed8\u8bb0\u5f55',
  emptyDetail: '\u8bf7\u4ece\u5de6\u4fa7\u9009\u62e9\u4e00\u4e2a\u8ba2\u5355\u4f1a\u8bdd'
}

export default {
  name: 'DesignerCommunication',
  data() {
    return {
      texts: TEXTS,
      keyword: '',
      sessionList: [],
      selectedSession: null,
      messages: [],
      deliveryList: [],
      draftMessage: '',
      sessionLoading: false,
      detailLoading: false,
      sendLoading: false,
      pollTimer: null
    }
  },
  computed: {
    filteredSessions() {
      const text = (this.keyword || '').toLowerCase()
      if (!text) return this.sessionList
      return this.sessionList.filter((item) => {
        return String(item.orderNo || '').toLowerCase().includes(text) || String(item.userId || '').includes(text)
      })
    },
    currentRole() {
      const tableName = localStorage.getItem('sessionTable') || localStorage.getItem('UserTableName') || ''
      if (tableName === 'shejishi') return 'DESIGNER'
      if (tableName === 'yonghu') return 'USER'
      return String(localStorage.getItem('role') || '').toUpperCase()
    }
  },
  watch: {
    '$route.query.orderId'(val) {
      if (!val) return
      const target = this.sessionList.find((item) => String(item.orderId) === String(val))
      if (target) {
        this.selectSession(target)
      }
    }
  },
  created() {
    this.loadSessions()
  },
  beforeDestroy() {
    this.stopPoll()
  },
  methods: {
    normalizeSessionRows(rows = []) {
      return rows.map((row) => ({
        orderId: row.orderId || row.order_id || row.id,
        orderNo: row.orderNo || row.order_no || '',
        userId: row.userId || row.user_id || '',
        orderStatus: row.orderStatus || row.order_status || '',
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
      if (text === 'DESIGNER') return '\u8bbe\u8ba1\u5e08'
      if (text === 'USER') return '\u7528\u6237'
      if (text === 'ADMIN') return '\u7ba1\u7406\u5458'
      return role || this.texts.unknown
    },
    senderInitial(msg) {
      const text = String(msg.senderName || this.roleText(msg.senderRole) || '').trim()
      return text ? text.slice(0, 1) : 'S'
    },
    isMine(msg) {
      return String(msg.senderRole || '').toUpperCase() === String(this.currentRole || '').toUpperCase()
    },
    normalizePlainText(text) {
      return String(text || '').replace(/\s+/g, ' ').trim()
    },
    looksMojibake(text) {
      const value = this.normalizePlainText(text)
      if (!value) return false
      return /\uFFFD|[\u00C0-\u017F]/.test(value) || /[\u95c2\u9359\u9352\u95bc\u7f01\u93ba\u986d\u9225\u6d93\u7f03\u5a06\u942a]/.test(value)
    },
    normalizeStatusLabel(status) {
      const value = this.normalizePlainText(status)
      if (!value || this.looksMojibake(value)) return this.texts.unknown
      return value
    },
    safeRoleLabel(role) {
      const upper = String(role || '').toUpperCase()
      if (upper === 'DESIGNER') return '\u8bbe\u8ba1\u5e08'
      if (upper === 'USER') return '\u7528\u6237'
      if (upper === 'ADMIN') return '\u7ba1\u7406\u5458'
      const value = this.normalizePlainText(role)
      if (!value || this.looksMojibake(value)) return this.texts.unknown
      return value
    },
    buildDeliveryTitle(item) {
      const rawTitle = this.normalizePlainText(item.title)
      if (rawTitle && !this.looksMojibake(rawTitle)) return rawTitle
      const fromStatus = this.normalizeStatusLabel(item.fromStatus || item.oldStatus || item.statusBefore)
      const toStatus = this.normalizeStatusLabel(item.toStatus || item.newStatus || item.statusAfter || item.status)
      if (fromStatus !== this.texts.unknown && toStatus !== this.texts.unknown && fromStatus !== toStatus) {
        return `\u72b6\u6001\u53d8\u66f4\uff1a${fromStatus} -> ${toStatus}`
      }
      if (toStatus !== this.texts.unknown) {
        return `\u72b6\u6001\u66f4\u65b0\uff1a${toStatus}`
      }
      return String(item.type || '').toUpperCase() === 'DELIVERY' ? '\u4ea4\u4ed8\u8bb0\u5f55' : '\u8fdb\u5ea6\u8bb0\u5f55'
    },
    buildDeliveryContent(item) {
      const rawContent = this.normalizePlainText(item.content || item.remark || item.note)
      if (rawContent && !this.looksMojibake(rawContent)) return rawContent
      const roleLabel = this.safeRoleLabel(item.operatorRole)
      const fromStatus = this.normalizeStatusLabel(item.fromStatus || item.oldStatus || item.statusBefore)
      const toStatus = this.normalizeStatusLabel(item.toStatus || item.newStatus || item.statusAfter || item.status)
      if (String(item.type || '').toUpperCase() === 'DELIVERY') {
        return `${roleLabel}\u5df2\u63d0\u4ea4\u4ea4\u4ed8\u8bf4\u660e\uff0c\u8bf7\u7ed3\u5408\u8ba2\u5355\u72b6\u6001\u7ee7\u7eed\u8ddf\u8fdb`
      }
      if (fromStatus !== this.texts.unknown && toStatus !== this.texts.unknown && fromStatus !== toStatus) {
        return `${roleLabel}\u5c06\u8ba2\u5355\u72b6\u6001\u4ece ${fromStatus} \u66f4\u65b0\u4e3a ${toStatus}`
      }
      if (toStatus !== this.texts.unknown) {
        return `${roleLabel}\u5df2\u66f4\u65b0\u8ba2\u5355\u72b6\u6001\uff1a${toStatus}`
      }
      return '\u5df2\u8bb0\u5f55\u4e00\u6761\u8ba2\u5355\u8ddf\u8fdb\u52a8\u4f5c'
    },
    safeOperatorName(item) {
      const name = this.normalizePlainText(item.operatorName)
      if (name && !this.looksMojibake(name)) return name
      return this.safeRoleLabel(item.operatorRole)
    },
    async loadSessions() {
      this.sessionLoading = true
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosorderCommSessionPage,
        method: 'get',
        showLoading: false,
        showError: false,
        params: {
          page: 1,
          limit: 300,
          keyword: this.keyword || undefined
        }
      })
      this.sessionLoading = false

      if (!res || res.code !== 0) {
        this.$message.warning((res && res.msg) || '\u4f1a\u8bdd\u5217\u8868\u52a0\u8f7d\u5931\u8d25')
        this.sessionList = []
        this.selectedSession = null
        this.messages = []
        this.deliveryList = []
        return
      }

      const list = this.normalizeSessionRows((res.data && res.data.list) || [])
      this.sessionList = list
      const queryOrderId = this.$route.query.orderId || (this.selectedSession && this.selectedSession.orderId)
      const target = list.find((item) => String(item.orderId) === String(queryOrderId))
      this.selectedSession = target || list[0] || null
      if (this.selectedSession) {
        await this.loadCurrentDetail()
        this.startPoll()
      } else {
        this.stopPoll()
      }
    },
    async loadCurrentDetail() {
      if (!this.selectedSession || !this.selectedSession.orderId) {
        this.messages = []
        this.deliveryList = []
        return
      }
      this.detailLoading = true
      await Promise.all([this.loadMessages(), this.loadDelivery()])
      this.detailLoading = false
    },
    async loadMessages() {
      if (!this.selectedSession || !this.selectedSession.orderId) return
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
      if (!res || res.code !== 0) {
        this.messages = []
        return
      }
      this.messages = this.normalizeMessageRows((res.data && res.data.list) || [])
      this.$nextTick(() => {
        this.scrollMessagesToBottom()
      })
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
      if (!res || res.code !== 0) {
        this.deliveryList = []
        return
      }
      this.deliveryList = (res.data || []).map((item) => ({
        time: item.time || item.addtime || '-',
        type: item.type || 'STATUS',
        title: this.buildDeliveryTitle(item),
        content: this.buildDeliveryContent(item),
        operatorRole: this.safeRoleLabel(item.operatorRole),
        operatorName: this.safeOperatorName(item)
      }))
    },
    async selectSession(item) {
      this.selectedSession = item
      this.$router.replace({ path: '/designer/communication', query: { orderId: item.orderId } })
      await this.loadCurrentDetail()
    },
    async sendMessage() {
      if (!this.selectedSession || !this.selectedSession.orderId) {
        this.$message.warning('\u8bf7\u5148\u9009\u62e9\u8ba2\u5355\u4f1a\u8bdd')
        return
      }
      if (!this.draftMessage) {
        this.$message.warning('\u8bf7\u8f93\u5165\u6d88\u606f\u5185\u5bb9')
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
        this.$message.error((res && res.msg) || '\u53d1\u9001\u5931\u8d25')
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
    openOrderDetail() {
      if (!this.selectedSession || !this.selectedSession.orderId) return
      this.$router.push({ path: '/designer/orders', query: { orderId: this.selectedSession.orderId } })
    },
    async refreshCurrent() {
      if (!this.selectedSession) {
        await this.loadSessions()
        return
      }
      await Promise.all([this.loadCurrentDetail(), this.loadSessions()])
    },
    scrollMessagesToBottom() {
      const el = this.$refs.messageStream
      if (el && typeof el.scrollTop === 'number') {
        el.scrollTop = el.scrollHeight
      }
    },
    startPoll() {
      this.stopPoll()
      this.pollTimer = setInterval(() => {
        if (this.selectedSession && this.selectedSession.orderId) {
          this.loadMessages()
          this.loadDelivery()
        }
      }, 8000)
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
.designer-communication-page {
  --comm-primary: #4f6ef7;
  --comm-primary-soft: rgba(79, 110, 247, 0.08);
  --comm-accent: #7eb9ff;
  --comm-surface: #ffffff;
  --comm-border: rgba(95, 122, 210, 0.14);
  --comm-muted: #7381a1;
  --comm-text: #24324a;
  --comm-bg: linear-gradient(180deg, #f7f9ff 0%, #eef4ff 100%);
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: calc(100vh - 150px);
  min-height: 640px;
  overflow: hidden;
}

.panel-card {
  background: var(--comm-surface);
  border: 1px solid var(--comm-border);
  border-radius: 24px;
  box-shadow: none;
}

.page-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex: 0 0 auto;
}

.page-copy {
  display: grid;
  gap: 4px;
}

.page-tag {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid #dbe6ff;
  background: #f7faff;
  color: #5870bc;
  font-size: 12px;
  letter-spacing: 0.04em;
}

.page-copy h2 {
  margin: 0;
  color: var(--comm-text);
  font-size: 26px;
  line-height: 1.28;
}

.page-copy p {
  margin: 0;
  max-width: 760px;
  color: var(--comm-muted);
  line-height: 1.6;
}

.page-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.search-input {
  width: 260px;
}

.chat-shell {
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: 330px minmax(0, 1fr);
  gap: 16px;
  align-items: stretch;
}

.session-panel {
  padding: 18px;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 14px;
  min-height: 0;
  overflow: hidden;
}

.session-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.session-head h3,
.context-head h3,
.chat-header h3 {
  margin: 0;
  color: var(--comm-text);
  font-size: 18px;
}

.session-head p,
.chat-header p {
  margin: 6px 0 0;
  color: var(--comm-muted);
  line-height: 1.55;
}

.session-count {
  min-width: 36px;
  height: 36px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--comm-primary-soft);
  color: var(--comm-primary);
  font-weight: 700;
}

.session-list {
  min-height: 0;
  display: grid;
  gap: 10px;
  overflow-y: auto;
  padding-right: 4px;
  align-content: start;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.session-item {
  text-align: left;
  border: 1px solid #e6ecff;
  border-radius: 18px;
  padding: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.session-item:hover {
  border-color: rgba(79, 110, 247, 0.24);
  transform: translateY(-1px);
}

.session-item.active {
  border-color: rgba(79, 110, 247, 0.34);
  background: linear-gradient(180deg, rgba(79, 110, 247, 0.08) 0%, rgba(255, 255, 255, 0.98) 100%);
  box-shadow: inset 0 0 0 1px rgba(79, 110, 247, 0.08);
}

.session-item-top {
  display: flex;
  gap: 8px;
  justify-content: space-between;
  align-items: flex-start;
}

.session-item-top strong {
  color: #274085;
  font-size: 14px;
  line-height: 1.5;
}

.session-time {
  color: #95a2c2;
  font-size: 12px;
  white-space: nowrap;
}

.session-tags {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.session-tags span {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: #f2f5ff;
  color: #61719a;
  font-size: 12px;
}

.session-preview {
  margin-top: 10px;
  color: var(--comm-muted);
  font-size: 13px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.chat-layout {
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 16px;
}

.chat-panel,
.context-panel {
  min-height: 0;
  height: 100%;
}

.chat-panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  min-height: 0;
  overflow: hidden;
}

.chat-header {
  padding: 18px 20px 16px;
  border-bottom: 1px solid rgba(95, 122, 210, 0.1);
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.chat-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.online-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2ccf8f;
  box-shadow: 0 0 0 6px rgba(44, 207, 143, 0.14);
}

.chat-status {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: #f2f5ff;
  color: #56688f;
  font-size: 12px;
}

.chat-header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.message-stream {
  min-height: 0;
  background: var(--comm-bg);
  overflow-y: auto;
  padding: 22px 20px;
}

.message-list {
  display: grid;
  gap: 16px;
  align-content: start;
}

.bubble-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 76%;
}

.bubble-row.mine {
  margin-left: auto;
  flex-direction: row-reverse;
}

.bubble-avatar {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #e8eeff;
  color: #4866dc;
  font-weight: 700;
  flex: 0 0 auto;
}

.bubble-stack {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.bubble-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #7d89ac;
  font-size: 12px;
}

.bubble-card {
  padding: 14px 16px;
  border-radius: 20px 20px 20px 8px;
  background: #ffffff;
  border: 1px solid rgba(95, 122, 210, 0.1);
  color: var(--comm-text);
  line-height: 1.75;
  white-space: pre-wrap;
  word-break: break-word;
}

.bubble-row.mine .bubble-card {
  border-radius: 20px 20px 8px 20px;
  background: linear-gradient(180deg, rgba(79, 110, 247, 0.14) 0%, rgba(255, 255, 255, 0.98) 100%);
}

.composer {
  padding: 16px 20px 20px;
  border-top: 1px solid rgba(95, 122, 210, 0.1);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
  display: grid;
  gap: 10px;
  position: sticky;
  bottom: 0;
  z-index: 2;
}

.composer-hint {
  color: #8d99b9;
  font-size: 12px;
}

.composer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.context-panel {
  padding: 18px;
  display: grid;
  gap: 16px;
  align-content: start;
  min-height: 0;
  overflow: hidden;
}

.context-block {
  border: 1px solid #e9eeff;
  border-radius: 20px;
  padding: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
}

.context-head {
  margin-bottom: 14px;
}

.meta-grid {
  display: grid;
  gap: 12px;
}

.meta-item {
  display: grid;
  gap: 6px;
}

.meta-item span,
.timeline-meta {
  color: #8b97b8;
  font-size: 12px;
}

.meta-item strong,
.timeline-title {
  color: var(--comm-text);
  font-weight: 700;
}

.timeline-block {
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.timeline-list {
  min-height: 0;
  display: grid;
  gap: 14px;
  overflow-y: auto;
  padding-right: 4px;
  align-content: start;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.session-list::-webkit-scrollbar,
.timeline-list::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.timeline-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 7px;
  flex: 0 0 auto;
}

.timeline-dot.status {
  background: #667be1;
  box-shadow: 0 0 0 6px rgba(102, 123, 225, 0.14);
}

.timeline-dot.delivery {
  background: #2cb67d;
  box-shadow: 0 0 0 6px rgba(44, 182, 125, 0.16);
}

.timeline-content {
  display: grid;
  gap: 4px;
}

.timeline-desc {
  color: var(--comm-muted);
  line-height: 1.65;
}

.timeline-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.empty-state {
  min-height: 520px;
  display: grid;
  place-items: center;
}

@media (max-width: 1280px) {
  .designer-communication-page {
    height: auto;
    min-height: 0;
    overflow: visible;
  }

  .chat-shell {
    min-height: 720px;
  }

  .chat-layout {
    grid-template-columns: 1fr;
  }

  .session-panel,
  .chat-panel,
  .context-panel {
    height: auto;
  }
}

@media (max-width: 1024px) {
  .chat-shell {
    grid-template-columns: 1fr;
    min-height: 0;
  }

  .session-panel {
    min-height: 320px;
  }
}

@media (max-width: 768px) {
  .page-toolbar,
  .chat-header {
    flex-direction: column;
  }

  .page-actions,
  .chat-header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .search-input {
    width: 100%;
  }

  .bubble-row {
    max-width: 92%;
  }

  .session-panel,
  .chat-panel,
  .context-panel,
  .empty-state {
    min-height: auto;
  }
}
</style>
