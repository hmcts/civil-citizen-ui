import http from 'k6/http';

const BATCH_SIZE = 10;

const setupTags = (name) => ({type: 'setup', name});

export const login = (environment, email) => {
  const response = http.post(
    `${environment.idamApi}/loginUser?username=${encodeURIComponent(email)}&password=${encodeURIComponent(environment.password)}`,
    null,
    {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, tags: setupTags('idam_login'), timeout: '60s'},
  );
  if (response.status !== 200) {
    throw new Error(`IDAM login failed for ${email}: ${response.status} ${String(response.body).slice(0, 200)}`);
  }
  return response.json('access_token');
};

const inBatches = (items, toRequest) => {
  const responses = [];
  for (let start = 0; start < items.length; start += BATCH_SIZE) {
    responses.push(...http.batch(items.slice(start, start + BATCH_SIZE).map(toRequest)));
  }
  return responses;
};

export const createCitizens = (environment, adminToken, count, label) => {
  const emails = Array.from({length: count}, (_, index) => `perf-${label}-${environment.runId}-${index}@gmail.com`);
  const created = inBatches(emails, email => ['POST', `${environment.idamTestSupportApi}/test/idam/users`, JSON.stringify({
    password: environment.password,
    user: {email, forename: 'Perf', surname: 'Citizen', displayName: 'Perf Citizen', roleNames: ['citizen']},
  }), {headers: {'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}`}, tags: setupTags('idam_create_user'), timeout: '60s'}]);
  created.forEach((response, index) => {
    if (response.status !== 201 && response.status !== 200) {
      throw new Error(`Could not create ${emails[index]}: ${response.status} ${String(response.body).slice(0, 200)}`);
    }
  });
  const tokens = inBatches(emails, email => ['POST',
    `${environment.idamApi}/loginUser?username=${encodeURIComponent(email)}&password=${encodeURIComponent(environment.password)}`,
    null, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, tags: setupTags('idam_login'), timeout: '60s'}]);
  return emails.map((email, index) => {
    if (tokens[index].status !== 200) {
      throw new Error(`Could not log in ${email}: ${tokens[index].status}`);
    }
    return {email, token: tokens[index].json('access_token')};
  });
};

export const deleteCitizens = (environment, adminToken, emails) => inBatches(emails, email => ['DELETE',
  `${environment.idamTestSupportApi}/test/idam/users/${encodeURIComponent(email)}`, null,
  {headers: {Authorization: `Bearer ${adminToken}`}, tags: setupTags('idam_delete_user'), timeout: '60s'}]);
