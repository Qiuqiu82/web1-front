<template>
  <div class="browse-page">
    <section class="filter-panel">
      <div class="panel-copy">
        <span class="panel-kicker">Style Gallery</span>
        <h2>款式中心</h2>
        <p>支持 COS 与西服双分类浏览，默认按热度优先展示。</p>
      </div>
      <div class="filters">
        <el-radio-group v-model="activeType" size="small">
          <el-radio-button label="cos">COS服饰</el-radio-button>
          <el-radio-button label="suit">西服款式</el-radio-button>
        </el-radio-group>
        <el-input
          v-model="keyword"
          clearable
          placeholder="搜索款式名、风格或面料"
          prefix-icon="el-icon-search"
          class="search-input"
          @keyup.enter.native="applyFilters"
        />
        <el-button type="primary" @click="applyFilters">筛选</el-button>
      </div>
    </section>

    <section class="result-meta">
      <span>当前分类：{{ activeType === 'cos' ? 'COS服饰' : '西服款式' }}</span>
      <span>结果数量：{{ filteredList.length }}</span>
    </section>

    <section v-if="filteredList.length" v-loading="loading" class="list-grid">
      <article class="item-card" v-for="item in filteredList" :key="itemKey(item)">
        <div class="poster-shell">
          <div class="poster-backdrop" :style="posterBackdropStyle(item)"></div>
          <div class="poster-frame" :class="{ 'is-empty': !hasCover(item) }">
            <img
              v-if="hasCover(item)"
              :src="coverUrl(item)"
              :alt="item.fuzhuangmingcheng || '款式图'"
              loading="lazy"
              @error="markImageError(item)"
            />
            <div v-else class="poster-empty">
              <i class="el-icon-picture-outline"></i>
              <span>待补充商品图</span>
            </div>
          </div>
          <span class="poster-badge">{{ activeType === 'cos' ? '角色海报' : '西服灵感' }}</span>
        </div>

        <div class="content">
          <div class="content-top">
            <h3>{{ item.fuzhuangmingcheng || '未命名款式' }}</h3>
            <div class="desc">{{ item.fuzhuangkuanshi || '风格待完善' }}</div>
            <div class="tag-row">
              <span>{{ item.mianliaoleibie || '精选面料' }}</span>
              <span>热度 {{ item.clicknum || 0 }}</span>
            </div>
          </div>
          <div class="bottom-row">
            <strong>¥{{ formatPrice(item) }}</strong>
            <el-button type="text" @click="goDetail(item)">
              {{ activeType === 'cos' ? '查看详情' : '查看灵感' }}
            </el-button>
          </div>
        </div>
      </article>
    </section>

    <el-empty v-else description="没有找到匹配款式，试试更短的关键词" :image-size="86" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      baseUrl: this.$config.baseUrl,
      loading: false,
      activeType: 'cos',
      keyword: '',
      allCosList: [],
      allSuitList: [],
      searchKey: '',
      failedImages: {}
    }
  },
  computed: {
    activeList() {
      return this.activeType === 'cos' ? this.allCosList : this.allSuitList
    },
    filteredList() {
      const search = String(this.searchKey || '').trim().toLowerCase()
      if (!search) {
        return this.activeList
      }
      return this.activeList.filter((item) => {
        const fields = [item.fuzhuangmingcheng, item.fuzhuangkuanshi, item.mianliaoleibie]
        return fields.some((field) => String(field || '').toLowerCase().includes(search))
      })
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
      if (!first) {
        return ''
      }
      return first.startsWith('http') ? first : `${this.baseUrl}${first}`
    },
    hasCover(item) {
      const key = this.itemKey(item)
      return !!this.coverUrl(item) && !this.failedImages[key]
    },
    posterBackdropStyle(item) {
      if (!this.hasCover(item)) {
        return {}
      }
      const url = this.coverUrl(item)
      return {
        backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.72)), url("${url}")`
      }
    },
    markImageError(item) {
      this.$set(this.failedImages, this.itemKey(item), true)
    },
    formatPrice(item) {
      return Number(item.fuzhuangjiage || item.price || 0).toFixed(2)
    },
    applyFilters() {
      this.searchKey = this.keyword
      this.$router.replace({
        path: '/index/browse',
        query: {
          type: this.activeType,
          keyword: this.searchKey
        }
      })
    },
    goDetail(item) {
      if (this.activeType === 'cos') {
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
      this.$message.info('西服详情页正在升级，可先查看热门灵感列表。')
    },
    loadData() {
      this.loading = true
      Promise.all([
        this.$http.get('remaicosfu/list', {
          params: {
            page: 1,
            limit: 100,
            sort: 'clicknum',
            order: 'desc'
          }
        }),
        this.$http.get('remaixifu/list', {
          params: {
            page: 1,
            limit: 100,
            sort: 'clicknum',
            order: 'desc'
          }
        })
      ])
        .then(([cosRes, suitRes]) => {
          if (cosRes.data.code === 0) {
            this.allCosList = (cosRes.data.data && cosRes.data.data.list) || []
          }
          if (suitRes.data.code === 0) {
            this.allSuitList = (suitRes.data.data && suitRes.data.data.list) || []
          }
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>
.browse-page {
  --browse-primary: #4f6fd8;
  --browse-primary-deep: #223b86;
  --browse-soft: #f3f6ff;
  --browse-soft-2: #eef2ff;
  --browse-line: #e4eafb;
  --browse-text: #20305f;
  --browse-text-soft: #7380ab;
  border-radius: 24px;
  border: 1px solid var(--browse-line);
  background:
    radial-gradient(circle at top left, rgba(116, 145, 255, 0.12), transparent 28%),
    linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
  padding: 22px;
  box-shadow: 0 20px 40px rgba(72, 95, 165, 0.10);
}

.filter-panel {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.panel-copy {
  max-width: 540px;
}

.panel-kicker {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: var(--browse-soft-2);
  color: var(--browse-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
}
.filter-panel h2 {
  margin-top: 10px;
  font-size: 30px;
  color: var(--browse-primary-deep);
}

.filter-panel p {
  margin-top: 8px;
  color: var(--browse-text-soft);
}

.filters {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input {
  width: 280px;
}

.result-meta {
  margin-top: 16px;
  border-top: 1px dashed var(--browse-line);
  padding-top: 14px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #6676a4;
  font-size: 13px;
}

.list-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.item-card {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  border-radius: 22px;
  border: 1px solid var(--browse-line);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 14px 34px rgba(84, 102, 177, 0.08);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.item-card:hover {
  transform: translateY(-5px);
  border-color: rgba(102, 129, 220, 0.28);
  box-shadow: 0 20px 42px rgba(73, 95, 171, 0.16);
}

.poster-shell {
  position: relative;
  padding: 14px 14px 0;
}

.poster-backdrop {
  position: absolute;
  inset: 22px 22px 8px;
  border-radius: 18px;
  background:
    radial-gradient(circle at top, rgba(111, 146, 255, 0.24), transparent 54%),
    linear-gradient(180deg, #edf3ff 0%, #ffffff 100%);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  filter: blur(16px);
  opacity: 0.7;
  transform: scale(0.96);
}

.poster-frame {
  position: relative;
  z-index: 1;
  aspect-ratio: 3 / 4;
  border-radius: 18px;
  padding: 12px;
  background:
    linear-gradient(180deg, rgba(243, 247, 255, 0.96), rgba(255, 255, 255, 0.98)),
    #ffffff;
  border: 1px solid rgba(229, 236, 255, 0.95);
  overflow: hidden;
}

.poster-frame img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center top;
  display: block;
}

.poster-frame.is-empty {
  display: flex;
  align-items: center;
  justify-content: center;
}
.poster-empty {
  width: 100%;
  height: 100%;
  border-radius: 14px;
  border: 1px dashed #ced9ff;
  background: linear-gradient(180deg, #f6f8ff 0%, #ffffff 100%);
  color: #8a97bf;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
}

.poster-empty i {
  font-size: 34px;
  color: #86a0f7;
}

.poster-empty span {
  font-size: 13px;
}
.poster-badge {
  position: absolute;
  top: 26px;
  left: 26px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(32, 48, 95, 0.78);
  color: #ffffff;
  font-size: 12px;
  letter-spacing: 0.08em;
}

.content {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 16px 16px;
}

.content-top {
  display: grid;
  gap: 8px;
}

.content h3 {
  margin: 0;
  font-size: 17px;
  color: var(--browse-text);
  line-height: 1.5;
  min-height: 51px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.desc {
  color: var(--browse-text-soft);
  font-size: 13px;
  letter-spacing: 0.02em;
}

.tag-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag-row span {
  border-radius: 999px;
  background: var(--browse-soft);
  color: #4d5d96;
  padding: 5px 10px;
  font-size: 12px;
}

.bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.bottom-row strong {
  font-size: 26px;
  line-height: 1;
  color: var(--browse-primary-deep);
}

@media (max-width: 1200px) {
  .list-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .browse-page {
    padding: 18px;
  }

  .result-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .list-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .filter-panel h2 {
    font-size: 26px;
  }

  .search-input {
    width: 100%;
  }

  .filters {
    width: 100%;
  }

  .filters > * {
    width: 100%;
  }

  .list-grid {
    grid-template-columns: 1fr;
  }

  .poster-badge {
    top: 24px;
    left: 24px;
  }

  .bottom-row {
    flex-wrap: wrap;
  }

  .bottom-row strong {
    font-size: 24px;
  }
}
</style>
