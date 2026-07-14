import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {EXIT_BREATHING_SPACE_CHECK_ANSWERS_URL, EXIT_BREATHING_SPACE_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as utilityService from 'modules/utilityService';
import {Claim} from 'common/models/claim';
import {BreathingSpaceType} from 'common/models/breathingSpace/breathingSpace';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/utilityService');

const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
const mockGetClaimById = utilityService.getClaimById as jest.Mock;

describe('Exit Breathing Space Controller', () => {
  const citizenRoleToken = config.get<string>('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return exit breathing space page', async () => {
      const claim = new Claim();
      claim.breathingSpace = {
        enter: {
          type: BreathingSpaceType.STANDARD,
          start: new Date(2023, 0, 1),
        },
      };
      mockGetClaimById.mockResolvedValue(claim);

      await request(app)
        .get(EXIT_BREATHING_SPACE_URL.replace(':id', '123'))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Lift breathing space debt respite');
        });
    });

    it('should return http 500 when has error', async () => {
      mockGetClaimById.mockRejectedValue(new Error('Internal error'));
      await request(app)
        .get(EXIT_BREATHING_SPACE_URL.replace(':id', '123'))
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect to check answers page when data is valid', async () => {
      const claim = new Claim();
      claim.breathingSpace = {
        enter: {
          type: BreathingSpaceType.STANDARD,
          start: new Date(2023, 0, 1),
        },
      };
      mockGetClaimById.mockResolvedValue(claim);
      mockGetCaseDataFromStore.mockResolvedValue(claim);

      await request(app)
        .post(EXIT_BREATHING_SPACE_URL.replace(':id', '123'))
        .send({day: '10', month: '1', year: '2023', reason: 'Reason'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(EXIT_BREATHING_SPACE_CHECK_ANSWERS_URL.replace(':id', '123'));
        });
      expect(mockSaveDraftClaim).toHaveBeenCalled();
    });

    it('should return errors when date is invalid', async () => {
      const claim = new Claim();
      claim.breathingSpace = {
        enter: {
          type: BreathingSpaceType.STANDARD,
          start: new Date(2023, 0, 10),
        },
      };
      mockGetClaimById.mockResolvedValue(claim);

      await request(app)
        .post(EXIT_BREATHING_SPACE_URL.replace(':id', '123'))
        .send({day: '5', month: '1', year: '2023', reason: 'Reason'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('End date must be after start date');
        });
    });

    it('should return http 500 when has error', async () => {
      mockGetClaimById.mockRejectedValue(new Error('Internal error'));
      await request(app)
        .post(EXIT_BREATHING_SPACE_URL.replace(':id', '123'))
        .send({day: '10', month: '1', year: '2023', reason: 'Reason'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
