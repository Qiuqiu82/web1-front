<template>
  <backoffice-shell
    theme="designer"
    brand-mark="DS"
    brand-title="设计师后台"
    brand-subtitle="接单协作、沟通与收益管理中心"
    role-label="设计师工作台"
    :display-name="displayName"
    home-path="/designer/workbench"
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
  name: 'DesignerLayout',
  components: {
    BackofficeShell
  },
  data() {
    return {
      menuItems: [
        {
          label: '工作台',
          short: 'Workbench',
          description: '查看待接单、处理中任务、通知与今日重点事项。',
          path: '/designer/workbench',
          icon: 'el-icon-s-home',
          isHome: true
        },
        {
          label: '订单管理',
          short: 'Orders',
          description: '集中处理待接订单、我的订单与交付动作。',
          path: '/designer/orders',
          icon: 'el-icon-s-order'
        },
        {
          label: '沟通记录',
          short: 'Messages',
          description: '查看订单沟通会话与交付说明记录。',
          path: '/designer/communication',
          icon: 'el-icon-chat-dot-round'
        },
        {
          label: '资料档案',
          short: 'Profile',
          description: '维护设计师介绍、专长方向和作品展示信息。',
          path: '/designer/profile',
          icon: 'el-icon-user'
        },
        {
          label: '收益看板',
          short: 'Revenue',
          description: '查看订单金额、完成收入与趋势分布。',
          path: '/designer/revenue',
          icon: 'el-icon-data-analysis'
        }
      ]
    }
  },
  computed: {
    displayName() {
      return localStorage.getItem('username') || '设计师'
    }
  },
  created() {
    this.ensureDesignerAccess()
  },
  watch: {
    '$route.path'() {
      this.ensureDesignerAccess()
    }
  },
  methods: {
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
      this.$router.replace({ path: '/login', query: { role: 'shejishi' } })
    }
  }
}
</script>
