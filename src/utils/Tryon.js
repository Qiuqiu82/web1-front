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

function safeText(value, fallback = '') {
  return value === undefined || value === null ? fallback : String(value).trim()
}

function parseNumber(value, fallback = 0) {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
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