import config from 'config';
import nock from 'nock';
import {app} from '../../../../../main/app';
import request from 'supertest';
import {RESPONSE_YOUR_DEFENCE_URL} from '../../../../../main/routes/urls';
import {mockCivilClaimApplicantCompanyType} from '../../../../utils/mockDraftStore';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const govukBodyClass = 'govuk-body';
const pageTitle = 'Money Claims';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('your defence View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    let paragraphs: HTMLCollection;

    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.draftStoreClient = mockCivilClaimApplicantCompanyType;
      const response = await request(app).get(RESPONSE_YOUR_DEFENCE_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      paragraphs = htmlDocument.getElementsByClassName(govukBodyClass);
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual(`Your money claims account - ${pageTitle}`);
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain('Why do you disagree with the claim?');
    });

    it('should display automatically registered paragraph', () => {
      expect(paragraphs[1].innerHTML).toContain('If you fail to dispute any part of the claim the court may assume you admit it.');
      expect(paragraphs[2].innerHTML).toContain('You should also say if you accept any parts of the claim.');
      expect(paragraphs[3].innerHTML).toContain('Don’t give us a detailed timeline - we’ll ask for that separately.');
      expect(paragraphs[4].innerHTML).toContain('Your response will be sent to');
      const bold = htmlDocument.getElementsByClassName('govuk-!-font-weight-bold');
      expect(bold[0].innerHTML).toContain('Their reasons for making the claim');
      expect(bold[1].innerHTML).toContain('Briefly explain why you disagree with the claim');
    });
  });
});
