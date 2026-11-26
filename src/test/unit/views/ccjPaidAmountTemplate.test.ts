import {formControlForm, formControlsEnvironment, formControlTranslate} from '../../utils/renderFormControls';

const {JSDOM} = require('jsdom');

describe('CCJ paid amount template', () => {
  it.each([
    ['en', '(opens in a new tab)'],
    ['cy', '(yn agor mewn tab newydd)'],
  ])('warns in the visible link text that the N225 and N225a links open in a new tab (%s)', (language, warning) => {
    const t = formControlTranslate(language);
    const html = formControlsEnvironment().render('features/claimantResponse/ccj/paid-amount.njk', {
      t,
      lang: language,
      form: formControlForm({option: 'yes'}),
      csrf: 'fixture-csrf',
      pageTitle: 'PAGES.CCJ_PAID_AMOUNT.PAGE_TITLE',
      isQMFlagEnabled: false,
    });
    const dom = new JSDOM(html);
    try {
      const doc = dom.window.document as Document;
      const links = [t('PAGES.CCJ_PAID_AMOUNT.N225_LINK'), t('PAGES.CCJ_PAID_AMOUNT.N225A_LINK')]
        .map(href => doc.querySelector<HTMLAnchorElement>(`a[href="${href}"]`));
      expect(links[0]!.textContent!.trim()).toBe(`N225 ${warning}`);
      expect(links[1]!.textContent!.trim()).toBe(`N225a ${warning}`);
      links.forEach(link => {
        expect(link!.target).toBe('_blank');
        expect(link!.rel).toContain('noopener');
      });
    } finally {
      dom.window.close();
    }
  });
});
