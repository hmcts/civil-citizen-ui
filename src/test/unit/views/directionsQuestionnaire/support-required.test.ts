import config from 'config';
import nock from 'nock';
import {app} from '../../../../main/app';
import request from 'supertest';
import {SUPPORT_REQUIRED_URL} from '../../../../main/routes/urls';
import {mockCivilClaimWithExpertAndWitness} from '../../../utils/mockDraftStore';
import {YesNo} from '../../../../main/common/form/models/yesNo';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const pageTitle = 'Support required';

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store');

const supportRequiredUrl = SUPPORT_REQUIRED_URL.replace(':id', 'aaa');

describe('Support required View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    let mainWrapper: Element;

    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.draftStoreClient = mockCivilClaimWithExpertAndWitness;
      const response = await request(app).get(supportRequiredUrl);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      mainWrapper = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0];
    });

    it('should have page title', () => {
      expect(htmlDocument.title).toEqual(`Your money claims account - ${pageTitle}`);
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-fieldset__legend--l');
      expect(header[0].innerHTML).toContain('Do you, your experts or witnesses need support to attend a hearing');
    });

    it('should display yes/no radio buttons', () => {
      const radios = htmlDocument.getElementsByClassName('govuk-radios__input');
      expect(radios[0].getAttribute('value')).toBe(YesNo.YES);
      expect(radios[1].getAttribute('value')).toBe(YesNo.NO);
    });

    it('should display fieldset name as Person', () => {
      const fieldSet = htmlDocument.getElementsByClassName('govuk-fieldset__legend')[1];
      expect(fieldSet.innerHTML).toContain('Person');
    });

    it('should display name dropdown with option', () => {
      const nameLabel = htmlDocument.getElementsByClassName('govuk-label')[1];
      const dropDown = htmlDocument.getElementsByClassName('govuk-select')[0] as HTMLSelectElement;
      expect(nameLabel.innerHTML).toContain('Name of the person who needs support');
      expect(dropDown?.options[0].text).toContain('Choose the name of the person');
    });

    it('should dropdown hint', () => {
      const hint = htmlDocument.getElementsByClassName('govuk-hint')[1];
      expect(hint.innerHTML).toContain('Select all that apply.');
    });

    it('should display 5 checkboxes with various options', () => {
      const checkboxes = htmlDocument.getElementsByClassName('govuk-checkboxes__item');
      expect(checkboxes.length).toEqual(5);
      expect(checkboxes[0].innerHTML).toContain('Disabled access');
      expect(checkboxes[1].innerHTML).toContain('Hearing loop');
      expect(checkboxes[2].innerHTML).toContain('Sign language interpreter');
      expect(checkboxes[3].innerHTML).toContain('Language interpreter');
      expect(checkboxes[4].innerHTML).toContain('Other support');
    });

    it('should display action buttons', () => {
      const buttons = mainWrapper.getElementsByClassName('govuk-button');
      expect(buttons[0].innerHTML).toContain('Remove');
      expect(buttons[1].innerHTML).toContain('Add another person');
      expect(buttons[2].innerHTML).toContain('Save and continue');
    });

    it('should display contact us forHelp', () => {
      const contactUsForHelp = htmlDocument.getElementsByClassName('govuk-details');
      expect(contactUsForHelp[0].innerHTML).toContain('Contact us for help');
    });
  });

  describe('on POST', () => {
    let htmlDocument: Document;
    beforeEach(async () => {
      const response = await request(app).post(SUPPORT_REQUIRED_URL)
        .send({
          option: YesNo.YES,
          model: {
            items: [{
              fullName: '',
            }],
          },
        });
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should display error summary', () => {
      const errorSummaryTitle = htmlDocument.getElementsByClassName('govuk-error-summary__title')[0];
      const errorSummaryMessages = htmlDocument.getElementsByClassName('govuk-error-summary__list')[0]
        .getElementsByTagName('li');
      expect(errorSummaryTitle.innerHTML).toContain('There was a problem');
      expect(errorSummaryMessages[2].innerHTML).toContain('Enter the name of the person who needs support');
      expect(errorSummaryMessages[2].getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('model[items][0][fullName]');
      expect(errorSummaryMessages[3].innerHTML).toContain('Select the support the person needs to attend a hearing');
      expect(errorSummaryMessages[3].getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('model[items][0][checkboxGrp]');
    });

    it('should display from group errors', () => {
      const formGroupErrors = htmlDocument.getElementsByClassName('govuk-form-group--error');
      const firstError = formGroupErrors[0].getElementsByClassName('govuk-error-message');
      const secondError = formGroupErrors[1].getElementsByClassName('govuk-error-message');
      expect(formGroupErrors.length).toBe(2);
      expect(firstError[0].innerHTML).toContain('Enter the name of the person who needs support');
      expect(secondError[0].innerHTML).toContain('Select the support the person needs to attend a hearing');
    });
  });
});
