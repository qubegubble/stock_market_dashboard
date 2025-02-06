
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/stock_market_dashboard/dashboard/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/stock_market_dashboard/dashboard"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 526, hash: 'e9cf437ebbe5430a5b1a8b36acf4de86febdc514ec9e25601a32e4773af37c50', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1039, hash: 'af0e6968b5604f87ebe08b76280f78058573412c95eb39b10686066c158bf071', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 20867, hash: 'ff5c2140f98b6f96caeee1ba5348b18056f9d42fa0625a36ca9f8e24a7df1ad7', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-5INURTSO.css': {size: 0, hash: 'menYUTfbRu8', text: () => import('./assets-chunks/styles-5INURTSO_css.mjs').then(m => m.default)}
  },
};
