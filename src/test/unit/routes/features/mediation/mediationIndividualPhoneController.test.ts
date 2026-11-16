import {NextFunction, Response} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {MediationIndividualPhoneNumber} from 'common/form/models/mediation/mediationIndividualPhoneNumber';
import {CaseState} from 'form/models/claimDetails';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {Mediation} from 'models/mediation/mediation';
import {Party} from 'models/party';
import {PartyPhone} from 'models/PartyPhone';
import mediationIndividualPhoneController from 'routes/features/mediation/mediationIndividualPhoneController';
import {CAN_WE_USE_URL, CLAIMANT_RESPONSE_TASK_LIST_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
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
const viewPath = 'features/mediation/can-we-use';

const claimWithPhone = (phone?: string): Claim => {
  const claim = new Claim();
  claim.respondent1 = new Party();
  if (phone) {
    claim.respondent1.partyPhone = new PartyPhone(phone);
  }
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
  await getRouteHandler(mediationIndividualPhoneController, method, CAN_WE_USE_URL)(
    req as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

const rendered = (res: ReturnType<typeof createMockResponse>) =>
  (res.render as jest.Mock).mock.calls[0][1];

describe('Repayment Plan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue(redisKey);
    mockGetCaseData.mockResolvedValue(claimWithPhone('01632960001'));
    mockGetMediation.mockResolvedValue(new Mediation());
    mockSaveMediation.mockResolvedValue(undefined);
  });

  describe('on Get', () => {
    it('should return on mediation confirm your telephone number repayment plan page successfully', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        respondentTelNumber: '01632960001',
        pageTitle: 'PAGES.MEDIATION_CAN_WE_USE.PAGE_TITLE',
      }));
    });

    it('should call next when loading the telephone number fails', async () => {
      const error = new Error('redis failure');
      mockGetMediation.mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should return on mediation confirm your telephone number repayment plan page without partyPhone', async () => {
      mockGetCaseData.mockResolvedValue(claimWithPhone());

      const {res} = await invoke('get');

      expect(rendered(res).respondentTelNumber).toBeUndefined();
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.MEDIATION_CAN_WE_USE.PAGE_TITLE',
      }));
    });
  });

  describe('on Post', () => {
    it('should return error when no input text is filled', async () => {
      const {res} = await invoke('post', {body: {}});

      const form = rendered(res).form;
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('option')).toBe('ERRORS.VALID_YES_NO_OPTION');
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should return errors when NO option selected and telephone number is undefined', async () => {
      const {res} = await invoke('post', {body: {option: 'no', mediationPhoneNumber: ''}});

      const form = rendered(res).form;
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('mediationPhoneNumber')).toBe('ERRORS.PHONE_NUMBER_REQUIRED');
    });

    it('should return errors when NO option selected and telephone number max length is greater than 30 characters', async () => {
      const {res} = await invoke('post', {
        body: {option: 'no', mediationPhoneNumber: '1234567890123456789012345678900'},
      });

      const form = rendered(res).form;
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('mediationPhoneNumber')).toBe('ERRORS.VALID_TEXT_LENGTH');
    });

    it('should redirect with valid input', async () => {
      const {res} = await invoke('post', {body: {option: 'no', mediationPhoneNumber: '01632960001'}});

      expect(mockSaveMediation).toHaveBeenCalledWith(redisKey, expect.any(MediationIndividualPhoneNumber), 'canWeUse');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect to the claimant task list and clear mediation disagreement', async () => {
      const claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      claim.applicant1 = new Party();
      claim.applicant1.partyPhone = new PartyPhone('01632960001');
      claim.mediation = new Mediation();
      claim.mediation.mediationDisagreement = new GenericYesNo(YesNo.NO);
      mockGetCaseData.mockResolvedValue(claim);

      const {res} = await invoke('post', {body: {option: 'no', mediationPhoneNumber: '01632960001'}});

      expect(mockSaveMediation).toHaveBeenCalledWith(redisKey, expect.any(GenericYesNo), 'mediationDisagreement');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
    });

    it('should redirect with input option equal to yes', async () => {
      const {res} = await invoke('post', {body: {option: 'yes', mediationPhoneNumber: ''}});

      expect(mockSaveMediation).toHaveBeenCalledWith(
        redisKey,
        expect.objectContaining({option: YesNo.YES, mediationPhoneNumber: undefined}),
        'canWeUse',
      );
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should call next when saving the telephone number fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      const {next} = await invoke('post', {body: {option: 'yes', mediationPhoneNumber: ''}});

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should redirect when no respondent telephone is saved and a number is entered', async () => {
      mockGetCaseData.mockResolvedValue(claimWithPhone());

      const {res} = await invoke('post', {body: {option: 'no', mediationPhoneNumber: '01632960002'}});

      expect(mockSaveMediation).toHaveBeenCalledWith(
        redisKey,
        expect.objectContaining({option: YesNo.NO, mediationPhoneNumber: '01632960002'}),
        'canWeUse',
      );
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });
  });
});
