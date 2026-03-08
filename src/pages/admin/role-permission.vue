<template>
  <div class="role-page">
    <section class="hero-card panel-card">
      <div class="hero-copy">
        <div class="hero-kicker">角色权限</div>
        <h2>先把系统角色边界、页面入口和账号台账讲清楚，再考虑细粒度权限编排</h2>
        <p>
          当前页面聚焦三件事：查看管理员、用户、设计师账号台账；明确各角色的页面访问边界；
          为后续细粒度权限矩阵保留统一展示位置。
        </p>
      </div>
      <div class="hero-side">
        <div class="summary-item">
          <span>管理员</span>
          <strong>{{ roleStats.admin }}</strong>
        </div>
        <div class="summary-item">
          <span>用户</span>
          <strong>{{ roleStats.user }}</strong>
        </div>
        <div class="summary-item">
          <span>设计师</span>
          <strong>{{ roleStats.designer }}</strong>
        </div>
      </div>
    </section>

    <section class="role-card-grid">
      <article v-for="item in roleCards" :key="item.role" class="role-card panel-card">
        <div class="role-icon" :style="{ background: item.bg }">
          <i :class="item.icon"></i>
        </div>
        <div class="role-copy">
          <strong>{{ item.role }}</strong>
          <p>{{ item.desc }}</p>
          <span>{{ item.routes }}</span>
        </div>
      </article>
    </section>

    <section class="panel-card search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input v-model.trim="searchForm.keyword" clearable placeholder="账号 / 手机 / ID" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" clearable placeholder="全部角色">
            <el-option label="管理员" value="管理员" />
            <el-option label="用户" value="用户" />
            <el-option label="设计师" value="设计师" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </section>

    <section class="panel-card table-card">
      <div class="panel-title-row">
        <div>
          <div class="panel-title">账号角色列表</div>
          <div class="panel-desc">当前基于账号来源表自动汇总，不提供在线变更角色能力。</div>
        </div>
        <el-button size="mini" icon="el-icon-refresh" @click="loadAccounts" :loading="loading">刷新</el-button>
      </div>

      <el-table :data="pagedRows" border v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="账号ID" width="110" />
                <el-table-column label="账号 / 名称" min-width="220">
          <template slot-scope="scope">
            <div class="identity-cell">
              <strong>{{ scope.row.account || '-' }}</strong>
              <span>{{ scope.row.displayName || '未设置名称' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系方式" min-width="150" />
        <el-table-column prop="sourceTable" label="来源表" width="110" align="center" />
        <el-table-column prop="role" label="角色" width="120" align="center">
          <template slot-scope="scope">
            <el-tag size="mini" :type="roleTagType(scope.row.role)">{{ scope.row.role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template slot-scope="scope">
            <span :class="['status-chip', statusClass(scope.row.status)]">{{ scope.row.status || '正常' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="addtime" label="创建时间" min-width="170" />
      </el-table>

      <div class="pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="filteredRows.length"
          :current-page="pageIndex"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          @size-change="onSizeChange"
          @current-change="onCurrentChange"
        />
      </div>
    </section>

    <section class="bottom-grid">
      <article class="panel-card">
        <div class="panel-title">系统权限矩阵</div>
        <div class="panel-desc">本轮聚焦“系统角色能力展示”，不提供在线授权修改。</div>
        <div class="matrix-list">
          <div v-for="row in permissionMatrix" :key="row.module" class="matrix-row">
            <div class="matrix-module">{{ row.module }}</div>
            <div class="matrix-tags">
              <el-tag size="mini" type="danger">管理员：{{ row.admin }}</el-tag>
              <el-tag size="mini" type="success">设计师：{{ row.designer }}</el-tag>
              <el-tag size="mini" type="info">用户：{{ row.user }}</el-tag>
            </div>
          </div>
        </div>
      </article>

      <article class="panel-card">
        <div class="panel-title">页面访问边界</div>
        <div class="panel-desc">帮助明确当前系统的菜单级访问范围。</div>
        <div class="route-list">
          <div v-for="item in routeRules" :key="item.path" class="route-row">
            <strong>{{ item.title }}</strong>
            <span>{{ item.path }}</span>
            <p>{{ item.desc }}</p>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script>
export default {
  name: 'AdminRolePermission',
  data() {
    return {
      loading: false,
      searchForm: {
        keyword: '',
        role: ''
      },
      pageIndex: 1,
      pageSize: 10,
      accountRows: [],
      permissionMatrix: [
        { module: '后台概览与统计', admin: '读写', designer: '个人看板', user: '无权限' },
        { module: '服装与素材管理', admin: '读写', designer: '只读参考', user: '前台浏览' },
        { module: '订单与生产协同', admin: '读写', designer: '履约处理', user: '查看与确认收货' },
        { module: '个人中心与资料维护', admin: '系统账号', designer: '维护个人资料与作品', user: '维护地址与身材档案' },
        { module: '沟通与交付记录', admin: '当前不发送', designer: '会话读写', user: '会话读写' }
      ],
      routeRules: [
        { title: '管理员后台', path: '/admin/*', desc: '管理员访问统一后台壳层，处理概览、角色、素材和订单。' },
        { title: '设计师后台', path: '/designer/*', desc: '设计师访问工作台、订单、沟通、资料和收益页面。' },
        { title: '用户前台', path: '/index/*', desc: '用户在前台完成浏览、定制、下单、订单沟通和个人中心维护。' },
        { title: '登录入口', path: '/login /admin-login', desc: '管理员与普通账号使用不同登录落点，角色鉴权在路由和接口双重控制。' }
      ],
      roleMeta: {
        管理员: { icon: 'el-icon-s-tools', bg: '#eef4ff', desc: '负责平台运营、素材治理、订单协同与统计分析。', routes: '后台壳层：/admin/*' },
        用户: { icon: 'el-icon-user', bg: '#fff7ed', desc: '负责浏览、定制、下单、收货与订单沟通。', routes: '前台壳层：/index/*' },
        设计师: { icon: 'el-icon-s-custom', bg: '#f3f0ff', desc: '负责认领订单、推进制作、交付沟通、维护作品与收益。', routes: '设计师壳层：/designer/*' }
      }
    }
  },
  computed: {
    roleStats() {
      return this.accountRows.reduce(
        (acc, row) => {
          if (row.role === '管理员') acc.admin += 1
          if (row.role === '用户') acc.user += 1
          if (row.role === '设计师') acc.designer += 1
          return acc
        },
        { admin: 0, user: 0, designer: 0 }
      )
    },
    roleCards() {
      return ['管理员', '用户', '设计师'].map((role) => ({
        role,
        ...this.roleMeta[role]
      }))
    },
    filteredRows() {
      const keyword = (this.searchForm.keyword || '').toLowerCase()
      const role = this.searchForm.role
      return this.accountRows.filter((row) => {
        if (role && row.role !== role) return false
        if (!keyword) return true
        return [row.id, row.account, row.displayName, row.phone, row.sourceTable].some((item) => String(item || '').toLowerCase().includes(keyword))
      })
    },
    pagedRows() {
      const start = (this.pageIndex - 1) * this.pageSize
      return this.filteredRows.slice(start, start + this.pageSize)
    }
  },
  created() {
    this.loadAccounts()
  },
  methods: {
    roleTagType(role) {
      if (role === '管理员') return 'danger'
      if (role === '设计师') return 'success'
      return 'info'
    },
    statusClass(status) {
      const text = String(status || '正常')
      if (text.includes('禁用') || text.includes('停用') || text.includes('冻结')) return 'status-off'
      return 'status-on'
    },
    pick(item, keys, fallback = '') {
      if (!item || typeof item !== 'object') return fallback
      for (let i = 0; i < keys.length; i += 1) {
        const value = item[keys[i]]
        if (value !== undefined && value !== null && value !== '') {
          return value
        }
      }
      return fallback
    },
    normalizeAccount(item) {
      return this.pick(item, [
        'username',
        'userName',
        'account',
        'loginName',
        'yonghuzhanghao',
        'shejishizhanghao'
      ], '-')
    },
    normalizeDisplayName(item) {
      const displayName = this.pick(item, [
        'name',
        'realName',
        'displayName',
        'nickname',
        'yonghuxingming',
        'shejishixingming'
      ], '')
      if (displayName) {
        return displayName
      }
      return this.normalizeAccount(item)
    },
    buildRows(list, roleName, sourceTable) {
      if (!Array.isArray(list)) return []
      return list.map((item) => ({
        id: this.pick(item, ['id', 'userid', 'userId'], '-'),
        account: this.normalizeAccount(item),
        displayName: this.normalizeDisplayName(item),
        phone: this.pick(item, ['mobile', 'phone', 'lianxifangshi'], '-'),
        status: this.pick(item, ['status', 'sfsh', 'enableStatus'], '-'),
        addtime: this.pick(item, ['addtime', 'createTime', 'insertTime', 'create_time'], '-'),
        role: roleName,
        sourceTable
      }))
    },
    async loadAccounts() {
      this.loading = true
      try {
        const [adminRes, userRes, designerRes] = await Promise.all([
          this.$proxy.Request({ url: this.$proxy.Api.usersPage, method: 'get', showLoading: false, showError: false, params: { page: 1, limit: 200 } }),
          this.$proxy.Request({ url: this.$proxy.Api.yonghuPage, method: 'get', showLoading: false, showError: false, params: { page: 1, limit: 200 } }),
          this.$proxy.Request({ url: this.$proxy.Api.shejishiPage, method: 'get', showLoading: false, showError: false, params: { page: 1, limit: 200 } })
        ])

        const adminRows = this.buildRows((((adminRes || {}).data || {}).list) || [], '管理员', 'users')
        const userRows = this.buildRows((((userRes || {}).data || {}).list) || [], '用户', 'yonghu')
        const designerRows = this.buildRows((((designerRes || {}).data || {}).list) || [], '设计师', 'shejishi')
        this.accountRows = [...adminRows, ...userRows, ...designerRows]

        if (!adminRes || !userRes || !designerRes) {
          this.$message.warning('部分账号台账加载失败，已展示可用数据')
        }
      } finally {
        this.loading = false
      }
    },
    onSearch() {
      this.pageIndex = 1
    },
    onReset() {
      this.searchForm.keyword = ''
      this.searchForm.role = ''
      this.pageIndex = 1
    },
    onSizeChange(size) {
      this.pageSize = size
      this.pageIndex = 1
    },
    onCurrentChange(page) {
      this.pageIndex = page
    }
  }
}
</script>

<style scoped>
.role-page {
  display: grid;
  gap: 14px;
}

.panel-card {
  border-radius: 24px;
  border: 1px solid #e7ebfb;
  background: #fff;
  box-shadow: 0 14px 32px rgba(84, 99, 183, 0.08);
}

.hero-card {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) 320px;
  gap: 18px;
  padding: 24px 26px;
  background: linear-gradient(135deg, #f4f7ff 0%, #ffffff 48%, #f0f3ff 100%);
}

.hero-kicker {
  display: inline-flex;
  height: 30px;
  align-items: center;
  padding: 0 12px;
  border-radius: 999px;
  background: #eef1ff;
  color: #5b6ef5;
  font-size: 12px;
  letter-spacing: 0.12em;
  font-weight: 700;
}

.hero-card h2 {
  margin-top: 12px;
  font-size: 30px;
  line-height: 1.35;
  color: #202a4a;
}

.hero-card p {
  margin-top: 12px;
  line-height: 1.85;
  color: #7f8bb2;
}

.hero-side {
  display: grid;
  gap: 12px;
}

.summary-item {
  padding: 16px 18px;
  border-radius: 18px;
  background: #fff;
  border: 1px solid #e2e8ff;
}

.summary-item span {
  color: #7f8bb2;
  font-size: 12px;
}

.summary-item strong {
  display: block;
  margin-top: 6px;
  color: #202a4a;
  font-size: 26px;
}

.role-card-grid,
.bottom-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.bottom-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.role-card {
  padding: 18px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.role-icon {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5b6ef5;
  font-size: 22px;
}

.role-copy strong,
.panel-title {
  color: #202a4a;
}

.role-copy p,
.panel-desc,
.route-row p {
  margin-top: 8px;
  color: #7f8bb2;
  line-height: 1.7;
}

.identity-cell {
  display: grid;
  gap: 4px;
}

.identity-cell strong {
  color: #202a4a;
}

.identity-cell span {
  color: #7f8bb2;
  font-size: 12px;
}
.role-copy span,
.route-row span {
  display: block;
  margin-top: 10px;
  color: #5b6ef5;
  font-size: 12px;
}

.search-card,
.table-card,
.bottom-grid > .panel-card {
  padding: 22px;
}

.panel-title-row {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.panel-title {
  font-size: 20px;
  font-weight: 700;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.matrix-list,
.route-list {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.matrix-row,
.route-row {
  padding: 16px 18px;
  border-radius: 18px;
  background: #f8f9ff;
}

.matrix-module {
  color: #202a4a;
  font-weight: 700;
}

.matrix-tags {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 66px;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
}

.status-on {
  color: #198754;
  background: #e9f9ef;
}

.status-off {
  color: #b26c00;
  background: #fff4df;
}

@media (max-width: 1200px) {
  .role-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .hero-card,
  .bottom-grid {
    grid-template-columns: 1fr;
  }

  .panel-title-row {
    flex-direction: column;
  }
}

@media (max-width: 720px) {
  .role-card-grid {
    grid-template-columns: 1fr;
  }

  .search-card,
  .table-card,
  .bottom-grid > .panel-card,
  .hero-card {
    padding: 18px;
  }

  .pagination {
    justify-content: flex-start;
    overflow: auto;
  }
}
</style>
