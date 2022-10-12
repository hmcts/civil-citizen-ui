import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../main/app';
import {DQ_DEFENDANT_CAN_STILL_EXAMINE_URL} from '../../../../main/routes/urls';
import {mockCivilClaim} from '../../../utils/mockDraftStore';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store');

describe('Defendant expert can still examine View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    let mainWrapper: Element;

    beforeAll(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.draftStoreClient = mockCivilClaim;
      const response = await request(app).get(DQ_DEFENDANT_CAN_STILL_EXAMINE_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      mainWrapper = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0];
    });

    it('should have page title', () => {
      expect(htmlDocument.title).toEqual('Your money claims account - Defendant expert can still examine');
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain('Does the claim involve something an expert can still examine?');
    });

    it('should display question 1', () => {
      const paragraph = mainWrapper.getElementsByClassName('govuk-body')[0];
      expect(paragraph.innerHTML).toContain('This could include photographs or videos.');
    });

    it('should display yes and no radios', () => {
      const radios = htmlDocument.getElementsByClassName('govuk-radios__input');
      expect(radios[0].getAttribute('value')).toBe('yes');
      expect(radios[1].getAttribute('value')).toBe('no');
    });

    it('should display examine if yes radio is selected', () => {
      const yesRadio = htmlDocument.getElementsByClassName('govuk-radios__input')[0];
      const question2Label = htmlDocument.querySelector('label[for=details]');
      yesRadio.setAttribute('aria-expanded', 'true');
      expect(question2Label?.innerHTML).toContain('What is there to examine?');
    });
    it('should display expert if yes radio is selected', () => {
      const yesRadio = htmlDocument.getElementsByClassName('govuk-radios__input')[0];

      yesRadio.setAttribute('aria-expanded', 'false');
      const paragraph = mainWrapper.getElementsByClassName('govuk-body')[1];
      expect(paragraph.innerHTML).toContain('You can\'t use an expert in this case.');
    });

    it('should display save and continue button', () => {
      const button = mainWrapper.getElementsByClassName('govuk-button')[0];
      expect(button.innerHTML).toContain('Save and continue');
    });

    it('should display contact us for help', () => {
      const contactUsForHelp = htmlDocument.getElementsByClassName('govuk-details');
      expect(contactUsForHelp[0].innerHTML).toContain('Contact us for help');
    });
  });

  describe('on POST', () => {
    describe('no radio selected', () => {
      let htmlDocument: Document;

      beforeAll(async () => {
        nock(idamUrl)
          .post('/o/token')
          .reply(200, {id_token: citizenRoleToken});
        app.locals.draftStoreClient = mockCivilClaim;
        const response = await request(app).post(DQ_DEFENDANT_CAN_STILL_EXAMINE_URL);
        const dom = new JSDOM(response.text);
        htmlDocument = dom.window.document;
      });

      it('should display error summary', () => {
        const errorSummary = htmlDocument.getElementsByClassName('govuk-error-summary__title')[0];
        expect(errorSummary.innerHTML).toContain('There was a problem');
      });

      it('should display Question 1 error in the error summary', () => {
        const error = htmlDocument.getElementsByClassName('govuk-error-summary__list')[0]
          .getElementsByTagName('li')[0];
        expect(error.innerHTML).toContain('Please select yes or no');
      });

      it('should display Question 1 error over radio buttons', () => {
        const error = htmlDocument.getElementById('option-error');
        expect(error?.innerHTML).toContain('Please select yes or no');
      });
    });

    describe('yes option selected', () => {
      let htmlDocument: Document;

      beforeAll(async () => {
        nock(idamUrl)
          .post('/o/token')
          .reply(200, {id_token: citizenRoleToken});
        app.locals.draftStoreClient = mockCivilClaim;
        const response = await request(app).post(DQ_DEFENDANT_CAN_STILL_EXAMINE_URL).send({option: 'yes'});
        const dom = new JSDOM(response.text);
        htmlDocument = dom.window.document;
      });

      it('should display Question 2 error in the error summary', () => {
        const error = htmlDocument.getElementsByClassName('govuk-error-summary__list')[0]
          .getElementsByTagName('li')[0];
        expect(error.innerHTML).toContain('Explain what there is to examine');
      });

      it('should display Question 2 error over text area', () => {
        const error = htmlDocument.getElementById('details-error');
        expect(error?.innerHTML).toContain('Explain what there is to examine');
      });
    });
  });
});
