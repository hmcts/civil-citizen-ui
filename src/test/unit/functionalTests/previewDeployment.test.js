const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const {spawnSync} = require('child_process');

const chart = path.resolve(__dirname, '../../../../charts/civil-citizen-ui');
const read = name => yaml.load(fs.readFileSync(path.join(chart, name), 'utf8'));
// Helm overlays merge maps, replace lists and remove null keys.
function merge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (value === null) delete target[key];
    else if (typeof value === 'object' && !Array.isArray(value)) target[key] = merge(target[key] || {}, value);
    else target[key] = value;
  }
  return target;
}
const preview = (...overlays) => overlays.reduce((values, name) => merge(values, read(`values.${name}.preview.template.yaml`)),
  merge(read('values.yaml'), read('values.preview.template.yaml')));

function expectBoundaries(values, mocked) {
  const service = values['civil-service'];
  for (const key of ['FEES_API_URL', 'PAYMENTS_API_URL', 'DOCMOSIS_TORNADO_URL', 'CASE_DOCUMENT_AM_URL']) {
    expect(service.java.environment[key].includes('-wiremock')).toBe(mocked);
  }
  expect(service.ccd['ccd-data-store-api'].java.environment.CASE_DOCUMENT_AM_URL.includes('-wiremock')).toBe(mocked);
  expect(values.nodejs.environment.GOVPAY_URL).toBe(mocked ? 'https://wiremock-${SERVICE_FQDN}' : 'https://card.payments.service.gov.uk');
  expect(values.wiremock.enabled).toBe(mocked);
  expect(service.ccd.ccd.apiGatewayWeb.enabled).toBe(!mocked);
  for (const key of ['xui-webapp', 'em-stitching', 'em-ccdorc', 'ccd-case-document-am-api']) {
    expect(service[key].enabled).toBe(!mocked);
  }
  if (!mocked) {
    expect(values.nodejs.environment).not.toHaveProperty('ORDNANCE_SURVEY_API_URL');
    expect(values.nodejs.environment).not.toHaveProperty('ORDNANCE_SURVEY_API_KEY');
  }
}

describe('PR deployment selection', () => {
  it('uses one mock instance and only baseline databases by default', () => {
    const values = preview();
    expectBoundaries(values, true);
    expect(values.wiremock.replicas).toBe(1);
    expect(values.wiremock.autoscaling.enabled).toBe(false);
    expect(values['civil-service'].ccd.postgresql.setup.databases).toHaveLength(5);
    expect(values.nodejs.environment.ORDNANCE_SURVEY_API_URL).toBe('http://${SERVICE_NAME}-wiremock');
  });

  it('restores standard dependencies without enabling extra integrations', () => {
    const values = preview('standardTests');
    expectBoundaries(values, false);
    expect(values.wa.enabled).toBe(false);
    expect(values.servicebus.enabled).toBe(false);
    expect(values['civil-service'].ccd.postgresql.setup.databases).toHaveLength(10);
  });

  it.each([['fullDeployment'], ['fullDeployment', 'standardTests'], ['standardTests', 'fullDeployment']])(
    'keeps full-deployment integrations on real dependencies for overlays %j', (...overlays) => {
      const values = preview(...overlays);
      expectBoundaries(values, false);
      expect(values.wa.enabled).toBe(true);
      expect(values.servicebus.enabled).toBe(true);
      expect(values.hmcsb.enabled).toBe(true);
    });
});

it('rejects grouped optimised runs instead of silently dropping requested tests', () => {
  const root = path.resolve(__dirname, '../../../..');
  const result = spawnSync('bash', ['src/test/functionalTests/run-functional-tests.sh'], {
    cwd: root,
    env: {...process.env, OPTIMISED_FUNCTIONAL_TESTS: 'true', PR_FT_GROUPS: 'ui-payments', SKIP_FUNCTIONAL_TESTS: 'false'},
    encoding: 'utf8',
  });
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('Selected functional groups require pr-values:standardTests or pr-values:fullDeployment');
});
