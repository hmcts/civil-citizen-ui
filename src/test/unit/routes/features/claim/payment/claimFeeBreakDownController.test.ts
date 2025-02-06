import request from 'supertest';
import express from 'express';
import {app} from '../../../../../../main/app';
import claimFeeBreakDownController from 'routes/features/claim/payment/claimFeeBreakDownController';
import {CLAIM_FEE_BREAKUP, CLAIM_FEE_PAYMENT_CONFIRMATION_URL} from 'routes/urls';
import {mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {InterestClaimOptionsType} from 'common/form/models/claim/interest/interestClaimOptionsType';
import {getClaimById} from 'modules/utilityService';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'models/claim';
import nock from 'nock';
import config from 'config';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {Session} from 'express-session';
import * as feePaymentServiceModule from 'services/features/feePayment/feePaymentService';

const civilServiceUrl = config.get<string>('services.civilService.url');

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService', () => ({
  getCaseDataFromStore: jest.fn(),
  generateRedisKey: jest.fn(),
  saveDraftClaim: jest.fn(),
}));
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));
jest.mock('routes/guards/claimFeePaymentGuard', () => ({
  claimFeePaymentGuard: jest.fn((req, res, next) => {
    next();
  }),
}));
jest.mock('../../../../../../main/modules/draft-store/paymentSessionStoreService', () => ({
  saveUserId: jest.fn(),
}));

describe('on GET', () => {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    res.render = jest.fn((view, options) => res.status(200).send(options));
    next();
  });
  app.use(claimFeeBreakDownController);

  beforeEach(() => {
    nock(civilServiceUrl)
      .post('/fees/claim/interest')
      .reply(200, '100');
  });

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
      },
      isInterestFromASpecificDate: () => false,
    };
    const mockClaimFee = 100;
    const mockTotalAmount = 1200;
    (getClaimById as jest.Mock).mockResolvedValueOnce(mockClaimData);
    //when-then
    await request(app)
      .get(CLAIM_FEE_BREAKUP.replace(':id', claimId)).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
          totalClaimAmount: mockClaimData.totalClaimAmount.toFixed(2),
          interest: mockClaimData.interest.totalInterest.amount,
          claimFee: mockClaimFee,
          paymentSyncError: false,
          hasInterest: true,
          pageTitle: 'PAGES.FEE_AMOUNT.TITLE',
          totalAmount: mockTotalAmount.toFixed(2),
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
  const idamServiceUrl: string = config.get('services.idam.url');
  const citizenRoleToken: string = config.get('citizenRoleToken');
  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  it('should handle the get call of fee summary details', async () => {
    const claim = new Claim();
    claim.claimDetails = new ClaimDetails();
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentRedirectInformation').mockResolvedValueOnce({});
    app.request['session'] = {user: {id: 'jfkdljfd'}} as unknown as Session;
    await request(app)
      .post(CLAIM_FEE_BREAKUP)
      .expect((res) => {
        expect(res.status).toBe(302);
      });
  });
  it('should enable the warning text if payment request is failed', async () => {
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentRedirectInformation').mockRejectedValueOnce(new Error('something went wrong'));
    (getClaimById as jest.Mock).mockResolvedValueOnce(new Claim());
    await request(app)
      .post(CLAIM_FEE_BREAKUP).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(CLAIM_FEE_BREAKUP);
      });
  });
  it('should redirect to confirmation url if already paid', async () => {
    const claim = new Claim();
    claim.claimDetails = new ClaimDetails();
    claim.claimDetails.claimFeePayment = {paymentReference: 'RC-1234-1234-1234-1234'};
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
    (getClaimById as jest.Mock).mockResolvedValueOnce(claim);
    jest.spyOn(feePaymentServiceModule, 'getFeePaymentStatus').mockResolvedValueOnce({status: 'Success'});
    await request(app)
      .post(CLAIM_FEE_BREAKUP).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(CLAIM_FEE_PAYMENT_CONFIRMATION_URL);
      });
  });
  it('should get new payment ref if previous payment failed', async () => {
    const paymentUrl = 'paymentUrl';
    const claim = new Claim();
    claim.claimDetails = new ClaimDetails();
    claim.claimDetails.claimFeePayment = {paymentReference: 'RC-1234-1234-1234-1234'};
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
    (getClaimById as jest.Mock).mockResolvedValueOnce(claim);
    jest.spyOn(feePaymentServiceModule, 'getFeePaymentStatus').mockResolvedValueOnce({status: 'Failed'});
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentRedirectInformation').mockResolvedValueOnce({nextUrl: paymentUrl});
    await request(app)
      .post(CLAIM_FEE_BREAKUP).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(paymentUrl);
      });
  });
  it('should get new payment ref if previous payment failed - no payment data returned', async () => {
    const claim = new Claim();
    claim.claimDetails = new ClaimDetails();
    claim.claimDetails.claimFeePayment = {paymentReference: 'RC-1234-1234-1234-1234'};
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
    (getClaimById as jest.Mock).mockResolvedValueOnce(claim);
    jest.spyOn(feePaymentServiceModule, 'getFeePaymentStatus').mockResolvedValueOnce({status: 'Failed'});
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentRedirectInformation').mockResolvedValueOnce(undefined);
    await request(app)
      .post(CLAIM_FEE_BREAKUP).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(CLAIM_FEE_BREAKUP);
      });
  });
  it('should redirect to payment if cannot get payment status', async () => {
    const paymentUrl = 'paymentUrl';
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentRedirectInformation').mockResolvedValueOnce({nextUrl: paymentUrl});
    const claim = new Claim();
    claim.claimDetails = new ClaimDetails();
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
    (getClaimById as jest.Mock).mockResolvedValueOnce(new Claim());
    jest.spyOn(feePaymentServiceModule, 'getFeePaymentStatus').mockRejectedValueOnce(new Error('something went wrong'));
    await request(app)
      .post(CLAIM_FEE_BREAKUP).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(paymentUrl);
      });
  });
});
