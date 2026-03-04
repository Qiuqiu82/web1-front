<template>
  <div>
    <h2>我的订单</h2>
    <el-table :data="list" style="width: 100%">
      <el-table-column prop="orderNo" label="订单号" width="180" />
      <el-table-column prop="totalAmount" label="金额" width="100" />
      <el-table-column prop="payStatus" label="支付状态" width="100" />
      <el-table-column prop="orderStatus" label="订单状态" width="120" />
      <el-table-column label="操作" width="120">
        <template slot-scope="scope">
          <el-button v-if="scope.row.payStatus!=='已支付'" type="text" @click="pay(scope.row)">支付</el-button>
        </template>
      </el-table-column>
    </el-table>
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
      this.$http.get('cosorder/page').then(res => {
        if (res.data.code === 0) this.list = res.data.data || []
      })
    },
    pay(row) {
      this.$http.post(`cosorder/pay/${row.id}`, { payType: '支付宝支付' }).then(res => {
        if (res.data.code === 0) { this.$message.success('支付成功'); this.load() }
        else this.$message.error(res.data.msg)
      })
    }
  }
}
</script>
