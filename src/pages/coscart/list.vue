<template>
  <div class="cart-page">
    <section class="title-panel">
      <div>
        <h2>购物车</h2>
        <p>确认尺码与数量后，可一键创建订单并进入支付流程。</p>
      </div>
      <el-button round @click="$router.push('/index/browse')">继续选款</el-button>
    </section>

    <el-empty v-if="!list.length" description="购物车还是空的，先去款式中心挑选吧" :image-size="90">
      <el-button type="primary" round @click="$router.push('/index/browse')">前往款式中心</el-button>
    </el-empty>

    <div v-else class="cart-layout">
      <section class="items-panel">
        <el-table :data="list" style="width: 100%" @selection-change="onSelectionChange" border class="cart-table">
          <el-table-column type="selection" width="52" />
          <el-table-column label="商品" min-width="260">
            <template slot-scope="scope">
              <div class="product-cell">
                <img :src="imgUrl(scope.row.productCover || scope.row.product_cover)" class="cover" />
                <div class="meta">
                  <div class="name">{{ scope.row.productName || scope.row.product_name || '未命名商品' }}</div>
                  <div class="spec">规格：{{ scope.row.specs || '-' }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="数量" width="132">
            <template slot-scope="scope">
              <el-input-number
                v-model="scope.row.quantity"
                :min="1"
                :max="99"
                size="mini"
                @change="onQtyChange(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="单价" width="110">
            <template slot-scope="scope">￥{{ formatMoney(scope.row.price) }}</template>
          </el-table-column>
          <el-table-column label="小计" width="130">
            <template slot-scope="scope">
              <strong class="amount">￥{{ formatMoney(scope.row.amount) }}</strong>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" class="danger" @click="removeItem(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <aside class="summary-panel">
        <h3>结算清单</h3>
        <div class="summary-row">
          <span>已选商品</span>
          <strong>{{ selectedRows.length }} 件</strong>
        </div>
        <div class="summary-row">
          <span>合计金额</span>
          <strong class="price">￥{{ totalAmount }}</strong>
        </div>

        <div class="selected-list" v-if="selectedRows.length">
          <div class="selected-item" v-for="row in selectedRows" :key="row.id">
            <span>{{ row.productName || row.product_name }}</span>
            <span>x{{ row.quantity }}</span>
          </div>
        </div>
        <div class="selected-empty" v-else>请选择需要结算的商品。</div>

        <el-button type="primary" round class="checkout-btn" @click="openCheckout">去结算</el-button>
      </aside>
    </div>

    <el-dialog title="填写订单信息" :visible.sync="checkoutVisible" width="540px">
      <el-form ref="checkoutForm" :model="checkoutForm" :rules="checkoutRules" label-width="90px">
        <el-form-item label="联系人" prop="contactName">
          <el-input v-model="checkoutForm.contactName" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="checkoutForm.contactPhone" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="checkoutForm.address" />
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select v-model="checkoutForm.payType" style="width: 100%">
            <el-option label="支付宝支付" :value="PAY_ALIPAY" />
            <el-option label="微信支付" :value="PAY_WECHAT" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="checkoutForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="checkoutVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" :disabled="submitting" @click="submitOrder">
          提交订单
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
const PAY_ALIPAY = '支付宝支付'
const PAY_WECHAT = '微信支付'

export default {
  data() {
    return {
      PAY_ALIPAY,
      PAY_WECHAT,
      list: [],
      selectedRows: [],
      checkoutVisible: false,
      submitting: false,
      checkoutForm: {
        payType: PAY_ALIPAY,
        contactName: '',
        contactPhone: '',
        address: '',
        remark: ''
      },
      checkoutRules: {
        contactName: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
        contactPhone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
        address: [{ required: true, message: '请输入地址', trigger: 'blur' }]
      }
    }
  },
  computed: {
    totalAmount() {
      const sum = this.selectedRows.reduce((acc, row) => acc + Number(row.amount || 0), 0)
      return sum.toFixed(2)
    }
  },
  created() {
    this.load()
  },
  methods: {
    imgUrl(path) {
      if (!path) return ''
      return path.startsWith('http') ? path : this.$config.baseUrl + path
    },
    formatMoney(v) {
      return Number(v || 0).toFixed(2)
    },
    async load() {
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.coscartList,
        method: 'get',
        showLoading: false
      })
      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '购物车加载失败')
        return
      }
      const data = res.data || []
      const rows = Array.isArray(data) ? data : data.list || []
      this.list = rows.map((r) => {
        const quantity = Number(r.quantity || 1)
        const price = Number(r.price || 0)
        return {
          ...r,
          productName: r.productName || r.product_name || '',
          productCover: r.productCover || r.product_cover || '',
          quantity,
          price,
          amount: Number(r.amount || quantity * price).toFixed(2)
        }
      })
      this.selectedRows = []
    },
    onSelectionChange(rows) {
      this.selectedRows = rows || []
    },
    async onQtyChange(row) {
      row.amount = (Number(row.quantity || 1) * Number(row.price || 0)).toFixed(2)
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.coscartUpdate,
        method: 'post',
        dataType: 'json',
        showLoading: false,
        params: {
          id: row.id,
          quantity: Number(row.quantity || 1),
          checked: 1
        }
      })
      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '更新数量失败')
        this.load()
      }
    },
    removeItem(row) {
      this.$confirm('确认删除该商品吗？', '提示', { type: 'warning' })
        .then(async () => {
          const res = await this.$proxy.Request({
            url: this.$proxy.Api.coscartDelete,
            method: 'post',
            dataType: 'json',
            params: [row.id]
          })
          if (res && res.code === 0) {
            this.$message.success('删除成功')
            this.load()
          }
        })
        .catch(() => {})
    },
    openCheckout() {
      if (!this.selectedRows.length) {
        this.$message.warning('请先勾选商品')
        return
      }
      this.checkoutVisible = true
    },
    validateCheckoutForm() {
      return new Promise((resolve) => {
        this.$refs.checkoutForm.validate((valid) => resolve(valid))
      })
    },
    async submitOrder() {
      if (this.submitting) return
      const valid = await this.validateCheckoutForm()
      if (!valid) return

      const cartIds = this.selectedRows
        .map((r) => Number(r.id))
        .filter(Boolean)
      if (!cartIds.length) {
        this.$message.warning('请先勾选商品')
        return
      }

      const payload = {
        cartIds,
        payType: this.checkoutForm.payType,
        contactName: this.checkoutForm.contactName,
        contactPhone: this.checkoutForm.contactPhone,
        address: this.checkoutForm.address,
        remark: this.checkoutForm.remark
      }

      this.submitting = true
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosorderSubmit,
        method: 'post',
        dataType: 'json',
        params: payload
      })
      this.submitting = false

      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '下单失败')
        return
      }

      this.$message.success('下单成功')
      this.checkoutVisible = false
      this.selectedRows = []
      this.load()
      this.$router.push('/index/cosorder')
    }
  }
}
</script>

