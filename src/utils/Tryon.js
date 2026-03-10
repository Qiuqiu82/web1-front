export const TRYON_STORAGE_KEY = 'tryonContext'
export const TRYON_SIZE_OPTIONS = ['S', 'M', 'L', 'XL']
export const TRYON_SILHOUETTE_OPTIONS = ['\u4fee\u8eab', '\u5e38\u89c4', '\u5bbd\u677e', '\u4f1e\u6446', '\u76f4\u7b52']
export const TRYON_FIT_TYPE_OPTIONS = ['\u5e38\u89c4', '\u5bbd\u677e', '\u5f39\u529b', '\u821e\u53f0\u53cb\u597d']
export const TRYON_COLOR_PRESETS = [
  { label: '\u661f\u591c\u84dd', value: '#355c7d' },
  { label: '\u7eef\u7ea2\u91d1', value: '#b43f5c' },
  { label: '\u66dc\u77f3\u9ed1', value: '#2b3141' },
  { label: '\u4e91\u96fe\u767d', value: '#dce4f2' },
  { label: '\u8584\u8377\u9752', value: '#5d9b8a' }
]

const COLOR_KEYWORDS = [
  { match: ['\u9ed1', '\u66dc\u77f3', '\u6697\u591c'], value: '#2b3141' },
  { match: ['\u767d', '\u94f6', '\u6708\u5149'], value: '#dce4f2' },
  { match: ['\u84dd', '\u6d77\u519b', '\u661f\u591c'], value: '#355c7d' },
  { match: ['\u7ea2', '\u9152\u7ea2', '\u7eef'], value: '#b43f5c' },
  { match: ['\u91d1', '\u9999\u69df'], value: '#c39a5b' },
  { match: ['\u7eff', '\u8584\u8377', '\u9752'], value: '#5d9b8a' },
  { match: ['\u7d2b', '\u9e22\u5c3e'], value: '#7367c7' }
]

const DRESS_KEYWORDS = ['\u8fde\u8863\u88d9', '\u793c\u670d', '\u957f\u88d9', '\u88d9', 'dress', 'gown']
const JACKET_KEYWORDS = ['\u5916\u5957', '\u5236\u670d', '\u5939\u514b', '\u519b\u88c5', '\u5916\u642d', 'jacket', 'coat', 'uniform']
const TOP_SKIRT_KEYWORDS = ['\u5957\u88c5', '\u4e24\u4ef6\u5957', '\u4e0a\u8863', '\u77ed\u88d9', '\u534a\u88d9', '\u5206\u4f53', 'set', 'two-piece']
const CAPE_KEYWORDS = ['\u62ab\u98ce', '\u6597\u7bf7', '\u6597\u84ec', 'cape', 'cloak']
const STAGE_KEYWORDS = ['\u821e\u53f0', '\u6f14\u51fa', '\u534e\u4e3d', '\u6b4c\u5267', '\u89d2\u8272', 'stage', 'performance']
const ACCESSORY_TAGS = {
  cape: '\u62ab\u98ce',
  belt: '\u8170\u5e26',
  armPatch: '\u81c2\u7ae0',
  bow: '\u8774\u8776\u7ed3',
  metalNodes: '\u91d1\u5c5e\u6263',
  detachable: '\u53ef\u62c6\u5378'
}
const CRAFT_TAGS = {
  edgeTrim: ['\u5305\u8fb9', '\u6eda\u8fb9'],
  hiddenFastener: ['\u6697\u6263', '\u9690\u5f62\u62c9\u94fe'],
  contrastPanel: ['\u62fc\u8272'],
  sequin: ['\u4eae\u7247']
}

