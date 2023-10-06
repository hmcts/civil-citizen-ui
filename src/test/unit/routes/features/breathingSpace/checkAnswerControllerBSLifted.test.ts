import nock from 'nock';
import config from 'config';
import {getSummarySections} from 'services/features/breathingSpace/checkYourAnswer/checkYourAnswerServiceForBreathingSpaceLifted';
import {
  BREATHING_SPACE_RESPITE_LIFTED_CHECK_ANSWER_URL,
  BREATHING_SPACE_RESPITE_LIFTED_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {getElementsByXPath} from '../../../../utils/xpathExtractor';
import {app} from '../../../../../main/app';
import {SummarySection} from 'models/summaryList/summarySections';
import {submitBreathingSpaceLifted} from 'services/features/breathingSpace/submission/submitBreathingSpaceLifted';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

const session = require('supertest-session');

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/claimDetailsService');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/services/features/breathingSpace/breathingSpaceService');
jest.mock('../../../../../main/services/features/breathingSpace/checkYourAnswer/checkYourAnswerServiceForBreathingSpaceLifted');
jest.mock('../../../../../main/services/features/breathingSpace/submission/submitBreathingSpaceLifted');

const mockGetSummarySections = getSummarySections as jest.Mock;
const mockSubmitBreathingSpaceLifted = submitBreathingSpaceLifted as jest.Mock;

export function createDebtRespiteLifted(): SummarySection {
  return {
    title: '',
    summaryList: {
      rows: [
        {
          key: {
            text: 'Date lifted',
          },
          value: {
            html: '2 October 2023',
          },
          actions: {
            items: [
              {
                href: BREATHING_SPACE_RESPITE_LIFTED_URL,
                text: 'Change',
              },
            ],
          },
        },
      ],
    },
  };
}
export function getDebtRespiteLifted(): SummarySection {
  return {
    title: '',
    summaryList: {
      rows: [
        {
          key: {
            text: 'Date lifted',
          },
          value: {
            html: ' ',
          },
          actions: {
            items: [
              {
                href: BREATHING_SPACE_RESPITE_LIFTED_URL,
                text: 'Change',
              },
            ],
          },
        },
      ],
    },
  };
}

describe('Response - Check answers', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');
  const checkYourAnswerEng = 'Lift the debt respite scheme (breathing space)';

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {

    it('should return check answers page', async () => {
      mockGetSummarySections.mockImplementation(() => {
        return createDebtRespiteLifted();
      });

      const response = await session(app).get(BREATHING_SPACE_RESPITE_LIFTED_CHECK_ANSWER_URL);
      expect(response.status).toBe(200);

      const dom = new JSDOM(response.text);
      const htmlDocument = dom.window.document;

      const header = getElementsByXPath("//h1[@class='govuk-heading-l']", htmlDocument);

      const dateLifted = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Date lifted')]]",
        htmlDocument);

      expect(header.length).toBe(1);
      expect(header[0].textContent).toBe(checkYourAnswerEng);
      expect(dateLifted.length).toBe(1);
      expect(dateLifted[0].textContent?.trim()).toBe('2 October 2023');
    });

    it('should return empty check answers page', async () => {
      mockGetSummarySections.mockImplementation(() => {
        return getDebtRespiteLifted();
      });

      const response = await session(app).get(BREATHING_SPACE_RESPITE_LIFTED_CHECK_ANSWER_URL);
      expect(response.status).toBe(200);

      const dom = new JSDOM(response.text);
      const htmlDocument = dom.window.document;

      const header = getElementsByXPath("//h1[@class='govuk-heading-l']", htmlDocument);

      const dateLifted = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Date lifted')]]",
        htmlDocument);

      expect(header.length).toBe(1);
      expect(header[0].textContent).toBe(checkYourAnswerEng);
      expect(dateLifted.length).toBe(1);
      expect(dateLifted[0].textContent?.trim()).toBe('');
    });

    it('should return status 500 when error thrown', async () => {
      mockGetSummarySections.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await session(app)
        .get(BREATHING_SPACE_RESPITE_LIFTED_CHECK_ANSWER_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on Post', () => {
    it('should redirect dashboard claimant', async () => {
      await session(app)
        .post(BREATHING_SPACE_RESPITE_LIFTED_CHECK_ANSWER_URL)
        .send('data')
        .expect((res: Response) => {
          expect(res.status).toBe(302);
        });
    });

    it('should return status 500 when error thrown', async () => {
      mockSubmitBreathingSpaceLifted.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await session(app)
        .post(BREATHING_SPACE_RESPITE_LIFTED_CHECK_ANSWER_URL)
        .send('data')
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
