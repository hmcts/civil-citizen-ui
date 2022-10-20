import nock from 'nock';
import config from 'config';
import {getSummarySections,} from '../../../../../main/services/features/claim/checkAnswers/checkAnswersService';
import {
  CITIZEN_DETAILS_URL,
  CLAIM_CHECK_ANSWERS_URL,
  CLAIM_DEFENDANT_EMAIL_URL,
  CLAIM_DETAILS_URL
} from '../../../../../main/routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {SummarySections} from '../../../../../main/common/models/summaryList/summarySections';
import {getElementsByXPath} from '../../../../utils/xpathExtractor';
import {constructResponseUrlWithIdParams} from '../../../../../main/common/utils/urlFormatter';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

const request = require('supertest');
const {app} = require('../../../../../main/app');
const session = require('supertest-session');
const civilServiceUrl = config.get<string>('services.civilService.url');
const data = require('../../../../utils/mocks/defendantClaimsMock.json');
jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/claimDetailsService');
jest.mock('../../../../../main/services/features/claim/checkAnswers/checkAnswersService');

const mockGetSummarySections = getSummarySections as jest.Mock;

const PARTY_NAME = 'Mrs. Mary Richards';
const CLAIM_ID = 'aaa';

describe('Response - Check answers', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');
  const checkYourAnswerEng = 'Check your answers';
  const checkYourAnswerCy = 'Gwiriwch eich ateb';

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    nock(civilServiceUrl)
      .get('/cases/defendant/123')
      .reply(200, {data: data});
    nock(civilServiceUrl)
      .get('/cases/claimant/123')
      .reply(200, {data: data});
  });

  describe('on GET', () => {

    it('should return check answers page', async () => {
      mockGetSummarySections.mockImplementation(() => {
        return createClaimWithBasicRespondentDetails();
      });

      const response = await session(app).get(CLAIM_CHECK_ANSWERS_URL);
      expect(response.status).toBe(200);

      const dom = new JSDOM(response.text);
      const htmlDocument = dom.window.document;
      const header = getElementsByXPath("//h1[@class='govuk-heading-l']", htmlDocument);

      expect(header.length).toBe(1);
      expect(header[0].textContent).toBe(checkYourAnswerEng);

    });
    it('should return check answers page with Your details and their details sections', async () => {
      mockGetSummarySections.mockImplementation(() => {
        return createClaimWithBasicRespondentDetails();
      });

      const response = await session(app).get(CLAIM_CHECK_ANSWERS_URL);
      expect(response.status).toBe(200);

      const dom = new JSDOM(response.text);
      const htmlDocument = dom.window.document;
      const header = getElementsByXPath("//h1[@class='govuk-heading-l']", htmlDocument);
      const fullName = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Full name')]]",
        htmlDocument);
      const address = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Address')]]",
        htmlDocument);
      const correspondence = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Correspondence address')]]",
        htmlDocument);
      const contact = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Contact number (optional)')]]",
        htmlDocument);
      const email = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Email')]]",
        htmlDocument);

      expect(header.length).toBe(1);
      expect(header[0].textContent).toBe(checkYourAnswerEng);
      expect(fullName.length).toBe(2);
      expect(fullName[0].textContent?.trim()).toBe(PARTY_NAME);
      expect(fullName[1].textContent?.trim()).toBe(PARTY_NAME);
      expect(address.length).toBe(2);
      expect(address[0].textContent?.trim()).toBe('54 avenue');
      expect(address[1].textContent?.trim()).toBe('Simon street');
      expect(correspondence.length).toBe(1);
      expect(correspondence[0].textContent?.trim()).toBe('Same as address');
      expect(contact.length).toBe(2);
      expect(contact[0].textContent?.trim()).toBe('12345');
      expect(contact[1].textContent?.trim()).toBe('98765');
      expect(email.length).toBe(1);
      expect(email[0].textContent?.trim()).toBe('contact@gmail.com');

    });
    it('should pass english translation via query', async () => {
      await session(app).get(CLAIM_CHECK_ANSWERS_URL)
        .query({lang: 'en'})
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(checkYourAnswerEng);
        });
    });
    it('should pass cy translation via query', async () => {
      await session(app).get(CLAIM_CHECK_ANSWERS_URL)
        .query({lang: 'cy'})
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(checkYourAnswerCy);
        });
    });

    it('should return status 500 when error thrown', async () => {
      mockGetSummarySections.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await session(app)
        .get(CLAIM_CHECK_ANSWERS_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on Post', () => {
    it('should return 500 when error in service', async () => {
      await request(app)
        .post(CLAIM_CHECK_ANSWERS_URL)
        .send(data)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});

export function createClaimWithBasicRespondentDetails(): SummarySections {
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
                href: CLAIM_DETAILS_URL,
                text: 'Change',
              }
              ],
            },
          },
          {
            key: {
              text: 'Contact person',
            },
            value: {
              text: 'Contact',
            },
            actions: {
              items: [{
                href: CLAIM_DETAILS_URL,
                text: 'Change',
              }
              ],
            },
          },
          {
            key: {
              text: 'Address',
            },
            value: {
              text: '54 avenue',
            },
            actions: {
              items: [{
                href: CLAIM_DETAILS_URL,
                text: 'Change',
              }
              ],
            },
          },
          {
            key: {
              text: 'Correspondence address',
            },
            value: {
              text: 'Same as address',
            },
            actions: {
              items: [{
                href: CLAIM_DETAILS_URL,
                text: 'Change',
              }
              ],
            },
          },
          {
            key: {
              text: 'Contact number (optional)',
            },
            value: {
              text: '12345',
            },
            actions: {
              items: [{
                href: CLAIM_DETAILS_URL,
                text: 'Change',
              }
              ],
            },
          },
        ],
      },
    },
      {
        title: 'Their details',
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
                  href: constructResponseUrlWithIdParams(CLAIM_ID, CITIZEN_DETAILS_URL),
                  text: 'Change',
                }
                ],
              }
            },
            {
              key: {
                text: 'Address',
              },
              value: {
                text: 'Simon street',
              },
              actions: {
                items: [{
                  href: constructResponseUrlWithIdParams(CLAIM_ID, CITIZEN_DETAILS_URL),
                  text: 'Change',
                }
                ],
              }
            },
            {
              key: {
                text: 'Email',
              },
              value: {
                text: 'contact@gmail.com',
              },
              actions: {
                items: [{
                  href: constructResponseUrlWithIdParams(CLAIM_ID, CLAIM_DEFENDANT_EMAIL_URL),
                  text: 'Change',
                }
                ],
              }
            },
            {
              key: {
                text: 'Contact number (optional)',
              },
              value: {
                text: '98765',
              },
              actions: {
                items: [{
                  href: constructResponseUrlWithIdParams(CLAIM_ID, CITIZEN_DETAILS_URL),
                  text: 'Change',
                }
                ],
              }
            }
          ]
        }
      }
    ]
  };
}
