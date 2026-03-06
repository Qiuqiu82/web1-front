<template>
  <div class="home-page">
    <section class="hero">
      <div class="hero-main">
        <div class="eyebrow">次元定制全流程</div>
        <h1>把你想象中的角色服装，做成可穿着的作品</h1>
        <p>
          打通用户下单、管理员协同、设计师接单三端流程。先看热门款式，再进入个性化定制，订单状态全程可追踪。
        </p>

        <div class="hero-actions">
          <el-button type="primary" round @click="toBrowse('cos')">浏览 COS 款</el-button>
          <el-button round @click="toBrowse('suit')">浏览西服款</el-button>
        </div>

        <div class="search-row">
          <el-input
            v-model="keyword"
            clearable
            placeholder="请输入款式名、风格或面料关键词"
            @keyup.enter.native="searchProduct"
          >
            <el-select slot="prepend" v-model="activeFeed" style="width: 104px">
              <el-option label="COS服" value="cos" />
              <el-option label="西服" value="suit" />
            </el-select>
            <el-button slot="append" icon="el-icon-search" @click="searchProduct" />
          </el-input>
        </div>
      </div>

      <div class="hero-side">
        <div class="spotlight" v-for="item in hotCosList.slice(0, 3)" :key="item.id" @click="openRecommend(item, 'cos')">
          <img :src="imgUrl((item.huawentuan || '').split(',')[0])" alt="热门款" />
          <div class="spotlight-info">
            <div class="name">{{ item.fuzhuangmingcheng || '热门款' }}</div>
            <div class="meta">热度 {{ item.clicknum || 0 }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="stats-grid">
      <div class="stats-card" v-for="card in dashboardCards" :key="card.label">
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
          <el-radio-button label="cos">COS 热榜</el-radio-button>
          <el-radio-button label="suit">西服热榜</el-radio-button>
        </el-radio-group>
      </div>

      <div class="card-grid">
        <article class="goods-card" v-for="item in feedList.slice(0, 8)" :key="`${activeFeed}-${item.id}`">
          <img class="cover" :src="imgUrl((item.huawentuan || '').split(',')[0])" alt="款式图" />
          <div class="goods-content">
            <h3>{{ item.fuzhuangmingcheng || '未命名款式' }}</h3>
            <div class="sub">{{ item.fuzhuangkuanshi || '风格待完善' }}</div>
            <div class="tags">
              <span>{{ item.mianliaoleibie || '精选面料' }}</span>
              <span>热度 {{ item.clicknum || 0 }}</span>
            </div>
            <div class="bottom-row">
              <strong>￥{{ formatPrice(item) }}</strong>
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
          <img :src="imgUrl(systemIntro.picture1)" alt="介绍图1" />
          <img :src="imgUrl(systemIntro.picture2)" alt="介绍图2" />
        </div>
        <div class="intro-content" v-html="systemIntro.content || '欢迎来到次元定制服装平台。'" />
      </el-card>

      <el-card shadow="never" class="news-card">
        <div slot="header" class="slot-title between">
          <span>最新资讯</span>
          <el-button type="text" @click="toBrowse(activeFeed)">前往款式中心</el-button>
        </div>

        <div class="news-list" v-if="newsList.length">
          <div class="news-item" v-for="item in newsList" :key="item.id">
            <img :src="imgUrl(item.picture)" alt="资讯图" />
            <div class="news-content">
              <h4>{{ item.title }}</h4>
              <p>{{ summaryText(item.introduction, 52) }}</p>
              <span>{{ formatDate(item.addtime) }}</span>
            </div>
          </div>
        </div>

        <el-empty v-else description="暂无资讯" :image-size="76" />
      </el-card>
    </section>
  </div>
</template>

<script>
export default {
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
      const price = item.fuzhuangjiage || item.price || 0
      return Number(price).toFixed(2)
    },
    summaryText(text, limit = 60) {
      const plainText = String(text || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      if (!plainText) {
        return '暂无内容'
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
      this.$router.push({ path: '/index/browse', query: { type } })
    },
    searchProduct() {
      const keyword = String(this.keyword || '').trim()
      this.$router.push({ path: '/index/browse', query: { type: this.activeFeed, keyword } })
    },
    openRecommend(item, type) {
      if (type === 'cos') {
        this.$router.push({
          path: '/index/remaicosfuDetail',
          query: { detailObj: JSON.stringify(item) }
        })
        return
      }
      this.$message.info('西服详情页正在升级，可先在款式中心浏览。')
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
            const rows = (res.data.data && res.data.data.list) || []
            this.newsList = rows
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

.hero {
  border-radius: 24px;
  padding: 26px;
  background: linear-gradient(130deg, #203265 0%, #2f4ca2 35%, #4b67ca 100%);
  box-shadow: 0 20px 36px rgba(44, 66, 129, 0.35);
  color: #fff;
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 20px;
}

.eyebrow {
  display: inline-block;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 12px;
  letter-spacing: 0.8px;
}

.hero-main h1 {
  margin-top: 14px;
  font-size: 34px;
  line-height: 1.3;
  max-width: 680px;
}

.hero-main p {
  margin-top: 14px;
  line-height: 1.8;
  color: rgba(235, 243, 255, 0.95);
  max-width: 700px;
}

.hero-actions {
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.search-row {
  margin-top: 18px;
  max-width: 560px;
}

.hero-side {
  display: grid;
  gap: 10px;
}

.spotlight {
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.spotlight:hover {
  transform: translateY(-2px);
}

.spotlight img {
  width: 72px;
  height: 72px;
  border-radius: 10px;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.2);
}

.spotlight-info .name {
  font-weight: 600;
}

.spotlight-info .meta {
  margin-top: 6px;
  color: rgba(238, 246, 255, 0.9);
  font-size: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.stats-card {
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #edf1ff;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 12px 24px rgba(83, 105, 172, 0.08);
}

.icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 20px;
  color: #3f4f8f;
}

.label {
  color: #8f98bb;
  font-size: 12px;
}

.value {
  margin-top: 2px;
  font-size: 26px;
  color: #243569;
  font-weight: 700;
}

.recommend-block {
  border-radius: 20px;
  border: 1px solid #e9eeff;
  background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
  padding: 18px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}

.section-head h2 {
  font-size: 24px;
  color: #22315e;
}

.section-head p {
  margin-top: 8px;
  color: #7f8aaf;
}

.card-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.goods-card {
  border-radius: 16px;
  border: 1px solid #eef2ff;
  background: #fff;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.goods-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 28px rgba(73, 94, 161, 0.15);
}

.cover {
  width: 100%;
  height: 210px;
  object-fit: cover;
  background: #f0f3ff;
}

.goods-content {
  padding: 12px;
}

.goods-content h3 {
  font-size: 15px;
  color: #222f5b;
  line-height: 1.4;
  min-height: 40px;
}

.sub {
  margin-top: 6px;
  color: #7f89ad;
  font-size: 13px;
}

.tags {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tags span {
  padding: 4px 8px;
  border-radius: 999px;
  background: #f0f4ff;
  color: #4f5f9a;
  font-size: 12px;
}

.bottom-row {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bottom-row strong {
  color: #2c3f89;
  font-size: 18px;
}

.content-grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 12px;
}

.intro-card,
.news-card {
  border-radius: 18px;
  border: 1px solid #ebeffd;
}

.slot-title {
  font-size: 17px;
  font-weight: 700;
  color: #2d3b70;
}

.between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.intro-media {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.intro-media img {
  width: 100%;
  height: 170px;
  border-radius: 12px;
  object-fit: cover;
  background: #f2f5ff;
}

.intro-content {
  margin-top: 10px;
  color: #4f5777;
  line-height: 1.85;
}

.news-list {
  display: grid;
  gap: 10px;
}

.news-item {
  border: 1px solid #edf1ff;
  border-radius: 12px;
  padding: 8px;
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 10px;
}

.news-item img {
  width: 120px;
  height: 90px;
  border-radius: 8px;
  object-fit: cover;
  background: #f0f2fa;
}

.news-content h4 {
  font-size: 14px;
  color: #25356a;
}

.news-content p {
  margin-top: 6px;
  color: #7380a6;
  line-height: 1.7;
  font-size: 13px;
}

.news-content span {
  display: inline-block;
  margin-top: 6px;
  color: #9ca5bf;
  font-size: 12px;
}

@media (max-width: 1200px) {
  .hero,
  .content-grid {
    grid-template-columns: 1fr;
  }

  .card-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .stats-grid,
  .card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .card-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>