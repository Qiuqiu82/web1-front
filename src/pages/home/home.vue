<template>
  <div class="home-page">
    <section class="hero-panel">
      <div class="hero-main">
        <div class="eyebrow">次元定制全流程</div>
        <h1>把你想象中的角色服装，做成真正可以穿着的作品</h1>
        <p class="hero-desc">
          打通用户下单、管理员协同、设计师接单三端流程。先浏览热门款式，再进入个性化定制，订单状态全程可追踪。
        </p>

        <div class="hero-actions">
          <el-button type="primary" round @click="toBrowse('cos')">浏览 COS 款式</el-button>
          <el-button round @click="toBrowse('suit')">浏览西服款式</el-button>
        </div>

        <div class="search-row">
          <el-input
            v-model="keyword"
            clearable
            placeholder="请输入款式名、风格或面料关键词"
            @keyup.enter.native="searchProduct"
          >
            <el-select slot="prepend" v-model="activeFeed" style="width: 110px">
              <el-option label="COS款" value="cos" />
              <el-option label="西服款" value="suit" />
            </el-select>
            <el-button slot="append" icon="el-icon-search" @click="searchProduct" />
          </el-input>
        </div>
      </div>

      <div class="hero-side">
        <div
          v-for="item in hotCosList.slice(0, 3)"
          :key="item.id"
          class="spotlight-card"
          @click="openRecommend(item, 'cos')"
        >
          <img :src="imgUrl((item.huawentuan || '').split(',')[0])" alt="热门款式" />
          <div class="spotlight-info">
            <div class="name">{{ item.fuzhuangmingcheng || '热门款式' }}</div>
            <div class="meta">热度 {{ item.clicknum || 0 }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="stats-grid">
      <div v-for="card in dashboardCards" :key="card.label" class="stats-card">
        <div class="icon" :style="{ background: card.bg }">
          <i :class="card.icon" />
        </div>
        <div>
          <div class="label">{{ card.label }}</div>
          <div class="value">{{ card.value }}</div>
        </div>
      </div>
    </section>

    <section class="recommend-block">
      <div class="section-head">
        <div>
          <h2>热门推荐</h2>
          <p>默认按热度排序，优先展示近期关注度更高的款式。</p>
        </div>
        <el-radio-group v-model="activeFeed" size="small">
          <el-radio-button label="cos">COS 热门款</el-radio-button>
          <el-radio-button label="suit">西服热门款</el-radio-button>
        </el-radio-group>
      </div>

      <div class="card-grid">
        <article v-for="item in feedList.slice(0, 8)" :key="`${activeFeed}-${item.id}`" class="goods-card">
          <img class="cover" :src="imgUrl((item.huawentuan || '').split(',')[0])" alt="款式图" />
          <div class="goods-content">
            <h3>{{ item.fuzhuangmingcheng || '未命名款式' }}</h3>
            <div class="sub">{{ item.fuzhuangkuanshi || '风格待完善' }}</div>
            <div class="tags">
              <span>{{ item.mianliaoleibie || '精选面料' }}</span>
              <span>热度 {{ item.clicknum || 0 }}</span>
            </div>
            <div class="bottom-row">
              <strong>¥{{ formatPrice(item) }}</strong>
              <el-button type="text" @click="openRecommend(item, activeFeed)">
                {{ activeFeed === 'cos' ? '查看详情' : '查看灵感' }}
              </el-button>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="content-grid">
      <el-card shadow="never" class="intro-card">
        <div slot="header" class="slot-title">
          <span>{{ systemIntro.title || '品牌故事' }}</span>
        </div>
        <div class="intro-media">
          <img :src="imgUrl(systemIntro.picture1)" alt="介绍图一" />
          <img :src="imgUrl(systemIntro.picture2)" alt="介绍图二" />
        </div>
        <div class="intro-content" v-html="systemIntro.content || '欢迎来到次元定制服装平台。'" />
      </el-card>

      <el-card shadow="never" class="news-card">
        <div slot="header" class="slot-title between">
          <span>最新资讯</span>
          <el-button type="text" @click="toBrowse(activeFeed)">前往款式中心</el-button>
        </div>

        <div v-if="newsList.length" class="news-list">
          <div v-for="item in newsList" :key="item.id" class="news-item">
            <img :src="imgUrl(item.picture)" alt="资讯封面" />
            <div class="news-content">
              <h4>{{ item.title }}</h4>
              <p>{{ summaryText(item.introduction, 52) }}</p>
              <span>{{ formatDate(item.addtime) }}</span>
            </div>
          </div>
        </div>

        <el-empty v-else description="暂时还没有资讯内容" :image-size="76" />
      </el-card>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      baseUrl: '',
      keyword: '',
      activeFeed: 'cos',
      systemIntro: {},
      newsList: [],
      hotCosList: [],
      hotSuitList: []
    }
  },
  computed: {
    feedList() {
      return this.activeFeed === 'cos' ? this.hotCosList : this.hotSuitList
    },
    dashboardCards() {
      return [
        { label: 'COS 热门款', value: this.hotCosList.length, icon: 'el-icon-s-opportunity', bg: '#e9f1ff' },
        { label: '西服热门款', value: this.hotSuitList.length, icon: 'el-icon-suitcase', bg: '#fdf0e9' },
        { label: '平台资讯', value: this.newsList.length, icon: 'el-icon-reading', bg: '#eef8ef' }
      ]
    }
  },
  created() {
    this.baseUrl = this.$config.baseUrl
    this.loadSystemIntro()
    this.loadNews()
    this.loadHotLists()
  },
  methods: {
    imgUrl(path) {
      if (!path) {
        return ''
      }
      return path.startsWith('http') ? path : `${this.baseUrl}${path}`
    },
    formatPrice(item) {
      return Number(item.fuzhuangjiage || item.price || 0).toFixed(2)
    },
    summaryText(text, limit = 60) {
      const plainText = String(text || '')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
      if (!plainText) {
        return '暂时还没有摘要内容'
      }
      return plainText.length > limit ? `${plainText.slice(0, limit)}...` : plainText
    },
    formatDate(time) {
      if (!time) {
        return '-'
      }
      return String(time).split(' ')[0]
    },
    toBrowse(type = 'cos') {
      this.$router.push({
        path: '/index/browse',
        query: {
          type
        }
      })
    },
    searchProduct() {
      this.$router.push({
        path: '/index/browse',
        query: {
          type: this.activeFeed,
          keyword: this.keyword.trim()
        }
      })
    },
    openRecommend(item, type = 'cos') {
      if (type === 'cos') {
        const target = {
          path: '/index/remaicosfuDetail',
          query: { detailObj: JSON.stringify(item) }
        }
        if (!localStorage.getItem('Token')) {
          this.$message.info('查看详情前请先登录或注册')
          this.$authDialogBus.$emit('open', {
            mode: 'login',
            role: 'yonghu',
            redirect: target
          })
          return
        }
        this.$router.push(target)
        return
      }

      this.$message.info('西服详情页正在升级，可先在款式中心浏览更多灵感。')
      this.$router.push({ path: '/index/browse', query: { type: 'suit' } })
    },
    loadSystemIntro() {
      this.$http.get('systemintro/detail/1').then((res) => {
        if (res.data.code === 0) {
          this.systemIntro = res.data.data || {}
        }
      })
    },
    loadNews() {
      this.$http
        .get('news/list', {
          params: {
            page: 1,
            limit: 3,
            sort: 'id',
            order: 'desc'
          }
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.newsList = (res.data.data && res.data.data.list) || []
          }
        })
    },
    loadHotLists() {
      const cosAutoSortUrl = localStorage.getItem('Token') ? 'remaicosfu/autoSort2' : 'remaicosfu/autoSort'
      const suitAutoSortUrl = localStorage.getItem('Token') ? 'remaixifu/autoSort2' : 'remaixifu/autoSort'

      this.$http
        .get(cosAutoSortUrl, {
          params: {
            page: 1,
            limit: 10
          }
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.hotCosList = (res.data.data && res.data.data.list) || []
          }
        })

      this.$http
        .get(suitAutoSortUrl, {
          params: {
            page: 1,
            limit: 10
          }
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.hotSuitList = (res.data.data && res.data.data.list) || []
          }
        })
    }
  }
}
</script>

