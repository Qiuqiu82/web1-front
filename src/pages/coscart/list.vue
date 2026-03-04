<template>
  <div>
    <h2>购物车</h2>
    <el-table :data="list" style="width: 100%">
      <el-table-column prop="productName" label="商品" />
      <el-table-column prop="specs" label="规格" />
      <el-table-column prop="quantity" label="数量" width="80" />
      <el-table-column prop="price" label="单价" width="100" />
      <el-table-column prop="amount" label="小计" width="120" />
    </el-table>
    <div style="margin-top:16px;">
      <el-button type="primary" @click="submitOrder">提交订单</el-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return { list: [] }
  },
  created() { this.load() },
  methods: {
    load() {
      this.$http.get('coscart/list').then(res => {
        if (res.data.code === 0) this.list = res.data.data || []
      })
    },
    submitOrder() {
      const ids = this.list.filter(i => i.checked === 1).map(i => i.id)
      if (!ids.length) return this.$message.error('没有勾选商品')
      this.$http.post('cosorder/submit', {
        cartIds: ids,
        payType: '支付宝支付',
        contactName: '测试用户',
        contactPhone: '13800138000',
        address: '测试地址',
        remark: '前端联调单'
      }).then(res => {
        if (res.data.code === 0) {
          this.$message.success('下单成功')
          this.$router.push('/index/cosorder')
        } else this.$message.error(res.data.msg)
      })
    }
  }
}
</script>
