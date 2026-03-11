<template>
  <div class="layout-shell">
    <div class="bg-orb orb-left" />
    <div class="bg-orb orb-right" />

    <header class="topbar">
      <div class="brand" @click="$router.push('/index/home')">
        <div class="brand-mark">衣</div>
        <div class="brand-text">
          <div class="brand-cn">角色扮演定制服装工坊</div>
          <div class="brand-en">CUSTOM ATELIER PLATFORM</div>
        </div>
      </div>

      <nav class="menu">
        <a
          v-for="item in navMenus"
          :key="item.path"
          href="javascript:void(0)"
          class="menu-item"
          :class="{ active: isMenuActive(item) }"
          @click="handleMenuClick(item)"
        >
          {{ item.label }}
        </a>
      </nav>

      <div class="actions">
        <el-button
          v-if="isUser"
          class="ghost-btn"
          icon="el-icon-shopping-cart-2"
          @click="$router.push('/index/coscart')"
        >
          购物车
        </el-button>
        <template v-if="isLoggedIn">
          <div class="user-chip">
            <i class="el-icon-user-solid" />
            <span>{{ displayName }}</span>
          </div>
          <el-button type="text" class="logout-btn" @click="logout">退出登录</el-button>
        </template>
        <template v-else>
          <el-button type="primary" size="mini" round @click="openAuth('login', 'yonghu')">登录</el-button>
          <el-button size="mini" round @click="openAuth('register', 'yonghu')">注册</el-button>
        </template>
      </div>
    </header>

    <main class="page-wrap">
      <router-view />
    </main>

    <ai-chat-float-entry
      :visible="showAiFloatEntry"
      :unread-count="aiUnreadCount"
      @open="openAiChatByEntry"
    />

    <ai-chat-drawer
      :visible="aiDrawerVisible"
      :messages="aiMessages"
      :sending="aiSending || aiTyping"
      :waiting="aiSending"
      :session-id="aiSessionId"
      @close="aiDrawerVisible = false"
      @send="handleAiSend"
    />
    <auth-dialog
      :visible.sync="authDialog.visible"
      :mode="authDialog.mode"
      :default-role="authDialog.role"
      :redirect="authDialog.redirect"
      @success="handleAuthSuccess"
      @close="handleAuthClose"
    />
  </div>
</template>

<script>
import AuthDialog from '@/components/AuthDialog'
import AiChatFloatEntry from '@/components/AiChatFloatEntry'
import AiChatDrawer from '@/components/AiChatDrawer'

