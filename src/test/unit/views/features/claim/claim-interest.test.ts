import config from 'config';
import nock from 'nock';
import {app} from '../../../../../main/app';
import {mockCivilClaim} from '../../../../utils/mockDraftStore';
import request from 'supertest';
import {CLAIM_INTEREST} from '../../../../../main/routes/urls';
import {t} from 'i18next';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const pageTitle = 'PAGES.CLAIM_JOURNEY.CLAIM_INTEREST.PAGE_TITLE';

describe('Claim Interest View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    app.locals.draftStoreClient = mockCivilClaim;
  });

  describe('on GET', () => {
    let htmlDocument: Document;
    let mainWrapper: Element;

    beforeEach(async () => {
      const response = await request(app).get(CLAIM_INTEREST);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      mainWrapper = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0];
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual(`Your money claims account - ${t(pageTitle)}`);
    });

    it('should display correct header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain(t('PAGES.CLAIM_JOURNEY.CLAIM_INTEREST.TITLE'));
    });

    it('should display You can claim interest paragraph', () => {
      const paragraph = mainWrapper.getElementsByClassName('govuk-body')[0];
      expect(paragraph.innerHTML).toEqual(t('PAGES.CLAIM_JOURNEY.CLAIM_INTEREST.YOU_CAN_CLAIM_INTEREST'));
    });

    it('should contain Help with interest rates detail component', () => {
      const contactUs = htmlDocument.getElementsByClassName('govuk-details__summary-text')[0];
      expect(contactUs.innerHTML).toContain('Help with interest rates');
    });

    it('should display 2 radio buttons with yes and no options', () => {
      const radios = htmlDocument.getElementsByClassName('govuk-radios__item');
      expect(radios[0].innerHTML).toContain('Yes');
      expect(radios[1].innerHTML).toContain('No');
      expect(radios.length).toEqual(2);
    });

    it('should display Save and continue button', () => {
      const buttons = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0].getElementsByClassName('govuk-button')[0];
      expect(buttons.innerHTML).toContain('Save and continue');
    });

    it('should contain Contact us detail component', () => {
      const contactUs = htmlDocument.getElementsByClassName('govuk-details__summary-text')[1];
      expect(contactUs.innerHTML).toContain('Contact us for help');
    });

    it('should not display error summary component', () => {
      const errorSummary = htmlDocument.getElementsByClassName('govuk-error-summary');
      expect(errorSummary.length).toEqual(0);
    });
  });
});
