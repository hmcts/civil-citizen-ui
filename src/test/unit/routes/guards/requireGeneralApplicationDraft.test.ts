import {Claim} from 'common/models/claim';
import {GeneralApplication} from 'common/models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {NextFunction, Request, Response} from 'express';
import {requireGeneralApplicationDraft} from 'routes/guards/requireGeneralApplicationDraft';
import {DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL} from 'routes/urls';
import {CaseRole} from 'form/models/caseRoles';
import * as utilityService from 'modules/utilityService';

jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('../../../../main/services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  saveDraftGARespondentResponse: jest.fn(),
  getDraftGARespondentResponse: jest.fn(),
}));
jest.mock('../../../../main/modules/draft-store/gaHwFeesDraftStore', () => ({
  saveDraftGAHWFDetails: jest.fn(),
  getDraftGAHWFDetails: jest.fn(),
}));

describe('requireGeneralApplicationDraft', () => {
  let req: Partial<Request>;
  let res: Partial<Response> & { redirect: jest.Mock };
  let next: jest.Mock;

  beforeEach(() => {
    req = {params: {id: '123'}};
    res = {redirect: jest.fn()};
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next when the in-progress general application has application types', async () => {
    const claim = new Claim();
    claim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.STAY_THE_CLAIM));
    jest.spyOn(utilityService, 'getClaimById').mockResolvedValueOnce(claim);

    await requireGeneralApplicationDraft(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('should redirect a claimant to the claimant dashboard when the draft is missing', async () => {
    const claim = new Claim();
    claim.caseRole = CaseRole.CLAIMANT;
    jest.spyOn(utilityService, 'getClaimById').mockResolvedValueOnce(claim);

    await requireGeneralApplicationDraft(req as Request, res as Response, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(DASHBOARD_CLAIMANT_URL.replace(':id', '123'));
  });

  it('should redirect a defendant to the defendant dashboard when the draft is missing', async () => {
    const claim = new Claim();
    claim.caseRole = CaseRole.DEFENDANT;
    jest.spyOn(utilityService, 'getClaimById').mockResolvedValueOnce(claim);

    await requireGeneralApplicationDraft(req as Request, res as Response, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(DEFENDANT_SUMMARY_URL.replace(':id', '123'));
  });

  it('should redirect when generalApplication exists but has no application types', async () => {
    const claim = new Claim();
    claim.caseRole = CaseRole.CLAIMANT;
    claim.generalApplication = new GeneralApplication();
    jest.spyOn(utilityService, 'getClaimById').mockResolvedValueOnce(claim);

    await requireGeneralApplicationDraft(req as Request, res as Response, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(DASHBOARD_CLAIMANT_URL.replace(':id', '123'));
  });

  it('should call next with an error when getClaimById fails', async () => {
    const error = new Error('Redis failure');
    jest.spyOn(utilityService, 'getClaimById').mockRejectedValueOnce(error);

    await requireGeneralApplicationDraft(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.redirect).not.toHaveBeenCalled();
  });
});
