import {NextFunction, Response} from 'express';
import {Claim} from 'common/models/claim';
import {GeneralApplication} from 'common/models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {AppRequest} from 'common/models/AppRequest';
import {
  applicationTypeErrorUrl,
  applicationTypeGuard,
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

  it('should call next when claim does not have a GA draft', async () => {
    mockGetClaimById.mockResolvedValueOnce(new Claim());

    await applicationTypeGuard(req, res, next);

    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });
});
