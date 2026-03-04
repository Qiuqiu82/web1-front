<template>
  <div class="home-container">
    <div class="header">
      <div class="logo">Web01 项目</div>
      <div class="nav">
        <router-link to="/index/home">首页</router-link>
        <router-link to="/login">登录</router-link>
        <router-link :to="{path: '/register', query: {role: 'yonghu', pageFlag: 'register'}}">注册</router-link>
      </div>
    </div>
    
    <div class="content">
      <router-view/>
    </div>
    
    <div class="footer">
      <p>© 2026 Web01 项目 - 基于 Vue 2 + Element UI</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Index',
  data() {
    return {}
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0 50px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.logo {
  font-size: 24px;
  font-weight: bold;
}

.nav {
  display: flex;
  gap: 30px;
}

.nav a {
  color: white;
  text-decoration: none;
  font-size: 16px;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s;
}

.nav a:hover {
  background: rgba(255,255,255,0.2);
}

.nav a.router-link-active {
  background: rgba(255,255,255,0.3);
}

.content {
  flex: 1;
  padding: 20px;
}

.footer {
  background: #333;
  color: white;
  text-align: center;
  padding: 20px;
  margin-top: auto;
}
</style>

