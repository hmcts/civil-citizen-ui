import express from 'express';
import request from 'supertest';
import cancelUnissuedClaimSpecController from '../../../../../main/routes/features/cancelUnissuedClaimSpec/cancelUnissuedClaimSpecController';
import {CLAIM_FEE_BREAKUP, CLAIM_FEE_MAKE_PAYMENT_AGAIN_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';
import {getClaimById} from 'modules/utilityService';

jest.mock('client/civilServiceClient');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

const claimId = '1234567890123456';
const mockGetClaimById = getClaimById as jest.Mock;

// Same order as routes.ts: this router is registered before the claim fee payment routers
const app = express();
app.use(cancelUnissuedClaimSpecController);
app.all([CLAIM_FEE_BREAKUP, CLAIM_FEE_MAKE_PAYMENT_AGAIN_URL], (req, res) => {
  res.status(200).send('payment route reached');
});

const claimInState = (ccdState: CaseState): Claim => {
  const claim = new Claim();
  claim.ccdState = ccdState;
  return claim;
};

describe('Claim fee payment once the unissued claim is cancelled', () => {
  beforeEach(() => jest.clearAllMocks());

  it.each([
    ['GET', CLAIM_FEE_BREAKUP],
    ['POST', CLAIM_FEE_BREAKUP],
    ['GET', CLAIM_FEE_MAKE_PAYMENT_AGAIN_URL],
  ])('should redirect %s %s to the dashboard for a cancelled claim', async (method, url) => {
    mockGetClaimById.mockResolvedValueOnce(claimInState(CaseState.CLAIM_UNISSUED_CANCELLED));
    const path = url.replace(':id', claimId);

    const res = method === 'GET' ? await request(app).get(path) : await request(app).post(path);

    expect(res.status).toBe(302);
    expect(res.header.location).toBe(`/dashboard/${claimId}/claimantNewDesign`);
  });

  it.each([
    ['GET', CLAIM_FEE_BREAKUP],
    ['POST', CLAIM_FEE_BREAKUP],
    ['GET', CLAIM_FEE_MAKE_PAYMENT_AGAIN_URL],
  ])('should pass %s %s on to the payment route for a claim that is not cancelled', async (method, url) => {
    mockGetClaimById.mockResolvedValueOnce(claimInState(CaseState.PENDING_CASE_ISSUED));
    const path = url.replace(':id', claimId);

    const res = method === 'GET' ? await request(app).get(path) : await request(app).post(path);

    expect(res.status).toBe(200);
    expect(res.text).toBe('payment route reached');
  });
});
