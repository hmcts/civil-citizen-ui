import {Response} from 'express';
import citizenPhoneController from 'routes/features/response/citizenPhoneNumber/citizenPhoneController';
import {CITIZEN_PHONE_NUMBER_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {getTelephoneFromStore, saveTelephoneToStore} from 'services/features/claim/yourDetails/phoneService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {isCarmEnabledForCase} from 'app/auth/launchdarkly/launchDarklyClient';
import {CitizenTelephoneNumber} from 'form/models/citizenTelephoneNumber';
import {ClaimantOrDefendant} from 'models/partyType';
import {Claim} from 'models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/claim/yourDetails/phoneService');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('app/auth/launchdarkly/launchDarklyClient', () => ({
  isCarmEnabledForCase: jest.fn(),
}));

const viewPath = 'features/response/citizenPhoneNumber/citizen-phone';
const claimId = '12345';

const storedClaim = (): Claim => {
  const claim = new Claim();
  claim.submittedDate = new Date(2024, 5, 23);
  return claim;
};

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(citizenPhoneController, method, CITIZEN_PHONE_NUMBER_URL)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
      ...req,
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Citizen phone number', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(storedClaim());
    (getTelephoneFromStore as jest.Mock).mockResolvedValue(new CitizenTelephoneNumber('01632960001'));
    (saveTelephoneToStore as jest.Mock).mockResolvedValue(undefined);
    (isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
  });

  describe('on GET', () => {
    it('should render the optional phone page when CARM is off', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({carmEnabled: false}));
      expect(res.render.mock.calls[0][1].form.model.telephoneNumber).toBe('01632960001');
    });

    it('should render the mandatory phone page when CARM is on', async () => {
      (isCarmEnabledForCase as jest.Mock).mockResolvedValue(true);
      (getTelephoneFromStore as jest.Mock).mockResolvedValue(new CitizenTelephoneNumber());

      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({carmEnabled: true}));
      expect(res.render.mock.calls[0][1].form.model.telephoneNumber).toBeUndefined();
    });

    it('should return the error when the phone cannot be loaded', async () => {
      const error = new Error('redis failure');
      (getTelephoneFromStore as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when the phone number is invalid', async () => {
      (isCarmEnabledForCase as jest.Mock).mockResolvedValue(true);

      const {res} = await invoke('post', {body: {telephoneNumber: 'abc'}});

      expect(res.render.mock.calls[0][0]).toBe(viewPath);
      expect(res.render.mock.calls[0][1].carmEnabled).toBe(true);
      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(saveTelephoneToStore).not.toHaveBeenCalled();
    });

    it('should save an empty phone number and redirect when CARM is off', async () => {
      const {res} = await invoke('post', {body: {telephoneNumber: ''}});

      const saved = (saveTelephoneToStore as jest.Mock).mock.calls[0][1] as CitizenTelephoneNumber;
      expect(saved.telephoneNumber).toBeUndefined();
      expect(saveTelephoneToStore).toHaveBeenCalledWith(claimId, saved, ClaimantOrDefendant.DEFENDANT);
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should re-render when the phone number is empty and CARM is on', async () => {
      (isCarmEnabledForCase as jest.Mock).mockResolvedValue(true);

      const {res} = await invoke('post', {body: {telephoneNumber: ''}});

      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(saveTelephoneToStore).not.toHaveBeenCalled();
    });

    it('should trim a valid phone number and redirect to the task list', async () => {
      const {res} = await invoke('post', {body: {telephoneNumber: ' 01234567890 '}});

      const saved = (saveTelephoneToStore as jest.Mock).mock.calls[0][1] as CitizenTelephoneNumber;
      expect(saved.telephoneNumber).toBe('01234567890');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should return the error when saving the phone number fails', async () => {
      const error = new Error('redis failure');
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: {telephoneNumber: '01234567890'}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
