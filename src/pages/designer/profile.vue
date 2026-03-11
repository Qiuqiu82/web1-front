<template>
  <div class="designer-profile-page">
    <section class="page-toolbar">
      <div class="page-copy">
        <span class="page-tag">{{ '\u8d44\u6599\u6863\u6848' }}</span>
        <h2>{{ '\u8bbe\u8ba1\u5e08\u8d44\u6599\u4e0e\u4f5c\u54c1\u96c6' }}</h2>
        <p>{{ '\u7ef4\u62a4\u4e2a\u4eba\u8d44\u6599\u3001\u6c89\u6dc0\u6848\u4f8b\u4f5c\u54c1\uff0c\u5e76\u628a\u5df2\u4ea4\u4ed8\u8ba2\u5355\u6574\u7406\u4e3a\u540e\u7eed\u5c55\u793a\u4e0e\u6c9f\u901a\u53ef\u590d\u7528\u7684\u4f5c\u54c1\u5e93\u3002' }}</p>
      </div>
      <div class="page-actions">
        <el-button type="primary" plain icon="el-icon-edit" @click="openProfileDialog">{{ '\u7f16\u8f91\u4e2a\u4eba\u8d44\u6599' }}</el-button>
        <el-button plain icon="el-icon-plus" @click="openPortfolioDialog('create')">{{ '\u65b0\u589e\u4f5c\u54c1' }}</el-button>
        <el-button plain icon="el-icon-refresh" :loading="loading" @click="loadData">{{ '\u5237\u65b0' }}</el-button>
      </div>
    </section>

    <section class="metric-grid">
      <article v-for="item in metricCards" :key="item.label" class="metric-card">
        <div class="metric-icon" :style="{ background: item.bg }">
          <i :class="item.icon"></i>
        </div>
        <div>
          <div class="metric-label">{{ item.label }}</div>
          <div class="metric-value">{{ item.value }}</div>
          <div class="metric-sub">{{ item.sub }}</div>
        </div>
      </article>
    </section>

    <section class="content-grid">
      <article class="panel-card profile-panel">
        <div class="panel-head">
          <div>
            <h3>{{ '\u4e2a\u4eba\u8d44\u6599' }}</h3>
            <p>{{ '\u5f53\u524d\u8bfb\u53d6\u8bbe\u8ba1\u5e08 session \u4fe1\u606f\uff0c\u652f\u6301\u5934\u50cf\u3001\u8054\u7cfb\u65b9\u5f0f\u3001\u64c5\u957f\u65b9\u5411\u548c\u4e2a\u4eba\u7b80\u4ecb\u7684\u5c55\u793a\u4e0e\u7f16\u8f91\u3002' }}</p>
          </div>
          <el-button type="text" @click="openProfileDialog">{{ '\u7f16\u8f91' }}</el-button>
        </div>
        <div class="profile-detail-grid">
          <div class="detail-item">
            <span>{{ '\u59d3\u540d' }}</span>
            <strong>{{ profile.name || '-' }}</strong>
          </div>
          <div class="detail-item">
            <span>{{ '\u8d26\u53f7' }}</span>
            <strong>{{ profile.account || '-' }}</strong>
          </div>
          <div class="detail-item">
            <span>{{ '\u8054\u7cfb\u65b9\u5f0f' }}</span>
            <strong>{{ profile.phone || '-' }}</strong>
          </div>
          <div class="detail-item">
            <span>{{ '\u64c5\u957f\u65b9\u5411' }}</span>
            <div class="tag-wrap">
              <el-tag v-for="tag in specialtyTags" :key="tag" size="mini" effect="plain">{{ tag }}</el-tag>
              <span v-if="!specialtyTags.length" class="empty-inline">{{ '\u6682\u672a\u586b\u5199\u64c5\u957f\u65b9\u5411' }}</span>
            </div>
          </div>
        </div>
        <div class="intro-panel">
          <div class="intro-title">{{ '\u4e2a\u4eba\u7b80\u4ecb' }}</div>
          <div class="intro-text">{{ profile.intro || '\u6682\u672a\u586b\u5199\u4e2a\u4eba\u7b80\u4ecb' }}</div>
        </div>
      </article>

      <article class="panel-card portfolio-panel">
        <div class="panel-head portfolio-head">
          <div>
            <h3>{{ '\u4f5c\u54c1\u96c6\u7ba1\u7406' }}</h3>
            <p>{{ '\u4ec5\u7ba1\u7406\u5f53\u524d\u8bbe\u8ba1\u5e08\u81ea\u5df1\u7684\u4f5c\u54c1\uff0c\u6848\u4f8b\u8ba2\u5355\u53ea\u80fd\u5173\u8054\u5df2\u53d1\u8d27\u6216\u5df2\u5b8c\u6210\u8ba2\u5355\u3002' }}</p>
          </div>
          <div class="toolbar-actions">
            <el-input
              v-model.trim="filters.keyword"
              size="small"
              clearable
              :placeholder="'\u641c\u7d22\u4f5c\u54c1\u6807\u9898\u3001\u6807\u7b7e\u6216\u7b80\u4ecb'"
              class="toolbar-input"
              @keyup.enter.native="handleFilter"
              @clear="handleFilter"
            />
            <el-select v-model="filters.status" size="small" clearable :placeholder="'\u5168\u90e8\u72b6\u6001'" @change="handleFilter">
              <el-option :label="'\u542f\u7528'" :value="'\u542f\u7528'" />
              <el-option :label="'\u505c\u7528'" :value="'\u505c\u7528'" />
            </el-select>
            <el-button size="small" type="primary" icon="el-icon-search" @click="handleFilter">{{ '\u67e5\u8be2' }}</el-button>
            <el-button size="small" icon="el-icon-plus" @click="openPortfolioDialog('create')">{{ '\u65b0\u589e\u4f5c\u54c1' }}</el-button>
          </div>
        </div>

        <div v-if="portfolioList.length" class="portfolio-preview-grid">
          <product-poster-card
            v-for="item in portfolioList"
            :key="item.id"
            :image-src="item.coverImageUrl"
            :image-alt="item.title || '\u4f5c\u54c1\u5c01\u9762'"
            :title="item.title || '\u672a\u547d\u540d\u4f5c\u54c1'"
            :subtitle="item.intro || '\u8865\u5145\u4f5c\u54c1\u7b80\u4ecb\u540e\uff0c\u8fd9\u91cc\u4f1a\u5c55\u793a\u66f4\u5b8c\u6574\u7684\u6848\u4f8b\u4fe1\u606f\u3002'"
            :tags="portfolioPreviewTags(item)"
            :badge="item.status || '\u4f5c\u54c1'"
            :action-text="'\u7f16\u8f91\u4f5c\u54c1'"
            @card-click="openPortfolioDialog('edit', item)"
            @action="openPortfolioDialog('edit', item)"
          />
        </div>
        <el-empty v-else :description="'\u8fd8\u6ca1\u6709\u4f5c\u54c1\uff0c\u5148\u521b\u5efa\u7b2c\u4e00\u6761\u6848\u4f8b'" :image-size="84" />

        <el-table v-loading="loading" :data="portfolioList" style="width: 100%">
          <el-table-column :label="'\u5c01\u9762'" width="100">
            <template slot-scope="scope">
              <div class="cover-cell">
                <img v-if="scope.row.coverImageUrl" :src="scope.row.coverImageUrl" :alt="scope.row.title || '\u4f5c\u54c1\u5c01\u9762'" />
                <div v-else class="cover-fallback">{{ '\u65e0\u56fe' }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="'\u4f5c\u54c1\u4fe1\u606f'" min-width="260">
            <template slot-scope="scope">
              <div class="work-title">{{ scope.row.title || '-' }}</div>
              <div class="work-intro">{{ scope.row.intro || '\u6682\u65e0\u7b80\u4ecb' }}</div>
              <div class="tag-wrap compact-tags">
                <el-tag v-for="tag in scope.row.tagList.slice(0, 4)" :key="tag" size="mini" effect="plain">{{ tag }}</el-tag>
                <span v-if="!scope.row.tagList.length" class="empty-inline">{{ '\u6682\u65e0\u6807\u7b7e' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="'\u72b6\u6001'" width="90">
            <template slot-scope="scope">
              <el-tag :type="scope.row.status === '\u542f\u7528' ? 'success' : 'info'" size="mini">{{ scope.row.status || '\u542f\u7528' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="'\u6392\u5e8f'" width="80" prop="sortOrder" />
          <el-table-column :label="'\u5173\u8054\u8ba2\u5355'" min-width="220">
            <template slot-scope="scope">
              <div class="order-summary">
                <div class="order-summary-count">{{ '\u5df2\u5173\u8054 ' + scope.row.linkedOrderCount + ' \u5355' }}</div>
                <div v-if="scope.row.linkedOrderNoList.length" class="order-chip-row">
                  <span v-for="no in scope.row.linkedOrderNoList.slice(0, 3)" :key="no" class="order-chip">{{ no }}</span>
                  <span v-if="scope.row.linkedOrderNoList.length > 3" class="order-chip muted">+{{ scope.row.linkedOrderNoList.length - 3 }}</span>
                </div>
                <span v-else class="empty-inline">{{ '\u6682\u65e0\u5173\u8054\u8ba2\u5355' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="'\u64cd\u4f5c'" width="250" fixed="right">
            <template slot-scope="scope">
              <div class="table-actions">
                <el-button size="mini" type="primary" plain @click="openPortfolioDialog('edit', scope.row)">{{ '\u7f16\u8f91' }}</el-button>
                <el-button size="mini" @click="openLinkDialog(scope.row)">{{ '\u5173\u8054\u8ba2\u5355' }}</el-button>
                <el-button size="mini" type="danger" plain @click="removePortfolio(scope.row)">{{ '\u5220\u9664' }}</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrap">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next"
            :current-page="filters.page"
            :page-size="filters.limit"
            :page-sizes="[6, 12, 18]"
            :total="portfolioTotal"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </article>
    </section>

    <el-dialog :title="'\u7f16\u8f91\u4e2a\u4eba\u8d44\u6599'" :visible.sync="profileDialogVisible" width="620px">
      <el-form :model="profileForm" label-width="96px" class="dialog-form">
        <el-form-item :label="'\u59d3\u540d'">
          <el-input v-model.trim="profileForm.shejishixingming" :maxlength="30" :placeholder="'\u8bf7\u8f93\u5165\u59d3\u540d'" />
        </el-form-item>
        <el-form-item :label="'\u5934\u50cf'">
          <file-upload action="file/upload" :limit="1" :multiple="false" :file-urls="profileForm.touxiang" @change="(val) => { profileForm.touxiang = val }" />
        </el-form-item>
        <el-form-item :label="'\u8054\u7cfb\u65b9\u5f0f'">
          <el-input v-model.trim="profileForm.lianxifangshi" :maxlength="30" :placeholder="'\u8bf7\u8f93\u5165\u8054\u7cfb\u65b9\u5f0f'" />
        </el-form-item>
        <el-form-item :label="'\u64c5\u957f\u65b9\u5411'">
          <el-input v-model.trim="profileForm.zhuanchang" :maxlength="120" :placeholder="'\u4f8b\u5982\uff1a\u6d1b\u4e3d\u5854\u3001\u5236\u670d\u3001\u821e\u53f0\u793c\u670d'" />
        </el-form-item>
        <el-form-item :label="'\u4e2a\u4eba\u7b80\u4ecb'">
          <el-input v-model.trim="profileForm.jianjie" type="textarea" :rows="5" maxlength="300" show-word-limit :placeholder="'\u8bf7\u8f93\u5165\u4e2a\u4eba\u7b80\u4ecb'" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="profileDialogVisible = false">{{ '\u53d6\u6d88' }}</el-button>
        <el-button type="primary" :loading="profileSubmitting" @click="submitProfile">{{ '\u4fdd\u5b58' }}</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="portfolioMode === 'create' ? '\u65b0\u589e\u4f5c\u54c1' : '\u7f16\u8f91\u4f5c\u54c1'" :visible.sync="portfolioDialogVisible" width="760px">
      <el-form :model="portfolioForm" label-width="96px" class="dialog-form">
        <el-form-item :label="'\u4f5c\u54c1\u6807\u9898'">
          <el-input v-model.trim="portfolioForm.title" maxlength="40" :placeholder="'\u8bf7\u8f93\u5165\u4f5c\u54c1\u6807\u9898'" />
        </el-form-item>
        <el-form-item :label="'\u5c01\u9762\u56fe'">
          <file-upload action="file/upload" :limit="1" :multiple="false" :file-urls="portfolioForm.coverImage" @change="(val) => { portfolioForm.coverImage = val }" />
        </el-form-item>
        <el-form-item :label="'\u4f5c\u54c1\u56fe\u96c6'">
          <file-upload action="file/upload" :limit="8" :multiple="true" :file-urls="portfolioForm.imageListValue" @change="(val) => { portfolioForm.imageListValue = val }" />
        </el-form-item>
        <el-form-item :label="'\u98ce\u683c\u6807\u7b7e'">
          <el-input v-model.trim="portfolioForm.styleTags" maxlength="120" :placeholder="'\u591a\u4e2a\u6807\u7b7e\u8bf7\u7528\u9017\u53f7\u5206\u9694'" />
        </el-form-item>
        <el-form-item :label="'\u4f5c\u54c1\u7b80\u4ecb'">
          <el-input v-model.trim="portfolioForm.intro" type="textarea" :rows="5" maxlength="400" show-word-limit :placeholder="'\u8bf7\u8f93\u5165\u4f5c\u54c1\u7b80\u4ecb'" />
        </el-form-item>
        <el-form-item :label="'\u72b6\u6001'">
          <el-radio-group v-model="portfolioForm.status">
            <el-radio-button :label="'\u542f\u7528'" />
            <el-radio-button :label="'\u505c\u7528'" />
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="'\u6392\u5e8f'">
          <el-input-number v-model="portfolioForm.sortOrder" :min="0" :max="9999" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="portfolioDialogVisible = false">{{ '\u53d6\u6d88' }}</el-button>
        <el-button type="primary" :loading="portfolioSubmitting" @click="submitPortfolio">{{ '\u4fdd\u5b58\u4f5c\u54c1' }}</el-button>
      </span>
    </el-dialog>

    <el-dialog :visible.sync="orderDialogVisible" width="760px">
      <div class="link-dialog-head">
        <strong>{{ currentPortfolioTitle || '\u672a\u9009\u62e9\u4f5c\u54c1' }}</strong>
        <p>{{ '\u53ea\u80fd\u5173\u8054\u5f53\u524d\u8bbe\u8ba1\u5e08\u81ea\u5df1\u7684\u5df2\u53d1\u8d27\u6216\u5df2\u5b8c\u6210\u8ba2\u5355' }}</p>
      </div>
      <el-checkbox-group v-model="selectedOrderIds" v-loading="orderOptionsLoading" class="order-option-group">
        <label v-for="item in orderOptions" :key="item.id" class="order-option-item">
          <el-checkbox :label="item.id">{{ item.orderNo || ('#' + item.id) }}</el-checkbox>
          <div class="order-option-title">{{ item.orderStatus || '\u72b6\u6001\u672a\u77e5' }}</div>
          <div class="order-option-meta">{{ '\u91d1\u989d\uff1a' + formatMoney(item.totalAmount) }}</div>
        </label>
      </el-checkbox-group>
      <el-empty v-if="!orderOptionsLoading && !orderOptions.length" :description="'\u6682\u65e0\u53ef\u5173\u8054\u8ba2\u5355'" :image-size="90" />
      <span slot="footer">
        <el-button @click="orderDialogVisible = false">{{ '\u53d6\u6d88' }}</el-button>
        <el-button type="primary" :loading="orderSubmitting" @click="submitOrderLinks">{{ '\u4fdd\u5b58\u5173\u8054' }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import ProductPosterCard from '@/components/ProductPosterCard'
const PORTFOLIO_STATUS_ENABLED = '\u542f\u7528'
const DEFAULT_DESIGNER_NAME = '\u8bbe\u8ba1\u5e08'
export default {
  name: 'DesignerProfile',
  components: {
    ProductPosterCard
  },
  data() {
    return {
      baseUrl: this.$config.baseUrl,
      loading: false,
      profileSubmitting: false,
      portfolioSubmitting: false,
      orderOptionsLoading: false,
      orderSubmitting: false,
      profileDialogVisible: false,
      portfolioDialogVisible: false,
      orderDialogVisible: false,
      portfolioMode: 'create',
      currentPortfolioId: null,
      currentPortfolioTitle: '',
      profile: {
        id: '',
        account: '',
        name: '',
        avatar: '',
        phone: '',
        specialty: '',
        intro: ''
      },
      profileForm: {
        shejishixingming: '',
        touxiang: '',
        lianxifangshi: '',
        zhuanchang: '',
        jianjie: ''
      },
      filters: {
        page: 1,
        limit: 6,
        keyword: '',
        status: ''
      },
      portfolioList: [],
      portfolioTotal: 0,
      portfolioStats: {
        total: 0,
        enabledCount: 0,
        orderLinkCount: 0
      },
      portfolioForm: {
        id: null,
        title: '',
        coverImage: '',
        imageListValue: '',
        styleTags: '',
        intro: '',
        status: PORTFOLIO_STATUS_ENABLED,
        sortOrder: 0
      },
      orderOptions: [],
      selectedOrderIds: [],
      linkedOrderIdsSnapshot: []
    }
  },
  computed: {
    displayName() {
      return this.profile.name || localStorage.getItem('username') || DEFAULT_DESIGNER_NAME
    },
    profileAvatar() {
      return this.toFileUrl(this.profile.avatar)
    },
    nameInitial() {
      const name = this.displayName || DEFAULT_DESIGNER_NAME
      return String(name).slice(0, 1)
    },
    specialtyTags() {
      return this.splitTags(this.profile.specialty)
    },
    completionPercent() {
      const fields = [this.profile.name, this.profile.avatar, this.profile.phone, this.profile.specialty, this.profile.intro]
      const done = fields.filter((item) => String(item || '').trim()).length
      return Math.round((done / fields.length) * 100)
    },
    completionHint() {
      if (this.completionPercent >= 100) {
        return '\u8d44\u6599\u5df2\u5b8c\u6574\uff0c\u53ef\u7ee7\u7eed\u6c89\u6dc0\u4f5c\u54c1\u548c\u6848\u4f8b\u8ba2\u5355\u3002'
      }
      if (this.completionPercent >= 60) {
        return '\u8d44\u6599\u57fa\u7840\u4fe1\u606f\u5df2\u8f83\u5b8c\u6574\uff0c\u5efa\u8bae\u7ee7\u7eed\u8865\u5145\u5934\u50cf\u3001\u64c5\u957f\u65b9\u5411\u548c\u7b80\u4ecb\u3002'
      }
      return '\u5efa\u8bae\u5b8c\u5584\u5934\u50cf\u3001\u8054\u7cfb\u65b9\u5f0f\u3001\u64c5\u957f\u65b9\u5411\u548c\u7b80\u4ecb\uff0c\u63d0\u9ad8\u5c55\u793a\u5b8c\u6574\u5ea6\u3002'
    },
    metricCards() {
      return [
        {
          label: '\u4f5c\u54c1\u603b\u6570',
          value: this.portfolioStats.total,
          sub: '\u5f53\u524d\u8bbe\u8ba1\u5e08\u540d\u4e0b\u7684\u4f5c\u54c1\u6761\u76ee\u6570',
          icon: 'el-icon-picture-outline',
          bg: 'linear-gradient(135deg, rgba(122, 162, 255, 0.18), rgba(195, 226, 255, 0.22))'
        },
        {
          label: '\u542f\u7528\u4f5c\u54c1',
          value: this.portfolioStats.enabledCount,
          sub: '\u5f53\u524d\u5904\u4e8e\u542f\u7528\u72b6\u6001\u7684\u4f5c\u54c1\u6570\u91cf',
          icon: 'el-icon-medal-1',
          bg: 'linear-gradient(135deg, rgba(102, 126, 234, 0.18), rgba(167, 139, 250, 0.20))'
        },
        {
          label: '\u5173\u8054\u8ba2\u5355',
          value: this.portfolioStats.orderLinkCount,
          sub: '\u7d2f\u8ba1\u6c89\u6dc0\u5230\u4f5c\u54c1\u96c6\u7684\u8ba2\u5355\u6848\u4f8b\u6570',
          icon: 'el-icon-collection-tag',
          bg: 'linear-gradient(135deg, rgba(74, 144, 226, 0.18), rgba(138, 196, 255, 0.2))'
        },
        {
          label: '\u8d44\u6599\u5b8c\u6574\u5ea6',
          value: `${this.completionPercent}%`,
          sub: '\u57fa\u4e8e\u5934\u50cf\u3001\u8054\u7cfb\u65b9\u5f0f\u3001\u64c5\u957f\u65b9\u5411\u548c\u7b80\u4ecb\u7684\u586b\u5199\u60c5\u51b5\u8ba1\u7b97',
          icon: 'el-icon-user-solid',
          bg: 'linear-gradient(135deg, rgba(100, 149, 237, 0.18), rgba(144, 205, 244, 0.2))'
        }
      ]
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    portfolioPreviewTags(item) {
      const tags = Array.isArray(item.tagList) ? item.tagList.slice(0, 2) : []
      tags.push('\u5173\u8054 ' + (item.linkedOrderCount || 0) + ' \u5355')
      if (item.status) {
        tags.push(item.status)
      }
      return tags
    },
    formatMoney(value) {
      return Number(value || 0).toFixed(2)
    },
    safeText(...values) {
      for (let i = 0; i < values.length; i += 1) {
        const value = values[i]
        if (value !== undefined && value !== null && String(value).trim() !== '') {
          return String(value).trim()
        }
      }
      return ''
    },
    parseNumber(value, fallback = 0) {
      const num = Number(value)
      return Number.isFinite(num) ? num : fallback
    },
    toFileUrl(url) {
      const raw = String(url || '').trim()
      if (!raw) return ''
      if (/^https?:/i.test(raw)) return raw
      const normalized = raw.replace(/^\/+/, '')
      return `${String(this.baseUrl || '').replace(/\/+$/, '')}/${normalized}`
    },
    normalizeFilePath(value) {
      const raw = String(value || '').trim().split('?')[0]
      if (!raw) return ''
      if (!/^https?:/i.test(raw)) {
        return raw.replace(/^\/+/, '')
      }
      const normalizedBase = `${String(this.baseUrl || '').replace(/\/+$/, '')}/`
      if (raw.indexOf(normalizedBase) === 0) {
        return raw.slice(normalizedBase.length).replace(/^\/+/, '')
      }
      const uploadIndex = raw.toLowerCase().indexOf('/upload/')
      if (uploadIndex >= 0) {
        return raw.slice(uploadIndex + 1)
      }
      return raw
    },
    normalizeFilePathList(value) {
      return this.parseImageList(value)
        .map((item) => this.normalizeFilePath(item))
        .filter(Boolean)
    },
    splitTags(value) {
      return String(value || '')
        .split(/[,\uff0c\u3001\n]+/)
        .map((item) => item.trim())
        .filter(Boolean)
    },
    parseImageList(raw) {
      if (!raw) return []
      if (Array.isArray(raw)) {
        return raw.map((item) => String(item || '').trim()).filter(Boolean)
      }
      const text = String(raw).trim()
      if (!text) return []
      if (text.startsWith('[')) {
        try {
          const list = JSON.parse(text)
          if (Array.isArray(list)) {
            return list.map((item) => String(item || '').trim()).filter(Boolean)
          }
        } catch (e) {
          return []
        }
      }
      return text.split(',').map((item) => item.trim()).filter(Boolean)
    },
    normalizePortfolioRows(rows = []) {
      return rows.map((item) => {
        const linkedOrderNos = this.safeText(item.linkedOrderNos, item.linked_order_nos)
        const imageListRaw = this.safeText(item.imageListJson, item.image_list_json)
        const coverImage = this.safeText(item.coverImage, item.cover_image)
        return {
          id: item.id,
          title: this.safeText(item.title),
          coverImage: this.normalizeFilePath(coverImage),
          coverImageUrl: this.toFileUrl(coverImage),
          imageListJson: imageListRaw,
          imageListValue: this.normalizeFilePathList(imageListRaw).join(','),
          styleTags: this.safeText(item.styleTags, item.style_tags),
          tagList: this.splitTags(this.safeText(item.styleTags, item.style_tags)),
          intro: this.safeText(item.intro),
          status: this.safeText(item.status) || PORTFOLIO_STATUS_ENABLED,
          sortOrder: this.parseNumber(this.safeText(item.sortOrder, item.sort_order), 0),
          addtime: this.safeText(item.addtime),
          linkedOrderCount: this.parseNumber(this.safeText(item.linkedOrderCount, item.linked_order_count), 0),
          linkedOrderNos,
          linkedOrderNoList: linkedOrderNos ? linkedOrderNos.split(/[,\\uff0c\\u3001\\n]+/).map((part) => part.trim()).filter(Boolean) : []
        }
      })
    },
    normalizeOrderOptions(rows = []) {
      return rows.map((item) => ({
        id: item.id,
        orderNo: this.safeText(item.orderNo, item.order_no),
        orderStatus: this.safeText(item.orderStatus, item.order_status),
        totalAmount: this.parseNumber(this.safeText(item.totalAmount, item.total_amount), 0),
        addtime: this.safeText(item.addtime),
        linked: Number(item.linked) === 1 || item.linked === true
      }))
    },
    resetPortfolioForm() {
      this.portfolioForm = {
        id: null,
        title: '',
        coverImage: '',
        imageListValue: '',
        styleTags: '',
        intro: '',
        status: PORTFOLIO_STATUS_ENABLED,
        sortOrder: 0
      }
    },
    async loadProfile() {
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.shejishiSession,
        method: 'get',
        showLoading: false,
        showError: false
      })
      const data = (res && res.data) || {}
      this.profile = {
        id: data.id || '',
        account: this.safeText(data.shejishizhanghao),
        name: this.safeText(data.shejishixingming),
        avatar: this.safeText(data.touxiang),
        phone: this.safeText(data.lianxifangshi),
        specialty: this.safeText(data.zhuanchang),
        intro: this.safeText(data.jianjie)
      }
      return !!res
    },
    async loadPortfolios() {
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.designerPortfolioPage,
        method: 'get',
        showLoading: false,
        showError: false,
        params: {
          page: this.filters.page,
          limit: this.filters.limit,
          keyword: this.filters.keyword,
          status: this.filters.status
        }
      })
      const data = (res && res.data) || {}
      this.portfolioList = this.normalizePortfolioRows(data.list || [])
      this.portfolioTotal = this.parseNumber(data.total, 0)
      const stats = data.stats || {}
      this.portfolioStats = {
        total: this.parseNumber(stats.total, this.portfolioTotal),
        enabledCount: this.parseNumber(stats.enabledCount, 0),
        orderLinkCount: this.parseNumber(stats.orderLinkCount, 0)
      }
      return !!res
    },
    async loadData() {
      this.loading = true
      try {
        const [profileOk, portfolioOk] = await Promise.all([this.loadProfile(), this.loadPortfolios()])
        if (!profileOk || !portfolioOk) {
          this.$message.warning('\u8d44\u6599\u6216\u4f5c\u54c1\u5217\u8868\u52a0\u8f7d\u4e0d\u5b8c\u6574\uff0c\u8bf7\u5237\u65b0\u91cd\u8bd5')
        }
      } finally {
        this.loading = false
      }
    },
    handleFilter() {
      this.filters.page = 1
      this.loadPortfolios()
    },
    handleSizeChange(size) {
      this.filters.limit = size
      this.filters.page = 1
      this.loadPortfolios()
    },
    handleCurrentChange(page) {
      this.filters.page = page
      this.loadPortfolios()
    },
    openProfileDialog() {
      this.profileForm = {
        shejishixingming: this.profile.name,
        touxiang: this.normalizeFilePath(this.profile.avatar),
        lianxifangshi: this.profile.phone,
        zhuanchang: this.profile.specialty,
        jianjie: this.profile.intro
      }
      this.profileDialogVisible = true
    },
    async submitProfile() {
      if (!String(this.profileForm.shejishixingming || '').trim()) {
        this.$message.warning('\u8bf7\u8f93\u5165\u8bbe\u8ba1\u5e08\u59d3\u540d')
        return
      }
      this.profileSubmitting = true
      try {
        const res = await this.$proxy.Request({
          url: this.$proxy.Api.shejishiUpdateMyProfile,
          method: 'post',
          dataType: 'json',
          params: { ...this.profileForm, touxiang: this.normalizeFilePath(this.profileForm.touxiang) }
        })
        if (!res) return
        this.$message.success(res.msg || '\u8d44\u6599\u5df2\u66f4\u65b0')
        this.profileDialogVisible = false
        await this.loadProfile()
      } finally {
        this.profileSubmitting = false
      }
    },
    openPortfolioDialog(mode, row) {
      this.portfolioMode = mode
      if (mode === 'edit' && row) {
        this.portfolioForm = {
          id: row.id,
          title: row.title,
          coverImage: row.coverImage,
          imageListValue: row.imageListValue,
          styleTags: row.styleTags,
          intro: row.intro,
          status: row.status || PORTFOLIO_STATUS_ENABLED,
          sortOrder: row.sortOrder || 0
        }
      } else {
        this.resetPortfolioForm()
      }
      this.portfolioDialogVisible = true
    },
    async submitPortfolio() {
      if (!String(this.portfolioForm.title || '').trim()) {
        this.$message.warning('\u8bf7\u8f93\u5165\u4f5c\u54c1\u6807\u9898')
        return
      }
      this.portfolioSubmitting = true
      try {
        const isCreate = this.portfolioMode === 'create'
        const res = await this.$proxy.Request({
          url: isCreate ? this.$proxy.Api.designerPortfolioSave : this.$proxy.Api.designerPortfolioUpdate,
          method: 'post',
          dataType: 'json',
          params: {
            id: this.portfolioForm.id,
            title: this.portfolioForm.title,
            coverImage: this.normalizeFilePath(this.portfolioForm.coverImage),
            imageListJson: this.normalizeFilePathList(this.portfolioForm.imageListValue).join(','),
            styleTags: this.portfolioForm.styleTags,
            intro: this.portfolioForm.intro,
            status: this.portfolioForm.status,
            sortOrder: this.portfolioForm.sortOrder
          }
        })
        if (!res) return
        this.$message.success(res.msg || (isCreate ? '\u4f5c\u54c1\u5df2\u65b0\u589e' : '\u4f5c\u54c1\u5df2\u66f4\u65b0'))
        this.portfolioDialogVisible = false
        await this.loadPortfolios()
      } finally {
        this.portfolioSubmitting = false
      }
    },
    removePortfolio(row) {
      this.$confirm(`\u786e\u5b9a\u5220\u9664\u4f5c\u54c1\u201c${row.title || row.id}\u201d\u5417\uff1f`, '\u63d0\u793a', {
        type: 'warning'
      })
        .then(async () => {
          const res = await this.$proxy.Request({
            url: this.$proxy.Api.designerPortfolioDelete,
            method: 'post',
            dataType: 'json',
            params: { ids: [row.id] }
          })
          if (!res) return
          this.$message.success(res.msg || '\u4f5c\u54c1\u5df2\u5220\u9664')
          if (this.portfolioList.length === 1 && this.filters.page > 1) {
            this.filters.page -= 1
          }
          await this.loadPortfolios()
        })
        .catch(() => {})
    },
    async openLinkDialog(row) {
      this.currentPortfolioId = row.id
      this.currentPortfolioTitle = row.title
      this.orderDialogVisible = true
      this.orderOptionsLoading = true
      try {
        const res = await this.$proxy.Request({
          url: this.$proxy.Api.designerPortfolioOrderOptions,
          method: 'get',
          showLoading: false,
          showError: false,
          params: { portfolioId: row.id }
        })
        const list = this.normalizeOrderOptions((res && res.data) || [])
        this.orderOptions = list
        this.selectedOrderIds = list.filter((item) => item.linked).map((item) => item.id)
        this.linkedOrderIdsSnapshot = [...this.selectedOrderIds]
        if (!res) {
          this.$message.warning('\u6848\u4f8b\u8ba2\u5355\u5217\u8868\u52a0\u8f7d\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5')
        }
      } finally {
        this.orderOptionsLoading = false
      }
    },
    async submitOrderLinks() {
      if (!this.currentPortfolioId) return
      const added = this.selectedOrderIds.filter((id) => !this.linkedOrderIdsSnapshot.includes(id))
      const removed = this.linkedOrderIdsSnapshot.filter((id) => !this.selectedOrderIds.includes(id))
      if (!added.length && !removed.length) {
        this.orderDialogVisible = false
        return
      }
      this.orderSubmitting = true
      try {
        if (added.length) {
          const res = await this.$proxy.Request({
            url: this.$proxy.Api.designerPortfolioLinkOrder,
            method: 'post',
            dataType: 'json',
            params: {
              portfolioId: this.currentPortfolioId,
              orderIds: added
            }
          })
          if (!res) return
        }
        if (removed.length) {
          const res = await this.$proxy.Request({
            url: this.$proxy.Api.designerPortfolioUnlinkOrder,
            method: 'post',
            dataType: 'json',
            params: {
              portfolioId: this.currentPortfolioId,
              orderIds: removed
            }
          })
          if (!res) return
        }
        this.$message.success('\u6848\u4f8b\u8ba2\u5355\u5df2\u66f4\u65b0')
        this.orderDialogVisible = false
        await this.loadPortfolios()
      } finally {
        this.orderSubmitting = false
      }
    }
  }
}
</script>

<style scoped>
.designer-profile-page {
  --profile-primary: #4f6ef7;
  --profile-primary-soft: rgba(79, 110, 247, 0.12);
  --profile-secondary: #7c8cff;
  --profile-accent: #55c7ff;
  --profile-bg: #eef4ff;
  --profile-surface: #ffffff;
  --profile-border: rgba(102, 126, 234, 0.12);
  --profile-text: #24324a;
  --profile-muted: #6f7d96;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-card,
.metric-card {
  background: var(--profile-surface);
  border: 1px solid var(--profile-border);
  border-radius: 20px;
  box-shadow: none;
}

.page-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.page-copy {
  display: grid;
  gap: 6px;
}

.page-tag {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid #dbe6ff;
  background: #f7faff;
  color: #5870bc;
  font-size: 12px;
  letter-spacing: 0.04em;
}

.page-copy h2 {
  margin: 0;
  color: var(--profile-text);
  font-size: 28px;
  line-height: 1.35;
}

.page-copy p {
  margin: 0;
  max-width: 760px;
  color: var(--profile-muted);
  line-height: 1.75;
}

.page-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.metric-icon {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--profile-primary);
  font-size: 22px;
}

.metric-label {
  font-size: 13px;
  color: var(--profile-muted);
}

.metric-value {
  margin: 6px 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--profile-text);
}

.metric-sub {
  font-size: 12px;
  color: var(--profile-muted);
  line-height: 1.6;
}

.content-grid {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.panel-card {
  padding: 22px;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.panel-head h3 {
  margin: 0 0 8px;
  color: var(--profile-text);
  font-size: 22px;
}

.panel-head p {
  margin: 0;
  color: var(--profile-muted);
  line-height: 1.7;
}

.profile-detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.detail-item {
  padding: 14px 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(238, 244, 255, 0.92), rgba(248, 250, 255, 0.98));
  border: 1px solid rgba(102, 126, 234, 0.08);
}

.detail-item span {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--profile-muted);
}

.detail-item strong {
  font-size: 15px;
  color: var(--profile-text);
}

.tag-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.compact-tags {
  margin-top: 10px;
}

.empty-inline {
  color: var(--profile-muted);
  font-size: 12px;
}

.intro-panel {
  margin-top: 16px;
  padding: 18px;
  border-radius: 20px;
  background: var(--profile-bg);
}

.intro-title {
  margin-bottom: 10px;
  font-size: 13px;
  color: var(--profile-muted);
}

.intro-text {
  color: var(--profile-text);
  line-height: 1.8;
  white-space: pre-line;
}

.portfolio-head {
  gap: 18px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-input {
  width: 240px;
}

.portfolio-preview-grid {
  margin: 18px 0 20px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.cover-cell {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  overflow: hidden;
  background: var(--profile-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-cell img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-fallback {
  font-size: 12px;
  color: var(--profile-muted);
}

.work-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--profile-text);
}

.work-intro {
  margin-top: 6px;
  color: var(--profile-muted);
  line-height: 1.7;
}

.order-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-summary-count {
  color: var(--profile-text);
  font-weight: 600;
}

.order-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.order-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(79, 110, 247, 0.1);
  color: var(--profile-primary);
  font-size: 12px;
}

.order-chip.muted {
  background: rgba(111, 125, 150, 0.12);
  color: var(--profile-muted);
}

.table-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

.dialog-form {
  padding-right: 12px;
}

.link-dialog-head {
  margin-bottom: 16px;
  padding: 14px 16px;
  border-radius: 18px;
  background: var(--profile-bg);
}

.link-dialog-head strong {
  display: block;
  color: var(--profile-text);
  font-size: 16px;
}

.link-dialog-head p {
  margin: 8px 0 0;
  color: var(--profile-muted);
}

.order-option-group {
  max-height: 420px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-option-item {
  display: block;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(102, 126, 234, 0.12);
  background: #fff;
}

.order-option-title {
  display: inline-block;
  min-width: 140px;
  color: var(--profile-text);
  font-weight: 600;
}

.order-option-meta {
  display: inline-block;
  margin-left: 10px;
  color: var(--profile-muted);
}

@media (max-width: 1200px) {
  .portfolio-preview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .page-toolbar {
    flex-direction: column;
  }

  .panel-head,
  .portfolio-head {
    flex-direction: column;
  }

  .toolbar-actions {
    width: 100%;
  }

  .toolbar-input {
    width: 100%;
  }

  .pagination-wrap {
    justify-content: flex-start;
    overflow: auto;
  }
}

@media (max-width: 640px) {
  .portfolio-preview-grid {
    grid-template-columns: 1fr;
  }

  .designer-profile-page {
    gap: 16px;
  }

  .page-copy h2 {
    font-size: 22px;
  }

  .panel-card,
  .metric-card {
    border-radius: 18px;
  }

  .panel-card {
    padding: 18px;
  }

  .metric-grid {
    grid-template-columns: 1fr;
  }
}
</style>
