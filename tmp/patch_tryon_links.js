const fs = require('fs')
const path = require('path')

function read(file) {
  return fs.readFileSync(file, 'utf8')
}

function write(file, content) {
  fs.writeFileSync(file, content, { encoding: 'utf8' })
}

const routerPath = 'F:/springboot/front/web01/src/router/router.js'
let router = read(routerPath)
if (!router.includes("import TryOnPage from '../pages/tryon/index'")) {
  router = router.replace(
    "import Browse from '../pages/browse/index'\n",
    "import Browse from '../pages/browse/index'\nimport TryOnPage from '../pages/tryon/index'\n"
  )
}
if (!router.includes("path: 'tryon'")) {
  router = router.replace(
    "        {\n          path: 'browse',\n          component: Browse\n        },\n",
    "        {\n          path: 'browse',\n          component: Browse\n        },\n        {\n          path: 'tryon',\n          component: TryOnPage\n        },\n"
  )
}
write(routerPath, router)

const indexPath = 'F:/springboot/front/web01/src/pages/index.vue'
let index = read(indexPath)
if (!index.includes("{ label: '3D试穿', path: '/index/tryon' }")) {
  index = index.replace(
    "      const menus = [\n        { label: '首页', path: '/index/home' },\n        { label: '服装浏览', path: '/index/browse' },\n        { label: '我的订单', path: '/index/cosorder', requiresAuth: true, roleHint: 'yonghu' }\n      ]",
    "      const menus = [\n        { label: '首页', path: '/index/home' },\n        { label: '服装浏览', path: '/index/browse' },\n        { label: '3D试穿', path: '/index/tryon' },\n        { label: '我的订单', path: '/index/cosorder', requiresAuth: true, roleHint: 'yonghu' }\n      ]"
  )
}
write(indexPath, index)

