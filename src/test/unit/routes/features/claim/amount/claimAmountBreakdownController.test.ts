import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import * as claimAmountbreakdownService
  from '../../../../../../main/services/features/claim/amount/claimAmountBreakdownService';
import {AmountBreakdown} from 'form/models/claim/amount/amountBreakdown';
import {ClaimAmountRow} from 'form/models/claim/amount/claimAmountRow';
import {CLAIM_AMOUNT_URL, CLAIM_INTEREST_URL, NOT_ELIGIBLE_FOR_THIS_SERVICE_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/services/features/claim/amount/claimAmountBreakdownService');

const mockServiceGet = claimAmountbreakdownService.getClaimAmountBreakdownForm as jest.Mock;

describe('claimAmountBreakdownController test', ()=>{
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    app.locals.draftStoreClient = mockCivilClaim;
  });
  describe('On Get', () => {
    it('should return page successfully', async () => {
      mockServiceGet.mockImplementation(async () => new AmountBreakdown([new ClaimAmountRow(), new ClaimAmountRow()]));
      await request(app).get(CLAIM_AMOUNT_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Claim amount');
      });
    });
    it('should show error page when exception is thrown from the service', async () => {
      mockServiceGet.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app).get(CLAIM_AMOUNT_URL).expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });
  });
  describe('On Post', () => {
    const correctData = {
      claimAmountRows: [
        {
          reason: 'lalala',
          amount: '1',
        },
      ],
      totalAmount: '1',
    };
    it('should show errors when there are errors', async () => {
      const data = {
        claimAmountRows: [
          {
            reason: '',
            amount: '1',
          },
        ],
        totalAmount: '1',
      };

      await request(app).post(CLAIM_AMOUNT_URL)
        .send(data)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Enter a reason');
        });
    });
    it('should redirect to the next page successfully when data is correct', async () => {
      await request(app).post(CLAIM_AMOUNT_URL)
        .send(correctData)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIM_INTEREST_URL);
        });
    });
    it('should show error page when there is an error with service', async () => {
      const saveForm = claimAmountbreakdownService.saveClaimAmountBreakdownForm as jest.Mock;
      saveForm.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app).post(CLAIM_AMOUNT_URL)
        .send(correctData)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
    it('should redirect to not eligible page when total amount exceeds 25000', async () => {
      const data = {
        claimAmountRows: [
          {
            reason: 'no reason',
            amount: '26000',
          },
        ],
        totalAmount: '26000',
      };
      await request(app).post(CLAIM_AMOUNT_URL)
        .send(data)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL + '?reason=claim-value-over-25000');
        });
    });
  });
});
