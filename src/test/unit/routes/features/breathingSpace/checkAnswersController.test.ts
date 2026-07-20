import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CYA_LIFT_BREATHING_SPACE_URL, LIFT_BREATHING_SPACE_EXIT_URL} from '../../../../../main/routes/urls';
import {getClaimById} from '../../../../../main/modules/utilityService';
import {getSummaryRows} from '../../../../../main/services/features/breathingSpace/checkAnswersService';
import {Claim} from '../../../../../main/common/models/claim';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/utilityService');
jest.mock('../../../../../main/services/features/breathingSpace/checkAnswersService');

const mockGetClaimById = getClaimById as jest.Mock;
const mockGetSummaryRows = getSummaryRows as jest.Mock;

describe('Lift Breathing Space Check Answers Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return check answers page', async () => {
      const claim = new Claim();
      mockGetClaimById.mockResolvedValue(claim);
      mockGetSummaryRows.mockReturnValue([]);

      await request(app)
        .get(CYA_LIFT_BREATHING_SPACE_URL.replace(':id', '123'))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Check your answers');
        });
    });

    it('should return 500 status code when error occurs', async () => {
      mockGetClaimById.mockRejectedValue(new Error('Test error'));

      await request(app)
        .get(CYA_LIFT_BREATHING_SPACE_URL.replace(':id', '123'))
        .expect((res) => {
          expect(res.status).toBe(500);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect to exit page', async () => {
      await request(app)
        .post(CYA_LIFT_BREATHING_SPACE_URL.replace(':id', '123'))
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toContain(LIFT_BREATHING_SPACE_EXIT_URL.replace(':id', '123'));
        });
    });
  });
});