export default {
  name: 'Index',
  components: {
    AuthDialog,
    AiChatFloatEntry,
    AiChatDrawer
  },
  data() {
    return {
      authVersion: 0,
      authDialog: {
        visible: false,
        mode: 'login',
        role: 'yonghu',
        redirect: null
      },
      authRouteSignature: '',
      aiDrawerVisible: false,
      aiMessages: [],
      aiSending: false,
      aiTyping: false,
      aiTypingTimer: null,
      aiSessionId: '',
      aiPendingAutoOpen: false,
      aiUnreadCount: 0
    }
  },
  computed: {
    tableName() {
      this.authVersion
      return localStorage.getItem('sessionTable') || localStorage.getItem('UserTableName') || ''
    },
    isAdmin() {
      return this.tableName === 'users'
    },
    isDesigner() {
      return this.tableName === 'shejishi'
    },
    isUser() {
      return this.tableName === 'yonghu'
    },
    isLoggedIn() {
      this.authVersion
      return !!localStorage.getItem('Token')
    },
    displayName() {
      this.authVersion
      return localStorage.getItem('username') || localStorage.getItem('adminName') || '访客'
    },
    showAiFloatEntry() {
      return this.$route.path.indexOf('/index/') === 0
    },
    navMenus() {
      const menus = [
        { label: '首页', path: '/index/home' },
        { label: '服装浏览', path: '/index/browse' },
        { label: '3D试穿', path: '/index/tryon' },
        { label: '我的订单', path: '/index/cosorder', requiresAuth: true, roleHint: 'yonghu' }
      ]
      if (this.isUser) {
        menus.push({ label: '个人中心', path: '/index/profile', requiresAuth: true, roleHint: 'yonghu' })
      }
      if (this.isAdmin) {
        menus.push({ label: '管理后台', path: '/admin/dashboard', requiresAuth: true, roleHint: 'users' })
        menus.push({ label: '权限角色', path: '/admin/roles', requiresAuth: true, roleHint: 'users' })
      }
      if (this.isDesigner) {
        menus.push({ label: '设计师工作台', path: '/designer/workbench', requiresAuth: true, roleHint: 'shejishi' })
      }
      return menus
    }
  },
  watch: {
    '$route.fullPath': {
      immediate: true,
      handler() {
        this.consumeAuthRouteQuery()
        this.consumeAiRouteQuery()
      }
    }
  },
  created() {
    this.$authDialogBus.$on('open', this.handleBusOpen)
    this.$authDialogBus.$on('close', this.closeAuthDialog)
  },
  beforeDestroy() {
    this.$authDialogBus.$off('open', this.handleBusOpen)
    this.$authDialogBus.$off('close', this.closeAuthDialog)
    this.clearAiTypingTimer()
  },
  methods: {
    isMenuActive(item) {
      return this.$route.path === item.path
    },
    handleMenuClick(item) {
      if (item.requiresAuth && !this.isLoggedIn) {
        this.openAuth('login', item.roleHint || 'yonghu', { path: item.path })
        return
      }
      this.$router.push(item.path)
    },
    normalizeRole(role) {
      return role === 'shejishi' ? 'shejishi' : 'yonghu'
    },
    handleBusOpen(payload = {}) {
      this.openAuth(payload.mode || 'login', payload.role || 'yonghu', payload.redirect || null)
    },
    consumeAuthRouteQuery() {
      const auth = this.$route.query.auth
      if (['login', 'register'].indexOf(auth) === -1) {
        return
      }
      const role = this.normalizeRole(this.$route.query.role)
      const redirect = typeof this.$route.query.redirect === 'string' ? this.$route.query.redirect : null
      const signature = [this.$route.path, auth, role, redirect || ''].join('|')
      if (this.authRouteSignature === signature && this.authDialog.visible) {
        return
      }
      this.authRouteSignature = signature
      this.openAuth(auth, role, redirect)
    },
    openAuth(mode = 'login', role = 'yonghu', redirect = null) {
      this.authDialog = {
        visible: true,
        mode: mode === 'register' ? 'register' : 'login',
        role: this.normalizeRole(role),
        redirect
      }
    },
    closeAuthDialog() {
      this.authDialog.visible = false
      this.clearAuthRedirect()
      this.clearAuthRouteQuery()
    },
    clearAuthRedirect() {
      this.authDialog.redirect = null
    },
    clearAuthRouteQuery() {
      const query = { ...this.$route.query }
      let changed = false
      ;['auth', 'role', 'redirect'].forEach((key) => {
        if (query[key] !== undefined) {
          delete query[key]
          changed = true
        }
      })
      this.authRouteSignature = ''
      if (changed) {
        this.$router.replace({ path: this.$route.path, query }).catch(() => {})
      }
    },
    handleAuthClose() {
      this.closeAuthDialog()
    },
    handleAuthSuccess() {
      this.authVersion += 1
      if (this.aiPendingAutoOpen && this.isLoggedIn) {
        this.aiDrawerVisible = true
        this.aiUnreadCount = 0
        this.aiPendingAutoOpen = false
      }
    },
    consumeAiRouteQuery() {
      if (this.$route.query.ai !== 'open') {
        return
      }
      if (!this.isLoggedIn) {
        this.aiPendingAutoOpen = true
        return
      }
      this.aiDrawerVisible = true
      this.aiUnreadCount = 0
      this.aiPendingAutoOpen = false
      this.clearAiRouteQuery()
    },
    clearAiRouteQuery() {
      const query = { ...this.$route.query }
      if (query.ai === undefined) {
        return
      }
      delete query.ai
      this.$router.replace({ path: this.$route.path, query }).catch(() => {})
    },
    buildAiRedirect() {
      const query = { ...this.$route.query, ai: 'open' }
      return { path: this.$route.path, query }
    },
    openAiChatByEntry() {
      if (!this.isLoggedIn) {
        this.aiPendingAutoOpen = true
        this.openAuth('login', 'yonghu', this.buildAiRedirect())
        return
      }
      this.aiDrawerVisible = true
      this.aiUnreadCount = 0
    },
    clearAiTypingTimer() {
      if (this.aiTypingTimer) {
        clearInterval(this.aiTypingTimer)
        this.aiTypingTimer = null
      }
    },
    appendAiMessage(role, content, extra = {}) {
      this.aiMessages.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        role,
        content,
        createdAt: new Date().toISOString(),
        recommendations: Array.isArray(extra.recommendations) ? extra.recommendations : []
      })
      if (role === 'assistant' && !this.aiDrawerVisible) {
        this.aiUnreadCount += 1
      }
    },
    async typeAssistantMessage(answer, recommendations = []) {
      const fullText = String(answer || '')
      if (!fullText) {
        this.appendAiMessage('assistant', '暂时没有生成回复，请换个问法试试。', { recommendations })
        return
      }

      this.clearAiTypingTimer()
      this.aiTyping = true

      const target = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        recommendations: Array.isArray(recommendations) ? recommendations : []
      }
      this.aiMessages.push(target)
      if (!this.aiDrawerVisible) {
        this.aiUnreadCount += 1
      }

      const index = this.aiMessages.length - 1
      const charDelay = fullText.length > 300 ? 8 : fullText.length > 160 ? 12 : 18

      await new Promise((resolve) => {
        let cursor = 0
        this.aiTypingTimer = setInterval(() => {
          cursor += 1
          this.$set(this.aiMessages[index], 'content', fullText.slice(0, cursor))
          if (cursor >= fullText.length) {
            this.clearAiTypingTimer()
            this.aiTyping = false
            resolve()
          }
        }, charDelay)
      })
    },
    async handleAiSend(message) {
      const text = String(message || '').trim()
      if (!text || this.aiSending || this.aiTyping) {
        return
      }
      if (!this.isLoggedIn) {
        this.openAiChatByEntry()
        return
      }

      this.appendAiMessage('user', text)
      this.aiSending = true
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.aiChatSend,
        method: 'post',
        dataType: 'json',
        showLoading: false,
        timeout: 120 * 1000,
        params: {
          message: text,
          sourcePage: this.$route.path,
          sessionId: this.aiSessionId || null
        }
      })
      this.aiSending = false

      const successCode = Number(res && res.code)
      if (!res || (successCode !== 0 && successCode !== 200)) {
        this.appendAiMessage('assistant', (res && res.msg) || 'AI 服务暂时不可用，请稍后再试。')
        return
      }

      const data = res.data || {}
      if (data.sessionId) {
        this.aiSessionId = String(data.sessionId)
      }
      await this.typeAssistantMessage(data.answer, data.recommendations || [])
    },
    logout() {
      localStorage.removeItem('Token')
      localStorage.removeItem('UserTableName')
      localStorage.removeItem('sessionTable')
      localStorage.removeItem('role')
      localStorage.removeItem('username')
      localStorage.removeItem('adminName')
      localStorage.removeItem('userid')
      localStorage.removeItem('userId')
      this.authVersion += 1
      this.$message.success('已退出登录')
      this.$router.push('/index/home')
    }
  }
}
</script>

