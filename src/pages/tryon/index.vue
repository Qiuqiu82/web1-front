<template>
  <div class="tryon-page">
    <section class="tryon-hero panel-card">
      <div class="hero-copy">
        <span class="eyebrow">{{ texts.heroEyebrow }}</span>
        <h2>{{ texts.heroTitle }}</h2>
        <p>{{ texts.heroDesc }}</p>
      </div>
      <div class="hero-actions">
        <el-button type="primary" @click="syncFromSession">{{ texts.sync }}</el-button>
        <el-button :disabled="!hasContext" @click="resetParameters">{{ texts.reset }}</el-button>
        <el-button :disabled="!hasContext" @click="openDetail">{{ texts.backDetail }}</el-button>
        <el-button @click="goBrowse">{{ texts.browse }}</el-button>
      </div>
    </section>

    <section v-if="hasContext" class="tryon-grid">
      <aside class="panel-card side-card summary-card">
        <div class="section-head">
          <div>
            <h3>{{ texts.productSummary }}</h3>
            <p>{{ texts.source }}锛歿{ contextSourceLabel }}</p>
          </div>
        </div>

        <div class="product-cover">
          <img v-if="coverUrl" :src="coverUrl" :alt="product.productName">
          <div v-else class="cover-fallback">{{ product.productName }}</div>
        </div>

        <div class="summary-list">
          <div class="summary-row"><span>{{ texts.product }}</span><strong>{{ product.productName }}</strong></div>
          <div class="summary-row"><span>{{ texts.style }}</span><strong>{{ product.styleName || '-' }}</strong></div>
          <div class="summary-row"><span>{{ texts.preset }}</span><strong>{{ visualModel.preset.label }}</strong></div>
          <div class="summary-row"><span>{{ texts.size }}</span><strong>{{ designConfig.sizeCode }}</strong></div>
          <div class="summary-row"><span>{{ texts.silhouette }}</span><strong>{{ designConfig.silhouette }}</strong></div>
          <div class="summary-row"><span>{{ texts.fit }}</span><strong>{{ designConfig.fitType }}</strong></div>
          <div class="summary-row"><span>{{ texts.color }}</span><strong>{{ displayColorTheme }}</strong></div>
          <div class="summary-row"><span>{{ texts.bodyProfile }}</span><strong>{{ bodyProfile.profileName }}</strong></div>
        </div>

        <div class="body-metrics">
          <div class="metric-chip">{{ texts.height }} {{ bodyProfile.heightCm }} cm</div>
          <div class="metric-chip">{{ texts.shoulder }} {{ bodyProfile.shoulderCm }} cm</div>
          <div class="metric-chip">{{ texts.bust }} {{ bodyProfile.bustCm }} cm</div>
          <div class="metric-chip">{{ texts.waist }} {{ bodyProfile.waistCm }} cm</div>
          <div class="metric-chip">{{ texts.hip }} {{ bodyProfile.hipCm }} cm</div>
        </div>

        <div class="badge-group">
          <span v-for="item in visualTags" :key="item" class="info-badge">{{ item }}</span>
        </div>
      </aside>

      <section class="panel-card stage-card">
        <div class="section-head stage-head">
          <div>
            <h3>{{ texts.view3d }}</h3>
            <p>{{ sceneStatusText }}</p>
          </div>
          <div class="stage-actions">
            <el-button size="mini" @click="setCameraView('front')">{{ texts.front }}</el-button>
            <el-button size="mini" @click="setCameraView('side')">{{ texts.side }}</el-button>
            <el-button size="mini" @click="resetCamera">{{ texts.resetView }}</el-button>
            <el-button size="mini" :type="sceneState.outline ? 'primary' : 'default'" @click="toggleOutline">
              {{ outlineToggleLabel }}
            </el-button>
          </div>
        </div>

        <div class="stage-shell">
          <div v-if="sceneState.failed" class="scene-fallback">
            <div class="fallback-card">
              <span class="eyebrow">{{ texts.staticPreview }}</span>
              <h4>{{ texts.initFailed }}</h4>
              <p>{{ sceneState.failedMessage || texts.initFallback }}</p>
              <div class="fallback-figure">
                <div class="fallback-head" />
                <div class="fallback-body" :style="fallbackBodyStyle" />
              </div>
            </div>
          </div>
          <div v-else ref="stageViewport" class="stage-viewport" />
        </div>
      </section>

      <aside class="panel-card side-card control-card">
        <div class="section-head">
          <div>
            <h3>{{ texts.controls }}</h3>
            <p>{{ texts.controlsDesc }}</p>
          </div>
        </div>

        <div class="control-stack">
          <div class="control-block">
            <label>{{ texts.bodyProfile }}</label>
            <el-select v-model="selectedBodyProfileId" :placeholder="texts.bodyProfilePlaceholder" style="width: 100%" @change="handleBodyProfileChange">
              <el-option v-for="item in bodyProfileOptions" :key="item.id || item.profileName" :label="bodyProfileLabel(item)" :value="item.id" />
            </el-select>
            <div v-if="!isLoggedIn" class="field-tip">{{ texts.noProfileFallback }}</div>
          </div>

          <div class="control-block two-col">
            <div>
              <label>{{ texts.size }}</label>
              <el-select v-model="designConfig.sizeCode" style="width: 100%">
                <el-option v-for="item in sizeOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </div>
            <div>
              <label>{{ texts.material }}</label>
              <el-input v-model="designConfig.materialName" :placeholder="texts.materialPlaceholder" />
            </div>
          </div>

          <div class="control-block two-col">
            <div>
              <label>{{ texts.silhouette }}</label>
              <el-select v-model="designConfig.silhouette" style="width: 100%">
                <el-option v-for="item in silhouetteOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </div>
            <div>
              <label>{{ texts.fit }}</label>
              <el-select v-model="designConfig.fitType" style="width: 100%">
                <el-option v-for="item in fitTypeOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </div>
          </div>

          <div class="control-block">
            <label>{{ texts.colorTheme }}</label>
            <el-input v-model="designConfig.colorTheme" :placeholder="texts.colorPlaceholder" />
            <div class="preset-row">
              <button
                v-for="item in colorPresets"
                :key="item.value"
                type="button"
                class="preset-swatch"
                :title="item.label"
                :style="{ background: item.value }"
                @click="applyColorPreset(item.value)"
              />
            </div>
          </div>

          <div class="control-block scene-tools">
            <label>{{ texts.sceneHelpers }}</label>
            <div class="scene-helper-row">
              <span class="status-pill" :class="{ active: sceneState.outline }">{{ outlineStatusLabel }}</span>
              <span class="field-tip">{{ texts.outlineHint }}</span>
            </div>
            <div class="control-actions">
              <el-button size="mini" :type="sceneState.outline ? 'primary' : 'default'" @click="toggleOutline">{{ outlineActionLabel }}</el-button>
              <el-button size="mini" @click="resetParameters">{{ texts.reset }}</el-button>
            </div>
          </div>

          <div class="control-block">
            <label>{{ texts.craftTags }}</label>
            <div v-if="designConfig.craftTags.length" class="tag-wrap">
              <span v-for="item in designConfig.craftTags" :key="`craft-${item}`" class="tag-chip">{{ item }}</span>
            </div>
            <div v-else class="field-tip">{{ texts.noCraftTags }}</div>
          </div>

          <div class="control-block">
            <label>{{ texts.accessoryTags }}</label>
            <div v-if="designConfig.accessoryTags.length" class="tag-wrap">
              <span v-for="item in designConfig.accessoryTags" :key="`accessory-${item}`" class="tag-chip secondary">{{ item }}</span>
            </div>
            <div v-else class="field-tip">{{ texts.noAccessoryTags }}</div>
          </div>          <div class="control-block structure-card">
            <span class="eyebrow">{{ texts.structure }}</span>
            <h4>{{ visualModel.preset.label }}</h4>
            <p>{{ visualModel.structureSummary }}</p>
            <div class="structure-meta">
              <div class="summary-row"><span>{{ texts.matchedBy }}</span><strong>{{ visualModel.preset.matchedBy || texts.defaultMatchedBy }}</strong></div>
              <div class="summary-row"><span>{{ texts.source }}</span><strong>{{ contextSourceLabel }}</strong></div>
            </div>
            <div class="structure-parts">
              <span v-for="item in visualModel.enabledPartLabels" :key="`part-${item}`" class="tag-chip structure-chip">{{ item }}</span>
            </div>
          </div>

          <div class="control-block live-summary">
            <span class="eyebrow">{{ texts.liveSummary }}</span>
            <h4>{{ product.productName }}</h4>
            <p>{{ designSummary }}</p>
            <div class="field-tip">{{ texts.partsActive }}{{ partsSummary }}</div>
          </div>
        </div>
      </aside>
    </section>

    <section v-else class="panel-card empty-panel">
      <div class="empty-copy">
        <span class="eyebrow">{{ texts.tryonReady }}</span>
        <h3>{{ texts.noContext }}</h3>
        <p>{{ texts.noContextDesc }}</p>
      </div>
      <div class="empty-actions">
        <el-button type="primary" @click="goBrowse">{{ texts.browse }}</el-button>
        <el-button @click="$router.push('/index/home')">{{ texts.goHome }}</el-button>
      </div>
    </section>
  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {
  TRYON_COLOR_PRESETS,
  TRYON_FIT_TYPE_OPTIONS,
  TRYON_SILHOUETTE_OPTIONS,
  TRYON_SIZE_OPTIONS,
  buildTryonContext,
  buildTryonVisualModel,
  createFallbackBodyProfile,
  loadTryonContext,
  normalizeBodyProfile,
  normalizeDesignConfig,
  saveTryonContext
} from '@/utils/Tryon'

