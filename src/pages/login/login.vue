<template>
<div>
	<div class="container" :style='{"minHeight":"100vh","width":"100%","alignItems":"center","background":"url(http://codegen.caihongy.cn/20221231/7a3226bd0dfc41549fbee764c9f6552d.jpg) no-repeat center top / 100% 100%","justifyContent":"center","display":"flex"}'>
		<el-form ref="loginForm" :model="loginForm" :style='{"padding":"20px 20px 30px","boxShadow":"0px 0px 0px #9cd8da,inset 0px 0px 0px 0px #e0f8e8","margin":"0","borderColor":"#00adb5  #00adb5 #00adb5 #00adb5","borderRadius":"30px","background":"rgba(255,255,255,.0)","borderWidth":"0px","width":"800px","borderStyle":"solid double double double","height":"auto"}' :rules="rules">
			<div v-if="true" :style='{"width":"100%","margin":"0 0 10px 0","fontSize":"24px","color":"#3086b9","textAlign":"center","fontWeight":"500"}'>USER / LOGIN</div>
			<div v-if="true" :style='{"margin":"0 auto 20px","borderColor":"#c4deee","color":"#3086b9","textAlign":"center","borderWidth":"4px 0px","width":"80%","fontSize":"22px","lineHeight":"44px","borderStyle":"dotted dashed","fontWeight":"500"}'>私人西服定制登录</div>
			<el-form-item class="list-item" :style='{"width":"80%","margin":"0 auto 10px"}' prop="username">
				<div v-if="false" :style='{"width":"64px","lineHeight":"40px","fontSize":"14px","color":"#ffa100"}'>账号：</div>
				<input :style='{"border":"0px solid #eacb96","padding":"0 10px","boxShadow":"0px 0px 0px #a0d8db","borderColor":"#c4deee","color":"#999","borderRadius":"0px","background":"#fff","borderWidth":"0 0 2px","width":"100%","fontSize":"14px","borderStyle":"dotted","height":"44px"}' v-model="loginForm.username" placeholder="请输入账号">
			</el-form-item>
			<el-form-item class="list-item" :style='{"width":"80%","margin":"0 auto 10px"}' prop="password">
				<div v-if="false" :style='{"width":"64px","lineHeight":"40px","fontSize":"14px","color":"#ffa100"}'>密码：</div>
				<input :style='{"border":"0px solid #eacb96","padding":"0 10px","boxShadow":"0px 0px 0px #a0d8db","borderColor":"#c4deee","color":"#999","borderRadius":"0px","background":"#fff","borderWidth":"0 0 2px","width":"100%","fontSize":"14px","borderStyle":"dotted","height":"44px"}' v-model="loginForm.password" placeholder="请输入密码" type="password">
			</el-form-item>
			<el-form-item v-if="roles.length>1" class="list-type" :style='{"width":"80%","margin":"20px auto"}' prop="role">
				<el-radio v-model="loginForm.tableName" :label="item.tableName" v-for="(item, index) in roles" :key="index" @change.native="getCurrentRow(item)">{{item.roleName}}</el-radio>
			</el-form-item>
			<el-form-item :style='{"width":"80%","margin":"20px auto","flexWrap":"wrap","textAlign":"center","justifyContent":"center","display":"flex"}'>
				<el-button :style='{"border":"0","cursor":"pointer","padding":"0px","boxShadow":"0px 0px 0px #9cdde0","margin":"0 5px","color":"#fff","display":"inline-block","outline":"none","borderRadius":"0px","background":"linear-gradient(320deg, rgba(48,134,185,1) 0%, rgba(197,230,250,1) 80%, rgba(48,134,185,1) 100%)","width":"128px","fontSize":"14px","height":"40px"}' @click="submitForm('loginForm')">登录</el-button>
				<el-button :style='{"border":"0px solid #bbb","cursor":"pointer","padding":"0px","boxShadow":"0px 0px 0px #ccc","margin":"0 5px","color":"#333","display":"inline-block","outline":"none","borderRadius":"0px","background":"linear-gradient(320deg, rgba(204,204,204,1) 0%, rgba(255,255,255,1) 80%, rgba(204,204,204,1) 100%)","width":"128px","fontSize":"14px","height":"40px"}' @click="resetForm('loginForm')">重置</el-button>
			</el-form-item>
			<div :style='{"width":"80%","margin":"20px auto"}'>
			<router-link :style='{"cursor":"pointer","padding":"4px 10px","margin":"0 10px 4px 0","color":"#3086b9","background":"linear-gradient(320deg, rgba(204,204,204,1) 0%, rgba(255,255,255,1) 80%, rgba(204,204,204,1) 100%)","fontSize":"14px","textDecoration":"none"}' :to="{path: '/register', query: {role: item.tableName,pageFlag:'register'}}" v-if="item.hasFrontRegister=='是'" v-for="(item, index) in roles" :key="index">注册{{item.roleName.replace('注册','')}}</router-link>
			</div>
		</el-form>
    </div>