<style scoped>
.home-page {
  display: grid;
  gap: 16px;
}

.hero-panel {
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  gap: 20px;
  padding: 28px;
  border-radius: 24px;
  color: #fff;
  background: linear-gradient(135deg, #203265 0%, #3050aa 38%, #4e6ad6 100%);
  box-shadow: 0 24px 44px rgba(40, 61, 127, 0.34);
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.36);
  background: rgba(255, 255, 255, 0.1);
  font-size: 12px;
  letter-spacing: 1px;
}

.hero-main h1 {
  margin-top: 14px;
  max-width: 700px;
  font-size: 36px;
  line-height: 1.32;
}

.hero-desc {
  margin-top: 14px;
  max-width: 720px;
  line-height: 1.85;
  color: rgba(239, 245, 255, 0.96);
}

.hero-actions {
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.search-row {
  margin-top: 18px;
  max-width: 580px;
}

.hero-side {
  display: grid;
  gap: 12px;
}

.spotlight-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.18);
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.spotlight-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.18);
}

.spotlight-card img {
  width: 76px;
  height: 76px;
  border-radius: 12px;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.16);
}

.spotlight-info .name {
  font-weight: 600;
}

.spotlight-info .meta {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(239, 245, 255, 0.92);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.stats-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid #edf1ff;
  background: #fff;
  box-shadow: 0 12px 24px rgba(83, 105, 172, 0.08);
}

.icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: #3f4f8f;
  font-size: 20px;
}

.label {
  color: #7b88b4;
  font-size: 13px;
}

.value {
  margin-top: 4px;
  color: #233366;
  font-size: 24px;
  font-weight: 700;
}

.recommend-block,
.intro-card,
.news-card {
  border-radius: 22px;
  border: 1px solid #e8eeff;
  background: #fff;
  box-shadow: 0 14px 30px rgba(83, 105, 172, 0.08);
}

.recommend-block {
  padding: 22px;
}

.section-head,
.slot-title.between {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.section-head h2,
.slot-title span {
  color: #24356b;
  font-size: 22px;
  font-weight: 700;
}

.section-head p {
  margin-top: 8px;
  color: #7b88b4;
}

.card-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.goods-card {
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid #eef2ff;
  background: linear-gradient(180deg, #fff 0%, #fafbff 100%);
}

.cover {
  width: 100%;
  aspect-ratio: 1 / 1.04;
  object-fit: cover;
  background: #f2f5ff;
}

.goods-content {
  padding: 14px;
}

.goods-content h3 {
  color: #26366d;
  font-size: 16px;
}

.sub {
  margin-top: 6px;
  min-height: 22px;
  color: #8190ba;
  font-size: 13px;
}

.tags {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tags span {
  padding: 5px 10px;
  border-radius: 999px;
  background: #f3f6ff;
  color: #5d6f9f;
  font-size: 12px;
}

.bottom-row {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bottom-row strong {
  color: #1f3c8d;
  font-size: 20px;
}

.content-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.9fr;
  gap: 14px;
}

.intro-media {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.intro-media img,
.news-item img {
  width: 100%;
  object-fit: cover;
  background: #f2f4fc;
}

.intro-media img {
  height: 210px;
  border-radius: 16px;
}

.intro-content {
  margin-top: 14px;
  color: #516188;
  line-height: 1.85;
}

.news-list {
  display: grid;
  gap: 12px;
}

.news-item {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr);
  gap: 12px;
  padding: 12px;
  border-radius: 16px;
  background: #fafbff;
}

.news-item img {
  height: 92px;
  border-radius: 12px;
}

.news-content h4 {
  color: #24356b;
  font-size: 15px;
}

.news-content p {
  margin-top: 8px;
  color: #7b88b4;
  line-height: 1.7;
  font-size: 13px;
}

.news-content span {
  display: inline-block;
  margin-top: 10px;
  color: #9aa6c9;
  font-size: 12px;
}

@media (max-width: 1200px) {
  .card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .content-grid,
  .hero-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero-panel,
  .recommend-block {
    padding: 18px;
  }

  .stats-grid,
  .card-grid,
  .content-grid,
  .intro-media {
    grid-template-columns: 1fr;
  }

  .section-head,
  .slot-title.between,
  .bottom-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .news-item {
    grid-template-columns: 1fr;
  }

  .hero-main h1 {
    font-size: 28px;
  }
}
</style>
