import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {LIFT_BREATHING_SPACE_URL, DASHBOARD_CLAIMANT_URL} from '../../../../../main/routes/urls';
import {getClaimById} from '../../../../../main/modules/utilityService';
import {getLiftBreathingSpaceForm, saveLiftBreathingSpace} from '../../../../../main/services/features/breathingSpace/liftBreathingSpaceService';
import {Claim} from '../../../../../main/common/models/claim';
import {LiftBreathingSpaceForm} from '../../../../../main/common/form/models/breathingSpace/liftBreathingSpaceForm';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/utilityService');
jest.mock('../../../../../main/services/features/breathingSpace/liftBreathingSpaceService');

const mockGetClaimById = getClaimById as jest.Mock;
const mockGetLiftBreathingSpaceForm = getLiftBreathingSpaceForm as jest.Mock;
const mockSaveLiftBreathingSpace = saveLiftBreathingSpace as jest.Mock;

describe('Lift Breathing Space Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return lift breathing space page', async () => {
      const claim = new Claim();
      claim.totalClaimAmount = 1000;
      mockGetClaimById.mockResolvedValue(claim);
      mockGetLiftBreathingSpaceForm.mockResolvedValue(new LiftBreathingSpaceForm());

      await request(app)
        .get(LIFT_BREATHING_SPACE_URL.replace(':id', '123'))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Lift breathing space');
          expect(res.text).toContain('Help and support');
          expect(res.text).toContain('govuk-back-link');
          expect(res.text).toContain('border-small-top');
          expect(res.text).not.toContain('I want to');
          expect(res.text).not.toContain('govuk-error-summary');
        });
    });

    it('should return 500 status code when error occurs', async () => {
      mockGetClaimById.mockRejectedValue(new Error('Test error'));

      await request(app)
        .get(LIFT_BREATHING_SPACE_URL.replace(':id', '123'))
        .expect((res) => {
          expect(res.status).toBe(500);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect to dashboard when form is valid', async () => {
      const claim = new Claim();
      mockGetClaimById.mockResolvedValue(claim);
      mockSaveLiftBreathingSpace.mockResolvedValue({});

      await request(app)
        .post(LIFT_BREATHING_SPACE_URL.replace(':id', '123'))
        .send({year: '2023', month: '01', day: '01', text: 'Reason'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toContain(DASHBOARD_CLAIMANT_URL.replace(':id', '123'));
        });
    });

    it('should return error messages when form is invalid', async () => {
      const claim = new Claim();
      claim.totalClaimAmount = 1000;
      mockGetClaimById.mockResolvedValue(claim);

      await request(app)
        .post(LIFT_BREATHING_SPACE_URL.replace(':id', '123'))
        .send({year: '', month: '', day: '', text: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('govuk-error-summary');
        });
    });

    it('should return 500 status code when error occurs', async () => {
      mockGetClaimById.mockRejectedValue(new Error('Test error'));

      await request(app)
        .post(LIFT_BREATHING_SPACE_URL.replace(':id', '123'))
        .send({year: '2023', month: '01', day: '01', text: 'Reason'})
        .expect((res) => {
          expect(res.status).toBe(500);
        });
    });
  });
});
