<template>
  <div class="layout-shell">
    <div class="bg-orb orb-left" />
    <div class="bg-orb orb-right" />

    <header class="topbar">
      <div class="brand" @click="$router.push('/index/home')">
        <div class="brand-mark">A</div>
        <div class="brand-text">
          <div class="brand-cn">ACG Custom Atelier</div>
          <div class="brand-en">COS &amp; SUIT ATELIER</div>
        </div>
      </div>

      <nav class="menu">
        <router-link v-for="item in navMenus" :key="item.path" :to="item.path" class="menu-item">
          {{ item.label }}
        </router-link>
      </nav>

      <div class="actions">
        <el-button class="ghost-btn" icon="el-icon-shopping-cart-2" @click="$router.push('/index/coscart')">
          Cart
        </el-button>
        <template v-if="isLoggedIn">
          <div class="user-chip">
            <i class="el-icon-user-solid" />
            <span>{{ displayName }}</span>
          </div>
          <el-button type="text" class="logout-btn" @click="logout">Logout</el-button>
        </template>
        <template v-else>
          <el-button type="primary" size="mini" round @click="$router.push('/login')">Login</el-button>
          <el-button
            size="mini"
            round
            @click="$router.push({ path: '/register', query: { role: 'yonghu', pageFlag: 'register' } })"
          >
            Register
          </el-button>
        </template>
      </div>
    </header>

    <main class="page-wrap">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'Index',
  computed: {
    isAdmin() {
      const tableName = localStorage.getItem('sessionTable') || localStorage.getItem('UserTableName') || ''
      return tableName === 'users'
    },
    isDesigner() {
      const tableName = localStorage.getItem('sessionTable') || localStorage.getItem('UserTableName') || ''
      return tableName === 'shejishi'
    },
    isLoggedIn() {
      return !!localStorage.getItem('Token')
    },
    displayName() {
      return localStorage.getItem('username') || localStorage.getItem('adminName') || localStorage.getItem('role') || 'Guest'
    },
    navMenus() {
      const baseMenus = [
        { label: 'Home', path: '/index/home' },
        { label: 'Browse', path: '/index/browse' },
        { label: 'Orders', path: '/index/cosorder' }
      ]
      if (this.isAdmin) {
        baseMenus.push({ label: 'Admin Orders', path: '/index/cosorder-admin' })
      }
      if (this.isDesigner) {
        baseMenus.push({ label: 'Designer Desk', path: '/index/cosorder-designer' })
      }
      return baseMenus
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('Token')
      localStorage.removeItem('UserTableName')
      localStorage.removeItem('sessionTable')
      localStorage.removeItem('role')
      localStorage.removeItem('username')
      localStorage.removeItem('adminName')
      localStorage.removeItem('userid')
      localStorage.removeItem('userId')
      this.$message.success('Logged out')
      this.$router.push('/login')
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

.menu-item.router-link-active {
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