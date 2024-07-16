import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {UNDERSTANDING_RESPONSE_OPTIONS_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import { isCUIReleaseTwoEnabled } from 'app/auth/launchdarkly/launchDarklyClient';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import civilClaimResponseMock from '../../../../utils/mocks/civilClaimResponseMock.json';
import civilClaimResponseFullAdmissionMock from '../../../../utils/mocks/civilClaimResponseFullAdmissionMock.json';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('modules/draft-store/draftStoreService');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Understanding Your Options Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  beforeEach(() => {
    (isCUIReleaseTwoEnabled as jest.Mock).mockReturnValueOnce(false);
    mockGetCaseData.mockImplementation(async () => {
      return Object.assign(new Claim(), civilClaimResponseMock.case_data);
    });
  });

  describe('on GET', () => {
    it('should return understanding you options page successfully', async () => {
      await request(app)
        .get(UNDERSTANDING_RESPONSE_OPTIONS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Requesting extra time');
        });
    });

    it('should pass welsh translation via query', async () => {
      await request(app).get(UNDERSTANDING_RESPONSE_OPTIONS_URL)
        .query({lang: 'cy'})
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Gwneud cais am ragor o amser');
        });
    });
    it('should pass english translation via query', async () => {
      await request(app).get(UNDERSTANDING_RESPONSE_OPTIONS_URL)
        .query({lang: 'en'})
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Requesting extra time');
        });
    });

    it('should pass welsh translation via cookie', async () => {
      await request(app).get(UNDERSTANDING_RESPONSE_OPTIONS_URL)
        .set('Cookie', ['lang=cy'])
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Gwneud cais am ragor o amser');
        });
    });

    it('should pass english translation via cookie', async () => {
      await request(app).get(UNDERSTANDING_RESPONSE_OPTIONS_URL)
        .set('Cookie', ['lang=en'])
        .query({lang: 'en'})
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Requesting extra time');
        });
    });

    it('should return understanding you options page when response deadline date is not set', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseFullAdmissionMock.case_data);
      });
      await request(app).get(UNDERSTANDING_RESPONSE_OPTIONS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Requesting extra time');
      });
    });

    it('should return an error page if request fails', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app).get(UNDERSTANDING_RESPONSE_OPTIONS_URL).expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });
  });
});
