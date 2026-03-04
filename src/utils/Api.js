const Api = {
  // auth
  yonghuLogin: '/yonghu/login',
  yonghuRegister: '/yonghu/register',

  // product
  remaicosfuList: '/remaicosfu/list',
  remaicosfuDetailPrefix: '/remaicosfu/detail/',

  // cart
  coscartAdd: '/coscart/add',
  coscartList: '/coscart/list',
  coscartUpdate: '/coscart/update',
  coscartDelete: '/coscart/delete',

  // order
  cosorderSubmit: '/cosorder/submit',
  cosorderPage: '/cosorder/page',
  cosorderDetailPrefix: '/cosorder/detail/',

  // mock pay
  cosPayCreate: '/cospay/create',
  cosPayStatus: '/cospay/status',
  cosPayMockSuccess: '/cospay/mock/success'
}

export default Api
