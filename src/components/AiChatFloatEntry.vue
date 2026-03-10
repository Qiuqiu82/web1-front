<template>
  <button
    v-if="visible"
    class="ai-float-entry"
    type="button"
    @click="$emit('open')"
    aria-label="打开 AI 客服"
  >
    <span class="entry-icon">
      <i class="el-icon-chat-dot-round" />
    </span>
    <span class="entry-text">
      <strong>智能客服</strong>
      <small>搭配建议在线</small>
    </span>
    <span v-if="safeUnreadCount > 0" class="entry-badge">{{ safeUnreadCount > 99 ? '99+' : safeUnreadCount }}</span>
  </button>
</template>

<script>
export default {
  name: 'AiChatFloatEntry',
  props: {
    visible: {
      type: Boolean,
      default: true
    },
    unreadCount: {
      type: Number,
      default: 0
    }
  },
  computed: {
    safeUnreadCount() {
      return Number.isFinite(this.unreadCount) ? Math.max(0, this.unreadCount) : 0
    }
  }
}
</script>

<style scoped>
.ai-float-entry {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 80;
  border: none;
  border-radius: 999px;
  padding: 10px 14px 10px 10px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #1f2b59;
  background: linear-gradient(140deg, rgba(255, 255, 255, 0.98), rgba(242, 246, 255, 0.98));
  box-shadow: 0 18px 38px rgba(66, 89, 145, 0.28);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.ai-float-entry:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 40px rgba(66, 89, 145, 0.32);
}

.entry-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: linear-gradient(140deg, #5264ff 0%, #7d8fff 100%);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 18px;
}

.entry-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}

.entry-text strong {
  font-size: 13px;
  font-weight: 700;
}

.entry-text small {
  font-size: 11px;
  color: #7282b3;
}

.entry-badge {
  min-width: 20px;
  height: 20px;
  border-radius: 999px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(140deg, #ff6b6b 0%, #ff8d68 100%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .ai-float-entry {
    right: 16px;
    bottom: 16px;
    padding-right: 12px;
  }

  .entry-text small {
    display: none;
  }
}
</style>
