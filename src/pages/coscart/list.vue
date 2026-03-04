<template>
  <div class="cart-page">
    <div class="page-title">购物车</div>

    <el-table
      :data="list"
      style="width: 100%"
      @selection-change="onSelectionChange"
      border
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="商品" min-width="260">
        <template slot-scope="scope">
          <div class="product-cell">
            <img :src="imgUrl(scope.row.productCover || scope.row.product_cover)" class="cover" />
            <div class="name">{{ scope.row.productName || scope.row.product_name }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="specs" label="规格" width="120" />
      <el-table-column label="数量" width="130">
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
      <el-table-column label="单价" width="120">
        <template slot-scope="scope">
          ￥{{ formatMoney(scope.row.price) }}
        </template>
      </el-table-column>
      <el-table-column label="小计" width="120">
        <template slot-scope="scope">
          ￥{{ formatMoney(scope.row.amount) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" @click="removeItem(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="toolbar">
      <div>已选 {{ selectedRows.length }} 件，合计：<b>￥{{ totalAmount }}</b></div>
      <el-button type="primary" @click="openCheckout">去结算</el-button>
    </div>

    <el-dialog title="填写订单信息" :visible.sync="checkoutVisible" width="540px">
      <el-form :model="checkoutForm" :rules="checkoutRules" ref="checkoutForm" label-width="90px">
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
            <el-option label="支付宝支付" value="支付宝支付" />
            <el-option label="微信支付" value="微信支付" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="checkoutForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="checkoutVisible = false">取消</el-button>
        <el-button type="primary" @click="submitOrder">提交订单</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      list: [],
      selectedRows: [],
      checkoutVisible: false,
      checkoutForm: {
        payType: "支付宝支付",
        contactName: "",
        contactPhone: "",
        address: "",
        remark: "",
      },
      checkoutRules: {
        contactName: [{ required: true, message: "请输入联系人", trigger: "blur" }],
        contactPhone: [{ required: true, message: "请输入联系电话", trigger: "blur" }],
        address: [{ required: true, message: "请输入地址", trigger: "blur" }],
      },
    };
  },
  computed: {
    totalAmount() {
      const sum = this.selectedRows.reduce((acc, row) => {
        return acc + Number(row.amount || 0);
      }, 0);
      return sum.toFixed(2);
    },
  },
  created() {
    this.load();
  },
  methods: {
    imgUrl(path) {
      if (!path) return "";
      return path.startsWith("http") ? path : this.$config.baseUrl + path;
    },
    formatMoney(v) {
      return Number(v || 0).toFixed(2);
    },
    load() {
      this.$http.get("coscart/list").then((res) => {
        if (res.data.code !== 0) {
          this.$message.error(res.data.msg || "购物车加载失败");
          return;
        }
        const data = res.data.data || [];
        const rows = Array.isArray(data) ? data : data.list || [];
        this.list = rows.map((r) => {
          const quantity = Number(r.quantity || 1);
          const price = Number(r.price || 0);
          return {
            ...r,
            productName: r.productName || r.product_name || "",
            productCover: r.productCover || r.product_cover || "",
            quantity,
            price,
            amount: Number(r.amount || quantity * price).toFixed(2),
          };
        });
        this.selectedRows = [];
      });
    },
    onSelectionChange(rows) {
      this.selectedRows = rows || [];
    },
    onQtyChange(row) {
      row.amount = (Number(row.quantity || 1) * Number(row.price || 0)).toFixed(2);
      this.$http.post("coscart/update", row).then(() => {}).catch(() => {});
    },
    removeItem(row) {
      this.$confirm("确认删除该商品吗？", "提示", { type: "warning" })
        .then(() => {
          this.$http.post("coscart/delete", [row.id]).then((res) => {
            if (res.data.code === 0) {
              this.$message.success("删除成功");
              this.load();
            } else {
              this.$message.error(res.data.msg || "删除失败");
            }
          });
        })
        .catch(() => {});
    },
    openCheckout() {
      if (!this.selectedRows.length) {
        this.$message.warning("请先勾选要结算的商品");
        return;
      }
      this.checkoutVisible = true;
    },
    submitOrder() {
      this.$refs.checkoutForm.validate((valid) => {
        if (!valid) return;
        const cartIds = this.selectedRows.map((r) => r.id);
        const payload = {
          cartIds,
          payType: this.checkoutForm.payType,
          contactName: this.checkoutForm.contactName,
          contactPhone: this.checkoutForm.contactPhone,
          address: this.checkoutForm.address,
          remark: this.checkoutForm.remark,
        };
        this.$http.post("cosorder/submit", payload).then((res) => {
          if (res.data.code === 0) {
            this.$message.success("下单成功");
            this.checkoutVisible = false;
            this.$router.push("/index/cosorder");
          } else {
            this.$message.error(res.data.msg || "下单失败");
          }
        });
      });
    },
  },
};
</script>

<style scoped>
.cart-page {
  width: 1200px;
  margin: 20px auto;
}
.page-title {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1f2d3d;
}
.product-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.cover {
  width: 56px;
  height: 76px;
  object-fit: cover;
  border-radius: 6px;
  background: #f3f4f8;
}
.name {
  line-height: 1.4;
}
.toolbar {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
