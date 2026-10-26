import path from 'path';
import express from 'express';
import nunjucks from 'nunjucks';
import {Nunjucks} from 'modules/nunjucks';
import {formControlTranslate} from './renderFormControls';

/** Render the production shell, filters and macros without starting the application. */
export function configuredProductionEnvironment(viewsDirectory?: string): nunjucks.Environment {
  const app = express();
  new Nunjucks(false).enableFor(app);
  const original = app.get('nunjucksEnv') as nunjucks.Environment;
  const root = path.resolve(__dirname, '../../..');
  const env = new nunjucks.Environment(new nunjucks.FileSystemLoader([
    viewsDirectory || path.join(root, 'src/main/views'), path.join(root, 'node_modules/govuk-frontend/dist'),
  ]), {autoescape: true, noCache: true});
  Object.entries((original as unknown as {globals: Record<string, unknown>}).globals).forEach(([key, value]) => env.addGlobal(key, value));
  Object.entries((original as unknown as {filters: Record<string, (...args: unknown[]) => unknown>}).filters).forEach(([key, value]) => env.addFilter(key, value));
  return env;
}

export function renderProductionPage(view: string, locals: Record<string, unknown> = {}, language = 'en', viewsDirectory?: string) {
  return configuredProductionEnvironment(viewsDirectory).render(view, {
    t: formControlTranslate(language), lang: language, htmlLang: language, csrf: 'fixture-csrf',
    claimId: '1', pageTitle: 'PAGES.DASHBOARD.PAGE_TITLE', nonceValue: 'fixture-nonce', nonceDataLayer: 'fixture-data-nonce', ...locals,
  });
}