const GARMENT_PRESETS = {
  dress: {
    key: 'dress',
    label: '\u8fde\u8863\u88d9\u578b',
    description: '\u5f3a\u8c03\u8170\u7ebf\u548c\u88d9\u6446\u5782\u611f\uff0c\u9002\u5408\u8fde\u8863\u88d9\u4e0e\u793c\u670d\u7c7b\u9884\u89c8\u3002',
    torsoLength: 1,
    skirtLength: 1.14,
    shoulderSpread: 1,
    waistTaper: 0.12,
    hemSpread: 1.24,
    sleeveLength: 0.98,
    sleeveVolume: 1,
    topEase: 0.04,
    bottomEase: 0.06,
    outerLayerDepth: 1,
    segmented: false,
    frontPanels: false,
    overskirt: false,
    capePreferred: false
  },
  jacket: {
    key: 'jacket',
    label: '\u5916\u5957\u5c42\u578b',
    description: '\u5f3a\u8c03\u80a9\u7ebf\u3001\u524d\u895f\u4e0e\u5916\u5c42\u539a\u5ea6\uff0c\u9002\u5408\u5916\u5957\u548c\u5236\u670d\u7c7b\u578b\u3002',
    torsoLength: 1.08,
    skirtLength: 0.72,
    shoulderSpread: 1.12,
    waistTaper: 0.05,
    hemSpread: 1,
    sleeveLength: 1.08,
    sleeveVolume: 1.08,
    topEase: 0.06,
    bottomEase: 0.02,
    outerLayerDepth: 1.55,
    segmented: false,
    frontPanels: true,
    overskirt: false,
    capePreferred: false
  },
  topSkirt: {
    key: 'topSkirt',
    label: '\u4e0a\u8863+\u4e0b\u88c5',
    description: '\u4e0a\u8eab\u4e0e\u4e0b\u8eab\u5206\u5c42\u663e\u793a\uff0c\u66f4\u5bb9\u6613\u8868\u73b0\u5957\u88c5\u6216\u5206\u4f53\u7ed3\u6784\u3002',
    torsoLength: 0.84,
    skirtLength: 0.98,
    shoulderSpread: 1,
    waistTaper: 0.1,
    hemSpread: 1.1,
    sleeveLength: 0.94,
    sleeveVolume: 0.96,
    topEase: 0.03,
    bottomEase: 0.05,
    outerLayerDepth: 1,
    segmented: true,
    frontPanels: false,
    overskirt: false,
    capePreferred: false
  },
  cape: {
    key: 'cape',
    label: '\u62ab\u98ce\u578b',
    description: '\u4ee5\u4e0a\u8eab\u7ed3\u6784\u4e3a\u4e3b\uff0c\u989d\u5916\u7a81\u51fa\u62ab\u98ce\u6216\u6597\u7bf7\u7684\u8f6e\u5ed3\u611f\u3002',
    torsoLength: 0.94,
    skirtLength: 0.82,
    shoulderSpread: 1.08,
    waistTaper: 0.06,
    hemSpread: 1.06,
    sleeveLength: 1,
    sleeveVolume: 1,
    topEase: 0.05,
    bottomEase: 0.04,
    outerLayerDepth: 1.8,
    segmented: false,
    frontPanels: false,
    overskirt: false,
    capePreferred: true
  },
  stageCostume: {
    key: 'stageCostume',
    label: '\u821e\u53f0\u620f\u88c5',
    description: '\u653e\u5927\u80a9\u7ebf\u4e0e\u4e0b\u6446\uff0c\u9002\u5408\u821e\u53f0\u8868\u6f14\u7c7b\u5927\u5eca\u5f62\u98ce\u683c\u3002',
    torsoLength: 1.02,
    skirtLength: 1.26,
    shoulderSpread: 1.18,
    waistTaper: 0.14,
    hemSpread: 1.46,
    sleeveLength: 1.16,
    sleeveVolume: 1.24,
    topEase: 0.1,
    bottomEase: 0.15,
    outerLayerDepth: 1.9,
    segmented: false,
    frontPanels: true,
    overskirt: true,
    capePreferred: false
  }
}

