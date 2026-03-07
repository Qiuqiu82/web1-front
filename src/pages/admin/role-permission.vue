<template>
  <div class="role-page">
    <section class="head-card panel-card">
      <div>
        <h2>角色权限管理</h2>
        <p>当前提供账号与角色台账，权限矩阵与操作日志保留可扩展骨架。</p>
      </div>
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
        <div class="panel-title">账号角色列表</div>
        <el-button size="mini" icon="el-icon-refresh" @click="loadAccounts" :loading="loading">刷新</el-button>
      </div>

      <el-table :data="pagedRows" border v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="账号ID" width="100" />
        <el-table-column prop="username" label="账号" min-width="140" />
        <el-table-column prop="phone" label="手机号" min-width="140" />
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
        <div class="panel-title">权限矩阵（建设中）</div>
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
        <div class="panel-title">操作日志（建设中）</div>
        <div class="log-list">
          <div v-for="item in operationLogs" :key="item.title" class="log-item">
            <div class="log-dot" />
            <div>
              <div class="log-title">{{ item.title }}</div>
              <div class="log-sub">{{ item.desc }}</div>
            </div>
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
        { module: '角色与权限', admin: '读写', designer: '只读', user: '无权限' },
        { module: '服装与素材', admin: '读写', designer: '按需申请', user: '浏览' },
        { module: '订单与生产', admin: '读写', designer: '履约处理', user: '查看与确认' },
        { module: '统计分析', admin: '读写', designer: '个人看板', user: '无权限' }
      ],
      operationLogs: [
        { title: '权限矩阵细粒度配置', desc: '后续将补充按菜单、按钮、数据范围的授权规则。' },
        { title: '角色变更审批流', desc: '后续将补充角色变更申请、审批、审计追踪。' },
        { title: '权限变更日志', desc: '后续将补充角色权限历史快照与回滚能力。' }
      ]
    }
  },
  computed: {
    filteredRows() {
      const keyword = (this.searchForm.keyword || '').toLowerCase()
      const role = this.searchForm.role
      return this.accountRows.filter((row) => {
        const roleMatch = !role || row.role === role
        if (!roleMatch) {
          return false
        }
        if (!keyword) {
          return true
        }
        const idText = String(row.id || '')
        const accountText = String(row.username || '').toLowerCase()
        const phoneText = String(row.phone || '')
        return idText.includes(keyword) || accountText.includes(keyword) || phoneText.includes(keyword)
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
      if (!item || typeof item !== 'object') {
        return fallback
      }
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i]
        if (item[key] !== undefined && item[key] !== null && item[key] !== '') {
          return item[key]
        }
      }
      return fallback
    },
    buildRows(list, roleName) {
      if (!Array.isArray(list)) {
        return []
      }
      return list.map((item) => ({
        id: this.pick(item, ['id', 'userid', 'userId'], '-'),
        username: this.pick(item, ['username', 'yonghuming', 'shejishiming', 'name'], '-'),
        phone: this.pick(item, ['mobile', 'phone', 'lianxifangshi'], '-'),
        status: this.pick(item, ['status', 'sfsh', 'enableStatus'], '正常'),
        addtime: this.pick(item, ['addtime', 'createTime', 'insertTime', 'create_time'], '-'),
        role: roleName
      }))
    },
    async loadAccounts() {
      this.loading = true
      const [adminRes, userRes, designerRes] = await Promise.all([
        this.$proxy.Request({
          url: this.$proxy.Api.usersPage,
          method: 'get',
          showLoading: false,
          params: { page: 1, limit: 100 }
        }),
        this.$proxy.Request({
          url: this.$proxy.Api.yonghuPage,
          method: 'get',
          showLoading: false,
          params: { page: 1, limit: 100 }
        }),
        this.$proxy.Request({
          url: this.$proxy.Api.shejishiPage,
          method: 'get',
          showLoading: false,
          params: { page: 1, limit: 100 }
        })
      ])

      const adminRows = this.buildRows((((adminRes || {}).data || {}).list) || [], '管理员')
      const userRows = this.buildRows((((userRes || {}).data || {}).list) || [], '用户')
      const designerRows = this.buildRows((((designerRes || {}).data || {}).list) || [], '设计师')
      this.accountRows = [...adminRows, ...userRows, ...designerRows]

      this.loading = false
      if (!this.accountRows.length) {
        this.$message.warning('当前未获取到账号数据，请检查后端分页接口')
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
  gap: 12px;
}

.panel-card {
  border-radius: 16px;
  border: 1px solid #e5ebff;
  background: #fff;
  box-shadow: 0 10px 24px rgba(75, 93, 154, 0.1);
}

.head-card {
  padding: 16px;
}

.head-card h2 {
  color: #26366e;
  font-size: 24px;
}

.head-card p {
  margin-top: 6px;
  color: #8290ba;
}

.search-card {
  padding: 14px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.table-card {
  padding: 14px;
}

.panel-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.panel-title {
  color: #2f4486;
  font-size: 16px;
  font-weight: 700;
}

.status-chip {
  display: inline-block;
  min-width: 58px;
  text-align: center;
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 600;
}

.status-on {
  color: #2f7a4c;
  background: #e8f7ee;
}

.status-off {
  color: #9c4f58;
  background: #fbecee;
}

.pagination {
  margin-top: 14px;
  text-align: right;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.bottom-grid .panel-card {
  padding: 14px;
}

.matrix-list,
.log-list {
  margin-top: 12px;
  display: grid;
  gap: 10px;
}

.matrix-row {
  border-radius: 10px;
  border: 1px solid #ebefff;
  background: #f8faff;
  padding: 10px;
}

.matrix-module {
  color: #344b8f;
  font-weight: 600;
}

.matrix-tags {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.log-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 8px 0;
  border-bottom: 1px dashed #e6ebff;
}

.log-item:last-child {
  border-bottom: none;
}

.log-dot {
  margin-top: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6b7fe0;
  box-shadow: 0 0 0 4px rgba(107, 127, 224, 0.14);
}

.log-title {
  color: #304683;
  font-weight: 600;
}

.log-sub {
  margin-top: 4px;
  color: #8b95b7;
  font-size: 13px;
}

@media (max-width: 900px) {
  .head-card,
  .search-card,
  .table-card,
  .bottom-grid .panel-card {
    padding: 12px;
  }

  .bottom-grid {
    grid-template-columns: 1fr;
  }
}
</style>