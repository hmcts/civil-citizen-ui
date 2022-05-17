import nock from 'nock';
import config from 'config';
import * as checkAnswersService from '../../../../../main/services/features/response/checkAnswersService';
import {
  CITIZEN_DETAILS_URL,
  RESPONSE_CHECK_ANSWERS_URL,
} from '../../../../../main/routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {SummarySections} from '../../../../../main/common/models/summaryList/summarySections';

const request = require('supertest');
const {app} = require('../../../../../main/app');

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/services/features/response/checkAnswersService');
const mockGetSummarySections = checkAnswersService.getSummarySections as jest.Mock;

const PARTY_NAME = 'Mrs. Marry Richards';
// const CONTACT_NUMBER = '077777777779';
const CLAIM_ID = 'aaa';

const respondentCheckAnswersUrl = RESPONSE_CHECK_ANSWERS_URL.replace(':id', CLAIM_ID);

describe('Response - Check answers', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeEach(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {

    test('should return check answers page', async () => {
      mockGetSummarySections.mockImplementation(() => {
        return createClaimWithBasicRespondentDetails();
      });
      await request(app)
        .get(respondentCheckAnswersUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Check your answers');
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

function createClaimWithBasicRespondentDetails(): Promise<SummarySections> {
  const summarySections = {
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
  return new Promise((resolve) => resolve(summarySections));
}
