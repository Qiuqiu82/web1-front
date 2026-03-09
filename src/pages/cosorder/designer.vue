<template>
  <div class="designer-order-page">
    <section class="head-panel">
      <div>
        <h2>{{ texts.title }}</h2>
        <p>{{ texts.subtitle }}</p>
      </div>
    </section>

    <section class="panel-card tabs-panel">
      <el-tabs v-model="activeTab">
        <el-tab-pane :label="texts.poolTab" name="pool">
          <el-table :data="poolList" border v-loading="poolLoading" style="width:100%">
            <el-table-column prop="orderNo" :label="texts.orderNo" min-width="180" />
            <el-table-column prop="userId" :label="texts.userId" width="120" />
            <el-table-column prop="totalAmount" :label="texts.amount" width="120"><template slot-scope="scope">{{ currency }}{{ formatMoney(scope.row.totalAmount) }}</template></el-table-column>
            <el-table-column prop="payStatus" :label="texts.payStatus" width="110"><template slot-scope="scope"><el-tag size="mini" :type="payTagType(scope.row.payStatus)">{{ scope.row.payStatus || '-' }}</el-tag></template></el-table-column>
            <el-table-column prop="orderStatus" :label="texts.orderStatus" width="120"><template slot-scope="scope"><span :class="['status-chip', orderStatusClass(scope.row.orderStatus)]">{{ scope.row.orderStatus || '-' }}</span></template></el-table-column>
            <el-table-column prop="designerStatus" :label="texts.designerStatus" width="120" />
            <el-table-column prop="addtime" :label="texts.orderTime" min-width="160" />
            <el-table-column :label="texts.actions" width="140" fixed="right"><template slot-scope="scope"><el-button type="primary" size="mini" class="claim-btn" :loading="claimLoadingOrderId === scope.row.id" @click="claim(scope.row)">{{ texts.claim }}</el-button></template></el-table-column>
          </el-table>
          <div class="pagination"><el-pagination @size-change="handlePoolSizeChange" @current-change="handlePoolCurrentChange" :current-page="poolPage" :page-size="poolLimit" :page-sizes="[10,20,50]" layout="total, sizes, prev, pager, next" :total="poolTotal" background /></div>
        </el-tab-pane>

        <el-tab-pane :label="texts.mineTab" name="mine">
          <el-table :data="mineList" border v-loading="mineLoading" style="width:100%">
            <el-table-column prop="orderNo" :label="texts.orderNo" min-width="180" />
            <el-table-column prop="userId" :label="texts.userId" width="120" />
            <el-table-column prop="totalAmount" :label="texts.amount" width="120"><template slot-scope="scope">{{ currency }}{{ formatMoney(scope.row.totalAmount) }}</template></el-table-column>
            <el-table-column prop="payStatus" :label="texts.payStatus" width="110"><template slot-scope="scope"><el-tag size="mini" :type="payTagType(scope.row.payStatus)">{{ scope.row.payStatus || '-' }}</el-tag></template></el-table-column>
            <el-table-column prop="orderStatus" :label="texts.orderStatus" width="120"><template slot-scope="scope"><span :class="['status-chip', orderStatusClass(scope.row.orderStatus)]">{{ scope.row.orderStatus || '-' }}</span></template></el-table-column>
            <el-table-column prop="designerStatus" :label="texts.designerStatus" width="120" />
            <el-table-column prop="designerTakeTime" :label="texts.claimTime" min-width="160" />
            <el-table-column :label="texts.actions" min-width="240" fixed="right">
              <template slot-scope="scope">
                <div class="row-actions">
                  <el-button v-if="canStartProduction(scope.row)" type="primary" size="mini" :loading="actionLoadingKey === `start-${scope.row.id}`" @click="startProduction(scope.row)">{{ texts.startProduction }}</el-button>
                  <el-button v-if="canShip(scope.row)" type="success" size="mini" :loading="actionLoadingKey === `ship-${scope.row.id}`" @click="shipOrder(scope.row)">{{ texts.shipNow }}</el-button>
                  <el-button size="mini" @click="goComm(scope.row)">{{ texts.goComm }}</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination"><el-pagination @size-change="handleMineSizeChange" @current-change="handleMineCurrentChange" :current-page="minePage" :page-size="mineLimit" :page-sizes="[10,20,50]" layout="total, sizes, prev, pager, next" :total="mineTotal" background /></div>
        </el-tab-pane>
      </el-tabs>
    </section>
  </div>
</template>

