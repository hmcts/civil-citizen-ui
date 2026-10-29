import fs from 'fs';
import path from 'path';
import nunjucks from 'nunjucks';
import {JSDOM} from 'jsdom';

const directory = path.resolve('src/test/utils/mocks/a11y');
const files = fs.readdirSync(directory).filter(name => name.endsWith('.html'));
const environment = new nunjucks.Environment(new nunjucks.FileSystemLoader([
  path.resolve('src/main/views'),
  path.resolve('node_modules/govuk-frontend/dist'),
]), {autoescape: true});

function renderHeader(language: string, serviceName: string) {
  const translations = JSON.parse(fs.readFileSync(path.resolve('src/main/modules/i18n/locales', `${language}.json`), 'utf8'));
  const t = (key: string) => key.split('.').reduce((value, part) => value[part], translations);
  return environment.renderString('{% from "macro/header.njk" import headerComponent %}{{ headerComponent(t, null, serviceName) }}', {t, serviceName});
}

function links(header: Element) {
  return Array.from(header.querySelectorAll('a')).map(link => ({
    href: link.getAttribute('href')?.replace(/^http:\/\/localhost:3001(?=\/)/, '').replace(/^https:\/\/www\.gov\.uk\/$/, 'https://www.gov.uk'),
    classes: Array.from(link.classList).sort(),
    name: (link.getAttribute('aria-label') || link.querySelector('[aria-label]')?.getAttribute('aria-label') || link.textContent || '').replace(/\s+/g, ' ').trim(),
  }));
}

describe('accessibility capture headers', () => {
  it('keeps the requesting-reason capture title aligned with its translated production title', () => {
    const captured = new JSDOM(fs.readFileSync(path.join(directory, 'mock-case-1645882162449409-general-application-requesting-reason.html'), 'utf8'));
    try {
      const translations = JSON.parse(fs.readFileSync(path.resolve('src/main/modules/i18n/locales/en.json'), 'utf8'));
      const t = (key: string) => key.split('.').reduce((value, part) => value[part], translations);
      const template = fs.readFileSync(path.resolve('src/main/views/features/generalApplication/requesting-reason.njk'), 'utf8');
      const titleBlock = template.match(/{% block pageTitle %}([\s\S]*?){% endblock %}/);
      expect(titleBlock).not.toBeNull();
      const title = environment.renderString('{% from "macro/page-title.njk" import setPageTitle %}' + titleBlock[1], {t}).trim();
      expect(title).toContain(translations.PAGES.GENERAL_APPLICATION.APPLICATION_REASON.WHY_REQUESTING);
      expect(captured.window.document.title).toBe(title);
    } finally {captured.window.close();}
  });

  it('keeps the saved Welsh confirmation language available to the capture-server cookie bootstrap', () => {
    const captured = new JSDOM(fs.readFileSync(path.join(directory, 'mock-case-1645882162449409-response-general-application-1720536653906339-confirmation.html'), 'utf8'));
    try {
      expect(captured.window.document.documentElement.lang).toBe('cy');
      expect(links(captured.window.document.querySelector('.civil-header')).map(link => link.name)).toEqual(['GOV.UK', 'Hawliadau am Arian', 'Fy nghyfrif', 'Allgofnodi']);
    } finally {captured.window.close();}
  });

  it('uses the production header link classes, names and destinations in every captured header', async () => {
    expect(files.length).toBeGreaterThan(0);
    let headerCount = 0;
    for (const file of files) {
      const captured = new JSDOM(fs.readFileSync(path.join(directory, file), 'utf8'));
      try {
        const document = captured.window.document;
        expect(document.querySelector('.govuk-header__link, .govuk-header__logotype-text, .govuk-header__service-name')).toBeNull();
        if (!document.querySelector('.govuk-header')) continue;
        headerCount++;
        if (file === 'mock-unauthorised.html') {
          const source = new JSDOM(environment.renderString('{% from "govuk/components/header/macro.njk" import govukHeader %}{{ govukHeader({homepageUrl: "#"}) }}', {}));
          try {
            expect(links(document.querySelector('.govuk-header'))).toEqual(links(source.window.document.querySelector('.govuk-header')));
          } finally {source.window.close();}
          continue;
        }
        const header = document.querySelector('.civil-header');
        expect(header).not.toBeNull();
        const language = document.documentElement.lang || 'en';
        const serviceName = header.querySelector('.govuk-service-navigation__service-name')?.textContent?.trim();
        expect(serviceName).toBeTruthy();
        const source = new JSDOM(renderHeader(language, serviceName));
        try {
          expect(links(header)).toEqual(links(source.window.document.querySelector('.civil-header')));
          expect(header.querySelectorAll('.govuk-header__homepage-link')).toHaveLength(1);
          expect(header.querySelectorAll('[data-module="govuk-service-navigation"]')).toHaveLength(1);
          for (const control of header.querySelectorAll('[aria-controls]')) {
            expect(document.getElementById(control.getAttribute('aria-controls'))).not.toBeNull();
          }
        } finally {source.window.close();}
      } finally {
        captured.window.close();
        // Release jsdom resource tasks between captures, including under coverage.
        await new Promise<void>(resolve => setImmediate(resolve));
      }
    }
    expect(headerCount).toBeGreaterThan(0);
  }, 60000);

  it.each(['en', 'cy'])('retains the production navigation labels in %s', language => {
    const translations = JSON.parse(fs.readFileSync(path.resolve('src/main/modules/i18n/locales', `${language}.json`), 'utf8'));
    const header = new JSDOM(renderHeader(language, translations.COMMON.HEADER.MONEY_CLAIMS));
    try {
      expect(links(header.window.document.querySelector('.civil-header')).map(link => [link.href, link.name])).toEqual([
        ['https://www.gov.uk', 'GOV.UK'],
        ['/dashboard', translations.COMMON.HEADER.MONEY_CLAIMS],
        ['/dashboard', translations.COMMON.HEADER.MY_ACCOUNT],
        ['/logout', translations.COMMON.HEADER.SIGN_OUT],
      ]);
    } finally {header.window.close();}
  });
});
