<template>
  <div class="designer-inspirations-page">
    <section class="hero-card">
      <div>
        <span class="hero-kicker">Inspiration Board</span>
        <h2>{{ texts.title }}</h2>
        <p>{{ texts.subtitle }}</p>
      </div>
      <div class="hero-actions">
        <el-input v-model="keyword" size="small" clearable prefix-icon="el-icon-search" :placeholder="texts.searchPlaceholder" class="toolbar-input" @keyup.enter.native="applyFilter" @clear="applyFilter" />
        <el-select v-model="sortMode" size="small" class="sort-select" @change="applyFilter">
          <el-option :label="texts.hotFirst" value="hot" />
          <el-option :label="texts.latestFirst" value="latest" />
        </el-select>
        <el-button size="small" type="primary" icon="el-icon-search" @click="applyFilter">{{ texts.filterButton }}</el-button>
        <el-button size="small" @click="goBrowse">{{ texts.goBrowse }}</el-button>
      </div>
    </section>

    <section class="content-card" v-loading="loading">
      <div class="meta-row">
        <span>{{ texts.totalLabel }}{{ filteredList.length }}</span>
        <span>{{ texts.sourceLabel }}</span>
      </div>
      <div v-if="filteredList.length" class="card-grid">
        <product-poster-card
          v-for="item in filteredList"
          :key="item.id || item.fuzhuangbianhao || item.fuzhuangmingcheng"
          :image-src="coverUrl(item)"
          :image-alt="item.fuzhuangmingcheng || texts.coverAlt"
          :title="item.fuzhuangmingcheng || texts.fallbackTitle"
          :subtitle="item.fuzhuangkuanshi || texts.fallbackSubtitle"
          :tags="buildTags(item)"
          :badge="texts.badge"
          :price="item.fuzhuangjiage || 0"
          :action-text="texts.viewDetail"
          @card-click="openDetail(item)"
          @action="openDetail(item)"
        />
      </div>
      <el-empty v-else :description="texts.emptyText" :image-size="90" />
    </section>
  </div>
</template>