const SILHOUETTE_EFFECTS = {
  '\u4fee\u8eab': { shoulder: 0.98, waist: 0.05, hem: 0.9, length: 0.96 },
  '\u5e38\u89c4': { shoulder: 1, waist: 0, hem: 1, length: 1 },
  '\u5bbd\u677e': { shoulder: 1.06, waist: -0.02, hem: 1.08, length: 1.02 },
  '\u4f1e\u6446': { shoulder: 1.02, waist: 0.01, hem: 1.22, length: 1.08 },
  '\u76f4\u7b52': { shoulder: 1.01, waist: -0.05, hem: 0.98, length: 1.02 }
}

const FIT_EFFECTS = {
  '\u5e38\u89c4': { top: 0, bottom: 0, sleeve: 1 },
  '\u5bbd\u677e': { top: 0.05, bottom: 0.07, sleeve: 1.1 },
  '\u5f39\u529b': { top: -0.02, bottom: -0.02, sleeve: 0.95 },
  '\u821e\u53f0\u53cb\u597d': { top: 0.08, bottom: 0.12, sleeve: 1.18 }
}

function safeText(value, fallback = '') {
  return value === undefined || value === null ? fallback : String(value).trim()
}

function parseNumber(value, fallback = 0) {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

function includesKeyword(text, keywords = []) {
  const lower = safeText(text).toLowerCase()
  return keywords.some((keyword) => lower.includes(String(keyword).toLowerCase()))
}

function hasAnyTag(values = [], targets = []) {
  const set = new Set((values || []).map((item) => safeText(item)))
  return targets.some((target) => set.has(target))
}

function normalizeHex(color) {
  const value = safeText(color).replace('#', '')
  if (/^[0-9a-f]{3}$/i.test(value)) {
    return `#${value.split('').map((item) => item + item).join('')}`.toLowerCase()
  }
  if (/^[0-9a-f]{6}$/i.test(value)) {
    return `#${value}`.toLowerCase()
  }
  return '#5b6ef5'
}

function mixHex(colorA, colorB, weight = 0.5) {
  const a = normalizeHex(colorA)
  const b = normalizeHex(colorB)
  const nextWeight = Math.min(Math.max(weight, 0), 1)
  const toRgb = (hex) => [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16))
  const [ar, ag, ab] = toRgb(a)
  const [br, bg, bb] = toRgb(b)
  const format = (num) => Math.round(num).toString(16).padStart(2, '0')
  return `#${format(ar + (br - ar) * nextWeight)}${format(ag + (bg - ag) * nextWeight)}${format(ab + (bb - ab) * nextWeight)}`
}

export function normalizeBodyProfile(row = {}) {
  return {
    id: row.id || row.bodyProfileId || row.profileId || null,
    profileName: safeText(row.profileName || row.profile_name, '\u9ed8\u8ba4\u4f53\u578b'),
    heightCm: parseNumber(row.heightCm != null ? row.heightCm : row.height_cm, 168),
    weightKg: parseNumber(row.weightKg != null ? row.weightKg : row.weight_kg, 55),
    waistCm: parseNumber(row.waistCm != null ? row.waistCm : row.waist_cm, 68),
    bustCm: parseNumber(row.bustCm != null ? row.bustCm : row.bust_cm, 86),
    hipCm: parseNumber(row.hipCm != null ? row.hipCm : row.hip_cm, 90),
    shoulderCm: parseNumber(row.shoulderCm != null ? row.shoulderCm : row.shoulder_cm, 38),
    sizeCode: safeText(row.sizeCode || row.size_code, 'M') || 'M',
    isDefault: parseNumber(row.isDefault != null ? row.isDefault : row.is_default, 0)
  }
}

export function createFallbackBodyProfile() {
  return normalizeBodyProfile({
    profileName: '\u9ed8\u8ba4\u4f53\u578b',
    heightCm: 168,
    weightKg: 55,
    waistCm: 68,
    bustCm: 86,
    hipCm: 90,
    shoulderCm: 38,
    sizeCode: 'M',
    isDefault: 1
  })
}

export function createDefaultDesignConfig(product = {}, materialOptions = []) {
  return {
    sizeCode: 'M',
    materialName: materialOptions[0] || product.materialName || product.mianliaoleibie || '',
    silhouette: '\u5e38\u89c4',
    fitType: '\u5e38\u89c4',
    colorTheme: '',
    craftTags: [],
    accessoryTags: []
  }
}

