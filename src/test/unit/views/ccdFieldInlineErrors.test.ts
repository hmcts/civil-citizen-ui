import * as path from 'path';
import * as nunjucks from 'nunjucks';
import {toCcdFieldErrorAnchorId} from 'client/common/error/callbackError';

describe('ccd-field-inline-errors macro', () => {
  let env: nunjucks.Environment;

  beforeAll(() => {
    env = nunjucks.configure([path.join(process.cwd(), 'src/main/views')], {autoescape: true});
    env.addGlobal('t', (key: string) => key);
  });

  it('should render unmapped inline messages whose ids match GDS error-summary hrefs', () => {
    const fieldError = {
      id: 'respondent1.partyEmail',
      message: 'notanemail is not a valid Email address',
      anchorId: toCcdFieldErrorAnchorId('respondent1.partyEmail'),
    };

    const html = env.renderString(`
      {% from "macro/ccd-field-inline-errors.njk" import ccdFieldInlineErrors %}
      {{ ccdFieldInlineErrors(unmappedCcdFieldErrors, t) }}
    `, {unmappedCcdFieldErrors: [fieldError]});

    expect(html).toContain('id="ccd-field-respondent1-partyEmail"');
    expect(html).toContain('govuk-error-message');
    expect(html).toContain('notanemail is not a valid Email address');
  });
});
