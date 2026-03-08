<template>
  <backoffice-shell
    theme="admin"
    brand-mark="TB"
    brand-title="管理后台"
    brand-subtitle="平台订单、素材与角色协同中心"
    role-label="管理员工作台"
    :display-name="displayName"
    home-path="/admin/dashboard"
    :menu-items="menuItems"
    @navigate="go"
    @logout="logout"
  >
    <router-view />
  </backoffice-shell>
</template>

<script>
import BackofficeShell from '@/components/BackofficeShell'

export default {
  name: 'AdminLayout',
  components: {
    BackofficeShell
  },
  data() {
    return {
      menuItems: [
        {
          label: '经营总览',
          short: 'Dashboard',
          description: '查看平台订单、用户、设计师与素材的整体运营情况。',
          path: '/admin/dashboard',
          icon: 'el-icon-data-analysis',
          isHome: true
        },
        {
          label: '角色权限',
          short: 'Roles',
          description: '统一查看管理员、用户与设计师的角色分布和权限结构。',
          path: '/admin/roles',
          icon: 'el-icon-s-check'
        },
        {
          label: '素材管理',
          short: 'Materials',
          description: '维护面料、素材资产和款式规则配置。',
          path: '/admin/materials',
          icon: 'el-icon-picture-outline'
        },
        {
          label: '订单管理',
          short: 'Orders',
          description: '统筹后台订单流转、审核与履约进度。',
          path: '/admin/orders',
          icon: 'el-icon-s-order'
        }
      ]
    }
  },
  computed: {
    displayName() {
      return localStorage.getItem('username') || localStorage.getItem('adminName') || '管理员'
    }
  },
  created() {
    this.ensureAdminAccess()
  },
  watch: {
    '$route.path'() {
      this.ensureAdminAccess()
    }
  },
  methods: {
    ensureAdminAccess() {
      const token = localStorage.getItem('Token') || ''
      const tableName = localStorage.getItem('sessionTable') || localStorage.getItem('UserTableName') || ''
      if (!token) {
        this.$message.warning('请先登录后访问管理后台')
        this.$router.replace('/admin-login')
        return false
      }
      if (tableName !== 'users') {
        this.$message.error('仅管理员可访问管理后台')
        this.$router.replace('/index/home')
        return false
      }
      return true
    },
    go(path) {
      if (this.$route.path !== path) {
        this.$router.push(path)
      }
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
      this.$router.replace('/admin-login')
    }
  }
}
</script>
