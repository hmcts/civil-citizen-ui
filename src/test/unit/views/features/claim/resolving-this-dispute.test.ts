import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {CLAIM_RESOLVING_DISPUTE_URL} from '../../../../../main/routes/urls';
import {t} from 'i18next';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const pageTitle = 'PAGES.CLAIM_JOURNEY.RESOLVE_THE_DISPUTE.PAGE_TITLE';

jest.mock('../../../../../main/modules/oidc');

describe('Resolving Dispute View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    let htmlDocument: Document;

    beforeEach(async () => {
      const response = await request(app).get(CLAIM_RESOLVING_DISPUTE_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual(`Your money claims account - ${t(pageTitle)}`);
    });

    it('should display correct header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain(t('PAGES.CLAIM_JOURNEY.RESOLVE_THE_DISPUTE.TITLE'));
    });

    it('should display Before you claim paragraph', () => {
      const paragraph = htmlDocument.getElementsByClassName('govuk-body')[0];
      expect(paragraph.innerHTML).toContain(t('PAGES.CLAIM_JOURNEY.RESOLVE_THE_DISPUTE.P1.BEFORE_YOU_CLAIM'));
    });

    it('should display first bullet list', () => {
      const listItems = htmlDocument.getElementsByClassName('govuk-list--bullet')[0].getElementsByTagName('li');
      expect(listItems.length).toEqual(2);
      expect(listItems[0].innerHTML).toContain(t('PAGES.CLAIM_JOURNEY.RESOLVE_THE_DISPUTE.P1.TALK_TO_THE_PERSON'));
      expect(listItems[1].innerHTML).toContain(t('PAGES.CLAIM_JOURNEY.RESOLVE_THE_DISPUTE.P1.CONSIDER_MEDIATION'));
    });

    it('should display Try to resolve paragraph', () => {
      const paragraph = htmlDocument.getElementsByClassName('govuk-body')[1];
      expect(paragraph.innerHTML).toContain(t('PAGES.CLAIM_JOURNEY.RESOLVE_THE_DISPUTE.P2.TRY_TO_RESOLVE'));
    });

    it('should display second bullet list', () => {
      const listItems = htmlDocument.getElementsByClassName('govuk-list--bullet')[1].getElementsByTagName('li');
      expect(listItems.length).toEqual(3);
      expect(listItems[0].innerHTML).toContain(t('PAGES.CLAIM_JOURNEY.RESOLVE_THE_DISPUTE.P2.TELLING_THEM_WHY'));
      expect(listItems[1].innerHTML).toContain(t('PAGES.CLAIM_JOURNEY.RESOLVE_THE_DISPUTE.P2.SUGGESTING_TIMETABLE'));
      expect(listItems[2].innerHTML).toContain(t('PAGES.CLAIM_JOURNEY.RESOLVE_THE_DISPUTE.P2.MAKE_A_CLAIM'));
    });

    it('should display I confirm I\'ve read this button', () => {
      const button = htmlDocument.getElementsByClassName('govuk-button')[0];
      expect(button.innerHTML).toContain(t('COMMON.BUTTONS.I_CONFIRM_IVE_READ_THIS'));
    });

    it('should display contact us for help detail', () => {
      const detailsSummary = htmlDocument.getElementsByClassName('govuk-details__summary-text')[0];
      expect(detailsSummary.innerHTML).toContain('Contact us for help');
    });
  });
});
