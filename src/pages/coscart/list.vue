<template>
  <div class="cart-page">
    <section class="title-panel">
      <div>
        <h2>购物车</h2>
        <p>确认定制信息后提交订单，默认自动填充个人资料。</p>
      </div>
      <el-button round @click="$router.push('/index/browse')">继续浏览</el-button>
    </section>

    <el-empty v-if="!list.length" description="购物车为空" :image-size="90">
      <el-button type="primary" round @click="$router.push('/index/browse')">去逛逛</el-button>
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
                  <div class="spec">规格： {{ scope.row.specs || '-' }}</div>
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
          <el-table-column label="金额" width="130">
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
        <h3>结算信息</h3>
        <div class="summary-row">
          <span>已选</span>
          <strong>{{ selectedRows.length }} 件</strong>
        </div>
        <div class="summary-row">
          <span>合计</span>
          <strong class="price">￥{{ totalAmount }}</strong>
        </div>

        <div class="selected-list" v-if="selectedRows.length">
          <div class="selected-item" v-for="row in selectedRows" :key="row.id">
            <span>{{ row.productName || row.product_name }}</span>
            <span>x{{ row.quantity }}</span>
          </div>
        </div>
        <div class="selected-empty" v-else>请先选择要结算的商品。</div>

        <el-button type="primary" round class="checkout-btn" @click="openCheckout">去结算</el-button>
      </aside>
    </div>

    <el-dialog title="订单信息" :visible.sync="checkoutVisible" width="620px">
      <el-alert
        title="若存在默认地址将自动填充，你可编辑并选择是否回写地址簿。"
        type="info"
        :closable="false"
        class="mb12"
      />

      <el-form ref="checkoutForm" :model="checkoutForm" :rules="checkoutRules" label-width="110px">
        <el-form-item label="联系人" prop="contactName">
          <el-input v-model.trim="checkoutForm.contactName" />
        </el-form-item>
        <el-form-item label="手机号" prop="contactPhone">
          <el-input v-model.trim="checkoutForm.contactPhone" maxlength="11" />
        </el-form-item>
        <el-form-item label="省/市/区">
          <div class="triple-row">
            <el-input v-model.trim="checkoutForm.province" placeholder="省份" />
            <el-input v-model.trim="checkoutForm.city" placeholder="城市" />
            <el-input v-model.trim="checkoutForm.district" placeholder="区县" />
          </div>
        </el-form-item>
        <el-form-item label="详细地址" prop="detailAddress">
          <el-input v-model.trim="checkoutForm.detailAddress" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select v-model="checkoutForm.payType" style="width: 100%">
            <el-option label="支付宝" :value="PAY_ALIPAY" />
            <el-option label="微信" :value="PAY_WECHAT" />
          </el-select>
        </el-form-item>
        <el-form-item label="身材快照">
          <div v-if="bodyProfileSnapshot.profileName" class="body-preview">
            {{ bodyProfileSnapshot.profileName }} ·
            H{{ bodyProfileSnapshot.heightCm }} / W{{ bodyProfileSnapshot.weightKg }} /
            腰围{{ bodyProfileSnapshot.waistCm }} / 胸围{{ bodyProfileSnapshot.bustCm }} /
            臀围{{ bodyProfileSnapshot.hipCm }} / 肩宽{{ bodyProfileSnapshot.shoulderCm }}
            <span v-if="bodyProfileSnapshot.sizeCode"> · 尺码 {{ bodyProfileSnapshot.sizeCode }}</span>
          </div>
          <div v-else class="body-preview muted">当前订单未找到身材快照。</div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model.trim="checkoutForm.remark" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="地址簿">
          <div class="save-switch-row">
            <el-switch v-model="saveToAddressBook" />
            <span>保存到地址簿</span>
            <template v-if="saveToAddressBook">
              <el-checkbox v-model="saveAsDefault" class="default-check">设为默认</el-checkbox>
            </template>
          </div>
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
const PAY_ALIPAY = 'ALIPAY'
const PAY_WECHAT = 'WECHAT'
const PHONE_REG = /^1\d{10}$/

