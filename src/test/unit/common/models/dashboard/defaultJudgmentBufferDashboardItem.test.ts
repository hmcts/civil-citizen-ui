import i18next from 'i18next';
import {DashboardClaimantItem, DashboardDefendantItem} from 'common/models/dashboard/dashboardItem';
import en from '../../../../../main/modules/i18n/locales/en.json';
import cy from '../../../../../main/modules/i18n/locales/cy.json';

describe('Default judgment buffer dashboard statuses', () => {
  beforeAll(async () => {
    await i18next.init({
      fallbackLng: 'en',
      resources: {
        en: {translation: en},
        cy: {translation: cy},
      },
      interpolation: {
        escapeValue: false,
      },
    });
  });

  it('renders the claimant judgment entered dashboard status in English', () => {
    const dashboardClaim = new DashboardClaimantItem();
    dashboardClaim.status = 'DEFAULT_JUDGEMENT_GRANTED';
    dashboardClaim.defendantName = 'Sir John Doe';

    expect(dashboardClaim.getStatus('en')).toBe('A County Court Judgment has now been entered against Sir John Doe');
  });

  it('renders the claimant judgment entered dashboard status in Welsh', () => {
    const dashboardClaim = new DashboardClaimantItem();
    dashboardClaim.status = 'DEFAULT_JUDGEMENT_GRANTED';
    dashboardClaim.defendantName = 'Sir John Doe';

    expect(dashboardClaim.getStatus('cy')).toBe('Mae Dyfarniad Llys Sirol bellach wedi’i roi yn erbyn Sir John Doe');
  });

  it('keeps the defendant default judgment issued dashboard status unchanged', () => {
    const dashboardClaim = new DashboardDefendantItem();
    dashboardClaim.status = 'DEFAULT_JUDGEMENT_ISSUED';
    dashboardClaim.claimantName = 'Miss Jane Doe';
    dashboardClaim.defaultJudgementIssuedDate = '2023-02-24';

    expect(dashboardClaim.getStatus('en')).toBe('Miss Jane Doe requested a County Court Judgment against you on 24 February 2023.');
  });
});
