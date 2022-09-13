import config from 'config';
import nock from 'nock';
import request from 'supertest';
import dayjs from 'dayjs';
import 'dayjs/locale/cy';
import {app} from '../../../../../main/app';
import {mockRedisFullAdmission} from '../../../../utils/mockDraftStore';
import {CONFIRMATION_URL} from '../../../../../main/routes/urls';
import {formatDateToFullDate} from '../../../../../main/common/utils/dateUtils';
import * as externalURLs from '../../../../utils/externalURLs';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

const paragraph = 'govuk-body';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Submit Confirmation View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    let mainWrapper: any;

    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.draftStoreClient = mockRedisFullAdmission;
      const response = await request(app).get(CONFIRMATION_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      mainWrapper = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0];
    });

    it('should have title set', () => {
      expect(htmlDocument.title).toContain('Your money claims account - Submit Confirmation');
    });

    describe('Should display submit panel', () => {

      it('should panel title', () => {
        const panelTitle = htmlDocument.getElementsByClassName('govuk-panel__title');
        expect(panelTitle[0].innerHTML).toContain("You've submitted your response");
      });

      it('should panel content with claim number and submit date', () => {
        const panelContent = htmlDocument.getElementsByClassName('govuk-panel__body');
        expect(panelContent[0].innerHTML).toContain('Claim number:');
        expect(panelContent[0].innerHTML).toContain('000MC009');
        expect(panelContent[0].innerHTML).toContain(formatDateToFullDate(new Date()));
      });
    });

    it('should display submit status', () => {
      const paragraphs = mainWrapper.getElementsByClassName(paragraph);
      expect(paragraphs[0].innerHTML).toContain('We’ve emailed Mr. Jan Clark to tell them you’ll pay immediately.');
    });

    describe('Should display next steps section', function () {
      it('should display the title', () => {
        const nextstepsTitle = mainWrapper.getElementsByClassName('govuk-heading-m');
        expect(nextstepsTitle[0].innerHTML).toContain('What happens next');
      });

      it('should display next steps', () => {
        const paragraphs = mainWrapper.getElementsByClassName(paragraph);
        const nextStepsList = htmlDocument.getElementsByClassName('govuk-list');
        const links = mainWrapper.getElementsByClassName('govuk-link');
        const immediatePaymentDeadLline = dayjs().add(5, 'day').locale('en').format('DD MMMM YYYY');
        expect(paragraphs[1].innerHTML).toContain('You need to make sure that:');
        expect(nextStepsList[0].getElementsByTagName('li')[0].innerHTML).toContain(`they get the money by ${immediatePaymentDeadLline} - they can request a County Court Judgment against you if not`);
        expect(nextStepsList[0].getElementsByTagName('li')[1].innerHTML).toContain('any cheques or bank transfers are clear in their account by the deadline');
        expect(nextStepsList[0].getElementsByTagName('li')[2].innerHTML).toContain('you get a receipt for any payments');
        expect(nextStepsList[0].getElementsByTagName('li')[3].innerHTML).toContain('they tell the court that you’ve paid');
        expect(links[0].innerHTML).toContain('Contact Mr. Jan Clark');
        expect(paragraphs[2].innerHTML).toContain('if you need their payment details.');
      });
    });

    it('should display survey link', () => {
      const links = mainWrapper.getElementsByClassName('govuk-link');
      const surveyLink = links[1] as HTMLAnchorElement;
      expect(surveyLink.innerHTML).toContain('What did you think of this service?');
      expect(surveyLink.href).toContain(externalURLs.smartSurveyUrl);
    });

    it('should display go to your account link', () => {
      const links = mainWrapper.getElementsByClassName('govuk-button')[0];
      expect(links.innerHTML).toContain('Go to your account');
      expect(links.href).toContain('/dashboard');
    });

    it('Should display help and support section', function () {
      const supportSection = htmlDocument.getElementsByClassName('govuk-details');
      expect(supportSection[0].innerHTML).toContain('Email');
      expect(supportSection[0].innerHTML).toContain('contactocmc@justice.gov.uk');
      expect(supportSection[0].innerHTML).toContain('Telephone');
      expect(supportSection[0].innerHTML).toContain('0300 123 7050');
      expect(supportSection[0].innerHTML).toContain('Monday to Friday, 8.30am to 5pm.');
      expect(supportSection[0].innerHTML).toContain('Find out about call charges');
    });
  });
});
