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
              <p v-if="item.role === 'user'">{{ item.content }}</p>
              <div v-else class="msg-rich" v-html="renderAiContent(item.content)" />
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

        <article v-if="waiting" class="msg-item from-ai is-thinking">
          <div class="msg-bubble thinking-bubble">
            <p class="thinking-title">AI 正在思考你的问题</p>
            <div class="thinking-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
        </article>

        <div v-else-if="!safeMessages.length" class="welcome-box">
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
    waiting: {
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
    },
    waiting(value) {
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
    escapeHtml(text) {
      return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    },
    formatInlineMarkdown(text) {
      let value = this.escapeHtml(text)
      value = value.replace(/`([^`]+)`/g, '<code>$1</code>')
      value = value.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      value = value.replace(/__([^_]+)__/g, '<strong>$1</strong>')
      value = value.replace(/\*([^*]+)\*/g, '<em>$1</em>')
      value = value.replace(/_([^_]+)_/g, '<em>$1</em>')
      value = value.replace(/\*\*([^*]+)$/g, '<strong>$1</strong>')
      value = value.replace(/__([^_]+)$/g, '<strong>$1</strong>')
      return value
    },
    renderDetailLine(raw) {
      const detail = String(raw || '').match(/^([^：:]{2,20})[：:]\s*(.+)$/)
      if (!detail) {
        return `<p>${this.formatInlineMarkdown(raw)}</p>`
      }
      return `<p class="md-kv"><span>${this.formatInlineMarkdown(detail[1])}</span>${this.formatInlineMarkdown(detail[2])}</p>`
    },
    renderListItem(raw) {
      const detail = String(raw || '').match(/^([^：:]{2,20})[：:]\s*(.+)$/)
      if (!detail) {
        return this.formatInlineMarkdown(raw)
      }
      return `<span class="md-li-label">${this.formatInlineMarkdown(detail[1])}</span>${this.formatInlineMarkdown(detail[2])}`
    },
    renderAiContent(content) {
      const source = String(content || '').replace(/\r\n/g, '\n')
      const lines = source.split('\n')
      const html = []

      let orderedOpen = false
      let orderedItemOpen = false
      let nestedUlOpen = false
      let plainUlOpen = false

      const closeNestedUl = () => {
        if (!nestedUlOpen) return
        html.push('</ul>')
        nestedUlOpen = false
      }

      const closeOrderedItem = () => {
        if (!orderedItemOpen) return
        closeNestedUl()
        html.push('</li>')
        orderedItemOpen = false
      }

      const closeOrdered = () => {
        if (!orderedOpen) return
        closeOrderedItem()
        html.push('</ol>')
        orderedOpen = false
      }

      const closePlainUl = () => {
        if (!plainUlOpen) return
        html.push('</ul>')
        plainUlOpen = false
      }

      const openOrderedItem = (titleText) => {
        closePlainUl()
        if (!orderedOpen) {
          html.push('<ol class="md-list md-ol">')
          orderedOpen = true
        }
        closeOrderedItem()
        html.push('<li class="md-ol-item">')
        html.push(`<p class="md-item-title">${this.formatInlineMarkdown(titleText)}</p>`)
        orderedItemOpen = true
      }

      lines.forEach((line) => {
        const raw = String(line || '').trim()

        if (!raw) {
          closePlainUl()
          if (orderedItemOpen) {
            closeOrderedItem()
            return
          }
          closeOrdered()
          html.push('<p class="md-empty"></p>')
          return
        }

        const heading = raw.match(/^(#{1,6})\s+(.+)$/)
        if (heading) {
          closePlainUl()
          closeOrdered()
          const level = heading[1].length
          html.push(`<p class="md-heading md-heading-${level}">${this.formatInlineMarkdown(heading[2])}</p>`)
          return
        }

        const ordered = raw.match(/^\d+[.)]\s+(.+)$/)
        if (ordered) {
          openOrderedItem(ordered[1])
          return
        }

        const codeItem = raw.match(/^COS-[A-Za-z0-9-]+\s+.+/)
        if (codeItem) {
          openOrderedItem(raw)
          return
        }

        const unordered = raw.match(/^[-*•·]\s+(.+)$/)
        if (unordered) {
          if (orderedItemOpen) {
            if (!nestedUlOpen) {
              html.push('<ul class="md-sub-list">')
              nestedUlOpen = true
            }
            html.push(`<li>${this.renderListItem(unordered[1])}</li>`)
            return
          }

          closeOrdered()
          if (!plainUlOpen) {
            html.push('<ul class="md-list md-ul">')
            plainUlOpen = true
          }
          html.push(`<li>${this.renderListItem(unordered[1])}</li>`)
          return
        }

        closePlainUl()
        if (orderedItemOpen) {
          html.push(this.renderDetailLine(raw))
          return
        }

        closeOrdered()
        html.push(`<p>${this.formatInlineMarkdown(raw)}</p>`)
      })

      closePlainUl()
      closeOrdered()
      return html.join('')
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
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.message-wrap::-webkit-scrollbar {
  width: 0;
  height: 0;
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

.msg-rich {
  color: #223167;
  font-size: 13px;
  line-height: 1.66;
  white-space: normal;
}

.msg-rich p {
  margin: 0 0 8px;
  white-space: normal;
}

.msg-rich p:last-child {
  margin-bottom: 0;
}

.msg-rich .md-empty {
  height: 6px;
  margin: 0;
}

.msg-rich strong {
  color: #1c2f69;
  font-weight: 700;
}

.msg-rich em {
  color: #334885;
  font-style: italic;
}

.msg-rich .md-heading {
  margin: 2px 0 8px;
  font-weight: 700;
  color: #1a2c63;
}

.msg-rich .md-heading-1,
.msg-rich .md-heading-2 {
  font-size: 15px;
}

.msg-rich .md-heading-3,
.msg-rich .md-heading-4,
.msg-rich .md-heading-5,
.msg-rich .md-heading-6 {
  font-size: 14px;
}

.msg-rich .md-list {
  margin: 6px 0 10px;
}

.msg-rich .md-ol {
  list-style: none;
  padding: 0;
  counter-reset: ai-step;
}

.msg-rich .md-ol-item {
  position: relative;
  margin: 0 0 10px;
  padding: 10px 12px 10px 40px;
  border: 1px solid #dbe4ff;
  border-radius: 12px;
  background: linear-gradient(140deg, #f7f9ff 0%, #ffffff 100%);
}

.msg-rich .md-ol-item::before {
  counter-increment: ai-step;
  content: counter(ai-step);
  position: absolute;
  top: 10px;
  left: 12px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #5670ff;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  line-height: 20px;
  text-align: center;
}

.msg-rich .md-item-title {
  margin: 0 0 8px;
  font-size: 14px;
  line-height: 1.5;
  color: #16295f;
  font-weight: 700;
}

.msg-rich .md-sub-list {
  margin: 0 0 4px;
  padding-left: 18px;
}

.msg-rich .md-sub-list li {
  margin: 4px 0;
  color: #2a3e77;
}

.msg-rich .md-li-label {
  display: inline-block;
  margin-right: 4px;
  color: #243978;
  font-weight: 700;
}

.msg-rich .md-kv {
  margin: 4px 0;
}

.msg-rich .md-kv span {
  display: inline-block;
  min-width: 68px;
  margin-right: 4px;
  color: #2a3b79;
  font-weight: 700;
}

.msg-rich .md-ul {
  padding-left: 18px;
}

.msg-rich .md-ul li {
  margin: 4px 0;
}

.msg-rich code {
  display: inline-block;
  padding: 0 5px;
  border-radius: 4px;
  background: #edf2ff;
  color: #2f458f;
  font-size: 12px;
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

.is-thinking {
  margin-top: 2px;
}

.thinking-bubble {
  width: 210px;
  background: linear-gradient(135deg, #f6f8ff 0%, #ffffff 100%);
  border: 1px solid #dbe4ff;
}

.thinking-title {
  margin: 0;
  color: #3b4b86;
  font-size: 13px;
  font-weight: 600;
}

.thinking-dots {
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.thinking-dots span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #5f73ff;
  opacity: 0.28;
  animation: ai-thinking-pulse 1.2s infinite ease-in-out;
}

.thinking-dots span:nth-child(2) {
  animation-delay: 0.18s;
}

.thinking-dots span:nth-child(3) {
  animation-delay: 0.36s;
}

@keyframes ai-thinking-pulse {
  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: 0.28;
  }
  40% {
    transform: translateY(-3px);
    opacity: 1;
  }
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

.ai-chat-drawer-shell .el-drawer__body {
  overflow: hidden;
}

@media (max-width: 768px) {
  .ai-chat-drawer-shell {
    max-width: 100%;
  }
}
</style>