<script>
const STATUS_PENDING_CONFIRM = '\u5f85\u786e\u8ba4'
const STATUS_PENDING_PRODUCTION = '\u5f85\u751f\u4ea7'
const STATUS_PRODUCING = '\u751f\u4ea7\u4e2d'
const STATUS_SHIPPED = '\u5df2\u53d1\u8d27'
const STATUS_FINISHED = '\u5df2\u5b8c\u6210'
const STATUS_CANCELLED = '\u5df2\u53d6\u6d88'
const PAY_PAID = '\u5df2\u652f\u4ed8'
const PAY_UNPAID = '\u672a\u652f\u4ed8'
const TEXTS = {
  title:'\u8bbe\u8ba1\u5e08\u63a5\u5355\u53f0', subtitle:'\u4ece\u5f85\u63a5\u5355\u6c60\u5feb\u901f\u8ba4\u9886\u8ba2\u5355\uff0c\u5e76\u6301\u7eed\u8ddf\u8fdb\u6211\u7684\u8ba2\u5355\u8fdb\u5ea6\u3002', poolTab:'\u5f85\u63a5\u5355\u6c60', mineTab:'\u6211\u7684\u8ba2\u5355', orderNo:'\u8ba2\u5355\u53f7', userId:'\u7528\u6237ID', amount:'\u91d1\u989d', payStatus:'\u652f\u4ed8\u72b6\u6001', orderStatus:'\u5c65\u7ea6\u72b6\u6001', designerStatus:'\u63a5\u5355\u72b6\u6001', orderTime:'\u4e0b\u5355\u65f6\u95f4', claimTime:'\u8ba4\u9886\u65f6\u95f4', actions:'\u64cd\u4f5c', claim:'\u8ba4\u9886', startProduction:'\u5f00\u59cb\u5236\u4f5c', shipNow:'\u5b8c\u6210\u5e76\u53d1\u8d27', goComm:'\u53bb\u6c9f\u901a', confirm:'\u63d0\u793a', cancel:'\u53d6\u6d88', confirmClaim:'\u786e\u8ba4\u8ba4\u9886', confirmStart:'\u5f00\u59cb\u5236\u4f5c', confirmShip:'\u786e\u8ba4\u53d1\u8d27', promptTitle:'\u5b8c\u6210\u5e76\u53d1\u8d27', promptLabel:'\u8bf7\u586b\u5199\u4ea4\u4ed8\u8bf4\u660e\u6216\u7269\u6d41\u5355\u53f7\uff08\u53ef\u9009\uff09', promptPlaceholder:'\u4f8b\u5982\uff1a\u7269\u6d41\u5355\u53f7 + \u4ea4\u4ed8\u8bf4\u660e', claimFail:'\u8ba4\u9886\u5931\u8d25', claimSuccess:'\u8ba4\u9886\u6210\u529f', startFail:'\u5f00\u59cb\u5236\u4f5c\u5931\u8d25', startSuccess:'\u5df2\u5f00\u59cb\u5236\u4f5c', shipFail:'\u53d1\u8d27\u64cd\u4f5c\u5931\u8d25', shipSuccess:'\u5df2\u6807\u8bb0\u53d1\u8d27', poolLoadFail:'\u5f85\u63a5\u5355\u52a0\u8f7d\u5931\u8d25', mineLoadFail:'\u6211\u7684\u8ba2\u5355\u52a0\u8f7d\u5931\u8d25', syncWarn:'\u8ba4\u9886\u5df2\u6210\u529f\uff0c\u5217\u8868\u540c\u6b65\u7a0d\u6162\uff0c\u5df2\u4e34\u65f6\u56de\u586b\u6b64\u8ba2\u5355\u3002' }

