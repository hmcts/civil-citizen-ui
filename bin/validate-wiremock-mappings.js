#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(process.argv[2] || 'charts/civil-citizen-ui/wiremock');
const mappingsDirectory = path.join(root, 'mappings');
const filesDirectory = path.join(root, '__files');
const errors = [];
const mappings = [];

for (const filename of fs.readdirSync(mappingsDirectory).filter(name => name.endsWith('.json')).sort()) {
  const mappingPath = path.join(mappingsDirectory, filename);
  try {
    const document = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    const entries = Array.isArray(document.mappings) ? document.mappings : [document];
    entries.forEach((mapping, index) => mappings.push({mapping, source: `${filename}#${index + 1}`}));
  } catch (error) {
    errors.push(`${filename}: invalid JSON (${error.message})`);
  }
}

const signatures = new Map();
for (const {mapping, source} of mappings) {
  const request = mapping.request || {};
  const response = mapping.response || {};
  const urlMatchers = ['url', 'urlPath', 'urlPattern', 'urlPathPattern'].filter(key => request[key] !== undefined);
  if (!mapping.name) errors.push(`${source}: mapping must have a unique name`);
  if (!Number.isInteger(mapping.priority)) errors.push(`${source}: mapping must define an integer priority`);
  if (!request.method) errors.push(`${source}: request method is required`);
  if (urlMatchers.length !== 1) errors.push(`${source}: request must define exactly one URL matcher`);
  if (Object.values(request).some(value => value === '.*' || value === '/.*')) {
    errors.push(`${source}: generic catch-all matchers are forbidden`);
  }
  if (response.bodyFileName) {
    const fixture = path.resolve(filesDirectory, response.bodyFileName);
    if (!fixture.startsWith(`${filesDirectory}${path.sep}`) || !fs.existsSync(fixture)) {
      errors.push(`${source}: missing bodyFileName ${response.bodyFileName}`);
    } else {
      try {
        JSON.parse(fs.readFileSync(fixture, 'utf8'));
      } catch (error) {
        errors.push(`${source}: fixture ${response.bodyFileName} is invalid JSON (${error.message})`);
      }
    }
  }
  const signature = JSON.stringify({
    method: request.method,
    url: urlMatchers.map(key => [key, request[key]]),
    queryParameters: request.queryParameters || {},
    headers: request.headers || {},
    bodyPatterns: request.bodyPatterns || [],
    priority: mapping.priority,
  });
  if (signatures.has(signature)) errors.push(`${source}: conflicts with ${signatures.get(signature)}`);
  else signatures.set(signature, source);
}

if (errors.length) {
  console.error(`WireMock mapping validation failed:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`Validated ${mappings.length} WireMock mappings and their referenced fixtures.`);
