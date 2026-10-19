import {Response} from 'express';
import i18next from 'i18next';
import en from 'modules/i18n/locales/en.json';
import {Claim} from 'common/models/claim';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {CaseRole} from 'form/models/caseRoles';
import {YesNo} from 'form/models/yesNo';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {submitApplication} from 'services/features/generalApplication/submitApplication';
import {CallbackError} from 'client/common/error/callbackError';
import {
  GA_APPLICATION_SUBMITTED_URL,
  GENERAL_APPLICATION_CONFIRM_URL,
} from 'routes/urls';
import gaCheckAnswersController from '../../../../../../main/routes/features/generalApplication/checkAnswersController';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('services/features/generalApplication/submitApplication');
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  getDraftGARespondentResponse: jest.fn(),
  saveDraftGARespondentResponse: jest.fn(),
}));

const mockGetClaimById = getClaimById as jest.Mock;
const mockSubmitApplication = submitApplication as jest.Mock;

describe('General Application - Check your answers', () => {
  const getHandler = getRouteHandler(gaCheckAnswersController, 'get');
  const postHandler = getRouteHandler(gaCheckAnswersController, 'post');
  const viewPath = 'features/generalApplication/check-answers';
  const claimId = '12345';
  let req: {params: {id: string}; body: Record<string, unknown>; query: Record<string, unknown>; cookies: Record<string, unknown>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING));
    claim.generalApplication.applicationFee = {calculatedAmountInPence: 25000} as Claim['generalApplication']['applicationFee'];
    claim.generalApplication.hasUnavailableDatesHearing = YesNo.NO;
    return claim;
  };

  const confirmUrl = (applicationId: string): string =>
    `${constructResponseUrlWithIdParams(claimId, GENERAL_APPLICATION_CONFIRM_URL)}?appFee=250&id=${applicationId}`;

  beforeAll(async () => {
    await i18next.init({lng: 'en', fallbackLng: 'en', resources: {en: {translation: en}}});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {lang: 'en'}};
    res = createMockResponse();
    next = jest.fn();
    const claim = buildClaim();
    mockGetClaimById.mockResolvedValue(claim);
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (draftStoreService.getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
    (draftStoreService.saveDraftClaim as jest.Mock).mockResolvedValue(undefined);
    (draftStoreService.deleteDraftClaimFromStore as jest.Mock).mockResolvedValue(undefined);
    mockSubmitApplication.mockResolvedValue({generalApplications: [{id: '123456'}]});
  });

  describe('on GET', () => {
    it('should render the check your answers page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claimIdPrettified: expect.any(String),
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetClaimById.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when the statement of truth is incomplete', async () => {
      req.body = {signed: null, name: null};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.any(Object));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSubmitApplication).not.toHaveBeenCalled();
    });

    it('should submit and redirect to the confirmation page', async () => {
      req.body = {signed: 'yes', name: 'Mr Applicant'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockSubmitApplication).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(confirmUrl('123456'));
    });

    it('should submit a business statement of truth that includes a title', async () => {
      const claim = buildClaim();
      claim.caseRole = CaseRole.CLAIMANT;
      claim.applicant1 = new Party();
      claim.applicant1.type = PartyType.ORGANISATION;
      mockGetClaimById.mockResolvedValue(claim);
      (draftStoreService.getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
      req.body = {signed: 'yes', name: 'Mr Applicant', title: 'director'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(confirmUrl('123456'));
      expect(claim.generalApplication.statementOfTruth).toEqual(expect.objectContaining({
        name: 'Mr Applicant',
        title: 'director',
      }));
    });

    it('should redirect to the submitted page when an adjournment is with consent and the hearing is more than 14 days away', async () => {
      const claim = buildClaim();
      const hearingDate = new Date();
      hearingDate.setDate(hearingDate.getDate() + 16);
      claim.caseProgressionHearing = new CaseProgressionHearing();
      claim.caseProgressionHearing.hearingDate = hearingDate;
      claim.generalApplication.agreementFromOtherParty = YesNo.YES;
      mockGetClaimById.mockResolvedValue(claim);
      (draftStoreService.getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
      req.body = {signed: 'yes', name: 'Mr Applicant'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, GA_APPLICATION_SUBMITTED_URL));
    });

    it('should redirect to the confirmation page when an adjournment is not with consent', async () => {
      const claim = buildClaim();
      const hearingDate = new Date();
      hearingDate.setDate(hearingDate.getDate() + 16);
      claim.caseProgressionHearing = new CaseProgressionHearing();
      claim.caseProgressionHearing.hearingDate = hearingDate;
      claim.generalApplication.agreementFromOtherParty = YesNo.NO;
      mockGetClaimById.mockResolvedValue(claim);
      (draftStoreService.getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
      req.body = {signed: 'yes', name: 'Mr Applicant'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(confirmUrl('123456'));
    });

    it('should use the last application id when several applications are submitted', async () => {
      const claim = buildClaim();
      claim.generalApplication.applicationTypes = [
        new ApplicationType(ApplicationTypeOption.EXTEND_TIME),
        new ApplicationType(ApplicationTypeOption.STRIKE_OUT),
        new ApplicationType(ApplicationTypeOption.OTHER),
      ];
      mockGetClaimById.mockResolvedValue(claim);
      (draftStoreService.getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
      mockSubmitApplication.mockResolvedValue({
        generalApplications: [{id: '123454'}, {id: '123455'}, {id: '123456'}],
      });
      req.body = {signed: 'yes', name: 'Mr Applicant'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockSubmitApplication).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(confirmUrl('123456'));
    });

    it('should call next when saving the statement of truth fails', async () => {
      const error = new Error('redis failure');
      (draftStoreService.saveDraftClaim as jest.Mock).mockRejectedValue(error);
      req.body = {signed: 'yes', name: 'Mr Applicant'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should re-render with GDS errors when submitApplication throws CallbackError with field errors', async () => {
      mockSubmitApplication.mockRejectedValue(new CallbackError(
        [],
        [],
        [{id: 'generalAppType', message: 'Enter a valid application type'}],
      ));
      req.body = {signed: 'yes', name: 'Mr Applicant'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
      const form = (res.render as jest.Mock).mock.calls[0][1].form as GenericForm<unknown>;
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('ccd-field-generalAppType')).toBe('Enter a valid application type');
      expect(form.getErrors()[0].href).toBe('#ccd-field-generalAppType');
      expect(res.redirect).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when submitApplication throws CallbackError with only callbackErrors so the error page is used', async () => {
      const callbackError = new CallbackError([
        'There is a technical issue causing a delay. You do not need to do anything. Please come back later.',
      ]);
      mockSubmitApplication.mockRejectedValue(callbackError);
      req.body = {signed: 'yes', name: 'Mr Applicant'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(callbackError);
      expect(res.render).not.toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });
});
