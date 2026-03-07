const Api = {
  // auth
  yonghuLogin: '/yonghu/login',
  yonghuRegister: '/yonghu/register',
  shejishiLogin: '/shejishi/login',

  // product
  remaicosfuList: '/remaicosfu/list',
  remaicosfuDetailPrefix: '/remaicosfu/detail/',
  remaicosfuAutoSort: '/remaicosfu/autoSort',

  // cart
  coscartAdd: '/coscart/add',
  coscartList: '/coscart/list',
  coscartUpdate: '/coscart/update',
  coscartDelete: '/coscart/delete',

  // order
  cosorderSubmit: '/cosorder/submit',
  cosorderPage: '/cosorder/page',
  cosorderDetailPrefix: '/cosorder/detail/',
  cosorderCancelPrefix: '/cosorder/cancel/',
  cosorderConfirmReceiptPrefix: '/cosorder/confirm-receipt/',
  cosorderAdminPage: '/cosorder/admin/page',
  cosorderAdminDetailPrefix: '/cosorder/admin/detail/',
  cosorderAdminTransition: '/cosorder/admin/transition',
  cosorderAdminStatusLogPrefix: '/cosorder/admin/status-log/',
  cosorderDesignerPool: '/cosorder/designer/pool',
  cosorderDesignerClaim: '/cosorder/designer/claim',
  cosorderDesignerMine: '/cosorder/designer/mine',
  cosorderDesignerStart: '/cosorder/designer/start',
  cosorderDesignerShip: '/cosorder/designer/ship',
  cosMaterialAdminPage: '/cosmaterial/admin/page',
  cosMaterialAdminDetailPrefix: '/cosmaterial/admin/detail/',
  cosMaterialSave: '/cosmaterial/save',
  cosMaterialUpdate: '/cosmaterial/update',
  cosMaterialDelete: '/cosmaterial/delete',
  cosMaterialTogglePrefix: '/cosmaterial/toggle/',
  cosMaterialAuditPrefix: '/cosmaterial/audit/',
  cosMaterialRulePage: '/cosmaterial/rule/page',
  cosMaterialRuleSave: '/cosmaterial/rule/save',
  cosMaterialRuleUpdate: '/cosmaterial/rule/update',
  cosMaterialRuleDelete: '/cosmaterial/rule/delete',
  cosMaterialRuleByStyle: '/cosmaterial/rule/by-style',

  // mock pay
  cosPayCreate: '/cospay/create',
  cosPayStatus: '/cospay/status',
  cosPayMockSuccess: '/cospay/mock/success'
}

export default Api