export function normalizeDesignConfig(config = {}, fallback = {}) {
  const merged = {
    ...createDefaultDesignConfig({}, []),
    ...fallback,
    ...config
  }
  const nextSize = safeText(merged.sizeCode, 'M').toUpperCase()
  return {
    sizeCode: TRYON_SIZE_OPTIONS.includes(nextSize) ? nextSize : 'M',
    materialName: safeText(merged.materialName),
    silhouette: safeText(merged.silhouette, '\u5e38\u89c4') || '\u5e38\u89c4',
    fitType: safeText(merged.fitType, '\u5e38\u89c4') || '\u5e38\u89c4',
    colorTheme: safeText(merged.colorTheme),
    craftTags: Array.isArray(merged.craftTags) ? merged.craftTags.filter(Boolean) : [],
    accessoryTags: Array.isArray(merged.accessoryTags) ? merged.accessoryTags.filter(Boolean) : []
  }
}

export function resolveTryonColor(colorTheme = '') {
  const text = safeText(colorTheme).toLowerCase()
  if (!text) return '#5b6ef5'
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(text)) return text
  for (let index = 0; index < COLOR_KEYWORDS.length; index += 1) {
    const item = COLOR_KEYWORDS[index]
    if (item.match.some((keyword) => text.indexOf(keyword.toLowerCase()) > -1)) {
      return item.value
    }
  }
  return '#5b6ef5'
}

export function extractTryonCover(product = {}) {
  const firstGallery = safeText((product.huawentuan || '').split(',')[0])
  return safeText(product.cover || product.productCover || firstGallery)
}

export function normalizeTryonProduct(product = {}) {
  return {
    productId: product.productId || product.id || null,
    productName: safeText(product.productName || product.fuzhuangmingcheng || product.name, '\u672a\u547d\u540d\u670d\u88c5'),
    styleName: safeText(product.styleName || product.fuzhuangkuanshi || product.style, ''),
    materialName: safeText(product.materialName || product.mianliaoleibie, ''),
    cover: extractTryonCover(product),
    draftId: product.draftId || null,
    source: safeText(product.source, 'detail') || 'detail'
  }
}

export function buildTryonContext(payload = {}) {
  const product = normalizeTryonProduct(payload.product || {})
  const bodyProfile = payload.bodyProfile ? normalizeBodyProfile(payload.bodyProfile) : createFallbackBodyProfile()
  const designConfig = normalizeDesignConfig(payload.designConfig || {}, { sizeCode: bodyProfile.sizeCode || 'M' })
  return {
    productId: product.productId || null,
    productName: product.productName,
    styleName: product.styleName,
    cover: product.cover,
    draftId: payload.draftId || product.draftId || null,
    source: safeText(payload.source || product.source, 'detail') || 'detail',
    designConfig,
    bodyProfileId: bodyProfile.id || null,
    bodyProfileSnapshot: bodyProfile,
    updatedAt: new Date().toISOString()
  }
}

export function resolveGarmentPreset(context = {}) {
  const product = normalizeTryonProduct(context.product || {})
  const designConfig = normalizeDesignConfig(context.designConfig || {}, {})
  const styleText = [product.productName, product.styleName].filter(Boolean).join(' ')

  let presetKey = 'dress'
  if (includesKeyword(styleText, STAGE_KEYWORDS) || designConfig.fitType === '\u821e\u53f0\u53cb\u597d') {
    presetKey = 'stageCostume'
  } else if (includesKeyword(styleText, CAPE_KEYWORDS)) {
    presetKey = 'cape'
  } else if (includesKeyword(styleText, JACKET_KEYWORDS)) {
    presetKey = 'jacket'
  } else if (includesKeyword(styleText, TOP_SKIRT_KEYWORDS)) {
    presetKey = 'topSkirt'
  } else if (includesKeyword(styleText, DRESS_KEYWORDS)) {
    presetKey = 'dress'
  }

  return {
    ...GARMENT_PRESETS[presetKey],
    matchedBy: safeText(styleText, '\u9ed8\u8ba4\u56de\u9000')
  }
}

