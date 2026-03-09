const fs = require('fs')
const file = 'F:/springboot/front/web01/src/pages/remaicosfu/detail.vue'
let text = fs.readFileSync(file, 'utf8')
if (!text.includes("@/utils/Tryon")) {
  text = text.replace(
    /<script>\s*const SIZE_OPTIONS = \['S', 'M', 'L', 'XL'\]/,
    `<script>\nimport { buildTryonContext, createDefaultDesignConfig, createFallbackBodyProfile, normalizeBodyProfile, saveTryonContext } from '@/utils/Tryon'\n\nconst SIZE_OPTIONS = ['S', 'M', 'L', 'XL']`
  )
}
if (!text.includes('buildTryOnContext(useCurrentForm = false)')) {
  text = text.replace(
    /\n\s*buildDesignPayload\(\) \{/,
    `
    buildTryOnContext(useCurrentForm = false) {
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
`
  )
}
text = text.replace(
  /\.tryon-btn \{[\s\S]*?\n\}/,
  `.tryon-btn {
  min-width: 92px;
  height: 36px;
  border-radius: 10px;
  border-color: #d6e0ff;
  color: #4a63d8;
  background: linear-gradient(180deg, #f9fbff 0%, #f1f5ff 100%);
}`
)
fs.writeFileSync(file, text, { encoding: 'utf8' })
