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
  cosorderAdminPage: '/cosorder/admin/page',
  cosorderAdminDetailPrefix: '/cosorder/admin/detail/',
  cosorderAdminTransition: '/cosorder/admin/transition',
  cosorderAdminStatusLogPrefix: '/cosorder/admin/status-log/',
  cosorderDesignerPool: '/cosorder/designer/pool',
  cosorderDesignerClaim: '/cosorder/designer/claim',
  cosorderDesignerMine: '/cosorder/designer/mine',

  // mock pay
  cosPayCreate: '/cospay/create',
  cosPayStatus: '/cospay/status',
  cosPayMockSuccess: '/cospay/mock/success'
}

export default Api
