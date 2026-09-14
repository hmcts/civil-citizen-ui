import {Response} from 'express';
import residenceController from '../../../../../../main/routes/features/response/statementOfMeans/residenceController';
import {CITIZEN_PARTNER_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Residence} from 'common/form/models/statementOfMeans/residence/residence';
import {ResidenceType} from 'common/form/models/statementOfMeans/residence/residenceType';
import {FREE_TEXT_MAX_LENGTH} from 'common/form/validators/validationConstraints';
import {getResidence, saveResidence} from 'services/features/response/statementOfMeans/residence/residenceService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/response/statementOfMeans/residence/residenceService', () => {
  const actual = jest.requireActual('services/features/response/statementOfMeans/residence/residenceService');
  return {
    ...actual,
    getResidence: jest.fn(),
    saveResidence: jest.fn(),
  };
});

describe('Citizen residence', () => {
  const getHandler = getRouteHandler(residenceController, 'get');
  const postHandler = getRouteHandler(residenceController, 'post');
  const viewPath = 'features/response/statementOfMeans/residence';
  const claimId = 'aaa';
  const tooLongHousingDetails: string = Array(FREE_TEXT_MAX_LENGTH + 2).join('a');
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetResidence = getResidence as jest.Mock;
  const mockSaveResidence = saveResidence as jest.Mock;
  const renderedForm = () => (res.render as jest.Mock).mock.calls[0][1].form;

  beforeEach(() => {
    req = {
      params: {id: claimId},
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetResidence.mockResolvedValue(new Residence());
    mockSaveResidence.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render residence page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when error thrown', async () => {
      const error = new Error('error');
      mockGetResidence.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect when OWN_HOME option selected', async () => {
      req.body = {type: ResidenceType.OWN_HOME};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveResidence).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(CITIZEN_PARTNER_URL.replace(':id', claimId));
    });

    it('should re-render when no option selected', async () => {
      req.body = {type: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors()).toBe(true);
      expect(renderedForm().errorFor('type')).toBe('ERRORS.VALID_OPTION_SELECTION');
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should re-render when type is Other and housing details not provided', async () => {
      req.body = {type: ResidenceType.OTHER, housingDetails: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().errorFor('housingDetails')).toBe('ERRORS.VALID_HOUSING');
    });

    it('should redirect when type is Other and housing details are provided', async () => {
      req.body = {type: ResidenceType.OTHER, housingDetails: 'Palace'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(CITIZEN_PARTNER_URL.replace(':id', claimId));
    });

    it('should re-render when type is Other and housing details are too long', async () => {
      req.body = {type: ResidenceType.OTHER, housingDetails: tooLongHousingDetails};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().errorFor('housingDetails')).toBe('ERRORS.VALID_TEXT_LENGTH');
    });

    it('should call next when save throws', async () => {
      const error = new Error('error');
      mockSaveResidence.mockRejectedValue(error);
      req.body = {type: ResidenceType.OTHER, housingDetails: 'Palace'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