const TEXTS = {
  heroEyebrow: '\u0033D\u8bd5\u7a7f\u5de5\u4f5c\u53f0',
  heroTitle: '\u6b3e\u5f0f\u9a71\u52a8\u8bd5\u7a7f\u9884\u89c8',
  heroDesc:
    '\u90e8\u4ef6\u5316\u670d\u88c5\u9884\u89c8\u4f1a\u6839\u636e\u6b3e\u5f0f\u539f\u578b\u3001\u5ed3\u5f62\u3001\u677e\u91cf\u3001\u914d\u8272\u548c\u914d\u4ef6\u6807\u7b7e\u5b9e\u65f6\u53d8\u5316\uff0c\u8ba9\u8bd5\u7a7f\u7ed3\u679c\u66f4\u63a5\u8fd1\u771f\u5b9e\u670d\u88c5\u7ed3\u6784\u3002',
  sync: '\u540c\u6b65\u5f53\u524d\u53c2\u6570',
  reset: '\u91cd\u7f6e\u53c2\u6570',
  backDetail: '\u8fd4\u56de\u8be6\u60c5\u9875',
  browse: '\u53bb\u670d\u88c5\u6d4f\u89c8',
  productSummary: '\u5546\u54c1\u6458\u8981',
  source: '\u6765\u6e90',
  product: '\u5546\u54c1',
  style: '\u6b3e\u5f0f',
  preset: '\u8bc6\u522b\u539f\u578b',
  size: '\u5c3a\u7801',
  silhouette: '\u7248\u578b',
  fit: '\u677e\u91cf',
  color: '\u914d\u8272',
  defaultTheme: '\u9ed8\u8ba4\u4e3b\u9898',
  bodyProfile: '\u8eab\u6750\u6863\u6848',
  height: '\u8eab\u9ad8',
  shoulder: '\u80a9\u5bbd',
  bust: '\u80f8\u56f4',
  waist: '\u8170\u56f4',
  hip: '\u81c0\u56f4',
  view3d: '\u0033D\u89c6\u56fe',
  front: '\u6b63\u9762',
  side: '\u4fa7\u9762',
  resetView: '\u91cd\u7f6e\u89c6\u89d2',
  staticPreview: '\u9759\u6001\u9884\u89c8',
  initFailed: '\u0033D\u521d\u59cb\u5316\u5931\u8d25',
  initFallback: 'Three.js \u521d\u59cb\u5316\u5931\u8d25\uff0c\u5f53\u524d\u663e\u793a\u9759\u6001\u964d\u7ea7\u9884\u89c8\u3002',
  controls: '\u53c2\u6570\u63a7\u5236',
  controlsDesc: '\u4fee\u6539\u53c2\u6570\u540e\uff0c\u4f1a\u540c\u6b65\u66f4\u65b0\u6458\u8981\u5361\u7247\u3001\u89c6\u89c9\u6a21\u578b\u548c\u0033D\u573a\u666f\u3002',
  bodyProfilePlaceholder: '\u8bf7\u9009\u62e9\u8eab\u6750\u6863\u6848',
  noProfileFallback: '\u672a\u627e\u5230\u8eab\u6750\u6863\u6848\uff0c\u5f53\u524d\u4f7f\u7528\u9ed8\u8ba4\u4f53\u578b\u5360\u4f4d\u3002',
  material: '\u9762\u6599',
  materialPlaceholder: '\u4f8b\u5982\uff1a\u68c9\u3001\u96ea\u7eba\u3001\u5f39\u529b\u9762\u6599',
  colorTheme: '\u4e3b\u9898\u914d\u8272',
  colorPlaceholder: '\u8f93\u5165\u989c\u8272\u540d\u79f0\u6216\u0020#HEX',
  sceneHelpers: '\u573a\u666f\u8f85\u52a9',
  outlineEnabled: '\u5df2\u542f\u7528\u8f6e\u5ed3\u63cf\u8fb9',
  outlineDisabled: '\u5df2\u5173\u95ed\u8f6e\u5ed3\u63cf\u8fb9',
  outlineOn: '\u63cf\u8fb9\u5df2\u5f00',
  outlineOff: '\u63cf\u8fb9\u5df2\u5173',
  outlineActionOn: '\u5173\u95ed\u63cf\u8fb9',
  outlineActionOff: '\u5f00\u542f\u63cf\u8fb9',
  outlineHint: '\u5f00\u542f\u63cf\u8fb9\u540e\uff0c\u670d\u88c5\u8f6e\u5ed3\u548c\u7ed3\u6784\u8fb9\u754c\u4f1a\u66f4\u6e05\u6670\u3002',
  craftTags: '\u5de5\u827a\u6807\u7b7e',
  noCraftTags: '\u5f53\u524d\u4e0a\u4e0b\u6587\u6ca1\u6709\u5de5\u827a\u6807\u7b7e\u3002',
  accessoryTags: '\u914d\u4ef6\u6807\u7b7e',
  noAccessoryTags: '\u5f53\u524d\u4e0a\u4e0b\u6587\u6ca1\u6709\u914d\u4ef6\u6807\u7b7e\u3002',
  structure: '\u7ed3\u6784\u6458\u8981',
  matchedBy: '\u8bc6\u522b\u4f9d\u636e',
  defaultMatchedBy: '\u9ed8\u8ba4\u56de\u9000',
  liveSummary: '\u5b9e\u65f6\u6458\u8981',
  partsActive: '\u5f53\u524d\u90e8\u4ef6\uff1a',
  tryonReady: '\u8bd5\u7a7f\u5df2\u5c31\u7eea',
  noContext: '\u672a\u627e\u5230\u8bd5\u7a7f\u4e0a\u4e0b\u6587',
  noContextDesc: '\u8bf7\u5148\u4ece\u5546\u54c1\u8be6\u60c5\u9875\u8fdb\u5165\uff0c\u6216\u901a\u8fc7\u63a8\u8350\u5361\u7247\u5feb\u6377\u65b9\u5f0f\u751f\u6210\u8bd5\u7a7f\u4e0a\u4e0b\u6587\u3002',
  goHome: '\u8fd4\u56de\u9996\u9875',
  recentSession: '\u6700\u8fd1\u4e00\u6b21\u4f1a\u8bdd',
  productDetail: '\u5546\u54c1\u8be6\u60c5\u9875',
  recommendEntry: '\u63a8\u8350\u5165\u53e3',  defaultMaterial: '\u9ed8\u8ba4\u9762\u6599',
  materialPrefix: '\u9762\u6599',
  colorPrefix: '\u914d\u8272',
  fallbackSceneActive: '\u5f53\u524d\u4e3a\u9759\u6001\u964d\u7ea7\u9884\u89c8\u3002',
  initializingScene: 'Three.js \u573a\u666f\u521d\u59cb\u5316\u4e2d...',
  dragHintOutlineOn: '\u62d6\u62fd\u53ef\u65cb\u8f6c\uff0c\u6eda\u8f6e\u53ef\u7f29\u653e\uff1b\u5f53\u524d\u5df2\u5f00\u542f\u63cf\u8fb9\u5f3a\u5316\u670d\u88c5\u8f6e\u5ed3\u3002',
  dragHintOutlineOff: '\u62d6\u62fd\u53ef\u65cb\u8f6c\uff0c\u6eda\u8f6e\u53ef\u7f29\u653e\uff1b\u5f53\u524d\u672a\u5f00\u542f\u63cf\u8fb9\u3002',
  noSyncContext: '\u5f53\u524d\u6ca1\u6709\u53ef\u540c\u6b65\u7684\u8bd5\u7a7f\u4e0a\u4e0b\u6587\u3002',
  syncSuccess: '\u5df2\u540c\u6b65\u6700\u65b0\u8bd5\u7a7f\u53c2\u6570\u3002',
  noDefaultContext: '\u5f53\u524d\u6ca1\u6709\u53ef\u91cd\u7f6e\u7684\u9ed8\u8ba4\u8bd5\u7a7f\u4e0a\u4e0b\u6587\u3002',
  resetSuccess: '\u53c2\u6570\u5df2\u91cd\u7f6e\u4e3a\u5f53\u524d\u4e0a\u4e0b\u6587\u9ed8\u8ba4\u503c\u3002',
  initFailedShort: 'Three.js \u521d\u59cb\u5316\u5931\u8d25'
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function createEmptyProduct() {
  return {
    productId: null,
    productName: '',
    styleName: '',
    cover: '',
    source: 'detail',
    draftId: null
  }
}

function addOutlineToMesh(mesh, color) {
  if (!mesh || !mesh.geometry) return
  const edges = new THREE.EdgesGeometry(mesh.geometry, 24)
  const outline = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55, depthTest: false })
  )
  outline.renderOrder = 10
  mesh.add(outline)
}

