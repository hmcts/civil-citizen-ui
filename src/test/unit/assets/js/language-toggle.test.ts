import {JSDOM} from 'jsdom';

describe('language-toggle', () => {
  const scriptPath = '../../../../main/assets/js/language-toggle.js';
  let dom: JSDOM;

  const loadLanguageToggle = (htmlLang: string, cookieLang: string, query: string) => {
    dom = new JSDOM(
      `<!DOCTYPE html><html lang="${htmlLang}"><body><a class="language" href="?lang=cy">Cymraeg</a></body></html>`,
      {url: `https://example.test/page${query}`},
    );
    (global as unknown as {window: JSDOM['window']}).window = dom.window;
    (global as unknown as {document: Document}).document = dom.window.document;
    document.cookie = `lang=${cookieLang}`;

    jest.resetModules();
    require(scriptPath);
    document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

    return document.querySelector<HTMLAnchorElement>('a.language');
  };

  afterEach(() => {
    dom.window.close();
  });

  it('keeps the server-rendered Welsh language when the cookie is stale', () => {
    const toggle = loadLanguageToggle('cy', 'en', '?lang=cy');

    expect(document.documentElement.lang).toBe('cy');
    expect(toggle?.textContent).toBe('English');
    expect(toggle?.getAttribute('href')).toBe('?lang=en');
  });

  it('keeps the server-rendered English language when the cookie is stale', () => {
    const toggle = loadLanguageToggle('en', 'cy', '?lang=en');

    expect(document.documentElement.lang).toBe('en');
    expect(toggle?.textContent).toBe('Cymraeg');
    expect(toggle?.getAttribute('href')).toBe('?lang=cy');
  });
});
