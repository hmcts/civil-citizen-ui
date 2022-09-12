import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {ELIGIBILITY_HELP_WITH_FEES} from '../../../../../../main/routes/urls';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
jest.mock('../../../../../../main/modules/oidc');

describe('Apply For Help With Fees View', () => {
  // TODO: remove this once paths become publicly available as mocking the response token will not be needed
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      const response = await request(app).get(ELIGIBILITY_HELP_WITH_FEES);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual('Your money claims account - Apply For Help With Fees');
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain('Apply For Help With Fees');
    });

    it('should display texts', () => {
      const body = htmlDocument.getElementsByClassName('govuk-body-m');
      expect(body[0].innerHTML).toContain('If you have already applied for Help with Fees in respect of');
      expect(body[0].innerHTML).toContain('THIS CLAIM,');
      expect(body[0].innerHTML).toContain('you may already have a reference number. If so, you can save and continue and enter it when asked. Do not use a number related to a different claim. If you don’t have a Help with Fees number for this claim, please follow the instructions below.');
      expect(body[1].innerHTML).toContain('Apply For Help With Fees');
      expect(body[2].innerHTML).toContain('If you need to use the paper Help with Fees application rather than the online version, you will not be able to use Online Civil Money Claims to issue your claim.');
      expect(body[3].innerHTML).toContain('When you apply for Help with Fees you will be asked for the number on your court or tribunal form. Please note that this is N1.');
      expect(body[4].innerHTML).toContain('When you have completed your Help with Fees application, you will be given a reference number. Please note the number and keep it safe. You will need it later in the claim process. Then return to this page and click the Save and continue box below so that you can start the claim.');
    });

    it('should display Save and continue button', () => {
      const buttons = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0].getElementsByClassName('govuk-button');
      expect(buttons[0].innerHTML).toContain('Save and continue');
    });

    it('should contain Contact us detail component', () => {
      const contactUs = htmlDocument.getElementsByClassName('govuk-details__summary-text');
      expect(contactUs[0].innerHTML).toContain('Contact us for help');
    });
  });
});
