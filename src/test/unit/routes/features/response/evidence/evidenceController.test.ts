import {Response} from 'express';
import evidenceController from '../../../../../../main/routes/features/response/evidence/evidenceController';
import {RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {Evidence} from 'form/models/evidence/evidence';
import {EvidenceItem} from 'form/models/evidence/evidenceItem';
import {EvidenceType} from 'models/evidence/evidenceType';
import {FREE_TEXT_MAX_LENGTH} from 'form/validators/validationConstraints';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

describe('Evidence', () => {
  const getHandler = getRouteHandler(evidenceController, 'get');
  const postHandler = getRouteHandler(evidenceController, 'post');
  const viewPath = 'features/response/evidence/evidences';
  const claimId = '12345';
  const comment = 'Contract and invoices';
  const tooLongText = Array(FREE_TEXT_MAX_LENGTH + 2).join('a');
  let req: {params: {id: string}; body: Record<string, unknown>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

  const evidenceItem = [
    {type: EvidenceType.CONTRACTS_AND_AGREEMENTS, description: 'Test evidence details'},
  ];

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}};
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    mockGetCaseData.mockResolvedValue(new Claim());
    mockSaveDraftClaim.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the evidence page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect(next).not.toHaveBeenCalled();
    });

    it('should render saved evidence items', async () => {
      const claim = new Claim();
      claim.evidence = new Evidence('Existing comment', [
        new EvidenceItem(EvidenceType.CONTRACTS_AND_AGREEMENTS, 'Existing item'),
      ]);
      mockGetCaseData.mockResolvedValue(claim);

      await getHandler(req as never, res as unknown as Response, next);

      const form = (res.render as jest.Mock).mock.calls[0][1].form;
      expect(form.model.comment).toBe('Existing comment');
      expect(form.model.evidenceItem.length).toBeGreaterThanOrEqual(1);
    });

    it('should call next when loading evidence fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when the comment is too long', async () => {
      req.body = {comment: tooLongText, evidenceItem};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should save and redirect to the task list when evidence is valid', async () => {
      req.body = {comment, evidenceItem};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockSaveDraftClaim.mockRejectedValue(error);
      req.body = {comment, evidenceItem};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
