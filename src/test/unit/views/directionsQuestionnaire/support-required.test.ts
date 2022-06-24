import config from 'config';
import nock from 'nock';
import {app} from '../../../../main/app';
import request from 'supertest';
import {SUPPORT_REQUIRED_URL} from '../../../../main/routes/urls';
import {mockCivilClaim} from '../../../utils/mockDraftStore';

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

    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.draftStoreClient = mockCivilClaim;
      const response = await request(app).get(supportRequiredUrl);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should have page title', () => {
      expect(htmlDocument.title).toEqual(`Your money claims account - ${pageTitle}`);
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-fieldset__legend--l');
      expect(header[0].innerHTML).toContain('Select any support you’d require for a court hearing (optional)');
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

    it('should display Continue button', () => {
      const button = htmlDocument.getElementsByClassName('govuk-button');
      expect(button[0].innerHTML).toContain('Save and continue');
    });

    it('should display contact us forHelp', () => {
      const contactUsForHelp = htmlDocument.getElementsByClassName('govuk-details');
      expect(contactUsForHelp[0].innerHTML).toContain('Contact us for help');
    });
  });
});
