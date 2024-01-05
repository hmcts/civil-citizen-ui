import request from 'supertest';
import express from 'express';
import {app} from '../../../../../../main/app';
import claimFeeBreakDownController from 'routes/features/claim/payment/claimFeeBreakDownController';
import { CLAIM_FEE_BREAKUP} from 'routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import { InterestClaimOptionsType } from 'common/form/models/claim/interest/interestClaimOptionsType';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
jest.mock('modules/draft-store/draftStoreService');

describe('on GET', () => {
  const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    res.render = jest.fn((view, options) => res.status(200).send(options));
    next();
  });
  app.use(claimFeeBreakDownController);
  it('should handle the get call of fee summary details', async () => {
    //given
    const claimId = '111111';
    const mockClaimData = {
      totalClaimAmount: 1000,
      interest: {
        interestClaimOptions: InterestClaimOptionsType.BREAK_DOWN_INTEREST,
        totalInterest: { amount: 100 },
      },
      claimInterest: 'yes' ,
      claimFee: {
        calculatedAmountInPence: 10000,
      }};
    const mockClaimFee = 100;
    const mockTotalAmount = 1200;
    mockGetCaseDataFromDraftStore.mockResolvedValueOnce(mockClaimData);
    //when-then
    await request(app)
      .get(CLAIM_FEE_BREAKUP.replace(':id', claimId)).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
          totalClaimAmount: mockClaimData.totalClaimAmount,
          interest: mockClaimData.interest.totalInterest.amount,
          claimFee: mockClaimFee,
          hasInterest: true,
          totalAmount: mockTotalAmount
        });
      });
  });

  it('should return 500 status code when error occurs', async () => {
    //given
    app.locals.draftStoreClient = mockRedisFailure;
    //when-then
    await request(app)
      .get(CLAIM_FEE_BREAKUP)
      .expect((res) => {
        expect(res.status).toBe(500);
      });
  });
});
describe('on POST', () => {
  it('should handle the get call of fee summary details', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app)
      .post(CLAIM_FEE_BREAKUP)
      .expect((res) => {
        expect(res.status).toBe(302);
      });
  });
});
