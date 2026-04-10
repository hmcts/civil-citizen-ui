import {app} from '../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {Claim} from '../../../../../../main/common/models/claim';
import {RESPONSE_TASK_LIST_URL, NEW_RESPONSE_DEADLINE_URL} from '../../../../../../main/routes/urls';
import {PartyType} from '../../../../../../main/common/models/partyType';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {AppSession, UserDetails} from 'models/AppRequest';
import {
  getClaimWithExtendedResponseDeadline,
  submitExtendedResponseDeadline,
} from '../../../../../../main/services/features/response/responseDeadline/extendResponseDeadlineService';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../main/services/features/response/responseDeadline/extendResponseDeadlineService');

const mockGetClaimWithExtendedResponseDeadline = getClaimWithExtendedResponseDeadline as jest.Mock;
const mockSubmitExtendedResponseDeadline = submitExtendedResponseDeadline as jest.Mock;

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
  });

  describe('on GET', () => {
    it('should return new deadline date successfully', async () => {
      const expectedDate = '31 October 2022';
      mockGetClaimWithExtendedResponseDeadline.mockResolvedValue(claim);
      await request(app).get(NEW_RESPONSE_DEADLINE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(expectedDate);
          expect(res.text).toContain(claim.getClaimantFullName());
        });
    });
    it('should show error when proposed extended deadline does not exist', async () => {
      claim.responseDeadline.agreedResponseDeadline = undefined;
      mockGetClaimWithExtendedResponseDeadline.mockRejectedValue(new Error('No extended response deadline found'));
      await request(app).get(NEW_RESPONSE_DEADLINE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
    it('should show error when draft store throws error', async () => {
      mockGetClaimWithExtendedResponseDeadline.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      await request(app).get(NEW_RESPONSE_DEADLINE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('On Post', () => {
    it('should redirect to task list successfully', async () => {
      mockSubmitExtendedResponseDeadline.mockResolvedValue(undefined);
      app.request.session = <AppSession>{user: <UserDetails>{id: '1234'}};

      await request(app).post(NEW_RESPONSE_DEADLINE_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should show error when there is error with the call to submit event', async () => {
      mockSubmitExtendedResponseDeadline.mockRejectedValue(new Error('error'));
      app.request.session = <AppSession>{user: <UserDetails>{id: '1234'}};
      await request(app).post(NEW_RESPONSE_DEADLINE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
