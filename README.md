# Web01 - Vue 2 完整项目

## 📦 项目说明

这是一个基于 Vue 2 的完整前端项目，包含了路由、状态管理、UI组件库等完整功能。

## 🛠 技术栈

### 核心框架
- **Vue 2.6.11** - 渐进式 JavaScript 框架
- **Vue Router 3.5.2** - 官方路由管理器
- **Vuex 3.1.1** - 状态管理模式

### UI 组件库
- **Element UI 2.15.5** - 桌面端组件库
- **Vue Quill Editor 3.0.6** - 富文本编辑器
- **Vue Baidu Map 0.21.22** - 百度地图组件

### 其他依赖
- **Vue Resource 1.5.3** - HTTP 请求库
- **Vue Aplayer 1.6.1** - 音频播放器
- **Vue2 Countdown 1.0.8** - 倒计时组件
- **Sass 1.97.3** - CSS 预处理器

### 开发工具
- **Vue CLI 4.5.0** - 标准工具链
- **Babel** - JavaScript 编译器
- **ESLint** - 代码检查工具

## 📂 项目结构

```
web01/
├── public/                 # 静态资源
│   └── index.html         # HTML 模板
├── src/
│   ├── assets/            # 资源文件（图片、样式等）
│   ├── common/            # 公共工具函数
│   │   ├── storage.js     # 本地存储工具
│   │   ├── validate.js    # 表单验证工具
│   │   └── system.js      # 系统工具函数
│   ├── components/        # 公共组件
│   │   ├── Breadcrumb.vue # 面包屑导航
│   │   ├── CountDown.vue  # 倒计时组件
│   │   ├── Editor.vue     # 富文本编辑器
│   │   └── FileUpload.vue # 文件上传组件
│   ├── config/            # 配置文件
│   │   └── config.js      # 全局配置
│   ├── pages/             # 页面组件
│   │   ├── home/          # 首页
│   │   ├── login/         # 登录页
│   │   ├── register/      # 注册页
│   │   └── index.vue      # 主布局
│   ├── router/            # 路由配置
│   │   └── router.js      # 路由定义
│   ├── store/             # Vuex 状态管理
│   │   ├── modules/       # 模块
│   │   ├── getters.js     # Getters
│   │   └── index.js       # Store 入口
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── babel.config.js        # Babel 配置
├── vue.config.js          # Vue CLI 配置
├── package.json           # 项目依赖
├── 安装新依赖.bat         # 安装所有依赖
└── 启动项目.bat           # 启动开发服务器
```

## 🚀 快速开始

### 1. 安装依赖

**方式一：使用批处理脚本（推荐）**
```bash
双击运行：安装新依赖.bat
```

**方式二：手动安装**
```bash
cd F:\springboot\front\web01
npm install --legacy-peer-deps
```

### 2. 启动开发服务器

**方式一：使用批处理脚本**
```bash
双击运行：启动项目.bat
```

**方式二：命令行启动**
```bash
npm run serve
```

项目将在 http://localhost:8080 自动打开

### 3. 构建生产版本

```bash
npm run build
```

构建后的文件将输出到 `dist` 目录

## 📄 页面说明

### 当前已实现的页面

1. **首页** (`/index/home`)
   - 项目介绍
   - 功能特性展示
   - 技术栈信息

2. **登录页** (`/login`)
   - 用户登录表单
   - 表单验证
   - 跳转到注册页

3. **注册页** (`/register`)
   - 用户注册表单
   - 密码确认验证
   - 跳转到登录页

## 🔧 配置说明

### API 配置

修改 `src/config/config.js` 中的 `baseUrl`：

```javascript
export default {
    baseUrl: 'http://localhost:8080/springboot0le12/',
    // 其他配置...
}
```

### 开发服务器配置

修改 `vue.config.js`：

```javascript
module.exports = {
  devServer: {
    port: 8080,        // 修改端口
    open: true         // 自动打开浏览器
  }
}
```

## 📝 下一步扩展

基础项目已经搭建完成，可以继续添加：

1. ✅ 用户中心页面
2. ✅ 论坛模块
3. ✅ 新闻资讯
4. ✅ 商品管理
5. ✅ 订单管理
6. ✅ 其他业务页面

## ⚠️ 注意事项

1. **Node.js 版本要求**：建议使用 Node.js 12.x 或 14.x
2. **安装依赖**：必须使用 `--legacy-peer-deps` 参数
3. **百度地图**：需要申请百度地图 AK 并在 `main.js` 中配置
4. **后端接口**：确保后端服务已启动并配置正确的 API 地址

## 🐛 常见问题

### 1. 依赖安装失败
```bash
# 清理缓存
npm cache clean --force

# 使用 cnpm
npm install -g cnpm --registry=https://registry.npmmirror.com
cnpm install
```

### 2. 端口被占用
修改 `vue.config.js` 中的 `devServer.port`

### 3. 构建失败
检查 Node.js 版本，确保依赖完整安装

## 📞 技术支持

如有问题，请检查：
1. Node.js 和 npm 版本
2. 依赖是否完整安装
3. 配置文件是否正确
4. 控制台错误信息

---

**项目状态**：✅ 基础框架已完成，可以正常运行

**最后更新**：2026-03-01
