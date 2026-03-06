<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --text-primary: #253365;
  --text-secondary: #7e89ae;
  --bg-base: #f4f7ff;
}

body {
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif;
  background: var(--bg-base);
  color: var(--text-primary);
}

#app {
  width: 100%;
  min-height: 100vh;
}
</style>