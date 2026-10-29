import express, {NextFunction, Request, Response} from 'express';
import request from 'supertest';
import controller from 'routes/features/generalApplication/applicationFee/helpWithApplicationFeeController';
import {GA_APPLY_HELP_WITH_FEE_SELECTION, GA_APPLY_HELP_WITH_OUT_APPID_FEE_SELECTION} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {getDraftGAHWFDetails} from 'modules/draft-store/gaHwFeesDraftStore';
import {getRedirectUrl} from 'services/features/generalApplication/fee/helpWithFeeService';
import {getApplicationIndex} from 'services/features/generalApplication/generalApplicationService';
import {AppRequest} from 'models/AppRequest';

jest.mock('modules/utilityService', () => ({getClaimById: jest.fn()}));
jest.mock('modules/draft-store/gaHwFeesDraftStore', () => ({getDraftGAHWFDetails: jest.fn()}));
jest.mock('services/features/generalApplication/fee/helpWithFeeService', () => ({getRedirectUrl: jest.fn()}));
jest.mock('services/features/generalApplication/generalApplicationService', () => ({getApplicationIndex: jest.fn()}));

describe('GA fee selection with real draft-key validation', () => {
  const claimId = '1645882162449409';
  const applicationId = '1645882162449410';
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const initialUrl = GA_APPLY_HELP_WITH_OUT_APPID_FEE_SELECTION.replace(':id', claimId);
  const applicationUrl = GA_APPLY_HELP_WITH_FEE_SELECTION.replace(':id', claimId).replace(':appId', applicationId);
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({extended: false}));
  app.use((req, res, next) => {
    (req as AppRequest).session = {user: {id: userId}} as AppRequest['session'];
    req.cookies = {};
    res.render = (_view, options) => res.json(options);
    next();
  });
  app.use(controller);
  app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(500).json({error: error.message});
  });

  beforeEach(() => {
    jest.resetAllMocks();
    (getClaimById as jest.Mock).mockResolvedValue({});
    (getApplicationIndex as jest.Mock).mockResolvedValue(0);
    (getDraftGAHWFDetails as jest.Mock).mockResolvedValue({applyHelpWithFees: {option: 'yes'}});
    (getRedirectUrl as jest.Mock).mockResolvedValue('/next-fee-step');
  });

  it('renders the initial fee page without reading an undefined application draft', async () => {
    const response = await request(app).get(initialUrl).query({id: 'provisional-ga-id', appFee: '123'}).expect(200);
    expect(response.body.form.model.option).toBeUndefined();
    expect(response.body.backLinkUrl).toContain('id=provisional-ga-id');
    expect(getDraftGAHWFDetails).not.toHaveBeenCalled();
  });

  it('restores the saved selection using the unchanged application/user key', async () => {
    const response = await request(app).get(applicationUrl).expect(200);
    expect(response.body.form.model.option).toBe('yes');
    expect(getDraftGAHWFDetails).toHaveBeenCalledWith(applicationId + userId);
  });

  it('still rejects an invalid application identifier before reading its draft', async () => {
    await request(app).get(applicationUrl.replace(applicationId, 'undefined')).expect(500);
    expect(getDraftGAHWFDetails).not.toHaveBeenCalled();
  });

  it('renders validation errors on the initial route without a draft lookup', async () => {
    await request(app).post(initialUrl + '?id=provisional-ga-id&appFee=123').send({}).expect(200);
    expect(getRedirectUrl).not.toHaveBeenCalled();
    expect(getDraftGAHWFDetails).not.toHaveBeenCalled();
  });

  it.each(['yes', 'no'])('continues the initial route for a %s selection', async option => {
    await request(app).post(initialUrl + '?id=provisional-ga-id&appFee=123')
      .send({option}).expect(302).expect('Location', '/next-fee-step');
    expect(getRedirectUrl).toHaveBeenCalledWith(claimId, expect.objectContaining({option}), 'applyHelpWithFees', expect.anything());
    expect(getDraftGAHWFDetails).not.toHaveBeenCalled();
  });
});
