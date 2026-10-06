
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 13318, hash: 'b5aff3baffa736b2ef7f79af21a4f80f4cdb98ac68a2831c7bcaf8d12f46321d', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 13834, hash: '3b1ebdba7d6e03c25939608bec243cdb32a49f41aaf37adf7f8763b1193add07', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 18999, hash: 'f9faf54f6ccc433176a134db311e9e37af03309357e5b7680e84855d4fe910ab', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)}
  },
};