<style scoped>
.cart-page {
  display: grid;
  gap: 14px;
}

.title-panel {
  border-radius: 16px;
  border: 1px solid #e8edff;
  background: #fff;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.title-panel h2 {
  color: #27386f;
  font-size: 26px;
}

.title-panel p {
  margin-top: 6px;
  color: #7f8ab1;
}

.cart-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(300px, 1fr);
  gap: 14px;
}

.items-panel,
.summary-panel {
  border-radius: 16px;
  border: 1px solid #e8edff;
  background: #fff;
  padding: 14px;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cover {
  width: 62px;
  height: 82px;
  object-fit: cover;
  border-radius: 8px;
  background: #f1f4ff;
}

.meta {
  min-width: 0;
}

.name {
  font-size: 14px;
  color: #23366d;
  font-weight: 600;
}

.spec {
  margin-top: 4px;
  color: #8a94b7;
  font-size: 12px;
}

.amount {
  color: #2d3f7d;
}

.danger {
  color: #e25454;
}

.summary-panel h3 {
  color: #283973;
  font-size: 20px;
}

.summary-row {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  color: #63719d;
}

.summary-row strong {
  color: #283973;
}

.price {
  font-size: 24px;
}

.selected-list {
  margin-top: 12px;
  border-top: 1px dashed #e8ecfb;
  border-bottom: 1px dashed #e8ecfb;
  padding: 10px 0;
  display: grid;
  gap: 8px;
}

.selected-item {
  display: flex;
  justify-content: space-between;
  color: #66739e;
  font-size: 13px;
}

.selected-empty {
  margin-top: 14px;
  color: #9aa3c0;
  font-size: 13px;
}

.checkout-btn {
  margin-top: 16px;
  width: 100%;
  height: 42px;
  font-size: 15px;
}

@media (max-width: 1080px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }
}
</style>