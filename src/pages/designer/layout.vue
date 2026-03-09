<template>
  <backoffice-shell
    theme="designer"
    brand-mark="DS"
    :brand-title="brand.title"
    :brand-subtitle="brand.subtitle"
    :role-label="brand.roleLabel"
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
const BRAND = { title:'\u8bbe\u8ba1\u5e08\u540e\u53f0', subtitle:'\u63a5\u5355\u534f\u4f5c\u3001\u6c9f\u901a\u4e0e\u6536\u76ca\u7ba1\u7406\u4e2d\u5fc3', roleLabel:'\u8bbe\u8ba1\u5e08\u5de5\u4f5c\u53f0' }
export default {
  name: 'DesignerLayout',
  components: { BackofficeShell },
  data() { return { brand: BRAND, menuItems: [
    { label:'\u5de5\u4f5c\u53f0', short:'Workbench', description:'\u67e5\u770b\u5f85\u63a5\u5355\u3001\u5904\u7406\u4e2d\u4efb\u52a1\u3001\u901a\u77e5\u4e0e\u4eca\u65e5\u91cd\u70b9\u4e8b\u9879\u3002', path:'/designer/workbench', icon:'el-icon-s-home', isHome:true },
    { label:'\u8ba2\u5355\u7ba1\u7406', short:'Orders', description:'\u96c6\u4e2d\u5904\u7406\u5f85\u63a5\u8ba2\u5355\u3001\u6211\u7684\u8ba2\u5355\u4e0e\u4ea4\u4ed8\u52a8\u4f5c\u3002', path:'/designer/orders', icon:'el-icon-s-order' },
    { label:'\u70ed\u95e8\u7075\u611f', short:'Inspo', description:'\u96c6\u4e2d\u6d4f\u89c8\u9ad8\u70ed\u89d2\u8272\u6b3e\u5f0f\uff0c\u7edf\u4e00\u67e5\u770b\u6d77\u62a5\u5361\u7075\u611f\u5e93\u3002', path:'/designer/inspirations', icon:'el-icon-picture-outline-round' },
    { label:'\u6c9f\u901a\u8bb0\u5f55', short:'Messages', description:'\u67e5\u770b\u8ba2\u5355\u6c9f\u901a\u4f1a\u8bdd\u4e0e\u4ea4\u4ed8\u8bf4\u660e\u8bb0\u5f55\u3002', path:'/designer/communication', icon:'el-icon-chat-dot-round' },
    { label:'\u8d44\u6599\u6863\u6848', short:'Profile', description:'\u7ef4\u62a4\u8bbe\u8ba1\u5e08\u4ecb\u7ecd\u3001\u4e13\u957f\u65b9\u5411\u548c\u4f5c\u54c1\u5c55\u793a\u4fe1\u606f\u3002', path:'/designer/profile', icon:'el-icon-user' },
    { label:'\u6536\u76ca\u770b\u677f', short:'Revenue', description:'\u67e5\u770b\u8ba2\u5355\u91d1\u989d\u3001\u5b8c\u6210\u6536\u5165\u4e0e\u8d8b\u52bf\u5206\u5e03\u3002', path:'/designer/revenue', icon:'el-icon-data-analysis' }
  ] } },
  computed: { displayName() { return localStorage.getItem('username') || '\u8bbe\u8ba1\u5e08' } },
  created() { this.ensureDesignerAccess() },
  watch: { '$route.path'() { this.ensureDesignerAccess() } },
  methods: {
    ensureDesignerAccess() { const token = localStorage.getItem('Token') || ''; const tableName = localStorage.getItem('sessionTable') || localStorage.getItem('UserTableName') || ''; if (!token) { this.$message.warning('\u8bf7\u5148\u767b\u5f55\u540e\u8bbf\u95ee\u8bbe\u8ba1\u5e08\u4e2d\u5fc3'); this.$router.replace({ path: '/login', query: { role: 'shejishi' } }); return false } if (tableName !== 'shejishi') { this.$message.error('\u4ec5\u8bbe\u8ba1\u5e08\u53ef\u8bbf\u95ee\u8be5\u9875\u9762'); this.$router.replace('/index/home'); return false } return true },
    go(path) { if (this.$route.path !== path) this.$router.push(path) },
    logout() { ['Token','UserTableName','sessionTable','role','username','adminName','userid','userId'].forEach((key) => localStorage.removeItem(key)); this.$message.success('\u5df2\u9000\u51fa\u767b\u5f55'); this.$router.replace({ path: '/login', query: { role: 'shejishi' } }) }
  }
}
</script>