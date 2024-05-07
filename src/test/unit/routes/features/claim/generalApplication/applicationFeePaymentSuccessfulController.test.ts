import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {GA_PAYMENT_SUCCESSFUL} from 'routes/urls';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import { CivilServiceClient } from 'client/civilServiceClient';
import { Claim } from 'common/models/claim';
import { ClaimDetails } from 'common/form/models/claim/details/claimDetails';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
const spyDel = jest.spyOn(draftStoreService, 'deleteDraftClaimFromStore');

describe('Claim fee payment confirmation', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return resolving successful payment page', async () => {
      const claim = new Claim();
      claim.claimDetails = new ClaimDetails();
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValueOnce(claim);
      await request(app)
        .get(GA_PAYMENT_SUCCESSFUL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Application fee');
          expect(res.text).toContain('REF-123-123');
        });
    });

    it('should return error if there is no claim fee data', async () => {
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));

      spyDel.mockImplementation(() => {return null;});

      await request(app)
        .get(GA_PAYMENT_SUCCESSFUL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
