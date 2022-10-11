import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {CLAIM_INTEREST_FROM_URL} from '../../../../../../main/routes/urls';
import {t} from 'i18next';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const pageTitle = 'PAGES.CLAIM_JOURNEY.WHEN_CLAIM_INTEREST_FROM.PAGE_TITLE';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Claimant Interest From View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    app.locals.draftStoreClient = mockCivilClaim;
  });

  describe('on GET', () => {
    let htmlDocument: Document;
    let mainWrapper: Element;

    beforeAll(async () => {
      const response = await request(app).get(CLAIM_INTEREST_FROM_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      mainWrapper = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0];
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual(`Your money claims account - ${t(pageTitle)}`);
    });

    it('should display correct header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain(t('PAGES.CLAIM_JOURNEY.WHEN_CLAIM_INTEREST_FROM.TITLE'));
    });

    it('should display the options and hint text', () => {
      const radios = htmlDocument.getElementsByClassName('govuk-radios__input');
      expect(radios[0].getAttribute('value')).toBe('FROM_CLAIM_SUBMIT_DATE');
      expect(radios[1].getAttribute('value')).toBe('FROM_A_SPECIFIC_DATE');
      const hint = htmlDocument.getElementsByClassName('govuk-hint');
      expect(hint[0].innerHTML).toContain(t('PAGES.CLAIM_JOURNEY.WHEN_CLAIM_INTEREST_FROM.HINT_AFTER_4PM'));
      expect(hint[1].innerHTML).toContain(t('PAGES.CLAIM_JOURNEY.WHEN_CLAIM_INTEREST_FROM.HINT_EXAMPLE_DATE'));
    });

    it('should display Save and continue button', () => {
      const button = mainWrapper.getElementsByClassName('govuk-button')[0];
      expect(button.innerHTML).toContain(t('COMMON.BUTTONS.SAVE_AND_CONTINUE'));
    });

    it('should display contact us for help detail', () => {
      const detailsSummary = htmlDocument.getElementsByClassName('govuk-details__summary-text')[0];
      expect(detailsSummary.innerHTML).toContain('Contact us for help');
    });
  });
});
