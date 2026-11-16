import path from 'path';
import {EvidenceType} from 'common/models/evidence/evidenceType';
import {YesNo} from 'common/form/models/yesNo';
import {ClaimSummaryType} from 'common/form/models/claimSummarySection';
import currencyFormat from 'common/utils/currencyFormat';
import en from '../../main/modules/i18n/locales/en.json';
import cy from '../../main/modules/i18n/locales/cy.json';

const nunjucks = require('nunjucks');

// Render the real journey content, macros and installed GOV.UK components;
// omit only the surrounding application shell and its session dependencies.
class ShellLoader extends nunjucks.Loader {
  getSource(name: string) {
    if (name.endsWith('claim-details-tpl.njk') || name.endsWith('claim-details-tpl-dashboard.njk')) {
      return {src: '<!doctype html><html lang=""><body><main>{% block content %}{% endblock %}{% block nestedContent %}{% endblock %}</main></body></html>', path: name, noCache: true};
    }
    return null;
  }
}

export function renderAddAnotherPage(view: string, model: Record<string, unknown> = {}, errors: Record<string, string> = {}, language = 'en', locals: Record<string, unknown> = {}): string {
  const root = path.resolve(__dirname, '../../..');
  const env = new nunjucks.Environment([
    new ShellLoader(),
    new nunjucks.FileSystemLoader([path.join(root, 'src/main/views'), path.join(root, 'node_modules/govuk-frontend/dist')]),
  ], {autoescape: true});
  const translations = (language === 'cy' ? cy : en) as unknown as Record<string, unknown>;
  const t = (key: string) => {
    const value = key?.split('.').reduce((item: unknown, part: string) => (item as Record<string, unknown>)?.[part], translations);
    return typeof value === 'string' ? value : key;
  };
  env.addGlobal('EvidenceType', EvidenceType);
  env.addGlobal('YesNo', YesNo);
  env.addGlobal('ClaimSummaryType', ClaimSummaryType);
  env.addFilter('currencyFormat', currencyFormat);
  env.addGlobal('translateErrors', (items: {text: string; href: string}[]) => items.map(item => ({...item, text: t(item.text)})));
  return env.render(view, {
    t, csrf: 'fixture-csrf', language,
    form: {
      model,
      errorFor: (field: string) => errors[field],
      hasErrors: () => Object.keys(errors).length > 0,
      getAllErrors: () => Object.entries(errors).map(([property, text]) => ({property, text, href: `#${property}`})),
    },
    ...locals,
  });
}
