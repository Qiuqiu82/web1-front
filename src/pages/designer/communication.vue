<template>
  <div class="designer-communication-page">
    <section class="head-card panel-card">
      <div>
        <h2>用户沟通</h2>
        <p>基于订单会话进行沟通管理，本期先提供会话与订单上下文骨架。</p>
      </div>
      <el-input
        v-model.trim="keyword"
        size="small"
        clearable
        class="search-input"
        placeholder="搜索订单号 / 用户ID"
      />
    </section>

    <section class="content-grid">
      <article class="panel-card list-card">
        <div class="panel-title">会话列表</div>
        <div v-if="filteredOrders.length" class="conversation-list">
          <div
            v-for="item in filteredOrders"
            :key="item.id"
            class="conversation-item"
            :class="{ active: selectedOrder && selectedOrder.id === item.id }"
            @click="selectedOrder = item"
          >
            <div class="conversation-top">
              <span class="order-no">{{ item.orderNo || `订单${item.id}` }}</span>
              <span class="status-tag">{{ item.orderStatus || '-' }}</span>
            </div>
            <div class="conversation-sub">用户ID：{{ item.userId || '-' }}</div>
            <div class="conversation-sub">最近更新时间：{{ item.lastTime || '-' }}</div>
          </div>
        </div>
        <el-empty v-else description="暂无会话数据" :image-size="84" />
      </article>

      <article class="panel-card detail-card" v-if="selectedOrder">
        <div class="panel-title-row">
          <div class="panel-title">会话详情（建设中）</div>
          <el-button type="text" @click="$router.push('/designer/orders')">回到订单管理</el-button>
        </div>

        <div class="order-summary">
          <el-tag size="mini" type="success">订单号：{{ selectedOrder.orderNo || selectedOrder.id }}</el-tag>
          <el-tag size="mini" type="info">用户ID：{{ selectedOrder.userId || '-' }}</el-tag>
          <el-tag size="mini">履约：{{ selectedOrder.orderStatus || '-' }}</el-tag>
        </div>

        <div class="timeline">
          <div class="timeline-item" v-for="item in placeholderTimeline" :key="item.title">
            <div class="timeline-dot" />
            <div>
              <div class="timeline-title">{{ item.title }}</div>
              <div class="timeline-desc">{{ item.desc }}</div>
            </div>
          </div>
        </div>

        <el-input
          type="textarea"
          :rows="4"
          placeholder="消息功能建设中，后续将接入按 orderId 收发消息。"
          disabled
        />

        <div class="footer-actions">
          <el-button type="primary" disabled>发送消息（即将上线）</el-button>
          <el-button @click="$router.push('/designer/profile')">查看资料与作品</el-button>
        </div>
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
      orderList: [],
      selectedOrder: null,
      placeholderTimeline: [
        { title: '沟通域规划', desc: '后续将接入按 orderId 的消息查询与发送接口。' },
        { title: '消息类型扩展', desc: '将支持文本、附件、制作进度卡片等结构化消息。' },
        { title: '会话状态同步', desc: '将补充未读、已读、催单提醒与系统通知能力。' }
      ]
    }
  },
  computed: {
    filteredOrders() {
      const text = (this.keyword || '').toLowerCase()
      if (!text) {
        return this.orderList
      }
      return this.orderList.filter((item) => {
        return String(item.orderNo || '').toLowerCase().includes(text) || String(item.userId || '').includes(text)
      })
    }
  },
  created() {
    this.loadOrders()
  },
  methods: {
    normalizeRows(rows = []) {
      return rows.map((row) => ({
        id: row.id,
        orderNo: row.orderNo || row.order_no || '',
        userId: row.userId || row.user_id || '',
        orderStatus: row.orderStatus || row.order_status || '',
        lastTime: row.designerTakeTime || row.designer_take_time || row.addtime || '-'
      }))
    },
    async loadOrders() {
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosorderDesignerMine,
        method: 'get',
        showLoading: false,
        showError: false,
        params: { page: 1, limit: 300 }
      })
      if (!res || res.code !== 0) {
        this.$message.warning('会话数据加载失败，已显示空状态')
        this.orderList = []
        this.selectedOrder = null
        return
      }
      const list = this.normalizeRows((res.data && res.data.list) || [])
      this.orderList = list
      this.selectedOrder = list[0] || null
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

.search-input {
  width: 280px;
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
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

.order-summary {
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.timeline {
  margin: 14px 0;
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
  background: #677de2;
  box-shadow: 0 0 0 4px rgba(103, 125, 226, 0.16);
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

.footer-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.empty-detail {
  display: grid;
  place-items: center;
}

@media (max-width: 900px) {
  .head-card,
  .list-card,
  .detail-card {
    padding: 12px;
  }

  .head-card {
    flex-wrap: wrap;
  }

  .search-input {
    width: 100%;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>