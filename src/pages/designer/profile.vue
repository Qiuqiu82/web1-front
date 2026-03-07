<template>
  <div class="designer-profile-page">
    <section class="head-card panel-card">
      <div>
        <h2>资料与作品</h2>
        <p>展示设计师基础资料和作品集骨架，后续可平滑接入真实作品管理能力。</p>
      </div>
      <el-button icon="el-icon-refresh" size="mini" :loading="loading" @click="loadData">刷新</el-button>
    </section>

    <section class="content-grid">
      <article class="panel-card profile-card">
        <div class="panel-title">基础资料</div>
        <div class="profile-items">
          <div class="item-row"><span>账号</span><strong>{{ profile.account || '-' }}</strong></div>
          <div class="item-row"><span>姓名</span><strong>{{ profile.name || '-' }}</strong></div>
          <div class="item-row"><span>手机号</span><strong>{{ profile.phone || '-' }}</strong></div>
          <div class="item-row"><span>邮箱</span><strong>{{ profile.email || '-' }}</strong></div>
        </div>

        <div class="intro-box">
          <div class="intro-title">个人简介</div>
          <div class="intro-text">{{ profile.intro || '暂无简介，后续可在此维护个人品牌介绍。' }}</div>
        </div>

        <div class="action-row">
          <el-button type="primary" disabled>编辑资料（即将上线）</el-button>
        </div>
      </article>

      <article class="panel-card works-card">
        <div class="panel-title-row">
          <div class="panel-title">作品集</div>
          <el-input v-model.trim="keyword" size="small" clearable placeholder="按作品名筛选" class="filter-input" />
        </div>

        <div class="tag-row">
          <el-tag size="mini" type="info">基础版</el-tag>
          <el-tag size="mini" type="success">可扩展</el-tag>
          <el-tag size="mini">骨架模式</el-tag>
        </div>

        <div v-if="filteredWorks.length" class="works-grid">
          <div class="work-card" v-for="item in filteredWorks" :key="item.id">
            <img :src="item.cover" alt="作品封面" class="work-cover" />
            <div class="work-name">{{ item.name }}</div>
            <div class="work-meta">热度 {{ item.clicknum || 0 }}</div>
          </div>
        </div>
        <el-empty v-else description="暂无作品数据" :image-size="90" />

        <div class="action-row">
          <el-button type="primary" disabled>新增作品（即将上线）</el-button>
          <el-button disabled>管理作品（即将上线）</el-button>
        </div>
      </article>
    </section>
  </div>
</template>

<script>
export default {
  name: 'DesignerProfile',
  data() {
    return {
      baseUrl: this.$config.baseUrl,
      loading: false,
      keyword: '',
      profile: {
        account: '',
        name: '',
        phone: '',
        email: '',
        intro: ''
      },
      works: []
    }
  },
  computed: {
    filteredWorks() {
      const text = (this.keyword || '').toLowerCase()
      if (!text) {
        return this.works
      }
      return this.works.filter((item) => String(item.name || '').toLowerCase().includes(text))
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    pick(source, keys, fallback = '') {
      if (!source || typeof source !== 'object') {
        return fallback
      }
      for (let i = 0; i < keys.length; i += 1) {
        const value = source[keys[i]]
        if (value !== undefined && value !== null && value !== '') {
          return value
        }
      }
      return fallback
    },
    coverUrl(item) {
      const raw = (item && item.huawentuan) || ''
      const first = raw.split(',')[0] || ''
      if (!first) {
        return ''
      }
      return first.startsWith('http') ? first : `${this.baseUrl}${first}`
    },
    async loadData() {
      this.loading = true
      try {
        const [sessionRes, hotRes] = await Promise.all([
          this.$proxy.Request({
            url: this.$proxy.Api.shejishiSession,
            method: 'get',
            showLoading: false,
            showError: false
          }),
          this.$proxy.Request({
            url: this.$proxy.Api.remaicosfuAutoSort,
            method: 'get',
            showLoading: false,
            showError: false,
            params: { page: 1, limit: 8 }
          })
        ])

        if (!sessionRes || sessionRes.code !== 0 || !hotRes || hotRes.code !== 0) {
          this.$message.warning('资料或作品数据加载不完整，已展示可用内容')
        }

        const session = (sessionRes && sessionRes.data) || {}
        this.profile = {
          account: this.pick(session, ['username', 'shejishizhanghao']),
          name: this.pick(session, ['shejishixingming', 'name', 'realname']),
          phone: this.pick(session, ['phone', 'shouji', 'mobile']),
          email: this.pick(session, ['email']),
          intro: this.pick(session, ['jianjie', 'remark', 'description'])
        }

        const hotRows = ((hotRes && hotRes.data && hotRes.data.list) || [])
        this.works = hotRows.map((item) => ({
          id: item.id,
          name: item.fuzhuangmingcheng || `作品${item.id}`,
          clicknum: item.clicknum || 0,
          cover: this.coverUrl(item)
        }))
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.designer-profile-page {
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.head-card h2 {
  color: #26366e;
  font-size: 24px;
}

.head-card p {
  margin-top: 6px;
  color: #8290ba;
}

.content-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 12px;
}

.profile-card,
.works-card {
  padding: 14px;
}

.panel-title {
  color: #2f4486;
  font-size: 16px;
  font-weight: 700;
}

.profile-items {
  margin-top: 12px;
  display: grid;
  gap: 8px;
}

.item-row {
  border-radius: 10px;
  border: 1px solid #ebefff;
  background: #f8faff;
  padding: 8px 10px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: #415589;
}

.item-row span {
  color: #8390b3;
}

.intro-box {
  margin-top: 12px;
  border-radius: 10px;
  border: 1px solid #ebefff;
  background: #f8faff;
  padding: 10px;
}

.intro-title {
  color: #3c5086;
  font-weight: 600;
}

.intro-text {
  margin-top: 6px;
  color: #7582aa;
  line-height: 1.6;
}

.panel-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.filter-input {
  width: 220px;
}

.tag-row {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.works-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.work-card {
  border: 1px solid #ebefff;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}

.work-cover {
  width: 100%;
  height: 120px;
  object-fit: cover;
  background: #f5f7fa;
}

.work-name {
  padding: 8px 8px 2px;
  color: #31457f;
  font-size: 13px;
  font-weight: 600;
}

.work-meta {
  padding: 0 8px 8px;
  color: #8b97bb;
  font-size: 12px;
}

.action-row {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 900px) {
  .head-card,
  .profile-card,
  .works-card {
    padding: 12px;
  }

  .head-card {
    flex-wrap: wrap;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .filter-input {
    width: 100%;
  }
}
</style>
