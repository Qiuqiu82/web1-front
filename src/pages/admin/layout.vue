<template>
  <div class="admin-shell">
    <header class="admin-topbar">
      <div class="brand" @click="$router.push('/admin/dashboard')">
        <div class="brand-mark">COS</div>
        <div>
          <div class="brand-title">管理后台</div>
          <div class="brand-sub">订单协同与运营管理中心</div>
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
        <div class="admin-chip">
          <i class="el-icon-user-solid" />
          <span>{{ displayName }}</span>
        </div>
        <el-button type="text" class="logout-btn" @click="logout">退出登录</el-button>
      </div>
    </header>

    <div class="admin-main">
      <aside v-if="!isMobile" class="admin-sidebar">
        <div class="menu-title">管理功能</div>
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

      <main class="admin-content">
        <router-view />
      </main>
    </div>

    <transition name="fade">
      <div v-if="isMobile && drawerVisible" class="drawer-mask" @click="drawerVisible = false" />
    </transition>

    <transition name="slide">
      <aside v-if="isMobile" class="mobile-sidebar" :class="{ open: drawerVisible }">
        <div class="mobile-head">
          <strong>管理菜单</strong>
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
  name: 'AdminLayout',
  data() {
    return {
      isMobile: false,
      drawerVisible: false,
      menuItems: [
        { label: '数据概览', path: '/admin/dashboard', icon: 'el-icon-data-analysis' },
        { label: '角色权限管理', path: '/admin/roles', icon: 'el-icon-s-check' },
        { label: '服装素材管理', path: '/admin/materials', icon: 'el-icon-picture-outline' },
        { label: '订单生产管理', path: '/admin/orders', icon: 'el-icon-s-order' }
      ]
    }
  },
  computed: {
    displayName() {
      return localStorage.getItem('username') || localStorage.getItem('adminName') || '管理员'
    }
  },
  created() {
    this.handleResize()
    this.ensureAdminAccess()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  watch: {
    '$route.path'() {
      this.drawerVisible = false
      this.ensureAdminAccess()
    }
  },
  methods: {
    handleResize() {
      this.isMobile = window.innerWidth <= 900
      if (!this.isMobile) {
        this.drawerVisible = false
      }
    },
    ensureAdminAccess() {
      const token = localStorage.getItem('Token') || ''
      const tableName = localStorage.getItem('sessionTable') || localStorage.getItem('UserTableName') || ''
      if (!token) {
        this.$message.warning('请先登录后访问管理后台')
        this.$router.replace('/login')
        return false
      }
      if (tableName !== 'users') {
        this.$message.error('仅管理员可访问管理后台')
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
      this.$router.replace('/login')
    }
  }
}
</script>

<style scoped>
.admin-shell {
  min-height: 100vh;
  background: linear-gradient(180deg, #eef3ff 0%, #f5f7ff 48%, #f7f8fc 100%);
}

.admin-topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  height: 68px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(105deg, #2f4399 0%, #4f63c5 56%, #6f81dc 100%);
  box-shadow: 0 10px 24px rgba(39, 58, 126, 0.24);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
  cursor: pointer;
}

.brand-mark {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.34);
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
}

.brand-title {
  font-size: 18px;
  font-weight: 700;
}

.brand-sub {
  margin-top: 2px;
  font-size: 12px;
  color: rgba(239, 244, 255, 0.9);
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mobile-trigger {
  border-radius: 10px;
  border-color: rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}

.admin-chip {
  height: 36px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.38);
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.logout-btn {
  color: #f3f6ff;
  font-weight: 600;
}

.admin-main {
  display: flex;
  min-height: calc(100vh - 68px);
}

.admin-sidebar {
  width: 236px;
  background: rgba(255, 255, 255, 0.92);
  border-right: 1px solid #e3e9ff;
  box-shadow: 8px 0 26px rgba(56, 79, 149, 0.08);
  padding: 16px 12px;
}

.menu-title {
  margin: 4px 8px 12px;
  color: #8c97ba;
  font-size: 12px;
  letter-spacing: 1px;
}

.menu-item {
  height: 44px;
  border-radius: 12px;
  color: #30447f;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.menu-item + .menu-item {
  margin-top: 8px;
}

.menu-item:hover {
  background: #eef2ff;
}

.menu-item.active {
  color: #fff;
  background: linear-gradient(135deg, #4c60c7 0%, #6176df 100%);
  box-shadow: 0 8px 18px rgba(76, 96, 199, 0.28);
}

.admin-content {
  flex: 1;
  padding: 18px;
  min-width: 0;
}

.drawer-mask {
  position: fixed;
  inset: 68px 0 0;
  background: rgba(17, 24, 48, 0.35);
  z-index: 45;
}

.mobile-sidebar {
  position: fixed;
  left: 0;
  top: 68px;
  bottom: 0;
  width: 250px;
  background: #fff;
  border-right: 1px solid #e2e7fb;
  padding: 14px 12px;
  transform: translateX(-100%);
  transition: transform 0.24s ease;
  z-index: 50;
}

.mobile-sidebar.open {
  transform: translateX(0);
}

.mobile-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #2d3f79;
  padding: 4px 8px 12px;
}

.mobile-head i {
  cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
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
  .admin-topbar {
    padding: 0 14px;
  }

  .brand-sub {
    display: none;
  }

  .admin-content {
    padding: 12px;
  }

  .admin-chip {
    display: none;
  }
}
</style>