<template>
  <div class="auth-redirect-page">
    <div class="redirect-card">
      <i class="el-icon-loading"></i>
      <span>正在打开登录弹窗...</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginRedirect',
  created() {
    this.redirectToDialog()
  },
  methods: {
    redirectToDialog() {
      const role = this.$route.query.role === 'shejishi' ? 'shejishi' : 'yonghu'
      const query = {
        auth: 'login',
        role
      }
      if (this.$route.query.redirect) {
        query.redirect = this.$route.query.redirect
      }
      this.$router.replace({
        path: '/index/home',
        query
      })
    }
  }
}
</script>

<style scoped>
.auth-redirect-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #f5f7ff 0%, #f8f8fc 100%);
}

.redirect-card {
  min-width: 220px;
  padding: 18px 22px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18px 40px rgba(99, 102, 241, 0.14);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #4b5563;
  font-weight: 600;
}

.redirect-card i {
  font-size: 18px;
  color: #6b61ff;
}
</style>