</div>
</template>

<script>
export default {
	data() {
		return {
            baseUrl: this.$config.baseUrl,
			roleMenus: [{"backMenu":[{"child":[{"appFrontIcon":"cuIcon-vip","buttons":["新增","查看","修改","删除"],"menu":"用户","menuJump":"列表","tableName":"yonghu"}],"menu":"用户管理"},{"child":[{"appFrontIcon":"cuIcon-vipcard","buttons":["新增","查看","修改","删除"],"menu":"服装款式","menuJump":"列表","tableName":"fuzhuangkuanshi"}],"menu":"服装款式管理"},{"child":[{"appFrontIcon":"cuIcon-camera","buttons":["新增","查看","修改","删除"],"menu":"面料类别","menuJump":"列表","tableName":"mianliaoleibie"}],"menu":"面料类别管理"},{"child":[{"appFrontIcon":"cuIcon-newshot","buttons":["新增","查看","修改","删除","查看评论","立即预约"],"menu":"热卖西服","menuJump":"列表","tableName":"remaixifu"}],"menu":"热卖西服管理"},{"child":[{"appFrontIcon":"cuIcon-medal","buttons":["查看","修改","删除","审核"],"menu":"服装预约","menuJump":"列表","tableName":"fuzhuangyuyue"}],"menu":"服装预约管理"},{"child":[{"appFrontIcon":"cuIcon-group","buttons":["查看","修改","删除"],"menu":"服装交流","tableName":"forum"}],"menu":"服装交流"},{"child":[{"appFrontIcon":"cuIcon-news","buttons":["新增","查看","修改","删除"],"menu":"优惠资讯","tableName":"news"},{"appFrontIcon":"cuIcon-service","buttons":["查看","修改","删除"],"menu":"在线客服","tableName":"chat"},{"appFrontIcon":"cuIcon-addressbook","buttons":["查看","修改"],"menu":"系统简介","tableName":"systemintro"},{"appFrontIcon":"cuIcon-taxi","buttons":["新增","查看","修改","删除"],"menu":"轮播图管理","tableName":"config"}],"menu":"系统管理"}],"frontMenu":[{"child":[{"appFrontIcon":"cuIcon-explore","buttons":["查看","查看评论","立即预约"],"menu":"热卖西服列表","menuJump":"列表","tableName":"remaixifu"}],"menu":"热卖西服模块"}],"hasBackLogin":"是","hasBackRegister":"否","hasFrontLogin":"是","hasFrontRegister":"否","roleName":"管理员","tableName":"users"},{"backMenu":[{"child":[{"appFrontIcon":"cuIcon-medal","buttons":["查看","删除","支付"],"menu":"服装预约","menuJump":"列表","tableName":"fuzhuangyuyue"}],"menu":"服装预约管理"}],"frontMenu":[{"child":[{"appFrontIcon":"cuIcon-explore","buttons":["查看","查看评论","立即预约"],"menu":"热卖西服列表","menuJump":"列表","tableName":"remaixifu"}],"menu":"热卖西服模块"}],"hasBackLogin":"是","hasBackRegister":"否","hasFrontLogin":"是","hasFrontRegister":"是","roleName":"用户","tableName":"yonghu"},{"backMenu":[],"frontMenu":[],"hasBackLogin":"否","hasBackRegister":"否","hasFrontLogin":"是","hasFrontRegister":"否","roleName":"设计师","tableName":"shejishi"}],
			loginForm: {
				username: '',
				password: '',
				tableName: ''
			},
			role: '',
            roles: [],
			rules: {
				username: [
					{ required: true, message: '请输入账号', trigger: 'blur' }
				],
				password: [
					{ required: true, message: '请输入密码', trigger: 'blur' }
				]
			}
		}
	},
	created() {
        for(let item in this.roleMenus) {
            if(this.roleMenus[item].hasFrontLogin=='是') {
                this.roles.push(this.roleMenus[item]);
            }
        }
	},
    methods: {
      getCurrentRow(row) {
        this.role = row.roleName;
      },
      submitForm(formName) {
        if (this.roles.length!=1) {
            if (!this.role) {
                this.$message.error("请选择登录用户类型");
                return false;
            }
        } else {
            this.role = this.roles[0].roleName;
            this.loginForm.tableName = this.roles[0].tableName;
        }
        this.$refs[formName].validate((valid) => {
          if (valid) {
            const loginApi = `${this.loginForm.tableName}/login`
            const loginRequest = this.loginForm.tableName === 'users'
              ? this.$http.post(loginApi, null, { params: this.loginForm })
              : this.$http.get(loginApi, { params: this.loginForm })
            loginRequest.then(res => {
              if (res.data.code === 0) {
					const token = res.data.token
                localStorage.setItem('Token', token);
                localStorage.setItem('UserTableName', this.loginForm.tableName);
                localStorage.setItem('username', this.loginForm.username);
                localStorage.setItem('adminName', this.loginForm.username);
                localStorage.setItem('sessionTable', this.loginForm.tableName);
                localStorage.setItem('role', this.role);

                const targetRouteMap = {
                  users: '/index/cosorder-admin',
                  shejishi: '/index/cosorder-designer',
                  yonghu: '/index/home'
                }
                const targetRoute = targetRouteMap[this.loginForm.tableName] || '/index/home'

					this.$http.get(`${this.loginForm.tableName}/session`, {
					  headers: { Token: token }
					}).then(sessionRes => {
					  const curr = (sessionRes.data && sessionRes.data.data) || {}
					  const uid = curr.id || curr.userid || curr.userId
					  if (uid) {
						localStorage.setItem('userid', String(uid))
						localStorage.setItem('userId', String(uid))
					  }
					}).catch(() => {
					  this.$message.warning('登录成功，但读取用户信息失败')
					}).then(() => {
					  this.$router.push(targetRoute)
					  this.$message({
						message: '登录成功',
						type: 'success',
						duration: 1500
					  })
					})
              } else {
                this.$message.error(res.data.msg);
              }
            });
          } else {
            return false;
          }
        });
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
	.container {
		position: relative;
		background: url(http://codegen.caihongy.cn/20221231/7a3226bd0dfc41549fbee764c9f6552d.jpg) no-repeat center top / 100% 100%;
		
		.el-form-item {
		  & ::v-deep .el-form-item__content {
		    width: 100%;
		  }
		}
		
		.list-item ::v-deep .el-input .el-input__inner {
			border: 0px solid #eacb96;
			border-radius: 0px;
			padding: 0 10px;
			box-shadow: 0px 0px 0px #a0d8db;
			color: #999;
			background: #fff;
			width: 100%;
			font-size: 14px;
			border-color: #c4deee;
			border-width: 0 0 2px;
			border-style: dotted;
			height: 44px;
		}
		
		.list-type ::v-deep .el-radio__input .el-radio__inner {
			background: rgba(53, 53, 53, 0);
			border-color: #666666;
		}
		.list-type ::v-deep .el-radio__input.is-checked .el-radio__inner {
			background: #3086b9;
			border-color: #3086b9;
		}
		.list-type ::v-deep .el-radio__label {
			color: #666666;
			font-size: 14px;
		}
		.list-type ::v-deep .el-radio__input.is-checked+.el-radio__label {
			color: #3086b9;
			font-size: 14px;
		}
	}
</style>