function createMesh(geometry, material, outlineEnabled, outlineColor) {
  const mesh = new THREE.Mesh(geometry, material)
  if (outlineEnabled) addOutlineToMesh(mesh, outlineColor)
  return mesh
}

function buildBowAccent(material, outlineEnabled, outlineColor) {
  const group = new THREE.Group()
  const leftLoop = new THREE.Mesh(new THREE.SphereGeometry(0.12, 18, 18), material)
  leftLoop.scale.set(1.32, 0.62, 0.34)
  leftLoop.position.set(-0.12, 0, 0)
  const rightLoop = leftLoop.clone()
  rightLoop.position.x *= -1
  const knot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.06), material)
  const tailLeft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.03), material)
  tailLeft.position.set(-0.05, -0.18, 0)
  tailLeft.rotation.z = Math.PI / 10
  const tailRight = tailLeft.clone()
  tailRight.position.x *= -1
  tailRight.rotation.z *= -1
  group.add(leftLoop, rightLoop, knot, tailLeft, tailRight)
  if (outlineEnabled) {
    [leftLoop, rightLoop, knot, tailLeft, tailRight].forEach((item) => addOutlineToMesh(item, outlineColor))
  }
  return group
}

function buildSequinAccent(material, outlineEnabled, outlineColor) {
  const group = new THREE.Group()
  for (let index = 0; index < 8; index += 1) {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 12), material)
    dot.position.set((index - 3.5) * 0.09, Math.sin(index * 0.7) * 0.03, 0)
    if (outlineEnabled) addOutlineToMesh(dot, outlineColor)
    group.add(dot)
  }
  return group
}

