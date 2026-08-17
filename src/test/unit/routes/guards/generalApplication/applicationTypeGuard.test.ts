import {NextFunction, Response} from 'express';
import {Claim} from 'common/models/claim';
import {GeneralApplication} from 'common/models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {AppRequest} from 'common/models/AppRequest';
import {
  applicationTypeErrorUrl,
  applicationTypeGuard,
  duplicateApplicationTypeErrorUrl,
} from 'routes/guards/generalApplication/applicationTypeGuard';
import {getClaimById} from 'modules/utilityService';

jest.mock('../../../../../main/modules/utilityService');

describe('Application type guard', () => {
  const mockGetClaimById = getClaimById as jest.Mock;
  const req = {params: {id: '123'}} as unknown as AppRequest;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    res = {redirect: jest.fn()} as unknown as Response;
    next = jest.fn() as NextFunction;
  });

  it('should redirect to application type validation when GA draft has no application types', async () => {
    const claim = new Claim();
    claim.generalApplication = new GeneralApplication();
    mockGetClaimById.mockResolvedValueOnce(claim);

    await applicationTypeGuard(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith(applicationTypeErrorUrl('123'));
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next when GA draft has an application type', async () => {
    const claim = new Claim();
    claim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING));
    mockGetClaimById.mockResolvedValueOnce(claim);

    await applicationTypeGuard(req, res, next);

    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });

  it('should redirect to application type validation when GA draft has a partially populated application type list', async () => {
    const claim = new Claim();
    claim.generalApplication = new GeneralApplication();
    claim.generalApplication.applicationTypes = [
      new ApplicationType(ApplicationTypeOption.EXTEND_TIME),
      new ApplicationType(),
    ];
    mockGetClaimById.mockResolvedValueOnce(claim);

    await applicationTypeGuard(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith(applicationTypeErrorUrl('123', 1));
    expect(next).not.toHaveBeenCalled();
  });

  it('should redirect to application type validation when GA draft has an older non-persistable application type', async () => {
    const claim = new Claim();
    claim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.OTHER_OPTION));
    mockGetClaimById.mockResolvedValueOnce(claim);

    await applicationTypeGuard(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith(applicationTypeErrorUrl('123', 0));
    expect(next).not.toHaveBeenCalled();
  });

  it('should redirect to duplicate application type validation when GA draft has duplicate application types', async () => {
    const claim = new Claim();
    claim.generalApplication = new GeneralApplication();
    claim.generalApplication.applicationTypes = [
      new ApplicationType(ApplicationTypeOption.VARY_ORDER),
      new ApplicationType(ApplicationTypeOption.EXTEND_TIME),
      new ApplicationType(ApplicationTypeOption.VARY_ORDER),
    ];
    mockGetClaimById.mockResolvedValueOnce(claim);

    await applicationTypeGuard(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith(duplicateApplicationTypeErrorUrl('123', 2));
    expect(next).not.toHaveBeenCalled();
  });

  it('should redirect to application type validation when CYA application type change is in progress', async () => {
    const claim = new Claim();
    claim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING));
    claim.generalApplication.applicationTypeChangeInProgress = true;
    claim.generalApplication.applicationTypeChangeIndex = 0;
    mockGetClaimById.mockResolvedValueOnce(claim);

    await applicationTypeGuard(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith(applicationTypeErrorUrl('123', 0));
    expect(next).not.toHaveBeenCalled();
  });

  it('should redirect to application type validation when claim does not have a GA draft', async () => {
    mockGetClaimById.mockResolvedValueOnce(new Claim());

    await applicationTypeGuard(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith(applicationTypeErrorUrl('123'));
    expect(next).not.toHaveBeenCalled();
  });
});
