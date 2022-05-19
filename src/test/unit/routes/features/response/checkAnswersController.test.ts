import nock from 'nock';
import config from 'config';
import * as checkAnswersService from '../../../../../main/services/features/response/checkAnswersService';
import {CITIZEN_DETAILS_URL, RESPONSE_CHECK_ANSWERS_URL} from '../../../../../main/routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {SummarySections} from '../../../../../main/common/models/summaryList/summarySections';
import {getElementsByXPath} from '../../../../utils/xpathExtractor';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;


const request = require('supertest');
const {app} = require('../../../../../main/app');

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/services/features/response/checkAnswersService');
const mockGetSummarySections = checkAnswersService.getSummarySections as jest.Mock;

const PARTY_NAME = 'Mrs. Mary Richards';
const CLAIM_ID = 'aaa';

const respondentCheckAnswersUrl = RESPONSE_CHECK_ANSWERS_URL.replace(':id', CLAIM_ID);

describe('Response - Check answers', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');
  const checkYourAnswerEng = 'Check your answers';
  const checkYourAnswerCy = 'Gwiriwch eich ateb';
  beforeEach(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    mockGetSummarySections.mockImplementation(() => {
      return createClaimWithBasicRespondentDetails();
    });
  });

  describe('on GET', () => {
    test('should return check answers page', async () => {
      const response = await request(app).get(respondentCheckAnswersUrl);
      expect(response.status).toBe(200);

      const dom = new JSDOM(response.text);
      const htmlDocument = dom.window.document;
      const header = getElementsByXPath("//h1[@class='govuk-heading-l']", htmlDocument);
      const fullName = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Full name')]]",
        htmlDocument);

      expect(header.length).toBe(1);
      expect(header[0].textContent).toBe(checkYourAnswerEng);
      expect(fullName.length).toBe(1);
      expect(fullName[0].textContent?.trim()).toBe(PARTY_NAME);

    });
    test('should pass english translation via query', async () => {
      await request(app).get(respondentCheckAnswersUrl)
        .query({lang: 'en'})
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(checkYourAnswerEng);
        });
    });
    test('should pass cy translation via query', async () => {
      await request(app).get(respondentCheckAnswersUrl)
        .query({lang: 'cy'})
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(checkYourAnswerCy);
        });
    });
    test('should return status 500 when error thrown', async () => {
      mockGetSummarySections.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(respondentCheckAnswersUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({error: TestMessages.REDIS_FAILURE});
        });
    });
  });
});

function createClaimWithBasicRespondentDetails(): SummarySections {
  return {
    sections: [{
      title: 'Your details',
      summaryList: {
        rows: [
          {
            key: {
              text: 'Full name',
            },
            value: {
              text: PARTY_NAME,
            },
            actions: {
              items: [{
                href: CITIZEN_DETAILS_URL.replace(':id', CLAIM_ID),
                text: 'Change',
              }],
            },
          },
        ],
      },
    }],
  };
}