export function buildAccessoryVisualState(designConfig = {}) {
  const normalized = normalizeDesignConfig(designConfig)
  return {
    cape: hasAnyTag(normalized.accessoryTags, [ACCESSORY_TAGS.cape]),
    belt: hasAnyTag(normalized.accessoryTags, [ACCESSORY_TAGS.belt]),
    armPatch: hasAnyTag(normalized.accessoryTags, [ACCESSORY_TAGS.armPatch]),
    bow: hasAnyTag(normalized.accessoryTags, [ACCESSORY_TAGS.bow]),
    metalNodes: hasAnyTag(normalized.accessoryTags, [ACCESSORY_TAGS.metalNodes]),
    detachable: hasAnyTag(normalized.accessoryTags, [ACCESSORY_TAGS.detachable]),
    edgeTrim: hasAnyTag(normalized.craftTags, CRAFT_TAGS.edgeTrim),
    hiddenFastener: hasAnyTag(normalized.craftTags, CRAFT_TAGS.hiddenFastener),
    contrastPanel: hasAnyTag(normalized.craftTags, CRAFT_TAGS.contrastPanel),
    sequin: hasAnyTag(normalized.craftTags, CRAFT_TAGS.sequin),
    accessoryLabels: normalized.accessoryTags.slice(),
    craftLabels: normalized.craftTags.slice()
  }
}

