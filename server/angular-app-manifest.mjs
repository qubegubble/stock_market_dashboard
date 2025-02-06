
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/stock_market_dashboard/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/stock_market_dashboard"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 516, hash: '18566a1ced5983492bd2d381f5904d948049042d2a4e2e0422c14f35c3934e69', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1029, hash: 'ed8402fff018b0cdb2f5d55416af3093b6d1311686cb1b3bf57e2701adde5c3f', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 20857, hash: '5fd1bf7be444dbe07fd6daf385103e98b6aef44efd4c5a88b5bdbe485012db28', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-5INURTSO.css': {size: 0, hash: 'menYUTfbRu8', text: () => import('./assets-chunks/styles-5INURTSO_css.mjs').then(m => m.default)}
  },
};
