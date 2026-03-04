import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import router from './router/router'
import BaiduMap from 'vue-baidu-map'
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import config from './config/config'
import validate from './common/validate'
import { isAuth, getCurDateTime, getCurDate } from './common/system'
import App from './App.vue'
import Breadcrumb from '@/components/Breadcrumb'
import FileUpload from '@/components/FileUpload'
import Editor from '@/components/Editor'
import store from './store'
import Api from './utils/Api'
import Request from './utils/Request'

Vue.config.productionTip = false

Vue.prototype.$config = config
Vue.prototype.$validate = validate
Vue.prototype.isAuth = isAuth
Vue.prototype.getCurDateTime = getCurDateTime
Vue.prototype.getCurDate = getCurDate
Vue.prototype.$proxy = { Api, Request }

Vue.use(VueRouter)
Vue.use(VueResource)
Vue.use(ElementUI)
Vue.use(BaiduMap, {
  ak: 'YOUR_BAIDU_MAP_KEY'
})
Vue.use(VueQuillEditor)

Vue.component('Breadcrumb', Breadcrumb)
Vue.component('file-upload', FileUpload)
Vue.component('editor', Editor)

Vue.http.options.root = config.baseUrl
Vue.http.headers.common['Token'] = localStorage.getItem('Token')
Vue.http.interceptors.push(function(request, next) {
  next((response) => {
    if (response.data.code == 401 || response.data.code == 403) {
      this.$router.replace('/login').catch(() => {})
    } else {
      return response
    }
  })
})

router.afterEach((to, from) => {
  if (from.path == '/login') {
    Vue.http.headers.common['Token'] = localStorage.getItem('Token')
  }
})

new Vue({
  render: (h) => h(App),
  router,
  store
}).$mount('#app')
