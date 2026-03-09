<template>
  <div class="tryon-page">
    <section class="tryon-hero panel-card">
      <div class="hero-copy">
        <span class="eyebrow">3D TRY-ON MVP</span>
        <h2>Parametric Preview</h2>
        <p>Lightweight mannequin and garment shell help users validate silhouette, ease, main color and body proportions before ordering.</p>
      </div>
      <div class="hero-actions">
        <el-button type="primary" icon="el-icon-refresh-right" @click="syncFromSession">Sync Current Config</el-button>
        <el-button icon="el-icon-back" :disabled="!hasContext" @click="openDetail">Back To Detail</el-button>
        <el-button icon="el-icon-picture-outline-round" @click="goBrowse">Browse Styles</el-button>
      </div>
    </section>

    <section v-if="hasContext" class="tryon-grid">
      <aside class="panel-card side-card summary-card">
        <div class="section-head">
          <div>
            <h3>Product Summary</h3>
            <p>Source: {{ contextSourceLabel }}</p>
          </div>
        </div>

        <div class="product-cover">
          <img v-if="coverUrl" :src="coverUrl" :alt="product.productName">
          <div v-else class="cover-fallback">{{ product.productName }}</div>
        </div>

        <div class="summary-list">
          <div class="summary-row"><span>Product</span><strong>{{ product.productName }}</strong></div>
          <div class="summary-row"><span>Style</span><strong>{{ product.styleName || '-' }}</strong></div>
          <div class="summary-row"><span>Size</span><strong>{{ designConfig.sizeCode }}</strong></div>
          <div class="summary-row"><span>Silhouette</span><strong>{{ designConfig.silhouette }}</strong></div>
          <div class="summary-row"><span>Fit</span><strong>{{ designConfig.fitType }}</strong></div>
          <div class="summary-row"><span>Color</span><strong>{{ designConfig.colorTheme || 'Default theme' }}</strong></div>
          <div class="summary-row"><span>Body Profile</span><strong>{{ bodyProfile.profileName }}</strong></div>
        </div>

        <div class="body-metrics">
          <div class="metric-chip">Height {{ bodyProfile.heightCm }} cm</div>
          <div class="metric-chip">Shoulder {{ bodyProfile.shoulderCm }} cm</div>
          <div class="metric-chip">Bust {{ bodyProfile.bustCm }} cm</div>
          <div class="metric-chip">Waist {{ bodyProfile.waistCm }} cm</div>
          <div class="metric-chip">Hip {{ bodyProfile.hipCm }} cm</div>
        </div>

        <div class="badge-group">
          <span v-for="item in visualTags" :key="item" class="info-badge">{{ item }}</span>
        </div>
      </aside>

      <section class="panel-card stage-card">
        <div class="section-head stage-head">
          <div>
            <h3>3D View</h3>
            <p>{{ sceneStatusText }}</p>
          </div>
          <div class="stage-actions">
            <el-button size="mini" @click="setCameraView('front')">Front</el-button>
            <el-button size="mini" @click="setCameraView('side')">Side</el-button>
            <el-button size="mini" @click="resetCamera">Reset</el-button>
          </div>
        </div>

        <div class="stage-shell">
          <div v-if="sceneState.failed" class="scene-fallback">
            <div class="fallback-card">
              <h4>3D Init Failed</h4>
              <p>{{ sceneState.failedMessage || 'Three.js initialization failed, fallback preview is shown.' }}</p>
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
            <h3>Controls</h3>
            <p>Changing inputs updates both the summary card and the live scene.</p>
          </div>
        </div>

        <div class="control-stack">
          <div class="control-block">
            <label>Body Profile</label>
            <el-select v-model="selectedBodyProfileId" placeholder="Select body profile" style="width: 100%" @change="handleBodyProfileChange">
              <el-option v-for="item in bodyProfileOptions" :key="item.id || item.profileName" :label="bodyProfileLabel(item)" :value="item.id" />
            </el-select>
            <div v-if="!isLoggedIn" class="field-tip">No profile found. A fallback body profile is used.</div>
          </div>

          <div class="control-block two-col">
            <div>
              <label>Size</label>
              <el-select v-model="designConfig.sizeCode" style="width: 100%">
                <el-option v-for="item in sizeOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </div>
            <div>
              <label>Material</label>
              <el-input v-model="designConfig.materialName" placeholder="e.g. cotton, chiffon, stretch" />
            </div>
          </div>

          <div class="control-block two-col">
            <div>
              <label>Silhouette</label>
              <el-select v-model="designConfig.silhouette" style="width: 100%">
                <el-option v-for="item in silhouetteOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </div>
            <div>
              <label>Fit</label>
              <el-select v-model="designConfig.fitType" style="width: 100%">
                <el-option v-for="item in fitTypeOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </div>
          </div>

          <div class="control-block">
            <label>Color Theme</label>
            <el-input v-model="designConfig.colorTheme" placeholder="Use color name or #HEX" />
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

          <div class="control-block">
            <label>Craft Tags</label>
            <div v-if="designConfig.craftTags.length" class="tag-wrap">
              <span v-for="item in designConfig.craftTags" :key="`craft-${item}`" class="tag-chip">{{ item }}</span>
            </div>
            <div v-else class="field-tip">No craft tag is attached in this MVP.</div>
          </div>

          <div class="control-block">
            <label>Accessory Tags</label>
            <div v-if="designConfig.accessoryTags.length" class="tag-wrap">
              <span v-for="item in designConfig.accessoryTags" :key="`accessory-${item}`" class="tag-chip secondary">{{ item }}</span>
            </div>
            <div v-else class="field-tip">Accessory tags are shown as badges only in this MVP.</div>
          </div>

          <div class="control-block live-summary">
            <span class="eyebrow">LIVE SUMMARY</span>
            <h4>{{ product.productName }}</h4>
            <p>{{ designSummary }}</p>
          </div>
        </div>
      </aside>
    </section>

    <section v-else class="panel-card empty-panel">
      <div class="empty-copy">
        <span class="eyebrow">TRY-ON READY</span>
        <h3>No try-on context found</h3>
        <p>Open a product detail page or use a recommend card shortcut to build a try-on context first.</p>
      </div>
      <div class="empty-actions">
        <el-button type="primary" @click="goBrowse">Browse Styles</el-button>
        <el-button @click="$router.push('/index/home')">Go Home</el-button>
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
  createFallbackBodyProfile,
  loadTryonContext,
  normalizeBodyProfile,
  normalizeDesignConfig,
  resolveTryonColor,
  saveTryonContext
} from '@/utils/Tryon'

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export default {
  name: 'TryOnPage',
  data() {
    return {
      baseUrl: '',
      product: {
        productId: null,
        productName: '',
        styleName: '',
        cover: '',
        source: 'detail',
        draftId: null
      },
      bodyProfile: createFallbackBodyProfile(),
      bodyProfileOptions: [],
      selectedBodyProfileId: null,
      designConfig: normalizeDesignConfig({}),
      sceneState: {
        ready: false,
        failed: false,
        failedMessage: '',
        cameraView: 'front'
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
      if (!this.product) return 'Recent Session'
      if (this.product.source === 'detail') return 'Product Detail'
      if (this.product.source === 'recommend') return 'Recommend Entry'
      return 'Recent Session'
    },
    visualTags() {
      return [
        this.designConfig.materialName || 'Default Material',
        ...this.designConfig.craftTags.slice(0, 2),
        ...this.designConfig.accessoryTags.slice(0, 2)
      ].filter(Boolean)
    },
    designSummary() {
      const parts = [
        `Size ${this.designConfig.sizeCode}`,
        this.designConfig.silhouette,
        this.designConfig.fitType
      ]
      if (this.designConfig.materialName) parts.push(`Material ${this.designConfig.materialName}`)
      if (this.designConfig.colorTheme) parts.push(`Color ${this.designConfig.colorTheme}`)
      return parts.filter(Boolean).join(' / ')
    },
    sceneStatusText() {
      if (this.sceneState.failed) return 'Fallback preview is active.'
      if (!this.sceneState.ready) return 'Initializing Three.js scene...'
      return 'Drag to rotate, wheel to zoom. Camera range is constrained.'
    },
    fallbackBodyStyle() {
      return {
        background: `linear-gradient(180deg, ${resolveTryonColor(this.designConfig.colorTheme)} 0%, rgba(255,255,255,0.85) 100%)`
      }
    }
  },
  watch: {
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
      this.hydrateFromContext(context)
      await this.loadBodyProfiles()
      this.$nextTick(() => {
        this.initScene()
      })
    },
    resetViewModel() {
      this.product = {
        productId: null,
        productName: '',
        styleName: '',
        cover: '',
        source: 'detail',
        draftId: null
      }
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
        if (fallback.id && !merged.some((item) => Number(item.id) === Number(fallback.id))) {
          merged.unshift(fallback)
        }
        if (!merged.length) {
          merged.push(fallback)
        }
        const defaultRow = defaultRes && defaultRes.code === 0 && defaultRes.data ? normalizeBodyProfile(defaultRes.data) : null
        const currentMatch = this.selectedBodyProfileId ? merged.find((item) => Number(item.id) === Number(this.selectedBodyProfileId)) : null
        const nextBody = currentMatch || defaultRow || merged.find((item) => Number(item.isDefault) === 1) || merged[0] || fallback
        this.bodyProfileOptions = merged
        this.selectedBodyProfileId = nextBody.id || fallback.id || 'fallback'
        this.bodyProfile = normalizeBodyProfile(nextBody)
      } catch (error) {
        this.bodyProfileOptions = [fallback]
        this.selectedBodyProfileId = fallback.id || 'fallback'
        this.bodyProfile = fallback
      }
    },
    bodyProfileLabel(item) {
      return `${item.profileName} · ${item.heightCm}cm / ${item.weightKg}kg`
    },
    handleBodyProfileChange() {
      const target = this.bodyProfileOptions.find((item) => String(item.id) === String(this.selectedBodyProfileId))
      if (!target) return
      this.bodyProfile = normalizeBodyProfile({
        ...target,
        sizeCode: this.designConfig.sizeCode || target.sizeCode || 'M'
      })
      this.persistContext()
      this.updateSceneModel()
    },
    applyColorPreset(value) {
      this.designConfig.colorTheme = value
    },
    persistContext() {
      if (!this.hasContext) return
      saveTryonContext({
        source: this.product.source || 'detail',
        draftId: this.product.draftId || null,
        product: {
          productId: this.product.productId,
          productName: this.product.productName,
          styleName: this.product.styleName,
          cover: this.product.cover
        },
        designConfig: { ...this.designConfig },
        bodyProfile: {
          ...this.bodyProfile,
          sizeCode: this.designConfig.sizeCode || this.bodyProfile.sizeCode || 'M'
        }
      })
    },
    syncFromSession() {
      const latest = loadTryonContext()
      if (!latest) {
        this.$message.warning('No try-on context is available to sync.')
        return
      }
      this.hydrateFromContext(latest)
      this.$nextTick(() => {
        this.initScene()
      })
      this.$message.success('Latest config synced.')
    },
    buildSceneMetrics() {
      const body = this.bodyProfile || createFallbackBodyProfile()
      const design = this.designConfig || normalizeDesignConfig({})
      const sizeFactorMap = { S: 0.94, M: 1, L: 1.06, XL: 1.12 }
      const fitMap = { '\u5e38\u89c4': 0.12, '\u5bbd\u677e': 0.22, '\u5f39\u529b': 0.08, '\u821e\u53f0\u53cb\u597d': 0.26 }
      const silhouetteMap = { '\u4fee\u8eab': 0.92, '\u5e38\u89c4': 1, '\u5bbd\u677e': 1.12, '\u4f1e\u6446': 1.2, '\u76f4\u7b52': 1.04 }
      const sizeFactor = sizeFactorMap[design.sizeCode] || 1
      const heightFactor = clamp(body.heightCm / 168, 0.86, 1.18)
      const shoulderWidth = clamp(body.shoulderCm / 38, 0.84, 1.22) * sizeFactor
      const bustWidth = clamp(body.bustCm / 86, 0.82, 1.28) * sizeFactor
      const waistWidth = clamp(body.waistCm / 68, 0.76, 1.2) * sizeFactor
      const hipWidth = clamp(body.hipCm / 90, 0.82, 1.26) * sizeFactor
      return {
        sizeFactor,
        heightFactor,
        shoulderWidth,
        bustWidth,
        waistWidth,
        hipWidth,
        torsoHeight: 1.56 * heightFactor,
        armLength: 1.18 * heightFactor,
        legHeight: 1.74 * heightFactor,
        fitOffset: fitMap[design.fitType] != null ? fitMap[design.fitType] : 0.12,
        silhouetteFactor: silhouetteMap[design.silhouette] != null ? silhouetteMap[design.silhouette] : 1,
        garmentColor: resolveTryonColor(design.colorTheme)
      }
    },
    initScene() {
      if (!this.hasContext) return
      const viewport = this.$refs.stageViewport
      if (!viewport) return
      this.destroyScene()
      try {
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color('#eef3ff')
        this.scene.fog = new THREE.Fog('#eef3ff', 5, 13)

        this.camera = new THREE.PerspectiveCamera(38, viewport.clientWidth / Math.max(viewport.clientHeight, 1), 0.1, 100)
        this.camera.position.set(0, 1.82, 5.6)

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        this.renderer.setPixelRatio(window.devicePixelRatio || 1)
        this.renderer.setSize(viewport.clientWidth, Math.max(viewport.clientHeight, 1))
        this.renderer.outputColorSpace = THREE.SRGBColorSpace
        viewport.appendChild(this.renderer.domElement)

        const ambient = new THREE.AmbientLight('#ffffff', 1.7)
        const mainLight = new THREE.DirectionalLight('#ffffff', 1.35)
        mainLight.position.set(3.5, 4.2, 5.5)
        const rimLight = new THREE.DirectionalLight('#9db6ff', 0.78)
        rimLight.position.set(-4, 3, -2)
        this.scene.add(ambient, mainLight, rimLight)

        const floor = new THREE.Mesh(
          new THREE.CircleGeometry(2.9, 64),
          new THREE.MeshStandardMaterial({ color: '#dbe5ff', transparent: true, opacity: 0.92 })
        )
        floor.rotation.x = -Math.PI / 2
        floor.position.y = -1.68
        this.scene.add(floor)

        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.enableDamping = true
        this.controls.enablePan = false
        this.controls.minDistance = 3.4
        this.controls.maxDistance = 7.2
        this.controls.minPolarAngle = 0.9
        this.controls.maxPolarAngle = 2.2
        this.controls.target.set(0, 1.05, 0)
        this.controls.update()

        this.updateSceneModel()
        this.resizeHandler = this.handleResize
        window.addEventListener('resize', this.resizeHandler)
        this.sceneState.ready = true
        this.sceneState.failed = false
        this.sceneState.failedMessage = ''
        this.animate()
      } catch (error) {
        this.sceneState.failed = true
        this.sceneState.ready = false
        this.sceneState.failedMessage = error && error.message ? error.message : 'Three.js initialization failed'
        this.destroyScene()
      }
    },
    updateSceneModel() {
      if (!this.scene || !this.renderer) return
      const metrics = this.buildSceneMetrics()
      this.clearGroup(this.mannequinGroup)
      this.clearGroup(this.garmentGroup)

      const skinMaterial = new THREE.MeshStandardMaterial({ color: '#ead6ca', roughness: 0.92, metalness: 0.02 })
      const bodyMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.96, metalness: 0.02, transparent: true, opacity: 0.36 })
      const garmentMaterial = new THREE.MeshStandardMaterial({ color: metrics.garmentColor, roughness: 0.72, metalness: 0.08 })
      const trimMaterial = new THREE.MeshStandardMaterial({ color: '#f7fbff', roughness: 0.28, metalness: 0.18 })

      const mannequin = new THREE.Group()
      const torso = new THREE.Mesh(new THREE.CapsuleGeometry(metrics.bustWidth * 0.42, metrics.torsoHeight * 0.38, 8, 18), bodyMaterial)
      torso.position.set(0, 0.8, 0)
      torso.scale.set(1, 1, 0.92)
      mannequin.add(torso)

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.28 * metrics.sizeFactor, 24, 24), skinMaterial)
      head.position.set(0, 1.86 * metrics.heightFactor, 0)
      mannequin.add(head)

      const leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.1 * metrics.sizeFactor, metrics.armLength * 0.48, 8, 16), skinMaterial)
      leftArm.position.set(-(metrics.shoulderWidth * 0.76), 0.86, 0)
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

      const shoulders = new THREE.Mesh(
        new THREE.CylinderGeometry(metrics.shoulderWidth * 0.52, metrics.bustWidth * 0.46, 0.18, 24),
        trimMaterial
      )
      shoulders.rotation.z = Math.PI / 2
      shoulders.position.set(0, 1.42, 0)
      mannequin.add(shoulders)

      const garment = new THREE.Group()
      const chestWidth = metrics.bustWidth * (1 + metrics.fitOffset)
      const waistWidth = metrics.waistWidth * (1 + metrics.fitOffset * 0.78)
      const hemWidth = metrics.hipWidth * metrics.silhouetteFactor * (1 + metrics.fitOffset * 0.46)

      const upperShell = new THREE.Mesh(
        new THREE.CylinderGeometry(chestWidth * 0.5, waistWidth * 0.48, metrics.torsoHeight * 0.72, 28, 1, true),
        garmentMaterial
      )
      upperShell.position.set(0, 0.95, 0)
      garment.add(upperShell)

      const lowerShell = new THREE.Mesh(
        new THREE.CylinderGeometry(waistWidth * 0.5, hemWidth * 0.56, 0.84, 28, 1, true),
        garmentMaterial
      )
      lowerShell.position.set(0, 0.08, 0)
      garment.add(lowerShell)

      const collar = new THREE.Mesh(new THREE.TorusGeometry(chestWidth * 0.2, 0.03, 12, 28), trimMaterial)
      collar.rotation.x = Math.PI / 2
      collar.position.set(0, 1.46, 0.05)
      garment.add(collar)

      const leftSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.13, 0.9 * metrics.heightFactor, 18), garmentMaterial)
      leftSleeve.position.set(-(metrics.shoulderWidth * 0.82), 0.98, 0)
      leftSleeve.rotation.z = Math.PI / 2.9
      const rightSleeve = leftSleeve.clone()
      rightSleeve.position.x *= -1
      rightSleeve.rotation.z *= -1
      garment.add(leftSleeve, rightSleeve)

      mannequin.position.y = 0.16
      garment.position.y = 0.18
      this.mannequinGroup = mannequin
      this.garmentGroup = garment
      this.scene.add(mannequin, garment)
      this.renderer.render(this.scene, this.camera)
    },
    animate() {
      if (!this.renderer || !this.scene || !this.camera) return
      this.frameId = window.requestAnimationFrame(this.animate)
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
      const next = mode === 'side' ? { x: 4.8, z: 0.9 } : { x: 0, z: 5.6 }
      this.camera.position.set(next.x, 1.82, next.z)
      this.controls.target.set(0, 1.05, 0)
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
          if (Array.isArray(node.material)) {
            node.material.forEach((item) => item && item.dispose && item.dispose())
          } else if (node.material.dispose) {
            node.material.dispose()
          }
        }
      })
      if (group.parent) {
        group.parent.remove(group)
      }
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
        if (this.renderer.domElement && this.renderer.domElement.parentNode) {
          this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
        }
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
</script>

