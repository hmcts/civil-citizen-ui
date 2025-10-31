import {app} from '../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {CIVIL_SERVICE_CALCULATE_DEADLINE} from '../../../../../../main/app/client/civilServiceUrls';
import {getCaseDataFromStore} from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../../main/common/models/claim';
import {RESPONSE_TASK_LIST_URL, NEW_RESPONSE_DEADLINE_URL} from '../../../../../../main/routes/urls';
import {PartyType} from '../../../../../../main/common/models/partyType';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import { isCUIReleaseTwoEnabled } from 'app/auth/launchdarkly/launchDarklyClient';
import {AppSession, UserDetails} from 'models/AppRequest';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');

const mockGetCaseDataFromStore = getCaseDataFromStore as jest.Mock;

describe('Response - New response deadline', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');
  const citizenBaseUrl: string = config.get('services.civilService.url');
  const extendedDate = new Date(2022, 9, 31);
  const claim = new Claim();
  claim.applicant1 = {
    partyDetails: {
      partyName: 'Mr. James Bond',
    },
    type: PartyType.INDIVIDUAL,
  };
  claim.responseDeadline = {
    agreedResponseDeadline: extendedDate,
    calculatedResponseDeadline: extendedDate,
  };

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    nock('http://localhost:4000')
      .post(CIVIL_SERVICE_CALCULATE_DEADLINE)
      .reply(200, new Date(2022, 9, 31));
  });

  beforeEach(() => {
    (isCUIReleaseTwoEnabled as jest.Mock).mockReturnValueOnce(false);
  });

  describe('on GET', () => {
    it('should return new deadline date successfully', async () => {
      const expectedDate = '31 October 2022';

      mockGetCaseDataFromStore.mockImplementation(async () => claim);
      await request(app).get(NEW_RESPONSE_DEADLINE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(expectedDate);
          expect(res.text).toContain(claim.getClaimantFullName());
        });
    });
    it('should show error when proposed extended deadline does not exist', async () => {
      claim.responseDeadline.agreedResponseDeadline = undefined;
      mockGetCaseDataFromStore.mockImplementation(async () => claim);
      await request(app).get(NEW_RESPONSE_DEADLINE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
    it('should show error when draft store throws error', async () => {
      mockGetCaseDataFromStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app).get(NEW_RESPONSE_DEADLINE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('On Post', () => {
    it('should redirect to task list successfully', async () => {
      nock(citizenBaseUrl)
        .post('/cases/:id/citizen/1234/event')
        .reply(200, {});
      mockGetCaseDataFromStore.mockImplementation(async () => claim);
      app.request.session = <AppSession>{user: <UserDetails>{id: '1234'}};

      await request(app).post(NEW_RESPONSE_DEADLINE_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should show error when there is error with the call to submit event', async () => {
      nock(citizenBaseUrl)
        .post('/cases/:id/citizen/1234/event')
        .reply(500, {error: 'error'});
      app.request.session = <AppSession>{user: <UserDetails>{id: '1234'}};
      await request(app).post(NEW_RESPONSE_DEADLINE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
