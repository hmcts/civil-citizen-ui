import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {CLAIM_CLAIMANT_INDIVIDUAL_DETAILS_URL} from '../../../../../main/routes/urls';
import {t} from 'i18next';
import {mockCivilClaim} from '../../../../utils/mockDraftStore';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const pageTitle = 'PAGES.CLAIM_JOURNEY.CLAIMANT_INDIVIDUAL_DETAILS.PAGE_TITLE';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Claimant Individual Details View', () => {
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
      const response = await request(app).get(CLAIM_CLAIMANT_INDIVIDUAL_DETAILS_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      mainWrapper = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0];
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual(`Your money claims account - ${t(pageTitle)}`);
    });

    it('should display Save and continue button', () => {
      const button = mainWrapper.getElementsByClassName('govuk-button')[2];
      expect(button.innerHTML).toContain(t('COMMON.BUTTONS.SAVE_AND_CONTINUE'));
    });

  });
});
