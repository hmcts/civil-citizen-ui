import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../main/app';
import {DETERMINATION_WITHOUT_HEARING_URL} from '../../../../main/routes/urls';
import {mockCivilClaim} from '../../../utils/mockDraftStore';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store');

describe('Determination Without Hearing View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;

    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.draftStoreClient = mockCivilClaim;
      const response = await request(app).get(DETERMINATION_WITHOUT_HEARING_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should have page title', () => {
      expect(htmlDocument.title).toEqual('Your money claims account - Determination without hearing');
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain('Determination without Hearing Questions');
    });

    it('should display paragraph', () => {
      const expectedText = 'i.e. by a judge reading and considering the case papers, witness statements and other documents filled by the parties, making a decision, and giving a note of reason for that decision?';
      const paragraph = htmlDocument.getElementsByClassName('govuk-body')[0];
      expect(paragraph.innerHTML).toContain(expectedText);
    });

    it('should display bold text in paragraph', () => {
      const boldText = htmlDocument.getElementsByClassName('govuk-body')[0]
        .getElementsByClassName('govuk-!-font-weight-bold')[0];
      expect(boldText.innerHTML).toContain('Do you consider that this claim is suitable for determination without a hearing');
    });

    it('should display yes and no radios', () => {
      const radios = htmlDocument.getElementsByClassName('govuk-radios__input');
      expect(radios[0].getAttribute('value')).toBe('yes');
      expect(radios[1].getAttribute('value')).toBe('no');
    });

    it('should display text area if no radio is selected', () => {
      const noRadio = htmlDocument.getElementsByClassName('govuk-radios__input')[1];
      const textAreaLabel = htmlDocument.querySelector('label[for=reasonForHearing]');
      noRadio.setAttribute('aria-expanded', 'true');
      expect(textAreaLabel?.innerHTML).toContain('Tell us why');
    });

    it('should display save and continue button', () => {
      const saveButton = htmlDocument.getElementsByClassName('govuk-button')[0];
      expect(saveButton.innerHTML).toContain('Save and continue');
    });

    it('should display contact us for help', () => {
      const contactUsForHelp = htmlDocument.getElementsByClassName('govuk-details');
      expect(contactUsForHelp[0].innerHTML).toContain('Contact us for help');
    });
  });

  describe('on POST', () => {
    describe('no radio selected', () => {
      let htmlDocument: Document;
      const chooseOption = 'Choose option: Yes or No';

      beforeEach(async () => {
        nock(idamUrl)
          .post('/o/token')
          .reply(200, {id_token: citizenRoleToken});
        app.locals.draftStoreClient = mockCivilClaim;
        const response = await request(app).post(DETERMINATION_WITHOUT_HEARING_URL);
        const dom = new JSDOM(response.text);
        htmlDocument = dom.window.document;
      });

      it('should display error summary', () => {
        const errorSummary = htmlDocument.getElementsByClassName('govuk-error-summary__title')[0];
        expect(errorSummary.innerHTML).toContain('There was a problem');
      });

      it('should display choose option error in the error summary', () => {
        const error = htmlDocument.getElementsByClassName('govuk-error-summary__list')[0]
          .getElementsByTagName('li')[0];
        expect(error.innerHTML).toContain(chooseOption);
      });

      it('should display choose option error above radio buttons', () => {
        const error = htmlDocument.getElementById('isDeterminationWithoutHearing-error');
        expect(error?.innerHTML).toContain(chooseOption);
      });
    });

    describe('no option selected', () => {
      let htmlDocument: Document;
      const tellUsWhy = 'Please tell us why';

      beforeEach(async () => {
        nock(idamUrl)
          .post('/o/token')
          .reply(200, {id_token: citizenRoleToken});
        app.locals.draftStoreClient = mockCivilClaim;
        const response = await request(app).post(DETERMINATION_WITHOUT_HEARING_URL)
          .send({isDeterminationWithoutHearing: 'no'});
        const dom = new JSDOM(response.text);
        htmlDocument = dom.window.document;
      });

      it('should display tell us why error in the error summary', () => {
        const error = htmlDocument.getElementsByClassName('govuk-error-summary__list')[0]
          .getElementsByTagName('li')[0];
        expect(error.innerHTML).toContain(tellUsWhy);
      });

      it('should display tell us why error over text area', () => {
        const error = htmlDocument.getElementById('reasonForHearing-error');
        expect(error?.innerHTML).toContain(tellUsWhy);
      });
    });
  });
});
