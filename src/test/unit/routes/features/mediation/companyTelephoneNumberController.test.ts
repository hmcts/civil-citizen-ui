import {NextFunction, Response} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {YesNo} from 'form/models/yesNo';
import {CompanyTelephoneNumber} from 'form/models/mediation/companyTelephoneNumber';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import companyTelephoneNumberController from 'routes/features/mediation/companyTelephoneNumberController';
import {CAN_WE_USE_COMPANY_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {
  getCompanyTelephoneNumberData,
  saveCompanyTelephoneNumberData,
} from 'services/features/response/mediation/companyTelephoneNumberService';
import {getMediation} from 'services/features/response/mediation/mediationService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/response/mediation/companyTelephoneNumberService', () => ({
  getCompanyTelephoneNumberData: jest.fn(),
  saveCompanyTelephoneNumberData: jest.fn(),
}));

jest.mock('services/features/response/mediation/mediationService', () => ({
  getMediation: jest.fn(),
  saveMediation: jest.fn(),
}));

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(),
  getCaseDataFromStore: jest.fn(),
}));

const mockGetCompanyTelephoneNumberData = getCompanyTelephoneNumberData as jest.Mock;
const mockSaveCompanyTelephoneNumberData = saveCompanyTelephoneNumberData as jest.Mock;
const mockGetMediation = getMediation as jest.Mock;
const mockGenerateRedisKey = generateRedisKey as jest.Mock;
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const claimId = '1111';
const redisKey = '12345';
const viewPath = 'features/mediation/company-telephone-number';
const validPhoneNumber = '012345678901234567890123456789';
const invalidPhoneNumber = '0123456789012345678901234567890';
const validName = 'David';
const invalidName = 'Daviddaviddaviddaviddaviddavido';

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
  await getRouteHandler(companyTelephoneNumberController, method, CAN_WE_USE_COMPANY_URL)(
    req as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

const renderedForm = (res: ReturnType<typeof createMockResponse>) =>
  (res.render as jest.Mock).mock.calls[0][1].form;

describe('Mediation - Company or Organisation - Confirm telephone number', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue(redisKey);
    mockGetCompanyTelephoneNumberData.mockResolvedValue(['Test contact person', new CompanyTelephoneNumber()]);
    mockGetMediation.mockResolvedValue({});
    mockGetCaseData.mockResolvedValue(new Claim());
    mockSaveCompanyTelephoneNumberData.mockResolvedValue(undefined);
  });

  describe('on Get', () => {
    it('should return on company telephone number page successfully', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        contactPerson: 'Test contact person',
        pageTitle: 'PAGES.MEDIATION_COMPANY_PHONE.PAGE_TITLE',
      }));
    });

    it('should call next when loading the company telephone number fails', async () => {
      const error = new Error('redis failure');
      mockGetCompanyTelephoneNumberData.mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on Post', () => {
    it('should return error when option is not selected', async () => {
      const {res, next} = await invoke('post', {body: {contactPerson: 'Test contact person'}});

      const form = renderedForm(res);
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('option')).toBe('ERRORS.VALID_YES_NO_OPTION');
      expect(res.redirect).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should have errors when no is an option, but no other thing provided', async () => {
      const {res} = await invoke('post', {body: {option: YesNo.NO}});

      const form = renderedForm(res);
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('mediationContactPerson')).toBe('ERRORS.NAME_REQUIRED');
      expect(form.errorFor('mediationPhoneNumber')).toBe('ERRORS.PHONE_NUMBER_REQUIRED');
    });

    it('should have errors when yes is an option but a long telephone number is provided', async () => {
      const {res} = await invoke('post', {
        body: {
          option: YesNo.YES,
          mediationPhoneNumber: null,
          mediationContactPerson: null,
          mediationPhoneNumberConfirmation: invalidPhoneNumber,
          contactPerson: 'Test contact person',
        },
      });

      const form = renderedForm(res);
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('mediationPhoneNumberConfirmation')).toBe('ERRORS.TEXT_TOO_MANY');
    });

    it('should have errors when no is an option, contact number is provided but no contact name', async () => {
      const {res} = await invoke('post', {
        body: {option: YesNo.NO, mediationPhoneNumber: validPhoneNumber, mediationContactPerson: null},
      });

      const form = renderedForm(res);
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('mediationContactPerson')).toBe('ERRORS.NAME_REQUIRED');
    });

    it('should have errors when no is an option, contact name is provided but no contact number', async () => {
      const {res} = await invoke('post', {
        body: {option: YesNo.NO, mediationPhoneNumber: null, mediationContactPerson: validName},
      });

      const form = renderedForm(res);
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('mediationPhoneNumber')).toBe('ERRORS.PHONE_NUMBER_REQUIRED');
    });

    it('should have errors when no is an option but both contact name and contact number are too long', async () => {
      const {res} = await invoke('post', {
        body: {option: YesNo.NO, mediationPhoneNumber: invalidPhoneNumber, mediationContactPerson: invalidName},
      });

      const form = renderedForm(res);
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('mediationPhoneNumber')).toBe('ERRORS.TEXT_TOO_MANY');
      expect(form.errorFor('mediationContactPerson')).toBe('ERRORS.TEXT_TOO_MANY');
    });

    it('should redirect with valid input', async () => {
      const {res} = await invoke('post', {
        body: {option: YesNo.NO, mediationPhoneNumber: validPhoneNumber, mediationContactPerson: validName},
      });

      expect(mockSaveCompanyTelephoneNumberData).toHaveBeenCalledWith(redisKey, expect.any(CompanyTelephoneNumber));
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should call next when saving the company telephone number fails', async () => {
      const error = new Error('redis failure');
      mockSaveCompanyTelephoneNumberData.mockRejectedValue(error);

      const {next} = await invoke('post', {
        body: {option: YesNo.NO, mediationPhoneNumber: validPhoneNumber, mediationContactPerson: validName},
      });

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
