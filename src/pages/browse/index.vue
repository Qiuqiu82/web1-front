<template>
  <div class="browse-page">
    <section class="filter-panel">
      <div>
        <h2>款式中心</h2>
        <p>支持 COS 与西服双分类浏览，默认按热度优先展示。</p>
      </div>
      <div class="filters">
        <el-radio-group v-model="activeType" size="small">
          <el-radio-button label="cos">COS服饰</el-radio-button>
          <el-radio-button label="suit">西服款</el-radio-button>
        </el-radio-group>
        <el-input
          v-model="keyword"
          clearable
          placeholder="搜索款式名、风格或面料"
          prefix-icon="el-icon-search"
          style="width: 260px"
          @keyup.enter.native="applyFilters"
        />
        <el-button type="primary" @click="applyFilters">筛选</el-button>
      </div>
    </section>

    <section class="result-meta">
      <span>当前分类：{{ activeType === 'cos' ? 'COS服饰' : '西服款' }}</span>
      <span>结果数量：{{ filteredList.length }}</span>
    </section>

    <section v-loading="loading" class="list-grid" v-if="filteredList.length">
      <article class="item-card" v-for="item in filteredList" :key="`${activeType}-${item.id}`">
        <img :src="coverUrl(item)" alt="款式图" />
        <div class="content">
          <h3>{{ item.fuzhuangmingcheng || '未命名款式' }}</h3>
          <div class="desc">{{ item.fuzhuangkuanshi || '风格待完善' }}</div>
          <div class="tag-row">
            <span>{{ item.mianliaoleibie || '精选面料' }}</span>
            <span>热度 {{ item.clicknum || 0 }}</span>
          </div>
          <div class="bottom-row">
            <strong>￥{{ formatPrice(item) }}</strong>
            <el-button type="text" @click="goDetail(item)">
              {{ activeType === 'cos' ? '查看详情' : '查看灵感' }}
            </el-button>
          </div>
        </div>
      </article>
    </section>

    <el-empty v-else description="没有找到匹配款式，试试更短关键词" :image-size="86" />
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
      searchKey: ''
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
    coverUrl(item) {
      const first = String(item.huawentuan || '').split(',')[0] || ''
      if (!first) {
        return ''
      }
      return first.startsWith('http') ? first : `${this.baseUrl}${first}`
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
        this.$router.push({ path: '/index/remaicosfuDetail', query: { detailObj: JSON.stringify(item) } })
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
  border-radius: 20px;
  border: 1px solid #e8ecff;
  background: #fff;
  padding: 18px;
  box-shadow: 0 16px 34px rgba(72, 95, 165, 0.08);
}

.filter-panel {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 14px;
  flex-wrap: wrap;
}

.filter-panel h2 {
  font-size: 28px;
  color: #23346a;
}

.filter-panel p {
  margin-top: 8px;
  color: #7f8ab1;
}

.filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.result-meta {
  margin-top: 12px;
  border-top: 1px dashed #e7ecff;
  padding-top: 12px;
  display: flex;
  justify-content: space-between;
  color: #6e7aa5;
  font-size: 13px;
}

.list-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.item-card {
  border-radius: 14px;
  border: 1px solid #edf1ff;
  overflow: hidden;
  background: #fff;
  transition: all 0.2s ease;
}

.item-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 30px rgba(85, 103, 169, 0.14);
}

.item-card img {
  width: 100%;
  height: 228px;
  object-fit: cover;
  background: #f1f4ff;
}

.content {
  padding: 12px;
}

.content h3 {
  font-size: 15px;
  color: #2a3a74;
  line-height: 1.4;
  min-height: 42px;
}

.desc {
  margin-top: 6px;
  color: #7d89af;
  font-size: 13px;
}

.tag-row {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag-row span {
  border-radius: 999px;
  background: #f1f4ff;
  color: #4d5d96;
  padding: 4px 8px;
  font-size: 12px;
}

.bottom-row {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bottom-row strong {
  font-size: 18px;
  color: #243571;
}

@media (max-width: 1200px) {
  .list-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .list-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .list-grid {
    grid-template-columns: 1fr;
  }
}
</style>