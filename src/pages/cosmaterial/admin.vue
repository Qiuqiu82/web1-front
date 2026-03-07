<template>
  <div class="material-admin-page material-theme">
    <section class="head-panel">
      <div>
        <h2>素材与款式约束管理</h2>
        <p>面向管理员维护面料素材、审核状态与款式可用面料规则，服务定制与下单链路。</p>
      </div>
    </section>

    <section class="content-panel">
      <el-tabs v-model="activeTab" class="material-tabs">
        <el-tab-pane label="素材资产" name="material">
          <div class="toolbar-panel">
            <el-form :inline="true" :model="materialSearch" class="search-bar">
              <el-form-item label="素材名称">
                <el-input v-model="materialSearch.materialName" clearable placeholder="支持模糊搜索" />
              </el-form-item>
              <el-form-item label="分类">
                <el-input v-model="materialSearch.categoryName" clearable placeholder="面料类别" />
              </el-form-item>
              <el-form-item label="启停">
                <el-select v-model="materialSearch.enableStatus" clearable placeholder="全部">
                  <el-option label="启用" value="启用" />
                  <el-option label="停用" value="停用" />
                </el-select>
              </el-form-item>
              <el-form-item label="审核">
                <el-select v-model="materialSearch.auditStatus" clearable placeholder="全部">
                  <el-option label="待审核" value="待审核" />
                  <el-option label="审核通过" value="审核通过" />
                  <el-option label="审核驳回" value="审核驳回" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="searchMaterial">查询</el-button>
                <el-button @click="resetMaterialSearch">重置</el-button>
                <el-button type="success" @click="openMaterialCreate">新增素材</el-button>
              </el-form-item>
            </el-form>
          </div>

          <el-table :data="materialList" border v-loading="materialLoading" style="width: 100%">
            <el-table-column prop="materialCode" label="素材编码" min-width="130" />
            <el-table-column prop="materialName" label="素材名称" min-width="140" />
            <el-table-column prop="categoryName" label="分类" min-width="120" />
            <el-table-column label="封面" width="88" align="center">
              <template slot-scope="scope">
                <el-image
                  v-if="scope.row.coverUrl"
                  :src="imgUrl(scope.row.coverUrl)"
                  fit="cover"
                  :preview-src-list="[imgUrl(scope.row.coverUrl)]"
                  class="cover-thumb"
                />
                <span v-else class="dash">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="tags" label="标签" min-width="160" show-overflow-tooltip />
            <el-table-column prop="unitPrice" label="参考单价" width="110">
              <template slot-scope="scope">{{ formatPrice(scope.row.unitPrice) }}</template>
            </el-table-column>
            <el-table-column prop="versionNo" label="版本" width="80" />
            <el-table-column label="启停状态" width="96" align="center">
              <template slot-scope="scope">
                <el-tag size="mini" :type="scope.row.enableStatus === '启用' ? 'success' : 'info'">
                  {{ scope.row.enableStatus || '-' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="审核状态" width="100" align="center">
              <template slot-scope="scope">
                <el-tag size="mini" :type="auditTagType(scope.row.auditStatus)">
                  {{ scope.row.auditStatus || '-' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="updatedAt" label="更新时间" min-width="160" />
            <el-table-column label="操作" width="286" fixed="right">
              <template slot-scope="scope">
                <el-button type="text" @click="openMaterialEdit(scope.row)">编辑</el-button>
                <el-button
                  type="text"
                  :class="scope.row.enableStatus === '启用' ? 'danger-link' : 'success-link'"
                  @click="toggleMaterial(scope.row)"
                >
                  {{ scope.row.enableStatus === '启用' ? '停用' : '启用' }}
                </el-button>
                <el-button type="text" @click="openAudit(scope.row)">审核</el-button>
                <el-button type="text" class="danger-link" @click="removeMaterial(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              @size-change="onMaterialSizeChange"
              @current-change="onMaterialPageChange"
              :current-page="materialPage"
              :page-size="materialLimit"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              :total="materialTotal"
              background
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="款式-面料规则" name="rule">
          <div class="toolbar-panel">
            <el-form :inline="true" :model="ruleSearch" class="search-bar">
              <el-form-item label="款式">
                <el-input v-model="ruleSearch.styleName" clearable placeholder="如：卫衣、西装" />
              </el-form-item>
              <el-form-item label="规则状态">
                <el-select v-model="ruleSearch.status" clearable placeholder="全部">
                  <el-option label="启用" value="启用" />
                  <el-option label="停用" value="停用" />
                </el-select>
              </el-form-item>
              <el-form-item label="面料">
                <el-input v-model="ruleSearch.materialName" clearable placeholder="支持模糊搜索" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="searchRule">查询</el-button>
                <el-button @click="resetRuleSearch">重置</el-button>
                <el-button type="success" @click="openRuleCreate">新增规则</el-button>
              </el-form-item>
            </el-form>
          </div>

          <el-table :data="ruleList" border v-loading="ruleLoading" style="width: 100%">
            <el-table-column prop="styleName" label="款式" min-width="150" />
            <el-table-column prop="materialName" label="面料" min-width="140" />
            <el-table-column label="默认" width="88" align="center">
              <template slot-scope="scope">
                <el-tag size="mini" :type="scope.row.isDefault === 1 ? 'success' : 'info'">
                  {{ scope.row.isDefault === 1 ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="规则状态" width="96" align="center">
              <template slot-scope="scope">
                <el-tag size="mini" :type="scope.row.status === '启用' ? 'success' : 'info'">
                  {{ scope.row.status || '-' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="素材启停" width="100" align="center">
              <template slot-scope="scope">
                <el-tag size="mini" :type="scope.row.materialEnableStatus === '启用' ? 'success' : 'warning'">
                  {{ scope.row.materialEnableStatus || '-' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="素材审核" width="100" align="center">
              <template slot-scope="scope">
                <el-tag size="mini" :type="auditTagType(scope.row.materialAuditStatus)">
                  {{ scope.row.materialAuditStatus || '-' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="priority" label="优先级" width="90" />
            <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
            <el-table-column prop="updatedAt" label="更新时间" min-width="160" />
            <el-table-column label="操作" width="150" fixed="right">
              <template slot-scope="scope">
                <el-button type="text" @click="openRuleEdit(scope.row)">编辑</el-button>
                <el-button type="text" class="danger-link" @click="removeRule(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              @size-change="onRuleSizeChange"
              @current-change="onRulePageChange"
              :current-page="rulePage"
              :page-size="ruleLimit"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              :total="ruleTotal"
              background
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </section>

    <el-dialog
      :title="materialDialogMode === 'create' ? '新增素材' : '编辑素材'"
      :visible.sync="materialDialogVisible"
      width="760px"
    >
      <el-form :model="materialForm" label-width="100px" class="dialog-form">
        <el-form-item label="素材编码">
          <el-input v-model="materialForm.materialCode" placeholder="可留空自动生成" />
        </el-form-item>
        <el-form-item label="素材名称">
          <el-input v-model="materialForm.materialName" placeholder="如：纯棉、雪纺" />
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="materialForm.categoryName" placeholder="如：针织、梭织" />
        </el-form-item>
        <el-form-item label="封面图">
          <file-upload
            tip="建议上传 1 张封面图"
            action="file/upload"
            :limit="1"
            :multiple="false"
            :file-urls="materialForm.coverUrl"
            @change="onCoverChange"
          />
        </el-form-item>
        <el-form-item label="素材图集">
          <file-upload
            tip="可上传多张素材细节图"
            action="file/upload"
            :limit="8"
            :multiple="true"
            :file-urls="materialForm.assetUrls"
            @change="onAssetChange"
          />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="materialForm.tags" placeholder="用英文逗号分隔，如 透气,亲肤,弹力" />
        </el-form-item>
        <el-form-item label="参考单价">
          <el-input-number v-model="materialForm.unitPrice" :min="0" :precision="2" :step="1" style="width: 220px" />
        </el-form-item>
        <el-form-item label="启停状态">
          <el-select v-model="materialForm.enableStatus" style="width: 220px">
            <el-option label="启用" value="启用" />
            <el-option label="停用" value="停用" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="materialForm.auditStatus" style="width: 220px">
            <el-option label="待审核" value="待审核" />
            <el-option label="审核通过" value="审核通过" />
            <el-option label="审核驳回" value="审核驳回" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核备注">
          <el-input v-model="materialForm.auditRemark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="materialDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="materialSubmitting" @click="submitMaterial">保存</el-button>
      </span>
    </el-dialog>

    <el-dialog title="审核素材" :visible.sync="auditDialogVisible" width="420px">
      <el-form :model="auditForm" label-width="88px">
        <el-form-item label="审核状态">
          <el-select v-model="auditForm.auditStatus" style="width: 100%">
            <el-option label="待审核" value="待审核" />
            <el-option label="审核通过" value="审核通过" />
            <el-option label="审核驳回" value="审核驳回" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核备注">
          <el-input v-model="auditForm.auditRemark" type="textarea" :rows="3" placeholder="可选" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAudit">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :title="ruleDialogMode === 'create' ? '新增款式规则' : '编辑款式规则'"
      :visible.sync="ruleDialogVisible"
      width="560px"
    >
      <el-form :model="ruleForm" label-width="92px" class="dialog-form">
        <el-form-item label="款式名称">
          <el-input v-model="ruleForm.styleName" placeholder="如：连帽卫衣" />
        </el-form-item>
        <el-form-item label="关联面料">
          <el-select v-model="ruleForm.materialId" filterable placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in materialOptionList"
              :key="item.id"
              :label="`${item.materialName}（${item.categoryName || '未分类'}）`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="默认规则">
          <el-switch v-model="ruleForm.isDefault" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="规则状态">
          <el-select v-model="ruleForm.status" style="width: 100%">
            <el-option label="启用" value="启用" />
            <el-option label="停用" value="停用" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-input-number v-model="ruleForm.priority" :min="1" :max="999" :step="1" style="width: 220px" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="ruleForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="ruleSubmitting" @click="submitRule">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
const emptyMaterialForm = () => ({
  id: null,
  materialCode: '',
  materialName: '',
  categoryName: '',
  coverUrl: '',
  assetUrls: '',
  tags: '',
  unitPrice: 0,
  enableStatus: '启用',
  auditStatus: '待审核',
  auditRemark: ''
})

const emptyRuleForm = () => ({
  id: null,
  styleName: '',
  materialId: null,
  isDefault: 0,
  status: '启用',
  priority: 100,
  remark: ''
})

export default {
  name: 'CosMaterialAdmin',
  data() {
    return {
      baseUrl: '',
      activeTab: 'material',

      materialLoading: false,
      materialList: [],
      materialTotal: 0,
      materialPage: 1,
      materialLimit: 10,
      materialSearch: {
        materialName: '',
        categoryName: '',
        enableStatus: '',
        auditStatus: ''
      },

      materialDialogVisible: false,
      materialDialogMode: 'create',
      materialSubmitting: false,
      materialForm: emptyMaterialForm(),

      auditDialogVisible: false,
      auditTargetId: null,
      auditForm: {
        auditStatus: '审核通过',
        auditRemark: ''
      },

      materialOptionList: [],

      ruleLoading: false,
      ruleList: [],
      ruleTotal: 0,
      rulePage: 1,
      ruleLimit: 10,
      ruleSearch: {
        styleName: '',
        status: '',
        materialName: ''
      },

      ruleDialogVisible: false,
      ruleDialogMode: 'create',
      ruleSubmitting: false,
      ruleForm: emptyRuleForm()
    }
  },
  created() {
    this.baseUrl = this.$config.baseUrl
    if (!this.ensureAdmin()) {
      return
    }
    this.loadMaterialList()
    this.loadRuleList()
    this.loadMaterialOptions()
  },
  methods: {
    ensureAdmin() {
      const tableName = localStorage.getItem('sessionTable') || localStorage.getItem('UserTableName') || ''
      const roleName = localStorage.getItem('role') || ''
      const isAdmin = tableName === 'users' || roleName === '管理员'
      if (!isAdmin) {
        this.$message.error('仅管理员可访问素材管理页面')
        this.$router.replace('/index/home')
        return false
      }
      return true
    },
    pick(obj, names, fallback = '') {
      for (const key of names) {
        if (obj[key] !== undefined && obj[key] !== null) {
          return obj[key]
        }
      }
      return fallback
    },
    imgUrl(url) {
      if (!url) return ''
      return String(url).startsWith('http') ? url : this.baseUrl + url
    },
    formatPrice(value) {
      const number = Number(value || 0)
      return Number.isNaN(number) ? '-' : `￥${number.toFixed(2)}`
    },
    auditTagType(status) {
      if (status === '审核通过') return 'success'
      if (status === '审核驳回') return 'danger'
      if (status === '待审核') return 'warning'
      return 'info'
    },
    normalizeMaterial(row) {
      return {
        id: this.pick(row, ['id']),
        materialCode: this.pick(row, ['materialCode', 'material_code']),
        materialName: this.pick(row, ['materialName', 'material_name']),
        categoryName: this.pick(row, ['categoryName', 'category_name']),
        coverUrl: this.pick(row, ['coverUrl', 'cover_url']),
        assetUrls: this.pick(row, ['assetUrls', 'asset_urls']),
        tags: this.pick(row, ['tags']),
        unitPrice: this.pick(row, ['unitPrice', 'unit_price'], 0),
        enableStatus: this.pick(row, ['enableStatus', 'enable_status']),
        auditStatus: this.pick(row, ['auditStatus', 'audit_status']),
        auditRemark: this.pick(row, ['auditRemark', 'audit_remark']),
        versionNo: this.pick(row, ['versionNo', 'version_no'], 1),
        updatedAt: this.pick(row, ['updatedAt', 'updated_at'])
      }
    },
    normalizeRule(row) {
      return {
        id: this.pick(row, ['id']),
        styleName: this.pick(row, ['styleName', 'style_name']),
        materialId: this.pick(row, ['materialId', 'material_id']),
        materialName: this.pick(row, ['materialName', 'material_name']),
        isDefault: Number(this.pick(row, ['isDefault', 'is_default'], 0)),
        status: this.pick(row, ['status']),
        priority: Number(this.pick(row, ['priority'], 100)),
        remark: this.pick(row, ['remark']),
        materialEnableStatus: this.pick(row, ['materialEnableStatus', 'material_enable_status']),
        materialAuditStatus: this.pick(row, ['materialAuditStatus', 'material_audit_status']),
        updatedAt: this.pick(row, ['updatedAt', 'updated_at'])
      }
    },
    async loadMaterialList() {
      this.materialLoading = true
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosMaterialAdminPage,
        method: 'get',
        params: {
          page: this.materialPage,
          limit: this.materialLimit,
          materialName: this.materialSearch.materialName || undefined,
          categoryName: this.materialSearch.categoryName || undefined,
          enableStatus: this.materialSearch.enableStatus || undefined,
          auditStatus: this.materialSearch.auditStatus || undefined
        }
      })
      this.materialLoading = false
      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '素材加载失败')
        return
      }
      const data = res.data || {}
      const rows = Array.isArray(data.list) ? data.list : []
      this.materialList = rows.map((row) => this.normalizeMaterial(row))
      this.materialTotal = Number(data.total || 0)
    },
    searchMaterial() {
      this.materialPage = 1
      this.loadMaterialList()
    },
    resetMaterialSearch() {
      this.materialSearch = {
        materialName: '',
        categoryName: '',
        enableStatus: '',
        auditStatus: ''
      }
      this.materialPage = 1
      this.loadMaterialList()
    },
    onMaterialSizeChange(size) {
      this.materialLimit = size
      this.materialPage = 1
      this.loadMaterialList()
    },
    onMaterialPageChange(page) {
      this.materialPage = page
      this.loadMaterialList()
    },
    onCoverChange(val) {
      this.materialForm.coverUrl = val || ''
    },
    onAssetChange(val) {
      this.materialForm.assetUrls = val || ''
    },
    openMaterialCreate() {
      this.materialDialogMode = 'create'
      this.materialForm = emptyMaterialForm()
      this.materialDialogVisible = true
    },
    openMaterialEdit(row) {
      this.materialDialogMode = 'edit'
      this.materialForm = {
        id: row.id,
        materialCode: row.materialCode || '',
        materialName: row.materialName || '',
        categoryName: row.categoryName || '',
        coverUrl: row.coverUrl || '',
        assetUrls: row.assetUrls || '',
        tags: row.tags || '',
        unitPrice: Number(row.unitPrice || 0),
        enableStatus: row.enableStatus || '启用',
        auditStatus: row.auditStatus || '待审核',
        auditRemark: row.auditRemark || ''
      }
      this.materialDialogVisible = true
    },
    async submitMaterial() {
      if (!this.materialForm.materialName) {
        this.$message.warning('请填写素材名称')
        return
      }

      const payload = {
        id: this.materialForm.id || undefined,
        materialCode: this.materialForm.materialCode || undefined,
        materialName: this.materialForm.materialName,
        categoryName: this.materialForm.categoryName || undefined,
        coverUrl: this.materialForm.coverUrl || undefined,
        assetUrls: this.materialForm.assetUrls || undefined,
        tags: this.materialForm.tags || undefined,
        unitPrice: this.materialForm.unitPrice,
        enableStatus: this.materialForm.enableStatus,
        auditStatus: this.materialForm.auditStatus,
        auditRemark: this.materialForm.auditRemark || undefined
      }

      this.materialSubmitting = true
      const res = await this.$proxy.Request({
        url: this.materialDialogMode === 'create' ? this.$proxy.Api.cosMaterialSave : this.$proxy.Api.cosMaterialUpdate,
        method: 'post',
        dataType: 'json',
        params: payload
      })
      this.materialSubmitting = false

      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '保存失败')
        return
      }

      this.$message.success('素材保存成功')
      this.materialDialogVisible = false
      await this.loadMaterialList()
      await this.loadMaterialOptions()
    },
    async toggleMaterial(row) {
      const target = row.enableStatus === '启用' ? '停用' : '启用'
      const res = await this.$proxy.Request({
        url: `${this.$proxy.Api.cosMaterialTogglePrefix}${row.id}`,
        method: 'post',
        dataType: 'json',
        params: {
          enableStatus: target
        }
      })
      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '状态更新失败')
        return
      }
      this.$message.success('状态更新成功')
      await this.loadMaterialList()
      await this.loadMaterialOptions()
    },
    openAudit(row) {
      this.auditTargetId = row.id
      this.auditForm = {
        auditStatus: row.auditStatus || '审核通过',
        auditRemark: row.auditRemark || ''
      }
      this.auditDialogVisible = true
    },
    async submitAudit() {
      if (!this.auditTargetId) return
      const res = await this.$proxy.Request({
        url: `${this.$proxy.Api.cosMaterialAuditPrefix}${this.auditTargetId}`,
        method: 'post',
        dataType: 'json',
        params: {
          auditStatus: this.auditForm.auditStatus,
          auditRemark: this.auditForm.auditRemark || ''
        }
      })
      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '审核失败')
        return
      }
      this.$message.success('审核状态已更新')
      this.auditDialogVisible = false
      await this.loadMaterialList()
      await this.loadMaterialOptions()
    },
    async removeMaterial(row) {
      const confirm = await this.$confirm(`确认删除素材「${row.materialName}」吗？`, '提示', {
        type: 'warning'
      }).catch(() => null)
      if (!confirm) return

      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosMaterialDelete,
        method: 'post',
        dataType: 'json',
        params: [row.id]
      })
      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '删除失败')
        return
      }
      this.$message.success('删除成功')
      await this.loadMaterialList()
      await this.loadMaterialOptions()
      if (this.activeTab === 'rule') {
        this.loadRuleList()
      }
    },
    async loadMaterialOptions() {
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosMaterialAdminPage,
        method: 'get',
        showLoading: false,
        params: {
          page: 1,
          limit: 300
        }
      })
      if (!res || res.code !== 0) {
        return
      }
      const rows = ((res.data || {}).list || []).map((row) => this.normalizeMaterial(row))
      this.materialOptionList = rows
    },
    async loadRuleList() {
      this.ruleLoading = true
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosMaterialRulePage,
        method: 'get',
        params: {
          page: this.rulePage,
          limit: this.ruleLimit,
          styleName: this.ruleSearch.styleName || undefined,
          status: this.ruleSearch.status || undefined,
          materialName: this.ruleSearch.materialName || undefined
        }
      })
      this.ruleLoading = false
      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '规则加载失败')
        return
      }
      const data = res.data || {}
      const rows = Array.isArray(data.list) ? data.list : []
      this.ruleList = rows.map((row) => this.normalizeRule(row))
      this.ruleTotal = Number(data.total || 0)
    },
    searchRule() {
      this.rulePage = 1
      this.loadRuleList()
    },
    resetRuleSearch() {
      this.ruleSearch = {
        styleName: '',
        status: '',
        materialName: ''
      }
      this.rulePage = 1
      this.loadRuleList()
    },
    onRuleSizeChange(size) {
      this.ruleLimit = size
      this.rulePage = 1
      this.loadRuleList()
    },
    onRulePageChange(page) {
      this.rulePage = page
      this.loadRuleList()
    },
    openRuleCreate() {
      this.ruleDialogMode = 'create'
      this.ruleForm = emptyRuleForm()
      this.ruleDialogVisible = true
    },
    openRuleEdit(row) {
      this.ruleDialogMode = 'edit'
      this.ruleForm = {
        id: row.id,
        styleName: row.styleName || '',
        materialId: Number(row.materialId || 0) || null,
        isDefault: Number(row.isDefault || 0),
        status: row.status || '启用',
        priority: Number(row.priority || 100),
        remark: row.remark || ''
      }
      this.ruleDialogVisible = true
    },
    async submitRule() {
      if (!this.ruleForm.styleName) {
        this.$message.warning('请填写款式名称')
        return
      }
      if (!this.ruleForm.materialId) {
        this.$message.warning('请选择关联面料')
        return
      }

      const payload = {
        id: this.ruleForm.id || undefined,
        styleName: this.ruleForm.styleName,
        materialId: this.ruleForm.materialId,
        isDefault: this.ruleForm.isDefault,
        status: this.ruleForm.status,
        priority: this.ruleForm.priority,
        remark: this.ruleForm.remark || undefined
      }

      this.ruleSubmitting = true
      const res = await this.$proxy.Request({
        url: this.ruleDialogMode === 'create' ? this.$proxy.Api.cosMaterialRuleSave : this.$proxy.Api.cosMaterialRuleUpdate,
        method: 'post',
        dataType: 'json',
        params: payload
      })
      this.ruleSubmitting = false

      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '规则保存失败')
        return
      }

      this.$message.success('规则保存成功')
      this.ruleDialogVisible = false
      await this.loadRuleList()
    },
    async removeRule(row) {
      const confirm = await this.$confirm(`确认删除规则（${row.styleName} / ${row.materialName}）吗？`, '提示', {
        type: 'warning'
      }).catch(() => null)
      if (!confirm) return

      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosMaterialRuleDelete,
        method: 'post',
        dataType: 'json',
        params: [row.id]
      })
      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '删除失败')
        return
      }
      this.$message.success('删除成功')
      await this.loadRuleList()
    }
  }
}
</script>

