import {NextFunction, Response} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {MediationCarm} from 'models/mediation/mediationCarm';
import alternativeContactPersonMediationController from 'routes/features/mediation/alternativeContactPersonMediationController';
import {MEDIATION_ALTERNATIVE_CONTACT_PERSON_URL, MEDIATION_PHONE_CONFIRMATION_URL} from 'routes/urls';
import {getMediationCarm, saveMediationCarm} from 'services/features/response/mediation/mediationService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/response/mediation/mediationService', () => ({
  getMediationCarm: jest.fn(),
  saveMediationCarm: jest.fn(),
}));

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(),
}));

const mockGetMediationCarm = getMediationCarm as jest.Mock;
const mockSaveMediationCarm = saveMediationCarm as jest.Mock;
const mockGenerateRedisKey = generateRedisKey as jest.Mock;

const claimId = '1111';
const redisKey = '12345';
const viewPath = 'features/mediation/alternative-contact-person';

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
  await getRouteHandler(alternativeContactPersonMediationController, method, MEDIATION_ALTERNATIVE_CONTACT_PERSON_URL)(
    req as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

const renderedForm = (res: ReturnType<typeof createMockResponse>) =>
  (res.render as jest.Mock).mock.calls[0][1].form;

describe('Mediation Alternative Contact Person Confirmation Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue(redisKey);
    mockGetMediationCarm.mockResolvedValue(new MediationCarm());
    mockSaveMediationCarm.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should return Alternative Contact Person Mediation page', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.MEDIATION_ALTERNATIVE_CONTACT_PERSON.PAGE_TITLE',
        isCarm: true,
      }));
    });

    it('should call next when loading the contact person fails', async () => {
      const error = new Error('redis failure');
      mockGetMediationCarm.mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to the mediation phone confirmation page', async () => {
      const {res} = await invoke('post', {body: {alternativeContactPerson: 'Joe Bloggs'}});

      expect(mockSaveMediationCarm).toHaveBeenCalledWith(redisKey, expect.anything(), 'alternativeMediationContactPerson');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, MEDIATION_PHONE_CONFIRMATION_URL));
    });

    it('should Valid contact person when is empty', async () => {
      const {res} = await invoke('post', {body: {alternativeContactPerson: ''}});

      const form = renderedForm(res);
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('alternativeContactPerson')).toBe('ERRORS.VALID_CONTACT_PERSON');
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should should Valid contact person when is invalid', async () => {
      const {res} = await invoke('post', {
        body: {alternativeContactPerson: 'aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeeeffffffffffggggggggggh'},
      });

      const form = renderedForm(res);
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('alternativeContactPerson')).toBe('ERRORS.FULL_NAME_TOO_LONG');
    });

    it('should call next when saving the contact person fails', async () => {
      const error = new Error('redis failure');
      mockSaveMediationCarm.mockRejectedValue(error);

      const {next} = await invoke('post', {body: {alternativeContactPerson: 'Joe Bloggs'}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
