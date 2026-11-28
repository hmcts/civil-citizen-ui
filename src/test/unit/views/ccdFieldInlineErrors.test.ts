import * as path from 'path';
import * as nunjucks from 'nunjucks';
import {toCcdFieldErrorAnchorId} from 'common/utils/checkYourAnswer/ccdFieldErrorsOnCya';

describe('ccd-field-inline-errors macro', () => {
  let env: nunjucks.Environment;

  const renderMacro = (unmappedCcdFieldErrors: unknown) => env.renderString(`
    {% from "macro/ccd-field-inline-errors.njk" import ccdFieldInlineErrors %}
    {{ ccdFieldInlineErrors(unmappedCcdFieldErrors, t) }}
  `, {unmappedCcdFieldErrors});

  beforeAll(() => {
    env = nunjucks.configure([path.join(process.cwd(), 'src/main/views')], {autoescape: true});
    env.addGlobal('t', (key: string) => key);
  });

  it('should render hidden anchors whose ids match GDS error-summary hrefs', () => {
    const fieldError = {
      id: 'respondent1.partyEmail',
      message: 'notanemail is not a valid Email address',
      anchorId: toCcdFieldErrorAnchorId('respondent1.partyEmail'),
    };

    const html = renderMacro([fieldError]);

    expect(html).toContain('id="ccd-field-respondent1-partyEmail"');
    expect(html).toContain('govuk-visually-hidden');
    expect(html).not.toContain('govuk-error-message');
    expect(html).not.toContain('ERRORS.ENTER_VALID_ANSWER_BEFORE_SUBMITTING');
    expect(html).not.toContain('ERRORS.ERROR');
  });

  it('should render one hidden anchor per unmapped field error', () => {
    const html = renderMacro([
      {id: 'unknown.field', message: 'bad', anchorId: toCcdFieldErrorAnchorId('unknown.field')},
      {id: 'respondent1Witnesses.0.email', message: 'bad', anchorId: toCcdFieldErrorAnchorId('respondent1Witnesses.0.email')},
    ]);

    expect(html).toContain('id="ccd-field-unknown-field"');
    expect(html).toContain('id="ccd-field-respondent1Witnesses-0-email"');
    expect(html.match(/govuk-visually-hidden/g)).toHaveLength(2);
    expect(html).not.toContain('govuk-error-message');
  });

  it('should render nothing when there are no unmapped field errors', () => {
    expect(renderMacro([]).trim()).toBe('');
    expect(renderMacro(undefined).trim()).toBe('');
  });
});
