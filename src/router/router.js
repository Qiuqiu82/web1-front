import VueRouter from 'vue-router'
import RemaicosfuDetail from '../pages/remaicosfu/detail'

import Index from '../pages/index'
import Home from '../pages/home/home'
import Login from '../pages/login/login'
import Register from '../pages/register/register'
import CoscartList from '../pages/coscart/list'
import CosorderList from '../pages/cosorder/list'
import CosorderAdmin from '../pages/cosorder/admin'

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

export default new VueRouter({
  routes:[
    {
      path: '/',
      redirect: '/index/home'
    },
    {
      path: '/index',
      component: Index,
      children:[
        {
          path: 'home',
          component: Home
        },
        {
          path: 'remaicosfuDetail',
          component: RemaicosfuDetail
        },
        { path: 'coscart', component: CoscartList },
        { path: 'cosorder', component: CosorderList },
        { path: 'cosorder-admin', component: CosorderAdmin }
      ]
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/register',
      component: Register
    }
  ]
})
