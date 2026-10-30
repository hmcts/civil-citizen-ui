import {Response} from 'express';
import gaCheckAnswersResponseController from '../../../../../../../main/routes/features/generalApplication/response/checkAnswersResponseController';
import {GA_RESPONSE_CONFIRMATION_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {CaseRole} from 'form/models/caseRoles';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {RespondentAgreement} from 'models/generalApplication/response/respondentAgreement';
import {HearingSupport, SupportType} from 'models/generalApplication/hearingSupport';
import {YesNo} from 'form/models/yesNo';
import {t} from 'i18next';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {submitApplicationResponse} from 'services/features/generalApplication/response/submitApplicationResponse';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as gaStoreResponseService from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService');
jest.mock('services/features/generalApplication/response/submitApplicationResponse');
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  saveDraftGARespondentResponse: jest.fn(),
  getDraftGARespondentResponse: jest.fn(),
}));

describe('General application - response - check your answers', () => {
  const getHandler = getRouteHandler(gaCheckAnswersResponseController, 'get');
  const postHandler = getRouteHandler(gaCheckAnswersResponseController, 'post');
  const viewPath = 'features/generalApplication/response/check-answers';
  const claimId = '12345';
  const appId = 'GA-1001';
  let req: {params: {id: string; appId: string}; body: Record<string, unknown>; cookies: {lang: string}; query: Record<string, unknown>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  let gaResponse: GaResponse;
  const mockGetClaim = getClaimById as jest.Mock;
  const mockGetDraft = gaStoreResponseService.getDraftGARespondentResponse as jest.Mock;
  const mockSaveDraft = gaStoreResponseService.saveDraftGARespondentResponse as jest.Mock;
  const mockSubmit = submitApplicationResponse as jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    return claim;
  };

  const buildGaResponse = (): GaResponse => {
    const response = new GaResponse();
    response.generalApplicationType = [ApplicationTypeOption.ADJOURN_HEARING];
    response.hasUnavailableDatesHearing = YesNo.YES;
    return response;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    req = {params: {id: claimId, appId}, body: {}, cookies: {lang: 'en'}, query: {}};
    res = createMockResponse();
    next = jest.fn();
    gaResponse = buildGaResponse();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (draftStoreService.generateRedisKeyForGA as jest.Mock).mockReturnValue('ga-12345');
    (draftStoreService.getCaseDataFromStore as jest.Mock).mockResolvedValue(buildClaim());
    (draftStoreService.saveDraftClaim as jest.Mock).mockResolvedValue(undefined);
    mockGetClaim.mockResolvedValue(buildClaim());
    mockGetDraft.mockResolvedValue(gaResponse);
    mockSaveDraft.mockResolvedValue(undefined);
    mockSubmit.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the check answers page with the case reference', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claimIdPrettified: caseNumberPrettify(claimId),
        summaryRows: expect.any(Array),
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should include the agreement and hearing support in the summary', async () => {
      gaResponse.respondentAgreement = new RespondentAgreement(YesNo.YES);
      gaResponse.hearingSupport = new HearingSupport([SupportType.HEARING_LOOP]);
      gaResponse.hasUnavailableDatesHearing = YesNo.NO;

      await getHandler(req as never, res as unknown as Response, next);

      const summaryRows = (res.render as jest.Mock).mock.calls[0][1].summaryRows as {key: {text?: string}}[];
      expect(summaryRows.map((row) => row.key.text)).toEqual(expect.arrayContaining([
        t('PAGES.GENERAL_APPLICATION.RESPONDENT_AGREEMENT.TITLE'),
        t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS'),
      ]));
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetClaim.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should save the statement of truth and redirect', async () => {
      req.body = {signed: true, name: 'Mr Applicant'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(gaResponse.statementOfTruth).toEqual(expect.objectContaining({signed: true, name: 'Mr Applicant'}));
      expect(mockSaveDraft).toHaveBeenCalledWith('ga-12345', gaResponse);
      expect(mockSubmit).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPONSE_CONFIRMATION_URL),
      );
    });

    it('should save a qualified statement of truth when the claimant is a business', async () => {
      const claim = buildClaim();
      claim.applicant1 = new Party();
      claim.applicant1.type = PartyType.ORGANISATION;
      claim.caseRole = CaseRole.APPLICANTSOLICITORONE;
      mockGetClaim.mockResolvedValue(claim);
      req.body = {signed: 'yes', name: 'Mr Applicant', title: 'director'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(gaResponse.statementOfTruth).toEqual(expect.objectContaining({
        signed: 'yes',
        name: 'Mr Applicant',
        title: 'director',
      }));
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPONSE_CONFIRMATION_URL),
      );
    });

    it('should re-render when the statement of truth is incomplete', async () => {
      req.body = {signed: undefined, name: ''};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraft).not.toHaveBeenCalled();
      expect(mockSubmit).not.toHaveBeenCalled();
    });
  });
});
