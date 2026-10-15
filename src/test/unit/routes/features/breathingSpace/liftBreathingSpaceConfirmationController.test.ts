import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {LIFT_BREATHING_SPACE_CONFIRMATION_URL} from '../../../../../main/routes/urls';
import {getClaimById} from '../../../../../main/modules/utilityService';
import {Claim} from '../../../../../main/common/models/claim';
import {BreathingSpaceEnterInfo} from '../../../../../main/common/models/breathingSpace/breathingSpaceEnterInfo';
import {BreathingSpaceLiftInfo} from '../../../../../main/common/models/breathingSpace/breathingSpaceLiftInfo';
import {BreathingSpaceType} from '../../../../../main/common/models/breathingSpace/breathingSpaceType';
import {formatDateToFullDate} from '../../../../../main/common/utils/dateUtils';

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
      claim.legacyCaseReference = '000012345678';
      claim.enterBreathing = new BreathingSpaceEnterInfo(BreathingSpaceType.STANDARD);
      mockGetClaimById.mockResolvedValue(claim);

      await request(app)
        .get(LIFT_BREATHING_SPACE_CONFIRMATION_URL.replace(':id', '123'))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Standard breathing space lifted');
          expect(res.text).toContain('Case number:');
          expect(res.text).toContain('0000 1234 5678');
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

    it('should keep the current confirmation when the end date is today', async () => {
      const claim = new Claim();
      claim.enterBreathing = new BreathingSpaceEnterInfo(BreathingSpaceType.STANDARD);
      claim.liftBreathing = new BreathingSpaceLiftInfo(new Date());
      mockGetClaimById.mockResolvedValue(claim);

      await request(app)
        .get(LIFT_BREATHING_SPACE_CONFIRMATION_URL.replace(':id', '123'))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Standard breathing space lifted');
          expect(res.text).toContain('We have sent you a confirmation email.');
          expect(res.text).not.toContain('will lift on');
        });
    });

    it('should show a future standard breathing space lift date', async () => {
      const futureEnd = new Date(2099, 8, 10);
      const claim = new Claim();
      claim.enterBreathing = new BreathingSpaceEnterInfo(BreathingSpaceType.STANDARD);
      claim.liftBreathing = new BreathingSpaceLiftInfo(futureEnd);
      mockGetClaimById.mockResolvedValue(claim);

      await request(app)
        .get(LIFT_BREATHING_SPACE_CONFIRMATION_URL.replace(':id', '123'))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(`Standard breathing space will lift on ${formatDateToFullDate(futureEnd, 'en')}`);
          expect(res.text).toContain('We will send you an email to confirm when breathing space has ended');
          expect(res.text).not.toContain('We have sent you a confirmation email.');
        });
    });

    it('should show a future mental health breathing space lift date in Welsh', async () => {
      const futureEnd = new Date(2099, 8, 10);
      const claim = new Claim();
      claim.enterBreathing = new BreathingSpaceEnterInfo(BreathingSpaceType.MENTAL_HEALTH);
      claim.breathingSpace = {liftBreathing: {expectedEnd: '2099-09-10'}};
      mockGetClaimById.mockResolvedValue(claim);

      await request(app)
        .get(`${LIFT_BREATHING_SPACE_CONFIRMATION_URL.replace(':id', '123')}?lang=cy`)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(`Bydd lle i anadlu Iechyd Meddwl yn codi ar ${formatDateToFullDate(futureEnd, 'cy')}`);
          expect(res.text).toContain('Byddwn yn anfon e-bost atoch i gadarnhau pryd fydd y lle i anadlu wedi dod i ben');
        });
    });
  });
});
