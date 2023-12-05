import request from 'supertest';
import express from 'express';
import { CivilServiceClient } from 'client/civilServiceClient';
import { getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import claimFeeBreakDownController from 'routes/features/claim/payment/claimFeeBreakDownController';
import { CLAIM_FEE_BREAKUP } from 'routes/urls';
import { mockRedisFailure } from '../../../../../utils/mockDraftStore';
import { InterestClaimOptionsType } from 'common/form/models/claim/interest/interestClaimOptionsType';

jest.mock('modules/draft-store/draftStoreService', () => {
  return { getCaseDataFromStore: jest.fn((claimId: string) => Promise.resolve()) };
});
jest.spyOn(CivilServiceClient.prototype, 'getClaimAmountFee').mockImplementation(() => Promise.resolve(0));

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.render = jest.fn((view, options) => res.status(200).send(options));
  next();
});
app.use(claimFeeBreakDownController);

describe('on GET', () => {
  it('should handle the get call of fee summary details', async () => {
    const mockClaimData = { totalClaimAmount: 1000, interest: { interestClaimOptions: InterestClaimOptionsType.BREAK_DOWN_INTEREST, totalInterest: { amount: 100 } }, claimInterest: 'yes' };
    const mockClaimFee = 50;
    const mockTotalAmount = 1150;
    (getCaseDataFromStore as jest.Mock).mockResolvedValueOnce(mockClaimData);
    (CivilServiceClient.prototype.getClaimAmountFee as jest.Mock).mockResolvedValueOnce(mockClaimFee);
    await request(app)
      .get(CLAIM_FEE_BREAKUP).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
          totalClaimAmount: mockClaimData.totalClaimAmount,
          interest: mockClaimData.interest.totalInterest.amount,
          claimFee: mockClaimFee,
          hasInterest: true,
          totalAmount: mockTotalAmount,
        });
      });
  });

  it('should return 500 status code when error occurs', async () => {
    app.locals.draftStoreClient = mockRedisFailure;
    await request(app)
      .get(CLAIM_FEE_BREAKUP)
      .expect((res) => {
        expect(res.status).toBe(500);
      });
  });
});