export default {
  name: 'TryOnPage',
  data() {
    return {
      texts: TEXTS,
      baseUrl: '',
      defaultContext: null,
      product: createEmptyProduct(),
      bodyProfile: createFallbackBodyProfile(),
      bodyProfileOptions: [],
      selectedBodyProfileId: null,
      designConfig: normalizeDesignConfig({}),
      sceneState: {
        ready: false,
        failed: false,
        failedMessage: '',
        cameraView: 'front',
        outline: true
      },
      renderer: null,
      scene: null,
      camera: null,
      controls: null,
      frameId: 0,
      resizeHandler: null,
      mannequinGroup: null,
      garmentGroup: null
    }
  },
  computed: {
    hasContext() {
      return !!(this.product && this.product.productId)
    },
    isLoggedIn() {
      return !!localStorage.getItem('Token')
    },
    sizeOptions() {
      return TRYON_SIZE_OPTIONS
    },
    silhouetteOptions() {
      return TRYON_SILHOUETTE_OPTIONS
    },
    fitTypeOptions() {
      return TRYON_FIT_TYPE_OPTIONS
    },
    colorPresets() {
      return TRYON_COLOR_PRESETS
    },
    coverUrl() {
      const cover = this.product && this.product.cover
      if (!cover) return ''
      return /^https?:/i.test(cover) ? cover : `${this.baseUrl}${cover}`
    },
    contextSourceLabel() {
      if (!this.product) return this.texts.recentSession
      if (this.product.source === 'detail') return this.texts.productDetail
      if (this.product.source === 'recommend') return this.texts.recommendEntry
      return this.texts.recentSession
    },
    visualModel() {
      return buildTryonVisualModel({
        source: (this.product && this.product.source) || 'detail',
        product: this.product,
        designConfig: this.designConfig,
        bodyProfile: this.bodyProfile
      })
    },
    visualTags() {
      return Array.from(new Set([
        this.designConfig.materialName || this.texts.defaultMaterial,
        ...this.visualModel.badges,
        ...this.designConfig.accessoryTags.slice(0, 2)
      ].filter(Boolean)))
    },
    displayColorTheme() {
      return this.designConfig.colorTheme || this.texts.defaultTheme
    },
    designSummary() {
      const parts = [
        this.visualModel.preset.label,
        `${this.texts.size} ${this.designConfig.sizeCode}`,
        this.designConfig.silhouette,
        this.designConfig.fitType
      ]
      if (this.designConfig.materialName) parts.push(`${this.texts.materialPrefix} ${this.designConfig.materialName}`)
      if (this.designConfig.colorTheme) parts.push(`${this.texts.colorPrefix} ${this.designConfig.colorTheme}`)
      return parts.filter(Boolean).join(' / ')
    },
    sceneStatusText() {
      if (this.sceneState.failed) return this.texts.fallbackSceneActive
      if (!this.sceneState.ready) return this.texts.initializingScene
      return this.sceneState.outline ? this.texts.dragHintOutlineOn : this.texts.dragHintOutlineOff
    },
    fallbackBodyStyle() {
      return { background: `linear-gradient(180deg, ${this.visualModel.colors.primary} 0%, rgba(255,255,255,0.86) 100%)` }
    },
    outlineToggleLabel() {
      return this.sceneState.outline ? this.texts.outlineOn : this.texts.outlineOff
    },
    outlineActionLabel() {
      return this.sceneState.outline ? this.texts.outlineActionOn : this.texts.outlineActionOff
    },
    outlineStatusLabel() {
      return this.sceneState.outline ? this.texts.outlineEnabled : this.texts.outlineDisabled
    },
    partsSummary() {
      return this.visualModel.enabledPartLabels.join('\u3001')
    }
  },  watch: {
    '$route.fullPath'() {
      this.initializePage()
    },
    designConfig: {
      deep: true,
      handler() {
        if (!this.hasContext) return
        this.persistContext()
        this.updateSceneModel()
      }
    },
    'sceneState.outline'() {
      this.updateSceneModel()
    }
  },
  created() {
    this.baseUrl = this.$config.baseUrl
    this.initializePage()
  },
  beforeDestroy() {
    this.destroyScene()
  },
  methods: {
    async initializePage() {
      const context = loadTryonContext()
      if (!context) {
        this.destroyScene()
        this.resetViewModel()
        return
      }
      this.defaultContext = buildTryonContext(context)
      this.hydrateFromContext(context)
      await this.loadBodyProfiles()
      this.$nextTick(() => {
        this.initScene()
      })
    },
    resetViewModel() {
      this.defaultContext = null
      this.product = createEmptyProduct()
      this.bodyProfile = createFallbackBodyProfile()
      this.bodyProfileOptions = []
      this.selectedBodyProfileId = null
      this.designConfig = normalizeDesignConfig({})
      this.sceneState.failed = false
      this.sceneState.failedMessage = ''
      this.sceneState.ready = false
      this.sceneState.cameraView = 'front'
    },
    hydrateFromContext(context) {
      const normalized = buildTryonContext(context)
      this.product = {
        productId: normalized.productId,
        productName: normalized.productName,
        styleName: normalized.styleName,
        cover: normalized.cover,
        source: normalized.source,
        draftId: normalized.draftId || null
      }
      this.bodyProfile = normalizeBodyProfile(normalized.bodyProfileSnapshot || createFallbackBodyProfile())
      this.designConfig = normalizeDesignConfig(normalized.designConfig || {}, {
        sizeCode: this.bodyProfile.sizeCode || 'M'
      })
      this.selectedBodyProfileId = this.bodyProfile.id || null
      this.sceneState.failed = false
      this.sceneState.failedMessage = ''
    },
    async loadBodyProfiles() {
      const fallback = normalizeBodyProfile(this.bodyProfile || createFallbackBodyProfile())
      if (!this.isLoggedIn || !this.$proxy || !this.$proxy.Api) {
        this.bodyProfileOptions = [fallback]
        this.selectedBodyProfileId = fallback.id || 'fallback'
        this.bodyProfile = fallback
        return
      }
      try {
        const [pageRes, defaultRes] = await Promise.all([
          this.$proxy.Request({
            url: this.$proxy.Api.cosProfileBodyPage,
            method: 'get',
            showLoading: false,
            params: { page: 1, limit: 100 }
          }),
          this.$proxy.Request({
            url: this.$proxy.Api.cosProfileBodyDefault,
            method: 'get',
            showLoading: false
          })
        ])
        const rows = (pageRes && pageRes.code === 0 && pageRes.data && (pageRes.data.list || pageRes.data)) || []
        const list = (Array.isArray(rows) ? rows : []).map((item) => normalizeBodyProfile(item)).filter((item) => item && item.id)
        const merged = list.slice()
        if (fallback.id && !merged.some((item) => Number(item.id) === Number(fallback.id))) merged.unshift(fallback)
        if (!merged.length) merged.push(fallback)
        const defaultRow = defaultRes && defaultRes.code === 0 && defaultRes.data ? normalizeBodyProfile(defaultRes.data) : null
        const currentMatch = this.selectedBodyProfileId ? merged.find((item) => Number(item.id) === Number(this.selectedBodyProfileId)) : null
        const nextBody = currentMatch || defaultRow || merged.find((item) => Number(item.isDefault) === 1) || merged[0] || fallback
        this.bodyProfileOptions = merged
        this.selectedBodyProfileId = nextBody.id || fallback.id || 'fallback'
        this.bodyProfile = normalizeBodyProfile({ ...nextBody, sizeCode: this.designConfig.sizeCode || nextBody.sizeCode || 'M' })
      } catch (error) {
        this.bodyProfileOptions = [fallback]
        this.selectedBodyProfileId = fallback.id || 'fallback'
        this.bodyProfile = fallback
      }
    },
    bodyProfileLabel(item) {
      return `${item.profileName} 路 ${item.heightCm}cm / ${item.weightKg}kg`
    },
    handleBodyProfileChange() {
      const target = this.bodyProfileOptions.find((item) => String(item.id) === String(this.selectedBodyProfileId))
      if (!target) return
      this.bodyProfile = normalizeBodyProfile({ ...target, sizeCode: this.designConfig.sizeCode || target.sizeCode || 'M' })
      this.persistContext()
      this.updateSceneModel()
    },
    applyColorPreset(value) {
      this.designConfig.colorTheme = value
    },
    persistContext() {
      if (!this.hasContext) return null
      return saveTryonContext({
        source: this.product.source || 'detail',
        draftId: this.product.draftId || null,
        product: {
          productId: this.product.productId,
          productName: this.product.productName,
          styleName: this.product.styleName,
          cover: this.product.cover
        },
        designConfig: { ...this.designConfig },
        bodyProfile: { ...this.bodyProfile, sizeCode: this.designConfig.sizeCode || this.bodyProfile.sizeCode || 'M' }
      })
    },
    syncFromSession() {
      const latest = loadTryonContext()
      if (!latest) {
        this.$message.warning(this.texts.noSyncContext)
        return
      }
      this.defaultContext = buildTryonContext(latest)
      this.hydrateFromContext(latest)
      this.$nextTick(() => {
        this.initScene()
      })
      this.$message.success(this.texts.syncSuccess)
    },
    resetParameters() {
      if (!this.defaultContext) {
        this.$message.warning(this.texts.noDefaultContext)
        return
      }
      this.hydrateFromContext(this.defaultContext)
      this.persistContext()
      this.$nextTick(() => {
        if (this.scene) this.updateSceneModel()
        else this.initScene()
      })
      this.$message.success(this.texts.resetSuccess)
    },
    toggleOutline() {
      this.sceneState.outline = !this.sceneState.outline
    },
    buildSceneMetrics() {
      const body = this.bodyProfile || createFallbackBodyProfile()
      const design = this.designConfig || normalizeDesignConfig({})
      const modifiers = this.visualModel.modifiers || {}
      const sizeFactorMap = { S: 0.94, M: 1, L: 1.07, XL: 1.14 }
      const sizeFactor = sizeFactorMap[design.sizeCode] || 1
      const heightFactor = clamp(body.heightCm / 168, 0.86, 1.18)
      const shoulderSpan = clamp(body.shoulderCm / 38, 0.84, 1.22) * sizeFactor * clamp(modifiers.shoulderSpread || 1, 0.88, 1.34)
      const bustRadius = clamp(body.bustCm / 86, 0.82, 1.28) * 0.58 * sizeFactor
      const waistRadius = clamp(body.waistCm / 68, 0.78, 1.2) * 0.47 * sizeFactor
      const hipRadius = clamp(body.hipCm / 90, 0.84, 1.28) * 0.6 * sizeFactor
      return {
        sizeFactor,
        heightFactor,
        shoulderSpan,
        bustRadius,
        waistRadius,
        hipRadius,
        torsoHeight: 1.48 * heightFactor * clamp(modifiers.torsoLength || 1, 0.8, 1.4),
        skirtHeight: 0.92 * heightFactor * clamp(modifiers.skirtLength || 1, 0.58, 1.6),
        armLength: 1.12 * heightFactor * clamp(modifiers.sleeveLength || 1, 0.78, 1.4),
        legHeight: 1.74 * heightFactor,
        topEase: modifiers.topEase != null ? modifiers.topEase : 0.05,
        bottomEase: modifiers.bottomEase != null ? modifiers.bottomEase : 0.06,
        waistTaper: modifiers.waistTaper != null ? modifiers.waistTaper : 0.1,
        hemSpread: modifiers.hemSpread != null ? modifiers.hemSpread : 1.12,
        sleeveVolume: modifiers.sleeveVolume != null ? modifiers.sleeveVolume : 1,
        outerLayerDepth: modifiers.outerLayerDepth != null ? modifiers.outerLayerDepth : 1,
        segmented: !!modifiers.segmented,
        frontPanels: !!modifiers.frontPanels,
        overskirt: !!modifiers.overskirt,
        hasCape: !!modifiers.hasCape,
        contrastPanel: !!modifiers.contrastPanel,
        edgeTrim: !!modifiers.edgeTrim,
        hiddenFastener: !!modifiers.hiddenFastener,
        sequin: !!modifiers.sequin,
        garmentColor: this.visualModel.colors.primary,
        secondaryColor: this.visualModel.colors.secondary,
        trimColor: this.visualModel.colors.trim,
        metalColor: this.visualModel.colors.metal,
        outlineColor: this.visualModel.colors.outline
      }
    },    initScene() {
      if (!this.hasContext) return
      const viewport = this.$refs.stageViewport
      if (!viewport) return
      this.destroyScene()
      try {
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color('#eef3ff')
        this.scene.fog = new THREE.Fog('#eef3ff', 5, 13)
        this.camera = new THREE.PerspectiveCamera(38, viewport.clientWidth / Math.max(viewport.clientHeight, 1), 0.1, 100)
        this.camera.position.set(0, 1.84, 5.6)
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        this.renderer.setPixelRatio(window.devicePixelRatio || 1)
        this.renderer.setSize(viewport.clientWidth, Math.max(viewport.clientHeight, 1))
        this.renderer.outputColorSpace = THREE.SRGBColorSpace
        viewport.appendChild(this.renderer.domElement)
        const ambient = new THREE.AmbientLight('#ffffff', 1.85)
        const mainLight = new THREE.DirectionalLight('#ffffff', 1.28)
        mainLight.position.set(3.5, 4.2, 5.5)
        const fillLight = new THREE.DirectionalLight('#d8e3ff', 0.92)
        fillLight.position.set(-3.4, 2.7, 3.2)
        const rimLight = new THREE.DirectionalLight('#9db6ff', 0.82)
        rimLight.position.set(-4, 3, -2.4)
        this.scene.add(ambient, mainLight, fillLight, rimLight)
        const floor = new THREE.Mesh(
          new THREE.CircleGeometry(3.1, 64),
          new THREE.MeshStandardMaterial({ color: '#dbe5ff', transparent: true, opacity: 0.92 })
        )
        floor.rotation.x = -Math.PI / 2
        floor.position.y = -1.68
        this.scene.add(floor)
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.enableDamping = true
        this.controls.enablePan = false
        this.controls.minDistance = 3.4
        this.controls.maxDistance = 7.3
        this.controls.minPolarAngle = 0.9
        this.controls.maxPolarAngle = 2.18
        this.controls.target.set(0, 1.04, 0)
        this.controls.update()
        this.updateSceneModel()
        this.resizeHandler = () => this.handleResize()
        window.addEventListener('resize', this.resizeHandler)
        this.sceneState.ready = true
        this.sceneState.failed = false
        this.sceneState.failedMessage = ''
        this.animate()
      } catch (error) {
        this.destroyScene()
        this.sceneState.failed = true
        this.sceneState.ready = false
        this.sceneState.failedMessage = error && error.message ? error.message : this.texts.initFailedShort
      }
    },
    updateSceneModel() {
      if (!this.scene || !this.renderer) return
      const metrics = this.buildSceneMetrics()
      const outlineEnabled = this.sceneState.outline
      this.clearGroup(this.mannequinGroup)
      this.clearGroup(this.garmentGroup)
      const skinMaterial = new THREE.MeshStandardMaterial({ color: '#ead6ca', roughness: 0.92, metalness: 0.02 })
      const bodyMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.98, metalness: 0.02, transparent: true, opacity: 0.34 })
      const garmentMaterial = new THREE.MeshStandardMaterial({ color: metrics.garmentColor, roughness: 0.5, metalness: 0.08, side: THREE.DoubleSide })
      const secondaryMaterial = new THREE.MeshStandardMaterial({ color: metrics.secondaryColor, roughness: 0.46, metalness: 0.06, side: THREE.DoubleSide })
      const trimMaterial = new THREE.MeshStandardMaterial({ color: metrics.trimColor, roughness: 0.24, metalness: 0.2, side: THREE.DoubleSide })
      const metalMaterial = new THREE.MeshStandardMaterial({ color: metrics.metalColor, roughness: 0.22, metalness: 0.8 })
      const sheerMaterial = new THREE.MeshStandardMaterial({ color: metrics.secondaryColor, roughness: 0.6, metalness: 0.04, transparent: true, opacity: 0.54, side: THREE.DoubleSide })
      const mannequin = new THREE.Group()
      const torso = new THREE.Mesh(new THREE.CapsuleGeometry(metrics.bustRadius * 0.38, Math.max(metrics.torsoHeight * 0.48, 0.62), 8, 18), bodyMaterial)
      torso.position.set(0, 0.82, 0)
      torso.scale.set(1, 1, 0.9)
      mannequin.add(torso)
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.28 * metrics.sizeFactor, 24, 24), skinMaterial)
      head.position.set(0, 1.88 * metrics.heightFactor, 0)
      mannequin.add(head)
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.18, 16), skinMaterial)
      neck.position.set(0, 1.56, 0)
      mannequin.add(neck)
      const leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.1 * metrics.sizeFactor, metrics.armLength * 0.48, 8, 16), skinMaterial)
      leftArm.position.set(-(metrics.shoulderSpan * 0.76), 0.88, 0)
      leftArm.rotation.z = Math.PI / 7
      const rightArm = leftArm.clone()
      rightArm.position.x *= -1
      rightArm.rotation.z *= -1
      mannequin.add(leftArm, rightArm)
      const leftLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.12 * metrics.sizeFactor, metrics.legHeight * 0.52, 8, 16), skinMaterial)
      leftLeg.position.set(-0.18 * metrics.sizeFactor, -0.82, 0)
      const rightLeg = leftLeg.clone()
      rightLeg.position.x *= -1
      mannequin.add(leftLeg, rightLeg)
      const shoulderCore = new THREE.Mesh(new THREE.CylinderGeometry(metrics.shoulderSpan * 0.52, metrics.bustRadius * 0.86, 0.16, 24), trimMaterial)
      shoulderCore.rotation.z = Math.PI / 2
      shoulderCore.position.set(0, 1.42, 0)
      mannequin.add(shoulderCore)
      const garment = new THREE.Group()
      const torsoTopRadius = Math.max(metrics.bustRadius * (1 + metrics.topEase), 0.42)
      const torsoBottomRadius = Math.max(metrics.waistRadius * (1 + metrics.topEase * 0.62 - metrics.waistTaper * 0.34), torsoTopRadius * 0.56)
      const hemTopRadius = metrics.segmented ? torsoBottomRadius * 1.02 : torsoBottomRadius * 0.98
      const hemBottomRadius = Math.max(metrics.hipRadius * metrics.hemSpread * (1 + metrics.bottomEase), hemTopRadius * 1.04)
      const torsoHeight = metrics.segmented ? metrics.torsoHeight * 0.68 : metrics.torsoHeight * 0.82
      const skirtHeight = metrics.skirtHeight
      const outerDepth = 0.04 * metrics.outerLayerDepth
      const torsoShell = createMesh(new THREE.CylinderGeometry(torsoTopRadius, torsoBottomRadius, torsoHeight, 36, 1, true), garmentMaterial, outlineEnabled, metrics.outlineColor)
      torsoShell.position.set(0, 0.98, 0)
      garment.add(torsoShell)
      if (metrics.segmented) {
        const topPanel = createMesh(new THREE.CylinderGeometry(torsoTopRadius * 0.98, torsoBottomRadius * 0.92, metrics.torsoHeight * 0.34, 34, 1, true), secondaryMaterial, outlineEnabled, metrics.outlineColor)
        topPanel.position.set(0, 1.16, outerDepth * 0.6)
        garment.add(topPanel)
      }
      const skirtMaterial = metrics.segmented ? secondaryMaterial : garmentMaterial
      const skirtOrHem = createMesh(new THREE.CylinderGeometry(hemTopRadius, hemBottomRadius, skirtHeight, 42, 1, true), skirtMaterial, outlineEnabled, metrics.outlineColor)
      skirtOrHem.position.set(0, 0.08, 0)
      garment.add(skirtOrHem)
      const collar = createMesh(new THREE.TorusGeometry(torsoTopRadius * 0.46, 0.034, 12, 28), trimMaterial, outlineEnabled, metrics.outlineColor)
      collar.rotation.x = Math.PI / 2
      collar.position.set(0, 1.48, 0.04)
      garment.add(collar)
      const shoulderTrim = createMesh(new THREE.CylinderGeometry(metrics.shoulderSpan * 0.54, torsoTopRadius * 0.92, 0.11, 28), secondaryMaterial, outlineEnabled, metrics.outlineColor)
      shoulderTrim.rotation.z = Math.PI / 2
      shoulderTrim.position.set(0, 1.38, 0)
      garment.add(shoulderTrim)
      const sleeveTop = 0.18 * metrics.sizeFactor * metrics.sleeveVolume
      const sleeveBottom = 0.115 * metrics.sizeFactor * Math.max(metrics.sleeveVolume * 0.92, 0.88)
      const sleeveLength = Math.max(metrics.armLength * 0.78, 0.72)
      const leftSleeve = createMesh(new THREE.CylinderGeometry(sleeveTop, sleeveBottom, sleeveLength, 22, 1, true), garmentMaterial, outlineEnabled, metrics.outlineColor)
      leftSleeve.position.set(-(metrics.shoulderSpan * 0.82), 0.98, 0)
      leftSleeve.rotation.z = Math.PI / 2.85
      leftSleeve.rotation.y = Math.PI / 18
      const rightSleeve = leftSleeve.clone()
      rightSleeve.position.x *= -1
      rightSleeve.rotation.z *= -1
      rightSleeve.rotation.y *= -1
      garment.add(leftSleeve, rightSleeve)
      if (metrics.frontPanels) {
        const panelGeometry = new THREE.BoxGeometry(torsoTopRadius * 0.42, torsoHeight * 0.86, 0.08 * metrics.outerLayerDepth)
        const leftPanel = createMesh(panelGeometry, secondaryMaterial, outlineEnabled, metrics.outlineColor)
        leftPanel.position.set(-(torsoTopRadius * 0.24), 0.96, torsoTopRadius * 0.72)
        leftPanel.rotation.z = Math.PI / 34
        const rightPanel = leftPanel.clone()
        rightPanel.position.x *= -1
        rightPanel.rotation.z *= -1
        garment.add(leftPanel, rightPanel)
      }
      if (metrics.overskirt) {
        const overskirt = createMesh(new THREE.CylinderGeometry(hemTopRadius * 1.04, hemBottomRadius * 1.15, skirtHeight * 0.82, 42, 1, true), sheerMaterial, outlineEnabled, metrics.outlineColor)
        overskirt.position.set(0, -0.02, 0)
        garment.add(overskirt)
      }
      if (metrics.hasCape) {
        const capeMesh = createMesh(new THREE.CylinderGeometry(metrics.shoulderSpan * 0.74, hemBottomRadius * 1.08, skirtHeight * 1.04, 42, 1, true, Math.PI * 0.12, Math.PI * 0.76), sheerMaterial, outlineEnabled, metrics.outlineColor)
        capeMesh.position.set(0, 0.56, -outerDepth)
        capeMesh.rotation.y = Math.PI
        garment.add(capeMesh)
      }
      if (this.visualModel.accessories.belt) {
        const beltRing = createMesh(new THREE.TorusGeometry(metrics.waistRadius * 1.08, 0.04, 10, 30), trimMaterial, outlineEnabled, metrics.outlineColor)
        beltRing.rotation.x = Math.PI / 2
        beltRing.position.set(0, 0.62, 0.02)
        garment.add(beltRing)
      }
      if (this.visualModel.accessories.armPatch) {
        const armPatch = createMesh(new THREE.BoxGeometry(0.18, 0.16, 0.03), trimMaterial, outlineEnabled, metrics.outlineColor)
        armPatch.position.set(-(metrics.shoulderSpan * 0.95), 1.02, sleeveTop * 0.9)
        armPatch.rotation.z = Math.PI / 2.85
        garment.add(armPatch)
      }
      if (this.visualModel.accessories.bow) {
        const bowMesh = buildBowAccent(trimMaterial, outlineEnabled, metrics.outlineColor)
        bowMesh.position.set(0, this.visualModel.accessories.belt ? 0.62 : 1.02, torsoTopRadius * 0.96)
        garment.add(bowMesh)
      }
      if (this.visualModel.accessories.metalNodes) {
        [1.16, 0.94, 0.72].forEach((height) => {
          const metalNode = createMesh(new THREE.SphereGeometry(0.045, 14, 14), metalMaterial, outlineEnabled, metrics.outlineColor)
          metalNode.position.set(0, height, torsoTopRadius * 0.94)
          garment.add(metalNode)
        })
      }
      if (this.visualModel.accessories.detachable) {
        const detachableTag = createMesh(new THREE.BoxGeometry(0.12, 0.18, 0.02), trimMaterial, outlineEnabled, metrics.outlineColor)
        detachableTag.position.set(hemBottomRadius * 0.42, -0.28, hemBottomRadius * 0.82)
        detachableTag.rotation.z = -Math.PI / 9
        garment.add(detachableTag)
      }
      if (metrics.contrastPanel) {
        const contrastPanel = createMesh(new THREE.BoxGeometry(torsoTopRadius * 0.44, torsoHeight * 0.68, 0.03), secondaryMaterial, outlineEnabled, metrics.outlineColor)
        contrastPanel.position.set(0, 0.98, torsoTopRadius * 0.98)
        garment.add(contrastPanel)
      }
      if (metrics.edgeTrim) {
        const hemTrim = createMesh(new THREE.TorusGeometry(hemBottomRadius * 1.01, 0.025, 12, 42), trimMaterial, outlineEnabled, metrics.outlineColor)
        hemTrim.rotation.x = Math.PI / 2
        hemTrim.position.set(0, -skirtHeight * 0.5 + 0.08, 0)
        garment.add(hemTrim)
      }
      if (metrics.hiddenFastener) {
        const zipper = createMesh(new THREE.BoxGeometry(0.04, torsoHeight * 0.72, 0.02), metalMaterial, outlineEnabled, metrics.outlineColor)
        zipper.position.set(0, 0.98, torsoTopRadius * 0.99)
        garment.add(zipper)
      }
      if (metrics.sequin) {
        const sequinAccent = buildSequinAccent(trimMaterial, outlineEnabled, metrics.outlineColor)
        sequinAccent.position.set(0, 1.2, torsoTopRadius * 1.02)
        garment.add(sequinAccent)
      }
      mannequin.position.y = 0.16
      garment.position.y = 0.18
      this.mannequinGroup = mannequin
      this.garmentGroup = garment
      this.scene.add(mannequin, garment)
      this.renderer.render(this.scene, this.camera)
    },
    animate() {
      if (!this.renderer || !this.scene || !this.camera) return
      this.frameId = window.requestAnimationFrame(() => this.animate())
      if (this.controls) this.controls.update()
      this.renderer.render(this.scene, this.camera)
    },
    handleResize() {
      if (!this.renderer || !this.camera || !this.$refs.stageViewport) return
      const viewport = this.$refs.stageViewport
      this.camera.aspect = viewport.clientWidth / Math.max(viewport.clientHeight, 1)
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(viewport.clientWidth, Math.max(viewport.clientHeight, 1))
    },
    setCameraView(mode) {
      this.sceneState.cameraView = mode
      if (!this.camera || !this.controls) return
      const next = mode === 'side' ? { x: 4.85, z: 0.92 } : { x: 0, z: 5.6 }
      this.camera.position.set(next.x, 1.84, next.z)
      this.controls.target.set(0, 1.04, 0)
      this.controls.update()
    },
    resetCamera() {
      this.setCameraView(this.sceneState.cameraView || 'front')
    },
    clearGroup(group) {
      if (!group) return
      group.traverse((node) => {
        if (node.geometry) node.geometry.dispose()
        if (node.material) {
          if (Array.isArray(node.material)) node.material.forEach((item) => item && item.dispose && item.dispose())
          else if (node.material.dispose) node.material.dispose()
        }
      })
      if (group.parent) group.parent.remove(group)
    },
    destroyScene() {
      if (this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler)
        this.resizeHandler = null
      }
      if (this.frameId) {
        window.cancelAnimationFrame(this.frameId)
        this.frameId = 0
      }
      if (this.controls) {
        this.controls.dispose()
        this.controls = null
      }
      this.clearGroup(this.mannequinGroup)
      this.clearGroup(this.garmentGroup)
      this.mannequinGroup = null
      this.garmentGroup = null
      if (this.renderer) {
        this.renderer.dispose()
        if (this.renderer.domElement && this.renderer.domElement.parentNode) this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
        this.renderer = null
      }
      this.camera = null
      this.scene = null
      this.sceneState.ready = false
    },
    openDetail() {
      if (!this.hasContext) return
      this.$router.push({ path: '/index/remaicosfuDetail', query: { id: this.product.productId } })
    },
    goBrowse() {
      this.$router.push('/index/browse')
    }
  }
}
</script><style scoped>
.tryon-page {
  --tryon-ink: #24324a;
  --tryon-muted: #6d7996;
  --tryon-card: rgba(255, 255, 255, 0.94);
  --tryon-border: rgba(105, 129, 212, 0.18);
  display: grid;
  gap: 16px;
}
.panel-card {
  border-radius: 24px;
  border: 1px solid var(--tryon-border);
  background: var(--tryon-card);
  box-shadow: 0 22px 44px rgba(84, 104, 181, 0.08);
}
.tryon-hero {
  padding: 24px 26px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.hero-copy { display: grid; gap: 8px; max-width: 760px; }
.eyebrow {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(91, 110, 245, 0.1);
  color: #5166db;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.hero-copy h2,
.section-head h3,
.live-summary h4,
.structure-card h4,
.empty-copy h3,
.fallback-card h4 { margin: 0; color: var(--tryon-ink); }
.hero-copy p,
.section-head p,
.empty-copy p,
.fallback-card p,
.live-summary p,
.structure-card p { margin: 0; color: var(--tryon-muted); line-height: 1.7; }
.hero-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; }
.tryon-grid { display: grid; grid-template-columns: minmax(280px, 320px) minmax(420px, 1fr) minmax(300px, 360px); gap: 16px; align-items: start; }
.side-card,
.stage-card { padding: 22px; }
.summary-card,
.control-card,
.stage-card { display: grid; gap: 16px; }
.section-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.product-cover { border-radius: 20px; overflow: hidden; min-height: 220px; background: linear-gradient(180deg, #eff4ff 0%, #f8faff 100%); }
.product-cover img { width: 100%; height: 100%; min-height: 220px; object-fit: cover; }
.cover-fallback { min-height: 220px; display: flex; align-items: center; justify-content: center; padding: 24px; text-align: center; color: var(--tryon-ink); font-weight: 700; }
.summary-list,
.control-stack,
.body-metrics,
.badge-group,
.tag-wrap,
.empty-actions,
.stage-actions,
.preset-row,
.control-actions,
.structure-parts { display: flex; flex-wrap: wrap; gap: 10px; }
.summary-list,
.control-stack,
.structure-meta { display: grid; gap: 10px; }
.summary-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px; border-radius: 14px; background: rgba(240, 244, 255, 0.75); }
.summary-row span { color: var(--tryon-muted); }
.summary-row strong { color: var(--tryon-ink); text-align: right; word-break: break-word; }
.metric-chip,
.info-badge,
.tag-chip,
.status-pill { padding: 8px 12px; border-radius: 999px; background: rgba(91, 110, 245, 0.1); color: #4b5fd4; font-size: 13px; }
.info-badge { background: rgba(34, 197, 94, 0.12); color: #167d45; }
.tag-chip.secondary { background: rgba(255, 166, 84, 0.14); color: #b05b10; }
.structure-chip { background: rgba(102, 126, 234, 0.12); color: #4758c5; }
.status-pill { background: rgba(148, 163, 184, 0.16); color: #556174; }
.status-pill.active { background: rgba(34, 197, 94, 0.12); color: #167d45; }
.stage-head { align-items: flex-start; }
.stage-shell { min-height: 620px; border-radius: 24px; overflow: hidden; background: radial-gradient(circle at top, rgba(164, 184, 255, 0.24), transparent 40%), linear-gradient(180deg, #f4f7ff 0%, #eef3ff 100%); }
.stage-viewport,
.scene-fallback { width: 100%; min-height: 620px; height: 100%; }
.scene-fallback { display: flex; align-items: center; justify-content: center; padding: 24px; }
.fallback-card { width: min(420px, 100%); padding: 24px; border-radius: 24px; background: rgba(255, 255, 255, 0.88); box-shadow: 0 18px 36px rgba(84, 104, 181, 0.1); display: grid; gap: 14px; }
.fallback-figure { margin: 0 auto; width: 160px; display: grid; justify-items: center; gap: 10px; }
.fallback-head { width: 54px; height: 54px; border-radius: 50%; background: #ead6ca; }
.fallback-body { width: 120px; height: 180px; border-radius: 52px 52px 30px 30px; box-shadow: inset 0 -12px 30px rgba(255, 255, 255, 0.38); }
.control-stack { display: grid; gap: 14px; }
.control-block { display: grid; gap: 8px; }
.control-block label { color: var(--tryon-ink); font-weight: 600; }
.two-col { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.field-tip { color: var(--tryon-muted); font-size: 13px; line-height: 1.6; }
.preset-swatch { width: 28px; height: 28px; border: none; border-radius: 50%; box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.82), 0 4px 10px rgba(38, 50, 74, 0.12); cursor: pointer; }
.scene-tools { padding: 16px; border-radius: 18px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(59, 130, 246, 0.05)); }
.scene-helper-row { display: grid; gap: 8px; }
.control-actions { justify-content: flex-start; }
.structure-card,
.live-summary { padding: 18px; border-radius: 18px; background: linear-gradient(135deg, rgba(91, 110, 245, 0.1), rgba(59, 130, 246, 0.06)); }
.structure-card { gap: 12px; }
.structure-meta { display: grid; gap: 10px; }
.empty-panel { padding: 42px 32px; display: grid; gap: 16px; }
.empty-copy { max-width: 760px; display: grid; gap: 10px; }
@media (max-width: 1280px) {
  .tryon-grid { grid-template-columns: 1fr; }
  .stage-shell, .stage-viewport, .scene-fallback { min-height: 520px; }
}
@media (max-width: 768px) {
  .tryon-hero { padding: 20px; display: grid; }
  .hero-actions { justify-content: flex-start; }
  .side-card, .stage-card, .empty-panel { padding: 18px; }
  .two-col { grid-template-columns: 1fr; }
  .stage-shell, .stage-viewport, .scene-fallback { min-height: 420px; }
}
</style>