<template>
  <div class="cos-detail">
    <section class="head-panel">
      <div>
        <h2>{{ detail.fuzhuangmingcheng || 'COS 详情' }}</h2>
        <p>{{ detail.fuzhuangkuanshi || '风格待完善' }}</p>
      </div>
      <el-button round @click="$router.push('/index/browse')">返回款式中心</el-button>
    </section>

    <section class="detail-grid">
      <div class="gallery-card">
        <el-carousel v-if="detailBanner.length" height="520px" indicator-position="inside" class="banner">
          <el-carousel-item v-for="(img, i) in detailBanner" :key="i">
            <img :src="imgUrl(img)" class="banner-img" />
          </el-carousel-item>
        </el-carousel>
        <el-empty v-else description="暂无图片" :image-size="90" />
      </div>

      <div class="info-card">
        <div class="price">￥{{ Number(detail.fuzhuangjiage || 0).toFixed(2) }}</div>
        <div class="meta-item"><span>服装编号</span><b>{{ detail.fuzhuangbianhao || '-' }}</b></div>
        <div class="meta-item"><span>服装款式</span><b>{{ detail.fuzhuangkuanshi || '-' }}</b></div>
        <div class="meta-item"><span>面料类别</span><b>{{ detail.mianliaoleibie || '-' }}</b></div>
        <div class="meta-item"><span>默认尺码</span><b>{{ detail.chima || '-' }}</b></div>
        <div class="meta-item"><span>热度</span><b>{{ detail.clicknum || 0 }}</b></div>

        <el-button type="primary" class="buy-btn" @click="openCustomize">立即定制</el-button>
      </div>
    </section>

    <section class="content-card">
      <div class="title">商品详情</div>
      <div class="content" v-html="detail.fuzhuangxiangqing || '暂无详情'" />
    </section>

    <el-dialog title="加入购物车" :visible.sync="customizeDialogVisible" width="520px">
      <el-form :model="cartForm" label-width="90px">
        <el-form-item label="商品名称">
          <el-input :value="detail.fuzhuangmingcheng" disabled />
        </el-form-item>
        <el-form-item label="尺码">
          <el-select v-model="cartForm.specs" placeholder="请选择尺码" style="width: 100%">
            <el-option v-for="s in sizeOptions" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="cartForm.quantity" :min="1" :max="99" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="cartForm.remark" type="textarea" :rows="3" placeholder="可选" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="customizeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addToCart">加入购物车</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tablename: 'remaicosfu',
      baseUrl: '',
      detail: {},
      detailBanner: [],
      customizeDialogVisible: false,
      cartForm: {
        specs: '',
        quantity: 1,
        remark: ''
      }
    }
  },
  computed: {
    sizeOptions() {
      const raw = this.detail.chima || ''
      const arr = raw
        .split(/[,/]/)
        .map((s) => s.trim())
        .filter((s) => !!s)
      return arr.length ? arr : ['S', 'M', 'L', 'XL']
    }
  },
  created() {
    this.baseUrl = this.$config.baseUrl
    const detailObj = this.$route.query.detailObj
    if (detailObj) {
      try {
        this.detail = JSON.parse(detailObj)
      } catch (e) {
        this.detail = {}
      }
    }
    if (this.detail.id || this.$route.query.id) {
      this.loadDetail(this.detail.id || this.$route.query.id)
    }
  },
  methods: {
    imgUrl(img) {
      if (!img) return ''
      return img.startsWith('http') ? img : this.baseUrl + img
    },
    loadDetail(id) {
      this.$http.get(`${this.tablename}/detail/${id}`).then((res) => {
        if (res.data.code === 0 && res.data.data) {
          this.detail = res.data.data
          this.detailBanner = (this.detail.huawentuan || '')
            .split(',')
            .map((s) => s.trim())
            .filter((s) => !!s)
        }
      })
    },
    openCustomize() {
      if (!localStorage.getItem('Token')) {
        this.$message.warning('请先登录后再加入购物车')
        this.$router.push('/login')
        return
      }
      this.cartForm.specs = this.detail.chima || this.sizeOptions[0] || 'M'
      this.cartForm.quantity = 1
      this.cartForm.remark = ''
      this.customizeDialogVisible = true
    },
    addToCart() {
      const userId = Number(localStorage.getItem('userid') || localStorage.getItem('userId') || 0)
      const userTable = localStorage.getItem('sessionTable') || localStorage.getItem('UserTableName') || 'yonghu'
      const quantity = Number(this.cartForm.quantity || 1)
      const price = Number(this.detail.fuzhuangjiage || 0)
      const firstCover = (this.detail.huawentuan || '').split(',')[0] || ''

      const payload = {
        userId,
        userTable,
        productId: this.detail.id,
        productName: this.detail.fuzhuangmingcheng,
        productCover: firstCover,
        specs: this.cartForm.specs || this.detail.chima || '默认',
        quantity,
        price,
        amount: (price * quantity).toFixed(2),
        checked: 1
      }

      this.$http.post('coscart/add', payload).then((res) => {
        if (res.data.code === 0) {
          this.$message.success('已加入购物车')
          this.customizeDialogVisible = false
          this.$confirm('已加入购物车，是否前往购物车？', '提示', {
            type: 'success'
          })
            .then(() => this.$router.push('/index/coscart'))
            .catch(() => {})
        } else {
          this.$message.error(res.data.msg || '加入购物车失败')
        }
      })
    }
  }
}
</script>

<style scoped>
.cos-detail {
  display: grid;
  gap: 14px;
}

.head-panel {
  border-radius: 16px;
  border: 1px solid #e8edff;
  background: #fff;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.head-panel h2 {
  color: #263871;
  font-size: 30px;
}

.head-panel p {
  margin-top: 6px;
  color: #808cb4;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 12px;
}

.gallery-card,
.info-card,
.content-card {
  border-radius: 16px;
  border: 1px solid #e8edff;
  background: #fff;
  padding: 14px;
}

.banner {
  border-radius: 12px;
  overflow: hidden;
  background: #f3f6ff;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #f5f7ff;
}

.price {
  font-size: 38px;
  color: #2c3f81;
  font-weight: 700;
}

.meta-item {
  margin-top: 10px;
  border-radius: 10px;
  background: #f5f7ff;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  color: #4f5f95;
}

.meta-item span {
  color: #7f8ab2;
}

.buy-btn {
  margin-top: 14px;
  width: 100%;
  height: 42px;
  font-size: 15px;
}

.title {
  font-size: 18px;
  color: #2a3b75;
  font-weight: 700;
}

.content {
  margin-top: 10px;
  color: #525b7a;
  line-height: 1.85;
}

@media (max-width: 1080px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>