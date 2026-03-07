import VueRouter from 'vue-router'
import RemaicosfuDetail from '../pages/remaicosfu/detail'

import Index from '../pages/index'
import Home from '../pages/home/home'
import Browse from '../pages/browse/index'
import Login from '../pages/login/login'
import Register from '../pages/register/register'
import CoscartList from '../pages/coscart/list'
import CosorderList from '../pages/cosorder/list'
import CosorderAdmin from '../pages/cosorder/admin'
import CosorderDesigner from '../pages/cosorder/designer'
import CosMaterialAdmin from '../pages/cosmaterial/admin'
import ProfileCenter from '../pages/profile/index'
import AdminLayout from '../pages/admin/layout'
import AdminDashboard from '../pages/admin/dashboard'
import AdminRolePermission from '../pages/admin/role-permission'

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err)
}

export default new VueRouter({
  routes: [
    {
      path: '/',
      redirect: '/index/home'
    },
    {
      path: '/index',
      component: Index,
      children: [
        {
          path: 'home',
          component: Home
        },
        {
          path: 'browse',
          component: Browse
        },
        {
          path: 'remaicosfuDetail',
          component: RemaicosfuDetail
        },
        {
          path: 'coscart',
          component: CoscartList
        },
        {
          path: 'cosorder',
          component: CosorderList
        },
        {
          path: 'cosorder-admin',
          redirect: '/admin/orders'
        },
        {
          path: 'cosorder-designer',
          component: CosorderDesigner
        },
        {
          path: 'cosmaterial-admin',
          redirect: '/admin/materials'
        },
        {
          path: 'profile',
          component: ProfileCenter
        }
      ]
    },
    {
      path: '/admin',
      component: AdminLayout,
      redirect: '/admin/dashboard',
      children: [
        {
          path: 'dashboard',
          component: AdminDashboard
        },
        {
          path: 'roles',
          component: AdminRolePermission
        },
        {
          path: 'materials',
          component: CosMaterialAdmin
        },
        {
          path: 'orders',
          component: CosorderAdmin
        }
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