<style scoped>
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

.hero-copy {
  display: grid;
  gap: 8px;
  max-width: 720px;
}

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
.empty-copy h3,
.fallback-card h4 {
  margin: 0;
  color: var(--tryon-ink);
}

.hero-copy p,
.section-head p,
.empty-copy p,
.fallback-card p,
.live-summary p {
  margin: 0;
  color: var(--tryon-muted);
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.tryon-grid {
  display: grid;
  grid-template-columns: minmax(280px, 320px) minmax(420px, 1fr) minmax(300px, 360px);
  gap: 16px;
  align-items: start;
}

.side-card,
.stage-card {
  padding: 22px;
}

.summary-card,
.control-card {
  display: grid;
  gap: 18px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.product-cover {
  border-radius: 20px;
  overflow: hidden;
  min-height: 220px;
  background: linear-gradient(180deg, #eff4ff 0%, #f8faff 100%);
}

.product-cover img {
  width: 100%;
  height: 100%;
  min-height: 220px;
  object-fit: cover;
}

.cover-fallback {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  color: var(--tryon-ink);
  font-weight: 700;
}

.summary-list,
.control-stack,
.body-metrics,
.badge-group,
.tag-wrap,
.empty-actions,
.stage-actions,
.preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.summary-list {
  display: grid;
  gap: 10px;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(240, 244, 255, 0.75);
}

.summary-row span {
  color: var(--tryon-muted);
}

.summary-row strong {
  color: var(--tryon-ink);
  text-align: right;
}

.metric-chip,
.info-badge,
.tag-chip {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(91, 110, 245, 0.1);
  color: #4b5fd4;
  font-size: 13px;
}

.info-badge {
  background: rgba(34, 197, 94, 0.12);
  color: #167d45;
}

.tag-chip.secondary {
  background: rgba(255, 166, 84, 0.14);
  color: #b05b10;
}

.stage-card {
  display: grid;
  gap: 16px;
}

.stage-head {
  align-items: flex-start;
}

.stage-shell {
  min-height: 620px;
  border-radius: 24px;
  overflow: hidden;
  background: radial-gradient(circle at top, rgba(164, 184, 255, 0.24), transparent 40%), linear-gradient(180deg, #f4f7ff 0%, #eef3ff 100%);
}

.stage-viewport,
.scene-fallback {
  width: 100%;
  min-height: 620px;
  height: 100%;
}

.scene-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.fallback-card {
  width: min(420px, 100%);
  padding: 24px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 18px 36px rgba(84, 104, 181, 0.1);
  display: grid;
  gap: 14px;
}

.fallback-figure {
  margin: 0 auto;
  width: 160px;
  display: grid;
  justify-items: center;
  gap: 10px;
}

.fallback-head {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #ead6ca;
}

.fallback-body {
  width: 120px;
  height: 180px;
  border-radius: 52px 52px 30px 30px;
  box-shadow: inset 0 -12px 30px rgba(255, 255, 255, 0.38);
}

.control-stack {
  display: grid;
  gap: 14px;
}

.control-block {
  display: grid;
  gap: 8px;
}

.control-block label {
  color: var(--tryon-ink);
  font-weight: 600;
}

.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.field-tip {
  color: var(--tryon-muted);
  font-size: 13px;
  line-height: 1.6;
}

.preset-swatch {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.82), 0 4px 10px rgba(38, 50, 74, 0.12);
  cursor: pointer;
}

.live-summary {
  padding: 18px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(91, 110, 245, 0.1), rgba(59, 130, 246, 0.06));
}

.empty-panel {
  padding: 42px 32px;
  display: grid;
  gap: 16px;
}

.empty-copy {
  max-width: 760px;
  display: grid;
  gap: 10px;
}

@media (max-width: 1280px) {
  .tryon-grid {
    grid-template-columns: 1fr;
  }

  .stage-shell,
  .stage-viewport,
  .scene-fallback {
    min-height: 520px;
  }
}

@media (max-width: 768px) {
  .tryon-hero {
    padding: 20px;
    display: grid;
  }

  .hero-actions {
    justify-content: flex-start;
  }

  .side-card,
  .stage-card,
  .empty-panel {
    padding: 18px;
  }

  .two-col {
    grid-template-columns: 1fr;
  }

  .stage-shell,
  .stage-viewport,
  .scene-fallback {
    min-height: 420px;
  }
}
</style>