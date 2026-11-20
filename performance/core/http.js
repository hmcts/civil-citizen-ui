import http from 'k6/http';
import {check} from 'k6';

export const call = (method, url, {token, body, endpoint, type, expected = [200], verify = true, headers = {}} = {}) => {
  const params = {
    headers: Object.assign({'Content-Type': 'application/json'}, token ? {Authorization: `Bearer ${token}`} : {}, headers),
    tags: {name: endpoint, endpoint, type},
    timeout: '60s',
    responseCallback: http.expectedStatuses(...expected),
  };
  const payload = body === undefined || body === null ? null : (typeof body === 'string' ? body : JSON.stringify(body));
  const response = http.request(method, url, payload, params);
  if (verify) {
    check(response, {[`${endpoint} returns ${expected.join(' or ')}`]: r => expected.includes(r.status)}, {endpoint, type});
  }
  return response;
};
