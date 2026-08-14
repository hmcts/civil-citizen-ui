import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {LIFT_BREATHING_SPACE_CONFIRMATION_URL} from '../../../../../main/routes/urls';
import {getClaimById} from '../../../../../main/modules/utilityService';
import {Claim} from '../../../../../main/common/models/claim';
import {BreathingSpaceEnterInfo} from '../../../../../main/common/models/breathingSpace/breathingSpaceEnterInfo';
import {BreathingSpaceType} from '../../../../../main/common/models/breathingSpace/breathingSpaceType';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/utilityService');

const mockGetClaimById = getClaimById as jest.Mock;

describe('Lift Breathing Space Confirmation Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return standard breathing space lift confirmation page', async () => {
      const claim = new Claim();
      claim.enterBreathing = new BreathingSpaceEnterInfo(BreathingSpaceType.STANDARD);
      mockGetClaimById.mockResolvedValue(claim);

      await request(app)
        .get(LIFT_BREATHING_SPACE_CONFIRMATION_URL.replace(':id', '123'))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Breathing space lifted');
          expect(res.text).toContain('Standard breathing space lifted');
          expect(res.text).toContain('Case number:');
          expect(res.text).toContain('We have sent you a confirmation email.');
          expect(res.text).toContain('Return to your case summary');
        });
    });

    it('should return mental health breathing space lift confirmation page', async () => {
      const claim = new Claim();
      claim.enterBreathing = new BreathingSpaceEnterInfo(BreathingSpaceType.MENTAL_HEALTH);
      mockGetClaimById.mockResolvedValue(claim);

      await request(app)
        .get(LIFT_BREATHING_SPACE_CONFIRMATION_URL.replace(':id', '123'))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Mental health breathing space lifted');
        });
    });
  });
});
