import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {BREATHING_SPACE_LIFT_URL, CYA_LIFT_BREATHING_SPACE_URL} from '../../../../../main/routes/urls';
import {getClaimById} from '../../../../../main/modules/utilityService';
import {getLiftBreathingSpaceForm, saveLiftBreathingSpace} from '../../../../../main/services/features/breathingSpace/liftBreathingSpaceService';
import {Claim} from '../../../../../main/common/models/claim';
import {LiftBreathingSpaceForm} from '../../../../../main/common/form/models/breathingSpace/liftBreathingSpaceForm';
import {BreathingSpaceEnterInfo} from '../../../../../main/common/models/breathingSpace/breathingSpaceEnterInfo';
import {BreathingSpaceType} from '../../../../../main/common/models/breathingSpace/breathingSpaceType';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/utilityService');
jest.mock('../../../../../main/services/features/breathingSpace/liftBreathingSpaceService', () => ({
  ...jest.requireActual('../../../../../main/services/features/breathingSpace/liftBreathingSpaceService'),
  getLiftBreathingSpaceForm: jest.fn(),
  saveLiftBreathingSpace: jest.fn(),
}));

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
        .get(BREATHING_SPACE_LIFT_URL.replace(':id', '123'))
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
        .get(BREATHING_SPACE_LIFT_URL.replace(':id', '123'))
        .expect((res) => {
          expect(res.status).toBe(500);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect to CYA when form is valid (future date within 60 days)', async () => {
      const claim = new Claim();
      mockGetClaimById.mockResolvedValue(claim);
      mockSaveLiftBreathingSpace.mockResolvedValue({});

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      await request(app)
        .post(BREATHING_SPACE_LIFT_URL.replace(':id', '123'))
        .send({
          year: futureDate.getFullYear().toString(),
          month: (futureDate.getMonth() + 1).toString().padStart(2, '0'),
          day: futureDate.getDate().toString().padStart(2, '0'),
          text: 'Reason',
        })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toContain(CYA_LIFT_BREATHING_SPACE_URL.replace(':id', '123'));
        });
    });

    it('should return error when date is today (must be after start date)', async () => {
      const claim = new Claim();
      claim.totalClaimAmount = 1000;
      mockGetClaimById.mockResolvedValue(claim);
      const today = new Date();

      await request(app)
        .post(BREATHING_SPACE_LIFT_URL.replace(':id', '123'))
        .send({
          year: today.getFullYear().toString(),
          month: (today.getMonth() + 1).toString().padStart(2, '0'),
          day: today.getDate().toString().padStart(2, '0'),
          text: 'Reason',
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('govuk-error-summary');
          expect(res.text).toContain('End date must be after start date');
        });
    });

    it('should return error when date is in the past', async () => {
      const claim = new Claim();
      claim.totalClaimAmount = 1000;
      mockGetClaimById.mockResolvedValue(claim);

      await request(app)
        .post(BREATHING_SPACE_LIFT_URL.replace(':id', '123'))
        .send({year: '2020', month: '01', day: '01', text: 'Reason'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('govuk-error-summary');
          expect(res.text).toContain('End date must be after start date');
        });
    });

    it('should return error when standard breathing space end date is more than 60 days after start', async () => {
      const claim = new Claim();
      claim.totalClaimAmount = 1000;
      claim.enterBreathing = new BreathingSpaceEnterInfo(
        BreathingSpaceType.STANDARD,
        undefined,
        new Date('2024-06-01'),
      );
      mockGetClaimById.mockResolvedValue(claim);

      await request(app)
        .post(BREATHING_SPACE_LIFT_URL.replace(':id', '123'))
        .send({year: '2024', month: '08', day: '02', text: 'Reason'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('govuk-error-summary');
          expect(res.text).toContain('Standard breathing space cannot last for longer than 60 days');
        });
    });

    it('should use today when a non-standard breathing space end date is not submitted', async () => {
      const claim = new Claim();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      claim.enterBreathing = new BreathingSpaceEnterInfo(
        BreathingSpaceType.MENTAL_HEALTH,
        undefined,
        yesterday,
      );
      mockGetClaimById.mockResolvedValue(claim);
      mockSaveLiftBreathingSpace.mockResolvedValue({});

      await request(app)
        .post(BREATHING_SPACE_LIFT_URL.replace(':id', '123'))
        .send({year: '', month: '', day: '', text: 'Reason'})
        .expect(302);

      const [, , form] = mockSaveLiftBreathingSpace.mock.calls[mockSaveLiftBreathingSpace.mock.calls.length - 1];
      const today = new Date();
      expect(form.date.getFullYear()).toBe(today.getFullYear());
      expect(form.date.getMonth()).toBe(today.getMonth());
      expect(form.date.getDate()).toBe(today.getDate());
    });

    it('should return a day error when the end date is not entered', async () => {
      const claim = new Claim();
      claim.totalClaimAmount = 1000;
      mockGetClaimById.mockResolvedValue(claim);

      await request(app)
        .post(BREATHING_SPACE_LIFT_URL.replace(':id', '123'))
        .send({year: '', month: '', day: '', text: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('govuk-error-summary');
          expect(res.text).toContain('End date must include a day');
        });
    });

    it.each([
      [{year: '2026', month: '08', day: ''}, 'End date must include a day'],
      [{year: '2026', month: '', day: '14'}, 'End date must include a month'],
      [{year: '', month: '08', day: '14'}, 'End date must include a year'],
    ])('should show the missing end date part error', async (date, expectedError) => {
      const claim = new Claim();
      claim.totalClaimAmount = 1000;
      mockGetClaimById.mockResolvedValue(claim);

      await request(app)
        .post(BREATHING_SPACE_LIFT_URL.replace(':id', '123'))
        .send({...date, text: 'Reason'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(expectedError);
        });
    });

    it('should return 500 status code when error occurs', async () => {
      mockGetClaimById.mockRejectedValue(new Error('Test error'));

      await request(app)
        .post(BREATHING_SPACE_LIFT_URL.replace(':id', '123'))
        .send({year: '2023', month: '01', day: '01', text: 'Reason'})
        .expect((res) => {
          expect(res.status).toBe(500);
        });
    });
  });
});
