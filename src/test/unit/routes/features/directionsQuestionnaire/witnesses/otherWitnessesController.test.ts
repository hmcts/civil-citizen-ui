import {Response} from 'express';
import otherWitnessesController from '../../../../../../main/routes/features/directionsQuestionnaire/witnesses/otherWitnessesController';
import {DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {YesNo} from 'form/models/yesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

describe('Other Witnesses', () => {
  const getHandler = getRouteHandler(otherWitnessesController, 'get');
  const postHandler = getRouteHandler(otherWitnessesController, 'post');
  const viewPath = 'features/directionsQuestionnaire/witnesses/otherWitnesses/other-witnesses';
  const claimId = '12345';
  let req: {params: {id: string}; body: Record<string, unknown>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

  const witnessItem = (overrides: Record<string, string> = {}) => ({
    details: 'Details here...',
    email: 'jane.clarke@version1.com',
    firstName: 'Jane',
    lastName: 'Clarke',
    telephone: '01632960001',
    ...overrides,
  });

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.applicant1 = new Party();
    claim.respondent1 = new Party();
    return claim;
  };

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}};
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    mockGetCaseData.mockResolvedValue(buildClaim());
    mockSaveDraftClaim.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the other witnesses page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
        pageTitle: 'PAGES.OTHER_WITNESSES.TITLE',
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no option is selected', async () => {
      req.body = {witnessItems: []};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should re-render when yes is selected and the first name is missing', async () => {
      req.body = {option: YesNo.YES, witnessItems: [witnessItem({firstName: ''})]};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should re-render when yes is selected and the last name is missing', async () => {
      req.body = {option: YesNo.YES, witnessItems: [witnessItem({lastName: ''})]};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should re-render when yes is selected and the witness details are missing', async () => {
      req.body = {option: YesNo.YES, witnessItems: [witnessItem({details: ''})]};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should save and redirect when no other witnesses are selected', async () => {
      req.body = {option: YesNo.NO, witnessItems: []};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL),
      );
    });

    it('should save and redirect when yes is selected and witness details are provided', async () => {
      req.body = {option: YesNo.YES, witnessItems: [witnessItem()]};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL),
      );
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockSaveDraftClaim.mockRejectedValue(error);
      req.body = {option: YesNo.YES, witnessItems: [witnessItem()]};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
