<template>
  <div class="home-container">
    <div class="header">
      <div class="logo">
        <div class="cn">次元定制</div>
        <div class="en">ACG CUSTOM</div>
      </div>
      <div class="nav">
        <router-link to="/index/home">首页</router-link>
        <router-link to="/index/coscart">购物车</router-link>
        <router-link to="/index/cosorder">我的订单</router-link>
        <router-link v-if="isAdmin" to="/index/cosorder-admin">订单协同</router-link>
        <router-link to="/login">登录</router-link>
        <router-link :to="{ path: '/register', query: { role: 'yonghu', pageFlag: 'register' } }">
          注册
        </router-link>
      </div>
    </div>

    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Index',
  computed: {
    isAdmin() {
      const tableName = localStorage.getItem('sessionTable') || localStorage.getItem('UserTableName') || ''
      const roleName = localStorage.getItem('role') || ''
      return tableName === 'users' || roleName === '管理员'
    }
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: #eef1f7;
}
.header {
  height: 74px;
  background: #fff;
  border-bottom: 1px solid #e6e8ef;
  padding: 0 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo .cn {
  font-size: 24px;
  line-height: 1;
  font-weight: 700;
  color: #5b4ae6;
}
.logo .en {
  margin-top: 4px;
  font-size: 12px;
  color: #8f95a8;
  letter-spacing: 1px;
}
.nav {
  display: flex;
  align-items: center;
  gap: 16px;
}
.nav a {
  color: #2a3042;
  text-decoration: none;
  padding: 8px 14px;
  border-radius: 18px;
}
.nav a.router-link-active {
  background: #4f46e5;
  color: #fff;
}
.content {
  padding: 20px;
}
</style>
