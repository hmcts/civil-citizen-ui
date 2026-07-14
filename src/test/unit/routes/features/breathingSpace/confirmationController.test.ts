import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {EXIT_BREATHING_SPACE_CONFIRMATION_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as utilityService from 'modules/utilityService';
import {Claim} from 'common/models/claim';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/utilityService');

const mockGetClaimById = utilityService.getClaimById as jest.Mock;

describe('Breathing Space Confirmation Controller', () => {
  const citizenRoleToken = config.get<string>('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return confirmation page', async () => {
      const claim = new Claim();
      Object.assign(claim, {
        getClaimantName: () => 'Claimant',
        getDefendantName: () => 'Defendant',
      });
      mockGetClaimById.mockResolvedValue(claim);

      await request(app)
        .get(EXIT_BREATHING_SPACE_CONFIRMATION_URL.replace(':id', '123'))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Breathing space lifted confirmation');
        });
    });

    it('should return http 500 when has error', async () => {
      mockGetClaimById.mockRejectedValue(new Error('Internal error'));
      await request(app)
        .get(EXIT_BREATHING_SPACE_CONFIRMATION_URL.replace(':id', '123'))
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
