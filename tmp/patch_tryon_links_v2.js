const fs = require('fs')
function read(file) { return fs.readFileSync(file, 'utf8') }
function write(file, content) { fs.writeFileSync(file, content, { encoding: 'utf8' }) }

const indexPath = 'F:/springboot/front/web01/src/pages/index.vue'
let index = read(indexPath)
if (!index.includes("{ label: '3D试穿', path: '/index/tryon' }")) {
  index = index.replace(
    /const menus = \[[\s\S]*?\n\s*\]/,
    `const menus = [
        { label: '首页', path: '/index/home' },
        { label: '服装浏览', path: '/index/browse' },
        { label: '3D试穿', path: '/index/tryon' },
        { label: '我的订单', path: '/index/cosorder', requiresAuth: true, roleHint: 'yonghu' }
      ]`
  )
}
write(indexPath, index)

const detailPath = 'F:/springboot/front/web01/src/pages/remaicosfu/detail.vue'
let detail = read(detailPath)
if (!detail.includes("@/utils/Tryon")) {
  detail = detail.replace(
    /const SIZE_OPTIONS = \['S', 'M', 'L', 'XL'\]\n/,
    `import { buildTryonContext, createDefaultDesignConfig, createFallbackBodyProfile, normalizeBodyProfile, saveTryonContext } from '@/utils/Tryon'\n\nconst SIZE_OPTIONS = ['S', 'M', 'L', 'XL']\n`
  )
}
if (!detail.includes('class="tryon-btn"')) {
  detail = detail.replace(
    /(<el-button[^\n]*class="buy-btn"[^\n]*>[\s\S]*?<\/el-button>)/,
    `$1\n        <el-button plain class="tryon-btn" @click="openTryOn">3D试穿</el-button>`
  )
}
if (!detail.includes('buildTryOnContext(useCurrentForm = false)')) {
  detail = detail.replace(
    /buildDesignPayload\(\) \{[\s\S]*?\n\s*\},\n\s*async saveDraft/,
    `buildTryOnContext(useCurrentForm = false) {
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
    async saveDraft`
  )
  detail = detail.replace('    async saveDraft`', '    async saveDraft')
}
if (!detail.includes('.tryon-btn')) {
  detail = detail.replace(
    /\.buy-btn \{[\s\S]*?\n\}/,
    match => `${match}\n\n.tryon-btn {\n  margin-top: 10px;\n  width: 100%;\n  height: 40px;\n  border-radius: 12px;\n  border-color: #d6e0ff;\n  color: #4a63d8;\n  background: linear-gradient(180deg, #f9fbff 0%, #f1f5ff 100%);\n}`
  )
}
write(detailPath, detail)
