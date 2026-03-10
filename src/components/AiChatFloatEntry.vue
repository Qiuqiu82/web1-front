<template>
  <button
    v-if="visible"
    ref="entryBtn"
    class="ai-float-entry"
    type="button"
    :style="buttonStyle"
    aria-label="打开 AI 客服"
    @click="handleClick"
    @mousedown="startDrag"
    @touchstart="startDrag"
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
const STORAGE_KEY = 'aiFloatEntryPositionV1'

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
  data() {
    return {
      left: 0,
      top: 0,
      dragging: false,
      moved: false,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0,
      positionReady: false
    }
  },
  computed: {
    safeUnreadCount() {
      return Number.isFinite(this.unreadCount) ? Math.max(0, this.unreadCount) : 0
    },
    buttonStyle() {
      return {
        left: `${this.left}px`,
        top: `${this.top}px`,
        visibility: this.positionReady ? 'visible' : 'hidden'
      }
    }
  },
  watch: {
    visible(value) {
      if (!value) {
        return
      }
      this.$nextTick(() => {
        this.ensurePosition()
      })
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
    this.$nextTick(() => {
      this.ensurePosition()
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    this.detachDragListeners()
  },
  methods: {
    handleClick() {
      if (this.moved) {
        this.moved = false
        return
      }
      this.$emit('open')
    },
    ensurePosition() {
      const button = this.$refs.entryBtn
      if (!button) {
        return
      }
      const { width, height } = button.getBoundingClientRect()
      if (!width || !height) {
        return
      }

      const stored = this.readStoredPosition()
      if (stored) {
        this.left = stored.left
        this.top = stored.top
      } else {
        const margin = window.innerWidth <= 768 ? 16 : 24
        this.left = Math.max(0, window.innerWidth - width - margin)
        this.top = Math.max(0, window.innerHeight - height - margin)
      }

      this.clampToViewport()
      this.positionReady = true
    },
    startDrag(event) {
      if (event.type === 'mousedown' && event.button !== 0) {
        return
      }
      const button = this.$refs.entryBtn
      if (!button) {
        return
      }

      const point = this.getPoint(event)
      const rect = button.getBoundingClientRect()
      this.dragging = true
      this.moved = false
      this.startX = point.x
      this.startY = point.y
      this.offsetX = point.x - rect.left
      this.offsetY = point.y - rect.top

      this.attachDragListeners()
    },
    onDragMove(event) {
      if (!this.dragging) {
        return
      }
      if (event.cancelable) {
        event.preventDefault()
      }
      const point = this.getPoint(event)
      if (Math.abs(point.x - this.startX) + Math.abs(point.y - this.startY) > 4) {
        this.moved = true
      }

      this.left = point.x - this.offsetX
      this.top = point.y - this.offsetY
      this.clampToViewport()
    },
    endDrag() {
      if (!this.dragging) {
        return
      }
      this.dragging = false
      this.detachDragListeners()
      this.clampToViewport()
      this.savePosition()
    },
    attachDragListeners() {
      document.addEventListener('mousemove', this.onDragMove)
      document.addEventListener('mouseup', this.endDrag)
      document.addEventListener('touchmove', this.onDragMove, { passive: false })
      document.addEventListener('touchend', this.endDrag)
      document.addEventListener('touchcancel', this.endDrag)
    },
    detachDragListeners() {
      document.removeEventListener('mousemove', this.onDragMove)
      document.removeEventListener('mouseup', this.endDrag)
      document.removeEventListener('touchmove', this.onDragMove)
      document.removeEventListener('touchend', this.endDrag)
      document.removeEventListener('touchcancel', this.endDrag)
    },
    handleResize() {
      this.$nextTick(() => {
        this.clampToViewport()
      })
    },
    clampToViewport() {
      const button = this.$refs.entryBtn
      if (!button) {
        return
      }
      const rect = button.getBoundingClientRect()
      const maxLeft = Math.max(0, window.innerWidth - rect.width)
      const maxTop = Math.max(0, window.innerHeight - rect.height)
      this.left = Math.min(maxLeft, Math.max(0, this.left))
      this.top = Math.min(maxTop, Math.max(0, this.top))
    },
    getPoint(event) {
      if (event.touches && event.touches.length) {
        return { x: event.touches[0].clientX, y: event.touches[0].clientY }
      }
      if (event.changedTouches && event.changedTouches.length) {
        return { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY }
      }
      return { x: event.clientX, y: event.clientY }
    },
    readStoredPosition() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) {
          return null
        }
        const data = JSON.parse(raw)
        if (!Number.isFinite(data.left) || !Number.isFinite(data.top)) {
          return null
        }
        return { left: data.left, top: data.top }
      } catch (e) {
        return null
      }
    },
    savePosition() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ left: this.left, top: this.top }))
      } catch (e) {
        // ignore storage write errors
      }
    }
  }
}
</script>

<style scoped>
.ai-float-entry {
  position: fixed;
  z-index: 80;
  border: none;
  border-radius: 999px;
  padding: 15px 20px 15px 15px;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  color: #1f2b59;
  background: linear-gradient(140deg, rgba(255, 255, 255, 0.98), rgba(242, 246, 255, 0.98));
  box-shadow: 0 18px 38px rgba(66, 89, 145, 0.28);
  cursor: move;
  user-select: none;
  touch-action: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.ai-float-entry:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 40px rgba(66, 89, 145, 0.32);
}

.entry-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(140deg, #5264ff 0%, #7d8fff 100%);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 24px;
}

.entry-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}

.entry-text strong {
  font-size: 16px;
  font-weight: 700;
}

.entry-text small {
  font-size: 13px;
  color: #7282b3;
}

.entry-badge {
  min-width: 26px;
  height: 26px;
  border-radius: 999px;
  padding: 0 6px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(140deg, #ff6b6b 0%, #ff8d68 100%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .ai-float-entry {
    padding-right: 16px;
  }

  .entry-text small {
    display: none;
  }
}
</style>


