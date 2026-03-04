<template>
  <div class="cos-detail">
    <div class="title">{{ detail.fuzhuangmingcheng || "热卖COS服详情" }}</div>

    <el-carousel
      v-if="detailBanner.length"
      height="560px"
      indicator-position="inside"
      class="banner"
    >
      <el-carousel-item v-for="(img, i) in detailBanner" :key="i">
        <img :src="imgUrl(img)" class="banner-img" />
      </el-carousel-item>
    </el-carousel>

    <div class="info-card">
      <div class="left">
        <p><b>服装编号：</b>{{ detail.fuzhuangbianhao || "-" }}</p>
        <p><b>服装款式：</b>{{ detail.fuzhuangkuanshi || "-" }}</p>
        <p><b>面料类别：</b>{{ detail.mianliaoleibie || "-" }}</p>
        <p><b>默认尺码：</b>{{ detail.chima || "-" }}</p>
      </div>
      <div class="right">
        <p class="price">￥{{ detail.fuzhuangjiage || 0 }}</p>
        <el-button type="primary" size="medium" @click="openCustomize">
          立即定制
        </el-button>
      </div>
    </div>

    <div class="content-card">
      <div class="content-title">服装详情</div>
      <div class="content" v-html="detail.fuzhuangxiangqing || '暂无详情'"></div>
    </div>

    <el-dialog title="加入购物车" :visible.sync="customizeDialogVisible" width="520px">
      <el-form :model="cartForm" label-width="90px">
        <el-form-item label="商品名称">
          <el-input :value="detail.fuzhuangmingcheng" disabled />
        </el-form-item>
        <el-form-item label="尺码规格">
          <el-select v-model="cartForm.specs" placeholder="请选择尺码" style="width: 100%">
            <el-option
              v-for="s in sizeOptions"
              :key="s"
              :label="s"
              :value="s"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="购买数量">
          <el-input-number v-model="cartForm.quantity" :min="1" :max="99" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="cartForm.remark"
            type="textarea"
            :rows="3"
            placeholder="可选填写"
          />
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
      tablename: "remaicosfu",
      baseUrl: "",
      detail: {},
      detailBanner: [],
      customizeDialogVisible: false,
      cartForm: {
        specs: "",
        quantity: 1,
        remark: "",
      },
    };
  },
  computed: {
    sizeOptions() {
      const raw = this.detail.chima || "";
      const arr = raw
        .split(/[,/，]/)
        .map((s) => s.trim())
        .filter((s) => !!s);
      return arr.length ? arr : ["S", "M", "L", "XL"];
    },
  },
  created() {
    this.baseUrl = this.$config.baseUrl;
    const detailObj = this.$route.query.detailObj;
    if (detailObj) {
      try {
        this.detail = JSON.parse(detailObj);
      } catch (e) {
        this.detail = {};
      }
    }
    if (this.detail.id || this.$route.query.id) {
      this.loadDetail(this.detail.id || this.$route.query.id);
    }
  },
  methods: {
    imgUrl(img) {
      if (!img) return "";
      return img.startsWith("http") ? img : this.baseUrl + img;
    },
    loadDetail(id) {
      this.$http.get(`${this.tablename}/detail/${id}`).then((res) => {
        if (res.data.code === 0 && res.data.data) {
          this.detail = res.data.data;
          this.detailBanner = (this.detail.huawentuan || "")
            .split(",")
            .map((s) => s.trim())
            .filter((s) => !!s);
        }
      });
    },
    openCustomize() {
      if (!localStorage.getItem("Token")) {
        this.$message.warning("请先登录后再加入购物车");
        this.$router.push("/login");
        return;
      }
      this.cartForm.specs = this.detail.chima || (this.sizeOptions[0] || "M");
      this.cartForm.quantity = 1;
      this.cartForm.remark = "";
      this.customizeDialogVisible = true;
    },
    addToCart() {
      const userId = Number(localStorage.getItem("userid") || localStorage.getItem("userId") || 0);
      const userTable =
        localStorage.getItem("sessionTable") ||
        localStorage.getItem("UserTableName") ||
        "yonghu";
      const quantity = Number(this.cartForm.quantity || 1);
      const price = Number(this.detail.fuzhuangjiage || 0);
      const firstCover = (this.detail.huawentuan || "").split(",")[0] || "";

      const payload = {
        userId,
        userTable,
        productId: this.detail.id,
        productName: this.detail.fuzhuangmingcheng,
        productCover: firstCover,
        specs: this.cartForm.specs || this.detail.chima || "默认",
        quantity,
        price,
        amount: (price * quantity).toFixed(2),
        checked: 1,
      };

      this.$http.post("coscart/add", payload).then((res) => {
        if (res.data.code === 0) {
          this.$message.success("已加入购物车");
          this.customizeDialogVisible = false;
          this.$confirm("已加入购物车，是否立即前往购物车？", "提示", {
            type: "success",
          })
            .then(() => this.$router.push("/index/coscart"))
            .catch(() => {});
        } else {
          this.$message.error(res.data.msg || "加入购物车失败");
        }
      });
    },
  },
};
</script>

<style scoped>
.cos-detail {
  width: 1200px;
  margin: 20px auto;
}
.title {
  font-size: 30px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #223;
}
.banner {
  border-radius: 12px;
  overflow: hidden;
  background: #f6f7fb;
}
.banner-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #f8f8f8;
}
.info-card {
  margin-top: 18px;
  padding: 18px;
  background: #fff;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
}
.info-card p {
  margin: 10px 0;
}
.right {
  text-align: right;
  min-width: 220px;
}
.price {
  font-size: 32px;
  font-weight: 700;
  color: #4f46e5;
  margin-bottom: 14px;
}
.content-card {
  margin-top: 18px;
  padding: 16px;
  border-radius: 12px;
  background: #fff;
}
.content-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}
</style>
