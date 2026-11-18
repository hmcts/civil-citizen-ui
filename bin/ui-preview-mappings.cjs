const fs = require('node:fs');
const path = require('node:path');

// Deliberately limited, static WireMock subset. No proxying, response scripts,
// state extensions or unmatched-success fallback. Shared by the host responder
// and validation; Docker runs the same mappings in ordinary WireMock.
function pathSegments(request) {
  if (request.urlPath) return request.urlPath.split('/').map(segment => [segment]);
  return request.urlPathPattern.split('/').map(segment => {
    if (/^[\w-]*$/.test(segment)) return [segment];
    if (/^\([\w-]+(?:\|[\w-]+)+\)$/.test(segment)) return segment.slice(1, -1).split('|');
    throw new Error('Preview path patterns support only literal segments and parenthesised alternatives: ' + segment);
  });
}

function loadMappings(directory) {
  const files = fs.readdirSync(directory).filter(file => file.endsWith('.json')).sort();
  if (!files.length) throw new Error('No preview mappings found');
  const mappings = [];
  const routes = [];
  for (const file of files) {
    const contents = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
    if (!Array.isArray(contents.mappings) || !contents.mappings.length) throw new Error(`Empty mappings: ${file}`);
    for (const mapping of contents.mappings) {
      const request = mapping.request;
      const response = mapping.response;
      if (!request || !response || !['GET', 'POST', 'DELETE', 'PATCH'].includes(request.method)) throw new Error(`Invalid mapping: ${file}`);
      if (Object.keys(request).some(key => !['method', 'urlPath', 'urlPathPattern', 'queryParameters'].includes(key))) throw new Error(`Unsupported request matcher: ${file}`);
      if (Object.hasOwn(request, 'queryParameters')) {
        const queries = request.queryParameters;
        if (!queries || typeof queries !== 'object' || Array.isArray(queries)
          || Object.values(queries).some(value => !value || typeof value !== 'object'
            || Array.isArray(value) || Object.keys(value).length !== 1 || typeof value.equalTo !== 'string')) {
          throw new Error(`Unsupported query matcher: ${file}; only string equalTo matchers are supported`);
        }
      }
      if (Object.keys(response).some(key => !['status', 'headers', 'jsonBody', 'body', 'transformers'].includes(key))) throw new Error(`Unsupported response/proxy/fixture: ${file}`);
      if (!Number.isInteger(response.status) || response.status < 200 || response.status > 599) throw new Error(`Invalid response status: ${file}`);
      if (response.transformers && (JSON.stringify(response.transformers) !== '["response-template"]' || !response.body?.startsWith("{{#assign 'documentId'}}{{randomValue type='UUID'}}{{/assign}}"))) throw new Error(`Unsupported response template: ${file}`);
      const endpoint = request.urlPath || request.urlPathPattern;
      if (!endpoint?.startsWith('/') || endpoint.includes(':id') || endpoint.includes('{{') || /https?:|\.\*|\.\+|\[\^\/\]\+/.test(endpoint)) throw new Error(`Broad/unresolved path: ${file}: ${endpoint}`);
      if (!!request.urlPath === !!request.urlPathPattern) throw new Error(`Ambiguous path matcher: ${file}`);
      const segments = pathSegments(request);
      const queries = request.queryParameters || {};
      const conflict = routes.some(route => route.method === request.method && route.segments.length === segments.length
        && segments.every((choices, i) => choices.some(choice => route.segments[i].includes(choice)))
        && Object.entries(queries).every(([key, value]) => !Object.hasOwn(route.queries, key) || route.queries[key].equalTo === value.equalTo));
      if (conflict) throw new Error(`Conflicting mappings: ${file} ${endpoint}`);
      routes.push({method: request.method, segments, queries});
      mappings.push({...mapping, source: file});
    }
  }
  return mappings;
}
function matchMapping(mappings, method, url) {
  return mappings.find(mapping => {
    const req = mapping.request;
    return req.method === method && (req.urlPath ? req.urlPath === url.pathname : new RegExp(`^(?:${req.urlPathPattern})$`).test(url.pathname)) &&
      Object.entries(req.queryParameters || {}).every(([key, value]) => typeof value.equalTo === 'string' && url.searchParams.get(key) === value.equalTo);
  });
}
function exportMappings(directory, destination) {
  const mappings = loadMappings(directory);
  fs.mkdirSync(destination, {recursive: false, mode: 0o700});
  mappings.forEach(({source: _source, ...mapping}, index) => {
    fs.writeFileSync(path.join(destination, `${String(index).padStart(3, '0')}.json`), JSON.stringify(mapping, null, 2));
  });
  return mappings.length;
}
module.exports = {loadMappings, matchMapping, exportMappings};
if (require.main === module) {
  const directory = path.join(__dirname, '../compose/ui-preview-mappings');
  if (process.argv[2] === '--export') {
    console.log(`Exported ${exportMappings(directory, process.argv[3])} individual WireMock files.`);
  }
  const mappings = loadMappings(directory);
  console.log(`Validated ${mappings.length} preview mappings (no chart/state-extension mappings).`);
}