const detailPath = 'F:/springboot/front/web01/src/pages/remaicosfu/detail.vue'
let detail = read(detailPath)
if (!detail.includes("@/utils/Tryon")) {
  detail = detail.replace(
    "const SIZE_OPTIONS = ['S', 'M', 'L', 'XL']\n",
    "import { buildTryonContext, createDefaultDesignConfig, createFallbackBodyProfile, normalizeBodyProfile, saveTryonContext } from '@/utils/Tryon'\n\nconst SIZE_OPTIONS = ['S', 'M', 'L', 'XL']\n"
  )
}
if (!detail.includes('class="tryon-btn"')) {
  detail = detail.replace(
    "        <el-button type=\"primary\" class=\"buy-btn\" @click=\"openCustomize\">绔嬪嵆瀹氬埗</el-button>\n",
    "        <el-button type=\"primary\" class=\"buy-btn\" @click=\"openCustomize\">绔嬪嵆瀹氬埗</el-button>\n        <el-button plain class=\"tryon-btn\" @click=\"openTryOn\">3D试穿</el-button>\n"
  )
}
if (!detail.includes('buildTryOnContext(useCurrentForm = false)')) {
  detail = detail.replace(
    `    buildDesignPayload() {
      const bodyProfileSnapshot = this.buildBodyProfileSnapshot()
      return {
        productId: this.detail.id,
        productName: this.detail.fuzhuangmingcheng || '',
        styleName: this.detail.fuzhuangkuanshi || '',
        sizeCode: this.cartForm.sizeCode,
        materialName: this.cartForm.materialName,
        silhouette: this.cartForm.silhouette,
        fitType: this.cartForm.fitType,
        colorTheme: this.cartForm.colorTheme,
        craftTags: [...this.cartForm.craftTags],
        accessoryTags: [...this.cartForm.accessoryTags],
        referenceImages: this.parseMultiInput(this.cartForm.referenceImages),
        customNote: this.cartForm.remark,
        summary: this.designSummary,
        bodyProfileId: this.selectedBodyProfileId || null,
        bodyProfileSnapshot,
        snapshotAt: new Date().toISOString()
      }
    },
`,
    `    buildTryOnContext(useCurrentForm = false) {
      const materialOptions = Array.isArray(this.materialOptions) ? this.materialOptions : []
      const firstCover = (this.detail.huawentuan || '').split(',')[0] || this.detailBanner[0] || ''
      const defaultConfig = createDefaultDesignConfig({
        materialName: this.detail.mianliaoleibie || ''
      }, materialOptions)
      const currentPayload = useCurrentForm
        ? this.buildDesignPayload()
        : {
            productId: this.detail.id,
            productName: this.detail.fuzhuangmingcheng || '',
            styleName: this.detail.fuzhuangkuanshi || '',
            sizeCode: defaultConfig.sizeCode,
            materialName: defaultConfig.materialName,
            silhouette: defaultConfig.silhouette,
            fitType: defaultConfig.fitType,
            colorTheme: defaultConfig.colorTheme,
            craftTags: [],
            accessoryTags: [],
            bodyProfileId: this.selectedBodyProfileId || null,
            bodyProfileSnapshot: this.selectedBodyProfileId ? normalizeBodyProfile(this.selectedBodyProfile || this.selectedBodySnapshot || {}) : createFallbackBodyProfile()
          }
      const bodyProfile = currentPayload.bodyProfileId
        ? normalizeBodyProfile(currentPayload.bodyProfileSnapshot || this.selectedBodyProfile || this.selectedBodySnapshot || {})
        : createFallbackBodyProfile()
      return buildTryonContext({
        product: {
          productId: this.detail.id,
          productName: this.detail.fuzhuangmingcheng || '',
          styleName: this.detail.fuzhuangkuanshi || '',
          cover: firstCover,
          draftId: this.draftState.id || null,
          source: 'detail'
        },
        draftId: this.draftState.id || null,
        source: 'detail',
        designConfig: {
          sizeCode: currentPayload.sizeCode,
          materialName: currentPayload.materialName,
          silhouette: currentPayload.silhouette,
          fitType: currentPayload.fitType,
          colorTheme: currentPayload.colorTheme,
          craftTags: currentPayload.craftTags || [],
          accessoryTags: currentPayload.accessoryTags || []
        },
        bodyProfile
      })
    },
    async openTryOn() {
      await this.loadMaterialOptions()
      if (localStorage.getItem('Token')) {
        await this.loadBodyProfiles()
      }
      const context = this.buildTryOnContext(this.customizeDialogVisible)
      saveTryonContext(context)
      this.$router.push({
        path: '/index/tryon',
        query: {
          productId: context.productId,
          source: 'detail',
          draftId: context.draftId || undefined
        }
      })
    },
    buildDesignPayload() {
      const bodyProfileSnapshot = this.buildBodyProfileSnapshot()
      return {
        productId: this.detail.id,
        productName: this.detail.fuzhuangmingcheng || '',
        styleName: this.detail.fuzhuangkuanshi || '',
        sizeCode: this.cartForm.sizeCode,
        materialName: this.cartForm.materialName,
        silhouette: this.cartForm.silhouette,
        fitType: this.cartForm.fitType,
        colorTheme: this.cartForm.colorTheme,
        craftTags: [...this.cartForm.craftTags],
        accessoryTags: [...this.cartForm.accessoryTags],
        referenceImages: this.parseMultiInput(this.cartForm.referenceImages),
        customNote: this.cartForm.remark,
        summary: this.designSummary,
        bodyProfileId: this.selectedBodyProfileId || null,
        bodyProfileSnapshot,
        snapshotAt: new Date().toISOString()
      }
    },
`
  )
}
if (!detail.includes('.tryon-btn')) {
  detail = detail.replace(
    `.buy-btn {
  margin-top: 14px;
  width: 100%;
  height: 42px;
  font-size: 15px;
}
`,
    `.buy-btn {
  margin-top: 14px;
  width: 100%;
  height: 42px;
  font-size: 15px;
}

.tryon-btn {
  margin-top: 10px;
  width: 100%;
  height: 40px;
  border-radius: 12px;
  border-color: #d6e0ff;
  color: #4a63d8;
  background: linear-gradient(180deg, #f9fbff 0%, #f1f5ff 100%);
}
`
  )
}
write(detailPath, detail)
