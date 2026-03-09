<template>
  <article :class="cardClass" @click="$emit('card-click')">
    <div class="poster-shell">
      <div class="poster-backdrop" :style="backdropStyle"></div>
      <div class="poster-frame" :class="{ 'is-empty': !hasImage }">
        <img v-if="hasImage" :src="imageSrc" :alt="altText" loading="lazy" @error="handleError" />
        <div v-else class="poster-empty">
          <i class="el-icon-picture-outline"></i>
          <span>{{ emptyText }}</span>
        </div>
      </div>
      <span v-if="badge" class="poster-badge">{{ badge }}</span>
    </div>

    <div class="content">
      <div class="content-top">
        <h3>{{ title || fallbackTitle }}</h3>
        <div v-if="subtitle" class="desc">{{ subtitle }}</div>
        <div v-if="normalizedTags.length" class="tag-row">
          <span v-for="tag in normalizedTags" :key="tag">{{ tag }}</span>
        </div>
      </div>

      <div v-if="showFooter" class="bottom-row">
        <strong v-if="showPrice">{{ currencySymbol }}{{ displayPrice }}</strong>
        <div v-else class="price-placeholder"></div>
        <el-button v-if="actionText" type="text" @click.stop="$emit('action')">{{ actionText }}</el-button>
      </div>
    </div>
  </article>
</template>

<script>
const FALLBACK_TITLE = '\u672a\u547d\u540d\u6b3e\u5f0f'
const DEFAULT_EMPTY_TEXT = '\u5f85\u8865\u5145\u5546\u54c1\u56fe'
const DEFAULT_ALT_TEXT = '\u5546\u54c1\u56fe'
const CURRENCY_SYMBOL = '\u00a5'

export default {
  name: 'ProductPosterCard',
  props: {
    imageSrc: { type: String, default: '' },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    tags: { type: Array, default: () => [] },
    badge: { type: String, default: '' },
    price: { type: [String, Number], default: null },
    actionText: { type: String, default: '' },
    compact: { type: Boolean, default: false },
    emptyText: { type: String, default: DEFAULT_EMPTY_TEXT },
    imageAlt: { type: String, default: '' },
    footerHidden: { type: Boolean, default: false }
  },
  data() {
    return { imageFailed: false, fallbackTitle: FALLBACK_TITLE, currencySymbol: CURRENCY_SYMBOL }
  },
  watch: {
    imageSrc() {
      this.imageFailed = false
    }
  },
  computed: {
    hasImage() {
      return !!this.imageSrc && !this.imageFailed
    },
    altText() {
      return this.imageAlt || this.title || DEFAULT_ALT_TEXT
    },
    normalizedTags() {
      return (this.tags || []).filter((item) => String(item || '').trim()).slice(0, this.compact ? 2 : 3)
    },
    displayPrice() {
      return Number(this.price || 0).toFixed(2)
    },
    showPrice() {
      return this.price !== null && this.price !== undefined && this.price !== ''
    },
    showFooter() {
      return !this.footerHidden && (this.showPrice || this.actionText)
    },
    cardClass() {
      return ['poster-card', { compact: this.compact, clickable: true }]
    },
    backdropStyle() {
      if (!this.hasImage) return {}
      return { backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.72)), url("${this.imageSrc}")` }
    }
  },
  methods: {
    handleError() {
      this.imageFailed = true
    }
  }
}
</script>

<style scoped>
.poster-card { display:flex; flex-direction:column; min-height:100%; border-radius:22px; border:1px solid #e4eafb; overflow:hidden; background:rgba(255,255,255,.94); box-shadow:0 14px 34px rgba(84,102,177,.08); transition:transform .22s ease, box-shadow .22s ease, border-color .22s ease; }
.poster-card.clickable { cursor:pointer; }
.poster-card:hover { transform:translateY(-5px); border-color:rgba(102,129,220,.28); box-shadow:0 20px 42px rgba(73,95,171,.16); }
.poster-shell { position:relative; padding:14px 14px 0; }
.poster-backdrop { position:absolute; inset:22px 22px 8px; border-radius:18px; background:radial-gradient(circle at top, rgba(111,146,255,.24), transparent 54%), linear-gradient(180deg, #edf3ff 0%, #ffffff 100%); background-position:center; background-repeat:no-repeat; background-size:cover; filter:blur(16px); opacity:.7; transform:scale(.96); }
.poster-frame { position:relative; z-index:1; aspect-ratio:3/4; border-radius:18px; padding:12px; background:linear-gradient(180deg, rgba(243,247,255,.96), rgba(255,255,255,.98)), #ffffff; border:1px solid rgba(229,236,255,.95); overflow:hidden; }
.poster-frame img { width:100%; height:100%; object-fit:contain; object-position:center top; display:block; }
.poster-frame.is-empty { display:flex; align-items:center; justify-content:center; }
.poster-empty { width:100%; height:100%; border-radius:14px; border:1px dashed #ced9ff; background:linear-gradient(180deg, #f6f8ff 0%, #ffffff 100%); color:#8a97bf; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; text-align:center; }
.poster-empty i { font-size:34px; color:#86a0f7; }
.poster-empty span { font-size:13px; }
.poster-badge { position:absolute; top:26px; left:26px; z-index:2; display:inline-flex; align-items:center; height:28px; padding:0 12px; border-radius:999px; background:rgba(32,48,95,.78); color:#fff; font-size:12px; letter-spacing:.08em; }
.content { display:flex; flex:1; flex-direction:column; justify-content:space-between; gap:14px; padding:14px 16px 16px; }
.content-top { display:grid; gap:8px; }
.content h3 { margin:0; color:#233366; font-size:17px; line-height:1.45; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.desc { min-height:20px; color:#7f8cb6; font-size:13px; line-height:1.6; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.tag-row { display:flex; flex-wrap:wrap; gap:8px; }
.tag-row span { padding:5px 10px; border-radius:999px; background:#f3f6ff; color:#5d6f9f; font-size:12px; }
.bottom-row { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.bottom-row strong { color:#1f3c8d; font-size:22px; line-height:1; }
.price-placeholder { flex:1; }
.compact .poster-shell { padding:12px 12px 0; }
.compact .poster-frame { aspect-ratio:4/5; border-radius:16px; }
.compact .poster-backdrop { inset:18px 18px 6px; }
.compact .poster-badge { top:20px; left:20px; }
.compact .content { gap:12px; padding:12px 14px 14px; }
.compact .content h3 { font-size:15px; }
.compact .bottom-row strong { font-size:19px; }
@media (max-width:768px){ .bottom-row{ align-items:flex-start; flex-direction:column; } }
</style>