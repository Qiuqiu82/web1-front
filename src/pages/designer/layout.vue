<template>
  <div class="designer-shell">
    <header class="designer-topbar">
      <div class="brand" @click="$router.push('/designer/workbench')">
        <div class="brand-mark">DS</div>
        <div>
          <div class="brand-title">设计师中心</div>
          <div class="brand-sub">接单履约与个人成长工作台</div>
        </div>
      </div>

      <div class="top-actions">
        <el-button
          v-if="isMobile"
          class="mobile-trigger"
          icon="el-icon-s-operation"
          @click="drawerVisible = !drawerVisible"
        >
          菜单
        </el-button>
        <div class="designer-chip">
          <i class="el-icon-user-solid" />
          <span>{{ displayName }}</span>
        </div>
        <el-button type="text" class="logout-btn" @click="logout">退出登录</el-button>
      </div>
    </header>

    <div class="designer-main">
      <aside v-if="!isMobile" class="designer-sidebar">
        <div class="menu-title">设计师模块</div>
        <div
          v-for="item in menuItems"
          :key="item.path"
          class="menu-item"
          :class="{ active: isActive(item.path) }"
          @click="go(item.path)"
        >
          <i :class="item.icon" />
          <span>{{ item.label }}</span>
        </div>
      </aside>

      <main class="designer-content">
        <router-view />
      </main>
    </div>

    <transition name="fade">
      <div v-if="isMobile && drawerVisible" class="drawer-mask" @click="drawerVisible = false" />
    </transition>

    <transition name="slide">
      <aside v-if="isMobile" class="mobile-sidebar" :class="{ open: drawerVisible }">
        <div class="mobile-head">
          <strong>设计师菜单</strong>
          <i class="el-icon-close" @click="drawerVisible = false" />
        </div>
        <div
          v-for="item in menuItems"
          :key="`mobile-${item.path}`"
          class="menu-item"
          :class="{ active: isActive(item.path) }"
          @click="go(item.path)"
        >
          <i :class="item.icon" />
          <span>{{ item.label }}</span>
        </div>
      </aside>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'DesignerLayout',
  data() {
    return {
      isMobile: false,
      drawerVisible: false,
      menuItems: [
        { label: '工作台', path: '/designer/workbench', icon: 'el-icon-s-home' },
        { label: '订单管理', path: '/designer/orders', icon: 'el-icon-s-order' },
        { label: '用户沟通', path: '/designer/communication', icon: 'el-icon-chat-dot-round' },
        { label: '资料与作品', path: '/designer/profile', icon: 'el-icon-user' },
        { label: '收益看板', path: '/designer/revenue', icon: 'el-icon-data-analysis' }
      ]
    }
  },
  computed: {
    displayName() {
      return localStorage.getItem('username') || '设计师'
    }
  },
  created() {
    this.handleResize()
    this.ensureDesignerAccess()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  watch: {
    '$route.path'() {
      this.drawerVisible = false
      this.ensureDesignerAccess()
    }
  },
  methods: {
    handleResize() {
      this.isMobile = window.innerWidth <= 900
      if (!this.isMobile) {
        this.drawerVisible = false
      }
    },
    ensureDesignerAccess() {
      const token = localStorage.getItem('Token') || ''
      const tableName = localStorage.getItem('sessionTable') || localStorage.getItem('UserTableName') || ''
      if (!token) {
        this.$message.warning('请先登录后访问设计师中心')
        this.$router.replace({ path: '/login', query: { role: 'shejishi' } })
        return false
      }
      if (tableName !== 'shejishi') {
        this.$message.error('仅设计师可访问该页面')
        this.$router.replace('/index/home')
        return false
      }
      return true
    },
    isActive(path) {
      return this.$route.path === path
    },
    go(path) {
      if (this.$route.path !== path) {
        this.$router.push(path)
      }
      this.drawerVisible = false
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
      this.$message.success('已退出登录')
      this.$router.replace({ path: '/login', query: { role: 'shejishi' } })
    }
  }
}
</script>

<style scoped>
.designer-shell {
  min-height: 100vh;
  background: linear-gradient(180deg, #f4f7ff 0%, #f7f8fc 100%);
}

.designer-topbar {
  width: min(1380px, calc(100% - 32px));
  margin: 0 auto;
  padding: 16px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.brand-mark {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 700;
  background: linear-gradient(135deg, #24346f 0%, #5d76dc 100%);
}

.brand-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2b59;
}

.brand-sub {
  margin-top: 4px;
  font-size: 12px;
  color: #8190ba;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mobile-trigger,
.designer-chip {
  border-radius: 12px;
  background: #fff;
  border: 1px solid #dce3ff;
}

.designer-chip {
  padding: 8px 12px;
  color: #304073;
  display: flex;
  align-items: center;
  gap: 6px;
}

.logout-btn {
  color: #5a66a0;
  font-weight: 600;
}

.designer-main {
  width: min(1380px, calc(100% - 32px));
  margin: 0 auto;
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 18px;
  padding-bottom: 24px;
}

.designer-sidebar,
.mobile-sidebar {
  background: #fff;
  border: 1px solid #e4e9ff;
  border-radius: 20px;
  box-shadow: 0 18px 40px rgba(77, 93, 151, 0.08);
}

.designer-sidebar {
  padding: 18px;
  align-self: start;
  position: sticky;
  top: 12px;
}

.menu-title {
  font-size: 13px;
  font-weight: 700;
  color: #8a95b6;
  margin-bottom: 12px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 14px;
  padding: 12px 14px;
  color: #33406d;
  cursor: pointer;
  transition: all 0.2s ease;
}

.menu-item + .menu-item {
  margin-top: 8px;
}

.menu-item:hover,
.menu-item.active {
  background: linear-gradient(135deg, #eef2ff 0%, #f7f8ff 100%);
  color: #2a3b74;
}

.designer-content {
  min-width: 0;
}

.drawer-mask {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 53, 0.34);
  z-index: 20;
}

.mobile-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  z-index: 30;
  transform: translateX(-100%);
  transition: transform 0.24s ease;
  padding: 18px;
}

.mobile-sidebar.open {
  transform: translateX(0);
}

.mobile-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  color: #22315d;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.24s ease;
}

.slide-enter,
.slide-leave-to {
  transform: translateX(-100%);
}

@media (max-width: 900px) {
  .designer-main {
    grid-template-columns: 1fr;
  }
}
</style>
