<template>
  <div class="browse-page">
    <section class="filter-panel">
      <div class="panel-copy">
        <span class="panel-kicker">Style Gallery</span>
        <h2>{{ texts.title }}</h2>
      </div>
      <div class="filters">
        <el-radio-group v-model="activeType" size="small">
          <el-radio-button label="cos">{{ texts.cosLabel }}</el-radio-button>
          <el-radio-button label="suit">{{ texts.suitLabel }}</el-radio-button>
        </el-radio-group>
        <el-input v-model="keyword" clearable :placeholder="texts.searchPlaceholder" prefix-icon="el-icon-search" class="search-input" @keyup.enter.native="applyFilters" />
        <el-button type="primary" @click="applyFilters">{{ texts.filterButton }}</el-button>
      </div>
    </section>

    <section class="result-meta">
      <span>{{ texts.currentLabel }}{{ activeType === 'cos' ? texts.cosLabel : texts.suitLabel }}</span>
      <span>{{ texts.resultLabel }}{{ filteredList.length }}</span>
    </section>

    <section v-if="activeType === 'cos'" class="tryon-note">
      <i class="el-icon-magic-stick" />
      <span>{{ texts.tryOnHint }}</span>
    </section>

    <section v-loading="loading" class="result-panel">
      <div v-if="filteredList.length" class="card-grid">
        <product-poster-card
          v-for="item in filteredList"
          :key="itemKey(item)"
          :image-src="coverUrl(item)"
          :image-alt="item.fuzhuangmingcheng || texts.coverAlt"
          :title="item.fuzhuangmingcheng || texts.fallbackTitle"
          :subtitle="item.fuzhuangkuanshi || texts.fallbackSubtitle"
          :tags="buildTags(item)"
          :badge="activeType === 'cos' ? texts.cosBadge : texts.suitBadge"
          :price="item.fuzhuangjiage || item.price || 0"
          :action-text="activeType === 'cos' ? texts.viewDetail : texts.viewInspiration"
          :secondary-action-text="activeType === 'cos' ? texts.tryOn : ''"
          @card-click="goDetail(item)"
          @action="goDetail(item)"
          @secondary-action="openTryOn(item)"
        />
      </div>
      <el-empty v-else :description="texts.emptyText" :image-size="86" />
    </section>
  </div>
</template>

<script>
import ProductPosterCard from '@/components/ProductPosterCard'
import {
  createFallbackBodyProfile,
  createRecommendTryonContext,
  normalizeBodyProfile,
  saveTryonContext
} from '@/utils/Tryon'

