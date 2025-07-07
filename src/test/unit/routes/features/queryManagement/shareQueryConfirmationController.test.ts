import request from 'supertest';
import {app} from '../../../../../main/app';
import {QM_SHARE_QUERY_CONFIRMATION} from 'routes/urls';
import nock from 'nock';
import config from 'config';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import {CaseRole} from 'form/models/caseRoles';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {getCancelUrl} from 'services/features/queryManagement/queryManagementService';

jest.mock('../../../../../main/modules/oidc');

const civilServiceUrl = config.get<string>('services.civilService.url');
const claimId = '12345';
const claim = require('../../../../utils/mocks/civilClaimResponseMock.json');

jest.mock('services/features/queryManagement/queryManagementService', () => ({
  getCancelUrl: jest.fn(),
}));

describe('Share query confirmation controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  beforeEach(() => {
    nock(civilServiceUrl)
      .get(CIVIL_SERVICE_CASES_URL + claimId + '/userCaseRoles')
      .reply(200, [CaseRole.CLAIMANT]);
  });

  describe('GET', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should render share query confirmation page', async () => {

      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);

      await request(app)
        .get(QM_SHARE_QUERY_CONFIRMATION.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Send a message');
          expect(res.text).toContain('Sharing this message with the other party');
          expect(res.text).toContain('All messages sent using this system are shared with the other party in the case as well as being sent to the court.');
          expect(res.text).toContain('Asking not to share your message');
          expect(res.text).toContain('You can ask not to share your message with the other party. The reasons for not sharing your message must be valid and the judge may decide that your message should be shared.');
          expect(res.text).toContain('Valid reasons for keeping a message between you and the court include the message being about:');
          expect(res.text).toContain('a request for a reasonable adjustment');
          expect(res.text).toContain('your health');
          expect(res.text).toContain('If you need to send a message to the court and you do not want the other party to see it, email ');
          expect(res.text).toContain('contactocmc@justice.gov.uk');
          expect(res.text).toContain('Explain why the message should be kept between you and the court and make sure you include your full name and claim number.');
          expect(res.text).toContain('Confirm your message can be shared');
          expect(res.text).toContain('Yes, I agree my message can be shared with the other party');
        });
    });

    it('should return http 500 when has error', async () => {
      (getCancelUrl as jest.Mock).mockImplementation(() => {
        throw new Error('Forced error');
      });
      await request(app)
        .get(QM_SHARE_QUERY_CONFIRMATION.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('POST', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should return error on now confirmation', async () => {
      await request(app)
        .post(QM_SHARE_QUERY_CONFIRMATION.replace(':id', claimId))
        .send({ confirmed: '' })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('To continue you must select that your message can be shared. If you do not want to share your message, email the court.');
        });
    });

    it('should redirect to create query page when confirmation selected', async () => {
      await request(app)
        .post(QM_SHARE_QUERY_CONFIRMATION.replace(':id', claimId))
        .send({ confirmed: 'yes' })
        .expect(302)
        .expect('Location', `/case/${claimId}/qm/create-query`);
    });
  });
});
