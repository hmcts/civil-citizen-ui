import {Request, Response, NextFunction} from 'express';
import defendantDetailsController from '../../../../../../main/routes/features/claim/defendant/defendantDetailsController';

import {
  getDefendantInformation,
  saveDefendantProperty,
} from '../../../../../../main/services/features/common/defendantDetailsService';

import {PartyType} from '../../../../../../main/common/models/partyType';
import {GenericForm} from '../../../../../../main/common/form/models/genericForm';
import {CLAIM_DEFENDANT_EMAIL_URL} from '../../../../../../main/routes/urls';

jest.mock(
  '../../../../../../main/services/features/common/defendantDetailsService',
);

jest.mock(
  '../../../../../../main/common/form/models/genericForm',
);

describe('defendantDetailsController', () => {
  const mockGetDefendantInformation = getDefendantInformation as jest.Mock;
  const mockSaveDefendantProperty = saveDefendantProperty as jest.Mock;
  const MockedGenericForm = GenericForm as jest.Mock;

  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  const getHandler = (defendantDetailsController as any).stack.find(
    (layer: any) => layer.route?.methods?.get,
  ).route.stack[0].handle;

  const postHandler = (defendantDetailsController as any).stack.find(
    (layer: any) => layer.route?.methods?.post,
  ).route.stack[0].handle;

  beforeEach(() => {
    req = {
      session: {
        user: {id: 'userId'},
      } as any,
      body: {},
    };

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  // ======================
  // GET
  // ======================

  describe('GET', () => {
    it('should render company/organisation view when type is COMPANY', async () => {
      mockGetDefendantInformation.mockResolvedValue({
        type: PartyType.COMPANY,
        partyDetails: {},
      });

      MockedGenericForm.mockImplementation(() => ({}));

      await getHandler(req as Request, res as Response, next);

      expect(res.render).toHaveBeenCalledWith(
        'features/claim/defendant/defendant-details-company-or-organisation',
        expect.objectContaining({
          defendantType: PartyType.COMPANY,
        }),
      );
    });

    it('should render individual/sole trader view when type is INDIVIDUAL', async () => {
      mockGetDefendantInformation.mockResolvedValue({
        type: PartyType.INDIVIDUAL,
        partyDetails: {},
      });

      MockedGenericForm.mockImplementation(() => ({}));

      await getHandler(req as Request, res as Response, next);

      expect(res.render).toHaveBeenCalledWith(
        'features/claim/defendant/defendant-details-individual-or-sole-trader',
        expect.objectContaining({
          defendantType: PartyType.INDIVIDUAL,
        }),
      );
    });

    it('should call next on error', async () => {
      mockGetDefendantInformation.mockRejectedValue(new Error('failure'));

      await getHandler(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });
  });

  // ======================
  // POST
  // ======================

  describe('POST', () => {
    it('should re-render view when validation has errors', async () => {
      mockGetDefendantInformation.mockResolvedValue({
        type: PartyType.COMPANY,
      });

      const mockFormInstance = {
        validate: jest.fn(),
        hasErrors: jest.fn().mockReturnValue(true),
        model: {},
      };

      MockedGenericForm.mockImplementation(() => mockFormInstance);

      await postHandler(req as Request, res as Response, next);

      expect(res.render).toHaveBeenCalledWith(
        'features/claim/defendant/defendant-details-company-or-organisation',
        expect.objectContaining({
          defendantType: PartyType.COMPANY,
        }),
      );

      expect(mockSaveDefendantProperty).not.toHaveBeenCalled();
    });

    it('should save and redirect when validation passes', async () => {
      mockGetDefendantInformation.mockResolvedValue({
        type: PartyType.COMPANY,
      });

      const mockFormInstance = {
        validate: jest.fn(),
        hasErrors: jest.fn().mockReturnValue(false),
        model: {name: 'Test Ltd'},
      };

      MockedGenericForm.mockImplementation(() => mockFormInstance);

      await postHandler(req as Request, res as Response, next);

      expect(mockSaveDefendantProperty).toHaveBeenCalledWith(
        'userId',
        'partyDetails',
        {name: 'Test Ltd'},
      );

      expect(res.redirect).toHaveBeenCalledWith(
        CLAIM_DEFENDANT_EMAIL_URL,
      );
    });

    it('should call next on error', async () => {
      mockGetDefendantInformation.mockRejectedValue(new Error('failure'));

      await postHandler(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });
  });
});