const TEXTS = {
  title: '\u6b3e\u5f0f\u4e2d\u5fc3',
  subtitle: '\u652f\u6301 COS \u4e0e\u897f\u670d\u53cc\u5206\u7c7b\u6d4f\u89c8\uff0c\u5f53\u524d\u9ed8\u8ba4\u6309\u70ed\u5ea6\u4f18\u5148\u5c55\u793a\uff1b\u5176\u4e2d COS \u6b3e\u5df2\u8865\u5145\u4e00\u952e\u8fdb\u5165 AI \u8bd5\u7a7f\u7684\u5feb\u6377\u5165\u53e3\u3002',
  cosLabel: 'COS\u670d\u9970',
  suitLabel: '\u897f\u670d\u6b3e\u5f0f',
  searchPlaceholder: '\u641c\u7d22\u6b3e\u5f0f\u540d\u3001\u98ce\u683c\u6216\u9762\u6599',
  filterButton: '\u7b5b\u9009',
  currentLabel: '\u5f53\u524d\u5206\u7c7b\uff1a',
  resultLabel: '\u7ed3\u679c\u6570\u91cf\uff1a',
  coverAlt: '\u6b3e\u5f0f\u56fe',
  fallbackTitle: '\u672a\u547d\u540d\u6b3e\u5f0f',
  fallbackSubtitle: '\u98ce\u683c\u5f85\u5b8c\u5584',
  materialTag: '\u7cbe\u9009\u9762\u6599',
  hotPrefix: '\u70ed\u5ea6 ',
  cosBadge: '\u89d2\u8272\u6d77\u62a5',
  suitBadge: '\u897f\u670d\u7075\u611f',
  viewDetail: '\u67e5\u770b\u8be6\u60c5',
  viewInspiration: '\u67e5\u770b\u7075\u611f',
  tryOn: '\u0041\u0049\u8bd5\u7a7f',
  tryOnHint: '\u5f53\u524d COS \u5217\u8868\u652f\u6301\u76f4\u63a5\u8fdb\u5165 AI \u8bd5\u7a7f\uff0c\u9002\u5408\u7ed3\u5408\u5168\u8eab\u7167\u5feb\u901f\u9884\u89c8\u4e0a\u8eab\u6548\u679c\u3002',
  emptyText: '\u6ca1\u6709\u627e\u5230\u5339\u914d\u6b3e\u5f0f\uff0c\u8bd5\u8bd5\u66f4\u77ed\u7684\u5173\u952e\u8bcd',
  needLogin: '\u67e5\u770b\u8be6\u60c5\u524d\u8bf7\u5148\u767b\u5f55\u6216\u6ce8\u518c',
  suitTip: '\u897f\u670d\u8be6\u60c5\u9875\u6b63\u5728\u5347\u7ea7\uff0c\u53ef\u5148\u67e5\u770b\u70ed\u95e8\u7075\u611f\u5217\u8868\u3002',
  tryOnReady: '\u5df2\u5e26\u4f60\u8fdb\u5165 AI \u8bd5\u7a7f\uff0c\u53ef\u4e0a\u4f20\u56fe\u7247\u5f00\u59cb\u751f\u6210\u6548\u679c\u3002'
}

