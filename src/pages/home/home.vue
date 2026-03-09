<template>
  <div class="home-page">
    <section class="stats-grid">
      <div v-for="card in dashboardCards" :key="card.label" class="stats-card">
        <div class="icon" :style="{ background: card.bg }"><i :class="card.icon" /></div>
        <div><div class="label">{{ card.label }}</div><div class="value">{{ card.value }}</div></div>
      </div>
    </section>

    <section class="recommend-block">
      <div class="section-head">
        <div><h2>{{ texts.recommendTitle }}</h2><p>{{ texts.recommendDesc }}</p></div>
        <el-radio-group v-model="activeFeed" size="small">
          <el-radio-button label="cos">{{ texts.recommendCos }}</el-radio-button>
          <el-radio-button label="suit">{{ texts.recommendSuit }}</el-radio-button>
        </el-radio-group>
      </div>
      <div class="card-grid">
        <product-poster-card v-for="item in feedList.slice(0, 8)" :key="`${activeFeed}-${item.id}`" :image-src="imgUrl((item.huawentuan || '').split(',')[0])" :image-alt="item.fuzhuangmingcheng || texts.coverAlt" :title="item.fuzhuangmingcheng || texts.fallbackTitle" :subtitle="item.fuzhuangkuanshi || texts.fallbackSubtitle" :tags="[item.mianliaoleibie || texts.materialTag, `${texts.hotPrefix}${item.clicknum || 0}`]" :badge="activeFeed === 'cos' ? texts.recommendCosBadge : texts.recommendSuitBadge" :price="item.fuzhuangjiage || item.price || 0" :action-text="activeFeed === 'cos' ? texts.viewDetail : texts.viewInspiration" @card-click="openRecommend(item, activeFeed)" @action="openRecommend(item, activeFeed)" />
      </div>
    </section>

    <section class="content-grid">
      <el-card shadow="never" class="intro-card">
        <div slot="header" class="slot-title"><span>{{ systemIntro.title || texts.storyTitle }}</span></div>
        <div class="intro-media">
          <img :src="imgUrl(systemIntro.picture1)" :alt="texts.introImage1" />
          <img :src="imgUrl(systemIntro.picture2)" :alt="texts.introImage2" />
        </div>
        <div class="intro-content" v-html="systemIntro.content || texts.defaultIntro" />
      </el-card>

      <el-card shadow="never" class="news-card">
        <div slot="header" class="slot-title between">
          <span>{{ texts.newsTitle }}</span>
          <el-button type="text" @click="toBrowse(activeFeed)">{{ texts.goBrowse }}</el-button>
        </div>
        <div v-if="newsList.length" class="news-list">
          <div v-for="item in newsList" :key="item.id" class="news-item">
            <img :src="imgUrl(item.picture)" :alt="texts.newsCoverAlt" />
            <div class="news-content">
              <h4>{{ item.title }}</h4>
              <p>{{ summaryText(item.introduction, 52) }}</p>
              <span>{{ formatDate(item.addtime) }}</span>
            </div>
          </div>
        </div>
        <el-empty v-else :description="texts.newsEmpty" :image-size="76" />
      </el-card>
    </section>
  </div>
</template>

