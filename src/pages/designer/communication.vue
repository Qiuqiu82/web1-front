<template>
  <div class="designer-communication-page">
    <section class="head-card panel-card">
      <div>
        <h2>用户沟通</h2>
        <p>围绕订单会话统一管理消息与交付记录。</p>
      </div>
      <div class="head-actions">
        <el-input
          v-model.trim="keyword"
          size="small"
          clearable
          class="search-input"
          placeholder="搜索订单号 / 用户ID"
          @clear="loadSessions"
          @keyup.enter.native="loadSessions"
        />
        <el-button size="small" icon="el-icon-search" @click="loadSessions">搜索</el-button>
        <el-button size="small" icon="el-icon-refresh" :loading="sessionLoading" @click="refreshCurrent">刷新</el-button>
      </div>
    </section>

    <section class="content-grid">
      <article class="panel-card list-card">
        <div class="panel-title">会话列表</div>
        <div v-if="sessionList.length" class="conversation-list">
          <div
            v-for="item in filteredSessions"
            :key="item.orderId"
            class="conversation-item"
            :class="{ active: selectedSession && selectedSession.orderId === item.orderId }"
            @click="selectSession(item)"
          >
            <div class="conversation-top">
              <span class="order-no">{{ item.orderNo || `订单${item.orderId}` }}</span>
              <span class="status-tag">{{ item.orderStatus || '-' }}</span>
            </div>
            <div class="conversation-sub">用户ID：{{ item.userId || '-' }}</div>
            <div class="conversation-sub ellipsis">{{ item.lastMessage || '暂无消息，点击开始沟通' }}</div>
            <div class="conversation-sub">更新时间：{{ item.lastMessageTime || item.designerTakeTime || item.orderTime || '-' }}</div>
          </div>
        </div>
        <el-empty v-else description="暂无会话数据" :image-size="84" />
      </article>

      <article class="panel-card detail-card" v-if="selectedSession">
        <div class="panel-title-row">
          <div class="panel-title">会话详情</div>
          <div class="panel-btns">
            <el-button type="text" @click="$router.push('/designer/orders')">回到订单管理</el-button>
            <el-button type="text" @click="loadCurrentDetail">重新加载</el-button>
          </div>
        </div>

        <div class="order-summary">
          <el-tag size="mini" type="success">订单号：{{ selectedSession.orderNo || selectedSession.orderId }}</el-tag>
          <el-tag size="mini" type="info">用户ID：{{ selectedSession.userId || '-' }}</el-tag>
          <el-tag size="mini">履约：{{ selectedSession.orderStatus || '-' }}</el-tag>
          <el-tag size="mini" effect="plain">接单：{{ selectedSession.designerStatus || '-' }}</el-tag>
        </div>

        <el-tabs v-model="activePane" class="detail-tabs">
          <el-tab-pane label="会话消息" name="messages">
            <div v-if="messages.length" class="message-list">
              <div
                v-for="msg in messages"
                :key="msg.id"
                :class="['message-item', { me: isMine(msg) }]"
              >
                <div class="message-head">
                  <span>{{ msg.senderName || roleText(msg.senderRole) }}</span>
                  <small>{{ msg.addtime || '-' }}</small>
                </div>
                <div class="message-body">{{ msg.content }}</div>
              </div>
            </div>
            <el-empty v-else description="暂无消息，开始第一条沟通吧" :image-size="72" />

            <div class="send-box">
              <el-input
                v-model.trim="draftMessage"
                type="textarea"
                :rows="3"
                maxlength="500"
                show-word-limit
                placeholder="输入消息内容，回车发送，Shift+回车换行"
                @keydown.native="handleMessageKeydown"
              />
              <div class="send-actions">
                <el-button @click="openOrderDetail">查看订单</el-button>
                <el-button type="primary" :loading="sendLoading" @click="sendMessage">发送</el-button>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="交付记录" name="delivery">
            <div v-if="deliveryList.length" class="timeline">
              <div class="timeline-item" v-for="(item, idx) in deliveryList" :key="`${item.time}-${idx}`">
                <div :class="['timeline-dot', item.type === 'DELIVERY' ? 'delivery' : 'status']" />
                <div class="timeline-content">
                  <div class="timeline-title">{{ item.title || '-' }}</div>
                  <div class="timeline-desc">{{ item.content || '-' }}</div>
                  <div class="timeline-meta">
                    <span>{{ item.operatorRole || '-' }}</span>
                    <span>{{ item.operatorName || '-' }}</span>
                    <span>{{ item.time || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无交付记录" :image-size="72" />
          </el-tab-pane>
        </el-tabs>
      </article>

      <article v-else class="panel-card detail-card empty-detail">
        <el-empty description="请选择左侧订单会话" :image-size="96" />
      </article>
    </section>
  </div>
</template>

<script>
export default {
  name: 'DesignerCommunication',
  data() {
    return {
      keyword: '',
      sessionList: [],
      selectedSession: null,
      messages: [],
      deliveryList: [],
      draftMessage: '',
      activePane: 'messages',
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
      if (text === 'DESIGNER') return '设计师'
      if (text === 'USER') return '用户'
      return role || '-'
    },
    isMine(msg) {
      return String(msg.senderRole || '').toUpperCase() === String(this.currentRole || '').toUpperCase()
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
        this.$message.warning('会话数据加载失败，已显示空状态')
        this.sessionList = []
        this.selectedSession = null
        this.messages = []
        this.deliveryList = []
        return
      }

      const list = this.normalizeSessionRows((res.data && res.data.list) || [])
      this.sessionList = list
      const queryOrderId = this.$route.query.orderId
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
        title: item.title || '-',
        content: item.content || '-',
        operatorRole: item.operatorRole || '-',
        operatorName: item.operatorName || '-'
      }))
    },
    async selectSession(item) {
      this.selectedSession = item
      this.activePane = 'messages'
      this.$router.replace({ path: '/designer/communication', query: { orderId: item.orderId } })
      await this.loadCurrentDetail()
    },
    async sendMessage() {
      if (!this.selectedSession || !this.selectedSession.orderId) {
        this.$message.warning('请先选择订单会话')
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
        this.$message.error((res && res.msg) || '发送失败')
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
      this.$router.push('/designer/orders')
    },
    async refreshCurrent() {
      if (!this.selectedSession) {
        await this.loadSessions()
        return
      }
      await this.loadCurrentDetail()
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

.head-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-input {
  width: 260px;
}

.content-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 12px;
}

.list-card,
.detail-card {
  padding: 14px;
}

.panel-title {
  color: #2f4486;
  font-size: 16px;
  font-weight: 700;
}

.panel-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-btns {
  display: flex;
  gap: 8px;
}

.conversation-list {
  margin-top: 10px;
  display: grid;
  gap: 8px;
}

.conversation-item {
  border: 1px solid #e9eeff;
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.conversation-item:hover {
  border-color: #d2dcff;
  box-shadow: 0 8px 14px rgba(74, 96, 165, 0.1);
}

.conversation-item.active {
  border-color: #6b80e4;
  background: #f6f8ff;
}

.conversation-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-no {
  color: #304683;
  font-weight: 700;
}

.status-tag {
  color: #7f8ab1;
  font-size: 12px;
}

.conversation-sub {
  margin-top: 4px;
  color: #8a95b5;
  font-size: 12px;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-summary {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-tabs {
  margin-top: 10px;
}

.message-list {
  max-height: 340px;
  overflow-y: auto;
  display: grid;
  gap: 8px;
  padding-right: 4px;
}

.message-item {
  border: 1px solid #e9eeff;
  border-radius: 10px;
  padding: 10px;
  background: #fff;
}

.message-item.me {
  border-color: #cfd9ff;
  background: #f6f8ff;
}

.message-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #5f6f9f;
  font-size: 12px;
}

.message-body {
  margin-top: 6px;
  color: #2f4384;
  line-height: 1.5;
}

.send-box {
  margin-top: 10px;
  display: grid;
  gap: 8px;
}

.send-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.timeline {
  display: grid;
  gap: 10px;
}

.timeline-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.timeline-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
}

.timeline-dot.status {
  background: #667be1;
  box-shadow: 0 0 0 4px rgba(102, 123, 225, 0.16);
}

.timeline-dot.delivery {
  background: #2cb67d;
  box-shadow: 0 0 0 4px rgba(44, 182, 125, 0.18);
}

.timeline-title {
  color: #344b89;
  font-weight: 600;
}

.timeline-desc {
  margin-top: 4px;
  color: #8e98bb;
  font-size: 13px;
}

.timeline-meta {
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: #9aa5c6;
  font-size: 12px;
}

.empty-detail {
  display: grid;
  place-items: center;
}

@media (max-width: 900px) {
  .head-card {
    flex-wrap: wrap;
  }

  .head-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .search-input {
    width: 100%;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .list-card,
  .detail-card {
    padding: 12px;
  }
}
</style>