export default {
  name: 'BrowsePage',
  components: { ProductPosterCard },
  data() {
    return {
      texts: TEXTS,
      baseUrl: this.$config.baseUrl,
      loading: false,
      activeType: 'cos',
      keyword: '',
      searchKey: '',
      allCosList: [],
      allSuitList: []
    }
  },
  computed: {
    activeList() {
      return this.activeType === 'cos' ? this.allCosList : this.allSuitList
    },
    filteredList() {
      const search = String(this.searchKey || '').trim().toLowerCase()
      if (!search) return this.activeList
      return this.activeList.filter((item) => [item.fuzhuangmingcheng, item.fuzhuangkuanshi, item.mianliaoleibie, item.fuzhuangxiangqing].some((field) => String(field || '').toLowerCase().includes(search)))
    }
  },
  watch: {
    activeType() {
      this.updateRouteQuery()
    }
  },
  created() {
    this.activeType = this.$route.query.type === 'suit' ? 'suit' : 'cos'
    this.keyword = this.$route.query.keyword || ''
    this.searchKey = this.keyword
    this.loadData()
  },
  methods: {
    itemKey(item) {
      return `${this.activeType}-${item.id || item.fuzhuangbianhao || item.fuzhuangmingcheng || 'item'}`
    },
    coverUrl(item) {
      const first = String(item.huawentuan || '').split(',')[0] || ''
      return first ? (first.startsWith('http') ? first : `${this.baseUrl}${first}`) : ''
    },
    buildTags(item) {
      return [item.mianliaoleibie || this.texts.materialTag, `${this.texts.hotPrefix}${item.clicknum || 0}`]
    },
    applyFilters() {
      this.searchKey = this.keyword.trim()
      this.updateRouteQuery()
    },
    updateRouteQuery() {
      const nextQuery = { type: this.activeType }
      const keyword = this.searchKey.trim()
      if (keyword) nextQuery.keyword = keyword
      if (JSON.stringify(nextQuery) !== JSON.stringify(this.$route.query || {})) {
        this.$router.replace({ path: '/index/browse', query: nextQuery })
      }
    },
    goDetail(item) {
      if (this.activeType === 'cos') {
        const target = { path: '/index/remaicosfuDetail', query: { detailObj: JSON.stringify(item) } }
        if (!localStorage.getItem('Token')) {
          this.$message.info(this.texts.needLogin)
          this.$authDialogBus.$emit('open', { mode: 'login', role: 'yonghu', redirect: target })
          return
        }
        this.$router.push(target)
        return
      }
      this.$message.info(this.texts.suitTip)
    },
    async resolveDefaultBodyProfile() {
      if (!localStorage.getItem('Token') || !this.$proxy || !this.$proxy.Request || !this.$proxy.Api || !this.$proxy.Api.cosProfileBodyDefault) {
        return createFallbackBodyProfile()
      }
      try {
        const res = await this.$proxy.Request({
          url: this.$proxy.Api.cosProfileBodyDefault,
          method: 'get',
          showLoading: false
        })
        if (res && res.code === 0 && res.data) {
          return normalizeBodyProfile(res.data)
        }
      } catch (error) {
        return createFallbackBodyProfile()
      }
      return createFallbackBodyProfile()
    },
    async openTryOn(item) {
      if (this.activeType !== 'cos') {
        this.$message.info(this.texts.suitTip)
        return
      }
      const bodyProfile = await this.resolveDefaultBodyProfile()
      const context = createRecommendTryonContext(item, bodyProfile)
      saveTryonContext(context)
      this.$router.push({
        path: '/index/tryon',
        query: {
          productId: context.productId,
          source: 'recommend'
        }
      })
      this.$message.success(this.texts.tryOnReady)
    },
    async loadData() {
      this.loading = true
      try {
        const [cosRes, suitRes] = await Promise.all([
          this.$http.get('remaicosfu/list', { params: { page: 1, limit: 100, sort: 'clicknum', order: 'desc' } }),
          this.$http.get('remaixifu/list', { params: { page: 1, limit: 100, sort: 'clicknum', order: 'desc' } })
        ])
        if (cosRes.data.code === 0) this.allCosList = (cosRes.data.data && cosRes.data.data.list) || []
        if (suitRes.data.code === 0) this.allSuitList = (suitRes.data.data && suitRes.data.data.list) || []
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.browse-page { --browse-primary:#4f6fd8; --browse-primary-deep:#223b86; --browse-soft-2:#eef2ff; --browse-line:#e4eafb; --browse-text-soft:#7380ab; display:grid; gap:16px; border-radius:24px; border:1px solid var(--browse-line); background:radial-gradient(circle at top left, rgba(116,145,255,.12), transparent 28%), linear-gradient(180deg, #ffffff 0%, #fbfcff 100%); padding:22px; box-shadow:0 20px 40px rgba(72,95,165,.1); }
.filter-panel { display:flex; justify-content:space-between; align-items:flex-end; gap:16px; flex-wrap:wrap; }
.panel-copy { max-width:560px; }
.panel-kicker { display:inline-flex; align-items:center; height:28px; padding:0 12px; border-radius:999px; background:var(--browse-soft-2); color:var(--browse-primary); font-size:12px; font-weight:700; letter-spacing:.12em; }
.filter-panel h2 { margin:10px 0 0; font-size:30px; color:var(--browse-primary-deep); }
.filter-panel p { margin:8px 0 0; color:var(--browse-text-soft); line-height:1.8; }
.filters { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.search-input { width:300px; }
.result-meta { border-top:1px dashed var(--browse-line); padding-top:14px; display:flex; justify-content:space-between; gap:12px; color:#6676a4; font-size:13px; flex-wrap:wrap; }
.tryon-note { display:flex; align-items:center; gap:10px; padding:12px 14px; border-radius:16px; background:linear-gradient(135deg, rgba(91,110,245,.12), rgba(78,163,255,.08)); color:#4a5fd2; }
.tryon-note i { font-size:18px; }
.result-panel { min-height:260px; }
.card-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:18px; }
@media (max-width:1200px){ .card-grid{ grid-template-columns:repeat(3,minmax(0,1fr)); } }
@media (max-width:900px){ .browse-page{ padding:18px; } .search-input{ width:100%; } .card-grid{ grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media (max-width:640px){ .card-grid{ grid-template-columns:1fr; } .filter-panel h2{ font-size:26px; } }
</style>