<script>
import ProductPosterCard from '@/components/ProductPosterCard'
const TEXTS = { eyebrow:'\u6b21\u5143\u5b9a\u5236\u5168\u6d41\u7a0b', heroTitle:'\u628a\u4f60\u60f3\u8c61\u4e2d\u7684\u89d2\u8272\u670d\u88c5\uff0c\u505a\u6210\u771f\u6b63\u53ef\u4ee5\u7a7f\u7740\u7684\u4f5c\u54c1', heroDesc:'\u6253\u901a\u7528\u6237\u4e0b\u5355\u3001\u7ba1\u7406\u5458\u534f\u540c\u3001\u8bbe\u8ba1\u5e08\u63a5\u5355\u4e09\u7aef\u6d41\u7a0b\u3002\u5148\u6d4f\u89c8\u70ed\u95e8\u6b3e\u5f0f\uff0c\u518d\u8fdb\u5165\u4e2a\u6027\u5316\u5b9a\u5236\uff0c\u8ba2\u5355\u72b6\u6001\u5168\u7a0b\u53ef\u8ffd\u8e2a\u3002', browseCos:'\u6d4f\u89c8 COS \u6b3e\u5f0f', browseSuit:'\u6d4f\u89c8\u897f\u670d\u6b3e\u5f0f', searchPlaceholder:'\u8bf7\u8f93\u5165\u6b3e\u5f0f\u540d\u3001\u98ce\u683c\u6216\u9762\u6599\u5173\u952e\u8bcd', cosOption:'COS\u6b3e', suitOption:'\u897f\u670d\u6b3e', hotCoverAlt:'\u70ed\u95e8\u6b3e\u5f0f', hotSubtitle:'\u9ad8\u70ed\u89d2\u8272\u5b9a\u5236', featuredBadge:'\u7cbe\u9009\u6b3e', hotPrefix:'\u70ed\u5ea6 ', recommendTitle:'\u70ed\u95e8\u63a8\u8350', recommendDesc:'\u9ed8\u8ba4\u6309\u70ed\u5ea6\u6392\u5e8f\uff0c\u4f18\u5148\u5c55\u793a\u8fd1\u671f\u5173\u6ce8\u5ea6\u66f4\u9ad8\u7684\u6b3e\u5f0f\u3002', recommendCos:'COS \u70ed\u95e8\u6b3e', recommendSuit:'\u897f\u670d\u70ed\u95e8\u6b3e', coverAlt:'\u6b3e\u5f0f\u56fe', fallbackTitle:'\u672a\u547d\u540d\u6b3e\u5f0f', fallbackSubtitle:'\u98ce\u683c\u5f85\u5b8c\u5584', materialTag:'\u7cbe\u9009\u9762\u6599', recommendCosBadge:'COS \u70ed\u95e8', recommendSuitBadge:'\u897f\u670d\u7075\u611f', viewDetail:'\u67e5\u770b\u8be6\u60c5', viewInspiration:'\u67e5\u770b\u7075\u611f', storyTitle:'\u54c1\u724c\u6545\u4e8b', introImage1:'\u4ecb\u7ecd\u56fe\u4e00', introImage2:'\u4ecb\u7ecd\u56fe\u4e8c', defaultIntro:'\u6b22\u8fce\u6765\u5230\u6b21\u5143\u5b9a\u5236\u670d\u88c5\u5e73\u53f0\u3002', newsTitle:'\u6700\u65b0\u8d44\u8baf', goBrowse:'\u524d\u5f80\u6b3e\u5f0f\u4e2d\u5fc3', newsCoverAlt:'\u8d44\u8baf\u5c01\u9762', newsEmpty:'\u6682\u65f6\u8fd8\u6ca1\u6709\u8d44\u8baf\u5185\u5bb9', noSummary:'\u6682\u65f6\u8fd8\u6ca1\u6709\u6458\u8981\u5185\u5bb9', needLogin:'\u67e5\u770b\u8be6\u60c5\u524d\u8bf7\u5148\u767b\u5f55\u6216\u6ce8\u518c', suitTip:'\u897f\u670d\u8be6\u60c5\u9875\u6b63\u5728\u5347\u7ea7\uff0c\u53ef\u5148\u5728\u6b3e\u5f0f\u4e2d\u5fc3\u6d4f\u89c8\u66f4\u591a\u7075\u611f\u3002' }
export default {
  name:'HomePage',
  components:{ ProductPosterCard },
  data(){ return { texts:TEXTS, baseUrl:'', keyword:'', activeFeed:'cos', systemIntro:{}, newsList:[], hotCosList:[], hotSuitList:[] } },
  computed:{
    feedList(){ return this.activeFeed === 'cos' ? this.hotCosList : this.hotSuitList },
    dashboardCards(){ return [ { label:'COS \u70ed\u95e8\u6b3e', value:this.hotCosList.length, icon:'el-icon-s-opportunity', bg:'#e9f1ff' }, { label:'\u897f\u670d\u70ed\u95e8\u6b3e', value:this.hotSuitList.length, icon:'el-icon-suitcase', bg:'#fdf0e9' }, { label:'\u5e73\u53f0\u8d44\u8baf', value:this.newsList.length, icon:'el-icon-reading', bg:'#eef8ef' } ] }
  },
  created(){ this.baseUrl = this.$config.baseUrl; this.loadSystemIntro(); this.loadNews(); this.loadHotLists() },
  methods:{
    imgUrl(path){ if(!path) return ''; return path.startsWith('http') ? path : `${this.baseUrl}${path}` },
    summaryText(text, limit=60){ const plainText = String(text || '').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim(); if(!plainText) return this.texts.noSummary; return plainText.length > limit ? `${plainText.slice(0, limit)}...` : plainText },
    formatDate(time){ if(!time) return '-'; return String(time).split(' ')[0] },
    toBrowse(type='cos'){ this.$router.push({ path:'/index/browse', query:{ type } }) },
    searchProduct(){ this.$router.push({ path:'/index/browse', query:{ type:this.activeFeed, keyword:this.keyword.trim() } }) },
    openRecommend(item, type='cos'){ if(type === 'cos'){ const target = { path:'/index/remaicosfuDetail', query:{ detailObj: JSON.stringify(item) } }; if(!localStorage.getItem('Token')){ this.$message.info(this.texts.needLogin); this.$authDialogBus.$emit('open', { mode:'login', role:'yonghu', redirect:target }); return } this.$router.push(target); return } this.$message.info(this.texts.suitTip); this.$router.push({ path:'/index/browse', query:{ type:'suit' } }) },
    loadSystemIntro(){ this.$http.get('systemintro/detail/1').then((res) => { if(res.data.code === 0) this.systemIntro = res.data.data || {} }) },
    loadNews(){ this.$http.get('news/list', { params:{ page:1, limit:3, sort:'id', order:'desc' } }).then((res) => { if(res.data.code === 0) this.newsList = (res.data.data && res.data.data.list) || [] }) },
    loadHotLists(){ const cosAutoSortUrl = localStorage.getItem('Token') ? 'remaicosfu/autoSort2' : 'remaicosfu/autoSort'; const suitAutoSortUrl = localStorage.getItem('Token') ? 'remaixifu/autoSort2' : 'remaixifu/autoSort'; this.$http.get(cosAutoSortUrl, { params:{ page:1, limit:10 } }).then((res) => { if(res.data.code === 0) this.hotCosList = (res.data.data && res.data.data.list) || [] }); this.$http.get(suitAutoSortUrl, { params:{ page:1, limit:10 } }).then((res) => { if(res.data.code === 0) this.hotSuitList = (res.data.data && res.data.data.list) || [] }) }
  }
}
</script>

