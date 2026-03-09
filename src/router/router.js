import VueRouter from 'vue-router'
import RemaicosfuDetail from '../pages/remaicosfu/detail'

import Index from '../pages/index'
import Home from '../pages/home/home'
import Browse from '../pages/browse/index'
import TryOnPage from '../pages/tryon/index'
import Login from '../pages/login/login'
import AdminLogin from '../pages/login/admin-login'
import Register from '../pages/register/register'
import CoscartList from '../pages/coscart/list'
import CosorderList from '../pages/cosorder/list'
import CosorderCommunication from '../pages/cosorder/communication'
import CosorderAdmin from '../pages/cosorder/admin'
import CosorderDesigner from '../pages/cosorder/designer'
import CosMaterialAdmin from '../pages/cosmaterial/admin'
import ProfileCenter from '../pages/profile/index'
import AdminLayout from '../pages/admin/layout'
import AdminDashboard from '../pages/admin/dashboard'
import AdminRolePermission from '../pages/admin/role-permission'
import DesignerLayout from '../pages/designer/layout'
import DesignerWorkbench from '../pages/designer/workbench'
import DesignerCommunication from '../pages/designer/communication'
import DesignerProfile from '../pages/designer/profile'
import DesignerRevenue from '../pages/designer/revenue'
import DesignerInspirations from '../pages/designer/inspirations'

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err)
}

export default new VueRouter({
  mode: 'history',
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
          path: 'tryon',
          component: TryOnPage
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
          path: 'cosorder-comm',
          component: CosorderCommunication
        },
        {
          path: 'cosorder-admin',
          redirect: '/admin/orders'
        },
        {
          path: 'cosorder-designer',
          redirect: '/designer/orders'
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
      path: '/designer',
      component: DesignerLayout,
      redirect: '/designer/workbench',
      children: [
        {
          path: 'workbench',
          component: DesignerWorkbench
        },
        {
          path: 'orders',
          component: CosorderDesigner
        },
        {
          path: 'inspirations',
          component: DesignerInspirations
        },
        {
          path: 'communication',
          component: DesignerCommunication
        },
        {
          path: 'profile',
          component: DesignerProfile
        },
        {
          path: 'revenue',
          component: DesignerRevenue
        }
      ]
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/admin-login',
      component: AdminLogin
    },
    {
      path: '/register',
      component: Register
    }
  ]
})
