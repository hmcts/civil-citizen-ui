import {NextFunction, Response} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {MediationIndividualPhoneNumber} from 'common/form/models/mediation/mediationIndividualPhoneNumber';
import {CaseState} from 'form/models/claimDetails';
import {YesNo} from 'form/models/yesNo';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {ClaimantResponse} from 'models/claimantResponse';
import {Mediation} from 'models/mediation/mediation';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import mediationDisagreementController from 'routes/features/mediation/mediationDisagreementController';
import {
  CAN_WE_USE_COMPANY_URL,
  CAN_WE_USE_URL,
  DONT_WANT_FREE_MEDIATION_URL,
  MEDIATION_DISAGREEMENT_URL,
} from 'routes/urls';
import {getMediation, saveMediation} from 'services/features/response/mediation/mediationService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/response/mediation/mediationService', () => ({
  getMediation: jest.fn(),
  saveMediation: jest.fn(),
}));

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(),
  getCaseDataFromStore: jest.fn(),
}));

const mockGetMediation = getMediation as jest.Mock;
const mockSaveMediation = saveMediation as jest.Mock;
const mockGenerateRedisKey = generateRedisKey as jest.Mock;
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const claimId = '1111';
const redisKey = '12345';
const viewPath = 'features/mediation/mediation-disagreement';

const claimOfType = (type: PartyType): Claim => {
  const claim = new Claim();
  claim.respondent1 = new Party();
  claim.respondent1.type = type;
  return claim;
};

const invoke = async (method: 'get' | 'post', overrides: Partial<AppRequest> = {}) => {
  const res = createMockResponse();
  const next = jest.fn() as NextFunction;
  const req = {
    params: {id: claimId},
    body: {},
    query: {},
    cookies: {},
    session: createMockSession({user: {id: 'user-1'}}),
    ...overrides,
  };
  await getRouteHandler(mediationDisagreementController, method, MEDIATION_DISAGREEMENT_URL)(
    req as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

const renderedForm = (res: ReturnType<typeof createMockResponse>) =>
  (res.render as jest.Mock).mock.calls[0][1].form;

describe('Mediation Disagreement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue(redisKey);
    mockGetCaseData.mockResolvedValue(claimOfType(PartyType.INDIVIDUAL));
    mockGetMediation.mockResolvedValue(new Mediation());
    mockSaveMediation.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should return mediation disagreement page', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.MEDIATION_DISAGREEMENT.PAGE_TITLE',
      }));
    });

    it('should return mediation disagreement page when mediation has mediationDisagreement', async () => {
      const mediation = new Mediation();
      mediation.mediationDisagreement = {option: YesNo.YES};
      mockGetMediation.mockResolvedValue(mediation);

      const {res} = await invoke('get');

      expect(renderedForm(res).model.option).toBe(YesNo.YES);
    });

    it('should call next when loading mediation disagreement fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect page when NO', async () => {
      const {res} = await invoke('post', {body: {option: 'no'}});

      expect(mockSaveMediation).toHaveBeenCalledWith(redisKey, expect.objectContaining({option: YesNo.NO}), 'mediationDisagreement');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DONT_WANT_FREE_MEDIATION_URL));
    });

    it('should redirect page when YES and applicant type is INDIVIDUAL', async () => {
      const {res} = await invoke('post', {body: {option: 'yes'}});

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CAN_WE_USE_URL));
      expect(mockSaveMediation).not.toHaveBeenCalledWith(redisKey, undefined, 'canWeUse');
    });

    it('should redirect page when YES and applicant type is ORGANISATION', async () => {
      mockGetCaseData.mockResolvedValue(claimOfType(PartyType.ORGANISATION));

      const {res} = await invoke('post', {body: {option: 'yes'}});

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CAN_WE_USE_COMPANY_URL));
    });

    it('should clear canWeUse when YES and claimant response already has a phone answer', async () => {
      const claim = claimOfType(PartyType.COMPANY);
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.mediation = new Mediation();
      claim.claimantResponse.mediation.canWeUse = new MediationIndividualPhoneNumber(YesNo.YES, '6000000');
      mockGetCaseData.mockResolvedValue(claim);

      const {res} = await invoke('post', {body: {option: 'yes'}});

      expect(mockSaveMediation).toHaveBeenCalledWith(redisKey, undefined, 'canWeUse');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CAN_WE_USE_COMPANY_URL));
    });

    it('should return error on incorrect input', async () => {
      const {res} = await invoke('post');

      const form = renderedForm(res);
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('option')).toBe('ERRORS.VALID_YES_NO_OPTION');
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should call next when saving mediation disagreement fails', async () => {
      const error = new Error('redis failure');
      mockSaveMediation.mockRejectedValue(error);

      const {next} = await invoke('post', {body: {option: 'no'}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