<script>
import ProductPosterCard from '@/components/ProductPosterCard'
const TEXTS = { title:'\u70ed\u95e8\u7075\u611f', subtitle:'\u628a\u9ad8\u70ed\u89d2\u8272\u6b3e\u5f0f\u96c6\u4e2d\u653e\u5230\u4e00\u4e2a\u72ec\u7acb\u9875\u9762\u4e2d\u6d4f\u89c8\uff0c\u5de5\u4f5c\u53f0\u548c\u8ba2\u5355\u9875\u4fdd\u6301\u805a\u7126\uff0c\u7075\u611f\u67e5\u770b\u56de\u5230\u7edf\u4e00\u7684\u6d77\u62a5\u5361\u4f53\u9a8c\u3002', searchPlaceholder:'\u641c\u7d22\u89d2\u8272\u3001\u4f5c\u54c1\u6216\u9762\u6599\u5173\u952e\u8bcd', hotFirst:'\u70ed\u5ea6\u4f18\u5148', latestFirst:'\u6700\u65b0\u4e0a\u67b6', filterButton:'\u7b5b\u9009', goBrowse:'\u524d\u5f80\u6b3e\u5f0f\u4e2d\u5fc3', totalLabel:'\u7075\u611f\u6570\u91cf\uff1a', sourceLabel:'\u9ed8\u8ba4\u6765\u6e90\uff1a\u70ed\u95e8\u5546\u54c1\u63a5\u53e3', coverAlt:'\u7075\u611f\u56fe', fallbackTitle:'\u672a\u547d\u540d\u6b3e\u5f0f', fallbackSubtitle:'\u98ce\u683c\u5f85\u5b8c\u5584', materialTag:'\u7cbe\u9009\u9762\u6599', designTag:'\u89d2\u8272\u5b9a\u5236', hotPrefix:'\u70ed\u5ea6 ', badge:'\u70ed\u95e8\u7075\u611f', viewDetail:'\u67e5\u770b\u8be6\u60c5', emptyText:'\u6682\u65f6\u6ca1\u6709\u5339\u914d\u7684\u7075\u611f\u5185\u5bb9', loadFail:'\u70ed\u95e8\u7075\u611f\u52a0\u8f7d\u5931\u8d25\uff0c\u5df2\u663e\u793a\u7a7a\u72b6\u6001' }
export default {
  name: 'DesignerInspirations',
  components: { ProductPosterCard },
  data() { return { texts: TEXTS, baseUrl: this.$config.baseUrl, loading: false, keyword: '', searchKey: '', sortMode: 'hot', list: [] } },
  computed: {
    filteredList() { let rows = [...this.list]; const keyword = String(this.searchKey || '').trim().toLowerCase(); if (keyword) rows = rows.filter((item) => [item.fuzhuangmingcheng,item.fuzhuangkuanshi,item.mianliaoleibie,item.fuzhuangxiangqing].some((field) => String(field || '').toLowerCase().includes(keyword))); if (this.sortMode === 'latest') rows.sort((a,b) => String(b.addtime || '').localeCompare(String(a.addtime || ''))); else rows.sort((a,b) => Number(b.clicknum || 0) - Number(a.clicknum || 0)); return rows }
  },
  created() { this.loadList() },
  methods: {
    coverUrl(item) { const first = String(item.huawentuan || '').split(',')[0] || ''; return first ? (first.startsWith('http') ? first : `${this.baseUrl}${first}`) : '' },
    buildTags(item) { return [item.mianliaoleibie || this.texts.materialTag, item.fuzhuangkuanshi || this.texts.designTag, `${this.texts.hotPrefix}${item.clicknum || 0}`] },
    applyFilter() { this.searchKey = this.keyword.trim() },
    goBrowse() { this.$router.push({ path: '/index/browse', query: { type: 'cos' } }) },
    openDetail(item) { this.$router.push({ path: '/index/remaicosfuDetail', query: { detailObj: JSON.stringify(item) } }) },
    async loadList() { this.loading = true; try { const res = await this.$proxy.Request({ url: this.$proxy.Api.remaicosfuAutoSort, method: 'get', showLoading: false, showError: false, params: { page: 1, limit: 24 } }); if (!res || res.code !== 0) { this.$message.warning(this.texts.loadFail); return } const data = res.data || {}; this.list = data.list || [] } finally { this.loading = false } }
  }
}
</script>

<style scoped>
.designer-inspirations-page { display:grid; gap:16px; }
.hero-card,.content-card { border-radius:24px; border:1px solid rgba(96,116,208,.16); background:#fff; box-shadow:0 16px 34px rgba(71,89,163,.08); }
.hero-card { display:grid; gap:16px; padding:24px; background:radial-gradient(circle at top right, rgba(103,130,247,.14), transparent 24%), linear-gradient(180deg, #ffffff 0%, #f8faff 100%); }
.hero-kicker { display:inline-flex; align-items:center; padding:6px 12px; border-radius:999px; background:rgba(84,111,235,.1); color:#4f6ef7; font-size:12px; letter-spacing:.08em; }
.hero-card h2 { margin:12px 0 0; color:#24356b; font-size:30px; }
.hero-card p { margin:8px 0 0; max-width:760px; color:#7481ab; line-height:1.8; }
.hero-actions { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
.toolbar-input { width:280px; }
.sort-select { width:120px; }
.content-card { padding:20px; }
.meta-row { display:flex; justify-content:space-between; gap:12px; margin-bottom:16px; color:#7d89af; font-size:13px; flex-wrap:wrap; }
.card-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:18px; }
@media (max-width:1200px){ .card-grid{ grid-template-columns:repeat(3,minmax(0,1fr)); } }
@media (max-width:900px){ .toolbar-input,.sort-select{ width:100%; } .card-grid{ grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media (max-width:640px){ .hero-card,.content-card{ padding:18px; } .card-grid{ grid-template-columns:1fr; } }
</style>