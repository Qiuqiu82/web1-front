<template>
  <el-drawer
    :visible.sync="innerVisible"
    :size="drawerSize"
    :with-header="false"
    custom-class="ai-chat-drawer-shell"
    :append-to-body="true"
    @close="$emit('close')"
  >
    <section class="ai-chat-drawer">
      <header class="drawer-head">
        <div class="head-title">
          <strong>AI 智能客服</strong>
          <span>基于你的需求提供搭配建议</span>
        </div>
        <el-tag size="mini" type="success">在线</el-tag>
      </header>

      <div ref="messageWrap" class="message-wrap">
        <template v-if="safeMessages.length">
          <article v-for="item in safeMessages" :key="item.id" :class="['msg-item', item.role === 'user' ? 'from-user' : 'from-ai']">
            <div class="msg-bubble">
              <p>{{ item.content }}</p>
              <small>{{ formatTime(item.createdAt) }}</small>
            </div>
            <div
              v-if="item.role === 'assistant' && Array.isArray(item.recommendations) && item.recommendations.length"
              class="rec-list"
            >
              <div v-for="(rec, idx) in item.recommendations" :key="`${item.id}-rec-${idx}`" class="rec-card">
                <strong>{{ rec.title || rec.name || '推荐款式' }}</strong>
                <span>{{ rec.reason || rec.desc || '适配你的当前咨询场景' }}</span>
              </div>
            </div>
          </article>
        </template>

        <div v-else class="welcome-box">
          <h4>你好，我是你的智能搭配顾问</h4>
          <p>告诉我预算、场景或风格偏好，我会给你更贴近需求的服装建议。</p>
          <div class="quick-list">
            <button
              v-for="item in quickQuestions"
              :key="item"
              type="button"
              class="quick-btn"
              @click="emitSend(item)"
            >
              {{ item }}
            </button>
          </div>
          <small>提示：建议输入“场景 + 风格 + 预算”，推荐会更准确。</small>
        </div>
      </div>

      <footer class="drawer-foot">
        <el-input
          v-model.trim="draft"
          type="textarea"
          :rows="2"
          resize="none"
          maxlength="300"
          show-word-limit
          placeholder="例如：春季通勤，简约风，预算 300 以内"
          :disabled="sending"
          @keyup.enter.native="handleEnter"
        />
        <div class="foot-actions">
          <span class="session-tip">会话：{{ sessionId || '未建立' }}</span>
          <el-button type="primary" :loading="sending" :disabled="!draft" @click="emitSend(draft)">发送</el-button>
        </div>
      </footer>
    </section>
  </el-drawer>
</template>

<script>
export default {
  name: 'AiChatDrawer',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    messages: {
      type: Array,
      default: () => []
    },
    sending: {
      type: Boolean,
      default: false
    },
    sessionId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      draft: '',
      quickQuestions: ['帮我推荐适合通勤的款式', '预算 300 以内有什么选择', '根据我的身材给我建议']
    }
  },
  computed: {
    innerVisible: {
      get() {
        return this.visible
      },
      set(value) {
        if (!value) {
          this.$emit('close')
        }
      }
    },
    safeMessages() {
      return Array.isArray(this.messages) ? this.messages : []
    },
    drawerSize() {
      return window.innerWidth <= 768 ? '100%' : '420px'
    }
  },
  watch: {
    safeMessages() {
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    visible(value) {
      if (value) {
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }
    }
  },
  methods: {
    formatTime(time) {
      if (!time) return '--:--'
      const date = new Date(time)
      if (Number.isNaN(date.getTime())) return '--:--'
      const hh = `${date.getHours()}`.padStart(2, '0')
      const mm = `${date.getMinutes()}`.padStart(2, '0')
      return `${hh}:${mm}`
    },
    handleEnter(event) {
      if (event.shiftKey) return
      event.preventDefault()
      if (this.draft) {
        this.emitSend(this.draft)
      }
    },
    emitSend(text) {
      const message = String(text || '').trim()
      if (!message || this.sending) return
      this.$emit('send', message)
      this.draft = ''
    },
    scrollToBottom() {
      const wrap = this.$refs.messageWrap
      if (!wrap) return
      wrap.scrollTop = wrap.scrollHeight
    }
  }
}
</script>

<style scoped>
.ai-chat-drawer {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f7f9ff 0%, #ffffff 48%, #f7f9ff 100%);
}

.drawer-head {
  padding: 16px 18px;
  border-bottom: 1px solid #e7edff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.head-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.head-title strong {
  font-size: 16px;
  color: #1f2b59;
}

.head-title span {
  font-size: 12px;
  color: #6d7dad;
}

.message-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.msg-item {
  margin-bottom: 12px;
}

.msg-bubble {
  max-width: 86%;
  padding: 10px 12px;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(68, 85, 148, 0.12);
}

.msg-bubble p {
  margin: 0;
  color: #223167;
  font-size: 13px;
  line-height: 1.55;
  white-space: pre-wrap;
}

.msg-bubble small {
  display: block;
  margin-top: 6px;
  color: #8d9bc4;
  font-size: 11px;
}

.from-user {
  display: flex;
  justify-content: flex-end;
}

.from-user .msg-bubble {
  background: linear-gradient(140deg, #5a6bff 0%, #7f8eff 100%);
}

.from-user .msg-bubble p,
.from-user .msg-bubble small {
  color: #fff;
}

.from-ai .msg-bubble {
  background: #fff;
}

.rec-list {
  display: grid;
  gap: 8px;
  margin-top: 8px;
  max-width: 86%;
}

.rec-card {
  border: 1px solid #dbe5ff;
  border-radius: 10px;
  padding: 8px 10px;
  background: #f4f7ff;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rec-card strong {
  color: #2d3d73;
  font-size: 13px;
}

.rec-card span {
  color: #6677a8;
  font-size: 12px;
}

.welcome-box {
  border: 1px solid #dfe7ff;
  border-radius: 14px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.88);
}

.welcome-box h4 {
  margin: 0;
  color: #1f2b59;
  font-size: 15px;
}

.welcome-box p {
  margin: 8px 0 10px;
  font-size: 13px;
  color: #5d6ea1;
  line-height: 1.55;
}

.welcome-box small {
  font-size: 12px;
  color: #7b8aba;
}

.quick-list {
  display: grid;
  gap: 8px;
  margin-bottom: 8px;
}

.quick-btn {
  border: 1px solid #d7e0ff;
  border-radius: 10px;
  background: #f8faff;
  color: #3f5187;
  font-size: 12px;
  line-height: 1.4;
  text-align: left;
  padding: 8px 10px;
  cursor: pointer;
}

.quick-btn:hover {
  border-color: #bfcfff;
  background: #eff4ff;
}

.drawer-foot {
  border-top: 1px solid #e7edff;
  padding: 12px;
  background: #fff;
}

.foot-actions {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.session-tip {
  color: #7b8aba;
  font-size: 12px;
}
</style>

<style>
.ai-chat-drawer-shell {
  max-width: 420px;
}

@media (max-width: 768px) {
  .ai-chat-drawer-shell {
    max-width: 100%;
  }
}
</style>