<style scoped>
.home-page { display:grid; gap:16px; }
.stats-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
.stats-card { display:flex; align-items:center; gap:12px; padding:16px; border-radius:18px; border:1px solid #edf1ff; background:#fff; box-shadow:0 12px 24px rgba(83,105,172,.08); }
.icon { width:44px; height:44px; border-radius:14px; display:grid; place-items:center; color:#3f4f8f; font-size:20px; }
.label { color:#7b88b4; font-size:13px; }
.value { margin-top:4px; color:#233366; font-size:24px; font-weight:700; }
.recommend-block,.intro-card,.news-card { border-radius:22px; border:1px solid #e8eeff; background:#fff; box-shadow:0 14px 30px rgba(83,105,172,.08); }
.recommend-block { padding:22px; }
.section-head,.slot-title.between { display:flex; align-items:center; justify-content:space-between; gap:16px; }
.section-head h2,.slot-title span { color:#24356b; font-size:22px; font-weight:700; }
.section-head p { margin-top:8px; color:#7b88b4; }
.card-grid { margin-top:18px; display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; }
.content-grid { display:grid; grid-template-columns:1.2fr .9fr; gap:14px; }
.intro-media { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
.intro-media img,.news-item img { width:100%; object-fit:cover; background:#f2f4fc; }
.intro-media img { height:210px; border-radius:16px; }
.intro-content { margin-top:14px; color:#516188; line-height:1.85; }
.news-list { display:grid; gap:12px; }
.news-item { display:grid; grid-template-columns:110px minmax(0,1fr); gap:12px; padding:12px; border-radius:16px; background:#fafbff; }
.news-item img { height:92px; border-radius:12px; }
.news-content h4 { color:#24356b; font-size:15px; }
.news-content p { margin-top:8px; color:#7b88b4; line-height:1.7; font-size:13px; }
.news-content span { display:inline-block; margin-top:10px; color:#9aa6c9; font-size:12px; }
@media (max-width:1200px){ .card-grid{ grid-template-columns:repeat(2,minmax(0,1fr)); } .content-grid{ grid-template-columns:1fr; } }
@media (max-width:768px){ .recommend-block{ padding:18px; } .stats-grid,.card-grid,.content-grid,.intro-media{ grid-template-columns:1fr; } .section-head,.slot-title.between{ align-items:flex-start; flex-direction:column; } .news-item{ grid-template-columns:1fr; } }
</style>