<style scoped>
.layout-shell {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(180deg, #f4f8ff 0%, #f8f7fc 42%, #f3f5fb 100%);
  overflow: hidden;
}

.bg-orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(2px);
  opacity: 0.5;
  pointer-events: none;
}

.orb-left {
  width: 320px;
  height: 320px;
  background: radial-gradient(circle at center, rgba(129, 158, 255, 0.4), rgba(129, 158, 255, 0));
  top: -80px;
  left: -80px;
}

.orb-right {
  width: 420px;
  height: 420px;
  background: radial-gradient(circle at center, rgba(255, 182, 146, 0.35), rgba(255, 182, 146, 0));
  top: -120px;
  right: -140px;
}

.topbar {
  width: min(1320px, calc(100% - 40px));
  margin: 16px auto 0;
  padding: 14px 18px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.75);
  box-shadow: 0 14px 40px rgba(66, 89, 145, 0.12);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  position: sticky;
  top: 12px;
  z-index: 20;
}

.brand {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(140deg, #5264ff 0%, #7d8fff 65%, #9ba8ff 100%);
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  display: grid;
  place-items: center;
  box-shadow: 0 8px 20px rgba(82, 100, 255, 0.35);
}

.brand-cn {
  font-size: 17px;
  font-weight: 700;
  color: #1f2b59;
}

.brand-en {
  margin-top: 2px;
  font-size: 11px;
  letter-spacing: 1.4px;
  color: #8290b8;
}

.menu {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.menu-item {
  text-decoration: none;
  color: #33406d;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: rgba(82, 100, 255, 0.08);
  color: #4455d4;
}

.menu-item.active {
  background: linear-gradient(140deg, #5264ff 0%, #7385ff 100%);
  color: #fff;
  box-shadow: 0 8px 16px rgba(82, 100, 255, 0.28);
}

.actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ghost-btn {
  border-radius: 12px;
  border: 1px solid #d9e0ff;
  background: #fff;
  color: #3d4b80;
}

.user-chip {
  border-radius: 999px;
  border: 1px solid #dbe2ff;
  background: #fff;
  color: #2f3c72;
  padding: 7px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.logout-btn {
  color: #5a66a0;
  font-weight: 600;
}

.page-wrap {
  width: min(1320px, calc(100% - 40px));
  margin: 18px auto 0;
  padding-bottom: 32px;
}

@media (max-width: 1160px) {
  .topbar {
    flex-wrap: wrap;
    position: relative;
    top: 0;
  }

  .actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>









