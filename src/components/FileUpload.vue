<template>
  <div>
    <el-upload
      ref="upload"
      :action="getActionUrl"
      list-type="picture-card"
      :multiple="multiple"
      :limit="limit"
      :headers="myHeaders"
      :file-list="fileList"
      :on-exceed="handleExceed"
      :on-preview="handleUploadPreview"
      :on-remove="handleRemove"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadErr"
      :before-upload="handleBeforeUpload"
    >
      <i class="el-icon-plus"></i>
      <div slot="tip" class="el-upload__tip" style="color:#838fa1;">{{tip}}</div>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible" size="tiny" append-to-body>
      <img width="100%" :src="dialogImageUrl" alt>
    </el-dialog>
  </div>
</template>
<script>
import storage from "@/common/storage";
import config from "@/config/config";
export default {
  data() {
    return {
      baseUrl: config.baseUrl,
      dialogVisible: false,
      dialogImageUrl: "",
      fileList: [],
      fileUrlList: [],
      myHeaders:{}
    };
  },
  props: ["tip", "action", "limit", "multiple", "fileUrls"],
  mounted() {
    this.init();
    this.myHeaders= {
      'Token':storage.get("Token")
    }
  },
  watch: {
    fileUrls: function(val, oldVal) {
      this.init();
    }
  },
  computed: {
    getActionUrl: function() {
      return this.baseUrl +  this.action;
    }
  },
  methods: {
    init() {
      if (this.fileUrls) {
        this.fileUrlList = this.fileUrls.split(",");
        let fileArray = [];
        this.fileUrlList.forEach(function(item, index) {
          var url = item;
          var name = index;
          var file = {
            name: name,
            url: url
          };
          fileArray.push(file);
        });
        this.setFileList(fileArray);
      }
    },
    handleBeforeUpload(file) {
	
    },
    handleUploadSuccess(res, file, fileList) {
      if (res && res.code === 0) {
        fileList[fileList.length - 1]["url"] = "upload/" + file.response.file;
        this.setFileList(fileList);
        this.$emit("change", this.fileUrlList.join(","));
      } else {
        this.$message.error(res.msg);
      }
    },
    handleUploadErr(err, file, fileList) {
      this.$message.error("文件上传失败");
    },
    handleRemove(file, fileList) {
      this.setFileList(fileList);
      this.$emit("change", this.fileUrlList.join(","));
    },
    handleUploadPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    handleExceed(files, fileList) {
      this.$message.warning(`最多上传${this.limit}张图片`);
    },
    setFileList(fileList) {
      var fileArray = [];
      var fileUrlArray = [];
      var token = storage.get("token");
      let _this = this;
      fileList.forEach(function(item, index) {
        var url = item.url.split("?")[0];
        if(!url.startsWith("http")) {
          url = _this.baseUrl +  url
        }
        var name = item.name;
        var file = {
          name: name,
          url: url + "?token=" + token
        };
        fileArray.push(file);
        fileUrlArray.push(url);
      });
      this.fileList = fileArray;
      this.fileUrlList = fileUrlArray;
    }
  }
};
</script>
<style lang="scss" scoped>
</style>