export default {
  name:'DesignerOrderPage',
  data(){ return { texts:TEXTS, currency:'¥', activeTab:'pool', poolLoading:false, poolList:[], poolPage:1, poolLimit:10, poolTotal:0, mineLoading:false, mineList:[], minePage:1, mineLimit:10, mineTotal:0, claimLoadingOrderId:null, actionLoadingKey:'' } },
  created(){ if(!this.ensureDesigner()) return; this.loadPool(); this.loadMine() },
  methods:{
    ensureDesigner(){ const tableName = localStorage.getItem('sessionTable') || localStorage.getItem('UserTableName') || ''; const roleName = localStorage.getItem('role') || ''; const isDesigner = tableName === 'shejishi' || roleName === '\u8bbe\u8ba1\u5e08' || roleName === 'DESIGNER'; if(!isDesigner){ this.$message.error('\u4ec5\u8bbe\u8ba1\u5e08\u53ef\u8bbf\u95ee\u8be5\u9875\u9762'); this.$router.replace('/index/home'); return false } return true },
    formatMoney(v){ return Number(v || 0).toFixed(2) },
    payTagType(status){ if(status === PAY_PAID) return 'success'; if(status === PAY_UNPAID) return 'warning'; return 'info' },
    orderStatusClass(status){ if(status === STATUS_PENDING_CONFIRM) return 'status-confirm'; if([STATUS_PENDING_PRODUCTION, STATUS_PRODUCING].includes(status)) return 'status-progress'; if(status === STATUS_SHIPPED) return 'status-ship'; if(status === STATUS_FINISHED) return 'status-done'; if(status === STATUS_CANCELLED) return 'status-cancel'; return 'status-default' },
    canStartProduction(row){ return row && row.orderStatus === STATUS_PENDING_PRODUCTION },
    canShip(row){ return row && row.orderStatus === STATUS_PRODUCING },
    normalizeRows(rows=[]){ return rows.map((row) => ({ ...row, id: row.id || row.orderId || row.order_id || '', orderNo: row.orderNo || row.order_no || '', userId: row.userId || row.user_id || '', totalAmount: row.totalAmount || row.total_amount || 0, payStatus: row.payStatus || row.pay_status || '', orderStatus: row.orderStatus || row.order_status || '', designerStatus: row.designerStatus || row.designer_status || '', designerTakeTime: row.designerTakeTime || row.designer_take_time || '-', addtime: row.addtime || '-' })) },
    parsePageData(rawData){ const data = rawData || {}; const list = data.list || data.records || data.rows || (Array.isArray(data) ? data : []); const total = Number(data.total || data.count || data.recordsTotal || (Array.isArray(list) ? list.length : 0)); return { list: Array.isArray(list) ? list : [], total } },
    currentDesignerId(){ return localStorage.getItem('userId') || localStorage.getItem('userid') || undefined },
    formatNow(){ const date = new Date(); const year = date.getFullYear(); const month = `${date.getMonth() + 1}`.padStart(2, '0'); const day = `${date.getDate()}`.padStart(2, '0'); const hour = `${date.getHours()}`.padStart(2, '0'); const minute = `${date.getMinutes()}`.padStart(2, '0'); const second = `${date.getSeconds()}`.padStart(2, '0'); return `${year}-${month}-${day} ${hour}:${minute}:${second}` },
    hasMineOrder(orderId){ return this.mineList.some((item) => String(item.id) === String(orderId)) },
    appendClaimedOrder(row){ if(!row || this.hasMineOrder(row.id)) return; const optimistic = this.normalizeRows([{ ...row, designerStatus:'\u5df2\u8ba4\u9886', designerTakeTime:this.formatNow() }])[0]; this.mineList = [optimistic, ...this.mineList]; this.mineTotal += 1 },
    isMojibakeMessage(msg){ return /[锟絔|闂倈閸妡閳缁梶閻憒閿?]/.test(String(msg || '')) },
    safeMsg(msg, fallback){ return !msg || this.isMojibakeMessage(msg) ? fallback : msg },
    async loadPool(){ this.poolLoading = true; const res = await this.$proxy.Request({ url:this.$proxy.Api.cosorderDesignerPool, method:'get', params:{ page:this.poolPage, pageNum:this.poolPage, limit:this.poolLimit, pageSize:this.poolLimit, designerId:this.currentDesignerId() }, showError:false }); this.poolLoading = false; if(!res || res.code !== 0){ this.$message.error(this.safeMsg(res && res.msg, this.texts.poolLoadFail)); return } const { list, total } = this.parsePageData(res.data); this.poolList = this.normalizeRows(list); this.poolTotal = total },
    async loadMine(){ this.mineLoading = true; const res = await this.$proxy.Request({ url:this.$proxy.Api.cosorderDesignerMine, method:'get', params:{ page:this.minePage, pageNum:this.minePage, limit:this.mineLimit, pageSize:this.mineLimit, designerId:this.currentDesignerId() }, showError:false }); this.mineLoading = false; if(!res || res.code !== 0){ this.$message.error(this.safeMsg(res && res.msg, this.texts.mineLoadFail)); return } const { list, total } = this.parsePageData(res.data); this.mineList = this.normalizeRows(list); this.mineTotal = total },
    confirmAction(message, confirmButtonText){ return this.$confirm(message, this.texts.confirm, { confirmButtonText, cancelButtonText:this.texts.cancel, type:'warning' }).then(() => true).catch(() => false) },
    async claim(row){ const ok = await this.confirmAction(`${this.texts.confirmClaim}${row.orderNo || row.id}\uff1f`, this.texts.confirmClaim); if(!ok) return; this.claimLoadingOrderId = row.id; const res = await this.$proxy.Request({ url:this.$proxy.Api.cosorderDesignerClaim, method:'post', dataType:'json', params:{ orderId:row.id, id:row.id, designerId:this.currentDesignerId() }, showError:false }); this.claimLoadingOrderId = null; if(!res || res.code !== 0){ this.$message.error(this.safeMsg(res && res.msg, this.texts.claimFail)); return } this.$message.success(this.safeMsg(res.msg, this.texts.claimSuccess)); this.activeTab = 'mine'; this.appendClaimedOrder(row); await this.loadPool(); await this.loadMine(); if(!this.hasMineOrder(row.id)){ this.appendClaimedOrder(row); this.$message.warning(this.texts.syncWarn) } },
    async startProduction(row){ const ok = await this.confirmAction(`${this.texts.confirmStart}${row.orderNo || row.id}\uff1f`, this.texts.confirmStart); if(!ok) return; this.actionLoadingKey = `start-${row.id}`; const res = await this.$proxy.Request({ url:this.$proxy.Api.cosorderDesignerStart, method:'post', dataType:'json', params:{ orderId:row.id }, showError:false }); this.actionLoadingKey = ''; if(!res || res.code !== 0){ this.$message.error(this.safeMsg(res && res.msg, this.texts.startFail)); return } this.$message.success(this.safeMsg(res.msg, this.texts.startSuccess)); await this.loadMine() },
    async shipOrder(row){ const promptRes = await this.$prompt(this.texts.promptLabel, this.texts.promptTitle, { confirmButtonText:this.texts.confirmShip, cancelButtonText:this.texts.cancel, inputType:'textarea', inputPlaceholder:this.texts.promptPlaceholder }).catch(() => null); if(!promptRes) return; const deliveryRemark = (promptRes.value || '').trim(); this.actionLoadingKey = `ship-${row.id}`; const res = await this.$proxy.Request({ url:this.$proxy.Api.cosorderDesignerShip, method:'post', dataType:'json', params:{ orderId:row.id, remark: deliveryRemark || '\u8bbe\u8ba1\u5e08\u53d1\u8d27' }, showError:false }); this.actionLoadingKey = ''; if(!res || res.code !== 0){ this.$message.error(this.safeMsg(res && res.msg, this.texts.shipFail)); return } this.$message.success(this.safeMsg(res.msg, this.texts.shipSuccess)); await this.loadMine() },
    goComm(row){ this.$router.push({ path:'/designer/communication', query:{ orderId:row.id } }) },
    handlePoolSizeChange(size){ this.poolLimit = size; this.poolPage = 1; this.loadPool() },
    handlePoolCurrentChange(page){ this.poolPage = page; this.loadPool() },
    handleMineSizeChange(size){ this.mineLimit = size; this.minePage = 1; this.loadMine() },
    handleMineCurrentChange(page){ this.minePage = page; this.loadMine() }
  }
}
</script>

<style scoped>
.designer-order-page { display:grid; gap:12px; }
.panel-card,.head-panel,.tabs-panel { border-radius:18px; border:1px solid #e7edff; background:#fff; box-shadow:0 10px 24px rgba(68,88,150,.08); }
.head-panel { padding:18px 20px; }
.head-panel h2 { color:#25356a; font-size:26px; }
.head-panel p { margin-top:6px; color:#8590b2; }
.tabs-panel { padding:12px; }
.status-chip { display:inline-block; padding:2px 10px; border-radius:999px; font-size:12px; font-weight:600; }
.status-confirm { background:#f0f3ff; color:#4a5c9f; }
.status-progress { background:#ebefff; color:#3e52a8; }
.status-ship { background:#eaf5ff; color:#3570a4; }
.status-done { background:#e9f8ef; color:#2f7a4c; }
.status-cancel { background:#f3f4f6; color:#7b8398; }
.status-default { background:#f4f6fb; color:#687699; }
.claim-btn { min-width:72px; border-radius:10px; }
.row-actions { display:flex; flex-wrap:wrap; gap:8px; }
.pagination { margin-top:16px; text-align:right; }
@media (max-width:900px){ .tabs-panel,.head-panel{ padding:12px; } }
</style>