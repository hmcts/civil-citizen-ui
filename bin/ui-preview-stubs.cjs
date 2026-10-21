const http = require('node:http');
const {randomUUID} = require('node:crypto');
const path = require('node:path');
const {loadMappings, matchMapping} = require('./ui-preview-mappings.cjs');
function createPreviewStubServer(directory = path.join(__dirname, '../compose/ui-preview-mappings')) {
  const mappings = loadMappings(directory);
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (req.method === 'GET' && url.pathname === '/__preview/ready') {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({service: 'cui-preview-static-stubs', mappings: mappings.length})); return;
    }
    const mapping = matchMapping(mappings, req.method, url);
    // Consume request bodies, including multipart uploads; transport/persistence
    // remain in the real controllers. Responses are explicitly synthetic.
    req.resume();
    if (!mapping) { console.error(`Unmapped preview ${req.method} ${url.pathname}`); res.writeHead(404); res.end('Unmapped preview service request'); return; }
    const reply = mapping.response;
    res.writeHead(reply.status, reply.headers || {});
    let body = reply.jsonBody !== undefined ? JSON.stringify(reply.jsonBody) : reply.body || '';
    if (reply.transformers) {
      const id = randomUUID();
      body = body.replace("{{#assign 'documentId'}}{{randomValue type='UUID'}}{{/assign}}", '').replaceAll('{{documentId}}', id);
    }
    res.end(body);
  });
}
module.exports = {createPreviewStubServer};
if (require.main === module) {
  const host = process.env.UI_PREVIEW_CONTAINER === 'true' ? '0.0.0.0' : '127.0.0.1';
  createPreviewStubServer().listen(Number(process.env.UI_PREVIEW_STUB_PORT || 1111), host);
}
