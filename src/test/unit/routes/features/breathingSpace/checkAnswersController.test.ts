import nock from 'nock';
import config from 'config';
import {getSummarySections} from 'services/features/breathingSpace/checkYourAnswer/checkAnswersService';
import {BREATHING_SPACE_RESPITE_CHECK_ANSWERS_URL} from '../../../../../main/routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {getElementsByXPath} from '../../../../utils/xpathExtractor';
import {SummarySections} from '../../../../../main/common/models/summaryList/summarySections';
import { NextFunction, Request } from 'express';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

const {app} = require('../../../../../main/app');
const session = require('supertest-session');

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/claimDetailsService');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/services/features/breathingSpace/breathingSpaceService');
jest.mock('../../../../../main/services/features/breathingSpace/checkYourAnswer/checkAnswersService');
jest.mock('../../../../../main/services/features/breathingSpace/submission/submitBreathingSpace');
jest.mock('../../../../../main/routes/guards/breathingSpaceGuard', () => ({ breathingSpaceGuard: (req: Request, res: Response, next: NextFunction) => { next(); } }));
const mockGetSummarySections = getSummarySections as jest.Mock;

export function getDebtRespite(): SummarySections {
  return {
    sections: [
      {
        title: '',
        summaryList: {
          rows: [
            {
              key: {
                text: 'Reference number',
              },
              value: {
                html: '',
              },
              actions: {
                items: [
                  {
                    href: BREATHING_SPACE_RESPITE_CHECK_ANSWERS_URL,
                    text: 'Change',
                  },
                ],
              },
            },
            {
              key: {
                text: 'When did it start',
              },
              value: {
                html: '',
              },
              actions: {
                items: [
                  {
                    href: BREATHING_SPACE_RESPITE_CHECK_ANSWERS_URL,
                    text: 'Change',
                  },
                ],
              },
            },
            {
              key: {
                text: 'What type is it',
              },
              value: {
                html: '',
              },
              actions: {
                items: [
                  {
                    href: BREATHING_SPACE_RESPITE_CHECK_ANSWERS_URL,
                    text: 'Change',
                  },
                ],
              },
            },
            {
              key: {
                text: 'Expected end date',
              },
              value: {
                html: '',
              },
              actions: {
                items: [
                  {
                    href: BREATHING_SPACE_RESPITE_CHECK_ANSWERS_URL,
                    text: 'Change',
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  };
}

const data = {_csrf: 'oAu8p5bV-glpP78Yowsar_iK4UPB4fKSSXCc'};

describe('Response - Check answers', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');
  const checkYourAnswerEng = 'Check your answers before submitting';

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {

    it('should return check answers page empty', async () => {
      mockGetSummarySections.mockImplementation(() => {
        return getDebtRespite();
      });

      const response = await session(app).get(BREATHING_SPACE_RESPITE_CHECK_ANSWERS_URL);
      expect(response.status).toBe(200);

      const dom = new JSDOM(response.text);
      const htmlDocument = dom.window.document;

      const header = getElementsByXPath("//h1[@class='govuk-heading-l']", htmlDocument);

      const referenceNumber = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Reference number')]]",
        htmlDocument);

      const whenDidItStart = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'When did it start')]]",
        htmlDocument);

      const whatTypeIsIt = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'What type is it')]]",
        htmlDocument);

      const expectedEndDate = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Expected end date')]]",
        htmlDocument);

      expect(header.length).toBe(1);
      expect(header[0].textContent).toBe(checkYourAnswerEng);
      expect(referenceNumber.length).toBe(1);
      expect(referenceNumber[0].textContent?.trim()).toBe('');
      expect(whenDidItStart.length).toBe(1);
      expect(whenDidItStart[0].textContent?.trim()).toBe('');
      expect(whatTypeIsIt.length).toBe(1);
      expect(whatTypeIsIt[0].textContent?.trim()).toBe('');
      expect(expectedEndDate.length).toBe(1);
      expect(expectedEndDate[0].textContent?.trim()).toBe('');
    });

    it('should return check answers page', async () => {
      mockGetSummarySections.mockImplementation(() => {
        return createDebtRespite();
      });

      const response = await session(app).get(BREATHING_SPACE_RESPITE_CHECK_ANSWERS_URL);
      expect(response.status).toBe(200);

      const dom = new JSDOM(response.text);
      const htmlDocument = dom.window.document;

      const header = getElementsByXPath("//h1[@class='govuk-heading-l']", htmlDocument);

      const referenceNumber = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Reference number')]]",
        htmlDocument);

      const whenDidItStart = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'When did it start')]]",
        htmlDocument);

      const whatTypeIsIt = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'What type is it')]]",
        htmlDocument);

      const expectedEndDate = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Expected end date')]]",
        htmlDocument);

      expect(header.length).toBe(1);
      expect(header[0].textContent).toBe(checkYourAnswerEng);
      expect(referenceNumber.length).toBe(1);
      expect(referenceNumber[0].textContent?.trim()).toBe('123');
      expect(whenDidItStart.length).toBe(1);
      expect(whenDidItStart[0].textContent?.trim()).toBe('1 November 2022');
      expect(whatTypeIsIt.length).toBe(1);
      expect(whatTypeIsIt[0].textContent?.trim()).toBe('Standard breathing space');
      expect(expectedEndDate.length).toBe(1);
      expect(expectedEndDate[0].textContent?.trim()).toBe('1 January 2023');
    });

    it('should pass english translation via query', async () => {
      await session(app).get(BREATHING_SPACE_RESPITE_CHECK_ANSWERS_URL)
        .query({lang: 'en'})
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(checkYourAnswerEng);
        });
    });
    it('should return status 500 when error thrown', async () => {
      mockGetSummarySections.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await session(app)
        .get(BREATHING_SPACE_RESPITE_CHECK_ANSWERS_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on Post', () => {
    it('should redirect dashboard claimant', async () => {
      await session(app)
        .post(BREATHING_SPACE_RESPITE_CHECK_ANSWERS_URL)
        .send(data)
        .expect((res: Response) => {
          expect(res.status).toBe(302);
        });
    });
  });
});

export function createDebtRespite(): SummarySections {
  return {
    sections: [
      {
        title: '',
        summaryList: {
          rows: [
            {
              key: {
                text: 'Reference number',
              },
              value: {
                html: '123',
              },
              actions: {
                items: [
                  {
                    href: BREATHING_SPACE_RESPITE_CHECK_ANSWERS_URL,
                    text: 'Change',
                  },
                ],
              },
            },
            {
              key: {
                text: 'When did it start',
              },
              value: {
                html: '1 November 2022',
              },
              actions: {
                items: [
                  {
                    href: BREATHING_SPACE_RESPITE_CHECK_ANSWERS_URL,
                    text: 'Change',
                  },
                ],
              },
            },
            {
              key: {
                text: 'What type is it',
              },
              value: {
                html: 'Standard breathing space	',
              },
              actions: {
                items: [
                  {
                    href: BREATHING_SPACE_RESPITE_CHECK_ANSWERS_URL,
                    text: 'Change',
                  },
                ],
              },
            },
            {
              key: {
                text: 'Expected end date',
              },
              value: {
                html: '1 January 2023',
              },
              actions: {
                items: [
                  {
                    href: BREATHING_SPACE_RESPITE_CHECK_ANSWERS_URL,
                    text: 'Change',
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  };
}
