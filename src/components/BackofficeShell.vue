<template>
  <div class="backoffice-shell" :class="`theme-${theme}`" :style="themeVars">
    <header class="backoffice-header">
      <div class="header-left">
        <div class="brand-box" @click="navigate(homePath)">
          <div class="brand-mark">{{ brandMark }}</div>
          <div>
            <div class="brand-title">{{ brandTitle }}</div>
            <div class="brand-subtitle">{{ brandSubtitle }}</div>
          </div>
        </div>
        <div class="scene-chip">
          <span class="scene-dot"></span>
          <span>{{ roleLabel }}</span>
        </div>
      </div>

      <div class="header-center">
        <div class="search-box">
          <i class="el-icon-search"></i>
          <input
            v-model.trim="searchKeyword"
            type="text"
            :placeholder="searchPlaceholder"
            @keyup.enter="handleSearch"
          />
        </div>
      </div>

      <div class="header-right">
        <button class="icon-btn" type="button" @click="handleHelp">
          <i class="el-icon-question"></i>
        </button>
        <button class="icon-btn" type="button" @click="handleNotice">
          <i class="el-icon-bell"></i>
        </button>
        <div class="user-box">
          <div class="user-avatar">{{ avatarText }}</div>
          <div>
            <div class="user-name">{{ displayName }}</div>
            <div class="user-role">{{ roleLabel }}</div>
          </div>
        </div>
        <el-button type="text" class="logout-link" @click="$emit('logout')">退出登录</el-button>
        <button v-if="isMobile" class="mobile-menu-btn" type="button" @click="drawerVisible = !drawerVisible">
          <i class="el-icon-s-operation"></i>
        </button>
      </div>
    </header>

    <div class="backoffice-frame">
      <aside v-if="!isMobile" class="backoffice-sidebar">
        <div class="sidebar-title">导航</div>
        <div class="menu-list">
          <button
            v-for="item in menuItems"
            :key="item.path"
            type="button"
            class="menu-item"
            :class="{ active: isActive(item.path) }"
            @click="navigate(item.path)"
          >
            <i :class="item.icon"></i>
            <div class="menu-copy">
              <span>{{ item.label }}</span>
              <small>{{ item.short || item.description }}</small>
            </div>
          </button>
        </div>
      </aside>

      <main class="backoffice-main">
        <section class="page-bar">
          <div>
            <div class="page-kicker">{{ roleLabel }}</div>
            <h1>{{ currentContext.label }}</h1>
            <p>{{ currentContext.description }}</p>
          </div>
          <div class="page-meta">
            <div class="meta-pill">
              <i class="el-icon-date"></i>
              <span>{{ currentDateLabel }}</span>
            </div>
            <div class="meta-pill accent">
              <i class="el-icon-s-grid"></i>
              <span>{{ currentContext.short || currentContext.label }}</span>
            </div>
          </div>
        </section>

        <div class="content-scroll" :class="{ 'is-home': currentContext.isHome }">
          <slot />
        </div>
      </main>
    </div>

    <transition name="shell-fade">
      <div v-if="isMobile && drawerVisible" class="drawer-mask" @click="drawerVisible = false"></div>
    </transition>

    <transition name="shell-slide">
      <aside v-if="isMobile" class="mobile-sidebar" :class="{ open: drawerVisible }">
        <div class="mobile-head">
          <div>
            <strong>{{ brandTitle }}</strong>
            <p>{{ roleLabel }}</p>
          </div>
          <button type="button" class="icon-btn" @click="drawerVisible = false">
            <i class="el-icon-close"></i>
          </button>
        </div>
        <div class="menu-list">
          <button
            v-for="item in menuItems"
            :key="`mobile-${item.path}`"
            type="button"
            class="menu-item"
            :class="{ active: isActive(item.path) }"
            @click="navigate(item.path)"
          >
            <i :class="item.icon"></i>
            <div class="menu-copy">
              <span>{{ item.label }}</span>
              <small>{{ item.short || item.description }}</small>
            </div>
          </button>
        </div>
      </aside>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'BackofficeShell',
  props: {
    theme: {
      type: String,
      default: 'admin'
    },
    brandMark: {
      type: String,
      default: 'BK'
    },
    brandTitle: {
      type: String,
      default: '后台工作台'
    },
    brandSubtitle: {
      type: String,
      default: '统一后台管理中心'
    },
    roleLabel: {
      type: String,
      default: '后台'
    },
    displayName: {
      type: String,
      default: '管理员'
    },
    homePath: {
      type: String,
      default: '/'
    },
    menuItems: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isMobile: false,
      drawerVisible: false,
      searchKeyword: ''
    }
  },
  computed: {
    themeVars() {
      if (this.theme === 'designer') {
        return {
          '--shell-bg': '#f4f6fb',
          '--panel-bg': '#ffffff',
          '--line-color': '#e5eafb',
          '--text-main': '#1f2a4a',
          '--text-sub': '#7d8ab2',
          '--accent': '#5b6ef5',
          '--accent-soft': '#eef1ff',
          '--accent-border': '#dbe2ff',
          '--sidebar-bg': '#ffffff',
          '--sidebar-hover': '#f4f6ff',
          '--sidebar-active': 'linear-gradient(135deg, #eef2ff 0%, #f7f8ff 100%)',
          '--shadow-color': 'rgba(75, 97, 173, 0.12)'
        }
      }
      return {
        '--shell-bg': '#f6f7fb',
        '--panel-bg': '#ffffff',
        '--line-color': '#ece7df',
        '--text-main': '#2a2f3d',
        '--text-sub': '#8b93a9',
        '--accent': '#ff8b4d',
        '--accent-soft': '#fff4ec',
        '--accent-border': '#ffe1cf',
        '--sidebar-bg': '#ffffff',
        '--sidebar-hover': '#fff8f2',
        '--sidebar-active': 'linear-gradient(135deg, #fff6ee 0%, #fffaf5 100%)',
        '--shadow-color': 'rgba(97, 79, 59, 0.1)'
      }
    },
    currentContext() {
      const exact = this.menuItems.find((item) => item.path === this.$route.path)
      if (exact) {
        return exact
      }
      const prefix = this.menuItems.find((item) => this.$route.path.indexOf(item.path) === 0)
      return prefix || this.menuItems[0] || { label: '后台页面', description: '统一后台工作区', short: '工作台', isHome: false }
    },
    currentDateLabel() {
      const now = new Date()
      const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const week = weekNames[now.getDay()]
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${week}`
    },
    avatarText() {
      return String(this.displayName || this.roleLabel || 'U').slice(0, 1).toUpperCase()
    },
    searchPlaceholder() {
      return `支持按菜单名称搜索，例如：${(this.menuItems[0] && this.menuItems[0].label) || '工作台'}`
    }
  },
  created() {
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  watch: {
    '$route.path'() {
      this.drawerVisible = false
    }
  },
  methods: {
    handleResize() {
      this.isMobile = window.innerWidth <= 1080
      if (!this.isMobile) {
        this.drawerVisible = false
      }
    },
    isActive(path) {
      return this.$route.path === path
    },
    navigate(path) {
      this.drawerVisible = false
      this.$emit('navigate', path)
    },
    handleSearch() {
      const keyword = String(this.searchKeyword || '').trim().toLowerCase()
      if (!keyword) {
        this.$message.info('输入菜单关键词后可快速跳转后台页面')
        return
      }
      const target = this.menuItems.find((item) => {
        const source = `${item.label || ''} ${item.short || ''} ${item.description || ''}`.toLowerCase()
        return source.includes(keyword)
      })
      if (!target) {
        this.$message.warning('没有找到匹配的后台页面')
        return
      }
      this.navigate(target.path)
    },
    handleHelp() {
      this.$message.info('当前已切换为整屏后台模式，支持从左侧菜单快速切换页面。')
    },
    handleNotice() {
      this.$message.info(`当前焦点页面：${this.currentContext.label}`)
    }
  }
}
</script>

<style>
.backoffice-shell {
  min-height: 100vh;
  height: 100vh;
  background: var(--shell-bg);
  color: var(--text-main);
  overflow: hidden;
}

.backoffice-header {
  height: 72px;
  padding: 0 22px;
  display: grid;
  grid-template-columns: auto minmax(280px, 520px) auto;
  align-items: center;
  gap: 18px;
  border-bottom: 1px solid var(--line-color);
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(10px);
}

.backoffice-header .header-left,
.backoffice-header .header-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.backoffice-header .header-right {
  justify-content: flex-end;
}

.backoffice-shell .brand-box {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.backoffice-shell .brand-mark {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, var(--accent) 0%, #ffb273 100%);
}

.theme-designer .backoffice-shell .brand-mark {
  background: linear-gradient(135deg, var(--accent) 0%, #8a8eff 100%);
}

.backoffice-shell .brand-title {
  font-size: 18px;
  font-weight: 700;
}

.backoffice-shell .brand-subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-sub);
}

.backoffice-shell .scene-chip,
.meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  background: var(--accent-soft);
  border: 1px solid var(--accent-border);
  color: var(--text-main);
  font-size: 13px;
}

.backoffice-shell .scene-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--accent);
}

.backoffice-header .header-center {
  width: 100%;
}

.backoffice-shell .search-box {
  height: 42px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--line-color);
  background: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.backoffice-shell .search-box i {
  color: #9aa4bf;
}

.backoffice-shell .search-box input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-main);
  font-size: 14px;
}

.backoffice-shell .search-box input::placeholder {
  color: #a0a8bd;
}

.backoffice-shell .icon-btn,
.backoffice-shell .mobile-menu-btn {
  width: 38px;
  height: 38px;
  border: 1px solid var(--line-color);
  border-radius: 12px;
  background: #fff;
  color: #66708e;
  cursor: pointer;
}

.backoffice-shell .user-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px 6px 6px;
  border-radius: 999px;
  border: 1px solid var(--line-color);
  background: #fff;
}

.backoffice-shell .user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 700;
}

.backoffice-shell .user-name {
  font-size: 13px;
  font-weight: 700;
}

.backoffice-shell .user-role {
  margin-top: 2px;
  font-size: 12px;
  color: var(--text-sub);
}

.backoffice-shell .logout-link {
  color: #7f889e;
  font-weight: 600;
}

.backoffice-frame {
  height: calc(100vh - 72px);
  display: grid;
  grid-template-columns: 236px minmax(0, 1fr);
}

.backoffice-sidebar,
.backoffice-shell .mobile-sidebar {
  background: var(--sidebar-bg);
  border-right: 1px solid var(--line-color);
}

.backoffice-sidebar {
  padding: 18px 14px;
  overflow: auto;
}

.backoffice-shell .sidebar-title {
  padding: 0 10px 12px;
  color: #96a0ba;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.backoffice-shell .menu-list {
  display: grid;
  gap: 8px;
}

.backoffice-shell .menu-item {
  width: 100%;
  padding: 13px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid transparent;
  border-radius: 18px;
  background: transparent;
  color: #425073;
  cursor: pointer;
  text-align: left;
}

.backoffice-shell .menu-item i {
  width: 18px;
  text-align: center;
}

.backoffice-shell .menu-copy span {
  display: block;
  font-weight: 700;
}

.backoffice-shell .menu-copy small {
  display: block;
  margin-top: 4px;
  color: #97a0ba;
  font-size: 12px;
}

.backoffice-shell .menu-item:hover {
  background: var(--sidebar-hover);
  border-color: var(--line-color);
}

.backoffice-shell .menu-item.active {
  background: var(--sidebar-active);
  border-color: var(--accent-border);
  box-shadow: 0 12px 24px var(--shadow-color);
}

.backoffice-shell .menu-item.active span,
.menu-item.active i {
  color: var(--accent);
}

.backoffice-main {
  min-width: 0;
  height: calc(100vh - 72px);
  overflow: hidden;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.page-bar {
  margin: 18px 18px 0;
  padding: 20px 22px;
  border: 1px solid var(--line-color);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255,255,255,0.96) 0%, #ffffff 100%);
  box-shadow: 0 16px 30px var(--shadow-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-kicker {
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);
  font-weight: 700;
}

.page-bar h1 {
  margin-top: 8px;
  font-size: 28px;
  color: var(--text-main);
}

.page-bar p {
  margin-top: 8px;
  color: var(--text-sub);
  line-height: 1.7;
}

.page-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.meta-pill.accent {
  background: #fff;
}

.content-scroll {
  min-height: 0;
  overflow: auto;
  padding: 18px;
}

.content-scroll > * {
  min-width: 0;
}

.backoffice-shell .content-scroll:not(.is-home) .head-panel:first-child,
.backoffice-shell .content-scroll:not(.is-home) .head-card:first-child {
  display: none !important;
}

.backoffice-shell .panel-card,
.backoffice-shell .content-panel,
.backoffice-shell .tabs-panel,
.backoffice-shell .recommend-card,
.backoffice-shell .search-card,
.backoffice-shell .toolbar-panel {
  border-radius: 22px !important;
  border: 1px solid var(--line-color) !important;
  background: var(--panel-bg) !important;
  box-shadow: 0 14px 28px var(--shadow-color) !important;
}

.backoffice-shell .panel-title-row,
.backoffice-shell .card-header,
.backoffice-shell .group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.backoffice-shell .panel-title,
.backoffice-shell .group-head h3,
.backoffice-shell .card-header span {
  color: var(--text-main);
  font-weight: 700;
}

.backoffice-shell .search-form,
.backoffice-shell .search-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.backoffice-shell .pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.backoffice-shell .empty-tip {
  padding: 20px 0;
  color: var(--text-sub);
  text-align: center;
}

.backoffice-shell .status-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 74px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f4f6fb;
  color: #54627f;
  font-size: 12px;
}

.backoffice-shell .el-table {
  border-radius: 18px;
  overflow: hidden;
}

.backoffice-shell .el-table th {
  background: #f7f8fc;
  color: #56627e;
}

.backoffice-shell .el-table td,
.backoffice-shell .el-table th {
  border-bottom-color: #eef1f7;
}

.backoffice-shell .drawer-mask {
  position: fixed;
  inset: 0;
  background: rgba(8, 13, 29, 0.34);
  z-index: 40;
}

.backoffice-shell .mobile-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 300px;
  height: 100vh;
  z-index: 50;
  transform: translateX(-100%);
  transition: transform 0.24s ease;
  padding: 18px 14px;
  overflow: auto;
}

.backoffice-shell .mobile-sidebar.open {
  transform: translateX(0);
}

.backoffice-shell .mobile-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.backoffice-shell .mobile-head p {
  margin-top: 4px;
  color: var(--text-sub);
  font-size: 12px;
}

.backoffice-shell .shell-fade-enter-active,
.shell-fade-leave-active {
  transition: opacity 0.2s ease;
}

.backoffice-shell .shell-fade-enter,
.shell-fade-leave-to {
  opacity: 0;
}

.backoffice-shell .shell-slide-enter-active,
.shell-slide-leave-active {
  transition: transform 0.24s ease;
}

.backoffice-shell .shell-slide-enter,
.shell-slide-leave-to {
  transform: translateX(-100%);
}

@media (max-width: 1080px) {
  .backoffice-header {
    grid-template-columns: 1fr;
    height: auto;
    padding: 14px;
  }

  .backoffice-header .header-left,
  .backoffice-header .header-right {
    justify-content: space-between;
  }

  .backoffice-frame {
    grid-template-columns: 1fr;
    height: calc(100vh - 146px);
  }

  .backoffice-main {
    height: calc(100vh - 146px);
  }

  .page-bar {
    margin: 14px 14px 0;
    flex-direction: column;
    align-items: flex-start;
  }

  .content-scroll {
    padding: 14px;
  }
}

@media (max-width: 720px) {
  .brand-subtitle,
  .backoffice-shell .scene-chip,
  .user-role,
  .page-bar p {
    display: none;
  }

  .page-bar h1 {
    font-size: 24px;
  }

  .page-meta {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
