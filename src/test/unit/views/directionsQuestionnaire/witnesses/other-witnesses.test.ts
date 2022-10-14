import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {mockCivilClaim} from '../../../../utils/mockDraftStore';
import {DQ_DEFENDANT_WITNESSES_URL} from '../../../../../main/routes/urls';
import {t} from 'i18next';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Other Witnesses view', () => {
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
      const response = await request(app).get(DQ_DEFENDANT_WITNESSES_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      mainWrapper = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0];
    });

    it('should have page title', () => {
      expect(htmlDocument.title).toEqual(`Your money claims account - ${t('PAGES.OTHER_WITNESSES.TITLE')}`);
    });

    it('should display the header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain(t('PAGES.OTHER_WITNESSES.PAGE_TITLE'));
    });

    it('should display labels', () => {
      const input = htmlDocument.getElementsByClassName('govuk-label');
      expect(input[0].innerHTML).toContain(t('COMMON.VARIATION.YES'));
      expect(input[1].innerHTML).toContain(t('PAGES.OTHER_WITNESSES.FIRST_NAME_LABEL'));
      expect(input[2].innerHTML).toContain(t('PAGES.OTHER_WITNESSES.LAST_NAME_LABEL'));
      expect(input[3].innerHTML).toContain(t('PAGES.OTHER_WITNESSES.EMAIL_LABEL'));
      expect(input[4].innerHTML).toContain(t('PAGES.OTHER_WITNESSES.PHONE_LABEL'));
      expect(input[5].innerHTML).toContain(t('PAGES.OTHER_WITNESSES.WHAT_THEY_WITNESSED_LABEL'));
      expect(input[6].innerHTML).toContain(t('COMMON.VARIATION.NO'));
    });

    it('should display paragraph', () => {
      const buttons = mainWrapper.getElementsByClassName('govuk-body');
      expect(buttons[0].innerHTML).toContain(t('PAGES.OTHER_WITNESSES.THIS_IS_SOMEONE_WHO_CAN_CONFIRM'));
    });

    it('should display save and continue button', () => {
      const buttons = mainWrapper.getElementsByClassName('govuk-button');
      expect(buttons[0].className).toContain('govuk-visually-hidden');
      expect(buttons[0].innerHTML).toContain(t('PAGES.OTHER_WITNESSES.REMOVE_WITNESS'));
      expect(buttons[1].innerHTML).toContain(t('PAGES.OTHER_WITNESSES.ADD_ANOTHER_WITNESS'));
      expect(buttons[2].innerHTML).toContain(t('COMMON.BUTTONS.SAVE_AND_CONTINUE'));
    });

    it('should display contact us for help', () => {
      const contactUs = htmlDocument.getElementsByClassName('govuk-details');
      expect(contactUs[0].innerHTML).toContain('Contact us for help');
    });
  });
});
