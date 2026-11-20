// Loaded only by the preview launcher. Block outbound connections independently
// of package-manager settings; the container also uses an internal-only network.
const net = require('node:net');
const dns = require('node:dns');
const systemLookup = dns.lookup;
const loopback = new Set(['127.0.0.1', '::1']);
const allowed = new Set(['127.0.0.1', '::1', 'localhost']);
if (process.env.UI_PREVIEW_CONTAINER === 'true') allowed.add('wiremock');
const check = host => {
  if (!allowed.has(host || 'localhost')) throw new Error(`Preview blocked external connection: ${host}`);
};
const checkedLookup = resolver => function (hostname, options, callback) {
  check(hostname);
  if (typeof options === 'function') { callback = options; options = {}; }
  // Docker owns this service name and its internal DNS. A caller must not
  // substitute an arbitrary address for the container's permitted service.
  if (hostname === 'wiremock' && resolver !== systemLookup) {
    return callback(new Error('Preview requires the system resolver for wiremock'));
  }
  return resolver(hostname, options, (error, address, family) => {
    if (error) return callback(error);
    const addresses = Array.isArray(address)
      ? address.map(result => ({address: result.address, family: result.family}))
      : [{address, family}];
    const invalid = addresses.find(result => !net.isIP(result.address) ||
      (hostname !== 'wiremock' && !loopback.has(result.address)));
    if (invalid) return callback(new Error(`Preview blocked external connection: ${invalid.address}`));
    // Copy array results so a custom resolver cannot change a validated result
    // before Node selects its IPv4/IPv6 connection attempt.
    callback(null, Array.isArray(address) ? addresses : address, family);
  });
};
dns.lookup = checkedLookup(systemLookup);
const connect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function (...args) {
  // net.connect/createConnection (including HTTP agents) pass Node's normalized
  // [options, callback] array, while direct socket calls can use public arguments.
  const normalized = Array.isArray(args[0]) ? args[0] : args;
  const options = normalized[0];
  if ((options && typeof options === 'object' && options.path) ||
      (typeof options === 'string' && (!options.trim() || Number.isNaN(Number(options))))) {
    throw new Error('Preview does not use Unix service sockets');
  }
  check(options && typeof options === 'object' ? options.host : typeof normalized[1] === 'string' ? normalized[1] : 'localhost');
  if (options && typeof options === 'object' && typeof options.lookup === 'function' && options.lookup !== dns.lookup) {
    return connect.call(this, {...options, lookup: checkedLookup(options.lookup)}, normalized[1]);
  }
  return connect.apply(this, args);
};