export function buildTryonVisualModel(payload = {}) {
  const product = normalizeTryonProduct(payload.product || {})
  const bodyProfile = payload.bodyProfile ? normalizeBodyProfile(payload.bodyProfile) : createFallbackBodyProfile()
  const designConfig = normalizeDesignConfig(payload.designConfig || {}, { sizeCode: bodyProfile.sizeCode || 'M' })
  const preset = resolveGarmentPreset({ product, designConfig })
  const accessories = buildAccessoryVisualState(designConfig)
  const silhouetteEffect = SILHOUETTE_EFFECTS[designConfig.silhouette] || SILHOUETTE_EFFECTS['\u5e38\u89c4']
  const fitEffect = FIT_EFFECTS[designConfig.fitType] || FIT_EFFECTS['\u5e38\u89c4']

  const primaryColor = resolveTryonColor(designConfig.colorTheme)
  const secondaryColor = accessories.contrastPanel ? mixHex(primaryColor, '#ffffff', 0.42) : mixHex(primaryColor, '#10131d', 0.18)
  const trimColor = accessories.sequin ? '#f4dd7a' : mixHex(primaryColor, '#ffffff', 0.66)
  const metalColor = '#c6a96b'
  const outlineColor = mixHex(primaryColor, '#182137', 0.48)

  const enabledParts = [
    { key: 'torsoShell', label: '\u4e0a\u8eab\u5916\u58f3' },
    { key: 'sleeveLeft', label: '\u5de6\u8896' },
    { key: 'sleeveRight', label: '\u53f3\u8896' },
    { key: 'collar', label: '\u9886\u53e3' },
    { key: 'shoulderTrim', label: '\u80a9\u90e8\u88c5\u9970' }
  ]

  if (preset.segmented) {
    enabledParts.push({ key: 'topPanel', label: '\u4e0a\u8eab\u5206\u5c42' }, { key: 'skirtOrHem', label: '\u4e0b\u88c5\u5206\u5c42' })
  } else {
    enabledParts.push({ key: 'skirtOrHem', label: '\u4e0b\u6446\u5c42' })
  }
  if (preset.frontPanels) enabledParts.push({ key: 'frontPanels', label: '\u524d\u895f\u7247' })
  if (preset.overskirt) enabledParts.push({ key: 'overskirt', label: '\u5916\u5c42\u88d9\u6446' })
  if (accessories.cape || preset.capePreferred) enabledParts.push({ key: 'capeMesh', label: '\u62ab\u98ce\u5c42' })
  if (accessories.belt) enabledParts.push({ key: 'beltRing', label: '\u8170\u5e26' })
  if (accessories.armPatch) enabledParts.push({ key: 'armPatch', label: '\u81c2\u7ae0' })
  if (accessories.bow) enabledParts.push({ key: 'bowMesh', label: '\u8774\u8776\u7ed3' })
  if (accessories.metalNodes || accessories.hiddenFastener) enabledParts.push({ key: 'metalNodes', label: '\u91d1\u5c5e\u6263\u70b9' })
  if (accessories.detachable) enabledParts.push({ key: 'detachableTag', label: '\u53ef\u62c6\u5378\u6807\u8bc6' })
  if (accessories.edgeTrim) enabledParts.push({ key: 'edgeTrim', label: '\u5305\u8fb9/\u6eda\u8fb9' })
  if (accessories.contrastPanel) enabledParts.push({ key: 'contrastPanel', label: '\u62fc\u8272\u7247' })
  if (accessories.sequin) enabledParts.push({ key: 'sequinPanel', label: '\u4eae\u7247\u88c5\u9970' })

  return {
    preset,
    accessories,
    colors: {
      primary: primaryColor,
      secondary: secondaryColor,
      trim: trimColor,
      metal: metalColor,
      outline: outlineColor
    },
    modifiers: {
      torsoLength: preset.torsoLength,
      skirtLength: preset.skirtLength * silhouetteEffect.length,
      shoulderSpread: preset.shoulderSpread * silhouetteEffect.shoulder,
      waistTaper: Math.min(Math.max(preset.waistTaper + silhouetteEffect.waist, 0.02), 0.26),
      hemSpread: preset.hemSpread * silhouetteEffect.hem,
      sleeveLength: preset.sleeveLength,
      sleeveVolume: preset.sleeveVolume * fitEffect.sleeve,
      topEase: preset.topEase + fitEffect.top,
      bottomEase: preset.bottomEase + fitEffect.bottom,
      outerLayerDepth: preset.outerLayerDepth,
      segmented: preset.segmented,
      frontPanels: preset.frontPanels,
      overskirt: preset.overskirt,
      hasCape: accessories.cape || preset.capePreferred,
      contrastPanel: accessories.contrastPanel,
      edgeTrim: accessories.edgeTrim,
      hiddenFastener: accessories.hiddenFastener,
      sequin: accessories.sequin
    },
    enabledParts,
    enabledPartLabels: enabledParts.map((item) => item.label),
    structureSummary: preset.description,
    badges: [preset.label, ...accessories.craftLabels.slice(0, 2), ...accessories.accessoryLabels.slice(0, 2)].filter(Boolean),
    context: buildTryonContext({ product, designConfig, bodyProfile, source: payload.source || product.source })
  }
}

export function createRecommendTryonContext(product = {}, bodyProfile = null) {
  const normalizedProduct = normalizeTryonProduct({
    ...product,
    source: 'recommend'
  })
  const nextBodyProfile = bodyProfile ? normalizeBodyProfile(bodyProfile) : createFallbackBodyProfile()
  const designConfig = createDefaultDesignConfig(normalizedProduct, normalizedProduct.materialName ? [normalizedProduct.materialName] : [])
  designConfig.sizeCode = nextBodyProfile.sizeCode || 'M'
  return buildTryonContext({
    source: 'recommend',
    product: normalizedProduct,
    designConfig,
    bodyProfile: nextBodyProfile
  })
}

export function saveTryonContext(context) {
  if (typeof sessionStorage === 'undefined') return context
  const normalized = buildTryonContext(context)
  sessionStorage.setItem(TRYON_STORAGE_KEY, JSON.stringify(normalized))
  return normalized
}

export function loadTryonContext() {
  if (typeof sessionStorage === 'undefined') return null
  const raw = sessionStorage.getItem(TRYON_STORAGE_KEY)
  if (!raw) return null
  try {
    return buildTryonContext(JSON.parse(raw))
  } catch (error) {
    return null
  }
}

export function clearTryonContext() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(TRYON_STORAGE_KEY)
  }
}