<template>
  <div class="cos-detail">
    <div class="title">{{ detail.fuzhuangmingcheng || '热卖COS服详情' }}</div>

    <el-carousel height="520px" indicator-position="inside" v-if="detailBanner.length">
      <el-carousel-item v-for="(img, i) in detailBanner" :key="i">
        <img
          v-if="img.startsWith('http')"
          :src="img"
          style="width:100%;height:100%;object-fit:contain;background:#f8f8f8;"
        />
        <img
          v-else
          :src="baseUrl + img"
          style="width:100%;height:100%;object-fit:contain;background:#f8f8f8;"
        />
      </el-carousel-item>
    </el-carousel>

    <div class="info">
      <p><b>服装编号：</b>{{ detail.fuzhuangbianhao }}</p>
      <p><b>服装款式：</b>{{ detail.fuzhuangkuanshi }}</p>
      <p><b>面料类别：</b>{{ detail.mianliaoleibie }}</p>
      <p><b>尺码：</b>{{ detail.chima }}</p>
      <p><b>价格：</b>{{ detail.fuzhuangjiage }}</p>
      <p><b>点击数：</b>{{ detail.clicknum }}</p>
    </div>

    <div class="content" v-html="detail.fuzhuangxiangqing"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tablename: 'remaicosfu',
      baseUrl: '',
      detail: {},
      detailBanner: []
    };
  },
  created() {
    this.baseUrl = this.$config.baseUrl;
    if (this.$route.query.detailObj) {
      this.detail = JSON.parse(this.$route.query.detailObj);
    }
    this.$http.get(this.tablename + '/detail/' + this.detail.id).then(res => {
      if (res.data.code === 0) {
        this.detail = res.data.data;
        this.detailBanner = this.detail.huawentuan ? this.detail.huawentuan.split(',') : [];
      }
    });
  }
};
</script>

<style scoped>
.cos-detail { width: 1200px; margin: 20px auto; }
.title { font-size: 28px; margin-bottom: 16px; }
.info { margin: 20px 0; line-height: 28px; }
.content { background: #fff; padding: 16px; }
</style>