<style scoped>
.material-theme {
  --order-primary: #5264ff;
  --order-primary-soft: #edf1ff;
  --order-text-main: #25356a;
  --order-text-sub: #8590b2;
  --order-border: #e7edff;
  --order-shadow: 0 10px 24px rgba(68, 88, 150, 0.1);
}

.material-admin-page {
  width: 100%;
  display: grid;
  gap: 12px;
}

.head-panel,
.content-panel {
  border-radius: 16px;
  border: 1px solid var(--order-border);
  background: #fff;
  box-shadow: var(--order-shadow);
  padding: 14px;
}

.head-panel h2 {
  color: var(--order-text-main);
  font-size: 24px;
}

.head-panel p {
  margin-top: 6px;
  color: var(--order-text-sub);
}

.toolbar-panel {
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 12px;
  background: #f8faff;
  border: 1px solid #edf1ff;
}

.search-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.cover-thumb {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  border: 1px solid #dce5ff;
}

.dash {
  color: #94a1c7;
}

.danger-link {
  color: #e65a6a;
}

.success-link {
  color: #2f8f57;
}

.pagination {
  margin-top: 16px;
  text-align: right;
}

.dialog-form {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 8px;
}

.material-tabs ::v-deep .el-tabs__item {
  font-weight: 600;
}

@media (max-width: 900px) {
  .head-panel,
  .content-panel {
    padding: 12px;
  }

  .toolbar-panel {
    padding: 10px;
  }
}
</style>