export default {
  data() {
    return {
      PAY_ALIPAY,
      PAY_WECHAT,
      list: [],
      selectedRows: [],
      checkoutVisible: false,
      submitting: false,
      saveToAddressBook: false,
      saveAsDefault: false,
      bodyProfileId: null,
      bodyProfileSnapshot: {},
      checkoutForm: {
        payType: PAY_ALIPAY,
        contactName: '',
        contactPhone: '',
        province: '',
        city: '',
        district: '',
        detailAddress: '',
        addressId: null,
        remark: ''
      },
      checkoutRules: {
        contactName: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
        contactPhone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            validator: (_, value, callback) => {
              if (!PHONE_REG.test(String(value || ''))) {
                callback(new Error('手机号格式不正确'))
                return
              }
              callback()
            },
            trigger: 'blur'
          }
        ],
        detailAddress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
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
    formatAddressText(form) {
      return `${form.province || ''}${form.city || ''}${form.district || ''}${form.detailAddress || ''}`
    },
    parseCustomSnapshot(raw) {
      if (!raw) return {}
      try {
        return typeof raw === 'string' ? JSON.parse(raw) : raw
      } catch (e) {
        return {}
      }
    },
    normalizeBodySnapshot(raw) {
      if (!raw || typeof raw !== 'object') {
        return {}
      }
      const body = {
        profileName: raw.profileName || raw.profile_name || '',
        heightCm: raw.heightCm != null ? raw.heightCm : raw.height_cm,
        weightKg: raw.weightKg != null ? raw.weightKg : raw.weight_kg,
        waistCm: raw.waistCm != null ? raw.waistCm : raw.waist_cm,
        bustCm: raw.bustCm != null ? raw.bustCm : raw.bust_cm,
        hipCm: raw.hipCm != null ? raw.hipCm : raw.hip_cm,
        shoulderCm: raw.shoulderCm != null ? raw.shoulderCm : raw.shoulder_cm,
        sizeCode: raw.sizeCode || raw.size_code || ''
      }
      const hasData = Object.values(body).some((v) => String(v || '').trim() !== '')
      return hasData ? body : {}
    },
    async load() {
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.coscartList,
        method: 'get',
        showLoading: false
      })
      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '加载购物车失败')
        return
      }
      const data = res.data || []
      const rows = Array.isArray(data) ? data : data.list || []
      this.list = rows.map((r) => {
        const quantity = Number(r.quantity || 1)
        const price = Number(r.price || 0)
        const customSnapshotJson = r.customSnapshotJson || r.custom_snapshot_json || ''
        return {
          ...r,
          productName: r.productName || r.product_name || '',
          productCover: r.productCover || r.product_cover || '',
          quantity,
          price,
          amount: Number(r.amount || quantity * price).toFixed(2),
          customSnapshotJson,
          customSnapshot: this.parseCustomSnapshot(customSnapshotJson)
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
            this.$message.success('已删除')
            this.load()
          }
        })
        .catch(() => {})
    },
    async openCheckout() {
      if (!this.selectedRows.length) {
        this.$message.warning('请先选择商品')
        return
      }
      await Promise.all([this.loadDefaultAddress(), this.resolveBodySnapshot()])
      this.saveToAddressBook = false
      this.saveAsDefault = false
      this.checkoutVisible = true
    },
    async loadDefaultAddress() {
      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosProfileAddressDefault,
        method: 'get',
        showLoading: false
      })
      const data = res && res.code === 0 ? res.data : null
      if (!data) {
        return
      }
      this.checkoutForm.addressId = data.id || null
      this.checkoutForm.contactName = data.receiverName || data.receiver_name || this.checkoutForm.contactName
      this.checkoutForm.contactPhone = data.receiverPhone || data.receiver_phone || this.checkoutForm.contactPhone
      this.checkoutForm.province = data.province || ''
      this.checkoutForm.city = data.city || ''
      this.checkoutForm.district = data.district || ''
      this.checkoutForm.detailAddress = data.detailAddress || data.detail_address || ''
    },
    async resolveBodySnapshot() {
      this.bodyProfileId = null
      this.bodyProfileSnapshot = {}
      for (const row of this.selectedRows) {
        const custom = row.customSnapshot || this.parseCustomSnapshot(row.customSnapshotJson)
        if (!custom || typeof custom !== 'object') {
          continue
        }
        const nested = this.normalizeBodySnapshot(custom.bodyProfileSnapshot)
        if (Object.keys(nested).length) {
          this.bodyProfileSnapshot = nested
          this.bodyProfileId = custom.bodyProfileId || null
          return
        }
        const root = this.normalizeBodySnapshot(custom)
        if (Object.keys(root).length) {
          this.bodyProfileSnapshot = root
          this.bodyProfileId = custom.bodyProfileId || null
          return
        }
      }

      const res = await this.$proxy.Request({
        url: this.$proxy.Api.cosProfileBodyDefault,
        method: 'get',
        showLoading: false
      })
      const data = res && res.code === 0 ? res.data : null
      if (!data) {
        return
      }
      this.bodyProfileId = data.id || null
      this.bodyProfileSnapshot = this.normalizeBodySnapshot(data)
    },
    validateCheckoutForm() {
      return new Promise((resolve) => {
        this.$refs.checkoutForm.validate((valid) => resolve(valid))
      })
    },
    async saveAddressBookIfNeeded() {
      if (!this.saveToAddressBook) {
        return this.checkoutForm.addressId || null
      }

      const params = {
        id: this.checkoutForm.addressId || undefined,
        receiverName: this.checkoutForm.contactName,
        receiverPhone: this.checkoutForm.contactPhone,
        province: this.checkoutForm.province,
        city: this.checkoutForm.city,
        district: this.checkoutForm.district,
        detailAddress: this.checkoutForm.detailAddress,
        isDefault: this.saveAsDefault ? 1 : 0,
        status: '启用'
      }

      const api = this.checkoutForm.addressId ? this.$proxy.Api.cosProfileAddressUpdate : this.$proxy.Api.cosProfileAddressSave
      const res = await this.$proxy.Request({
        url: api,
        method: 'post',
        dataType: 'json',
        params
      })
      if (!res || res.code !== 0) {
        this.$message.error((res && res.msg) || '保存地址簿失败')
        return null
      }

      const saved = res.data || {}
      const savedId = saved.id || this.checkoutForm.addressId || null
      this.checkoutForm.addressId = savedId
      this.$message.success('地址已保存到地址簿')
      return savedId
    },
    async submitOrder() {
      if (this.submitting) return
      const valid = await this.validateCheckoutForm()
      if (!valid) return

      const cartIds = this.selectedRows
        .map((r) => Number(r.id))
        .filter(Boolean)
      if (!cartIds.length) {
        this.$message.warning('请先选择商品')
        return
      }

      const addressId = await this.saveAddressBookIfNeeded()
      if (this.saveToAddressBook && !addressId) {
        return
      }

      const payload = {
        cartIds,
        payType: this.checkoutForm.payType,
        contactName: this.checkoutForm.contactName,
        contactPhone: this.checkoutForm.contactPhone,
        address: this.formatAddressText(this.checkoutForm),
        remark: this.checkoutForm.remark,
        addressId: addressId || this.checkoutForm.addressId || null,
        bodyProfileId: this.bodyProfileId || null,
        addressSnapshot: {
          receiverName: this.checkoutForm.contactName,
          receiverPhone: this.checkoutForm.contactPhone,
          province: this.checkoutForm.province,
          city: this.checkoutForm.city,
          district: this.checkoutForm.district,
          detailAddress: this.checkoutForm.detailAddress
        },
        bodyProfileSnapshot: {
          ...this.bodyProfileSnapshot
        }
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
        this.$message.error((res && res.msg) || '提交订单失败')
        return
      }

      this.$message.success('订单提交成功')
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

.triple-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.save-switch-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.default-check {
  margin-left: 6px;
}

.body-preview {
  line-height: 1.7;
  font-size: 13px;
  color: #51649a;
}

.muted {
  color: #95a0bf;
}

.mb12 {
  margin-bottom: 12px;
}

@media (max-width: 1080px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .triple-row {
    grid-template-columns: 1fr;
  }
}
</style>